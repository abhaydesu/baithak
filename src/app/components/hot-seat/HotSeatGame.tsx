"use client";

import { useEffect, useSyncExternalStore } from "react";

import { useScrollToTopOnChange } from "@/lib/useScrollToTop";
import { useTrackGame } from "@/lib/analytics/useTrackGame";
import { useWakeLock } from "@/lib/useWakeLock";
import { currentTeam, useHotSeat } from "@/store/hotSeatStore";
import Studs from "../Studs";
import GameOver from "./GameOver";
import Scoreboard from "./Scoreboard";
import Setup from "./Setup";
import { Acting, Handoff, Result } from "./TurnScreens";

const subscribeHydration = (cb: () => void) => useHotSeat.persist.onFinishHydration(cb);

export default function HotSeatGame() {
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    () => useHotSeat.persist.hasHydrated(),
    () => false,
  );

  useEffect(() => {
    void useHotSeat.persist.rehydrate();
  }, []);

  const phase = useHotSeat((s) => s.phase);
  // The stage takes the colour of the team taking its turn.
  const tone = useHotSeat((s) =>
    s.phase === "setup" || s.phase === "gameover" ? "white" : (currentTeam(s)?.tone ?? "white"),
  );

  const inGame = phase !== "setup" && phase !== "gameover";
  useWakeLock(hydrated && inGame);
  useTrackGame("hot-seat", phase, hydrated);
  useScrollToTopOnChange(phase, hydrated);

  if (!hydrated) {
    return (
      <div className="brick tone-white mt-3 grid min-h-[28rem] place-items-center p-6">
        <Studs count={3} />
        <p className="font-display text-lg font-bold text-ink/40">Warming up the hot seat…</p>
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
        {phase === "acting" && <Acting />}
        {phase === "result" && <Result />}
        {phase === "gameover" && <GameOver />}
      </div>
    </div>
  );
}
