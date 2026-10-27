import type { DragEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEVICES,
  DeviceCategoryValue,
  type DeviceCategory,
  type DeviceId,
  type ZoneId,
} from "../engine";
import { CARD } from "../model";
import {
  DeviceIcon,
  type DeviceIconSize,
  type DeviceIconTone,
} from "./DeviceIcon";

enum ScrollFadeValue { Start = "start", Middle = "mid", End = "end" }
enum BrowserEventValue { Scroll = "scroll", Wheel = "wheel", TouchMove = "touchmove", TouchEnd = "touchend", TouchCancel = "touchcancel" }
enum ActivationKeyValue { Enter = "Enter", Space = " " }

const BUTTON_ROLE = "button";
const DEVICE_TEST_ID_PREFIX = "dh-device-";
const HINT_ANIMATION = "dh-hintPulse 1.5s ease-in-out infinite";
const HINT_CLASS = "text-[18px] font-black text-sky-400";
const INVENTORY_PANEL_ID = "dh-inventory-panel";
const PLACED_ICON_CLASS = "opacity-75";
const TILE_ICON_SIZE: DeviceIconSize = "tile";

const CAT_EDGE: Record<DeviceCategory, string> = {
  [DeviceCategoryValue.Trusted]: "#38bdf8",
  [DeviceCategoryValue.Guest]: "#fbbf24",
  [DeviceCategoryValue.GrayArea]: "#94a3b8",
  [DeviceCategoryValue.Entertainment]: "#a78bfa",
  [DeviceCategoryValue.Camera]: "#f87171",
};

function resolveDeviceTone(
  id: DeviceId, placed: boolean,
  placedZones: Record<DeviceId, ZoneId | null> | undefined,
  defaultTone: DeviceIconTone,
): DeviceIconTone {
  const zone = placed ? placedZones?.[id] : null;
  return zone ? (`zone-${zone}` as DeviceIconTone) : defaultTone;
}

function scrollFade(
  scrollLeft: number, scrollWidth: number, clientWidth: number,
): ScrollFadeValue {
  if (scrollLeft <= 4) return ScrollFadeValue.Start;
  if (scrollLeft + clientWidth >= scrollWidth - 4) {
    return ScrollFadeValue.End;
  }
  return ScrollFadeValue.Middle;
}

function deviceBorderColor(
  guided: boolean, selected: boolean, category: DeviceCategory, fallback: string,
): string {
  if (guided) return CAT_EDGE[category];
  if (selected) return CAT_EDGE[DeviceCategoryValue.Trusted];
  return fallback;
}

function mobileDeviceStateClass(selected: boolean, placed: boolean): string {
  if (selected) {
    return "scale-[1.06] shadow-[0_0_14px_rgba(56,189,248,0.35)] ring-1 ring-sky-300/80 dark:shadow-[0_0_14px_rgba(56,189,248,0.45)] dark:ring-sky-300/70";
  }
  if (placed) return "cursor-pointer opacity-40";
  return "cursor-pointer hover:bg-slate-100/90 dark:hover:bg-slate-800/90";
}

function desktopDeviceStateClass(selected: boolean, placed: boolean, allowDrag: boolean): string {
  if (selected) {
    return "border-sky-400 bg-sky-50/90 ring-1 ring-sky-300/60 dark:border-sky-400 dark:bg-sky-950/60 dark:ring-sky-500/40";
  }
  if (placed) {
    return "cursor-pointer border-slate-200/70 bg-slate-100/55 opacity-60 dark:border-slate-700/60 dark:bg-slate-800/40";
  }
  if (allowDrag) {
    return "cursor-grab border-slate-200/80 bg-white/84 hover:border-sky-300/80 active:cursor-grabbing dark:border-slate-700/70 dark:bg-slate-900/60 dark:hover:border-sky-400/40";
  }
  return "cursor-pointer border-slate-200/80 bg-white/84 hover:border-sky-300/80 dark:border-slate-700/70 dark:bg-slate-900/60 dark:hover:border-sky-400/40";
}

function openRiskLabel(riskCount: number): string {
  if (riskCount === 0) return "No open risks";
  const suffix = riskCount === 1 ? "" : "s";
  return `${riskCount} open risk${suffix}`;
}

