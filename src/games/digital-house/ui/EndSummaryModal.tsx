import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Award, ChevronDown, Sparkles, X } from "lucide-react";
import { DifficultyValue, type Difficulty } from "../../shared/types";
import type { ScoreResult } from "../engine";
import type { BadgeJustEarned, PlacementMap } from "../model";
import { BadgeJustEarnedValue, nextDifficulty } from "../model";
import { useAnimatedNumber } from "../hooks/useAnimatedNumber";
import {
  getBadgeLabel,
  scanImprovements,
  scanRisks,
  scanWins,
} from "../summary";

const COUNT_UP_OPTIONS = { durationMs: 1200, initialValue: 0, round: true };
const SCORE_PRESENTATION = {
  healthy: { min: 70, color: "#38bdf8" },
  cautious: { min: 40, color: "#f59e0b" },
  critical: { color: "#ef4444" },
};
const SUMMARY_STYLE = { closeIconSize: 18, sparkleSize: 11, badgeSize: 12, scrollIconSize: 14, mobileScoreSize: 52, desktopScoreSize: 64, scoreWeight: 900, shadowBlur: 24 };
const SUMMARY_COLOR = { success: "#4ade80", warning: "#fbbf24", accent: SCORE_PRESENTATION.healthy.color };
const SUMMARY_VALUES: Readonly<{ button: "button"; touchAction: "manipulation" }> = { button: "button", touchAction: "manipulation" };
const SCORE_SHADOW = { offset: "0 0", opacity: "66" };
enum BrowserEventValue { KeyDown = "keydown", Scroll = "scroll" }

function scoreColor(score: number): string {
  if (score >= SCORE_PRESENTATION.healthy.min) return SCORE_PRESENTATION.healthy.color;
  if (score >= SCORE_PRESENTATION.cautious.min) return SCORE_PRESENTATION.cautious.color;
  return SCORE_PRESENTATION.critical.color;
}

export type EndSummaryModalProps = Readonly<{
  result: ScoreResult;
  placements: PlacementMap;
  badge: BadgeJustEarned;
  canTryHarder: boolean;
  currentDifficulty: Difficulty;
  mobile: boolean;
  onTryAgain: () => void;
  onTryHarder: () => void;
  onDismiss: () => void;
}>;

