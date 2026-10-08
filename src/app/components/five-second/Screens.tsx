"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { fitPromptClass } from "@/lib/fitText";
import { sfx } from "@/lib/sfx";
import { useGameTimer } from "@/lib/useGameTimer";
import {
  currentJudge,
  currentSpeaker,
  currentTeam,
  otherTeam,
  useFiveSecond,
} from "@/store/fiveSecondStore";
import Character from "../Character";

function useSound() {
  const muted = useFiveSecond((s) => s.muted);
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

export function Handoff() {
  const s = useFiveSecond();
  const team = currentTeam(s);
  const other = otherTeam(s);
  const speaker = currentSpeaker(s);
  const judge = currentJudge(s);
  const play = useSound();

  return (
    <div className="flex min-h-[26rem] flex-col items-center justify-between gap-6 text-center">
      <div className="flex flex-col items-center">
        <Eyebrow>Round {Math.floor(s.turn / 2) + 1}</Eyebrow>
        <Character kind="jamun" tone={team.tone} className="mt-4 h-32 w-28 animate-bob" />
        <h2 className="mt-4 line-clamp-2 break-words font-display text-[clamp(2rem,9vw,3rem)] font-extrabold leading-none tracking-tight">
          {team.name}
        </h2>
        <p className="mt-3 max-w-xs text-lg text-ink/75">
          {speaker ? (
            <>
              <strong className="text-ink">{speaker}</strong>, you&apos;re up!
            </>
          ) : (
            "Pick someone to answer."
          )}{" "}
          Name <strong className="text-ink">three</strong> in{" "}
          <strong className="text-ink">{s.settings.seconds} seconds</strong>.
        </p>
        <p className="mt-2 max-w-xs text-sm text-ink/60">
          {judge ? (
            <>
              <strong className="text-ink">{judge}</strong> ({other.name}) holds
              the phone and judges.
            </>
          ) : (
            <>Someone from {other.name} holds the phone and judges.</>
          )}{" "}
          The clock starts the moment the category appears.
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
        Show the category
      </button>
    </div>
  );
}

export function Live() {
  const s = useFiveSecond();
  const play = useSound();
  const timer = { endsAt: s.endsAt, remainingMs: s.settings.seconds * 1000 };
  const { ms } = useGameTimer(timer);
  const lastTick = useRef<number | null>(null);
  const seconds = Math.ceil(ms / 1000);
  const total = s.settings.seconds * 1000;

  useEffect(() => {
    if (s.endsAt === null) return;
    if (ms <= 0) {
      play("buzzer");
      s.timeUp();
      return;
    }
    if (lastTick.current !== seconds) {
      lastTick.current = seconds;
      play("tick");
    }
  }, [ms, seconds, s, play]);

  return (
    <div className="flex min-h-[28rem] flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Eyebrow>{currentSpeaker(s) ?? currentTeam(s).name} · name three</Eyebrow>
        <button
          type="button"
          disabled={s.swapped}
          onClick={() => {
            play("tap");
            s.swapTopic();
          }}
          className="keycap tone-white h-9 px-3 text-xs"
        >
          Swap
        </button>
      </div>

      <div className="inset-well grid h-52 shrink-0 place-items-center overflow-hidden px-4 py-6 text-center">
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
      </div>

      <div className="text-center">
        <div
          role="timer"
          className={`font-display text-[clamp(6rem,36vw,10rem)] font-extrabold leading-none tabular-nums ${
            seconds <= 2 ? "text-[#e2412d]" : ""
          }`}
        >
          {seconds}
        </div>
        <div className="mx-auto mt-3 h-3 max-w-xs overflow-hidden rounded-full bg-black/5">
          <div
            className="h-full rounded-full bg-[var(--tone-solid)]"
            style={{ width: `${(ms / total) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function Judge() {
  const s = useFiveSecond();
  const team = currentTeam(s);
  const other = otherTeam(s);
  const play = useSound();

  return (
    <div className="flex min-h-[26rem] flex-col gap-5 text-center">
      <div className="flex flex-col items-center">
        <Eyebrow>Time! Judge the answers</Eyebrow>
        <h2 className="mt-3 line-clamp-3 font-display text-2xl font-extrabold leading-tight tracking-tight">
          {s.topic}
        </h2>
        <p className="mt-2 max-w-sm text-sm text-ink/60">
          Did {currentSpeaker(s) ?? team.name} give three valid, different
          answers in time? No repeats, no “umm”.
        </p>
      </div>
      <div className="mt-auto flex flex-col gap-3">
        <button
          type="button"
          onClick={() => {
            play("success");
            s.judge("nailed");
          }}
          className="btn tone-green min-h-16 w-full text-xl"
        >
          Nailed it · +1 {team.name}
        </button>
        <button
          type="button"
          onClick={() => {
            play("ding");
            s.judge("stolen");
          }}
          className={`btn tone-${other.tone} min-h-14 w-full`}
        >
          Missed, but {other.name} stole it · +1
        </button>
        <button
          type="button"
          onClick={() => {
            play("tap");
            s.judge("missed");
          }}
          className="btn tone-white min-h-14 w-full"
        >
          Missed, no points
        </button>
        <p className="text-xs text-ink/50">
          To steal, the other team gets one go at three different answers.
        </p>
      </div>
    </div>
  );
}
