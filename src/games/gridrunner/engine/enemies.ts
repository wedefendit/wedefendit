/*
Copyright © 2026 Defend I.T. Solutions LLC. All Rights Reserved.
*/

/**
 * Enemy / boss / encounter helpers.
 *
 * Data (enemy defs, boss defs, zone configs) lives in sector modules under
 * `../data/sectors/*`. This module imports the merged registries from the
 * aggregator and exposes helpers that read from them. Anyone who needs raw
 * data dicts should import from `../data/sectors` directly.
 */

import type { BattleEnemy, EnemyMove } from "./types";
import { bosses, enemies, zones } from "../data/sectors";

// Re-export the merged registries here for historical consumers that still
// import `enemies` / `bosses` / `zones` from `engine/enemies`. New code
// should import from `../data/sectors` directly.
export { bosses, enemies, zones } from "../data/sectors";

/** Build a live BattleEnemy at the player's current level from a stat block. */
export function spawnEnemy(
  enemyId: string,
  playerLevel: number,
): BattleEnemy {
  const def = enemies[enemyId] ?? bosses[enemyId];
  if (!def) throw new Error(`Unknown enemy: ${enemyId}`);
  const scaledHp = def.baseHp + playerLevel * 3;
  return { def, hp: scaledHp, maxHp: scaledHp };
}

/** Pick a random enemy id from a zone's encounter pool. */
export function pickRandomEnemy(zone: string): string | null {
  const config = zones[zone];
  if (!config || config.enemies.length === 0) return null;
  return config.enemies[Math.floor(Math.random() * config.enemies.length)];
}

/** Roll a zone's per-step encounter chance. */
export function shouldEncounter(zone: string): boolean {
  const config = zones[zone];
  if (!config) return false;
  return Math.random() < config.encounterRate;
}

/** Weighted random pick from an enemy's moveset. */
export function pickEnemyMove(enemy: BattleEnemy): EnemyMove {
  const totalWeight = enemy.def.moves.reduce((s, m) => s + m.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const move of enemy.def.moves) {
    roll -= move.weight;
    if (roll <= 0) return move;
  }
  return enemy.def.moves[0];
}
