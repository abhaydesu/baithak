import { afterEach, describe, expect, it, vi } from "vitest";

const ctor = vi.fn();
vi.mock("next/og", () => ({
  ImageResponse: class {
    constructor(...args: unknown[]) {
      ctor(...args);
    }
  },
}));

import { OG_SIZE, shareCard } from "./card";

afterEach(() => vi.unstubAllGlobals());

const base = { eyebrow: "Plays on one phone", lines: ["Top 9"], subtitle: "2+ players" };

describe("shareCard", () => {
  it("embeds the display font when it loads", async () => {
    const buf = new ArrayBuffer(8);
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({ text: async () => "src: url(https://f/x.ttf) format('truetype')" })
      .mockResolvedValueOnce({ arrayBuffer: async () => buf }));
    await shareCard({ ...base, tone: "blue" });
    const options = ctor.mock.calls.at(-1)![1];
    expect(options).toMatchObject({ ...OG_SIZE });
    expect(options.fonts?.[0]?.data).toBe(buf);
  });
  it("falls back to the default font on failure or odd CSS", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await shareCard({ ...base, tone: "nope" });
    expect(ctor.mock.calls.at(-1)![1].fonts).toBeUndefined();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ text: async () => "no font here" }));
    await shareCard({ ...base, lines: ["A", "B"] });
    expect(ctor.mock.calls.at(-1)![1].fonts).toBeUndefined();
  });
});
