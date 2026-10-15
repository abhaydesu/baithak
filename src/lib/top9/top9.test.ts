import { describe, expect, it } from "vitest";

import { allQuestions } from "./bank";
import { top9Categories, TOTAL_BOARDS, questionCategories } from "./categories";
import { dealDeck } from "./deal";
import { isAlreadyRevealed, matchGuess } from "./match";
import type { Top9Answer, Top9Question } from "./types";

const q = (id: string, categories: string[]): Top9Question => ({
  id, prompt: id, categories, source: "original",
  answers: [{ text: "a", points: 1 }],
});

describe("dealDeck", () => {
  const pool = [q("1", ["food"]), q("2", ["food"]), q("3", ["food", "love"]), q("4", ["love"])];
  it("deals per category without duplicates", () => {
    const { deck, recycled } = dealDeck(pool, { categories: ["food", "love"], exclude: [], perCategory: 2 });
    expect(new Set(deck.map((d) => d.id)).size).toBe(deck.length);
    expect(recycled).toEqual([]);
  });
  it("recycles played questions when a category runs dry", () => {
    const { deck, recycled } = dealDeck(pool, { categories: ["food"], exclude: ["1", "2", "3"], perCategory: 2 });
    expect(deck).toHaveLength(2);
    expect(recycled).toEqual(["food"]);
  });
  it("ignores unknown categories", () => {
    expect(dealDeck(pool, { categories: ["zzz"], exclude: [], perCategory: 3 }).deck).toEqual([]);
  });
});

describe("question bank", () => {
  const all = allQuestions();
  it("is cached, unique and well formed", () => {
    expect(allQuestions()).toBe(all);
    expect(new Set(all.map((x) => x.id)).size).toBe(all.length);
    for (const x of all.slice(0, 500)) {
      expect(x.answers.length).toBeGreaterThan(0);
      expect(x.prompt).toBeTruthy();
    }
  });
  it("exposes categories", () => {
    expect(TOTAL_BOARDS).toBeGreaterThan(0);
    expect(top9Categories.length).toBeGreaterThan(0);
    expect(questionCategories(all[0]).length).toBeGreaterThan(0);
  });
});

const board: Top9Answer[] = [
  { text: "Milk", points: 30 },
  { text: "Police officer", points: 20 },
  { text: "Under the bed", points: 10 },
  { text: "Twelve", points: 5, aliases: ["a dozen"] },
  { text: "Nap", points: 4 },
  { text: "Sleep", points: 3 },
  { text: "Road", points: 2 },
];

describe("matchGuess", () => {
  it("handles exact, case and typos", () => {
    expect(matchGuess("milk", board)).toBe(0);
    expect(matchGuess("MILK!", board)).toBe(0);
    expect(matchGuess("mlik", board)).toBe(0);
    expect(matchGuess("read", board)).not.toBe(6);
  });
  it("handles subsets, supersets, synonyms and numbers", () => {
    expect(matchGuess("bed", board)).toBe(2);
    expect(matchGuess("12 years old", board)).toBe(3);
    expect(matchGuess("cop", board)).toBe(1);
    expect(matchGuess("a dozen", board)).toBe(3);
  });
  it("keeps close answers apart and misses nonsense", () => {
    expect(matchGuess("nap", board)).toBe(4);
    expect(matchGuess("sleep", board)).toBe(5);
    expect(matchGuess("", board)).toBeNull();
    expect(matchGuess("qqqzzz", board)).toBeNull();
    expect(matchGuess("the", board)).toBeNull();
  });
  it("respects already-revealed answers", () => {
    expect(matchGuess("milk", board, [0])).toBeNull();
    expect(isAlreadyRevealed("milk", board, [0])).toBe(true);
    expect(isAlreadyRevealed("milk", board, [1])).toBe(false);
    expect(isAlreadyRevealed("zzzzqq", board, [0])).toBe(false);
  });
  it("stems plurals and irregulars", () => {
    const a: Top9Answer[] = [{ text: "Mouse", points: 1 }, { text: "Baby", points: 1 }, { text: "Tomato", points: 1 }, { text: "Fly", points: 1 }];
    expect(matchGuess("mice", a)).toBe(0);
    expect(matchGuess("babies", a)).toBe(1);
    expect(matchGuess("tomatoes", a)).toBe(2);
    expect(matchGuess("flying", a)).toBe(3);
  });
});

describe("matchGuess typo tolerance", () => {
  const one = (text: string): Top9Answer[] => [{ text, points: 1 }];
  it.each([
    ["motercycle", "Motorcycle", true],
    ["tomatoe", "Tomato", true],
    ["potatoes", "Tomatoes", false],
    ["cat", "Cab", false],
    ["tabel", "Table", true],
    ["chocolat", "Chocolate", true],
    ["bicycel", "Bicycle", true],
    ["20", "21", false],
  ])("%s vs %s → %s", (guess, answer, expected) => {
    expect(matchGuess(guess, one(answer)) !== null).toBe(expected);
  });
});
