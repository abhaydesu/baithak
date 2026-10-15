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
import {
  MAX_TEAMS,
  MOVIE_CATEGORIES,
  useDumbCharades,
} from "@/store/dumbCharadesStore";

const TURN_OPTIONS = [1, 2, 3, 5, 8];
const NUDGES: Array<{ value: number | null; label: string }> = [
  { value: 2, label: "2 min" },
  { value: 3, label: "3 min" },
  { value: 5, label: "5 min" },
  { value: null, label: "Never" },
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
      <h3 className="shrink-0 text-sm font-semibold text-ink-soft">
        {children}
      </h3>
      {hint && <span className="text-xs text-ink/45">{hint}</span>}
    </div>
  );
}

export default function Setup() {
  const s = useDumbCharades();
  const { settings, teams } = s;

  const pool = useMemo(() => buildPool(settings), [settings]);
  const playedSet = useMemo(() => new Set(s.played), [s.played]);
  const fresh = pool.filter((c) => !playedSet.has(normalize(c.word))).length;
  const allIds = charadesCategories.map((c) => c.id);
  const sameSet = (ids: string[]) =>
    ids.length === settings.categories.length && ids.every((id) => settings.categories.includes(id));

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h2 className="font-display text-3xl font-extrabold tracking-tight">New game</h2>
        <p className="mt-1 text-ink/60">
          One team picks a movie for the other team&apos;s actor, who acts it out
          while their team guesses. No clock, just patience.
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
              <PlayersInput players={team.players} onChange={(players) => s.setPlayers(team.id, players)} />
            </li>
          ))}
        </ul>
        {teams.length < MAX_TEAMS && (
          <button type="button" onClick={s.addTeam} className="keycap tone-white mt-3 h-11 w-full text-sm">
            + Add a team
          </button>
        )}
        <p className="mt-2 text-sm text-ink/55">
          {teams.length === 2
            ? "Each team picks the movie for the other."
            : "Each team picks the movie for the next team round the circle."}
        </p>
      </section>

      <section>
        <Label hint={`${teams.length * settings.turnsPerTeam} turns total`}>Turns per team</Label>
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
      </section>

      <section>
        <Label hint="A nudge, never a cutoff">Suggest giving up after</Label>
        <div className="grid grid-cols-4 gap-1.5">
          {NUDGES.map((o) => (
            <button
              key={o.label}
              type="button"
              aria-pressed={settings.nudgeMinutes === o.value}
              onClick={() => s.updateSettings({ nudgeMinutes: o.value })}
              className="keycap tone-white h-10 text-sm"
            >
              {o.label}
            </button>
          ))}
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
        <Label hint="Movies are the classic">What to act out</Label>
        <div className="mb-3 flex gap-2">
          <button
            type="button"
            aria-pressed={sameSet(MOVIE_CATEGORIES)}
            onClick={() => s.setCategories(MOVIE_CATEGORIES)}
            className="keycap tone-white h-9 px-3 text-xs"
          >
            Movies only
          </button>
          <button
            type="button"
            aria-pressed={sameSet(allIds)}
            onClick={() => s.setCategories([...allIds, ...(settings.customWords.length ? [CUSTOM_ID] : [])])}
            className="keycap tone-white h-9 px-3 text-xs"
          >
            Everything
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

      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={settings.stumpPoint}
          onChange={(e) => s.updateSettings({ stumpPoint: e.target.checked })}
          className="peer sr-only"
        />
        <span className="relative h-7 w-12 shrink-0 rounded-full border-2 border-line bg-white shadow-[inset_0_2px_0_rgb(0_0_0/0.06)] transition-colors peer-checked:border-[#178443] peer-checked:bg-[#25b35f] peer-focus-visible:outline-3 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border-2 after:border-line after:bg-white after:transition-transform peer-checked:after:translate-x-5 peer-checked:after:border-[#178443]" />
        <span>
          <span className="block font-bold">Point for stumping</span>
          <span className="block text-sm text-ink/60">
            If the actor&apos;s team gives up, the team that picked the movie
            gets the point.
          </span>
        </span>
      </label>

      <CustomWords />

      <div className="brick-divider" />

      <div className="flex flex-col gap-4">
        <p className="text-sm text-ink/60">
          <strong className="text-ink">{fresh}</strong> fresh titles ready
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
          className="btn tone-game min-h-14 w-full text-lg"
        >
          Start game
        </button>
      </div>
    </div>
  );
}

function PlayersInput({ players, onChange }: { players: string[]; onChange: (players: string[]) => void }) {
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
      aria-label="Player names, comma separated, to rotate actors"
      className="field mt-2 min-h-10 border-[color-mix(in_oklab,var(--tone-dark)_50%,transparent)] bg-white/80 py-1.5 text-sm"
    />
  );
}

function CustomWords() {
  const customWords = useDumbCharades((s) => s.settings.customWords);
  const setCustomWords = useDumbCharades((s) => s.setCustomWords);
  const [text, setText] = useState(customWords.join("\n"));

  return (
    <details className="inset-well group p-4" open={customWords.length > 0}>
      <summary className="flex min-h-11 cursor-pointer list-none items-center font-bold [&::-webkit-details-marker]:hidden">
        <span className="inline-block transition-transform group-open:rotate-90">▸</span>{" "}
        Add your own titles{customWords.length > 0 && ` (${customWords.length})`}
      </summary>
      <p className="mt-2 text-sm text-ink/55">One per line: movies, songs, anything.</p>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setCustomWords(e.target.value.split("\n"));
        }}
        rows={4}
        maxLength={2000}
        placeholder={"Dilwale Dulhania Le Jayenge\nHera Pheri"}
        aria-label="Your own titles, one per line"
        className="field mt-3 resize-y"
      />
    </details>
  );
}
