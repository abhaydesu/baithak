"use client";

import { useEffect } from "react";

import { fitPromptClass } from "@/lib/fitText";
import { sfx } from "@/lib/sfx";
import {
  alivePlayers,
  nextAlive,
  playerName,
  useBomb,
} from "@/store/bombStore";
import Character from "../Character";

/** Prompt is up; whoever holds the phone lights the fuse. */
export function Ready() {
  const s = useBomb();
  const holder = playerName(s, s.holderId);

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <Character kind="bomber" tone="red" className="h-28 w-24 animate-bob" />
      <div className="w-full">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-ink/55">
          Round {s.round} · the prompt
        </p>
        <div className="grid h-32 place-items-center overflow-hidden">
          <h2
            className={`font-display ${fitPromptClass(s.prompt ?? "")} font-extrabold leading-tight tracking-tight`}
          >
            {s.prompt}
          </h2>
        </div>
      </div>
      <p className="line-clamp-3 min-h-[4.5rem] text-ink/70">
        <strong className="text-ink">{holder}</strong> starts with the bomb.
        Say an answer, then pass the phone. No repeats, and no thinking
        for too long.
      </p>
      <div className="flex w-full flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={s.newPrompt}
          className="btn tone-white min-h-14 sm:flex-1"
        >
          Different prompt
        </button>
        <button
          type="button"
          onClick={() => {
            sfx.unlock();
            s.lightFuse();
          }}
          className="btn tone-red min-h-14 text-lg sm:flex-[2]"
        >
          Light the fuse
        </button>
      </div>
    </div>
  );
}

/** The bomb is ticking. Hidden fuse: it can go off at any moment. */
export function Live() {
  const s = useBomb();
  const { endsAt, muted, explode } = s;
  const holder = playerName(s, s.holderId);
  const next = nextAlive(s, s.holderId);

  // Go off when the fuse runs out. If the page was reloaded after that
  // moment, it goes off straight away.
  useEffect(() => {
    if (endsAt === null) return;
    const id = window.setTimeout(
      () => {
        if (!muted) sfx.boom();
        explode();
      },
      Math.max(0, endsAt - Date.now()),
    );
    return () => window.clearTimeout(id);
  }, [endsAt, muted, explode]);

  // Ticks get faster as the fuse burns down.
  useEffect(() => {
    if (endsAt === null || muted) return;
    let id: number;
    const tick = () => {
      const left = endsAt - Date.now();
      if (left <= 0) return;
      sfx.tick();
      id = window.setTimeout(tick, Math.max(110, Math.min(750, left / 7)));
    };
    id = window.setTimeout(tick, 400);
    return () => window.clearTimeout(id);
  }, [endsAt, muted]);

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <Character kind="bomber" tone="red" className="h-28 w-24 animate-wobble" />
      <p className="inset-well grid h-20 w-full place-items-center overflow-hidden px-4 font-display text-lg font-extrabold leading-snug">
        <span className="line-clamp-2">{s.prompt}</span>
      </p>
      <div className="w-full">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-ink/55">
          Holding the bomb
        </p>
        <h2 className="mt-1 truncate font-display text-5xl font-extrabold leading-tight tracking-tight">
          {holder}
        </h2>
      </div>
      <button
        type="button"
        onClick={() => {
          if (!muted) sfx.tap();
          s.pass();
        }}
        className="btn tone-white min-h-24 w-full text-xl"
      >
        <span className="block min-w-0 truncate">
          Said it. Pass to {next?.name ?? "next"} ➜
        </span>
      </button>
      <p className="text-sm text-ink/60">
        Say a fresh answer out loud, then hand the phone on. Nobody knows when
        it goes off.
      </p>
    </div>
  );
}

/** Someone was holding it when it went off. */
export function Boom() {
  const s = useBomb();
  const name = playerName(s, s.blownId);
  const left = s.blownId ? (s.lives[s.blownId] ?? 0) : 0;
  const out = left === 0;
  const finished = alivePlayers(s).length <= 1;

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div aria-hidden className="animate-bob text-8xl leading-none">
        💥
      </div>
      <div>
        <h2 className="font-display text-4xl font-extrabold tracking-tight">
          {name} blew up!
        </h2>
        <p className="mt-2 text-ink/70">
          {out
            ? `${name} is out of the game.`
            : `${name} has ${left} ${left === 1 ? "life" : "lives"} left.`}{" "}
          The bomb went round {s.passes} {s.passes === 1 ? "time" : "times"}.
        </p>
      </div>
      <button
        type="button"
        onClick={s.nextRound}
        className="btn tone-green min-h-14 w-full text-lg"
      >
        {finished ? "See who won" : "Next round"}
      </button>
    </div>
  );
}
