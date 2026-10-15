import { describe, expect, it } from "vitest";

import { buildPool, categoryMeta, normalize, shuffle } from "./deck";
import { CUSTOM_CATEGORY_ID, pictionaryCategories, THEME_CATEGORY_ID } from "./pictionary";

describe("deck", () => {
  it("normalizes and shuffles without losing items", () => {
    expect(normalize("  HeLLo ")).toBe("hello");
    const src = [1, 2, 3, 4, 5, 6];
    const out = shuffle(src);
    expect(out).not.toBe(src);
    expect([...out].sort()).toEqual(src);
  });
  it("builds a de-duplicated pool by difficulty", () => {
    const id = pictionaryCategories[0].id;
    const easy = buildPool({ categories: [id], difficulty: "easy", theme: null });
    const mix = buildPool({ categories: [id], difficulty: "mix", theme: null });
    expect(mix.length).toBeGreaterThanOrEqual(easy.length);
    expect(new Set(mix.map((c) => normalize(c.word))).size).toBe(mix.length);
    expect(buildPool({ categories: [], difficulty: "mix", theme: null })).toEqual([]);
  });
  it("adds theme words only when the theme category is on", () => {
    const theme = { name: "Beach", words: ["sand", "Sand", "wave"] };
    const on = buildPool({ categories: [THEME_CATEGORY_ID], difficulty: "mix", theme });
    expect(on.map((c) => c.word)).toEqual(["sand", "wave"]);
    expect(buildPool({ categories: [], difficulty: "mix", theme })).toEqual([]);
  });
  it("describes categories", () => {
    expect(categoryMeta(CUSTOM_CATEGORY_ID).label).toBe("Written in");
    expect(categoryMeta(THEME_CATEGORY_ID).label).toBe("Theme");
    expect(categoryMeta(THEME_CATEGORY_ID, "Beach").label).toBe("Theme: Beach");
    expect(categoryMeta(pictionaryCategories[0].id).label).toBe(pictionaryCategories[0].label);
    expect(categoryMeta("mystery")).toEqual({ label: "mystery", tone: "white" });
  });
});
