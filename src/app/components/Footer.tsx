import Link from "next/link";

import { allGames } from "@/lib/games";
import { SITE } from "@/lib/site";
import Mascot, { type MascotKind, type MascotMood } from "./Mascot";
import { LogoMark } from "./Logo";

type Friend = { kind: MascotKind; mood: MascotMood; color?: string; rot: number; lift?: number };

// The gang, tumbled in a heap on the floor: a back row sitting in the gaps of a front row.
const BACK_ROW: Friend[] = [
  { kind: "dice", mood: "shocked", color: "#ffc233", rot: -14 },
  { kind: "kulfi", mood: "happy", color: "#ff8fb8", rot: 9 },
  { kind: "uncle", mood: "happy", color: "#2f7bff", rot: -6 },
  { kind: "jalebi", mood: "cheer", rot: 16 },
  { kind: "didi", mood: "wink", color: "#ff4f9a", rot: -10 },
  { kind: "mango", mood: "happy", rot: 7 },
  { kind: "paan", mood: "happy", rot: 18 },
  { kind: "bhutta", mood: "cheer", rot: -12 },
  { kind: "uncle", mood: "shocked", color: "#ff7a2f", rot: 5 },
  { kind: "jamun", mood: "happy", rot: -16 },
];
const FRONT_ROW: Friend[] = [
  { kind: "samosa", mood: "cheer", rot: -8 },
  { kind: "golgappa", mood: "sweaty", rot: 12 },
  { kind: "chai", mood: "wink", rot: -18 },
  { kind: "laddoo", mood: "happy", rot: 6 },
  { kind: "mango", mood: "cheer", rot: -5 },
  { kind: "didi", mood: "happy", color: "#2f7bff", rot: 14 },
  { kind: "vadapav", mood: "wink", rot: -11 },
  { kind: "pakora", mood: "shifty", rot: 9 },
  { kind: "chai", mood: "happy", rot: -7 },
  { kind: "jamun", mood: "sweaty", rot: 17 },
  { kind: "uncle", mood: "wink", color: "#ff4f9a", rot: -13 },
];

function Row({ friends, className, offset }: { friends: Friend[]; className: string; offset: number }) {
  return (
    <div className={`flex flex-none items-end justify-center ${className}`}>
      {friends.map((f, i) => (
        <div
          key={i}
          className="-mx-5 flex-none sm:-mx-7 md:-mx-9"
          style={{ transform: `rotate(${f.rot}deg)` }}
        >
          <Mascot
            kind={f.kind}
            mood={f.mood}
            color={f.color}
            className="h-32 w-32 sm:h-44 sm:w-44 md:h-56 md:w-56"
            delay={offset + i * 0.6}
          />
        </div>
      ))}
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-ink text-white md:mt-32">
      <div className="mx-auto max-w-6xl px-6 pt-14 lg:px-8 lg:pt-20">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link href="/" className="flex items-center gap-2" aria-label="Baithak home">
              <LogoMark className="h-10" />
              <span className="font-display text-[1.7rem] font-bold leading-none tracking-[-0.02em]">
                baithak
              </span>
            </Link>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-white/70">
              Party games for friends and family, run from one phone. Rules,
              timers, words and scores, ready when everyone is.
            </p>
          </div>

          <nav aria-label="Baithak">
            <h2 className="sr-only">{SITE.name}</h2>
            <ul className="flex flex-wrap gap-2">
              {[
                ["/games", "All games"],
                ["/tools", "Timer & word deck"],
                ["/#faq", "FAQ"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="block rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <nav aria-label="Games" className="mt-10 border-t border-white/10 pt-6">
          <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-white/40">
            Games
          </h2>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2.5 text-white/70">
            {allGames.map((game) => (
              <li key={game.slug}>
                <Link href={game.href} className="transition-colors hover:text-white">
                  {game.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-10 flex flex-col gap-1 text-sm text-white/50 sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.name}
          </p>
          <p>Made for game nights across India.</p>
        </div>
      </div>

      {/* The heap: everyone has fallen to the bottom of the page */}
      <div aria-hidden="true" className="relative mt-6 flex flex-col items-center pb-24 md:mt-10 md:pb-0">
        <Row friends={BACK_ROW} offset={0.3} className="relative z-0 -mb-16 translate-x-6 sm:-mb-24 md:-mb-32" />
        <Row friends={FRONT_ROW} offset={0} className="relative z-10 -mb-5 sm:-mb-8 md:-mb-12" />
      </div>
    </footer>
  );
}
