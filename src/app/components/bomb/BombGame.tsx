"use client";

import { useEffect, useSyncExternalStore } from "react";

import { useScrollToTopOnChange } from "@/lib/useScrollToTop";
import { useTrackGame } from "@/lib/analytics/useTrackGame";
import { useWakeLock } from "@/lib/useWakeLock";
import { useBomb } from "@/store/bombStore";
import Studs from "../Studs";
import GameOver from "./GameOver";
import { Boom, Live, Ready } from "./Screens";
import Scoreboard from "./Scoreboard";
import Setup from "./Setup";

const subscribeHydration = (cb: () => void) =>
  useBomb.persist.onFinishHydration(cb);

export default function BombGame() {
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    () => useBomb.persist.hasHydrated(),
    () => false,
  );

  useEffect(() => {
    void useBomb.persist.rehydrate();
  }, []);

  const phase = useBomb((s) => s.phase);
  const inGame = phase !== "setup" && phase !== "gameover";
  useWakeLock(hydrated && inGame);
  useTrackGame("pass-the-bomb", phase, hydrated);
  useScrollToTopOnChange(phase, hydrated);

  if (!hydrated) {
    return (
      <div className="brick tone-white mt-3 grid min-h-[28rem] place-items-center p-6">
        <Studs count={3} />
        <p className="font-display text-lg font-bold text-ink/40">
          Finding the bomb…
        </p>
      </div>
    );
  }

  const tone =
    phase === "live" ? "red" : phase === "ready" ? "yellow" : "white";

  return (
    <div className="flex flex-col gap-5">
      {inGame && <Scoreboard />}
      <div
        className={`brick tone-${tone} mt-3 min-h-[28rem] p-5 transition-colors sm:p-7`}
        aria-live="polite"
      >
        <Studs count={3} />
        {phase === "setup" && <Setup />}
        {phase === "ready" && <Ready />}
        {phase === "live" && <Live />}
        {phase === "boom" && <Boom />}
        {phase === "gameover" && <GameOver />}
      </div>
    </div>
  );
}
