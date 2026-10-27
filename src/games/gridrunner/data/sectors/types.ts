import type {
  EnemyDef,
  GameMap,
  ToolType,
  ZoneConfig,
} from "../../engine/types";
import type { BadgeTier } from "../../../shared/types";

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

export interface BadgeDef {
  readonly id: string;
  readonly label: string;
  readonly condition: string;
  readonly tier: BadgeTier;
}

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
