import Link from "next/link";
import type { ReactNode } from "react";

import { artFor } from "@/lib/gameArt";
import GameArt from "./GameArt";
import { BackIcon } from "./Icons";

/** The /play page every game shares: a way back to the rules, then the game. */
export default function GamePlayShell({
  slug,
  title,
  detailsHref,
  children,
}: {
  /** Picks the game's colour and object (see src/lib/gameArt.ts). */
  slug: string;
  title: string;
  detailsHref: string;
  children: ReactNode;
}) {
  const art = artFor(slug);
  return (
    <main
      className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 pt-4 sm:px-6 md:pt-8"
      style={{ "--game": art.color, "--game-on": art.on } as React.CSSProperties}
    >
      <div className="flex items-center justify-between gap-3">
        <Link
          href={detailsHref}
          className="keycap tone-white h-10 shrink-0 px-3 text-sm"
        >
          <BackIcon width={18} height={18} /> Rules & kit
        </Link>
        <div className="flex min-w-0 items-center gap-3">
          <h1 className="truncate font-display text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
          <GameArt slug={slug} className="h-9 w-9 shrink-0 rounded-xl sm:h-10 sm:w-10" />
        </div>
      </div>
      {children}
    </main>
  );
}
