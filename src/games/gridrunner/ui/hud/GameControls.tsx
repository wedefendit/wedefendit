/*
Copyright © 2026 Defend I.T. Solutions LLC. All Rights Reserved.
*/

import { DPad, type DPadDirection } from "./DPad";
import { ActionButtons, type ActionButton } from "./ActionButtons";

type GameControlsProps = Readonly<{
  onDPadPress?: (dir: DPadDirection) => void;
  onDPadRelease?: (dir: DPadDirection) => void;
  onActionPress?: (btn: ActionButton) => void;
  onActionRelease?: (btn: ActionButton) => void;
  onSelect?: () => void;
  onStart?: () => void;
}>;

/**
 * Bottom control bar: d-pad left, Select/Start center, A/B right.
 * Game Boy layout. Visible on ALL screen sizes. Scales responsively.
 */
export function GameControls({
  onDPadPress,
  onDPadRelease,
  onActionPress,
  onActionRelease,
  onSelect,
  onStart,
}: GameControlsProps) {
  return (
    <footer
      data-testid="gr-controls"
      aria-label="Game controls"
      className="grid shrink-0 grid-cols-[auto_1fr_auto] items-center border-t border-[#1a3a4a] bg-[#080c16] px-1.5 py-1 sm:px-2 sm:py-1.5 lg:px-4 lg:py-2"
    >
      <DPad onPress={onDPadPress} onRelease={onDPadRelease} />

      <nav
        aria-label="Menu buttons"
        className="flex items-center justify-center gap-2 sm:gap-3"
      >
        <button
          type="button"
          data-testid="gr-btn-select"
          aria-label="Select (open Disc)"
          onClick={onSelect}
          className="gr-font-mono touch-none rounded-sm border border-[#1a3a4a] bg-[#0a1220] px-1.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#aabbcc] active:brightness-150 sm:px-2 sm:py-1.5 sm:text-xs lg:px-3"
        >
          SELECT
        </button>
        <button
          type="button"
          data-testid="gr-btn-start"
          aria-label="Start (open menu)"
          onClick={onStart}
          className="gr-font-mono touch-none rounded-sm border border-[#1a3a4a] bg-[#0a1220] px-1.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#aabbcc] active:brightness-150 sm:px-2 sm:py-1.5 sm:text-xs lg:px-3"
        >
          START
        </button>
      </nav>

      <ActionButtons onPress={onActionPress} onRelease={onActionRelease} />
    </footer>
  );
}
