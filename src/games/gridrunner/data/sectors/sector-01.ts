/*
Copyright © 2026 Defend I.T. Solutions LLC. All Rights Reserved.
*/

/**
 * ============================================================================
 * SECTOR 01 -- The Outer Grid
 * ============================================================================
 *
 * This file is the single source of truth for Sector 01. One TS file per
 * sector, no spaghetti. When Sector 02 ships, author `sector-02.ts` with the
 * same shape and register it in `./index.ts`.
 *
 * Contains:
 *   - Outdoor map (the 60x40 ASCII grid + parser)
 *   - Three interior maps: Arcade (hub), Bank (Lazarus gym), Crypto Exchange
 *     (TraderTraitor mini-boss)
 *   - Enemy stat blocks (cross-sector enemies live here until Sector 02
 *     needs them; then we lift into a shared module)
 *   - Boss stat blocks (Lazarus, TraderTraitor)
 *   - Zone configs (encounter rate + enemy pool per zone)
 *   - Intel dossier text for both bosses
 *   - Badge definitions (V1 ships all five here because Sector 01 IS V1)
 *   - Zone display names (long + short)
 */

import type {
  EnemyDef,
  GameMap,
  MapTile,
  TileKind,
  ZoneConfig,
} from "../../engine/types";
import type { BadgeDef, BossEntry, SectorModule } from "./types";

/* ------------------------------------------------------------------ */
/*  OUTDOOR MAP -- Sector 01 ASCII grid                               */
/* ------------------------------------------------------------------ */

const SECTOR_01_ASCII = [
  "############################################################",
  "#.....gggggggggggggggggg......gggggggggggggggggggggg......g#",
  "#.....gggggggggggggggggg......gggggggggggggggggggggg......g#",
  "#.....AAAAgggggggggggggggggggggggggggggggggggggggggg......g#",
  "#...ggAAAAggggggggggggDDD~~~DDDDgggggggggggggDDDDDDg......g#",
  "#...ggAAggggggggggggggDDD~~~DDDDggggggBBBBBggDDDDDDgggggggg#",
  "#...ggAAagggggggggggggDDD~~~DDDDggggggBBBBBggggdggggggggggg#",
  "#...gggggggggggggggggggd~~~~~d~ggggggggBBBggggggggggggggggg#",
  "#ggggggggggggggggggggggg~~~~~~~~~gggggggbgggg~~~~~~~~gggggg#",
  "#ggggggggggggggggggggggggggggg~~~gggggggggggg~~~~~~~~gggggg#",
  "#gggggggggggggSgggggggggggggggggggggggggggggg~~~~~~~~gggggg#",
  "#gggggggggggggggggggggggggggggggggggggggggggg~~~~~~~~gggggg#",
  "#gggggggggggggggggggggggggggggggggggggggggggg~~~~~~~~gggggg#",
  "#ggggggg~~~~ggggggggggggggggggggggggggggggggg~~~~~~~~gg....#",
  "#ggggggg~~~~gggggggggggggggg....ggggggggggggggggggggggg....#",
  "#ggggggg~~~~~~gggggggggggggg...DDDggggggggDDggggggggggg....#",
  "#ggggggggggggggg~~~~~~~~~ggg...DDDggggggggDDggggggggggg....#",
  "#gggggDDDDgggggg~~~~~~~~~ggggggDDDggggggd~DDggggggggggg....#",
  "#..gggDDDDgggDDD~~~~~~~~DDDDDgggdgggggggD~DDggggggggggg....#",
  "#..gggDDDDgggD~D~~~~~~~~DDDDDggg~~~~~~~~~~g...ggggggggg....#",
  "#..ggggdggggg~~D~~~~~~~~~DDDgggg~~~~~~~~~~g...ggggggggggggg#",
  "#..ggggggggggD~D~~~~~~~~~gdggggg~~~~~~~~~~g...ggggggggggggg#",
  "#..ggggggggggDDD~~~~~~~~~gggggggggggggggggggggggggggggggggg#",
  "#..gggggggggggdg~~~~~~~~~gggggggggggggggggggggggggggggDDDgg#",
  "#ggggggggggggggg~~~~~~~~~ggggggggggggggggg~~~~~~~~~~~~D~D~~#",
  "#ggggggggggggggggggggggggggggggg~~~~~~~~~~~~~~~~~~~~~~~~D~~#",
  "#....ggggggggggggggggggggggggggg~~~~~~~~~~~~~~~~~~~~~~D~D~~#",
  "#....gggggggggggggggggggDDDDgggggggggggg~~~~~~gggXXX~~DDD~~#",
  "#....gggDDDDDDgggggggggg~~~Dgggggggggggg~~~~~~gggXXX~~~d~~~#",
  "#....gggDDDDDDggggggggggDDDDgggggggg~~~ggg~~~~ggxXXX~~~~~~~#",
  "#....gggggdggggg~~~~~~~~~dgggggggggg~~~ggg~~~~gggXXX~~~~~~~#",
  "#~~~~~~~ggg~~~ggg~~~~~~~~ggggggggggg~~~ggg~~~~gggXXX~~~~~~~#",
  "#~~~~~~~ggg~~~ggg~~~~~~~~ggggggggggg~~~ggg~~~~~~~~~~~~~~~~~#",
  "#~~~~~~~ggg~~~ggg~~~~~~gg......ggggggggggg~~~~~~~~~~gggggg~#",
  "#~~~~~~~ggg~~~ggg~~~~~~gg......ggggggggggg~~~~~~~~~~ggggggG#",
  "#~~~~~~~~~~~~~ggg~~~~~~gg......ggggggggggg~~~~~~~~~~ggggggg#",
  "#~~~~~~~~~~~~~ggg~~~~~~~~......ggggggggggg~~~~~~~~~~~~~~~gg#",
  "#~~~~~~~~~~~~~ggg~~~~~~~~......ggggggggggg~~~~~~~~~~~~~~~gg#",
  "#~~~~~~~~~~~~~gggggggggggggggggggggggggggg~~~~~~~~~~~~~~~gg#",
  "############################################################",
];

