import { beforeEach, describe, expect, it, vi } from "vitest";

const connect = vi.fn();
const aggregate = vi.fn();
const distinct = vi.fn();
vi.mock("@/lib/mongoose", () => ({ connectToDatabase: () => connect() }));
vi.mock("./model", () => ({ AnalyticsEvent: { aggregate: (p: unknown) => aggregate(p), distinct: (...a: unknown[]) => distinct(...a) } }));

import { getSummary, TIME_ZONE } from "./queries";

beforeEach(() => {
  connect.mockResolvedValue(true);
  distinct.mockResolvedValue(["s1", "s2"]);
});

/** Answers each aggregation by looking at its pipeline. */
function respond(pipeline: Record<string, unknown>[]) {
  const group = pipeline.find((s) => "$group" in s)?.$group as { _id: unknown; pageviews?: unknown; first?: unknown };
  const id = JSON.stringify(group?._id);
  if (group?.pageviews && id === "null") return [{ pageviews: 10, vids: ["a", "b"], sids: ["x"] }];
  if (group?.pageviews) return [{ _id: new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date()), pageviews: 4, vids: ["a"] }];
  if (group?.first) return [{ _id: true, count: 3 }, { _id: false, count: 5 }];
  if (id === '"$type"') return [{ _id: "game_start", count: 6 }, { _id: "game_over", count: 2 }];
  if (id?.includes("game")) {
    return [
      { _id: { game: "imposter", type: "game_start" }, count: 5 },
      { _id: { game: "imposter", type: "game_over" }, count: 2 },
      { _id: { game: undefined, type: "game_start" }, count: 9 },
    ];
  }
  if (id?.includes("$hour")) return [{ _id: 5, count: 7 }];
  if (id?.includes("$dayOfWeek")) return [{ _id: 1, count: 2 }];
  if (id === '"$path"') return [{ _id: "/", count: 3 }];
  if (id === '"$device"') return [{ _id: "mobile", count: 3 }];
  return [{ _id: null, count: 1 }, { _id: "x", count: 2 }];
}

describe("getSummary", () => {
  it("returns null without a database", async () => {
    connect.mockResolvedValue(null);
    expect(await getSummary(7)).toBeNull();
  });
  it("assembles totals, series and breakdowns", async () => {
    aggregate.mockImplementation(async (p) => respond(p));
    const s = (await getSummary(7))!;
    expect(s.days).toBe(7);
    expect(s.totals).toEqual({ pageviews: 10, visitors: 2, sessions: 1, gamesStarted: 6, gamesFinished: 2 });
    expect(s.activeNow).toBe(2);
    expect(s.newVisitors).toBe(3);
    expect(s.returningVisitors).toBe(5);
    expect(s.daily).toHaveLength(8);
    expect(s.daily.at(-1)).toMatchObject({ pageviews: 4, visitors: 1 });
    expect(s.hours).toHaveLength(24);
    expect(s.hours[5]).toBe(7);
    expect(s.weekdays).toHaveLength(7);
    expect(s.weekdays[0]).toBe(2);
    expect(s.topPages[0].label).toBe("/");
    expect(s.games[0]).toEqual({ game: "(unknown)", started: 9, finished: 0 });
    expect(s.games[1]).toEqual({ game: "imposter", started: 5, finished: 2 });
    expect(s.sources.some((r) => r.label === "(none)")).toBe(false);
  });
  it("copes with empty data", async () => {
    aggregate.mockResolvedValue([]);
    distinct.mockResolvedValue([]);
    const s = (await getSummary(30))!;
    expect(s.totals.pageviews).toBe(0);
    expect(s.newVisitors).toBe(0);
    expect(s.games).toEqual([]);
  });
});
