import Link from "next/link";

import type { CatalogGame } from "@/lib/games";
import GameArt from "./GameArt";
import { ArrowIcon } from "./Icons";

interface GameCardProps {
  game: CatalogGame;
  className?: string;
}

/**
 * A game: its colour field and object on top, then the name, a line about it
 * and who it's for. Flat; hovering nudges the object, not the card.
 */
export default function GameCard({ game, className = "" }: GameCardProps) {
  return (
    <Link
      href={game.href}
      className={`group flex h-full flex-col outline-offset-4 ${className}`}
    >
      <GameArt slug={game.slug} className="aspect-[4/3] rounded-[1.75rem]" />
      <div className="flex flex-1 flex-col px-1 pt-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-[1.6rem] font-bold leading-tight tracking-[-0.015em] text-ink">
            {game.title}
          </h3>
          <ArrowIcon
            width={20}
            height={20}
            aria-hidden="true"
            className="shrink-0 -translate-x-1 text-ink-soft opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
          />
        </div>
        <p className="mt-1.5 text-[1.02rem] leading-relaxed text-ink-soft">{game.tagline}</p>
        <p className="mt-auto pt-4 text-sm font-medium text-ink-soft/80">
          {game.players} players <span aria-hidden="true">·</span> {game.duration}
        </p>
      </div>
    </Link>
  );
}
