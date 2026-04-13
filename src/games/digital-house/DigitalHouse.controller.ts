/*
Copyright © 2025 Defend I.T. Solutions LLC. All Rights Reserved.

This software and its source code are the proprietary property of
Defend I.T. Solutions LLC and are protected by United States and
international copyright laws. Unauthorized reproduction, distribution,
modification, display, or use of this software, in whole or in part, without the
prior written permission of Defend I.T. Solutions LLC, is strictly prohibited.

This software is provided for use only by authorized employees, contractors, or
licensees of Defend I.T. Solutions LLC and may not be disclosed to any third
party without express written consent.
*/

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Difficulty } from "../shared/types";
import { useGameShell } from "../shared/GameShell";
import { getGamePreference, setGamePreference } from "../shared/storage";
import { DEVICES, ROOM_ZONE_ASSIGNMENTS, calculateScore, type Device, type DeviceId, type DevicePlacement, type RoomId, type ZoneId } from "./engine";
import { inventoryColumnsForRail, isCompactDesktopLayout, widthToBand } from "./layout";
import { DIGITAL_HOUSE_GAME_ID, HELP_PREF_KEY, HOME_NETWORK_ROOKIE, NETWORK_ARCHITECT, RISKY_DEVICE_IDS, TRUSTED_DEVICE_IDS, emptyPlacements, nextDifficulty, type ActiveToast, type BadgeJustEarned, type LastPlacement, type PlacementMap, type ScoreDelta, type ViewportProfile } from "./model";
import { buildOpenRiskItems } from "./summary";
import type { DeviceIconTone } from "./ui/DeviceIcon";

export function mergeRoomZones(
  preassignedZones: Record<RoomId, ZoneId | null>,
  userZoneOverrides: Partial<Record<RoomId, ZoneId>>,
): Record<RoomId, ZoneId | null> {
  const merged: Record<RoomId, ZoneId | null> = { ...preassignedZones };
  for (const [roomId, zoneId] of Object.entries(userZoneOverrides) as Array<[RoomId, ZoneId]>) {
    if (preassignedZones[roomId] === null) merged[roomId] = zoneId;
  }
  return merged;
}

export function reconcilePlacementsWithRoomZones(
  placements: PlacementMap,
  roomZones: Record<RoomId, ZoneId | null>,
): PlacementMap {
  let changed = false;
  const next: PlacementMap = { ...placements };
  for (const device of DEVICES) {
    const placement = placements[device.id];
    if (!placement) continue;
    const newZone = roomZones[placement.roomId];
    if (newZone === null) {
      next[device.id] = null;
      changed = true;
    } else if (newZone !== placement.zoneId) {
      next[device.id] = { roomId: placement.roomId, zoneId: newZone };
      changed = true;
    }
  }
  return changed ? next : placements;
}

export function toggleSelectedDevice(current: DeviceId | null, deviceId: DeviceId): DeviceId | null {
  return current === deviceId ? null : deviceId;
}

export function buildPlacedIds(placements: PlacementMap): Set<DeviceId> {
  const placed = new Set<DeviceId>();
  for (const device of DEVICES) {
    if (placements[device.id]) placed.add(device.id);
  }
  return placed;
}

export function buildDevicesByRoom(placements: PlacementMap): Map<RoomId, Device[]> {
  const devicesByRoom = new Map<RoomId, Device[]>();
  for (const device of DEVICES) {
    const placement = placements[device.id];
    if (!placement) continue;
    const list = devicesByRoom.get(placement.roomId) ?? [];
    list.push(device);
    devicesByRoom.set(placement.roomId, list);
  }
  return devicesByRoom;
}

export function buildPlacedZones(placements: PlacementMap): Record<DeviceId, ZoneId | null> {
  const placedZones = {} as Record<DeviceId, ZoneId | null>;
  for (const device of DEVICES) {
    const placement = placements[device.id];
    placedZones[device.id] = placement ? placement.zoneId : null;
  }
  return placedZones;
}

