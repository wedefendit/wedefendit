import { describe, expect, it } from "vitest";
import { createBattle } from "../engine/battle";
import { gameReducer } from "../engine/game-reducer";
import {
  createInitialGameState,
  GameActionValue,
  OverlayValue,
  type GridRunnerState,
} from "../engine/game-state";
import { BaseToolIdValue, createCommonTool } from "../engine/loot";
import { createNewSave } from "../engine/save";
import { spawnEnemy } from "../engine/enemies";
import {
  BattlePhaseValue,
  GameScreenValue,
  OnboardingKeyValue,
  type GridRunnerSave,
  type OnboardingFlags,
  type OnboardingKey,
} from "../engine/types";

const EMPTY_FLAGS: OnboardingFlags = {
  [OnboardingKeyValue.Loot]: false,
  [OnboardingKeyValue.Shop]: false,
  [OnboardingKeyValue.Disc]: false,
  [OnboardingKeyValue.Boss]: false,
};

function makeSave(flags: Partial<OnboardingFlags> = {}): GridRunnerSave {
  return {
    ...createNewSave("Op"),
    currentZone: "arcade",
    currentPosition: { x: 0, y: 0 },
    completedTutorial: true,
    onboarding: { ...EMPTY_FLAGS, ...flags },
  };
}

function onboardingState(
  queue: OnboardingKey[],
  flags: Partial<OnboardingFlags> = {},
): GridRunnerState {
  return {
    ...createInitialGameState(),
    screen: GameScreenValue.Building,
    save: makeSave(flags),
    currentZone: "arcade",
    onboardingQueue: queue,
  };
}

function dismiss(state: GridRunnerState, key: OnboardingKey): GridRunnerState {
  return gameReducer(state, { type: GameActionValue.DismissOnboarding, key });
}

function finishBattle(state: GridRunnerState): GridRunnerState {
  const exiting = gameReducer(state, { type: GameActionValue.BattleEnd });
  return gameReducer(exiting, { type: GameActionValue.BattleTransitionEnd });
}

function winningBattleState(
  flags: Partial<OnboardingFlags> = {},
  queue: OnboardingKey[] = [],
  includeLoot = true,
): GridRunnerState {
  const enemy = spawnEnemy("script-kiddie", 1);
  const loot = includeLoot ? createCommonTool(BaseToolIdValue.Nmap) : null;
  return {
    ...onboardingState(queue, flags),
    screen: GameScreenValue.Battle,
    battle: {
      ...createBattle(enemy, false),
      phase: BattlePhaseValue.Won,
      lootDrop: loot,
    },
  };
}

describe("DISMISS_ONBOARDING transition", () => {
  it("sets the matching flag and shifts the queue", () => {
    const initial = onboardingState([
      OnboardingKeyValue.Loot,
      OnboardingKeyValue.Disc,
    ]);
    const next = dismiss(initial, OnboardingKeyValue.Loot);
    expect(next.save?.onboarding.loot).toBe(true);
    expect(next.save?.onboarding.disc).toBe(false);
    expect(next.onboardingQueue).toEqual([OnboardingKeyValue.Disc]);
    expect(next.overlay).toBe(OverlayValue.None);
  });

  it("opens the shop overlay when dismissing shop onboarding", () => {
    const initial = {
      ...onboardingState([OnboardingKeyValue.Shop]),
      pendingShopOpen: true,
    };
    const next = dismiss(initial, OnboardingKeyValue.Shop);
    expect(next.save?.onboarding.shop).toBe(true);
    expect(next.pendingShopOpen).toBe(false);
    expect(next.overlay).toBe(OverlayValue.Shop);
    expect(next.overlayReturnTo).toBe(OverlayValue.None);
  });

  it("is a no-op when the key does not match the queue front", () => {
    const initial = onboardingState([OnboardingKeyValue.Loot]);
    const next = dismiss(initial, OnboardingKeyValue.Shop);
    expect(next).toBe(initial);
  });
});

describe("loot onboarding trigger guard", () => {
  it("queues when loot dropped and flag is false", () => {
    const next = finishBattle(winningBattleState());
    expect(next.onboardingQueue).toContain(OnboardingKeyValue.Loot);
  });

  it("does not queue when flag is already true", () => {
    const next = finishBattle(
      winningBattleState({ [OnboardingKeyValue.Loot]: true }),
    );
    expect(next.onboardingQueue).not.toContain(OnboardingKeyValue.Loot);
  });

  it("does not queue when no loot dropped", () => {
    const next = finishBattle(winningBattleState({}, [], false));
    expect(next.onboardingQueue).not.toContain(OnboardingKeyValue.Loot);
  });

  it("does not queue a duplicate pending prompt", () => {
    const next = finishBattle(
      winningBattleState({}, [OnboardingKeyValue.Loot]),
    );
    expect(next.onboardingQueue).toEqual([OnboardingKeyValue.Loot]);
  });
});
