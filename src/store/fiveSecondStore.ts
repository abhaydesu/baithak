import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DEFAULT_PACK_IDS, topicPool } from "@/lib/categories/topics";
import type { Tone } from "@/lib/games";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import { shuffle } from "@/lib/words/deck";

export type Phase = "setup" | "handoff" | "live" | "judge" | "gameover";

/** nailed = three answers in time; stolen = missed, the other team got it. */
export type Verdict = "nailed" | "stolen" | "missed";

export interface Team {
  id: string;
  name: string;
  tone: Tone;
  players: string[];
  score: number;
}

export interface Settings {
  seconds: number;
  target: number;
  packs: string[];
}

export interface TurnRecord {
  teamId: string;
  speaker: string | null;
  topic: string;
  verdict: Verdict;
}

interface FiveSecondState {
  phase: Phase;
  teams: [Team, Team];
  settings: Settings;
  turn: number;
  topic: string | null;
  swapped: boolean;
  endsAt: number | null;
  history: TurnRecord[];
  played: string[];
  muted: boolean;

  renameTeam: (id: string, name: string) => void;
  setPlayers: (id: string, players: string[]) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  togglePack: (id: string) => void;
  setPacks: (ids: string[]) => void;
  resetPlayed: () => void;
  startGame: () => void;

  startTurn: () => void;
  swapTopic: () => void;
  timeUp: () => void;
  judge: (verdict: Verdict) => void;
  endGame: () => void;
  rematch: () => void;
  newSetup: () => void;
  toggleMuted: () => void;
}

const makeTeams = (): [Team, Team] => [
  { id: "blue", name: "Blue Whales", tone: "blue", players: [], score: 0 },
  { id: "red", name: "Red Rockets", tone: "red", players: [], score: 0 },
];

const defaultSettings: Settings = {
  seconds: 5,
  target: 10,
  packs: DEFAULT_PACK_IDS,
};

// ------------------------------------------------------------------ helpers

type Slice = Pick<FiveSecondState, "teams" | "turn">;

export const currentTeam = (s: Slice) => s.teams[s.turn % 2];
export const otherTeam = (s: Slice) => s.teams[(s.turn + 1) % 2];
export const roundOf = (s: Slice) => Math.floor(s.turn / 2) + 1;

/** Who answers this turn: the team's players take it in turns. */
export function currentSpeaker(s: Slice) {
  const team = currentTeam(s);
  if (team.players.length === 0) return null;
  return team.players[(roundOf(s) - 1) % team.players.length];
}

/** Who holds the phone: someone from the other team. */
export function currentJudge(s: Slice) {
  const team = otherTeam(s);
  if (team.players.length === 0) return null;
  return team.players[(roundOf(s) - 1) % team.players.length];
}

function draw(settings: Settings, played: string[]) {
  const pool = topicPool(settings.packs);
  const used = new Set(played);
  let fresh = pool.filter((t) => !used.has(t));
  let base = played;
  if (fresh.length === 0) {
    fresh = pool;
    base = [];
  }
  const topic = shuffle(fresh)[0] ?? null;
  return { topic, played: topic ? [...base, topic] : base };
}

// ------------------------------------------------------------------ store

export const useFiveSecond = create<FiveSecondState>()(
  persist(
    (set, get) => ({
      phase: "setup",
      teams: makeTeams(),
      settings: defaultSettings,
      turn: 0,
      topic: null,
      swapped: false,
      endsAt: null,
      history: [],
      played: [],
      muted: false,

      renameTeam: (id, name) =>
        set((s) => ({
          teams: s.teams.map((t) => (t.id === id ? { ...t, name } : t)) as [Team, Team],
        })),
      setPlayers: (id, players) =>
        set((s) => ({
          teams: s.teams.map((t) => (t.id === id ? { ...t, players } : t)) as [Team, Team],
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
        if (s.settings.packs.length === 0) return;
        set({
          phase: "handoff",
          teams: s.teams.map((t, i) => ({
            ...t,
            name: t.name.trim() || makeTeams()[i].name,
            score: 0,
          })) as [Team, Team],
          turn: 0,
          topic: null,
          swapped: false,
          endsAt: null,
          history: [],
        });
      },

      startTurn: () =>
        set((s) => {
          if (s.phase !== "handoff") return s;
          const d = draw(s.settings, s.played);
          return {
            phase: "live",
            topic: d.topic,
            played: d.played,
            swapped: false,
            endsAt: Date.now() + s.settings.seconds * 1000,
          };
        }),

      // Only before the clock starts being a problem: one swap per turn.
      swapTopic: () =>
        set((s) => {
          if (s.phase !== "live" || s.swapped) return s;
          const d = draw(s.settings, s.played);
          return {
            topic: d.topic,
            played: d.played,
            swapped: true,
            endsAt: Date.now() + s.settings.seconds * 1000,
          };
        }),

      timeUp: () =>
        set((s) => (s.phase === "live" ? { phase: "judge", endsAt: null } : s)),

      judge: (verdict) =>
        set((s) => {
          if (s.phase !== "judge") return s;
          const team = currentTeam(s);
          const scorer = verdict === "nailed" ? team.id : verdict === "stolen" ? otherTeam(s).id : null;
          const teams = s.teams.map((t) =>
            t.id === scorer ? { ...t, score: t.score + 1 } : t,
          ) as [Team, Team];
          const history = [
            ...s.history,
            {
              teamId: team.id,
              speaker: currentSpeaker(s),
              topic: s.topic ?? "",
              verdict,
            },
          ];
          const turn = s.turn + 1;
          // Check for a winner only when both teams have had the same go.
          const [a, b] = teams;
          const over =
            turn % 2 === 0 &&
            Math.max(a.score, b.score) >= s.settings.target &&
            a.score !== b.score;
          return {
            teams,
            history,
            turn,
            topic: null,
            phase: over ? "gameover" : "handoff",
          };
        }),

      endGame: () => set({ phase: "gameover", endsAt: null }),
      rematch: () => get().startGame(),
      newSetup: () =>
        set({ phase: "setup", turn: 0, topic: null, endsAt: null, history: [] }),
      toggleMuted: () => set((s) => ({ muted: !s.muted })),
    }),
    {
      name: STORAGE_KEYS.fiveSecond,
      version: 1,
      // Rehydrated manually after mount so server and client HTML match.
      skipHydration: true,
      partialize: (s) => ({
        phase: s.phase,
        teams: s.teams,
        settings: s.settings,
        turn: s.turn,
        topic: s.topic,
        swapped: s.swapped,
        endsAt: s.endsAt,
        history: s.history,
        played: s.played,
        muted: s.muted,
      }),
    },
  ),
);
