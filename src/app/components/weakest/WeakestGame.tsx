"use client";

import { useEffect, useSyncExternalStore } from "react";

import { useTrackGame } from "@/lib/analytics/useTrackGame";
import { useScrollToTopOnChange } from "@/lib/useScrollToTop";
import { useWakeLock } from "@/lib/useWakeLock";
import { useWeakest } from "@/store/weakestStore";
import Studs from "../Studs";
import GameOver from "./GameOver";
import Scoreboard from "./Scoreboard";
import { Final, Intro, RoundOver, RoundScreen, Vote } from "./Screens";
import Setup from "./Setup";

const subscribeHydration = (cb: () => void) => useWeakest.persist.onFinishHydration(cb);

export default function WeakestGame() {
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    () => useWeakest.persist.hasHydrated(),
    () => false,
  );

  useEffect(() => {
    void useWeakest.persist.rehydrate();
  }, []);

  const phase = useWeakest((s) => s.phase);
  const inGame = phase !== "setup" && phase !== "gameover";
  useWakeLock(hydrated && inGame);
  useTrackGame("weakest-link", phase, hydrated);
  useScrollToTopOnChange(phase, hydrated);

  if (!hydrated) {
    return (
      <div className="brick tone-white mt-3 grid min-h-[28rem] place-items-center p-6">
        <Studs count={3} />
        <p className="font-display text-lg font-bold text-ink/40">Warming up the quizmaster…</p>
      </div>
    );
  }

  const tone = phase === "round" ? "blue" : phase === "vote" ? "red" : "white";

  return (
    <div className="flex flex-col gap-5">
      {inGame && <Scoreboard />}
      <div
        className={`brick tone-${tone} mt-3 min-h-[28rem] p-5 transition-colors sm:p-7`}
        aria-live="polite"
      >
        <Studs count={3} />
        {phase === "setup" && <Setup />}
        {phase === "intro" && <Intro />}
        {phase === "round" && <RoundScreen />}
        {phase === "roundover" && <RoundOver />}
        {phase === "vote" && <Vote />}
        {phase === "final" && <Final />}
        {phase === "gameover" && <GameOver />}
      </div>
    </div>
  );
}
