import type { Metadata } from "next";

import GamePlayShell from "@/app/components/GamePlayShell";
import Top9Game from "@/app/components/top9/Top9Game";

export const metadata: Metadata = {
  title: "Play Top 9",
  robots: { index: false, follow: true },
};

export default function PlayTopNinePage() {
  return (
    <GamePlayShell slug="top-9" title="Top 9" detailsHref="/games/top-9">
      <Top9Game />
    </GamePlayShell>
  );
}
