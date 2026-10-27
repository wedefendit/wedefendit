import type {
  CSSProperties,
  DragEvent,
  KeyboardEvent,
  MouseEvent,
  TouchEvent as ReactTouchEvent,
} from "react";
import { ChevronDown, Lock } from "lucide-react";
import type { Device, DeviceId } from "../engine/devices";
import {
  ZoneIdValue,
  getRoom,
  type RoomId,
  type ZoneId,
} from "../engine/zones";
import { DeviceIcon, type DeviceIconTone } from "./DeviceIcon";
import { ROOM_FURNITURE } from "./furniture";

type FloorStyle = Readonly<{
  base: string;
  overlay: string;
}>;

const FLOOR_STYLES: Record<RoomId, FloorStyle> = {
  office: {
    base: "linear-gradient(135deg,#d4c4a0 0%,#ccbc96 100%)",
    overlay:
      "repeating-linear-gradient(90deg,rgba(74,60,48,0.12) 0 1px,transparent 1px 28px)",
  },
  bedroom: {
    base: "linear-gradient(135deg,#ccc4b4 0%,#c4bcac 100%)",
    overlay:
      "repeating-linear-gradient(0deg,rgba(74,60,48,0.08) 0 1px,transparent 1px 6px)",
  },
  "living-room": {
    base: "linear-gradient(135deg,#d4c4a0 0%,#cabb9a 100%)",
    overlay:
      "repeating-linear-gradient(90deg,rgba(74,60,48,0.12) 0 1px,transparent 1px 32px)",
  },
  kitchen: {
    base: "linear-gradient(135deg,#ddd8d0 0%,#d4cfca 100%)",
    overlay:
      "repeating-linear-gradient(0deg,rgba(74,60,48,0.12) 0 1px,transparent 1px 20px),repeating-linear-gradient(90deg,rgba(74,60,48,0.12) 0 1px,transparent 1px 20px)",
  },
  "entry-exterior": {
    base: "linear-gradient(135deg,#b8b0a0 0%,#a8a090 100%)",
    overlay:
      "repeating-linear-gradient(135deg,rgba(74,60,48,0.14) 0 2px,transparent 2px 16px)",
  },
};

type ZonePresentation = Readonly<{
  accent: string;
  soft: string;
  medium: string;
  glow: string;
  label: string;
}>;

const ZONE_PRESENTATION: Record<ZoneId, ZonePresentation> = {
  [ZoneIdValue.Main]: {
    accent: "#38bdf8",
    soft: "rgba(56,189,248,0.09)",
    medium: "rgba(56,189,248,0.2)",
    glow: "rgba(56,189,248,0.32)",
    label: "Main",
  },
  [ZoneIdValue.Guest]: {
    accent: "#fbbf24",
    soft: "rgba(251,191,36,0.09)",
    medium: "rgba(251,191,36,0.2)",
    glow: "rgba(251,191,36,0.32)",
    label: "Guest",
  },
  [ZoneIdValue.IoT]: {
    accent: "#a78bfa",
    soft: "rgba(167,139,250,0.09)",
    medium: "rgba(167,139,250,0.2)",
    glow: "rgba(167,139,250,0.32)",
    label: "IoT",
  },
};

type RoomCellValues = Readonly<{
  absolute: CSSProperties["position"]; relative: CSSProperties["position"];
  flex: CSSProperties["display"]; grid: CSSProperties["display"];
  inlineFlex: CSSProperties["display"]; center: CSSProperties["alignItems"];
  defaultCursor: CSSProperties["cursor"]; pointer: CSSProperties["cursor"];
  manipulation: CSSProperties["touchAction"]; category: DeviceIconTone;
  button: "button"; dialog: "dialog"; none: "none";
  zoneSuffix: string; zoneOptionsSuffix: string; blurFour: string;
  darkInk: string; lightInk: string;
  pillRadius: number; smallTextSize: number; overlayTextSize: number;
  smallWeight: number; strongWeight: number;
  popoverWidth: number; modalLayer: number; optionHeight: number;
  deviceRowBottom: number;
}>;

