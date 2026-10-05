"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import { useGameTimer } from "@/lib/useGameTimer";

import { sfx } from "@/lib/sfx";
import {
  aliveMafiaCount,
  alivePlayers,
  dealer,
  isEliminated,
  mafiaPlayers,
  nightActor,
  playerName,
  ROLE_META,
  roundAwards,
  useMafia,
  type Role,
  type RoundEvent,
} from "@/store/mafiaStore";
import Character from "../Character";

function useSound() {
  const muted = useMafia((s) => s.muted);
  return (name: keyof typeof sfx) => {
    if (!muted) sfx[name]();
  };
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/55">
      {children}
    </p>
  );
}

// ------------------------------------------------------------------ pass (role deal)

export function Pass() {
  const s = useMafia();
  const holder = dealer(s);
  const play = useSound();
  if (!s.round || !holder) return null;
  const index = s.round.dealIndex;

  return (
    <div className="flex min-h-[26rem] flex-col items-center justify-between gap-6 text-center">
      <div className="flex w-full flex-col items-center">
        <Eyebrow>
          Round {s.round.number} · role {index + 1} of {s.players.length}
        </Eyebrow>
        <Character
          kind="detective"
          tone="purple"
          className="mt-4 h-36 w-32 animate-bob"
        />
        <p className="mt-4 text-lg text-ink/65">Pass the phone to</p>
        <h2 className="font-display text-[clamp(2.2rem,10vw,3.4rem)] font-extrabold leading-none tracking-tight [overflow-wrap:anywhere]">
          {holder.name}
        </h2>
        <p className="mt-3 max-w-xs text-sm text-ink/55">
          Only {holder.name} looks at the next screen. Everyone else, eyes off.
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          sfx.unlock();
          play("tap");
          s.showCard();
        }}
        className="btn tone-purple min-h-14 w-full text-lg"
      >
        I&apos;m {holder.name}, show my role
      </button>
    </div>
  );
}

// ------------------------------------------------------------------ reveal (role deal)

function RoleCardFace({
  role,
  holderId,
}: {
  role: Role;
  holderId: string;
}) {
  const s = useMafia();
  const meta = ROLE_META[role];
  const otherMafia =
    role === "mafia"
      ? mafiaPlayers(s).filter((p) => p.id !== holderId)
      : [];

  return (
    <>
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-ink/55">
        {role === "mafia"
          ? "You are"
          : role === "villager"
            ? "You are a"
            : "You are the"}
      </p>
      <p
        className={`mt-1 font-display text-[clamp(2.5rem,12vw,4.2rem)] font-extrabold leading-none tracking-tight ${meta.color}`}
      >
        {meta.label}
      </p>
      {role === "mafia" && (
        <p className="mt-4 text-base font-semibold">
          {otherMafia.length > 0 ? (
            <>
              Partner{otherMafia.length > 1 ? "s" : ""} in crime:{" "}
              <strong>{otherMafia.map((p) => p.name).join(", ")}</strong>
            </>
          ) : (
            <span className="text-ink/60">Flying solo tonight.</span>
          )}
        </p>
      )}
      <p className="mt-3 max-w-xs text-sm text-ink/60">{meta.summary}</p>
    </>
  );
}

