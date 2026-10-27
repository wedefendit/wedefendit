import { useCallback, useEffect, useReducer, useRef } from "react";
import { addBadge } from "../../shared/storage";
import { getMap } from "../data/sectors";
import { sector01 } from "../data/sectors/sector-01";
import { badgesForTransition } from "../engine/badges";
import { gameReducer } from "../engine/game-reducer";
import { createInitialGameState, GameActionValue, OverlayValue, REGEN_TIMING, type GridRunnerAction, type GridRunnerState } from "../engine/game-state";
import { DirectionValue, tileAt, type Direction } from "../engine/movement";
import { writeSave } from "../engine/save";
import { BattlePhaseValue, GameScreenValue, type GridRunnerSave, type OnboardingKey, type ToolInstance } from "../engine/types";

enum BrowserEventValue { KeyDown = "keydown", KeyUp = "keyup" }
enum KeyboardKeyValue { Escape = "Escape", Backspace = "Backspace", Tab = "Tab", LowerI = "i", UpperI = "I", LowerD = "d", UpperD = "D", LowerO = "o", UpperO = "O", LowerM = "m", UpperM = "M", RunSlot = "5", LowerR = "r", UpperR = "R", Enter = "Enter", Space = " ", ArrowUp = "ArrowUp", ArrowDown = "ArrowDown", ArrowLeft = "ArrowLeft", ArrowRight = "ArrowRight", LowerW = "w", UpperW = "W", LowerS = "s", UpperS = "S", LowerA = "a", UpperA = "A" }
const INPUT_LIMITS = { firstToolSlot: 1, lastToolSlot: 4, repeatMs: 180 };
const MOVE_KEYS: Record<string, Direction> = {
  [KeyboardKeyValue.ArrowUp]: DirectionValue.Up,
  [KeyboardKeyValue.ArrowDown]: DirectionValue.Down,
  [KeyboardKeyValue.ArrowLeft]: DirectionValue.Left,
  [KeyboardKeyValue.ArrowRight]: DirectionValue.Right,
  [KeyboardKeyValue.LowerW]: DirectionValue.Up,
  [KeyboardKeyValue.UpperW]: DirectionValue.Up,
  [KeyboardKeyValue.LowerS]: DirectionValue.Down,
  [KeyboardKeyValue.UpperS]: DirectionValue.Down,
  [KeyboardKeyValue.LowerA]: DirectionValue.Left,
  [KeyboardKeyValue.UpperA]: DirectionValue.Left,
  [KeyboardKeyValue.LowerD]: DirectionValue.Right,
  [KeyboardKeyValue.UpperD]: DirectionValue.Right,
};

type GameDispatch = (action: GridRunnerAction) => void;
type KeyboardState = Pick<GridRunnerState, "screen" | "overlay" | "save"> & {
  battlePhase: NonNullable<GridRunnerState["battle"]>["phase"] | undefined;
};

function isMapScreen(state: KeyboardState): boolean {
  return state.screen === GameScreenValue.Overworld || state.screen === GameScreenValue.Building;
}

function handleEscape(event: KeyboardEvent, state: KeyboardState, dispatch: GameDispatch): boolean {
  if (event.key !== KeyboardKeyValue.Escape) return false;
  event.preventDefault();
  dispatch({
    type: state.overlay === OverlayValue.None
      ? GameActionValue.OpenMenu
      : GameActionValue.CloseOverlay,
  });
  return true;
}

function handleBackspace(event: KeyboardEvent, state: KeyboardState, dispatch: GameDispatch): boolean {
  if (event.key !== KeyboardKeyValue.Backspace || state.overlay === OverlayValue.None) return false;
  event.preventDefault();
  dispatch({ type: GameActionValue.CloseOverlay });
  return true;
}

function handleTab(event: KeyboardEvent, dispatch: GameDispatch): boolean {
  if (event.key !== KeyboardKeyValue.Tab) return false;
  event.preventDefault();
  dispatch({ type: GameActionValue.CycleOverlay });
  return true;
}

