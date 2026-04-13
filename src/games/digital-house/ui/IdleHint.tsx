import { Lightbulb, X } from "lucide-react";
import type { IdleHint as IdleHintType } from "../model";

export type IdleHintProps = Readonly<{
  hint: IdleHintType;
  onDismiss: () => void;
}>;

export function IdleHintBanner({ hint, onDismiss }: IdleHintProps) {
  return (
    <div
      key={hint.key}
      style={{ animation: "dh-slideIn 0.3s ease" }}
      className="pointer-events-auto flex items-center gap-2 rounded-xl border border-sky-300/40 bg-sky-50/95 px-3 py-1.5 shadow-[0_4px_16px_rgba(56,189,248,0.15)] backdrop-blur-sm dark:border-sky-400/20 dark:bg-sky-950/90 dark:shadow-[0_4px_16px_rgba(56,189,248,0.2)]"
    >
      <Lightbulb size={13} className="shrink-0 text-sky-500 dark:text-sky-400" />
      <span className="min-w-0 text-[12px] font-medium leading-snug text-sky-800 dark:text-sky-200">
        {hint.message}
      </span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss hint"
        className="ml-auto shrink-0 touch-manipulation rounded-md p-0.5 text-sky-400 transition-colors hover:text-sky-600 dark:text-sky-500 dark:hover:text-sky-300"
        style={{ touchAction: "manipulation" }}
      >
        <X size={12} />
      </button>
    </div>
  );
}
