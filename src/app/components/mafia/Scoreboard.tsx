"use client";

import { useState } from "react";

import { isEliminated, playerScore, useMafia } from "@/store/mafiaStore";
import EndGameButton from "../EndGameButton";

function stageLabel(phase: string, cycle: number) {
  if (phase === "pass" || phase === "reveal") return "Role deal";
  if (
    phase === "night-pass" ||
    phase === "night-act" ||
    phase === "narrator-night"
  ) {
    return `Night ${cycle}`;
  }
  if (
    phase === "dawn" ||
    phase === "discuss" ||
    phase === "vote" ||
    phase === "verdict"
  ) {
    return `Day ${cycle}`;
  }
  return null;
}

export default function Scoreboard() {
  const state = useMafia();
  const [editing, setEditing] = useState(false);
  const roundNumber = state.round?.number ?? state.history.length + 1;
  const sub = state.round ? stageLabel(state.phase, state.round.cycle) : null;

  return (
    <section aria-label="Scoreboard" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <span className="chip tone-white mr-auto">
          Round {roundNumber}
          {sub ? ` · ${sub}` : ""}
        </span>
        <button
          type="button"
          onClick={state.toggleMuted}
          aria-pressed={state.muted}
          aria-label={state.muted ? "Turn sound on" : "Mute sound"}
          className="keycap tone-white h-9 px-3 text-xs"
        >
          {state.muted ? "Sound off" : "Sound on"}
        </button>
        <button
          type="button"
          onClick={() => setEditing((e) => !e)}
          aria-pressed={editing}
          className="keycap tone-white h-9 px-3 text-xs"
        >
          {editing ? "Done" : "Scores"}
        </button>
        <EndGameButton onEnd={state.endGame} />
      </div>

      {editing && (
        <>
          <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {state.players.map((p) => {
              const out = state.round ? isEliminated(state.round, p.id) : false;
              return (
                <li
                  key={p.id}
                  className="brick brick-flat tone-white flex items-center gap-2 px-2.5 py-2"
                >
                  <span
                    className={`min-w-0 flex-1 truncate text-sm font-bold ${out ? "line-through opacity-50" : ""}`}
                  >
                    {p.name}
                  </span>
                  <button
                    type="button"
                    aria-label={`Take a point from ${p.name}`}
                    onClick={() => state.adjustScore(p.id, -1)}
                    className="keycap tone-white h-7 w-7 text-sm"
                  >
                    −
                  </button>
                  <span className="w-6 text-center font-display text-xl font-extrabold tabular-nums">
                    {playerScore(state, p.id)}
                  </span>
                  <button
                    type="button"
                    aria-label={`Give a point to ${p.name}`}
                    onClick={() => state.adjustScore(p.id, 1)}
                    className="keycap tone-white h-7 w-7 text-sm"
                  >
                    +
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="text-center text-xs text-ink/50">
            Village +1 each when the town wins · Mafia +2 each when the Mafia
            wins.
          </p>
        </>
      )}
    </section>
  );
}
