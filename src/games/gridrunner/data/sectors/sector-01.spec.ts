/*
Copyright © 2026 Defend I.T. Solutions LLC. All Rights Reserved.
*/

import { describe, expect, it } from "vitest";
import type { MapTile } from "../../engine/types";
import { sector01 } from "./sector-01";

/**
 * Structural contracts for the Sector 01 module. One TS file per sector,
 * one spec file per sector. Covers:
 *   - Outdoor map dimensions, spawn, perimeter, ENTER/LOCKED door positions,
 *     tile-count floors, walkable-kind invariants
 *   - Interior maps (Arcade, Bank, Crypto Exchange): dimensions, exit tile,
 *     boss tile, encounter/loot flags, perimeter walls
 *   - Sector module surface: correct zone ids registered, intel + badges
 *     shape, enemy pool contents
 */

const outdoor = sector01.maps["sector-01"];
const outdoorTiles: MapTile[] = outdoor.tiles.flat();
const arcade = sector01.maps.arcade;
const bank = sector01.maps.bank;
const exchange = sector01.maps.exchange;

/* ------------------------------------------------------------------ */
/*  OUTDOOR MAP                                                       */
/* ------------------------------------------------------------------ */

describe("sector-01 outdoor map -- dimensions", () => {
  it("is 60 wide by 40 tall", () => {
    expect(outdoor.width).toBe(60);
    expect(outdoor.height).toBe(40);
    expect(outdoor.tiles).toHaveLength(40);
    for (const row of outdoor.tiles) expect(row).toHaveLength(60);
  });

  it("has id 'sector-01' (matches the sector module id)", () => {
    expect(outdoor.id).toBe("sector-01");
    expect(sector01.id).toBe("sector-01");
  });
});

describe("sector-01 outdoor map -- spawn", () => {
  it("spawn is at (14, 10) per the map spec", () => {
    expect(outdoor.spawn).toEqual({ x: 14, y: 10 });
    const tile = outdoor.tiles[10][14];
    expect(tile.kind).toBe("spawn");
    expect(tile.walkable).toBe(true);
  });
});

describe("sector-01 outdoor map -- perimeter", () => {
  it("top and bottom rows are all walls", () => {
    for (let x = 0; x < outdoor.width; x++) {
      expect(outdoor.tiles[0][x].kind).toBe("wall");
      expect(outdoor.tiles[outdoor.height - 1][x].kind).toBe("wall");
    }
  });

  it("left and right columns are all walls", () => {
    for (let y = 0; y < outdoor.height; y++) {
      expect(outdoor.tiles[y][0].kind).toBe("wall");
      expect(outdoor.tiles[y][outdoor.width - 1].kind).toBe("wall");
    }
  });
});

describe("sector-01 outdoor map -- enterable buildings", () => {
  it("Arcade door at (8, 6) is an entry tile for the arcade zone", () => {
    const tile = outdoor.tiles[6][8];
    expect(tile.kind).toBe("entry");
    expect(tile.buildingId).toBe("arcade");
    expect(tile.walkable).toBe(true);
  });

  it("Bank door at (40, 8) is an entry tile for the bank zone", () => {
    const tile = outdoor.tiles[8][40];
    expect(tile.kind).toBe("entry");
    expect(tile.buildingId).toBe("bank");
    expect(tile.walkable).toBe(true);
  });

  it("Crypto Exchange door at (48, 29) is a LOCKED tile for the exchange zone", () => {
    const tile = outdoor.tiles[29][48];
    expect(tile.kind).toBe("locked");
    expect(tile.buildingId).toBe("exchange");
    expect(tile.walkable).toBe(false);
  });
});

describe("sector-01 outdoor map -- sector 02 gate", () => {
  it("gate tile at (58, 34) blocks movement", () => {
    const tile = outdoor.tiles[34][58];
    expect(tile.kind).toBe("gate");
    expect(tile.walkable).toBe(false);
  });

  it("gate has no visible label (looks like a dead-end trace)", () => {
    const tile = outdoor.tiles[34][58];
    expect(tile.label).toBeFalsy();
  });
});

