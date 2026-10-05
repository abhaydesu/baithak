import { create } from "zustand";
import { persist } from "zustand/middleware";

import { STORAGE_KEYS } from "@/lib/storageKeys";
import { shuffle } from "@/lib/words/deck";

export const MIN_PLAYERS = 5;
export const MAX_PLAYERS = 15;

export type Role = "mafia" | "doctor" | "detective" | "villager";

/**
 * pass: everyone plays; the phone goes round the circle each night and
 * villagers get a decoy screen so every turn looks identical.
 * narrator: one person holds the phone, reads the night prompts out loud and
 * taps who each role points at.
 */
export type NightMode = "pass" | "narrator";

export type NarratorStep = "mafia" | "doctor" | "detective";

export type Phase =
  | "setup"
  /** Phone goes to the next player to deal roles. */
  | "pass"
  /** That player is looking at their role card. */
  | "reveal"
  /** Pass-the-phone night: hand the phone to the next living player. */
  | "night-pass"
  /** Pass-the-phone night: that player takes their secret night turn. */
  | "night-act"
  /** Narrator mode: narrator walks through Mafia → Doctor → Detective. */
  | "narrator-night"
  /** Morning announcement of what happened overnight. */
  | "dawn"
  /** Day discussion (with optional countdown clock). */
  | "discuss"
  /** Village vote on who to eliminate. */
  | "vote"
  /** Outcome of the village vote. */
  | "verdict"
  | "roundover"
  | "gameover";

export type Outcome = "village" | "mafia";

export interface Player {
  id: string;
  name: string;
}

export interface Settings {
  mafia: number;
  doctor: boolean;
  detective: boolean;
  mode: NightMode;
  /** 0 = no clock. */
  discussSeconds: number;
  /** Whether a player's role is shown to the room as soon as they're out. */
  revealRole: boolean;
}

export interface Elimination {
  playerId: string;
  by: "night" | "day";
  cycle: number;
}

export interface DawnReport {
  cycle: number;
  /** Who was eliminated overnight, or null if saved / nobody died. */
  victimId: string | null;
  /** True when the Doctor saved the Mafia's target. */
  saved: boolean;
}

export interface CheckRecord {
  cycle: number;
  targetId: string;
  isMafia: boolean;
}

export type RoundEvent =
  | {
      kind: "night";
      cycle: number;
      victimId: string | null;
      saved: boolean;
    }
  | {
      kind: "day";
      cycle: number;
      votedId: string | null;
    };

export interface Round {
  number: number;
  roles: Record<string, Role>;
  /** Index into `players` while dealing role cards at the start of the round. */
  dealIndex: number;
  /** Current night/day cycle (1, 2, 3…). */
  cycle: number;
  /** Index into `alivePlayers(state)` during pass-the-phone night. */
  nightIndex: number;
  /** Current step during narrator-led night. */
  narratorStep: NarratorStep;
  /** Who the Mafia targeted tonight. */
  mafiaTargetId: string | null;
  /** Who the Doctor chose to protect tonight. */
  doctorSaveId: string | null;
  /** Who the Detective investigated tonight (locked in once revealed). */
  detectiveCheckId: string | null;
  /** All Detective checks across the round. */
  checks: CheckRecord[];
  /** Players eliminated so far this round, in order. */
  eliminated: Elimination[];
  /** What happened on the most recent night, shown at dawn. */
  dawn: DawnReport | null;
  /** Player voted out on the most recent day (null if vote was skipped/tied). */
  lastVotedId: string | null;
  /** Chronological log of nights and days in this round. */
  events: RoundEvent[];
  /** Winner once the round finishes. */
  outcome: Outcome | null;
}

export interface RoundRecord {
  number: number;
  roles: Record<string, Role>;
  mafiaIds: string[];
  cycles: number;
  outcome: Outcome;
  events: RoundEvent[];
  /** Points per player id. */
  awards: Record<string, number>;
}

interface Timer {
  endsAt: number | null;
  remainingMs: number;
}

interface MafiaState {
  phase: Phase;
  players: Player[];
  settings: Settings;
  round: Round | null;
  timer: Timer;
  /** Manual corrections from the scoreboard. */
  bonus: Record<string, number>;
  history: RoundRecord[];
  muted: boolean;

