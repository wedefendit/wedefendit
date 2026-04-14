/*
Copyright © 2025 Defend I.T. Solutions LLC. All Rights Reserved.
*/

import { useCallback, useEffect, useReducer, useRef } from "react";
import type { GameScreen, GridRunnerSave, Position } from "../engine/types";
import { createNewSave, hasSave, loadSave, writeSave } from "../engine/save";
import { move, tileAt, type Direction } from "../engine/movement";
import { overworldMap } from "../data/maps/overworld";

/* ------------------------------------------------------------------ */
/*  State                                                             */
/* ------------------------------------------------------------------ */

interface GameState {
  screen: GameScreen;
  save: GridRunnerSave | null;
  hasSaveFile: boolean;
  playerPos: Position;
  facing: Direction;
}

type Action =
  | { type: "NEW_GAME"; name: string }
  | { type: "CONTINUE" }
  | { type: "MOVE"; dir: Direction }
  | { type: "ENTER_BUILDING"; buildingId: string }
  | { type: "EXIT_BUILDING" }
  | { type: "CHECK_SAVE" };

function init(): GameState {
  return {
    screen: "title",
    save: null,
    hasSaveFile: false,
    playerPos: overworldMap.spawn,
    facing: "down",
  };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "CHECK_SAVE":
      return { ...state, hasSaveFile: hasSave() };

    case "NEW_GAME": {
      const save = createNewSave(action.name);
      writeSave(save);
      return {
        ...state,
        screen: "overworld",
        save,
        hasSaveFile: true,
        playerPos: save.currentPosition,
        facing: "down",
      };
    }

    case "CONTINUE": {
      const save = loadSave();
      if (!save) return state;
      return {
        ...state,
        screen: "overworld",
        save,
        playerPos: save.currentPosition,
        facing: "down",
      };
    }

    case "MOVE": {
      if (state.screen !== "overworld") return state;
      const newPos = move(state.playerPos, action.dir, overworldMap);
      const moved =
        newPos.x !== state.playerPos.x || newPos.y !== state.playerPos.y;
      return {
        ...state,
        playerPos: newPos,
        facing: action.dir,
        // Save position on move
        save: state.save
          ? { ...state.save, currentPosition: newPos }
          : null,
      };
    }

    case "ENTER_BUILDING":
      // Future: load building interior
      return state;

    case "EXIT_BUILDING":
      return { ...state, screen: "overworld" };

    default:
      return state;
  }
}

/* ------------------------------------------------------------------ */
/*  Hook                                                              */
/* ------------------------------------------------------------------ */

export function useGridRunner() {
  const [state, dispatch] = useReducer(reducer, undefined, init);
  const moveRepeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check for existing save on mount
  useEffect(() => {
    dispatch({ type: "CHECK_SAVE" });
  }, []);

  // Auto-save on position change
  useEffect(() => {
    if (state.save && state.screen === "overworld") {
      writeSave(state.save);
    }
  }, [state.save, state.screen]);

  // Keyboard controls
  useEffect(() => {
    if (state.screen !== "overworld") return;

    const keyMap: Record<string, Direction> = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
      w: "up",
      W: "up",
      s: "down",
      S: "down",
      a: "left",
      A: "left",
      d: "right",
      D: "right",
    };

    const held = new Set<string>();

    function onKeyDown(e: KeyboardEvent) {
      const dir = keyMap[e.key];
      if (!dir) return;
      e.preventDefault();
      if (held.has(e.key)) return;
      held.add(e.key);
      dispatch({ type: "MOVE", dir });
    }

    function onKeyUp(e: KeyboardEvent) {
      held.delete(e.key);
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [state.screen]);

  const startGame = useCallback((name: string) => {
    dispatch({ type: "NEW_GAME", name });
  }, []);

  const continueGame = useCallback(() => {
    dispatch({ type: "CONTINUE" });
  }, []);

  const handleDPadPress = useCallback(
    (dir: Direction) => {
      if (state.screen !== "overworld") return;
      dispatch({ type: "MOVE", dir });
      // Start repeat after a short delay for held press
      moveRepeatRef.current = setInterval(() => {
        dispatch({ type: "MOVE", dir });
      }, 180);
    },
    [state.screen],
  );

  const handleDPadRelease = useCallback(() => {
    if (moveRepeatRef.current) {
      clearInterval(moveRepeatRef.current);
      moveRepeatRef.current = null;
    }
  }, []);

  // Check tile under player for interactions
  const currentTile = tileAt(overworldMap, state.playerPos);

  return {
    screen: state.screen,
    save: state.save,
    hasSaveFile: state.hasSaveFile,
    playerPos: state.playerPos,
    facing: state.facing,
    currentTile,
    map: overworldMap,
    startGame,
    continueGame,
    handleDPadPress,
    handleDPadRelease,
  };
}
