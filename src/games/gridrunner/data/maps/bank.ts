/*
Copyright © 2025 Defend I.T. Solutions LLC. All Rights Reserved.
*/

import type { GameMap, MapTile } from "../../engine/types";

const G: MapTile = { kind: "ground", walkable: true };
const W: MapTile = { kind: "wall", walkable: false };
const EXIT: MapTile = { kind: "entry", buildingId: "overworld", label: "Exit", walkable: true };
const BOSS: MapTile = { kind: "boss", bossId: "lazarus", label: "BOSS", walkable: true };

/** Vault decoration (non-walkable) */
const VLT: MapTile = { kind: "building", label: "Vault", walkable: false };

/** Terminal decoration (non-walkable) */
const TRM: MapTile = { kind: "building", label: "Terminal", walkable: false };

/**
 * 14 x 10 Bank interior (Medium Interior template).
 * Left room: main hall with terminals.
 * Right room: vault area with boss.
 * Corridor connects them through the middle.
 * Entry at bottom-left, boss at top-right.
 */
// prettier-ignore
const tiles: MapTile[][] = [
  /* row 0 */ [W,    W,    W,    W,    W,    W,    W,    W,    W,    W,    W,    W,    W,    W   ],
  /* row 1 */ [W,    TRM,  G,    G,    G,    W,    W,    G,    G,    G,    G,    BOSS, G,    W   ],
  /* row 2 */ [W,    G,    G,    G,    G,    W,    W,    G,    G,    VLT,  VLT,  G,    G,    W   ],
  /* row 3 */ [W,    G,    G,    G,    G,    G,    G,    G,    G,    G,    G,    G,    G,    W   ],
  /* row 4 */ [W,    G,    G,    TRM,  G,    W,    W,    G,    G,    G,    G,    G,    G,    W   ],
  /* row 5 */ [W,    G,    G,    G,    G,    W,    W,    G,    VLT,  G,    G,    VLT,  G,    W   ],
  /* row 6 */ [W,    G,    G,    G,    G,    G,    G,    G,    G,    G,    G,    G,    G,    W   ],
  /* row 7 */ [W,    G,    G,    G,    G,    W,    W,    G,    G,    G,    G,    G,    G,    W   ],
  /* row 8 */ [W,    EXIT, EXIT, G,    G,    W,    W,    G,    G,    G,    G,    G,    G,    W   ],
  /* row 9 */ [W,    W,    W,    W,    W,    W,    W,    W,    W,    W,    W,    W,    W,    W   ],
];

export const bankMap: GameMap = {
  id: "bank",
  width: 14,
  height: 10,
  tiles,
  spawn: { x: 2, y: 7 },
};
