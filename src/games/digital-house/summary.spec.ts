import { describe, expect, it } from "vitest";
import {
  calculateScore,
  type PlacementFinding,
  type ScoreResult,
} from "./engine";
import { emptyPlacements } from "./model";
import {
  buildOpenRiskItems,
  getBadgeLabel,
  scanImprovements,
  scanRisks,
  scanWins,
} from "./summary";

function createScore({
  appliedCombos = [],
  placementFindings = [],
}: {
  appliedCombos?: ScoreResult["appliedCombos"];
  placementFindings?: PlacementFinding[];
} = {}): ScoreResult {
  return {
    privacy: 50,
    blastRadius: 50,
    recovery: 50,
    total: 50,
    baseDeltas: { privacy: 0, blastRadius: 0, recovery: 0 },
    comboDeltas: { privacy: 0, blastRadius: 0, recovery: 0 },
    appliedCombos,
    placementFindings,
  };
}

describe("digital house summary helpers", () => {
  it("summarizes strong placements as wins", () => {
    const placements = emptyPlacements();
    placements["guest-phone"] = { roomId: "entry-exterior", zoneId: "guest" };
    placements["doorbell-camera"] = { roomId: "entry-exterior", zoneId: "iot" };
    placements["camera-hub"] = { roomId: "bedroom", zoneId: "iot" };
    placements["work-laptop"] = { roomId: "office", zoneId: "main" };
    placements["personal-phone"] = { roomId: "bedroom", zoneId: "main" };
    placements["smart-tv"] = { roomId: "living-room", zoneId: "iot" };
    placements["smart-speaker"] = { roomId: "living-room", zoneId: "iot" };
    placements["game-console"] = { roomId: "living-room", zoneId: "iot" };
    placements["printer"] = { roomId: "office", zoneId: "iot" };

    const wins = scanWins(placements);

    expect(wins).toContain("Guest access is on its own separate network.");
    expect(wins).toContain(
      "Both cameras are separated from your personal devices.",
    );
    expect(wins).toContain(
      "Work and personal devices are together on the same network.",
    );
    expect(wins).toContain(
      "Entertainment devices are separated from your personal stuff.",
    );
    expect(wins).toContain(
      "Printer is separated from your personal devices where it belongs.",
    );
  });

  it("calls out the Easy-mode guest gap from placement findings", () => {
    const placements = emptyPlacements();
    placements["guest-phone"] = { roomId: "entry-exterior", zoneId: "iot" };

    const result = createScore({
      placementFindings: [
        {
          deviceId: "guest-phone",
          actualZone: "iot",
          idealZone: "guest",
          severity: "wrong",
          ceilingPenalty: { privacy: 10, blastRadius: 12, recovery: 14 },
        },
      ],
    });

    expect(scanRisks(placements, result, "easy")).toContain(
      "Easy mode doesn't let you create a separate guest network.",
    );
    expect(scanImprovements(placements, result, "easy")).toContain(
      "Easy mode doesn't have a guest network. Try Medium or Hard to separate visitor devices.",
    );
  });

  it("prefers the stronger combo wording over duplicate camera finding wording", () => {
    const risks = scanRisks(
      emptyPlacements(),
      createScore({
        appliedCombos: [
          {
            id: "camera-on-main",
            label: "Camera on Main",
            delta: { privacy: -10, blastRadius: -10, recovery: -10 },
          },
        ],
        placementFindings: [
          {
            deviceId: "camera-hub",
            actualZone: "main",
            idealZone: "iot",
            severity: "critical",
            ceilingPenalty: { privacy: 18, blastRadius: 20, recovery: 22 },
          },
        ],
      }),
      "medium",
    );

    expect(risks).toContain(
      "Camera on Main. A camera facing the street can see your personal devices.",
    );
    expect(
      risks.some((risk) => risk.includes("more access than it needs")),
    ).toBe(false);
  });

  it("builds aggregated open-risk items from findings first, then combos", () => {
    const items = buildOpenRiskItems(
      createScore({
        appliedCombos: [
          {
            id: "single-zone-dump",
            label: "Single zone",
            delta: { privacy: -15, blastRadius: -20, recovery: -20 },
          },
        ],
        placementFindings: [
          {
            deviceId: "guest-phone",
            actualZone: "iot",
            idealZone: "guest",
            severity: "wrong",
            ceilingPenalty: { privacy: 10, blastRadius: 12, recovery: 14 },
          },
          {
            deviceId: "camera-hub",
            actualZone: "guest",
            idealZone: "iot",
            severity: "wrong",
            ceilingPenalty: { privacy: 10, blastRadius: 12, recovery: 14 },
          },
        ],
      }),
      "easy",
    );

    expect(items.map((item) => item.label)).toEqual([
      "Easy mode doesn't let you create a separate guest network.",
      "A camera still has more access than it needs.",
      "Everything is on one network. If any device gets hacked, the rest are exposed.",
    ]);
  });

  it("uses real scoring output to keep Easy best-case below perfect", () => {
    const placements = emptyPlacements();
    placements["work-laptop"] = { roomId: "office", zoneId: "main" };
    placements["personal-phone"] = { roomId: "bedroom", zoneId: "main" };
    placements["tablet"] = { roomId: "bedroom", zoneId: "main" };
    placements["guest-phone"] = { roomId: "entry-exterior", zoneId: "iot" };
    placements["printer"] = { roomId: "kitchen", zoneId: "iot" };
    placements["smart-tv"] = { roomId: "living-room", zoneId: "iot" };
    placements["smart-speaker"] = { roomId: "living-room", zoneId: "iot" };
    placements["game-console"] = { roomId: "living-room", zoneId: "iot" };
    placements["doorbell-camera"] = { roomId: "entry-exterior", zoneId: "iot" };
    placements["camera-hub"] = { roomId: "kitchen", zoneId: "iot" };

    const placedDevices = Object.entries(placements).filter(
      (
        entry,
      ): entry is [
        keyof typeof placements,
        NonNullable<(typeof placements)[keyof typeof placements]>,
      ] => Boolean(entry[1]),
    );

    const result = calculateScore(
      placedDevices.map(([deviceId, placement]) => ({
        deviceId,
        zoneId: placement.zoneId,
      })),
    );

    expect(result.total).toBe(88);
    expect(scanRisks(placements, result, "easy")).toContain(
      "Easy mode doesn't let you create a separate guest network.",
    );
  });

  it("maps badge labels from score and difficulty", () => {
    expect(getBadgeLabel(70, "hard")).toBe("Network Architect tier");
    expect(getBadgeLabel(40, "easy")).toBe("Home Network Rookie tier");
    expect(getBadgeLabel(39, "medium")).toBe("Getting started");
  });
});
