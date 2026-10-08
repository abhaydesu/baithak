"use client";

import { useEffect, useSyncExternalStore } from "react";

import { useTrackGame } from "@/lib/analytics/useTrackGame";
import { useScrollToTopOnChange } from "@/lib/useScrollToTop";
import { useWakeLock } from "@/lib/useWakeLock";
import { useRank } from "@/store/rankStore";
import Studs from "../Studs";
import GameOver from "./GameOver";
import Scoreboard from "./Scoreboard";
import { RankScreen, Vote } from "./Screens";
import Setup from "./Setup";

const subscribeHydration = (cb: () => void) => useRank.persist.onFinishHydration(cb);

export default function RankGame() {
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    () => useRank.persist.hasHydrated(),
    () => false,
  );

  useEffect(() => {
    void useRank.persist.rehydrate();
  }, []);

  const phase = useRank((s) => s.phase);
  const inGame = phase === "rank" || phase === "vote";
  useWakeLock(hydrated && inGame);
  useTrackGame("rank-your-friends", phase, hydrated);
  useScrollToTopOnChange(phase, hydrated);

  if (!hydrated) {
    return (
      <div className="brick tone-white mt-3 grid min-h-[28rem] place-items-center p-6">
        <Studs count={3} />
        <p className="font-display text-lg font-bold text-ink/40">Lining everyone up…</p>
      </div>
    );
  }

  const tone = inGame ? "pink" : "white";

  return (
    <div className="flex flex-col gap-5">
      {inGame && <Scoreboard />}
      <div
        className={`brick tone-${tone} mt-3 min-h-[28rem] p-5 transition-colors sm:p-7`}
        aria-live="polite"
      >
        <Studs count={3} />
        {phase === "setup" && <Setup />}
        {phase === "rank" && <RankScreen />}
        {phase === "vote" && <Vote />}
        {phase === "gameover" && <GameOver />}
      </div>
    </div>
  );
}
