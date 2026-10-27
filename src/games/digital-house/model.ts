import {
  BadgeTierValue,
  DifficultyValue,
  type Badge,
  type Difficulty,
} from "../shared/types";
import { DEVICES, type DeviceId, type RoomId, type ZoneId } from "./engine";
import type { ViewportBand } from "./layout";

export type Placement = Readonly<{ roomId: RoomId; zoneId: ZoneId }>;
export type PlacementMap = Record<DeviceId, Placement | null>;

export enum BadgeJustEarnedValue { Rookie = "rookie", Architect = "architect" }

export type BadgeJustEarned = `${BadgeJustEarnedValue}` | null;
export type ScoreAnimationDelta = { key: number; value: number } | null;

export enum ToastTypeValue { Halfway = "halfway", Streak = "streak" }

export type ActiveToast = { key: number; type: `${ToastTypeValue}`; label: string; hint: string } | null;
export type LastPlacement = Readonly<{ deviceId: DeviceId; zoneId: ZoneId; roomId: RoomId }>;
export type ViewportProfile = Readonly<{ width: number; height: number; band: ViewportBand; isCoarsePointer: boolean }>;

export enum CoachPositionValue { Above = "above", Below = "below" }

export type CoachStepConfig = Readonly<{ target: string; heading: string; body: string; position: `${CoachPositionValue}` }>;

const COACH_TARGET = {
  house: "[data-testid='dh-house-panel']",
  inventory: "[data-testid='dh-inventory-panel']",
  score: "[data-testid='dh-score-hud']",
  strip: "[data-testid='dh-device-strip']",
};

export function coachSteps(
  difficulty: Difficulty,
  mobile: boolean,
): CoachStepConfig[] {
  const inventoryTarget = mobile
    ? COACH_TARGET.strip
    : COACH_TARGET.inventory;

  const steps: CoachStepConfig[] = [
    {
      target: COACH_TARGET.house,
      heading: "Build a safer home network",
      body: "Your home network has three zones: Main for personal and work devices, Guest for visitors, and IoT for smart devices. Separating them helps limit unnecessary access.",
      position: CoachPositionValue.Below,
    },
    {
      target: inventoryTarget,
      heading: "Place devices in rooms",
      body: "Drag each device from the inventory into a room. Your score changes based on the network zone assigned to that room.",
      position: mobile ? CoachPositionValue.Above : CoachPositionValue.Below,
    },
    {
      target: COACH_TARGET.score,
      heading: "Understand your score",
      body: "Each placement affects the modeled privacy, impact, and recovery scores. The analysis card explains each result.",
      position: CoachPositionValue.Below,
    },
  ];
  if (difficulty !== DifficultyValue.Easy) {
    steps.push({
      target: COACH_TARGET.house,
      heading: "Assign network zones",
      body: "Some rooms start without a network zone. Before placing devices, use the button in each room to assign Main, Guest, or IoT.",
      position: CoachPositionValue.Below,
    });
  }
  return steps;
}

export type IdleHint = Readonly<{ key: number; message: string }>;

export type ZoneBlockedFeedback = Readonly<{ key: number; roomId: RoomId }>;

export const DIGITAL_HOUSE_GAME_ID = "digital-house";

type DigitalHouseBadge = Badge & Readonly<{ minScore: number }>;

export const DIGITAL_HOUSE_BADGES: Record<BadgeJustEarnedValue, DigitalHouseBadge> = {
  [BadgeJustEarnedValue.Rookie]: {
    id: "home-network-rookie", gameId: DIGITAL_HOUSE_GAME_ID, name: "Home Network Rookie",
    description: "Completed The Digital House exercise",
    tier: BadgeTierValue.Bronze, condition: "Place every device to finish a run", minScore: 40,
  },
  [BadgeJustEarnedValue.Architect]: {
    id: "network-architect", gameId: DIGITAL_HOUSE_GAME_ID, name: "Network Architect",
    description:
      "Completed The Digital House on Hard with a score of 70 or higher",
    tier: BadgeTierValue.Gold, condition: "Finish Hard difficulty with an overall score of 70 or more", minScore: 70,
  },
};

export const ONBOARDING_PREF_KEY = "hide-onboarding";

export const CARD =
  "relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.06),transparent_58%)] shadow-[0_12px_30px_rgba(15,23,42,0.08)] ring-1 ring-white/80 backdrop-blur-md dark:border-slate-700/70 dark:bg-slate-900/95 dark:bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.1),transparent_62%)] dark:shadow-[0_18px_36px_rgba(2,6,23,0.3)] dark:ring-white/5";

export function emptyPlacements(): PlacementMap {
  return DEVICES.reduce((acc, d) => {
    acc[d.id] = null;
    return acc;
  }, {} as PlacementMap);
}

export function nextDifficulty(current: Difficulty): Difficulty {
  if (current === DifficultyValue.Easy) return DifficultyValue.Medium;
  return DifficultyValue.Hard;
}
