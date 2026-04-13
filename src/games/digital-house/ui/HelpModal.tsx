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

import { useEffect, useState } from "react";
import { HelpCircle, X } from "lucide-react";

export type HelpModalProps = Readonly<{
  onDismiss: (dontShowAgain: boolean) => void;
}>;

export function HelpModal({ onDismiss }: HelpModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss(false);
    };
    globalThis.addEventListener("keydown", onKey);
    return () => globalThis.removeEventListener("keydown", onKey);
  }, [onDismiss]);

  return (
    <div
      style={{ animation: "dh-fadeIn 0.25s ease" }}
      className="fixed inset-0 z-95 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md"
    >
      <button
        type="button"
        aria-label="Close help"
        onClick={() => onDismiss(false)}
        className="absolute inset-0 z-0 h-full w-full cursor-default touch-manipulation bg-transparent"
        style={{ touchAction: "manipulation" }}
        tabIndex={-1}
      />
      <div
        data-testid="dh-help-modal"
        role="dialog"
        aria-modal="true"
        aria-label="How to play"
        style={{ animation: "dh-modalRise 0.5s cubic-bezier(0.22,1.2,0.36,1)" }}
        className="relative z-10 max-h-[calc(100dvh-24px)] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200/80 bg-white/96 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.08),transparent_58%)] p-5 text-slate-900 shadow-[0_30px_80px_rgba(15,23,42,0.18)] ring-1 ring-white/90 sm:p-7 dark:border-sky-400/25 dark:bg-slate-900/96 dark:bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.14),transparent_58%)] dark:text-slate-100 dark:shadow-[0_30px_80px_rgba(2,6,23,0.6)] dark:ring-white/5"
      >
        <button
          type="button"
          onClick={() => onDismiss(false)}
          aria-label="Close"
          className="absolute right-3 top-3 touch-manipulation rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          style={{ touchAction: "manipulation" }}
        >
          <X size={16} />
        </button>

        <div className="mb-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-300/40 bg-sky-50/90 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-sky-700 dark:border-sky-400/25 dark:bg-slate-900/70 dark:text-sky-300">
            <HelpCircle size={11} /> How to Play
          </div>
          <h2 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">
            The Digital House
          </h2>
        </div>

        <div className="space-y-2 text-[13px] leading-relaxed text-slate-700 dark:text-slate-200">
          <p>
            Drag a device into a room to place it. On touch, you can also tap a
            device and then tap a room. The board updates in real time so you can
            feel how trust, exposure, and recovery shift.
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            On Medium and Hard, use the room chips to set Main, Guest, or IoT.
            Locked chips stay fixed. Drag a placed device to another room, or tap
            it again to move it on touch.
          </p>
        </div>

        <div className="mt-5">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
            Network Zones
          </div>
          <ul className="space-y-1.5 text-[12px] text-slate-700 dark:text-slate-200">
            <li className="flex items-start gap-2">
              <span
                aria-hidden
                className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ background: "#38bdf8" }}
              />
              <span>
                <strong className="text-slate-900 dark:text-slate-100">Main</strong> — your trusted everyday devices.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span
                aria-hidden
                className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ background: "#fbbf24" }}
              />
              <span>
                <strong className="text-slate-900 dark:text-slate-100">Guest</strong> — visitors and short-term devices.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span
                aria-hidden
                className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ background: "#a78bfa" }}
              />
              <span>
                <strong className="text-slate-900 dark:text-slate-100">IoT</strong> — smart devices that should stay contained.
              </span>
            </li>
          </ul>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-slate-200/80 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700/70">
          <label className="flex items-center gap-2 text-[12px] font-medium text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(event) => setDontShowAgain(event.currentTarget.checked)}
              className="h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-400"
            />
            <span>Don't show again</span>
          </label>
          <button
            type="button"
            onClick={() => onDismiss(dontShowAgain)}
            className="inline-flex touch-manipulation items-center justify-center rounded-xl border border-sky-400/40 bg-sky-500/12 px-4 py-2 text-sm font-bold text-sky-700 transition-colors hover:bg-sky-500/18 dark:border-sky-400/25 dark:bg-sky-500/10 dark:text-sky-200 dark:hover:bg-sky-500/20"
            style={{ touchAction: "manipulation" }}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