const OUTDOOR_WIDTH = 60;
const OUTDOOR_HEIGHT = 40;

/**
 * ASCII character → TileKind.
 *   `#`  wall (boundary)
 *   `.`  void (non-walkable empty space between traces)
 *   `g`  grid path trunk (walkable, no encounter)
 *   `~`  Digital Sea tile (walkable, rolls encounter)
 *   `S`  player spawn
 *   `G`  Sector 02 gate (blocks movement, no label)
 *   `A` Arcade body / `a` Arcade door
 *   `B` Bank body / `b` Bank door
 *   `X` Crypto Exchange body / `x` Crypto locked door
 *   `D` decorative building body / `d` decorative facade (fake door)
 */
function kindFor(ch: string): TileKind {
  switch (ch) {
    case "#":
    case ".":
      return "wall";
    case "g":
      return "ground";
    case "~":
      return "sea";
    case "S":
      return "spawn";
    case "G":
      return "gate";
    case "A":
    case "B":
    case "X":
    case "D":
      return "building";
    case "a":
    case "b":
      return "entry";
    case "x":
      return "locked";
    case "d":
      return "facade";
    default:
      throw new Error(`Unknown map character: "${ch}"`);
  }
}

function isDecor(ch: string): boolean {
  return ch === "D" || ch === "d";
}

/**
 * Flood-fill to assign a shared `buildingId` to every contiguous run of
 * decorative tiles ({D, d}). Components are numbered in row-major discovery
 * order as `decor-01`, `decor-02`, ... for debugging.
 */
function assignDecorIds(grid: string[][]): string[][] {
  const ids: string[][] = Array.from({ length: OUTDOOR_HEIGHT }, () =>
    new Array<string>(OUTDOOR_WIDTH).fill(""),
  );
  let counter = 0;

  for (let y = 0; y < OUTDOOR_HEIGHT; y++) {
    for (let x = 0; x < OUTDOOR_WIDTH; x++) {
      if (!isDecor(grid[y][x]) || ids[y][x] !== "") continue;

      counter++;
      const id = `decor-${String(counter).padStart(2, "0")}`;
      const queue: [number, number][] = [[x, y]];
      ids[y][x] = id;
      while (queue.length > 0) {
        const [cx, cy] = queue.shift() as [number, number];
        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx < 0 || nx >= OUTDOOR_WIDTH) continue;
          if (ny < 0 || ny >= OUTDOOR_HEIGHT) continue;
          if (!isDecor(grid[ny][nx]) || ids[ny][nx] !== "") continue;
          ids[ny][nx] = id;
          queue.push([nx, ny]);
        }
      }
    }
  }

  return ids;
}

