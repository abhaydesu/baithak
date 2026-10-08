"use client";

import { nameOf, useWeakest } from "@/store/weakestStore";
import Character from "../Character";

export default function GameOver() {
  const s = useWeakest();
  const order = [...s.out].reverse();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center text-center">
        <Character kind="paan" tone="yellow" className="h-32 w-28 animate-bob" />
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-ink/55">
          {s.winnerId ? "The strongest link" : "Game over"}
        </p>
        <h2 className="mt-1 font-display text-[clamp(2.2rem,10vw,3.5rem)] font-extrabold leading-none tracking-tight">
          {s.winnerId ? nameOf(s, s.winnerId) : "No winner"}
        </h2>
      </div>

      {order.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-ink/55">
            Voted out, latest first
          </p>
          <ol className="flex flex-col gap-2">
            {order.map((id, i) => (
              <li key={id} className="brick brick-flat tone-white flex items-center gap-3 px-4 py-2.5">
                <span className="w-6 font-display font-extrabold text-ink/50">{i + 2}</span>
                <span className="min-w-0 flex-1 truncate font-bold">{nameOf(s, id)}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={s.rematch} className="btn tone-blue min-h-14 sm:flex-1">
          Play again
        </button>
        <button type="button" onClick={s.newSetup} className="btn tone-white min-h-14 sm:flex-1">
          Change players
        </button>
      </div>
    </div>
  );
}
