"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { useGameTimer } from "@/lib/useGameTimer";

import { categoryMeta } from "@/lib/charades/words";
import { sfx } from "@/lib/sfx";
import {
  currentActor,
  currentTeam,
  passesLeft,
  scoreOf,
  totalTurns,
  useCharades,
} from "@/store/charadesStore";
import Character from "../Character";

function useSound() {
  const muted = useCharades((s) => s.muted);
  return (name: keyof typeof sfx) => {
    if (!muted) sfx[name]();
  };
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/55">{children}</p>
  );
}

// ------------------------------------------------------------------ handoff

export function Handoff() {
  const s = useCharades();
  const team = currentTeam(s);
  const actor = currentActor(s);
  const play = useSound();
  const passes = s.settings.passes;

  return (
    <div className="flex min-h-[26rem] flex-col items-center justify-between gap-6 text-center">
      <div className="flex flex-col items-center">
        <Eyebrow>
          Turn {s.turn + 1} of {totalTurns(s)}
        </Eyebrow>
        {s.notice && (
          <p className="inset-well mt-3 px-3 py-2 text-left text-sm font-semibold">
            {s.notice}{" "}
            <button type="button" onClick={s.dismissNotice} className="underline">
              OK
            </button>
          </p>
        )}
        <Character kind="actor" tone={team.tone} className="mt-4 h-36 w-32 animate-bob" />
        <h2 className="mt-4 font-display text-[clamp(2rem,9vw,3rem)] font-extrabold leading-none tracking-tight">
          {team.name}
        </h2>
        <p className="mt-3 max-w-xs text-lg text-ink/75">
          {actor ? (
            <>
              <strong className="text-ink">{actor}</strong>, you&apos;re acting!
            </>
          ) : (
            "Pick someone from your team to act."
          )}
        </p>
        <p className="mt-2 max-w-xs text-sm text-ink/55">
          Take the phone and keep the screen to yourself. Your team sits facing
          you. No talking, no pointing at things.
        </p>
        <p className="mt-3 text-xs font-semibold text-ink/50">
          {s.settings.roundSeconds}s ·{" "}
          {passes === null ? "unlimited passes" : passes === 0 ? "no passes" : `${passes} passes`}
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          sfx.unlock();
          play("tap");
          s.startTurn();
        }}
        className={`btn tone-${team.tone} min-h-14 w-full text-lg`}
      >
        Start the clock
      </button>
    </div>
  );
}

// ------------------------------------------------------------------ acting

