"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { fitPromptClass } from "@/lib/fitText";
import { sfx } from "@/lib/sfx";
import { useGameTimer } from "@/lib/useGameTimer";
import {
  judgeOf,
  speakerOf,
  totalTurns,
  useCategories,
} from "@/store/categoriesStore";
import Character from "../Character";

function useSound() {
  const muted = useCategories((s) => s.muted);
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

// ------------------------------------------------------------------ handoff

export function Handoff() {
  const s = useCategories();
  const speaker = speakerOf(s);
  const judge = judgeOf(s);
  const play = useSound();

  return (
    <div className="flex min-h-[26rem] flex-col items-center justify-between gap-6 text-center">
      <div className="flex flex-col items-center">
        <Eyebrow>
          Turn {s.turn + 1} of {totalTurns(s)}
        </Eyebrow>
        <Character kind="writer" tone="green" className="mt-4 h-36 w-32 animate-bob" />
        <h2 className="mt-4 line-clamp-2 break-words font-display text-[clamp(2rem,9vw,3rem)] font-extrabold leading-none tracking-tight">
          {speaker.name}
        </h2>
        <p className="mt-3 max-w-xs text-lg text-ink/75">
          You&apos;re up! Say as many answers as you can in{" "}
          <strong className="text-ink">{s.settings.seconds} seconds</strong>.
        </p>
        <p className="mt-2 max-w-xs text-sm text-ink/60">
          <strong className="text-ink">{judge.name}</strong> holds the phone and
          taps once for every good answer. No repeats, no waffling. Everyone
          else can call out answers that don&apos;t fit.
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          sfx.unlock();
          play("tap");
          s.startTurn();
        }}
        className="btn tone-green min-h-14 w-full text-lg"
      >
        Reveal the category
      </button>
    </div>
  );
}

// ------------------------------------------------------------------ live

export function Live() {
  const s = useCategories();
  const speaker = speakerOf(s);
  const play = useSound();
  const { ms, running } = useGameTimer(s.timer);
  const lastTick = useRef<number | null>(null);

  const total = s.settings.seconds * 1000;
  const seconds = Math.ceil(ms / 1000);
  const urgent = seconds <= 10;

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

  const ss = String(seconds % 60).padStart(2, "0");
  const mm = Math.floor(seconds / 60);

  return (
    <div className="flex min-h-[28rem] flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Eyebrow>{speaker.name} is talking</Eyebrow>
        <span className="chip tone-white px-3 py-1 text-sm">✓ {s.count}</span>
      </div>

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

      <div className="inset-well relative grid h-52 shrink-0 place-items-center overflow-hidden px-4 pb-4 pt-9 text-center">
        {running ? (
          <>
            {s.letter && (
              <span className="absolute right-3 top-2.5 grid h-10 w-10 place-items-center rounded-xl border-2 border-[var(--tone-edge)] bg-[var(--tone-solid)] font-display text-2xl font-extrabold text-white">
                {s.letter}
              </span>
            )}
            <span className="chip absolute left-3 top-3 text-[0.7rem]">
              {s.letter ? "Starting with " + s.letter : "Name as many as you can"}
            </span>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.p
                key={s.topic}
                initial={{ opacity: 0, y: 14, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ type: "spring", stiffness: 380, damping: 26 }}
                className={`font-display ${fitPromptClass(s.topic ?? "")} font-extrabold leading-tight tracking-tight [overflow-wrap:anywhere]`}
              >
                {s.topic}
              </motion.p>
            </AnimatePresence>
          </>
        ) : (
          <div>
            <p className="font-display text-3xl font-extrabold text-ink/40">Paused</p>
            <p className="mt-1 text-sm text-ink/50">The category is hidden until you resume.</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          disabled={!running}
          onClick={() => {
            play("ding");
            s.point();
          }}
          className="btn tone-green min-h-20 w-full text-2xl"
        >
          Good answer · {s.count}
        </button>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            disabled={!running || s.count === 0}
            onClick={() => {
              play("tap");
              s.undo();
            }}
            className="btn tone-white"
          >
            Undo
          </button>
          <button
            type="button"
            disabled={!running || s.swapped || s.count > 0}
            onClick={() => {
              play("tap");
              s.swapTopic();
            }}
            className="btn tone-white"
          >
            Swap
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

export function Result() {
  const s = useCategories();
  const speaker = speakerOf(s);
  const play = useSound();
  const isLast = s.turn + 1 >= totalTurns(s);

  useEffect(() => {
    // Only when the tally first appears.
    if (!s.muted) sfx[s.count > 0 ? "success" : "tick"]();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-[26rem] flex-col items-center justify-between gap-6 text-center">
      <div className="flex w-full flex-col items-center">
        <Character kind="writer" tone="green" className="h-28 w-24" />
        <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight">
          {s.count === 0
            ? "Not this time"
            : s.count === 1
              ? "1 answer!"
              : `${s.count} answers!`}
        </h2>
        <p className="mt-1 line-clamp-2 text-ink/65">
          {speaker.name} · {s.topic}
          {s.letter ? ` starting with ${s.letter}` : ""}
        </p>

        <p className="mt-5 text-sm text-ink/55">
          Miscounted? Fix the tally before moving on.
        </p>
        <div className="mt-2 flex items-center gap-4">
          <button
            type="button"
            aria-label="Take one off"
            disabled={s.count === 0}
            onClick={() => s.adjustCount(-1)}
            className="keycap tone-white h-12 w-12 text-2xl"
          >
            −
          </button>
          <span className="w-16 font-display text-5xl font-extrabold tabular-nums">
            {s.count}
          </span>
          <button
            type="button"
            aria-label="Add one"
            onClick={() => s.adjustCount(1)}
            className="keycap tone-white h-12 w-12 text-2xl"
          >
            +
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          play("tap");
          if (isLast) play("fanfare");
          s.nextTurn();
        }}
        className="btn tone-green min-h-14 w-full text-lg"
      >
        {isLast ? "See the winner" : "Next player"}
      </button>
    </div>
  );
}
