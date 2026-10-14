import { artFor } from "@/lib/gameArt";
import GameGlyph from "./GameGlyph";

/**
 * A game's picture: its colour field, a little grain and light, and its
 * object sitting in the middle. Sized by the parent.
 */
export default function GameArt({ slug, className = "" }: { slug: string; className?: string }) {
  const art = artFor(slug);
  return (
    <div
      aria-hidden="true"
      className={`game-art grain relative grid place-items-center overflow-hidden ${className}`}
      style={{ "--field": art.color } as React.CSSProperties}
    >
      <GameGlyph kind={art.glyph} className="game-glyph relative z-[1] h-[82%] w-auto" />
    </div>
  );
}
