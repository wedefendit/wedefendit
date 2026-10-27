import { DifficultyValue, type Difficulty } from "../shared/types";
import { COMBO_TIPS } from "./content/deviceTips";
import {
  AppliedComboIdValue,
  DeviceCategoryValue,
  DeviceIdValue,
  PlacementFindingSeverityValue,
  ZoneIdValue,
  getDevice,
  isCamera,
  isTrusted,
  type AppliedCombo,
  type DeviceId,
  type PlacementFinding,
  type ScoreResult,
  type ZoneId,
} from "./engine";
import {
  BadgeJustEarnedValue,
  DIGITAL_HOUSE_BADGES,
  type PlacementMap,
} from "./model";

enum RiskGroupValue { Trusted = "trusted", Entertainment = "entertainment" }
type RiskCopy = Readonly<{ id: string; singular: string; plural: string }>;
const GROUP_RISK_COPY: Record<RiskGroupValue, Readonly<{ critical: RiskCopy; wrong: RiskCopy }>> = {
  [RiskGroupValue.Trusted]: {
    critical: {
      id: "trusted-critical",
      singular: "A personal device is on the IoT network.", plural: "Personal devices are on the IoT network.",
    },
    wrong: {
      id: "trusted-wrong",
      singular: "A personal device is not on the Main network.", plural: "Some personal devices are not on the Main network.",
    },
  },
  [RiskGroupValue.Entertainment]: {
    critical: {
      id: "entertainment-main",
      singular: "An entertainment device is still on your personal network.", plural: "Entertainment devices are still on your personal network.",
    },
    wrong: {
      id: "entertainment-off-iot",
      singular: "An entertainment device still has more access than it needs.", plural: "Entertainment devices still have more access than they need.",
    },
  },
};

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
  comboId: `${AppliedComboIdValue}`,
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
  return isTrusted(finding.deviceId);
}

function isEntertainmentFinding(finding: PlacementFinding): boolean {
  return (
    getDevice(finding.deviceId).category ===
    DeviceCategoryValue.Entertainment
  );
}

function isCameraFinding(finding: PlacementFinding): boolean {
  return isCamera(finding.deviceId);
}

function guestRiskItem(
  finding: PlacementFinding,
  difficulty: Difficulty,
): OpenRiskItem {
  if (difficulty === DifficultyValue.Easy) {
    return {
      id: DeviceIdValue.GuestPhone,
      label: "Easy mode does not include a separate Guest network.",
    };
  }

  if (finding.actualZone === ZoneIdValue.Main) {
    return {
      id: DeviceIdValue.GuestPhone,
      label:
        "The guest phone shares the Main network with personal devices.",
    };
  }

  return {
    id: DeviceIdValue.GuestPhone,
    label: "The guest phone is not on the Guest network.",
  };
}

function cameraRiskItem(findings: PlacementFinding[]): OpenRiskItem {
  return {
    id: "camera-off-iot",
    label:
      findings.length === 1
        ? "A camera still has more access than it needs."
        : "Cameras still have more access than they need.",
    count: findings.length > 1 ? findings.length : undefined,
  };
}

function groupRiskItem(
  findings: PlacementFinding[],
  group: RiskGroupValue,
): OpenRiskItem {
  const criticalCount = findings.filter(
    (finding) =>
      finding.severity === PlacementFindingSeverityValue.Critical,
  ).length;
  const count = criticalCount > 0 ? criticalCount : findings.length;
  const copy = GROUP_RISK_COPY[group][
    criticalCount > 0 ? "critical" : "wrong"
  ];
  return {
    id: copy.id,
    label: count === 1 ? copy.singular : copy.plural,
    count: count > 1 ? count : undefined,
  };
}

function printerRiskItem(finding: PlacementFinding): OpenRiskItem {
  if (finding.actualZone === ZoneIdValue.Main) {
    return {
      id: "printer-main",
      label: "The printer shares the Main network with personal devices.",
    };
  }

  return {
    id: "printer-guest",
    label: "The printer has more access than it needs.",
  };
}

