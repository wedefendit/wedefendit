import { useCallback, useEffect, useRef, useState } from "react";
import { DifficultyValue, type Difficulty } from "../../shared/types";
import type { DeviceId } from "../engine";
import type { IdleHint } from "../model";

export type IdleSnapshot = Readonly<{
  placedCount: number;
  selectedId: DeviceId | null;
  selectedName: string | null;
  isComplete: boolean;
  hasUnzonedRooms: boolean;
  difficulty: Difficulty;
  hasAssignedZone: boolean;
}>;
type ScheduledHint = { snapshot: string; hint: IdleHint };

const DELAY_INITIAL = 8_000;
const DELAY_SELECTED = 5_000;
const DELAY_MIDGAME = 14_000;
const DELAY_COMPLETE = 4_000;
const DELAY_ZONE_NUDGE = 10_000;

enum IdleResetEvent { PointerDown = "pointerdown", KeyDown = "keydown" }

function selectMessage(snap: IdleSnapshot): string | null {
  if (snap.isComplete) return "All devices placed. Review your results";
  if (
    snap.difficulty !== DifficultyValue.Easy &&
    !snap.hasAssignedZone &&
    snap.hasUnzonedRooms &&
    snap.placedCount < 2
  ) {
    return "Before placing devices, use each room button to assign a network zone";
  }
  if (snap.selectedId && snap.selectedName)
    return `Place ${snap.selectedName} in a room`;
  if (snap.placedCount === 0)
    return "Place a device from the inventory in a room";
  const remaining = 10 - snap.placedCount;
  return `${remaining} device${remaining === 1 ? "" : "s"} left to place`;
}

function delayFor(snap: IdleSnapshot): number {
  if (snap.isComplete) return DELAY_COMPLETE;
  if (snap.selectedId) return DELAY_SELECTED;
  if (
    snap.difficulty !== DifficultyValue.Easy &&
    !snap.hasAssignedZone &&
    snap.hasUnzonedRooms &&
    snap.placedCount < 2
  )
    return DELAY_ZONE_NUDGE;
  if (snap.placedCount === 0) return DELAY_INITIAL;
  return DELAY_MIDGAME;
}

function snapshotKey(snap: IdleSnapshot): string {
  return [
    snap.placedCount,
    snap.selectedId,
    snap.selectedName,
    snap.isComplete,
    snap.hasUnzonedRooms,
    snap.difficulty,
    snap.hasAssignedZone,
  ].join(":");
}

export function useIdleHint(snap: IdleSnapshot) {
  const [scheduled, setScheduled] = useState<ScheduledHint | null>(null);
  const keyRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const snapRef = useRef(snap);
  useEffect(() => {
    snapRef.current = snap;
  }, [snap]);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    const delay = delayFor(snapRef.current);
    timerRef.current = setTimeout(() => {
      const snapshot = snapRef.current;
      const message = selectMessage(snapshot);
      if (message) {
        keyRef.current += 1;
        setScheduled({
          snapshot: snapshotKey(snapshot),
          hint: { key: keyRef.current, message },
        });
      }
    }, delay);
  }, [clearTimer]);

  const dismissHint = useCallback(() => {
    setScheduled(null);
    startTimer();
  }, [startTimer]);
  const resetIdle = useCallback(() => {
    setScheduled(null);
    startTimer();
  }, [startTimer]);

  useEffect(() => {
    startTimer();
    return clearTimer;
  }, [
    snap.placedCount,
    snap.selectedId,
    snap.isComplete,
    snap.hasUnzonedRooms,
    snap.hasAssignedZone,
    startTimer,
    clearTimer,
  ]);

  useEffect(() => {
    const handler = () => resetIdle();
    for (const evt of Object.values(IdleResetEvent)) {
      globalThis.addEventListener(evt, handler, { passive: true });
    }
    return () => {
      for (const evt of Object.values(IdleResetEvent)) {
        globalThis.removeEventListener(evt, handler);
      }
    };
  }, [resetIdle]);

  const hint = scheduled?.snapshot === snapshotKey(snap) ? scheduled.hint : null;
  return { hint, dismissHint, resetIdle };
}
