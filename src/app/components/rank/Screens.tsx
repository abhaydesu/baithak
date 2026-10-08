"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { fitPromptClass } from "@/lib/fitText";
import { rankerOf, useRank } from "@/store/rankStore";
import Character from "../Character";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/55">{children}</p>
  );
}

export function RankScreen() {
  const s = useRank();
  const ranker = rankerOf(s);

  return (
    <div className="flex min-h-[26rem] flex-col gap-5 text-center">
      <div className="flex flex-col items-center">
        <Character kind="vadapav" tone="pink" className="h-24 w-24 animate-bob" />
        <Eyebrow>Ranker</Eyebrow>
        <h2 className="mt-1 line-clamp-1 font-display text-4xl font-extrabold tracking-tight">
          {ranker.name}
        </h2>
      </div>

      <div className="inset-well relative grid h-48 shrink-0 place-items-center overflow-hidden px-4 py-6">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={s.topic}
            initial={{ opacity: 0, y: 14, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            className={`font-display ${fitPromptClass(s.topic ?? "")} font-extrabold leading-tight tracking-tight`}
          >
            {s.topic}
          </motion.p>
        </AnimatePresence>
      </div>

      <p className="text-sm text-ink/60">
        {ranker.name}, rank everyone else from first to last out loud, then
        explain your top and bottom picks. No skipping anyone.
      </p>

      <div className="mt-auto flex flex-col gap-3">
        <button type="button" onClick={s.toVote} className="btn tone-pink min-h-14 w-full text-lg">
          Done. Time to vote
        </button>
        <button
          type="button"
          disabled={s.swapped}
          onClick={s.swapTopic}
          className="btn tone-white"
        >
          Swap topic (once)
        </button>
      </div>
    </div>
  );
}

export function Vote() {
  const s = useRank();
  const ranker = rankerOf(s);
  const [rejecting, setRejecting] = useState(false);
  const others = s.players.filter((p) => p.id !== ranker.id);

  return (
    <div className="flex min-h-[26rem] flex-col gap-5 text-center">
      <div>
        <Eyebrow>The group votes</Eyebrow>
        <h2 className="mt-2 font-display text-2xl font-extrabold leading-tight tracking-tight">
          {rejecting ? "Who argued it down best?" : `Is ${ranker.name}'s ranking fair?`}
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink/60">
          {rejecting
            ? "Pick the player with the best argument. They win the point."
            : "Everyone gives a thumbs up or thumbs down at the same time. Majority wins."}
        </p>
      </div>

      {rejecting ? (
        <div className="grid grid-cols-2 gap-2">
          {others.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => s.resolve("rejected", p.id)}
              className="btn tone-white min-h-12"
            >
              <span className="truncate">{p.name}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => s.resolve("rejected", null)}
            className="btn tone-white col-span-2 min-h-12"
          >
            Nobody. No points
          </button>
        </div>
      ) : (
        <div className="mt-auto flex flex-col gap-3">
          <button
            type="button"
            onClick={() => s.resolve("fair", null)}
            className="btn tone-green min-h-16 w-full text-xl"
          >
            Fair · +1 {ranker.name}
          </button>
          <button
            type="button"
            onClick={() => setRejecting(true)}
            className="btn tone-red min-h-14 w-full"
          >
            Rejected
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={rejecting ? () => setRejecting(false) : s.backToRank}
        className="self-center text-sm font-bold text-ink/55 underline underline-offset-4"
      >
        Back
      </button>
    </div>
  );
}
