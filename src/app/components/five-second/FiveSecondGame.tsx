"use client";

import { useEffect, useSyncExternalStore } from "react";

import { useTrackGame } from "@/lib/analytics/useTrackGame";
import { useScrollToTopOnChange } from "@/lib/useScrollToTop";
import { useWakeLock } from "@/lib/useWakeLock";
import { currentTeam, useFiveSecond } from "@/store/fiveSecondStore";
import Studs from "../Studs";
import GameOver from "./GameOver";
import Scoreboard from "./Scoreboard";
import { Handoff, Judge, Live } from "./Screens";
import Setup from "./Setup";

const subscribeHydration = (cb: () => void) =>
  useFiveSecond.persist.onFinishHydration(cb);

export default function FiveSecondGame() {
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    () => useFiveSecond.persist.hasHydrated(),
    () => false,
  );

  useEffect(() => {
    void useFiveSecond.persist.rehydrate();
  }, []);

  const phase = useFiveSecond((s) => s.phase);
  const tone = useFiveSecond((s) =>
    s.phase === "setup" || s.phase === "gameover" ? "white" : currentTeam(s).tone,
  );
  const inGame = phase !== "setup" && phase !== "gameover";
  useWakeLock(hydrated && inGame);
  useTrackGame("five-second-challenge", phase, hydrated);
  useScrollToTopOnChange(phase, hydrated);

  if (!hydrated) {
    return (
      <div className="brick tone-white mt-3 grid min-h-[28rem] place-items-center p-6">
        <Studs count={3} />
        <p className="font-display text-lg font-bold text-ink/40">
          Starting the clock…
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {inGame && <Scoreboard />}
      <div
        className={`brick tone-${tone} mt-3 min-h-[28rem] p-5 transition-colors sm:p-7`}
        aria-live="polite"
      >
        <Studs count={3} />
        {phase === "setup" && <Setup />}
        {phase === "handoff" && <Handoff />}
        {phase === "live" && <Live />}
        {phase === "judge" && <Judge />}
        {phase === "gameover" && <GameOver />}
      </div>
    </div>
  );
}
