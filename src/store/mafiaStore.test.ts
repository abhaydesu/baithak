import { beforeEach, describe, expect, it } from "vitest";

import {
  aliveMafiaCount, alivePlayers, checkWinner, dealer, isEliminated, mafiaPlayers, maxMafia,
  nightActor, playerName, playerScore, roleBreakdown, roundAwards, useMafia,
} from "./mafiaStore";

const initial = useMafia.getState();
beforeEach(() => {
  useMafia.setState(initial, true);
  localStorage.clear();
});
const s = () => useMafia.getState();
const roleOf = (role: string) => s().players.find((p) => s().round!.roles[p.id] === role)!;

function deal() {
  s().startGame();
  for (let i = 0; i < s().players.length; i++) {
    s().showCard();
    s().hideCard();
  }
}

describe("mafia helpers", () => {
  it("computes role breakdowns and limits", () => {
    expect(maxMafia(5)).toBe(1);
    expect(maxMafia(15)).toBe(3);
    expect(roleBreakdown(6, { mafia: 3, doctor: true, detective: false })).toEqual({
      mafia: 2, doctor: 1, detective: 0, villagers: 3,
    });
  });
  it("checks winners", () => {
    const players = ["a", "b", "c", "d"].map((id) => ({ id, name: id }));
    const roles = { a: "mafia", b: "villager", c: "villager", d: "villager" } as const;
    expect(checkWinner(players, roles, [])).toBeNull();
    expect(checkWinner(players, roles, [{ playerId: "a", by: "day", cycle: 1 }])).toBe("village");
    expect(checkWinner(players, roles, [
      { playerId: "b", by: "night", cycle: 1 }, { playerId: "c", by: "day", cycle: 1 },
    ])).toBe("mafia");
    expect(roundAwards(players, roles, "mafia")).toEqual({ a: 2 });
    expect(roundAwards(players, roles, "village")).toEqual({ b: 1, c: 1, d: 1 });
  });
  it("handles helpers with no round", () => {
    expect(dealer(s())).toBeNull();
    expect(nightActor(s())).toBeNull();
    expect(mafiaPlayers(s())).toEqual([]);
    expect(aliveMafiaCount(s())).toBe(0);
    expect(alivePlayers(s())).toHaveLength(6);
    expect(playerName(s(), "zzz")).toBe("Someone");
  });
});

describe("mafia setup", () => {
  it("manages players within limits", () => {
    for (let i = 0; i < 12; i++) s().addPlayer();
    expect(s().players).toHaveLength(15);
    s().updateSettings({ mafia: 3 });
    for (let i = 0; i < 12; i++) s().removePlayer(s().players[0].id);
    expect(s().players).toHaveLength(5);
    expect(s().settings.mafia).toBe(1);
    s().renamePlayer(s().players[0].id, "  ");
    s().startGame();
    expect(s().players[0].name).toBe("Player 1");
  });
  it("refuses to start with too few players", () => {
    useMafia.setState({ players: s().players.slice(0, 3) });
    s().startGame();
    expect(s().phase).toBe("setup");
  });
});