const ROOM_CELL_VALUES: RoomCellValues = {
  absolute: "absolute", relative: "relative",
  flex: "flex", grid: "grid", inlineFlex: "inline-flex", center: "center",
  defaultCursor: "default", pointer: "pointer", manipulation: "manipulation",
  category: "category", button: "button", dialog: "dialog", none: "none",
  zoneSuffix: " zone", zoneOptionsSuffix: " zone options",
  blurFour: "blur(4px)", darkInk: "#0b1120", lightInk: "#f8fafc",
  pillRadius: 999, smallTextSize: 10, overlayTextSize: 11,
  smallWeight: 700, strongWeight: 800,
  popoverWidth: 200, modalLayer: 100, optionHeight: 26, deviceRowBottom: 26,
};

type ZoneControl = Readonly<{
  currentZone: ZoneId | null;
  locked: boolean;
  showLock?: boolean;
  open: boolean;
  onToggle: () => void;
  onAssign: (zoneId: ZoneId) => void;
}>;

type RoomCellProps = Readonly<{
  roomId: RoomId;
  zoneId: ZoneId | null;
  devices: ReadonlyArray<Device>;
  isHover: boolean;
  isRisky: boolean;
  isSelectMode: boolean;
  style?: CSSProperties;
  onEnter: () => void;
  onLeave: () => void;
  onClickPlace: () => void;
  onDropDevice: (deviceId: DeviceId) => void;
  onDeviceClick?: (deviceId: DeviceId) => void;
  allowDrag?: boolean;
  zoneControl?: ZoneControl;
  deviceTone?: DeviceIconTone;
  onTouchDragStart?: (deviceId: DeviceId, e: ReactTouchEvent) => void;
}>;

function stopBubble(event: MouseEvent<HTMLElement>): void {
  event.preventDefault();
  event.stopPropagation();
}

function roomBorder(active: boolean, risky: boolean, accent: string): string {
  if (active) return "2px solid " + accent;
  if (risky) return "2px solid #dc2626";
  return "2px solid rgba(139,115,85,0.55)";
}

function roomShadow(active: boolean, risky: boolean, glow: string): string {
  if (active) {
    return "inset 0 0 24px " + glow + ", 0 4px 12px rgba(0,0,0,0.25)";
  }
  if (risky) {
    return "inset 0 0 18px rgba(220,38,38,0.18), 0 2px 6px rgba(0,0,0,0.2)";
  }
  return "inset 0 2px 6px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.15)";
}

function deviceCursor(
  clickable: boolean,
  draggable: boolean,
) {
  if (!clickable) return ROOM_CELL_VALUES.defaultCursor;
  return draggable ? "grab" : ROOM_CELL_VALUES.pointer;
}

