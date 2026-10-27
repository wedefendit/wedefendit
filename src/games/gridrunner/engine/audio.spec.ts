import { describe, expect, it } from "vitest";
import {
  DEFAULT_AUDIO_SETTINGS,
  MusicSlotValue,
  getMusicSlot,
  pickRandom,
  resolveTrackName,
} from "./audio";
import { GameScreenValue } from "./types";

describe("pickRandom", () => {
  it("returns an item from the pool", () => {
    const pool = ["a", "b", "c"];
    const result = pickRandom(pool);
    expect(pool).toContain(result);
  });

  it("returns the only item in a single-item pool", () => {
    expect(pickRandom(["only"])).toBe("only");
  });

  it("throws on empty pool", () => {
    expect(() => pickRandom([])).toThrow();
  });
});

describe("resolveTrackName", () => {
  it("extracts track name from Karl Casey filename", () => {
    expect(
      resolveTrackName("/audio/music/title/Karl Casey - Malibu Moon.mp3"),
    ).toBe("Malibu Moon");
  });

  it("handles filenames without artist prefix", () => {
    expect(resolveTrackName("/audio/music/boss/SomeTrack.mp3")).toBe(
      "SomeTrack",
    );
  });
});

describe("getMusicSlot", () => {
  it("returns title for title screen", () => {
    expect(getMusicSlot(GameScreenValue.Title, "sector-01", false)).toBe(MusicSlotValue.Title);
  });

  it("returns overworld for overworld screen", () => {
    expect(getMusicSlot(GameScreenValue.Overworld, "sector-01", false)).toBe(MusicSlotValue.Overworld);
  });

  it("returns interior-safe for arcade building", () => {
    expect(getMusicSlot(GameScreenValue.Building, "arcade", false)).toBe(MusicSlotValue.InteriorSafe);
  });

  it("returns interior-deep for bank building", () => {
    expect(getMusicSlot(GameScreenValue.Building, "bank", false)).toBe(MusicSlotValue.InteriorDeep);
  });

  it("returns battle for non-boss battle", () => {
    expect(getMusicSlot(GameScreenValue.Battle, "bank", false)).toBe(MusicSlotValue.Battle);
  });

  it("returns boss for boss battle in normal zone", () => {
    expect(getMusicSlot(GameScreenValue.Battle, "bank", true)).toBe(MusicSlotValue.Boss);
  });

  it("returns null for intel screen", () => {
    //@ts-expect-error intel is not supported
    expect(getMusicSlot("intel", "bank", false)).toBeNull();
  });
});

describe("DEFAULT_AUDIO_SETTINGS", () => {
  it("has expected defaults", () => {
    expect(DEFAULT_AUDIO_SETTINGS.masterVolume).toBe(78);
    expect(DEFAULT_AUDIO_SETTINGS.musicVolume).toBe(45);
    expect(DEFAULT_AUDIO_SETTINGS.sfxVolume).toBe(42);
    expect(DEFAULT_AUDIO_SETTINGS.muted).toBe(false);
  });
});
