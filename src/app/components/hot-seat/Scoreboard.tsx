"use client";

import { useState } from "react";

import {
  currentRound,
  currentTeam,
  scoreOf,
  teamScore,
  useHotSeat,
} from "@/store/hotSeatStore";
import EndGameButton from "../EndGameButton";

export default function Scoreboard() {
  const state = useHotSeat();
  const [editing, setEditing] = useState(false);

  const active = currentTeam(state);
  const round = Math.min(currentRound(state), state.settings.turnsPerTeam);
  // Points from the turn in progress, shown as a +N on the playing team.
  const pending = state.phase === "acting" || state.phase === "result" ? scoreOf(state.turnWords) : 0;

  return (
    <section aria-label="Scoreboard" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <span className="chip tone-white mr-auto">
          Round {round} of {state.settings.turnsPerTeam}
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
          {editing ? "Done" : "Scores"}
        </button>
        <EndGameButton onEnd={state.endGame} />
      </div>

      <ol
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${state.teams.length}, minmax(0, 1fr))` }}
      >
        {state.teams.map((team) => {
          const isActive = team.id === active?.id;
          const score = teamScore(team, state.history);
          return (
            <li
              key={team.id}
              className={`brick brick-flat tone-${team.tone} flex flex-col items-center px-1.5 pb-2 pt-2 text-center ${isActive ? "" : "opacity-60 saturate-50"}`}
              aria-current={isActive ? "true" : undefined}
            >
              <span className="w-full truncate text-[0.7rem] font-bold leading-tight sm:text-xs">
                {team.name}
              </span>
              <span className="relative font-display text-3xl font-extrabold tabular-nums leading-none">
                {score}
                {isActive && pending > 0 && (
                  <span className="absolute -right-7 -top-1 rounded-full bg-[var(--tone-solid)] px-1.5 text-xs text-white">
                    +{pending}
                  </span>
                )}
              </span>
              {editing && (
                <span className="mt-2 flex gap-1">
                  <button
                    type="button"
                    aria-label={`Take a point from ${team.name}`}
                    onClick={() => state.adjustScore(team.id, -1)}
                    className="keycap tone-white h-8 w-8 text-base"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    aria-label={`Give a point to ${team.name}`}
                    onClick={() => state.adjustScore(team.id, 1)}
                    className="keycap tone-white h-8 w-8 text-base"
                  >
                    +
                  </button>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
