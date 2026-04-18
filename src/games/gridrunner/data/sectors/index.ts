/*
Copyright © 2026 Defend I.T. Solutions LLC. All Rights Reserved.
*/

/**
 * Sector aggregator. Imports every sector module and merges their data into
 * flat registries the engine and reducer consume.
 *
 * Adding a new sector:
 *   1. Author `sector-NN.ts` following the SectorModule shape.
 *   2. Import and add to the `SECTORS` array below.
 *   3. That's it. Maps, enemies, bosses, zones, intel, badges, and zone
 *      display names all surface automatically.
 *
 * Duplicate-id policy (see ./types.ts for detail):
 *   - Enemies, bosses, zones, maps, intel: duplicate ids across sectors are
 *     silently shadowed by the later sector. When a real collision arises,
 *     lift the shared entity into a shared module instead.
 *   - Badges: deduplicated by id here.
 */

import type { EnemyDef, GameMap, ZoneConfig } from "../../engine/types";
import type { BadgeDef, BossEntry, SectorModule } from "./types";
import { sector01 } from "./sector-01";

const SECTORS: readonly SectorModule[] = [sector01];

function mergeDicts<T>(
  pick: (s: SectorModule) => Readonly<Record<string, T>>,
): Record<string, T> {
  const out: Record<string, T> = {};
  for (const s of SECTORS) Object.assign(out, pick(s));
  return out;
}

export const maps: Record<string, GameMap> = mergeDicts((s) => s.maps);
export const enemies: Record<string, EnemyDef> = mergeDicts((s) => s.enemies);
export const bosses: Record<string, EnemyDef> = mergeDicts((s) => s.bosses);
export const zones: Record<string, ZoneConfig> = mergeDicts((s) => s.zones);
export const intel: Record<string, BossEntry> = mergeDicts((s) => s.intel);
export const zoneNames: Record<string, string> = mergeDicts((s) => s.zoneNames);
export const zoneLabels: Record<string, string> = mergeDicts(
  (s) => s.zoneLabels,
);

// Badges: concat, dedup by id (last write wins on duplicates).
export const badges: readonly BadgeDef[] = (() => {
  const byId = new Map<string, BadgeDef>();
  for (const s of SECTORS) {
    for (const b of s.badges) byId.set(b.id, b);
  }
  return [...byId.values()];
})();

/** Look up a zone's map by id. Returns undefined if the zone is unregistered. */
export function getMap(id: string): GameMap | undefined {
  return maps[id];
}