export function deriveRiskyRooms(placements: PlacementMap): Set<RoomId> {
  const byRoom = new Map<RoomId, DeviceId[]>();
  for (const device of DEVICES) {
    const placement = placements[device.id];
    if (placement?.zoneId !== "main") continue;
    const list = byRoom.get(placement.roomId) ?? [];
    list.push(device.id);
    byRoom.set(placement.roomId, list);
  }
  const riskyRooms = new Set<RoomId>();
  for (const [roomId, ids] of byRoom) {
    const hasTrusted = ids.some((id) => TRUSTED_DEVICE_IDS.has(id));
    const hasRisky = ids.some((id) => RISKY_DEVICE_IDS.has(id));
    if (hasTrusted && hasRisky) riskyRooms.add(roomId);
  }
  return riskyRooms;
}

export function shouldAutoOpenHelp(pref: boolean | undefined): boolean {
  return pref === true ? false : true;
}

export function buildScoreFeedback({
  previousTotal,
  nextTotal,
  streak,
  halfwayShown,
  placedCount,
}: {
  previousTotal: number;
  nextTotal: number;
  streak: number;
  halfwayShown: boolean;
  placedCount: number;
}) {
  const delta = nextTotal - previousTotal;
  if (delta === 0) {
    return {
      delta,
      nextStreak: streak,
      nextHalfwayShown: halfwayShown,
      nextToast: null as Omit<NonNullable<ActiveToast>, "key"> | null,
    };
  }
  const nextStreak = delta > 0 ? streak + 1 : 0;
  if (halfwayShown === false && placedCount === 5 && delta > 0) {
    return {
      delta,
      nextStreak,
      nextHalfwayShown: true,
      nextToast: { type: "halfway", label: "Halfway there", hint: "5 of 10 placed" } as Omit<NonNullable<ActiveToast>, "key">,
    };
  }
  if (nextStreak >= 3) {
    return {
      delta,
      nextStreak,
      nextHalfwayShown: halfwayShown,
      nextToast: { type: "streak", label: String(nextStreak) + "× streak", hint: "Nice rhythm" } as Omit<NonNullable<ActiveToast>, "key">,
    };
  }
  return {
    delta,
    nextStreak,
    nextHalfwayShown: halfwayShown,
    nextToast: null as Omit<NonNullable<ActiveToast>, "key"> | null,
  };
}

export function resolveEarnedBadge({
  difficulty,
  total,
  hadRookie,
  hadArchitect,
}: {
  difficulty: Difficulty;
  total: number;
  hadRookie: boolean;
  hadArchitect: boolean;
}): BadgeJustEarned {
  let nextBadge: BadgeJustEarned = null;
  if (hadRookie === false) nextBadge = "rookie";
  if (difficulty === "hard" && total >= 70 && hadArchitect === false) nextBadge = "architect";
  return nextBadge;
}

function useViewportProfile(): ViewportProfile {
  const [profile, setProfile] = useState<ViewportProfile>({
    width: 0,
    height: 0,
    band: "phone",
    isCoarsePointer: false,
  });

  useEffect(() => {
    const coarseQuery = globalThis.matchMedia("(pointer: coarse)");
    const hoverQuery = globalThis.matchMedia("(hover: none)");
    const update = () => {
      const width = globalThis.innerWidth;
      const height = globalThis.innerHeight;
      setProfile({
        width,
        height,
        band: widthToBand(width),
        isCoarsePointer: coarseQuery.matches || hoverQuery.matches,
      });
    };
    const bind = (query: MediaQueryList, listener: () => void) => {
      if (typeof query.addEventListener === "function") {
        query.addEventListener("change", listener);
        return () => query.removeEventListener("change", listener);
      }
      query.addListener(listener);
      return () => query.removeListener(listener);
    };
    update();
    const unbindCoarse = bind(coarseQuery, update);
    const unbindHover = bind(hoverQuery, update);
    globalThis.addEventListener("resize", update);
    return () => {
      unbindCoarse();
      unbindHover();
      globalThis.removeEventListener("resize", update);
    };
  }, []);

  return profile;
}

type TouchDragState = {
  deviceId: DeviceId;
  ghost: HTMLElement;
  currentRoom: RoomId | null;
};

