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

export type ActionButton = "a" | "b";

type ActionButtonsProps = Readonly<{
  onPress?: (button: ActionButton) => void;
  onRelease?: (button: ActionButton) => void;
}>;

/**
 * Two-button action cluster (A = primary, B = secondary).
 * Arranged diagonally like a Game Boy: B top-left, A bottom-right.
 * Responsive: 32px on phones, 40px on tablets, 48px on desktop.
 */
export function ActionButtons({ onPress, onRelease }: ActionButtonsProps) {
  return (
    <div
      data-testid="gr-action-buttons"
      role="group"
      aria-label="Action buttons"
      className="relative h-[68px] w-[72px] sm:h-[82px] sm:w-[90px] lg:h-[100px] lg:w-[110px]"
    >
      <button
        type="button"
        data-testid="gr-btn-b"
        aria-label="B button (cancel)"
        onPointerDown={() => onPress?.("b")}
        onPointerUp={() => onRelease?.("b")}
        onPointerCancel={() => onRelease?.("b")}
        className="absolute left-0 top-0 flex h-8 w-8 touch-none items-center justify-center rounded-full border-2 border-[#ff00de] bg-[#0f1b2d] font-mono text-[10px] font-bold text-[#ff00de] shadow-[inset_0_0_8px_rgba(255,0,222,0.12),0_0_4px_rgba(255,0,222,0.1)] active:brightness-150 sm:h-10 sm:w-10 sm:text-xs lg:h-12 lg:w-12 lg:text-sm"
      >
        B
      </button>

      <button
        type="button"
        data-testid="gr-btn-a"
        aria-label="A button (confirm)"
        onPointerDown={() => onPress?.("a")}
        onPointerUp={() => onRelease?.("a")}
        onPointerCancel={() => onRelease?.("a")}
        className="absolute bottom-0 right-0 flex h-8 w-8 touch-none items-center justify-center rounded-full border-2 border-[#00f0ff] bg-[#0f1b2d] font-mono text-[10px] font-bold text-[#00f0ff] shadow-[inset_0_0_8px_rgba(0,240,255,0.12),0_0_4px_rgba(0,240,255,0.1)] active:brightness-150 sm:h-10 sm:w-10 sm:text-xs lg:h-12 lg:w-12 lg:text-sm"
      >
        A
      </button>
    </div>
  );
}
