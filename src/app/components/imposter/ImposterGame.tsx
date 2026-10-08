"use client";

import { useEffect, useSyncExternalStore } from "react";

import { useScrollToTopOnChange } from "@/lib/useScrollToTop";
import { useTrackGame } from "@/lib/analytics/useTrackGame";
import { useWakeLock } from "@/lib/useWakeLock";
import { useImposter } from "@/store/imposterStore";
import Studs from "../Studs";
import GameOver from "./GameOver";
import {
  Discuss,
  Guess,
  Pass,
  Reveal,
  RoundOver,
  Verdict,
  Vote,
} from "./RoundScreens";
import Scoreboard from "./Scoreboard";
import Setup from "./Setup";

const subscribeHydration = (cb: () => void) =>
  useImposter.persist.onFinishHydration(cb);

export default function ImposterGame() {
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    () => useImposter.persist.hasHydrated(),
    () => false,
  );

  useEffect(() => {
    void useImposter.persist.rehydrate();
  }, []);

  const phase = useImposter((s) => s.phase);
  const inGame = phase !== "setup" && phase !== "gameover";
  useWakeLock(hydrated && inGame);
  useTrackGame("imposter", phase, hydrated);
  useScrollToTopOnChange(phase, hydrated);

  if (!hydrated) {
    return (
      <div className="brick tone-white mt-3 grid min-h-[28rem] place-items-center p-6">
        <Studs count={3} />
        <p className="font-display text-lg font-bold text-ink/40">
          Shuffling the cards…
        </p>
      </div>
    );
  }

  // Every player sees the same colours, so nobody can tell cards apart from
  // across the room.
  const tone = phase === "setup" || phase === "gameover" ? "white" : "green";

  return (
    <div className="flex flex-col gap-5">
      {inGame && <Scoreboard />}
      <div
        className={`brick tone-${tone} mt-3 min-h-[28rem] p-5 transition-colors sm:p-7`}
        aria-live="polite"
      >
        <Studs count={3} />
        {phase === "setup" && <Setup />}
        {phase === "pass" && <Pass />}
        {phase === "reveal" && <Reveal />}
        {phase === "discuss" && <Discuss />}
        {phase === "vote" && <Vote />}
        {phase === "verdict" && <Verdict />}
        {phase === "guess" && <Guess />}
        {phase === "roundover" && <RoundOver />}
        {phase === "gameover" && <GameOver />}
      </div>
    </div>
  );
}
