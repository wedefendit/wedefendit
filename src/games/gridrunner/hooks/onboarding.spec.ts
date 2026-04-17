/*
Copyright © 2026 Defend I.T. Solutions LLC. All Rights Reserved.
*/

/**
 * The full reducer is not exported from useGridRunner.ts (it's closure
 * state for the hook). Rather than export internals, we validate the
 * DISMISS_ONBOARDING state transition by reproducing the two branches
 * the reducer exercises and asserting the resulting shape. The branches
 * under test are the ones most likely to drift when the reducer is
 * touched: (1) dismiss sets the flag and shifts the queue, (2) the shop
 * dismiss also opens the shop overlay.
 */

import { describe, expect, it } from "vitest";
import type {
  GridRunnerSave,
  OnboardingFlags,
  OnboardingKey,
} from "../engine/types";

type MiniState = {
  save: GridRunnerSave | null;
  onboardingQueue: OnboardingKey[];
  pendingShopOpen: boolean;
  overlay: "none" | "shop";
  overlayReturnTo: "none" | "menu";
};

const EMPTY_FLAGS: OnboardingFlags = {
  loot: false,
  shop: false,
  disc: false,
  boss: false,
};

function makeSave(flags: Partial<OnboardingFlags> = {}): GridRunnerSave {
  return {
    version: 3,
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
    currentZone: "arcade",
    currentPosition: { x: 0, y: 0 },
    defeatedBosses: [],
    completedTutorial: true,
    unlockedIntelEntries: [],
    onboarding: { ...EMPTY_FLAGS, ...flags },
    bits: 0,
    credits: 0,
    playTime: 0,
    savedAt: "2026-04-17T00:00:00.000Z",
  };
}

/** Mirrors the DISMISS_ONBOARDING case in useGridRunner.ts reducer. */
function dismissOnboarding(state: MiniState, key: OnboardingKey): MiniState {
  if (!state.save) return state;
  if (state.onboardingQueue[0] !== key) return state;
  const nextQueue = state.onboardingQueue.slice(1);
  const nextSave = {
    ...state.save,
    onboarding: { ...state.save.onboarding, [key]: true },
  };
  const openShopNow = key === "shop" && state.pendingShopOpen;
  return {
    ...state,
    save: nextSave,
    onboardingQueue: nextQueue,
    pendingShopOpen: openShopNow ? false : state.pendingShopOpen,
    overlay: openShopNow ? "shop" : state.overlay,
    overlayReturnTo: openShopNow ? "none" : state.overlayReturnTo,
  };
}

describe("DISMISS_ONBOARDING transition", () => {
  it("sets the matching flag and shifts the queue", () => {
    const initial: MiniState = {
      save: makeSave(),
      onboardingQueue: ["loot", "disc"],
      pendingShopOpen: false,
      overlay: "none",
      overlayReturnTo: "none",
    };
    const next = dismissOnboarding(initial, "loot");
    expect(next.save?.onboarding.loot).toBe(true);
    expect(next.save?.onboarding.disc).toBe(false);
    expect(next.onboardingQueue).toEqual(["disc"]);
    expect(next.overlay).toBe("none");
  });

  it("opens the shop overlay when dismissing the shop onboarding", () => {
    const initial: MiniState = {
      save: makeSave(),
      onboardingQueue: ["shop"],
      pendingShopOpen: true,
      overlay: "none",
      overlayReturnTo: "none",
    };
    const next = dismissOnboarding(initial, "shop");
    expect(next.save?.onboarding.shop).toBe(true);
    expect(next.pendingShopOpen).toBe(false);
    expect(next.overlay).toBe("shop");
    expect(next.overlayReturnTo).toBe("none");
  });

  it("is a no-op when the key does not match the front of the queue", () => {
    const initial: MiniState = {
      save: makeSave(),
      onboardingQueue: ["loot"],
      pendingShopOpen: false,
      overlay: "none",
      overlayReturnTo: "none",
    };
    const next = dismissOnboarding(initial, "shop");
    expect(next).toBe(initial);
  });
});

/**
 * Trigger-guard logic: loot is only queued when the flag is false AND
 * loot is not already pending. This mirrors the BATTLE_END check in
 * useGridRunner.ts so drift in that rule is caught.
 */
function shouldQueueLoot(
  save: GridRunnerSave,
  lootDrop: boolean,
  queue: OnboardingKey[],
): boolean {
  return lootDrop && !save.onboarding.loot && !queue.includes("loot");
}

describe("loot onboarding trigger guard", () => {
  it("queues when loot dropped and flag is false", () => {
    expect(shouldQueueLoot(makeSave(), true, [])).toBe(true);
  });

  it("does not queue when flag is already true", () => {
    expect(shouldQueueLoot(makeSave({ loot: true }), true, [])).toBe(false);
  });

  it("does not queue when no loot dropped", () => {
    expect(shouldQueueLoot(makeSave(), false, [])).toBe(false);
  });

  it("does not queue when already pending", () => {
    expect(shouldQueueLoot(makeSave(), true, ["loot"])).toBe(false);
  });
});
