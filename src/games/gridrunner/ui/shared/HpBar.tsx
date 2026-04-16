/*
Copyright © 2026 Defend I.T. Solutions LLC. All Rights Reserved.
*/

type HpBarColor = "cyan" | "magenta" | "red" | "orange";

type HpBarProps = Readonly<{
  current: number;
  max: number;
  color: HpBarColor;
  label: string;
}>;

const COLOR_MAP: Record<HpBarColor, { text: string; bar: string }> = {
  cyan: {
    text: "text-[#00f0ff]",
    bar: "bg-[#00f0ff] shadow-[0_0_4px_#00f0ff]",
  },
  magenta: {
    text: "text-[#ff00de]",
    bar: "bg-[#ff00de] shadow-[0_0_4px_#ff00de]",
  },
  red: {
    text: "text-[#ff003c]",
    bar: "bg-[#ff003c] shadow-[0_0_4px_#ff003c]",
  },
  orange: {
    text: "text-[#ff6b00]",
    bar: "bg-[#ff6b00] shadow-[0_0_4px_#ff6b00]",
  },
};

export function HpBar({ current, max, color, label }: HpBarProps) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const c = COLOR_MAP[color];

  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`gr-font-mono min-w-[20px] text-xs font-semibold ${c.text}`}
      >
        {label}
      </span>
      <div
        className="relative h-2 flex-1 overflow-hidden rounded-sm border border-[#1a3a4a] bg-[#0d1520]"
        role="meter"
        aria-label={`${label} ${current} of ${max}`}
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={`h-full transition-[width] duration-300 ease-out ${c.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="gr-font-mono min-w-[36px] text-right text-xs font-medium tabular-nums text-[#d0d8e0]">
        {current}/{max}
      </span>
    </div>
  );
}
