import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/games/top-9/route";
import { top9Categories } from "@/lib/top9/categories";
import {
  isFinalRound, MAX_STRIKES, MIX, multiplier, otherTeam, useTop9,
} from "./top9Store";

const initial = useTop9.getState();
const s = () => useTop9.getState();

/** Routes the store's deck request to the real handler. */
function online() {
  vi.stubGlobal("fetch", (url: string, init: RequestInit) =>
    POST(new Request(`http://x${url}`, init)),
  );
}
function offline() {
  vi.stubGlobal("fetch", () => Promise.reject(new Error("offline")));
}

beforeEach(() => {
  useTop9.setState(initial, true);
  localStorage.clear();
  online();
});
afterEach(() => vi.unstubAllGlobals());

async function start(rounds = 2) {
  s().updateSettings({ rounds });
  await s().startGame();
}
/** Opens a faceoff and gives control to team 0. */
function toPlay() {
  s().startFaceoff();
  s().giveControl(0);
}

describe("top9 helpers", () => {
  it("knows teams, final round and multipliers", () => {
    expect(otherTeam(0)).toBe(1);
    expect(otherTeam(1)).toBe(0);
    const state = { round: 4, settings: { ...s().settings, rounds: 5, doubleFinal: true } };
    expect(isFinalRound(state)).toBe(true);
    expect(multiplier(state)).toBe(2);
    expect(multiplier({ ...state, settings: { ...state.settings, doubleFinal: false } })).toBe(1);
    expect(multiplier({ ...state, round: 0 })).toBe(1);
  });
});

describe("top9 setup", () => {
  it("edits teams, settings and categories", () => {
    s().renameTeam(0, "Lions");
    expect(s().teams[0].name).toBe("Lions");
    const id = top9Categories[0].id;
    s().setCategories([id]);
    s().toggleCategory(id);
    expect(s().settings.categories).toEqual([]);
    s().toggleCategory(id);
    expect(s().settings.categories).toEqual([id]);
    s().resetUsed();
    s().toggleMuted();
    s().toggleHostView();
    expect(s().muted).toBe(true);
    expect(s().hostView).toBe(false);
  });
  it("won't start without categories", async () => {
    s().setCategories([]);
    await s().startGame();
    expect(s().phase).toBe("setup");
  });
});

describe("top9 play", () => {
  it("plays a round: reveal, strike, steal, bank, next, gameover", async () => {
    s().renameTeam(0, "  ");
    await start(2);
    expect(s().phase).toBe("intro");
    expect(s().teams[0].name).toBe("Blue Whales");
    const q = s().question!;
    s().startFaceoff();
    s().strike(); // not in play
    expect(s().strikes).toBe(0);
    s().giveControl(0);
    expect(s().phase).toBe("play");
    s().reveal(0);
    s().reveal(0); // duplicate
    s().reveal(999); // out of range
    expect(s().pot).toBe(q.answers[0].points);
    for (let i = 0; i < MAX_STRIKES; i++) s().strike();
    expect(s().phase).toBe("steal");
    s().reveal(1); // steal succeeds: other team banks
    expect(s().phase).toBe("roundEnd");
    expect(s().roundWinner).toBe(1);
    expect(s().teams[1].score).toBe(q.answers[0].points + q.answers[1].points);
    s().revealRest();
    expect(s().revealed).toHaveLength(q.answers.length);
    s().reveal(0); // scoring off after round
    await s().nextRound();
    expect(s().phase).toBe("intro");
    expect(s().round).toBe(1);
    toPlay();
    s().strike(); s().strike(); s().strike();
    s().stealFailed();
    expect(s().roundWinner).toBe(0);
    await s().nextRound();
    expect(s().phase).toBe("gameover");
    expect(s().history).toHaveLength(2);
  });
  it("banks the pot when the board is cleared in play, and doubles the final", async () => {
    await start(1);
    const q = s().question!;
    toPlay();
    q.answers.forEach((_, i) => s().reveal(i));
    expect(s().phase).toBe("roundEnd");
    const total = q.answers.reduce((n, a) => n + a.points, 0);
    expect(s().teams[0].score).toBe(total * 2);
  });
  it("awards a faceoff clean sweep outright", async () => {
    await start(2);
    const q = s().question!;
    s().startFaceoff();
    q.answers.forEach((_, i) => s().reveal(i));
    s().giveControl(1);
    expect(s().phase).toBe("roundEnd");
    expect(s().roundWinner).toBe(1);
  });
  it("undoes steps, adjusts scores and resets", async () => {
    await start(2);
    s().undo(); // empty
    toPlay();
    s().strike();
    expect(s().strikes).toBe(1);
    s().undo();
    expect(s().strikes).toBe(0);
    s().adjustScore(0, 10);
    s().adjustScore(0, -50);
    expect(s().teams[0].score).toBe(0);
    s().endGame();
    expect(s().phase).toBe("gameover");
    await s().rematch();
    expect(s().phase).toBe("intro");
    s().newSetup();
    expect(s().phase).toBe("setup");
    expect(s().deck).toEqual([]);
  });
  it("ignores out-of-phase actions", async () => {
    s().reveal(0); s().strike(); s().giveControl(0); s().stealFailed(); s().revealRest();
    await s().nextRound(); await s().pickCategory("x"); await s().skipQuestion();
    expect(s().phase).toBe("setup");
  });
});

