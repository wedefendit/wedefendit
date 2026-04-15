/*
Copyright © 2026 Defend I.T. Solutions LLC. All Rights Reserved.

This software and its source code are the proprietary property of
Defend I.T. Solutions LLC and are protected by United States and
international copyright laws. Unauthorized reproduction, distribution,
modification, display, or use of this software, in whole or in part, without the
prior written permission of Defend I.T. Solutions LLC, is strictly prohibited.

This software is provided for use only by authorized employees, contractors, or
licensees of Defend I.T. Solutions LLC and may not be disclosed to any third
party without express written consent.
*/

import { describe, expect, it } from "vitest";
import {
  calculateScore,
  type DevicePlacement,
  type PlacementFinding,
} from "./scoring";

const p = (
  deviceId: DevicePlacement["deviceId"],
  zoneId: DevicePlacement["zoneId"],
): DevicePlacement => ({ deviceId, zoneId });

const perfectLayout = (): DevicePlacement[] => [
  p("work-laptop", "main"),
  p("personal-phone", "main"),
  p("tablet", "main"),
  p("guest-phone", "guest"),
  p("printer", "iot"),
  p("smart-tv", "iot"),
  p("smart-speaker", "iot"),
  p("game-console", "iot"),
  p("doorbell-camera", "iot"),
  p("camera-hub", "iot"),
];

function withZone(
  placements: DevicePlacement[],
  deviceId: DevicePlacement["deviceId"],
  zoneId: DevicePlacement["zoneId"],
): DevicePlacement[] {
  return placements.map((placement) =>
    placement.deviceId === deviceId ? { ...placement, zoneId } : placement,
  );
}

function findingFor(
  findings: PlacementFinding[],
  deviceId: DevicePlacement["deviceId"],
) {
  return findings.find((finding) => finding.deviceId === deviceId);
}

describe("calculateScore — baseline", () => {
  it("returns 50/50/50 for empty placements", () => {
    const r = calculateScore([]);
    expect(r.privacy).toBe(50);
    expect(r.blastRadius).toBe(50);
    expect(r.recovery).toBe(50);
    expect(r.total).toBe(50);
    expect(r.appliedCombos).toHaveLength(0);
    expect(r.placementFindings).toHaveLength(0);
  });
});

describe("calculateScore — base matrix spot checks", () => {
  it("Work laptop on Main stays a clean trusted placement", () => {
    const r = calculateScore([p("work-laptop", "main")]);
    expect(r.privacy).toBe(62);
    expect(r.blastRadius).toBe(60);
    expect(r.recovery).toBe(58);
    expect(r.placementFindings).toHaveLength(0);
  });

  it("Work laptop on IoT keeps the original base-matrix score", () => {
    const r = calculateScore([p("work-laptop", "iot")]);
    expect(r.privacy).toBe(15);
    expect(r.blastRadius).toBe(20);
    expect(r.recovery).toBe(22);
    expect(findingFor(r.placementFindings, "work-laptop")?.severity).toBe(
      "critical",
    );
  });

  it("Guest phone on Guest stays the ideal placement", () => {
    const r = calculateScore([p("guest-phone", "guest")]);
    expect(r.privacy).toBe(58);
    expect(r.blastRadius).toBe(60);
    expect(r.recovery).toBe(58);
    expect(r.placementFindings).toHaveLength(0);
  });

  it("Printer on Main keeps the original base-matrix score but records a critical finding", () => {
    const r = calculateScore([p("printer", "main")]);
    expect(r.privacy).toBe(42);
    expect(r.blastRadius).toBe(40);
    expect(r.recovery).toBe(38);
    expect(findingFor(r.placementFindings, "printer")).toMatchObject({
      actualZone: "main",
      idealZone: "iot",
      severity: "critical",
    });
  });
});

