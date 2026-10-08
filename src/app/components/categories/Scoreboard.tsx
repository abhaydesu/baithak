"use client";

import { useState } from "react";

import {
  playerScore,
  roundOf,
  speakerOf,
  useCategories,
} from "@/store/categoriesStore";
import EndGameButton from "../EndGameButton";

export default function Scoreboard() {
  const state = useCategories();
  const [editing, setEditing] = useState(false);
  const speaker = speakerOf(state);
  const round = Math.min(roundOf(state), state.settings.rounds);
  const pending =
    state.phase === "live" || state.phase === "result" ? state.count : 0;

  return (
    <section aria-label="Scoreboard" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <span className="chip tone-white mr-auto">
          Round {round} of {state.settings.rounds}
        </span>
        <button
          type="button"
          onClick={state.toggleMuted}
          aria-label={state.muted ? "Turn sound on" : "Mute sound"}
          className="keycap tone-white h-9 w-9 text-sm"
        >
          {state.muted ? "🔇" : "🔊"}
        </button>
        <button
          type="button"
          onClick={() => setEditing((e) => !e)}
          aria-pressed={editing}
          className="keycap tone-white h-9 px-3 text-xs"
        >
          {editing ? "Done" : "Fix scores"}
        </button>
        <EndGameButton onEnd={state.endGame} />
      </div>

      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {state.players.map((p) => {
          const active = p.id === speaker.id;
          return (
            <li
              key={p.id}
              aria-current={active ? "true" : undefined}
              className={`brick brick-flat ${active ? "tone-green" : "tone-white"} flex items-center gap-2 px-2.5 py-2 ${
                active ? "" : "opacity-70"
              }`}
            >
              <span className="min-w-0 flex-1 truncate text-sm font-bold">
                {p.name}
              </span>
              {editing && (
                <button
                  type="button"
                  aria-label={`Take a point from ${p.name}`}
                  onClick={() => state.adjustScore(p.id, -1)}
                  className="keycap tone-white h-7 w-7 text-sm"
                >
                  −
                </button>
              )}
              <span className="min-w-6 text-center font-display text-xl font-extrabold tabular-nums">
                {playerScore(state, p.id)}
                {active && pending > 0 && (
                  <span className="ml-0.5 text-xs text-[#178443]">+{pending}</span>
                )}
              </span>
              {editing && (
                <button
                  type="button"
                  aria-label={`Give a point to ${p.name}`}
                  onClick={() => state.adjustScore(p.id, 1)}
                  className="keycap tone-white h-7 w-7 text-sm"
                >
                  +
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