export function Reveal() {
  const s = useMafia();
  const holder = dealer(s);
  const play = useSound();
  if (!s.round || !holder) return null;
  const role = s.round.roles[holder.id] ?? "villager";
  const next = s.players[s.round.dealIndex + 1];

  return (
    <div className="flex min-h-[26rem] flex-col gap-6">
      <Eyebrow>{holder.name} only</Eyebrow>
      <motion.div
        initial={{ rotateY: 90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="inset-well flex flex-1 flex-col items-center justify-center px-4 py-8 text-center"
      >
        <RoleCardFace role={role} holderId={holder.id} />
      </motion.div>
      <button
        type="button"
        onClick={() => {
          play("tap");
          s.hideCard();
        }}
        className="btn tone-white min-h-14 w-full text-lg"
      >
        {next
          ? `Hide & pass to ${next.name}`
          : s.settings.mode === "pass"
            ? "Got it, start Night 1"
            : "Got it, hand to narrator"}
      </button>
    </div>
  );
}

// ------------------------------------------------------------------ pass-the-phone night

export function NightPass() {
  const s = useMafia();
  const actor = nightActor(s);
  const alive = alivePlayers(s);
  const play = useSound();
  if (!s.round || !actor) return null;

  return (
    <div className="flex min-h-[26rem] flex-col items-center justify-between gap-6 text-center">
      <div className="flex w-full flex-col items-center">
        <Eyebrow>
          Night {s.round.cycle} · player {s.round.nightIndex + 1} of{" "}
          {alive.length}
        </Eyebrow>
        <Character
          kind="detective"
          tone="purple"
          className="mt-4 h-36 w-32 animate-bob"
        />
        <p className="mt-4 text-lg text-ink/65">Pass the phone to</p>
        <h2 className="font-display text-[clamp(2.2rem,10vw,3.4rem)] font-extrabold leading-none tracking-tight [overflow-wrap:anywhere]">
          {actor.name}
        </h2>
        <p className="mt-3 max-w-xs text-sm text-ink/55">
          Night has fallen on the village. Only {actor.name} looks at the next
          screen.
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          sfx.unlock();
          play("tap");
          s.startNightTurn();
        }}
        className="btn tone-purple min-h-14 w-full text-lg"
      >
        I&apos;m {actor.name}, take night turn
      </button>
    </div>
  );
}

