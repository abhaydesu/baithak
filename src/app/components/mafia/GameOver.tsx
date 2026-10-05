"use client";

import { playerName, playerScore, useMafia } from "@/store/mafiaStore";
import Character from "../Character";

const OUTCOME_LABEL = {
  village: "Village won",
  mafia: "Mafia won",
} as const;

export default function GameOver() {
  const s = useMafia();
  const standings = s.players
    .map((p) => ({ ...p, score: playerScore(s, p.id) }))
    .sort((a, b) => b.score - a.score);
  const top = standings[0]?.score ?? 0;
  const winners = standings.filter((p) => p.score === top && top > 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center text-center">
        <Character
          kind="detective"
          tone="yellow"
          className="h-32 w-28 animate-bob"
        />
        <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight">
          {winners.length === 0
            ? "Game over"
            : winners.length === 1
              ? `${winners[0].name} wins!`
              : "It's a tie!"}
        </h2>
        <p className="mt-1 text-ink/60">
          {s.history.length} round{s.history.length === 1 ? "" : "s"} played
        </p>
      </div>

      <ol className="flex flex-col gap-2">
        {standings.map((p, i) => (
          <li
            key={p.id}
            className={`brick brick-flat ${p.score === top && top > 0 ? "tone-yellow" : "tone-white"} flex items-center gap-3 px-4 py-2.5`}
          >
            <span className="w-6 font-display font-extrabold text-ink/50">
              {i + 1}
            </span>
            <span className="min-w-0 flex-1 truncate font-bold">{p.name}</span>
            <span className="font-display text-2xl font-extrabold tabular-nums">
              {p.score}
            </span>
          </li>
        ))}
      </ol>

      {s.history.length > 0 && (
        <section className="inset-well px-4 py-3">
          <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-ink/55">
            Every round
          </h3>
          <ul className="mt-2 flex flex-col gap-2 text-sm">
            {s.history.map((r) => (
              <li
                key={r.number}
                className="flex items-baseline justify-between gap-3"
              >
                <span className="min-w-0">
                  <strong>Round {r.number}</strong>{" "}
                  <span className="text-ink/50">
                    Mafia: {r.mafiaIds.map((id) => playerName(s, id)).join(", ")} ·{" "}
                    {r.cycles} {r.cycles === 1 ? "night" : "nights"}
                  </span>
                </span>
                <span className="shrink-0 text-xs font-bold text-ink/55">
                  {OUTCOME_LABEL[r.outcome]}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={s.rematch}
          className="btn tone-purple min-h-14 w-full text-lg"
        >
          Play again
        </button>
        <button
          type="button"
          onClick={s.newSetup}
          className="btn tone-white w-full"
        >
          Change players or settings
        </button>
      </div>
    </div>
  );
}