export function RoomCell({
  roomId,
  zoneId,
  devices,
  isHover,
  isRisky,
  isSelectMode,
  style,
  onEnter,
  onLeave,
  onClickPlace,
  onDropDevice,
  onDeviceClick,
  allowDrag = true,
  zoneControl,
  deviceTone = ROOM_CELL_VALUES.category,
  onTouchDragStart,
}: RoomCellProps) {
  const floor = FLOOR_STYLES[roomId];
  const Furn = ROOM_FURNITURE[roomId];
  const meta = getRoom(roomId);
  const active = isHover;

  const presentation = zoneId ? ZONE_PRESENTATION[zoneId] : null;
  const accent = presentation?.accent ?? "#8b7355";
  const softTint = presentation?.soft ?? "rgba(255,255,255,0.04)";
  const medTint = presentation?.medium ?? "rgba(255,255,255,0.08)";
  const glow = presentation?.glow ?? "rgba(255,255,255,0.1)";

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (!allowDrag) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    onEnter();
  };

  const handleDropEvent = (e: DragEvent<HTMLDivElement>) => {
    if (!allowDrag) return;
    e.preventDefault();
    e.stopPropagation();
    const droppedDeviceId = e.dataTransfer.getData("text/plain") as DeviceId;
    if (droppedDeviceId) onDropDevice(droppedDeviceId);
    onLeave();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!isSelectMode) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClickPlace();
    }
  };

  const zoneSuffix = zoneId
    ? ", " + ZONE_PRESENTATION[zoneId].label + " zone"
    : "";
  const chipLabel = zoneControl?.currentZone
    ? ZONE_PRESENTATION[zoneControl.currentZone].label.toUpperCase()
    : "SET";
  const chipAccent = zoneControl?.currentZone
    ? ZONE_PRESENTATION[zoneControl.currentZone].accent
    : "rgba(255,255,255,0.22)";

  return (
    <div
      data-testid={"dh-room-" + roomId}
      role={ROOM_CELL_VALUES.button}
      tabIndex={0}
      aria-label={meta.name + zoneSuffix}
      onDragOver={handleDragOver}
      onDragLeave={onLeave}
      onDrop={handleDropEvent}
      onClick={onClickPlace}
      onKeyDown={handleKeyDown}
      style={{
        position: ROOM_CELL_VALUES.relative,
        overflow: "visible",
        cursor: isSelectMode
          ? ROOM_CELL_VALUES.pointer
          : ROOM_CELL_VALUES.defaultCursor,
        background: floor.base,
        borderRadius: 5,
        border: roomBorder(active, isRisky, accent),
        boxShadow: roomShadow(active, isRisky, glow),
        transition:
          "border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease",
        animation: isRisky
          ? "dh-dangerPulse 2s ease-in-out infinite"
          : ROOM_CELL_VALUES.none,
        touchAction: ROOM_CELL_VALUES.manipulation,
        ...style,
      }}
    >
      <div
        aria-hidden
        style={{
          position: ROOM_CELL_VALUES.absolute,
          inset: 0,
          background: floor.overlay,
          pointerEvents: ROOM_CELL_VALUES.none,
          opacity: 0.6,
        }}
      />

      <div
        aria-hidden
        style={{
          position: ROOM_CELL_VALUES.absolute,
          inset: 0,
          background: active ? medTint : softTint,
          transition: "background 0.3s",
          pointerEvents: ROOM_CELL_VALUES.none,
        }}
      />

      <Furn />

      <RoomLabel
        roomId={roomId}
        roomName={meta.name}
        zoneId={zoneId}
        zoneControl={zoneControl}
        accent={accent}
        chipAccent={chipAccent}
        chipLabel={chipLabel}
      />

      <div
        style={{
          position: ROOM_CELL_VALUES.absolute,
          bottom: ROOM_CELL_VALUES.deviceRowBottom,
          left: 7,
          right: 7,
          display: ROOM_CELL_VALUES.flex,
          flexWrap: "wrap",
          gap: 4,
          zIndex: 4,
        }}
      >
        {devices.map((dev) => (
          <DeviceChip
            key={dev.id}
            device={dev}
            onClick={onDeviceClick}
            allowDrag={allowDrag}
            tone={zoneId ? (`zone-${zoneId}` as DeviceIconTone) : deviceTone}
            onTouchDragStart={onTouchDragStart}
          />
        ))}
      </div>

      {active && (
        <div
          aria-hidden
          style={{
            position: ROOM_CELL_VALUES.absolute,
            inset: 0,
            display: ROOM_CELL_VALUES.flex,
            alignItems: ROOM_CELL_VALUES.center,
            justifyContent: ROOM_CELL_VALUES.center,
            background: "rgba(0,0,0,0.32)",
            backdropFilter: "blur(2px)",
            zIndex: 6,
            pointerEvents: ROOM_CELL_VALUES.none,
          }}
        >
          <span
            style={{
              fontSize: ROOM_CELL_VALUES.overlayTextSize,
              fontWeight: ROOM_CELL_VALUES.smallWeight,
              color: "#fff",
              background: accent + "ee",
              padding: "5px 14px",
              borderRadius: ROOM_CELL_VALUES.pillRadius,
              boxShadow: "0 4px 12px " + glow,
              letterSpacing: "0.02em",
            }}
          >
            Place here
          </span>
        </div>
      )}
    </div>
  );
}

type RoomLabelProps = Readonly<{
  roomId: RoomId;
  roomName: string;
  zoneId: ZoneId | null;
  zoneControl?: ZoneControl;
  accent: string;
  chipAccent: string;
  chipLabel: string;
}>;

