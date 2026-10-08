"use client";

import { answeringId, useWeakest } from "@/store/weakestStore";
import EndGameButton from "../EndGameButton";

export default function Scoreboard() {
  const s = useWeakest();
  const active = s.phase === "round" ? answeringId(s) : null;

  return (
    <section aria-label="Players" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <span className="chip tone-white mr-auto">
          {s.phase === "final" ? "Final" : `Round ${s.round}`}
        </span>
        <button
          type="button"
          onClick={s.toggleMuted}
          aria-label={s.muted ? "Turn sound on" : "Mute sound"}
          className="keycap tone-white h-9 w-9 text-sm"
        >
          {s.muted ? "🔇" : "🔊"}
        </button>
        <EndGameButton onEnd={s.endGame} />
      </div>
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {s.players.map((p) => {
          const out = s.out.includes(p.id);
          const t = s.tally[p.id];
          return (
            <li
              key={p.id}
              aria-current={active === p.id ? "true" : undefined}
              className={`brick brick-flat ${active === p.id ? "tone-blue" : "tone-white"} flex items-center gap-2 px-2.5 py-2 ${out ? "opacity-40" : ""}`}
            >
              <span className={`min-w-0 flex-1 truncate text-sm font-bold ${out ? "line-through" : ""}`}>
                {p.name}
              </span>
              {!out && t && s.phase !== "final" && (
                <span className="text-xs font-bold tabular-nums text-ink/60">
                  {t.correct}/{t.correct + t.wrong}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
