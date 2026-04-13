/*
Copyright \u00A9 2025 Defend I.T. Solutions LLC. All Rights Reserved.

This software and its source code are the proprietary property of
Defend I.T. Solutions LLC and are protected by United States and
international copyright laws. Unauthorized reproduction, distribution,
modification, display, or use of this software, in whole or in part, without the
prior written permission of Defend I.T. Solutions LLC, is strictly prohibited.

This software is provided for use only by authorized employees, contractors, or
licensees of Defend I.T. Solutions LLC and may not be disclosed to any third
party without express written consent.
*/

import type { Difficulty } from "../shared/types";
import { COMBO_TIPS } from "./content/deviceTips";
import type {
  AppliedCombo,
  DeviceId,
  PlacementFinding,
  ScoreResult,
  ZoneId,
} from "./engine";
import type { PlacementMap } from "./model";

export type OpenRiskItem = {
  id: string;
  label: string;
  count?: number;
};

function zoneOf(placements: PlacementMap, deviceId: DeviceId): ZoneId | null {
  return placements[deviceId]?.zoneId ?? null;
}

function comboById(
  result: ScoreResult,
  comboId: AppliedCombo["id"],
): AppliedCombo | undefined {
  return result.appliedCombos.find((combo) => combo.id === comboId);
}

function findingsFor(
  result: ScoreResult,
  predicate: (finding: PlacementFinding) => boolean,
): PlacementFinding[] {
  return result.placementFindings.filter(predicate);
}

function firstFinding(
  result: ScoreResult,
  predicate: (finding: PlacementFinding) => boolean,
): PlacementFinding | undefined {
  return result.placementFindings.find(predicate);
}

function isTrustedFinding(finding: PlacementFinding): boolean {
  return (
    finding.deviceId === "work-laptop" ||
    finding.deviceId === "personal-phone" ||
    finding.deviceId === "tablet"
  );
}

function isEntertainmentFinding(finding: PlacementFinding): boolean {
  return (
    finding.deviceId === "smart-tv" ||
    finding.deviceId === "smart-speaker" ||
    finding.deviceId === "game-console"
  );
}

function isCameraFinding(finding: PlacementFinding): boolean {
  return (
    finding.deviceId === "doorbell-camera" ||
    finding.deviceId === "camera-hub"
  );
}

function guestRiskItem(
  finding: PlacementFinding,
  difficulty: Difficulty,
): OpenRiskItem {
  if (difficulty === "easy") {
    return {
      id: "guest-phone",
      label: "Easy mode still leaves the guest phone off a true Guest network.",
    };
  }

  if (finding.actualZone === "main") {
    return {
      id: "guest-phone",
      label: "Guest phone is on Main, sharing trust it should not have.",
    };
  }

  return {
    id: "guest-phone",
    label: "Guest phone is not isolated on a true Guest network.",
  };
}

function cameraRiskItem(findings: PlacementFinding[]): OpenRiskItem {
  return {
    id: "camera-off-iot",
    label:
      findings.length === 1
        ? "A camera is still outside the isolated IoT segment."
        : "Camera devices are still outside the isolated IoT segment.",
    count: findings.length > 1 ? findings.length : undefined,
  };
}

function trustedRiskItem(findings: PlacementFinding[]): OpenRiskItem {
  const criticalCount = findings.filter(
    (finding) => finding.severity === "critical",
  ).length;

  if (criticalCount > 0) {
    return {
      id: "trusted-critical",
      label:
        criticalCount === 1
          ? "A trusted device is exposed on the IoT network."
          : "Trusted devices are exposed on the IoT network.",
      count: criticalCount > 1 ? criticalCount : undefined,
    };
  }

  return {
    id: "trusted-wrong",
    label:
      findings.length === 1
        ? "A trusted device is still off your Main network."
        : "Trusted devices are still off your Main network.",
    count: findings.length > 1 ? findings.length : undefined,
  };
}

function printerRiskItem(finding: PlacementFinding): OpenRiskItem {
  if (finding.actualZone === "main") {
    return {
      id: "printer-main",
      label: "The printer is still sitting on your Main network.",
    };
  }

  return {
    id: "printer-guest",
    label: "The printer is still sitting on a more trusted segment than it needs.",
  };
}

function entertainmentRiskItem(findings: PlacementFinding[]): OpenRiskItem {
  const criticalCount = findings.filter(
    (finding) => finding.severity === "critical",
  ).length;

  if (criticalCount > 0) {
    return {
      id: "entertainment-main",
      label:
        criticalCount === 1
          ? "An entertainment device is still sitting on your Main network."
          : "Entertainment devices are still sitting on your Main network.",
      count: criticalCount > 1 ? criticalCount : undefined,
    };
  }

  return {
    id: "entertainment-off-iot",
    label:
      findings.length === 1
        ? "An entertainment device is still outside the isolated IoT segment."
        : "Entertainment devices are still outside the isolated IoT segment.",
    count: findings.length > 1 ? findings.length : undefined,
  };
}

