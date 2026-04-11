/*
Copyright © 2025 Defend I.T. Solutions LLC. All Rights Reserved.

This software and its source code are the proprietary property of
Defend I.T. Solutions LLC and are protected by United States and
international copyright laws. Unauthorized reproduction, distribution,
modification, display, or use of this software, in whole or in part, without the
prior written permission of Defend I.T. Solutions LLC, is strictly prohibited.

This software is provided for use only by authorized employees, contractors, or
licensees of Defend I.T. Solutions LLC and may not be disclosed to any third
party without express written consent.
*/

import {
  DEVICES,
  ENTERTAINMENT_AND_CAMERA_IDS,
  isCamera,
  isTrusted,
  type DeviceId,
} from "./devices";
import type { ZoneId } from "./zones";

/**
 * Score deltas in the format specified by digital_house_v_1_spec.md §13:
 * `Privacy / Blast Radius / Recovery Difficulty`.
 */
export type ScoreDelta = {
  privacy: number;
  blastRadius: number;
  recovery: number;
};

export type DevicePlacement = {
  deviceId: DeviceId;
  zoneId: ZoneId;
};

export type ScoreResult = {
  privacy: number;
  blastRadius: number;
  recovery: number;
  total: number;
  baseDeltas: ScoreDelta;
  comboDeltas: ScoreDelta;
  appliedCombos: AppliedCombo[];
};

export type AppliedCombo = {
  id: "guest-mixed-with-trusted" | "camera-on-main" | "entertainment-clutter" | "single-zone-dump";
  label: string;
  delta: ScoreDelta;
  count?: number;
};

const STARTING_SCORE = 50;

/**
 * §13 — Base score matrix, transcribed exactly.
 *
 * Each entry is the Privacy / Blast Radius / Recovery Difficulty tuple for
 * that device in that zone.
 */
