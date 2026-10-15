import { notFound } from "next/navigation";

import GamePlayShell from "@/app/components/GamePlayShell";
import { offlineGames } from "@/lib/offlineGames";
import { playableGames } from "../../../playable";

interface PlayPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return offlineGames
    .filter((game) => playableGames[game.slug])
    .map((game) => ({ slug: game.slug }));
}

export async function generateMetadata({ params }: PlayPageProps) {
  const { slug } = await params;
  const game = offlineGames.find((item) => item.slug === slug);
  return {
    title: game ? `Play ${game.title}` : undefined,
    // The game screen itself; the details page is the one to rank.
    robots: { index: false, follow: true },
  };
}

export default async function PlayPage({ params }: PlayPageProps) {
  const { slug } = await params;
  const game = offlineGames.find((item) => item.slug === slug);
  const playable = playableGames[slug];

  if (!game || !playable) {
    notFound();
  }

  const { Game } = playable;
  return (
    <GamePlayShell slug={slug} title={game.title} detailsHref={playable.detailsHref}>
      <Game />
    </GamePlayShell>
  );
}
