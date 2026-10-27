import type {
  EnemyDef,
  GameMap,
  MapTile,
  TileKind,
  ZoneConfig,
} from "../../engine/types";
import type { BadgeDef, BossEntry, SectorModule } from "./types";

export enum SectorZoneId {
  Sector01 = "sector-01",
  Arcade = "arcade",
  Bank = "bank",
  Exchange = "exchange",
}

enum MapCharacter {
  Boundary = "#",
  Void = ".",
  Grid = "g",
  Sea = "~",
  Spawn = "S",
  Gate = "G",
  ArcadeBody = "A",
  ArcadeEntry = "a",
  BankBody = "B",
  BankEntry = "b",
  ExchangeBody = "X",
  ExchangeEntry = "x",
  DecorBody = "D",
  DecorFacade = "d",
}

const UNKNOWN_MAP_CHARACTER_MESSAGE = "Unknown map character";
const GROUND_KIND: TileKind = "ground";

class UnknownMapCharacterError extends Error {
  readonly character: string;

  constructor(character: string) {
    super(`${UNKNOWN_MAP_CHARACTER_MESSAGE}: "${character}"`);
    this.name = "UnknownMapCharacterError";
    this.character = character;
  }
}

function createMap(
  id: string,
  size: Readonly<{ width: number; height: number }>,
  tiles: MapTile[][],
  spawn: Readonly<{ x: number; y: number }>,
): GameMap {
  return { id, ...size, tiles, spawn };
}

function createTile(kind: TileKind, walkable: boolean): MapTile {
  return { kind, walkable };
}

function createLabeledTile(
  kind: TileKind,
  label: string,
  walkable: boolean,
): MapTile {
  return { kind, label, walkable };
}

function createFeatureTile(
  kind: TileKind,
  buildingId: string,
  label: string,
  walkable: boolean,
): MapTile {
  return { kind, buildingId, label, walkable };
}

function createBossTile(bossId: string): MapTile {
  return { kind: "boss", bossId, label: "BOSS", walkable: true };
}

function createGroundTile(encounter: boolean): MapTile {
  return { kind: GROUND_KIND, walkable: true, encounter };
}

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
const DECOR_NEIGHBOR_OFFSETS: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

function kindFor(ch: string): TileKind {
  switch (ch) {
    case MapCharacter.Boundary:
    case MapCharacter.Void:
      return "wall";
    case MapCharacter.Grid:
      return "ground";
    case MapCharacter.Sea:
      return "sea";
    case MapCharacter.Spawn:
      return "spawn";
    case MapCharacter.Gate:
      return "gate";
    case MapCharacter.ArcadeBody:
    case MapCharacter.BankBody:
    case MapCharacter.ExchangeBody:
    case MapCharacter.DecorBody:
      return "building";
    case MapCharacter.ArcadeEntry:
    case MapCharacter.BankEntry:
      return "entry";
    case MapCharacter.ExchangeEntry:
      return "locked";
    case MapCharacter.DecorFacade:
      return "facade";
    default:
      throw new UnknownMapCharacterError(ch);
  }
}

function isDecor(ch: string): boolean {
  return (
    ch === MapCharacter.DecorBody || ch === MapCharacter.DecorFacade
  );
}

function createDecorIdGrid(): string[][] {
  return Array.from({ length: OUTDOOR_HEIGHT }, () =>
    Array.from({ length: OUTDOOR_WIDTH }, () => ""),
  );
}

function isUnassignedDecor(
  grid: string[][],
  ids: string[][],
  x: number,
  y: number,
): boolean {
  if (x < 0 || x >= OUTDOOR_WIDTH) return false;
  if (y < 0 || y >= OUTDOOR_HEIGHT) return false;
  return isDecor(grid[y][x]) && ids[y][x] === "";
}

