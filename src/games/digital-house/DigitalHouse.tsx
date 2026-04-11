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

import { useEffect, useMemo, useState } from "react";
import { useGameShell } from "../shared/GameShell";
import {
  DEVICES,
  ZONES,
  calculateScore,
  type DeviceId,
  type DevicePlacement,
  type ZoneId,
} from "./engine";

/**
 * Placeholder Digital House component — Phase 1, Step 1.
 *
 * Purpose: exercise the scoring engine end-to-end before the PixiJS renderer
 * is built. Each device gets a zone picker, and the three meters + audit
 * trail update live. This component will be replaced by an isometric canvas
 * + DeviceTray + AnalysisPanel in the next step.
 */
export function DigitalHouse() {
  const { difficulty, resetCount } = useGameShell();
  const [placements, setPlacements] = useState<Record<DeviceId, ZoneId | null>>(
    () => emptyPlacements(),
  );

  useEffect(() => {
    setPlacements(emptyPlacements());
  }, [resetCount, difficulty]);

  const placed: DevicePlacement[] = useMemo(
    () =>
      Object.entries(placements)
        .filter((entry): entry is [DeviceId, ZoneId] => entry[1] !== null)
        .map(([deviceId, zoneId]) => ({ deviceId, zoneId })),
    [placements],
  );

  const result = useMemo(() => calculateScore(placed), [placed]);

  const setZone = (deviceId: DeviceId, zoneId: ZoneId | null) => {
    setPlacements((prev) => ({ ...prev, [deviceId]: zoneId }));
  };

  const allPlaced = placed.length === DEVICES.length;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Placeholder — scoring engine preview ({difficulty})
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {DEVICES.map((device) => {
            const value = placements[device.id];
            return (
              <label
                key={device.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-sm shadow-sm dark:border-sky-900/40 dark:bg-slate-900/40"
              >
                <span className="min-w-0 truncate font-medium text-slate-800 dark:text-slate-100">
                  {device.name}
                </span>
                <select
                  value={value ?? ""}
                  onChange={(e) =>
                    setZone(
                      device.id,
                      e.target.value === "" ? null : (e.target.value as ZoneId),
                    )
                  }
                  className="rounded-md border border-slate-300/80 bg-white px-2 py-1 text-xs text-slate-700 shadow-sm dark:border-sky-900/50 dark:bg-slate-950/50 dark:text-slate-200"
                >
                  <option value="">— unplaced —</option>
                  {ZONES.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.shortName}
                    </option>
                  ))}
                </select>
              </label>
            );
          })}
        </div>
      </div>

      <aside className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm dark:border-sky-900/40 dark:bg-slate-900/50">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Live meters
        </h2>
        <div className="mt-3 space-y-3">
          <Meter label="Privacy" value={result.privacy} />
          <Meter label="Blast Radius" value={result.blastRadius} />
          <Meter label="Recovery Difficulty" value={result.recovery} />
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Overall</span>
          <span className="font-semibold text-slate-800 dark:text-slate-100">
            {result.total}
          </span>
        </div>

        <div className="mt-4 border-t border-slate-200/70 pt-3 dark:border-sky-900/40">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Active combo penalties
          </h3>
          {result.appliedCombos.length === 0 ? (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              None yet.
            </p>
          ) : (
            <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
              {result.appliedCombos.map((combo) => (
                <li key={combo.id}>
                  <span className="font-medium">{combo.label}</span>
                  {combo.count ? ` ×${combo.count}` : ""} —{" "}
                  <span className="text-rose-600 dark:text-rose-400">
                    {formatDelta(combo.delta)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!allPlaced && (
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            {DEVICES.length - placed.length} device
            {DEVICES.length - placed.length === 1 ? "" : "s"} still to place.
          </p>
        )}
      </aside>
    </div>
  );
}

function emptyPlacements(): Record<DeviceId, ZoneId | null> {
  return DEVICES.reduce(
    (acc, d) => {
      acc[d.id] = null;
      return acc;
    },
    {} as Record<DeviceId, ZoneId | null>,
  );
}

function formatDelta(delta: {
  privacy: number;
  blastRadius: number;
  recovery: number;
}): string {
  const fmt = (n: number) => (n > 0 ? `+${n}` : `${n}`);
  return `${fmt(delta.privacy)} / ${fmt(delta.blastRadius)} / ${fmt(delta.recovery)}`;
}

type MeterProps = Readonly<{
  label: string;
  value: number;
}>;

function Meter({ label, value }: MeterProps) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-700 dark:text-slate-200">
          {label}
        </span>
        <span className="tabular-nums text-slate-600 dark:text-slate-300">
          {value}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800/80">
        <div
          className="h-full rounded-full bg-linear-to-r from-sky-500 to-cyan-400 transition-[width] duration-300 ease-out dark:from-sky-400 dark:to-cyan-300"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
