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

import { DPad, type DPadDirection } from "./DPad";
import { ActionButtons, type ActionButton } from "./ActionButtons";

type GameControlsProps = Readonly<{
  onDPadPress?: (dir: DPadDirection) => void;
  onDPadRelease?: (dir: DPadDirection) => void;
  onActionPress?: (btn: ActionButton) => void;
  onActionRelease?: (btn: ActionButton) => void;
}>;

/**
 * Bottom control bar: d-pad on the left, A/B buttons on the right.
 * Visible on ALL screen sizes -- the Game Boy frame aesthetic requires
 * controls as part of the visual identity. On desktop they're clickable
 * as secondary input alongside keyboard. Only hidden on title screen.
 */
export function GameControls({
  onDPadPress,
  onDPadRelease,
  onActionPress,
  onActionRelease,
}: GameControlsProps) {
  return (
    <footer
      data-testid="gr-controls"
      aria-label="Game controls"
      className="flex shrink-0 items-center justify-between border-t border-[#1a3a4a] bg-[#080c16] px-4 py-2"
    >
      <DPad onPress={onDPadPress} onRelease={onDPadRelease} />
      <ActionButtons onPress={onActionPress} onRelease={onActionRelease} />
    </footer>
  );
}
