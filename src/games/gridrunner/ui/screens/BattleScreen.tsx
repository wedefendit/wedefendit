/*
Copyright © 2025 Defend I.T. Solutions LLC. All Rights Reserved.
*/

import { useEffect, useRef } from "react";
import type { BattleState, PlayerState, ToolInstance } from "../../engine/types";

type BattleScreenProps = Readonly<{
  battle: BattleState;
  player: PlayerState;
  playerName: string;
  equippedTools: (ToolInstance | null)[];
  onUseTool: (tool: ToolInstance) => void;
  onRun: () => void;
  onBattleEnd: () => void;
}>;

/* ------------------------------------------------------------------ */
/*  Sub-components                                                    */
/* ------------------------------------------------------------------ */

function HpBar({
  current,
  max,
  color,
  label,
}: {
  current: number;
  max: number;
  color: "cyan" | "magenta" | "red";
  label: string;
}) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const colorMap = {
    cyan: { text: "text-[#00f0ff]", bar: "bg-[#00f0ff] shadow-[0_0_6px_#00f0ff]" },
    magenta: { text: "text-[#ff00de]", bar: "bg-[#ff00de] shadow-[0_0_6px_#ff00de]" },
    red: { text: "text-[#ff003c]", bar: "bg-[#ff003c] shadow-[0_0_6px_#ff003c]" },
  };
  const c = colorMap[color];

  return (
    <div className="flex items-center gap-2">
      <span className={`gr-font-mono shrink-0 min-w-[20px] text-xs ${c.text}`}>
        {label}
      </span>
      <div
        className="relative h-2.5 flex-1 overflow-hidden rounded-sm border border-[#1a3a4a] bg-[#0d1520]"
        role="meter"
        aria-label={`${label} ${current} of ${max}`}
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={`h-full transition-[width] duration-300 ease-out ${c.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="gr-font-mono shrink-0 min-w-[50px] text-right text-xs tabular-nums text-[#8899aa]">
        {current}/{max}
      </span>
    </div>
  );
}

const TAG_COLORS: Record<string, string> = {
  SYS: "text-[#00f0ff]",
  ATK: "text-[#00f0ff]",
  HIT: "text-[#00ff41]",
  MISS: "text-[#8899aa]",
  DMG: "text-[#ff003c]",
  HEAL: "text-[#ff00de]",
  WIN: "text-[#00ff41]",
  LOSS: "text-[#ff003c]",
  WARN: "text-[#ff6b00]",
  RUN: "text-[#ff6b00]",
};

function LogLine({ line }: Readonly<{ line: string }>) {
  const tagMatch = line.match(/\[T\d+\]\s+\[(\w+)\]/);
  const tag = tagMatch?.[1] ?? "";
  const colorClass = TAG_COLORS[tag] ?? "text-[#6688aa]";

  // Split into timestamp+tag prefix and message
  const prefixEnd = line.indexOf("]", line.indexOf("]") + 1) + 1;
  const prefix = line.slice(0, prefixEnd);
  const message = line.slice(prefixEnd);

  return (
    <p className="py-0.5">
      <span className="text-[#4a5568]">{prefix}</span>
      <span className={colorClass}>{message}</span>
    </p>
  );
}

function BattleLog({ log }: Readonly<{ log: string[] }>) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log.length]);

  return (
    <div
      data-testid="gr-battle-log"
      className="gr-font-mono flex-1 min-h-0 overflow-y-auto rounded-sm border border-[#1a3a4a] bg-[#060a12] p-2 text-[clamp(9px,1.5vw,12px)]"
    >
      {log.map((line, i) => (
        <LogLine key={i} line={line} />
      ))}
      <div ref={endRef} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main screen                                                       */
/* ------------------------------------------------------------------ */

export function BattleScreen({
  battle,
  player,
  playerName,
  equippedTools,
  onUseTool,
  onRun,
  onBattleEnd,
}: BattleScreenProps) {
  const isOver = battle.phase === "won" || battle.phase === "lost";
  const isPlayerTurn = battle.phase === "player_turn";

  return (
    <section
      data-testid="gr-battle"
      aria-label="Battle"
      className="flex flex-1 flex-col gap-2 overflow-hidden bg-[#0a0e1a] p-2 sm:p-3"
    >
      {/* Arena: player left, enemy right */}
      <div className="flex items-center justify-around py-2 sm:py-4">
        <figure className="flex flex-col items-center gap-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-[#00f0ff] text-base font-bold text-[#0a0e1a] shadow-[0_0_12px_#00f0ff]">
            OP
          </div>
          <figcaption className="gr-font-mono text-xs text-[#00f0ff]">
            {playerName}
          </figcaption>
        </figure>

        <span className="gr-font-display text-lg font-bold text-[#1a3a4a]">
          VS
        </span>

        <figure className="flex flex-col items-center gap-1">
          <div className="gr-font-mono flex h-10 w-10 items-center justify-center rounded-sm bg-[#ff003c] text-[10px] font-bold text-[#0a0e1a] shadow-[0_0_12px_#ff003c44]">
            {battle.enemy.def.name.charAt(0).toUpperCase()}
          </div>
          <figcaption className="gr-font-mono text-xs text-[#ff003c]">
            {battle.enemy.def.name}
          </figcaption>
        </figure>
      </div>

      {/* Status bars */}
      <div className="flex flex-col gap-1">
        <HpBar current={player.integrity} max={player.maxIntegrity} color="cyan" label="HP" />
        <HpBar current={player.compute} max={player.maxCompute} color="magenta" label="EN" />
        <HpBar current={battle.enemy.hp} max={battle.enemy.maxHp} color="red" label="THREAT" />
      </div>

      {/* Battle log */}
      <BattleLog log={battle.log} />

      {/* Actions */}
      {!isOver && (
        <nav
          data-testid="gr-battle-actions"
          aria-label="Battle actions"
          className="flex flex-wrap gap-1.5 sm:gap-2"
        >
          {equippedTools.map((tool, i) =>
            tool ? (
              <button
                key={tool.id}
                type="button"
                data-testid={`gr-battle-tool-${i}`}
                disabled={!isPlayerTurn || player.compute < tool.energyCost}
                onClick={() => onUseTool(tool)}
                className="gr-font-mono flex-1 min-w-0 rounded-sm border border-[#00f0ff] bg-[#0f1b2d] px-2 py-2.5 text-xs font-bold uppercase tracking-wider text-[#00f0ff] transition-opacity disabled:opacity-30"
              >
                <span className="block truncate">{tool.baseToolId}</span>
                <span className="block text-[9px] opacity-50">{tool.energyCost} EN</span>
              </button>
            ) : null,
          )}
          <button
            type="button"
            data-testid="gr-battle-run"
            disabled={!isPlayerTurn}
            onClick={onRun}
            className="gr-font-mono rounded-sm border border-[#ff6b00] bg-[#0f1b2d] px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-[#ff6b00] transition-opacity disabled:opacity-30"
          >
            RUN
          </button>
        </nav>
      )}

      {/* Win / Lose result */}
      {isOver && (
        <div
          data-testid="gr-battle-result"
          className={`flex flex-col items-center gap-2 rounded-sm border-2 bg-[#0f1b2d] p-3 ${
            battle.phase === "won" ? "border-[#00ff41]" : "border-[#ff003c]"
          }`}
        >
          <p
            className={`gr-font-display text-lg font-bold tracking-widest ${
              battle.phase === "won" ? "text-[#00ff41]" : "text-[#ff003c]"
            }`}
          >
            {battle.phase === "won" ? "THREAT NEUTRALIZED" : "SYSTEM COMPROMISED"}
          </p>
          {battle.phase === "won" && (
            <p className="gr-font-mono text-xs text-[#00f0ff]">
              +{battle.xpEarned} XP | +{battle.bitsEarned} Bits
            </p>
          )}
          <button
            type="button"
            data-testid="gr-battle-continue"
            onClick={onBattleEnd}
            className="gr-font-mono mt-1 rounded-sm border-2 border-[#00f0ff] bg-[#0f1b2d] px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-[#00f0ff]"
          >
            CONTINUE
          </button>
        </div>
      )}
    </section>
  );
}
