"use client";

import {
  DEFAULT_PACK_IDS,
  quizPacks,
  quizPool,
  type DifficultySetting,
} from "@/lib/weakest/questions";
import { sfx } from "@/lib/sfx";
import { MAX_PLAYERS, MIN_PLAYERS, useWeakest } from "@/store/weakestStore";

const SECONDS = [60, 90, 120];
const LEVELS: Array<{ id: DifficultySetting; label: string }> = [
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
  { id: "mix", label: "Mix" },
];

function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-2.5 flex items-baseline justify-between gap-2">
      <h3 className="shrink-0 text-xs font-bold uppercase tracking-[0.15em] text-ink/55">
        {children}
      </h3>
      {hint && <span className="text-xs text-ink/50">{hint}</span>}
    </div>
  );
}

export default function Setup() {
  const s = useWeakest();
  const { settings, players } = s;
  const poolSize = quizPool(settings.packs, settings.difficulty ?? "mix").length;
  const canStart = players.length >= MIN_PLAYERS && poolSize > 0;

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h2 className="font-display text-3xl font-extrabold tracking-tight">New game</h2>
        <p className="mt-1 text-ink/60">
          Answer questions in a chain, bank your points, then vote out the
          weakest link. Someone who isn&apos;t playing holds the phone and acts
          as quizmaster, reading out each question.
        </p>
      </div>

      <section>
        <Label hint={`${players.length} of ${MAX_PLAYERS}`}>Players, in seating order</Label>
        <ol className="grid gap-2 sm:grid-cols-2">
          {players.map((player, i) => (
            <li key={player.id} className="flex items-center gap-2">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-line bg-white font-display font-extrabold">
                {i + 1}
              </span>
              <input
                aria-label={`Player ${i + 1} name`}
                value={player.name}
                maxLength={18}
                onChange={(e) => s.renamePlayer(player.id, e.target.value)}
                onFocus={(e) => e.target.select()}
                className="field min-h-10 flex-1 py-1.5 font-display font-bold"
              />
              {players.length > MIN_PLAYERS && (
                <button
                  type="button"
                  aria-label={`Remove ${player.name}`}
                  onClick={() => s.removePlayer(player.id)}
                  className="keycap tone-white h-10 w-10 shrink-0 text-lg"
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ol>
        {players.length < MAX_PLAYERS && (
          <button
            type="button"
            onClick={s.addPlayer}
            className="keycap tone-white mt-3 h-11 w-full text-sm"
          >
            + Add a player
          </button>
        )}
      </section>

      <section>
        <Label hint="Gets shorter each round">First round length</Label>
        <div className="grid grid-cols-3 gap-1.5">
          {SECONDS.map((sec) => (
            <button
              key={sec}
              type="button"
              aria-pressed={settings.seconds === sec}
              onClick={() => s.updateSettings({ seconds: sec })}
              className="keycap tone-white h-10 text-sm"
            >
              {sec}s
            </button>
          ))}
        </div>
      </section>

      <section>
        <Label>Difficulty</Label>
        <div className="grid grid-cols-4 gap-1.5">
          {LEVELS.map((l) => (
            <button
              key={l.id}
              type="button"
              aria-pressed={(settings.difficulty ?? "mix") === l.id}
              onClick={() => s.updateSettings({ difficulty: l.id })}
              className="keycap tone-white h-10 text-sm"
            >
              {l.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <Label hint={`${quizPool(settings.packs, settings.difficulty ?? "mix").length} questions`}>Question packs</Label>
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => s.setPacks(DEFAULT_PACK_IDS)}
            className="keycap tone-white h-9 px-3 text-xs"
          >
            Everything
          </button>
          <button
            type="button"
            onClick={() => s.setPacks([])}
            className="keycap tone-white h-9 px-3 text-xs"
          >
            Clear
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {quizPacks.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={settings.packs.includes(p.id)}
              onClick={() => s.togglePack(p.id)}
              className={`keycap tone-${p.tone} h-10 px-3 text-sm`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </section>

      <div className="brick-divider" />

      <div className="flex flex-col gap-4">
        {!canStart && (
          <p className="text-sm font-semibold text-[#c63a28]">
            {players.length < MIN_PLAYERS
              ? `You need at least ${MIN_PLAYERS} players.`
              : "Pick at least one question pack."}
          </p>
        )}
        <button
          type="button"
          disabled={!canStart}
          onClick={() => {
            sfx.unlock();
            s.startGame();
          }}
          className="btn tone-blue min-h-14 w-full text-lg disabled:opacity-50"
        >
          Start game
        </button>
      </div>
    </div>
  );
}
