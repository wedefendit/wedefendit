import { sector01 } from "../data/sectors/sector-01";
import { DirectionValue, type Direction } from "./movement";
import {
  GameScreenValue,
  type BattleState,
  type GameScreen,
  type GridRunnerSave,
  type OnboardingKey,
  type PlayerState,
  type Position,
  type SaveSummary,
  type ToolInstance,
} from "./types";

export const REGEN_TIMING = { tickMs: 1000, settleMs: 1500 };
export const GAME_LIMITS = { inventoryItems: 12 };
const HP_REGEN_PER_TICK = 2;
const EN_REGEN_PER_TICK = 1;

export enum OverlayValue { None = "none", Menu = "menu", Disc = "disc", Inventory = "inventory", Operator = "operator", Save = "save", Settings = "settings", Shop = "shop", LevelUp = "level-up", Intel = "intel", SectorUnlock = "sector-unlock" }
export type Overlay = `${OverlayValue}`;
export enum BattleTransitionPhaseValue { Entering = "entering", Exiting = "exiting" }
export type BattleTransitionPhase = `${BattleTransitionPhaseValue}` | null;
export enum TutorialStepValue { Inactive = 0, Scan = 1, Move = 2, Finish = 3 }
export type TutorialStep = 0 | 1 | 2 | 3;
export enum FacilityValue { Shop = "shop", Save = "save" }

export type LevelUpSummary = {
  oldLevel: number;
  newLevel: number;
  statDeltas: { hp: number; en: number; spd: number; def: number };
};

export interface GridRunnerState {
  screen: GameScreen;
  save: GridRunnerSave | null;
  hasSaveFile: boolean;
  saveSummary: SaveSummary | null;
  playerPos: Position;
  facing: Direction;
  currentZone: string;
  overworldPos: Position;
  battle: BattleState | null;
  overlay: Overlay;
  overlayReturnTo: OverlayValue.None | OverlayValue.Menu;
  levelUpSummary: LevelUpSummary | null;
  tutorialStep: TutorialStep;
  pendingIntelBossId: string | null;
  onboardingQueue: OnboardingKey[];
  pendingShopOpen: boolean;
  battleTransition: BattleTransitionPhase;
  pendingBattle: BattleState | null;
  lootConsumed: Record<string, true>;
}

export enum GameActionValue { NewGame = "NEW_GAME", Continue = "CONTINUE", Move = "MOVE", Interact = "INTERACT", CheckSave = "CHECK_SAVE", UseTool = "USE_TOOL", Run = "RUN", BattleEnd = "BATTLE_END", BattleTransitionEnd = "BATTLE_TRANSITION_END", DismissLevelUp = "DISMISS_LEVELUP", DismissIntel = "DISMISS_INTEL", DismissSectorUnlock = "DISMISS_SECTOR_UNLOCK", AdvanceTutorial = "ADVANCE_TUTORIAL", DismissOnboarding = "DISMISS_ONBOARDING", RegenTick = "REGEN_TICK", OpenMenu = "OPEN_MENU", OpenDisc = "OPEN_DISC", OpenOverlay = "OPEN_OVERLAY", OpenDirect = "OPEN_DIRECT", CycleOverlay = "CYCLE_OVERLAY", CloseOverlay = "CLOSE_OVERLAY", EquipTool = "EQUIP_TOOL", ScrapTool = "SCRAP_TOOL", BuyTool = "BUY_TOOL", OpenShop = "OPEN_SHOP", ManualSave = "MANUAL_SAVE", BootDone = "BOOT_DONE", DeleteSave = "DELETE_SAVE" }

export type GridRunnerAction =
  | { type: GameActionValue.NewGame; name: string }
  | { type: GameActionValue.Continue }
  | { type: GameActionValue.Move; dir: Direction }
  | { type: GameActionValue.Interact }
  | { type: GameActionValue.CheckSave }
  | { type: GameActionValue.UseTool; tool: ToolInstance }
  | { type: GameActionValue.Run }
  | { type: GameActionValue.BattleEnd }
  | { type: GameActionValue.BattleTransitionEnd }
  | { type: GameActionValue.DismissLevelUp }
  | { type: GameActionValue.DismissIntel }
  | { type: GameActionValue.DismissSectorUnlock }
  | { type: GameActionValue.AdvanceTutorial }
  | { type: GameActionValue.DismissOnboarding; key: OnboardingKey }
  | { type: GameActionValue.RegenTick }
  | { type: GameActionValue.OpenMenu }
  | { type: GameActionValue.OpenDisc }
  | { type: GameActionValue.OpenOverlay; target: OverlayValue.Disc | OverlayValue.Inventory | OverlayValue.Operator | OverlayValue.Save | OverlayValue.Settings }
  | { type: GameActionValue.OpenDirect; target: OverlayValue.Disc | OverlayValue.Inventory | OverlayValue.Operator }
  | { type: GameActionValue.CycleOverlay }
  | { type: GameActionValue.CloseOverlay }
  | { type: GameActionValue.EquipTool; toolId: string; slotIndex: number }
  | { type: GameActionValue.ScrapTool; toolId: string }
  | { type: GameActionValue.BuyTool; baseToolId: string }
  | { type: GameActionValue.OpenShop }
  | { type: GameActionValue.ManualSave }
  | { type: GameActionValue.BootDone }
  | { type: GameActionValue.DeleteSave };

export function applyRegen(player: PlayerState): PlayerState {
  return {
    ...player,
    integrity: Math.min(player.integrity + HP_REGEN_PER_TICK, player.maxIntegrity),
    compute: Math.min(player.compute + EN_REGEN_PER_TICK, player.maxCompute),
  };
}

export function createInitialGameState(): GridRunnerState {
  const initialMap = sector01.maps[sector01.id];
  return {
    screen: GameScreenValue.Boot,
    save: null,
    hasSaveFile: false,
    saveSummary: null,
    playerPos: initialMap.spawn,
    facing: DirectionValue.Down,
    currentZone: sector01.id,
    overworldPos: initialMap.spawn,
    battle: null,
    overlay: OverlayValue.None,
    overlayReturnTo: OverlayValue.None,
    levelUpSummary: null,
    tutorialStep: TutorialStepValue.Inactive,
    pendingIntelBossId: null,
    onboardingQueue: [],
    pendingShopOpen: false,
    battleTransition: null,
    pendingBattle: null,
    lootConsumed: {},
  };
}
