import { beforeEach, describe, expect, it, vi } from "vitest";

import { imposterCategories } from "@/lib/imposter/words";
import {
  dealer, hiddenImposters, maxImposters, playerName, playerScore, roundAwards, useImposter,
} from "./imposterStore";

const initial = useImposter.getState();
beforeEach(() => {
  useImposter.setState(initial, true);
  localStorage.clear();
  vi.restoreAllMocks();
});
const s = () => useImposter.getState();

function deal() {
  s().startGame();
  for (let i = 0; i < s().players.length; i++) {
    s().showCard();
    s().hideCard();
  }
}
const imposters = () => s().round!.imposterIds;
const crewMember = () => s().players.find((p) => !imposters().includes(p.id))!;

describe("imposter helpers", () => {
  it("limits imposters and scores outcomes", () => {
    expect(maxImposters(3)).toBe(1);
    expect(maxImposters(9)).toBe(4);
    const players = ["a", "b", "c"].map((id) => ({ id, name: id }));
    expect(roundAwards(players, ["a"], "crew")).toEqual({ b: 1, c: 1 });
    expect(roundAwards(players, ["a"], "imposters")).toEqual({ a: 2 });
    expect(roundAwards(players, ["a"], "steal")).toEqual({ a: 1 });
    expect(roundAwards(players, ["a"], "troll")).toEqual({});
    expect(dealer(s())).toBeNull();
    expect(playerName(s(), "nope")).toBe("Someone");
  });
});

describe("imposter setup", () => {
  it("manages players, settings and categories", () => {
    for (let i = 0; i < 20; i++) s().addPlayer();
    expect(s().players).toHaveLength(15);
    s().updateSettings({ imposters: 5 });
    for (let i = 0; i < 20; i++) s().removePlayer(s().players[0].id);
    expect(s().players).toHaveLength(3);
    expect(s().settings.imposters).toBe(1);
    const cat = imposterCategories[0].id;
    s().toggleCategory(cat);
    expect(s().settings.categories).not.toContain(cat);
    s().toggleCategory(cat);
    expect(s().settings.categories).toContain(cat);
    s().setCategories([]);
    s().startGame();
    expect(s().phase).toBe("setup");
    s().setCategories([cat]);
    useImposter.setState({ players: s().players.slice(0, 2) });
    s().startGame();
    expect(s().phase).toBe("setup");
    s().resetPlayed();
  });
});

describe("classic round", () => {
  it("deals cards: imposters get hints, crew get the word", () => {
    s().updateSettings({ hint: "category" });
    deal();
    expect(s().phase).toBe("discuss");
    const round = s().round!;
    for (const p of s().players) {
      const card = round.cards[p.id];
      expect(card.kind).toBe(round.imposterIds.includes(p.id) ? "imposter" : "word");
    }
    expect(s().played).toHaveLength(1);
  });
  it("supports every hint setting", () => {
    for (const hint of ["off", "category", "hint"] as const) {
      s().newSetup();
      s().updateSettings({ hint });
      s().startGame();
      const imp = s().round!.cards[imposters()[0]];
      expect(imp.kind).toBe("imposter");
      if (hint === "off" && imp.kind === "imposter") expect(imp.hint).toBeNull();
    }
  });
  it("crew win by catching the imposter when the guess is wrong", () => {
    deal();
    s().startClock();
    s().pauseClock();
    s().resumeClock();
    s().goToVote();
    s().backToDiscuss();
    s().goToVote();
    s().vote(imposters()[0]);
    expect(s().phase).toBe("verdict");
    expect(hiddenImposters(s().round!)).toHaveLength(0);
    s().continueVoting();
    expect(s().phase).toBe("guess");
    s().resolveGuess(false);
    expect(s().round!.outcome).toBe("crew");
    s().adjustScore(s().players[0].id, 2);
    s().nextRound();
    expect(s().history).toHaveLength(1);
    expect(playerScore(s(), crewMember().id)).toBeGreaterThanOrEqual(0);
    expect(s().phase).toBe("pass");
  });
  it("imposter steals with a correct guess", () => {
    deal();
    s().goToVote();
    s().vote(imposters()[0]);
    s().continueVoting();
    s().resolveGuess(true);
    expect(s().round!.outcome).toBe("steal");
  });
  it("imposters win if the crew vote the wrong person, or skip", () => {
    deal();
    s().goToVote();
    s().vote(crewMember().id);
    s().continueVoting();
    expect(s().round!.outcome).toBe("imposters");
    s().endGame();
    expect(s().history).toHaveLength(1);
    s().rematch();
    s().goToVote();
    s().vote(null);
    expect(s().round!.outcome).toBe("imposters");
  });
  it("keeps voting while imposters remain hidden", () => {
    s().addPlayer(); s().addPlayer(); s().addPlayer();
    s().updateSettings({ imposters: 2 });
    deal();
    s().goToVote();
    s().vote(imposters()[0]);
    s().continueVoting();
    expect(s().phase).toBe("vote");
    expect(hiddenImposters(s().round!)).toHaveLength(1);
  });
});

describe("modes", () => {
  it("undercover gives imposters a decoy word and skips the guess", () => {
    s().updateSettings({ mode: "undercover" });
    deal();
    expect(imposters().every((id) => s().round!.cards[id].kind === "word")).toBe(true);
    s().goToVote();
    s().vote(imposters()[0]);
    s().continueVoting();
    expect(s().round!.outcome).toBe("crew");
  });
  it("troll rounds make everyone an imposter", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    s().updateSettings({ troll: true });
    deal();
    expect(s().round!.troll).toBe(true);
    expect(imposters()).toHaveLength(s().players.length);
    s().goToVote();
    s().vote(s().players[0].id);
    s().continueVoting();
    expect(s().round!.outcome).toBe("troll");
    s().nextRound();
    s().goToVote();
    s().vote(null);
    expect(s().round!.outcome).toBe("troll");
  });
  it("undercover troll deals different words", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    s().updateSettings({ troll: true, mode: "undercover" });
    s().startGame();
    expect(Object.keys(s().round!.cards)).toHaveLength(s().players.length);
  });
});

describe("word reuse and guards", () => {
  it("shows a notice after exhausting the deck", async () => {
    const { imposterPool } = await import("@/lib/imposter/words");
    const { normalize } = await import("@/lib/words/deck");
    const cat = imposterCategories[0].id;
    s().setCategories([cat]);
    useImposter.setState({ played: imposterPool([cat]).map((w) => normalize(w.word)) });
    s().startGame();
    expect(s().notice).toContain("reshuffled");
    s().dismissNotice();
    expect(s().notice).toBeNull();
  });
  it("ignores out-of-phase actions and persists", async () => {
    s().showCard(); s().hideCard(); s().vote("x"); s().continueVoting(); s().resolveGuess(true);
    s().nextRound(); s().backToDiscuss(); s().pauseClock();
    expect(s().phase).toBe("setup");
    s().toggleMuted();
    expect(s().muted).toBe(true);
    deal();
    expect(dealer(s())).toBeNull(); // dealing finished
    await useImposter.persist.rehydrate();
    expect(s().phase).toBe("discuss");
    s().newSetup();
    expect(s().phase).toBe("setup");
  });
});