function RoomLabel(props: RoomLabelProps) {
  let zoneBadge = null;
  if (props.zoneControl) {
    zoneBadge = <RoomZoneControl {...props} zoneControl={props.zoneControl} />;
  } else if (props.zoneId) {
    zoneBadge = (
      <span
        style={{
          fontSize: 8,
          fontWeight: ROOM_CELL_VALUES.strongWeight,
          letterSpacing: "0.1em",
          padding: "2px 6px",
          borderRadius: ROOM_CELL_VALUES.pillRadius,
          background: props.accent,
          color: ROOM_CELL_VALUES.darkInk,
          lineHeight: 1,
        }}
      >
        {ZONE_PRESENTATION[props.zoneId].label.toUpperCase()}
      </span>
    );
  }
  return (
    <div
      style={{
        position: ROOM_CELL_VALUES.absolute,
        bottom: 5,
        left: 6,
        display: ROOM_CELL_VALUES.inlineFlex,
        alignItems: ROOM_CELL_VALUES.center,
        gap: 5,
        padding: "3px 7px 3px 7px",
        borderRadius: ROOM_CELL_VALUES.pillRadius,
        background: "rgba(15,23,42,0.78)",
        backdropFilter: ROOM_CELL_VALUES.blurFour,
        WebkitBackdropFilter: ROOM_CELL_VALUES.blurFour,
        boxShadow: "0 1px 3px rgba(0,0,0,0.45)",
        zIndex: 7,
      }}
    >
      <span
        style={{
          fontSize: ROOM_CELL_VALUES.smallTextSize,
          fontWeight: ROOM_CELL_VALUES.smallWeight,
          color: "#f1f5f9",
          letterSpacing: "0.01em",
          lineHeight: 1,
          pointerEvents: ROOM_CELL_VALUES.none,
        }}
      >
        {props.roomName}
      </span>
      {zoneBadge}
    </div>
  );
}

function RoomZoneControl(
  props: RoomLabelProps & Readonly<{ zoneControl: ZoneControl }>,
) {
  const { roomId, roomName, chipAccent, chipLabel, zoneControl } = props;
  const borderColor = zoneControl.currentZone
    ? chipAccent
    : "rgba(255,255,255,0.18)";
  const background = zoneControl.currentZone
    ? chipAccent
    : "rgba(255,255,255,0.06)";
  const color = zoneControl.currentZone
    ? ROOM_CELL_VALUES.darkInk
    : ROOM_CELL_VALUES.lightInk;
  return (
    <div
      style={{
        position: ROOM_CELL_VALUES.relative,
        display: ROOM_CELL_VALUES.inlineFlex,
        alignItems: ROOM_CELL_VALUES.center,
      }}
    >
      <button
        type={ROOM_CELL_VALUES.button}
        data-testid={"dh-room-zone-" + roomId}
        aria-label={roomName + ROOM_CELL_VALUES.zoneSuffix}
        aria-expanded={zoneControl.locked ? undefined : zoneControl.open}
        aria-haspopup={zoneControl.locked ? undefined : ROOM_CELL_VALUES.dialog}
        disabled={zoneControl.locked}
        onClick={(event) => {
          stopBubble(event);
          if (!zoneControl.locked) zoneControl.onToggle();
        }}
        className="touch-manipulation"
        style={{
          display: ROOM_CELL_VALUES.inlineFlex,
          alignItems: ROOM_CELL_VALUES.center,
          gap: 3,
          border: "1px solid transparent",
          borderColor,
          background,
          color,
          fontSize: 9,
          fontWeight: ROOM_CELL_VALUES.strongWeight,
          letterSpacing: "0.08em",
          lineHeight: 1,
          padding: "2px 6px 2px 7px",
          borderRadius: ROOM_CELL_VALUES.pillRadius,
          cursor: zoneControl.locked ? "not-allowed" : ROOM_CELL_VALUES.pointer,
          opacity: zoneControl.locked ? 0.92 : 1,
          touchAction: ROOM_CELL_VALUES.manipulation,
          verticalAlign: "middle",
        }}
      >
        <span>{chipLabel}</span>
        {zoneControl.locked && zoneControl.showLock ? (
          <Lock size={ROOM_CELL_VALUES.smallTextSize} />
        ) : null}
        {!zoneControl.locked ? (
          <ChevronDown size={ROOM_CELL_VALUES.smallTextSize} />
        ) : null}
      </button>
      {!zoneControl.locked && zoneControl.open ? (
        <ZoneOptions
          roomId={roomId}
          roomName={roomName}
          zoneControl={zoneControl}
        />
      ) : null}
    </div>
  );
}

