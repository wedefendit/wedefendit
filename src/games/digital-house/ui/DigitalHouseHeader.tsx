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

import { HelpCircle, RotateCcw } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggler";
import type { Difficulty } from "../../shared/types";
import { useGameShell } from "../../shared/GameShell";

export type DigitalHouseHeaderProps = Readonly<{
  onOpenHelp: () => void;
}>;

export function DigitalHouseHeader({ onOpenHelp }: DigitalHouseHeaderProps) {
  const { difficulty, setDifficulty, reset } = useGameShell();
  const levels: ReadonlyArray<{ id: Difficulty; label: string; short: string }> = [
    { id: "easy", label: "Easy", short: "Easy" },
    { id: "medium", label: "Medium", short: "Med" },
    { id: "hard", label: "Hard", short: "Hard" },
  ];
  const controlButton =
    "inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300/70 bg-white/80 text-slate-600 shadow-sm transition-colors hover:border-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-100";

  return (
    <header
      data-testid="dh-header"
      className="relative z-10 w-full shrink-0 overflow-hidden border-b border-slate-200/70 bg-white/85 px-2 py-2 backdrop-blur-md min-[820px]:px-6 min-[820px]:py-3 dark:border-slate-800/70 dark:bg-slate-950/85"
    >
      <div className="flex items-center justify-between gap-1.5 min-[820px]:grid min-[820px]:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] min-[820px]:gap-4">
        <div className="flex min-w-0 items-center gap-1.5">
          <h1 className="shrink truncate text-[13px] font-bold leading-none text-slate-900 min-[400px]:text-[14px] min-[820px]:text-[17px] dark:text-slate-50">
            Digital House
          </h1>
          {/* Difficulty picker — inline with the title on ALL breakpoints */}
          <div
            role="radiogroup"
            aria-label="Difficulty"
            className="inline-flex items-center rounded-full border border-slate-300/70 bg-white/80 p-0.5 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
          >
            {levels.map((lvl) => {
              const active = difficulty === lvl.id;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setDifficulty(lvl.id)}
                  className={[
                    "rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider transition-colors min-[400px]:px-2.5 min-[400px]:py-1 min-[400px]:text-[9px] min-[820px]:px-3 min-[820px]:py-1.5 min-[820px]:text-[11px]",
                    active
                      ? "bg-sky-500 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100",
                  ].join(" ")}
                >
                  {lvl.short}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 min-[820px]:hidden">
          <button
            type="button"
            onClick={reset}
            aria-label="Reset game"
            className={controlButton}
            style={{ height: 28, width: 28 }}
            title="Reset"
          >
            <RotateCcw size={12} />
          </button>
          <ThemeToggle placement="inline" />
          <button
            type="button"
            onClick={onOpenHelp}
            aria-label="How to play"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-sky-400/40 bg-sky-500/10 text-sky-700 shadow-sm transition-colors hover:border-sky-500 hover:bg-sky-500/20 dark:border-sky-400/30 dark:bg-sky-500/10 dark:text-sky-300 dark:hover:border-sky-400 dark:hover:bg-sky-500/20"
            title="How to play"
          >
            <HelpCircle size={12} />
          </button>
        </div>

        <div className="hidden items-center justify-end gap-2 min-[820px]:flex">
          <button
            type="button"
            onClick={reset}
            aria-label="Reset game"
            className={controlButton}
            title="Reset"
          >
            <RotateCcw size={16} />
          </button>
          <ThemeToggle placement="inline" />
          <button
            type="button"
            onClick={onOpenHelp}
            aria-label="How to play"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-sky-400/40 bg-sky-500/10 text-sky-700 shadow-sm transition-colors hover:border-sky-500 hover:bg-sky-500/20 dark:border-sky-400/30 dark:bg-sky-500/10 dark:text-sky-300 dark:hover:border-sky-400 dark:hover:bg-sky-500/20"
            title="How to play"
          >
            <HelpCircle size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}

// ---- HelpModal ----

type HelpModalProps = Readonly<{
  onDismiss: (dontShowAgain: boolean) => void;
}>;