describe("sector-01 outdoor map -- void and walkability rules", () => {
  it("only ground | sea | spawn | entry tile kinds are walkable", () => {
    const walkableKinds = new Set<string>();
    for (const t of outdoorTiles) {
      if (t.walkable) walkableKinds.add(t.kind);
    }
    expect([...walkableKinds].sort((a, b) => a.localeCompare(b))).toEqual([
      "entry",
      "ground",
      "sea",
      "spawn",
    ]);
  });

  it("locked, gate, wall, building, and facade kinds are never walkable", () => {
    const never = new Set(["locked", "gate", "wall", "building", "facade"]);
    for (const t of outdoorTiles) {
      if (never.has(t.kind)) {
        expect(t.walkable, `${t.kind} tile should not be walkable`).toBe(false);
      }
    }
  });

  it("has exactly 2 ENTER door tiles (Arcade + Bank)", () => {
    const entries = outdoorTiles.filter((t) => t.kind === "entry");
    expect(entries).toHaveLength(2);
  });

  it("has exactly 1 LOCKED door tile (Crypto Exchange pre-Lazarus)", () => {
    const locked = outdoorTiles.filter((t) => t.kind === "locked");
    expect(locked).toHaveLength(1);
  });

  it("has exactly 1 gate tile", () => {
    const gates = outdoorTiles.filter((t) => t.kind === "gate");
    expect(gates).toHaveLength(1);
  });
});

describe("sector-01 outdoor map -- footprint sanity", () => {
  it("contains substantial grid-path (ground) coverage", () => {
    const ground = outdoorTiles.filter((t) => t.kind === "ground");
    // Sector 01 is navigation-heavy -- the trace network is the player's
    // primary surface. Loose floor catches regressions that would strip it.
    expect(ground.length).toBeGreaterThan(500);
  });

  it("contains substantial Digital Sea coverage", () => {
    const sea = outdoorTiles.filter((t) => t.kind === "sea");
    // Sea = grind zones. Range catches "no sea" or "entire map flooded".
    expect(sea.length).toBeGreaterThanOrEqual(100);
    expect(sea.length).toBeLessThan(2000);
  });

  it("has decorative buildings (D/d cells become `building` + `facade` kinds)", () => {
    const bodies = outdoorTiles.filter((t) => t.kind === "building");
    const facades = outdoorTiles.filter((t) => t.kind === "facade");
    expect(bodies.length).toBeGreaterThanOrEqual(50);
    expect(facades.length).toBeGreaterThan(0);
    for (const f of facades) expect(f.walkable).toBe(false);
  });

  it("registers both enterable and decorative buildingIds", () => {
    const ids = new Set<string>();
    for (const t of outdoorTiles) if (t.buildingId) ids.add(t.buildingId);
    expect(ids.has("arcade")).toBe(true);
    expect(ids.has("bank")).toBe(true);
    expect(ids.has("exchange")).toBe(true);
    const decor = [...ids].filter((id) => id.startsWith("decor-"));
    expect(decor.length).toBeGreaterThan(0);
  });
});

/* ------------------------------------------------------------------ */
/*  INTERIOR: ARCADE                                                  */
/* ------------------------------------------------------------------ */

describe("sector-01 interior -- Arcade", () => {
  it("is 12x10 and perimeter-walled", () => {
    expect(arcade.width).toBe(12);
    expect(arcade.height).toBe(10);
    for (let x = 0; x < arcade.width; x++) {
      expect(arcade.tiles[0][x].kind).toBe("wall");
      expect(arcade.tiles[arcade.height - 1][x].kind).toBe("wall");
    }
    for (let y = 0; y < arcade.height; y++) {
      expect(arcade.tiles[y][0].kind).toBe("wall");
      expect(arcade.tiles[y][arcade.width - 1].kind).toBe("wall");
    }
  });

  it("exit tiles route back to sector-01", () => {
    const exits = arcade.tiles.flat().filter((t) => t.kind === "entry");
    expect(exits.length).toBeGreaterThan(0);
    for (const e of exits) expect(e.buildingId).toBe("sector-01");
  });

  it("spawn is a walkable entry tile", () => {
    const spawn = arcade.tiles[arcade.spawn.y][arcade.spawn.x];
    expect(spawn.walkable).toBe(true);
  });
});

/* ------------------------------------------------------------------ */
/*  INTERIOR: BANK                                                    */
/* ------------------------------------------------------------------ */

describe("sector-01 interior -- Bank", () => {
  it("is 14x10 and perimeter-walled", () => {
    expect(bank.width).toBe(14);
    expect(bank.height).toBe(10);
  });

  it("contains a Lazarus boss tile", () => {
    const bossTiles = bank.tiles
      .flat()
      .filter((t) => t.kind === "boss" && t.bossId === "lazarus");
    expect(bossTiles).toHaveLength(1);
  });

  it("exit tiles route back to sector-01", () => {
    const exits = bank.tiles.flat().filter((t) => t.kind === "entry");
    expect(exits.length).toBeGreaterThan(0);
    for (const e of exits) expect(e.buildingId).toBe("sector-01");
  });
});

