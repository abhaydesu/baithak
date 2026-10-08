import type { ComponentType } from "react";

import BombGame from "@/app/components/bomb/BombGame";
import CategoriesGame from "@/app/components/categories/CategoriesGame";
import CharadesGame from "@/app/components/charades/CharadesGame";
import DumbCharadesGame from "@/app/components/dumb-charades/DumbCharadesGame";
import FiveSecondGame from "@/app/components/five-second/FiveSecondGame";
import HotSeatGame from "@/app/components/hot-seat/HotSeatGame";
import ImposterGame from "@/app/components/imposter/ImposterGame";
import MafiaGame from "@/app/components/mafia/MafiaGame";
import PictionaryGame from "@/app/components/pictionary/PictionaryGame";
import RankGame from "@/app/components/rank/RankGame";
import WeakestGame from "@/app/components/weakest/WeakestGame";
import Top9Game from "@/app/components/top9/Top9Game";
import { STORAGE_KEYS } from "@/lib/storageKeys";

export interface PlayableGame {
  Game: ComponentType;
  /** Where the game saves progress, used to offer "Resume game". */
  storageKey: string;
  /** The details page; the game itself lives at `${detailsHref}/play`. */
  detailsHref: string;
  /** One line on the "Play now" card. */
  pitch: string;
}

/**
 * Games with a full play mode. Each one follows the same structure: a details
 * page (what you need + how to play + "Play now"), and the game on /play.
 */
export const playableGames: Record<string, PlayableGame> = {
  pictionary: {
    Game: PictionaryGame,
    storageKey: STORAGE_KEYS.pictionary,
    detailsHref: "/games/offline/pictionary",
    pitch: "Set up teams and let this phone run the game.",
  },
  "top-9": {
    Game: Top9Game,
    storageKey: STORAGE_KEYS.top9,
    detailsHref: "/games/top-9",
    pitch: "Name your teams, pick a host (or don't), and bring up the board.",
  },
  charades: {
    Game: CharadesGame,
    storageKey: STORAGE_KEYS.charades,
    detailsHref: "/games/offline/charades",
    pitch: "Set up teams, then pass the phone to whoever's acting.",
  },
  "dumb-charades": {
    Game: DumbCharadesGame,
    storageKey: STORAGE_KEYS.dumbCharades,
    detailsHref: "/games/offline/dumb-charades",
    pitch: "Set up teams, then pass the phone to whoever's picking.",
  },
  imposter: {
    Game: ImposterGame,
    storageKey: STORAGE_KEYS.imposter,
    detailsHref: "/games/offline/imposter",
    pitch: "Add everyone in seating order and deal the cards.",
  },
  "mafia-werewolf": {
    Game: MafiaGame,
    storageKey: STORAGE_KEYS.mafia,
    detailsHref: "/games/offline/mafia-werewolf",
    pitch: "Add everyone in seating order, deal the roles and start the night.",
  },
  "pass-the-bomb": {
    Game: BombGame,
    storageKey: STORAGE_KEYS.bomb,
    detailsHref: "/games/pass-the-bomb",
    pitch: "Add everyone in seating order, pick a fuse and light it.",
  },
  "hot-seat": {
    Game: HotSeatGame,
    storageKey: STORAGE_KEYS.hotSeat,
    detailsHref: "/games/offline/hot-seat",
    pitch: "Set up teams, then hand the phone to whoever's describing.",
  },
  "categories-quickfire": {
    Game: CategoriesGame,
    storageKey: STORAGE_KEYS.categories,
    detailsHref: "/games/offline/categories-quickfire",
    pitch: "Add everyone in seating order and pick your categories.",
  },
  "five-second-challenge": {
    Game: FiveSecondGame,
    storageKey: STORAGE_KEYS.fiveSecond,
    detailsHref: "/games/offline/five-second-challenge",
    pitch: "Name your teams, pick your categories and start the clock.",
  },
  "rank-your-friends": {
    Game: RankGame,
    storageKey: STORAGE_KEYS.rank,
    detailsHref: "/games/offline/rank-your-friends",
    pitch: "Add everyone, pick your topics and start ranking.",
  },
  "weakest-link": {
    Game: WeakestGame,
    storageKey: STORAGE_KEYS.weakest,
    detailsHref: "/games/offline/weakest-link",
    pitch: "Add the players, pick a quizmaster and start the clock.",
  },
};

export function playProps(slug: string) {
  const game = playableGames[slug];
  if (!game) return undefined;
  return {
    href: `${game.detailsHref}/play`,
    storageKey: game.storageKey,
    pitch: game.pitch,
  };
}