describe("pass-the-phone game", () => {
  it("deals roles to everyone then starts night", () => {
    s().startGame();
    expect(s().phase).toBe("pass");
    expect(dealer(s())?.id).toBe(s().players[0].id);
    s().hideCard(); // wrong phase
    expect(s().phase).toBe("pass");
    deal();
    expect(s().phase).toBe("night-pass");
    expect(mafiaPlayers(s())).toHaveLength(1);
  });
  it("plays until the village wins by voting out the mafia", () => {
    deal();
    const mafia = mafiaPlayers(s())[0];
    const doctor = roleOf("doctor");
    const detective = roleOf("detective");
    const victim = s().players.find((p) => ![mafia.id, doctor.id, detective.id].includes(p.id))!;

    for (let i = 0; i < alivePlayers(s()).length; i++) {
      const actor = nightActor(s())!;
      s().startNightTurn();
      const role = s().round!.roles[actor.id];
      if (role === "detective") {
        s().investigate(mafia.id);
        s().investigate(victim.id); // locked in
        s().submitNightAction(null);
      } else if (role === "mafia") s().submitNightAction(victim.id);
      else if (role === "doctor") s().submitNightAction(detective.id);
      else s().submitNightAction(null);
    }
    expect(s().phase).toBe("dawn");
    expect(s().round!.dawn).toMatchObject({ victimId: victim.id, saved: false });
    expect(s().round!.checks[0]).toMatchObject({ targetId: mafia.id, isMafia: true });
    expect(isEliminated(s().round!, victim.id)).toBe(true);
    s().leaveDawn();
    expect(s().phase).toBe("discuss");

    s().startClock();
    s().pauseClock();
    s().pauseClock();
    s().resumeClock();
    s().goToVote();
    s().backToDiscuss();
    s().goToVote();
    s().vote(mafia.id);
    expect(s().phase).toBe("verdict");
    s().continueAfterVerdict();
    expect(s().phase).toBe("roundover");
    s().adjustScore(mafia.id, 5);
    s().nextRound();
    expect(s().history).toHaveLength(1);
    expect(playerScore(s(), mafia.id)).toBe(5);
    expect(s().phase).toBe("pass");
    expect(s().round!.number).toBe(2);
    s().endGame();
    expect(s().phase).toBe("gameover");
    s().rematch();
    expect(s().history).toEqual([]);
    s().newSetup();
    expect(s().phase).toBe("setup");
  });
  it("lets the doctor save, skipped votes continue to the next night, and mafia can win", () => {
    deal();
    const mafia = mafiaPlayers(s())[0];
    const others = s().players.filter((p) => p.id !== mafia.id);
    // Night 1: the doctor protects the mafia's victim.
    const victim = others.find((p) => !["doctor", "detective"].includes(s().round!.roles[p.id]))!;
    const doctor = roleOf("doctor");
    for (let i = 0; i < 6; i++) {
      const actor = nightActor(s())!;
      s().startNightTurn();
      const role = s().round!.roles[actor.id];
      s().submitNightAction(role === "mafia" ? victim.id : role === "doctor" ? victim.id : null);
    }
    expect(s().round!.dawn).toMatchObject({ victimId: null, saved: true });
    s().leaveDawn();
    s().goToVote();
    s().vote(null);
    expect(s().round!.lastVotedId).toBeNull();
    s().continueAfterVerdict();
    expect(s().phase).toBe("night-pass");
    expect(s().round!.cycle).toBe(2);
    // Vote out innocents until mafia win.
    useMafia.setState({ phase: "discuss" });
    s().goToVote();
    s().vote(doctor.id);
    s().continueAfterVerdict();
    useMafia.setState({ phase: "vote" });
    s().vote(others.find((p) => p.id !== doctor.id)!.id);
    s().vote(others.filter((p) => !isEliminated(s().round!, p.id))[0].id);
    s().continueAfterVerdict();
    useMafia.setState({ phase: "vote" });
    s().vote(others.filter((p) => !isEliminated(s().round!, p.id))[0]?.id ?? null);
    if (!s().round!.outcome) {
      useMafia.setState({ phase: "vote" });
      s().vote(others.filter((p) => !isEliminated(s().round!, p.id))[0].id);
    }
    expect(s().round!.outcome).toBe("mafia");
    s().continueAfterVerdict();
    s().endGame();
    expect(s().history[0].outcome).toBe("mafia");
  });
  it("ends the round at dawn when the night kill decides it", () => {
    deal();
    useMafia.setState({ phase: "dawn", round: { ...s().round!, outcome: "mafia" } });
    s().leaveDawn();
    expect(s().phase).toBe("roundover");
  });
});

describe("narrator mode", () => {
  function narratorDeal() {
    s().updateSettings({ mode: "narrator" });
    deal();
    expect(s().phase).toBe("narrator-night");
  }
  it("walks mafia → doctor → detective", () => {
    narratorDeal();
    const victim = s().players[0];
    s().narratorBack();
    s().narratorAdvance(victim.id);
    expect(s().round!.narratorStep).toBe("doctor");
    s().narratorBack();
    expect(s().round!.narratorStep).toBe("mafia");
    s().narratorAdvance(victim.id);
    s().narratorAdvance(null);
    expect(s().round!.narratorStep).toBe("detective");
    s().narratorBack();
    expect(s().round!.narratorStep).toBe("doctor");
    s().narratorAdvance(null);
    s().narratorAdvance(s().players[1].id);
    expect(s().phase).toBe("dawn");
    expect(s().round!.dawn?.victimId).toBe(victim.id);
  });
  it("skips absent special roles", () => {
    s().updateSettings({ doctor: false, detective: false });
    narratorDeal();
    s().narratorBack();
    s().narratorAdvance(s().players[0].id);
    expect(s().phase).toBe("dawn");
    s().newSetup();
    s().updateSettings({ doctor: false, detective: true });
    narratorDeal();
    s().narratorAdvance(null);
    expect(s().round!.narratorStep).toBe("detective");
    s().narratorBack();
    expect(s().round!.narratorStep).toBe("mafia");
    s().narratorAdvance(null);
    s().narratorAdvance(null);
    expect(s().phase).toBe("dawn");
    s().newSetup();
    s().updateSettings({ doctor: true, detective: false });
    narratorDeal();
    s().narratorAdvance(null);
    s().narratorAdvance(null);
    expect(s().phase).toBe("dawn");
  });
});

describe("mafia guards and persistence", () => {
  it("ignores out-of-phase actions", () => {
    s().showCard(); s().startNightTurn(); s().investigate("x"); s().submitNightAction(null);
    s().narratorAdvance(null); s().narratorBack(); s().leaveDawn(); s().vote("x");
    s().continueAfterVerdict(); s().nextRound(); s().backToDiscuss();
    expect(s().phase).toBe("setup");
    s().pauseClock();
    s().toggleMuted();
    expect(s().muted).toBe(true);
    s().endGame();
    expect(s().phase).toBe("gameover");
  });
  it("resolves the night when there is no actor left", () => {
    deal();
    s().startNightTurn();
    useMafia.setState({ round: { ...s().round!, nightIndex: 99 } });
    s().submitNightAction(null);
    expect(s().phase).toBe("dawn");
  });
  it("persists and rehydrates", async () => {
    deal();
    expect(localStorage.getItem("vybrid-mafia")).toBeTruthy();
    await useMafia.persist.rehydrate();
    expect(s().phase).toBe("night-pass");
  });
});
