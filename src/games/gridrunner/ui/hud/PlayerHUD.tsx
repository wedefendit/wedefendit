/*
Copyright © 2026 Defend I.T. Solutions LLC. All Rights Reserved.
*/

import type { PlayerState } from "../../engine/types";
import { HpBar } from "../shared/HpBar";

type PlayerHUDProps = Readonly<{
  player: PlayerState;
  playerName: string;
  bits: number;
  trackName?: string | null;
}>;

export function PlayerHUD({
  player,
  playerName,
  bits,
  trackName,
}: PlayerHUDProps) {
  const xpPct =
    player.xpToNext > 0
      ? Math.min(100, (player.xp / player.xpToNext) * 100)
      : 100;

  return (
    <aside
      data-testid="gr-player-hud"
      aria-label="Player status"
      className="gr-font-mono flex shrink-0 flex-col gap-0.5 border-b border-[#1a3a4a] bg-[#080c16] px-3 py-1"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold tracking-wider text-[#00f0ff]">
          {playerName}{" "}
          <span className="text-[#d0d8e0]">Lv.{player.level}</span>
        </span>
        <span className="text-xs font-semibold text-[#ff6b00]">
          {bits} Bits
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="min-w-[20px] text-xs font-semibold text-[#d0d8e0]">
          XP
        </span>
        <div className="relative h-1.5 flex-1 overflow-hidden rounded-sm border border-[#1a3a4a] bg-[#0d1520]">
          <div
            className="h-full bg-[#ff6b00] transition-[width] duration-300 ease-out"
            style={{ width: `${xpPct}%` }}
          />
        </div>
        <span className="min-w-[36px] text-right text-xs font-medium tabular-nums text-[#d0d8e0]">
          {player.xp}/{player.xpToNext}
        </span>
      </div>

      <HpBar current={player.integrity} max={player.maxIntegrity} color="cyan" label="HP" />
      <HpBar current={player.compute} max={player.maxCompute} color="magenta" label="EN" />

      {trackName && (
        <div className="text-center text-[10px] tracking-[0.1em] text-[#1a3a4a]">
          {trackName}
        </div>
      )}
    </aside>
  );
}
