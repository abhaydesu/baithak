import Link from "next/link";
import type { ReactNode } from "react";

import { artFor } from "@/lib/gameArt";
import GameArt from "./GameArt";
import { BackIcon, ClockIcon, PhoneIcon, UsersIcon } from "./Icons";
import KitChecklist from "./KitChecklist";
import PlayLink from "./PlayLink";

export interface GameDetailsProps {
  /** Picks the game's colour and object (see src/lib/gameArt.ts). */
  slug: string;
  title: string;
  description: string;
  details?: string;
  players: string;
  duration: string;
  onScreen?: boolean;
  /** Things to gather. */
  kit: string[];
  /** Kit items the site already provides. */
  builtIn?: string[];
  steps: string[];
  /** Small print under the rules. */
  note?: string;
  /** Games with a full play mode get a "Play now" flow to their /play page. */
  play?: { href: string; storageKey: string; pitch: string };
  /** Loose tools, for games without a play mode yet. */
  tools?: ReactNode;
}

/** Splits "Setup: do the thing" into a bold label and body. */
function splitStep(step: string) {
  const match = step.match(/^([^:]{2,28}):\s*(.*)$/);
  if (!match) return { label: null, body: step };
  const body = match[2].charAt(0).toUpperCase() + match[2].slice(1);
  return { label: match[1], body };
}

/**
 * The details page every game shares, mobile first: the game's picture and
 * pitch with a play button, then what you need and how to play. The game's
 * colour shows up in three places only: its picture, the play button and the
 * step numbers.
 */
export default function GameDetails(props: GameDetailsProps) {
  const { title, play, tools } = props;
  const art = artFor(props.slug);
  const colour = { "--c": art.color, "--on": art.on } as React.CSSProperties;

  const playButton = (size: string, restartClassName: string) =>
    play && (
      <PlayLink
        href={play.href}
        storageKey={play.storageKey}
        className={`press ${size}`}
        style={colour}
        restart
        restartClassName={restartClassName}
      />
    );

  const kitSection = (
    <section aria-labelledby="kit-title">
      <h2 id="kit-title" className="font-display text-3xl font-bold tracking-[-0.02em] text-ink">
        What you need
      </h2>
      <p className="mb-5 mt-2 text-ink-soft">Tick things off as you gather them.</p>
      <KitChecklist items={props.kit} builtIn={props.builtIn} />
    </section>
  );

  const rulesSection = (
    <section id="rules" aria-labelledby="rules-title" className="scroll-mt-28">
      <h2 id="rules-title" className="font-display text-3xl font-bold tracking-[-0.02em] text-ink">
        How to play
      </h2>
      <ol className="mt-6 border-t border-line">
        {props.steps.map((step, i) => {
          const { label, body } = splitStep(step);
          return (
            <li key={step} className="flex gap-5 border-b border-line py-6">
              <span
                aria-hidden="true"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full font-display text-sm font-bold"
                style={{ background: art.color, color: art.on }}
              >
                {i + 1}
              </span>
              <p className="pt-0.5 text-[1.06rem] leading-relaxed text-ink-soft">
                {label && <strong className="font-semibold text-ink">{label}. </strong>}
                {body}
              </p>
            </li>
          );
        })}
      </ol>
      {props.note && (
        <p className="mt-6 text-sm leading-relaxed text-ink-soft">{props.note}</p>
      )}
    </section>
  );

  const startCard = play && (
    <section className="surface flex flex-col items-center gap-3 px-6 py-9 text-center">
      <h2 className="font-display text-2xl font-bold tracking-[-0.01em] text-ink">
        Got the kit? Know the rules?
      </h2>
      <p className="-mt-1 max-w-xs text-ink-soft">{play.pitch}</p>
      <div className="mt-4 flex w-full flex-col items-center gap-3">
        {playButton("w-full", "text-link text-sm")}
      </div>
    </section>
  );

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col px-5 pt-6 sm:px-6 md:pt-10 lg:px-8">
      <Link
        href="/games"
        className="inline-flex w-fit items-center gap-1.5 font-semibold text-ink-soft transition-colors hover:text-ink"
      >
        <BackIcon width={18} height={18} /> All games
      </Link>

      <header className="mt-6 grid items-center gap-8 lg:mt-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <GameArt
          slug={props.slug}
          className="aspect-[2/1] rounded-[1.75rem] sm:aspect-[16/10] lg:order-2 lg:aspect-[4/3] lg:rounded-[2rem]"
        />
        {/* On phones the long details drop below the buttons, so Play is on screen */}
        <div className="flex flex-col lg:order-1 lg:block">
          <p className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-ink-soft">
            {props.onScreen ? (
              <>
                <PhoneIcon width={15} height={15} /> Plays on screen
              </>
            ) : (
              "Play in person"
            )}
          </p>
          <h1 className="mt-3 font-display text-[clamp(2.8rem,9vw,5rem)] font-bold leading-[0.95] tracking-[-0.035em] text-ink">
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-xl leading-snug text-ink lg:mt-6">{props.description}</p>
          {props.details && (
            <p className="order-last mt-8 max-w-xl leading-relaxed text-ink-soft lg:order-none lg:mt-3">
              {props.details}
            </p>
          )}
          <p className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-medium text-ink-soft lg:mt-6">
            <span className="inline-flex items-center gap-1.5">
              <UsersIcon width={17} height={17} /> {props.players} players
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ClockIcon width={17} height={17} /> {props.duration}
            </span>
          </p>
          <nav className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4 lg:mt-10" aria-label="Jump to">
            {play
              ? playButton("press-lg", "pill")
              : tools && (
                  <a href="#tools" className="press press-lg" style={colour}>
                    Open the tools
                  </a>
                )}
            <a href="#rules" className="text-link">
              Read the rules
            </a>
          </nav>
        </div>
      </header>

      <div className="mt-20 border-t border-line pt-16 lg:mt-28 lg:pt-20">
        {play ? (
          <div className="grid gap-16 lg:grid-cols-[1fr_1.5fr] lg:items-start lg:gap-20">
            <div className="flex flex-col gap-12 lg:sticky lg:top-28">
              {kitSection}
              <div className="hidden lg:block">{startCard}</div>
            </div>
            <div className="flex flex-col gap-12">
              {rulesSection}
              <div className="lg:hidden">{startCard}</div>
            </div>
          </div>
        ) : !tools ? (
          <div className="grid gap-16 lg:grid-cols-[1fr_1.5fr] lg:items-start lg:gap-20">
            {kitSection}
            {rulesSection}
          </div>
        ) : (
          <div className="grid gap-16 lg:grid-cols-[1fr_1.1fr] lg:items-start lg:gap-20">
            <div className="flex flex-col gap-16">
              {kitSection}
              {rulesSection}
            </div>
            <section id="tools" aria-labelledby="tools-title" className="flex scroll-mt-28 flex-col gap-6">
              <h2 id="tools-title" className="font-display text-3xl font-bold tracking-[-0.02em] text-ink">
                Everything on the table
              </h2>
              {tools}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
