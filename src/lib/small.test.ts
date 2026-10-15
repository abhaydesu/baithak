import { describe, expect, it, vi } from "vitest";

import { fitPromptClass, fitWordClass } from "./fitText";
import { BAYER, rng } from "./pixel";
import { STORAGE_KEYS } from "./storageKeys";
import { artFor, GAME_ART } from "./gameArt";
import { allGames, onScreenGames } from "./games";
import { offlineGames } from "./offlineGames";
import { faqJsonLd, faqs } from "./faq";
import { gameJsonLd, gameMetaDescription, pageMetadata } from "./seo";
import { absoluteUrl, SITE } from "./site";

describe("fitText", () => {
  it("shrinks as text grows", () => {
    const sizes = ["a", "a".repeat(15), "a".repeat(25), "a".repeat(40), "a".repeat(80)].map(fitWordClass);
    expect(new Set(sizes).size).toBe(5);
    const prompts = ["a", "a".repeat(40), "a".repeat(70), "a".repeat(120)].map(fitPromptClass);
    expect(new Set(prompts).size).toBe(4);
  });
});

describe("pixel", () => {
  it("has a normalised Bayer matrix", () => {
    expect(BAYER.flat().every((v) => v > 0 && v < 1)).toBe(true);
  });
  it("rng is deterministic and in range", () => {
    const a = rng(7), b = rng(7);
    const xs = Array.from({ length: 20 }, a);
    expect(xs).toEqual(Array.from({ length: 20 }, b));
    expect(xs.every((v) => v >= 0 && v < 1)).toBe(true);
  });
});

describe("catalogue data", () => {
  it("has unique storage keys", () => {
    const v = Object.values(STORAGE_KEYS);
    expect(new Set(v).size).toBe(v.length);
  });
  it("has unique game slugs and art for each", () => {
    const slugs = allGames.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(onScreenGames.length).toBeGreaterThan(0);
    expect(offlineGames.length).toBeGreaterThan(0);
    for (const s of Object.keys(GAME_ART)) expect(artFor(s)).toBe(GAME_ART[s]);
    expect(artFor("nope").glyph).toBe("tiles");
  });
  it("builds FAQ structured data", () => {
    const ld = faqJsonLd();
    expect(ld.mainEntity).toHaveLength(faqs.length);
  });
});

describe("site + seo", () => {
  it("builds absolute URLs", () => {
    expect(absoluteUrl("/a")).toBe(`${SITE.url}/a`);
    expect(absoluteUrl("a")).toBe(`${SITE.url}/a`);
    expect(absoluteUrl()).toBe(`${SITE.url}/`);
  });
  it("resolves the site url from the environment", async () => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://x.test/");
    expect((await import("./site")).SITE.url).toBe("https://x.test");
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "p.vercel.app");
    expect((await import("./site")).SITE.url).toBe("https://p.vercel.app");
    vi.resetModules();
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
    expect((await import("./site")).SITE.url).toBe("http://localhost:3000");
    vi.unstubAllEnvs();
  });
  const game = {
    title: "Imposter", description: "d", path: "/games/imposter", players: "3–8",
    duration: "20 min", kit: ["Phone"], steps: ["Setup: pick words.", "Play on."],
  };
  it("builds game JSON-LD with and without steps", () => {
    const withSteps = gameJsonLd(game)["@graph"];
    expect(withSteps.map((n) => n["@type"])).toEqual(["Game", "HowTo", "BreadcrumbList"]);
    expect(gameJsonLd({ ...game, steps: [], players: "weird", duration: "soon" })["@graph"]).toHaveLength(2);
    expect(gameJsonLd({ ...game, players: "4", duration: "1 hour" })["@graph"][0]).toBeTruthy();
  });
  it("describes games and pages", () => {
    expect(gameMetaDescription({ ...game, playable: true })).toContain("built-in game");
    expect(gameMetaDescription({ ...game, playable: false })).toContain("Rules and what you need");
    const m = pageMetadata({ title: "T", description: "D", path: "/p" });
    expect(m.alternates?.canonical).toBe("/p");
    expect(pageMetadata({ title: "T", description: "D", path: "/p", siteCard: true }).openGraph).toBeTruthy();
  });
});
