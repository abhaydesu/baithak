import type { Metadata } from "next";
import Link from "next/link";

import Faq from "./components/Faq";
import { CardPeek, CardSpread } from "./components/Cards";
import HeroShowcase from "./components/HeroShowcase";
import JsonLd from "./components/JsonLd";
import LegoBuilder from "./components/LegoBuilder";
import Marker from "./components/Marker";
import PixelHorizon from "./components/PixelHorizon";
import PressButton from "./components/PressButton";
import SectionHeading from "./components/SectionHeading";
import { faqJsonLd, faqs } from "@/lib/faq";
import { BRAND } from "@/lib/gameArt";
import { allGames } from "@/lib/games";
import { absoluteUrl, SITE } from "@/lib/site";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const steps = [
  {
    color: BRAND.marigold,
    title: "Pick a game",
    body: "Imposter, Pictionary, a Family Feud-style survey game and more. Each one tells you exactly what you need.",
  },
  {
    color: BRAND.rani,
    title: "Pass the phone",
    body: "Secret words and roles show up for one person at a time. Everyone else, eyes off the screen.",
  },
  {
    color: BRAND.violet,
    title: "Play, we keep score",
    body: "Timers, turns and points are handled, so nobody has to sit out to run the game.",
  },
];

/** The three games that run start to finish on one phone. */
const FEATURED = ["imposter", "pictionary", "top-9"];

/** The hand peeking up from the closing band. */
const PEEK = ["charades", "pass-the-bomb", "mafia-werewolf", "hot-seat", "two-truths-one-lie"];

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      name: SITE.name,
      url: absoluteUrl("/"),
      description: SITE.description,
      inLanguage: SITE.language,
    },
    {
      "@type": "ItemList",
      name: `Party games on ${SITE.name}`,
      itemListElement: allGames.map((game, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: game.title,
        url: absoluteUrl(game.href),
      })),
    },
  ],
};

export default function Home() {
  const featured = FEATURED.map((slug) => allGames.find((g) => g.slug === slug)!);
  const peek = PEEK.map((slug) => allGames.find((g) => g.slug === slug)!);

  return (
    <main>
      <JsonLd data={siteJsonLd} />
      <JsonLd data={faqJsonLd()} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-0 pt-8 sm:gap-16 sm:px-6 sm:pb-24 sm:pt-10 lg:grid-cols-[1fr_1fr] lg:gap-10 lg:px-8 lg:pb-36 lg:pt-20">
          <div className="mx-auto w-full max-w-2xl text-center lg:mx-0 lg:text-left">
            <h1 className="font-display text-[clamp(2.7rem,10.5vw,3.75rem)] font-bold leading-[0.98] tracking-[-0.035em] text-ink lg:text-[5.5rem] lg:leading-[0.95]">
              Party games for every{" "}
              <Marker>baithak.</Marker>
            </h1>
            <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-ink-soft sm:mt-8 sm:text-xl lg:mx-0 lg:mt-10">
              Pass one phone around. It deals the words, runs the timer and
              keeps score, so everyone just plays.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-5 sm:mt-10 lg:justify-start">
              <PressButton href="/games" size="lg">
                Pick a game
              </PressButton>
              <Link href="#how" className="text-link">
                How it works
              </Link>
            </div>
          </div>

          <HeroShowcase />
        </div>
      </section>

      {/* How it works: the one game-night band */}
      <section id="how" aria-labelledby="how-title" className="night scroll-mt-20 overflow-hidden">
        <PixelHorizon />
        {/* Bottom padding leaves the hills clear of the steps */}
        <div className="relative z-[1] mx-auto max-w-6xl px-5 pb-[calc(var(--px)*15)] pt-20 sm:px-6 lg:px-8 lg:pb-[calc(var(--px)*16)] lg:pt-36">
          <h2
            id="how-title"
            className="max-w-3xl font-display text-[2.6rem] font-bold leading-[1] tracking-[-0.03em] sm:text-6xl lg:text-[4.5rem]"
          >
            One phone.
            <br />
            <span className="text-white/45">Everyone in.</span>
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/65 lg:text-xl">
            No boards, no cards, no setup. Just the people you&apos;re with.
          </p>
          <ol className="mt-14 grid border-t border-white/10 sm:grid-cols-3 lg:mt-24">
            {steps.map((step, i) => (
              <li
                key={step.title}
                className="border-b border-white/10 py-9 sm:border-b-0 sm:py-12 sm:pr-8 sm:[&:not(:first-child)]:border-l sm:[&:not(:first-child)]:pl-8 lg:pr-12 lg:[&:not(:first-child)]:pl-12"
              >
                <span
                  aria-hidden="true"
                  className="font-display text-[3.25rem] font-bold leading-none tracking-[-0.04em]"
                  style={{ color: step.color }}
                >
                  0{i + 1}
                </span>
                <h3 className="mt-8 font-display text-2xl font-bold text-white">{step.title}</h3>
                <p className="mt-3 text-[1.05rem] leading-relaxed text-white/60">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Featured games */}
      <section
        aria-labelledby="games-title"
        className="mx-auto max-w-6xl px-5 py-24 sm:px-6 lg:px-8 lg:py-36"
      >
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            id="games-title"
            title="Start with a favourite"
            description="These three run start to finish on one phone."
          />
          <Link href="/games" className="text-link">
            All {allGames.length} games
          </Link>
        </div>
        <div className="mt-10 lg:mt-16">
          <CardSpread games={featured} />
        </div>
      </section>

      {/* LEGO corner */}
      <section aria-labelledby="lego-title" className="bg-paper-deep">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-5 py-24 sm:px-6 lg:grid-cols-[1fr_1.3fr] lg:gap-20 lg:px-8 lg:py-36">
          <SectionHeading
            id="lego-title"
            title="Waiting for everyone to turn up?"
            description="Build something while the chai brews. Drag bricks onto the plate, stack them up, tap one to paint it."
          />
          <LegoBuilder />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-24 sm:px-6 lg:grid-cols-[1fr_1.6fr] lg:gap-20 lg:px-8 lg:py-36">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              id="faq-title"
              title="Questions, answered"
              description="What people ask before their first game night."
            />
          </div>
          <Faq items={faqs} />
        </div>
      </section>

      {/* Closing call to action: a hand of cards rising from the bottom */}
      <section className="-mb-24 overflow-hidden bg-marigold md:-mb-32">
        <div className="mx-auto max-w-6xl px-5 pt-20 text-center sm:px-6 lg:px-8 lg:pt-32">
          <h2 className="mx-auto max-w-3xl font-display text-[2.6rem] font-bold leading-[0.98] tracking-[-0.035em] text-ink sm:text-6xl lg:text-[5rem]">
            Everyone&apos;s on the sofa.
            <br />
            Let&apos;s play.
          </h2>
          <PressButton href="/games" size="lg" color="#ffffff" on="#1c1917" className="mt-10">
            Pick a game
          </PressButton>
        </div>
        <CardPeek games={peek} />
      </section>
    </main>
  );
}
