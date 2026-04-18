/*
Copyright © 2026 Defend I.T. Solutions LLC. All Rights Reserved.
*/

import { describe, expect, it } from "vitest";
import { badgesForTransition } from "./badges";
import type { GridRunnerSave } from "./types";

const NOW = "2026-04-16T12:00:00.000Z";

function makeSave(
  overrides: Partial<GridRunnerSave> = {},
): GridRunnerSave {
  return {
    version: 1,
    playerName: "Op",
    player: {
      level: 1,
      xp: 0,
      xpToNext: 50,
      integrity: 100,
      maxIntegrity: 100,
      compute: 60,
      maxCompute: 60,
      bandwidth: 10,
      firewall: 5,
    },
    inventory: [],
    equippedTools: [null, null, null, null],
    currentZone: "sector-01",
    currentPosition: { x: 0, y: 0 },
    defeatedBosses: [],
    completedTutorial: false,
    bits: 0,
    credits: 0,
    playTime: 0,
    savedAt: NOW,
    ...overrides,
  };
}

describe("badgesForTransition", () => {
  it("returns nothing when nothing changed", () => {
    const save = makeSave();
    expect(badgesForTransition(save, save, NOW)).toEqual([]);
  });

  it("returns nothing on a null next state", () => {
    expect(badgesForTransition(makeSave(), null, NOW)).toEqual([]);
  });

  it("grants bank-buster on the first-ever Lazarus defeat", () => {
    const prev = makeSave({ defeatedBosses: [] });
    const next = makeSave({ defeatedBosses: ["lazarus"] });
    const earned = badgesForTransition(prev, next, NOW);
    expect(earned).toEqual([
      {
        id: "bank-buster",
        gameId: "gridrunner",
        tier: "bronze",
        earnedAt: NOW,
      },
    ]);
  });

  it("does not grant bank-buster if Lazarus was already defeated", () => {
    const prev = makeSave({ defeatedBosses: ["lazarus"] });
    const next = makeSave({ defeatedBosses: ["lazarus"] });
    expect(badgesForTransition(prev, next, NOW)).toEqual([]);
  });

  it("ignores unknown bosses that have no metadata", () => {
    const prev = makeSave({ defeatedBosses: [] });
    const next = makeSave({ defeatedBosses: ["unknown-boss"] });
    expect(badgesForTransition(prev, next, NOW)).toEqual([]);
  });

  it("grants grid-runner when completedTutorial flips false -> true", () => {
    const prev = makeSave({ completedTutorial: false });
    const next = makeSave({ completedTutorial: true });
    const earned = badgesForTransition(prev, next, NOW);
    expect(earned).toEqual([
      {
        id: "grid-runner",
        gameId: "gridrunner",
        tier: "bronze",
        earnedAt: NOW,
      },
    ]);
  });

  it("does not grant grid-runner on an already-completed save", () => {
    const prev = makeSave({ completedTutorial: true });
    const next = makeSave({ completedTutorial: true });
    expect(badgesForTransition(prev, next, NOW)).toEqual([]);
  });

  it("handles a fresh first-time save (prev is null) by granting nothing", () => {
    // A brand-new save starts with defeatedBosses=[] and completedTutorial=false
    // so no badges should be granted on the initial load.
    const next = makeSave();
    expect(badgesForTransition(null, next, NOW)).toEqual([]);
  });

  it("grants both Lazarus and tutorial badges if both transitions happen together", () => {
    const prev = makeSave({
      defeatedBosses: [],
      completedTutorial: false,
    });
    const next = makeSave({
      defeatedBosses: ["lazarus"],
      completedTutorial: true,
    });
    const earned = badgesForTransition(prev, next, NOW);
    expect(earned.map((b) => b.id).sort((a, b) => a.localeCompare(b))).toEqual([
      "bank-buster",
      "grid-runner",
    ]);
  });
});
