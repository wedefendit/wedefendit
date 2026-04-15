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

import type { Difficulty } from "./types";

type DifficultyPickerProps = Readonly<{
  value: Difficulty;
  onChange: (next: Difficulty) => void;
  disabled?: boolean;
}>;

type DifficultyOption = Readonly<{
  id: Difficulty;
  label: string;
  hint: string;
}>;

const OPTIONS: ReadonlyArray<DifficultyOption> = [
  { id: "easy", label: "Easy", hint: "Zones pre-assigned" },
  { id: "medium", label: "Medium", hint: "Assign some zones" },
  { id: "hard", label: "Hard", hint: "Architect everything" },
];

export function DifficultyPicker({
  value,
  onChange,
  disabled = false,
}: DifficultyPickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Difficulty"
      className="inline-flex flex-wrap items-center gap-1 rounded-full border border-slate-200/70 bg-white/60 p-1 text-xs font-medium shadow-sm backdrop-blur-md ring-1 ring-slate-200/40 dark:border-sky-900/50 dark:bg-slate-900/60 dark:ring-sky-900/30"
    >
      {OPTIONS.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(opt.id)}
            title={opt.hint}
            className={[
              "rounded-full px-3 py-1.5 transition-colors",
              active
                ? "bg-sky-600 text-white shadow-sm dark:bg-sky-500"
                : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/70",
              disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
            ].join(" ")}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
