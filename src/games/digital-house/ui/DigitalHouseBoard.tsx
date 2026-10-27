import { useEffect, useRef, useState } from "react";
import type { Device, DeviceId, RoomId, ZoneId } from "../engine";
import { RoomCell } from "./RoomCell";
import type { DeviceIconTone } from "./DeviceIcon";

const HOUSE_NATURAL_W = 480;
const HOUSE_NATURAL_H = 440;
enum PositionValue { Absolute = "absolute" }
enum DisplayValue { Grid = "grid" }

export type HouseFrameProps = Readonly<{
  mobile: boolean;
  roomZones: Record<RoomId, ZoneId | null>;
  preassignedZones: Record<RoomId, ZoneId | null>;
  devicesByRoom: Map<RoomId, Device[]>;
  hoveredRoom: RoomId | null;
  riskyRooms: Set<RoomId>;
  isSelectMode: boolean;
  onRoomEnter: (roomId: RoomId) => void;
  onRoomLeave: () => void;
  onRoomClick: (roomId: RoomId) => void;
  onRoomDrop: (roomId: RoomId, deviceId: DeviceId) => void;
  onDeviceClickInRoom: (deviceId: DeviceId) => void;
  allowDrag: boolean;
  showZoneControls: boolean;
  openZoneRoom: RoomId | null;
  onToggleZoneRoom: (roomId: RoomId) => void;
  onAssignRoomZone: (roomId: RoomId, zoneId: ZoneId) => void;
  deviceTone: DeviceIconTone;
  onTouchDragStart?: (deviceId: DeviceId, e: React.TouchEvent) => void;
}>;

export type ScaledHouseFrameProps = Omit<HouseFrameProps, "mobile">;

type HouseScalerProps = ScaledHouseFrameProps & Readonly<{
  inset: number;
  minScale: number;
  mobile: boolean;
}>;

const HOUSE_SCALER = {
  mobile: { inset: 4, minScale: 0.42 },
  desktop: { inset: 8, minScale: 0.5 },
  maxScale: 1.58,
  hostClass: "relative h-full w-full overflow-visible",
  frameClass: "absolute left-1/2 top-1/2",
  transformOrigin: "center center",
};
const HOUSE_STYLE = { fullWidth: "100%", roofEdge: "40px solid transparent", absolute: PositionValue.Absolute, bodyRadius: "0 0 6px 6px", grid: DisplayValue.Grid, columns: "1fr 1fr", chimneyWidth: 20, chimneyHeight: 30, porchLabelWeight: 800, centerPercent: -50 };

function scaleTransform(scale: number): string {
  return `translate(${HOUSE_STYLE.centerPercent}%, ${HOUSE_STYLE.centerPercent}%) scale(${scale})`;
}

function HouseScaler({ inset, minScale, mobile, ...props }: HouseScalerProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const measure = () => {
      const { width, height } = host.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      const widthScale = (width - inset) / HOUSE_NATURAL_W;
      const heightScale = height / HOUSE_NATURAL_H;
      setScale(Math.max(minScale, Math.min(HOUSE_SCALER.maxScale, Math.min(widthScale, heightScale))));
    };
    measure();
    const observer = new globalThis.ResizeObserver(measure);
    observer.observe(host);
    return () => observer.disconnect();
  }, [inset, minScale]);
  return (
    <div ref={hostRef} className={HOUSE_SCALER.hostClass}>
      <div
        className={HOUSE_SCALER.frameClass}
        style={{
          width: HOUSE_NATURAL_W,
          transform: scaleTransform(scale),
          transformOrigin: HOUSE_SCALER.transformOrigin,
        }}
      >
        <HouseFrame mobile={mobile} {...props} />
      </div>
    </div>
  );
}

export function MobileScaledHouseFrame(props: ScaledHouseFrameProps) {
  return (
    <HouseScaler {...HOUSE_SCALER.mobile} mobile {...props} />
  );
}

export function ScaledHouseFrame(props: ScaledHouseFrameProps) {
  return (
    <HouseScaler {...HOUSE_SCALER.desktop} mobile={false} {...props} />
  );
}

