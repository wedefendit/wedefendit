/*
Copyright © 2026 Defend I.T. Solutions LLC. All Rights Reserved.

This software and its source code are the proprietary property of
Defend I.T. Solutions LLC and are protected by United States and
international copyright laws. Unauthorized reproduction, distribution,
modification, display, or use of this software, in whole or in part, without the
prior written permission of Defend I.T. Solutions LLC, is strictly prohibited.

This software is provided for use only by authorized employees, contractors, or
licensees of Defend I.T. Solutions LLC and may not be disclosed to any third
party without express written consent.
*/

export type DeltaFloaterProps = Readonly<{
  delta: { key: number; value: number } | null;
}>;

export function DeltaFloater({ delta }: DeltaFloaterProps) {
  if (!delta || delta.value === 0) return null;
  const positive = delta.value > 0;
  const sign = positive ? "+" : "−";
  const magnitude = Math.abs(delta.value);
  return (
    <div
      key={delta.key}
      aria-hidden
      style={{ animation: "dh-floatUp 1.1s ease-out forwards" }}
      className={[
        "pointer-events-none absolute right-6 top-3 text-lg font-black tabular-nums",
        positive
          ? "text-emerald-500 drop-shadow-[0_0_10px_rgba(52,211,153,0.55)] dark:text-emerald-300"
          : "text-rose-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.55)] dark:text-rose-300",
      ].join(" ")}
    >
      {sign}
      {magnitude}
    </div>
  );
}