function zoneOptionStyle(active: boolean, accent: string): CSSProperties {
  return {
    minHeight: ROOM_CELL_VALUES.optionHeight,
    borderRadius: 7,
    border:
      "1px solid " + (active ? accent : "rgba(148,163,184,0.22)"),
    background: active ? accent : "rgba(15,23,42,0.45)",
    color: active ? ROOM_CELL_VALUES.darkInk : ROOM_CELL_VALUES.lightInk,
    fontSize: ROOM_CELL_VALUES.smallTextSize,
    fontWeight: ROOM_CELL_VALUES.strongWeight,
    letterSpacing: "0.04em",
    touchAction: ROOM_CELL_VALUES.manipulation,
  };
}

type ZoneOptionsProps = Readonly<{
  roomId: RoomId;
  roomName: string;
  zoneControl: ZoneControl;
}>;

function ZoneOptions({ roomId, roomName, zoneControl }: ZoneOptionsProps) {
  return (
    <div
      role={ROOM_CELL_VALUES.dialog}
      data-testid={"dh-room-zone-popover-" + roomId}
      aria-label={roomName + ROOM_CELL_VALUES.zoneOptionsSuffix}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
      style={{
        position: ROOM_CELL_VALUES.absolute,
        left: 0,
        bottom: "calc(100% + 6px)",
        display: ROOM_CELL_VALUES.grid,
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 4,
        width: ROOM_CELL_VALUES.popoverWidth,
        maxWidth: "calc(100vw - 24px)",
        padding: 6,
        borderRadius: ROOM_CELL_VALUES.smallTextSize,
        border: "1px solid rgba(125,211,252,0.28)",
        background: "rgba(15,23,42,0.96)",
        boxShadow: "0 12px 26px rgba(2,6,23,0.4)",
        zIndex: ROOM_CELL_VALUES.modalLayer,
      }}
    >
      {Object.values(ZoneIdValue).map((nextZone) => {
        const active = zoneControl.currentZone === nextZone;
        const accent = ZONE_PRESENTATION[nextZone].accent;
        return (
          <button
            key={nextZone}
            type={ROOM_CELL_VALUES.button}
            data-testid={"dh-room-zone-option-" + roomId + "-" + nextZone}
            onClick={(event) => {
              stopBubble(event);
              zoneControl.onAssign(nextZone);
            }}
            style={zoneOptionStyle(active, accent)}
          >
            {ZONE_PRESENTATION[nextZone].label}
          </button>
        );
      })}
    </div>
  );
}

type DeviceChipProps = Readonly<{
  device: Device;
  onClick?: (deviceId: DeviceId) => void;
  allowDrag?: boolean;
  tone?: DeviceIconTone;
  onTouchDragStart?: (deviceId: DeviceId, e: ReactTouchEvent) => void;
}>;

function DeviceChip({
  device,
  onClick,
  allowDrag = true,
  tone = ROOM_CELL_VALUES.category,
  onTouchDragStart,
}: DeviceChipProps) {
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onClick?.(device.id);
  };

  const handleDragStart = (e: DragEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.dataTransfer.setData("text/plain", device.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = (e: DragEvent<HTMLButtonElement>) => {
    e.stopPropagation();
  };

  const handleTouchStart = (e: ReactTouchEvent<HTMLButtonElement>) => {
    if (onTouchDragStart) {
      e.stopPropagation();
      onTouchDragStart(device.id, e);
    }
  };

  return (
    <button
      type={ROOM_CELL_VALUES.button}
      title={device.name}
      aria-label={
        device.name +
        (allowDrag ? ", drag or click to move" : ", click to move")
      }
      draggable={allowDrag}
      onClick={handleClick}
      onDragStart={allowDrag ? handleDragStart : undefined}
      onDragEnd={allowDrag ? handleDragEnd : undefined}
      onTouchStart={onTouchDragStart ? handleTouchStart : undefined}
      style={{
        cursor: deviceCursor(onClick !== undefined, allowDrag),
        display: "inline-flex",
        padding: 0,
        border: "none",
        background: "transparent",
        font: "inherit",
        touchAction: "manipulation",
      }}
    >
      <DeviceIcon
        deviceId={device.id}
        category={device.category}
        size="sm"
        tone={tone}
        popOnMount
      />
    </button>
  );
}
