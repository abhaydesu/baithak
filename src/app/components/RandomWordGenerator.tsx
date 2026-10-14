"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { WORDS_BY_DIFFICULTY, type Difficulty } from "@/lib/wordBank";
import { ShuffleIcon } from "./Icons";

const STORAGE_KEY = "vybrid_custom_words";
const categories = ["random", ...Object.keys(WORDS_BY_DIFFICULTY)];
const difficulties: Difficulty[] = ["easy", "medium", "hard"];

interface Props {
  words?: string[];
  title?: string;
}

function getCategoryPool(category: string, difficulty: Difficulty) {
  if (category === "random") {
    return Object.values(WORDS_BY_DIFFICULTY).flatMap((b) => b[difficulty]);
  }
  return WORDS_BY_DIFFICULTY[category]?.[difficulty] ?? [];
}

export default function RandomWordGenerator({
  words,
  title = "Word deck",
}: Props) {
  const [current, setCurrent] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);
  /** Words actually played. Browsing past a word doesn't count. */
  const [used, setUsed] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [category, setCategory] = useState("random");
  const [custom, setCustom] = useState("");
  const [customWords, setCustomWords] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // Loaded after mount so server and client markup match.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setCustomWords(JSON.parse(raw));
    } catch {}
  }, []);

  function saveCustom(next: string[]) {
    setCustomWords(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }

  const allWords = [
    ...new Set([
      ...(words ?? []),
      ...getCategoryPool(category, difficulty),
      ...customWords,
    ]),
  ];
  const pool = allWords.filter((w) => !used.includes(w));
  const isUsed = current !== null && used.includes(current);

  function roll() {
    const options = pool.filter((w) => w !== current);
    if (!options.length) return;
    setCurrent(options[Math.floor(Math.random() * options.length)]);
    setHidden(false);
  }

  function markUsed() {
    if (!current || isUsed) return;
    setUsed((u) => [current, ...u]);
  }

  function addCustom() {
    const trimmed = custom.trim();
    if (!trimmed) return;
    saveCustom(
      [trimmed, ...customWords.filter((x) => x !== trimmed)].slice(0, 50),
    );
    setCustom("");
  }


  return (
    <div className="surface p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-xl font-bold text-ink">{title}</h3>
        <span className="text-sm font-semibold text-ink-soft">{pool.length} left</span>
      </div>

      <button
        type="button"
        onClick={() => current && setHidden((h) => !h)}
        className="mt-5 grid min-h-36 w-full place-items-center rounded-2xl bg-paper px-4 py-6 text-center"
        aria-label={hidden ? "Reveal word" : "Hide word"}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={current ?? "empty"}
            initial={{ opacity: 0, y: 16, rotate: -3, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
            className={`font-display text-[clamp(1.9rem,9vw,3rem)] font-bold leading-tight tracking-tight text-ink transition-[filter] ${
              hidden ? "blur-lg select-none" : ""
            } ${current ? "" : "text-ink/35"}`}
          >
            {current ?? "Tap deal to start"}
          </motion.span>
        </AnimatePresence>
        {current && (
          <span className="mt-2 text-xs font-semibold text-ink/45">
            {hidden ? "Tap to peek" : "Tap to hide from the room"}
          </span>
        )}
      </button>

      {current ? (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button type="button" onClick={roll} className="pill min-h-[3.25rem]">
            <ShuffleIcon width={18} height={18} />
            Skip
          </button>
          <button
            type="button"
            onClick={markUsed}
            disabled={isUsed}
            className="press"
          >
            {isUsed ? "In play" : "Use this word"}
          </button>
        </div>
      ) : (
        <button type="button" onClick={roll} className="press mt-5 w-full">
          <ShuffleIcon width={18} height={18} />
          Deal a word
        </button>
      )}
      {isUsed && (
        <button
          type="button"
          onClick={roll}
          className="mt-3 w-full text-sm font-bold text-ink/60 underline underline-offset-4"
        >
          Done, next word
        </button>
      )}

      <div className="mt-6 space-y-4">
        <fieldset>
          <legend className="mb-2 font-semibold text-ink">Category</legend>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={category === c}
                onClick={() => setCategory(c)}
                className="pill h-9 min-h-0 px-3 text-sm capitalize"
              >
                {c}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 font-semibold text-ink">Difficulty</legend>
          <div className="grid grid-cols-3 gap-2">
            {difficulties.map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={difficulty === d}
                onClick={() => setDifficulty(d)}
                className="pill h-9 min-h-0 text-sm capitalize"
              >
                {d}
              </button>
            ))}
          </div>
        </fieldset>

        <details className="group">
          <summary className="cursor-pointer list-none font-semibold text-ink [&::-webkit-details-marker]:hidden">
            <span className="inline-block transition-transform group-open:rotate-90">
              ▸
            </span>{" "}
            Add your own words
            {customWords.length > 0 && ` (${customWords.length})`}
          </summary>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              addCustom();
            }}
          >
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="e.g. Aunt Priya's biryani"
              className="field"
            />
            <button type="submit" className="pill shrink-0 self-center">
              Add
            </button>
          </form>
          {customWords.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {customWords.map((w) => (
                <span key={w} className="rounded-full bg-paper px-2.5 py-1 text-sm text-ink">
                  {w}
                </span>
              ))}
              <button
                type="button"
                onClick={() => saveCustom([])}
                className="ml-1 text-xs font-semibold text-ink/55 underline"
              >
                Clear all
              </button>
            </div>
          )}
        </details>

        {used.length > 0 && (
          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <p className="font-semibold text-ink">Played ({used.length})</p>
              <button
                type="button"
                onClick={() => setUsed([])}
                className="text-xs font-semibold text-ink/55 underline"
              >
                Put them back
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {used.map((w) => (
                <span key={w} className="rounded-full bg-paper px-2.5 py-1 text-sm text-ink-soft line-through decoration-ink/30">
                  {w}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
