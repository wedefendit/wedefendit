import { useEffect, useId, useRef, useState } from "react";
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { useAnimatedNumber } from "../hooks/useAnimatedNumber";
import type { OpenRiskItem } from "../summary";

const SKY_LIGHT = "#38bdf8";
const SKY_DARK = "#0284c7";
const AMBER = "#f59e0b";
const ROSE = "#ef4444";
const HEALTHY_SCORE_MIN = 40;
const CAUTIOUS_SCORE_MIN = 25;
const MOBILE_OVERALL_FONT_SIZE = 22;
const RISK_BADGE_ICON_SIZE = 10;
const RISK_HEADING_ICON_SIZE = 11;
const RING_STROKE_WIDTH = 5;
const RING_TEXT_ROTATION = 90;
const RING_TEXT_SCALE = 0.3;
const RING_TEXT_WEIGHT = 800;
const FULL_PERCENT = "100%";
const PERCENT_SCALE = Number.parseFloat(FULL_PERCENT);
const NO_FILL = "none";
const MONOSPACE_FONT = "ui-monospace, SFMono-Regular, Menlo, monospace";
const CENTER_GAP_CLASS = "flex items-center gap-2";
const OVERALL_SCORE_STYLE: CSSProperties = {
  fontWeight: 900,
  letterSpacing: "-0.03em",
  transition: "color 0.4s ease",
};

enum ScoreTier { Healthy = "healthy", Cautious = "cautious", Critical = "critical" }

const TIER_TEXT_COLOR: Record<ScoreTier, string> = {
  [ScoreTier.Healthy]: SKY_LIGHT,
  [ScoreTier.Cautious]: AMBER,
  [ScoreTier.Critical]: ROSE,
};
const TIER_BAR_GRADIENT: Record<ScoreTier, string> = {
  [ScoreTier.Healthy]: "from-sky-400 to-sky-600",
  [ScoreTier.Cautious]: "from-amber-400 to-amber-500",
  [ScoreTier.Critical]: "from-rose-400 to-rose-500",
};

function tierFor(value: number): ScoreTier {
  if (value >= HEALTHY_SCORE_MIN) return ScoreTier.Healthy;
  if (value >= CAUTIOUS_SCORE_MIN) return ScoreTier.Cautious;
  return ScoreTier.Critical;
}

function tierTextColor(tier: ScoreTier) {
  return TIER_TEXT_COLOR[tier];
}

function tierBarGrad(tier: ScoreTier) {
  return TIER_BAR_GRADIENT[tier];
}

function RiskButton(
  props: Readonly<ButtonHTMLAttributes<HTMLButtonElement>>,
) {
  return <button type="button" {...props} />;
}

function ScoreHudFrame({
  className,
  children,
}: Readonly<{ className: string; children: ReactNode }>) {
  return (
    <div
      data-testid="dh-score-hud"
      style={{ animation: "dh-borderPulse 0.9s ease-out" }}
      className={className}
    >
      {children}
    </div>
  );
}

function PlacementProgress({
  className,
  placedCount,
  totalDevices,
}: Readonly<{
  className: string;
  placedCount: number;
  totalDevices: number;
}>) {
  const percent = Math.round((placedCount / totalDevices) * PERCENT_SCALE);
  return (
    <>
      <div className={className} aria-hidden>
        <div
          className="h-full rounded-full bg-linear-to-r from-sky-400 to-sky-600"
          style={{
            width: `${percent}%`,
            transition: "width 0.45s cubic-bezier(0.22,1,0.36,1)",
          }}
        />
      </div>
      <progress
        className="sr-only"
        value={placedCount}
        max={totalDevices}
        aria-label="Devices placed"
      />
    </>
  );
}

function tierStroke(tier: ScoreTier, gradientId: string): string {
  if (tier === ScoreTier.Healthy) return `url(#${gradientId})`;
  if (tier === ScoreTier.Cautious) return AMBER;
  return ROSE;
}

type ScoreRingBarProps = Readonly<{
  privacy: number;
  blastRadius: number;
  recovery: number;
  overall: number;
  placedCount: number;
  totalDevices: number;
  mobile: boolean;
  compact?: boolean;
  riskItems?: ReadonlyArray<OpenRiskItem>;
}>;

