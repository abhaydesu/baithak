import Mascot from "./Mascot";
import PhoneDemo from "./PhoneDemo";

/**
 * The hero picture: a playable phone with the gang crowding round it. The
 * uncle and didi peek from behind; the samosa and chai sit in front.
 */
export default function HeroShowcase() {
  return (
    <div className="relative mx-auto w-full max-w-[26rem] pb-6 lg:max-w-[30rem]">
      {/* A nudge to try it */}

      <Mascot
        kind="uncle"
        mood="cheer"
        color="#2f7bff"
        className="absolute bottom-20 -left-4 lg:-left-16 z-0 lg:z-12 h-28 w-28 -rotate-6 sm:h-28 sm:w-28 lg:bottom-24 lg:h-52 lg:w-52"
        delay={0.3}
      />
      <Mascot
        kind="didi"
        mood="happy"
        color="#ff4f9a"
        className="absolute bottom-24 -right-6 lg:-right-10 z-0 h-32 w-32 rotate-6 sm:h-34 sm:w-34 lg:bottom-28 lg:h-48 lg:w-48"
        delay={1.4}
      />

      <div className="relative z-10 mx-auto w-[15.5rem] pt-8 sm:w-[16.5rem]">
        <PhoneDemo />
      </div>

      <Mascot
        kind="samosa"
        mood="cheer"
        className="pointer-events-none absolute -bottom-4 lg:-bottom-6 left-4 z-20 h-26 w-26 sm:h-20 sm:w-20 lg:h-42 lg:w-42"
        delay={0.9}
      />
      <Mascot
        kind="chai"
        mood="wink"
        className="pointer-events-none absolute -bottom-2 lg:-bottom-5 right-4 z-10 h-24 w-24 sm:h-16 sm:w-16 lg:h-46 lg:w-46"
        delay={2}
      />
    </div>
  );
}
