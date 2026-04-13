import { describe, expect, it } from "vitest";
import { calculateScore, type PlacementFinding, type ScoreResult } from "./engine";
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

    expect(wins).toContain("Guest access isolated on its own network.");
    expect(wins).toContain("Both cameras contained on the IoT network.");
    expect(wins).toContain("Work and personal devices sharing one trusted zone.");
    expect(wins).toContain("Entertainment devices separated from your trusted network.");
    expect(wins).toContain("Printer treated as the untrusted IoT device it actually is.");
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
      "Easy mode still leaves the guest phone off a true Guest network.",
    );
    expect(scanImprovements(placements, result, "easy")).toContain(
      "Easy mode cannot assign a true Guest network. Try Medium or Hard to isolate the guest phone there.",
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
      "Camera on Main. Direct path from outside to your trusted devices.",
    );
    expect(
      risks.some((risk) => risk.includes("outside the isolated IoT segment")),
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
      "Easy mode still leaves the guest phone off a true Guest network.",
      "A camera is still outside the isolated IoT segment.",
      "Everything in one zone. Any single device can reach everything else.",
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

    const result = calculateScore(
      Object.entries(placements)
        .filter((entry): entry is [string, NonNullable<(typeof placements)[string]>] =>
          Boolean(entry[1]),
        )
        .map(([deviceId, placement]) => ({
          deviceId: deviceId as any,
          zoneId: placement.zoneId,
        })),
    );

    expect(result.total).toBe(88);
    expect(scanRisks(placements, result, "easy")).toContain(
      "Easy mode still leaves the guest phone off a true Guest network.",
    );
  });

  it("maps badge labels from score and difficulty", () => {
    expect(getBadgeLabel(70, "hard")).toBe("Network Architect tier");
    expect(getBadgeLabel(40, "easy")).toBe("Home Network Rookie tier");
    expect(getBadgeLabel(39, "medium")).toBe("Getting started");
  });
});
