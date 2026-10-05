"use client";

import { useSyncExternalStore } from "react";

export interface GameTimerState {
  endsAt: number | null;
  remainingMs: number;
}

let currentNow = typeof window !== "undefined" ? Date.now() : 0;
const subscribers = new Set<() => void>();
let tickerTimer: number | null = null;

function subscribeTicker(callback: () => void) {
  subscribers.add(callback);
  if (!tickerTimer && typeof window !== "undefined") {
    currentNow = Date.now();
    tickerTimer = window.setInterval(() => {
      currentNow = Date.now();
      subscribers.forEach((cb) => cb());
    }, 100);
  }
  return () => {
    subscribers.delete(callback);
    if (subscribers.size === 0 && tickerTimer !== null) {
      window.clearInterval(tickerTimer);
      tickerTimer = null;
    }
  };
}

function getTickerSnapshot(): number {
  return currentNow;
}

function getServerSnapshot(): number {
  return 0;
}

/**
 * Robust countdown timer hook for offline games.
 * Clamps remaining milliseconds strictly within [0, timer.remainingMs] so that
 * the displayed time never jumps upwards when starting, resuming, or re-rendering.
 */
export function useGameTimer(timer: GameTimerState) {
  const now = useSyncExternalStore(
    subscribeTicker,
    getTickerSnapshot,
    getServerSnapshot,
  );

  if (timer.endsAt === null) {
    return { ms: timer.remainingMs, running: false };
  }

  // Math.min guarantees the remaining ms can NEVER exceed timer.remainingMs upon start/resume
  const ms = Math.min(timer.remainingMs, Math.max(0, timer.endsAt - now));
  return { ms, running: true };
}
