import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  buildPool,
  charadesCategories,
  CUSTOM_ID,
  normalize,
  shuffle,
  type CharadesCard,
  type LevelSetting,
} from "@/lib/charades/words";
import type { Tone } from "@/lib/games";
import { STORAGE_KEYS } from "@/lib/storageKeys";

export const MAX_TEAMS = 4;
const REFILL_AT = 3;

export type Phase = "setup" | "handoff" | "acting" | "result" | "gameover";

/** got = scored; passed = skipped; timeout = on screen when the clock hit 0. */
export type Verdict = "got" | "passed" | "timeout";

export interface Team {
  id: string;
  name: string;
  tone: Tone;
  players: string[];
  /** Manual score corrections from the scoreboard. */
  bonus: number;
}

export interface Settings {
  roundSeconds: number;
  turnsPerTeam: number;
  difficulty: LevelSetting;
  categories: string[];
  /** Skips per turn; null = as many as you like. */
  passes: number | null;
  customWords: string[];
}

export interface TurnWord {
  word: string;
  categoryId: string;
  verdict: Verdict;
}

export interface TurnRecord {
  teamId: string;
  guesser: string | null;
  words: TurnWord[];
}

interface Timer {
  /** Epoch ms when the clock hits zero; null while paused or not started. */
  endsAt: number | null;
  remainingMs: number;
}

interface HotSeatState {
  phase: Phase;
  teams: Team[];
  settings: Settings;
  turn: number;
  deck: CharadesCard[];
  /** The word on screen right now. */
  current: CharadesCard | null;
  /** Words dealt so far this turn, in order. */
  turnWords: TurnWord[];
  passesUsed: number;
  timer: Timer;
  history: TurnRecord[];
  /** Words already shown, across games, so they don't repeat. */
  played: string[];
  notice: string | null;
  muted: boolean;

  // setup
  addTeam: () => void;
  removeTeam: (id: string) => void;
  renameTeam: (id: string, name: string) => void;
  setPlayers: (id: string, players: string[]) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  toggleCategory: (id: string) => void;
  setCategories: (ids: string[]) => void;
  setCustomWords: (words: string[]) => void;
  resetPlayed: () => void;
  startGame: () => void;

  // turn flow
  startTurn: () => void;
  gotIt: () => void;
  pass: () => void;
  pauseClock: () => void;
  resumeClock: () => void;
  endTurn: () => void;
  toggleVerdict: (index: number) => void;
  nextTurn: () => void;

  // scores + game
  adjustScore: (teamId: string, delta: number) => void;
  endGame: () => void;
  rematch: () => void;
  newSetup: () => void;
  toggleMuted: () => void;
  dismissNotice: () => void;
}

const TEAM_PRESETS: Array<{ name: string; tone: Tone }> = [
  { name: "Blue Whales", tone: "blue" },
  { name: "Red Rockets", tone: "red" },
  { name: "Green Geckos", tone: "green" },
  { name: "Yellow Yetis", tone: "yellow" },
];

function makeTeam(index: number): Team {
  const preset = TEAM_PRESETS[index % TEAM_PRESETS.length];
  return {
    id: `${preset.tone}-${Date.now().toString(36)}-${index}`,
    name: preset.name,
    tone: preset.tone,
    players: [],
    bonus: 0,
  };
}

const defaultSettings: Settings = {
  roundSeconds: 60,
  turnsPerTeam: 3,
  difficulty: "mix",
  categories: charadesCategories.map((c) => c.id),
  passes: 3,
  customWords: [],
};

// ------------------------------------------------------------------ helpers

export function currentTeam(state: Pick<HotSeatState, "teams" | "turn">) {
  return state.teams[state.turn % Math.max(1, state.teams.length)];
}

export function currentRound(state: Pick<HotSeatState, "teams" | "turn">) {
  return Math.floor(state.turn / Math.max(1, state.teams.length)) + 1;
}

/** Who acts this turn, rotating through the team's players. */
export function currentGuesser(state: Pick<HotSeatState, "teams" | "turn">) {
  const team = currentTeam(state);
  if (!team || team.players.length === 0) return null;
  return team.players[(currentRound(state) - 1) % team.players.length];
}

export const totalTurns = (s: Pick<HotSeatState, "teams" | "settings">) =>
  s.teams.length * s.settings.turnsPerTeam;

export const scoreOf = (words: TurnWord[]) =>
  words.filter((w) => w.verdict === "got").length;

export function teamScore(team: Team, history: TurnRecord[]) {
  let score = team.bonus;
  for (const record of history) {
    if (record.teamId === team.id) score += scoreOf(record.words);
  }
  return score;
}

