import { describe, expect, it } from "vitest";

import { GET, POST } from "./route";
import { top9Categories } from "@/lib/top9/categories";

const post = (body: unknown) =>
  POST(new Request("http://x", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) }));
const cat = top9Categories[0].id;

describe("top-9 API", () => {
  it("lists categories", async () => {
    const json = await GET().json();
    expect(json.categories.length).toBe(top9Categories.length);
  });
  it("deals a deck", async () => {
    const res = await post({ categories: [cat], perCategory: 3 });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.deck.length).toBeGreaterThan(0);
    expect(json.deck.length).toBeLessThanOrEqual(3);
  });
  it.each([
    ["bad json", "{x"],
    ["no categories", {}],
    ["empty categories", { categories: [] }],
    ["unknown category", { categories: ["nope"] }],
    ["bad exclude", { categories: [cat], exclude: [1] }],
    ["huge exclude", { categories: [cat], exclude: new Array(20001).fill("a") }],
    ["zero count", { categories: [cat], perCategory: 0 }],
    ["huge count", { categories: [cat], perCategory: 31 }],
    ["fractional count", { categories: [cat], perCategory: 1.5 }],
    ["null body", null],
  ])("rejects %s", async (_n, body) => {
    expect((await post(body)).status).toBe(400);
  });
});