/**
 * Convert a character plus its decor id into a fully-populated MapTile.
 * Gate tiles intentionally have no label per the Sector 02 gate contract
 * (looks like a dead-end trace until the M4 unlock ships).
 */
function buildTile(ch: string, decorId: string): MapTile {
  const kind = kindFor(ch);
  switch (ch) {
    case "A":
      return { kind, walkable: false, buildingId: "arcade" };
    case "a":
      return { kind, walkable: true, buildingId: "arcade", label: "Arcade" };
    case "B":
      return { kind, walkable: false, buildingId: "bank" };
    case "b":
      return { kind, walkable: true, buildingId: "bank", label: "Bank" };
    case "X":
      return { kind, walkable: false, buildingId: "exchange" };
    case "x":
      return {
        kind,
        walkable: false,
        buildingId: "exchange",
        label: "Crypto Exchange",
      };
    case "D":
    case "d":
      return { kind, walkable: false, buildingId: decorId };
    case "G":
    case "#":
    case ".":
      return { kind, walkable: false };
    case "g":
    case "~":
    case "S":
      return { kind, walkable: true };
    default:
      throw new Error(`Unknown map character: "${ch}"`);
  }
}

function parseOutdoorMap(rows: readonly string[]): MapTile[][] {
  if (rows.length !== OUTDOOR_HEIGHT) {
    throw new Error(
      `Sector 01 outdoor map has ${rows.length} rows, expected ${OUTDOOR_HEIGHT}`,
    );
  }
  const grid: string[][] = rows.map((r) => {
    if (r.length !== OUTDOOR_WIDTH) {
      throw new Error(
        `Sector 01 outdoor row has ${r.length} cols, expected ${OUTDOOR_WIDTH}: "${r}"`,
      );
    }
    return Array.from(r);
  });

  const decorIds = assignDecorIds(grid);
  const tiles: MapTile[][] = [];
  for (let y = 0; y < OUTDOOR_HEIGHT; y++) {
    const row: MapTile[] = [];
    for (let x = 0; x < OUTDOOR_WIDTH; x++) {
      row.push(buildTile(grid[y][x], decorIds[y][x]));
    }
    tiles.push(row);
  }
  return tiles;
}

const outdoorMap: GameMap = {
  id: "sector-01",
  width: OUTDOOR_WIDTH,
  height: OUTDOOR_HEIGHT,
  tiles: parseOutdoorMap(SECTOR_01_ASCII),
  spawn: { x: 14, y: 10 },
};

/* ------------------------------------------------------------------ */
/*  INTERIOR MAPS -- typed tile factories                             */
/* ------------------------------------------------------------------ */

// Shared interior tile factories. Kept local to this file since interior
// layouts are sector-specific.
const WALL: MapTile = { kind: "wall", walkable: false };
const GROUND: MapTile = { kind: "ground", walkable: true };
const EXIT_TILE: MapTile = {
  kind: "entry",
  buildingId: "sector-01", // exit returns the player to Sector 01's outdoor zone
  label: "Exit",
  walkable: true,
};

/* ---------- Arcade (12x10) ---------- */

const ARC: MapTile = { kind: "building", label: "Arcade", walkable: false };
const SHOP: MapTile = {
  kind: "building",
  buildingId: "shop",
  label: "Shop",
  walkable: true,
};
const SAVE_TILE: MapTile = {
  kind: "building",
  buildingId: "save",
  label: "Save",
  walkable: true,
};

