"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import { categoryMeta, type CharadesCard } from "@/lib/charades/words";
import { fitWordClass } from "@/lib/fitText";
import { sfx } from "@/lib/sfx";
import {
  currentActor,
  currentTeam,
  elapsedMs,
  pickingTeam,
  totalTurns,
  useDumbCharades,
} from "@/store/dumbCharadesStore";
import Character from "../Character";
import { HandTransition, handCardVariants } from "../HandTransition";
import { ShuffleIcon } from "../Icons";

function useSound() {
  const muted = useDumbCharades((s) => s.muted);
  return (name: keyof typeof sfx) => {
    if (!muted) sfx[name]();
  };
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/55">{children}</p>
  );
}

function formatTime(ms: number) {
  const total = Math.floor(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

/** The classic hand signals, so everyone acts the same language. */
const SIGNALS: Array<[string, string]> = [
  ["Movie", "Crank an old film camera beside your eye."],
  ["Song", "Pretend to sing, a hand cupped by your mouth."],
  ["TV show", "Draw a rectangle in the air, like a screen."],
  ["Number of words", "Hold up that many fingers."],
  ["Which word", "Hold up its number in fingers, then act it."],
  ["Syllables", "Tap that many fingers on your forearm."],
  ["Sounds like", "Tug your ear."],
  ["Tiny word (a, the, of)", "Pinch your thumb and finger together."],
  ["Longer or shorter", "Pull your hands apart, or push them together."],
  ["Right track", "Point at the guesser and wave them on."],
];

export function SignalsSheet() {
  return (
    <details className="inset-well group p-4 text-left">
      <summary className="cursor-pointer list-none font-bold [&::-webkit-details-marker]:hidden">
        <span className="inline-block transition-transform group-open:rotate-90">▸</span> Signals
        cheat sheet
      </summary>
      <dl className="mt-3 grid gap-x-3 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
        {SIGNALS.map(([name, how]) => (
          <div key={name} className="contents">
            <dt className="font-bold">{name}</dt>
            <dd className="mb-1 text-ink/65 sm:mb-0">{how}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

// ------------------------------------------------------------------ handoff

export function Handoff() {
  const s = useDumbCharades();
  const team = currentTeam(s);
  const picker = pickingTeam(s);
  const actor = currentActor(s);
  const play = useSound();

  return (
    <div className="flex min-h-[26rem] flex-col items-center justify-between gap-6 text-center">
      <div className="flex flex-col items-center">
        <Eyebrow>
          Turn {s.turn + 1} of {totalTurns(s)}
        </Eyebrow>
        <Character kind="mimer" tone={picker.tone} className="mt-4 h-32 w-28 animate-bob" />
        <h2 className="mt-4 font-display text-[clamp(2rem,9vw,3rem)] font-extrabold leading-none tracking-tight">
          {picker.name}
        </h2>
        <p className="mt-3 max-w-xs text-lg text-ink/75">
          Choose a movie for <strong className="text-ink">{team.name}</strong> to act
          {actor && (
            <>
              {" "}
              (actor: <strong className="text-ink">{actor}</strong>)
            </>
          )}
          .
        </p>
        <p className="mt-2 max-w-xs text-sm text-ink/55">
          Huddle up and keep the screen away from {team.name}.
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          sfx.unlock();
          play("tap");
          s.revealHand();
        }}
        className={`btn tone-${picker.tone} min-h-14 w-full text-lg`}
      >
        We&apos;re picking, show the titles
      </button>
    </div>
  );
}

// ------------------------------------------------------------------ choose

function WordOption({ card, onPick }: { card: CharadesCard; onPick: () => void }) {
  const meta = categoryMeta(card.categoryId);
  const dots = { easy: 1, medium: 2, hard: 3, custom: 0 }[card.level];

  return (
    <motion.button
      variants={handCardVariants}
      type="button"
      onClick={onPick}
      className={`brick brick-flat brick-press tone-${meta.tone} flex w-full items-center gap-3 px-4 py-4 text-left`}
    >
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[1.5rem] font-extrabold leading-tight tracking-tight">
          {card.word}
        </span>
        <span className="mt-1 flex items-center gap-2 text-xs font-bold text-ink/55">
          {meta.label}
          {dots > 0 && (
            <span className="flex gap-0.5" aria-label={card.level}>
              {[1, 2, 3].map((d) => (
                <span key={d} className={`h-1.5 w-1.5 rounded-full ${d <= dots ? "bg-ink/60" : "bg-ink/15"}`} />
              ))}
            </span>
          )}
        </span>
      </span>
      <span className="btn btn-sm tone-white pointer-events-none shrink-0">Give this</span>
    </motion.button>
  );
}

function WriteYourOwn({ tone }: { tone: string }) {
  const writeWord = useDumbCharades((s) => s.writeWord);
  const [text, setText] = useState("");

  return (
    <form
      className="inset-well p-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (text.trim()) writeWord(text);
      }}
    >
      <label htmlFor="written-title" className="mb-2 block text-sm font-bold">
        Or write your own
      </label>
      <div className="flex gap-2">
        <input
          id="written-title"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Something tricky…"
          maxLength={50}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="field min-h-11"
        />
        <button type="submit" disabled={!text.trim()} className={`btn btn-sm tone-${tone} min-h-11 shrink-0`}>
          Give it
        </button>
      </div>
    </form>
  );
}

export function Choose() {
  const s = useDumbCharades();
  const play = useSound();
  const [shuffles, setShuffles] = useState(0);
  const team = currentTeam(s);
  const picker = pickingTeam(s);

  return (
    <div className="flex min-h-[26rem] flex-col gap-5">
      <div>
        <Eyebrow>{picker.name} only 🤫</Eyebrow>
        <h2 className="mt-1 font-display text-3xl font-extrabold tracking-tight">
          Pick a movie for {team.name}
        </h2>
        <p className="mt-1 text-sm text-ink/60">
          Make it tricky, but actable. Skipped titles go back in the deck.
        </p>
      </div>

      {s.notice && (
        <p className="inset-well px-3 py-2 text-sm font-semibold">
          {s.notice}{" "}
          <button type="button" onClick={s.dismissNotice} className="underline">
            OK
          </button>
        </p>
      )}

      <HandTransition
        handKey={s.hand.map((c) => c.word).join("|")}
        className="flex flex-col gap-4"
      >
        {s.hand.map((card) => (
          <WordOption
            key={card.word}
            card={card}
            onPick={() => {
              play("tap");
              s.chooseWord(card);
            }}
          />
        ))}
      </HandTransition>

      <button
        type="button"
        onClick={() => {
          play("tap");
          setShuffles((n) => n + 1);
          s.shuffleHand();
        }}
        className="btn tone-white w-full"
      >
        <ShuffleIcon width={18} height={18} />
        Show different titles
        {shuffles > 0 && <span className="text-ink/45">· {shuffles}</span>}
      </button>

      <WriteYourOwn tone={picker.tone} />
    </div>
  );
}

// ------------------------------------------------------------------ pass

export function Pass() {
  const s = useDumbCharades();
  const team = currentTeam(s);
  const picker = pickingTeam(s);
  const actor = currentActor(s);
  const play = useSound();

  return (
    <div className="flex min-h-[26rem] flex-col items-center justify-between gap-6 text-center">
      <div className="flex flex-col items-center">
        <Eyebrow>Movie locked in 🔒</Eyebrow>
        <Character kind="mimer" tone={team.tone} className="mt-4 h-32 w-28 animate-bob" />
        <h2 className="mt-4 font-display text-[clamp(1.8rem,8vw,2.6rem)] font-extrabold leading-tight tracking-tight">
          Hand the phone to {actor ?? team.name}
        </h2>
        <p className="mt-3 max-w-xs text-ink/65">
          {actor ? `${actor} from ${team.name} is acting.` : `${team.name}, pick who's acting.`}{" "}
          Only the actor looks at the next screen.
        </p>
      </div>
      <div className="flex w-full flex-col gap-3">
        <button
          type="button"
          onClick={() => {
            play("tap");
            s.showWordToActor();
          }}
          className={`btn tone-${team.tone} min-h-14 w-full text-lg`}
        >
          I&apos;m acting, show me the movie
        </button>
        <button
          type="button"
          onClick={s.backToHand}
          className="self-center text-sm font-bold text-ink/60 underline underline-offset-4"
        >
          {picker.name}: change the movie
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ ready

export function Ready() {
  const s = useDumbCharades();
  const team = currentTeam(s);
  const picker = pickingTeam(s);
  const play = useSound();
  if (!s.word) return null;

  return (
    <div className="flex min-h-[26rem] flex-col gap-5">
      <div>
        <Eyebrow>Your movie, courtesy of {picker.name}</Eyebrow>
        <p className="mt-1 text-sm text-ink/60">
          Memorise it. When your team is watching, start the stopwatch and act it out.
        </p>
      </div>

      <div className="inset-well grid h-60 shrink-0 place-items-center overflow-hidden px-4 py-8 text-center">
        <motion.p
          initial={{ scale: 0.8, rotate: -4, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 16 }}
          className={`break-words font-display ${fitWordClass(s.word.word)} font-extrabold leading-none tracking-tight [overflow-wrap:anywhere]`}
        >
          {s.word.word}
        </motion.p>
      </div>

      <SignalsSheet />

      <button
        type="button"
        onClick={() => {
          play("tap");
          s.startClock();
        }}
        className={`btn tone-${team.tone} min-h-14 w-full text-lg`}
      >
        Start acting
      </button>
    </div>
  );
}

// ------------------------------------------------------------------ acting

/** Elapsed time of the stopwatch, ticking while it runs. */
function useElapsed() {
  const clock = useDumbCharades((s) => s.clock);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (clock.startedAt === null) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [clock.startedAt]);

  return { ms: elapsedMs(clock, now), running: clock.startedAt !== null };
}

export function Acting() {
  const s = useDumbCharades();
  const team = currentTeam(s);
  const play = useSound();
  const { ms, running } = useElapsed();
  const [peek, setPeek] = useState(false);
  const nudged = useRef(false);

  const nudgeMs = s.settings.nudgeMinutes === null ? null : s.settings.nudgeMinutes * 60_000;
  const showNudge = nudgeMs !== null && ms >= nudgeMs;

  useEffect(() => {
    if (showNudge && !nudged.current) {
      nudged.current = true;
      play("ding");
    }
  }, [showNudge, play]);

  return (
    <div className="flex min-h-[28rem] flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <Eyebrow>{team.name} guessing</Eyebrow>
        <button
          type="button"
          onPointerDown={() => setPeek(true)}
          onPointerUp={() => setPeek(false)}
          onPointerLeave={() => setPeek(false)}
          onPointerCancel={() => setPeek(false)}
          onContextMenu={(e) => e.preventDefault()}
          className="keycap tone-white h-10 max-w-[60%] select-none px-3 text-sm [-webkit-touch-callout:none]"
        >
          <span className="truncate">{peek ? s.word?.word : "Hold to peek"}</span>
        </button>
      </div>

      <div className="inset-well px-4 py-6 text-center">
        <div
          role="timer"
          aria-label="Time acting"
          className="font-display text-[clamp(4.5rem,24vw,7.5rem)] font-extrabold leading-none tabular-nums tracking-tighter"
        >
          {formatTime(ms)}
        </div>
        <p className="mt-2 text-sm text-ink/55">
          {running ? "No clock to beat. Take your time." : "Paused"}
        </p>
      </div>

      {showNudge && (
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="inset-well px-3 py-2 text-center text-sm font-semibold"
        >
          It&apos;s been {s.settings.nudgeMinutes} minutes. Keep going, or give up?
        </motion.p>
      )}

      <div className="mt-auto flex flex-col gap-3">
        <button
          type="button"
          onClick={() => {
            play("success");
            s.finish("guessed");
          }}
          className="btn tone-green min-h-16 w-full text-xl"
        >
          They got it!
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={running ? s.pauseClock : s.resumeClock} className="btn tone-white">
            {running ? "Pause" : "Resume"}
          </button>
          <button
            type="button"
            onClick={() => {
              play("tap");
              s.finish("gaveup");
            }}
            className="btn tone-white"
          >
            Give up
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ result

export function Result() {
  const s = useDumbCharades();
  const team = currentTeam(s);
  const picker = pickingTeam(s);
  const play = useSound();
  const guessed = s.outcome === "guessed";
  const time = formatTime(s.clock.elapsedMs);
  const winnerId = guessed ? team.id : s.settings.stumpPoint ? picker.id : null;
  const winner = s.teams.find((t) => t.id === winnerId);
  const isLastTurn = s.turn + 1 >= totalTurns(s);

  return (
    <div className="flex min-h-[26rem] flex-col gap-5 text-center">
      <div className="flex flex-col items-center">
        <Character
          kind={guessed ? "mimer" : "hotseat"}
          tone={winner?.tone ?? "white"}
          className="h-28 w-24"
        />
        <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight">
          {guessed ? "Got it!" : "Stumped!"}
        </h2>
        <p className="mt-1 text-ink/65">
          The movie was{" "}
          <strong className="font-display text-xl text-ink">{s.word?.word}</strong>
        </p>
        <p className="mt-1 text-sm text-ink/50">
          {guessed ? `Guessed in ${time}` : `${team.name} gave up after ${time}`}
        </p>
      </div>

      {winner ? (
        <p className={`tone-${winner.tone} chip mx-auto px-4 py-1.5 text-base`}>
          +1 for {winner.name}
        </p>
      ) : (
        <p className="text-ink/60">No points this turn.</p>
      )}

      <div className="mt-auto flex flex-col gap-3">
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
        <button
          type="button"
          onClick={() => s.setOutcome(guessed ? "gaveup" : "guessed")}
          className="self-center text-sm font-bold text-ink/55 underline underline-offset-4"
        >
          {guessed ? "Oops, they didn't get it" : `Actually, ${team.name} got it`}
        </button>
      </div>
    </div>
  );
}
