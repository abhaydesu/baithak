"use client";

import { useEffect, useState } from "react";

import { BRAND } from "@/lib/gameArt";
import { sfx } from "@/lib/sfx";
import GameGlyph from "../GameGlyph";
import { Btn, Card, Eyebrow, play } from "./bits";

/**
 * The playable mini-games inside the hero phone: the deep ones (Imposter,
 * Top 9, Pictionary) and the two that need their own rules (Pass the Bomb,
 * Two Truths & a Lie). Real words and prompts from the games.
 */

// ------------------------------------------------------------------ imposter

const PLAYERS = ["Asha", "Ravi", "Meera", "Kabir"];
const WORDS = [
  { word: "Biryani", hint: "Rice" },
  { word: "Golgappe", hint: "Water" },
  { word: "Mehendi", hint: "Hands" },
  { word: "Patakhe", hint: "Noise" },
  { word: "Parle-G", hint: "Biscuit" },
];

function newDeal() {
  return {
    word: WORDS[Math.floor(Math.random() * WORDS.length)],
    imposter: Math.floor(Math.random() * PLAYERS.length),
  };
}

export function ImposterDemo() {
  // The first deal is fixed so server and client render the same thing.
  const [deal, setDeal] = useState({ word: WORDS[0], imposter: 2 });
  const [turn, setTurn] = useState(0);
  const [shown, setShown] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [voted, setVoted] = useState<number | null>(null);

  const restart = () => {
    setDeal(newDeal());
    setTurn(0);
    setShown(false);
    setPicked(null);
    setVoted(null);
  };

  // Everyone has seen their card: vote, then the verdict.
  if (turn >= PLAYERS.length) {
    if (voted !== null) {
      const caught = voted === deal.imposter;
      return (
        <div className="flex h-full flex-col items-center justify-between gap-2 text-center">
          <div className="flex flex-col items-center">
            <GameGlyph kind="card" className="h-16 w-16" />
            <p className="mt-1 font-display text-[1.1rem] font-extrabold leading-tight">
              {caught ? `${PLAYERS[voted]} was the imposter!` : `${PLAYERS[voted]} was innocent.`}
            </p>
            <p className="mt-1 text-[0.66rem] opacity-80">
              {caught
                ? `The word was ${deal.word.word}.`
                : `${PLAYERS[deal.imposter]} gets away with it.`}
            </p>
          </div>
          <Btn onClick={restart}>Deal again</Btn>
        </div>
      );
    }
    return (
      <div className="flex h-full flex-col gap-2">
        <div className="text-center">
          <Eyebrow>Point on three</Eyebrow>
          <p className="mt-0.5 font-display text-[1rem] font-extrabold">Who&apos;s the imposter?</p>
        </div>
        <div className="grid flex-1 grid-cols-2 content-center gap-1.5">
          {PLAYERS.map((p, i) => (
            <button
              key={p}
              type="button"
              aria-pressed={picked === i}
              onClick={() => {
                play("tap");
                setPicked(i);
              }}
              className="h-10 rounded-full bg-white/20 font-display text-[0.78rem] font-bold transition-colors aria-pressed:bg-white aria-pressed:text-ink"
            >
              {p}
            </button>
          ))}
        </div>
        <Btn
          onClick={() => {
            if (picked === null) return;
            play(picked === deal.imposter ? "ding" : "buzzer");
            setVoted(picked);
          }}
        >
          {picked === null ? "Tap a player" : `Vote out ${PLAYERS[picked]}`}
        </Btn>
      </div>
    );
  }

  const isImposter = turn === deal.imposter;
  const next = PLAYERS[turn + 1];

  // Pass screen
  if (!shown) {
    return (
      <div className="flex h-full flex-col items-center justify-between gap-2 text-center">
        <Eyebrow>
          Card {turn + 1} of {PLAYERS.length}
        </Eyebrow>
        <div className="flex flex-col items-center">
          <GameGlyph kind="card" className="mb-1 h-20 w-20" />
          <p className="text-[0.72rem] opacity-80">Pass the phone to</p>
          <p className="font-display text-[2.4rem] font-extrabold leading-none">{PLAYERS[turn]}</p>
          <p className="mt-2 text-[0.6rem] opacity-70">Everyone else, eyes off.</p>
        </div>
        <Btn
          onClick={() => {
            play("tap");
            setShown(true);
          }}
        >
          I&apos;m {PLAYERS[turn]}, show my card
        </Btn>
      </div>
    );
  }

  // The card
  return (
    <div className="flex h-full flex-col gap-2">
      <Eyebrow>{PLAYERS[turn]} only 🤫</Eyebrow>
      <Card className="flex flex-1 flex-col items-center justify-center px-2 text-center">
        {isImposter ? (
          <>
            <p className="text-[0.56rem] font-bold uppercase tracking-[0.16em] text-ink-soft">You are the</p>
            <p className="font-display text-[1.6rem] font-extrabold leading-none text-rani">Imposter</p>
            <p className="mt-2 text-[0.7rem]">
              Hint: <strong>{deal.word.hint}</strong>
            </p>
          </>
        ) : (
          <>
            <p className="text-[0.56rem] font-bold uppercase tracking-[0.16em] text-ink-soft">The secret word is</p>
            <p className="mt-1 font-display text-[1.6rem] font-extrabold leading-none">{deal.word.word}</p>
          </>
        )}
      </Card>
      <Btn
        onClick={() => {
          play("tap");
          setShown(false);
          setTurn((t) => t + 1);
        }}
      >
        {next ? `Got it. Hide & pass to ${next}` : "Got it. Hide my card"}
      </Btn>
    </div>
  );
}