// prettier-ignore
const arcadeTiles: MapTile[][] = [
  /* row 0 */ [WALL,   WALL,   WALL,   WALL,   WALL,   WALL,   WALL,   WALL,   WALL,   WALL,   WALL,   WALL  ],
  /* row 1 */ [WALL,   ARC,    ARC,    GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, ARC,    ARC,    WALL  ],
  /* row 2 */ [WALL,   GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, WALL  ],
  /* row 3 */ [WALL,   GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, WALL  ],
  /* row 4 */ [WALL,   GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, SHOP,   GROUND, WALL  ],
  /* row 5 */ [WALL,   GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, WALL  ],
  /* row 6 */ [WALL,   GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, SAVE_TILE, GROUND, WALL  ],
  /* row 7 */ [WALL,   GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, WALL  ],
  /* row 8 */ [WALL,   GROUND, GROUND, GROUND, GROUND, EXIT_TILE, EXIT_TILE, GROUND, GROUND, GROUND, GROUND, WALL  ],
  /* row 9 */ [WALL,   WALL,   WALL,   WALL,   WALL,   WALL,   WALL,   WALL,   WALL,   WALL,   WALL,   WALL  ],
];

const arcadeMap: GameMap = {
  id: "arcade",
  width: 12,
  height: 10,
  tiles: arcadeTiles,
  spawn: { x: 5, y: 7 },
};

/* ---------- Bank (14x10) -- Lazarus gym ---------- */

const VLT: MapTile = { kind: "building", label: "Vault", walkable: false };
const TRM: MapTile = { kind: "building", label: "Terminal", walkable: false };
const LAZARUS: MapTile = {
  kind: "boss",
  bossId: "lazarus",
  label: "BOSS",
  walkable: true,
};

// prettier-ignore
const bankTiles: MapTile[][] = [
  /* row 0 */ [WALL, WALL,   WALL,   WALL,   WALL,   WALL, WALL, WALL,   WALL,   WALL, WALL, WALL,    WALL,   WALL],
  /* row 1 */ [WALL, TRM,    GROUND, GROUND, GROUND, WALL, WALL, GROUND, GROUND, GROUND, GROUND, LAZARUS, GROUND, WALL],
  /* row 2 */ [WALL, GROUND, GROUND, GROUND, GROUND, WALL, WALL, GROUND, GROUND, VLT,    VLT,    GROUND,  GROUND, WALL],
  /* row 3 */ [WALL, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, WALL],
  /* row 4 */ [WALL, GROUND, GROUND, TRM,    GROUND, WALL, WALL, GROUND, GROUND, GROUND, GROUND, GROUND,  GROUND, WALL],
  /* row 5 */ [WALL, GROUND, GROUND, GROUND, GROUND, WALL, WALL, GROUND, VLT,    GROUND, GROUND, VLT,     GROUND, WALL],
  /* row 6 */ [WALL, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, WALL],
  /* row 7 */ [WALL, GROUND, GROUND, GROUND, GROUND, WALL, WALL, GROUND, GROUND, GROUND, GROUND, GROUND,  GROUND, WALL],
  /* row 8 */ [WALL, EXIT_TILE, EXIT_TILE, GROUND, GROUND, WALL, WALL, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, WALL],
  /* row 9 */ [WALL, WALL,   WALL,   WALL,   WALL,   WALL, WALL, WALL,   WALL,   WALL, WALL, WALL,    WALL,   WALL],
];

const bankMap: GameMap = {
  id: "bank",
  width: 14,
  height: 10,
  tiles: bankTiles,
  spawn: { x: 2, y: 7 },
};

/* ---------- Crypto Exchange (14x10) -- TraderTraitor mini-boss ---------- */

const ENCOUNTER: MapTile = {
  kind: "ground",
  walkable: true,
  encounter: true,
};
const SAFE: MapTile = { kind: "ground", walkable: true, encounter: false };
const LOOT: MapTile = {
  kind: "ground",
  walkable: true,
  encounter: false,
  loot: true,
};
const VAULT: MapTile = { kind: "building", label: "Vault", walkable: false };
const TRADER_TRAITOR: MapTile = {
  kind: "boss",
  bossId: "trader-traitor",
  label: "BOSS",
  walkable: true,
};

