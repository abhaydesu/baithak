import Link from "next/link";

import { allGames } from "@/lib/games";
import { SITE } from "@/lib/site";
import Mascot from "./Mascot";
import { LogoMark } from "./Logo";

const linkClass = "text-ink-soft transition-colors hover:text-ink";

export default function Footer() {
  return (
    <>
      <footer className="relative mt-24 overflow-hidden border-t border-line bg-paper-deep md:mt-32">
        <div className="mx-auto max-w-6xl px-5 pt-16 sm:px-6 lg:px-8 lg:pt-24">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.6fr_1.4fr] lg:gap-16">
            <div>
              <Link href="/" className="flex w-fit items-end gap-1.5" aria-label="Baithak home">
                <LogoMark className="h-[1.95rem]" />
                <span className="pb-[0.08em] font-display text-[1.7rem] font-bold leading-none tracking-[-0.02em] text-ink">
                  baithak
                </span>
              </Link>
              <p className="mt-5 max-w-xs leading-relaxed text-ink-soft">
                Party games for friends and family, run from one phone. Rules,
                timers, words and scores, ready when everyone is.
              </p>
            </div>

            <nav aria-label="Baithak">
              <h2 className="font-display font-bold text-ink">{SITE.name}</h2>
              <ul className="mt-4 space-y-2.5">
                {[
                  ["/games", "All games"],
                  ["/tools", "Timer & word deck"],
                  ["/#faq", "FAQ"],
                ].map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className={linkClass}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Games">
              <h2 className="font-display font-bold text-ink">Games</h2>
              <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5">
                {allGames.map((game) => (
                  <li key={game.slug}>
                    <Link href={game.href} className={linkClass}>
                      {game.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="mt-16 flex flex-col gap-1 border-t border-line pt-6 text-sm text-ink-soft sm:flex-row sm:justify-between">
            <p>
              © {new Date().getFullYear()} {SITE.name}
            </p>
            <p>Made for game nights across India.</p>
          </div>
        </div>

        {/* The cast from the logo, peeking up from the bottom of the page */}
        <div
          aria-hidden="true"
          className="mt-10 flex items-end justify-center gap-1 pb-28 md:-mb-8 md:mt-14 md:pb-0"
        >
          <Mascot kind="laddoo" mood="happy" className="h-20 w-20 -rotate-6 md:h-28 md:w-28" delay={0.4} />
          <Mascot kind="uncle" mood="cheer" color="#7c5cff" className="h-24 w-24 md:h-36 md:w-36" />
          <Mascot kind="samosa" mood="wink" className="h-20 w-20 rotate-6 md:h-28 md:w-28" delay={1.1} />
        </div>
      </footer>
    </>
  );
}
