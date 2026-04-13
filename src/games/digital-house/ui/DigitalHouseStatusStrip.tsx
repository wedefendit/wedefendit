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

import { DEVICE_TIPS } from "../content/deviceTips";
import type { Difficulty } from "../../shared/types";
import { DEVICES, SCORING_INTERNALS, getRoom, type DeviceId, type RoomId, type ScoreResult, type ZoneId } from "../engine";
import type { LastPlacement, ScoreDelta } from "../model";
import { DeviceIcon } from "./DeviceIcon";
import { buildOpenRiskItems } from "../summary";
import { DeltaFloater } from "./DeltaFloater";
import { ScoreRingBar } from "./ScoreRingBar";

type AnalysisTone = "good" | "bad" | "neutral";

function placementTone(deviceId: DeviceId, zoneId: ZoneId): AnalysisTone {
  const delta = SCORING_INTERNALS.BASE_MATRIX[deviceId]?.[zoneId];
  if (!delta) return "neutral";
  if (delta.privacy >= 6) return "good";
  if (delta.privacy <= -6) return "bad";
  return "neutral";
}

const TONE_STYLES: Record<
  AnalysisTone,
  { border: string; dot: string; headline: string }
> = {
  good: {
    border:
      "border-emerald-300/70 ring-emerald-200/40 dark:border-emerald-400/25 dark:ring-emerald-500/15",
    dot: "bg-emerald-400",
    headline: "text-emerald-700 dark:text-emerald-300",
  },
  bad: {
    border:
      "border-rose-300/70 ring-rose-200/40 dark:border-rose-400/25 dark:ring-rose-500/15",
    dot: "bg-rose-400",
    headline: "text-rose-700 dark:text-rose-300",
  },
  neutral: {
    border:
      "border-slate-200/80 ring-white/70 dark:border-slate-700/70 dark:ring-white/5",
    dot: "bg-sky-400",
    headline: "text-sky-700 dark:text-sky-300",
  },
};

type AnalysisToastProps = Readonly<{
  lastPlacement: { deviceId: DeviceId; zoneId: ZoneId; roomId: RoomId } | null;
  result: ScoreResult;
  /** Compact = 1-2 line strip for tight sidebars + mobile bottom. */
  compact?: boolean;
}>;

