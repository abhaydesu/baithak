"use client";

import { useBomb } from "@/store/bombStore";
import EndGameButton from "../EndGameButton";

/** Lives left for everyone, as hearts. Eliminated players are struck out. */
export default function Scoreboard() {
  const state = useBomb();

  return (
    <section aria-label="Lives" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <span className="chip tone-white mr-auto">Round {state.round}</span>
        <button
          type="button"
          onClick={state.toggleMuted}
          aria-label={state.muted ? "Turn sound on" : "Mute sound"}
          className="keycap tone-white h-9 w-9 text-sm"
        >
          {state.muted ? "🔇" : "🔊"}
        </button>
        <EndGameButton onEnd={state.endGame} />
      </div>
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {state.players.map((p) => {
          const lives = state.lives[p.id] ?? 0;
          const out = lives === 0;
          const holding = state.phase === "live" && state.holderId === p.id;
          return (
            <li
              key={p.id}
              className={`brick brick-flat ${holding ? "tone-red" : "tone-white"} flex items-center gap-2 px-2.5 py-2 ${
                out ? "opacity-50" : ""
              }`}
            >
              <span
                className={`min-w-0 flex-1 truncate text-sm font-bold ${out ? "line-through" : ""}`}
              >
                {p.name}
              </span>
              <span
                aria-label={out ? "Out" : `${lives} lives left`}
                className="shrink-0 text-sm tracking-tight"
              >
                {out ? "💀" : "❤️".repeat(lives)}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
