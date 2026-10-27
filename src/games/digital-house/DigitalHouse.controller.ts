import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DifficultyValue, type Difficulty } from "../shared/types";
import { useGameShell } from "../shared/GameShell";
import { getGamePreference, setGamePreference } from "../shared/storage";
import {
  DEVICES,
  ROOM_ZONE_ASSIGNMENTS,
  SCORING_INTERNALS,
  ZoneIdValue,
  calculateScore,
  isTrusted,
  type Device,
  type DeviceId,
  type DevicePlacement,
  type RoomId,
  type ZoneId,
} from "./engine";
import {
  inventoryColumnsForRail,
  isCompactDesktopLayout,
  ViewportBandValue,
  widthToBand,
} from "./layout";
import {
  BadgeJustEarnedValue,
  DIGITAL_HOUSE_GAME_ID,
  DIGITAL_HOUSE_BADGES,
  ONBOARDING_PREF_KEY,
  ToastTypeValue,
  emptyPlacements,
  nextDifficulty,
  coachSteps,
  type ActiveToast,
  type BadgeJustEarned,
  type LastPlacement,
  type PlacementMap,
  type ScoreAnimationDelta,
  type ViewportProfile,
  type ZoneBlockedFeedback,
} from "./model";
import { buildOpenRiskItems } from "./summary";
import type { DeviceIconTone } from "./ui/DeviceIcon";
import { useIdleHint, type IdleSnapshot } from "./hooks/useIdleHint";
import { useTouchDrag } from "./hooks/useTouchDrag";

const ACTIVATION_STREAK = 3;
const HALFWAY_DEVICE_COUNT = 5;
const MOBILE_MAX_HEIGHT = 500;
const ONBOARDING_DELAY_MS = 400;
const SUMMARY_DELAY_MS = 900;
const TOAST_DURATION_MS = 2200;
const ZONE_BLOCKED_DURATION_MS = 2500;
const CATEGORY_TONE: DeviceIconTone = "category";
const NEUTRAL_TONE: DeviceIconTone = "neutral";

enum BrowserEventValue {
  Change = "change",
  Resize = "resize",
}

type ToastWithoutKey = Omit<NonNullable<ActiveToast>, "key">;

const TOAST_COPY: Record<ToastTypeValue, Readonly<{ label: string; hint: string }>> = {
  [ToastTypeValue.Halfway]: {
    label: "Halfway there",
    hint: "5 of 10 placed",
  },
  [ToastTypeValue.Streak]: {
    label: "Nice rhythm",
    hint: "Nice rhythm",
  },
};

export function mergeRoomZones(
  preassigned: Record<RoomId, ZoneId | null>,
  overrides: Partial<Record<RoomId, ZoneId>>,
): Record<RoomId, ZoneId | null> {
  const m: Record<RoomId, ZoneId | null> = { ...preassigned };
  for (const [rid, zid] of Object.entries(overrides) as Array<
    [RoomId, ZoneId]
  >) {
    if (preassigned[rid] === null) m[rid] = zid;
  }
  return m;
}

export function reconcilePlacementsWithRoomZones(
  placements: PlacementMap,
  roomZones: Record<RoomId, ZoneId | null>,
): PlacementMap {
  let changed = false;
  const next: PlacementMap = { ...placements };
  for (const d of DEVICES) {
    const p = placements[d.id];
    if (!p) continue;
    const nz = roomZones[p.roomId];
    if (nz === null) {
      next[d.id] = null;
      changed = true;
    } else if (nz !== p.zoneId) {
      next[d.id] = { roomId: p.roomId, zoneId: nz };
      changed = true;
    }
  }
  return changed ? next : placements;
}

export function toggleSelectedDevice(
  current: DeviceId | null,
  deviceId: DeviceId,
): DeviceId | null {
  return current === deviceId ? null : deviceId;
}

export function buildPlacedIds(placements: PlacementMap): Set<DeviceId> {
  const s = new Set<DeviceId>();
  for (const d of DEVICES) if (placements[d.id]) s.add(d.id);
  return s;
}

export function buildDevicesByRoom(
  placements: PlacementMap,
): Map<RoomId, Device[]> {
  const m = new Map<RoomId, Device[]>();
  for (const d of DEVICES) {
    const p = placements[d.id];
    if (!p) continue;
    const l = m.get(p.roomId) ?? [];
    l.push(d);
    m.set(p.roomId, l);
  }
  return m;
}

