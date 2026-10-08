import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DEFAULT_PACK_IDS, promptPool } from "@/lib/bomb/prompts";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import { shuffle } from "@/lib/words/deck";

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 10;

export type Phase =
  | "setup"
  /** Prompt is up; the fuse isn't lit yet. */
  | "ready"
  | "live"
  | "boom"
  | "gameover";

export type FuseLength = "short" | "medium" | "long";

/** Hidden fuse range in seconds. */
export const FUSES: Record<FuseLength, { label: string; range: [number, number] }> = {
  short: { label: "Short", range: [10, 25] },
  medium: { label: "Medium", range: [20, 40] },
  long: { label: "Long", range: [35, 60] },
};

export interface Player {
  id: string;
  name: string;
}

export interface Settings {
  lives: number;
  fuse: FuseLength;
  packs: string[];
}

interface BombState {
  phase: Phase;
  players: Player[];
  settings: Settings;
  lives: Record<string, number>;
  round: number;
  holderId: string | null;
  prompt: string | null;
  /** When the (hidden) fuse runs out. */
  endsAt: number | null;
  passes: number;
  /** Who blew up last round. */
  blownId: string | null;
  /** Prompts already used, so they don't repeat. */
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

  newPrompt: () => void;
  lightFuse: () => void;
  pass: () => void;
  explode: () => void;
  nextRound: () => void;

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
  lives: 2,
  fuse: "medium",
  packs: DEFAULT_PACK_IDS,
};

// ------------------------------------------------------------------ helpers

export function playerName(state: Pick<BombState, "players">, id: string | null) {
  return state.players.find((p) => p.id === id)?.name ?? "Someone";
}

export function alivePlayers(state: Pick<BombState, "players" | "lives">) {
  return state.players.filter((p) => (state.lives[p.id] ?? 0) > 0);
}

/** Next player after `id`, in seating order, who is still alive. */
export function nextAlive(
  state: Pick<BombState, "players" | "lives">,
  id: string | null,
) {
  const { players } = state;
  const start = players.findIndex((p) => p.id === id);
  for (let step = 1; step <= players.length; step++) {
    const p = players[(start + step + players.length) % players.length];
    if ((state.lives[p.id] ?? 0) > 0) return p;
  }
  return null;
}

/** Whoever holds the bomb next, if they're still in; otherwise the next in line. */
function startingHolder(
  state: Pick<BombState, "players" | "lives">,
  id: string | null,
) {
  if (id && (state.lives[id] ?? 0) > 0) return id;
  return nextAlive(state, id)?.id ?? null;
}

function drawPrompt(packs: string[], played: string[]) {
  const pool = promptPool(packs);
  const used = new Set(played);
  let fresh = pool.filter((p) => !used.has(p));
  let nextPlayed = played;
  if (fresh.length === 0) {
    // Everything has been played: start over.
    fresh = pool;
    nextPlayed = [];
  }
  const prompt = shuffle(fresh)[0] ?? null;
  return { prompt, played: prompt ? [...nextPlayed, prompt] : nextPlayed };
}

function randomFuseMs(fuse: FuseLength) {
  const [min, max] = FUSES[fuse].range;
  return (min + Math.random() * (max - min)) * 1000;
}

// ------------------------------------------------------------------ store

export const useBomb = create<BombState>()(
  persist(
    (set, get) => ({
      phase: "setup",
      players: [0, 1, 2, 3].map(makePlayer),
      settings: defaultSettings,
      lives: {},
      round: 0,
      holderId: null,
      prompt: null,
      endsAt: null,
      passes: 0,
      blownId: null,
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
        const players = s.players.map((p, i) => ({
          ...p,
          name: p.name.trim() || `Player ${i + 1}`,
        }));
        const lives = Object.fromEntries(
          players.map((p) => [p.id, s.settings.lives]),
        );
        const { prompt, played } = drawPrompt(s.settings.packs, s.played);
        set({
          phase: "ready",
          players,
          lives,
          round: 1,
          // Random first holder.
          holderId: shuffle(players)[0].id,
          prompt,
          played,
          endsAt: null,
          passes: 0,
          blownId: null,
        });
      },

      newPrompt: () =>
        set((s) => {
          if (s.phase !== "ready") return s;
          return drawPrompt(s.settings.packs, s.played);
        }),

      lightFuse: () =>
        set((s) =>
          s.phase === "ready"
            ? {
                phase: "live",
                endsAt: Date.now() + randomFuseMs(s.settings.fuse),
                passes: 0,
              }
            : s,
        ),

      pass: () =>
        set((s) => {
          if (s.phase !== "live") return s;
          const next = nextAlive(s, s.holderId);
          if (!next) return s;
          return { holderId: next.id, passes: s.passes + 1 };
        }),

      explode: () =>
        set((s) => {
          if (s.phase !== "live" || !s.holderId) return s;
          const lives = {
            ...s.lives,
            [s.holderId]: Math.max(0, (s.lives[s.holderId] ?? 0) - 1),
          };
          return { phase: "boom", lives, blownId: s.holderId, endsAt: null };
        }),

      nextRound: () =>
        set((s) => {
          if (s.phase !== "boom") return s;
          if (alivePlayers(s).length <= 1) return { phase: "gameover" };
          const { prompt, played } = drawPrompt(s.settings.packs, s.played);
          return {
            phase: "ready",
            round: s.round + 1,
            holderId: startingHolder(s, s.blownId),
            prompt,
            played,
            passes: 0,
          };
        }),

      endGame: () => set({ phase: "gameover", endsAt: null }),
      rematch: () => get().startGame(),
      newSetup: () =>
        set({
          phase: "setup",
          lives: {},
          round: 0,
          holderId: null,
          prompt: null,
          endsAt: null,
          passes: 0,
          blownId: null,
        }),
      toggleMuted: () => set((s) => ({ muted: !s.muted })),
    }),
    {
      name: STORAGE_KEYS.bomb,
      version: 1,
      // Rehydrated manually after mount so server and client HTML match.
      skipHydration: true,
      partialize: (s) => ({
        phase: s.phase,
        players: s.players,
        settings: s.settings,
        lives: s.lives,
        round: s.round,
        holderId: s.holderId,
        prompt: s.prompt,
        endsAt: s.endsAt,
        passes: s.passes,
        blownId: s.blownId,
        played: s.played,
        muted: s.muted,
      }),
    },
  ),
);
