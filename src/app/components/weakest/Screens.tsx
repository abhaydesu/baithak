"use client";

import { useEffect } from "react";

import { fitPromptClass } from "@/lib/fitText";
import { sfx } from "@/lib/sfx";
import { useGameTimer } from "@/lib/useGameTimer";
import {
  FINAL_QUESTIONS,
  LADDER,
  answeringId,
  nameOf,
  nextValue,
  potOf,
  roundSeconds,
  useWeakest,
  weakestByStats,
} from "@/store/weakestStore";
import Character from "../Character";

function useSound() {
  const muted = useWeakest((s) => s.muted);
  return (name: keyof typeof sfx) => {
    if (!muted) sfx[name]();
  };
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/55">{children}</p>
  );
}

function QuestionCard({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="inset-well grid h-40 shrink-0 place-items-center overflow-hidden px-4 py-4 text-center">
        <p className={`font-display ${fitPromptClass(question)} font-extrabold leading-tight tracking-tight`}>
          {question}
        </p>
      </div>
      <p className="text-center text-sm text-ink/60">
        Answer: <strong className="text-ink">{answer}</strong>
      </p>
    </div>
  );
}

export function Intro() {
  const s = useWeakest();
  const first = nameOf(s, answeringId(s));
  const play = useSound();

  return (
    <div className="flex min-h-[26rem] flex-col items-center justify-between gap-6 text-center">
      <div className="flex flex-col items-center">
        <Eyebrow>Round {s.round + 1}</Eyebrow>
        <Character kind="paan" tone="blue" className="mt-4 h-32 w-28 animate-bob" />
        <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight">
          {s.alive.length} players left
        </h2>
        <p className="mt-3 max-w-xs text-ink/70">
          <strong className="text-ink">{first}</strong> goes first, then clockwise.
          You have{" "}
          <strong className="text-ink">
            {roundSeconds({ settings: s.settings, round: s.round + 1 })} seconds
          </strong>
          . Build a chain of right answers and bank it before someone slips.
        </p>
        <p className="mt-2 max-w-xs text-sm text-ink/55">
          The quizmaster holds the phone, reads each question out loud and taps
          Right or Wrong.
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          sfx.unlock();
          play("tap");
          s.startRound();
        }}
        className="btn tone-blue min-h-14 w-full text-lg"
      >
        Start the clock
      </button>
    </div>
  );
}

