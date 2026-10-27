import {
  DEVICES,
  DeviceCategoryValue,
  DeviceIdValue,
  getDevice,
  isCamera,
  isTrusted,
  type DeviceId,
} from "./devices";
import { ZoneIdValue, type ZoneId } from "./zones";

export type ScoreDelta = {
  privacy: number;
  blastRadius: number;
  recovery: number;
};

export type DevicePlacement = {
  deviceId: DeviceId;
  zoneId: ZoneId;
};

export enum PlacementFindingSeverityValue {
  Wrong = "wrong",
  Critical = "critical",
}

export type PlacementFindingSeverity = `${PlacementFindingSeverityValue}`;

export enum AppliedComboIdValue {
  GuestMixedWithTrusted = "guest-mixed-with-trusted",
  CameraOnMain = "camera-on-main",
  EntertainmentClutter = "entertainment-clutter",
  SingleZoneDump = "single-zone-dump",
}

export type PlacementFinding = {
  deviceId: DeviceId;
  actualZone: ZoneId;
  idealZone: ZoneId;
  severity: PlacementFindingSeverity;
  ceilingPenalty: ScoreDelta;
};

export type ScoreResult = {
  privacy: number;
  blastRadius: number;
  recovery: number;
  total: number;
  baseDeltas: ScoreDelta;
  comboDeltas: ScoreDelta;
  appliedCombos: AppliedCombo[];
  placementFindings: PlacementFinding[];
};

export type AppliedCombo = {
  id: `${AppliedComboIdValue}`;
  label: string;
  delta: ScoreDelta;
  count?: number;
};

const STARTING_SCORE = 50;
const MAX_SCORE = 100;
const SCORE_DIMENSION_COUNT = 3;

const BASE_MATRIX: Record<DeviceId, Record<ZoneId, ScoreDelta>> = {
  "work-laptop": {
    main: { privacy: 12, blastRadius: 10, recovery: 8 },
    guest: { privacy: -22, blastRadius: -20, recovery: -18 },
    iot: { privacy: -35, blastRadius: -30, recovery: -28 },
  },
  "personal-phone": {
    main: { privacy: 10, blastRadius: 8, recovery: 6 },
    guest: { privacy: -18, blastRadius: -16, recovery: -14 },
    iot: { privacy: -28, blastRadius: -24, recovery: -22 },
  },
  tablet: {
    main: { privacy: 6, blastRadius: 5, recovery: 4 },
    guest: { privacy: -10, blastRadius: -9, recovery: -8 },
    iot: { privacy: -16, blastRadius: -14, recovery: -12 },
  },
  "guest-phone": {
    main: { privacy: -24, blastRadius: -22, recovery: -18 },
    guest: { privacy: 8, blastRadius: 10, recovery: 8 },
    iot: { privacy: -6, blastRadius: -4, recovery: -4 },
  },
  printer: {
    main: { privacy: -8, blastRadius: -10, recovery: -12 },
    guest: { privacy: -10, blastRadius: -10, recovery: -8 },
    iot: { privacy: 2, blastRadius: 4, recovery: 2 },
  },
  "smart-tv": {
    main: { privacy: -12, blastRadius: -16, recovery: -18 },
    guest: { privacy: -8, blastRadius: -10, recovery: -10 },
    iot: { privacy: 6, blastRadius: 8, recovery: 8 },
  },
  "smart-speaker": {
    main: { privacy: -14, blastRadius: -14, recovery: -16 },
    guest: { privacy: -8, blastRadius: -8, recovery: -8 },
    iot: { privacy: 8, blastRadius: 8, recovery: 8 },
  },
  "game-console": {
    main: { privacy: -8, blastRadius: -12, recovery: -14 },
    guest: { privacy: -6, blastRadius: -8, recovery: -8 },
    iot: { privacy: 6, blastRadius: 8, recovery: 6 },
  },
  "doorbell-camera": {
    main: { privacy: -22, blastRadius: -20, recovery: -20 },
    guest: { privacy: -16, blastRadius: -14, recovery: -14 },
    iot: { privacy: 10, blastRadius: 10, recovery: 10 },
  },
  "camera-hub": {
    main: { privacy: -24, blastRadius: -22, recovery: -22 },
    guest: { privacy: -18, blastRadius: -16, recovery: -16 },
    iot: { privacy: 10, blastRadius: 12, recovery: 10 },
  },
};