function AnalysisToast({
  lastPlacement,
  result: _result,
  compact = false,
}: AnalysisToastProps) {
  if (!lastPlacement) {
    return (
      <div
        data-testid="dh-analysis-card"
        className={[
          "dh-analysis-card relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/60 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.04),transparent_58%)] text-slate-600 shadow-[0_10px_24px_rgba(15,23,42,0.06)] ring-1 ring-white/70 backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-900/50 dark:bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.07),transparent_62%)] dark:text-slate-300 dark:shadow-[0_14px_28px_rgba(2,6,23,0.28)] dark:ring-white/5",
          compact
            ? "min-h-12 px-3.5 py-2.5 min-[820px]:min-h-[68px] min-[820px]:px-5 min-[820px]:py-4"
            : "px-4 py-3",
        ].join(" ")}
      >
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2.5 min-[820px]:gap-3">
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400"
            />
            <span className="shrink-0 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.12em] text-sky-700 min-[820px]:text-[11px] dark:text-sky-300">
              Live Analysis
            </span>
          </span>
          <span
            className="min-w-0 text-[12px] leading-snug text-slate-600 min-[820px]:text-[15px] xl:text-[14px] dark:text-slate-300"
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: compact ? 2 : 3,
            }}
          >
            Pick a device to begin.
          </span>
        </div>
      </div>
    );
  }
  const device = DEVICES.find((d) => d.id === lastPlacement.deviceId);
  const room = getRoom(lastPlacement.roomId);
  const tip = DEVICE_TIPS[lastPlacement.deviceId][lastPlacement.zoneId];
  if (!device || !room) return null;
  const headerLabel = `${device.name} -> ${room.name}`;
  const tone = placementTone(lastPlacement.deviceId, lastPlacement.zoneId);
  const toneStyles = TONE_STYLES[tone];
  if (compact) {
    return (
      <div
        data-testid="dh-analysis-card"
        key={`${lastPlacement.deviceId}-${lastPlacement.roomId}`}
        style={{ animation: "dh-slideIn 0.3s ease" }}
        className={[
          "dh-analysis-card relative min-h-12 overflow-hidden rounded-2xl border bg-white/95 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.06),transparent_58%)] px-3.5 py-2.5 shadow-[0_10px_22px_rgba(15,23,42,0.08)] ring-1 backdrop-blur-md min-[820px]:min-h-[68px] min-[820px]:px-5 min-[820px]:py-4 dark:bg-slate-900/95 dark:bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.1),transparent_62%)] dark:shadow-[0_14px_28px_rgba(2,6,23,0.3)]",
          toneStyles.border,
        ].join(" ")}
      >
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2.5 min-[820px]:gap-3">
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden
              className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full min-[820px]:h-2 min-[820px]:w-2 ${toneStyles.dot}`}
            />
            <span
              className={`max-w-[8rem] shrink-0 truncate text-[10px] font-black uppercase tracking-[0.12em] min-[820px]:text-[11px] ${toneStyles.headline}`}
            >
              {device.name}
            </span>
          </span>
          <span
            className="min-w-0 text-[12px] leading-snug text-slate-700 min-[820px]:text-[15px] xl:text-[14px] dark:text-slate-200"
          >
            {tip}
          </span>
        </div>
      </div>
    );
  }
  return (
    <div
      key={`${lastPlacement.deviceId}-${lastPlacement.roomId}`}
      style={{ animation: "dh-slideIn 0.3s ease" }}
      className={[
        "relative overflow-hidden rounded-2xl border bg-white/75 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.05),transparent_58%)] px-4 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.08)] ring-1 backdrop-blur-md dark:bg-slate-900/62 dark:bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.09),transparent_62%)] dark:shadow-[0_16px_32px_rgba(2,6,23,0.3)]",
        toneStyles.border,
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <DeviceIcon
          deviceId={device.id}
          category={device.category}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span
              aria-hidden
              className={`inline-block h-1.5 w-1.5 rounded-full ${toneStyles.dot}`}
            />
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Live Analysis
            </span>
          </div>
          <div
            className={`mt-1 text-[11px] font-bold uppercase tracking-wider ${toneStyles.headline}`}
          >
            {headerLabel}
          </div>
          <div className="mt-1 text-[13px] leading-snug text-slate-700 dark:text-slate-200">
            {tip}
          </div>
        </div>
      </div>
    </div>
  );
}

export type DigitalHouseScoreHudProps = Readonly<{
  result: ScoreResult;
  placedCount: number;
  totalDevices: number;
  mobile: boolean;
  difficulty: Difficulty;
  scoreDelta: ScoreDelta;
}>;

export function DigitalHouseScoreHud({
  result,
  placedCount,
  totalDevices,
  mobile,
  difficulty,
  scoreDelta,
}: DigitalHouseScoreHudProps) {
  const openRisks = buildOpenRiskItems(result, difficulty);

  return (
    <div className="dh-score-slot relative w-full shrink-0">
      <ScoreRingBar
        privacy={result.privacy}
        blastRadius={result.blastRadius}
        recovery={result.recovery}
        overall={result.total}
        placedCount={placedCount}
        totalDevices={totalDevices}
        mobile={mobile}
        compact
        riskItems={openRisks}
      />
      <DeltaFloater delta={scoreDelta} />
    </div>
  );
}

export type DigitalHouseAnalysisCardProps = Readonly<{
  lastPlacement: LastPlacement | null;
  result: ScoreResult;
  compact?: boolean;
}>;

export function DigitalHouseAnalysisCard(props: DigitalHouseAnalysisCardProps) {
  return (
    <div className="w-full shrink-0">
      <AnalysisToast {...props} />
    </div>
  );
}
