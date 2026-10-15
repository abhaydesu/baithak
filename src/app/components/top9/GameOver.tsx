"use client";

import { useTop9 } from "@/store/top9Store";
import Character from "../Character";

const CONFETTI = [
  "#ff5a45",
  "#ffc61a",
  "#2f8cff",
  "#25b35f",
  "#7c5cff",
  "#ff4f9a",
];

export default function GameOver() {
  const s = useTop9();
  const [a, b] = s.teams;
  const tie = a.score === b.score;
  const winner = a.score >= b.score ? a : b;

  return (
    <div className="relative flex flex-col gap-7">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-4 h-48 overflow-hidden"
      >
        {Array.from({ length: 18 }, (_, i) => (
          <span
            key={i}
            className="absolute top-0 block h-3 w-2 rounded-sm"
            style={{
              left: `${(i * 37) % 100}%`,
              background: CONFETTI[i % CONFETTI.length],
              animation: `confetti-fall ${1.6 + (i % 5) * 0.35}s ${(i % 6) * 0.15}s ease-in forwards`,
            }}
          />
        ))}
      </div>

      <div className="flex flex-col items-center text-center">
        <Character
          kind="host"
          tone={tie ? "yellow" : winner.tone}
          className="h-40 w-36 animate-bob"
        />
        <p className="mt-4 text-sm font-semibold text-ink-soft">
          {tie ? "It's a tie!" : "The crowd has spoken"}
        </p>
        <h2 className="mt-1 font-display text-[clamp(2.2rem,10vw,3.5rem)] font-extrabold leading-none tracking-tight">
          {tie ? `${a.name} & ${b.name}` : `${winner.name} win!`}
        </h2>
      </div>

      <ol className="grid grid-cols-2 gap-3">
        {s.teams.map((team, i) => (
          <li
            key={i}
            className={`brick brick-flat tone-${team.tone} flex flex-col items-center px-3 py-3 text-center`}
          >
            <span className="text-sm font-bold">{team.name}</span>
            <span className="font-display text-4xl font-extrabold tabular-nums">
              {team.score}
            </span>
          </li>
        ))}
      </ol>

      {s.history.length > 0 && (
        <details className="inset-well group p-4">
          <summary className="flex min-h-11 cursor-pointer list-none items-center font-bold [&::-webkit-details-marker]:hidden">
            <span className="inline-block transition-transform group-open:rotate-90">
              ▸
            </span>{" "}
            Round by round
          </summary>
          <ol className="mt-3 flex flex-col gap-2 text-sm">
            {s.history.map((r, i) => (
              <li key={i} className="flex items-start justify-between gap-3">
                <span className="text-ink/75">{r.prompt}</span>
                <span className="shrink-0 text-xs font-bold">
                  {r.winner === null
                    ? "—"
                    : `${s.teams[r.winner].name} +${r.points}`}
                </span>
              </li>
            ))}
          </ol>
        </details>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={s.rematch}
          className="btn tone-yellow min-h-14 text-lg"
        >
          Rematch
        </button>
        <button
          type="button"
          onClick={s.newSetup}
          className="btn tone-white min-h-14"
        >
          Change teams & settings
        </button>
      </div>
    </div>
  );
}
