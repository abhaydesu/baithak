import { artFor } from "@/lib/gameArt";
import { allGames, type CharacterKind, type Tone } from "@/lib/games";
import GameGlyph from "./GameGlyph";

interface CharacterProps {
  kind: CharacterKind;
  /** Kept for older call sites; the game's own colour is used. */
  tone?: Tone;
  className?: string;
  /** Kept for older call sites. */
  bare?: boolean;
}

/**
 * A game's picture on its play screens: its object on its colour field, the
 * same as on the games page. (Mascots stay on the marketing pages.)
 */
export default function Character({ kind, className }: CharacterProps) {
  const slug = allGames.find((g) => g.character === kind)?.slug ?? "";
  const art = artFor(slug);
  return (
    <span
      aria-hidden="true"
      className={`game-art inline-grid place-items-center overflow-hidden rounded-[1.4rem] ${className ?? ""}`}
      style={{ "--field": art.color } as React.CSSProperties}
    >
      <GameGlyph kind={art.glyph} className="h-[88%] w-auto" />
    </span>
  );
}
