import { act, cleanup, render } from "@testing-library/react";
import type { ComponentType } from "react";

import { monkey } from "@/test/monkey";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import BombGame from "./bomb/BombGame";
import CategoriesGame from "./categories/CategoriesGame";
import CharadesGame from "./charades/CharadesGame";
import DumbCharadesGame from "./dumb-charades/DumbCharadesGame";
import FiveSecondGame from "./five-second/FiveSecondGame";
import HotSeatGame from "./hot-seat/HotSeatGame";
import ImposterGame from "./imposter/ImposterGame";
import MafiaGame from "./mafia/MafiaGame";
import PictionaryGame from "./pictionary/PictionaryGame";
import RankGame from "./rank/RankGame";
import Top9Game from "./top9/Top9Game";
import WeakestGame from "./weakest/WeakestGame";
import { useBomb } from "@/store/bombStore";
import { useCategories } from "@/store/categoriesStore";
import { useCharades } from "@/store/charadesStore";
import { useDumbCharades } from "@/store/dumbCharadesStore";
import { useFiveSecond } from "@/store/fiveSecondStore";
import { useHotSeat } from "@/store/hotSeatStore";
import { useImposter } from "@/store/imposterStore";
import { useMafia } from "@/store/mafiaStore";
import { usePictionary } from "@/store/pictionaryStore";
import { useRank } from "@/store/rankStore";
import { useTop9 } from "@/store/top9Store";
import { useWeakest } from "@/store/weakestStore";

vi.mock("@/lib/analytics/client", () => ({ track: () => {} }));

vi.mock("@/lib/sfx", () => ({
  sfx: new Proxy({}, { get: () => () => {} }),
}));

const games: [string, ComponentType, { getState: () => Record<string, unknown>; setState: (s: never, r?: boolean) => void; persist: { rehydrate: () => unknown } }][] = [
  ["bomb", BombGame, useBomb as never],
  ["categories", CategoriesGame, useCategories as never],
  ["charades", CharadesGame, useCharades as never],
  ["dumb charades", DumbCharadesGame, useDumbCharades as never],
  ["five second", FiveSecondGame, useFiveSecond as never],
  ["hot seat", HotSeatGame, useHotSeat as never],
  ["imposter", ImposterGame, useImposter as never],
  ["mafia", MafiaGame, useMafia as never],
  ["pictionary", PictionaryGame, usePictionary as never],
  ["rank", RankGame, useRank as never],
  ["top9", Top9Game, useTop9 as never],
  ["weakest", WeakestGame, useWeakest as never],
];

describe.each(games)("%s UI", (_name, Game, store) => {
  const initial = store.getState();
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    localStorage.clear();
    store.setState(initial as never, true);
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("renders setup", async () => {
    render(<Game />);
    await act(async () => { await store.persist.rehydrate(); });
    expect(document.body.textContent).toBeTruthy();
  });

  it.each([1, 2, 3, 4, 5])("survives random taps (seed %i)", async (seed) => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<Game />);
    await act(async () => { await store.persist.rehydrate(); });
    const seen = monkey(600, seed);
    expect(seen.size).toBeGreaterThan(1);
    expect(document.body.textContent).toBeTruthy();
  });
});
