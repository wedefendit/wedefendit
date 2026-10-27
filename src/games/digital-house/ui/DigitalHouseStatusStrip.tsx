import { DEVICE_TIPS } from "../content/deviceTips";
import type { Difficulty } from "../../shared/types";
import {
  DEVICES,
  DeviceCategoryValue,
  SCORING_INTERNALS,
  type DeviceId,
  type ScoreResult,
  type ZoneId,
} from "../engine";
import type { LastPlacement, ScoreAnimationDelta } from "../model";
import { DeviceIcon } from "./DeviceIcon";
import { buildOpenRiskItems } from "../summary";
import { DeltaFloater } from "./DeltaFloater";
import { ScoreRingBar } from "./ScoreRingBar";

enum ToneValue { Good = "good", Bad = "bad", Neutral = "neutral" }
type Tone = `${ToneValue}`;

const ANALYSIS_TEST_ID = "dh-analysis-card";
const ANALYSIS_ANIMATION = "dh-slideIn 0.3s ease";
const DESKTOP_ROW_CLASS = "flex items-start gap-3";
const MOBILE_ROW_CLASS = "flex flex-col gap-0.5";
const DESKTOP_TEXT_CLASS = "min-w-0 flex-1";
const MOBILE_TEXT_CLASS = "min-w-0";
const TITLE_CLASS = "flex items-center gap-1.5";
const PLACEMENT_CARD_CLASS =
  "ring-1 ring-white/80 dark:ring-white/5 shadow-[0_4px_12px_rgba(15,23,42,0.06)]";
const SELECTED_CARD_CLASS =
  "border-sky-200/60 ring-1 ring-sky-100/40 shadow-[0_4px_12px_rgba(56,189,248,0.08)] dark:border-sky-400/20 dark:ring-sky-500/10";
const SELECTED_LABEL_CLASS =
  "text-[10px] font-black uppercase tracking-[0.12em] text-sky-700 dark:text-sky-300";
const EMPTY_CARD_CLASS =
  "border-slate-200/70 ring-1 ring-white/70 shadow-[0_4px_12px_rgba(15,23,42,0.04)] dark:border-slate-700/60 dark:ring-white/5";

function placementTone(did: DeviceId, zid: ZoneId): Tone {
  const d = SCORING_INTERNALS.BASE_MATRIX[did]?.[zid];
  if (!d) return ToneValue.Neutral;
  if (d.privacy >= 6) return ToneValue.Good;
  if (d.privacy <= -6) return ToneValue.Bad;
  return ToneValue.Neutral;
}
const TS: Record<Tone, { border: string; dot: string; hl: string }> = {
  [ToneValue.Good]: {
    border: "border-emerald-300/70 dark:border-emerald-400/25", dot: "bg-emerald-400", hl: "text-emerald-700 dark:text-emerald-300",
  },
  [ToneValue.Bad]: {
    border: "border-rose-300/70 dark:border-rose-400/25", dot: "bg-rose-400", hl: "text-rose-700 dark:text-rose-300",
  },
  [ToneValue.Neutral]: {
    border: "border-slate-200/80 dark:border-slate-700/70", dot: "bg-sky-400", hl: "text-sky-700 dark:text-sky-300",
  },
};

export type SelectedDeviceInfo = { id: DeviceId; name: string; description: string } | null;
type AnalysisStripProps = Readonly<{ lastPlacement: LastPlacement | null; selectedDevice: SelectedDeviceInfo; result: ScoreResult; desktop?: boolean }>;

export function AnalysisStrip(props: AnalysisStripProps) {
  const { lastPlacement, selectedDevice, desktop = false } = props;
  const base = `dh-analysis-card relative rounded-xl border border-slate-200/80 bg-white/60 backdrop-blur-md dark:border-slate-700/60 transition-all duration-300 dark:bg-slate-900/50 ${desktop ? "min-h-[68px] rounded-2xl px-5 py-4" : "min-h-[40px] px-3 py-1"}`;
  if (lastPlacement) {
    return <PlacementAnalysis base={base} desktop={desktop} placement={lastPlacement} />;
  }
  if (selectedDevice) {
    return <SelectedAnalysis base={base} desktop={desktop} info={selectedDevice} />;
  }
  return <EmptyAnalysis base={base} desktop={desktop} />;
}

type PlacementAnalysisProps = Readonly<{ base: string; desktop: boolean; placement: LastPlacement }>;

