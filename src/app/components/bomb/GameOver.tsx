"use client";

import { useBomb } from "@/store/bombStore";
import Character from "../Character";

export default function GameOver() {
  const s = useBomb();
  const standings = [...s.players].sort(
    (a, b) => (s.lives[b.id] ?? 0) - (s.lives[a.id] ?? 0),
  );
  const top = s.lives[standings[0]?.id] ?? 0;
  const winners = standings.filter((p) => (s.lives[p.id] ?? 0) === top && top > 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center text-center">
        <Character kind="bomber" tone="yellow" className="h-32 w-28 animate-bob" />
        <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight">
          {winners.length === 1
            ? `${winners[0].name} survives!`
            : winners.length > 1
              ? "It's a tie!"
              : "Game over"}
        </h2>
        <p className="mt-1 text-ink/60">
          {s.round} round{s.round === 1 ? "" : "s"} played
        </p>
      </div>

      <ol className="flex flex-col gap-2">
        {standings.map((p, i) => {
          const lives = s.lives[p.id] ?? 0;
          return (
            <li
              key={p.id}
              className={`brick brick-flat ${winners.includes(p) ? "tone-yellow" : "tone-white"} flex items-center gap-3 px-4 py-2.5`}
            >
              <span className="w-6 font-display font-extrabold text-ink/50">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate font-bold">{p.name}</span>
              <span aria-label={lives ? `${lives} lives left` : "Out"}>
                {lives ? "❤️".repeat(lives) : "💀"}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={s.rematch} className="btn tone-green min-h-14 sm:flex-1">
          Play again
        </button>
        <button type="button" onClick={s.newSetup} className="btn tone-white min-h-14 sm:flex-1">
          Change players
        </button>
      </div>
    </div>
  );
}
