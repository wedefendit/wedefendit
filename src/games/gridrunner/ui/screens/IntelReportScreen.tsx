/*
Copyright © 2026 Defend I.T. Solutions LLC. All Rights Reserved.
*/

"use client";

import { BADGES, BOSSES } from "../../data/bosses";
import { Button } from "../shared/Button";
import { OverlayShell } from "../shared/OverlayShell";

type IntelReportScreenProps = Readonly<{
  bossId: string;
  onClose: () => void;
}>;

function SectionHeader({ children }: Readonly<{ children: string }>) {
  return (
    <h3 className="gr-font-mono mt-3 text-xs font-bold tracking-widest text-[#ff6b00]">
      {children}
    </h3>
  );
}

export function IntelReportScreen({ bossId, onClose }: IntelReportScreenProps) {
  const boss = BOSSES[bossId];

  if (!boss) {
    return (
      <OverlayShell
        testId="gr-intel-overlay"
        title="INTEL REPORT"
        onClose={onClose}
      >
        <p className="gr-font-mono text-xs text-[#aabbcc]">
          No intel on file for {bossId}.
        </p>
      </OverlayShell>
    );
  }

  const badge = BADGES.find((b) => b.id === boss.badgeId);

  return (
    <OverlayShell
      testId="gr-intel-overlay"
      title="INTEL REPORT"
      onClose={onClose}
    >
      <header className="flex items-center gap-3">
        <figure className="shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-[#ff003c] text-lg font-bold text-[#0a0e1a] shadow-[0_0_12px_#ff003c44]">
            {boss.name.charAt(0)}
          </div>
        </figure>
        <div className="min-w-0">
          <h3 className="gr-font-display text-base font-bold tracking-widest text-[#ff003c]">
            {boss.name.toUpperCase()}
          </h3>
          <p className="gr-font-mono text-xs text-[#aabbcc]">
            {boss.nation} -- {boss.sector}
          </p>
        </div>
      </header>

      <section>
        <SectionHeader>BACKGROUND</SectionHeader>
        <p className="gr-font-mono text-xs leading-snug text-[#e0e0e0]">
          {boss.background}
        </p>
      </section>

      <section>
        <SectionHeader>KNOWN OPERATIONS</SectionHeader>
        <p className="gr-font-mono text-xs leading-snug text-[#e0e0e0]">
          {boss.operations}
        </p>
      </section>

      <section>
        <SectionHeader>WEAKNESS</SectionHeader>
        <span
          className="gr-font-mono inline-block rounded-sm border border-[#00ff41] bg-[#0a1220] px-2 py-0.5 text-xs font-bold tracking-widest text-[#00ff41]"
          data-testid="gr-intel-weakness"
        >
          {boss.weakness.toUpperCase()} (1.5x)
        </span>
      </section>

      {badge && (
        <section>
          <SectionHeader>BADGE EARNED</SectionHeader>
          <span
            className="gr-font-mono inline-block rounded-sm border border-[#ff6b00] bg-[#1a1006] px-2 py-0.5 text-xs font-bold tracking-widest text-[#ff6b00]"
            data-testid="gr-intel-badge"
          >
            {badge.label.toUpperCase()} -- {badge.tier.toUpperCase()}
          </span>
        </section>
      )}

      <div className="pt-4">
        <Button
          variant="primary"
          onClick={onClose}
          testId="gr-intel-continue"
          className="w-full text-sm py-2.5"
        >
          CONTINUE
        </Button>
      </div>
    </OverlayShell>
  );
}
