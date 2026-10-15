import { allGames } from "@/lib/games";
import Mascot from "./Mascot";
import PixelHorizon from "./PixelHorizon";
import PhoneDemo from "./PhoneDemo";
import { Sticker, SpinBadge } from "./Stickers";

/**
 * The hero picture: a playable phone in front of an indigo panel, with the
 * cast (didi, uncle, samosa, laddoo) peeking over the panel's top edge to
 * watch, like friends leaning over the back of a sofa. Their lower halves
 * sit behind the panel, so they're anchored to it rather than floating.
 * On wide screens they peek in pairs, didi and uncle on the left, samosa
 * and laddoo on the right; narrower screens keep one on each side.
 */
const games = allGames.map(({ slug, title, href }) => ({ slug, title, href }));

export default function HeroShowcase() {
  return (
    <div className="relative -mx-5 w-[calc(100%+2.5rem)] max-w-none px-5 pt-10 sm:mx-auto sm:w-full sm:max-w-[28rem] sm:px-0 lg:max-w-[33rem] lg:pt-14">
      {/* The cast, behind the panel: only what's above its top edge shows */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[22%] z-0 h-0">
        {/* The didi behind, the uncle tucked in front of her, peeking as a pair */}
        {/* Only wide screens have room beside the phone for the pair; below that the uncle and samosa peek one on each side, and phones skip the stickers to stay uncluttered */}
        <Mascot
          kind="didi"
          mood="wink"
          color="#e2457e"
          className="absolute -left-2 hidden h-[5.75rem] w-[5.75rem] -translate-y-[78%] -rotate-6 lg:block"
          delay={0.6}
        />
        <Mascot
          kind="uncle"
          mood="cheer"
          color="#7c5cff"
          className="absolute -left-1 h-24 w-24 -translate-y-[74%] -rotate-6 sm:h-28 sm:w-28 lg:left-[3.4rem] lg:h-[6.25rem] lg:w-[6.25rem] lg:-translate-y-[68%] lg:rotate-3"
          delay={0.3}
        />
        {/* The samosa behind, the laddoo tucked in front of it, peeking as a pair */}
        <Mascot
          kind="samosa"
          mood="cheer"
          className="absolute -right-1 h-24 w-24 -translate-y-[74%] rotate-6 sm:h-24 sm:w-24 lg:h-28 lg:w-28"
          delay={0.9}
        />
        {/* Only wide screens have room beside the phone for the laddoo too */}
        <Mascot
          kind="laddoo"
          mood="happy"
          className="absolute right-[4.2rem] hidden h-[5.5rem] w-[5.5rem] -translate-y-[70%] lg:block"
          delay={1.4}
        />
      </div>

      {/* The panel */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 top-[22%] z-[1] rounded-t-[1.75rem] bg-indigo sm:rounded-[2rem] lg:rounded-[2.5rem]" />

      {/* Match the night section's pixel terrain and dithered brand colour bands. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 top-[22%] z-[2] overflow-hidden rounded-t-[1.75rem] sm:rounded-[2rem] lg:rounded-[2.5rem]">
        <PixelHorizon compact />
      </div>

      <div className="relative z-10 mx-auto w-[min(14.5rem,72vw)] sm:w-[16rem] lg:w-[15.5rem]">
        <PhoneDemo games={games} />
      </div>
      {/* Stickers on the panel */}
      <SpinBadge className="absolute hidden sm:block right-1 top-[16%] z-20 h-24 w-24 rotate-12 sm:-right-5 sm:h-28 sm:w-28 lg:-right-10 lg:h-32 lg:w-32" />
      <Sticker className="animate-bob absolute bottom-24 left-1 z-20 hidden sm:inline-flex -rotate-6 sm:-left-6 lg:-left-12">No app. No sign-up.</Sticker>
      <Sticker color="#f2862e" className="absolute bottom-32 right-1 z-20 hidden sm:inline-flex rotate-6 sm:-right-4 lg:-right-8">2–15 players</Sticker>
      <p className="relative z-10 py-4 text-center text-xs font-semibold tracking-wide text-white sm:text-sm lg:py-5">
        <span className="inline-flex rounded-full border border-white/15 bg-indigo/70 px-3 py-1 shadow-sm backdrop-blur-md">
          Tap a game to try it
        </span>
      </p>
    </div>
  );
}
