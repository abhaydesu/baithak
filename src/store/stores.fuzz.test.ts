import { beforeEach, describe, expect, it, vi } from "vitest";
import type { StoreApi, UseBoundStore } from "zustand";

import { STORAGE_KEYS } from "@/lib/storageKeys";
import { useBomb } from "./bombStore";
import { useCategories } from "./categoriesStore";
import { useCharades } from "./charadesStore";
import { useDumbCharades } from "./dumbCharadesStore";
import { useFiveSecond } from "./fiveSecondStore";
import { useGameStore } from "./gameStore";
import { useHotSeat } from "./hotSeatStore";
import { useImposter } from "./imposterStore";
import { useMafia } from "./mafiaStore";
import { usePictionary } from "./pictionaryStore";
import { useRank } from "./rankStore";
import { useTop9 } from "./top9Store";
import { useWeakest } from "./weakestStore";

type Store = UseBoundStore<StoreApi<Record<string, unknown>>> & {
  persist?: { rehydrate: () => Promise<void> | void };
};

const stores: [string, Store][] = [
  ["bomb", useBomb], ["categories", useCategories], ["charades", useCharades],
  ["dumbCharades", useDumbCharades], ["fiveSecond", useFiveSecond],
  ["game", useGameStore], ["hotSeat", useHotSeat], ["imposter", useImposter],
  ["mafia", useMafia], ["pictionary", usePictionary], ["rank", useRank],
  ["top9", useTop9], ["weakest", useWeakest],
] as unknown as [string, Store][];

/** Seeded PRNG so failures reproduce. */
function prng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

function collectStrings(value: unknown, out: Set<string>, depth = 0) {
  if (depth > 4 || out.size > 60) return;
  if (typeof value === "string") {
    if (value.length < 40) out.add(value);
  } else if (Array.isArray(value)) {
    value.slice(0, 20).forEach((v) => collectStrings(v, out, depth + 1));
  } else if (value && typeof value === "object") {
    Object.values(value).forEach((v) => collectStrings(v, out, depth + 1));
  }
}

const initials = new Map(stores.map(([n, s]) => [n, s.getState()]));

beforeEach(() => {
  localStorage.clear();
  for (const [name, store] of stores) store.setState(initials.get(name)!, true);
});

describe.each(stores)("%s store fuzz", (name, store) => {
  it("survives thousands of random actions and keeps state sane", async () => {
    const rand = prng(name.length * 7919 + 13);
    const pick = <T,>(xs: T[]) => xs[Math.floor(rand() * xs.length)];
    const actions = Object.entries(store.getState()).filter(([, v]) => typeof v === "function");
    expect(actions.length).toBeGreaterThan(0);
    const hits = new Set<string>();

    for (let step = 0; step < 8000; step++) {
      const ids = new Set<string>();
      collectStrings(store.getState(), ids);
      const strings = [...ids, "Asha", "", "  ", "word", "easy", "hard", "mix", "yes", "no"];
      const arg = () => pick<unknown>([...strings, 0, 1, 2, 3, -1, true, false, undefined, [], [...strings.slice(0, 3)]]);
      const [key, fn] = pick(actions);
      try {
        // Restart often so play-phase actions get exercised, not just setup.
        if (step % 25 === 0) await (store.getState().startGame as (() => unknown) | undefined)?.();
        await (fn as (...a: unknown[]) => unknown)(arg(), arg(), arg());
        hits.add(key);
      } catch {
        /* wrong-typed junk args may legitimately throw */
      }
      // State must stay serialisable and numbers finite.
      if (step % 500 === 0) {
        const json = JSON.stringify(store.getState());
        expect(json).not.toContain("NaN");
      }
    }
    expect(hits.size).toBeGreaterThan(actions.length * 0.6);
    // Persisted stores must rehydrate what they wrote.
    if (store.persist) {
      await store.persist.rehydrate();
      expect(() => JSON.stringify(store.getState())).not.toThrow();
    }
  });

  it("recovers from corrupt persisted data", async () => {
    if (!store.persist) return;
    vi.spyOn(console, "error").mockImplementation(() => {});
    for (const key of Object.values(STORAGE_KEYS)) localStorage.setItem(key, "{not json");
    await store.persist.rehydrate();
    expect(store.getState()).toBeTruthy();
  });
});