  // setup
  addPlayer: () => void;
  removePlayer: (id: string) => void;
  renamePlayer: (id: string, name: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  startGame: () => void;

  // role deal
  showCard: () => void;
  hideCard: () => void;

  // night (pass mode)
  startNightTurn: () => void;
  investigate: (targetId: string) => void;
  submitNightAction: (targetId: string | null) => void;

  // night (narrator mode)
  narratorAdvance: (targetId: string | null) => void;
  narratorBack: () => void;

  // dawn + day + vote
  leaveDawn: () => void;
  startClock: () => void;
  pauseClock: () => void;
  resumeClock: () => void;
  goToVote: () => void;
  backToDiscuss: () => void;
  vote: (playerId: string | null) => void;
  continueAfterVerdict: () => void;
  nextRound: () => void;

  // scores + game
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
  mafia: 1,
  doctor: true,
  detective: true,
  mode: "pass",
  discussSeconds: 120,
  revealRole: true,
};

/**
 * Most Mafia a group can have so that even after a Night 1 elimination the
 * village still outnumbers the Mafia on Day 1.
 */
export function maxMafia(playerCount: number) {
  return Math.max(1, Math.min(3, Math.floor((playerCount - 2) / 2)));
}

export function roleBreakdown(
  playerCount: number,
  settings: Pick<Settings, "mafia" | "doctor" | "detective">,
) {
  const mafia = Math.min(settings.mafia, maxMafia(playerCount));
  const doctor = settings.doctor ? 1 : 0;
  const detective = settings.detective ? 1 : 0;
  const villagers = Math.max(0, playerCount - mafia - doctor - detective);
  return { mafia, doctor, detective, villagers };
}

export const ROLE_META: Record<
  Role,
  { label: string; color: string; summary: string }
> = {
  mafia: {
    label: "Mafia",
    color: "text-[#c63a28]",
    summary:
      "Eliminate one villager each night and bluff your way through the day. You win when Mafia equal or outnumber the village.",
  },
  doctor: {
    label: "Doctor",
    color: "text-[#178443]",
    summary:
      "Each night, choose one player to protect (including yourself). If the Mafia target them tonight, they survive.",
  },
  detective: {
    label: "Detective",
    color: "text-[#1a64c7]",
    summary:
      "Each night, investigate one player to learn whether they are Mafia or innocent. Help the village without giving yourself away.",
  },
  villager: {
    label: "Villager",
    color: "text-ink",
    summary:
      "Listen closely during the day debates, spot the contradictions and vote out every Mafia member.",
  },
};

// ------------------------------------------------------------------ helpers

export function playerName(state: Pick<MafiaState, "players">, id: string) {
  return state.players.find((p) => p.id === id)?.name ?? "Someone";
}

export function playerScore(
  state: Pick<MafiaState, "bonus" | "history">,
  id: string,
) {
  let score = state.bonus[id] ?? 0;
  for (const record of state.history) score += record.awards[id] ?? 0;
  return score;
}

/** Points each outcome gives: Village +1 each, Mafia +2 each. */
export function roundAwards(
  players: Player[],
  roles: Record<string, Role>,
  outcome: Outcome,
): Record<string, number> {
  const awards: Record<string, number> = {};
  for (const p of players) {
    const isMafia = roles[p.id] === "mafia";
    if (outcome === "village" && !isMafia) awards[p.id] = 1;
    if (outcome === "mafia" && isMafia) awards[p.id] = 2;
  }
  return awards;
}

export function isEliminated(round: Round, playerId: string) {
  return round.eliminated.some((e) => e.playerId === playerId);
}

export function alivePlayers(state: Pick<MafiaState, "players" | "round">) {
  const { round } = state;
  if (!round) return state.players;
  const out = new Set(round.eliminated.map((e) => e.playerId));
  return state.players.filter((p) => !out.has(p.id));
}

export function dealer(state: Pick<MafiaState, "players" | "round">) {
  if (!state.round) return null;
  return state.players[state.round.dealIndex] ?? null;
}

export function nightActor(state: Pick<MafiaState, "players" | "round">) {
  if (!state.round) return null;
  const alive = alivePlayers(state);
  return alive[state.round.nightIndex] ?? null;
}

export function mafiaPlayers(state: Pick<MafiaState, "players" | "round">) {
  const { round } = state;
  if (!round) return [];
  return state.players.filter((p) => round.roles[p.id] === "mafia");
}

export function aliveMafiaCount(state: Pick<MafiaState, "players" | "round">) {
  const { round } = state;
  if (!round) return 0;
  return alivePlayers(state).filter((p) => round.roles[p.id] === "mafia").length;
}

/**
 * Checks whether either side has won:
 * - Village wins when no Mafia remain alive.
 * - Mafia win when living Mafia equal or outnumber living villagers.
 */
export function checkWinner(
  players: Player[],
  roles: Record<string, Role>,
  eliminated: Elimination[],
): Outcome | null {
  const out = new Set(eliminated.map((e) => e.playerId));
  const alive = players.filter((p) => !out.has(p.id));
  const mafia = alive.filter((p) => roles[p.id] === "mafia").length;
  const town = alive.length - mafia;
  if (mafia === 0) return "village";
  if (mafia >= town) return "mafia";
  return null;
}

function dealRound(state: MafiaState): Partial<MafiaState> {
  const { players, settings } = state;
  const { mafia, doctor, detective } = roleBreakdown(players.length, settings);
  const deck: Role[] = [
    ...Array<Role>(mafia).fill("mafia"),
    ...(doctor ? (["doctor"] as const) : []),
    ...(detective ? (["detective"] as const) : []),
  ];
  while (deck.length < players.length) deck.push("villager");

  const shuffledRoles = shuffle(deck);
  const roles: Record<string, Role> = {};
  players.forEach((p, i) => {
    roles[p.id] = shuffledRoles[i] ?? "villager";
  });

  return {
    phase: "pass",
    round: {
      number: state.history.length + 1,
      roles,
      dealIndex: 0,
      cycle: 1,
      nightIndex: 0,
      narratorStep: "mafia",
      mafiaTargetId: null,
      doctorSaveId: null,
      detectiveCheckId: null,
      checks: [],
      eliminated: [],
      dawn: null,
      lastVotedId: null,
      events: [],
      outcome: null,
    },
    timer: { endsAt: null, remainingMs: settings.discussSeconds * 1000 },
  };
}

function beginNight(
  state: MafiaState,
  round: Round,
  cycle: number,
): Partial<MafiaState> {
  return {
    phase: state.settings.mode === "pass" ? "night-pass" : "narrator-night",
    round: {
      ...round,
      cycle,
      nightIndex: 0,
      narratorStep: "mafia",
      mafiaTargetId: null,
      doctorSaveId: null,
      detectiveCheckId: null,
      dawn: null,
      lastVotedId: null,
    },
    timer: { endsAt: null, remainingMs: state.settings.discussSeconds * 1000 },
  };
}

function resolveNight(state: MafiaState, round: Round): Partial<MafiaState> {
  const targetId = round.mafiaTargetId;
  const saved = targetId !== null && targetId === round.doctorSaveId;
  const victimId = saved ? null : targetId;
  const eliminated = victimId
    ? [
        ...round.eliminated,
        { playerId: victimId, by: "night" as const, cycle: round.cycle },
      ]
    : round.eliminated;
  const dawn: DawnReport = { cycle: round.cycle, victimId, saved };
  const events: RoundEvent[] = [
    ...round.events,
    { kind: "night", cycle: round.cycle, victimId, saved },
  ];
  const outcome = checkWinner(state.players, round.roles, eliminated);

  return {
    phase: "dawn",
    round: {
      ...round,
      eliminated,
      dawn,
      events,
      outcome,
    },
    timer: { endsAt: null, remainingMs: state.settings.discussSeconds * 1000 },
  };
}

function makeRecord(players: Player[], round: Round): RoundRecord {
  const outcome = round.outcome ?? "village";
  return {
    number: round.number,
    roles: round.roles,
    mafiaIds: players
      .filter((p) => round.roles[p.id] === "mafia")
      .map((p) => p.id),
    cycles: round.cycle,
    outcome,
    events: round.events,
    awards: roundAwards(players, round.roles, outcome),
  };
}

// ------------------------------------------------------------------ store

export const useMafia = create<MafiaState>()(
  persist(
    (set, get) => ({
      phase: "setup",
      players: [0, 1, 2, 3, 4, 5].map(makePlayer),
      settings: defaultSettings,
      round: null,
      timer: { endsAt: null, remainingMs: 0 },
      bonus: {},
      history: [],
      muted: false,

      addPlayer: () =>
        set((s) =>
          s.players.length >= MAX_PLAYERS
            ? s
            : { players: [...s.players, makePlayer(s.players.length)] },
        ),
      removePlayer: (id) =>
        set((s) => {
          if (s.players.length <= MIN_PLAYERS) return s;
          const players = s.players.filter((p) => p.id !== id);
          return {
            players,
            settings: {
              ...s.settings,
              mafia: Math.min(s.settings.mafia, maxMafia(players.length)),
            },
          };
        }),
      renamePlayer: (id, name) =>
        set((s) => ({
          players: s.players.map((p) => (p.id === id ? { ...p, name } : p)),
        })),
      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      startGame: () => {
        const s = get();
        if (s.players.length < MIN_PLAYERS) return;
        const players = s.players.map((p, i) => ({
          ...p,
          name: p.name.trim() || `Player ${i + 1}`,
        }));
        const next = { ...s, players, history: [], bonus: {} };
        set({ players, history: [], bonus: {}, ...dealRound(next) });
      },

      showCard: () =>
        set((s) => (s.phase === "pass" ? { phase: "reveal" } : s)),
      hideCard: () =>
        set((s) => {
          if (s.phase !== "reveal" || !s.round) return s;
          const dealIndex = s.round.dealIndex + 1;
          if (dealIndex < s.players.length) {
            return {
              phase: "pass",
              round: { ...s.round, dealIndex },
            };
          }
          return beginNight(s, { ...s.round, dealIndex }, 1);
        }),

      startNightTurn: () =>
        set((s) => (s.phase === "night-pass" ? { phase: "night-act" } : s)),

      investigate: (targetId) =>
        set((s) => {
          if (s.phase !== "night-act" || !s.round) return s;
          if (s.round.detectiveCheckId !== null) return s;
          const isMafia = s.round.roles[targetId] === "mafia";
          const checks = [
            ...s.round.checks.filter((c) => c.cycle !== s.round!.cycle),
            { cycle: s.round.cycle, targetId, isMafia },
          ];
          return {
            round: {
              ...s.round,
              detectiveCheckId: targetId,
              checks,
            },
          };
        }),

      submitNightAction: (targetId) =>
        set((s) => {
          if (s.phase !== "night-act" || !s.round) return s;
          const alive = alivePlayers(s);
          const actor = alive[s.round.nightIndex];
          if (!actor) return resolveNight(s, s.round);

          const role = s.round.roles[actor.id];
          let { mafiaTargetId, doctorSaveId, detectiveCheckId, checks } =
            s.round;

          if (role === "mafia" && targetId) {
            mafiaTargetId = targetId;
          } else if (role === "doctor") {
            doctorSaveId = targetId;
          } else if (role === "detective" && targetId && !detectiveCheckId) {
            detectiveCheckId = targetId;
            checks = [
              ...checks.filter((c) => c.cycle !== s.round!.cycle),
              {
                cycle: s.round.cycle,
                targetId,
                isMafia: s.round.roles[targetId] === "mafia",
              },
            ];
          }

          const nightIndex = s.round.nightIndex + 1;
          const updatedRound: Round = {
            ...s.round,
            nightIndex,
            mafiaTargetId,
            doctorSaveId,
            detectiveCheckId,
            checks,
          };

          if (nightIndex < alive.length) {
            return {
              phase: "night-pass",
              round: updatedRound,
            };
          }
          return resolveNight(s, updatedRound);
        }),

      narratorAdvance: (targetId) =>
        set((s) => {
          if (s.phase !== "narrator-night" || !s.round) return s;
          const { narratorStep } = s.round;

          if (narratorStep === "mafia") {
            const updated: Round = {
              ...s.round,
              mafiaTargetId: targetId,
            };
            if (s.settings.doctor) {
              return { round: { ...updated, narratorStep: "doctor" } };
            }
            if (s.settings.detective) {
              return { round: { ...updated, narratorStep: "detective" } };
            }
            return resolveNight(s, updated);
          }

          if (narratorStep === "doctor") {
            const updated: Round = {
              ...s.round,
              doctorSaveId: targetId,
            };
            if (s.settings.detective) {
              return { round: { ...updated, narratorStep: "detective" } };
            }
            return resolveNight(s, updated);
          }

          // detective step
          let { checks } = s.round;
          if (targetId) {
            checks = [
              ...checks.filter((c) => c.cycle !== s.round!.cycle),
              {
                cycle: s.round.cycle,
                targetId,
                isMafia: s.round.roles[targetId] === "mafia",
              },
            ];
          }
          return resolveNight(s, {
            ...s.round,
            detectiveCheckId: targetId,
            checks,
          });
        }),

      narratorBack: () =>
        set((s) => {
          if (s.phase !== "narrator-night" || !s.round) return s;
          if (s.round.narratorStep === "detective") {
            return {
              round: {
                ...s.round,
                narratorStep: s.settings.doctor ? "doctor" : "mafia",
              },
            };
          }
          if (s.round.narratorStep === "doctor") {
            return {
              round: { ...s.round, narratorStep: "mafia" },
            };
          }
          return s;
        }),

      leaveDawn: () =>
        set((s) => {
          if (s.phase !== "dawn" || !s.round) return s;
          if (s.round.outcome) {
            return {
              phase: "roundover",
              timer: { endsAt: null, remainingMs: 0 },
            };
          }
          return { phase: "discuss" };
        }),

      startClock: () =>
        set((s) => ({
          timer: {
            endsAt: Date.now() + s.timer.remainingMs,
            remainingMs: s.timer.remainingMs,
          },
        })),
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
      resumeClock: () => get().startClock(),

      goToVote: () =>
        set((s) => {
          const remainingMs = s.timer.endsAt
            ? Math.max(0, s.timer.endsAt - Date.now())
            : s.timer.remainingMs;
          return { phase: "vote", timer: { endsAt: null, remainingMs } };
        }),
      backToDiscuss: () =>
        set((s) => (s.phase === "vote" ? { phase: "discuss" } : s)),

      vote: (playerId) =>
        set((s) => {
          if (s.phase !== "vote" || !s.round) return s;
          if (!playerId) {
            const events: RoundEvent[] = [
              ...s.round.events,
              { kind: "day", cycle: s.round.cycle, votedId: null },
            ];
            const outcome = checkWinner(
              s.players,
              s.round.roles,
              s.round.eliminated,
            );
            return {
              phase: "verdict",
              round: {
                ...s.round,
                lastVotedId: null,
                events,
                outcome,
              },
            };
          }

          const eliminated: Elimination[] = [
            ...s.round.eliminated,
            { playerId, by: "day", cycle: s.round.cycle },
          ];
          const events: RoundEvent[] = [
            ...s.round.events,
            { kind: "day", cycle: s.round.cycle, votedId: playerId },
          ];
          const outcome = checkWinner(s.players, s.round.roles, eliminated);

          return {
            phase: "verdict",
            round: {
              ...s.round,
              eliminated,
              lastVotedId: playerId,
              events,
              outcome,
            },
          };
        }),

      continueAfterVerdict: () =>
        set((s) => {
          if (s.phase !== "verdict" || !s.round) return s;
          if (s.round.outcome) {
            return {
              phase: "roundover",
              timer: { endsAt: null, remainingMs: 0 },
            };
          }
          return beginNight(s, s.round, s.round.cycle + 1);
        }),

      nextRound: () =>
        set((s) => {
          if (s.phase !== "roundover" || !s.round?.outcome) return s;
          const record = makeRecord(s.players, s.round);
          const next = { ...s, history: [...s.history, record] };
          return { history: next.history, ...dealRound(next) };
        }),

      adjustScore: (playerId, delta) =>
        set((s) => ({
          bonus: { ...s.bonus, [playerId]: (s.bonus[playerId] ?? 0) + delta },
        })),
      endGame: () =>
        set((s) => {
          let history = s.history;
          if (s.phase === "roundover" && s.round?.outcome) {
            history = [...history, makeRecord(s.players, s.round)];
          }
          return {
            phase: "gameover",
            history,
            round: null,
            timer: { endsAt: null, remainingMs: 0 },
          };
        }),
      rematch: () => get().startGame(),
      newSetup: () =>
        set({
          phase: "setup",
          round: null,
          history: [],
          bonus: {},
        }),
      toggleMuted: () => set((s) => ({ muted: !s.muted })),
    }),
    {
      name: STORAGE_KEYS.mafia,
      version: 1,
      skipHydration: true,
      partialize: (s) => ({
        phase: s.phase,
        players: s.players,
        settings: s.settings,
        round: s.round,
        timer: s.timer,
        bonus: s.bonus,
        history: s.history,
        muted: s.muted,
      }),
    },
  ),
);