function useTouchDrag(
  onPlace: (deviceId: DeviceId, roomId: RoomId) => void,
  onHoverRoom: (roomId: RoomId | null) => void,
) {
  const stateRef = useRef<TouchDragState | null>(null);
  const onPlaceRef = useRef(onPlace);
  const onHoverRef = useRef(onHoverRoom);
  onPlaceRef.current = onPlace;
  onHoverRef.current = onHoverRoom;

  const startDrag = useCallback((deviceId: DeviceId, originTouch: Touch) => {
    // Create a ghost element that follows the finger.
    const ghost = document.createElement("div");
    ghost.style.cssText =
      "position:fixed;z-index:9999;pointer-events:none;width:44px;height:44px;" +
      "border-radius:12px;background:rgba(56,189,248,0.85);border:2px solid #0ea5e9;" +
      "box-shadow:0 8px 24px rgba(56,189,248,0.5);display:flex;align-items:center;" +
      "justify-content:center;font-size:18px;color:#fff;font-weight:900;" +
      "transform:translate(-50%,-50%) scale(1.1);";
    ghost.textContent = "↓";
    ghost.style.left = originTouch.clientX + "px";
    ghost.style.top = originTouch.clientY + "px";
    document.body.appendChild(ghost);

    stateRef.current = { deviceId, ghost, currentRoom: null };

    const onMove = (e: TouchEvent) => {
      const state = stateRef.current;
      if (!state) return;
      const touch = e.touches[0];
      if (!touch) return;
      e.preventDefault(); // stop scroll — works because { passive: false }

      state.ghost.style.left = touch.clientX + "px";
      state.ghost.style.top = touch.clientY + "px";

      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      let roomId: RoomId | null = null;
      if (el) {
        const roomEl = el.closest("[data-testid^='dh-room-']") as HTMLElement | null;
        if (roomEl) {
          const testId = roomEl.getAttribute("data-testid") ?? "";
          const match = testId.match(/^dh-room-(.+)$/);
          if (match?.[1] && !match[1].startsWith("zone")) {
            roomId = match[1] as RoomId;
          }
        }
      }
      if (roomId !== state.currentRoom) {
        state.currentRoom = roomId;
        onHoverRef.current(roomId);
      }
    };

    const onEnd = () => {
      const state = stateRef.current;
      if (state) {
        state.ghost.remove();
        if (state.currentRoom) {
          onPlaceRef.current(state.deviceId, state.currentRoom);
        }
        onHoverRef.current(null);
        stateRef.current = null;
      }
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
      document.removeEventListener("touchcancel", onEnd);
    };

    // Attach to document with { passive: false } so preventDefault works.
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", onEnd);
    document.addEventListener("touchcancel", onEnd);
  }, []);

  // The component attaches onTouchStart via React (which IS passive-safe
  // for touchstart on individual elements). The touchmove/end listeners
  // go on document with { passive: false }.
  const handleTouchStart = useCallback(
    (deviceId: DeviceId, e: React.TouchEvent) => {
      const touch = e.nativeEvent.touches[0];
      if (!touch) return;
      startDrag(deviceId, touch);
    },
    [startDrag],
  );

  return { handleTouchStart };
}

// ---- Risk helper ----