// ------------------------------------------------------------------ top 9

const BOARDS = [
  {
    q: "Name something Indian moms always say.",
    answers: [
      ["Eat something", 22],
      ["Wear a sweater", 14],
      ["Sharma ji's son", 13],
      ["Put your phone down", 12],
      ["I'm not your servant", 9],
      ["Go to sleep", 8],
    ],
  },
  {
    q: "Name a question aunties always ask at family functions.",
    answers: [
      ["When are you getting married?", 38],
      ["What are your marks?", 14],
      ["How much do you earn?", 12],
      ["Have you gained weight?", 10],
      ["When is the good news?", 8],
      ["What are you doing these days?", 6],
    ],
  },
] as const;

export function Top9Demo() {
  const [board, setBoard] = useState(0);
  const [open, setOpen] = useState<number[]>([]);
  const { q, answers } = BOARDS[board];
  const pot = open.reduce((n, i) => n + answers[i][1], 0);
  const cleared = open.length === answers.length;

  return (
    <div className="flex h-full flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Eyebrow>Host: tap to reveal</Eyebrow>
        <span className="rounded-full bg-ink px-1.5 py-0.5 text-[0.56rem] font-bold text-white">Pot {pot}</span>
      </div>
      <p className="font-display text-[0.82rem] font-extrabold leading-snug">{q}</p>
      {/* Hidden answers are dark tiles, like the Top 9 icon; revealed ones turn white */}
      <ol className="flex flex-col gap-1">
        {answers.map(([answer, points], i) => {
          const shown = open.includes(i);
          return (
            <li key={answer}>
              <button
                type="button"
                disabled={shown}
                onClick={() => {
                  play("ding");
                  setOpen((o) => [...o, i]);
                }}
                className={`flex min-h-7 w-full items-center gap-1.5 rounded-[0.55rem] px-1.5 py-0.5 text-left transition-colors disabled:cursor-default ${
                  shown ? "bg-white text-ink" : "bg-ink text-white hover:bg-ink/85"
                }`}
              >
                <span
                  className={`grid h-4.5 w-4.5 shrink-0 place-items-center rounded-[0.3rem] font-display text-[0.55rem] font-extrabold ${
                    shown ? "bg-marigold text-ink" : "bg-white/15"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-[0.6rem] font-bold">{shown ? answer : ""}</span>
                {shown && (
                  <span className="font-display text-[0.66rem] font-extrabold tabular-nums">{points}</span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
      <div className="mt-auto">
        <Btn
          onClick={() => {
            play("tap");
            setBoard((b) => (b + 1) % BOARDS.length);
            setOpen([]);
          }}
        >
          {cleared ? "Board cleared! Next one" : "Skip question"}
        </Btn>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ pictionary

const DRAW = ["Auto rickshaw", "Diya", "Kite", "Samosa", "Rangoli", "Lassi", "Chai"];
const ROUND = 30;

export function PictionaryDemo() {
  const [index, setIndex] = useState(0);
  const [left, setLeft] = useState(ROUND);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);

  // One second at a time while the clock runs.
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  // Ticks near the end, the buzzer at zero.
  useEffect(() => {
    if (!running) return;
    if (left === 0) {
      sfx.buzzer();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRunning(false);
    } else if (left <= 5) {
      sfx.tick();
    }
  }, [left, running]);

  const nextWord = () => setIndex((i) => (i + 1) % DRAW.length);
  const urgent = running && left <= 5;

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <Eyebrow>Blue Whales · {score}</Eyebrow>
        <PeekButton word={DRAW[index]} />
      </div>
      <div className="px-1 pt-1 text-center">
        <p
          className="font-display text-[2.8rem] font-extrabold leading-none tabular-nums"
          style={{ color: urgent ? BRAND.rani : "#ffffff" }}
        >
          0:{String(left).padStart(2, "0")}
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full"
            style={{ width: `${(left / ROUND) * 100}%`, background: BRAND.marigold, transition: "width 1s linear" }}
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <GameGlyph kind="pencil" className="h-16 w-16" />
        <p className="mt-1 text-[0.62rem] font-semibold opacity-70">
          {running ? "Draw it! No letters, no talking." : "Hold to peek at your word."}
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        {running ? (
          <>
            <Btn
              color={BRAND.marigold}
              onClick={() => {
                play("success");
                setScore((s) => s + 1);
                nextWord();
              }}
            >
              They got it!
            </Btn>
            <div className="grid grid-cols-2 gap-1.5">
              <Btn onClick={() => setRunning(false)}>Pause</Btn>
              <Btn
                onClick={() => {
                  play("tap");
                  nextWord();
                }}
              >
                Give up
              </Btn>
            </div>
          </>
        ) : (
          <Btn
            color={BRAND.marigold}
            onClick={() => {
              play("tap");
              if (left === 0) setLeft(ROUND);
              setRunning(true);
            }}
          >
            {left === 0 ? "Time! Go again" : left < ROUND ? "Resume" : "Start the clock"}
          </Btn>
        )}
      </div>
    </div>
  );
}

/** Hold to see the word, like the real drawing screen. */
function PeekButton({ word }: { word: string }) {
  const [peek, setPeek] = useState(false);
  return (
    <button
      type="button"
      onPointerDown={() => setPeek(true)}
      onPointerUp={() => setPeek(false)}
      onPointerLeave={() => setPeek(false)}
      onPointerCancel={() => setPeek(false)}
      onContextMenu={(e) => e.preventDefault()}
      className="h-6 select-none rounded-full bg-white/15 px-2 text-[0.58rem] font-semibold [-webkit-touch-callout:none]"
    >
      {peek ? word : "Hold to peek"}
    </button>
  );
}

// ------------------------------------------------------------------ pass the bomb

const BOMB_PROMPTS = [
  "Name an Indian street food",
  "Name a Bollywood actor",
  "Name a cricketer",
  "Name an Indian sweet",
  "Name a Bollywood actress",
];
const PASSERS = ["Asha", "Ravi", "Meera", "Kabir"];

export function BombDemo() {
  // The fuse is hidden: it goes off after 3 to 5 passes. Fixed first time
  // round so server and client agree.
  const [fuse, setFuse] = useState(4);
  const [passes, setPasses] = useState(0);
  const [prompt, setPrompt] = useState(0);
  const boom = passes >= fuse;
  const holder = PASSERS[passes % PASSERS.length];

  if (boom) {
    return (
      <div className="flex h-full flex-col items-center justify-between gap-2 text-center">
        <Eyebrow>Out of time</Eyebrow>
        <div className="flex flex-col items-center">
          <p className="font-display text-[2.6rem] font-extrabold leading-none">BOOM!</p>
          <p className="mt-2 text-[0.72rem] opacity-85">{holder} was holding it. One life gone.</p>
        </div>
        <Btn
          onClick={() => {
            play("tap");
            setFuse(3 + Math.floor(Math.random() * 3));
            setPasses(0);
            setPrompt((p) => (p + 1) % BOMB_PROMPTS.length);
          }}
        >
          Light a new fuse
        </Btn>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-between gap-2 text-center">
      <Eyebrow>The fuse is lit · {holder} has it</Eyebrow>
      <div className="flex flex-col items-center">
        <GameGlyph kind="bomb" className="h-16 w-16 animate-wobble" />
        <p className="mt-1 font-display text-[1.25rem] font-extrabold leading-tight">{BOMB_PROMPTS[prompt]}</p>
        <p className="mt-2 text-[0.62rem] opacity-80">Say one, then pass. Don&apos;t be holding it when it blows.</p>
      </div>
      <Btn
        onClick={() => {
          const next = passes + 1;
          play(next >= fuse ? "buzzer" : "tick");
          setPasses(next);
        }}
      >
        Said it! Pass to {PASSERS[(passes + 1) % PASSERS.length]}
      </Btn>
    </div>
  );
}

// ------------------------------------------------------------------ two truths & a lie

const ROUNDS = [
  { who: "Ravi", says: ["I've met Shah Rukh Khan", "I can't swim", "I once ate 30 golgappas"], lie: 0 },
  { who: "Meera", says: ["I've never seen Sholay", "I was a state-level chess player", "I'm scared of pigeons"], lie: 1 },
  { who: "Kabir", says: ["I've been to every state in the North East", "I hate chai", "I failed my driving test twice"], lie: 1 },
];

export function TwoTruthsDemo() {
  const [round, setRound] = useState(0);
  const [guess, setGuess] = useState<number | null>(null);
  const { who, says, lie } = ROUNDS[round];

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="text-center">
        <Eyebrow>{who} says</Eyebrow>
        <p className="mt-0.5 font-display text-[1rem] font-extrabold">Which one&apos;s the lie?</p>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-1.5">
        {says.map((line, i) => {
          const isLie = guess !== null && i === lie;
          const wrong = guess === i && i !== lie;
          return (
            <button
              key={line}
              type="button"
              disabled={guess !== null}
              onClick={() => {
                play(i === lie ? "ding" : "buzzer");
                setGuess(i);
              }}
              className={`rounded-[0.8rem] px-2.5 py-2 text-left text-[0.68rem] font-semibold leading-snug transition-colors disabled:cursor-default ${
                isLie ? "bg-ink text-white" : wrong ? "bg-white/40 text-ink line-through" : "bg-white text-ink"
              }`}
            >
              {isLie ? `Lie: ${line}` : line}
            </button>
          );
        })}
      </div>
      {guess === null ? (
        <p className="pb-1 text-center text-[0.62rem] opacity-80">Everyone points at once. Tap your guess.</p>
      ) : (
        <Btn
          onClick={() => {
            play("tap");
            setRound((r) => (r + 1) % ROUNDS.length);
            setGuess(null);
          }}
        >
          {guess === lie ? "Spotted it! Next player" : "Fooled you. Next player"}
        </Btn>
      )}
    </div>
  );
}
