/*
Copyright © 2026 Defend I.T. Solutions LLC. All Rights Reserved.
*/

import { describe, it, expect } from "vitest";
import { resolvePlayerTurn, createBattle, processLevelUp } from "./battle";
import { bosses } from "./enemies";
import type { PlayerState, ToolInstance, BattleState } from "./types";

/**
 * Simulate a full fight: player uses tools in order, cycling through them,
 * until either the boss dies or the player runs out of Compute/HP.
 * Returns { won, turnsUsed, hpRemaining, computeRemaining }.
 */
function simulateFight(
  player: PlayerState,
  tools: ToolInstance[],
  battle: BattleState,
): { won: boolean; turnsUsed: number; damageDealt: number } {
  let p = { ...player };
  let b = { ...battle };
  let turns = 0;
  const startHp = b.enemy.hp;

  // Use tools in round-robin, skip if not enough energy
  while (b.phase === "player_turn" && turns < 50) {
    let usedTool = false;
    for (const tool of tools) {
      if (p.compute >= tool.energyCost) {
        const result = resolvePlayerTurn(tool, p, b);
        p = result.player;
        b = result.state;
        turns++;
        usedTool = true;
        break;
      }
    }
    // No tool affordable -- fight is lost due to energy
    if (!usedTool) break;
    if (b.phase === "won" || b.phase === "lost") break;
  }

  return {
    won: b.phase === "won",
    turnsUsed: turns,
    damageDealt: startHp - b.enemy.hp,
  };
}

/** Create a level N player with scaled stats matching the level-up logic */
function playerAtLevel(level: number): PlayerState {
  let p: PlayerState = {
    level: 1,
    xp: 0,
    xpToNext: 50,
    integrity: 100,
    maxIntegrity: 100,
    compute: 60,
    maxCompute: 60,
    bandwidth: 10,
    firewall: 5,
  };
  for (let i = 1; i < level; i++) {
    p = {
      ...p,
      level: p.level + 1,
      maxIntegrity: p.maxIntegrity + 10,
      integrity: p.maxIntegrity + 10,
      maxCompute: p.maxCompute + 8,
      compute: p.maxCompute + 8,
      bandwidth: p.bandwidth + 1,
      firewall: p.firewall + 1,
      xpToNext: Math.round(p.xpToNext * 1.5),
    };
  }
  return p;
}

const STARTER_TOOLS: ToolInstance[] = [
  {
    id: "s-met",
    baseToolId: "metasploit",
    rarity: "common",
    power: 35,
    accuracy: 75,
    energyCost: 15,
    prefix: null,
    suffix: null,
    type: "exploit",
  },
  {
    id: "s-nmap",
    baseToolId: "nmap",
    rarity: "common",
    power: 15,
    accuracy: 95,
    energyCost: 5,
    prefix: null,
    suffix: null,
    type: "recon",
  },
  {
    id: "s-wire",
    baseToolId: "wireshark",
    rarity: "common",
    power: 10,
    accuracy: 100,
    energyCost: 3,
    prefix: null,
    suffix: null,
    type: "recon",
  },
  {
    id: "s-fw",
    baseToolId: "firewall-rule",
    rarity: "common",
    power: 12,
    accuracy: 85,
    energyCost: 8,
    prefix: null,
    suffix: null,
    type: "defense",
  },
];

describe("processLevelUp", () => {
  function freshPlayer(): PlayerState {
    return {
      level: 1,
      xp: 0,
      xpToNext: 50,
      integrity: 100,
      maxIntegrity: 100,
      compute: 60,
      maxCompute: 60,
      bandwidth: 10,
      firewall: 5,
    };
  }

  it("no XP gain returns same player and zero levels", () => {
    const result = processLevelUp(freshPlayer(), 0);
    expect(result.levelsGained).toBe(0);
    expect(result.oldLevel).toBe(1);
    expect(result.newLevel).toBe(1);
    expect(result.statDeltas).toEqual({ hp: 0, en: 0, spd: 0, def: 0 });
    expect(result.player.xp).toBe(0);
  });

  it("XP below threshold accrues but does not level", () => {
    const result = processLevelUp(freshPlayer(), 30);
    expect(result.levelsGained).toBe(0);
    expect(result.player.xp).toBe(30);
    expect(result.player.level).toBe(1);
  });

  it("XP at threshold levels exactly once with correct deltas", () => {
    const result = processLevelUp(freshPlayer(), 50);
    expect(result.levelsGained).toBe(1);
    expect(result.oldLevel).toBe(1);
    expect(result.newLevel).toBe(2);
    expect(result.statDeltas).toEqual({ hp: 10, en: 8, spd: 1, def: 1 });
    expect(result.player.xp).toBe(0);
    expect(result.player.xpToNext).toBe(75);
  });

  it("excess XP carries into next level", () => {
    const result = processLevelUp(freshPlayer(), 60);
    expect(result.levelsGained).toBe(1);
    expect(result.player.xp).toBe(10);
    expect(result.player.level).toBe(2);
  });

  it("multi-level gain accumulates stat deltas", () => {
    // 50 + 75 = 125 XP -> level 1 -> 3
    const result = processLevelUp(freshPlayer(), 125);
    expect(result.levelsGained).toBe(2);
    expect(result.oldLevel).toBe(1);
    expect(result.newLevel).toBe(3);
    expect(result.statDeltas).toEqual({ hp: 20, en: 16, spd: 2, def: 2 });
    expect(result.player.xp).toBe(0);
  });

  it("caps at level 20", () => {
    const cappedPlayer: PlayerState = {
      ...freshPlayer(),
      level: 20,
      xp: 0,
      xpToNext: 999999,
    };
    const result = processLevelUp(cappedPlayer, 1000000);
    expect(result.levelsGained).toBe(0);
    expect(result.newLevel).toBe(20);
  });
});

describe("Battle balance -- Lazarus must be beatable", () => {
  it("Lazarus boss exists with defense weakness", () => {
    const laz = bosses.lazarus;
    expect(laz).toBeDefined();
    expect(laz.weakness).toBe("defense");
  });

  it("a level 5 player has enough max Compute to theoretically deal Lazarus HP in damage", () => {
    const player = playerAtLevel(5);
    // Calculate maximum possible damage output with all Compute spent
    // Using the cheapest tool (Wireshark: 3 energy, 10 power - boss defense)
    const bossDefense = bosses.lazarus.defense;
    const cheapDmgPerUse = Math.max(1, 10 - bossDefense);
    const maxUses = Math.floor(player.maxCompute / 3);
    const theoreticalMax = maxUses * cheapDmgPerUse;
    // Must be able to deal at least boss HP in damage with perfect accuracy
    expect(theoreticalMax).toBeGreaterThanOrEqual(bosses.lazarus.baseHp);
  });

  it("a level 7 player with starter tools wins Lazarus in a best-case sim (100 runs)", () => {
    const player = playerAtLevel(7);
    const bossEnemy = {
      def: bosses.lazarus,
      hp: bosses.lazarus.baseHp,
      maxHp: bosses.lazarus.baseHp,
    };
    let wins = 0;
    const runs = 100;

    for (let i = 0; i < runs; i++) {
      const battle = createBattle(bossEnemy, true);
      // Sort tools by raw power descending: use strongest first, fall back to cheap when low energy
      const sortedTools = [...STARTER_TOOLS]
        .sort((a, b) => b.power - a.power)
        .filter((t) => t.power > 0);

      const result = simulateFight(player, sortedTools, battle);
      if (result.won) wins++;
    }

    // Player should win at least 20% of the time with just starters at level 7
    expect(wins).toBeGreaterThanOrEqual(20);
  });
});