describe("calculateScore — placement findings and score ceilings", () => {
  it("allows a true perfect score only when every device is in its ideal zone", () => {
    const r = calculateScore(perfectLayout());
    expect(r.privacy).toBe(100);
    expect(r.blastRadius).toBe(100);
    expect(r.recovery).toBe(100);
    expect(r.total).toBe(100);
    expect(r.appliedCombos).toHaveLength(0);
    expect(r.placementFindings).toHaveLength(0);
  });

  it("keeps the best Easy-style board below 100 because the guest phone is still only on IoT", () => {
    const r = calculateScore(withZone(perfectLayout(), "guest-phone", "iot"));
    expect(r.privacy).toBe(90);
    expect(r.blastRadius).toBe(88);
    expect(r.recovery).toBe(86);
    expect(r.total).toBe(88);
    expect(findingFor(r.placementFindings, "guest-phone")).toMatchObject({
      actualZone: "iot",
      idealZone: "guest",
      severity: "wrong",
    });
  });

  it("encodes guest-phone severity as Guest > IoT > Main", () => {
    const ideal = calculateScore(perfectLayout());
    const wrong = calculateScore(
      withZone(perfectLayout(), "guest-phone", "iot"),
    );
    const critical = calculateScore(
      withZone(perfectLayout(), "guest-phone", "main"),
    );

    expect(ideal.total).toBe(100);
    expect(wrong.total).toBe(88);
    expect(critical.total).toBe(80);
    expect(findingFor(wrong.placementFindings, "guest-phone")?.severity).toBe(
      "wrong",
    );
    expect(
      findingFor(critical.placementFindings, "guest-phone")?.severity,
    ).toBe("critical");
  });

  it("encodes trusted-device severity as Main > Guest > IoT", () => {
    const wrong = calculateScore(withZone(perfectLayout(), "tablet", "guest"));
    const critical = calculateScore(withZone(perfectLayout(), "tablet", "iot"));

    expect(wrong.total).toBe(88);
    expect(critical.total).toBe(80);
    expect(findingFor(wrong.placementFindings, "tablet")?.severity).toBe(
      "wrong",
    );
    expect(findingFor(critical.placementFindings, "tablet")?.severity).toBe(
      "critical",
    );
  });

  it("encodes printer severity as IoT > Guest > Main", () => {
    const wrong = calculateScore(withZone(perfectLayout(), "printer", "guest"));
    const critical = calculateScore(
      withZone(perfectLayout(), "printer", "main"),
    );

    expect(wrong.total).toBe(88);
    expect(critical.total).toBe(80);
    expect(findingFor(wrong.placementFindings, "printer")?.severity).toBe(
      "wrong",
    );
    expect(findingFor(critical.placementFindings, "printer")?.severity).toBe(
      "critical",
    );
  });

  it("encodes entertainment severity as IoT > Guest > Main", () => {
    const wrong = calculateScore(
      withZone(perfectLayout(), "smart-tv", "guest"),
    );
    const critical = calculateScore(
      withZone(perfectLayout(), "smart-tv", "main"),
    );

    expect(wrong.total).toBe(88);
    expect(critical.total).toBe(80);
    expect(findingFor(wrong.placementFindings, "smart-tv")?.severity).toBe(
      "wrong",
    );
    expect(findingFor(critical.placementFindings, "smart-tv")?.severity).toBe(
      "critical",
    );
  });

  it("encodes camera severity as IoT > Guest > Main", () => {
    const wrong = calculateScore(
      withZone(perfectLayout(), "doorbell-camera", "guest"),
    );
    const critical = calculateScore(
      withZone(perfectLayout(), "doorbell-camera", "main"),
    );

    expect(wrong.total).toBe(88);
    expect(critical.total).toBe(80);
    expect(
      findingFor(wrong.placementFindings, "doorbell-camera")?.severity,
    ).toBe("wrong");
    expect(
      findingFor(critical.placementFindings, "doorbell-camera")?.severity,
    ).toBe("critical");
  });
});

describe("calculateScore — real cross-device combos", () => {
  it("still fires guest-mixed-with-trusted when the guest phone shares Main with trusted devices", () => {
    const r = calculateScore(withZone(perfectLayout(), "guest-phone", "main"));
    expect(r.appliedCombos.map((combo) => combo.id)).toContain(
      "guest-mixed-with-trusted",
    );
  });

  it("still fires camera-on-main when any camera lands on Main", () => {
    const r = calculateScore(withZone(perfectLayout(), "camera-hub", "main"));
    expect(r.appliedCombos.map((combo) => combo.id)).toContain(
      "camera-on-main",
    );
  });

  it("still fires entertainment-clutter when smart devices sit on Main with work or personal devices", () => {
    const r = calculateScore(
      withZone(perfectLayout(), "smart-speaker", "main"),
    );
    expect(r.appliedCombos.map((combo) => combo.id)).toContain(
      "entertainment-clutter",
    );
  });

  it("still fires single-zone-dump when every device is dumped into one zone", () => {
    const r = calculateScore([
      p("work-laptop", "main"),
      p("personal-phone", "main"),
      p("tablet", "main"),
      p("guest-phone", "main"),
      p("printer", "main"),
      p("smart-tv", "main"),
      p("smart-speaker", "main"),
      p("game-console", "main"),
      p("doorbell-camera", "main"),
      p("camera-hub", "main"),
    ]);

    expect(r.total).toBe(0);
    expect(r.appliedCombos.map((combo) => combo.id)).toContain(
      "single-zone-dump",
    );
  });
});

describe("calculateScore — audit trail", () => {
  it("keeps base deltas, combo deltas, and placement findings separate", () => {
    const r = calculateScore([p("work-laptop", "main"), p("smart-tv", "main")]);

    expect(r.baseDeltas).toEqual({
      privacy: 0,
      blastRadius: -6,
      recovery: -10,
    });
    expect(r.comboDeltas).toEqual({
      privacy: -4,
      blastRadius: -8,
      recovery: -10,
    });
    expect(r.placementFindings).toEqual([
      {
        deviceId: "smart-tv",
        actualZone: "main",
        idealZone: "iot",
        severity: "critical",
        ceilingPenalty: { privacy: 18, blastRadius: 20, recovery: 22 },
      },
    ]);
  });
});
