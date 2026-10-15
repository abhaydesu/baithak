import { beforeEach, describe, expect, it, vi } from "vitest";

const create = vi.fn();
const connect = vi.fn();
vi.mock("@/lib/mongoose", () => ({ connectToDatabase: () => connect() }));
vi.mock("@/lib/analytics/model", () => ({ AnalyticsEvent: { create: (d: unknown) => create(d) } }));

import { resetRateLimits } from "@/lib/rateLimit";
import { POST } from "./route";

const valid = { type: "pageview", path: "/games", vid: "v", sid: "s" };
const req = (body: unknown, headers: Record<string, string> = {}) =>
  new Request("http://x/api/track", {
    method: "POST",
    headers: { "user-agent": "Mozilla/5.0 (iPhone)", host: "site.com", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

beforeEach(() => {
  resetRateLimits();
  connect.mockResolvedValue(true);
  create.mockResolvedValue({});
});

describe("POST /api/track", () => {
  it("stores a valid event with derived fields", async () => {
    const res = await POST(req({ ...valid, referrer: "https://google.com/x" }, { "x-vercel-ip-country": "IN" }));
    expect(res.status).toBe(204);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ device: "mobile", referrer: "google.com", country: "IN" }),
    );
  });
  it("drops same-site and invalid referrers", async () => {
    await POST(req({ ...valid, referrer: "https://site.com/a" }));
    await POST(req({ ...valid, referrer: "not a url" }));
    expect(create.mock.calls.every(([d]) => d.referrer === undefined)).toBe(true);
  });
  it("ignores bots", async () => {
    expect((await POST(req(valid, { "user-agent": "Googlebot" }))).status).toBe(204);
    expect(create).not.toHaveBeenCalled();
  });
  it("rejects bad JSON and bad payloads", async () => {
    expect((await POST(req("{nope"))).status).toBe(400);
    expect((await POST(req({ ...valid, type: "evil" }))).status).toBe(400);
    expect((await POST(req({ ...valid, path: "http://evil" }))).status).toBe(400);
    expect((await POST(req({ ...valid, vid: "" }))).status).toBe(400);
  });
  it("detects tablets and desktops", async () => {
    await POST(req(valid, { "user-agent": "iPad Safari" }));
    await POST(req(valid, { "user-agent": "Mozilla Windows" }));
    expect(create.mock.calls.map(([d]) => d.device)).toEqual(["tablet", "desktop"]);
  });
  it("is a no-op without a database and survives write errors", async () => {
    connect.mockResolvedValue(false);
    expect((await POST(req(valid))).status).toBe(204);
    expect(create).not.toHaveBeenCalled();
    connect.mockResolvedValue(true);
    create.mockRejectedValue(new Error("boom"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await POST(req(valid))).status).toBe(204);
  });
  it("rate limits floods", async () => {
    let last = 0;
    for (let i = 0; i < 125; i++) last = (await POST(req(valid, { "x-forwarded-for": "9.9.9.9" }))).status;
    expect(last).toBe(429);
  });
});
