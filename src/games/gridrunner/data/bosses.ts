/*
Copyright © 2026 Defend I.T. Solutions LLC. All Rights Reserved.
*/

/**
 * Legacy shim. The canonical intel + badge data lives in per-sector modules
 * under `./sectors/*` and is merged by `./sectors/index.ts`. This file exists
 * only to preserve the old `BOSSES` / `BADGES` / `BossEntry` / `BadgeDef` /
 * `BadgeTier` import paths used by locked components (OperatorScreen etc.)
 * which we cannot yet rewrite. New code should import from `./sectors`.
 */

export type { BossEntry, BadgeDef, BadgeTier } from "./sectors/types";
export { intel as BOSSES, badges as BADGES } from "./sectors";
