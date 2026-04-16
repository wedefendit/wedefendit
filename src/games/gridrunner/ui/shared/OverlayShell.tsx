/*
Copyright © 2026 Defend I.T. Solutions LLC. All Rights Reserved.
*/

import type { ReactNode } from "react";

type OverlayShellProps = Readonly<{
  testId: string;
  title: string;
  onClose: () => void;
  closeLabel?: string;
  children: ReactNode;
  /** "fullscreen" fills the viewport with header/footer.
   *  "dialog" centers a bordered box. */
  variant?: "fullscreen" | "dialog";
  /** Extra content in header right (e.g. bits display). */
  headerRight?: ReactNode;
}>;

/**
 * Shared overlay wrapper. Eliminates duplicated shell markup across
 * Disc, Inventory, Operator, Save, Settings, Shop screens.
 */
export function OverlayShell({
  testId,
  title,
  onClose,
  closeLabel = "CLOSE",
  children,
  variant = "fullscreen",
  headerRight,
}: OverlayShellProps) {
  if (variant === "dialog") {
    return (
      <div
        data-testid={testId}
        className="absolute inset-0 z-40 flex items-center justify-center bg-black/80"
      >
        <section
          aria-label={title}
          className="flex w-full max-w-[280px] flex-col gap-3 rounded-sm border-2 border-[#00f0ff] bg-[#0a0e1a] p-4"
        >
          <h2 className="gr-font-display text-center text-lg font-bold tracking-widest text-[#00f0ff]">
            {title}
          </h2>
          {children}
        </section>
      </div>
    );
  }

  return (
    <div
      data-testid={testId}
      className="absolute inset-0 z-40 flex flex-col bg-[#0a0e1a]/95"
    >
      <header className="flex shrink-0 items-center justify-between border-b border-[#00f0ff] px-3 py-2">
        <h2 className="gr-font-display text-base font-bold tracking-widest text-[#00f0ff]">
          {title}
        </h2>
        <div className="flex items-center gap-3">
          {headerRight}
          <button
            type="button"
            onClick={onClose}
            className="gr-font-mono rounded-sm border border-[#1a3a4a] bg-[#0f1b2d] px-2 py-1 text-xs text-[#aabbcc] active:brightness-150"
          >
            {closeLabel}
          </button>
        </div>
      </header>

      <div className="gr-font-mono flex-1 overflow-y-auto p-3">{children}</div>

      <p className="gr-font-mono shrink-0 border-t border-[#1a3a4a] px-3 py-1.5 text-center text-xs text-[#aabbcc]">
        Press B to go back
      </p>
    </div>
  );
}
