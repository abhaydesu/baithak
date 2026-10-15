"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

import { artFor } from "@/lib/gameArt";
import type { CatalogGame } from "@/lib/games";
import GameGlyph from "./GameGlyph";

/**
 * A game as a playing card: cream stock, a thick ink outline with a hard
 * shadow (the same build as the Press button), the game's colour and object,
 * a number badge for the smallest group, and a dark name plate.
 */
export function PlayingCard({ game, className = "" }: { game: CatalogGame; className?: string }) {
  const art = artFor(game.slug);
  const min = game.players.match(/\d+/)?.[0] ?? "";
  return (
    <Link
      href={game.href}
      className={`group relative block aspect-[5/7] w-full rounded-[1.5rem] border-[3px] border-ink bg-[#fffaf0] p-2 shadow-[0_7px_0_0_var(--color-ink)] ${className}`}
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
export function CardSpread({ games }: { games: CatalogGame[] }) {
  const calm = useReducedMotion();
  return (
    <div className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-12 pt-4 [scrollbar-width:none] sm:mx-0 md:grid md:grid-cols-3 md:gap-10 md:overflow-visible md:px-0 lg:gap-14">
      {games.map((game, i) => (
        <motion.div
          key={game.slug}
          className="w-[66vw] max-w-[18rem] shrink-0 snap-center md:w-auto md:max-w-none"
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
