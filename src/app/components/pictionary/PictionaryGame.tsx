"use client";

import { useEffect, useSyncExternalStore } from "react";

import { useScrollToTopOnChange } from "@/lib/useScrollToTop";
import { useTrackGame } from "@/lib/analytics/useTrackGame";
import { useWakeLock } from "@/lib/useWakeLock";
import {
  currentTeam,
  pickingTeam,
  usePictionary,
} from "@/store/pictionaryStore";
import Studs from "../Studs";
import GameOver from "./GameOver";
import Scoreboard from "./Scoreboard";
import Setup from "./Setup";
import { Choose, Drawing, Handoff, Pass, Ready, Result } from "./TurnScreens";

const subscribeHydration = (cb: () => void) =>
  usePictionary.persist.onFinishHydration(cb);

export default function PictionaryGame() {
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    () => usePictionary.persist.hasHydrated(),
    () => false,
  );

  useEffect(() => {
    void usePictionary.persist.rehydrate();
  }, []);

  const phase = usePictionary((s) => s.phase);
  // The stage takes the colour of whoever holds the phone right now.
  const tone = usePictionary((s) => {
    if (s.phase === "setup" || s.phase === "gameover") return "white";
    const holder =
      s.phase === "handoff" || s.phase === "choose"
        ? pickingTeam(s)
        : currentTeam(s);
    return holder?.tone ?? "white";
  });

  const inGame = phase !== "setup" && phase !== "gameover";
  useWakeLock(hydrated && inGame);
  useTrackGame("pictionary", phase, hydrated);
  useScrollToTopOnChange(phase, hydrated);

  if (!hydrated) {
    return (
      <div className="brick tone-white mt-3 grid min-h-[28rem] place-items-center p-6">
        <Studs count={3} />
        <p className="font-display text-lg font-bold text-ink/40">
          Setting up the table…
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
        {phase === "choose" && <Choose />}
        {phase === "pass" && <Pass />}
        {phase === "ready" && <Ready />}
        {phase === "drawing" && <Drawing />}
        {phase === "result" && <Result />}
        {phase === "gameover" && <GameOver />}
      </div>
    </div>
  );
}
