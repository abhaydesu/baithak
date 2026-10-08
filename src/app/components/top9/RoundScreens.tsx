"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import { fitPromptClass } from "@/lib/fitText";
import {
  categoryById,
  questionCategories,
  top9Categories,
} from "@/lib/top9/categories";
import {
  isFinalRound,
  MAX_STRIKES,
  MIX,
  multiplier,
  otherTeam,
  useTop9,
} from "@/store/top9Store";
import Character from "../Character";
import {
  Board,
  GuessBox,
  StrikeFlash,
  Strikes,
  useQuestion,
  useTop9Sound,
} from "./Board";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/55">
      {children}
    </p>
  );
}

/** Question, pot, host/room view toggle and undo: shared by every board screen. */
function BoardHeader() {
  const question = useQuestion();
  const s = useTop9();
  const double = multiplier(s) > 1;

  return (
    <div className="flex flex-col gap-3">
      <p className="font-display text-xl font-extrabold leading-snug tracking-tight">
        {question?.prompt}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="chip tone-white px-3 py-1 text-sm">
          Pot{" "}
          <strong className="font-display text-base tabular-nums">
            {s.pot}
          </strong>
          {double && <span className="text-[#c63a28]">×2</span>}
        </span>
        <div className="flex gap-2">
          {s.undoStack.length > 0 && s.phase !== "roundEnd" && (
            <button
              type="button"
              onClick={s.undo}
              className="keycap tone-white h-9 px-3 text-xs"
            >
              ↶ Undo
            </button>
          )}
          {s.settings.mode === "host" && (
            <button
              type="button"
              onClick={s.toggleHostView}
              aria-pressed={!s.hostView}
              className="keycap tone-white h-9 px-3 text-xs"
            >
              {s.hostView ? "Room view" : "Host view"}
            </button>
          )}
        </div>
      </div>
      {s.settings.mode === "host" && (
        <p className="text-xs text-ink/50">
          {s.hostView
            ? "Answers are showing. Tap “Room view” before you turn the phone around."
            : "Room view: answers hidden. Tap “Host view” to see them again."}
        </p>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ intro

export function Intro() {
  const s = useTop9();
  const question = useQuestion();
  const final = isFinalRound(s);
  if (!question) return null;

  const categories = questionCategories(question)
    .map((id) => categoryById(id)?.label)
    .filter(Boolean);
  // Only categories chosen in setup; "Mix" deals from all of them.
  const options = [
    { id: MIX, label: "Mix" },
    ...top9Categories.filter((c) => s.settings.categories.includes(c.id)),
  ];

  return (
    <div className="flex min-h-[26rem] flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        {final && <Eyebrow>Final round</Eyebrow>}
        {multiplier(s) > 1 && (
          <span className="chip tone-red">Double points!</span>
        )}
      </div>

      {options.length > 2 && (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-ink/55">
            Host picks the category
          </p>
          <div
            role="toolbar"
            aria-label="Question category"
            className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 pt-0.5 [scrollbar-width:none] sm:-mx-7 sm:px-7"
          >
            {options.map((c) => (
              <button
                key={c.id}
                type="button"
                disabled={s.loading}
                aria-pressed={s.pick === c.id}
                onClick={() => void s.pickCategory(c.id)}
                className="keycap tone-white h-9 shrink-0 px-3 text-xs"
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        className={`inset-well relative grid h-72 shrink-0 place-items-center overflow-hidden px-5 pb-8 pt-10 text-center transition-opacity ${
          s.loading ? "opacity-40" : ""
        }`}
        aria-busy={s.loading}
      >
        <span className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {categories.map((label) => (
            <span key={label} className="chip tone-white text-[0.7rem]">
              {label}
            </span>
          ))}
        </span>
        <motion.p
          key={question.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`font-display ${fitPromptClass(question.prompt)} font-extrabold leading-tight tracking-tight`}
        >
          {question.prompt}
        </motion.p>
        <span className="absolute bottom-3 right-3 text-[0.7rem] font-semibold text-ink/45">
          {question.source === "survey"
            ? `Real survey · ${question.answers.length} answers`
            : `Baithak original · ${question.answers.length} answers`}
        </span>
      </div>

      {s.notice && (
        <p className="inset-well px-3 py-2 text-sm font-semibold">
          {s.notice}{" "}
          <button type="button" onClick={s.dismissNotice} className="underline">
            OK
          </button>
        </p>
      )}

      <p className="text-center text-sm text-ink/60">
        {s.settings.mode === "host"
          ? "Host: read it out loud."
          : "Read it out loud."}{" "}
        Then one player from each team steps up for the face-off.
      </p>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          disabled={s.loading}
          onClick={s.startFaceoff}
          className="btn tone-yellow min-h-14 w-full text-lg"
        >
          Start the face-off
        </button>
        <button
          type="button"
          disabled={s.loading}
          onClick={() => void s.skipQuestion()}
          className="self-center text-sm font-bold text-ink/60 underline underline-offset-4 disabled:opacity-50"
        >
          {s.loading ? "Finding another…" : "Skip this question"}
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ face-off

export function Faceoff() {
  const s = useTop9();
  const play = useTop9Sound();
  const host = s.settings.mode === "host";

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Eyebrow>Face-off</Eyebrow>
        <p className="mt-1 text-sm text-ink/65">
          First to buzz answers. If they&apos;re not top, the other player gets
          a go. The higher answer wins control.
        </p>
      </div>
      <BoardHeader />
      <Board tappable={host} />
      {host ? (
        <p className="text-sm text-ink/60">
          Tap the answers they give. Misses here aren&apos;t strikes.
        </p>
      ) : (
        <GuessBox placeholder="Type a face-off answer…" />
      )}
      <div className="brick-divider" />
      <div>
        <p className="mb-3 text-center font-bold">Who won the face-off?</p>
        <div className="grid grid-cols-2 gap-3">
          {s.teams.map((team, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                play("tap");
                s.giveControl(i);
              }}
              className={`btn tone-${team.tone}`}
            >
              {team.name}
            </button>
          ))}
        </div>
        <p className="mt-2 text-center text-xs text-ink/50">
          They choose to play; the board is theirs.
        </p>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ play

export function Play() {
  const s = useTop9();
  const play = useTop9Sound();
  const [flash, setFlash] = useState(0);
  const host = s.settings.mode === "host";
  const team = s.control !== null ? s.teams[s.control] : null;

  function giveStrike() {
    play("buzzer");
    setFlash((f) => f + 1);
    s.strike();
  }

  return (
    <div className="flex flex-col gap-5">
      <StrikeFlash count={Math.min(s.strikes, MAX_STRIKES)} flashKey={flash} />
      <div className="flex items-center justify-between gap-3">
        <div>
          <Eyebrow>In control</Eyebrow>
          <p className="font-display text-2xl font-extrabold tracking-tight">
            {team?.name}
          </p>
        </div>
        <Strikes count={s.strikes} />
      </div>
      <BoardHeader />
      <Board tappable={host} />
      {host ? (
        <details className="group">
          <summary className="cursor-pointer list-none text-sm font-bold text-ink/60 [&::-webkit-details-marker]:hidden">
            <span className="inline-block transition-transform group-open:rotate-90">
              ▸
            </span>{" "}
            Type a guess instead
          </summary>
          <div className="mt-3">
            <GuessBox onMiss={{ label: "Strike ✗", action: giveStrike }} />
          </div>
        </details>
      ) : (
        <GuessBox onMiss={{ label: "Give a strike ✗", action: giveStrike }} />
      )}
      <button
        type="button"
        onClick={giveStrike}
        className="btn tone-red w-full"
      >
        ✗ Strike · not on the board
      </button>
      <p className="-mt-2 text-center text-xs text-ink/50">
        {MAX_STRIKES - s.strikes}{" "}
        {MAX_STRIKES - s.strikes === 1 ? "strike" : "strikes"} left before{" "}
        {s.control !== null
          ? s.teams[otherTeam(s.control)].name
          : "the other team"}{" "}
        can steal.
      </p>
    </div>
  );
}

// ------------------------------------------------------------------ steal

export function Steal() {
  const s = useTop9();
  const play = useTop9Sound();
  const host = s.settings.mode === "host";
  if (s.control === null) return null;
  const thief = s.teams[otherTeam(s.control)];

  function failed() {
    play("buzzer");
    s.stealFailed();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <Character
          kind="fibber"
          tone={thief.tone}
          className="h-24 w-20 shrink-0 animate-wobble"
        />
        <div>
          <Eyebrow>Three strikes!</Eyebrow>
          <p className="font-display text-2xl font-extrabold leading-tight tracking-tight">
            {thief.name}, steal it!
          </p>
          <p className="mt-1 text-sm text-ink/65">
            Huddle up and agree on <strong>one</strong> answer. If it&apos;s on
            the board, you take the whole pot.
          </p>
        </div>
      </div>
      <BoardHeader />
      <Board tappable={host} />
      {host ? (
        <p className="text-sm text-ink/60">
          If their answer is up there, tap it.
        </p>
      ) : (
        <GuessBox
          placeholder="Type the steal answer…"
          onMiss={{ label: "Steal failed", action: failed }}
        />
      )}
      <button type="button" onClick={failed} className="btn tone-white w-full">
        Not on the board, steal failed
      </button>
    </div>
  );
}

// ------------------------------------------------------------------ round end

export function RoundEnd() {
  const s = useTop9();
  const question = useQuestion();
  const play = useTop9Sound();
  const winner = s.roundWinner !== null ? s.teams[s.roundWinner] : null;
  const points = s.pot * multiplier(s);
  const hidden = (question?.answers.length ?? 0) - s.revealed.length;
  const last = s.round + 1 >= s.settings.rounds;
  const stolen = s.roundWinner !== null && s.roundWinner !== s.control;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <Character
          kind={winner ? "actor" : "hotseat"}
          tone={winner?.tone ?? "white"}
          className="h-24 w-20 shrink-0"
        />
        <div>
          <Eyebrow>{stolen ? "Stolen!" : "Round over"}</Eyebrow>
          <p className="font-display text-2xl font-extrabold leading-tight tracking-tight">
            {winner ? `${winner.name} +${points}` : "No points this round"}
          </p>
          {multiplier(s) > 1 && winner && (
            <p className="text-sm text-ink/60">{s.pot} in the pot, doubled.</p>
          )}
        </div>
      </div>
      <p className="font-display text-lg font-bold leading-snug">
        {question?.prompt}
      </p>
      <Board tappable={false} />
      <div className="flex flex-col gap-3">
        {hidden > 0 && (
          <button
            type="button"
            onClick={() => {
              play("ding");
              s.revealRest();
            }}
            className="btn tone-blue w-full"
          >
            Reveal the other {hidden} {hidden === 1 ? "answer" : "answers"}
          </button>
        )}
        <button
          type="button"
          disabled={s.loading}
          onClick={() => {
            play(last ? "fanfare" : "tap");
            void s.nextRound();
          }}
          className="btn tone-yellow min-h-14 w-full text-lg"
        >
          {s.loading
            ? "Getting the next board…"
            : last
              ? "Final scores"
              : "Next round"}
        </button>
        {s.undoStack.length > 0 && (
          <button
            type="button"
            onClick={s.undo}
            className="self-center text-sm font-bold text-ink/55 underline underline-offset-4"
          >
            Oops, undo that
          </button>
        )}
      </div>
    </div>
  );
}
