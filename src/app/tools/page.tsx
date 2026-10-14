import type { Metadata } from "next";

import { pageMetadata } from "@/lib/seo";
import Marker from "../components/Marker";
import RandomWordGenerator from "../components/RandomWordGenerator";
import Timer from "../components/Timer";

export const metadata: Metadata = pageMetadata({
  title: "Game timer and random word generator",
  description:
    "A standalone game timer and random word deck for any party game you make up. Works in your phone's browser, no app needed.",
  path: "/tools",
  siteCard: true,
});

export default function ToolsPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-5 pt-10 sm:px-6 md:gap-16 md:pt-20 lg:px-8">
      <header className="flex items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-[clamp(2.8rem,7vw,5rem)] font-bold leading-[0.95] tracking-[-0.035em] text-ink">
            Bring your <Marker>own game.</Marker>
          </h1>
          <p className="mt-8 max-w-lg text-lg leading-relaxed text-ink-soft lg:text-xl">
            Playing something that isn&apos;t on the list? Grab a timer or a
            word deck and make up the rules as you go.
          </p>
        </div>
      </header>
      <div className="grid gap-8 md:grid-cols-2 md:items-start lg:gap-10">
        <RandomWordGenerator />
        <Timer />
      </div>
    </main>
  );
}
