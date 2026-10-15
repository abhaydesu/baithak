"use client";

import { sfx } from "@/lib/sfx";
import {
  ADULT_CATEGORY,
  DEFAULT_CATEGORIES,
  familyCategories,
  SURVEY_CREDIT,
  top9Categories,
  TOTAL_BOARDS,
} from "@/lib/top9/categories";
import { useTop9, type HostMode } from "@/store/top9Store";

const ROUND_OPTIONS = [3, 5, 7, 10];
const MODES: Array<{ id: HostMode; label: string; hint: string }> = [
  { id: "host", label: "With a host", hint: "One person runs the board" },
  { id: "typed", label: "Host-free", hint: "Type guesses in, everyone plays" },
];

function Label({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: React.ReactNode;
}) {
  return (
    <div className="mb-2.5 flex items-baseline justify-between gap-2">
      <h3 className="shrink-0 text-sm font-semibold text-ink-soft">
        {children}
      </h3>
      {hint && <span className="text-right text-xs text-ink/45">{hint}</span>}
    </div>
  );
}

const adult = top9Categories.find((c) => c.id === ADULT_CATEGORY);

export default function Setup() {
  const s = useTop9();
  const selected = s.settings.categories;
  // Some boards sit in two categories, so cap the sum at the real total.
  const available = Math.min(
    top9Categories
      .filter((c) => selected.includes(c.id))
      .reduce((sum, c) => sum + c.count, 0),
    TOTAL_BOARDS,
  );
  const allFamily = DEFAULT_CATEGORIES.every((id) => selected.includes(id));
  const adultOn = selected.includes(ADULT_CATEGORY);

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h2 className="font-display text-3xl font-extrabold tracking-tight">
          New game
        </h2>
        <p className="mt-1 text-ink/60">
          Two teams, one board. Guess what the crowd said.
        </p>
      </div>

      <section>
        <Label>Teams</Label>
        <ul className="grid gap-3 sm:grid-cols-2">
          {s.teams.map((team, i) => (
            <li
              key={i}
              className={`brick brick-flat tone-${team.tone} flex items-center gap-2 p-3`}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-[var(--tone-edge)] bg-[var(--tone-solid)] font-display font-extrabold text-white">
                {i + 1}
              </span>
              <input
                aria-label={`Team ${i + 1} name`}
                value={team.name}
                maxLength={20}
                onChange={(e) => s.renameTeam(i, e.target.value)}
                className="field min-h-10 flex-1 border-[var(--tone-dark)] py-1.5 font-display font-bold"
              />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <Label>How are you playing?</Label>
        <div className="grid grid-cols-2 gap-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              aria-pressed={s.settings.mode === m.id}
              onClick={() => s.updateSettings({ mode: m.id })}
              className="keycap tone-white h-auto min-h-16 flex-col gap-0 px-2 py-2 text-sm"
            >
              {m.label}
              <span className="text-xs font-medium opacity-70">{m.hint}</span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-ink/55">
          {s.settings.mode === "host"
            ? "The host holds the phone, sees the answers, and taps them in as teams call them out. Flip to room view to show everyone the board."
            : "Nobody sees the answers. Type each guess in and the board checks it, typos and all."}
        </p>
      </section>

      {/* Categories */}
      <section>
        <Label
          hint={`${allFamily ? "" : "~"}${available.toLocaleString("en-IN")} boards`}
        >
          Categories
        </Label>
        <div className="mb-3 flex gap-2">
          <button
            type="button"
            aria-pressed={allFamily}
            onClick={() =>
              s.setCategories(
                adultOn
                  ? [...DEFAULT_CATEGORIES, ADULT_CATEGORY]
                  : DEFAULT_CATEGORIES,
              )
            }
            className="keycap tone-white h-9 px-3 text-xs"
          >
            All categories
          </button>
          <button
            type="button"
            onClick={() => s.setCategories(adultOn ? [ADULT_CATEGORY] : [])}
            className="keycap tone-white h-9 px-3 text-xs"
          >
            Clear
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {familyCategories.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={selected.includes(c.id)}
              onClick={() => s.toggleCategory(c.id)}
              className={`keycap tone-${c.tone === "white" ? "yellow" : c.tone} h-10 px-3 text-sm`}
            >
              {c.label}
              <span className="rounded-md bg-black/5 px-1.5 text-xs tabular-nums">
                {c.count.toLocaleString("en-IN")}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-ink/55">
          The host can also switch category before any round.
        </p>

        {adult && (
          <label className="inset-well mt-4 flex cursor-pointer items-center gap-3 p-3">
            <input
              type="checkbox"
              checked={adultOn}
              onChange={() => s.toggleCategory(ADULT_CATEGORY)}
              className="peer sr-only"
            />
            <span className="relative h-7 w-12 shrink-0 rounded-full border-2 border-line bg-white shadow-[inset_0_2px_0_rgb(0_0_0/0.06)] transition-colors peer-checked:border-[#c63a28] peer-checked:bg-[#ff5a45] after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border-2 after:border-line after:bg-white after:transition-transform peer-checked:after:translate-x-5 peer-checked:after:border-[#c63a28] peer-focus-visible:outline-3" />
            <span>
              <span className="block font-bold">
                {adult.label}{" "}
                <span className="font-normal text-ink/50">· {adult.count}</span>
              </span>
              <span className="block text-sm text-ink/60">
                Cheeky, grown-up questions. Leave off when kids are playing.
              </span>
            </span>
          </label>
        )}
      </section>

      <section>
        <Label>Rounds</Label>
        <div className="grid grid-cols-4 gap-2">
          {ROUND_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={s.settings.rounds === n}
              onClick={() => s.updateSettings({ rounds: n })}
              className="keycap tone-white h-11 text-sm"
            >
              {n}
            </button>
          ))}
        </div>
        {s.used.length > 0 && (
          <p className="mt-2 text-sm text-ink/55">
            {s.used.length} boards played on this phone won&apos;t come up
            again.{" "}
            <button
              type="button"
              onClick={s.resetUsed}
              className="font-bold text-ink underline underline-offset-2"
            >
              Allow repeats
            </button>
          </p>
        )}
      </section>

      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={s.settings.doubleFinal}
          onChange={(e) => s.updateSettings({ doubleFinal: e.target.checked })}
          className="peer sr-only"
        />
        <span className="relative h-7 w-12 shrink-0 rounded-full border-2 border-line bg-white shadow-[inset_0_2px_0_rgb(0_0_0/0.06)] transition-colors peer-checked:border-[#178443] peer-checked:bg-[#25b35f] after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border-2 after:border-line after:bg-white after:transition-transform peer-checked:after:translate-x-5 peer-checked:after:border-[#178443] peer-focus-visible:outline-3" />
        <span>
          <span className="block font-bold">
            Double points in the final round
          </span>
          <span className="block text-sm text-ink/60">
            Keeps it close until the very end.
          </span>
        </span>
      </label>

      <div className="brick-divider" />

      {s.notice && (
        <p className="inset-well px-3 py-2 text-sm font-semibold text-[#c63a28]">
          {s.notice}
        </p>
      )}

      <button
        type="button"
        disabled={s.loading || selected.length === 0}
        onClick={() => {
          sfx.unlock();
          void s.startGame();
        }}
        className="btn tone-game min-h-14 w-full text-lg"
      >
        {s.loading
          ? "Dealing the questions…"
          : selected.length === 0
            ? "Pick at least one category"
            : "Start game"}
      </button>

      <p className="text-center text-xs text-ink/45">
        Survey questions from{" "}
        <a
          href={SURVEY_CREDIT.url}
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          {SURVEY_CREDIT.label}
        </a>
        , {SURVEY_CREDIT.license}. Desi life boards are Baithak originals.
      </p>
    </div>
  );
}
