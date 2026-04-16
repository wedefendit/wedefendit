/*
Copyright © 2026 Defend I.T. Solutions LLC. All Rights Reserved.
*/

import type { GameMap, Position } from "./types";

export type Direction = "up" | "down" | "left" | "right";

const DELTA: Record<Direction, Position> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

/**
 * Attempt to move in a direction. Returns the new position if the
 * target tile is walkable, otherwise returns the current position unchanged.
 */
export function move(pos: Position, dir: Direction, map: GameMap): Position {
  const d = DELTA[dir];
  const nx = pos.x + d.x;
  const ny = pos.y + d.y;

  // Bounds check
  if (nx < 0 || nx >= map.width || ny < 0 || ny >= map.height) {
    return pos;
  }

  const tile = map.tiles[ny][nx];
  if (!tile.walkable) return pos;

  return { x: nx, y: ny };
}

/**
 * Get the tile at a position. Returns null if out of bounds.
 */
export function tileAt(map: GameMap, pos: Position) {
  if (pos.x < 0 || pos.x >= map.width || pos.y < 0 || pos.y >= map.height) {
    return null;
  }
  return map.tiles[pos.y][pos.x];
}
