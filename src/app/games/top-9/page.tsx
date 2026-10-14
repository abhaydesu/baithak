import type { Metadata } from "next";

import GameDetails from "@/app/components/GameDetails";
import JsonLd from "@/app/components/JsonLd";
import { onScreenGames } from "@/lib/games";
import { gameJsonLd, gameMetaDescription, pageMetadata } from "@/lib/seo";
import { top9Guide } from "@/lib/top9/guide";
import { playProps } from "../playable";

const game = onScreenGames.find((g) => g.slug === "top-9")!;
export const metadata: Metadata = pageMetadata({
  title: "How to play Top 9, a Family Feud-style game",
  description: gameMetaDescription({
    ...game,
    description: game.tagline,
    playable: true,
  }),
  path: game.href,
});

export default function TopNinePage() {
  return (
    <>
      <JsonLd
        data={gameJsonLd({
          title: game.title,
          description: `${game.tagline} ${top9Guide.details}`,
          path: game.href,
          players: game.players,
          duration: game.duration,
          kit: top9Guide.kit,
          steps: top9Guide.steps,
        })}
      />
      <GameDetails
      title={game.title}
      description={game.tagline}
      details={top9Guide.details}
      slug={game.slug}
      players={game.players}
      duration={game.duration}
      onScreen
      kit={top9Guide.kit}
      builtIn={top9Guide.builtIn}
      steps={top9Guide.steps}
      note={top9Guide.note}
      play={playProps("top-9")}
      />
    </>
  );
}
