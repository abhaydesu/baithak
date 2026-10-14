"use client";

import { useEffect, useState } from "react";

import type { GlyphKind } from "@/lib/gameArt";
import { sfx } from "@/lib/sfx";
import GameGlyph from "../GameGlyph";
import { Btn, Card, Eyebrow, play } from "./bits";

/**
 * A taste of a game in one screen: its object, a real word, prompt or
 * question from the game, and one action. Some moments hide an answer until
 * tapped (a Mafia role, a quiz answer); some run a short countdown.
 */
interface MomentSpec {
  eyebrow: string;
  items: Array<{ title: string; sub?: string; answer?: string }>;
  /** The button that moves on to the next item. */
  action: string;
  /** For items with an answer: the button that shows it. */
  reveal?: string;
  /** Seconds on the clock, for timed games. */
  timer?: number;
}

export const MOMENTS: Record<string, MomentSpec> = {
  "mafia-werewolf": {
    eyebrow: "Night falls · Meera only",
    reveal: "Show my role",
    action: "Hide & pass to Kabir",
    items: [
      { title: "Your role is…", answer: "Doctor", sub: "Pick one person to save tonight." },
      { title: "Your role is…", answer: "Mafia", sub: "Wake with the others and choose a target." },
      { title: "Your role is…", answer: "Villager", sub: "Sleep tight. Find the Mafia by day." },
      { title: "Your role is…", answer: "Detective", sub: "Check one person each night." },
    ],
  },
  charades: {
    eyebrow: "Act it out · no talking",
    action: "Got it! Next word",
    items: [
      { title: "Sholay", sub: "Bollywood movie" },
      { title: "Brushing your teeth", sub: "Everyday action" },
      { title: "Virat Kohli", sub: "Famous face" },
      { title: "Kuch Kuch Hota Hai", sub: "Bollywood movie" },
    ],
  },
  "dumb-charades": {
    eyebrow: "Actor only · the other team picked it",
    action: "They got it!",
    items: [
      { title: "Hera Pheri", sub: "Movie · 2 words" },
      { title: "Jab We Met", sub: "Movie · 3 words" },
      { title: "Zindagi Na Milegi Dobara", sub: "Movie · 4 words" },
      { title: "3 Idiots", sub: "Movie · 2 words" },
    ],
  },
  "hot-seat": {
    eyebrow: "Ravi's in the hot seat",
    action: "He got it! Next word",
    items: [
      { title: "Pressure cooker", sub: "Describe it. Don't say the word." },
      { title: "Auto rickshaw", sub: "Describe it. Don't say the word." },
      { title: "Monsoon", sub: "Describe it. Don't say the word." },
      { title: "Shaadi", sub: "Describe it. Don't say the word." },
    ],
  },
  "categories-quickfire": {
    eyebrow: "Round the circle · no repeats",
    action: "Someone's out. Next category",
    items: [
      { title: "Famous Kapoors", sub: "Stuck for 5 seconds? You're out." },
      { title: "Indian street foods", sub: "Stuck for 5 seconds? You're out." },
      { title: "Bollywood actresses", sub: "Stuck for 5 seconds? You're out." },
    ],
  },
  "five-second-challenge": {
    eyebrow: "Name three · five seconds",
    action: "Next prompt",
    timer: 5,
    items: [
      { title: "Indian sweets" },
      { title: "Cricketers" },
      { title: "Things in a fridge" },
      { title: "Bollywood villains" },
    ],
  },
  "rank-your-friends": {
    eyebrow: "Rank everyone, 1 to last",
    action: "Argue, then next topic",
    items: [
      { title: "Who would be late to their own wedding?" },
      { title: "Who would get lost with Google Maps open?" },
      { title: "Who leaves people on read the longest?" },
    ],
  },
  "weakest-link": {
    eyebrow: "Question 4 · bank: ₹2,000",
    reveal: "Show answer",
    action: "Next question",
    items: [
      { title: "What is India's national animal?", answer: "The tiger" },
      { title: "Which river is considered the holiest in India?", answer: "The Ganga" },
      { title: "What is the capital of Australia?", answer: "Canberra" },
    ],
  },
};

export default function Moment({ spec, glyph }: { spec: MomentSpec; glyph: GlyphKind }) {
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(false);
  const [left, setLeft] = useState<number | null>(null);
  const item = spec.items[index];
  const needsReveal = Boolean(item.answer) && !shown;

  // The countdown, a second at a time, with a buzzer at zero.
  useEffect(() => {
    if (left === null || left === 0) return;
    const id = window.setTimeout(() => {
      const next = left - 1;
      if (next === 0) sfx.buzzer();
      else sfx.tick();
      setLeft(next);
    }, 1000);
    return () => window.clearTimeout(id);
  }, [left]);

  const next = () => {
    play("tap");
    setIndex((i) => (i + 1) % spec.items.length);
    setShown(false);
    setLeft(null);
  };

  let button: React.ReactNode;
  if (needsReveal) {
    button = (
      <Btn
        onClick={() => {
          play("ding");
          setShown(true);
        }}
      >
        {spec.reveal}
      </Btn>
    );
  } else if (spec.timer && left === null) {
    button = (
      <Btn
        onClick={() => {
          play("tap");
          setLeft(spec.timer!);
        }}
      >
        Start the {spec.timer} seconds
      </Btn>
    );
  } else if (spec.timer && left !== 0) {
    button = <Btn onClick={next}>Got all three!</Btn>;
  } else {
    button = <Btn onClick={next}>{spec.action}</Btn>;
  }

  return (
    <div className="flex h-full flex-col items-center justify-between gap-2 text-center">
      <Eyebrow>{spec.eyebrow}</Eyebrow>
      <div className="flex w-full flex-col items-center">
        <GameGlyph kind={glyph} className="h-16 w-16" />
        <p className="mt-1 font-display text-[1.25rem] font-extrabold leading-tight">{item.title}</p>
        {item.answer && (
          <Card className="mt-2 w-full px-2 py-2.5">
            {shown ? (
              <p className="font-display text-[1.25rem] font-extrabold leading-none">{item.answer}</p>
            ) : (
              <p className="text-[0.62rem] font-semibold text-ink-soft">Hidden until you tap</p>
            )}
          </Card>
        )}
        {spec.timer && left !== null && (
          <p className="mt-1 font-display text-[2.4rem] font-extrabold leading-none tabular-nums">
            {left === 0 ? "Time!" : `0:0${left}`}
          </p>
        )}
        {item.sub && (!item.answer || shown) && (
          <p className="mt-2 text-[0.62rem] opacity-80">{item.sub}</p>
        )}
      </div>
      {button}
    </div>
  );
}