const BASE_MATRIX: Record<DeviceId, Record<ZoneId, ScoreDelta>> = {
  // --- Trusted devices ---
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

  // --- Guest device ---
  "guest-phone": {
    main: { privacy: -24, blastRadius: -22, recovery: -18 },
    guest: { privacy: 8, blastRadius: 10, recovery: 8 },
    iot: { privacy: -6, blastRadius: -4, recovery: -4 },
  },

  // --- Gray-area device ---
  printer: {
    main: { privacy: -2, blastRadius: -4, recovery: -6 },
    guest: { privacy: -10, blastRadius: -10, recovery: -8 },
    iot: { privacy: 2, blastRadius: 4, recovery: 2 },
  },

  // --- Entertainment / smart devices ---
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

  // --- Cameras ---
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

/**
 * §14 — Combo penalty constants. Applied on top of the base matrix.
 */
const COMBO_A_GUEST_WITH_TRUSTED: ScoreDelta = {
  privacy: -12,
  blastRadius: -16,
  recovery: -10,
};

const COMBO_B_CAMERA_ON_MAIN: ScoreDelta = {
  privacy: -10,
  blastRadius: -10,
  recovery: -10,
};

/**
 * Per-device penalty applied once for EACH entertainment / smart / camera
 * device on Main while a Work laptop or Personal phone is also on Main.
 */
const COMBO_C_ENTERTAINMENT_CLUTTER_PER_DEVICE: ScoreDelta = {
  privacy: -4,
  blastRadius: -8,
  recovery: -10,
};

const COMBO_D_SINGLE_ZONE_DUMP: ScoreDelta = {
  privacy: -15,
  blastRadius: -20,
  recovery: -20,
};

function addDelta(a: ScoreDelta, b: ScoreDelta): ScoreDelta {
  return {
    privacy: a.privacy + b.privacy,
    blastRadius: a.blastRadius + b.blastRadius,
    recovery: a.recovery + b.recovery,
  };
}

function clamp(value: number): number {
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

function zero(): ScoreDelta {
  return { privacy: 0, blastRadius: 0, recovery: 0 };
}

/**
 * Pure scoring function. Zero rendering dependencies. Future WASM swap target.
 *
 * Returns the three meter values clamped to [0, 100], a total (average of the
 * three), and an audit trail of the base + combo deltas and which combo
 * penalties fired.
 */
export function calculateScore(placements: DevicePlacement[]): ScoreResult {
  // ---- Base matrix ----
  let baseDeltas = zero();
  for (const p of placements) {
    const row = BASE_MATRIX[p.deviceId];
    if (!row) continue;
    const delta = row[p.zoneId];
    if (!delta) continue;
    baseDeltas = addDelta(baseDeltas, delta);
  }

  // ---- Combo penalties (§14) ----
  const appliedCombos: AppliedCombo[] = [];
  let comboDeltas = zero();

  const byZone: Record<ZoneId, DeviceId[]> = { main: [], guest: [], iot: [] };
  for (const p of placements) {
    byZone[p.zoneId].push(p.deviceId);
  }
  const mainDevices = byZone.main;

  const mainHasTrusted = mainDevices.some(isTrusted);
  const mainHasWorkOrPersonal =
    mainDevices.includes("work-laptop") || mainDevices.includes("personal-phone");

  // A. Guest phone on Main, with any trusted device also on Main.
  if (mainDevices.includes("guest-phone") && mainHasTrusted) {
    comboDeltas = addDelta(comboDeltas, COMBO_A_GUEST_WITH_TRUSTED);
    appliedCombos.push({
      id: "guest-mixed-with-trusted",
      label: "Guest device sharing trust with your daily-use devices",
      delta: COMBO_A_GUEST_WITH_TRUSTED,
    });
  }

  // B. Any camera on Main (doorbell OR camera hub).
  if (mainDevices.some(isCamera)) {
    comboDeltas = addDelta(comboDeltas, COMBO_B_CAMERA_ON_MAIN);
    appliedCombos.push({
      id: "camera-on-main",
      label: "Camera devices placed inside your main network",
      delta: COMBO_B_CAMERA_ON_MAIN,
    });
  }

  // C. For EACH entertainment / smart device on Main, while Work laptop or
  //    Personal phone is also on Main.
  if (mainHasWorkOrPersonal) {
    const clutterCount = mainDevices.filter((id) =>
      ENTERTAINMENT_AND_CAMERA_IDS.includes(id),
    ).length;
    if (clutterCount > 0) {
      const scaled: ScoreDelta = {
        privacy: COMBO_C_ENTERTAINMENT_CLUTTER_PER_DEVICE.privacy * clutterCount,
        blastRadius:
          COMBO_C_ENTERTAINMENT_CLUTTER_PER_DEVICE.blastRadius * clutterCount,
        recovery: COMBO_C_ENTERTAINMENT_CLUTTER_PER_DEVICE.recovery * clutterCount,
      };
      comboDeltas = addDelta(comboDeltas, scaled);
      appliedCombos.push({
        id: "entertainment-clutter",
        label:
          "Entertainment and smart devices sitting next to your work or personal devices",
        delta: scaled,
        count: clutterCount,
      });
    }
  }

  // D. All devices placed into one zone (only meaningful once every device is
  //    placed — otherwise early placements would always look like "dump all").
  const totalDevices = DEVICES.length;
  if (placements.length === totalDevices) {
    const usedZones = new Set(placements.map((p) => p.zoneId));
    if (usedZones.size === 1) {
      comboDeltas = addDelta(comboDeltas, COMBO_D_SINGLE_ZONE_DUMP);
      appliedCombos.push({
        id: "single-zone-dump",
        label: "Every device dumped into the same zone",
        delta: COMBO_D_SINGLE_ZONE_DUMP,
      });
    }
  }

  // ---- Assemble, clamp, return ----
  const privacy = clamp(STARTING_SCORE + baseDeltas.privacy + comboDeltas.privacy);
  const blastRadius = clamp(
    STARTING_SCORE + baseDeltas.blastRadius + comboDeltas.blastRadius,
  );
  const recovery = clamp(
    STARTING_SCORE + baseDeltas.recovery + comboDeltas.recovery,
  );
  const total = Math.round((privacy + blastRadius + recovery) / 3);

  return {
    privacy,
    blastRadius,
    recovery,
    total,
    baseDeltas,
    comboDeltas,
    appliedCombos,
  };
}

export const SCORING_INTERNALS = {
  STARTING_SCORE,
  BASE_MATRIX,
  COMBO_A_GUEST_WITH_TRUSTED,
  COMBO_B_CAMERA_ON_MAIN,
  COMBO_C_ENTERTAINMENT_CLUTTER_PER_DEVICE,
  COMBO_D_SINGLE_ZONE_DUMP,
};
