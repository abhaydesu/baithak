import { describe, expect, it } from "vitest";

import { AnalyticsEvent } from "./model";
import { Top9Question } from "@/models/Top9Question";

describe("AnalyticsEvent schema", () => {
  it("accepts a valid event and defaults ts", () => {
    const doc = new AnalyticsEvent({ type: "pageview", path: "/", vid: "v", sid: "s", device: "mobile" });
    expect(doc.validateSync()).toBeUndefined();
    expect(doc.ts).toBeInstanceOf(Date);
  });
  it("rejects bad types, devices and missing fields", () => {
    expect(new AnalyticsEvent({ type: "evil", path: "/", vid: "v", sid: "s" }).validateSync()).toBeTruthy();
    expect(new AnalyticsEvent({ type: "pageview", path: "/", vid: "v", sid: "s", device: "toaster" }).validateSync()).toBeTruthy();
    expect(new AnalyticsEvent({ type: "pageview" }).validateSync()).toBeTruthy();
  });
  it("expires old events", () => {
    const ttl = AnalyticsEvent.schema.indexes().find(([k]) => "ts" in k && Object.keys(k).length === 1);
    expect(ttl?.[1].expireAfterSeconds).toBe(60 * 60 * 24 * 180);
  });
});

describe("Top9Question schema", () => {
  it("validates", () => {
    const ok = new Top9Question({ id: "q", categories: ["food"], source: "original", prompt: "p", answers: [{ text: "a", points: 1 }] });
    expect(ok.validateSync()).toBeUndefined();
    expect(new Top9Question({ id: "q", source: "other" }).validateSync()).toBeTruthy();
  });
});
