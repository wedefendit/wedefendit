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

export type DPadDirection = "up" | "down" | "left" | "right";

type DPadProps = Readonly<{
  onPress?: (direction: DPadDirection) => void;
  onRelease?: (direction: DPadDirection) => void;
}>;

const ARROW: Record<DPadDirection, string> = {
  up: "\u25B2",
  down: "\u25BC",
  left: "\u25C0",
  right: "\u25B6",
};

const GRID_AREA: Record<DPadDirection, string> = {
  up: "1 / 2 / 2 / 3",
  left: "2 / 1 / 3 / 2",
  right: "2 / 3 / 3 / 4",
  down: "3 / 2 / 4 / 3",
};

/**
 * Four-directional pad rendered as a 3x3 CSS grid cross.
 * Each arm is a native <button> meeting 44px minimum touch targets.
 * The center cell is decorative.
 */
export function DPad({ onPress, onRelease }: DPadProps) {
  return (
    <nav
      data-testid="gr-dpad"
      aria-label="Directional pad"
      className="grid grid-cols-[repeat(3,48px)] grid-rows-[repeat(3,48px)] gap-0.5"
    >
      {(["up", "down", "left", "right"] as const).map((dir) => (
        <button
          key={dir}
          type="button"
          data-testid={`gr-dpad-${dir}`}
          aria-label={`Move ${dir}`}
          onPointerDown={() => onPress?.(dir)}
          onPointerUp={() => onRelease?.(dir)}
          onPointerCancel={() => onRelease?.(dir)}
          className="flex h-12 w-12 touch-none items-center justify-center rounded-sm border border-[#1a3a4a] bg-[#0f1b2d] text-sm text-[#00f0ff] shadow-[inset_0_0_6px_rgba(0,240,255,0.08)] active:brightness-150"
          style={{ gridArea: GRID_AREA[dir] }}
        >
          {ARROW[dir]}
        </button>
      ))}
      <div
        aria-hidden="true"
        className="rounded-sm border border-[#1a3a4a] bg-[#0a1220] [grid-area:2/2/3/3]"
      />
    </nav>
  );
}