function NightActInner() {
  const s = useMafia();
  const actor = nightActor(s);
  const alive = alivePlayers(s);
  const play = useSound();
  const round = s.round!;
  const role = round.roles[actor!.id] ?? "villager";
  const nextActor = alive[round.nightIndex + 1];

  const [picked, setPicked] = useState<string | null>(() =>
    role === "mafia" ? round.mafiaTargetId : null,
  );

  const doneLabel = nextActor
    ? `Done, hide & pass to ${nextActor.name}`
    : `Done, wake the village`;

  if (role === "detective") {
    const checkedId = round.detectiveCheckId;
    const checkedIsMafia = checkedId ? round.roles[checkedId] === "mafia" : false;

    return (
      <div className="flex min-h-[26rem] flex-col gap-5">
        <div className="text-center">
          <Eyebrow>
            Night {round.cycle} · {actor!.name} only
          </Eyebrow>
          <h2 className="mt-2 font-display text-[clamp(1.8rem,8vw,2.4rem)] font-extrabold leading-tight tracking-tight">
            Detective · Investigate
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-ink/65">
            {checkedId
              ? "Memorise what you found, then pass the phone along."
              : "Pick one living player to check whether they're Mafia."}
          </p>
        </div>

        {checkedId ? (
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inset-well flex flex-1 flex-col items-center justify-center px-4 py-8 text-center"
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/55">
              Investigation result
            </p>
            <p className="mt-2 font-display text-3xl font-extrabold tracking-tight [overflow-wrap:anywhere]">
              {playerName(s, checkedId)}
            </p>
            <p
              className={`mt-2 font-display text-2xl font-extrabold ${checkedIsMafia ? "text-[#c63a28]" : "text-[#178443]"}`}
            >
              {checkedIsMafia ? "Mafia" : "Innocent"}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {alive
              .filter((p) => p.id !== actor!.id)
              .map((p) => {
                const prev = round.checks.find((c) => c.targetId === p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={picked === p.id}
                    onClick={() => {
                      play("tap");
                      setPicked(p.id);
                    }}
                    className="keycap tone-white h-14 flex-col gap-0 px-2 font-display text-base"
                  >
                    <span className="max-w-full truncate">{p.name}</span>
                    {prev && (
                      <span className="text-[0.65rem] font-semibold opacity-65">
                        {prev.isMafia ? "Mafia" : "Innocent"}
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        )}

        <div className="mt-auto">
          {checkedId ? (
            <button
              type="button"
              onClick={() => {
                play("tap");
                s.submitNightAction(checkedId);
              }}
              className="btn tone-white min-h-14 w-full text-lg"
            >
              {doneLabel}
            </button>
          ) : (
            <button
              type="button"
              disabled={!picked}
              onClick={() => {
                if (!picked) return;
                const hit = round.roles[picked] === "mafia";
                play(hit ? "ding" : "tap");
                s.investigate(picked);
              }}
              className="btn tone-blue min-h-14 w-full text-lg disabled:opacity-50"
            >
              {picked
                ? `Investigate ${playerName(s, picked)}`
                : "Tap a player"}
            </button>
          )}
        </div>
      </div>
    );
  }

  const copy = {
    mafia: {
      title: "Mafia · Eliminate",
      body: round.mafiaTargetId
        ? `Your partner picked ${playerName(s, round.mafiaTargetId)}. Keep their pick or choose someone else.`
        : "Pick one villager for the Mafia to eliminate tonight.",
    },
    doctor: {
      title: "Doctor · Protect",
      body: "Pick one player to save tonight (including yourself). If the Mafia target them, they survive.",
    },
    villager: {
      title: "Villager · Act natural",
      body: "You're asleep tonight. Tap any name below as a decoy so your turn looks just like everyone else's.",
    },
  }[role];

  return (
    <div className="flex min-h-[26rem] flex-col gap-5">
      <div className="text-center">
        <Eyebrow>
          Night {round.cycle} · {actor!.name} only
        </Eyebrow>
        <h2 className="mt-2 font-display text-[clamp(1.8rem,8vw,2.4rem)] font-extrabold leading-tight tracking-tight">
          {copy.title}
        </h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-ink/65">{copy.body}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {alive.map((p) => {
          const isFellowMafia =
            role === "mafia" && round.roles[p.id] === "mafia";
          return (
            <button
              key={p.id}
              type="button"
              disabled={isFellowMafia}
              aria-pressed={picked === p.id}
              onClick={() => {
                play("tap");
                setPicked(p.id);
              }}
              className="keycap tone-white h-14 flex-col gap-0 px-2 font-display text-base disabled:opacity-45"
            >
              <span className="max-w-full truncate">
                {p.name}
                {p.id === actor!.id && role !== "mafia" ? " (you)" : ""}
              </span>
              {isFellowMafia && (
                <span className="text-[0.65rem] font-semibold opacity-70">
                  Mafia
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-auto">
        <button
          type="button"
          disabled={!picked}
          onClick={() => {
            if (!picked) return;
            play("tap");
            s.submitNightAction(picked);
          }}
          className="btn tone-white min-h-14 w-full text-lg disabled:opacity-50"
        >
          {picked ? doneLabel : "Tap a player"}
        </button>
      </div>
    </div>
  );
}

export function NightAct() {
  const s = useMafia();
  const actor = nightActor(s);
  if (!s.round || !actor) return null;
  return <NightActInner key={`${s.round.cycle}-${actor.id}`} />;
}

// ------------------------------------------------------------------ narrator night

function NarratorStepScreen() {
  const s = useMafia();
  const play = useSound();
  const round = s.round!;
  const alive = alivePlayers(s);
  const step = round.narratorStep;

  const [picked, setPicked] = useState<string | null>(() => {
    if (step === "mafia") return round.mafiaTargetId;
    if (step === "doctor") return round.doctorSaveId;
    return round.detectiveCheckId;
  });

  if (step === "mafia") {
    const livingMafia = alive.filter((p) => round.roles[p.id] === "mafia");
    const targets = alive.filter((p) => round.roles[p.id] !== "mafia");

    return (
      <div className="flex min-h-[26rem] flex-col gap-5">
        <div>
          <Eyebrow>Night {round.cycle} · Narrator · Step 1</Eyebrow>
          <h2 className="mt-1 font-display text-3xl font-extrabold tracking-tight">
            Call the Mafia
          </h2>
          <p className="mt-1 text-xs font-semibold text-ink/55">
            Mafia:{" "}
            <strong className="text-ink">
              {livingMafia.map((p) => p.name).join(", ")}
            </strong>
          </p>
        </div>

        <div className="inset-well p-4 text-left">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-ink/50">
            Say out loud
          </p>
          <p className="mt-1 font-display text-lg font-bold leading-snug">
            &ldquo;Everyone close your eyes and go to sleep. Mafia, open your
            eyes and point at who you want to eliminate tonight.&rdquo;
          </p>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-ink/55">
            Who did the Mafia point at?
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {targets.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={picked === p.id}
                onClick={() => {
                  play("tap");
                  setPicked(p.id);
                }}
                className="keycap tone-white h-13 px-2 font-display text-base"
              >
                <span className="truncate">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto">
          <button
            type="button"
            disabled={!picked}
            onClick={() => {
              play("tap");
              s.narratorAdvance(picked);
            }}
            className="btn tone-purple min-h-14 w-full text-lg disabled:opacity-50"
          >
            {picked
              ? `Lock in ${playerName(s, picked)} · Next`
              : "Tap the Mafia's target"}
          </button>
        </div>
      </div>
    );
  }

  if (step === "doctor") {
    const doctorPlayer = s.players.find((p) => round.roles[p.id] === "doctor");
    const doctorAlive = doctorPlayer && !isEliminated(round, doctorPlayer.id);

    return (
      <div className="flex min-h-[26rem] flex-col gap-5">
        <div>
          <Eyebrow>Night {round.cycle} · Narrator · Step 2</Eyebrow>
          <h2 className="mt-1 font-display text-3xl font-extrabold tracking-tight">
            Call the Doctor
          </h2>
          {doctorPlayer && (
            <p className="mt-1 text-xs font-semibold text-ink/55">
              Doctor:{" "}
              <strong className="text-ink">
                {doctorPlayer.name}
                {!doctorAlive ? " (eliminated)" : ""}
              </strong>
            </p>
          )}
        </div>

        <div className="inset-well p-4 text-left">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-ink/50">
            Say out loud
          </p>
          <p className="mt-1 font-display text-lg font-bold leading-snug">
            &ldquo;Mafia, close your eyes. Doctor, open your eyes and point at
            who you want to save tonight.&rdquo;
          </p>
        </div>

        {doctorAlive ? (
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-ink/55">
              Who did the Doctor point at?
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {alive.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={picked === p.id}
                  onClick={() => {
                    play("tap");
                    setPicked(p.id);
                  }}
                  className="keycap tone-white h-13 px-2 font-display text-base"
                >
                  <span className="truncate">{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="inset-well p-4 text-sm font-semibold text-ink/70">
            The Doctor is already out! Still read the prompt above and pause a
            few seconds so the Mafia don&apos;t realise the Doctor is gone.
          </p>
        )}

        <div className="mt-auto flex flex-col gap-2.5">
          <button
            type="button"
            disabled={Boolean(doctorAlive && !picked)}
            onClick={() => {
              play("tap");
              s.narratorAdvance(doctorAlive ? picked : null);
            }}
            className="btn tone-purple min-h-14 w-full text-lg disabled:opacity-50"
          >
            {doctorAlive
              ? picked
                ? `Protect ${playerName(s, picked)} · Next`
                : "Tap who the Doctor saved"
              : "Continue"}
          </button>
          <button
            type="button"
            onClick={s.narratorBack}
            className="btn tone-white w-full"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // step === "detective"
  const detectivePlayer = s.players.find(
    (p) => round.roles[p.id] === "detective",
  );
  const detectiveAlive =
    detectivePlayer && !isEliminated(round, detectivePlayer.id);
  const pickedIsMafia = picked ? round.roles[picked] === "mafia" : false;

  return (
    <div className="flex min-h-[26rem] flex-col gap-5">
      <div>
        <Eyebrow>Night {round.cycle} · Narrator · Step 3</Eyebrow>
        <h2 className="mt-1 font-display text-3xl font-extrabold tracking-tight">
          Call the Detective
        </h2>
        {detectivePlayer && (
          <p className="mt-1 text-xs font-semibold text-ink/55">
            Detective:{" "}
            <strong className="text-ink">
              {detectivePlayer.name}
              {!detectiveAlive ? " (eliminated)" : ""}
            </strong>
          </p>
        )}
      </div>

      <div className="inset-well p-4 text-left">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-ink/50">
          Say out loud
        </p>
        <p className="mt-1 font-display text-lg font-bold leading-snug">
          &ldquo;{s.settings.doctor ? "Doctor" : "Mafia"}, close your eyes.
          Detective, open your eyes and point at someone to investigate.&rdquo;
        </p>
      </div>

      {detectiveAlive ? (
        <>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-ink/55">
              Who did the Detective point at?
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {alive
                .filter((p) => p.id !== detectivePlayer.id)
                .map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={picked === p.id}
                    onClick={() => {
                      play("tap");
                      setPicked(p.id);
                    }}
                    className="keycap tone-white h-13 px-2 font-display text-base"
                  >
                    <span className="truncate">{p.name}</span>
                  </button>
                ))}
            </div>
          </div>

          {picked && (
            <div className="inset-well px-4 py-3 text-center">
              <p
                className={`font-display text-xl font-extrabold ${pickedIsMafia ? "text-[#c63a28]" : "text-[#178443]"}`}
              >
                {pickedIsMafia
                  ? `${playerName(s, picked)} is Mafia — nod yes`
                  : `${playerName(s, picked)} is innocent — shake head no`}
              </p>
            </div>
          )}
        </>
      ) : (
        <p className="inset-well p-4 text-sm font-semibold text-ink/70">
          The Detective is already out! Pause a few seconds so nobody notices,
          then wake the village.
        </p>
      )}

      <div className="mt-auto flex flex-col gap-2.5">
        <button
          type="button"
          disabled={Boolean(detectiveAlive && !picked)}
          onClick={() => {
            play("tap");
            s.narratorAdvance(detectiveAlive ? picked : null);
          }}
          className="btn tone-purple min-h-14 w-full text-lg disabled:opacity-50"
        >
          Wake the village
        </button>
        <button
          type="button"
          onClick={s.narratorBack}
          className="btn tone-white w-full"
        >
          Back
        </button>
      </div>
    </div>
  );
}

export function NarratorNight() {
  const s = useMafia();
  if (!s.round) return null;
  return (
    <NarratorStepScreen key={`${s.round.cycle}-${s.round.narratorStep}`} />
  );
}

// ------------------------------------------------------------------ dawn

export function Dawn() {
  const s = useMafia();
  const play = useSound();
  if (!s.round?.dawn) return null;
  const { round } = s;
  const { victimId, saved } = round.dawn!;
  const victimName = victimId ? playerName(s, victimId) : null;
  const victimRole = victimId ? ROLE_META[round.roles[victimId]] : null;

  return (
    <div className="flex min-h-[26rem] flex-col items-center justify-between gap-6 text-center">
      <div className="flex flex-col items-center">
        <Eyebrow>Morning · Day {round.cycle}</Eyebrow>
        <Character
          kind={victimId ? "hotseat" : "detective"}
          tone={victimId ? "red" : "green"}
          className="mt-4 h-32 w-28 animate-bob"
        />
        <motion.h2
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 18 }}
          className="mt-4 font-display text-[clamp(2rem,9vw,3rem)] font-extrabold leading-tight tracking-tight [overflow-wrap:anywhere]"
        >
          {victimName
            ? `${victimName} was eliminated in the night.`
            : "Everyone woke up safe!"}
        </motion.h2>
        <p className="mt-3 max-w-xs text-lg text-ink/70">
          {victimName ? (
            s.settings.revealRole && victimRole ? (
              <>
                They were{" "}
                <strong>
                  {victimRole.label === "Villager"
                    ? "a Villager"
                    : `the ${victimRole.label}`}
                </strong>
                .
              </>
            ) : (
              "Their role stays hidden until the end of the round."
            )
          ) : saved ? (
            "The Mafia struck, but the Doctor made a clutch save in the night!"
          ) : (
            "Nobody was eliminated overnight."
          )}
        </p>
        {round.outcome === "mafia" && (
          <p className="mt-3 rounded-xl bg-white/75 px-3 py-1.5 text-sm font-bold text-[#c63a28]">
            The Mafia now match the village in numbers!
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          play("tap");
          s.leaveDawn();
        }}
        className={`btn ${round.outcome ? "tone-red" : "tone-purple"} min-h-14 w-full text-lg`}
      >
        {round.outcome ? "See round results" : "Start day discussion"}
      </button>
    </div>
  );
}

// ------------------------------------------------------------------ discuss

function DayClock() {
  const s = useMafia();
  const play = useSound();
  const { ms, running } = useGameTimer(s.timer);
  const lastTick = useRef<number | null>(null);
  const total = s.settings.discussSeconds * 1000;
  const seconds = Math.ceil(ms / 1000);
  const started = running || ms < total;

  useEffect(() => {
    if (!running) return;
    if (ms <= 0) {
      play("buzzer");
      s.goToVote();
      return;
    }
    if (seconds <= 5 && lastTick.current !== seconds) {
      lastTick.current = seconds;
      play("tick");
    }
  }, [ms, seconds, running, play, s]);

  const mm = Math.floor(seconds / 60);
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="inset-well px-4 pb-4 pt-3 text-center">
      <div
        role="timer"
        className={`inline-flex items-baseline justify-center font-display text-6xl font-extrabold tabular-nums tracking-[0.06em] ${seconds <= 10 && running ? "text-[#e2412d]" : ""}`}
      >
        <span>{mm}</span>
        <span className="mx-1.5">:</span>
        <span>{ss}</span>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-black/5">
        <div
          className="h-full rounded-full bg-[#7c5cff]"
          style={{ width: `${(ms / total) * 100}%` }}
        />
      </div>
      <button
        type="button"
        onClick={() => {
          play("tap");
          if (running) s.pauseClock();
          else s.startClock();
        }}
        className="btn btn-sm tone-white mt-3"
      >
        {running ? "Pause" : started ? "Resume" : "Start the clock"}
      </button>
    </div>
  );
}

function PeekRole() {
  const s = useMafia();
  const [who, setWho] = useState<string | null>(null);
  const [peek, setPeek] = useState(false);
  if (!s.round) return null;
  const { round } = s;
  const role = who ? round.roles[who] : null;
  const meta = role ? ROLE_META[role] : null;

  const peekLabel = () => {
    if (!who || !role || !meta) return "";
    if (role === "mafia") {
      const partners = mafiaPlayers(s)
        .filter((p) => p.id !== who)
        .map((p) => p.name);
      return `Mafia${partners.length ? ` · with ${partners.join(", ")}` : ""}`;
    }
    if (role === "detective" && round.checks.length > 0) {
      const latest = round.checks[round.checks.length - 1];
      return `Detective · ${playerName(s, latest.targetId)}: ${latest.isMafia ? "Mafia" : "Innocent"}`;
    }
    return meta.label;
  };

  return (
    <details className="inset-well px-4 py-3 text-left">
      <summary className="cursor-pointer text-sm font-bold">
        Forgot your role?
      </summary>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {s.players.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={who === p.id}
            onClick={() => setWho(p.id)}
            className="keycap tone-white h-9 px-3 text-xs"
          >
            {p.name}
          </button>
        ))}
      </div>
      {role && (
        <button
          type="button"
          onPointerDown={() => setPeek(true)}
          onPointerUp={() => setPeek(false)}
          onPointerLeave={() => setPeek(false)}
          onPointerCancel={() => setPeek(false)}
          onContextMenu={(e) => e.preventDefault()}
          className="keycap tone-white mt-3 h-12 w-full select-none px-3 font-display text-lg [-webkit-touch-callout:none]"
        >
          {peek ? peekLabel() : `Hold to peek (${playerName(s, who!)} only)`}
        </button>
      )}
    </details>
  );
}

export function Discuss() {
  const s = useMafia();
  const play = useSound();
  if (!s.round) return null;
  const alive = alivePlayers(s);
  const mafiaLeft = aliveMafiaCount(s);

  return (
    <div className="flex min-h-[26rem] flex-col gap-5">
      <div className="text-center">
        <Eyebrow>
          Day {s.round.cycle} · {alive.length} players left
        </Eyebrow>
        <h2 className="mt-2 font-display text-[clamp(1.9rem,8vw,2.6rem)] font-extrabold leading-tight tracking-tight">
          Debate &amp; find the Mafia
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-ink/65">
          Talk it out. Who&apos;s acting suspicious? Whose alibi doesn&apos;t
          add up? There{" "}
          <strong>
            {mafiaLeft === 1 ? "is 1 Mafia" : `are ${mafiaLeft} Mafia`}
          </strong>{" "}
          still hiding in the village.
        </p>
      </div>

      {s.settings.discussSeconds > 0 && <DayClock />}

      <div className="inset-well px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-ink/50">
          In the village
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {s.players.map((p) => {
            const out = isEliminated(s.round!, p.id);
            return (
              <span
                key={p.id}
                className={`chip tone-white ${out ? "line-through opacity-45" : ""}`}
              >
                {p.name}
              </span>
            );
          })}
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <button
          type="button"
          onClick={() => {
            play("tap");
            s.goToVote();
          }}
          className="btn tone-red min-h-14 w-full text-lg"
        >
          Time to vote
        </button>
        <PeekRole />
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ vote

export function Vote() {
  const s = useMafia();
  const play = useSound();
  const [picked, setPicked] = useState<string | null>(null);
  if (!s.round) return null;
  const { round } = s;

  return (
    <div className="flex min-h-[26rem] flex-col gap-5">
      <div className="text-center">
        <Eyebrow>Day {round.cycle} · Village vote</Eyebrow>
        <h2 className="mt-2 font-display text-[clamp(1.9rem,8vw,2.6rem)] font-extrabold leading-tight tracking-tight">
          Who gets voted out?
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-ink/65">
          Count down from three and everyone points. Tap whoever got the most
          votes — or skip if the village is tied.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {s.players.map((p) => {
          const out = isEliminated(round, p.id);
          return (
            <button
              key={p.id}
              type="button"
              disabled={out}
              aria-pressed={picked === p.id}
              onClick={() => {
                play("tap");
                setPicked(p.id);
              }}
              className="keycap tone-white h-14 px-2 font-display text-base disabled:line-through disabled:opacity-40"
            >
              <span className="truncate">{p.name}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <button
          type="button"
          disabled={!picked}
          onClick={() => {
            if (!picked) return;
            const hit = round.roles[picked] === "mafia";
            play(hit ? "ding" : "buzzer");
            s.vote(picked);
          }}
          className="btn tone-red min-h-14 w-full text-lg disabled:opacity-50"
        >
          {picked ? `Vote out ${playerName(s, picked)}` : "Tap a player"}
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={s.backToDiscuss}
            className="btn tone-white"
          >
            More discussion
          </button>
          <button
            type="button"
            onClick={() => {
              play("tap");
              s.vote(null);
            }}
            className="btn tone-white"
          >
            No one (skip)
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ verdict

export function Verdict() {
  const s = useMafia();
  const play = useSound();
  if (!s.round) return null;
  const { round } = s;
  const votedId = round.lastVotedId;

  if (!votedId) {
    return (
      <div className="flex min-h-[26rem] flex-col items-center justify-between gap-6 text-center">
        <div className="flex flex-col items-center">
          <Character
            kind="detective"
            tone="purple"
            className="h-32 w-28 animate-bob"
          />
          <h2 className="mt-4 font-display text-[clamp(2rem,9vw,3rem)] font-extrabold leading-tight tracking-tight">
            Nobody was voted out.
          </h2>
          <p className="mt-3 max-w-xs text-lg text-ink/70">
            The village held back its vote. Night falls on the baithak again…
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            play("tap");
            s.continueAfterVerdict();
          }}
          className="btn tone-purple min-h-14 w-full text-lg"
        >
          Start Night {round.cycle + 1}
        </button>
      </div>
    );
  }

  const name = playerName(s, votedId);
  const role = round.roles[votedId] ?? "villager";
  const meta = ROLE_META[role];
  const hit = role === "mafia";
  const remaining = aliveMafiaCount(s);

  let headline: string;
  if (!s.settings.revealRole) {
    headline = `${name} was voted out.`;
  } else if (hit) {
    headline = `${name} was Mafia!`;
  } else if (role === "doctor" || role === "detective") {
    headline = `${name} was the ${meta.label}!`;
  } else {
    headline = `${name} was an innocent Villager.`;
  }

  let body: string;
  if (round.outcome === "village") {
    body = "Every Mafia member has been caught! The village is safe.";
  } else if (round.outcome === "mafia") {
    body = "Wrong choice! The Mafia now match the village in numbers.";
  } else if (s.settings.revealRole && hit) {
    body = `Nice catch! ${remaining} more Mafia still hiding in the village.`;
  } else if (s.settings.revealRole) {
    body = `The village lost an innocent ${meta.label}. ${remaining} Mafia remain.`;
  } else {
    body = "Their role stays a secret until the round is over. Night falls…";
  }

  return (
    <div className="flex min-h-[26rem] flex-col items-center justify-between gap-6 text-center">
      <div className="flex flex-col items-center">
        <Character
          kind={hit ? "fibber" : "hotseat"}
          tone={hit ? "green" : "red"}
          className="h-32 w-28 animate-bob"
        />
        <motion.h2
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 16 }}
          className="mt-4 font-display text-[clamp(2rem,9vw,3rem)] font-extrabold leading-tight tracking-tight [overflow-wrap:anywhere]"
        >
          {headline}
        </motion.h2>
        <p className="mt-3 max-w-xs text-lg text-ink/70">{body}</p>
      </div>
      <button
        type="button"
        onClick={() => {
          play("tap");
          s.continueAfterVerdict();
        }}
        className={`btn ${round.outcome === "village" ? "tone-green" : round.outcome === "mafia" ? "tone-red" : "tone-purple"} min-h-14 w-full text-lg`}
      >
        {round.outcome ? "See round results" : `Start Night ${round.cycle + 1}`}
      </button>
    </div>
  );
}

// ------------------------------------------------------------------ round over

const OUTCOME_COPY = {
  village: { title: "Village wins!", tone: "green", character: "detective" },
  mafia: { title: "Mafia wins!", tone: "red", character: "fibber" },
} as const;

function describeEvent(
  event: RoundEvent,
  players: { id: string; name: string }[],
  roles: Record<string, Role>,
) {
  const nameOf = (id: string) =>
    players.find((p) => p.id === id)?.name ?? "Someone";
  if (event.kind === "night") {
    if (event.victimId) {
      const role = ROLE_META[roles[event.victimId] ?? "villager"].label;
      return `Night ${event.cycle}: ${nameOf(event.victimId)} (${role}) eliminated`;
    }
    return event.saved
      ? `Night ${event.cycle}: Doctor saved the Mafia's target`
      : `Night ${event.cycle}: Everyone survived`;
  }
  if (event.votedId) {
    const role = ROLE_META[roles[event.votedId] ?? "villager"].label;
    return `Day ${event.cycle}: ${nameOf(event.votedId)} (${role}) voted out`;
  }
  return `Day ${event.cycle}: Village skipped the vote`;
}

export function RoundOver() {
  const s = useMafia();
  const play = useSound();
  const outcome = s.round?.outcome;

  useEffect(() => {
    if (outcome) play("fanfare");
    // Only when the round ends, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outcome]);

  if (!s.round || !outcome) return null;
  const { round } = s;
  const copy = OUTCOME_COPY[outcome];
  const mafiaNames = mafiaPlayers(s).map((p) => p.name);
  const doctor = s.players.find((p) => round.roles[p.id] === "doctor");
  const detective = s.players.find((p) => round.roles[p.id] === "detective");
  const awards = roundAwards(s.players, round.roles, outcome);
  const winners = Object.keys(awards);
  const points = winners.length ? awards[winners[0]] : 0;

  return (
    <div className="flex min-h-[26rem] flex-col gap-5 text-center">
      <div className="flex flex-col items-center">
        <Character
          kind={copy.character}
          tone={copy.tone}
          className="h-28 w-24 animate-bob"
        />
        <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight">
          {copy.title}
        </h2>
        <p className="mt-1 text-ink/65">
          {outcome === "village"
            ? "Every Mafia member was tracked down and voted out."
            : "The Mafia outlasted the village and took control."}
        </p>
      </div>

      <dl className="inset-well grid gap-3 px-4 py-4 text-left">
        <div>
          <dt className="text-xs font-bold uppercase tracking-[0.15em] text-ink/50">
            The Mafia
          </dt>
          <dd className="font-display text-xl font-extrabold">
            {mafiaNames.join(", ")}
          </dd>
        </div>

        {(doctor || detective) && (
          <div className="grid grid-cols-2 gap-2">
            {doctor && (
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.15em] text-ink/50">
                  Doctor
                </dt>
                <dd className="font-bold">{doctor.name}</dd>
              </div>
            )}
            {detective && (
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.15em] text-ink/50">
                  Detective
                </dt>
                <dd className="font-bold">{detective.name}</dd>
              </div>
            )}
          </div>
        )}

        {round.events.length > 0 && (
          <div>
            <dt className="text-xs font-bold uppercase tracking-[0.15em] text-ink/50">
              How it played out
            </dt>
            <dd className="mt-1">
              <ul className="flex flex-col gap-1 text-sm text-ink/75">
                {round.events.map((ev, i) => (
                  <li key={i}>{describeEvent(ev, s.players, round.roles)}</li>
                ))}
              </ul>
            </dd>
          </div>
        )}

        {winners.length > 0 && (
          <div>
            <dt className="text-xs font-bold uppercase tracking-[0.15em] text-ink/50">
              Points
            </dt>
            <dd className="text-sm font-semibold">
              +{points} to {winners.map((id) => playerName(s, id)).join(", ")}
            </dd>
          </div>
        )}
      </dl>

      <div className="mt-auto flex flex-col gap-3">
        <button
          type="button"
          onClick={() => {
            play("tap");
            s.nextRound();
          }}
          className="btn tone-purple min-h-14 w-full text-lg"
        >
          Next round
        </button>
        <button
          type="button"
          onClick={() => {
            play("tap");
            s.endGame();
          }}
          className="btn tone-white w-full"
        >
          Finish game
        </button>
      </div>
    </div>
  );
}