export function scanWins(placements: PlacementMap): string[] {
  const wins: string[] = [];

  if (zoneOf(placements, "guest-phone") === "guest") {
    wins.push("Guest access isolated on its own network.");
  }
  if (
    zoneOf(placements, "doorbell-camera") === "iot" &&
    zoneOf(placements, "camera-hub") === "iot"
  ) {
    wins.push("Both cameras contained on the IoT network.");
  }
  if (
    zoneOf(placements, "work-laptop") === "main" &&
    zoneOf(placements, "personal-phone") === "main"
  ) {
    wins.push("Work and personal devices sharing one trusted zone.");
  }
  if (
    zoneOf(placements, "smart-tv") === "iot" &&
    zoneOf(placements, "smart-speaker") === "iot" &&
    zoneOf(placements, "game-console") === "iot"
  ) {
    wins.push("Entertainment devices separated from your trusted network.");
  }
  if (zoneOf(placements, "printer") === "iot") {
    wins.push("Printer treated as the untrusted IoT device it actually is.");
  }
  if (wins.length === 0) {
    wins.push("You completed the exercise.");
  }

  return wins;
}

export function buildOpenRiskItems(
  result: ScoreResult,
  difficulty: Difficulty,
): OpenRiskItem[] {
  const items: OpenRiskItem[] = [];

  const guestFinding = firstFinding(
    result,
    (finding) => finding.deviceId === "guest-phone",
  );
  if (guestFinding) {
    items.push(guestRiskItem(guestFinding, difficulty));
  }

  const cameraOnMain = comboById(result, "camera-on-main");
  const cameraFindings = findingsFor(result, isCameraFinding);
  if (cameraOnMain) {
    items.push({
      id: cameraOnMain.id,
      label: COMBO_TIPS[cameraOnMain.id],
      count: cameraOnMain.count,
    });
  } else if (cameraFindings.length > 0) {
    items.push(cameraRiskItem(cameraFindings));
  }

  const trustedFindings = findingsFor(result, isTrustedFinding);
  if (trustedFindings.length > 0) {
    items.push(trustedRiskItem(trustedFindings));
  }

  const printerFinding = firstFinding(
    result,
    (finding) => finding.deviceId === "printer",
  );
  if (printerFinding) {
    items.push(printerRiskItem(printerFinding));
  }

  const entertainmentClutter = comboById(result, "entertainment-clutter");
  const entertainmentFindings = findingsFor(result, isEntertainmentFinding);
  if (entertainmentClutter) {
    items.push({
      id: entertainmentClutter.id,
      label: COMBO_TIPS[entertainmentClutter.id],
      count: entertainmentClutter.count,
    });
  } else if (entertainmentFindings.length > 0) {
    items.push(entertainmentRiskItem(entertainmentFindings));
  }

  const singleZoneDump = comboById(result, "single-zone-dump");
  if (singleZoneDump) {
    items.push({
      id: singleZoneDump.id,
      label: COMBO_TIPS[singleZoneDump.id],
      count: singleZoneDump.count,
    });
  }

  return items;
}

export function scanRisks(
  _placements: PlacementMap,
  result: ScoreResult,
  difficulty: Difficulty = "medium",
): string[] {
  return buildOpenRiskItems(result, difficulty).map((item) => item.label);
}

export function scanImprovements(
  _placements: PlacementMap,
  result: ScoreResult,
  difficulty: Difficulty = "medium",
): string[] {
  const improvements = new Set<string>();

  if (firstFinding(result, (finding) => finding.deviceId === "guest-phone")) {
    improvements.add(
      difficulty === "easy"
        ? "Easy mode cannot assign a true Guest network. Try Medium or Hard to isolate the guest phone there."
        : "Move the guest phone onto the Guest network.",
    );
  }

  if (findingsFor(result, isCameraFinding).length > 0) {
    improvements.add("Move cameras to the IoT zone.");
  }

  if (findingsFor(result, isEntertainmentFinding).length > 0) {
    improvements.add("Move smart TVs, speakers, and consoles onto IoT.");
  }

  if (findingsFor(result, isTrustedFinding).length > 0) {
    improvements.add("Move laptops, phones, and tablets back onto the Main network.");
  }

  if (firstFinding(result, (finding) => finding.deviceId === "printer")) {
    improvements.add("Move the printer onto the IoT network.");
  }

  if (comboById(result, "single-zone-dump")) {
    improvements.add("Split devices across at least two zones.");
  }

  if (improvements.size === 0) {
    improvements.add("Solid layout. Enable MFA everywhere.");
  }

  return Array.from(improvements);
}

export function getBadgeLabel(total: number, difficulty: Difficulty): string {
  if (difficulty === "hard" && total >= 70) return "Network Architect tier";
  if (total >= 40) return "Home Network Rookie tier";
  return "Getting started";
}