function handleInventory(event: KeyboardEvent, state: KeyboardState, dispatch: GameDispatch): boolean {
  const pressed = event.key === KeyboardKeyValue.LowerI || event.key === KeyboardKeyValue.UpperI;
  if (!pressed || !isMapScreen(state)) return false;
  event.preventDefault();
  dispatch({ type: GameActionValue.OpenDirect, target: OverlayValue.Inventory });
  return true;
}

function handleDisc(event: KeyboardEvent, state: KeyboardState, dispatch: GameDispatch): boolean {
  const pressed = event.shiftKey &&
    (event.key === KeyboardKeyValue.UpperD || event.key === KeyboardKeyValue.LowerD);
  const playerTurn = state.screen === GameScreenValue.Battle &&
    state.battlePhase === BattlePhaseValue.PlayerTurn;
  if (!pressed || (!playerTurn && !isMapScreen(state))) return false;
  event.preventDefault();
  dispatch({ type: GameActionValue.OpenDirect, target: OverlayValue.Disc });
  return true;
}

function handleOperator(event: KeyboardEvent, state: KeyboardState, dispatch: GameDispatch): boolean {
  const pressed = event.key === KeyboardKeyValue.LowerO || event.key === KeyboardKeyValue.UpperO;
  if (!pressed || !isMapScreen(state)) return false;
  event.preventDefault();
  dispatch({ type: GameActionValue.OpenDirect, target: OverlayValue.Operator });
  return true;
}

function handleMenu(event: KeyboardEvent, dispatch: GameDispatch): boolean {
  if (event.key !== KeyboardKeyValue.LowerM && event.key !== KeyboardKeyValue.UpperM) return false;
  event.preventDefault();
  dispatch({ type: GameActionValue.OpenMenu });
  return true;
}

function handleBattleInput(event: KeyboardEvent, state: KeyboardState, dispatch: GameDispatch): boolean {
  if (state.screen !== GameScreenValue.Battle || state.battlePhase !== BattlePhaseValue.PlayerTurn || !state.save) return false;
  const toolSlot = Number(event.key);
  if (toolSlot >= INPUT_LIMITS.firstToolSlot && toolSlot <= INPUT_LIMITS.lastToolSlot) {
    event.preventDefault();
    const tool = state.save.equippedTools[toolSlot - 1];
    if (tool && state.save.player.compute >= tool.energyCost) {
      dispatch({ type: GameActionValue.UseTool, tool });
    }
    return true;
  }
  const run = event.key === KeyboardKeyValue.RunSlot ||
    event.key === KeyboardKeyValue.LowerR ||
    event.key === KeyboardKeyValue.UpperR;
  if (!run) return false;
  event.preventDefault();
  dispatch({ type: GameActionValue.Run });
  return true;
}

function handleInteract(event: KeyboardEvent, dispatch: GameDispatch): boolean {
  if (event.key !== KeyboardKeyValue.Enter && event.key !== KeyboardKeyValue.Space) return false;
  event.preventDefault();
  dispatch({ type: GameActionValue.Interact });
  return true;
}

function handleMove(event: KeyboardEvent, held: Set<string>, dispatch: GameDispatch): void {
  const direction = MOVE_KEYS[event.key];
  if (!direction) return;
  event.preventDefault();
  if (held.has(event.key)) return;
  held.add(event.key);
  dispatch({ type: GameActionValue.Move, dir: direction });
}

function handleKeyDown(
  event: KeyboardEvent,
  state: KeyboardState,
  held: Set<string>,
  dispatch: GameDispatch,
): void {
  if (handleEscape(event, state, dispatch)) return;
  if (handleBackspace(event, state, dispatch)) return;
  if (handleTab(event, dispatch)) return;
  if (handleInventory(event, state, dispatch)) return;
  if (handleDisc(event, state, dispatch)) return;
  if (handleOperator(event, state, dispatch)) return;
  if (handleMenu(event, dispatch)) return;
  if (state.overlay !== OverlayValue.None) return;
  if (handleBattleInput(event, state, dispatch)) return;
  if (handleInteract(event, dispatch)) return;
  handleMove(event, held, dispatch);
}

