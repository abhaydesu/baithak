"use client";

import { playerScore, useRank } from "@/store/rankStore";
import Character from "../Character";

export default function GameOver() {
  const s = useRank();
  const standings = s.players
    .map((p) => ({ ...p, score: playerScore(s, p.id) }))
    .sort((a, b) => b.score - a.score);
  const top = standings[0]?.score ?? 0;
  const winners = standings.filter((p) => p.score === top && top > 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center text-center">
        <Character kind="vadapav" tone="yellow" className="h-32 w-28 animate-bob" />
        <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight">
          {winners.length === 1
            ? `${winners[0].name} wins!`
            : winners.length > 1
              ? "It's a tie!"
              : "Game over"}
        </h2>
        <p className="mt-1 text-ink/60">{s.history.length} rankings</p>
      </div>
      <ol className="flex flex-col gap-2">
        {standings.map((p, i) => (
          <li
            key={p.id}
            className={`brick brick-flat ${p.score === top && top > 0 ? "tone-yellow" : "tone-white"} flex items-center gap-3 px-4 py-2.5`}
          >
            <span className="w-6 font-display font-extrabold text-ink/50">{i + 1}</span>
            <span className="min-w-0 flex-1 truncate font-bold">{p.name}</span>
            <span className="font-display text-2xl font-extrabold tabular-nums">{p.score}</span>
          </li>
        ))}
      </ol>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={s.rematch} className="btn tone-green min-h-14 sm:flex-1">
          Play again
        </button>
        <button type="button" onClick={s.newSetup} className="btn tone-white min-h-14 sm:flex-1">
          Change settings
        </button>
      </div>
    </div>
  );
}