// prettier-ignore
const exchangeTiles: MapTile[][] = [
  /* row 0 */ [WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL,   WALL,  WALL,            WALL, WALL],
  /* row 1 */ [WALL, SAFE, SAFE, SAFE, SAFE, WALL, WALL, SAFE, SAFE, VAULT,  VAULT, TRADER_TRAITOR, SAFE, WALL],
  /* row 2 */ [WALL, SAFE, SAFE, ENCOUNTER, SAFE, WALL, WALL, SAFE, SAFE, SAFE, SAFE, SAFE, SAFE, WALL],
  /* row 3 */ [WALL, SAFE, ENCOUNTER, SAFE, SAFE, SAFE, SAFE, SAFE, SAFE, SAFE, SAFE, SAFE, SAFE, WALL],
  /* row 4 */ [WALL, SAFE, SAFE, SAFE, SAFE, WALL, WALL, SAFE, SAFE, SAFE, LOOT, SAFE, SAFE, WALL],
  /* row 5 */ [WALL, SAFE, SAFE, ENCOUNTER, SAFE, WALL, WALL, SAFE, SAFE, ENCOUNTER, SAFE, SAFE, SAFE, WALL],
  /* row 6 */ [WALL, SAFE, SAFE, SAFE, SAFE, SAFE, SAFE, SAFE, SAFE, SAFE, SAFE, SAFE, SAFE, WALL],
  /* row 7 */ [WALL, SAFE, ENCOUNTER, SAFE, SAFE, WALL, WALL, SAFE, SAFE, SAFE, ENCOUNTER, SAFE, SAFE, WALL],
  /* row 8 */ [WALL, EXIT_TILE, EXIT_TILE, SAFE, SAFE, WALL, WALL, SAFE, SAFE, SAFE, SAFE, SAFE, SAFE, WALL],
  /* row 9 */ [WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL,   WALL,  WALL,            WALL, WALL],
];

const exchangeMap: GameMap = {
  id: "exchange",
  width: 14,
  height: 10,
  tiles: exchangeTiles,
  spawn: { x: 1, y: 8 },
};

/* ------------------------------------------------------------------ */
/*  ENEMIES + BOSSES -- battle stat blocks (GDD §7.1, §7.2)           */
/* ------------------------------------------------------------------ */

const enemies: Record<string, EnemyDef> = {
  "script-kiddie": {
    id: "script-kiddie",
    name: "Script Kiddie",
    baseHp: 40,
    speed: 6,
    defense: 2,
    moves: [
      { name: "DDoS Ping", power: 10, accuracy: 90, weight: 40, description: "Floods the connection" },
      { name: "Downloaded Exploit", power: 15, accuracy: 75, weight: 35, description: "Runs a copied exploit kit" },
      { name: "Rage Quit", power: 0, accuracy: 100, weight: 25, description: "Heals self 10 HP" },
    ],
    xpReward: 18,
    bitsReward: 8,
  },
  hacktivist: {
    id: "hacktivist",
    name: "Hacktivist",
    baseHp: 55,
    speed: 7,
    defense: 3,
    moves: [
      { name: "Deface", power: 15, accuracy: 88, weight: 35, description: "Defaces a public-facing site" },
      { name: "Doxx Attempt", power: 20, accuracy: 78, weight: 30, description: "Leaks personal data" },
      { name: "Manifesto", power: 0, accuracy: 100, weight: 35, description: "Buffs own power 10%" },
    ],
    xpReward: 28,
    bitsReward: 12,
  },
  "ransomware-bot": {
    id: "ransomware-bot",
    name: "Ransomware Bot",
    baseHp: 50,
    speed: 8,
    defense: 3,
    moves: [
      { name: "Encrypt", power: 20, accuracy: 85, weight: 40, description: "Encrypts files on contact" },
      { name: "Ransom Note", power: 10, accuracy: 95, weight: 35, description: "Demands payment" },
      { name: "Spread", power: 15, accuracy: 80, weight: 25, description: "Propagates across the network" },
    ],
    xpReward: 25,
    bitsReward: 12,
  },
  cryptominer: {
    id: "cryptominer",
    name: "Cryptominer",
    baseHp: 45,
    speed: 10,
    defense: 2,
    moves: [
      { name: "Mine Block", power: 12, accuracy: 90, weight: 40, description: "Diverts cycles to mine a block" },
      { name: "Pool Connect", power: 20, accuracy: 85, weight: 35, description: "Joins a mining pool to amplify output" },
      { name: "Overclock", power: 0, accuracy: 100, weight: 25, description: "Buffs own speed 20%" },
    ],
    xpReward: 22,
    bitsReward: 10,
  },
  "mixer-bot": {
    id: "mixer-bot",
    name: "Mixer Bot",
    baseHp: 60,
    speed: 8,
    defense: 3,
    moves: [
      { name: "Obfuscate", power: 20, accuracy: 85, weight: 35, description: "Scrambles transaction trail; player accuracy -20% 2 turns" },
      { name: "Tumble", power: 15, accuracy: 90, weight: 35, description: "Hits twice through tumbler layers" },
      { name: "Exit Liquidity", power: 25, accuracy: 80, weight: 30, description: "Drains stolen bits on the way out (loses 10 bits)" },
    ],
    xpReward: 30,
    bitsReward: 14,
  },
  "rug-puller": {
    id: "rug-puller",
    name: "Rug Puller",
    baseHp: 55,
    speed: 9,
    defense: 3,
    moves: [
      { name: "Hype Pump", power: 0, accuracy: 100, weight: 25, description: "Buffs own power 30% for 2 turns" },
      { name: "Pull Liquidity", power: 30, accuracy: 85, weight: 40, description: "Drains the pool (50% chance to flee with stolen bits)" },
      { name: "Fake Audit", power: 15, accuracy: 90, weight: 35, description: "Plants false confidence; player accuracy -15%" },
    ],
    xpReward: 32,
    bitsReward: 16,
  },
  "wallet-drainer": {
    id: "wallet-drainer",
    name: "Wallet Drainer",
    baseHp: 70,
    speed: 7,
    defense: 4,
    moves: [
      { name: "Malicious Approve", power: 25, accuracy: 85, weight: 35, description: "Tricks wallet approval; energy drain 10/turn 2 turns" },
      { name: "Signature Request", power: 20, accuracy: 90, weight: 35, description: "Phished EIP-712 signature; persist 5/turn 3 turns" },
      { name: "Address Poisoning", power: 15, accuracy: 95, weight: 30, description: "Look-alike address; locks player's next tool 1 turn" },
    ],
    xpReward: 35,
    bitsReward: 18,
  },
};