function PlacementAnalysis({ base, desktop, placement }: PlacementAnalysisProps) {
  const device = DEVICES.find((candidate) => candidate.id === placement.deviceId);
  if (!device) return null;
  const tip = DEVICE_TIPS[placement.deviceId][placement.zoneId];
  const style = TS[placementTone(placement.deviceId, placement.zoneId)];
  return (
    <div
      data-testid={ANALYSIS_TEST_ID}
      key={`${placement.deviceId}-${placement.roomId}`}
      style={{ animation: ANALYSIS_ANIMATION }}
      className={`${base} ${style.border} ${PLACEMENT_CARD_CLASS} ${desktop ? "bg-white/95 dark:bg-slate-900/95" : ""}`}
    >
      <div className={desktop ? DESKTOP_ROW_CLASS : MOBILE_ROW_CLASS}>
        {desktop ? <DeviceIcon deviceId={device.id} category={device.category} size="md" /> : null}
        <div className={desktop ? DESKTOP_TEXT_CLASS : MOBILE_TEXT_CLASS}>
          <PlacementTitle desktop={desktop} deviceName={device.name} style={style} />
          <span
            className={
              desktop
                ? "mt-1 text-[13px] leading-snug text-slate-700 dark:text-slate-200"
                : "mt-0.5 block text-[11px] leading-snug text-slate-700 dark:text-slate-200"
            }
          >
            {tip}
          </span>
        </div>
      </div>
    </div>
  );
}

type PlacementTitleProps = Readonly<{ desktop: boolean; deviceName: string; style: { dot: string; hl: string } }>;

function PlacementTitle({ desktop, deviceName, style }: PlacementTitleProps) {
  if (desktop) {
    return (
      <>
        <div className={TITLE_CLASS}>
          <span aria-hidden className={`inline-block h-1.5 w-1.5 rounded-full ${style.dot}`} />
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            Live Analysis
          </span>
        </div>
        <span className={`mt-1 block shrink-0 text-[11px] font-black uppercase tracking-[0.12em] ${style.hl}`}>
          {deviceName}
        </span>
      </>
    );
  }
  return (
    <div className={TITLE_CLASS}>
      <span aria-hidden className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`} />
      <span className={`text-[10px] font-black uppercase tracking-[0.12em] ${style.hl}`}>
        {deviceName}
      </span>
    </div>
  );
}

type SelectedAnalysisProps = Readonly<{ base: string; desktop: boolean; info: NonNullable<SelectedDeviceInfo> }>;

function SelectedAnalysis({ base, desktop, info }: SelectedAnalysisProps) {
  const category =
    DEVICES.find((device) => device.id === info.id)?.category ??
    DeviceCategoryValue.Trusted;
  return (
    <div
      data-testid={ANALYSIS_TEST_ID}
      key={`info-${info.id}`}
      style={{ animation: ANALYSIS_ANIMATION }}
      className={`${base} ${SELECTED_CARD_CLASS}`}
    >
      <div className={desktop ? DESKTOP_ROW_CLASS : MOBILE_ROW_CLASS}>
        {desktop ? <DeviceIcon deviceId={info.id} category={category} size="md" /> : null}
        <div className={desktop ? DESKTOP_TEXT_CLASS : MOBILE_TEXT_CLASS}>
          <span className={`${SELECTED_LABEL_CLASS} ${desktop ? "block text-[11px]" : ""}`}>
            {info.name}
          </span>
          <span
            className={
              desktop
                ? "mt-1 text-[13px] leading-snug text-slate-600 dark:text-slate-300"
                : "mt-0.5 block text-[11px] leading-snug text-slate-600 dark:text-slate-300"
            }
          >
            {info.description}
          </span>
        </div>
      </div>
    </div>
  );
}

function EmptyAnalysis({ base, desktop }: Readonly<{ base: string; desktop: boolean }>) {
  return (
    <div data-testid={ANALYSIS_TEST_ID} className={`${base} ${EMPTY_CARD_CLASS}`}>
      <div
        className={
          desktop
            ? "grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3"
            : "flex h-full items-center gap-2"
        }
      >
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
          <span className="shrink-0 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.12em] text-sky-700 dark:text-sky-300">
            Live Analysis
          </span>
        </span>
        <span className="min-w-0 text-[11px] leading-snug text-slate-500 dark:text-slate-400">
          Place a device in a room to begin
        </span>
      </div>
    </div>
  );
}

export type DigitalHouseScoreHudProps = Readonly<{ result: ScoreResult; placedCount: number; totalDevices: number; mobile: boolean; difficulty: Difficulty; scoreDelta: ScoreAnimationDelta }>;

export function DigitalHouseScoreHud({
  result,
  placedCount,
  totalDevices,
  mobile,
  difficulty,
  scoreDelta,
}: DigitalHouseScoreHudProps) {
  return (
    <div className="dh-score-slot relative z-20 w-full shrink-0">
      <ScoreRingBar
        privacy={result.privacy}
        blastRadius={result.blastRadius}
        recovery={result.recovery}
        overall={result.total}
        placedCount={placedCount}
        totalDevices={totalDevices}
        mobile={mobile}
        compact
        riskItems={buildOpenRiskItems(result, difficulty)}
      />
      <DeltaFloater delta={scoreDelta} />
    </div>
  );
}

export type DigitalHouseAnalysisCardProps = Readonly<{ lastPlacement: LastPlacement | null; selectedDevice: SelectedDeviceInfo; result: ScoreResult; desktop?: boolean }>;

export function DigitalHouseAnalysisCard(props: DigitalHouseAnalysisCardProps) {
  return (
    <div className="w-full shrink-0">
      <AnalysisStrip {...props} />
    </div>
  );
}
