import type { GameMap, Position } from "./types";

export enum DirectionValue { Up = "up", Down = "down", Left = "left", Right = "right" }
export type Direction = `${DirectionValue}`;

const DELTA: Record<Direction, Position> = {
  [DirectionValue.Up]: { x: 0, y: -1 },
  [DirectionValue.Down]: { x: 0, y: 1 },
  [DirectionValue.Left]: { x: -1, y: 0 },
  [DirectionValue.Right]: { x: 1, y: 0 },
};

export function move(pos: Position, dir: Direction, map: GameMap): Position {
  const d = DELTA[dir];
  const nx = pos.x + d.x;
  const ny = pos.y + d.y;

  if (nx < 0 || nx >= map.width || ny < 0 || ny >= map.height) {
    return pos;
  }

  const tile = map.tiles[ny][nx];
  if (!tile.walkable) return pos;

  return { x: nx, y: ny };
}

export function tileAt(map: GameMap, pos: Position) {
  if (pos.x < 0 || pos.x >= map.width || pos.y < 0 || pos.y >= map.height) {
    return null;
  }
  return map.tiles[pos.y][pos.x];
}
