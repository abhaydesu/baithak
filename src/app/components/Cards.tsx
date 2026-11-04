"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useRef, useState } from "react";

import { artFor } from "@/lib/gameArt";
import type { CatalogGame } from "@/lib/games";
import GameGlyph from "./GameGlyph";

/**
 * A game as a playing card: cream stock, a thick ink outline with a hard
 * shadow (the same build as the Press button), the game's colour and object,
 * a number badge for the smallest group, and a dark name plate.
 */
export function PlayingCard({
  game,
  className = "",
  tabIndex,
}: {
  game: CatalogGame;
  className?: string;
  tabIndex?: number;
}) {
  const art = artFor(game.slug);
  const min = game.players.match(/\d+/)?.[0] ?? "";
  return (
    <Link
      href={game.href}
      tabIndex={tabIndex}
      draggable={false}
      className={`group relative block aspect-[5/7] w-full rounded-[1.5rem] light-scope border-[3px] border-ink bg-[#fffaf0] p-2 shadow-[0_7px_0_0_var(--color-ink)] ${className}`}
    >
      <div
        className="game-art grain relative h-full overflow-hidden rounded-[1.05rem] border-2 border-ink"
        style={{ "--field": art.color } as React.CSSProperties}
      >
        <GameGlyph
          kind={art.glyph}
          className="game-glyph absolute inset-x-0 top-[5%] z-[1] mx-auto h-[56%] w-auto"
        />
        <span className="absolute left-2 top-2 z-[2] grid h-9 min-w-9 place-items-center rounded-full border-2 border-ink bg-white px-1 font-display text-sm font-bold leading-none text-ink">
          {min}+
        </span>
        <div className="absolute inset-x-1.5 bottom-1.5 z-[2] rounded-xl bg-ink px-3 py-2.5 text-white">
          <p className="font-display text-lg font-bold leading-tight sm:text-xl">{game.title}</p>
          <p className="mt-0.5 line-clamp-2 text-[0.72rem] leading-snug text-white/70 sm:text-xs">
            {game.tagline}
          </p>
        </div>
      </div>
    </Link>
  );
}

const SPREAD_ROTATE = [-6, 0, 6];
const SPREAD_LIFT = [16, 0, 16];

/** Three cards dealt onto the table as you scroll to them; hover to pick one up. */
export function CardSpread({ games, className = "" }: { games: CatalogGame[]; className?: string }) {
  const calm = useReducedMotion();
  return (
    <div className={`grid grid-cols-3 gap-10 pb-12 pt-4 lg:gap-14 ${className}`}>
      {games.map((game, i) => (
        <motion.div
          key={game.slug}
          initial={calm ? false : { opacity: 0, y: 90, rotate: 0 }}
          whileInView={{ opacity: 1, y: SPREAD_LIFT[i % 3], rotate: SPREAD_ROTATE[i % 3] }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ type: "spring", stiffness: 110, damping: 15, delay: i * 0.12 }}
          whileHover={{ y: -14, rotate: 0, scale: 1.03, zIndex: 5 }}
        >
          <PlayingCard game={game} />
        </motion.div>
      ))}
    </div>
  );
}

/* Where each card sits by its depth in the deck: the front card square on,
   the rest fanned out behind it so their colours peek past its edges. */
const DECK_POSE = [
  { x: 0, y: 0, rotate: 0, scale: 1 },
  { x: 34, y: 8, rotate: 8, scale: 0.93 },
  { x: -34, y: 16, rotate: -8, scale: 0.87 },
];
const SWIPE_DISTANCE = 70;
const SWIPE_SPEED = 400;

/**
 * The phone take on the spread: the same cards as a deck in your hand.
 * Every card shows at once (the back ones fanned behind the front), a swipe
 * either way tucks the front card under the deck, tapping a peeking card or
 * its name below brings it to the front, and tapping the front card plays it.
 */
export function CardDeck({ games, className = "" }: { games: CatalogGame[]; className?: string }) {
  const calm = useReducedMotion();
  // order[0] is the card on top
  const [order, setOrder] = useState(() => games.map((_, i) => i));
  const dragged = useRef(false);
  const toFront = (i: number) => setOrder((o) => [i, ...o.filter((j) => j !== i)]);
  const tuck = () => setOrder((o) => [...o.slice(1), o[0]]);
  const front = games[order[0]];

  return (
    <div
      role="group"
      aria-roledescription="card deck"
      aria-label="Featured games"
      className={className}
    >
      <motion.div
        className="relative mx-auto aspect-[5/7] w-[min(62vw,16.5rem)]"
        initial={calm ? false : { opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ type: "spring", stiffness: 110, damping: 15 }}
      >
        {games.map((game, i) => {
          const depth = order.indexOf(i);
          const top = depth === 0;
          return (
            <motion.div
              key={game.slug}
              className={`absolute inset-0 ${top ? "cursor-grab touch-pan-y active:cursor-grabbing" : "cursor-pointer"}`}
              style={{ zIndex: games.length - depth }}
              initial={false}
              animate={DECK_POSE[Math.min(depth, DECK_POSE.length - 1)]}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              drag={top ? "x" : false}
              dragSnapToOrigin
              dragElastic={0.85}
              onPointerDown={() => (dragged.current = false)}
              onDragStart={() => (dragged.current = true)}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.x) > SWIPE_DISTANCE || Math.abs(info.velocity.x) > SWIPE_SPEED) tuck();
              }}
              // A swipe isn't a tap, and a peeking card comes forward before it plays.
              onClickCapture={(e) => {
                if (dragged.current || !top) {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!top && !dragged.current) toFront(i);
                }
              }}
              aria-hidden={top ? undefined : true}
            >
              <PlayingCard game={game} tabIndex={top ? undefined : -1} />
            </motion.div>
          );
        })}
      </motion.div>

      {/* Which card is on top, and a way to any of them without swiping */}
      <div className="mt-12 flex flex-wrap justify-center gap-2">
        {games.map((game, i) => (
          <button
            key={game.slug}
            type="button"
            aria-pressed={front.slug === game.slug}
            onClick={() => toFront(i)}
            className="pill h-10 min-h-0 gap-2 px-3.5 text-sm"
          >
            <span
              aria-hidden="true"
              className="size-2.5 rounded-full ring-[1.5px] ring-current/35"
              style={{ background: artFor(game.slug).color }}
            />
            {game.title}
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-sm text-ink-soft">Swipe the card to shuffle the deck</p>
    </div>
  );
}

const PEEK_LEFT = [12, 31, 50, 69, 88];
const PEEK_ROTATE = [-13, -6, 0, 6, 13];

/** A hand of cards rising from the bottom edge of the closing band. */
export function CardPeek({ games }: { games: CatalogGame[] }) {
  const calm = useReducedMotion();
  return (
    <div aria-hidden="true" className="relative mx-auto mt-14 h-[10.5rem] w-full max-w-[80rem] overflow-hidden sm:h-[15rem]">
      {games.slice(0, 5).map((game, i) => (
        <motion.div
          key={game.slug}
          className={`absolute top-8 w-[8.5rem] sm:w-[11.5rem] ${i === 0 || i === 4 ? "hidden md:block" : ""}`}
          style={{ left: `${PEEK_LEFT[i]}%`, x: "-50%" }}
          initial={calm ? false : { y: 140, rotate: 0 }}
          whileInView={{ y: 0, rotate: PEEK_ROTATE[i] }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 90, damping: 14, delay: i * 0.1 }}
          whileHover={{ y: -22, rotate: 0 }}
        >
          <PlayingCard game={game} />
        </motion.div>
      ))}
    </div>
  );
}
