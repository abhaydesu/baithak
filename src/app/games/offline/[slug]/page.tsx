import type { Metadata } from "next";
import { notFound } from "next/navigation";

import GameDetails from "@/app/components/GameDetails";
import RandomWordGenerator from "@/app/components/RandomWordGenerator";
import Timer from "@/app/components/Timer";
import JsonLd from "@/app/components/JsonLd";
import { offlineGames } from "@/lib/offlineGames";
import { gameJsonLd, gameMetaDescription, pageMetadata } from "@/lib/seo";
import { playableGames, playProps } from "../../playable";

interface OfflineGamePageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return offlineGames.map((game) => ({ slug: game.slug }));
}

export async function generateMetadata({
  params,
}: OfflineGamePageProps): Promise<Metadata> {
  const { slug } = await params;
  const game = offlineGames.find((item) => item.slug === slug);
  if (!game) return {};
  return pageMetadata({
    title: `How to play ${game.title}`,
    description: gameMetaDescription({
      ...game,
      playable: Boolean(playableGames[game.slug]),
    }),
    path: `/games/offline/${game.slug}`,
  });
}

export default async function OfflineGamePage({
  params,
}: OfflineGamePageProps) {
  const { slug } = await params;
  const game = offlineGames.find((item) => item.slug === slug);

  if (!game) {
    notFound();
  }

  const play = playProps(game.slug);

  // Games without a play mode yet get their helpers as loose tools.
  const hasTimer =
    game.props.includes("Timer") ||
    game.extraComponents.some((c) => /timer/i.test(c));
  const hasWords = game.extraComponents.some((c) => /word|prompt/i.test(c));
  const comingSoon = game.extraComponents.filter(
    (c) => !/timer|word|prompt/i.test(c),
  );
  const tools =
    !play && (hasTimer || hasWords || comingSoon.length > 0) ? (
      <>
        {hasWords && <RandomWordGenerator tone="yellow" title="Prompt deck" />}
        {hasTimer && <Timer initialSeconds={60} tone={game.tone} />}
        {comingSoon.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-sm text-ink/60">
            Coming soon:
            {comingSoon.map((c) => (
              <span key={c} className="chip tone-white">
                {c}
              </span>
            ))}
          </div>
        )}
      </>
    ) : undefined;

  const kit = game.props.filter((p) => p !== "None");

  return (
    <>
      <JsonLd
        data={gameJsonLd({
          title: game.title,
          description: game.description,
          path: `/games/offline/${game.slug}`,
          players: game.players,
          duration: game.duration,
          kit,
          steps: game.steps,
        })}
      />
      <GameDetails
      title={game.title}
      description={game.description}
      details={game.details}
      tone={game.tone}
      character={game.character}
      players={game.players}
      duration={game.duration}
      kit={kit}
      builtIn={["Timer"]}
      steps={game.steps}
      note={game.note}
      play={play}
      tools={tools}
      />
    </>
  );
}
