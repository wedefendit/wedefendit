import { SectorZoneId } from "../data/sectors/sector-01";
import { bosses, getMap } from "../data/sectors";
import { attemptRun, processLevelUp, resolvePlayerTurn } from "./battle";
import { applyRegen, BattleTransitionPhaseValue, GAME_LIMITS, GameActionValue, OverlayValue, TutorialStepValue, type GridRunnerAction, type GridRunnerState, type LevelUpSummary, type Overlay } from "./game-state";
import { BaseToolIdValue, RARITY_DEFINITIONS, createCommonTool } from "./loot";
import { DirectionValue } from "./movement";
import { dismissActiveOnboarding, reduceInteraction, reduceMove } from "./game-navigation";
import { createNewSave, deleteSave, hasSave, loadSave, loadSaveSummary, writeSave } from "./save";
import { SHOP_ITEMS } from "./shop";
import { BattlePhaseValue, GameScreenValue, OnboardingKeyValue, type BattleState, type GameScreen, type GridRunnerSave, type OnboardingKey, type PlayerState, type ToolInstance } from "./types";

function positionAt(x: number, y: number) {
  return { x, y };
}

const OVERLAY_CYCLE: Partial<Record<Overlay, Overlay>> = {
  [OverlayValue.None]: OverlayValue.Inventory,
  [OverlayValue.Inventory]: OverlayValue.Disc,
  [OverlayValue.Disc]: OverlayValue.Operator,
  [OverlayValue.Operator]: OverlayValue.None,
};

type VictoryResult = {
  save: GridRunnerSave;
  levelUpSummary: LevelUpSummary | null;
  pendingIntelBossId: string | null;
};

function newGame(state: GridRunnerState, name: string): GridRunnerState {
  const save = createNewSave(name);
  writeSave(save);
  return {
    ...state,
    screen: GameScreenValue.Overworld,
    save,
    hasSaveFile: true,
    playerPos: save.currentPosition,
    facing: DirectionValue.Down,
    currentZone: SectorZoneId.Sector01,
    overworldPos: save.currentPosition,
    battle: null,
  };
}

function continueGame(state: GridRunnerState): GridRunnerState {
  const save = loadSave();
  if (!save) return state;
  const onOverworld = save.currentZone === SectorZoneId.Sector01;
  return {
    ...state,
    screen: onOverworld ? GameScreenValue.Overworld : GameScreenValue.Building,
    save,
    playerPos: save.currentPosition,
    facing: DirectionValue.Down,
    currentZone: save.currentZone,
    overworldPos: onOverworld ? save.currentPosition : state.overworldPos,
    battle: null,
  };
}

function removeSave(state: GridRunnerState): GridRunnerState {
  deleteSave();
  return { ...state, hasSaveFile: false, saveSummary: null, save: null };
}

function buyTool(state: GridRunnerState, baseToolId: string): GridRunnerState {
  if (!state.save) return state;
  const item = SHOP_ITEMS.find((candidate) => candidate.baseToolId === baseToolId);
  if (!item || state.save.player.level < item.minLevel) return state;
  if (state.save.bits < item.price) return state;
  if (state.save.inventory.length >= GAME_LIMITS.inventoryItems) return state;
  const tool = createCommonTool(baseToolId);
  if (!tool) return state;
  const nextSave = {
    ...state.save,
    bits: state.save.bits - item.price,
    inventory: [...state.save.inventory, tool],
  };
  writeSave(nextSave);
  return { ...state, save: nextSave };
}

function useTool(state: GridRunnerState, tool: ToolInstance): GridRunnerState {
  if (state.screen !== GameScreenValue.Battle || !state.battle || !state.save) return state;
  if (state.battle.phase !== BattlePhaseValue.PlayerTurn) return state;
  const result = resolvePlayerTurn(tool, state.save.player, state.battle);
  const completedScan =
    state.tutorialStep === TutorialStepValue.Scan &&
    tool.baseToolId === BaseToolIdValue.Nmap;
  return {
    ...state,
    battle: result.state,
    save: { ...state.save, player: result.player },
    tutorialStep: completedScan ? TutorialStepValue.Move : state.tutorialStep,
  };
}

