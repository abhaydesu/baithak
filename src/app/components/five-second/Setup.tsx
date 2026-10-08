"use client";

import { useMemo, useState } from "react";

import {
  AFTER_DARK_ID,
  afterDarkPack,
  DEFAULT_PACK_IDS,
  topicPacks,
  topicPool,
} from "@/lib/categories/topics";
import { sfx } from "@/lib/sfx";
import { useFiveSecond } from "@/store/fiveSecondStore";

const SECONDS = [3, 5, 7, 10];
const TARGETS = [5, 10, 15];

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

function PlayersInput({
  players,
  onChange,
}: {
  players: string[];
  onChange: (players: string[]) => void;
}) {
  // Keep the raw text locally so typing commas and spaces feels natural.
  const [text, setText] = useState(players.join(", "));
  return (
    <input
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        onChange(e.target.value.split(",").map((p) => p.trim()).filter(Boolean));
      }}
      placeholder="Players (optional): Asha, Ravi…"
      aria-label="Player names, comma separated, to rotate who answers"
      className="field mt-2 min-h-10 border-[color-mix(in_oklab,var(--tone-dark)_50%,transparent)] bg-white/80 py-1.5 text-sm"
    />
  );
}

export default function Setup() {
  const s = useFiveSecond();
  const { settings, teams } = s;

  const fresh = useMemo(() => {
    const used = new Set(s.played);
    return topicPool(settings.packs).filter((t) => !used.has(t)).length;
  }, [settings.packs, s.played]);
  const canStart = settings.packs.length > 0;

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h2 className="font-display text-3xl font-extrabold tracking-tight">
          New game
        </h2>
        <p className="mt-1 text-ink/60">
          Two teams take turns. A player gets a category and has a few seconds
          to name three things in it. Someone from the other team holds the
          phone and judges.
        </p>
      </div>

      <section>
        <Label>Teams</Label>
        <ul className="flex flex-col gap-3">
          {teams.map((team, i) => (
            <li key={team.id} className={`brick brick-flat tone-${team.tone} p-3`}>
              <div className="flex items-center gap-2">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-[var(--tone-edge)] bg-[var(--tone-solid)] font-display font-extrabold text-white">
                  {i + 1}
                </span>
                <input
                  aria-label={`Team ${i + 1} name`}
                  value={team.name}
                  maxLength={20}
                  onChange={(e) => s.renameTeam(team.id, e.target.value)}
                  className="field min-h-10 flex-1 border-[var(--tone-dark)] py-1.5 font-display font-bold"
                />
              </div>
              <PlayersInput
                players={team.players}
                onChange={(players) => s.setPlayers(team.id, players)}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label hint="The classic is 5">Seconds to answer</Label>
          <div className="grid grid-cols-4 gap-1.5">
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
        </div>
        <div>
          <Label>First to</Label>
          <div className="grid grid-cols-3 gap-1.5">
            {TARGETS.map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={settings.target === n}
                onClick={() => s.updateSettings({ target: n })}
                className="keycap tone-white h-10 text-sm"
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section>
        <Label hint={`${settings.packs.length} picked`}>Categories</Label>
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
          {topicPacks.map((p) => (
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
              <span className="font-normal text-ink/50">
                · {afterDarkPack.topics.length}
              </span>
            </span>
            <span className="block text-sm text-ink/60">
              Cheeky, grown-up categories. Leave off when kids are playing.
            </span>
          </span>
        </label>
      </section>

      <div className="brick-divider" />

      <div className="flex flex-col gap-4">
        <p className="text-sm text-ink/60">
          <strong className="text-ink">{fresh}</strong> fresh categories ready
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
            Pick at least one category pack.
          </p>
        )}
        <button
          type="button"
          disabled={!canStart}
          onClick={() => {
            sfx.unlock();
            s.startGame();
          }}
          className="btn tone-orange min-h-14 w-full text-lg disabled:opacity-50"
        >
          Start game
        </button>
      </div>
    </div>
  );
}