describe("top9 questions", () => {
  it("switches category and skips questions", async () => {
    await start(3);
    const first = s().question!.id;
    const target = top9Categories.find((c) => c.id !== s().pick)!.id;
    await s().pickCategory(MIX); // same pick: no-op
    expect(s().question!.id).toBe(first);
    await s().pickCategory(target);
    expect(s().pick).toBe(target);
    const picked = s().question!.id;
    await s().skipQuestion();
    expect(s().question!.id).not.toBe(picked);
  });
  it("tops up the deck when it runs dry", async () => {
    await start(3);
    useTop9.setState({ deck: [] });
    await s().skipQuestion();
    expect(s().phase).toBe("intro");
    expect(s().question).toBeTruthy();
  });
  it("falls back to the built-in pack when offline", async () => {
    offline();
    await start(2);
    expect(s().phase).toBe("intro");
    expect(s().notice).toMatch(/built-in pack/);
    s().dismissNotice();
    useTop9.setState({ deck: [] });
    await s().skipQuestion();
    expect(s().notice).toMatch(/built-in pack/);
  });
  it("reports when a category is exhausted and falls back to the mix", async () => {
    await start(3);
    useTop9.setState({ deck: [], loading: false });
    vi.stubGlobal("fetch", () => Promise.resolve(Response.json({ deck: [] })));
    await s().skipQuestion();
    expect(s().notice).toMatch(/No more questions/);
    expect(s().loading).toBe(false);
  });
  it("loads one question at a time", async () => {
    await start(3);
    useTop9.setState({ loading: true });
    await s().skipQuestion();
    await s().nextRound();
    await s().startGame();
    useTop9.setState({ loading: false });
  });
  it("moves on to the mix when the picked category runs out between rounds", async () => {
    await start(3);
    const target = top9Categories.find((c) => c.id !== MIX)!.id;
    useTop9.setState({ pick: target, deck: [], phase: "roundEnd" });
    const calls: string[] = [];
    vi.stubGlobal("fetch", async (_u: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body));
      calls.push(body.categories.join());
      return calls.length === 1 ? Response.json({ deck: [] }) : POST(new Request("http://x", init));
    });
    await s().nextRound();
    expect(calls.length).toBeGreaterThanOrEqual(2);
  });
  it("rejects a failed deck response by going offline", async () => {
    vi.stubGlobal("fetch", async () => new Response("no", { status: 500 }));
    await start(2);
    expect(s().notice).toMatch(/built-in/);
  });
});

describe("top9 persistence", () => {
  it("doesn't persist loading or notices, and migrates v1", async () => {
    await start(2);
    useTop9.setState({ notice: "hi" });
    const saved = JSON.parse(localStorage.getItem("vybrid-top9")!);
    expect(saved.state.notice).toBeUndefined();
    expect(saved.state.loading).toBeUndefined();

    localStorage.setItem("vybrid-top9", JSON.stringify({
      version: 1,
      state: { teams: [{ name: "A", tone: "blue", score: 9 }, { name: "B", tone: "red", score: 3 }], muted: true, hostView: false },
    }));
    await useTop9.persist.rehydrate();
    expect(s().phase).toBe("setup");
    expect(s().teams.map((t) => t.score)).toEqual([0, 0]);
    expect(s().muted).toBe(true);

    localStorage.setItem("vybrid-top9", JSON.stringify({ version: 1, state: null }));
    await useTop9.persist.rehydrate();
    expect(s().phase).toBe("setup");

    localStorage.setItem("vybrid-top9", JSON.stringify({ version: 2, state: { phase: "play", muted: true } }));
    await useTop9.persist.rehydrate();
    expect(s().phase).toBe("play");
  });
});