export function RoundScreen() {
  const s = useWeakest();
  const play = useSound();
  const { ms, running } = useGameTimer({ endsAt: s.endsAt, remainingMs: s.remainingMs });
  const total = roundSeconds(s) * 1000;
  const seconds = Math.ceil(ms / 1000);
  const urgent = seconds <= 10;
  const who = nameOf(s, answeringId(s));

  useEffect(() => {
    if (!running) return;
    if (ms <= 0) {
      play("buzzer");
      s.timeUp();
    }
  }, [ms, running, play, s]);

  return (
    <div className="flex min-h-[28rem] flex-col gap-4">
      <div className="flex items-center gap-3">
        <div
          role="timer"
          className={`font-display text-4xl font-extrabold tabular-nums leading-none ${urgent ? "text-[#e2412d]" : ""}`}
        >
          {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
        </div>
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-black/5">
          <div
            className="h-full rounded-full bg-[var(--tone-solid)]"
            style={{ width: `${(ms / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <h2 className="min-w-0 truncate font-display text-3xl font-extrabold tracking-tight">
          {who}
        </h2>
        <span className="chip tone-white shrink-0 px-3 py-1 text-sm">
          Banked {s.roundBank}
        </span>
      </div>

      {running && s.question ? (
        <QuestionCard question={s.question.q} answer={s.question.a} />
      ) : (
        <div className="inset-well grid h-40 shrink-0 place-items-center text-center">
          <p className="font-display text-3xl font-extrabold text-ink/40">Paused</p>
        </div>
      )}

      <div>
        <ol className="flex gap-1.5" aria-label="Chain">
          {LADDER.map((v, i) => (
            <li
              key={i}
              className={`grid h-9 flex-1 place-items-center rounded-lg border-2 font-display text-sm font-extrabold ${
                i < s.chain
                  ? "border-[#178443] bg-[#25b35f] text-white"
                  : "border-line bg-white text-ink/40"
              }`}
            >
              {v}
            </li>
          ))}
        </ol>
        <p className="mt-2 text-center text-sm text-ink/60">
          In the chain: <strong className="text-ink">{potOf(s.chain)}</strong>
          {" · "}next right answer is worth {nextValue(s.chain)}
        </p>
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={!running}
            onClick={() => {
              play("ding");
              s.correct();
            }}
            className="btn tone-green min-h-16 text-xl"
          >
            Right
          </button>
          <button
            type="button"
            disabled={!running}
            onClick={() => {
              play("tap");
              s.wrong();
            }}
            className="btn tone-red min-h-16 text-xl"
          >
            Wrong
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={!running || s.chain === 0}
            onClick={() => {
              play("success");
              s.bankChain();
            }}
            className="btn tone-yellow"
          >
            Bank {s.chain > 0 ? potOf(s.chain) : ""}
          </button>
          <button
            type="button"
            onClick={running ? s.pauseClock : s.resumeClock}
            className="btn tone-white"
          >
            {running ? "Pause" : "Resume"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function RoundOver() {
  const s = useWeakest();
  const weakest = weakestByStats(s);

  return (
    <div className="flex min-h-[26rem] flex-col gap-5 text-center">
      <div>
        <Eyebrow>Time! Round {s.round} over</Eyebrow>
        <h2 className="mt-2 font-display text-4xl font-extrabold tracking-tight">
          {s.roundBank} banked
        </h2>
      </div>
      <ul className="flex flex-col gap-2 text-left">
        {s.alive.map((id) => {
          const t = s.tally[id] ?? { correct: 0, wrong: 0 };
          return (
            <li key={id} className="brick brick-flat tone-white flex items-center gap-3 px-3 py-2">
              <span className="min-w-0 flex-1 truncate font-bold">{nameOf(s, id)}</span>
              <span className="text-sm text-ink/60">
                {t.correct} right · {t.wrong} wrong
              </span>
            </li>
          );
        })}
      </ul>
      <p className="text-sm text-ink/60">
        The numbers say <strong className="text-ink">{nameOf(s, weakest)}</strong> had
        the toughest round. But you decide.
      </p>
      <button type="button" onClick={s.toVote} className="btn tone-red mt-auto min-h-14 w-full text-lg">
        Time to vote
      </button>
    </div>
  );
}

export function Vote() {
  const s = useWeakest();
  const play = useSound();

  return (
    <div className="flex min-h-[26rem] flex-col gap-5 text-center">
      <div>
        <Eyebrow>The vote</Eyebrow>
        <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight">
          Who is the weakest link?
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink/60">
          Count down from three and everyone points at one player. Tap whoever
          got the most votes. In a tie, the strongest link decides.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {s.alive.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              play("buzzer");
              s.voteOut(id);
            }}
            className="btn tone-white min-h-14"
          >
            <span className="truncate">{nameOf(s, id)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function Final() {
  const s = useWeakest();
  const play = useSound();
  if (!s.final || !s.question) return null;
  const { ids, scores, asked } = s.final;
  const slot = asked % 2;
  const who = nameOf(s, ids[slot]);
  const suddenDeath = asked >= FINAL_QUESTIONS * 2;

  return (
    <div className="flex min-h-[26rem] flex-col gap-5 text-center">
      <div>
        <Eyebrow>{suddenDeath ? "Sudden death" : `Final · question ${Math.floor(asked / 2) + 1} of ${FINAL_QUESTIONS}`}</Eyebrow>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {ids.map((id, i) => (
            <div
              key={id}
              className={`brick brick-flat ${i === slot ? "tone-blue" : "tone-white opacity-70"} px-3 py-2`}
            >
              <p className="truncate text-sm font-bold">{nameOf(s, id)}</p>
              <p className="font-display text-3xl font-extrabold tabular-nums">{scores[i]}</p>
            </div>
          ))}
        </div>
      </div>
      <h2 className="font-display text-2xl font-extrabold tracking-tight">{who}</h2>
      <QuestionCard question={s.question.q} answer={s.question.a} />
      <div className="mt-auto grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => {
            play("ding");
            s.finalAnswer(true);
          }}
          className="btn tone-green min-h-16 text-xl"
        >
          Right
        </button>
        <button
          type="button"
          onClick={() => {
            play("tap");
            s.finalAnswer(false);
          }}
          className="btn tone-red min-h-16 text-xl"
        >
          Wrong
        </button>
      </div>
    </div>
  );
}