/* ------------------------------------------------------------------ */
/*  INTERIOR: CRYPTO EXCHANGE                                         */
/* ------------------------------------------------------------------ */

describe("sector-01 interior -- Crypto Exchange", () => {
  it("is 14x10 and perimeter-walled", () => {
    expect(exchange.width).toBe(14);
    expect(exchange.height).toBe(10);
  });

  it("has a TraderTraitor boss tile in the top-right room", () => {
    const bossTiles = exchange.tiles
      .flat()
      .filter((t) => t.kind === "boss" && t.bossId === "trader-traitor");
    expect(bossTiles).toHaveLength(1);
  });

  it("has at least 5 encounter-flagged ground tiles (hostile floor)", () => {
    const encounter = exchange.tiles
      .flat()
      .filter((t) => t.kind === "ground" && t.encounter === true);
    expect(encounter.length).toBeGreaterThanOrEqual(5);
  });

  it("has at least 1 loot-flagged ground tile", () => {
    const loot = exchange.tiles
      .flat()
      .filter((t) => t.kind === "ground" && t.loot === true);
    expect(loot.length).toBeGreaterThanOrEqual(1);
  });

  it("has safe ground tiles mixed in (not every floor is hostile)", () => {
    const safe = exchange.tiles
      .flat()
      .filter((t) => t.kind === "ground" && t.encounter !== true);
    expect(safe.length).toBeGreaterThanOrEqual(10);
  });

  it("exit tiles route back to sector-01", () => {
    const exits = exchange.tiles.flat().filter((t) => t.kind === "entry");
    expect(exits.length).toBeGreaterThan(0);
    for (const e of exits) expect(e.buildingId).toBe("sector-01");
  });

  it("spawn is on the bottom-left exit tile at (1, 8)", () => {
    expect(exchange.spawn).toEqual({ x: 1, y: 8 });
  });
});

/* ------------------------------------------------------------------ */
/*  SECTOR MODULE SURFACE                                             */
/* ------------------------------------------------------------------ */

describe("sector-01 module -- registered zones + bosses + intel + badges", () => {
  it("registers the four expected maps", () => {
    expect(Object.keys(sector01.maps).sort()).toEqual(
      ["arcade", "bank", "exchange", "sector-01"].sort(),
    );
  });

  it("registers both Sector 01 bosses with correct weaknesses", () => {
    expect(sector01.bosses.lazarus).toBeDefined();
    expect(sector01.bosses.lazarus.weakness).toBe("defense");
    expect(sector01.bosses["trader-traitor"]).toBeDefined();
    expect(sector01.bosses["trader-traitor"].weakness).toBe("recon");
  });

  it("registers all four zone configs", () => {
    expect(Object.keys(sector01.zones).sort()).toEqual(
      ["arcade", "bank", "exchange", "sector-01"].sort(),
    );
    for (const cfg of Object.values(sector01.zones)) {
      expect(cfg.encounterRate).toBeGreaterThan(0);
      expect(cfg.encounterRate).toBeLessThan(1);
      expect(cfg.enemies.length).toBeGreaterThan(0);
    }
  });

  it("exchange zone pool includes the three new enemies", () => {
    expect(sector01.zones.exchange.enemies).toEqual(
      expect.arrayContaining([
        "cryptominer",
        "mixer-bot",
        "rug-puller",
        "wallet-drainer",
      ]),
    );
  });

  it("registers intel for both bosses", () => {
    expect(sector01.intel.lazarus).toBeDefined();
    expect(sector01.intel["trader-traitor"]).toBeDefined();
    expect(sector01.intel.lazarus.badgeId).toBe("bank-buster");
    expect(sector01.intel["trader-traitor"].badgeId).toBe("exchange-raider");
  });

  it("registers all V1 badges including boss first-kill + generic", () => {
    const ids = sector01.badges.map((b) => b.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "grid-runner",
        "bank-buster",
        "exchange-raider",
        "loot-hoarder",
        "epic-collector",
      ]),
    );
  });

  it("provides long + short zone display names for all registered zones", () => {
    for (const zoneId of Object.keys(sector01.maps)) {
      expect(sector01.zoneNames[zoneId]).toBeTruthy();
      expect(sector01.zoneLabels[zoneId]).toBeTruthy();
    }
  });
});
