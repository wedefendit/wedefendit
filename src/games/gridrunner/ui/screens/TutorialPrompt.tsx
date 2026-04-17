/*
Copyright © 2026 Defend I.T. Solutions LLC. All Rights Reserved.
*/

type TutorialPromptProps = Readonly<{
  step: 1 | 2 | 3;
  onDismiss: () => void;
}>;

const COPY: Record<1 | 2 | 3, string> = {
  1: "Select NMAP to scan the enemy. Each tool has a type.",
  2: "NMAP is a Recon tool. Recon is strong against Persistence (1.5x damage).",
  3: "Check the battle log below. It shows what happened each turn.",
};

export function TutorialPrompt({ step, onDismiss }: TutorialPromptProps) {
  return (
    <section
      data-testid="gr-tutorial-prompt"
      aria-label={`Tutorial step ${step}`}
      className="shrink-0 rounded-sm border border-[#00f0ff] bg-[#0a1220] px-2 py-1.5"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="gr-font-mono text-[10px] font-bold tracking-widest text-[#ff6b00]">
            TUTORIAL
          </p>
          <p className="gr-font-mono text-xs text-[#e0e0e0]">{COPY[step]}</p>
        </div>
        <button
          type="button"
          data-testid="gr-tutorial-dismiss"
          onClick={onDismiss}
          className="gr-font-mono shrink-0 self-center rounded-sm border border-[#00f0ff] bg-[#0f1b2d] px-2 py-1 text-[10px] font-bold tracking-widest text-[#00f0ff] active:brightness-150"
        >
          PRESS A
        </button>
      </div>
    </section>
  );
}
