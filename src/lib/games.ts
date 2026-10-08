import { offlineGames } from "./offlineGames";

export type Tone =
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "pink"
  | "white";

export type CharacterKind =
  | "detective"
  | "actor"
  | "artist"
  | "fibber"
  | "teller"
  | "mimer"
  | "hotseat"
  | "writer"
  | "bomber"
  | "jamun"
  | "vadapav"
  | "paan"
  | "bhutta"
  | "pakora"
  | "host";

export type GameKind = "on-screen" | "offline";

export interface CatalogGame {
  slug: string;
  title: string;
  tagline: string;
  href: string;
  kind: GameKind;
  tone: Tone;
  character: CharacterKind;
  players: string;
  duration: string;
  /** Physical things you need beyond a phone. Empty = nothing extra. */
  needs: string[];
}

export const onScreenGames: CatalogGame[] = [
  {
    slug: "top-9",
    title: "Top 9",
    tagline: "Family Feud-style rounds with hidden answers and hype reveals.",
    href: "/games/top-9",
    kind: "on-screen",
    tone: "yellow",
    character: "host",
    players: "4–12",
    duration: "20–40 min",
    needs: [],
  },
  {
    slug: "pass-the-bomb",
    title: "Pass the Bomb",
    tagline: "Rapid-fire word guessing with a ticking timer and chaos.",
    href: "/games/pass-the-bomb",
    kind: "on-screen",
    tone: "red",
    character: "bomber",
    players: "3–10",
    duration: "10–20 min",
    needs: [],
  },
];

export const allGames: CatalogGame[] = [
  ...onScreenGames,
  ...offlineGames.map((game) => ({
    slug: game.slug,
    title: game.title,
    tagline: game.description,
    href: `/games/offline/${game.slug}`,
    kind: "offline" as const,
    tone: game.tone,
    character: game.character,
    players: game.players,
    duration: game.duration,
    needs: game.props.filter((prop) => prop !== "None" && prop !== "Timer"),
  })),
];
