"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { sfx } from "@/lib/sfx";
import { isAlreadyRevealed, matchGuess } from "@/lib/top9/match";
import type { Top9Question } from "@/lib/top9/types";
import { MAX_STRIKES, useTop9 } from "@/store/top9Store";

export function useTop9Sound() {
  const muted = useTop9((s) => s.muted);
  return (name: keyof typeof sfx) => {
    if (!muted) sfx[name]();
  };
}

export function useQuestion(): Top9Question | null {
  return useTop9((s) => s.question);
}

// ------------------------------------------------------------------ tiles

interface BoardProps {
  /** Allow tapping hidden tiles to reveal them (host mode). */
  tappable: boolean;
}

export function Board({ tappable }: BoardProps) {
  const question = useQuestion();
  const revealed = useTop9((s) => s.revealed);
  const mode = useTop9((s) => s.settings.mode);
  const hostView = useTop9((s) => s.hostView);
  const reveal = useTop9((s) => s.reveal);
  const play = useTop9Sound();
  if (!question) return null;

  const showHidden = mode === "host" && hostView;

  return (
    // Two columns on wider screens, filled top-to-bottom like the TV board.
    <ol
      className="grid grid-cols-1 gap-2 sm:grid-flow-col sm:grid-cols-2 sm:[grid-template-rows:repeat(var(--rows),minmax(0,auto))]"
      style={
        {
          "--rows": Math.ceil(question.answers.length / 2),
        } as React.CSSProperties
      }
    >
      {question.answers.map((answer, i) => {
        const isRevealed = revealed.includes(i);
        const canTap = tappable && !isRevealed;
        return (
          <motion.li
            key={`${question.id}-${i}`}
            style={{ transformPerspective: 600 }}
            initial={false}
            animate={{ rotateX: isRevealed ? [90, 0] : 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <button
              type="button"
              disabled={!canTap}
              onClick={() => {
                play("ding");
                reveal(i);
              }}
              aria-label={
                isRevealed
                  ? `${i + 1}. ${answer.text}, ${answer.points} points`
                  : canTap
                    ? `Reveal answer ${i + 1}${showHidden ? `: ${answer.text}` : ""}`
                    : `Answer ${i + 1}, hidden`
              }
              className={`brick brick-flat flex min-h-12 w-full items-center gap-3 px-2.5 py-1.5 text-left disabled:cursor-default ${
                isRevealed ? "tone-yellow" : "tone-blue"
              } ${canTap ? "brick-press" : ""}`}
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border-2 border-[var(--tone-dark)] bg-surface font-display text-sm font-extrabold">
                {i + 1}
              </span>
              {isRevealed ? (
                <>
                  <span className="min-w-0 flex-1 font-display text-lg font-extrabold uppercase leading-tight tracking-tight">
                    {answer.text}
                  </span>
                  <span className="grid h-8 min-w-10 shrink-0 place-items-center rounded-lg bg-[var(--tone-solid)] px-1.5 font-display font-extrabold tabular-nums text-ink">
                    {answer.points}
                  </span>
                </>
              ) : showHidden ? (
                <>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink/55">
                    {answer.text}
                  </span>
                  <span className="shrink-0 text-xs font-bold text-ink/45 tabular-nums">
                    {answer.points}
                  </span>
                </>
              ) : (
                <span className="h-2 flex-1 rounded-full bg-surface/50" />
              )}
            </button>
          </motion.li>
        );
      })}
    </ol>
  );
}

// ------------------------------------------------------------------ strikes

export function Strikes({ count }: { count: number }) {
  return (
    <div
      className="flex gap-1.5"
      aria-label={`${count} of ${MAX_STRIKES} strikes`}
    >
      {Array.from({ length: MAX_STRIKES }, (_, i) => (
        <span
          key={i}
          className={`grid h-9 w-9 place-items-center rounded-xl border-2 font-display text-xl font-extrabold transition-colors ${
            i < count
              ? "border-[#c63a28] bg-[#ff5a45] text-white shadow-[0_3px_0_#c63a28]"
              : "border-line bg-surface/70 text-ink/15"
          }`}
        >
          ✗
        </span>
      ))}
    </div>
  );
}

/** Big red X's that flash over the board after a strike. */
export function StrikeFlash({
  count,
  flashKey,
}: {
  count: number;
  flashKey: number;
}) {
  return (
    <AnimatePresence>
      {flashKey > 0 && (
        <motion.div
          key={flashKey}
          initial={{ opacity: 0, scale: 1.4 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [1.4, 1, 1, 0.95] }}
          transition={{ duration: 1.1, times: [0, 0.15, 0.8, 1] }}
          className="pointer-events-none fixed inset-0 z-50 grid place-items-center"
          aria-hidden="true"
        >
          <div className="flex gap-3">
            {Array.from({ length: count }, (_, i) => (
              <span
                key={i}
                className="grid h-24 w-24 place-items-center rounded-3xl border-4 border-[#c63a28] bg-[#ff5a45] font-display text-7xl font-extrabold text-white shadow-[0_8px_0_#c63a28]"
              >
                ✗
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ------------------------------------------------------------------ guessing

interface GuessBoxProps {
  /** What to offer when the guess isn't on the board. */
  onMiss?: { label: string; action: () => void };
  placeholder?: string;
}

export function GuessBox({
  onMiss,
  placeholder = "Type what they said…",
}: GuessBoxProps) {
  const question = useQuestion();
  const revealed = useTop9((s) => s.revealed);
  const reveal = useTop9((s) => s.reveal);
  const play = useTop9Sound();
  const [text, setText] = useState("");
  const [missed, setMissed] = useState<{
    guess: string;
    already: boolean;
  } | null>(null);

  function check(e: React.FormEvent) {
    e.preventDefault();
    if (!question || !text.trim()) return;
    const index = matchGuess(text, question.answers, revealed);
    if (index === null) {
      setMissed({
        guess: text.trim(),
        already: isAlreadyRevealed(text, question.answers, revealed),
      });
      return;
    }
    play("ding");
    reveal(index);
    setText("");
    setMissed(null);
  }

  return (
    <div>
      <form onSubmit={check} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setMissed(null);
          }}
          placeholder={placeholder}
          aria-label="Guess"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          className="field min-h-12"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="btn tone-blue shrink-0"
        >
          Check
        </button>
      </form>
      {missed && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-danger">
            “{missed.guess}”{" "}
            {missed.already
              ? "is already on the board."
              : "isn't on the board."}
          </p>
          {onMiss && !missed.already && (
            <button
              type="button"
              onClick={() => {
                onMiss.action();
                setText("");
                setMissed(null);
              }}
              className="btn btn-sm tone-red"
            >
              {onMiss.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
