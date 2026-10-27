import { bosses, getMap } from "../data/sectors";
import { SectorZoneId } from "../data/sectors/sector-01";
import { createBattle } from "./battle";
import { pickRandomEnemy, shouldEncounter, spawnEnemy } from "./enemies";
import {
  BattleTransitionPhaseValue,
  FacilityValue,
  OverlayValue,
  TutorialStepValue,
  type GridRunnerState,
} from "./game-state";
import { rollLootDrop } from "./loot";
import { DirectionValue, move, tileAt, type Direction } from "./movement";
import {
  GameScreenValue,
  OnboardingKeyValue,
  TileKindValue,
  type GameMap,
  type GridRunnerSave,
  type MapTile,
  type Position,
} from "./types";

const BOSS_MIN_LEVEL: Record<string, number> = {
  lazarus: 5,
  "trader-traitor": 7,
};

const DIRECTION_DELTA: Record<Direction, Position> = {
  [DirectionValue.Up]: { x: 0, y: -1 },
  [DirectionValue.Down]: { x: 0, y: 1 },
  [DirectionValue.Left]: { x: -1, y: 0 },
  [DirectionValue.Right]: { x: 1, y: 0 },
};

function positionAt(x: number, y: number): Position {
  return { x, y };
}

function tryOverworldUnlock(
  state: GridRunnerState,
  direction: Direction,
  map: GameMap,
): GridRunnerState | null {
  if (state.screen !== GameScreenValue.Overworld || !state.save) return null;
  const delta = DIRECTION_DELTA[direction];
  const target = positionAt(
    state.playerPos.x + delta.x,
    state.playerPos.y + delta.y,
  );
  const tile = tileAt(map, target);
  if (
    tile?.kind === TileKindValue.Locked &&
    tile.buildingId === SectorZoneId.Exchange &&
    state.save.defeatedBosses.includes("lazarus")
  ) {
    const exchange = getMap(SectorZoneId.Exchange);
    if (!exchange) return null;
    return {
      ...state,
      screen: GameScreenValue.Building,
      currentZone: SectorZoneId.Exchange,
      playerPos: exchange.spawn,
      overworldPos: target,
      facing: direction,
      save: {
        ...state.save,
        currentZone: SectorZoneId.Exchange,
        currentPosition: exchange.spawn,
      },
      lootConsumed: {},
    };
  }
  if (
    tile?.kind !== TileKindValue.Gate ||
    !state.save.defeatedBosses.includes("trader-traitor")
  ) {
    return null;
  }
  return {
    ...state,
    playerPos: target,
    overworldPos: target,
    facing: direction,
    save: { ...state.save, currentPosition: target },
    overlay: OverlayValue.SectorUnlock,
    overlayReturnTo: OverlayValue.None,
  };
}

function tryEnterBuilding(
  state: GridRunnerState,
  direction: Direction,
  tile: MapTile | null,
): GridRunnerState | null {
  if (
    state.screen !== GameScreenValue.Overworld ||
    tile?.kind !== TileKindValue.Entry ||
    !tile.buildingId
  ) {
    return null;
  }
  const building = getMap(tile.buildingId);
  if (!building) return null;
  const save = state.save
    ? {
        ...state.save,
        currentZone: tile.buildingId,
        currentPosition: building.spawn,
      }
    : null;
  const base = {
    ...state,
    screen: GameScreenValue.Building,
    currentZone: tile.buildingId,
    playerPos: building.spawn,
    overworldPos: state.playerPos,
    facing: DirectionValue.Up,
    save,
    lootConsumed: {},
  };
  if (
    tile.buildingId !== SectorZoneId.Arcade ||
    !save ||
    save.completedTutorial ||
    state.tutorialStep !== TutorialStepValue.Inactive
  ) {
    return base;
  }
  const enemy = spawnEnemy("script-kiddie", save.player.level);
  return {
    ...base,
    battleTransition: BattleTransitionPhaseValue.Entering,
    pendingBattle: createBattle(enemy, false),
    tutorialStep: TutorialStepValue.Scan,
  };
}