export function Acting() {
  const s = useCharades();
  const team = currentTeam(s);
  const play = useSound();
  const { ms, running } = useGameTimer(s.timer);
  const lastTick = useRef<number | null>(null);

  const total = s.settings.roundSeconds * 1000;
  const seconds = Math.ceil(ms / 1000);
  const urgent = seconds <= 10;
  const left = passesLeft(s);
  const gotCount = scoreOf(s.turnWords);
  const meta = s.current ? categoryMeta(s.current.categoryId) : null;

  useEffect(() => {
    if (!running) return;
    if (ms <= 0) {
      play("buzzer");
      s.endTurn();
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
    <div className="flex min-h-[28rem] flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Eyebrow>{team.name} acting</Eyebrow>
        <span className="chip tone-white px-3 py-1 text-sm">✓ {gotCount}</span>
      </div>

      {/* Clock */}
      <div className={`flex items-center gap-3 ${urgent && running ? "animate-wobble" : ""}`}>
        <div
          role="timer"
          className={`inline-flex items-baseline font-display text-4xl font-extrabold tabular-nums leading-none tracking-[0.06em] ${urgent ? "text-[#e2412d]" : ""}`}
        >
          <span>{mm}</span>
          <span className="mx-1">:</span>
          <span>{ss}</span>
        </div>
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-black/5">
          <div
            className="h-full rounded-full bg-[var(--tone-solid)]"
            style={{ width: `${(ms / total) * 100}%` }}
          />
        </div>
      </div>

      {/* The word */}
      <div className="inset-well relative grid flex-1 place-items-center overflow-hidden px-4 py-8 text-center">
        {running ? (
          <>
            {meta && (
              <span className="chip absolute left-3 top-3 text-[0.7rem]">{meta.label}</span>
            )}
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.p
                key={`${s.turnWords.length}-${s.current?.word}`}
                initial={{ opacity: 0, y: 18, rotate: -3, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, y: -18, scale: 0.92 }}
                transition={{ type: "spring", stiffness: 380, damping: 24 }}
                className="break-words font-display text-[clamp(2rem,10vw,3.6rem)] font-extrabold leading-tight tracking-tight [overflow-wrap:anywhere]"
              >
                {s.current?.word}
              </motion.p>
            </AnimatePresence>
          </>
        ) : (
          <div>
            <p className="font-display text-3xl font-extrabold text-ink/40">Paused</p>
            <p className="mt-1 text-sm text-ink/50">The word is hidden until you resume.</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          disabled={!running}
          onClick={() => {
            play("success");
            s.gotIt();
          }}
          className="btn tone-green min-h-16 w-full text-xl"
        >
          Got it!
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={!running || left === 0}
            onClick={() => {
              play("tap");
              s.pass();
            }}
            className="btn tone-white"
          >
            Pass{left === null ? "" : ` · ${left} left`}
          </button>
          <button
            type="button"
            onClick={running ? s.pauseClock : s.resumeClock}
            className="btn tone-white"
          >
            {running ? "Pause" : "Resume"}
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            play("tap");
            s.endTurn();
          }}
          className="self-center text-sm font-bold text-ink/55 underline underline-offset-4"
        >
          Finish this turn early
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ result

const VERDICT_LABEL = { got: "✓", passed: "Passed", timeout: "Time's up" } as const;

export function Result() {
  const s = useCharades();
  const team = currentTeam(s);
  const actor = currentActor(s);
  const play = useSound();
  const score = scoreOf(s.turnWords);
  const isLastTurn = s.turn + 1 >= totalTurns(s);

  useEffect(() => {
    // Only when the results first appear.
    if (!s.muted) sfx[score > 0 ? "success" : "tick"]();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-[26rem] flex-col gap-5 text-center">
      <div className="flex flex-col items-center">
        <Character kind="actor" tone={team.tone} className="h-28 w-24" />
        <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight">
          {score === 0 ? "Not this time" : score === 1 ? "1 word!" : `${score} words!`}
        </h2>
        <p className="mt-1 text-ink/65">
          {actor ? `${actor} · ` : ""}
          {team.name}
        </p>
        <p className={`tone-${team.tone} chip mt-3 px-4 py-1.5 text-base`}>
          +{score} for {team.name}
        </p>
      </div>

      {s.turnWords.length > 0 ? (
        <div className="text-left">
          <p className="mb-2 text-center text-sm text-ink/55">
            Tap a word to fix it if we got it wrong.
          </p>
          <ul className="flex flex-col gap-2">
            {s.turnWords.map((w, i) => {
              const got = w.verdict === "got";
              return (
                <li key={`${w.word}-${i}`}>
                  <button
                    type="button"
                    aria-pressed={got}
                    onClick={() => {
                      play("tap");
                      s.toggleVerdict(i);
                    }}
                    className={`brick brick-flat brick-press flex w-full items-center gap-3 px-3 py-2.5 text-left ${got ? "tone-green" : "tone-white"}`}
                  >
                    <span
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border-2 text-sm font-extrabold ${got ? "border-[#178443] bg-[#25b35f] text-white" : "border-line bg-white text-ink/40"}`}
                    >
                      {got ? "✓" : "✗"}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-display text-lg font-bold">
                      {w.word}
                    </span>
                    {!got && (
                      <span className="shrink-0 text-xs font-bold text-ink/50">
                        {VERDICT_LABEL[w.verdict]}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <p className="text-ink/60">No words this turn.</p>
      )}

      <div className="mt-auto">
        <button
          type="button"
          onClick={() => {
            play("tap");
            if (isLastTurn) play("fanfare");
            s.nextTurn();
          }}
          className={`btn tone-${team.tone} min-h-14 w-full text-lg`}
        >
          {isLastTurn ? "See the winner" : "Next turn"}
        </button>
      </div>
    </div>
  );
}