export function useGridRunner() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialGameState);
  const moveRepeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    dispatch({ type: GameActionValue.CheckSave });
  }, []);

  useEffect(() => {
    if (state.save) {
      writeSave(state.save);
    }
  }, [state.save]);

  const prevSaveRef = useRef<GridRunnerSave | null>(null);
  useEffect(() => {
    const earned = badgesForTransition(
      prevSaveRef.current,
      state.save,
      new Date().toISOString(),
    );
    prevSaveRef.current = state.save;
    for (const badge of earned) {
      void addBadge(badge);
    }
  }, [state.save]);

  const lastMoveRef = useRef<number | null>(null);
  useEffect(() => {
    lastMoveRef.current = Date.now();
  }, [state.playerPos]);

  const needsRegen =
    !!state.save &&
    (state.save.player.integrity < state.save.player.maxIntegrity ||
      state.save.player.compute < state.save.player.maxCompute);
  const regenActive =
    needsRegen &&
    state.overlay === OverlayValue.None &&
    state.battle === null &&
    (state.screen === GameScreenValue.Overworld || state.screen === GameScreenValue.Building);

  useEffect(() => {
    if (!regenActive) return;
    const id = setInterval(() => {
      if (
        lastMoveRef.current === null ||
        Date.now() - lastMoveRef.current < REGEN_TIMING.settleMs
      ) {
        return;
      }
      dispatch({ type: GameActionValue.RegenTick });
    }, REGEN_TIMING.tickMs);
    return () => clearInterval(id);
  }, [regenActive]);

  useEffect(() => {
    if (state.screen === GameScreenValue.Title || state.screen === GameScreenValue.Boot) return;

    const held = new Set<string>();

    function onKeyDown(event: KeyboardEvent) {
      handleKeyDown(event, {
        screen: state.screen,
        overlay: state.overlay,
        battlePhase: state.battle?.phase,
        save: state.save,
      }, held, dispatch);
    }

    function onKeyUp(e: KeyboardEvent) {
      held.delete(e.key);
    }

    globalThis.addEventListener(BrowserEventValue.KeyDown, onKeyDown);
    globalThis.addEventListener(BrowserEventValue.KeyUp, onKeyUp);
    return () => {
      globalThis.removeEventListener(BrowserEventValue.KeyDown, onKeyDown);
      globalThis.removeEventListener(BrowserEventValue.KeyUp, onKeyUp);
    };
  }, [state.screen, state.overlay, state.battle?.phase, state.save]);

  const startGame = useCallback((name: string) => {
    dispatch({ type: GameActionValue.NewGame, name });
  }, []);

  const continueGame = useCallback(() => {
    dispatch({ type: GameActionValue.Continue });
  }, []);

  const handleDPadPress = useCallback(
    (dir: Direction) => {
      if (state.screen !== GameScreenValue.Overworld && state.screen !== GameScreenValue.Building) return;
      dispatch({ type: GameActionValue.Move, dir });
      moveRepeatRef.current = setInterval(() => {
        dispatch({ type: GameActionValue.Move, dir });
      }, INPUT_LIMITS.repeatMs);
    },
    [state.screen],
  );

  const handleDPadRelease = useCallback(() => {
    if (moveRepeatRef.current) {
      clearInterval(moveRepeatRef.current);
      moveRepeatRef.current = null;
    }
  }, []);

  const handleInteract = useCallback(() => {
    dispatch({ type: GameActionValue.Interact });
  }, []);

  const handleUseTool = useCallback((tool: ToolInstance) => {
    dispatch({ type: GameActionValue.UseTool, tool });
  }, []);

  const handleRun = useCallback(() => {
    dispatch({ type: GameActionValue.Run });
  }, []);

  const handleBattleEnd = useCallback(() => {
    dispatch({ type: GameActionValue.BattleEnd });
  }, []);

  const handleBattleTransitionEnd = useCallback(() => {
    dispatch({ type: GameActionValue.BattleTransitionEnd });
  }, []);

  const handleOpenMenu = useCallback(() => {
    dispatch({ type: GameActionValue.OpenMenu });
  }, []);

  const handleOpenDisc = useCallback(() => {
    dispatch({ type: GameActionValue.OpenDisc });
  }, []);

  const handleCloseOverlay = useCallback(() => {
    dispatch({ type: GameActionValue.CloseOverlay });
  }, []);

  const handleOpenOverlay = useCallback(
    (
      target:
        | OverlayValue.Disc
        | OverlayValue.Inventory
        | OverlayValue.Operator
        | OverlayValue.Save
        | OverlayValue.Settings,
    ) => {
      dispatch({ type: GameActionValue.OpenOverlay, target });
    },
    [],
  );

  const handleEquipTool = useCallback((toolId: string, slotIndex: number) => {
    dispatch({ type: GameActionValue.EquipTool, toolId, slotIndex });
  }, []);

  const handleScrapTool = useCallback((toolId: string) => {
    dispatch({ type: GameActionValue.ScrapTool, toolId });
  }, []);

  const handleManualSave = useCallback(() => {
    dispatch({ type: GameActionValue.ManualSave });
  }, []);

  const handleBuyTool = useCallback((baseToolId: string) => {
    dispatch({ type: GameActionValue.BuyTool, baseToolId });
  }, []);

  const handleOpenShop = useCallback(() => {
    dispatch({ type: GameActionValue.OpenShop });
  }, []);

  const handleBootDone = useCallback(() => {
    dispatch({ type: GameActionValue.BootDone });
  }, []);

  const handleDeleteSave = useCallback(() => {
    dispatch({ type: GameActionValue.DeleteSave });
  }, []);

  const handleDismissLevelUp = useCallback(() => {
    dispatch({ type: GameActionValue.DismissLevelUp });
  }, []);

  const handleAdvanceTutorial = useCallback(() => {
    dispatch({ type: GameActionValue.AdvanceTutorial });
  }, []);

  const handleDismissIntel = useCallback(() => {
    dispatch({ type: GameActionValue.DismissIntel });
  }, []);

  const handleDismissSectorUnlock = useCallback(() => {
    dispatch({ type: GameActionValue.DismissSectorUnlock });
  }, []);

  const handleDismissOnboarding = useCallback((key: OnboardingKey) => {
    dispatch({ type: GameActionValue.DismissOnboarding, key });
  }, []);

  const currentMap = getMap(state.currentZone) ?? sector01.maps[sector01.id];
  const currentTile = tileAt(currentMap, state.playerPos);

  return {
    screen: state.screen,
    save: state.save,
    hasSaveFile: state.hasSaveFile,
    saveSummary: state.saveSummary,
    playerPos: state.playerPos,
    facing: state.facing,
    currentTile,
    currentZone: state.currentZone,
    map: currentMap,
    battle: state.battle,
    overlay: state.overlay,
    levelUpSummary: state.levelUpSummary,
    tutorialStep: state.tutorialStep,
    pendingIntelBossId: state.pendingIntelBossId,
    battleTransition: state.battleTransition,
    activeOnboarding: state.onboardingQueue[0] ?? null,
    startGame,
    continueGame,
    handleDPadPress,
    handleDPadRelease,
    handleInteract,
    handleUseTool,
    handleRun,
    handleBattleEnd,
    handleBattleTransitionEnd,
    handleOpenMenu,
    handleOpenDisc,
    handleCloseOverlay,
    handleOpenOverlay,
    handleEquipTool,
    handleScrapTool,
    handleManualSave,
    handleBuyTool,
    handleOpenShop,
    handleBootDone,
    handleDeleteSave,
    handleDismissLevelUp,
    handleAdvanceTutorial,
    handleDismissIntel,
    handleDismissSectorUnlock,
    handleDismissOnboarding,
  };
}
