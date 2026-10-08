"use client";

import { currentTeam, roundOf, useFiveSecond } from "@/store/fiveSecondStore";
import EndGameButton from "../EndGameButton";

export default function Scoreboard() {
  const state = useFiveSecond();
  const active = currentTeam(state);

  return (
    <section aria-label="Scoreboard" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <span className="chip tone-white mr-auto">
          Round {roundOf(state)} · first to {state.settings.target}
        </span>
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
      <ol className="grid grid-cols-2 gap-2">
        {state.teams.map((team) => {
          const isActive = team.id === active.id;
          return (
            <li
              key={team.id}
              aria-current={isActive ? "true" : undefined}
              className={`brick brick-flat tone-${team.tone} flex flex-col items-center px-2 pb-2 pt-2 text-center ${
                isActive ? "" : "opacity-60 saturate-50"
              }`}
            >
              <span className="w-full truncate text-sm font-bold">{team.name}</span>
              <span className="font-display text-4xl font-extrabold tabular-nums leading-none">
                {team.score}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
