import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { sfx } from "./sfx";
import { useWakeLock } from "./useWakeLock";

afterEach(cleanup);

describe("sfx", () => {
  class FakeAudio {
    state = "suspended";
    currentTime = 0;
    destination = {};
    resume = vi.fn();
    createOscillator = () => ({
      type: "", frequency: { setValueAtTime: vi.fn() }, connect: (n: unknown) => n, start: vi.fn(), stop: vi.fn(),
    });
    createGain = () => ({ gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, connect: (n: unknown) => n });
  }
  afterEach(() => vi.unstubAllGlobals());
  it("plays every effect and vibrates when allowed", () => {
    vi.stubGlobal("AudioContext", FakeAudio);
    const vibrate = vi.fn();
    Object.defineProperty(navigator, "vibrate", { value: vibrate, configurable: true });
    Object.defineProperty(navigator, "userActivation", { value: { hasBeenActive: true }, configurable: true });
    for (const fn of Object.values(sfx)) fn();
    expect(vibrate).toHaveBeenCalled();
  });
  it("skips vibration before user activation and survives missing audio", () => {
    const vibrate = vi.fn();
    Object.defineProperty(navigator, "vibrate", { value: vibrate, configurable: true });
    Object.defineProperty(navigator, "userActivation", { value: { hasBeenActive: false }, configurable: true });
    sfx.buzzer();
    expect(vibrate).not.toHaveBeenCalled();
    Object.defineProperty(navigator, "vibrate", { value: () => { throw new Error("x"); }, configurable: true });
    Object.defineProperty(navigator, "userActivation", { value: undefined, configurable: true });
    expect(() => sfx.success()).not.toThrow();
  });
});

describe("useWakeLock", () => {
  const release = vi.fn().mockResolvedValue(undefined);
  const request = vi.fn();
  beforeEach(() => {
    release.mockClear();
    request.mockReset().mockResolvedValue({ release });
    Object.defineProperty(navigator, "wakeLock", { value: { request }, configurable: true });
  });
  afterEach(() => {
    // @ts-expect-error cleanup
    delete navigator.wakeLock;
  });
  it("holds a lock while active and releases on cleanup", async () => {
    const { unmount } = renderHook(() => useWakeLock(true));
    await act(async () => {});
    expect(request).toHaveBeenCalledWith("screen");
    document.dispatchEvent(new Event("visibilitychange"));
    await act(async () => {});
    expect(request).toHaveBeenCalledTimes(2);
    unmount();
    expect(release).toHaveBeenCalled();
  });
  it("releases a lock that arrives after unmount", async () => {
    let resolve!: (v: unknown) => void;
    request.mockReturnValue(new Promise((r) => (resolve = r)));
    const { unmount } = renderHook(() => useWakeLock(true));
    unmount();
    await act(async () => resolve({ release }));
    expect(release).toHaveBeenCalled();
  });
  it("does nothing when inactive, unsupported, or denied", async () => {
    renderHook(() => useWakeLock(false));
    expect(request).not.toHaveBeenCalled();
    request.mockRejectedValue(new Error("denied"));
    const { unmount } = renderHook(() => useWakeLock(true));
    await act(async () => {});
    expect(() => unmount()).not.toThrow();
    // @ts-expect-error simulate unsupported
    delete navigator.wakeLock;
    renderHook(() => useWakeLock(true));
  });
});

import { useGameTimer } from "./useGameTimer";
import { useScrollToTopOnChange } from "./useScrollToTop";
import { useTrackGame } from "./analytics/useTrackGame";

const trackMock = vi.fn();
vi.mock("./analytics/client", () => ({ track: (...a: unknown[]) => trackMock(...a) }));

describe("useGameTimer", () => {
  it("shows a paused timer as-is, and a running one clamped", () => {
    const paused = renderHook(() => useGameTimer({ endsAt: null, remainingMs: 5000 }));
    expect(paused.result.current).toEqual({ ms: 5000, running: false });
    const running = renderHook(() => useGameTimer({ endsAt: Date.now() + 99_999, remainingMs: 5000 }));
    expect(running.result.current).toMatchObject({ ms: 5000, running: true });
    const over = renderHook(() => useGameTimer({ endsAt: Date.now() - 10, remainingMs: 5000 }));
    expect(over.result.current.ms).toBe(0);
  });
  it("ticks while running", () => {
    vi.useFakeTimers();
    const end = Date.now() + 1000;
    const { result, unmount } = renderHook(() => useGameTimer({ endsAt: end, remainingMs: 1000 }));
    act(() => void vi.advanceTimersByTime(600));
    expect(result.current.ms).toBeLessThanOrEqual(500);
    unmount();
    vi.useRealTimers();
  });
});

describe("useScrollToTopOnChange", () => {
  it("scrolls only on a real change once ready", () => {
    const scroll = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    const { rerender } = renderHook(({ k, ready }) => useScrollToTopOnChange(k, ready), {
      initialProps: { k: "a", ready: false },
    });
    rerender({ k: "b", ready: false });
    expect(scroll).not.toHaveBeenCalled();
    rerender({ k: "b", ready: true });
    rerender({ k: "b", ready: true });
    expect(scroll).not.toHaveBeenCalled();
    rerender({ k: "c", ready: true });
    expect(scroll).toHaveBeenCalledTimes(1);
  });
});

describe("useTrackGame", () => {
  beforeEach(() => trackMock.mockClear());
  it("tracks start and over, but not the first hydrated phase", () => {
    const { rerender } = renderHook(({ p, h }) => useTrackGame("imposter", p, h), {
      initialProps: { p: "setup", h: false },
    });
    rerender({ p: "setup", h: true });
    expect(trackMock).not.toHaveBeenCalled();
    rerender({ p: "pass", h: true });
    expect(trackMock).toHaveBeenCalledWith("game_start", { game: "imposter" });
    rerender({ p: "discuss", h: true });
    expect(trackMock).toHaveBeenCalledTimes(1);
    rerender({ p: "gameover", h: true });
    expect(trackMock).toHaveBeenLastCalledWith("game_over", { game: "imposter" });
  });
  it("doesn't count resuming a saved game as a start", () => {
    renderHook(() => useTrackGame("imposter", "discuss", true));
    expect(trackMock).not.toHaveBeenCalled();
  });
});