function fillDecorComponent(
  grid: string[][],
  ids: string[][],
  start: readonly [number, number],
  id: string,
): void {
  const queue: Array<readonly [number, number]> = [start];
  ids[start[1]][start[0]] = id;
  for (const [x, y] of queue) {
    for (const [dx, dy] of DECOR_NEIGHBOR_OFFSETS) {
      const nextX = x + dx;
      const nextY = y + dy;
      if (!isUnassignedDecor(grid, ids, nextX, nextY)) continue;
      ids[nextY][nextX] = id;
      queue.push([nextX, nextY]);
    }
  }
}

function assignDecorIds(grid: string[][]): string[][] {
  const ids = createDecorIdGrid();
  let counter = 0;

  for (let y = 0; y < OUTDOOR_HEIGHT; y++) {
    for (let x = 0; x < OUTDOOR_WIDTH; x++) {
      if (!isUnassignedDecor(grid, ids, x, y)) continue;
      counter++;
      const id = `decor-${String(counter).padStart(2, "0")}`;
      fillDecorComponent(grid, ids, [x, y], id);
    }
  }

  return ids;
}

function buildTile(ch: string, decorId: string): MapTile {
  const kind = kindFor(ch);
  switch (ch) {
    case MapCharacter.ArcadeBody:
      return { kind, walkable: false, buildingId: SectorZoneId.Arcade };
    case MapCharacter.ArcadeEntry:
      return {
        kind,
        walkable: true,
        buildingId: SectorZoneId.Arcade,
        label: "Arcade",
      };
    case MapCharacter.BankBody:
      return { kind, walkable: false, buildingId: SectorZoneId.Bank };
    case MapCharacter.BankEntry:
      return {
        kind,
        walkable: true,
        buildingId: SectorZoneId.Bank,
        label: "Bank",
      };
    case MapCharacter.ExchangeBody:
      return { kind, walkable: false, buildingId: SectorZoneId.Exchange };
    case MapCharacter.ExchangeEntry:
      return {
        kind,
        walkable: false,
        buildingId: SectorZoneId.Exchange,
        label: "Crypto Exchange",
      };
    case MapCharacter.DecorBody:
    case MapCharacter.DecorFacade:
      return { kind, walkable: false, buildingId: decorId };
    case MapCharacter.Gate:
    case MapCharacter.Boundary:
    case MapCharacter.Void:
      return { kind, walkable: false };
    case MapCharacter.Grid:
    case MapCharacter.Sea:
    case MapCharacter.Spawn:
      return { kind, walkable: true };
    default:
      throw new UnknownMapCharacterError(ch);
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

const outdoorMap = createMap(
  SectorZoneId.Sector01,
  { width: OUTDOOR_WIDTH, height: OUTDOOR_HEIGHT },
  parseOutdoorMap(SECTOR_01_ASCII),
  { x: 14, y: 10 },
);


const WALL = createTile("wall", false);
const GROUND = createTile(GROUND_KIND, true);
const EXIT_TILE = createFeatureTile(
  "entry",
  SectorZoneId.Sector01,
  "Exit",
  true,
);


const ARC = createLabeledTile("building", "Arcade", false);
const SHOP = createFeatureTile("building", "shop", "Shop", true);
const SAVE_TILE = createFeatureTile("building", "save", "Save", true);

// prettier-ignore
const arcadeTiles: MapTile[][] = [
  [WALL,   WALL,   WALL,   WALL,   WALL,   WALL,   WALL,   WALL,   WALL,   WALL,   WALL,   WALL  ],
  [WALL,   ARC,    ARC,    GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, ARC,    ARC,    WALL  ],
  [WALL,   GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, WALL  ],
  [WALL,   GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, WALL  ],
  [WALL,   GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, SHOP,   GROUND, WALL  ],
  [WALL,   GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, WALL  ],
  [WALL,   GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, SAVE_TILE, GROUND, WALL  ],
  [WALL,   GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, WALL  ],
  [WALL,   GROUND, GROUND, GROUND, GROUND, EXIT_TILE, EXIT_TILE, GROUND, GROUND, GROUND, GROUND, WALL  ],
  [WALL,   WALL,   WALL,   WALL,   WALL,   WALL,   WALL,   WALL,   WALL,   WALL,   WALL,   WALL  ],
];

const arcadeMap = createMap(
  SectorZoneId.Arcade,
  { width: 12, height: 10 },
  arcadeTiles,
  { x: 5, y: 7 },
);


const VLT = createLabeledTile("building", "Vault", false);
const TRM = createLabeledTile("building", "Terminal", false);
const LAZARUS = createBossTile("lazarus");

// prettier-ignore
const bankTiles: MapTile[][] = [
  [WALL, WALL,   WALL,   WALL,   WALL,   WALL, WALL, WALL,   WALL,   WALL, WALL, WALL,    WALL,   WALL],
  [WALL, TRM,    GROUND, GROUND, GROUND, WALL, WALL, GROUND, GROUND, GROUND, GROUND, LAZARUS, GROUND, WALL],
  [WALL, GROUND, GROUND, GROUND, GROUND, WALL, WALL, GROUND, GROUND, VLT,    VLT,    GROUND,  GROUND, WALL],
  [WALL, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, WALL],
  [WALL, GROUND, GROUND, TRM,    GROUND, WALL, WALL, GROUND, GROUND, GROUND, GROUND, GROUND,  GROUND, WALL],
  [WALL, GROUND, GROUND, GROUND, GROUND, WALL, WALL, GROUND, VLT,    GROUND, GROUND, VLT,     GROUND, WALL],
  [WALL, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, WALL],
  [WALL, GROUND, GROUND, GROUND, GROUND, WALL, WALL, GROUND, GROUND, GROUND, GROUND, GROUND,  GROUND, WALL],
  [WALL, EXIT_TILE, EXIT_TILE, GROUND, GROUND, WALL, WALL, GROUND, GROUND, GROUND, GROUND, GROUND, GROUND, WALL],
  [WALL, WALL,   WALL,   WALL,   WALL,   WALL, WALL, WALL,   WALL,   WALL, WALL, WALL,    WALL,   WALL],
];

const bankMap = createMap(
  SectorZoneId.Bank,
  { width: 14, height: 10 },
  bankTiles,
  { x: 2, y: 7 },
);


const ENCOUNTER = createGroundTile(true);
const SAFE = createGroundTile(false);
const LOOT: MapTile = {
  kind: "ground",
  walkable: true,
  encounter: false,
  loot: true,
};
const VAULT = createLabeledTile("building", "Vault", false);
const TRADER_TRAITOR = createBossTile("trader-traitor");

// prettier-ignore
const exchangeTiles: MapTile[][] = [
  [WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL,   WALL,  WALL,            WALL, WALL],
  [WALL, SAFE, SAFE, SAFE, SAFE, WALL, WALL, SAFE, SAFE, VAULT,  VAULT, TRADER_TRAITOR, SAFE, WALL],
  [WALL, SAFE, SAFE, ENCOUNTER, SAFE, WALL, WALL, SAFE, SAFE, SAFE, SAFE, SAFE, SAFE, WALL],
  [WALL, SAFE, ENCOUNTER, SAFE, SAFE, SAFE, SAFE, SAFE, SAFE, SAFE, SAFE, SAFE, SAFE, WALL],
  [WALL, SAFE, SAFE, SAFE, SAFE, WALL, WALL, SAFE, SAFE, SAFE, LOOT, SAFE, SAFE, WALL],
  [WALL, SAFE, SAFE, ENCOUNTER, SAFE, WALL, WALL, SAFE, SAFE, ENCOUNTER, SAFE, SAFE, SAFE, WALL],
  [WALL, SAFE, SAFE, SAFE, SAFE, SAFE, SAFE, SAFE, SAFE, SAFE, SAFE, SAFE, SAFE, WALL],
  [WALL, SAFE, ENCOUNTER, SAFE, SAFE, WALL, WALL, SAFE, SAFE, SAFE, ENCOUNTER, SAFE, SAFE, WALL],
  [WALL, EXIT_TILE, EXIT_TILE, SAFE, SAFE, WALL, WALL, SAFE, SAFE, SAFE, SAFE, SAFE, SAFE, WALL],
  [WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL,   WALL,  WALL,            WALL, WALL],
];

const exchangeMap = createMap(
  SectorZoneId.Exchange,
  { width: 14, height: 10 },
  exchangeTiles,
  { x: 1, y: 8 },
);


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
      { name: "Manifesto", power: 0, accuracy: 100, weight: 35, description: "Restores 5 HP" },
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


type ZoneDefinition = Readonly<{
  config: ZoneConfig;
  name: string;
  label: string;
}>;

const zoneDefinitions: Record<SectorZoneId, ZoneDefinition> = {
  [SectorZoneId.Sector01]: {
    config: {
      encounterRate: 0.3,
      enemies: ["script-kiddie", "ransomware-bot", "cryptominer"],
    },
    name: "THE GRID",
    label: "THE GRID",
  },
  [SectorZoneId.Arcade]: {
    config: { encounterRate: 0.3, enemies: ["script-kiddie"] },
    name: "ARCADE",
    label: "ARCADE",
  },
  [SectorZoneId.Bank]: {
    config: {
      encounterRate: 0.3,
      enemies: ["script-kiddie", "hacktivist", "ransomware-bot"],
    },
    name: "BANK: FINANCIAL SECTOR",
    label: "BANK",
  },
  [SectorZoneId.Exchange]: {
    config: {
      encounterRate: 0.3,
      enemies: ["cryptominer", "mixer-bot", "rug-puller", "wallet-drainer"],
    },
    name: "CRYPTO EXCHANGE",
    label: "EXCHANGE",
  },
};

function selectZoneData<T>(
  select: (definition: ZoneDefinition) => T,
): Record<string, T> {
  return Object.fromEntries(
    Object.entries(zoneDefinitions).map(([id, definition]) => [
      id,
      select(definition),
    ]),
  );
}

const zones = selectZoneData((definition) => definition.config);
const zoneNames = selectZoneData((definition) => definition.name);
const zoneLabels = selectZoneData((definition) => definition.label);


const intel: Record<string, BossEntry> = {
  lazarus: {
    id: "lazarus",
    name: "Lazarus Group",
    nation: "North Korea",
    sector: "Financial",
    weakness: "defense",
    background:
      "Lazarus Group is a North Korean state-sponsored threat group. It targets banks, cryptocurrency companies, and payment systems.",
    operations:
      "The group has been linked to the 2016 Bangladesh Bank theft, the 2017 WannaCry outbreak, and theft from cryptocurrency companies.",
    badgeId: "bank-buster",
  },
  "trader-traitor": {
    id: "trader-traitor",
    name: "TraderTraitor",
    nation: "North Korea",
    sector: "Financial / Cryptocurrency",
    weakness: "recon",
    background:
      "TraderTraitor is a North Korean campaign identified by CISA, the FBI, and the U.S. Treasury. It uses social engineering and malicious applications to target cryptocurrency companies.",
    operations:
      "The campaign has been linked to the 2022 Ronin Bridge and Harmony Horizon thefts. The Lazarus Group used Tornado Cash to launder stolen cryptocurrency. In this game, Recon tools are most effective because the fight centers on tracing transactions.",
    badgeId: "exchange-raider",
  },
};


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


export const sector01: SectorModule = {
  id: SectorZoneId.Sector01,
  maps: {
    [SectorZoneId.Sector01]: outdoorMap,
    [SectorZoneId.Arcade]: arcadeMap,
    [SectorZoneId.Bank]: bankMap,
    [SectorZoneId.Exchange]: exchangeMap,
  },
  enemies,
  bosses,
  zones,
  intel,
  badges,
  zoneNames,
  zoneLabels,
};