export function ScoreRingBar({
  privacy,
  blastRadius,
  recovery,
  overall,
  placedCount,
  totalDevices,
  mobile,
  compact = false,
  riskItems = [],
}: ScoreRingBarProps) {
  const overallAnim = useAnimatedNumber(overall);
  const overallTier = tierFor(overallAnim);
  const overallColor = tierTextColor(overallTier);
  const [pulseKey, setPulseKey] = useState(0);
  const prevRef = useRef(overall);
  useEffect(() => {
    if (prevRef.current !== overall) {
      prevRef.current = overall;
      setPulseKey((k) => k + 1);
    }
  }, [overall]);
  const [riskOpen, setRiskOpen] = useState(false);
  const visibleRiskOpen = riskOpen && riskItems.length > 0;
  const popRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!visibleRiskOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!popRef.current?.contains(e.target as Node)) setRiskOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setRiskOpen(false);
    };
    const listener = new AbortController();
    globalThis.addEventListener("mousedown", onDown, {
      signal: listener.signal,
    });
    globalThis.addEventListener("keydown", onKey, { signal: listener.signal });
    return () => listener.abort();
  }, [visibleRiskOpen]);

  if (compact && mobile) {
    return (
      <ScoreHudFrame
        key={pulseKey}
        className="relative overflow-visible rounded-xl border border-slate-200/80 bg-white/72 px-2.5 py-1.5 shadow-[0_4px_12px_rgba(15,23,42,0.06)] ring-1 ring-white/70 backdrop-blur-md dark:border-slate-700/70 dark:bg-slate-900/58 dark:shadow-[0_8px_20px_rgba(2,6,23,0.25)] dark:ring-white/5"
      >
        <div className={CENTER_GAP_CLASS}>
          <div
            className="shrink-0 font-mono leading-none"
            style={{
              ...OVERALL_SCORE_STYLE,
              fontSize: MOBILE_OVERALL_FONT_SIZE,
              color: overallColor,
            }}
          >
            {overallAnim}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <MiniBar label="P" value={privacy} />
            <MiniBar label="I" value={blastRadius} />
            <MiniBar label="R" value={recovery} />
          </div>
          <div className="shrink-0 text-[10px] font-bold tabular-nums text-slate-500 dark:text-slate-400">
            {placedCount}/{totalDevices}
          </div>
          {riskItems.length > 0 && (
            <RiskBadge
              count={riskItems.length}
              items={riskItems}
              open={visibleRiskOpen}
              onToggle={() => setRiskOpen((v) => !v)}
              popRef={popRef}
            />
          )}
        </div>
        <PlacementProgress
          className="mt-1 h-0.5 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-800/80"
          placedCount={placedCount}
          totalDevices={totalDevices}
        />
      </ScoreHudFrame>
    );
  }

  const ringSize = compact ? 40 : 70;
  const overallFont = compact ? 34 : 44;
  return (
    <ScoreHudFrame
      key={pulseKey}
      className="relative overflow-visible rounded-2xl border border-slate-200/80 bg-white/72 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.05),transparent_58%)] shadow-[0_12px_30px_rgba(15,23,42,0.08)] ring-1 ring-white/70 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/58 dark:bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.09),transparent_62%)] dark:shadow-[0_18px_36px_rgba(2,6,23,0.3)] dark:ring-0"
    >
      <div className={compact ? "px-4 py-3" : "px-4 py-3 sm:px-5 sm:py-4"}>
        <div
          className={
            compact
              ? "mb-3 flex items-center justify-between gap-2"
              : "mb-2 flex items-center justify-between gap-2"
          }
        >
          <span
            className={
              compact
                ? "text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400"
                : "text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400"
            }
          >
            Network Scores
          </span>
          <div className={CENTER_GAP_CLASS}>
            <span
              className={
                compact
                  ? "text-[12px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                  : "text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              }
            >
              {placedCount}/{totalDevices} placed
            </span>
            {riskItems.length > 0 && (
              <RiskBadge
                count={riskItems.length}
                items={riskItems}
                open={visibleRiskOpen}
                onToggle={() => setRiskOpen((v) => !v)}
                popRef={popRef}
              />
            )}
          </div>
        </div>
        <div
          className={
            compact
              ? "grid min-w-0 grid-cols-[minmax(0,1fr)_92px] items-center gap-4"
              : "flex flex-wrap items-center justify-center gap-4 sm:gap-6"
          }
        >
          <div
            className={
              compact
                ? "flex min-w-0 items-center justify-start gap-3"
                : "flex min-w-0 items-center gap-3"
            }
          >
            <Ring value={privacy} label="PRIVACY" size={ringSize} />
            <Ring value={blastRadius} label="IMPACT" size={ringSize} />
            <Ring value={recovery} label="RECOVERY" size={ringSize} />
          </div>
          {!compact && (
            <div className="hidden h-11 w-px bg-slate-200/70 sm:block dark:bg-slate-700/60" />
          )}
          <div
            className={
              compact
                ? "flex w-[92px] shrink-0 flex-col items-end text-right"
                : "flex shrink-0 flex-col items-center"
            }
          >
            <div
              style={{
                ...OVERALL_SCORE_STYLE,
                fontSize: overallFont,
                lineHeight: 1,
                color: overallColor,
                fontFamily: MONOSPACE_FONT,
              }}
            >
              {overallAnim}
            </div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Overall
            </div>
          </div>
        </div>
        <PlacementProgress
          className={[
            "w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-800/80",
            compact ? "mt-3 h-1" : "mt-3 h-1.5",
          ].join(" ")}
          placedCount={placedCount}
          totalDevices={totalDevices}
        />
      </div>
    </ScoreHudFrame>
  );
}

