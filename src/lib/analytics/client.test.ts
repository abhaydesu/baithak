import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { track } from "./client";

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  window.history.pushState({}, "", "/games?utm_source=wa");
});
afterEach(() => vi.unstubAllGlobals());

const sent = (call: unknown[]) => call[1] instanceof Blob ? call[1] : null;

describe("track", () => {
  it("beacons a payload with stable ids", async () => {
    const beacon = vi.fn().mockReturnValue(true);
    Object.defineProperty(navigator, "sendBeacon", { value: beacon, configurable: true });
    track("pageview");
    track("game_start", { game: "imposter" });
    const body = JSON.parse(await sent(beacon.mock.calls[1])!.text());
    expect(body).toMatchObject({ type: "game_start", path: "/games", source: "wa", game: "imposter" });
    const first = JSON.parse(await sent(beacon.mock.calls[0])!.text());
    expect(first.vid).toBe(body.vid);
    expect(first.sid).toBe(body.sid);
  });
  it("falls back to fetch, and never throws", () => {
    Object.defineProperty(navigator, "sendBeacon", { value: () => false, configurable: true });
    const f = vi.fn();
    vi.stubGlobal("fetch", f);
    track("pageview");
    expect(f).toHaveBeenCalled();
    f.mockImplementation(() => { throw new Error("x"); });
    expect(() => track("pageview")).not.toThrow();
  });
  it("skips admin pages and survives broken storage", () => {
    const beacon = vi.fn().mockReturnValue(true);
    Object.defineProperty(navigator, "sendBeacon", { value: beacon, configurable: true });
    window.history.pushState({}, "", "/admin/analytics");
    track("pageview");
    expect(beacon).not.toHaveBeenCalled();
    window.history.pushState({}, "", "/");
    vi.spyOn(localStorage, "getItem").mockImplementation(() => { throw new Error("blocked"); });
    track("pageview");
    expect(beacon).toHaveBeenCalledTimes(1);
  });
});
