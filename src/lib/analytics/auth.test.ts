import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createSession, keyMatches, sessionValid, SESSION_SECONDS } from "./auth";

const original = process.env.ANALYTICS_KEY;
beforeEach(() => {
  process.env.ANALYTICS_KEY = "s3cret-key";
});
afterEach(() => {
  if (original === undefined) delete process.env.ANALYTICS_KEY;
  else process.env.ANALYTICS_KEY = original;
});

describe("keyMatches", () => {
  it("accepts only the exact key", () => {
    expect(keyMatches("s3cret-key")).toBe(true);
    expect(keyMatches("s3cret-kez")).toBe(false);
    expect(keyMatches("short")).toBe(false);
    expect(keyMatches("")).toBe(false);
    expect(keyMatches(undefined)).toBe(false);
  });
  it("is always false when no key is configured", () => {
    delete process.env.ANALYTICS_KEY;
    expect(keyMatches("anything")).toBe(false);
  });
});

describe("sessions", () => {
  it("round-trips and never embeds the key", () => {
    const token = createSession()!;
    expect(token).not.toContain("s3cret-key");
    expect(sessionValid(token)).toBe(true);
  });
  it("rejects the raw key, junk, and tampered tokens", () => {
    const token = createSession(1_000_000)!;
    const [exp, sig] = token.split(".");
    expect(sessionValid("s3cret-key")).toBe(false);
    expect(sessionValid(undefined)).toBe(false);
    expect(sessionValid("a.b.c")).toBe(false);
    expect(sessionValid(`x.${sig}`)).toBe(false);
    expect(sessionValid(`${Number(exp) + 1}.${sig}`, 1_000_000)).toBe(false);
    expect(sessionValid(`${exp}.${sig.slice(0, -1)}0`, 1_000_000)).toBe(false);
  });
  it("expires", () => {
    const token = createSession(0)!;
    expect(sessionValid(token, (SESSION_SECONDS - 1) * 1000)).toBe(true);
    expect(sessionValid(token, (SESSION_SECONDS + 1) * 1000)).toBe(false);
  });
  it("is invalidated when the key changes or is unset", () => {
    const token = createSession()!;
    process.env.ANALYTICS_KEY = "rotated";
    expect(sessionValid(token)).toBe(false);
    delete process.env.ANALYTICS_KEY;
    expect(createSession()).toBeUndefined();
    expect(sessionValid(token)).toBe(false);
  });
});
