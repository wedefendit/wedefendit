/*
Copyright © 2026 Defend I.T. Solutions LLC. All Rights Reserved.
*/

/**
 * Legacy shim. Zone display names now live in per-sector modules (see
 * `./sectors/sector-01.ts` `zoneNames` / `zoneLabels` exports). This file
 * preserves the old uppercase import path for any consumer that still
 * references `ZONE_NAMES` / `ZONE_LABELS`.
 */

export { zoneNames as ZONE_NAMES, zoneLabels as ZONE_LABELS } from "./sectors";
