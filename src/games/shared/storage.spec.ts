import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  addBadge,
  getGamePreference,
  getState,
  setGamePreference,
  setState,
} from "./storage";
import type { EarnedBadge } from "./types";

type LocalStorageStub = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  key: (i: number) => string | null;
  length: number;
};

function createLocalStorageStub(): LocalStorageStub {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value);
    },
    removeItem: (key) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    key: (i) => Array.from(store.keys())[i] ?? null,
  };
}

describe("shared storage", () => {
  const originalLocalStorage = Object.getOwnPropertyDescriptor(
    globalThis,
    "localStorage",
  );
  let localStorageStub: LocalStorageStub;

  beforeEach(() => {
    localStorageStub = createLocalStorageStub();
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      writable: true,
      value: localStorageStub,
    });
  });

  afterEach(() => {
    if (originalLocalStorage) {
      Object.defineProperty(globalThis, "localStorage", originalLocalStorage);
    } else {
      Reflect.deleteProperty(globalThis, "localStorage");
    }
  });

  /* ---- Game preferences ---------------------------------------- */

  it("stores a Digital House help preference inside the shared namespace", async () => {
    await setGamePreference("digital-house", "hide-help-modal", true);

    expect(
      await getGamePreference<boolean>("digital-house", "hide-help-modal"),
    ).toBe(true);

  });

  /* ---- Badges -------------------------------------------------- */

  it("round-trips an EarnedBadge", async () => {
    const earned: EarnedBadge = {
      id: "bank-buster",
      gameId: "gridrunner",
      tier: "bronze",
      earnedAt: "2026-04-16T12:00:00.000Z",
    };
    await addBadge(earned);
    const badges = (await getState()).badges;
    expect(badges).toHaveLength(1);
    expect(badges[0]).toEqual(earned);
  });

  it("duplicate addBadge is a no-op", async () => {
    const earned: EarnedBadge = {
      id: "bank-buster",
      gameId: "gridrunner",
      tier: "bronze",
      earnedAt: "2026-04-16T12:00:00.000Z",
    };
    await addBadge(earned);
    await addBadge({ ...earned, earnedAt: "2026-05-01T00:00:00.000Z" });
    const badges = (await getState()).badges;
    expect(badges).toHaveLength(1);
    // First-write timestamp is preserved; duplicate is ignored wholesale.
    expect(badges[0].earnedAt).toBe("2026-04-16T12:00:00.000Z");
  });

  it("adding a gridrunner badge does not clobber other games' badges or state", async () => {
    const otherBadge: EarnedBadge = {
      id: "home-network-rookie",
      gameId: "digital-house",
      tier: "bronze",
      earnedAt: "2026-01-01T00:00:00.000Z",
    };
    await setState({
      badges: [otherBadge],
      scores: {
        "digital-house": {
          gameId: "digital-house",
          difficulty: "easy",
          score: 42,
          details: {},
          completedAt: "2026-01-01T00:00:00.000Z",
          bestScore: 42,
        },
      },
      preferences: { "digital-house": { hints: true } },
    });
    await addBadge({
      id: "bank-buster",
      gameId: "gridrunner",
      tier: "bronze",
      earnedAt: "2026-04-16T12:00:00.000Z",
    });
    const state = await getState();
    expect(state.badges).toHaveLength(2);
    expect(
      state.badges.map((b) => b.id).sort((a, b) => a.localeCompare(b)),
    ).toEqual(["bank-buster", "home-network-rookie"]);
    expect(state.scores["digital-house"].score).toBe(42);
    expect(state.preferences["digital-house"]).toEqual({ hints: true });
  });
});