export function buildPlacedZones(
  placements: PlacementMap,
): Record<DeviceId, ZoneId | null> {
  const o = {} as Record<DeviceId, ZoneId | null>;
  for (const d of DEVICES) {
    const p = placements[d.id];
    o[d.id] = p ? p.zoneId : null;
  }
  return o;
}

export function deriveRiskyRooms(placements: PlacementMap): Set<RoomId> {
  const byRoom = new Map<RoomId, DeviceId[]>();
  for (const d of DEVICES) {
    const p = placements[d.id];
    if (p?.zoneId !== ZoneIdValue.Main) continue;
    const l = byRoom.get(p.roomId) ?? [];
    l.push(d.id);
    byRoom.set(p.roomId, l);
  }
  const risky = new Set<RoomId>();
  for (const [rid, ids] of byRoom) {
    if (
      ids.some(isTrusted) &&
      ids.some((id) => !isTrusted(id))
    )
      risky.add(rid);
  }
  return risky;
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
  if (delta === 0)
    return {
      delta,
      nextStreak: streak,
      nextHalfwayShown: halfwayShown,
      nextToast: null as ToastWithoutKey | null,
    };
  const ns = delta > 0 ? streak + 1 : 0;
  if (!halfwayShown && placedCount === HALFWAY_DEVICE_COUNT && delta > 0)
    return {
      delta,
      nextStreak: ns,
      nextHalfwayShown: true,
      nextToast: {
        type: ToastTypeValue.Halfway,
        ...TOAST_COPY[ToastTypeValue.Halfway],
      } as ToastWithoutKey,
    };
  if (ns >= ACTIVATION_STREAK)
    return {
      delta,
      nextStreak: ns,
      nextHalfwayShown: halfwayShown,
      nextToast: {
        type: ToastTypeValue.Streak,
        label: `${ns}× streak`,
        hint: TOAST_COPY[ToastTypeValue.Streak].hint,
      } as ToastWithoutKey,
    };
  return {
    delta,
    nextStreak: ns,
    nextHalfwayShown: halfwayShown,
    nextToast: null as ToastWithoutKey | null,
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
  let b: BadgeJustEarned = null;
  if (!hadRookie) b = BadgeJustEarnedValue.Rookie;
  if (
    difficulty === DifficultyValue.Hard &&
    total >=
      DIGITAL_HOUSE_BADGES[BadgeJustEarnedValue.Architect].minScore &&
    !hadArchitect
  ) {
    b = BadgeJustEarnedValue.Architect;
  }
  return b;
}

function useViewportProfile(): ViewportProfile {
  const [p, setP] = useState<ViewportProfile>({
    width: 0,
    height: 0,
    band: ViewportBandValue.Phone,
    isCoarsePointer: false,
  });
  useEffect(() => {
    const cq = globalThis.matchMedia("(pointer: coarse)");
    const hq = globalThis.matchMedia("(hover: none)");
    const update = () => {
      const w = globalThis.innerWidth,
        h = globalThis.innerHeight;
      setP({
        width: w,
        height: h,
        band: widthToBand(w),
        isCoarsePointer: cq.matches || hq.matches,
      });
    };
    const bind = (q: MediaQueryList, fn: () => void) => {
      q.addEventListener(BrowserEventValue.Change, fn);
      return () => q.removeEventListener(BrowserEventValue.Change, fn);
    };
    update();
    const u1 = bind(cq, update),
      u2 = bind(hq, update);
    globalThis.addEventListener(BrowserEventValue.Resize, update);
    return () => {
      u1();
      u2();
      globalThis.removeEventListener(BrowserEventValue.Resize, update);
    };
  }, []);
  return p;
}

export function useDigitalHouseController() {
  const viewport = useViewportProfile();
  const mobile =
    viewport.band === ViewportBandValue.Phone ||
    viewport.height < MOBILE_MAX_HEIGHT;
  const tablet =
    !mobile &&
    isCompactDesktopLayout(viewport.width) &&
    viewport.height > viewport.width;
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
  const [lastPlacement, setLastPlacement] = useState<LastPlacement | null>(
    null,
  );
  const [showEnd, setShowEnd] = useState(false);
  const [badgeJustEarned, setBadgeJustEarned] = useState<BadgeJustEarned>(null);
  const [userZoneOverrides, setUserZoneOverrides] = useState<
    Partial<Record<RoomId, ZoneId>>
  >({});
  const [scoreDelta, setScoreDelta] = useState<ScoreAnimationDelta>(null);
  const [halfwayShown, setHalfwayShown] = useState(false);
  const [streak, setStreak] = useState(0);
  const [activeToast, setActiveToast] = useState<ActiveToast>(null);
  const toastKeyRef = useRef(0);
  const [helpOpen, setHelpOpen] = useState(false);
  const [openZoneRoom, setOpenZoneRoom] = useState<RoomId | null>(null);
  const [railWidth, setRailWidth] = useState(0);
  const railRef = useRef<HTMLDivElement | null>(null);
  const prevTotalRef = useRef(SCORING_INTERNALS.STARTING_SCORE);
  const deltaKeyRef = useRef(0);
  const hasRecordedRef = useRef(false);

  const [zoneBlocked, setZoneBlocked] = useState<ZoneBlockedFeedback | null>(
    null,
  );
  const zbKeyRef = useRef(0);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const coachStepsConfig = useMemo(
    () => coachSteps(difficulty, mobile),
    [difficulty, mobile],
  );

  const [hasAssignedZone, setHasAssignedZone] = useState(false);

  const preassignedZones = useMemo(
    () => ROOM_ZONE_ASSIGNMENTS[difficulty],
    [difficulty],
  );
  const roomZones: Record<RoomId, ZoneId | null> = useMemo(
    () => mergeRoomZones(preassignedZones, userZoneOverrides),
    [preassignedZones, userZoneOverrides],
  );
  const compactDesktop = !mobile && isCompactDesktopLayout(viewport.width);
  const houseZoneControls = difficulty !== DifficultyValue.Easy;
  const deviceTone: DeviceIconTone =
    difficulty === DifficultyValue.Easy ? CATEGORY_TONE : NEUTRAL_TONE;
  const guidedDeviceCards = difficulty === DifficultyValue.Easy;
  const inventoryColumns: 2 | 3 | 4 = tablet
    ? 3
    : inventoryColumnsForRail(viewport.width, railWidth);

  const hasUnzonedRooms = useMemo(
    () => Object.values(roomZones).includes(null),
    [roomZones],
  );

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
    setZoneBlocked(null);
    setHasAssignedZone(false);
    prevTotalRef.current = SCORING_INTERNALS.STARTING_SCORE;
    deltaKeyRef.current = 0;
    toastKeyRef.current = 0;
    hasRecordedRef.current = false;
  }, [resetCount, difficulty]);

  useEffect(() => {
    setPlacements((prev) =>
      reconcilePlacementsWithRoomZones(prev, roomZones),
    );
  }, [roomZones]);

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

  const placedIds = useMemo(() => buildPlacedIds(placements), [placements]);
  const isComplete = placedIds.size === DEVICES.length;
  const riskyRooms = useMemo(() => deriveRiskyRooms(placements), [placements]);
  const devicesByRoom = useMemo(
    () => buildDevicesByRoom(placements),
    [placements],
  );
  const placedZones = useMemo(() => buildPlacedZones(placements), [placements]);

  const selectedDevice = useMemo(() => {
    if (!selectedId) return null;
    const d = DEVICES.find((dev) => dev.id === selectedId);
    if (!d) return null;
    return { id: d.id, name: d.name, description: d.description };
  }, [selectedId]);

  useEffect(() => {
    const prev = prevTotalRef.current;
    const feedback = buildScoreFeedback({
      previousTotal: prev,
      nextTotal: result.total,
      streak,
      halfwayShown,
      placedCount: placedIds.size,
    });
    prevTotalRef.current = result.total;
    if (feedback.delta === 0) return;
    deltaKeyRef.current += 1;
    setScoreDelta({ key: deltaKeyRef.current, value: feedback.delta });
    setStreak(feedback.nextStreak);
    setHalfwayShown(feedback.nextHalfwayShown);
    if (feedback.nextToast) {
      toastKeyRef.current += 1;
      setActiveToast({ key: toastKeyRef.current, ...feedback.nextToast });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.total]);

  useEffect(() => {
    if (!activeToast) return;
    const t = globalThis.setTimeout(
      () => setActiveToast(null),
      TOAST_DURATION_MS,
    );
    return () => globalThis.clearTimeout(t);
  }, [activeToast]);

  useEffect(() => {
    if (!zoneBlocked) return;
    const t = globalThis.setTimeout(
      () => setZoneBlocked(null),
      ZONE_BLOCKED_DURATION_MS,
    );
    return () => globalThis.clearTimeout(t);
  }, [zoneBlocked]);

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
    const rookie = DIGITAL_HOUSE_BADGES[BadgeJustEarnedValue.Rookie];
    const architect = DIGITAL_HOUSE_BADGES[BadgeJustEarnedValue.Architect];
    const hadRookie = hasBadge(rookie.id);
    const hadArchitect = hasBadge(architect.id);
    awardBadge(rookie);
    if (
      difficulty === DifficultyValue.Hard &&
      result.total >= architect.minScore
    ) {
      awardBadge(architect);
    }
    setBadgeJustEarned(
      resolveEarnedBadge({
        difficulty,
        total: result.total,
        hadRookie,
        hadArchitect,
      }),
    );
    const t = globalThis.setTimeout(
      () => setShowEnd(true),
      SUMMARY_DELAY_MS,
    );
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

  const placeDevice = useCallback(
    (deviceId: DeviceId, roomId: RoomId) => {
      const zoneId = roomZones[roomId];
      if (!zoneId) {
        zbKeyRef.current += 1;
        setZoneBlocked({ key: zbKeyRef.current, roomId });
        return;
      }
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
    setSelectedId(null);
    setLastPlacement(null);
    setOpenZoneRoom(null);
  }, []);

  const handleSelect = useCallback((deviceId: DeviceId) => {
    setSelectedId((prev) => toggleSelectedDevice(prev, deviceId));
    setLastPlacement(null);
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
    setHasAssignedZone(true);
  }, []);

  const onTryHarder = useCallback(() => {
    setShowEnd(false);
    setDifficulty(nextDifficulty(difficulty));
  }, [difficulty, setDifficulty]);
  const touchDrag = useTouchDrag(placeDevice, setHoveredRoom);
  const handleReset = useCallback(() => {
    shellReset();
  }, [shellReset]);

  useEffect(() => {
    if (mobile) {
      setRailWidth(0);
      return;
    }
    const rail = railRef.current;
    if (!rail) return;
    const measure = () =>
      setRailWidth(Math.ceil(rail.getBoundingClientRect().width));
    measure();
    const ro = new globalThis.ResizeObserver(measure);
    ro.observe(rail);
    return () => ro.disconnect();
  }, [mobile, viewport.band]);

  useEffect(() => {
    if (!houseZoneControls) setOpenZoneRoom(null);
  }, [houseZoneControls]);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof globalThis.setTimeout> | null = null;
    void getGamePreference<boolean>(
      DIGITAL_HOUSE_GAME_ID,
      ONBOARDING_PREF_KEY,
    ).then(
      (pref) => {
        if (cancelled) return;
        if (pref === true) return;
        timer = globalThis.setTimeout(
          () => setShowOnboarding(true),
          ONBOARDING_DELAY_MS,
        );
      },
    );
    return () => {
      cancelled = true;
      if (timer) globalThis.clearTimeout(timer);
    };
  }, []);

  const dismissOnboarding = useCallback((dontShowAgain: boolean) => {
    if (dontShowAgain)
      void setGamePreference(
        DIGITAL_HOUSE_GAME_ID,
        ONBOARDING_PREF_KEY,
        true,
      );
    setShowOnboarding(false);
  }, []);

  const dismissHelp = useCallback((dontShowAgain: boolean) => {
    if (dontShowAgain)
      void setGamePreference(
        DIGITAL_HOUSE_GAME_ID,
        ONBOARDING_PREF_KEY,
        true,
      );
    setHelpOpen(false);
  }, []);

  const openHelp = useCallback(() => setHelpOpen(true), []);
  const closeSummary = useCallback(() => setShowEnd(false), []);
  const openSummary = useCallback(() => setShowEnd(true), []);
  const handleTryAgain = useCallback(() => {
    setShowEnd(false);
    handleReset();
  }, [handleReset]);

  const idleSnap: IdleSnapshot = useMemo(
    () => ({
      placedCount: placedIds.size,
      selectedId,
      selectedName: selectedDevice?.name ?? null,
      isComplete,
      hasUnzonedRooms,
      difficulty,
      hasAssignedZone,
    }),
    [
      placedIds.size,
      selectedId,
      selectedDevice?.name,
      isComplete,
      hasUnzonedRooms,
      difficulty,
      hasAssignedZone,
    ],
  );

  const { hint: idleHint, dismissHint: dismissIdleHint } =
    useIdleHint(idleSnap);

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

  return {
    viewport,
    mobile,
    tablet,
    compactDesktop,
    allowDrag,
    difficulty,
    result,
    placements,
    selectedId,
    selectedDevice,
    lastPlacement,
    showEnd,
    badgeJustEarned,
    helpOpen,
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
    totalDevices: DEVICES.length,
    riskCount,
    showOnboarding,
    coachStepsConfig,
    dismissOnboarding,
    idleHint,
    dismissIdleHint,
    zoneBlockedFeedback: zoneBlocked,
  };
}
