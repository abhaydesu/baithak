"use client";

import { useMemo, useState } from "react";

import { sfx } from "@/lib/sfx";
import { buildPool, normalize, type DifficultySetting } from "@/lib/words/deck";
import {
  pictionaryCategories,
  THEME_CATEGORY_ID,
} from "@/lib/words/pictionary";
import { MAX_TEAMS, usePictionary } from "@/store/pictionaryStore";

const TIMER_OPTIONS = [30, 45, 60, 90, 120];
const TURN_OPTIONS = [1, 2, 3, 5, 8];
const DIFFICULTIES: Array<{ id: DifficultySetting; label: string }> = [
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
  { id: "mix", label: "Mix" },
];

function Label({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
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
  const s = usePictionary();
  const { settings, teams, theme } = s;

  const pool = useMemo(
    () => buildPool({ ...settings, theme }),
    [settings, theme],
  );
  const playedSet = useMemo(() => new Set(s.played), [s.played]);
  const fresh = pool.filter((c) => !playedSet.has(normalize(c.word))).length;
  const stealsPossible = settings.picker === "drawer" || teams.length > 2;

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h2 className="font-display text-3xl font-extrabold tracking-tight">
          New game
        </h2>
        <p className="mt-1 text-ink/60">
          Set up teams, then pass the phone to the first drawer.
        </p>
      </div>

      {/* Teams */}
      <section>
        <Label hint={`${teams.length} of ${MAX_TEAMS}`}>Teams</Label>
        <ul className="flex flex-col gap-3">
          {teams.map((team, i) => (
            <li
              key={team.id}
              className={`brick brick-flat tone-${team.tone} p-3`}
            >
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
          <button
            type="button"
            onClick={s.addTeam}
            className="keycap tone-white mt-3 h-11 w-full text-sm"
          >
            + Add a team
          </button>
        )}
      </section>

      {/* Round settings */}
      <section className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label>Drawing time</Label>
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
          {DIFFICULTIES.map((d) => (
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

      {/* Categories */}
      <section>
        <Label hint="Pick as many as you like">Categories</Label>
        <div className="flex flex-wrap gap-2">
          {pictionaryCategories.map((c) => (
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
          {theme && (
            <button
              type="button"
              aria-pressed={settings.categories.includes(THEME_CATEGORY_ID)}
              onClick={() => s.toggleCategory(THEME_CATEGORY_ID)}
              className="keycap tone-pink h-10 px-3.5 text-sm"
            >
              Theme: {theme.name}
            </button>
          )}
        </div>
      </section>

      <ThemeFetcher />

      <section>
        <Label>Who picks the word?</Label>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              {
                id: "opponents",
                label: "The other team",
                hint: "Classic rules",
              },
              { id: "drawer", label: "The drawer", hint: "Quicker turns" },
            ] as const
          ).map((o) => (
            <button
              key={o.id}
              type="button"
              aria-pressed={settings.picker === o.id}
              onClick={() => s.updateSettings({ picker: o.id })}
              className="keycap tone-white h-auto min-h-14 flex-col gap-0 py-2 text-sm"
            >
              {o.label}
              <span className="text-xs font-medium opacity-70">{o.hint}</span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-ink/55">
          {settings.picker === "opponents"
            ? "Opponents choose from the deck or write their own word, then hand the phone over."
            : "The drawer chooses from the deck or writes their own word."}
        </p>
      </section>

      {stealsPossible ? (
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={settings.steals}
            onChange={(e) => s.updateSettings({ steals: e.target.checked })}
            className="peer sr-only"
          />
          <span className="relative h-7 w-12 shrink-0 rounded-full border-2 border-line bg-white shadow-[inset_0_2px_0_rgb(0_0_0/0.06)] transition-colors peer-checked:border-[#178443] peer-checked:bg-[#25b35f] peer-focus-visible:outline-3 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border-2 after:border-line after:bg-white after:transition-transform peer-checked:after:translate-x-5 peer-checked:after:border-[#178443]" />
          <span>
            <span className="block font-bold">Steals</span>
            <span className="block text-sm text-ink/60">
              If the drawing team misses, another team can shout it and take the
              point.
            </span>
          </span>
        </label>
      ) : (
        <p className="text-sm text-ink/55">
          <strong className="text-ink">Steals</strong> need a third team when
          opponents pick the word, since the picking team already knows it.
        </p>
      )}

      <div className="brick-divider" />

      <div className="flex flex-col gap-4">
        <p className="text-sm text-ink/60">
          <strong className="text-ink">{fresh}</strong> fresh words ready
          {s.played.length > 0 && (
            <>
              {" · "}
              {s.played.length} already drawn{" "}
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
        <button
          type="button"
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
        onChange(
          e.target.value
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean),
        );
      }}
      placeholder="Players (optional): Asha, Ravi…"
      aria-label="Player names, comma separated, to rotate drawers"
      className="field mt-2 min-h-10 border-[color-mix(in_oklab,var(--tone-dark)_50%,transparent)] bg-white/80 py-1.5 text-sm"
    />
  );
}

function ThemeFetcher() {
  const theme = usePictionary((s) => s.theme);
  const setTheme = usePictionary((s) => s.setTheme);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function fetchTheme(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setStatus("loading");
    try {
      const res = await fetch(`/api/words/theme?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      if (!data.words?.length)
        throw new Error(
          `Couldn't find words for “${q}”. Try something broader.`,
        );
      setTheme({ name: data.theme, words: data.words });
      setQuery("");
      setStatus("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  return (
    <section className="inset-well p-4">
      <Label hint="Beta">Custom theme</Label>
      {theme ? (
        <div>
          <p className="text-sm">
            <strong>{theme.words.length} words</strong> about{" "}
            <strong>{theme.name}</strong>, e.g.{" "}
            <span className="text-ink/60">
              {theme.words.slice(0, 6).join(", ")}…
            </span>
          </p>
          <button
            type="button"
            onClick={() => setTheme(null)}
            className="mt-2 text-sm font-bold underline underline-offset-2"
          >
            Remove theme
          </button>
        </div>
      ) : (
        <form onSubmit={fetchTheme} className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="beach, wedding, space…"
            maxLength={30}
            className="field min-h-11"
            aria-label="Theme"
          />
          <button
            type="submit"
            disabled={status === "loading" || !query.trim()}
            className="btn btn-sm tone-pink min-h-11 shrink-0"
          >
            {status === "loading" ? "Finding…" : "Add"}
          </button>
        </form>
      )}
      <p className="mt-2 text-xs text-ink/45">
        Pulls related words from the Datamuse word API. Needs internet.
      </p>
      {status === "error" && !theme && (
        <p className="mt-2 text-sm font-semibold text-[#c63a28]">{error}</p>
      )}
    </section>
  );
}
