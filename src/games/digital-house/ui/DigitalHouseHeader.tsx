import { HelpCircle, RotateCcw } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggler";
import type { Difficulty } from "../../shared/types";
import { useGameShell } from "../../shared/GameShell";

export type DigitalHouseHeaderProps = Readonly<{ onOpenHelp: () => void }>;

export function DigitalHouseHeader({ onOpenHelp }: DigitalHouseHeaderProps) {
  const { difficulty, setDifficulty, reset } = useGameShell();
  const levels: ReadonlyArray<{ id: Difficulty; short: string }> = [
    { id: "easy", short: "Easy" },
    { id: "medium", short: "Med" },
    { id: "hard", short: "Hard" },
  ];
  const btn = "inline-flex items-center justify-center rounded-full border border-slate-300/70 bg-white/80 text-slate-600 shadow-sm transition-colors hover:border-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-100";

  return (
    <header
      data-testid="dh-header"
      className="relative z-10 flex h-9 w-full shrink-0 items-center justify-between gap-1.5 border-b border-slate-200/70 bg-white/85 px-2 backdrop-blur-md min-[820px]:h-11 min-[820px]:px-6 dark:border-slate-800/70 dark:bg-slate-950/85"
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <h1 className="shrink truncate text-[12px] font-bold leading-none text-slate-900 min-[400px]:text-[13px] min-[820px]:text-[17px] dark:text-slate-50">
          Digital House
        </h1>
        <div role="radiogroup" aria-label="Difficulty" className="inline-flex items-center rounded-full border border-slate-300/70 bg-white/80 p-0.5 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
          {levels.map((lvl) => {
            const active = difficulty === lvl.id;
            return (
              <button key={lvl.id} type="button" role="radio" aria-checked={active} onClick={() => setDifficulty(lvl.id)}
                className={[
                  "rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider transition-colors min-[400px]:px-2.5 min-[400px]:text-[9px] min-[820px]:px-3 min-[820px]:py-1 min-[820px]:text-[11px]",
                  active ? "bg-sky-500 text-white shadow-sm" : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100",
                ].join(" ")}
              >
                {lvl.short}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button type="button" onClick={reset} aria-label="Reset game" className={btn + " h-6 w-6 min-[820px]:h-8 min-[820px]:w-8"} title="Reset">
          <RotateCcw size={11} className="min-[820px]:hidden" />
          <RotateCcw size={15} className="hidden min-[820px]:block" />
        </button>
        <ThemeToggle placement="inline" />
        <button type="button" onClick={onOpenHelp} aria-label="How to play" title="How to play"
          className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-sky-400/40 bg-sky-500/10 text-sky-700 shadow-sm transition-colors hover:border-sky-500 hover:bg-sky-500/20 min-[820px]:h-8 min-[820px]:w-8 dark:border-sky-400/30 dark:bg-sky-500/10 dark:text-sky-300 dark:hover:border-sky-400 dark:hover:bg-sky-500/20"
        >
          <HelpCircle size={11} className="min-[820px]:hidden" />
          <HelpCircle size={15} className="hidden min-[820px]:block" />
        </button>
      </div>
    </header>
  );
}
