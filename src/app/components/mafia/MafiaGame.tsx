"use client";

import { useEffect, useSyncExternalStore } from "react";

import { useTrackGame } from "@/lib/analytics/useTrackGame";
import { useWakeLock } from "@/lib/useWakeLock";
import { useMafia } from "@/store/mafiaStore";
import Studs from "../Studs";
import GameOver from "./GameOver";
import {
  Dawn,
  Discuss,
  NarratorNight,
  NightAct,
  NightPass,
  Pass,
  Reveal,
  RoundOver,
  Verdict,
  Vote,
} from "./RoundScreens";
import Scoreboard from "./Scoreboard";
import Setup from "./Setup";

const subscribeHydration = (cb: () => void) =>
  useMafia.persist.onFinishHydration(cb);

export default function MafiaGame() {
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    () => useMafia.persist.hasHydrated(),
    () => false,
  );

  useEffect(() => {
    void useMafia.persist.rehydrate();
  }, []);

  const phase = useMafia((s) => s.phase);
  const inGame = phase !== "setup" && phase !== "gameover";
  useWakeLock(hydrated && inGame);
  useTrackGame("mafia-werewolf", phase, hydrated);

  if (!hydrated) {
    return (
      <div className="brick tone-white mt-3 grid min-h-[28rem] place-items-center p-6">
        <Studs count={3} />
        <p className="font-display text-lg font-bold text-ink/40">
          Dealing the roles…
        </p>
      </div>
    );
  }

  // Every player sees the same brick colour during the round, so nobody can
  // tell roles apart from across the room.
  const tone = phase === "setup" || phase === "gameover" ? "white" : "purple";

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
        {phase === "night-pass" && <NightPass />}
        {phase === "night-act" && <NightAct />}
        {phase === "narrator-night" && <NarratorNight />}
        {phase === "dawn" && <Dawn />}
        {phase === "discuss" && <Discuss />}
        {phase === "vote" && <Vote />}
        {phase === "verdict" && <Verdict />}
        {phase === "roundover" && <RoundOver />}
        {phase === "gameover" && <GameOver />}
      </div>
    </div>
  );
}