enum ScoreRuleValue { GuestWithTrusted = "guest-with-trusted", CameraOnMain = "camera-on-main", EntertainmentClutter = "entertainment-clutter", SingleZoneDump = "single-zone-dump", WrongZone = "wrong-zone", CriticalZone = "critical-zone" }

const SCORE_DELTAS: Record<ScoreRuleValue, ScoreDelta> = {
  [ScoreRuleValue.GuestWithTrusted]: {
    privacy: -12, blastRadius: -16, recovery: -10,
  },
  [ScoreRuleValue.CameraOnMain]: {
    privacy: -10, blastRadius: -10, recovery: -10,
  },
  [ScoreRuleValue.EntertainmentClutter]: {
    privacy: -4, blastRadius: -8, recovery: -10,
  },
  [ScoreRuleValue.SingleZoneDump]: {
    privacy: -15, blastRadius: -20, recovery: -20,
  },
  [ScoreRuleValue.WrongZone]: {
    privacy: 10, blastRadius: 12, recovery: 14,
  },
  [ScoreRuleValue.CriticalZone]: {
    privacy: 18, blastRadius: 20, recovery: 22,
  },
};

function zero(): ScoreDelta {
  return { privacy: 0, blastRadius: 0, recovery: 0 };
}

function clamp(value: number): number {
  if (value < 0) return 0;
  if (value > MAX_SCORE) return MAX_SCORE;
  return value;
}

function addDelta(a: ScoreDelta, b: ScoreDelta): ScoreDelta {
  return {
    privacy: a.privacy + b.privacy,
    blastRadius: a.blastRadius + b.blastRadius,
    recovery: a.recovery + b.recovery,
  };
}

function scaleDelta(delta: ScoreDelta, count: number): ScoreDelta {
  return {
    privacy: delta.privacy * count,
    blastRadius: delta.blastRadius * count,
    recovery: delta.recovery * count,
  };
}

function idealZoneFor(deviceId: DeviceId): ZoneId {
  return getDevice(deviceId).idealZone;
}

function penaltyForSeverity(severity: PlacementFindingSeverity): ScoreDelta {
  return severity === PlacementFindingSeverityValue.Wrong
    ? SCORE_DELTAS[ScoreRuleValue.WrongZone]
    : SCORE_DELTAS[ScoreRuleValue.CriticalZone];
}

function classifyPlacementSeverity(
  deviceId: DeviceId,
  actualZone: ZoneId,
): PlacementFindingSeverity | null {
  const idealZone = idealZoneFor(deviceId);
  if (actualZone === idealZone) return null;

  if (isTrusted(deviceId)) {
    return actualZone === ZoneIdValue.Guest
      ? PlacementFindingSeverityValue.Wrong
      : PlacementFindingSeverityValue.Critical;
  }

  switch (getDevice(deviceId).category) {
    case DeviceCategoryValue.Guest:
      return actualZone === ZoneIdValue.IoT
        ? PlacementFindingSeverityValue.Wrong
        : PlacementFindingSeverityValue.Critical;
    case DeviceCategoryValue.GrayArea:
    case DeviceCategoryValue.Entertainment:
    case DeviceCategoryValue.Camera:
      return actualZone === ZoneIdValue.Guest
        ? PlacementFindingSeverityValue.Wrong
        : PlacementFindingSeverityValue.Critical;
    default:
      return null;
  }
}

function isEntertainmentDevice(deviceId: DeviceId): boolean {
  return getDevice(deviceId).category === DeviceCategoryValue.Entertainment;
}

function buildPlacementFinding(
  placement: DevicePlacement,
): PlacementFinding | null {
  const severity = classifyPlacementSeverity(
    placement.deviceId,
    placement.zoneId,
  );
  if (!severity) return null;

  return {
    deviceId: placement.deviceId,
    actualZone: placement.zoneId,
    idealZone: idealZoneFor(placement.deviceId),
    severity,
    ceilingPenalty: penaltyForSeverity(severity),
  };
}

