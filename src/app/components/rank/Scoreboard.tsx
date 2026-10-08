"use client";

import { playerScore, rankerOf, totalTurns, useRank } from "@/store/rankStore";
import EndGameButton from "../EndGameButton";

export default function Scoreboard() {
  const state = useRank();
  const ranker = rankerOf(state);

  return (
    <section aria-label="Scoreboard" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <span className="chip tone-white mr-auto">
          Turn {state.turn + 1} of {totalTurns(state)}
        </span>
        <EndGameButton onEnd={state.endGame} />
      </div>
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {state.players.map((p) => {
          const active = p.id === ranker.id;
          return (
            <li
              key={p.id}
              aria-current={active ? "true" : undefined}
              className={`brick brick-flat ${active ? "tone-pink" : "tone-white opacity-70"} flex items-center gap-2 px-2.5 py-2`}
            >
              <span className="min-w-0 flex-1 truncate text-sm font-bold">{p.name}</span>
              <span className="font-display text-xl font-extrabold tabular-nums">
                {playerScore(state, p.id)}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