function tryExitBuilding(
  state: GridRunnerState,
  tile: MapTile | null,
): GridRunnerState | null {
  if (
    state.screen !== GameScreenValue.Building ||
    tile?.kind !== TileKindValue.Entry ||
    tile.buildingId !== SectorZoneId.Sector01
  ) {
    return null;
  }
  const save = state.save
    ? {
        ...state.save,
        currentZone: SectorZoneId.Sector01,
        currentPosition: state.overworldPos,
      }
    : null;
  return {
    ...state,
    screen: GameScreenValue.Overworld,
    currentZone: SectorZoneId.Sector01,
    playerPos: state.overworldPos,
    facing: DirectionValue.Down,
    save,
    lootConsumed: {},
  };
}

function queueBossPrompt(
  state: GridRunnerState,
  map: GameMap,
  position: Position,
  tile: MapTile | null,
) {
  const queue = state.onboardingQueue;
  if (
    state.screen !== GameScreenValue.Building ||
    !state.save ||
    state.save.onboarding.boss ||
    queue.includes(OnboardingKeyValue.Boss)
  ) {
    return queue;
  }
  const neighbors = [
    positionAt(position.x, position.y - 1),
    positionAt(position.x, position.y + 1),
    positionAt(position.x - 1, position.y),
    positionAt(position.x + 1, position.y),
  ];
  const nearBoss = neighbors.some(
    (neighbor) => tileAt(map, neighbor)?.kind === TileKindValue.Boss,
  );
  return nearBoss && tile?.kind !== TileKindValue.Boss
    ? [...queue, OnboardingKeyValue.Boss]
    : queue;
}

function collectTileLoot(
  state: GridRunnerState,
  position: Position,
  tile: MapTile | null,
  save: GridRunnerSave | null,
) {
  const key = `${state.currentZone}:${position.x},${position.y}`;
  if (
    state.screen !== GameScreenValue.Building ||
    tile?.loot !== true ||
    !save ||
    state.lootConsumed[key]
  ) {
    return { save, consumed: state.lootConsumed };
  }
  const drop = rollLootDrop(save.player.level, true);
  const consumed: Record<string, true> = {
    ...state.lootConsumed,
    [key]: true,
  };
  return {
    save: drop ? { ...save, inventory: [...save.inventory, drop] } : save,
    consumed,
  };
}

function tryBossBattle(
  state: GridRunnerState,
  tile: MapTile | null,
  base: GridRunnerState,
): GridRunnerState | null {
  if (
    state.screen !== GameScreenValue.Building ||
    tile?.kind !== TileKindValue.Boss ||
    !tile.bossId ||
    !state.save
  ) {
    return null;
  }
  const boss = bosses[tile.bossId];
  const minLevel = BOSS_MIN_LEVEL[tile.bossId] ?? 1;
  if (!boss || state.save.player.level < minLevel) return null;
  const enemy = { def: boss, hp: boss.baseHp, maxHp: boss.baseHp };
  return {
    ...base,
    battleTransition: BattleTransitionPhaseValue.Entering,
    pendingBattle: createBattle(enemy, true),
  };
}

function tryShop(
  state: GridRunnerState,
  tile: MapTile | null,
  base: GridRunnerState,
): GridRunnerState | null {
  if (
    state.screen !== GameScreenValue.Building ||
    tile?.kind !== TileKindValue.Building ||
    tile.buildingId !== FacilityValue.Shop ||
    !state.save
  ) {
    return null;
  }
  if (state.save.onboarding.shop) {
    return {
      ...base,
      overlay: OverlayValue.Shop,
      overlayReturnTo: OverlayValue.None,
    };
  }
  return {
    ...base,
    onboardingQueue: [
      ...base.onboardingQueue,
      OnboardingKeyValue.Shop,
    ],
    pendingShopOpen: true,
  };
}

function canEncounter(
  state: GridRunnerState,
  tile: MapTile | null,
): boolean {
  if (state.screen === GameScreenValue.Overworld) {
    return tile?.kind === TileKindValue.Sea;
  }
  if (state.screen !== GameScreenValue.Building) return false;
  if (tile?.encounter !== undefined) return tile.encounter;
  return tile?.kind === TileKindValue.Ground;
}

