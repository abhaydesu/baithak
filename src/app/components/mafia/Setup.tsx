"use client";

import { sfx } from "@/lib/sfx";
import {
  maxMafia,
  MAX_PLAYERS,
  MIN_PLAYERS,
  roleBreakdown,
  useMafia,
  type NightMode,
} from "@/store/mafiaStore";

const TIMER_OPTIONS = [
  { sec: 0, label: "Off" },
  { sec: 60, label: "1m" },
  { sec: 120, label: "2m" },
  { sec: 180, label: "3m" },
  { sec: 300, label: "5m" },
];

const MODES: Array<{ id: NightMode; label: string; hint: string }> = [
  { id: "pass", label: "Pass the phone", hint: "Everyone plays" },
  { id: "narrator", label: "Narrator", hint: "One person calls the night" },
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
      <h3 className="shrink-0 text-xs font-bold uppercase tracking-[0.15em] text-ink/55">
        {children}
      </h3>
      {hint && <span className="text-xs text-ink/45">{hint}</span>}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  title,
  body,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  body: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span className="relative h-7 w-12 shrink-0 rounded-full border-2 border-line bg-white shadow-[inset_0_2px_0_rgb(0_0_0/0.06)] transition-colors peer-checked:border-[#5836d6] peer-checked:bg-[#7c5cff] peer-focus-visible:outline-3 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border-2 after:border-line after:bg-white after:transition-transform peer-checked:after:translate-x-5 peer-checked:after:border-[#5836d6]" />
      <span>
        <span className="block font-bold">{title}</span>
        <span className="block text-sm text-ink/60">{body}</span>
      </span>
    </label>
  );
}

export default function Setup() {
  const s = useMafia();
  const { settings, players } = s;
  const maxM = maxMafia(players.length);
  const deck = roleBreakdown(players.length, settings);
  const canStart = players.length >= MIN_PLAYERS;

  const deckParts = [
    `${deck.mafia} Mafia`,
    ...(deck.doctor ? ["1 Doctor"] : []),
    ...(deck.detective ? ["1 Detective"] : []),
    `${deck.villagers} Villager${deck.villagers === 1 ? "" : "s"}`,
  ];

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h2 className="font-display text-3xl font-extrabold tracking-tight">
          New game
        </h2>
        <p className="mt-1 text-ink/60">
          Add everyone in seating order. The phone deals the secret roles,
          guides the night and keeps score.
        </p>
      </div>

      {/* Players */}
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

      <section className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label hint={maxM === 1 ? "More with 6+ players" : undefined}>
            Mafia
          </Label>
          <div className="grid grid-cols-3 gap-1.5">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                type="button"
                disabled={n > maxM}
                aria-pressed={Math.min(settings.mafia, maxM) === n}
                onClick={() => s.updateSettings({ mafia: n })}
                className="keycap tone-white h-10 text-sm disabled:opacity-40"
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label>Day timer</Label>
          <div className="grid grid-cols-5 gap-1.5">
            {TIMER_OPTIONS.map((o) => (
              <button
                key={o.sec}
                type="button"
                aria-pressed={settings.discussSeconds === o.sec}
                onClick={() => s.updateSettings({ discussSeconds: o.sec })}
                className="keycap tone-white h-10 text-sm"
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Town roles */}
      <section>
        <Label hint={deckParts.join(" · ")}>Village roles</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            aria-pressed={settings.doctor}
            onClick={() => s.updateSettings({ doctor: !settings.doctor })}
            className="keycap tone-green h-auto min-h-14 flex-col gap-0 px-2 py-2 text-sm"
          >
            <span>Doctor</span>
            <span className="text-xs font-medium opacity-75">
              Saves 1 player each night
            </span>
          </button>
          <button
            type="button"
            aria-pressed={settings.detective}
            onClick={() => s.updateSettings({ detective: !settings.detective })}
            className="keycap tone-blue h-auto min-h-14 flex-col gap-0 px-2 py-2 text-sm"
          >
            <span>Detective</span>
            <span className="text-xs font-medium opacity-75">
              Checks 1 player each night
            </span>
          </button>
        </div>
      </section>

      {/* Night mode */}
      <section>
        <Label>How to run the night</Label>
        <div className="grid grid-cols-2 gap-2">
          {MODES.map((o) => (
            <button
              key={o.id}
              type="button"
              aria-pressed={settings.mode === o.id}
              onClick={() => s.updateSettings({ mode: o.id })}
              className="keycap tone-white h-auto min-h-14 flex-col gap-0 px-2 py-2 text-sm"
            >
              {o.label}
              <span className="text-xs font-medium opacity-70">{o.hint}</span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-ink/55">
          {settings.mode === "pass"
            ? "Pass the phone round the circle each night. Villagers get a decoy screen so every turn looks the same."
            : "Everyone closes their eyes. One narrator holds the phone, reads the prompts and taps who each role points at."}
        </p>
      </section>

      <Toggle
        checked={settings.revealRole}
        onChange={(revealRole) => s.updateSettings({ revealRole })}
        title="Reveal roles when eliminated"
        body="Show everyone whether an eliminated player was Villager, Doctor, Detective or Mafia."
      />

      <div className="brick-divider" />

      <div className="flex flex-col gap-4">
        <p className="text-sm text-ink/60">
          Deck:{" "}
          <strong className="text-ink">{deckParts.join(" · ")}</strong>
        </p>
        {!canStart && (
          <p className="text-sm font-semibold text-[#c63a28]">
            You need at least {MIN_PLAYERS} players.
          </p>
        )}
        <button
          type="button"
          disabled={!canStart}
          onClick={() => {
            sfx.unlock();
            s.startGame();
          }}
          className="btn tone-purple min-h-14 w-full text-lg disabled:opacity-50"
        >
          Deal the roles
        </button>
      </div>
    </div>
  );
}
