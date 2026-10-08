"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import { useGameTimer } from "@/lib/useGameTimer";

import { fitWordClass } from "@/lib/fitText";
import { sfx } from "@/lib/sfx";
import { categoryMeta, type WordCard } from "@/lib/words/deck";
import { CUSTOM_CATEGORY_ID } from "@/lib/words/pictionary";
import {
  currentDrawer,
  currentTeam,
  pickingTeam,
  stealCandidates,
  usePictionary,
} from "@/store/pictionaryStore";
import Character from "../Character";
import { HandTransition, handCardVariants } from "../HandTransition";
import { ShuffleIcon } from "../Icons";

function useSound() {
  const muted = usePictionary((s) => s.muted);
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
  const s = usePictionary();
  const team = currentTeam(s);
  const picker = pickingTeam(s);
  const drawer = currentDrawer(s);
  const play = useSound();
  const opponentsPick = s.settings.picker === "opponents";

  return (
    <div className="flex min-h-[26rem] flex-col items-center justify-between gap-6 text-center">
      <div className="flex flex-col items-center">
        <Eyebrow>
          Turn {s.turn + 1} of {s.teams.length * s.settings.turnsPerTeam}
        </Eyebrow>
        <Character
          kind={opponentsPick ? "fibber" : "artist"}
          tone={picker.tone}
          className="mt-4 h-36 w-32 animate-bob"
        />
        {opponentsPick ? (
          <>
            <h2 className="mt-4 font-display text-[clamp(2rem,9vw,3rem)] font-extrabold leading-none tracking-tight">
              {picker.name}
            </h2>
            <p className="mt-3 max-w-xs text-lg text-ink/75">
              Choose a word for{" "}
              <strong className="text-ink">{team.name}</strong> to draw
              {drawer && (
                <>
                  {" "}
                  (drawer: <strong className="text-ink">{drawer}</strong>)
                </>
              )}
              .
            </p>
            <p className="mt-2 max-w-xs text-sm text-ink/55">
              Huddle up and keep the screen away from {team.name}.
            </p>
          </>
        ) : (
          <>
            <h2 className="mt-4 font-display text-[clamp(2rem,9vw,3rem)] font-extrabold leading-none tracking-tight">
              {team.name}
            </h2>
            <p className="mt-3 max-w-xs text-lg text-ink/75">
              {drawer ? (
                <>
                  <strong className="text-ink">{drawer}</strong>, you&apos;re
                  drawing!
                </>
              ) : (
                "Pick someone from your team to draw."
              )}
            </p>
            <p className="mt-2 max-w-xs text-sm text-ink/55">
              Hand them the phone. Everyone else, eyes off the screen.
            </p>
          </>
        )}
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
        {opponentsPick
          ? "We're picking, show the words"
          : "I'm the drawer, show my words"}
      </button>
    </div>
  );
}

// ------------------------------------------------------------------ choose

function WordOption({
  card,
  cta,
  onPick,
}: {
  card: WordCard;
  cta: string;
  onPick: () => void;
}) {
  const theme = usePictionary((s) => s.theme);
  const meta = categoryMeta(card.categoryId, theme?.name);
  const dots = { easy: 1, medium: 2, hard: 3, theme: 0, custom: 0 }[
    card.difficulty
  ];

  return (
    <motion.button
      variants={handCardVariants}
      type="button"
      onClick={onPick}
      className={`brick brick-flat brick-press tone-${meta.tone} flex w-full items-center gap-3 px-4 py-4 text-left`}
    >
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[1.6rem] font-extrabold leading-tight tracking-tight">
          {card.word}
        </span>
        <span className="mt-1 flex items-center gap-2 text-xs font-bold text-ink/55">
          {meta.label}
          {dots > 0 && (
            <span className="flex gap-0.5" aria-label={card.difficulty}>
              {[1, 2, 3].map((d) => (
                <span
                  key={d}
                  className={`h-1.5 w-1.5 rounded-full ${d <= dots ? "bg-ink/60" : "bg-ink/15"}`}
                />
              ))}
            </span>
          )}
        </span>
      </span>
      <span className="btn btn-sm tone-white pointer-events-none shrink-0">
        {cta}
      </span>
    </motion.button>
  );
}

function WriteYourOwn({ tone }: { tone: string }) {
  const writeWord = usePictionary((s) => s.writeWord);
  const opponentsPick = usePictionary((s) => s.settings.picker === "opponents");
  const [text, setText] = useState("");

  return (
    <form
      className="inset-well p-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (text.trim()) writeWord(text);
      }}
    >
      <label htmlFor="custom-word" className="mb-2 block text-sm font-bold">
        Or write your own
      </label>
      <div className="flex gap-2">
        <input
          id="custom-word"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={opponentsPick ? "Something evil…" : "Anything you like…"}
          maxLength={40}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="field min-h-11"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className={`btn btn-sm tone-${tone} min-h-11 shrink-0`}
        >
          {opponentsPick ? "Give it" : "Use it"}
        </button>
      </div>
    </form>
  );
}

