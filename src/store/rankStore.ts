import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DEFAULT_PACK_IDS, rankPool } from "@/lib/rank/topics";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import { shuffle } from "@/lib/words/deck";

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 10;

export type Phase = "setup" | "rank" | "vote" | "gameover";

/** fair = the group accepts the ranking; rejected = an arguer wins the point. */
export type Verdict = "fair" | "rejected";

export interface Player {
  id: string;
  name: string;
}

export interface Settings {
  rounds: number;
  packs: string[];
}

export interface TurnRecord {
  rankerId: string;
  topic: string;
  verdict: Verdict;
  /** Who won the point when the ranking was rejected. */
  arguerId: string | null;
}

interface RankState {
  phase: Phase;
  players: Player[];
  settings: Settings;
  turn: number;
  topic: string | null;
  swapped: boolean;
  history: TurnRecord[];
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

  swapTopic: () => void;
  toVote: () => void;
  backToRank: () => void;
  resolve: (verdict: Verdict, arguerId: string | null) => void;
  endGame: () => void;
  rematch: () => void;
  newSetup: () => void;
  toggleMuted: () => void;
}

let idCounter = 0;
function makePlayer(index: number): Player {
  idCounter += 1;
  return { id: `p-${Date.now().toString(36)}-${idCounter}`, name: `Player ${index + 1}` };
}

const defaultSettings: Settings = { rounds: 1, packs: DEFAULT_PACK_IDS };

export const rankerOf = (s: Pick<RankState, "players" | "turn">) =>
  s.players[s.turn % s.players.length];
export const totalTurns = (s: Pick<RankState, "players" | "settings">) =>
  s.players.length * s.settings.rounds;

export function playerScore(s: Pick<RankState, "history">, id: string) {
  let score = 0;
  for (const h of s.history) {
    if (h.verdict === "fair" && h.rankerId === id) score += 1;
    if (h.verdict === "rejected" && h.arguerId === id) score += 1;
  }
  return score;
}

function draw(settings: Settings, played: string[]) {
  const pool = rankPool(settings.packs);
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

export const useRank = create<RankState>()(
  persist(
    (set, get) => ({
      phase: "setup",
      players: [0, 1, 2, 3].map(makePlayer),
      settings: defaultSettings,
      turn: 0,
      topic: null,
      swapped: false,
      history: [],
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
        set((s) => ({ players: s.players.map((p) => (p.id === id ? { ...p, name } : p)) })),
      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
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
        const d = draw(s.settings, s.played);
        set({
          phase: "rank",
          players: s.players.map((p, i) => ({ ...p, name: p.name.trim() || `Player ${i + 1}` })),
          turn: 0,
          topic: d.topic,
          played: d.played,
          swapped: false,
          history: [],
        });
      },

      swapTopic: () =>
        set((s) => {
          if (s.phase !== "rank" || s.swapped) return s;
          const d = draw(s.settings, s.played);
          return { topic: d.topic, played: d.played, swapped: true };
        }),
      toVote: () => set((s) => (s.phase === "rank" ? { phase: "vote" } : s)),
      backToRank: () => set((s) => (s.phase === "vote" ? { phase: "rank" } : s)),

      resolve: (verdict, arguerId) =>
        set((s) => {
          if (s.phase !== "vote") return s;
          const history = [
            ...s.history,
            {
              rankerId: rankerOf(s).id,
              topic: s.topic ?? "",
              verdict,
              arguerId: verdict === "rejected" ? arguerId : null,
            },
          ];
          const turn = s.turn + 1;
          if (turn >= totalTurns(s)) return { history, turn, phase: "gameover", topic: null };
          const d = draw(s.settings, s.played);
          return {
            history,
            turn,
            phase: "rank",
            topic: d.topic,
            played: d.played,
            swapped: false,
          };
        }),

      endGame: () => set({ phase: "gameover", topic: null }),
      rematch: () => get().startGame(),
      newSetup: () => set({ phase: "setup", turn: 0, topic: null, history: [] }),
      toggleMuted: () => set((s) => ({ muted: !s.muted })),
    }),
    {
      name: STORAGE_KEYS.rank,
      version: 1,
      // Rehydrated manually after mount so server and client HTML match.
      skipHydration: true,
      partialize: (s) => ({
        phase: s.phase,
        players: s.players,
        settings: s.settings,
        turn: s.turn,
        topic: s.topic,
        swapped: s.swapped,
        history: s.history,
        played: s.played,
        muted: s.muted,
      }),
    },
  ),
);
