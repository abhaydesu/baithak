import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/sfx", () => ({ sfx: new Proxy({}, { get: () => () => {} }) }));
vi.mock("@/lib/analytics/client", () => ({ track: () => {} }));

import { POST } from "@/app/api/games/top-9/route";
import { monkey } from "@/test/monkey";
import { useMafia, alivePlayers, mafiaPlayers } from "@/store/mafiaStore";
import { useTop9 } from "@/store/top9Store";
import MafiaGame from "./mafia/MafiaGame";
import Top9Game from "./top9/Top9Game";

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  localStorage.clear();
  vi.stubGlobal("fetch", (url: string, init: RequestInit) => POST(new Request(`http://x${url}`, init)));
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const t9 = () => useTop9.getState();
const initialTop9 = useTop9.getState();
const initialMafia = useMafia.getState();

async function mount(Game: React.ComponentType, store: { persist: { rehydrate: () => unknown } }) {
  const view = render(<Game />);
  await act(async () => { await store.persist.rehydrate(); });
  return view;
}
const settle = () => act(async () => { await vi.advanceTimersByTimeAsync(50); });

describe.each(["host", "typed"] as const)("Top 9 screens (%s mode)", (mode) => {
  it("renders every phase and survives taps", async () => {
    useTop9.setState(initialTop9, true);
    t9().updateSettings({ mode, rounds: 3 });
    await mount(Top9Game, useTop9);
    await act(async () => { await t9().startGame(); });
    expect(t9().phase).toBe("intro");
    monkey(20, 1);

    for (const seed of [1, 2, 3, 4]) {
      await act(async () => { t9().newSetup(); await t9().startGame(); });
      for (let i = 0; i < 6; i++) {
        monkey(40, seed * 10 + i);
        await settle();
        // Push the game along so later phases get seen.
        act(() => {
          const s = t9();
          if (s.phase === "intro") s.startFaceoff();
          else if (s.phase === "faceoff") { s.reveal(0); s.giveControl(0); }
          else if (s.phase === "play") { s.reveal(1); s.strike(); s.strike(); s.strike(); }
          else if (s.phase === "steal") s.stealFailed();
        });
        if (t9().phase === "roundEnd") await act(async () => { await t9().nextRound(); });
      }
    }
    act(() => t9().endGame());
    monkey(30, 99);
    expect(document.body.textContent).toBeTruthy();
  });
});

describe("Mafia screens", () => {
  async function play(mode: "pass" | "narrator", seed: number) {
    useMafia.setState(initialMafia, true);
    const s = () => useMafia.getState();
    s().updateSettings({ mode, discussSeconds: 30 });
    await mount(MafiaGame, useMafia);
    act(() => s().startGame());
    // Alternate between tapping around and forcing the game forward.
    for (let i = 0; i < 40; i++) {
      monkey(25, seed * 100 + i);
      act(() => {
        const st = s();
        const alive = st.round ? alivePlayers(st) : [];
        const target = alive.find((p) => !mafiaPlayers(st).some((m) => m.id === p.id)) ?? alive[0];
        if (st.phase === "pass") st.showCard();
        else if (st.phase === "reveal") st.hideCard();
        else if (st.phase === "night-pass") st.startNightTurn();
        else if (st.phase === "night-act") st.submitNightAction(target?.id ?? null);
        else if (st.phase === "narrator-night") st.narratorAdvance(target?.id ?? null);
        else if (st.phase === "dawn") st.leaveDawn();
        else if (st.phase === "discuss") st.goToVote();
        else if (st.phase === "vote") st.vote(target?.id ?? null);
        else if (st.phase === "verdict") st.continueAfterVerdict();
        else if (st.phase === "roundover") st.nextRound();
        else if (st.phase === "gameover") st.rematch();
      });
    }
  }
  it.each([1, 2, 3])("pass mode (seed %i)", async (seed) => {
    await play("pass", seed);
    expect(document.body.textContent).toBeTruthy();
  });
  it.each([1, 2, 3])("narrator mode (seed %i)", async (seed) => {
    await play("narrator", seed);
    expect(document.body.textContent).toBeTruthy();
  });
  it("shows the game over screen with history", async () => {
    useMafia.setState(initialMafia, true);
    await mount(MafiaGame, useMafia);
    act(() => useMafia.getState().startGame());
    act(() => useMafia.getState().endGame());
    monkey(20, 5);
  });
});
