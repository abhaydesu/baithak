"use client";

import { useFiveSecond } from "@/store/fiveSecondStore";
import Character from "../Character";

export default function GameOver() {
  const s = useFiveSecond();
  const [a, b] = s.teams;
  const tie = a.score === b.score;
  const winner = a.score > b.score ? a : b;
  const nailed = s.history.filter((h) => h.verdict === "nailed").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center text-center">
        <Character
          kind="jamun"
          tone={tie ? "yellow" : winner.tone}
          className="h-36 w-32 animate-bob"
        />
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-ink/55">
          {tie ? "It's a tie!" : "And the winner is"}
        </p>
        <h2 className="mt-1 font-display text-[clamp(2.2rem,10vw,3.5rem)] font-extrabold leading-none tracking-tight">
          {tie ? `${a.name} & ${b.name}` : winner.name}
        </h2>
        <p className="mt-2 text-ink/60">
          {s.history.length} turns · {nailed} answered in time
        </p>
      </div>

      <ol className="flex flex-col gap-3">
        {[a, b]
          .sort((x, y) => y.score - x.score)
          .map((team) => (
            <li
              key={team.id}
              className={`brick brick-flat tone-${team.tone} flex items-center gap-3 px-4 py-3`}
            >
              <span className="flex-1 font-display text-lg font-bold">{team.name}</span>
              <span className="font-display text-3xl font-extrabold tabular-nums">
                {team.score}
              </span>
            </li>
          ))}
      </ol>

      <div className="grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={s.rematch} className="btn tone-orange min-h-14 text-lg">
          Rematch
        </button>
        <button type="button" onClick={s.newSetup} className="btn tone-white min-h-14">
          Change settings
        </button>
      </div>
    </div>
  );
}