function returnScreen(state: GridRunnerState): GameScreen {
  return state.currentZone === SectorZoneId.Sector01
    ? GameScreenValue.Overworld
    : GameScreenValue.Building;
}

function runFromBattle(state: GridRunnerState): GridRunnerState {
  if (state.screen !== GameScreenValue.Battle || !state.battle || !state.save) return state;
  if (state.battle.phase !== BattlePhaseValue.PlayerTurn) return state;
  if (attemptRun(state.save.player, state.battle.enemy)) {
    return { ...state, screen: returnScreen(state), battle: null };
  }
  return {
    ...state,
    battle: {
      ...state.battle,
      log: [...state.battle.log, "Failed to escape!"],
      phase: BattlePhaseValue.PlayerTurn,
    },
  };
}

function endBattle(state: GridRunnerState): GridRunnerState {
  if (!state.battle || !state.save || state.battleTransition !== null) return state;
  return { ...state, battleTransition: BattleTransitionPhaseValue.Exiting };
}

function restorePlayer(player: PlayerState): PlayerState {
  return {
    ...player,
    integrity: player.maxIntegrity,
    compute: player.maxCompute,
  };
}

function resolveVictory(save: GridRunnerSave, battle: BattleState): VictoryResult {
  const level = processLevelUp(save.player, battle.xpEarned);
  const player = restorePlayer(level.player);
  const levelUpSummary = level.levelsGained > 0
    ? { oldLevel: level.oldLevel, newLevel: level.newLevel, statDeltas: level.statDeltas }
    : null;
  const bossId = battle.enemy.def.id;
  const defeatedNewBoss = Boolean(bosses[bossId]) && !save.defeatedBosses.includes(bossId);
  const defeatedBosses = defeatedNewBoss
    ? [...save.defeatedBosses, bossId]
    : save.defeatedBosses;
  const unlocksIntel = defeatedNewBoss && !save.unlockedIntelEntries.includes(bossId);
  const unlockedIntelEntries = unlocksIntel
    ? [...save.unlockedIntelEntries, bossId]
    : save.unlockedIntelEntries;
  const inventory = battle.lootDrop
    ? [...save.inventory, battle.lootDrop]
    : save.inventory;
  return {
    save: {
      ...save,
      player,
      bits: save.bits + battle.bitsEarned,
      defeatedBosses,
      unlockedIntelEntries,
      inventory,
    },
    levelUpSummary,
    pendingIntelBossId: defeatedNewBoss ? bossId : null,
  };
}

function onboardingAfterVictory(
  state: GridRunnerState,
  result: VictoryResult,
): OnboardingKey[] {
  const additions: OnboardingKey[] = [];
  if (
    state.battle?.lootDrop &&
    !result.save.onboarding.loot &&
    !state.onboardingQueue.includes(OnboardingKeyValue.Loot)
  ) {
    additions.push(OnboardingKeyValue.Loot);
  }
  if (
    result.pendingIntelBossId &&
    !result.save.onboarding.disc &&
    !state.onboardingQueue.includes(OnboardingKeyValue.Disc)
  ) {
    additions.push(OnboardingKeyValue.Disc);
  }
  return additions.length > 0
    ? [...state.onboardingQueue, ...additions]
    : state.onboardingQueue;
}

function loseBattle(state: GridRunnerState): GridRunnerState {
  if (!state.save) return state;
  const lostBits = Math.floor(state.save.bits * 0.1);
  const respawnPos = getMap(state.currentZone)?.spawn ?? state.playerPos;
  const player = restorePlayer(state.save.player);
  const save = {
    ...state.save,
    player,
    bits: state.save.bits - lostBits,
    currentPosition: respawnPos,
  };
  return {
    ...state,
    screen: returnScreen(state),
    battle: null,
    save,
    playerPos: respawnPos,
    battleTransition: null,
  };
}

