import { create } from "zustand";
import { persist } from "zustand/middleware";

import { STORAGE_KEYS } from "@/lib/storageKeys";
import {
  DEFAULT_PACK_IDS,
  quizPool,
  type DifficultySetting,
  type QuizQuestion,
} from "@/lib/weakest/questions";
import { shuffle } from "@/lib/words/deck";

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 10;
/** Each correct answer in a row is worth more than the last. */
export const LADDER = [1, 2, 3, 5, 8, 10];
export const FINAL_QUESTIONS = 5;

export type Phase = "setup" | "intro" | "round" | "roundover" | "vote" | "final" | "gameover";

export interface Player {
  id: string;
  name: string;
}

export interface Settings {
  seconds: number;
  packs: string[];
  difficulty: DifficultySetting;
}

export interface Tally {
  correct: number;
  wrong: number;
}

interface Final {
  ids: [string, string];
  scores: [number, number];
  asked: number;
}

interface WeakestState {
  phase: Phase;
  players: Player[];
  settings: Settings;
  alive: string[];
  round: number;
  /** Index into alive of whoever is answering. */
  turn: number;
  question: QuizQuestion | null;
  chain: number;
  /** Total banked this round. */
  roundBank: number;
  endsAt: number | null;
  remainingMs: number;
  /** This round's answers per player id. */
  tally: Record<string, Tally>;
  final: Final | null;
  winnerId: string | null;
  out: string[];
  played: string[];
  muted: boolean;

