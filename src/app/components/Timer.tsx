"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import { sfx } from "@/lib/sfx";
import { ClockIcon } from "./Icons";

interface TimerProps {
  initialSeconds?: number;
  presets?: number[];
  title?: string;
  onComplete?: () => void;
}

export default function Timer({
  initialSeconds = 60,
  presets = [30, 60, 90, 120],
  title = "Round timer",
  onComplete,
}: TimerProps) {
  const [length, setLength] = useState(initialSeconds);
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(String(Math.floor(initialSeconds / 60)));
  const [customSeconds, setCustomSeconds] = useState(String(initialSeconds % 60).padStart(2, "0"));
  const [customError, setCustomError] = useState("");
  const endAtRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
      setSeconds(left);
      if (left === 0) {
        window.clearInterval(id);
        setRunning(false);
        sfx.buzzer();
        onComplete?.();
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [running, onComplete]);

  function start() {
    sfx.unlock();
    const from = seconds <= 0 ? length : seconds;
    setSeconds(from);
    endAtRef.current = Date.now() + from * 1000;
    setRunning(true);
  }

  function pause() {
    setRunning(false);
  }

  function reset(next = length) {
    setRunning(false);
    setLength(next);
    setSeconds(next);
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const progress = length ? seconds / length : 0;
  const urgent = running && seconds <= 10;
  const done = seconds === 0;

  function applyCustomTime(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const minutes = Number(customMinutes);
    const extraSeconds = Number(customSeconds);
    if (
      !Number.isInteger(minutes) ||
      !Number.isInteger(extraSeconds) ||
      minutes < 0 ||
      minutes > 99 ||
      extraSeconds < 0 ||
      extraSeconds > 59 ||
      minutes * 60 + extraSeconds === 0
    ) {
      setCustomError("Enter a duration from 1 second to 99:59.");
      return;
    }

    reset(minutes * 60 + extraSeconds);
    setCustomError("");
    setCustomOpen(false);
  }

  return (
    <div className="surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-display text-xl font-bold text-ink">
          <ClockIcon width={20} height={20} /> {title}
        </h3>
        <div className="flex flex-wrap justify-end gap-1.5">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={length === p}
              onClick={() => {
                reset(p);
                setCustomOpen(false);
              }}
              className="pill h-9 min-h-0 min-w-11 px-2.5 text-xs"
            >
              {p < 60 ? `${p}s` : `${p / 60}m`}
            </button>
          ))}
          <button
            type="button"
            aria-expanded={customOpen}
            aria-controls="timer-custom-duration"
            onClick={() => {
              setCustomOpen((open) => !open);
              setCustomError("");
            }}
            className="pill h-9 min-h-0 px-3 text-xs"
          >
            Custom
          </button>
        </div>
      </div>

      {customOpen && (
        <form
          id="timer-custom-duration"
          onSubmit={applyCustomTime}
          className="mt-4 flex flex-wrap items-end gap-3 rounded-2xl bg-paper-deep/60 p-4"
        >
          <label className="grid gap-1 text-xs font-semibold text-ink-soft">
            Minutes
            <input
              type="number"
              min="0"
              max="99"
              step="1"
              inputMode="numeric"
              value={customMinutes}
              onChange={(event) => setCustomMinutes(event.target.value)}
              className="h-10 w-20 rounded-xl border border-line bg-surface px-3 text-base text-ink"
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold text-ink-soft">
            Seconds
            <input
              type="number"
              min="0"
              max="59"
              step="1"
              inputMode="numeric"
              value={customSeconds}
              onChange={(event) => setCustomSeconds(event.target.value)}
              className="h-10 w-20 rounded-xl border border-line bg-surface px-3 text-base text-ink"
            />
          </label>
          <button type="submit" className="press press-sm">
            Set time
          </button>
          {customError && (
            <p role="alert" className="w-full text-sm font-medium text-rani">
              {customError}
            </p>
          )}
        </form>
      )}

      <div
        className={`mt-5 overflow-hidden rounded-2xl bg-paper px-4 pb-5 pt-4 text-center ${
          urgent ? "animate-wobble" : ""
        }`}
      >
        <div
          role="timer"
          aria-live={done ? "assertive" : "off"}
          className={`font-display text-[clamp(4rem,22vw,6.5rem)] font-bold leading-none tabular-nums transition-colors ${
            urgent || done ? "text-rani" : "text-ink"
          }`}
        >
          <span className="sr-only">
            {done ? "Time is up" : `${mm} minutes and ${ss} seconds remaining`}
          </span>
          <span aria-hidden="true" className="inline-flex items-center justify-center gap-[0.08em]">
            {done ? (
              "Time!"
            ) : (
              <>
                <span>{mm}</span>
                <span className="px-[0.04em]">:</span>
                <span>{ss}</span>
              </>
            )}
          </span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-black/5">
          <div
            className="h-full rounded-full transition-[width] duration-200 ease-linear"
            style={{
              width: `${progress * 100}%`,
              background: "var(--color-ink)",
            }}
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-[1fr_auto] gap-3">
        {running ? (
          <button type="button" onClick={pause} className="press">
            Pause
          </button>
        ) : (
          <button type="button" onClick={start} className="press">
            {done ? "Again" : seconds < length ? "Resume" : "Start"}
          </button>
        )}
        <button type="button" onClick={() => reset()} className="pill min-h-[3.25rem] px-6">
          Reset
        </button>
      </div>
    </div>
  );
}