const bosses: Record<string, EnemyDef> = {
  lazarus: {
    id: "lazarus",
    name: "Lazarus Group",
    baseHp: 150,
    speed: 10,
    defense: 5,
    weakness: "defense",
    moves: [
      { name: "Ransomware Deploy", power: 35, accuracy: 85, weight: 25, description: "Deploys ransomware across the network" },
      { name: "Crypto Miner", power: 15, accuracy: 90, weight: 30, description: "Mines crypto, draining energy" },
      { name: "Bank Heist", power: 25, accuracy: 88, weight: 25, description: "Wires funds to offshore accounts" },
      { name: "Swift Exploit", power: 40, accuracy: 75, weight: 20, description: "Exploits the SWIFT banking network" },
    ],
    xpReward: 300,
    bitsReward: 100,
  },
  "trader-traitor": {
    id: "trader-traitor",
    name: "TraderTraitor",
    baseHp: 280,
    speed: 11,
    defense: 6,
    // Tracing money flows is reconnaissance (GDD §7.2). Recon tools hit 1.5x.
    weakness: "recon",
    moves: [
      { name: "Chain Hop", power: 30, accuracy: 85, weight: 30, description: "Bounces funds across chains; heals self 10" },
      { name: "Mixer Deploy", power: 20, accuracy: 90, weight: 25, description: "Tornado Cash style; player accuracy -25% for 2 turns" },
      { name: "Bridge Exploit", power: 40, accuracy: 80, weight: 25, description: "Cross-chain bridge takeover (charges 1 turn)" },
      { name: "Cold Wallet Stash", power: 0, accuracy: 100, weight: 20, description: "Moves funds offline; immune to next attack" },
    ],
    xpReward: 500,
    bitsReward: 160,
  },
};

/* ------------------------------------------------------------------ */
/*  ZONE CONFIGS                                                      */
/* ------------------------------------------------------------------ */

const zones: Record<string, ZoneConfig> = {
  // GDD §4.2: Digital Sea tiles trigger encounters at 25-35% per step. The
  // reducer's MOVE-handler kind guard (kind: "sea" on overworld, kind:
  // "ground" in buildings, or the explicit `encounter` tile flag) gates
  // which tiles actually roll; this rate applies inside that gate.
  "sector-01": {
    encounterRate: 0.3,
    enemies: ["script-kiddie", "ransomware-bot", "cryptominer"],
  },
  arcade: {
    encounterRate: 0.3,
    enemies: ["script-kiddie"],
  },
  bank: {
    encounterRate: 0.3,
    enemies: ["script-kiddie", "hacktivist", "ransomware-bot"],
  },
  exchange: {
    encounterRate: 0.3,
    enemies: ["cryptominer", "mixer-bot", "rug-puller", "wallet-drainer"],
  },
};

