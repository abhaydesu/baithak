import { beforeEach, describe, expect, it, vi } from "vitest";

import { promptPacks } from "@/lib/bomb/prompts";
import {
  alivePlayers, FUSES, MAX_PLAYERS, MIN_PLAYERS, nextAlive, playerName, useBomb,
} from "./bombStore";

const initial = useBomb.getState();
beforeEach(() => {
  useBomb.setState(initial, true);
  localStorage.clear();
});
const s = () => useBomb.getState();

describe("bomb setup", () => {
  it("adds, removes and renames within limits", () => {
    for (let i = 0; i < 10; i++) s().addPlayer();
    expect(s().players).toHaveLength(MAX_PLAYERS);
    for (let i = 0; i < 10; i++) s().removePlayer(s().players[0].id);
    expect(s().players).toHaveLength(MIN_PLAYERS);
    const id = s().players[0].id;
    s().renamePlayer(id, "Asha");
    expect(playerName(s(), id)).toBe("Asha");
    expect(playerName(s(), null)).toBe("Someone");
  });
  it("edits settings and packs", () => {
    s().updateSettings({ fuse: "long", lives: 3 });
    expect(s().settings).toMatchObject({ fuse: "long", lives: 3 });
    const first = promptPacks[0].id;
    s().togglePack(first);
    expect(s().settings.packs).not.toContain(first);
    s().togglePack(first);
    expect(s().settings.packs).toContain(first);
    s().setPacks([]);
    s().startGame();
    expect(s().phase).toBe("setup");
    s().setPacks([first]);
    s().resetPlayed();
    expect(s().played).toEqual([]);
  });
  it("won't start with too few players", () => {
    useBomb.setState({ players: s().players.slice(0, 2) });
    s().startGame();
    expect(s().phase).toBe("setup");
  });
});

describe("bomb play", () => {
  function start() {
    s().renamePlayer(s().players[0].id, "  ");
    s().startGame();
  }
  it("runs a full game to game over", () => {
    s().updateSettings({ lives: 1 });
    start();
    expect(s().phase).toBe("ready");
    expect(s().players[0].name).toBe("Player 1");
    const first = s().prompt;
    s().newPrompt();
    expect(s().prompt).toBeTruthy();
    s().pass(); // ignored: fuse not lit
    expect(s().passes).toBe(0);
    s().lightFuse();
    expect(s().phase).toBe("live");
    const [lo, hi] = FUSES[s().settings.fuse].range;
    const secs = (s().endsAt! - Date.now()) / 1000;
    expect(secs).toBeGreaterThan(lo - 1);
    expect(secs).toBeLessThanOrEqual(hi + 1);
    const holder = s().holderId;
    s().pass();
    expect(s().holderId).not.toBe(holder);
    expect(s().passes).toBe(1);
    s().explode();
    expect(s().phase).toBe("boom");
    expect(alivePlayers(s())).toHaveLength(3);
    s().nextRound();
    expect(s().phase).toBe("ready");
    expect(s().round).toBe(2);
    expect(s().lives[s().holderId!]).toBeGreaterThan(0);
    expect(first).toBeTruthy();
    for (let i = 0; i < 2; i++) { s().lightFuse(); s().explode(); s().nextRound(); }
    s().lightFuse(); s().explode(); s().nextRound();
    expect(s().phase).toBe("gameover");
  });
  it("ignores actions in the wrong phase", () => {
    s().lightFuse(); s().explode(); s().nextRound(); s().newPrompt();
    expect(s().phase).toBe("setup");
  });
  it("recycles prompts when all are used", () => {
    start();
    const all = promptPacks.flatMap((p) => p.prompts);
    useBomb.setState({ played: all });
    s().newPrompt();
    expect(s().played).toHaveLength(1);
  });
  it("finds the next alive player and handles nobody alive", () => {
    const players = [{ id: "a", name: "A" }, { id: "b", name: "B" }, { id: "c", name: "C" }];
    expect(nextAlive({ players, lives: { a: 1, b: 0, c: 1 } }, "a")?.id).toBe("c");
    expect(nextAlive({ players, lives: {} }, "a")).toBeNull();
  });
  it("ends, rematches, resets and mutes", () => {
    start();
    s().endGame();
    expect(s().phase).toBe("gameover");
    s().rematch();
    expect(s().phase).toBe("ready");
    s().newSetup();
    expect(s().phase).toBe("setup");
    s().toggleMuted();
    expect(s().muted).toBe(true);
  });
  it("persists to storage", async () => {
    start();
    expect(localStorage.getItem("vybrid-bomb")).toContain('"phase":"ready"');
    await useBomb.persist.rehydrate();
    expect(s().phase).toBe("ready");
  });
  it("pass with nobody alive is a no-op", () => {
    start();
    s().lightFuse();
    useBomb.setState({ lives: {} });
    s().pass();
    expect(s().passes).toBe(0);
    vi.useRealTimers();
  });
});