export function passesLeft(s: Pick<HotSeatState, "settings" | "passesUsed">) {
  return s.settings.passes === null
    ? null
    : Math.max(0, s.settings.passes - s.passesUsed);
}

/**
 * Takes the next word off the deck, rebuilding it when it runs low. When
 * every word in the chosen categories has been shown, those words are freed
 * up again so the game can keep going.
 */
function drawWord(state: HotSeatState) {
  let { deck, played } = state;
  let notice: string | null = null;

  if (deck.length < REFILL_AT) {
    const pool = buildPool(state.settings);
    const playedSet = new Set(played);
    let fresh = pool.filter((c) => !playedSet.has(normalize(c.word)));
    if (fresh.length < REFILL_AT) {
      const keys = new Set(pool.map((c) => normalize(c.word)));
      played = played.filter((w) => !keys.has(w));
      fresh = pool;
      notice =
        "You've used every word in these categories, so the deck has been reshuffled.";
    }
    const left = new Set(deck.map((c) => normalize(c.word)));
    deck = [...deck, ...shuffle(fresh.filter((c) => !left.has(normalize(c.word))))];
  }

  const [card, ...rest] = deck;
  return {
    card: card ?? null,
    deck: rest,
    played: card
      ? [...played.filter((w) => w !== normalize(card.word)), normalize(card.word)]
      : played,
    notice,
  };
}

/** The turn is over: whatever was on screen counts as a timeout. */
function finishTurn(state: HotSeatState): Partial<HotSeatState> {
  const turnWords = state.current
    ? [
        ...state.turnWords,
        {
          word: state.current.word,
          categoryId: state.current.categoryId,
          verdict: "timeout" as const,
        },
      ]
    : state.turnWords;
  return {
    phase: "result",
    current: null,
    turnWords,
    timer: { endsAt: null, remainingMs: 0 },
  };
}

const freshTurn = {
  current: null,
  turnWords: [] as TurnWord[],
  passesUsed: 0,
};

// ------------------------------------------------------------------ store

