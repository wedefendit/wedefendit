/*
Copyright © 2026 Defend I.T. Solutions LLC. All Rights Reserved.
*/

import type { EnemyDef, GameMap, ZoneConfig } from "../../engine/types";
import type { ToolType } from "../../engine/types";

/**
 * Intel dossier content for a boss. Feeds the post-battle intel overlay and
 * the Operator screen's defeated-bosses list.
 */
export interface BossEntry {
  readonly id: string;
  readonly name: string;
  readonly nation: string;
  readonly sector: string;
  readonly weakness: ToolType;
  readonly background: string;
  readonly operations: string;
  readonly badgeId: string;
}

export type BadgeTier = "bronze" | "silver" | "gold";

export interface BadgeDef {
  readonly id: string;
  readonly label: string;
  readonly condition: string;
  readonly tier: BadgeTier;
}

/**
 * A sector module bundles every piece of data a sector owns. The aggregator
 * at `data/sectors/index.ts` walks all declared sectors and merges them into
 * the registries the engine and reducer consume.
 *
 * Shape contract:
 *   - `id`         — the sector id (e.g. "sector-01"). Also the zone id of
 *                     the sector's outdoor area.
 *   - `maps`       — keyed by zone id. At minimum contains an entry for
 *                     `this.id` (the outdoor map) plus any interior building
 *                     zones (arcade, bank, exchange, hospital, etc.).
 *   - `enemies`    — full EnemyDef stat blocks keyed by enemy id. The engine
 *                     looks up enemies by id during zone encounter rolls.
 *   - `bosses`     — full EnemyDef stat blocks keyed by boss id. Same engine
 *                     lookup path as enemies; separate map for clarity.
 *   - `zones`      — zone config (encounter rate + enemy pool) keyed by zone
 *                     id. Matches `maps` keys.
 *   - `intel`      — post-battle dossier text keyed by boss id. Driven by the
 *                     `unlockedIntelEntries` save field + the intel overlay.
 *   - `badges`     — badge definitions awarded for bosses + generic milestones.
 *   - `zoneNames`  — long display names (HUD header). E.g. "BANK -- FINANCIAL SECTOR".
 *   - `zoneLabels` — short display names (save-slot summary). E.g. "BANK".
 *
 * All keys except `id` / `badges` should be scoped to this sector; the
 * aggregator uses Object.assign so duplicate keys across sectors will
 * silently shadow the earlier sector. Flag a shared module when Sector 02
 * introduces an overlap.
 */
export interface SectorModule {
  readonly id: string;
  readonly maps: Readonly<Record<string, GameMap>>;
  readonly enemies: Readonly<Record<string, EnemyDef>>;
  readonly bosses: Readonly<Record<string, EnemyDef>>;
  readonly zones: Readonly<Record<string, ZoneConfig>>;
  readonly intel: Readonly<Record<string, BossEntry>>;
  readonly badges: readonly BadgeDef[];
  readonly zoneNames: Readonly<Record<string, string>>;
  readonly zoneLabels: Readonly<Record<string, string>>;
}
