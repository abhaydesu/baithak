import type { Metadata } from "next";

import BombGame from "@/app/components/bomb/BombGame";
import GamePlayShell from "@/app/components/GamePlayShell";

export const metadata: Metadata = {
  title: "Play Pass the Bomb",
  robots: { index: false, follow: true },
};

export default function PlayPassTheBombPage() {
  return (
    <GamePlayShell slug="pass-the-bomb" title="Pass the Bomb" detailsHref="/games/pass-the-bomb">
      <BombGame />
    </GamePlayShell>
  );
}
