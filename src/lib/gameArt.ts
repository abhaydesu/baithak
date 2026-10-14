/**
 * How each game looks in the catalogue: one colour field and one object.
 * Adding a game means adding a line to GAMES below (and a glyph in
 * GameGlyph.tsx if none of the existing objects fit), with a colour from the
 * brand palette. No new characters, no new colours.
 */

export type GlyphKind =
  | "tiles"
  | "bomb"
  | "fedora"
  | "mask"
  | "clapper"
  | "pencil"
  | "card"
  | "bubbles"
  | "chair"
  | "bolt"
  | "stopwatch"
  | "podium"
  | "chain";

export interface GameArt {
  /** The colour field behind the object. */
  color: string;
  glyph: GlyphKind;
  /** Text colour that reads on `color`. */
  on: string;
}

/**
 * The brand palette: the colours of the pixel horizon on the home page.
 * Every accent on the site comes from here; the rest is paper and ink.
 */
export const BRAND = {
  marigold: "#f5b82e",
  saffron: "#f2862e",
  rani: "#e2457e",
  violet: "#7c5cff",
  indigo: "#4b3a9e",
  night: "#15121f",
} as const;

const INK = "#1c1917";
const WHITE = "#ffffff";

const ON: Record<keyof typeof BRAND, string> = {
  marigold: INK,
  saffron: INK,
  rani: WHITE,
  violet: WHITE,
  indigo: WHITE,
  night: WHITE,
};

/**
 * In catalogue order. Colours are picked so neighbours in a one, two or three
 * column grid never match, and the three featured games on the home page
 * (Imposter, Pictionary, Top 9) are all different.
 */
const GAMES: Array<[slug: string, glyph: GlyphKind, colour: keyof typeof BRAND]> = [
  ["top-9", "tiles", "marigold"],
  ["pass-the-bomb", "bomb", "rani"],
  ["mafia-werewolf", "fedora", "indigo"],
  ["charades", "mask", "saffron"],
  ["dumb-charades", "clapper", "violet"],
  ["pictionary", "pencil", "night"],
  ["imposter", "card", "rani"],
  ["two-truths-one-lie", "bubbles", "marigold"],
  ["hot-seat", "chair", "indigo"],
  ["categories-quickfire", "bolt", "saffron"],
  ["five-second-challenge", "stopwatch", "violet"],
  ["rank-your-friends", "podium", "night"],
  ["weakest-link", "chain", "marigold"],
];

export const GAME_ART: Record<string, GameArt> = Object.fromEntries(
  GAMES.map(([slug, glyph, colour]) => [slug, { glyph, color: BRAND[colour], on: ON[colour] }]),
);

const FALLBACK: GameArt = { color: BRAND.night, glyph: "tiles", on: WHITE };

export const artFor = (slug: string): GameArt => GAME_ART[slug] ?? FALLBACK;
