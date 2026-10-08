import Link from "next/link";
import type { ReactNode } from "react";

import type { CharacterKind, Tone } from "@/lib/games";
import Character from "./Character";
import { BackIcon, ClockIcon, PhoneIcon, UsersIcon } from "./Icons";
import KitChecklist from "./KitChecklist";
import { LegoStuds, legoFor } from "./LegoButton";
import PlayLink from "./PlayLink";

export interface GameDetailsProps {
  title: string;
  description: string;
  details?: string;
  tone: Tone;
  character: CharacterKind;
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
 * The details page every game shares, mobile first: a header brick (what it
 * is, who it's for, play), then what you need, how to play and a start card.
 * Bricks are neutral; colour comes from the mascot, step badges and the
 * LEGO play button.
 */
export default function GameDetails(props: GameDetailsProps) {
  const { title, tone, play, tools } = props;
  const lego = `lego-${legoFor(tone)}`;
  const toneColor = `var(--lego-${legoFor(tone)})`;

  const playButton = (extra = "", restartClassName = "") =>
    play && (
      <PlayLink
        href={play.href}
        storageKey={play.storageKey}
        studs={3}
        className={`lego-btn ${lego} ${extra}`}
        restart
        restartClassName={restartClassName}
      />
    );

  const kitSection = (
    <section className="lego-card lego-card-static p-5 sm:p-6" aria-labelledby="kit-title">
      <LegoStuds count={2} className="lego-card-studs" />
      <h2 id="kit-title" className="font-display text-2xl font-bold tracking-[-0.01em] text-ink">
        What you need
      </h2>
      <p className="mb-3 mt-1 text-ink-soft">Tick things off as you gather them.</p>
      <KitChecklist items={props.kit} builtIn={props.builtIn} />
    </section>
  );

  const rulesSection = (
    <section
      id="rules"
      aria-labelledby="rules-title"
      className="lego-card lego-card-static scroll-mt-24 overflow-visible"
    >
      <LegoStuds count={3} className="lego-card-studs" />
      <h2
        id="rules-title"
        className="px-5 pt-5 font-display text-2xl font-bold tracking-[-0.01em] text-ink sm:px-6 sm:pt-6"
      >
        How to play
      </h2>
      <ol className="mt-3">
        {props.steps.map((step, i) => {
          const { label, body } = splitStep(step);
          return (
            <li key={step}>
              {i > 0 && <div className="lego-divider mx-5 sm:mx-6" />}
              <div className="flex gap-4 px-5 py-4 sm:px-6">
                <span
                  className="lego-badge shrink-0"
                  style={
                    {
                      "--c": toneColor,
                      color: tone === "yellow" ? "var(--color-ink)" : undefined,
                    } as React.CSSProperties
                  }
                >
                  {i + 1}
                </span>
                <p className="pt-1.5 text-[1.05rem] leading-relaxed text-ink-soft">
                  {label && <strong className="font-semibold text-ink">{label}. </strong>}
                  {body}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
      {props.note && (
        <>
          <div className="lego-divider mx-5 sm:mx-6" />
          <p className="px-5 py-4 text-sm leading-relaxed text-ink-soft sm:px-6">{props.note}</p>
        </>
      )}
    </section>
  );

  const startCard = play && (
    <section className="lego-card lego-card-static flex flex-col items-center gap-3 p-6 text-center">
      <LegoStuds count={3} className="lego-card-studs" />
      <Character kind={props.character} tone={tone} className="h-16 w-16" />
      <h2 className="font-display text-2xl font-bold tracking-[-0.01em] text-ink">
        Got the kit? Know the rules?
      </h2>
      <p className="-mt-1 text-ink-soft">{play.pitch}</p>
      {playButton(
        "lego-lg mt-2 w-full",
        "mt-1 font-semibold text-ink-soft underline decoration-line decoration-2 underline-offset-4 hover:text-ink",
      )}
    </section>
  );

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pt-4 sm:px-6 md:gap-10 md:pt-8 lg:px-8">
      <Link href="/games" className="keycap tone-white h-10 w-fit px-3 text-sm">
        <BackIcon width={18} height={18} /> All games
      </Link>

      <header className="lego-card lego-card-static p-5 sm:p-8">
        <LegoStuds count={4} className="lego-card-studs" />
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <span className="lego-chip">
              {props.onScreen ? (
                <>
                  <PhoneIcon width={13} height={13} /> Plays on screen
                </>
              ) : (
                "Play in person"
              )}
            </span>
            <h1 className="mt-3 font-display text-[clamp(2.4rem,10vw,4.25rem)] font-bold leading-[0.95] tracking-[-0.035em] text-ink">
              {title}
            </h1>
          </div>
          <Character
            kind={props.character}
            tone={tone}
            className="-mt-1 h-24 w-24 shrink-0 sm:h-36 sm:w-36"
          />
        </div>
        <p className="mt-4 max-w-2xl text-lg leading-snug text-ink sm:text-xl">
          {props.description}
        </p>
        {props.details && (
          <p className="mt-2 max-w-2xl leading-relaxed text-ink-soft">{props.details}</p>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="lego-chip">
            <UsersIcon width={14} height={14} /> {props.players} players
          </span>
          <span className="lego-chip">
            <ClockIcon width={14} height={14} /> {props.duration}
          </span>
        </div>
        <div className="lego-divider my-5" />
        <nav className="flex flex-wrap items-center gap-3" aria-label="Jump to">
          {play
            ? playButton("lego-btn-sm", "keycap tone-white h-11 px-4 text-sm")
            : tools && (
                <a href="#tools" className={`lego-btn lego-btn-sm ${lego}`}>
                  <LegoStuds count={3} />
                  Open the tools
                </a>
              )}
          <a href="#rules" className="keycap tone-white h-11 px-4 text-sm">
            Rules
          </a>
        </nav>
      </header>

      {play ? (
        <div className="grid gap-8 md:gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start">
          <div className="flex flex-col gap-8 md:gap-10">
            {kitSection}
            <div className="hidden lg:block">{startCard}</div>
          </div>
          <div className="flex flex-col gap-8 md:gap-10">
            {rulesSection}
            <div className="lg:hidden">{startCard}</div>
          </div>
        </div>
      ) : !tools ? (
        <div className="grid gap-8 md:gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start">
          {kitSection}
          {rulesSection}
        </div>
      ) : (
        <div className="grid gap-8 md:gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div className="flex flex-col gap-8 md:gap-10">
            {kitSection}
            {rulesSection}
          </div>
          {tools && (
            <section id="tools" aria-labelledby="tools-title" className="flex scroll-mt-24 flex-col gap-6">
              <h2
                id="tools-title"
                className="font-display text-2xl font-bold tracking-[-0.01em] text-ink sm:text-3xl"
              >
                Everything on the table
              </h2>
              {tools}
            </section>
          )}
        </div>
      )}
    </main>
  );
}
