import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

const get = (q?: string) => GET(new Request(`http://x/api/words/theme${q === undefined ? "" : `?q=${encodeURIComponent(q)}`}`));
const w = (word: string, extra: Partial<{ tags: string[] }> = {}) => ({ word, tags: ["n", "f:5"], ...extra });

function mockFetch(...responses: (unknown | Error)[]) {
  const fn = vi.fn();
  for (const r of responses) {
    if (r instanceof Error) fn.mockRejectedValueOnce(r);
    else fn.mockResolvedValueOnce({ ok: true, json: async () => r });
  }
  vi.stubGlobal("fetch", fn);
  return fn;
}
afterEach(() => vi.unstubAllGlobals());

describe("theme API", () => {
  it.each(["", "a", "<script>", "1beach", "x".repeat(40)])("rejects %j", async (q) => {
    expect((await get(q)).status).toBe(400);
  });
  it("filters and returns words", async () => {
    const many = Array.from({ length: 12 }, (_, i) => w(`item${String.fromCharCode(97 + i)}`));
    mockFetch([
      ...many,
      w("sand"), w("sands"), w("beach"), w("beach ball"), w("exploration"), w("murder"),
      w("Texas", { tags: ["n", "prop", "f:5"] }), w("run", { tags: ["v", "f:5"] }),
      w("rare", { tags: ["n", "f:0.1"] }), w("common", { tags: ["n", "f:900"] }),
      w("a b c d"), w("x"), { word: "bare" },
    ]);
    const res = await get("Beach");
    const json = await res.json();
    expect(res.headers.get("Cache-Control")).toContain("s-maxage");
    expect(json.words).toContain("sand");
    expect(json.words).not.toContain("sands");
    for (const bad of ["beach", "beach ball", "exploration", "murder", "texas", "run", "rare", "common", "x", "bare"]) {
      expect(json.words).not.toContain(bad);
    }
  });
  it("falls back to 'means like' for sparse themes", async () => {
    const fn = mockFetch([w("alpha")], [w("bravo")]);
    const json = await (await get("rare theme")).json();
    expect(fn).toHaveBeenCalledTimes(2);
    expect(json.words).toEqual(["alpha", "bravo"]);
  });
  it("keeps triggers when the fallback fails", async () => {
    mockFetch([w("alpha")], new Error("down"));
    expect((await (await get("space")).json()).words).toEqual(["alpha"]);
  });
  it("returns 502 when the word service is down", async () => {
    mockFetch(new Error("down"));
    expect((await get("space")).status).toBe(502);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    expect((await get("space")).status).toBe(502);
  });
});
