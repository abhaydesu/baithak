"use client";

import { useRef, useState } from "react";
import Link from "next/link";

import { artFor } from "@/lib/gameArt";
import GameArt from "./GameArt";
import GameGlyph from "./GameGlyph";
import { BackIcon } from "./Icons";
import { play } from "./phone/bits";
import {
  BombDemo,
  ImposterDemo,
  PictionaryDemo,
  Top9Demo,
  TwoTruthsDemo,
} from "./phone/MiniGames";
import Moment, { MOMENTS } from "./phone/Moment";

/**
 * The hero phone: a tiny Baithak. It opens on the full catalogue, and every
 * game opens a playable taste of itself: the deep ones (Imposter, Top 9,
 * Pictionary, Pass the Bomb, Two Truths) play properly, the rest show a real
 * moment from the game. Each screen ends with a link to the real thing.
 */

export interface PhoneGame {
  slug: string;
  title: string;
  href: string;
}

const DEEP: Record<string, () => React.ReactElement> = {
  imposter: ImposterDemo,
  "top-9": Top9Demo,
  pictionary: PictionaryDemo,
  "pass-the-bomb": BombDemo,
  "two-truths-one-lie": TwoTruthsDemo,
};

export default function PhoneDemo({ games }: { games: PhoneGame[] }) {
  const [open, setOpen] = useState<PhoneGame | null>(null);
  // Remember where the list was scrolled, so Back returns to the same spot.
  const [listScroll, setListScroll] = useState(0);

  return (
    <div className="rounded-[2.4rem] bg-ink p-2 shadow-[0_30px_50px_-24px_rgb(0_0_0/0.55)]">
      <div className="relative flex aspect-[9/18] flex-col overflow-hidden rounded-[1.95rem] bg-paper">
        <div className="mx-auto mt-2 h-5 w-16 shrink-0 rounded-full bg-ink" />
        {open ? (
          <GameScreen game={open} onBack={() => setOpen(null)} />
        ) : (
          <Home
            games={games}
            initialScroll={listScroll}
            onOpen={(game, scroll) => {
              play("tap");
              setListScroll(scroll);
              setOpen(game);
            }}
          />
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ home

function Home({
  games,
  initialScroll,
  onOpen,
}: {
  games: PhoneGame[];
  initialScroll: number;
  onOpen: (game: PhoneGame, scroll: number) => void;
}) {
  const list = useRef<HTMLDivElement>(null);
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 px-3 pb-2 pt-3">
        <p className="font-display text-[1.15rem] font-bold leading-tight tracking-[-0.02em] text-ink">
          What are we playing?
        </p>
        <p className="text-[0.6rem] text-ink-soft">{games.length} games · tap one to try it</p>
      </div>
      <div
        ref={(el) => {
          list.current = el;
          if (el && initialScroll) el.scrollTop = initialScroll;
        }}
        className="grid min-h-0 flex-1 grid-cols-2 content-start gap-x-2 gap-y-2.5 overflow-y-auto px-3 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {games.map((game) => (
          <button
            key={game.slug}
            type="button"
            onClick={() => onOpen(game, list.current?.scrollTop ?? 0)}
            className="group text-left"
          >
            <GameArt slug={game.slug} className="aspect-[4/3] rounded-[0.8rem]" />
            <span className="mt-1 block truncate font-display text-[0.66rem] font-bold leading-tight text-ink">
              {game.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ a game

function GameScreen({ game, onBack }: { game: PhoneGame; onBack: () => void }) {
  const art = artFor(game.slug);
  const Deep = DEEP[game.slug];
  const moment = MOMENTS[game.slug];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-2 px-3 pt-2.5 text-[0.62rem] font-semibold">
        <button
          type="button"
          onClick={() => {
            play("tap");
            onBack();
          }}
          className="inline-flex items-center gap-0.5 text-ink-soft transition-colors hover:text-ink"
        >
          <BackIcon width={12} height={12} /> Games
        </button>
        <span className="truncate font-display text-[0.72rem] font-bold text-ink">{game.title}</span>
      </div>
      {/* The stage: the game's colour */}
      <div className="flex min-h-0 flex-1 flex-col px-2.5 pb-1.5 pt-2.5">
        <div
          className="flex min-h-0 flex-1 flex-col rounded-[1.2rem] p-3"
          style={{ background: art.color, color: art.on }}
        >
          {Deep ? (
            <Deep />
          ) : moment ? (
            <Moment spec={moment} glyph={art.glyph} />
          ) : (
            // A game without a moment yet still gets its object and name.
            <div className="flex h-full flex-col items-center justify-center text-center">
              <GameGlyph kind={art.glyph} className="h-20 w-20" />
              <p className="mt-1 font-display text-[1.3rem] font-extrabold leading-tight">{game.title}</p>
            </div>
          )}
        </div>
      </div>
      <Link
        href={game.href}
        className="mx-2.5 mb-3 shrink-0 rounded-full bg-paper-deep py-1.5 text-center text-[0.62rem] font-semibold text-ink transition-colors hover:bg-line"
      >
        Play {game.title} for real →
      </Link>
    </div>
  );
}