function winBattle(state: GridRunnerState): GridRunnerState {
  if (!state.save || !state.battle) return state;
  const result = resolveVictory(state.save, state.battle);
  let overlay = state.overlay;
  if (result.levelUpSummary) overlay = OverlayValue.LevelUp;
  else if (result.pendingIntelBossId) overlay = OverlayValue.Intel;
  return {
    ...state,
    screen: returnScreen(state),
    battle: null,
    save: result.save,
    overlay,
    levelUpSummary: result.levelUpSummary,
    pendingIntelBossId: result.pendingIntelBossId,
    onboardingQueue: onboardingAfterVictory(state, result),
    battleTransition: null,
  };
}

function finishBattleTransition(state: GridRunnerState): GridRunnerState {
  if (state.battleTransition === BattleTransitionPhaseValue.Entering && state.pendingBattle) {
    return {
      ...state,
      screen: GameScreenValue.Battle,
      battle: state.pendingBattle,
      pendingBattle: null,
      battleTransition: null,
    };
  }
  if (state.battleTransition !== BattleTransitionPhaseValue.Exiting) return state;
  if (!state.battle || !state.save) return { ...state, battleTransition: null };
  return state.battle.phase === BattlePhaseValue.Won
    ? winBattle(state)
    : loseBattle(state);
}

function dismissLevelUp(state: GridRunnerState): GridRunnerState {
  let overlay = state.overlay;
  if (overlay === OverlayValue.LevelUp) {
    overlay = state.pendingIntelBossId ? OverlayValue.Intel : OverlayValue.None;
  }
  return { ...state, overlay, levelUpSummary: null };
}

function dismissSectorUnlock(state: GridRunnerState): GridRunnerState {
  if (state.overlay !== OverlayValue.SectorUnlock || !state.save) return state;
  const backoff = positionAt(state.playerPos.x - 1, state.playerPos.y);
  return {
    ...state,
    overlay: OverlayValue.None,
    playerPos: backoff,
    overworldPos: backoff,
    facing: DirectionValue.Left,
    save: { ...state.save, currentPosition: backoff },
  };
}

function dismissIntel(state: GridRunnerState): GridRunnerState {
  const overlay = state.overlay === OverlayValue.Intel
    ? OverlayValue.None
    : state.overlay;
  return { ...state, overlay, pendingIntelBossId: null };
}

function dismissOnboarding(
  state: GridRunnerState,
  key: OnboardingKey,
): GridRunnerState {
  if (state.onboardingQueue[0] !== key) return state;
  return dismissActiveOnboarding(state) ?? state;
}

function regenerate(state: GridRunnerState): GridRunnerState {
  if (!state.save) return state;
  const player = applyRegen(state.save.player);
  if (
    player.integrity === state.save.player.integrity &&
    player.compute === state.save.player.compute
  ) {
    return state;
  }
  return { ...state, save: { ...state.save, player } };
}

function advanceTutorial(state: GridRunnerState): GridRunnerState {
  if (state.tutorialStep === TutorialStepValue.Move) {
    return { ...state, tutorialStep: TutorialStepValue.Finish };
  }
  if (state.tutorialStep !== TutorialStepValue.Finish || !state.save) return state;
  return {
    ...state,
    tutorialStep: TutorialStepValue.Inactive,
    save: { ...state.save, completedTutorial: true },
  };
}

function screenAllowsOverlay(state: GridRunnerState): boolean {
  return state.screen !== GameScreenValue.Title && state.screen !== GameScreenValue.Boot;
}

function toggleOverlay(state: GridRunnerState, target: Overlay): GridRunnerState {
  if (!screenAllowsOverlay(state)) return state;
  const overlay = state.overlay === target ? OverlayValue.None : target;
  return { ...state, overlay, overlayReturnTo: OverlayValue.None };
}

function openOverlay(
  state: GridRunnerState,
  target: Overlay,
): GridRunnerState {
  if (!screenAllowsOverlay(state)) return state;
  return { ...state, overlay: target, overlayReturnTo: OverlayValue.Menu };
}