/* ------------------------------------------------------------------ */
/*  INTEL DOSSIERS -- post-battle overlay content                     */
/* ------------------------------------------------------------------ */

const intel: Record<string, BossEntry> = {
  lazarus: {
    id: "lazarus",
    name: "Lazarus Group",
    nation: "North Korea",
    sector: "Financial",
    weakness: "defense",
    background:
      "North Korea's state-sponsored theft operation. The regime treats cybercrime as revenue, running coordinated campaigns against banks, crypto exchanges, and payment networks to fund sanctioned activities.",
    operations:
      "The 2016 Bangladesh Bank heist drained $81 million via fraudulent SWIFT transfers. The 2017 WannaCry ransomware worm crippled hospitals and businesses worldwide. Billions stolen from cryptocurrency platforms since.",
    badgeId: "bank-buster",
  },
  "trader-traitor": {
    id: "trader-traitor",
    name: "TraderTraitor",
    nation: "North Korea",
    sector: "Financial / Cryptocurrency",
    weakness: "recon",
    background:
      "A Lazarus Group sub-cluster identified by US CISA, FBI, and Treasury as TraderTraitor -- focused on cryptocurrency theft and laundering. The DPRK treats stolen crypto as sovereign revenue and uses the proceeds to sustain activities under international sanction.",
    operations:
      "Executed the Ronin Bridge ($620M) and Harmony Horizon ($100M) heists in 2022. Laundered proceeds through mixers like Tornado Cash (OFAC-sanctioned August 2022) and cross-chain bridges. UN Panel of Experts reports these operations fund DPRK WMD and ballistic missile programs. The Exchange fight is mechanically harder than the Bank -- Lazarus's laundering arm is hardened, compartmentalized, and doesn't hold still long enough for brute force. You have to trace them.",
    badgeId: "exchange-raider",
  },
};

/* ------------------------------------------------------------------ */
/*  BADGES                                                            */
/* ------------------------------------------------------------------ */

const badges: BadgeDef[] = [
  {
    id: "grid-runner",
    label: "Grid Runner",
    condition: "Complete the tutorial",
    tier: "bronze",
  },
  {
    id: "bank-buster",
    label: "Bank Buster",
    condition: "Defeat Lazarus Group",
    tier: "bronze",
  },
  {
    id: "exchange-raider",
    label: "Exchange Raider",
    condition: "Defeat TraderTraitor at the Crypto Exchange",
    tier: "silver",
  },
  {
    id: "loot-hoarder",
    label: "Loot Hoarder",
    condition: "Collect 50 tools",
    tier: "bronze",
  },
  {
    id: "epic-collector",
    label: "Epic Collector",
    condition: "Find an Epic tool",
    tier: "silver",
  },
];

/* ------------------------------------------------------------------ */
/*  ZONE DISPLAY NAMES                                                */
/* ------------------------------------------------------------------ */

// Long form: the HUD zone label above the canvas.
const zoneNames: Record<string, string> = {
  "sector-01": "THE GRID",
  arcade: "ARCADE",
  bank: "BANK -- FINANCIAL SECTOR",
  exchange: "CRYPTO EXCHANGE",
};

// Short form: the boot-screen save-slot summary.
const zoneLabels: Record<string, string> = {
  "sector-01": "THE GRID",
  arcade: "ARCADE",
  bank: "BANK",
  exchange: "EXCHANGE",
};

/* ------------------------------------------------------------------ */
/*  MODULE EXPORT                                                     */
/* ------------------------------------------------------------------ */

export const sector01: SectorModule = {
  id: "sector-01",
  maps: {
    "sector-01": outdoorMap,
    arcade: arcadeMap,
    bank: bankMap,
    exchange: exchangeMap,
  },
  enemies,
  bosses,
  zones,
  intel,
  badges,
  zoneNames,
  zoneLabels,
};
