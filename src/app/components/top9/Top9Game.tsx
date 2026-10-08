"use client";

import { useEffect, useSyncExternalStore } from "react";

import { useScrollToTopOnChange } from "@/lib/useScrollToTop";
import { useTrackGame } from "@/lib/analytics/useTrackGame";
import { useWakeLock } from "@/lib/useWakeLock";
import { otherTeam, useTop9 } from "@/store/top9Store";
import Studs from "../Studs";
import GameOver from "./GameOver";
import { Faceoff, Intro, Play, RoundEnd, Steal } from "./RoundScreens";
import Scoreboard from "./Scoreboard";
import Setup from "./Setup";

const subscribeHydration = (cb: () => void) =>
  useTop9.persist.onFinishHydration(cb);

export default function Top9Game() {
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    () => useTop9.persist.hasHydrated(),
    () => false,
  );

  useEffect(() => {
    void useTop9.persist.rehydrate();
  }, []);

  const phase = useTop9((s) => s.phase);
  // Stage colour follows whoever is on the clock.
  const tone = useTop9((s) => {
    if (s.phase === "play" && s.control !== null)
      return s.teams[s.control].tone;
    if (s.phase === "steal" && s.control !== null)
      return s.teams[otherTeam(s.control)].tone;
    if (s.phase === "roundEnd" && s.roundWinner !== null)
      return s.teams[s.roundWinner].tone;
    if (s.phase === "intro" || s.phase === "faceoff") return "yellow";
    return "white";
  });

  const inGame = phase !== "setup" && phase !== "gameover";
  useWakeLock(hydrated && inGame);
  useTrackGame("top-9", phase, hydrated);
  useScrollToTopOnChange(phase, hydrated);

  if (!hydrated) {
    return (
      <div className="brick tone-white mt-3 grid min-h-[28rem] place-items-center p-6">
        <Studs count={3} />
        <p className="font-display text-lg font-bold text-ink/40">
          Setting up the board…
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {inGame && <Scoreboard />}
      <div
        className={`brick tone-${tone} mt-3 min-h-[28rem] p-5 transition-colors sm:p-7`}
      >
        <Studs count={3} />
        {phase === "setup" && <Setup />}
        {phase === "intro" && <Intro />}
        {phase === "faceoff" && <Faceoff />}
        {phase === "play" && <Play />}
        {phase === "steal" && <Steal />}
        {phase === "roundEnd" && <RoundEnd />}
        {phase === "gameover" && <GameOver />}
      </div>
    </div>
  );
}