export function Choose() {
  const s = usePictionary();
  const play = useSound();
  const [shuffles, setShuffles] = useState(0);
  const team = currentTeam(s);
  const picker = pickingTeam(s);
  const opponentsPick = s.settings.picker === "opponents";

  return (
    <div className="flex min-h-[26rem] flex-col gap-5">
      <div>
        <Eyebrow>
          {opponentsPick ? `${picker.name} only 🤫` : "Drawer only 🤫"}
        </Eyebrow>
        <h2 className="mt-1 font-display text-3xl font-extrabold tracking-tight">
          {opponentsPick ? `Pick a word for ${team.name}` : "Pick your word"}
        </h2>
        <p className="mt-1 text-sm text-ink/60">
          {opponentsPick
            ? "Make it tricky, but drawable. Skipped words go back in the deck."
            : "Only the word you pick counts as played. Skipped words go back in the deck."}
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
            cta={opponentsPick ? "Give this" : "Draw this"}
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
        Show different words
        {shuffles > 0 && <span className="text-ink/45">· {shuffles}</span>}
      </button>

      <WriteYourOwn tone={picker.tone} />
    </div>
  );
}

// ------------------------------------------------------------------ pass

export function Pass() {
  const s = usePictionary();
  const team = currentTeam(s);
  const picker = pickingTeam(s);
  const drawer = currentDrawer(s);
  const play = useSound();

  return (
    <div className="flex min-h-[26rem] flex-col items-center justify-between gap-6 text-center">
      <div className="flex flex-col items-center">
        <Eyebrow>Word locked in 🔒</Eyebrow>
        <Character
          kind="artist"
          tone={team.tone}
          className="mt-4 h-36 w-32 animate-bob"
        />
        <h2 className="mt-4 font-display text-[clamp(1.8rem,8vw,2.6rem)] font-extrabold leading-tight tracking-tight">
          Hand the phone to {drawer ?? team.name}
        </h2>
        <p className="mt-3 max-w-xs text-ink/65">
          {drawer
            ? `${drawer} from ${team.name} is drawing.`
            : `${team.name}, pick who's drawing.`}{" "}
          Only the drawer looks at the next screen.
        </p>
      </div>
      <div className="flex w-full flex-col gap-3">
        <button
          type="button"
          onClick={() => {
            play("tap");
            s.showWordToDrawer();
          }}
          className={`btn tone-${team.tone} min-h-14 w-full text-lg`}
        >
          I&apos;m drawing, show me the word
        </button>
        <button
          type="button"
          onClick={s.backToHand}
          className="self-center text-sm font-bold text-ink/60 underline underline-offset-4"
        >
          {picker.name}: change the word
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ ready

export function Ready() {
  const s = usePictionary();
  const team = currentTeam(s);
  const picker = pickingTeam(s);
  const play = useSound();
  const opponentsPick = s.settings.picker === "opponents";
  if (!s.word) return null;

  return (
    <div className="flex min-h-[26rem] flex-col gap-6">
      <div>
        <Eyebrow>
          {opponentsPick
            ? `Your word, courtesy of ${picker.name}`
            : "Your word"}
        </Eyebrow>
        <p className="mt-1 text-sm text-ink/60">
          Memorise it, grab the pen, and start the clock when you&apos;re set.
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

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => {
            play("tap");
            s.startClock();
          }}
          className={`btn tone-${team.tone} min-h-14 w-full text-lg`}
        >
          Start the clock · {s.settings.roundSeconds}s
        </button>
        {!opponentsPick && (
          <button
            type="button"
            onClick={s.backToHand}
            className="self-center text-sm font-bold text-ink/60 underline underline-offset-4"
          >
            Wait, pick a different word
          </button>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ drawing

export function Drawing() {
  const s = usePictionary();
  const team = currentTeam(s);
  const play = useSound();
  const { ms, running } = useGameTimer(s.timer);
  const [peek, setPeek] = useState(false);
  const lastTick = useRef<number | null>(null);

  const total = s.settings.roundSeconds * 1000;
  const seconds = Math.ceil(ms / 1000);
  const urgent = seconds <= 10;

  useEffect(() => {
    if (!running) return;
    if (ms <= 0) {
      play("buzzer");
      s.endTurn("timeout");
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
    <div className="flex min-h-[26rem] flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <Eyebrow>{team.name} drawing</Eyebrow>
        <button
          type="button"
          onPointerDown={() => setPeek(true)}
          onPointerUp={() => setPeek(false)}
          onPointerLeave={() => setPeek(false)}
          onPointerCancel={() => setPeek(false)}
          onContextMenu={(e) => e.preventDefault()}
          className="keycap tone-white h-10 select-none px-3 text-sm [-webkit-touch-callout:none]"
        >
          {peek ? s.word?.word : "Hold to peek"}
        </button>
      </div>

      <div
        className={`inset-well px-4 pb-5 pt-4 text-center ${urgent && running ? "animate-wobble" : ""}`}
      >
        <div
          role="timer"
          className={`inline-flex items-baseline justify-center font-display text-[clamp(5rem,30vw,9rem)] font-extrabold leading-none tabular-nums tracking-[0.06em] transition-colors ${
            urgent ? "text-[#e2412d]" : ""
          }`}
        >
          <span>{mm}</span>
          <span className="mx-2">:</span>
          <span>{ss}</span>
        </div>
        <div className="mt-4 h-3.5 overflow-hidden rounded-full bg-black/5">
          <div
            className="h-full rounded-full bg-[var(--tone-solid)]"
            style={{ width: `${(ms / total) * 100}%` }}
          />
        </div>
        {!running && <p className="mt-3 font-bold text-ink/60">Paused</p>}
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <button
          type="button"
          onClick={() => {
            play("success");
            s.endTurn("guessed");
          }}
          className="btn tone-green min-h-16 w-full text-xl"
        >
          They got it!
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={running ? s.pauseClock : s.resumeClock}
            className="btn tone-white"
          >
            {running ? "Pause" : "Resume"}
          </button>
          <button
            type="button"
            onClick={() => s.endTurn("passed")}
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
  const s = usePictionary();
  const team = currentTeam(s);
  const play = useSound();
  const others = stealCandidates(s);
  const guessed = s.outcome === "guessed";
  const askSteal = !guessed && others.length > 0;
  const answered = !askSteal || s.stolenBy !== undefined;
  const stealer = others.find((t) => t.id === s.stolenBy);
  const isLastTurn = s.turn + 1 >= s.teams.length * s.settings.turnsPerTeam;
  const secondsLeft = Math.ceil(s.timer.remainingMs / 1000);

  return (
    <div className="flex min-h-[26rem] flex-col gap-5 text-center">
      <div className="flex flex-col items-center">
        <Character
          kind={guessed ? "actor" : "hotseat"}
          tone={guessed ? team.tone : (stealer?.tone ?? "white")}
          className="h-28 w-24"
        />
        <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight">
          {guessed
            ? "Nailed it!"
            : s.outcome === "timeout"
              ? "Time's up!"
              : "Passed"}
        </h2>
        <p className="mt-1 text-ink/65">
          The word was{" "}
          <strong className="font-display text-xl text-ink">
            {s.word?.word}
          </strong>
        </p>
        {s.word?.categoryId === CUSTOM_CATEGORY_ID && (
          <p className="mt-1 text-sm text-ink/50">
            Written by {pickingTeam(s).name}
          </p>
        )}
        {guessed && secondsLeft > 0 && (
          <p className="mt-1 text-sm text-ink/50">
            with {secondsLeft}s to spare
          </p>
        )}
      </div>

      {guessed ? (
        <p className={`tone-${team.tone} chip mx-auto px-4 py-1.5 text-base`}>
          +1 for {team.name}
        </p>
      ) : askSteal ? (
        <div>
          <p className="mb-3 font-bold">Did another team steal it?</p>
          <div className="flex flex-wrap justify-center gap-2">
            {others.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={s.stolenBy === t.id}
                onClick={() => {
                  play("success");
                  s.setStolenBy(t.id);
                }}
                className={`keycap tone-${t.tone} h-11 px-4 text-sm`}
              >
                <span className="h-3 w-3 rounded-full border-2 border-[var(--tone-edge)] bg-[var(--tone-solid)]" />
                {t.name}
              </button>
            ))}
            <button
              type="button"
              aria-pressed={s.stolenBy === null}
              onClick={() => s.setStolenBy(null)}
              className="keycap tone-white h-11 px-4 text-sm"
            >
              Nobody
            </button>
          </div>
        </div>
      ) : (
        <p className="text-ink/60">No points this turn.</p>
      )}

      <div className="mt-auto flex flex-col gap-3">
        <button
          type="button"
          disabled={!answered}
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
          onClick={() => s.setOutcome(guessed ? "passed" : "guessed")}
          className="self-center text-sm font-bold text-ink/55 underline underline-offset-4"
        >
          {guessed
            ? "Oops, they didn't get it"
            : `Actually, ${team.name} got it`}
        </button>
      </div>
    </div>
  );
}