export type DeviceStripProps = Readonly<{
  selectedId: DeviceId | null;
  placedIds: ReadonlySet<DeviceId>;
  placedZones?: Record<DeviceId, ZoneId | null>;
  onSelect: (id: DeviceId) => void;
  onReturn: (id: DeviceId) => void;
  allowDrag: boolean;
  guided: boolean;
  deviceTone: DeviceIconTone;
  onTouchDragStart?: (id: DeviceId, e: React.TouchEvent) => void;
}>;

export function DeviceStrip({
  selectedId,
  placedIds,
  placedZones,
  onSelect,
  onReturn,
  allowDrag,
  guided,
  deviceTone,
  onTouchDragStart,
}: DeviceStripProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [fade, setFade] = useState<ScrollFadeValue>(ScrollFadeValue.Start);
  const updateFade = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft: sl, scrollWidth: sw, clientWidth: cw } = el;
    setFade(scrollFade(sl, sw, cw));
  }, []);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateFade();
    el.addEventListener(BrowserEventValue.Scroll, updateFade, { passive: true });
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener(BrowserEventValue.Wheel, onWheel, { passive: false });
    const ro = new globalThis.ResizeObserver(updateFade);
    ro.observe(el);
    return () => {
      el.removeEventListener(BrowserEventValue.Scroll, updateFade);
      el.removeEventListener(BrowserEventValue.Wheel, onWheel);
      ro.disconnect();
    };
  }, [updateFade]);

  const dragTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragOriginRef = useRef<{ x: number; y: number } | null>(null);

  const cancelPendingDrag = useCallback(() => {
    if (dragTimerRef.current !== null) {
      clearTimeout(dragTimerRef.current);
      dragTimerRef.current = null;
    }
    dragOriginRef.current = null;
  }, []);

  useEffect(() => {
    const onMove = (e: TouchEvent) => {
      if (!dragOriginRef.current) return;
      const t = e.touches[0];
      if (!t) return;
      if (Math.abs(t.clientX - dragOriginRef.current.x) > 8) {
        cancelPendingDrag();
        return;
      }
      e.preventDefault();
    };
    globalThis.addEventListener(BrowserEventValue.TouchMove, onMove, {
      passive: false,
    });
    globalThis.addEventListener(BrowserEventValue.TouchEnd, cancelPendingDrag);
    globalThis.addEventListener(
      BrowserEventValue.TouchCancel,
      cancelPendingDrag,
    );
    return () => {
      globalThis.removeEventListener(BrowserEventValue.TouchMove, onMove);
      globalThis.removeEventListener(BrowserEventValue.TouchEnd, cancelPendingDrag);
      globalThis.removeEventListener(
        BrowserEventValue.TouchCancel,
        cancelPendingDrag,
      );
      cancelPendingDrag();
    };
  }, [cancelPendingDrag]);

  const handleStripTouchStart = useCallback(
    (deviceId: DeviceId, e: React.TouchEvent) => {
      if (!onTouchDragStart) return;
      const touch = e.nativeEvent.touches[0];
      if (!touch) return;
      dragOriginRef.current = { x: touch.clientX, y: touch.clientY };
      dragTimerRef.current = setTimeout(() => {
        dragTimerRef.current = null;
        dragOriginRef.current = null;
        if (navigator.vibrate) navigator.vibrate(12);
        onTouchDragStart(deviceId, e);
      }, 250);
    },
    [onTouchDragStart],
  );

  return (
    <div data-testid="dh-device-strip" className="relative w-full">
      {fade !== ScrollFadeValue.Start && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-10 items-center justify-start bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent pl-1.5"
        >
          <span
            className={HINT_CLASS}
            style={{ animation: HINT_ANIMATION }}
          >
            ‹
          </span>
        </div>
      )}
      {fade !== ScrollFadeValue.End && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 flex w-10 items-center justify-end bg-gradient-to-l from-slate-900 via-slate-900/80 to-transparent pr-1.5"
        >
          <span
            className={HINT_CLASS}
            style={{ animation: HINT_ANIMATION }}
          >
            ›
          </span>
        </div>
      )}
      <div
        ref={scrollRef}
        className="overflow-x-auto px-1 py-0.5 overscroll-x-contain"
        style={{ scrollSnapType: "x mandatory" }}
      >
        <div className="mx-auto flex w-fit gap-1.5">
          {DEVICES.map((dev) => {
            const placed = placedIds.has(dev.id);
            const sel = selectedId === dev.id;
            const bc = deviceBorderColor(
              guided,
              sel,
              dev.category,
              "rgba(148,163,184,0.42)",
            );
            return (
              <div
                key={dev.id}
                role={BUTTON_ROLE}
                tabIndex={0}
                data-testid={DEVICE_TEST_ID_PREFIX + dev.id}
                draggable={allowDrag && !placed}
                onDragStart={(e) => {
                  if (!allowDrag) return;
                  (e as unknown as DragEvent<HTMLElement>).dataTransfer.setData(
                    "text/plain",
                    dev.id,
                  );
                  (
                    e as unknown as DragEvent<HTMLElement>
                  ).dataTransfer.effectAllowed = "move";
                }}
                onClick={() => {
                  if (placed) onReturn(dev.id);
                  else onSelect(dev.id);
                }}
                onKeyDown={(e) => {
                  if (
                    e.key === ActivationKeyValue.Enter ||
                    e.key === ActivationKeyValue.Space
                  ) {
                    e.preventDefault();
                    if (placed) onReturn(dev.id);
                    else onSelect(dev.id);
                  }
                }}
                onTouchStart={
                  !placed && onTouchDragStart
                    ? (e) => handleStripTouchStart(dev.id, e)
                    : undefined
                }
                aria-pressed={sel}
                aria-label={dev.name}
                title={dev.name}
                className={[
                  "touch-manipulation flex w-14 min-w-14 shrink-0 snap-start flex-col items-center justify-center gap-0.5 rounded-lg border p-1.5 bg-white/90 shadow-[0_2px_8px_rgba(15,23,42,0.06)] transition-all dark:bg-slate-900/80",
                  mobileDeviceStateClass(sel, placed),
                ].join(" ")}
                style={{ borderColor: bc }}
              >
                <DeviceIcon
                  deviceId={dev.id}
                  category={dev.category}
                  size={TILE_ICON_SIZE}
                  tone={resolveDeviceTone(
                    dev.id,
                    placed,
                    placedZones,
                    deviceTone,
                  )}
                  className={placed ? PLACED_ICON_CLASS : "" + " mt-0.5"}
                />
                <span
                  className={[
                    "text-[7px] font-bold leading-none",
                    placed
                      ? "text-slate-500"
                      : "text-slate-700 dark:text-slate-100",
                  ].join(" ")}
                >
                  {dev.toolbarLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export type DeviceTrayGridProps = Readonly<{
  selectedId: DeviceId | null;
  placedIds: ReadonlySet<DeviceId>;
  placedZones?: Record<DeviceId, ZoneId | null>;
  onSelect: (id: DeviceId) => void;
  onReturn: (id: DeviceId) => void;
  allowDrag: boolean;
  guided: boolean;
  deviceTone: DeviceIconTone;
  columns: 1 | 2 | 3 | 4;
  onTouchDragStart?: (id: DeviceId, e: React.TouchEvent) => void;
}>;

export function DeviceTrayGrid({
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
}: DeviceTrayGridProps) {
  const hdrag = (e: DragEvent<HTMLElement>, d: DeviceId) => {
    if (!allowDrag) return;
    e.dataTransfer.setData("text/plain", d);
    e.dataTransfer.effectAllowed = "move";
  };
  const hkey = (e: React.KeyboardEvent, d: DeviceId, pl: boolean) => {
    if (
      e.key === ActivationKeyValue.Enter ||
      e.key === ActivationKeyValue.Space
    ) {
      e.preventDefault();
      if (pl) onReturn(d);
      else onSelect(d);
    }
  };

  return (
    <div className="dh-inventory-panel">
      <div className="dh-inventory-heading mb-1.5 flex items-center gap-2">
        <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-slate-700 xl:text-[11px] dark:text-slate-300">
          Inventory
        </span>
        {placedIds.size > 0 ? (
          <span className="text-[12px] font-semibold text-sky-700 xl:text-[11px] dark:text-sky-300">
            {DEVICES.length - placedIds.size} left
          </span>
        ) : null}
      </div>
      <div
        data-testid="dh-inventory-grid"
        className="dh-inventory-grid grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` }}
      >
        {DEVICES.map((dev) => {
          const pl = placedIds.has(dev.id);
          const sel = selectedId === dev.id;
          const bc = deviceBorderColor(
            guided,
            sel,
            dev.category,
            "rgba(148,163,184,0.3)",
          );
          return (
            <button
              key={dev.id}
              type={BUTTON_ROLE}
              data-testid={DEVICE_TEST_ID_PREFIX + dev.id}
              draggable={allowDrag && !pl}
              onDragStart={(e) => hdrag(e, dev.id)}
              onClick={() => {
                if (pl) onReturn(dev.id);
                else onSelect(dev.id);
              }}
              onKeyDown={(e) => hkey(e, dev.id, pl)}
              onTouchStart={
                !pl && onTouchDragStart
                  ? (e) => onTouchDragStart(dev.id, e)
                  : undefined
              }
              aria-pressed={sel}
              aria-label={dev.trayName}
              title={dev.description}
              style={{
                borderLeftColor: bc,
                borderLeftWidth: guided ? 3 : 2,
                height: "clamp(50px,4vw,56px)",
                gridTemplateColumns: "32px minmax(0,1fr)",
                touchAction: "manipulation",
              }}
              className={[
                "dh-inventory-card touch-manipulation grid items-center gap-2 overflow-hidden rounded-lg border pl-1.5 pr-2 transition-all",
                desktopDeviceStateClass(sel, pl, allowDrag),
              ].join(" ")}
            >
              <DeviceIcon
                deviceId={dev.id}
                category={dev.category}
                size={TILE_ICON_SIZE}
                tone={resolveDeviceTone(
                  dev.id,
                  pl,
                  placedZones,
                  deviceTone,
                )}
                className={pl ? PLACED_ICON_CLASS : ""}
              />
              <span
                className={[
                  "min-w-0 truncate text-left text-[11px] font-semibold leading-tight",
                  pl
                    ? "text-slate-500 dark:text-slate-400"
                    : "text-slate-900 dark:text-slate-50",
                ].join(" ")}
              >
                {dev.trayName}
              </span>
            </button>
          );
        })}
      </div>
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
  const wl = openRiskLabel(riskCount);
  return (
    <button
      type={BUTTON_ROLE}
      onClick={onOpen}
      style={{ animation: "dh-dangerPulse 2s ease-in-out infinite" }}
      className={
        CARD +
        " group flex w-full items-center justify-between gap-4 p-4 text-left transition-transform hover:-translate-y-0.5 hover:border-sky-300/80 hover:bg-sky-50/80 dark:hover:border-sky-400/35 dark:hover:bg-slate-900"
      }
    >
      <span className="min-w-0">
        <span className="block text-[12px] font-black uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300">
          Results
        </span>
        <span className="mt-1 block text-[13px] font-medium leading-snug text-slate-700 dark:text-slate-200">
          Review your choices and see what to improve.
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end">
        <span className="font-mono text-3xl font-black leading-none text-sky-600 dark:text-sky-300">
          {score}
        </span>
        <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {wl}
        </span>
      </span>
    </button>
  );
}

export type DigitalHouseInventoryPanelProps = Readonly<{
  selectedId: DeviceId | null;
  placedIds: ReadonlySet<DeviceId>;
  placedZones: Record<DeviceId, ZoneId | null>;
  onSelect: (id: DeviceId) => void;
  onReturn: (id: DeviceId) => void;
  allowDrag: boolean;
  guided: boolean;
  deviceTone: DeviceIconTone;
  columns: 2 | 3 | 4;
  onTouchDragStart?: (id: DeviceId, e: React.TouchEvent) => void;
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
    <div
      data-testid={INVENTORY_PANEL_ID}
      className={CARD + " flex flex-col p-3 xl:p-4"}
    >
      <DeviceTrayGrid
        selectedId={selectedId}
        placedIds={placedIds}
        placedZones={placedZones}
        onSelect={onSelect}
        onReturn={onReturn}
        allowDrag={allowDrag}
        guided={guided}
        deviceTone={deviceTone}
        columns={columns}
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