export function HouseFrame({
  roomZones,
  preassignedZones,
  devicesByRoom,
  hoveredRoom,
  riskyRooms,
  isSelectMode,
  onRoomEnter,
  onRoomLeave,
  onRoomClick,
  onRoomDrop,
  onDeviceClickInRoom,
  allowDrag,
  showZoneControls,
  openZoneRoom,
  onToggleZoneRoom,
  onAssignRoomZone,
  deviceTone,
  onTouchDragStart,
}: HouseFrameProps) {
  const roomHeight = 134;
  const porchHeight = 80;
  const maxWidth = 480;

  const cellProps = (roomId: RoomId, height: number) => ({
    roomId,
    zoneId: roomZones[roomId],
    devices: devicesByRoom.get(roomId) ?? [],
    isHover: hoveredRoom === roomId,
    isRisky: riskyRooms.has(roomId),
    isSelectMode,
    style: { height },
    onEnter: () => onRoomEnter(roomId),
    onLeave: onRoomLeave,
    onClickPlace: () => onRoomClick(roomId),
    onDropDevice: (deviceId: DeviceId) => onRoomDrop(roomId, deviceId),
    onDeviceClick: onDeviceClickInRoom,
    allowDrag,
    deviceTone,
    onTouchDragStart,
    zoneControl: showZoneControls
      ? {
          currentZone: roomZones[roomId],
          locked: preassignedZones[roomId] !== null,
          showLock: preassignedZones[roomId] !== null,
          open: openZoneRoom === roomId,
          onToggle: () => onToggleZoneRoom(roomId),
          onAssign: (zoneId: ZoneId) => onAssignRoomZone(roomId, zoneId),
        }
      : undefined,
  });

  return (
    <div className="flex w-full flex-col items-center">
      {/* Roof */}
      <div
        style={{
          width: HOUSE_STYLE.fullWidth,
          maxWidth,
          position: "relative",
          marginBottom: -2,
        }}
      >
        <div
          aria-hidden
          style={{
            height: 0,
            margin: "0 -10px",
            borderLeft: HOUSE_STYLE.roofEdge,
            borderRight: HOUSE_STYLE.roofEdge,
            borderBottom: "38px solid",
            borderBottomColor: "#4a5568",
            filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.35))",
          }}
        />
        <div
          aria-hidden
          style={{
            position: HOUSE_STYLE.absolute,
            right: "22%",
            bottom: 0,
            width: HOUSE_STYLE.chimneyWidth,
            height: HOUSE_STYLE.chimneyHeight,
            background: "linear-gradient(180deg,#6b5744,#5d4a38)",
            borderRadius: "3px 3px 0 0",
            boxShadow: "0 2px 4px rgba(0,0,0,0.35)",
          }}
        >
          <div
            style={{
              position: HOUSE_STYLE.absolute,
              top: -3,
              left: -2,
              right: -2,
              height: 4,
              background: "#4a3c30",
              borderRadius: 2,
            }}
          />
        </div>
      </div>
      {/* House body */}
      <div
        style={{
          width: HOUSE_STYLE.fullWidth,
          maxWidth,
          background: "linear-gradient(180deg,#7a6450,#6b5744)",
          padding: 3,
          borderRadius: HOUSE_STYLE.bodyRadius,
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        }}
      >
        <div
          style={{
            display: HOUSE_STYLE.grid,
            gridTemplateColumns: HOUSE_STYLE.columns,
            gap: 2,
            marginBottom: 2,
          }}
        >
          <RoomCell {...cellProps("office", roomHeight)} />
          <RoomCell {...cellProps("bedroom", roomHeight)} />
        </div>
        <div
          aria-hidden
          style={{
            height: 4,
            background:
              "linear-gradient(180deg,#5d4a38 0%,#4a3c30 50%,#3d3226 100%)",
            marginBottom: 2,
            borderRadius: 1,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        />
        <div
          style={{ display: HOUSE_STYLE.grid, gridTemplateColumns: HOUSE_STYLE.columns, gap: 2 }}
        >
          <RoomCell {...cellProps("living-room", roomHeight)} />
          <RoomCell {...cellProps("kitchen", roomHeight)} />
        </div>
      </div>
      {/* Foundation */}
      <div
        aria-hidden
        style={{
          width: HOUSE_STYLE.fullWidth,
          maxWidth,
          height: 6,
          background: "linear-gradient(to bottom,#3d3228,#2e261f)",
          borderRadius: HOUSE_STYLE.bodyRadius,
          boxShadow: "0 3px 8px rgba(0,0,0,0.4)",
        }}
      />
      {/* Porch */}
      <div style={{ width: HOUSE_STYLE.fullWidth, maxWidth, marginTop: 5 }}>
        <div
          style={{
            fontSize: 8,
            fontWeight: HOUSE_STYLE.porchLabelWeight,
            color: "#64748b",
            letterSpacing: "0.14em",
            marginBottom: 2,
            textAlign: "center",
          }}
          className="opacity-70"
        >
          EXTERIOR · FRONT PORCH
        </div>
        <RoomCell {...cellProps("entry-exterior", porchHeight)} />
        <div
          aria-hidden
          style={{
            height: 4,
            background: "linear-gradient(to bottom,#4a5040,#3d4438)",
            borderRadius: "0 0 4px 4px",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        />
      </div>
      <div
        aria-hidden
        style={{
          width: HOUSE_STYLE.fullWidth,
          maxWidth,
          height: 2,
          marginTop: 5,
          background:
            "linear-gradient(90deg,transparent,#334155,#334155,transparent)",
          borderRadius: 1,
          opacity: 0.5,
        }}
      />
    </div>
  );
}
