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

import type { ReactNode } from "react";
import { GameControls } from "./ui/hud/GameControls";
import type { DPadDirection } from "./ui/hud/DPad";
import type { ActionButton } from "./ui/hud/ActionButtons";

type GridRunnerShellProps = Readonly<{
  children: ReactNode;
  onDPadPress?: (dir: DPadDirection) => void;
  onDPadRelease?: (dir: DPadDirection) => void;
  onActionPress?: (btn: ActionButton) => void;
  onActionRelease?: (btn: ActionButton) => void;
  hideControls?: boolean;
}>;

const FONT_FACES = `
@font-face {
  font-family: 'Share Tech Mono';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/share-tech-mono-400.woff2') format('woff2');
}
@font-face {
  font-family: 'Orbitron';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/orbitron-400.woff2') format('woff2');
}
@font-face {
  font-family: 'Orbitron';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('/fonts/orbitron-700.woff2') format('woff2');
}
@font-face {
  font-family: 'Orbitron';
  font-style: normal;
  font-weight: 900;
  font-display: swap;
  src: url('/fonts/orbitron-900.woff2') format('woff2');
}
`;

export function GridRunnerShell({
  children,
  onDPadPress,
  onDPadRelease,
  onActionPress,
  onActionRelease,
  hideControls,
}: GridRunnerShellProps) {
  return (
    <main
      data-testid="gr-root"
      className="relative flex min-h-0 flex-1 flex-col items-center overflow-hidden"
      style={{
        paddingLeft: "env(safe-area-inset-left, 0px)",
        paddingRight: "env(safe-area-inset-right, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <style>{FONT_FACES}</style>
      <section
        data-testid="gr-frame"
        aria-label="GRIDRUNNER game"
        className="relative mx-auto flex min-h-0 w-full max-w-[960px] flex-1 flex-col overflow-hidden"
      >
        <div data-testid="gr-viewport" className="relative min-h-0 flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
        {!hideControls && (
          <GameControls
            onDPadPress={onDPadPress}
            onDPadRelease={onDPadRelease}
            onActionPress={onActionPress}
            onActionRelease={onActionRelease}
          />
        )}
      </section>
    </main>
  );
}
