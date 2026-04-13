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

import type { DragEvent } from "react";
import { DEVICES, type Device, type DeviceId, type ZoneId } from "../engine";
import { CARD, TOOLBAR_LABEL, TRAY_NAME } from "../model";
import { DeviceIcon, type DeviceIconTone } from "./DeviceIcon";

export type DeviceTrayGridProps = Readonly<{
  selectedId: DeviceId | null;
  placedIds: ReadonlySet<DeviceId>;
  placedZones?: Record<DeviceId, ZoneId | null>;
  onSelect: (deviceId: DeviceId) => void;
  onReturn: (deviceId: DeviceId) => void;
  layout: "toolbar" | "compact";
  allowDrag: boolean;
  guided: boolean;
  deviceTone: DeviceIconTone;
  columns?: 1 | 2 | 3 | 4;
  framed?: boolean;
  showHeading?: boolean;
  onTouchDragStart?: (deviceId: DeviceId, e: React.TouchEvent) => void;
}>;

const CATEGORY_EDGE: Record<Device["category"], string> = {
  trusted: "#38bdf8",
  guest: "#fbbf24",
  "gray-area": "#94a3b8",
  entertainment: "#a78bfa",
  camera: "#f87171",
};

export function DeviceTrayGrid({
  selectedId,
  placedIds,
  placedZones,
  onSelect,
  onReturn,
  layout,
  allowDrag,
  guided,
  deviceTone,
  columns = 2,
  framed = true,
  showHeading = true,
  onTouchDragStart,
}: DeviceTrayGridProps) {
  /** Compute tone for a device: if placed and we have zone info, use zone color.
   *  Otherwise fall back to the grid-level deviceTone. */
  const toneFor = (deviceId: DeviceId, isPlaced: boolean): DeviceIconTone => {
    if (isPlaced && placedZones) {
      const zone = placedZones[deviceId];
      if (zone) return `zone-${zone}` as DeviceIconTone;
    }
    return deviceTone;
  };
  const handleDragStart = (e: DragEvent<HTMLElement>, d: DeviceId) => {
    if (!allowDrag) return;
    e.dataTransfer.setData("text/plain", d);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleCardKeyDown = (
    e: React.KeyboardEvent<HTMLElement>,
    d: DeviceId,
    isPlaced: boolean,
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (isPlaced) onReturn(d);
      else onSelect(d);
    }
  };

  if (layout === "toolbar") {
    return (
      <div>
        <div className="grid grid-cols-5 justify-items-center gap-1.5">
          {DEVICES.map((device) => {
            const isPlaced = placedIds.has(device.id);
            const isSelected = selectedId === device.id;
            const edgeColor = CATEGORY_EDGE[device.category];
            const borderColor = guided
              ? edgeColor
              : isSelected
                ? "#38bdf8"
                : "rgba(148,163,184,0.42)";
            return (
              // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/prefer-tag-over-role, jsx-a11y/no-noninteractive-tabindex
              <div
                role="button"
                tabIndex={0}
                data-testid={"dh-device-" + device.id}
                key={device.id}
                draggable={allowDrag && isPlaced === false}
                onDragStart={(e) => handleDragStart(e as unknown as DragEvent<HTMLElement>, device.id)}
                onClick={() =>
                  isPlaced ? onReturn(device.id) : onSelect(device.id)
                }
                onKeyDown={(e) =>
                  handleCardKeyDown(e, device.id, isPlaced)
                }
                onTouchStart={
                  !isPlaced && onTouchDragStart
                    ? (e) => onTouchDragStart(device.id, e)
                    : undefined
                }
                aria-pressed={isSelected}
                aria-label={device.name}
                title={device.name}
                className={[
                  "touch-manipulation flex flex-col items-center justify-center gap-0.5 rounded-lg border bg-white/90 shadow-[0_4px_12px_rgba(15,23,42,0.08)] transition-all dark:bg-slate-900/80 dark:shadow-none",
                  isSelected
                    ? "scale-[1.04] shadow-[0_0_18px_rgba(56,189,248,0.35)] ring-1 ring-sky-300/80 dark:shadow-[0_0_18px_rgba(56,189,248,0.45)] dark:ring-sky-300/70"
                    : isPlaced
                      ? "cursor-pointer opacity-40"
                      : "cursor-pointer hover:bg-slate-100/90 dark:hover:bg-slate-800/90",
                ].join(" ")}
                style={{
                  borderColor,
                  height: "clamp(44px, 14.4vw, 52px)",
                  width: "clamp(44px, 14.4vw, 52px)",
                  touchAction: "manipulation",
                }}
              >
                <DeviceIcon
                  deviceId={device.id}
                  category={device.category}
                  size="tile"
                  tone={toneFor(device.id, isPlaced)}
                  className={isPlaced ? "opacity-75" : ""}
                />
                <span
                  className={[
                    "text-[8px] font-bold leading-none",
                    isPlaced
                      ? "text-slate-500 dark:text-slate-500"
                      : "text-slate-700 dark:text-slate-100",
                  ].join(" ")}
                >
                  {TOOLBAR_LABEL[device.id]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const inventoryContent = (
    <>
      {showHeading && (
        <div className="dh-inventory-heading mb-1 flex items-center gap-2 min-[820px]:mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-700 min-[820px]:text-[12px] xl:text-[11px] dark:text-slate-300">
            Inventory
          </span>
          {placedIds.size > 0 && (
            <span className="text-[10px] font-semibold text-sky-700 min-[820px]:text-[12px] xl:text-[11px] dark:text-sky-300">
              {10 - placedIds.size} left
            </span>
          )}
        </div>
      )}
      <div
        data-testid="dh-inventory-grid"
        className="dh-inventory-grid grid gap-1.5"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        }}
      >
        {DEVICES.map((device) => {
          const isPlaced = placedIds.has(device.id);
          const isSelected = selectedId === device.id;
          const edgeColor = CATEGORY_EDGE[device.category];
          const displayName = TRAY_NAME[device.id];
          const borderColor = guided
            ? edgeColor
            : isSelected
              ? "#38bdf8"
              : "rgba(148,163,184,0.3)";
          return (
            <button
              type="button"
              data-testid={"dh-device-" + device.id}
              key={device.id}
              draggable={allowDrag && isPlaced === false}
              onDragStart={(e) => handleDragStart(e, device.id)}
              onClick={() =>
                isPlaced ? onReturn(device.id) : onSelect(device.id)
              }
              onKeyDown={(e) =>
                handleCardKeyDown(e, device.id, isPlaced)
              }
              onTouchStart={
                !isPlaced && onTouchDragStart
                  ? (e) => onTouchDragStart(device.id, e)
                  : undefined
              }
              aria-pressed={isSelected}
              aria-label={displayName}
              style={{
                borderLeftColor: borderColor,
                borderLeftWidth: guided ? 3 : 2,
                height: "clamp(50px, 4vw, 56px)",
                gridTemplateColumns: "32px minmax(0, 1fr)",
                touchAction: "manipulation",
              }}
              className={[
                "dh-inventory-card touch-manipulation grid items-center gap-2 overflow-hidden rounded-lg border pl-1.5 pr-2 transition-all",
                isSelected
                  ? "border-sky-400 bg-sky-50/90 ring-1 ring-sky-300/60 dark:border-sky-400 dark:bg-sky-950/60 dark:ring-sky-500/40"
                  : isPlaced
                    ? "cursor-pointer border-slate-200/70 bg-slate-100/55 opacity-60 dark:border-slate-700/60 dark:bg-slate-800/40"
                    : allowDrag
                      ? "cursor-grab border-slate-200/80 bg-white/84 hover:border-sky-300/80 active:cursor-grabbing dark:border-slate-700/70 dark:bg-slate-900/60 dark:hover:border-sky-400/40"
                      : "cursor-pointer border-slate-200/80 bg-white/84 hover:border-sky-300/80 dark:border-slate-700/70 dark:bg-slate-900/60 dark:hover:border-sky-400/40",
              ].join(" ")}
            >
              <DeviceIcon
                deviceId={device.id}
                category={device.category}
                size="tile"
                tone={toneFor(device.id, isPlaced)}
                className={isPlaced ? "opacity-75" : ""}
              />
              <span
                className={[
                  "min-w-0 truncate text-left text-[11px] font-semibold leading-tight",
                  isPlaced
                    ? "text-slate-500 dark:text-slate-400"
                    : "text-slate-900 dark:text-slate-50",
                ].join(" ")}
              >
                {displayName}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );

  if (!framed) {
    return <div className="dh-inventory-panel">{inventoryContent}</div>;
  }

  return (
    <div className={CARD + " dh-inventory-panel p-2 min-[820px]:p-2.5"}>
      {inventoryContent}
    </div>
  );
}

export type AfterActionReportButtonProps = Readonly<{
  score: number;
  riskCount: number;
  onOpen: () => void;
}>;

export function AfterActionReportButton({
  score,
  riskCount,
  onOpen,
}: AfterActionReportButtonProps) {
  const warningLabel =
    riskCount === 0
      ? "No open risk"
      : `${riskCount} open risk${riskCount === 1 ? "" : "s"}`;
  return (
    <button
      type="button"
      onClick={onOpen}
      className={[
        CARD,
        "group flex w-full items-center justify-between gap-4 p-4 text-left transition-transform hover:-translate-y-0.5 hover:border-sky-300/80 hover:bg-sky-50/80 dark:hover:border-sky-400/35 dark:hover:bg-slate-900",
      ].join(" ")}
    >
      <span className="min-w-0">
        <span className="block text-[12px] font-black uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300">
          After-Action Report
        </span>
        <span className="mt-1 block text-[13px] font-medium leading-snug text-slate-700 dark:text-slate-200">
          Review what worked, what still adds risk, and the stronger setup.
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end">
        <span className="font-mono text-3xl font-black leading-none text-sky-600 dark:text-sky-300">
          {score}
        </span>
        <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {warningLabel}
        </span>
      </span>
    </button>
  );
}


export type DigitalHouseInventoryPanelProps = Readonly<{
  selectedId: DeviceId | null;
  placedIds: ReadonlySet<DeviceId>;
  placedZones: Record<DeviceId, ZoneId | null>;
  onSelect: (deviceId: DeviceId) => void;
  onReturn: (deviceId: DeviceId) => void;
  allowDrag: boolean;
  guided: boolean;
  deviceTone: DeviceIconTone;
  columns: 2 | 3 | 4;
  onTouchDragStart?: (deviceId: DeviceId, e: React.TouchEvent) => void;
  showAfterAction?: boolean;
  score?: number;
  riskCount?: number;
  onOpenAfterAction?: () => void;
}>;

export function DigitalHouseInventoryPanel({
  selectedId,
  placedIds,
  placedZones,
  onSelect,
  onReturn,
  allowDrag,
  guided,
  deviceTone,
  columns,
  onTouchDragStart,
  showAfterAction = false,
  score = 0,
  riskCount = 0,
  onOpenAfterAction,
}: DigitalHouseInventoryPanelProps) {
  return (
    <div data-testid="dh-inventory-panel" className={CARD + " flex flex-col p-3 xl:p-4"}>
      <DeviceTrayGrid
        selectedId={selectedId}
        placedIds={placedIds}
        placedZones={placedZones}
        onSelect={onSelect}
        onReturn={onReturn}
        layout="compact"
        allowDrag={allowDrag}
        guided={guided}
        deviceTone={deviceTone}
        columns={columns}
        framed={false}
        showHeading
        onTouchDragStart={onTouchDragStart}
      />
      {showAfterAction && onOpenAfterAction ? (
        <div className="mt-3 shrink-0">
          <AfterActionReportButton
            score={score}
            riskCount={riskCount}
            onOpen={onOpenAfterAction}
          />
        </div>
      ) : null}
    </div>
  );
}
