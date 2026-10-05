"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import { useGameTimer } from "@/lib/useGameTimer";

import { imposterCategory } from "@/lib/imposter/words";
import { sfx } from "@/lib/sfx";
import {
  dealer,
  hiddenImposters,
  playerName,
  roundAwards,
  useImposter,
  type Card,
} from "@/store/imposterStore";
import Character from "../Character";

function useSound() {
  const muted = useImposter((s) => s.muted);
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

function Notice() {
  const notice = useImposter((s) => s.notice);
  const dismiss = useImposter((s) => s.dismissNotice);
  if (!notice) return null;
  return (
    <p className="inset-well w-full px-3 py-2 text-left text-sm font-semibold">
      {notice}{" "}
      <button type="button" onClick={dismiss} className="underline">
        OK
      </button>
    </p>
  );
}

// ------------------------------------------------------------------ pass

export function Pass() {
  const s = useImposter();
  const holder = dealer(s);
  const play = useSound();
  if (!s.round || !holder) return null;
  const index = s.round.dealIndex;

  return (
    <div className="flex min-h-[26rem] flex-col items-center justify-between gap-6 text-center">
      <div className="flex w-full flex-col items-center">
        <Eyebrow>
          Round {s.round.number} · card {index + 1} of {s.players.length}
        </Eyebrow>
        {index === 0 && (
          <div className="mt-3 w-full">
            <Notice />
          </div>
        )}
        <Character
          kind="detective"
          tone="green"
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
        className="btn tone-green min-h-14 w-full text-lg"
      >
        I&apos;m {holder.name}, show my card
      </button>
    </div>
  );
}

// ------------------------------------------------------------------ reveal

/** Dialogues and phrases can run long, so big words get smaller type. */
function wordSize(word: string) {
  if (word.length > 28) return "text-[clamp(1.6rem,7.5vw,2.6rem)]";
  if (word.length > 16) return "text-[clamp(1.9rem,9vw,3.2rem)]";
  return "text-[clamp(2.2rem,12vw,4.2rem)]";
}

function CardFace({ card, categoryId }: { card: Card; categoryId: string }) {
  const mode = useImposter((s) => s.settings.mode);
  const category = imposterCategory(categoryId);

  if (card.kind === "imposter") {
    return (
      <>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-ink/55">
          You are the
        </p>
        <p className="mt-1 font-display text-[clamp(2.6rem,13vw,4.5rem)] font-extrabold leading-none tracking-tight text-[#c63a28]">
          Imposter
        </p>
        {card.hint ? (
          <p className="mt-5 text-lg">
            Hint: <strong>{card.hint}</strong>
          </p>
        ) : (
          <p className="mt-5 text-ink/60">No hint. Good luck.</p>
        )}
        <p className="mt-3 max-w-xs text-sm text-ink/55">
          Blend in. Listen to the clues, fake yours, and try to work out the
          word.
        </p>
      </>
    );
  }

  return (
    <>
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-ink/55">
        The secret word is
      </p>
      <p
        className={`mt-2 break-words font-display ${wordSize(card.word)} font-extrabold leading-[1.02] tracking-tight [overflow-wrap:anywhere]`}
      >
        {card.word}
      </p>
      {mode === "classic" && category && (
        <p className="mt-5 text-ink/60">
          {category.emoji} {category.label}
        </p>
      )}
      <p className="mt-3 max-w-xs text-sm text-ink/55">
        {mode === "classic"
          ? "Give clues that prove you know it, without handing it to the imposter."
          : "Someone has a different word. Careful, it might be you."}
      </p>
    </>
  );
}

export function Reveal() {
  const s = useImposter();
  const holder = dealer(s);
  const play = useSound();
  if (!s.round || !holder) return null;
  const card = s.round.cards[holder.id];
  const next = s.players[s.round.dealIndex + 1];

  return (
    <div className="flex min-h-[26rem] flex-col gap-6">
      <Eyebrow>{holder.name} only 🤫</Eyebrow>
      <motion.div
        initial={{ rotateY: 90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="inset-well flex flex-1 flex-col items-center justify-center px-4 py-8 text-center"
      >
        {card && <CardFace card={card} categoryId={s.round.word.categoryId} />}
      </motion.div>
      <button
        type="button"
        onClick={() => {
          play("tap");
          s.hideCard();
        }}
        className="btn tone-white min-h-14 w-full text-lg"
      >
        {next ? `Hide & pass to ${next.name}` : "Got it, hide my card"}
      </button>
    </div>
  );
}

// ------------------------------------------------------------------ discuss

function ClueClock() {
  const s = useImposter();
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
          className="h-full rounded-full bg-[#25b35f]"
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

function PeekCard() {
  const s = useImposter();
  const [who, setWho] = useState<string | null>(null);
  const [peek, setPeek] = useState(false);
  if (!s.round) return null;
  const card = who ? s.round.cards[who] : null;

  return (
    <details className="inset-well px-4 py-3 text-left">
      <summary className="cursor-pointer text-sm font-bold">
        Forgot your word?
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
      {card && (
        <button
          type="button"
          onPointerDown={() => setPeek(true)}
          onPointerUp={() => setPeek(false)}
          onPointerLeave={() => setPeek(false)}
          onPointerCancel={() => setPeek(false)}
          onContextMenu={(e) => e.preventDefault()}
          className="keycap tone-white mt-3 h-12 w-full select-none px-3 font-display text-lg [-webkit-touch-callout:none]"
        >
          {peek
            ? card.kind === "word"
              ? card.word
              : `Imposter${card.hint ? ` · ${card.hint}` : ""}`
            : `Hold to peek (${playerName(s, who!)} only)`}
        </button>
      )}
    </details>
  );
}

export function Discuss() {
  const s = useImposter();
  const play = useSound();
  if (!s.round) return null;
  const starter = playerName(s, s.round.starterId);

  return (
    <div className="flex min-h-[26rem] flex-col gap-5">
      <div className="text-center">
        <Eyebrow>Clue time</Eyebrow>
        <h2 className="mt-2 font-display text-[clamp(1.9rem,8vw,2.6rem)] font-extrabold leading-tight tracking-tight">
          {starter} goes first
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-ink/65">
          Go round the circle. Everyone says <strong>one word</strong> about the
          secret word. Not too obvious, or the imposter will catch on. Go round
          again if you need more.
        </p>
      </div>

      {s.settings.discussSeconds > 0 && <ClueClock />}

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
        <PeekCard />
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ vote

export function Vote() {
  const s = useImposter();
  const play = useSound();
  const [picked, setPicked] = useState<string | null>(null);
  if (!s.round) return null;
  const { round } = s;
  const remaining = hiddenImposters(round).length;
  const multi = round.imposterIds.length > 1 && !round.troll;

  return (
    <div className="flex min-h-[26rem] flex-col gap-5">
      <div className="text-center">
        <Eyebrow>
          {round.caught.length > 0
            ? `${remaining} more to find`
            : "Point on three"}
        </Eyebrow>
        <h2 className="mt-2 font-display text-[clamp(1.9rem,8vw,2.6rem)] font-extrabold leading-tight tracking-tight">
          Who&apos;s the imposter?
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-ink/65">
          Count down from three and everyone points. Tap whoever got the most
          votes.
          {multi && round.caught.length === 0 && (
            <> There are {round.imposterIds.length} imposters this time.</>
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {s.players.map((p) => {
          const out = round.caught.includes(p.id);
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
            const hit = round.imposterIds.includes(picked);
            play(hit ? "ding" : "buzzer");
            s.vote(picked);
          }}
          className="btn tone-red min-h-14 w-full text-lg disabled:opacity-50"
        >
          {picked ? `Vote out ${playerName(s, picked)}` : "Tap a player"}
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={s.backToDiscuss} className="btn tone-white">
            More clues
          </button>
          <button
            type="button"
            onClick={() => {
              play("buzzer");
              s.vote(null);
            }}
            className="btn tone-white"
          >
            We give up
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ verdict

export function Verdict() {
  const s = useImposter();
  const play = useSound();
  if (!s.round?.lastVotedId) return null;
  const { round } = s;
  const votedId = round.lastVotedId!;
  const name = playerName(s, votedId);
  const hit = round.imposterIds.includes(votedId);
  const remaining = hiddenImposters(round).length;
  const card = round.cards[votedId];
  const undercover = s.settings.mode === "undercover";

  let headline: string;
  let body: string;
  let cta: string;
  if (round.troll) {
    headline = `${name} was an imposter…`;
    body = "…and so was everyone else. Troll round! 😈";
    cta = "See what happened";
  } else if (hit) {
    headline = `${name} was the imposter!`;
    body = undercover
      ? `Their word was “${card?.kind === "word" ? card.word : "?"}”.`
      : remaining > 0
        ? `Nice. ${remaining} more imposter${remaining > 1 ? "s" : ""} still hiding.`
        : "Caught! But they get one last chance to steal the round.";
    cta =
      remaining > 0
        ? "Vote again"
        : undercover
          ? "See the result"
          : "Imposter's last guess";
  } else {
    headline = `${name} was innocent.`;
    body = "Wrong person! The imposter gets away with it.";
    cta = "Reveal the imposter";
  }

  return (
    <div className="flex min-h-[26rem] flex-col items-center justify-between gap-6 text-center">
      <div className="flex flex-col items-center">
        <Character
          kind={hit ? "fibber" : "hotseat"}
          tone={hit ? "red" : "white"}
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
          s.continueVoting();
        }}
        className={`btn ${hit && !round.troll ? "tone-green" : "tone-red"} min-h-14 w-full text-lg`}
      >
        {cta}
      </button>
    </div>
  );
}

// ------------------------------------------------------------------ guess

export function Guess() {
  const s = useImposter();
  const play = useSound();
  const [shown, setShown] = useState(false);
  if (!s.round) return null;
  const names = s.round.imposterIds.map((id) => playerName(s, id));

  return (
    <div className="flex min-h-[26rem] flex-col gap-6 text-center">
      <div>
        <Eyebrow>Last chance</Eyebrow>
        <h2 className="mt-2 font-display text-[clamp(1.9rem,8vw,2.6rem)] font-extrabold leading-tight tracking-tight">
          {names.join(" & ")}, what was the word?
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-ink/65">
          Say your guess out loud{names.length > 1 ? " (one guess together)" : ""}.
          Get it right and you steal the round.
        </p>
      </div>

      <div className="inset-well grid flex-1 place-items-center px-4 py-8">
        {shown ? (
          <p
            className={`font-display ${wordSize(s.round.word.word)} font-extrabold leading-[1.02] tracking-tight [overflow-wrap:anywhere]`}
          >
            {s.round.word.word}
          </p>
        ) : (
          <button
            type="button"
            onClick={() => setShown(true)}
            className="btn tone-white"
          >
            They&apos;ve guessed. Show the word
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={!shown}
          onClick={() => {
            play("buzzer");
            s.resolveGuess(true);
          }}
          className="btn tone-red min-h-14 disabled:opacity-50"
        >
          They got it
        </button>
        <button
          type="button"
          disabled={!shown}
          onClick={() => {
            play("success");
            s.resolveGuess(false);
          }}
          className="btn tone-green min-h-14 disabled:opacity-50"
        >
          Wrong!
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ round over

const OUTCOME_COPY = {
  crew: { title: "Crew wins!", tone: "green", character: "detective" },
  imposters: { title: "Imposter wins!", tone: "red", character: "fibber" },
  steal: { title: "Stolen!", tone: "red", character: "fibber" },
  troll: { title: "Trolled!", tone: "purple", character: "fibber" },
} as const;

export function RoundOver() {
  const s = useImposter();
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
  const category = imposterCategory(round.word.categoryId);
  const imposterNames = round.imposterIds.map((id) => playerName(s, id));
  const awards = roundAwards(s.players, round.imposterIds, outcome);
  const winners = Object.keys(awards);
  const points = winners.length ? awards[winners[0]] : 0;

  const summary = {
    crew: "The imposter got caught and couldn't name the word.",
    imposters: "The imposter blended right in.",
    steal: "Caught, but they guessed the word and stole the round.",
    troll: "Everyone was the imposter this round. Nobody scores.",
  }[outcome];

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
        <p className="mt-1 text-ink/65">{summary}</p>
      </div>

      <dl className="inset-well grid gap-3 px-4 py-4 text-left">
        <div>
          <dt className="text-xs font-bold uppercase tracking-[0.15em] text-ink/50">
            The word
          </dt>
          <dd className="font-display text-2xl font-extrabold">
            {round.word.word}
            <span className="block text-sm font-semibold text-ink/50">
              {category?.emoji} {category?.label}
            </span>
          </dd>
        </div>
        {!round.troll && (
          <div>
            <dt className="text-xs font-bold uppercase tracking-[0.15em] text-ink/50">
              {imposterNames.length > 1 ? "The imposters" : "The imposter"}
            </dt>
            <dd className="font-display text-xl font-extrabold">
              {imposterNames.join(", ")}
              {s.settings.mode === "undercover" && (
                <span className="block text-sm font-semibold text-ink/55">
                  {round.imposterIds
                    .map((id) => {
                      const c = round.cards[id];
                      return `${playerName(s, id)} had “${c?.kind === "word" ? c.word : "?"}”`;
                    })
                    .join(" · ")}
                </span>
              )}
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
          className="btn tone-green min-h-14 w-full text-lg"
        >
          Next round
        </button>
      </div>
    </div>
  );
}