export function EndSummaryModal({
  result,
  placements,
  badge,
  canTryHarder,
  currentDifficulty,
  mobile,
  onTryAgain,
  onTryHarder,
  onDismiss,
}: EndSummaryModalProps) {
  const countedScore = useAnimatedNumber(result.total, COUNT_UP_OPTIONS);
  const color = scoreColor(result.total);
  const badgeLabel = getBadgeLabel(result.total, currentDifficulty);
  const wins = scanWins(placements);
  const risks = scanRisks(placements, result, currentDifficulty);
  const improvements = scanImprovements(placements, result, currentDifficulty);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    globalThis.addEventListener(BrowserEventValue.KeyDown, handleKey);
    return () => globalThis.removeEventListener(BrowserEventValue.KeyDown, handleKey);
  }, [onDismiss]);

  const [canScroll, setCanScroll] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const checkScroll = useCallback(() => {
    const el = dialogRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 12;
    setCanScroll(!atBottom && el.scrollHeight > el.clientHeight);
  }, []);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener(BrowserEventValue.Scroll, checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener(BrowserEventValue.Scroll, checkScroll);
      ro.disconnect();
    };
  }, [checkScroll]);

  return (
    <div
      style={{ animation: "dh-fadeIn 0.45s ease" }}
      className="fixed inset-0 z-90 flex items-center justify-center bg-slate-950/85 p-6 backdrop-blur-md min-[768px]:p-8"
    >
      <button
        type={SUMMARY_VALUES.button}
        aria-label="Close summary"
        onClick={() => onDismiss()}
        className="absolute inset-0 z-0 h-full w-full cursor-default touch-manipulation bg-transparent"
        style={{ touchAction: SUMMARY_VALUES.touchAction }}
        tabIndex={-1}
      />
      <dialog
        open
        ref={dialogRef}
        aria-modal="true"
        aria-label="After-action report"
        style={{
          animation: "dh-modalRise 0.7s cubic-bezier(0.22,1.2,0.36,1)",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(148,163,184,0.3) transparent",
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
        }}
        className="relative z-10 m-0 max-h-[calc(100dvh-48px)] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200/80 bg-white/96 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.08),transparent_58%)] p-4 text-slate-900 shadow-[0_30px_80px_rgba(15,23,42,0.2)] ring-1 ring-white/90 sm:p-7 dark:border-sky-400/28 dark:bg-slate-900/96 dark:bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.14),transparent_58%)] dark:text-slate-100 dark:shadow-[0_30px_80px_rgba(2,6,23,0.6)] dark:ring-white/5"
      >
        <button
          type={SUMMARY_VALUES.button}
          onClick={() => onDismiss()}
          aria-label="Dismiss"
          className="absolute right-2 top-2 z-20 touch-manipulation rounded-md p-2.5 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          style={{ touchAction: SUMMARY_VALUES.touchAction }}
        >
          <X size={SUMMARY_STYLE.closeIconSize} />
        </button>

        <div
          style={{ animation: "dh-staggerIn 0.5s ease 0.05s both" }}
          className="text-center"
        >
          <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-sky-300/40 bg-sky-50/90 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-sky-700 dark:border-sky-400/25 dark:bg-slate-900/70 dark:text-sky-300">
            <Sparkles size={SUMMARY_STYLE.sparkleSize} /> Results
          </div>
          <div
            data-testid="dh-summary-score"
            style={{
              fontSize: mobile ? SUMMARY_STYLE.mobileScoreSize : SUMMARY_STYLE.desktopScoreSize,
              fontWeight: SUMMARY_STYLE.scoreWeight,
              lineHeight: 1,
              color,
              fontFamily: "ui-monospace, monospace",
              letterSpacing: "-0.04em",
              filter: `drop-shadow(${SCORE_SHADOW.offset} ${SUMMARY_STYLE.shadowBlur}px ${color}${SCORE_SHADOW.opacity})`,
              transition: "color 0.4s ease",
            }}
          >
            {countedScore}
          </div>
          <div className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Network Score
          </div>
          {badge && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-[11px] font-bold text-amber-700 shadow-[0_0_20px_rgba(251,191,36,0.25)] dark:text-amber-200">
              <Award size={SUMMARY_STYLE.badgeSize} />
              {badge === BadgeJustEarnedValue.Architect
                ? "Network Architect badge earned"
                : "Home Network Rookie badge earned"}
            </div>
          )}
          {!badge && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-slate-300/70 bg-slate-100/90 px-3 py-1 text-[11px] font-semibold text-slate-600 dark:border-slate-600/60 dark:bg-slate-900/50 dark:text-slate-300">
              <Award size={SUMMARY_STYLE.badgeSize} /> {badgeLabel}
            </div>
          )}
        </div>

        <div className="mt-5 space-y-2">
          <SummarySection
            title="Good choices"
            accent={SUMMARY_COLOR.success}
            items={wins}
            delay={0.15}
          />
          {risks.length > 0 && (
            <SummarySection
              title="What to improve"
              accent={SUMMARY_COLOR.warning}
              items={risks}
              delay={0.27}
            />
          )}
          <SummarySection
            title="Recommended changes"
            accent={SUMMARY_COLOR.accent}
            items={improvements}
            delay={0.39}
          />
        </div>

        <div
          style={{ animation: "dh-staggerIn 0.5s ease 0.5s both" }}
          className="mt-6 flex flex-wrap items-center justify-center gap-3"
        >
          <button
            type={SUMMARY_VALUES.button}
            onClick={onTryAgain}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-800"
          >
            Play Again
          </button>
          {canTryHarder && (
            <button
              type={SUMMARY_VALUES.button}
              onClick={onTryHarder}
              className="rounded-xl border border-sky-500/50 bg-sky-50 px-4 py-2 text-xs font-bold text-sky-700 transition-colors hover:border-sky-400 hover:bg-sky-100 dark:bg-sky-600/20 dark:text-sky-100 dark:hover:bg-sky-600/30"
            >
              Try{" "}
              {nextDifficulty(currentDifficulty) === DifficultyValue.Hard ? "Hard" : "Medium"}
            </button>
          )}
          <Link
            href="/contact"
            className="rounded-xl bg-linear-to-br from-sky-500 to-sky-700 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-sky-900/30 transition-all hover:-translate-y-0.5 hover:shadow-sky-900/50"
          >
            Ask for Help →
          </Link>
        </div>

        {canScroll && (
          <div
            aria-hidden
            className="pointer-events-none sticky -bottom-4 left-0 right-0 flex justify-center pb-1 sm:-bottom-7"
          >
            <div className="absolute inset-x-0 bottom-0 h-12 rounded-b-2xl bg-gradient-to-t from-white/95 via-white/60 to-transparent dark:from-slate-900/95 dark:via-slate-900/60" />
            <div
              className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full border border-slate-300/60 bg-white/90 text-slate-500 shadow-sm dark:border-slate-600/60 dark:bg-slate-800/90 dark:text-slate-400"
              style={{ animation: "dh-hintPulse 2s ease infinite" }}
            >
              <ChevronDown size={SUMMARY_STYLE.scrollIconSize} />
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}

type SummarySectionProps = Readonly<{
  title: string;
  accent: string;
  items: ReadonlyArray<string>;
  delay: number;
}>;

function SummarySection({ title, accent, items, delay }: SummarySectionProps) {
  return (
    <div
      style={{ animation: `dh-staggerIn 0.5s ease ${delay}s both` }}
      className="rounded-xl border border-slate-200/80 bg-white/88 px-3 py-2 dark:border-slate-700/70 dark:bg-slate-800/50"
    >
      <div
        className="text-[10px] font-extrabold uppercase tracking-wider"
        style={{ color: accent }}
      >
        {title}
      </div>
      <ul className="mt-1 space-y-1 text-[11px] leading-snug text-slate-700 dark:text-slate-300">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden className="text-slate-400 dark:text-slate-500">
              ·
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
