/*
Copyright © 2026 Defend I.T. Solutions LLC. All Rights Reserved.
*/

import { OverlayShell } from "../shared/OverlayShell";

type SaveScreenProps = Readonly<{
  onClose: () => void;
  onSave: () => void;
}>;

export function SaveScreen({ onClose, onSave }: SaveScreenProps) {
  return (
    <OverlayShell testId="gr-save-overlay" title="SAVE GAME" onClose={onClose} variant="dialog">
      <p className="gr-font-mono text-center text-xs text-[#aabbcc]">
        Progress saves automatically. Use this to force a manual save.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onSave}
          className="gr-font-mono flex-1 rounded-sm border-2 border-[#00ff41] bg-[#0f1b2d] px-3 py-2.5 text-sm font-bold tracking-widest text-[#00ff41] active:brightness-150"
        >
          SAVE
        </button>
        <button
          type="button"
          onClick={onClose}
          className="gr-font-mono flex-1 rounded-sm border border-[#1a3a4a] bg-[#0f1b2d] px-3 py-2.5 text-sm font-bold tracking-widest text-[#aabbcc] active:brightness-150"
        >
          CANCEL
        </button>
      </div>
    </OverlayShell>
  );
}