function tryEncounter(
  state: GridRunnerState,
  tile: MapTile | null,
  base: GridRunnerState,
): GridRunnerState | null {
  if (!canEncounter(state, tile) || !shouldEncounter(state.currentZone)) {
    return null;
  }
  const enemyId = pickRandomEnemy(state.currentZone);
  if (!enemyId || !state.save) return null;
  const enemy = spawnEnemy(enemyId, state.save.player.level);
  return {
    ...base,
    battleTransition: BattleTransitionPhaseValue.Entering,
    pendingBattle: createBattle(enemy, false),
  };
}

export function reduceMove(
  state: GridRunnerState,
  direction: Direction,
): GridRunnerState {
  const map = getMap(state.currentZone);
  if (
    state.overlay !== OverlayValue.None ||
    state.battleTransition !== null ||
    !map
  ) {
    return state;
  }
  if (
    state.screen !== GameScreenValue.Overworld &&
    state.screen !== GameScreenValue.Building
  ) {
    return state;
  }
  const unlocked = tryOverworldUnlock(state, direction, map);
  if (unlocked) return unlocked;
  const position = move(state.playerPos, direction, map);
  if (position.x === state.playerPos.x && position.y === state.playerPos.y) {
    return { ...state, facing: direction };
  }
  const tile = tileAt(map, position);
  const entered = tryEnterBuilding(state, direction, tile);
  if (entered) return entered;
  const exited = tryExitBuilding(state, tile);
  if (exited) return exited;
  const save = state.save
    ? { ...state.save, currentPosition: position, currentZone: state.currentZone }
    : null;
  const onboardingQueue = queueBossPrompt(state, map, position, tile);
  const loot = collectTileLoot(state, position, tile, save);
  const base: GridRunnerState = {
    ...state,
    playerPos: position,
    facing: direction,
    save: loot.save,
    onboardingQueue,
    lootConsumed: loot.consumed,
    ...(state.currentZone === SectorZoneId.Sector01
      ? { overworldPos: position }
      : {}),
  };
  return (
    tryBossBattle(state, tile, base) ??
    tryShop(state, tile, base) ??
    tryEncounter(state, tile, base) ??
    base
  );
}

export function dismissActiveOnboarding(state: GridRunnerState): GridRunnerState | null {
  if (state.onboardingQueue.length === 0 || !state.save) return null;
  const key = state.onboardingQueue[0];
  const openShop = key === OnboardingKeyValue.Shop && state.pendingShopOpen;
  return {
    ...state,
    save: {
      ...state.save,
      onboarding: { ...state.save.onboarding, [key]: true },
    },
    onboardingQueue: state.onboardingQueue.slice(1),
    pendingShopOpen: openShop ? false : state.pendingShopOpen,
    overlay: openShop ? OverlayValue.Shop : state.overlay,
    overlayReturnTo: openShop ? OverlayValue.None : state.overlayReturnTo,
  };
}

function interactWithTile(state: GridRunnerState): GridRunnerState {
  const map = getMap(state.currentZone);
  if (!map) return state;
  const tile = tileAt(map, state.playerPos);
  if (
    tile?.kind !== TileKindValue.Building ||
    !state.save
  ) {
    return state;
  }
  if (tile.buildingId === FacilityValue.Shop) {
    if (state.save.onboarding.shop) {
      return {
        ...state,
        overlay: OverlayValue.Shop,
        overlayReturnTo: OverlayValue.None,
      };
    }
    return {
      ...state,
      onboardingQueue: [
        ...state.onboardingQueue,
        OnboardingKeyValue.Shop,
      ],
      pendingShopOpen: true,
    };
  }
  if (tile.buildingId === FacilityValue.Save) {
    return {
      ...state,
      overlay: OverlayValue.Save,
      overlayReturnTo: OverlayValue.None,
    };
  }
  return state;
}

export function reduceInteraction(state: GridRunnerState): GridRunnerState {
  if (state.tutorialStep === TutorialStepValue.Move) {
    return { ...state, tutorialStep: TutorialStepValue.Finish };
  }
  if (state.tutorialStep === TutorialStepValue.Finish && state.save) {
    return {
      ...state,
      tutorialStep: TutorialStepValue.Inactive,
      save: { ...state.save, completedTutorial: true },
    };
  }
  return dismissActiveOnboarding(state) ?? interactWithTile(state);
}