  addPlayer: () => void;
  removePlayer: (id: string) => void;
  renamePlayer: (id: string, name: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  togglePack: (id: string) => void;
  setPacks: (ids: string[]) => void;
  startGame: () => void;

  startRound: () => void;
  correct: () => void;
  wrong: () => void;
  bankChain: () => void;
  pauseClock: () => void;
  resumeClock: () => void;
  timeUp: () => void;
  toVote: () => void;
  voteOut: (id: string) => void;
  finalAnswer: (right: boolean) => void;
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

const defaultSettings: Settings = { seconds: 90, packs: DEFAULT_PACK_IDS, difficulty: "mix" };

export const roundSeconds = (s: Pick<WeakestState, "settings" | "round">) =>
  Math.max(40, s.settings.seconds - 10 * (s.round - 1));

/** Points in the pot for the current run of right answers. */
export const potOf = (chain: number) =>
  LADDER.slice(0, chain).reduce((a, b) => a + b, 0) + Math.max(0, chain - LADDER.length) * LADDER[LADDER.length - 1];

/** Value of the next right answer. */
export const nextValue = (chain: number) => LADDER[Math.min(chain, LADDER.length - 1)];

export const nameOf = (s: Pick<WeakestState, "players">, id: string | null) =>
  s.players.find((p) => p.id === id)?.name ?? "Someone";

export const answeringId = (s: Pick<WeakestState, "alive" | "turn">) =>
  s.alive[s.turn % Math.max(1, s.alive.length)];

/** Whoever answered worst this round: most wrong, then fewest right. */
export function weakestByStats(s: Pick<WeakestState, "alive" | "tally">) {
  return [...s.alive].sort((a, b) => {
    const ta = s.tally[a] ?? { correct: 0, wrong: 0 };
    const tb = s.tally[b] ?? { correct: 0, wrong: 0 };
    return tb.wrong - ta.wrong || ta.correct - tb.correct;
  })[0];
}

function drawQuestion(settings: Settings, played: string[]) {
  const pool = quizPool(settings.packs, settings.difficulty ?? "mix");
  const used = new Set(played);
  let fresh = pool.filter((q) => !used.has(q.q));
  let base = played;
  if (fresh.length === 0) {
    fresh = pool;
    base = [];
  }
  const question = shuffle(fresh)[0] ?? null;
  return { question, played: question ? [...base, question.q] : base };
}

const emptyTally = (ids: string[]) =>
  Object.fromEntries(ids.map((id) => [id, { correct: 0, wrong: 0 }]));

export const useWeakest = create<WeakestState>()(
  persist(
    (set, get) => ({
      phase: "setup",
      players: [0, 1, 2, 3, 4].map(makePlayer),
      settings: defaultSettings,
      alive: [],
      round: 0,
      turn: 0,
      question: null,
      chain: 0,
      roundBank: 0,
      endsAt: null,
      remainingMs: 0,
      tally: {},
      final: null,
      winnerId: null,
      out: [],
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

      startGame: () => {
        const s = get();
        if (s.players.length < MIN_PLAYERS || s.settings.packs.length === 0) return;
        const players = s.players.map((p, i) => ({ ...p, name: p.name.trim() || `Player ${i + 1}` }));
        set({
          phase: "intro",
          players,
          alive: players.map((p) => p.id),
          round: 0,
          out: [],
          winnerId: null,
          final: null,
          tally: {},
          turn: 0,
        });
        get().startRound();
      },

      startRound: () =>
        set((s) => {
          const round = s.round + 1;
          const next = { ...s, round };
          const ms = roundSeconds(next) * 1000;
          const d = drawQuestion(s.settings, s.played);
          return {
            phase: "round",
            round,
            // Whoever's next in line after the one voted out goes first.
            turn: s.turn,
            question: d.question,
            played: d.played,
            chain: 0,
            roundBank: 0,
            tally: emptyTally(s.alive),
            remainingMs: ms,
            endsAt: Date.now() + ms,
          };
        }),

      correct: () =>
        set((s) => {
          if (s.phase !== "round") return s;
          const id = answeringId(s);
          const t = s.tally[id] ?? { correct: 0, wrong: 0 };
          const d = drawQuestion(s.settings, s.played);
          return {
            chain: s.chain + 1,
            tally: { ...s.tally, [id]: { ...t, correct: t.correct + 1 } },
            turn: s.turn + 1,
            question: d.question,
            played: d.played,
          };
        }),

      wrong: () =>
        set((s) => {
          if (s.phase !== "round") return s;
          const id = answeringId(s);
          const t = s.tally[id] ?? { correct: 0, wrong: 0 };
          const d = drawQuestion(s.settings, s.played);
          return {
            chain: 0,
            tally: { ...s.tally, [id]: { ...t, wrong: t.wrong + 1 } },
            turn: s.turn + 1,
            question: d.question,
            played: d.played,
          };
        }),

      // Banking stops the chain but keeps the points; the same player still answers.
      bankChain: () =>
        set((s) => {
          if (s.phase !== "round" || s.chain === 0) return s;
          return { roundBank: s.roundBank + potOf(s.chain), chain: 0 };
        }),

      pauseClock: () =>
        set((s) =>
          s.endsAt === null
            ? s
            : { endsAt: null, remainingMs: Math.max(0, s.endsAt - Date.now()) },
        ),
      resumeClock: () =>
        set((s) =>
          s.endsAt !== null ? s : { endsAt: Date.now() + s.remainingMs },
        ),

      timeUp: () =>
        set((s) =>
          s.phase === "round"
            ? { phase: "roundover", endsAt: null, remainingMs: 0, chain: 0 }
            : s,
        ),

      toVote: () => set((s) => (s.phase === "roundover" ? { phase: "vote" } : s)),

      voteOut: (id) =>
        set((s) => {
          if (s.phase !== "vote") return s;
          const idx = s.alive.indexOf(id);
          const alive = s.alive.filter((a) => a !== id);
          const out = [...s.out, id];
          // The next round starts with the player after the one who left.
          const turn = alive.length ? idx % alive.length : 0;
          if (alive.length === 2) {
            const d = drawQuestion(s.settings, s.played);
            return {
              alive,
              out,
              turn,
              phase: "final" as const,
              final: { ids: [alive[0], alive[1]] as [string, string], scores: [0, 0] as [number, number], asked: 0 },
              question: d.question,
              played: d.played,
            };
          }
          return { alive, out, turn, phase: "intro" as const, question: null };
        }),

      finalAnswer: (right) =>
        set((s) => {
          if (s.phase !== "final" || !s.final) return s;
          const slot = s.final.asked % 2;
          const scores: [number, number] = [...s.final.scores] as [number, number];
          if (right) scores[slot] += 1;
          const asked = s.final.asked + 1;
          const pairDone = asked % 2 === 0;
          const over =
            pairDone && asked >= FINAL_QUESTIONS * 2 && scores[0] !== scores[1];
          if (over) {
            return {
              phase: "gameover",
              final: { ...s.final, scores, asked },
              winnerId: scores[0] > scores[1] ? s.final.ids[0] : s.final.ids[1],
              question: null,
            };
          }
          const d = drawQuestion(s.settings, s.played);
          return {
            final: { ...s.final, scores, asked },
            question: d.question,
            played: d.played,
          };
        }),

      endGame: () => set({ phase: "gameover", endsAt: null, question: null }),
      rematch: () => get().startGame(),
      newSetup: () =>
        set({ phase: "setup", question: null, endsAt: null, final: null, winnerId: null, out: [], alive: [] }),
      toggleMuted: () => set((s) => ({ muted: !s.muted })),
    }),
    {
      name: STORAGE_KEYS.weakest,
      version: 1,
      // Rehydrated manually after mount so server and client HTML match.
      skipHydration: true,
      partialize: (s) => ({
        phase: s.phase,
        players: s.players,
        settings: s.settings,
        alive: s.alive,
        round: s.round,
        turn: s.turn,
        question: s.question,
        chain: s.chain,
        roundBank: s.roundBank,
        endsAt: s.endsAt,
        remainingMs: s.remainingMs,
        tally: s.tally,
        final: s.final,
        winnerId: s.winnerId,
        out: s.out,
        played: s.played,
        muted: s.muted,
      }),
    },
  ),
);
