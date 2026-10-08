import type { Metadata } from "next";

import GameDetails from "@/app/components/GameDetails";
import JsonLd from "@/app/components/JsonLd";
import { bombGuide } from "@/lib/bomb/guide";
import { onScreenGames } from "@/lib/games";
import { gameJsonLd, gameMetaDescription, pageMetadata } from "@/lib/seo";
import { playProps } from "../playable";

const game = onScreenGames.find((g) => g.slug === "pass-the-bomb")!;
export const metadata: Metadata = pageMetadata({
  title: "How to play Pass the Bomb, a word game with a ticking fuse",
  description: gameMetaDescription({
    ...game,
    description: game.tagline,
    playable: true,
  }),
  path: game.href,
});

export default function PassTheBombPage() {
  return (
    <>
      <JsonLd
        data={gameJsonLd({
          title: game.title,
          description: `${game.tagline} ${bombGuide.details}`,
          path: game.href,
          players: game.players,
          duration: game.duration,
          kit: bombGuide.kit,
          steps: bombGuide.steps,
        })}
      />
      <GameDetails
        title={game.title}
        description={game.tagline}
        details={bombGuide.details}
        tone={game.tone}
        character={game.character}
        players={game.players}
        duration={game.duration}
        onScreen
        kit={bombGuide.kit}
        builtIn={bombGuide.builtIn}
        steps={bombGuide.steps}
        note={bombGuide.note}
        play={playProps("pass-the-bomb")}
      />
    </>
  );
}