export function calculateScore(placements: DevicePlacement[]): ScoreResult {
  let baseDeltas = zero();
  for (const placement of placements) {
    const delta = BASE_MATRIX[placement.deviceId]?.[placement.zoneId];
    if (!delta) continue;
    baseDeltas = addDelta(baseDeltas, delta);
  }

  const appliedCombos: AppliedCombo[] = [];
  let comboDeltas = zero();

  const byZone: Record<ZoneId, DeviceId[]> = {
    [ZoneIdValue.Main]: [],
    [ZoneIdValue.Guest]: [],
    [ZoneIdValue.IoT]: [],
  };
  for (const placement of placements) {
    byZone[placement.zoneId].push(placement.deviceId);
  }

  const mainDevices = byZone[ZoneIdValue.Main];
  const mainHasTrusted = mainDevices.some(isTrusted);
  const mainHasWorkOrPersonal =
    mainDevices.includes(DeviceIdValue.WorkLaptop) ||
    mainDevices.includes(DeviceIdValue.PersonalPhone);

  if (mainDevices.includes(DeviceIdValue.GuestPhone) && mainHasTrusted) {
    const delta = SCORE_DELTAS[ScoreRuleValue.GuestWithTrusted];
    comboDeltas = addDelta(comboDeltas, delta);
    appliedCombos.push({
      id: AppliedComboIdValue.GuestMixedWithTrusted,
      label: "A guest device shares the Main network with personal devices",
      delta,
    });
  }

  if (mainDevices.some(isCamera)) {
    const delta = SCORE_DELTAS[ScoreRuleValue.CameraOnMain];
    comboDeltas = addDelta(comboDeltas, delta);
    appliedCombos.push({
      id: AppliedComboIdValue.CameraOnMain,
      label: "Cameras share the Main network with personal devices",
      delta,
    });
  }

  if (mainHasWorkOrPersonal) {
    const clutterCount = mainDevices.filter(isEntertainmentDevice).length;
    if (clutterCount > 0) {
      const delta = scaleDelta(
        SCORE_DELTAS[ScoreRuleValue.EntertainmentClutter],
        clutterCount,
      );
      comboDeltas = addDelta(comboDeltas, delta);
      appliedCombos.push({
        id: AppliedComboIdValue.EntertainmentClutter,
        label:
          "Entertainment and smart devices share the Main network with personal devices",
        delta,
        count: clutterCount,
      });
    }
  }

  if (placements.length === DEVICES.length) {
    const usedZones = new Set(placements.map((placement) => placement.zoneId));
    if (usedZones.size === 1) {
      const delta = SCORE_DELTAS[ScoreRuleValue.SingleZoneDump];
      comboDeltas = addDelta(comboDeltas, delta);
      appliedCombos.push({
        id: AppliedComboIdValue.SingleZoneDump,
        label: "All devices share one network zone",
        delta,
      });
    }
  }

  const placementFindings = placements
    .map(buildPlacementFinding)
    .filter((finding): finding is PlacementFinding => finding !== null);

  const ceilingPenalty = placementFindings.reduce(
    (sum, finding) => addDelta(sum, finding.ceilingPenalty),
    zero(),
  );

  const rawPrivacy = STARTING_SCORE + baseDeltas.privacy + comboDeltas.privacy;
  const rawBlastRadius =
    STARTING_SCORE + baseDeltas.blastRadius + comboDeltas.blastRadius;
  const rawRecovery =
    STARTING_SCORE + baseDeltas.recovery + comboDeltas.recovery;

  const privacyCeiling = clamp(MAX_SCORE - ceilingPenalty.privacy);
  const blastRadiusCeiling = clamp(MAX_SCORE - ceilingPenalty.blastRadius);
  const recoveryCeiling = clamp(MAX_SCORE - ceilingPenalty.recovery);

  const privacy = clamp(Math.min(rawPrivacy, privacyCeiling));
  const blastRadius = clamp(Math.min(rawBlastRadius, blastRadiusCeiling));
  const recovery = clamp(Math.min(rawRecovery, recoveryCeiling));
  const total = Math.round(
    (privacy + blastRadius + recovery) / SCORE_DIMENSION_COUNT,
  );

  return {
    privacy,
    blastRadius,
    recovery,
    total,
    baseDeltas,
    comboDeltas,
    appliedCombos,
    placementFindings,
  };
}

export const SCORING_INTERNALS = {
  STARTING_SCORE,
  BASE_MATRIX,
};