export const useHotSeat = create<HotSeatState>()(
  persist(
    (set, get) => ({
      phase: "setup",
      teams: [makeTeam(0), makeTeam(1)],
      settings: defaultSettings,
      turn: 0,
      deck: [],
      ...freshTurn,
      timer: { endsAt: null, remainingMs: 0 },
      history: [],
      played: [],
      notice: null,
      muted: false,

      addTeam: () =>
        set((s) => {
          if (s.teams.length >= MAX_TEAMS) return s;
          const used = new Set(s.teams.map((t) => t.tone));
          const index = TEAM_PRESETS.findIndex((p) => !used.has(p.tone));
          return { teams: [...s.teams, makeTeam(index === -1 ? s.teams.length : index)] };
        }),
      removeTeam: (id) =>
        set((s) =>
          s.teams.length <= 2 ? s : { teams: s.teams.filter((t) => t.id !== id) },
        ),
      renameTeam: (id, name) =>
        set((s) => ({ teams: s.teams.map((t) => (t.id === id ? { ...t, name } : t)) })),
      setPlayers: (id, players) =>
        set((s) => ({ teams: s.teams.map((t) => (t.id === id ? { ...t, players } : t)) })),
      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch }, deck: [] })),
      toggleCategory: (id) =>
        set((s) => {
          const has = s.settings.categories.includes(id);
          if (has && s.settings.categories.length === 1) return s;
          const categories = has
            ? s.settings.categories.filter((c) => c !== id)
            : [...s.settings.categories, id];
          return { settings: { ...s.settings, categories }, deck: [] };
        }),
      setCategories: (ids) =>
        set((s) => ({ settings: { ...s.settings, categories: ids }, deck: [] })),
      setCustomWords: (words) =>
        set((s) => {
          const customWords = [...new Set(words.map((w) => w.trim()).filter(Boolean))].slice(0, 100);
          const others = s.settings.categories.filter((c) => c !== CUSTOM_ID);
          const categories = customWords.length
            ? [...others, CUSTOM_ID]
            : others.length
              ? others
              : defaultSettings.categories;
          return { settings: { ...s.settings, customWords, categories }, deck: [] };
        }),
      resetPlayed: () => set({ played: [], deck: [] }),

      startGame: () => {
        const s = get();
        if (s.settings.categories.length === 0) return;
        set({
          phase: "handoff",
          teams: s.teams.map((t, i) => ({
            ...t,
            name: t.name.trim() || TEAM_PRESETS[i % TEAM_PRESETS.length].name,
            bonus: 0,
          })),
          turn: 0,
          history: [],
          deck: [],
          ...freshTurn,
          timer: { endsAt: null, remainingMs: s.settings.roundSeconds * 1000 },
          notice: null,
        });
      },

      startTurn: () =>
        set((s) => {
          if (s.phase !== "handoff") return s;
          const dealt = drawWord(s);
          const ms = s.settings.roundSeconds * 1000;
          return {
            phase: "acting",
            current: dealt.card,
            deck: dealt.deck,
            played: dealt.played,
            notice: dealt.notice,
            turnWords: [],
            passesUsed: 0,
            timer: { endsAt: Date.now() + ms, remainingMs: ms },
          };
        }),

      gotIt: () =>
        set((s) => {
          if (s.phase !== "acting" || !s.current) return s;
          const turnWords = [
            ...s.turnWords,
            { word: s.current.word, categoryId: s.current.categoryId, verdict: "got" as const },
          ];
          const dealt = drawWord(s);
          return { turnWords, current: dealt.card, deck: dealt.deck, played: dealt.played };
        }),

      pass: () =>
        set((s) => {
          if (s.phase !== "acting" || !s.current) return s;
          if (s.settings.passes !== null && s.passesUsed >= s.settings.passes) return s;
          const turnWords = [
            ...s.turnWords,
            { word: s.current.word, categoryId: s.current.categoryId, verdict: "passed" as const },
          ];
          const dealt = drawWord(s);
          return {
            turnWords,
            passesUsed: s.passesUsed + 1,
            current: dealt.card,
            deck: dealt.deck,
            played: dealt.played,
          };
        }),

      pauseClock: () =>
        set((s) =>
          s.timer.endsAt === null
            ? s
            : {
                timer: {
                  endsAt: null,
                  remainingMs: Math.max(0, s.timer.endsAt - Date.now()),
                },
              },
        ),
      resumeClock: () =>
        set((s) =>
          s.timer.endsAt !== null
            ? s
            : {
                timer: {
                  endsAt: Date.now() + s.timer.remainingMs,
                  remainingMs: s.timer.remainingMs,
                },
              },
        ),

      endTurn: () =>
        set((s) => (s.phase === "acting" ? finishTurn(s) : s)),

      toggleVerdict: (index) =>
        set((s) => {
          if (s.phase !== "result") return s;
          return {
            turnWords: s.turnWords.map((w, i) =>
              i === index
                ? { ...w, verdict: w.verdict === "got" ? ("passed" as const) : ("got" as const) }
                : w,
            ),
          };
        }),

      nextTurn: () =>
        set((s) => {
          if (s.phase !== "result") return s;
          const team = currentTeam(s);
          const record: TurnRecord = {
            teamId: team.id,
            guesser: currentGuesser(s),
            words: s.turnWords,
          };
          const turn = s.turn + 1;
          const over = turn >= totalTurns(s);
          return {
            history: [...s.history, record],
            turn,
            phase: over ? "gameover" : "handoff",
            ...freshTurn,
            notice: null,
            timer: { endsAt: null, remainingMs: s.settings.roundSeconds * 1000 },
          };
        }),

      adjustScore: (teamId, delta) =>
        set((s) => ({
          teams: s.teams.map((t) => (t.id === teamId ? { ...t, bonus: t.bonus + delta } : t)),
        })),

      endGame: () => {
        // A turn that's under way, or waiting on its results, still counts.
        const { phase } = get();
        if (phase === "acting") get().endTurn();
        if (get().phase === "result") get().nextTurn();
        set({
          phase: "gameover",
          ...freshTurn,
          timer: { endsAt: null, remainingMs: 0 },
        });
      },
      rematch: () => get().startGame(),
      newSetup: () =>
        set((s) => ({
          phase: "setup",
          teams: s.teams.map((t) => ({ ...t, bonus: 0 })),
          history: [],
          turn: 0,
          ...freshTurn,
          notice: null,
        })),
      toggleMuted: () => set((s) => ({ muted: !s.muted })),
      dismissNotice: () => set({ notice: null }),
    }),
    {
      name: STORAGE_KEYS.hotSeat,
      version: 1,
      // Rehydrated manually after mount so server and client HTML match.
      skipHydration: true,
      partialize: (s) => ({
        phase: s.phase,
        teams: s.teams,
        settings: s.settings,
        turn: s.turn,
        deck: s.deck,
        current: s.current,
        turnWords: s.turnWords,
        passesUsed: s.passesUsed,
        timer: s.timer,
        history: s.history,
        played: s.played,
        muted: s.muted,
      }),
    },
  ),
);
