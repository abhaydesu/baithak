import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DEFAULT_PACK_IDS, LETTERS, topicPool } from "@/lib/categories/topics";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import { shuffle } from "@/lib/words/deck";

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 12;

export type Phase = "setup" | "handoff" | "live" | "result" | "gameover";

export interface Player {
  id: string;
  name: string;
}

export interface Settings {
  seconds: number;
  /** Turns each player gets as the speaker. */
  rounds: number;
  /** Answers must start with a random letter. */
  letters: boolean;
  packs: string[];
}

export interface TurnRecord {
  playerId: string;
  topic: string;
  letter: string | null;
  count: number;
}

interface Timer {
  endsAt: number | null;
  remainingMs: number;
}

interface CategoriesState {
  phase: Phase;
  players: Player[];
  settings: Settings;
  turn: number;
  topic: string | null;
  letter: string | null;
  /** Good answers counted so far this turn. */
  count: number;
  swapped: boolean;
  timer: Timer;
  history: TurnRecord[];
  /** Manual corrections from the scoreboard. */
  bonus: Record<string, number>;
  played: string[];
  muted: boolean;

  addPlayer: () => void;
  removePlayer: (id: string) => void;
  renamePlayer: (id: string, name: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  togglePack: (id: string) => void;
  setPacks: (ids: string[]) => void;
  resetPlayed: () => void;
  startGame: () => void;

  startTurn: () => void;
  swapTopic: () => void;
  point: () => void;
  undo: () => void;
  pauseClock: () => void;
  resumeClock: () => void;
  endTurn: () => void;
  adjustCount: (delta: number) => void;
  nextTurn: () => void;

  adjustScore: (playerId: string, delta: number) => void;
  endGame: () => void;
  rematch: () => void;
  newSetup: () => void;
  toggleMuted: () => void;
}

let idCounter = 0;
function makePlayer(index: number): Player {
  idCounter += 1;
  return {
    id: `p-${Date.now().toString(36)}-${idCounter}`,
    name: `Player ${index + 1}`,
  };
}

const defaultSettings: Settings = {
  seconds: 45,
  rounds: 2,
  letters: false,
  packs: DEFAULT_PACK_IDS,
};

// ------------------------------------------------------------------ helpers

type Slice = Pick<CategoriesState, "players" | "turn">;

export const speakerOf = (s: Slice) => s.players[s.turn % s.players.length];
/** Whoever sits next holds the phone and counts the answers. */
export const judgeOf = (s: Slice) => s.players[(s.turn + 1) % s.players.length];
export const roundOf = (s: Slice) =>
  Math.floor(s.turn / Math.max(1, s.players.length)) + 1;
export const totalTurns = (s: Pick<CategoriesState, "players" | "settings">) =>
  s.players.length * s.settings.rounds;

export function playerScore(
  s: Pick<CategoriesState, "history" | "bonus">,
  id: string,
) {
  let score = s.bonus[id] ?? 0;
  for (const r of s.history) if (r.playerId === id) score += r.count;
  return score;
}

function draw(
  settings: Settings,
  played: string[],
): { topic: string | null; letter: string | null; played: string[] } {
  const pool = topicPool(settings.packs);
  const used = new Set(played);
  let fresh = pool.filter((t) => !used.has(t));
  let base = played;
  if (fresh.length === 0) {
    fresh = pool;
    base = [];
  }
  const topic = shuffle(fresh)[0] ?? null;
  const letter = settings.letters ? shuffle(LETTERS)[0] : null;
  return { topic, letter, played: topic ? [...base, topic] : base };
}

const freshTurn = { topic: null, letter: null, count: 0, swapped: false };

// ------------------------------------------------------------------ store

export const useCategories = create<CategoriesState>()(
  persist(
    (set, get) => ({
      phase: "setup",
      players: [0, 1, 2, 3].map(makePlayer),
      settings: defaultSettings,
      turn: 0,
      ...freshTurn,
      timer: { endsAt: null, remainingMs: 0 },
      history: [],
      bonus: {},
      played: [],
      muted: false,

      addPlayer: () =>
        set((s) =>
          s.players.length >= MAX_PLAYERS
            ? s
            : { players: [...s.players, makePlayer(s.players.length)] },
        ),
      removePlayer: (id) =>
        set((s) =>
          s.players.length <= MIN_PLAYERS
            ? s
            : { players: s.players.filter((p) => p.id !== id) },
        ),
      renamePlayer: (id, name) =>
        set((s) => ({
          players: s.players.map((p) => (p.id === id ? { ...p, name } : p)),
        })),
      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),
      togglePack: (id) =>
        set((s) => {
          const has = s.settings.packs.includes(id);
          const packs = has
            ? s.settings.packs.filter((p) => p !== id)
            : [...s.settings.packs, id];
          return { settings: { ...s.settings, packs } };
        }),
      setPacks: (ids) => set((s) => ({ settings: { ...s.settings, packs: ids } })),
      resetPlayed: () => set({ played: [] }),

      startGame: () => {
        const s = get();
        if (s.players.length < MIN_PLAYERS || s.settings.packs.length === 0) return;
        set({
          phase: "handoff",
          players: s.players.map((p, i) => ({
            ...p,
            name: p.name.trim() || `Player ${i + 1}`,
          })),
          turn: 0,
          history: [],
          bonus: {},
          ...freshTurn,
          timer: { endsAt: null, remainingMs: s.settings.seconds * 1000 },
        });
      },

      startTurn: () =>
        set((s) => {
          if (s.phase !== "handoff") return s;
          const ms = s.settings.seconds * 1000;
          const d = draw(s.settings, s.played);
          return {
            phase: "live",
            topic: d.topic,
            letter: d.letter,
            played: d.played,
            count: 0,
            swapped: false,
            timer: { endsAt: Date.now() + ms, remainingMs: ms },
          };
        }),

      swapTopic: () =>
        set((s) => {
          if (s.phase !== "live" || s.swapped || s.count > 0) return s;
          const d = draw(s.settings, s.played);
          return { topic: d.topic, letter: d.letter, played: d.played, swapped: true };
        }),

      point: () =>
        set((s) => (s.phase === "live" ? { count: s.count + 1 } : s)),
      undo: () =>
        set((s) =>
          s.phase === "live" ? { count: Math.max(0, s.count - 1) } : s,
        ),

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
        set((s) =>
          s.phase === "live"
            ? { phase: "result", timer: { endsAt: null, remainingMs: 0 } }
            : s,
        ),

      adjustCount: (delta) =>
        set((s) =>
          s.phase === "result" ? { count: Math.max(0, s.count + delta) } : s,
        ),

      nextTurn: () =>
        set((s) => {
          if (s.phase !== "result") return s;
          const record: TurnRecord = {
            playerId: speakerOf(s).id,
            topic: s.topic ?? "",
            letter: s.letter,
            count: s.count,
          };
          const turn = s.turn + 1;
          const over = turn >= totalTurns(s);
          return {
            history: [...s.history, record],
            turn,
            phase: over ? "gameover" : "handoff",
            ...freshTurn,
            timer: { endsAt: null, remainingMs: s.settings.seconds * 1000 },
          };
        }),

      adjustScore: (playerId, delta) =>
        set((s) => ({
          bonus: { ...s.bonus, [playerId]: (s.bonus[playerId] ?? 0) + delta },
        })),

      endGame: () => {
        // A turn that's under way or waiting on its tally still counts.
        if (get().phase === "live") get().endTurn();
        if (get().phase === "result") get().nextTurn();
        set({
          phase: "gameover",
          ...freshTurn,
          timer: { endsAt: null, remainingMs: 0 },
        });
      },
      rematch: () => get().startGame(),
      newSetup: () =>
        set({
          phase: "setup",
          turn: 0,
          history: [],
          bonus: {},
          ...freshTurn,
        }),
      toggleMuted: () => set((s) => ({ muted: !s.muted })),
    }),
    {
      name: STORAGE_KEYS.categories,
      version: 1,
      // Rehydrated manually after mount so server and client HTML match.
      skipHydration: true,
      partialize: (s) => ({
        phase: s.phase,
        players: s.players,
        settings: s.settings,
        turn: s.turn,
        topic: s.topic,
        letter: s.letter,
        count: s.count,
        swapped: s.swapped,
        timer: s.timer,
        history: s.history,
        bonus: s.bonus,
        played: s.played,
        muted: s.muted,
      }),
    },
  ),
);
