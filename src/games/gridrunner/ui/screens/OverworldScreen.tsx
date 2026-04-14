/*
Copyright © 2025 Defend I.T. Solutions LLC. All Rights Reserved.
*/

import { useCallback, useEffect, useRef, useState } from "react";
import type { GameMap, MapTile, Position, TileKind } from "../../engine/types";
import type { Direction } from "../../engine/movement";

type OverworldScreenProps = Readonly<{
  map: GameMap;
  playerPos: Position;
  facing: Direction;
}>;

/* ------------------------------------------------------------------ */
/*  Tile colors                                                       */
/* ------------------------------------------------------------------ */

const TILE_BG: Record<TileKind, string> = {
  ground: "#0a0e1a",
  wall: "#0d1520",
  building: "#111d30",
  entry: "#0a1225",
  locked: "#100d18",
  spawn: "#0a0e1a",
};

const TILE_BORDER: Record<TileKind, string> = {
  ground: "#1a3a4a",
  wall: "#1a2a38",
  building: "#00f0ff",
  entry: "#00ff41",
  locked: "#ff003c",
  spawn: "#1a3a4a",
};

const FACING_ARROW: Record<Direction, string> = {
  up: "\u25B2",
  down: "\u25BC",
  left: "\u25C0",
  right: "\u25B6",
};

/* ------------------------------------------------------------------ */
/*  Components                                                        */
/* ------------------------------------------------------------------ */

function Tile({ tile }: { tile: MapTile }) {
  const showLabel =
    tile.label && (tile.kind === "entry" || tile.kind === "locked");

  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        backgroundColor: TILE_BG[tile.kind],
        border: `1px solid ${TILE_BORDER[tile.kind]}`,
        ...(tile.kind === "building" || tile.kind === "locked"
          ? { boxShadow: `inset 0 0 6px ${TILE_BORDER[tile.kind]}22` }
          : {}),
      }}
    >
      {showLabel && (
        <span
          className="text-center leading-none"
          style={{
            fontSize: "clamp(5px, 1.2vw, 8px)",
            color: TILE_BORDER[tile.kind],
            opacity: 0.7,
            fontFamily: "'Share Tech Mono', monospace",
          }}
        >
          {tile.kind === "locked" ? "LOCKED" : "ENTER"}
        </span>
      )}
    </div>
  );
}

function PlayerAvatar({ facing }: { facing: Direction }) {
  return (
    <div
      data-testid="gr-player"
      className="absolute inset-0 z-10 flex items-center justify-center"
    >
      <div
        className="flex items-center justify-center rounded-sm"
        style={{
          width: "70%",
          height: "70%",
          backgroundColor: "#00f0ff",
          boxShadow: "0 0 8px #00f0ff, 0 0 3px #00f0ff",
          color: "#0a0e1a",
          fontSize: "clamp(6px, 1.5vw, 12px)",
          fontWeight: "bold",
        }}
      >
        {FACING_ARROW[facing]}
      </div>
    </div>
  );
}

/**
 * Compute the largest WxH rectangle with aspect ratio `cols/rows`
 * that fits inside a container of size `cw x ch`.
 */
function fitGrid(cw: number, ch: number, cols: number, rows: number) {
  const mapRatio = cols / rows;
  const containerRatio = cw / ch;

  if (containerRatio > mapRatio) {
    // Container is wider than map -- height-constrained
    const h = ch;
    const w = h * mapRatio;
    return { w: Math.floor(w), h: Math.floor(h) };
  } else {
    // Container is taller than map -- width-constrained
    const w = cw;
    const h = w / mapRatio;
    return { w: Math.floor(w), h: Math.floor(h) };
  }
}

/**
 * Overworld tile grid. Measures the available container and computes
 * explicit pixel dimensions so tiles are always square.
 */
export function OverworldScreen({
  map,
  playerPos,
  facing,
}: OverworldScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gridSize, setGridSize] = useState<{ w: number; h: number } | null>(
    null,
  );

  const measure = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { clientWidth, clientHeight } = el;
    if (clientWidth > 0 && clientHeight > 0) {
      setGridSize(fitGrid(clientWidth, clientHeight, map.width, map.height));
    }
  }, [map.width, map.height]);

  useEffect(() => {
    measure();
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  return (
    <section
      data-testid="gr-overworld"
      aria-label="Overworld map"
      className="flex flex-1 flex-col overflow-hidden"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      {/* Map label */}
      <div
        className="shrink-0 px-2 py-1 text-center"
        style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: "clamp(8px, 1.5vw, 11px)",
          color: "#00f0ff",
          opacity: 0.5,
          letterSpacing: "0.15em",
        }}
      >
        CYBERSPACE -- SECTOR 01
      </div>

      {/* Measure container, then render grid at computed size */}
      <div
        ref={containerRef}
        className="flex flex-1 min-h-0 items-center justify-center overflow-hidden"
      >
        {gridSize && (
          <div
            data-testid="gr-map"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${map.width}, 1fr)`,
              gridTemplateRows: `repeat(${map.height}, 1fr)`,
              width: gridSize.w,
              height: gridSize.h,
            }}
          >
            {map.tiles.flatMap((row, y) =>
              row.map((tile, x) => (
                <div key={`${x}-${y}`} className="relative min-h-0 min-w-0">
                  <Tile tile={tile} />
                  {x === playerPos.x && y === playerPos.y && (
                    <PlayerAvatar facing={facing} />
                  )}
                </div>
              )),
            )}
          </div>
        )}
      </div>
    </section>
  );
}