export function useDigitalHouseController() {
  const viewport = useViewportProfile();
  const mobile = viewport.band === "phone";
  const allowDrag = true;
  const {
    difficulty,
    setDifficulty,
    resetCount,
    reset: shellReset,
    recordScore,
    awardBadge,
    hasBadge,
  } = useGameShell();

  const [placements, setPlacements] = useState<PlacementMap>(emptyPlacements);
  const [selectedId, setSelectedId] = useState<DeviceId | null>(null);
  const [hoveredRoom, setHoveredRoom] = useState<RoomId | null>(null);
  const [lastPlacement, setLastPlacement] = useState<LastPlacement | null>(null);
  const [showEnd, setShowEnd] = useState(false);
  const [badgeJustEarned, setBadgeJustEarned] = useState<BadgeJustEarned>(null);
  const [userZoneOverrides, setUserZoneOverrides] = useState<
    Partial<Record<RoomId, ZoneId>>
  >({});
  // Game-feel bits: floating score delta, halfway milestone, streak
  const [scoreDelta, setScoreDelta] = useState<ScoreDelta>(null);
  const [halfwayShown, setHalfwayShown] = useState(false);
  const [streak, setStreak] = useState(0);
  // Single active toast slot — newest replaces previous so they never stack.
  const [activeToast, setActiveToast] = useState<ActiveToast>(null);
  const toastKeyRef = useRef(0);
  const [helpOpen, setHelpOpen] = useState(false);
  const [trayHeight, setTrayHeight] = useState(0);
  const [openZoneRoom, setOpenZoneRoom] = useState<RoomId | null>(null);
  const [railWidth, setRailWidth] = useState(0);
  const trayRef = useRef<HTMLDivElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const prevTotalRef = useRef(50);
  const deltaKeyRef = useRef(0);
  const hasRecordedRef = useRef(false);

  const preassignedZones = useMemo(
    () => ROOM_ZONE_ASSIGNMENTS[difficulty],
    [difficulty],
  );

  const roomZones: Record<RoomId, ZoneId | null> = useMemo(
    () => mergeRoomZones(preassignedZones, userZoneOverrides),
    [preassignedZones, userZoneOverrides],
  );

  const compactDesktop = !mobile && isCompactDesktopLayout(viewport.width);
  const houseZoneControls = difficulty !== "easy";
  const deviceTone: DeviceIconTone = difficulty === "easy" ? "category" : "neutral";
  const guidedDeviceCards = difficulty === "easy";
  const inventoryColumns: 2 | 3 | 4 = inventoryColumnsForRail(
    viewport.width,
    railWidth,
  );

  // Reset state on shell reset / difficulty change
  useEffect(() => {
    setPlacements(emptyPlacements());
    setSelectedId(null);
    setHoveredRoom(null);
    setLastPlacement(null);
    setUserZoneOverrides({});
    setShowEnd(false);
    setBadgeJustEarned(null);
    setScoreDelta(null);
    setHalfwayShown(false);
    setStreak(0);
    setActiveToast(null);
    setOpenZoneRoom(null);
    prevTotalRef.current = 50;
    deltaKeyRef.current = 0;
    toastKeyRef.current = 0;
    hasRecordedRef.current = false;
  }, [resetCount, difficulty]);

  // Re-zone existing placements when their room's effective zone changes
  useEffect(() => {
    setPlacements((prev) => {
      let changed = false;
      const next: PlacementMap = { ...prev };
      for (const d of DEVICES) {
        const p = prev[d.id];
        if (!p) continue;
        const newZone = roomZones[p.roomId];
        if (newZone === null) {
          next[d.id] = null;
          changed = true;
        } else if (newZone !== p.zoneId) {
          next[d.id] = { roomId: p.roomId, zoneId: newZone };
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [roomZones]);

  // Scoring
  const scoringPlacements: DevicePlacement[] = useMemo(() => {
    const out: DevicePlacement[] = [];
    for (const d of DEVICES) {
      const p = placements[d.id];
      if (p) out.push({ deviceId: d.id, zoneId: p.zoneId });
    }
    return out;
  }, [placements]);
  const result = useMemo(
    () => calculateScore(scoringPlacements),
    [scoringPlacements],
  );
  const riskCount = useMemo(
    () => buildOpenRiskItems(result, difficulty).length,
    [difficulty, result],
  );

  const placedIds = useMemo(() => {
    const s = new Set<DeviceId>();
    for (const d of DEVICES) if (placements[d.id]) s.add(d.id);
    return s;
  }, [placements]);
  const isComplete = placedIds.size === DEVICES.length;

  const riskyRooms = useMemo(() => deriveRiskyRooms(placements), [placements]);

  const devicesByRoom = useMemo(() => {
    const m = new Map<RoomId, Device[]>();
    for (const d of DEVICES) {
      const p = placements[d.id];
      if (!p) continue;
      const list = m.get(p.roomId) ?? [];
      list.push(d);
      m.set(p.roomId, list);
    }
    return m;
  }, [placements]);

  // Map device → zone for coloring placed devices by their zone.
  const placedZones = useMemo(() => {
    const out = {} as Record<DeviceId, ZoneId | null>;
    for (const d of DEVICES) {
      const p = placements[d.id];
      out[d.id] = p ? p.zoneId : null;
    }
    return out;
  }, [placements]);

  // Game-feel: when the total changes due to a new placement, fire the
  // floating delta, check halfway milestone, and track streak of positive
  // placements. Toasts are mutually exclusive — newest replaces previous,
  // tracked via a single activeToast slot.
  useEffect(() => {
    const prev = prevTotalRef.current;
    const delta = result.total - prev;
    prevTotalRef.current = result.total;
    if (delta === 0) return;
    deltaKeyRef.current += 1;
    setScoreDelta({ key: deltaKeyRef.current, value: delta });

    const showToast = (
      type: "halfway" | "streak",
      label: string,
      hint: string,
    ) => {
      toastKeyRef.current += 1;
      setActiveToast({ key: toastKeyRef.current, type, label, hint });
    };

    // Streak tracking — consecutive positive deltas. Compute next streak
    // synchronously so we can decide which toast (if any) to fire.
    let nextStreak = 0;
    if (delta > 0) nextStreak = streak + 1;
    setStreak(nextStreak);

    // Halfway milestone — fire once per run, only on an improving placement.
    // Halfway wins over streak when both would fire on the same placement.
    if (!halfwayShown && placedIds.size === 5 && delta > 0) {
      setHalfwayShown(true);
      showToast("halfway", "Halfway there", "5 of 10 placed");
    } else if (nextStreak >= 3) {
      showToast("streak", `${nextStreak}× streak`, "Nice rhythm");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.total]);

  // Auto-dismiss the active toast after ~2.2s.
  useEffect(() => {
    if (!activeToast) return;
    const t = globalThis.setTimeout(() => setActiveToast(null), 2200);
    return () => globalThis.clearTimeout(t);
  }, [activeToast?.key]);

  // Completion: record score + badges + show end summary after a beat
  useEffect(() => {
    if (!isComplete || hasRecordedRef.current) return;
    hasRecordedRef.current = true;
    recordScore({
      score: result.total,
      difficulty,
      details: {
        privacy: result.privacy,
        blastRadius: result.blastRadius,
        recovery: result.recovery,
      },
    });
    const hadRookie = hasBadge(HOME_NETWORK_ROOKIE.id);
    awardBadge(HOME_NETWORK_ROOKIE);
    let newBadge: "rookie" | "architect" | null = null;
    if (!hadRookie) newBadge = "rookie";
    if (difficulty === "hard" && result.total >= 70) {
      const hadArch = hasBadge(NETWORK_ARCHITECT.id);
      awardBadge(NETWORK_ARCHITECT);
      if (!hadArch) newBadge = "architect";
    }
    setBadgeJustEarned(newBadge);
    const t = globalThis.setTimeout(() => setShowEnd(true), 900);
    return () => globalThis.clearTimeout(t);
  }, [
    isComplete,
    result.total,
    result.privacy,
    result.blastRadius,
    result.recovery,
    difficulty,
    recordScore,
    awardBadge,
    hasBadge,
  ]);

  // Handlers
  const placeDevice = useCallback(
    (deviceId: DeviceId, roomId: RoomId) => {
      const zoneId = roomZones[roomId];
      if (!zoneId) return;
      setPlacements((prev) => ({ ...prev, [deviceId]: { roomId, zoneId } }));
      setLastPlacement({ deviceId, zoneId, roomId });
      setSelectedId(null);
      setHoveredRoom(null);
      setOpenZoneRoom(null);
    },
    [roomZones],
  );

  const returnDevice = useCallback((deviceId: DeviceId) => {
    setPlacements((prev) => ({ ...prev, [deviceId]: null }));
    setSelectedId(deviceId);
    setLastPlacement(null);
    setOpenZoneRoom(null);
  }, []);

  const handleSelect = useCallback((deviceId: DeviceId) => {
    setSelectedId((prev) => (prev === deviceId ? null : deviceId));
    setOpenZoneRoom(null);
  }, []);

  const handleRoomClick = useCallback(
    (roomId: RoomId) => {
      if (!selectedId) return;
      placeDevice(selectedId, roomId);
    },
    [placeDevice, selectedId],
  );

  const assignZone = useCallback((roomId: RoomId, zoneId: ZoneId) => {
    setUserZoneOverrides((prev) => ({ ...prev, [roomId]: zoneId }));
    setOpenZoneRoom(null);
  }, []);

  const onTryHarder = useCallback(() => {
    setShowEnd(false);
    setDifficulty(nextDifficulty(difficulty));
  }, [difficulty, setDifficulty]);

  // Touch drag for mobile — maps touch events to device placement.
  const touchDrag = useTouchDrag(placeDevice, setHoveredRoom);

  const handleReset = useCallback(() => {
    shellReset();
  }, [shellReset]);


  useEffect(() => {
    if (!mobile) {
      setTrayHeight(0);
      return;
    }
    const tray = trayRef.current;
    if (!tray) return;
    const measure = () => {
      setTrayHeight(Math.ceil(tray.getBoundingClientRect().height));
    };
    measure();
    const ro = new globalThis.ResizeObserver(measure);
    ro.observe(tray);
    return () => ro.disconnect();
  }, [mobile]);

  useEffect(() => {
    if (mobile) {
      setRailWidth(0);
      return;
    }
    const rail = railRef.current;
    if (!rail) return;
    const measure = () => {
      setRailWidth(Math.ceil(rail.getBoundingClientRect().width));
    };
    measure();
    const ro = new globalThis.ResizeObserver(measure);
    ro.observe(rail);
    return () => ro.disconnect();
  }, [mobile, viewport.band]);

  useEffect(() => {
    if (!houseZoneControls) setOpenZoneRoom(null);
  }, [houseZoneControls]);

  useEffect(() => {
    const pref = getGamePreference<boolean>(DIGITAL_HOUSE_GAME_ID, HELP_PREF_KEY);
    if (shouldAutoOpenHelp(pref) === false) {
      return;
    }
    setHelpOpen(true);
  }, []);

  const dismissHelp = useCallback((dontShowAgain: boolean) => {
    if (dontShowAgain) {
      setGamePreference(DIGITAL_HOUSE_GAME_ID, HELP_PREF_KEY, true);
    }
    setHelpOpen(false);
  }, []);

  const houseProps = {
    roomZones,
    preassignedZones,
    devicesByRoom,
    hoveredRoom,
    riskyRooms,
    isSelectMode: selectedId !== null,
    onRoomEnter: setHoveredRoom,
    onRoomLeave: () => setHoveredRoom(null),
    onRoomClick: handleRoomClick,
    onRoomDrop: (roomId: RoomId, deviceId: DeviceId) =>
      placeDevice(deviceId, roomId),
    onDeviceClickInRoom: returnDevice,
    allowDrag,
    showZoneControls: houseZoneControls,
    openZoneRoom,
    onToggleZoneRoom: (roomId: RoomId) =>
      setOpenZoneRoom((prev) => (prev === roomId ? null : roomId)),
    onAssignRoomZone: assignZone,
    deviceTone,
    onTouchDragStart: touchDrag.handleTouchStart,
  };

  const openHelp = useCallback(() => {
    setHelpOpen(true);
  }, []);

  const closeSummary = useCallback(() => {
    setShowEnd(false);
  }, []);

  const openSummary = useCallback(() => {
    setShowEnd(true);
  }, []);

  const handleTryAgain = useCallback(() => {
    setShowEnd(false);
    handleReset();
  }, [handleReset]);

  return {
    viewport,
    mobile,
    compactDesktop,
    allowDrag,
    difficulty,
    result,
    placements,
    selectedId,
    lastPlacement,
    showEnd,
    badgeJustEarned,
    helpOpen,
    trayHeight,
    trayRef,
    railRef,
    activeToast,
    scoreDelta,
    placedIds,
    placedZones,
    deviceTone,
    guidedDeviceCards,
    inventoryColumns,
    houseProps,
    isComplete,
    dismissHelp,
    openHelp,
    closeSummary,
    openSummary,
    onTryHarder,
    handleTryAgain,
    handleSelect,
    returnDevice,
    toolbarOffset: Math.max(trayHeight, 132),
    totalDevices: DEVICES.length,
    riskCount,
  };
}
