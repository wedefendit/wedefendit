import { describe, expect, it } from "vitest";
import {
  buildDevicesByRoom,
  buildPlacedIds,
  buildPlacedZones,
  buildScoreFeedback,
  deriveRiskyRooms,
  mergeRoomZones,
  reconcilePlacementsWithRoomZones,
  resolveEarnedBadge,
  shouldAutoOpenHelp,
  toggleSelectedDevice,
} from "./DigitalHouse.controller";
import { emptyPlacements } from "./model";

describe("digital house controller helpers", () => {
  it("merges user zone overrides only for rooms that are not preassigned", () => {
    const merged = mergeRoomZones(
      {
        office: "main",
        bedroom: null,
        "living-room": "iot",
        kitchen: null,
        "entry-exterior": null,
      },
      {
        office: "guest",
        bedroom: "guest",
        kitchen: "iot",
      },
    );

    expect(merged.office).toBe("main");
    expect(merged.bedroom).toBe("guest");
    expect(merged.kitchen).toBe("iot");
    expect(merged["living-room"]).toBe("iot");
  });

  it("reconciles placed devices against updated room zones", () => {
    const placements = emptyPlacements();
    placements["work-laptop"] = { roomId: "office", zoneId: "main" };
    placements["tablet"] = { roomId: "bedroom", zoneId: "main" };

    const reconciled = reconcilePlacementsWithRoomZones(placements, {
      office: "guest",
      bedroom: null,
      "living-room": "iot",
      kitchen: "iot",
      "entry-exterior": "iot",
    });

    expect(reconciled["work-laptop"]).toEqual({ roomId: "office", zoneId: "guest" });
    expect(reconciled.tablet).toBeNull();
  });

  it("toggles selected devices, placed ids, room buckets, and zone map", () => {
    const placements = emptyPlacements();
    placements["work-laptop"] = { roomId: "office", zoneId: "main" };
    placements["guest-phone"] = { roomId: "entry-exterior", zoneId: "guest" };

    expect(toggleSelectedDevice(null, "work-laptop")).toBe("work-laptop");
    expect(toggleSelectedDevice("work-laptop", "work-laptop")).toBeNull();

    expect(Array.from(buildPlacedIds(placements))).toEqual(["work-laptop", "guest-phone"]);
    expect(buildDevicesByRoom(placements).get("office")?.map((device) => device.id)).toEqual(["work-laptop"]);
    expect(buildDevicesByRoom(placements).get("entry-exterior")?.map((device) => device.id)).toEqual(["guest-phone"]);
    expect(buildPlacedZones(placements)).toMatchObject({
      "work-laptop": "main",
      "guest-phone": "guest",
      tablet: null,
    });
  });

  it("marks risky rooms when trusted and risky devices share main", () => {
    const placements = emptyPlacements();
    placements["work-laptop"] = { roomId: "office", zoneId: "main" };
    placements["doorbell-camera"] = { roomId: "office", zoneId: "main" };
    placements["guest-phone"] = { roomId: "entry-exterior", zoneId: "guest" };

    expect(Array.from(deriveRiskyRooms(placements))).toEqual(["office"]);
  });

  it("models halfway and streak score feedback", () => {
    const halfway = buildScoreFeedback({
      previousTotal: 50,
      nextTotal: 58,
      streak: 0,
      halfwayShown: false,
      placedCount: 5,
    });

    expect(halfway.delta).toBe(8);
    expect(halfway.nextHalfwayShown).toBe(true);
    expect(halfway.nextToast?.type).toBe("halfway");

    const streak = buildScoreFeedback({
      previousTotal: 58,
      nextTotal: 64,
      streak: 2,
      halfwayShown: true,
      placedCount: 6,
    });

    expect(streak.nextStreak).toBe(3);
    expect(streak.nextToast?.type).toBe("streak");

    const setback = buildScoreFeedback({
      previousTotal: 64,
      nextTotal: 59,
      streak: 4,
      halfwayShown: true,
      placedCount: 6,
    });

    expect(setback.nextStreak).toBe(0);
    expect(setback.nextToast).toBeNull();
  });

  it("keeps help preference behavior explicit", () => {
    expect(shouldAutoOpenHelp(undefined)).toBe(true);
    expect(shouldAutoOpenHelp(false)).toBe(true);
    expect(shouldAutoOpenHelp(true)).toBe(false);
  });

  it("resolves badge awards without duplicating earned badges", () => {
    expect(
      resolveEarnedBadge({ difficulty: "easy", total: 45, hadRookie: false, hadArchitect: false }),
    ).toBe("rookie");

    expect(
      resolveEarnedBadge({ difficulty: "hard", total: 75, hadRookie: false, hadArchitect: false }),
    ).toBe("architect");

    expect(
      resolveEarnedBadge({ difficulty: "hard", total: 75, hadRookie: true, hadArchitect: true }),
    ).toBeNull();
  });
});
