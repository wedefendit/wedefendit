import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  addBadge,
  clearGamePreference,
  getBadges,
  getGamePreference,
  getState,
  hasBadge,
  setGamePreference,
  STORAGE_KEY_NAME,
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

    const raw = localStorageStub.getItem(STORAGE_KEY_NAME);
    expect(raw).toContain("digital-house");
    expect(raw).toContain("hide-help-modal");
  });

  it("clears a stored game preference without removing unrelated state", async () => {
    await setGamePreference("digital-house", "hide-help-modal", true);
    await setGamePreference("another-game", "other-flag", "keep");

    await clearGamePreference("digital-house", "hide-help-modal");

    expect(
      await getGamePreference<boolean>("digital-house", "hide-help-modal"),
    ).toBeUndefined();
    expect(await getGamePreference("another-game", "other-flag")).toBe("keep");
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
    const badges = await getBadges();
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
    const badges = await getBadges();
    expect(badges).toHaveLength(1);
    // First-write timestamp is preserved; duplicate is ignored wholesale.
    expect(badges[0].earnedAt).toBe("2026-04-16T12:00:00.000Z");
  });

  it("hasBadge matches by id", async () => {
    await addBadge({
      id: "grid-runner",
      gameId: "gridrunner",
      tier: "bronze",
      earnedAt: "2026-04-16T12:00:00.000Z",
    });
    expect(await hasBadge("grid-runner")).toBe(true);
    expect(await hasBadge("unknown")).toBe(false);
  });

  it("drops malformed badge entries and keeps valid ones", async () => {
    localStorageStub.setItem(
      STORAGE_KEY_NAME,
      JSON.stringify({
        badges: [
          "legacy-string-id",
          { id: "missing-fields" },
          null,
          {
            id: "valid-one",
            gameId: "gridrunner",
            tier: "bronze",
            earnedAt: "2026-04-16T12:00:00.000Z",
          },
          42,
        ],
        scores: {},
        preferences: {},
      }),
    );
    const badges = await getBadges();
    expect(badges).toHaveLength(1);
    expect(badges[0].id).toBe("valid-one");
  });

  it("totally malformed badges value sanitizes to empty array", async () => {
    localStorageStub.setItem(
      STORAGE_KEY_NAME,
      JSON.stringify({ badges: "not an array", scores: {}, preferences: {} }),
    );
    expect(await getBadges()).toEqual([]);
  });

  it("adding a gridrunner badge does not clobber other games' badges or state", async () => {
    const otherBadge: EarnedBadge = {
      id: "home-network-rookie",
      gameId: "digital-house",
      tier: "bronze",
      earnedAt: "2026-01-01T00:00:00.000Z",
    };
    localStorageStub.setItem(
      STORAGE_KEY_NAME,
      JSON.stringify({
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
      }),
    );
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