function MiniBar({ label, value }: Readonly<{ label: string; value: number }>) {
  const a = useAnimatedNumber(value);
  const t = tierFor(a);
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2.5 text-[7px] font-bold uppercase leading-none text-slate-400 dark:text-slate-500">
        {label}
      </span>
      <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-800/80">
        <div
          className={`h-full rounded-full bg-linear-to-r ${tierBarGrad(t)}`}
          style={{ width: `${a}%`, transition: "width 0.5s ease" }}
        />
      </div>
    </div>
  );
}

function RiskBadge({
  count,
  items,
  open,
  onToggle,
  popRef,
  className,
}: Readonly<{
  count: number;
  items: ReadonlyArray<OpenRiskItem>;
  open: boolean;
  onToggle: () => void;
  popRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
}>) {
  return (
    <div ref={popRef} className={className || "relative z-30"}>
      <RiskButton
        aria-label={`${count} open risk${count === 1 ? "" : "s"} active`}
        aria-expanded={open}
        onClick={onToggle}
        className="inline-flex items-center gap-1 rounded-full border border-rose-400/50 bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-700 shadow-[0_0_12px_rgba(239,68,68,0.3)] backdrop-blur-sm transition-colors hover:bg-rose-500/25 dark:border-rose-400/40 dark:bg-rose-500/15 dark:text-rose-200"
      >
        <AlertTriangle size={RISK_BADGE_ICON_SIZE} className="animate-pulse" />
        {count}
      </RiskButton>
      {open && (
        <dialog
          open
          aria-label="Open risk findings"
          className="absolute right-0 top-full m-0 mt-2 w-64 max-w-[calc(100vw-24px)] overflow-hidden rounded-xl border border-rose-300/60 bg-white/96 p-3 shadow-[0_16px_40px_rgba(239,68,68,0.2)] backdrop-blur-md dark:border-rose-400/30 dark:bg-slate-900/96 dark:shadow-[0_20px_46px_rgba(239,68,68,0.25)]"
        >
          <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-200">
            <AlertTriangle size={RISK_HEADING_ICON_SIZE} />
            Open risks
          </div>
          <ul className="space-y-1.5 text-[12px] leading-snug text-rose-900 dark:text-rose-100">
            {items.map((item) => (
              <li key={item.id} className="flex items-start gap-1.5">
                <span
                  aria-hidden
                  className="mt-0.5 text-rose-500 dark:text-rose-300"
                >
                  •
                </span>
                <span>
                  {item.label}
                  {item.count ? (
                    <span className="ml-1 text-rose-600 dark:text-rose-300">
                      (×{item.count})
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </dialog>
      )}
    </div>
  );
}

function Ring({
  value,
  label,
  size,
}: Readonly<{
  value: number;
  label: string;
  size: number;
}>) {
  const a = useAnimatedNumber(value);
  const sw = RING_STROKE_WIDTH,
    r = (size - sw) / 2,
    c = 2 * Math.PI * r,
    dash = (a / PERCENT_SCALE) * c;
  const t = tierFor(a);
  const gid = useId();
  const stroke = tierStroke(t, gid);
  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size}
        aria-label={`${label} ${a}`}
        style={{ transform: "rotate(-90deg)" }}
        className="text-slate-200 dark:text-slate-800"
      >
        <defs>
          <linearGradient
            id={gid}
            x1="0%"
            y1="0%"
            x2={FULL_PERCENT}
            y2={FULL_PERCENT}
          >
            <stop offset="0%" stopColor={SKY_LIGHT} />
            <stop offset={FULL_PERCENT} stopColor={SKY_DARK} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill={NO_FILL}
          stroke="currentColor"
          strokeWidth={sw}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill={NO_FILL}
          stroke={stroke}
          strokeWidth={sw}
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.5s ease, stroke 0.4s ease" }}
        />
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dy="0.35em"
          transform={`rotate(${RING_TEXT_ROTATION} ${size / 2} ${size / 2})`}
          style={{
            fontSize: size * RING_TEXT_SCALE,
            fontWeight: RING_TEXT_WEIGHT,
            fill: tierTextColor(t),
            fontFamily: MONOSPACE_FONT,
            transition: "fill 0.4s ease",
          }}
        >
          {a}
        </text>
      </svg>
      <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">
        {label}
      </div>
    </div>
  );
}
