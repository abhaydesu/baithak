"use client";

import { scoreOf, teamScore, useHotSeat } from "@/store/hotSeatStore";
import Character from "../Character";

const CONFETTI = ["#ff5a45", "#ffc61a", "#2f8cff", "#25b35f", "#7c5cff", "#ff4f9a"];

export default function GameOver() {
  const s = useHotSeat();

  const ranked = s.teams
    .map((team) => ({ team, score: teamScore(team, s.history) }))
    .sort((a, b) => b.score - a.score);
  const top = ranked[0]?.score ?? 0;
  const winners = ranked.filter((r) => r.score === top);
  const tie = winners.length > 1;
  const nameOf = (id: string) => s.teams.find((t) => t.id === id)?.name;

  return (
    <div className="relative flex flex-col gap-7">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-4 h-48 overflow-hidden">
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
          kind="hotseat"
          tone={tie ? "yellow" : (winners[0]?.team.tone ?? "yellow")}
          className="h-40 w-36 animate-bob"
        />
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-ink/55">
          {tie ? "It's a tie!" : "And the winner is"}
        </p>
        <h2 className="mt-1 font-display text-[clamp(2.2rem,10vw,3.5rem)] font-extrabold leading-none tracking-tight">
          {winners.map((w) => w.team.name).join(" & ")}
        </h2>
      </div>

      <ol className="flex flex-col gap-3">
        {ranked.map(({ team, score }, i) => (
          <li key={team.id} className={`brick brick-flat tone-${team.tone} flex items-center gap-3 px-4 py-3`}>
            <span className="font-display text-lg font-extrabold text-ink/50">
              {score === top ? "★" : `#${i + 1}`}
            </span>
            <span className="flex-1 font-display text-lg font-bold">{team.name}</span>
            <span className="font-display text-3xl font-extrabold tabular-nums">{score}</span>
          </li>
        ))}
      </ol>

      {s.history.length > 0 && (
        <details className="inset-well group p-4">
          <summary className="cursor-pointer list-none font-bold [&::-webkit-details-marker]:hidden">
            <span className="inline-block transition-transform group-open:rotate-90">▸</span>{" "}
            Every turn ({s.history.length})
          </summary>
          <ul className="mt-3 flex flex-col gap-3 text-sm">
            {s.history.map((h, i) => (
              <li key={i}>
                <p className="font-bold">
                  {nameOf(h.teamId)}
                  {h.guesser ? ` · ${h.guesser}` : ""}
                  <span className="text-ink/50"> · {scoreOf(h.words)} scored</span>
                </p>
                <p className="mt-0.5 text-ink/65">
                  {h.words.length === 0
                    ? "No words"
                    : h.words.map((w, j) => (
                        <span key={j} className={w.verdict === "got" ? "font-semibold text-ink" : "line-through"}>
                          {w.word}
                          {j < h.words.length - 1 ? ", " : ""}
                        </span>
                      ))}
                </p>
              </li>
            ))}
          </ul>
        </details>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={s.rematch} className="btn tone-orange min-h-14 text-lg">
          Rematch
        </button>
        <button type="button" onClick={s.newSetup} className="btn tone-white min-h-14">
          Change teams & settings
        </button>
      </div>
    </div>
  );
}
