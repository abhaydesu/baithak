import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cookieGet = vi.fn();
const getSummary = vi.fn();
vi.mock("next/headers", () => ({ cookies: async () => ({ get: cookieGet }), headers: async () => new Headers() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/lib/analytics/queries", () => ({ getSummary: (d: number) => getSummary(d) }));

import { createSession } from "@/lib/analytics/auth";
import AnalyticsPage from "./page";

const page = async (sp: { days?: string; error?: string } = {}) => {
  const ui = await AnalyticsPage({ searchParams: Promise.resolve(sp) });
  return render(ui).container;
};

const summary = (over = {}) => ({
  days: 30, timeZone: "UTC", activeNow: 2,
  totals: { pageviews: 100, visitors: 40, sessions: 50, gamesStarted: 10, gamesFinished: 5 },
  previous: { pageviews: 50, visitors: 0, sessions: 100, gamesStarted: 0, gamesFinished: 0 },
  newVisitors: 3, returningVisitors: 4,
  daily: [{ day: "2026-01-01", pageviews: 5, visitors: 2 }, { day: "2026-01-02", pageviews: 0, visitors: 0 }],
  hours: Array(24).fill(1), weekdays: Array(7).fill(2),
  topPages: [{ label: "/", count: 3 }], sources: [], devices: [{ label: "mobile", count: 1 }], countries: [],
  games: [{ game: "imposter", started: 4, finished: 2 }, { game: "x", started: 0, finished: 0 }],
  ...over,
});

beforeEach(() => {
  process.env.ANALYTICS_KEY = "k";
  cookieGet.mockReturnValue(undefined);
});
afterEach(cleanup);

describe("analytics page", () => {
  it("asks to configure the key when unset", async () => {
    delete process.env.ANALYTICS_KEY;
    expect((await page()).textContent).toContain("ANALYTICS_KEY");
  });
  it("shows the login form, with an error", async () => {
    const c = await page({ error: "1" });
    expect(c.querySelector("input[name=key]")).toBeTruthy();
    expect(c.textContent).toContain("didn't match");
    expect(getSummary).not.toHaveBeenCalled();
  });
  it("rejects the raw key as a cookie", async () => {
    cookieGet.mockReturnValue({ value: "k" });
    expect((await page()).querySelector("input[name=key]")).toBeTruthy();
  });
  it("shows the dashboard for a valid session", async () => {
    cookieGet.mockReturnValue({ value: createSession() });
    getSummary.mockResolvedValue(summary());
    const c = await page({ days: "7" });
    expect(getSummary).toHaveBeenCalledWith(7);
    expect(c.textContent).toContain("Visitors");
    expect(c.textContent).toContain("50% of started");
    expect(c.textContent).toContain("new");
    expect(c.textContent).toContain("imposter");
  });
  it("falls back to 30 days for an unknown range", async () => {
    cookieGet.mockReturnValue({ value: createSession() });
    getSummary.mockResolvedValue(summary({ games: [], topPages: [], devices: [] }));
    const c = await page({ days: "999" });
    expect(getSummary).toHaveBeenLastCalledWith(30);
    expect(c.textContent).toContain("No data yet");
  });
  it("explains a missing database", async () => {
    cookieGet.mockReturnValue({ value: createSession() });
    getSummary.mockResolvedValue(null);
    expect((await page()).textContent).toContain("MONGODB_URI");
  });
});
