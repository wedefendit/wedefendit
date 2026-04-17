/*
Copyright © 2026 Defend I.T. Solutions LLC. All Rights Reserved.
*/

"use client";

import { Button } from "../shared/Button";

type LevelUpOverlayProps = Readonly<{
  oldLevel: number;
  newLevel: number;
  statDeltas: { hp: number; en: number; spd: number; def: number };
  onContinue: () => void;
}>;

function StatCell({ label, value }: Readonly<{ label: string; value: number }>) {
  return (
    <div className="flex items-center justify-between rounded-sm border border-[#1a3a4a] bg-[#0f1b2d] px-2 py-1.5">
      <span className="gr-font-mono text-xs text-[#aabbcc]">{label}</span>
      <span className="gr-font-mono text-xs font-bold text-[#00ff41]">
        +{value}
      </span>
    </div>
  );
}

export function LevelUpOverlay({
  oldLevel,
  newLevel,
  statDeltas,
  onContinue,
}: LevelUpOverlayProps) {
  return (
    <div
      data-testid="gr-levelup-overlay"
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/80"
    >
      <section
        aria-label="Level up"
        className="flex w-full max-w-[280px] flex-col gap-3 rounded-sm border-2 border-[#ff6b00] bg-[#0a0e1a] p-4"
      >
        <header className="flex flex-col items-center gap-1">
          <h2 className="gr-font-display text-sm font-bold tracking-widest text-[#aabbcc]">
            OPERATOR
          </h2>
          <h3 className="gr-font-display text-lg font-bold tracking-widest text-[#ff6b00]">
            LEVEL UP
          </h3>
        </header>

        <p className="gr-font-mono text-center text-sm">
          <span className="text-[#aabbcc]">WAS </span>
          <span
            data-testid="gr-levelup-old"
            className="font-bold text-[#aabbcc]"
          >
            {oldLevel}
          </span>
          <span className="text-[#ff6b00]"> {"\u2192"} </span>
          <span className="text-[#aabbcc]">NOW </span>
          <span
            data-testid="gr-levelup-new"
            className="font-bold text-[#00f0ff]"
          >
            {newLevel}
          </span>
        </p>

        <div className="grid grid-cols-2 gap-1.5">
          <StatCell label="HP" value={statDeltas.hp} />
          <StatCell label="EN" value={statDeltas.en} />
          <StatCell label="SPD" value={statDeltas.spd} />
          <StatCell label="DEF" value={statDeltas.def} />
        </div>

        <Button
          variant="primary"
          onClick={onContinue}
          testId="gr-levelup-continue"
          className="w-full text-sm py-2.5"
        >
          CONTINUE
        </Button>
      </section>
    </div>
  );
}
