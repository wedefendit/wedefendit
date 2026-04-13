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

import type { Badge, Difficulty } from "../shared/types";
import { DEVICES, type DeviceId, type RoomId, type ZoneId } from "./engine";
import type { ViewportBand } from "./layout";

export type Placement = Readonly<{ roomId: RoomId; zoneId: ZoneId }>;
export type PlacementMap = Record<DeviceId, Placement | null>;
export type BadgeJustEarned = "rookie" | "architect" | null;
export type ScoreDelta = { key: number; value: number } | null;
export type ActiveToast =
  | {
      key: number;
      type: "halfway" | "streak";
      label: string;
      hint: string;
    }
  | null;
export type LastPlacement = Readonly<{
  deviceId: DeviceId;
  zoneId: ZoneId;
  roomId: RoomId;
}>;
export type ViewportProfile = Readonly<{
  width: number;
  height: number;
  band: ViewportBand;
  isCoarsePointer: boolean;
}>;

export const HOME_NETWORK_ROOKIE: Badge = {
  id: "home-network-rookie",
  gameId: "digital-house",
  name: "Home Network Rookie",
  description: "Completed The Digital House",
  tier: "bronze",
  condition: "Place every device to finish a run",
};

export const NETWORK_ARCHITECT: Badge = {
  id: "network-architect",
  gameId: "digital-house",
  name: "Network Architect",
  description: "Completed The Digital House on Hard with a score of 70+",
  tier: "gold",
  condition: "Finish Hard difficulty with an overall score of 70 or more",
};

export const DIGITAL_HOUSE_GAME_ID = "digital-house";
export const HELP_PREF_KEY = "hide-help-modal";

export const TRAY_NAME: Record<DeviceId, string> = {
  "work-laptop": "Work Laptop",
  "personal-phone": "Phone",
  tablet: "Tablet",
  "guest-phone": "Guest Phone",
  printer: "Printer",
  "smart-tv": "Smart TV",
  "smart-speaker": "Speaker",
  "game-console": "Console",
  "doorbell-camera": "Doorbell",
  "camera-hub": "Cameras",
};

export const TOOLBAR_LABEL: Record<DeviceId, string> = {
  "work-laptop": "Laptop",
  "personal-phone": "Phone",
  tablet: "Tab",
  "guest-phone": "Guest",
  printer: "Print",
  "smart-tv": "TV",
  "smart-speaker": "Spkr",
  "game-console": "Game",
  "doorbell-camera": "Bell",
  "camera-hub": "Cam",
};

export const RISKY_DEVICE_IDS = new Set<DeviceId>([
  "guest-phone",
  "smart-tv",
  "smart-speaker",
  "game-console",
  "doorbell-camera",
  "camera-hub",
]);
export const TRUSTED_DEVICE_IDS = new Set<DeviceId>([
  "work-laptop",
  "personal-phone",
  "tablet",
]);

export const CARD =
  "relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.06),transparent_58%)] shadow-[0_12px_30px_rgba(15,23,42,0.08)] ring-1 ring-white/80 backdrop-blur-md dark:border-slate-700/70 dark:bg-slate-900/95 dark:bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.1),transparent_62%)] dark:shadow-[0_18px_36px_rgba(2,6,23,0.3)] dark:ring-white/5";

export function emptyPlacements(): PlacementMap {
  return DEVICES.reduce((acc, d) => {
    acc[d.id] = null;
    return acc;
  }, {} as PlacementMap);
}

export function nextDifficulty(current: Difficulty): Difficulty {
  if (current === "easy") return "medium";
  if (current === "medium") return "hard";
  return "hard";
}