function cycleOverlay(state: GridRunnerState): GridRunnerState {
  if (!screenAllowsOverlay(state)) return state;
  const overlay = OVERLAY_CYCLE[state.overlay] ?? state.overlay;
  if (overlay === state.overlay) return state;
  return { ...state, overlay, overlayReturnTo: OverlayValue.None };
}

function equipTool(
  state: GridRunnerState,
  toolId: string,
  slotIndex: number,
): GridRunnerState {
  if (!state.save) return state;
  const tool = state.save.inventory.find((candidate) => candidate.id === toolId);
  if (!tool || slotIndex < 0 || slotIndex >= state.save.equippedTools.length) return state;
  const oldTool = state.save.equippedTools[slotIndex];
  const equippedTools = [...state.save.equippedTools];
  equippedTools[slotIndex] = tool;
  let inventory = state.save.inventory.filter((candidate) => candidate.id !== toolId);
  if (oldTool) inventory = [...inventory, oldTool];
  return {
    ...state,
    save: { ...state.save, equippedTools, inventory },
  };
}

function scrapTool(state: GridRunnerState, toolId: string): GridRunnerState {
  if (!state.save) return state;
  const tool = state.save.inventory.find((candidate) => candidate.id === toolId);
  if (!tool) return state;
  return {
    ...state,
    save: {
      ...state.save,
      inventory: state.save.inventory.filter((candidate) => candidate.id !== toolId),
      bits: state.save.bits + RARITY_DEFINITIONS[tool.rarity].scrapValue,
    },
  };
}

function manualSave(state: GridRunnerState): GridRunnerState {
  if (state.save) writeSave(state.save);
  return { ...state, overlay: OverlayValue.None };
}

export function gameReducer(state: GridRunnerState, action: GridRunnerAction): GridRunnerState {
  switch (action.type) {
    case GameActionValue.CheckSave: return { ...state, hasSaveFile: hasSave(), saveSummary: loadSaveSummary() };
    case GameActionValue.BootDone: return { ...state, screen: GameScreenValue.Title };
    case GameActionValue.DeleteSave: return removeSave(state);
    case GameActionValue.NewGame: return newGame(state, action.name);
    case GameActionValue.Continue: return continueGame(state);
    case GameActionValue.Move: return reduceMove(state, action.dir);
    case GameActionValue.Interact: return reduceInteraction(state);
    case GameActionValue.OpenShop: return { ...state, overlay: OverlayValue.Shop, overlayReturnTo: OverlayValue.None };
    case GameActionValue.BuyTool: return buyTool(state, action.baseToolId);
    case GameActionValue.UseTool: return useTool(state, action.tool);
    case GameActionValue.Run: return runFromBattle(state);
    case GameActionValue.BattleEnd: return endBattle(state);
    case GameActionValue.BattleTransitionEnd: return finishBattleTransition(state);
    case GameActionValue.DismissLevelUp: return dismissLevelUp(state);
    case GameActionValue.DismissSectorUnlock: return dismissSectorUnlock(state);
    case GameActionValue.DismissIntel: return dismissIntel(state);
    case GameActionValue.DismissOnboarding: return dismissOnboarding(state, action.key);
    case GameActionValue.RegenTick: return regenerate(state);
    case GameActionValue.AdvanceTutorial: return advanceTutorial(state);
    case GameActionValue.OpenMenu: return toggleOverlay(state, OverlayValue.Menu);
    case GameActionValue.OpenDisc: return toggleOverlay(state, OverlayValue.Disc);
    case GameActionValue.OpenOverlay: return openOverlay(state, action.target);
    case GameActionValue.OpenDirect: return toggleOverlay(state, action.target);
    case GameActionValue.CycleOverlay: return cycleOverlay(state);
    case GameActionValue.CloseOverlay: return { ...state, overlay: state.overlayReturnTo, overlayReturnTo: OverlayValue.None };
    case GameActionValue.EquipTool: return equipTool(state, action.toolId, action.slotIndex);
    case GameActionValue.ScrapTool: return scrapTool(state, action.toolId);
    case GameActionValue.ManualSave: return manualSave(state);
    default: return state;
  }
}


