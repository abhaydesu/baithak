"use client";

import { useMemo, useState } from "react";

import {
  buildPool,
  charadesCategories,
  CUSTOM_ID,
  normalize,
  type LevelSetting,
} from "@/lib/charades/words";
import { sfx } from "@/lib/sfx";
import { MAX_TEAMS, useHotSeat } from "@/store/hotSeatStore";

const TIMER_OPTIONS = [30, 45, 60, 90, 120];
const TURN_OPTIONS = [1, 2, 3, 5, 8];
const PASS_OPTIONS: Array<{ value: number | null; label: string }> = [
  { value: 0, label: "None" },
  { value: 3, label: "3" },
  { value: 5, label: "5" },
  { value: null, label: "Unlimited" },
];
const LEVELS: Array<{ id: LevelSetting; label: string }> = [
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
      {hint && <span className="text-xs text-ink/45">{hint}</span>}
    </div>
  );
}

export default function Setup() {
  const s = useHotSeat();
  const { settings, teams } = s;

  const pool = useMemo(() => buildPool(settings), [settings]);
  const playedSet = useMemo(() => new Set(s.played), [s.played]);
  const fresh = pool.filter((c) => !playedSet.has(normalize(c.word))).length;
  const allIds = charadesCategories.map((c) => c.id);

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h2 className="font-display text-3xl font-extrabold tracking-tight">New game</h2>
        <p className="mt-1 text-ink/60">
          Set up teams. One player takes the hot seat, facing away from the phone.
          Their team describes each word so they can guess it, and the phone
          deals the words and runs the clock.
        </p>
      </div>

      <section>
        <Label hint={`${teams.length} of ${MAX_TEAMS}`}>Teams</Label>
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
                {teams.length > 2 && (
                  <button
                    type="button"
                    aria-label={`Remove ${team.name}`}
                    onClick={() => s.removeTeam(team.id)}
                    className="keycap tone-white h-10 w-10 shrink-0 text-lg"
                  >
                    ×
                  </button>
                )}
              </div>
              <PlayersInput
                players={team.players}
                onChange={(players) => s.setPlayers(team.id, players)}
              />
            </li>
          ))}
        </ul>
        {teams.length < MAX_TEAMS && (
          <button type="button" onClick={s.addTeam} className="keycap tone-white mt-3 h-11 w-full text-sm">
            + Add a team
          </button>
        )}
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label>Time per turn</Label>
          <div className="grid grid-cols-5 gap-1.5">
            {TIMER_OPTIONS.map((sec) => (
              <button
                key={sec}
                type="button"
                aria-pressed={settings.roundSeconds === sec}
                onClick={() => s.updateSettings({ roundSeconds: sec })}
                className="keycap tone-white h-10 text-sm"
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label hint={`${teams.length * settings.turnsPerTeam} turns total`}>
            Turns per team
          </Label>
          <div className="grid grid-cols-5 gap-1.5">
            {TURN_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={settings.turnsPerTeam === n}
                onClick={() => s.updateSettings({ turnsPerTeam: n })}
                className="keycap tone-white h-10 text-sm"
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section>
        <Label>Difficulty</Label>
        <div className="grid grid-cols-4 gap-1.5">
          {LEVELS.map((d) => (
            <button
              key={d.id}
              type="button"
              aria-pressed={settings.difficulty === d.id}
              onClick={() => s.updateSettings({ difficulty: d.id })}
              className="keycap tone-white h-10 text-sm"
            >
              {d.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <Label hint="Skips per turn">Passes</Label>
        <div className="grid grid-cols-4 gap-1.5">
          {PASS_OPTIONS.map((o) => (
            <button
              key={o.label}
              type="button"
              aria-pressed={settings.passes === o.value}
              onClick={() => s.updateSettings({ passes: o.value })}
              className="keycap tone-white h-10 text-sm"
            >
              {o.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <Label hint="Pick as many as you like">Categories</Label>
        <div className="mb-3 flex gap-2">
          <button
            type="button"
            onClick={() => s.setCategories([...allIds, ...(settings.customWords.length ? [CUSTOM_ID] : [])])}
            className="keycap tone-white h-9 px-3 text-xs"
          >
            All
          </button>
          <button
            type="button"
            onClick={() => s.setCategories(["bollywood", "south", "filmy", "songs", "tv", "people", "desi", "cricket"])}
            className="keycap tone-white h-9 px-3 text-xs"
          >
            Desi mix
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {charadesCategories.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={settings.categories.includes(c.id)}
              onClick={() => s.toggleCategory(c.id)}
              className={`keycap tone-${c.tone} h-10 px-3.5 text-sm`}
            >
              {c.label}
            </button>
          ))}
          {settings.customWords.length > 0 && (
            <button
              type="button"
              aria-pressed={settings.categories.includes(CUSTOM_ID)}
              onClick={() => s.toggleCategory(CUSTOM_ID)}
              className="keycap tone-white h-10 px-3.5 text-sm"
            >
              Your words ({settings.customWords.length})
            </button>
          )}
        </div>
      </section>

      <CustomWords />

      <div className="brick-divider" />

      <div className="flex flex-col gap-4">
        <p className="text-sm text-ink/60">
          <strong className="text-ink">{fresh}</strong> fresh words ready
          {s.played.length > 0 && (
            <>
              {" · "}
              {s.played.length} already used{" "}
              <button type="button" onClick={s.resetPlayed} className="font-bold text-ink underline underline-offset-2">
                reset
              </button>
            </>
          )}
        </p>
        <button
          type="button"
          disabled={fresh === 0}
          onClick={() => {
            sfx.unlock();
            s.startGame();
          }}
          className="btn tone-orange min-h-14 w-full text-lg"
        >
          Start game
        </button>
      </div>
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
      placeholder="Hot seat order (optional): Asha, Ravi…"
      aria-label="Player names, comma separated, to rotate the hot seat"
      className="field mt-2 min-h-10 border-[color-mix(in_oklab,var(--tone-dark)_50%,transparent)] bg-white/80 py-1.5 text-sm"
    />
  );
}

function CustomWords() {
  const customWords = useHotSeat((s) => s.settings.customWords);
  const setCustomWords = useHotSeat((s) => s.setCustomWords);
  // Raw text locally, so typing newlines and spaces feels natural.
  const [text, setText] = useState(customWords.join("\n"));

  return (
    <details className="inset-well group p-4" open={customWords.length > 0}>
      <summary className="cursor-pointer list-none font-bold [&::-webkit-details-marker]:hidden">
        <span className="inline-block transition-transform group-open:rotate-90">▸</span>{" "}
        Add your own words
        {customWords.length > 0 && ` (${customWords.length})`}
      </summary>
      <p className="mt-2 text-sm text-ink/55">
        Inside jokes, family names, anything. One per line.
      </p>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setCustomWords(e.target.value.split("\n"));
        }}
        rows={4}
        maxLength={2000}
        placeholder={"Dadu's morning walk\nPapa parking the car"}
        aria-label="Your own words, one per line"
        className="field mt-3 resize-y"
      />
    </details>
  );
}
