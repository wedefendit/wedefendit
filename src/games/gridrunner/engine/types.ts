export enum RarityValue { Common = "common", Uncommon = "uncommon", Rare = "rare", Epic = "epic", Legendary = "legendary" }
export type Rarity = `${RarityValue}`;
export enum ToolTypeValue { Recon = "recon", Exploit = "exploit", Defense = "defense", Persistence = "persistence" }
export type ToolType = `${ToolTypeValue}`;

export interface ToolInstance {
  id: string;
  baseToolId: string;
  rarity: Rarity;
  power: number;
  accuracy: number;
  energyCost: number;
  prefix: string | null;
  suffix: string | null;
  type: ToolType;
}

export interface PlayerState {
  level: number;
  xp: number;
  xpToNext: number;
  integrity: number;
  maxIntegrity: number;
  compute: number;
  maxCompute: number;
  bandwidth: number;
  firewall: number;
}

export interface Position {
  x: number;
  y: number;
}

export enum TileKindValue { Ground = "ground", Wall = "wall", Building = "building", Entry = "entry", Locked = "locked", Spawn = "spawn", Boss = "boss", Sea = "sea", Gate = "gate", Facade = "facade" }
export type TileKind = `${TileKindValue}`;

export interface MapTile {
  kind: TileKind;
  buildingId?: string;
  bossId?: string;
  label?: string;
  walkable: boolean;
  encounter?: boolean;
  loot?: boolean;
}

export interface GameMap {
  id: string;
  width: number;
  height: number;
  tiles: MapTile[][];
  spawn: Position;
}

export enum OnboardingKeyValue { Loot = "loot", Shop = "shop", Disc = "disc", Boss = "boss" }
export type OnboardingKey = `${OnboardingKeyValue}`;
export type OnboardingFlags = Record<OnboardingKey, boolean>;

export interface GridRunnerSave {
  version: number;
  playerName: string;
  player: PlayerState;
  inventory: ToolInstance[];
  equippedTools: (ToolInstance | null)[];
  currentZone: string;
  currentPosition: Position;
  defeatedBosses: string[];
  completedTutorial: boolean;
  unlockedIntelEntries: string[];
  onboarding: OnboardingFlags;
  bits: number;
  credits: number;
  playTime: number;
  savedAt: string;
}

export interface SaveSummary {
  playerName: string;
  level: number;
  zone: string;
  savedAt: string;
  playTime: number;
}

export enum GameScreenValue { Boot = "boot", Title = "title", Overworld = "overworld", Building = "building", Battle = "battle" }
export type GameScreen = `${GameScreenValue}`;

export interface EnemyMove {
  name: string;
  power: number;
  accuracy: number;
  weight: number;
  description: string;
}

export interface EnemyDef {
  id: string;
  name: string;
  baseHp: number;
  speed: number;
  defense: number;
  moves: EnemyMove[];
  xpReward: number;
  bitsReward: number;
  weakness?: ToolType;
}

export interface BattleEnemy {
  def: EnemyDef;
  hp: number;
  maxHp: number;
}

export enum BattlePhaseValue { PlayerTurn = "player_turn", EnemyTurn = "enemy_turn", Resolving = "resolving", Won = "won", Lost = "lost" }

export interface BattleState {
  enemy: BattleEnemy;
  phase: `${BattlePhaseValue}`;
  log: string[];
  turnCount: number;
  xpEarned: number;
  bitsEarned: number;
  lootDrop: ToolInstance | null;
  levelsGained: number;
  isBoss: boolean;
}

export interface ZoneConfig {
  encounterRate: number;
  enemies: string[];
}
