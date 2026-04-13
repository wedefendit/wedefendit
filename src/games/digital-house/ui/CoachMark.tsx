import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import type { CoachStepConfig } from "../model";

export type CoachMarkProps = Readonly<{
  steps: CoachStepConfig[];
  onDismiss: (dontShowAgain: boolean) => void;
}>;

type Rect = { top: number; left: number; width: number; height: number };
const PAD = 8;

function getTargetRect(selector: string): Rect | null {
  const el = document.querySelector(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const vw = globalThis.innerWidth;
  const vh = globalThis.innerHeight;
  // Extra 6px inset so the ring border + shadow don't clip at viewport edges
  const margin = PAD + 6;
  const left = Math.max(margin, r.left - PAD);
  const top = Math.max(0, r.top - PAD);
  const right = Math.min(vw - margin, r.right + PAD);
  const bottom = Math.min(vh, r.bottom + PAD);
  return { top, left, width: right - left, height: bottom - top };
}

const ZONE_COLORS: Record<string, string> = {
  Main: "#38bdf8",
  Guest: "#fbbf24",
  IoT: "#a78bfa",
};

function colorizeZones(text: string): React.ReactNode {
  const pattern = /\b(Main|Guest|IoT)\b/g;
  const parts: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    parts.push(
      <strong key={match.index} style={{ color: ZONE_COLORS[match[1]] }}>
        {match[1]}
      </strong>,
    );
    last = pattern.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length > 0 ? parts : text;
}

export function CoachMark({ steps, onDismiss }: CoachMarkProps) {
  const [step, setStep] = useState(0);
  const [dontShow, setDontShow] = useState(false);
  const [rect, setRect] = useState<Rect | null>(null);
  const current = steps[step];
  const isLast = step === steps.length - 1;

  const measure = useCallback(() => {
    if (!current) return;
    setRect(getTargetRect(current.target));
  }, [current]);

  useLayoutEffect(() => {
    measure();
  }, [measure, step]);

  useEffect(() => {
    const h = () => measure();
    globalThis.addEventListener("resize", h);
    return () => globalThis.removeEventListener("resize", h);
  }, [measure]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss(false);
    };
    globalThis.addEventListener("keydown", h);
    return () => globalThis.removeEventListener("keydown", h);
  }, [onDismiss]);

  if (!current) return null;

  const handleNext = () => {
    if (isLast) onDismiss(dontShow);
    else setStep((s) => s + 1);
  };
  const handleSkip = () => onDismiss(dontShow);

  // Card positioning: centered in viewport, never clipped
  const vw = globalThis.innerWidth || 360;
  const cardW =
    vw >= 1024
      ? Math.min(540, vw - 48)
      : vw >= 768
        ? Math.min(480, vw - 48)
        : Math.min(360, vw - 32);
  const cardStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 10002,
    width: cardW,
    left: (vw - cardW) / 2,
    top: "50%",
    transform: "translateY(-50%)",
  };

  // Card always centers in viewport

  return (
    <div
      style={{ animation: "dh-fadeIn 0.25s ease" }}
      className="fixed inset-0 z-[10000]"
    >
      {/* Dim overlay with spotlight cutout */}
      <div
        className="absolute inset-0"
        onClick={handleSkip}
        style={{
          background: "rgba(2,6,23,0.78)",
          backdropFilter: "blur(2px)",
          ...(rect
            ? {
                clipPath: `polygon(
              0% 0%, 0% 100%, 100% 100%, 100% 0%,
              ${rect.left}px 0%,
              ${rect.left}px ${rect.top + rect.height}px,
              ${rect.left + rect.width}px ${rect.top + rect.height}px,
              ${rect.left + rect.width}px ${rect.top}px,
              ${rect.left}px ${rect.top}px,
              ${rect.left}px 0%
            )`,
              }
            : {}),
        }}
      />
      {/* Spotlight ring */}
      {rect && (
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-xl border-2 border-sky-400/60"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            boxShadow:
              "0 0 0 3px rgba(56,189,248,0.15), 0 0 24px rgba(56,189,248,0.25)",
            zIndex: 10001,
          }}
        />
      )}
      {/* Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={current.heading}
        style={{
          ...cardStyle,
          animation: "dh-modalRise 0.4s cubic-bezier(0.22,1.2,0.36,1)",
        }}
        className="w-full rounded-2xl border border-slate-200/80 bg-white/96 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.25)] ring-1 ring-white/90 min-[768px]:p-6 dark:border-sky-400/25 dark:bg-slate-900/96 dark:shadow-[0_20px_60px_rgba(2,6,23,0.6)] dark:ring-white/5"
      >
        {/* Step dots */}
        <div className="mb-2 flex items-center gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={[
                "h-1 rounded-full transition-all duration-300",
                i === step
                  ? "w-5 bg-sky-400"
                  : i < step
                    ? "w-2 bg-sky-400/50"
                    : "w-2 bg-slate-300 dark:bg-slate-600",
              ].join(" ")}
            />
          ))}
        </div>
        <h3 className="text-[16px] font-bold text-slate-900 min-[768px]:text-lg min-[1024px]:text-xl dark:text-white">
          {current.heading}
        </h3>
        <p className="mt-1.5 text-[15px] leading-relaxed text-slate-600 min-[768px]:text-base min-[1024px]:text-[17px] dark:text-slate-300">
          {colorizeZones(current.body)}
        </p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            {isLast && (
              <label className="flex items-center gap-2 text-[12px] font-medium text-slate-500 min-[768px]:text-[13px] dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={dontShow}
                  onChange={(e) => setDontShow(e.currentTarget.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-400"
                />
                Don&apos;t show again
              </label>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {!isLast && (
              <button
                type="button"
                onClick={handleSkip}
                className="touch-manipulation px-3 py-2 text-[13px] font-semibold text-slate-500 transition-colors hover:text-slate-700 min-[768px]:text-[14px] dark:text-slate-400 dark:hover:text-slate-200"
                style={{ touchAction: "manipulation" }}
              >
                Skip
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              className="touch-manipulation rounded-xl border border-sky-400/40 bg-sky-500/12 px-5 py-2 text-[14px] font-bold text-sky-700 transition-colors hover:bg-sky-500/18 min-[768px]:text-[15px] dark:border-sky-400/25 dark:bg-sky-500/10 dark:text-sky-200 dark:hover:bg-sky-500/20"
              style={{ touchAction: "manipulation" }}
            >
              {isLast ? "Got it" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
