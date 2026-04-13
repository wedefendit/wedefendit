import { useCallback, useEffect, useRef, useState } from "react";
import type { DeviceId } from "../engine";
import type { IdleHint } from "../model";

export type IdleSnapshot = Readonly<{
  placedCount: number;
  selectedId: DeviceId | null;
  selectedName: string | null;
  isComplete: boolean;
  hasUnzonedRooms: boolean;
  difficulty: "easy" | "medium" | "hard";
  hasAssignedZone: boolean;
}>;

const DELAY_INITIAL = 8_000;
const DELAY_SELECTED = 5_000;
const DELAY_MIDGAME = 14_000;
const DELAY_COMPLETE = 4_000;
const DELAY_ZONE_NUDGE = 10_000;

function selectMessage(snap: IdleSnapshot): string | null {
  if (snap.isComplete) return "All placed. Check your after-action report";
  if (
    snap.difficulty !== "easy" &&
    !snap.hasAssignedZone &&
    snap.hasUnzonedRooms &&
    snap.placedCount < 2
  ) {
    return "Set each room's network zone first. Use the zone chip on each room";
  }
  if (snap.selectedId && snap.selectedName)
    return `Drop ${snap.selectedName} into a room to place it`;
  if (snap.placedCount === 0)
    return "Drag a device from the inventory into a room";
  const remaining = 10 - snap.placedCount;
  return `${remaining} device${remaining === 1 ? "" : "s"} left to place`;
}

function delayFor(snap: IdleSnapshot): number {
  if (snap.isComplete) return DELAY_COMPLETE;
  if (snap.selectedId) return DELAY_SELECTED;
  if (
    snap.difficulty !== "easy" &&
    !snap.hasAssignedZone &&
    snap.hasUnzonedRooms &&
    snap.placedCount < 2
  )
    return DELAY_ZONE_NUDGE;
  if (snap.placedCount === 0) return DELAY_INITIAL;
  return DELAY_MIDGAME;
}

export function useIdleHint(snap: IdleSnapshot) {
  const [hint, setHint] = useState<IdleHint | null>(null);
  const keyRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const snapRef = useRef(snap);
  snapRef.current = snap;

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    setHint(null);
    const delay = delayFor(snapRef.current);
    timerRef.current = setTimeout(() => {
      const message = selectMessage(snapRef.current);
      if (message) {
        keyRef.current += 1;
        setHint({ key: keyRef.current, message });
      }
    }, delay);
  }, [clearTimer]);

  const dismissHint = useCallback(() => {
    setHint(null);
    startTimer();
  }, [startTimer]);
  const resetIdle = useCallback(() => {
    setHint(null);
    startTimer();
  }, [startTimer]);

  // Restart timer on state changes
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

  // Reset on any user interaction
  useEffect(() => {
    const handler = () => resetIdle();
    for (const evt of ["pointerdown", "keydown"] as const) {
      globalThis.addEventListener(evt, handler, { passive: true });
    }
    return () => {
      for (const evt of ["pointerdown", "keydown"] as const) {
        globalThis.removeEventListener(evt, handler);
      }
    };
  }, [resetIdle]);

  return { hint, dismissHint, resetIdle };
}
