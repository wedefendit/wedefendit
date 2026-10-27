"use client";

import { useCallback, useEffect, useState } from "react";
import type { ButtonHTMLAttributes } from "react";
import type { SaveSummary } from "../../engine/types";
import { zoneLabels } from "../../data/sectors";
import DefendItShieldLogo from "../../../../components/Icons/Logo/defendit-shield-logo";
import companyInfo from "../../../../../data/company-info.json";

enum BootPhase { Black = "black", Logo = "logo", Copyright = "copyright", Hold = "hold", Done = "done" }

type BootScreenProps = Readonly<{
  saveSummary: SaveSummary | null;
  onBootDone: () => void;
  onDeleteSave: () => void;
  onPlayChime: () => void;
}>;

const BOOT_DELAY: Record<BootPhase, number> = {
  [BootPhase.Black]: 0,
  [BootPhase.Logo]: 500,
  [BootPhase.Copyright]: 1_300,
  [BootPhase.Hold]: 1_800,
  [BootPhase.Done]: 4_300,
};
const LOGO_REBOUND_PERCENT = 60;
const ANIMATION_COMPLETE_PERCENT = 100;

const BOOT_KEYFRAMES = `
@keyframes gr-logo-drop {
  0% { transform: translateY(-48px); opacity: 0; }
  ${LOGO_REBOUND_PERCENT}% { transform: translateY(4px); opacity: 1; }
  ${ANIMATION_COMPLETE_PERCENT}% { transform: translateY(0); opacity: 1; }
}
@keyframes gr-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes gr-scan-line {
  0% { transform: translateY(-${ANIMATION_COMPLETE_PERCENT}%); }
  ${ANIMATION_COMPLETE_PERCENT}% { transform: translateY(100vh); }
}
`;

function BootButton({
  className,
  ...props
}: Readonly<ButtonHTMLAttributes<HTMLButtonElement>>) {
  return (
    <button
      type="button"
      className={`${className ?? ""} pointer-events-auto`}
      {...props}
    />
  );
}

export function BootScreen({
  saveSummary,
  onBootDone,
  onDeleteSave,
  onPlayChime,
}: BootScreenProps) {
  const [phase, setPhase] = useState(BootPhase.Black);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const skip = useCallback(() => {
    if (phase === BootPhase.Done) return;
    setPhase(BootPhase.Done);
    onBootDone();
  }, [onBootDone, phase]);

  useEffect(() => {
    const timers = [
      globalThis.setTimeout(
        () => setPhase(BootPhase.Logo),
        BOOT_DELAY[BootPhase.Logo],
      ),
      globalThis.setTimeout(() => {
        setPhase(BootPhase.Copyright);
        onPlayChime();
      }, BOOT_DELAY[BootPhase.Copyright]),
      globalThis.setTimeout(
        () => setPhase(BootPhase.Hold),
        BOOT_DELAY[BootPhase.Hold],
      ),
      globalThis.setTimeout(() => {
        setPhase(BootPhase.Done);
        onBootDone();
      }, BOOT_DELAY[BootPhase.Done]),
    ];

    return () => timers.forEach((t) => globalThis.clearTimeout(t));
  }, [onBootDone, onPlayChime]);

  useEffect(() => {
    if (phase === BootPhase.Black || phase === BootPhase.Done) return;

    function handleKey(e: KeyboardEvent) {
      e.preventDefault();
      skip();
    }

    const listener = new AbortController();
    globalThis.addEventListener("keydown", handleKey, {
      signal: listener.signal,
    });
    return () => listener.abort();
  }, [phase, skip]);

  if (phase === BootPhase.Done) return null;

  const showLogo =
    phase === BootPhase.Logo ||
    phase === BootPhase.Copyright ||
    phase === BootPhase.Hold;
  const showCopyright =
    phase === BootPhase.Copyright || phase === BootPhase.Hold;

  return (
    <section
      data-testid="gr-boot-screen"
      aria-label="Boot sequence"
      className="relative flex flex-1 flex-col bg-black"
    >
      <style>{BOOT_KEYFRAMES}</style>
      <BootButton
        aria-hidden
        tabIndex={-1}
        onClick={phase !== BootPhase.Black ? skip : undefined}
        className="absolute inset-0 z-0 m-0 cursor-default border-0 bg-transparent p-0"
      />

      {showLogo && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 overflow-hidden opacity-[0.03] animate-[gr-scan-line_2s_linear_infinite]"
        >
          <div className="h-1 w-full bg-[#00f0ff]" />
        </div>
      )}

      <div className="pointer-events-none relative z-1 flex flex-1 flex-col items-center justify-center gap-5">
        {showLogo && (
          <div className="text-[#00f0ff] drop-shadow-[0_0_24px_rgba(0,240,255,0.25)] animate-[gr-logo-drop_0.8s_ease-out_forwards]">
            <DefendItShieldLogo
              className="h-20 w-auto sm:h-28"
              aria-label="Defend I.T. Solutions"
            />
          </div>
        )}

        {showCopyright && (
          <p className="gr-font-mono text-center text-[10px] tracking-[0.2em] text-[#aabbcc]/70 sm:text-xs animate-[gr-fade-in_0.5s_ease-out_forwards]">
            &copy; {companyInfo.copy_start_year} Defend I.T. Solutions LLC
          </p>
        )}
      </div>

      <footer
        data-testid="gr-boot-footer"
        className="pointer-events-none relative z-1 flex shrink-0 items-center justify-between border-t border-[#1a3a4a]/20 px-4 py-2.5"
      >
        {saveSummary ? (
          <div className="flex items-center gap-2">
            <div className="gr-font-mono flex flex-col leading-tight">
              <span className="text-sm font-bold text-[#00f0ff] drop-shadow-[0_0_6px_rgba(0,240,255,0.4)]">
                {saveSummary.playerName}
                <span className="ml-1.5 font-normal text-[#aabbcc]">
                  Lv.{saveSummary.level}
                </span>
              </span>
              <span className="text-[10px] text-[#4a5568]">
                {zoneLabels[saveSummary.zone] ??
                  saveSummary.zone.toUpperCase()}
              </span>
            </div>
            {confirmDelete ? (
              <div className="flex items-center gap-1">
                <BootButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSave();
                    setConfirmDelete(false);
                  }}
                  className="gr-font-mono rounded-sm border border-[#ff003c] bg-[#1a0a10] px-2 py-0.5 text-[10px] font-bold text-[#ff003c] active:brightness-150"
                >
                  YES
                </BootButton>
                <BootButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDelete(false);
                  }}
                  className="gr-font-mono rounded-sm border border-[#1a3a4a] bg-[#0f1b2d] px-2 py-0.5 text-[10px] text-[#aabbcc] active:brightness-150"
                >
                  NO
                </BootButton>
              </div>
            ) : (
              <BootButton
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDelete(true);
                }}
                aria-label="Delete save data"
                className="gr-font-mono rounded-sm border border-[#ff003c]/30 px-1.5 py-0.5 text-[10px] text-[#ff003c]/60 active:brightness-150"
              >
                DELETE
              </BootButton>
            )}
          </div>
        ) : (
          <span className="gr-font-mono text-[10px] text-[#4a5568]">
            No save data
          </span>
        )}
      </footer>
    </section>
  );
}