export function scanWins(placements: PlacementMap): string[] {
  const wins: string[] = [];

  if (
    zoneOf(placements, DeviceIdValue.GuestPhone) === ZoneIdValue.Guest
  ) {
    wins.push("Guest access is separated from personal devices.");
  }
  if (
    zoneOf(placements, DeviceIdValue.DoorbellCamera) === ZoneIdValue.IoT &&
    zoneOf(placements, DeviceIdValue.CameraHub) === ZoneIdValue.IoT
  ) {
    wins.push("Both cameras are separated from your personal devices.");
  }
  if (
    zoneOf(placements, DeviceIdValue.WorkLaptop) === ZoneIdValue.Main &&
    zoneOf(placements, DeviceIdValue.PersonalPhone) === ZoneIdValue.Main
  ) {
    wins.push("Work and personal devices share the Main network.");
  }
  if (
    zoneOf(placements, DeviceIdValue.SmartTv) === ZoneIdValue.IoT &&
    zoneOf(placements, DeviceIdValue.SmartSpeaker) === ZoneIdValue.IoT &&
    zoneOf(placements, DeviceIdValue.GameConsole) === ZoneIdValue.IoT
  ) {
    wins.push("Entertainment devices are separated from personal devices.");
  }
  if (zoneOf(placements, DeviceIdValue.Printer) === ZoneIdValue.IoT) {
    wins.push(
      "The printer is separated from personal devices.",
    );
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
    (finding) => finding.deviceId === DeviceIdValue.GuestPhone,
  );
  if (guestFinding) {
    items.push(guestRiskItem(guestFinding, difficulty));
  }

  const cameraOnMain = comboById(result, AppliedComboIdValue.CameraOnMain);
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
    items.push(groupRiskItem(trustedFindings, RiskGroupValue.Trusted));
  }

  const printerFinding = firstFinding(
    result,
    (finding) => finding.deviceId === DeviceIdValue.Printer,
  );
  if (printerFinding) {
    items.push(printerRiskItem(printerFinding));
  }

  const entertainmentClutter = comboById(
    result,
    AppliedComboIdValue.EntertainmentClutter,
  );
  const entertainmentFindings = findingsFor(result, isEntertainmentFinding);
  if (entertainmentClutter) {
    items.push({
      id: entertainmentClutter.id,
      label: COMBO_TIPS[entertainmentClutter.id],
      count: entertainmentClutter.count,
    });
  } else if (entertainmentFindings.length > 0) {
    items.push(
      groupRiskItem(entertainmentFindings, RiskGroupValue.Entertainment),
    );
  }

  const singleZoneDump = comboById(result, AppliedComboIdValue.SingleZoneDump);
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
  difficulty: Difficulty = DifficultyValue.Medium,
): string[] {
  return buildOpenRiskItems(result, difficulty).map((item) => item.label);
}

export function scanImprovements(
  _placements: PlacementMap,
  result: ScoreResult,
  difficulty: Difficulty = DifficultyValue.Medium,
): string[] {
  const improvements = new Set<string>();

  if (
    firstFinding(
      result,
      (finding) => finding.deviceId === DeviceIdValue.GuestPhone,
    )
  ) {
    improvements.add(
      difficulty === DifficultyValue.Easy
        ? "Easy mode does not include a Guest network. Try Medium or Hard to separate visitor devices."
        : "Move the guest phone to the Guest network.",
    );
  }

  if (findingsFor(result, isCameraFinding).length > 0) {
    improvements.add("Move cameras to the IoT network.");
  }

  if (findingsFor(result, isEntertainmentFinding).length > 0) {
    improvements.add("Move TVs, smart speakers, and consoles to the IoT network.");
  }

  if (findingsFor(result, isTrustedFinding).length > 0) {
    improvements.add(
      "Move personal devices to the Main network.",
    );
  }

  if (
    firstFinding(
      result,
      (finding) => finding.deviceId === DeviceIdValue.Printer,
    )
  ) {
    improvements.add("Move the printer to the IoT network.");
  }

  if (comboById(result, AppliedComboIdValue.SingleZoneDump)) {
    improvements.add("Split devices across at least two zones.");
  }

  if (improvements.size === 0) {
    improvements.add(
      "No high-priority issues in this layout. Protect important accounts with multifactor authentication.",
    );
  }

  return Array.from(improvements);
}

export function getBadgeLabel(total: number, difficulty: Difficulty): string {
  if (
    difficulty === DifficultyValue.Hard &&
    total >= DIGITAL_HOUSE_BADGES[BadgeJustEarnedValue.Architect].minScore
  ) {
    return "Network Architect tier";
  }
  if (total >= DIGITAL_HOUSE_BADGES[BadgeJustEarnedValue.Rookie].minScore) {
    return "Home Network Rookie tier";
  }
  return "Getting started";
}
