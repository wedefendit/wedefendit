/*
Copyright © 2026 Defend I.T. Solutions LLC. All Rights Reserved.
*/

/**
 * Legacy shim. Map data now lives in per-sector modules under
 * `../sectors/*` and is aggregated by `../sectors/index.ts`. This shim
 * preserves the `getMap` import path for any stray consumer.
 */

export { getMap, maps } from "../sectors";
