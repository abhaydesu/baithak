"use client";

import { useMemo } from "react";

import {
  AFTER_DARK_ID,
  afterDarkPack,
  DEFAULT_PACK_IDS,
  rankPacks,
  rankPool,
} from "@/lib/rank/topics";
import { MAX_PLAYERS, MIN_PLAYERS, totalTurns, useRank } from "@/store/rankStore";

const ROUNDS = [1, 2, 3];

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
  const s = useRank();
  const { settings, players } = s;
  const fresh = useMemo(() => {
    const used = new Set(s.played);
    return rankPool(settings.packs).filter((t) => !used.has(t)).length;
  }, [settings.packs, s.played]);
  const canStart = players.length >= MIN_PLAYERS && settings.packs.length > 0;

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h2 className="font-display text-3xl font-extrabold tracking-tight">New game</h2>
        <p className="mt-1 text-ink/60">
          Each turn, one player ranks everyone else on a topic and defends it.
          The group votes on whether it&apos;s fair. Add players in any order.
        </p>
      </div>

      <section>
        <Label hint={`${players.length} of ${MAX_PLAYERS}`}>Players</Label>
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
        <Label hint={`${totalTurns(s)} turns total`}>Turns each</Label>
        <div className="grid grid-cols-3 gap-1.5">
          {ROUNDS.map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={settings.rounds === n}
              onClick={() => s.updateSettings({ rounds: n })}
              className="keycap tone-white h-10 text-sm"
            >
              {n}
            </button>
          ))}
        </div>
      </section>

      <section>
        <Label hint={`${settings.packs.length} picked`}>Topics</Label>
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              s.setPacks(
                settings.packs.includes(AFTER_DARK_ID)
                  ? [...DEFAULT_PACK_IDS, AFTER_DARK_ID]
                  : DEFAULT_PACK_IDS,
              )
            }
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
          {rankPacks.map((p) => (
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

        <label className="inset-well mt-4 flex cursor-pointer items-center gap-3 p-3">
          <input
            type="checkbox"
            checked={settings.packs.includes(AFTER_DARK_ID)}
            onChange={() => s.togglePack(AFTER_DARK_ID)}
            className="peer sr-only"
          />
          <span className="relative h-7 w-12 shrink-0 rounded-full border-2 border-line bg-white shadow-[inset_0_2px_0_rgb(0_0_0/0.06)] transition-colors peer-checked:border-[#c63a28] peer-checked:bg-[#ff5a45] after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border-2 after:border-line after:bg-white after:transition-transform peer-checked:after:translate-x-5 peer-checked:after:border-[#c63a28] peer-focus-visible:outline-3" />
          <span>
            <span className="block font-bold">
              {afterDarkPack.label}{" "}
              <span className="font-normal text-ink/50">· {afterDarkPack.topics.length}</span>
            </span>
            <span className="block text-sm text-ink/60">
              Cheeky, grown-up topics. Leave off when kids are playing.
            </span>
          </span>
        </label>
      </section>

      <div className="brick-divider" />

      <div className="flex flex-col gap-4">
        <p className="text-sm text-ink/60">
          <strong className="text-ink">{fresh}</strong> fresh topics ready
          {s.played.length > 0 && (
            <>
              {" · "}
              {s.played.length} already played{" "}
              <button
                type="button"
                onClick={s.resetPlayed}
                className="font-bold text-ink underline underline-offset-2"
              >
                reset
              </button>
            </>
          )}
        </p>
        {!canStart && (
          <p className="text-sm font-semibold text-[#c63a28]">
            {players.length < MIN_PLAYERS
              ? `You need at least ${MIN_PLAYERS} players.`
              : "Pick at least one topic pack."}
          </p>
        )}
        <button
          type="button"
          disabled={!canStart}
          onClick={s.startGame}
          className="btn tone-pink min-h-14 w-full text-lg disabled:opacity-50"
        >
          Start game
        </button>
      </div>
    </div>
  );
}
