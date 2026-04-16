/*
Copyright © 2026 Defend I.T. Solutions LLC. All Rights Reserved.
*/

"use client";

import { useEffect, useRef } from "react";
import type {
  BattleState,
  PlayerState,
  ToolInstance,
} from "../../engine/types";
import { toolDisplayName } from "../../engine/loot";
import { HpBar } from "../shared/HpBar";
import { TAG_COLORS, RARITY_TEXT } from "../shared/theme";

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

function LogLine({ line }: Readonly<{ line: string }>) {
  const tagMatch = line.match(/\[T\d+\]\s+\[(\w+)\]/);
  const tag = tagMatch?.[1] ?? "";
  const colorClass = TAG_COLORS[tag] ?? "text-[#6688aa]";
  const prefixEnd = line.indexOf("]", line.indexOf("]") + 1) + 1;
  const prefix = line.slice(0, prefixEnd);
  const message = line.slice(prefixEnd);

  return (
    <p className="py-0.5">
      <span className="text-[#6688aa]">{prefix}</span>
      <span className={`font-medium ${colorClass}`}>{message}</span>
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
      className="gr-font-mono min-h-[3.5rem] max-h-24 overflow-y-auto rounded-sm border border-[#1a3a4a] bg-[#060a12] px-2 py-1 text-xs"
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
      className="flex flex-1 flex-col overflow-hidden bg-[#0a0e1a] p-2"
    >
      {/* Arena -- enemy top-right, player bottom-left */}
      <div className="relative flex flex-1 min-h-0 flex-col justify-between px-2 py-1">
        {/* Enemy: top-right with HP */}
        <div className="flex items-start justify-end gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="gr-font-mono text-xs font-bold text-[#ff003c]">
              {battle.enemy.def.name}
            </span>
            <HpBar current={battle.enemy.hp} max={battle.enemy.maxHp} color="red" label="HP" />
          </div>
          <figure className="shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-[#ff003c] text-base font-bold text-[#0a0e1a] shadow-[0_0_12px_#ff003c44]">
              {battle.enemy.def.name.charAt(0).toUpperCase()}
            </div>
          </figure>
        </div>

        {/* Spacer for future battle animations */}
        <div className="flex-1" />

        {/* Player: bottom-left with HP + EN */}
        <div className="flex items-end gap-2">
          <figure className="shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-[#00f0ff] text-base font-bold text-[#0a0e1a] shadow-[0_0_12px_#00f0ff]">
              OP
            </div>
          </figure>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="gr-font-mono text-xs font-bold text-[#00f0ff]">
              {playerName} Lv.{player.level}
            </span>
            <HpBar current={player.integrity} max={player.maxIntegrity} color="cyan" label="HP" />
            <HpBar current={player.compute} max={player.maxCompute} color="magenta" label="EN" />
          </div>
        </div>
      </div>

      {/* Compact log */}
      <BattleLog log={battle.log} />

      {/* Tools: 2x2 grid + RUN row */}
      {!isOver && (
        <>
          <nav
            data-testid="gr-battle-actions"
            aria-label="Battle actions"
            className="grid shrink-0 grid-cols-2 gap-1 pt-1"
          >
            {equippedTools.map((tool, i) =>
              tool ? (
                <button
                  key={tool.id}
                  type="button"
                  data-testid={`gr-battle-tool-${i}`}
                  disabled={!isPlayerTurn || player.compute < tool.energyCost}
                  onClick={() => onUseTool(tool)}
                  className="gr-font-mono min-h-[44px] rounded-sm border border-[#00f0ff] bg-[#0f1b2d] px-2 py-1.5 text-center text-xs font-bold uppercase text-[#00f0ff] transition-opacity disabled:opacity-30"
                >
                  <span className="text-[#d0d8e0]">[{i + 1}]</span>{" "}
                  {tool.baseToolId}{" "}
                  <span className="opacity-70">{tool.energyCost}EN</span>
                </button>
              ) : null,
            )}
          </nav>
          <button
            type="button"
            data-testid="gr-battle-run"
            disabled={!isPlayerTurn}
            onClick={onRun}
            className="gr-font-mono mt-1 min-h-[44px] w-full shrink-0 rounded-sm border border-[#ff6b00] bg-[#0f1b2d] px-2 py-1.5 text-center text-xs font-bold uppercase text-[#ff6b00] transition-opacity disabled:opacity-30"
          >
            <span className="text-[#d0d8e0]">[5]</span> RUN
          </button>
        </>
      )}

      {/* Win / Lose result */}
      {isOver && (
        <div
          data-testid="gr-battle-result"
          className={`flex shrink-0 flex-col items-center gap-2 rounded-sm border-2 bg-[#0f1b2d] p-3 ${
            battle.phase === "won" ? "border-[#00ff41]" : "border-[#ff003c]"
          }`}
        >
          <p
            className={`gr-font-display text-base font-bold tracking-widest ${
              battle.phase === "won" ? "text-[#00ff41]" : "text-[#ff003c]"
            }`}
          >
            {battle.phase === "won"
              ? "THREAT NEUTRALIZED"
              : "SYSTEM COMPROMISED"}
          </p>
          {battle.phase === "won" && (
            <div className="flex flex-col items-center gap-1">
              <p className="gr-font-mono text-xs font-semibold text-[#00f0ff]">
                +{battle.xpEarned} XP | +{battle.bitsEarned} Bits
              </p>
              {battle.levelsGained > 0 && (
                <p className="gr-font-mono text-xs font-bold text-[#ff6b00]">
                  LEVEL UP +{battle.levelsGained}
                </p>
              )}
              {battle.lootDrop && (
                <p
                  className={`gr-font-mono text-xs font-semibold ${RARITY_TEXT[battle.lootDrop.rarity]}`}
                >
                  LOOT: {toolDisplayName(battle.lootDrop)}
                </p>
              )}
            </div>
          )}
          <button
            type="button"
            data-testid="gr-battle-continue"
            onClick={onBattleEnd}
            className="gr-font-mono mt-1 rounded-sm border-2 border-[#00f0ff] bg-[#0f1b2d] px-6 py-2 text-xs font-bold uppercase tracking-widest text-[#00f0ff]"
          >
            CONTINUE
          </button>
        </div>
      )}
    </section>
  );
}
