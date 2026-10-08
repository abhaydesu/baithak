"use client";

import { useEffect, useSyncExternalStore } from "react";

import { useTrackGame } from "@/lib/analytics/useTrackGame";
import { useScrollToTopOnChange } from "@/lib/useScrollToTop";
import { useWakeLock } from "@/lib/useWakeLock";
import { useCategories } from "@/store/categoriesStore";
import Studs from "../Studs";
import GameOver from "./GameOver";
import Scoreboard from "./Scoreboard";
import { Handoff, Live, Result } from "./Screens";
import Setup from "./Setup";

const subscribeHydration = (cb: () => void) =>
  useCategories.persist.onFinishHydration(cb);

export default function CategoriesGame() {
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    () => useCategories.persist.hasHydrated(),
    () => false,
  );

  useEffect(() => {
    void useCategories.persist.rehydrate();
  }, []);

  const phase = useCategories((s) => s.phase);
  const inGame = phase !== "setup" && phase !== "gameover";
  useWakeLock(hydrated && inGame);
  useTrackGame("categories-quickfire", phase, hydrated);
  useScrollToTopOnChange(phase, hydrated);

  if (!hydrated) {
    return (
      <div className="brick tone-white mt-3 grid min-h-[28rem] place-items-center p-6">
        <Studs count={3} />
        <p className="font-display text-lg font-bold text-ink/40">
          Shuffling the categories…
        </p>
      </div>
    );
  }

  const tone = phase === "live" ? "green" : "white";

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
        {phase === "result" && <Result />}
        {phase === "gameover" && <GameOver />}
      </div>
    </div>
  );
}
