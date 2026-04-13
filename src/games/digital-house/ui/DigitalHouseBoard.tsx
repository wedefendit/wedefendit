// import { useEffect, useRef, useState } from "react";
// import type { Device, DeviceId, RoomId, ZoneId } from "../engine";
// import { RoomCell } from "./RoomCell";
// import type { DeviceIconTone } from "./DeviceIcon";

// const HOUSE_NATURAL_W = 480;
// const HOUSE_NATURAL_H = 440;

// export type HouseFrameProps = Readonly<{
//   mobile: boolean;
//   roomZones: Record<RoomId, ZoneId | null>;
//   preassignedZones: Record<RoomId, ZoneId | null>;
//   devicesByRoom: Map<RoomId, Device[]>;
//   hoveredRoom: RoomId | null;
//   riskyRooms: Set<RoomId>;
//   isSelectMode: boolean;
//   onRoomEnter: (roomId: RoomId) => void;
//   onRoomLeave: () => void;
//   onRoomClick: (roomId: RoomId) => void;
//   onRoomDrop: (roomId: RoomId, deviceId: DeviceId) => void;
//   onDeviceClickInRoom: (deviceId: DeviceId) => void;
//   allowDrag: boolean;
//   showZoneControls: boolean;
//   openZoneRoom: RoomId | null;
//   onToggleZoneRoom: (roomId: RoomId) => void;
//   onAssignRoomZone: (roomId: RoomId, zoneId: ZoneId) => void;
//   deviceTone: DeviceIconTone;
//   onTouchDragStart?: (deviceId: DeviceId, e: React.TouchEvent) => void;
// }>;

// export type ScaledHouseFrameProps = Omit<HouseFrameProps, "mobile">;

// /**
//  * Mobile house scaler. Container dimensions are set by the parent via
//  * CSS (flex-1 fills remaining viewport). We just measure our own rect
//  * and compute scale — no querying other elements.
//  */
// export function MobileScaledHouseFrame(props: ScaledHouseFrameProps) {
//   const hostRef = useRef<HTMLDivElement | null>(null);
//   const [scale, setScale] = useState(1);

//   useEffect(() => {
//     const host = hostRef.current;
//     if (!host) return;
//     const measure = () => {
//       const { width, height } = host.getBoundingClientRect();
//       if (width === 0 || height === 0) return;
//       const wScale = (width - 4) / HOUSE_NATURAL_W;
//       const hScale = height / HOUSE_NATURAL_H;
//       setScale(Math.max(0.42, Math.min(1.58, Math.min(wScale, hScale))));
//     };
//     measure();
//     const ro = new globalThis.ResizeObserver(measure);
//     ro.observe(host);
//     return () => ro.disconnect();
//   }, []);

//   return (
//     <div ref={hostRef} className="relative h-full w-full overflow-visible">
//       <div
//         className="absolute left-1/2 top-1/2"
//         style={{
//           width: HOUSE_NATURAL_W,
//           transform: `translate(-50%, -50%) scale(${scale})`,
//           transformOrigin: "center center",
//         }}
//       >
//         <HouseFrame mobile={true} {...props} />
//       </div>
//     </div>
//   );
// }

// /** Desktop house scaler — same approach as before, measures own container. */
// export function ScaledHouseFrame(props: ScaledHouseFrameProps) {
//   const hostRef = useRef<HTMLDivElement | null>(null);
//   const [scale, setScale] = useState(1);

//   useEffect(() => {
//     const host = hostRef.current;
//     if (!host) return;
//     const measure = () => {
//       const rect = host.getBoundingClientRect();
//       if (rect.width === 0) return;
//       const widthScale = (rect.width - 8) / HOUSE_NATURAL_W;
//       const headerHeight = 120;
//       const availHeight = globalThis.innerHeight - headerHeight;
//       const heightCap = availHeight / HOUSE_NATURAL_H;
//       setScale(Math.max(0.5, Math.min(1.58, Math.min(widthScale, heightCap))));
//     };
//     measure();
//     const ro = new globalThis.ResizeObserver(measure);
//     ro.observe(host);
//     globalThis.addEventListener("resize", measure);
//     return () => {
//       ro.disconnect();
//       globalThis.removeEventListener("resize", measure);
//     };
//   }, []);

//   return (
//     <div
//       ref={hostRef}
//       className="relative mx-auto w-full overflow-visible"
//       style={{ height: Math.ceil(HOUSE_NATURAL_H * scale) }}
//     >
//       <div
//         className="absolute left-1/2 top-0"
//         style={{
//           width: HOUSE_NATURAL_W,
//           transform: `translateX(-50%) scale(${scale})`,
//           transformOrigin: "top center",
//         }}
//       >
//         <HouseFrame mobile={false} {...props} />
//       </div>
//     </div>
//   );
// }

// // ---- HouseFrame — the house itself. NOT CHANGED. ----

// export function HouseFrame({
//   roomZones,
//   preassignedZones,
//   devicesByRoom,
//   hoveredRoom,
//   riskyRooms,
//   isSelectMode,
//   onRoomEnter,
//   onRoomLeave,
//   onRoomClick,
//   onRoomDrop,
//   onDeviceClickInRoom,
//   allowDrag,
//   showZoneControls,
//   openZoneRoom,
//   onToggleZoneRoom,
//   onAssignRoomZone,
//   deviceTone,
//   onTouchDragStart,
// }: HouseFrameProps) {
//   const roomHeight = 134;
//   const porchHeight = 80;
//   const maxWidth = 480;

//   const cellProps = (roomId: RoomId, height: number) => ({
//     roomId,
//     zoneId: roomZones[roomId],
//     devices: devicesByRoom.get(roomId) ?? [],
//     isHover: hoveredRoom === roomId,
//     isRisky: riskyRooms.has(roomId),
//     isSelectMode,
//     style: { height },
//     onEnter: () => onRoomEnter(roomId),
//     onLeave: onRoomLeave,
//     onClickPlace: () => onRoomClick(roomId),
//     onDropDevice: (deviceId: DeviceId) => onRoomDrop(roomId, deviceId),
//     onDeviceClick: onDeviceClickInRoom,
//     allowDrag,
//     deviceTone,
//     onTouchDragStart,
//     zoneControl: showZoneControls
//       ? {
//           currentZone: roomZones[roomId],
//           locked: preassignedZones[roomId] !== null,
//           showLock: preassignedZones[roomId] !== null,
//           open: openZoneRoom === roomId,
//           onToggle: () => onToggleZoneRoom(roomId),
//           onAssign: (zoneId: ZoneId) => onAssignRoomZone(roomId, zoneId),
//         }
//       : undefined,
//   });

//   return (
//     <div className="flex w-full flex-col items-center">
//       {/* Roof */}
//       <div
//         style={{
//           width: "100%",
//           maxWidth,
//           position: "relative",
//           marginBottom: -2,
//         }}
//       >
//         <div
//           aria-hidden
//           style={{
//             height: 0,
//             margin: "0 -10px",
//             borderLeft: "40px solid transparent",
//             borderRight: "40px solid transparent",
//             borderBottom: "38px solid",
//             borderBottomColor: "#4a5568",
//             filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.35))",
//           }}
//         />
//         <div
//           aria-hidden
//           style={{
//             position: "absolute",
//             right: "22%",
//             bottom: 0,
//             width: 20,
//             height: 30,
//             background: "linear-gradient(180deg,#6b5744,#5d4a38)",
//             borderRadius: "3px 3px 0 0",
//             boxShadow: "0 2px 4px rgba(0,0,0,0.35)",
//           }}
//         >
//           <div
//             style={{
//               position: "absolute",
//               top: -3,
//               left: -2,
//               right: -2,
//               height: 4,
//               background: "#4a3c30",
//               borderRadius: 2,
//             }}
//           />
//         </div>
//       </div>
//       {/* House body */}
//       <div
//         style={{
//           width: "100%",
//           maxWidth,
//           background: "linear-gradient(180deg,#7a6450,#6b5744)",
//           padding: 3,
//           borderRadius: "0 0 6px 6px",
//           boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
//         }}
//       >
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "1fr 1fr",
//             gap: 2,
//             marginBottom: 2,
//           }}
//         >
//           <RoomCell {...cellProps("office", roomHeight)} />
//           <RoomCell {...cellProps("bedroom", roomHeight)} />
//         </div>
//         <div
//           aria-hidden
//           style={{
//             height: 4,
//             background:
//               "linear-gradient(180deg,#5d4a38 0%,#4a3c30 50%,#3d3226 100%)",
//             marginBottom: 2,
//             borderRadius: 1,
//             boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
//           }}
//         />
//         <div
//           style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
//         >
//           <RoomCell {...cellProps("living-room", roomHeight)} />
//           <RoomCell {...cellProps("kitchen", roomHeight)} />
//         </div>
//       </div>
//       {/* Foundation */}
//       <div
//         aria-hidden
//         style={{
//           width: "100%",
//           maxWidth,
//           height: 6,
//           background: "linear-gradient(to bottom,#3d3228,#2e261f)",
//           borderRadius: "0 0 6px 6px",
//           boxShadow: "0 3px 8px rgba(0,0,0,0.4)",
//         }}
//       />
//       {/* Porch */}
//       <div style={{ width: "100%", maxWidth, marginTop: 5 }}>
//         <div
//           style={{
//             fontSize: 8,
//             fontWeight: 800,
//             color: "#64748b",
//             letterSpacing: "0.14em",
//             marginBottom: 2,
//             textAlign: "center",
//           }}
//           className="opacity-70"
//         >
//           EXTERIOR · FRONT PORCH
//         </div>
//         <RoomCell {...cellProps("entry-exterior", porchHeight)} />
//         <div
//           aria-hidden
//           style={{
//             height: 4,
//             background: "linear-gradient(to bottom,#4a5040,#3d4438)",
//             borderRadius: "0 0 4px 4px",
//             boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
//           }}
//         />
//       </div>
//       <div
//         aria-hidden
//         style={{
//           width: "100%",
//           maxWidth,
//           height: 2,
//           marginTop: 5,
//           background:
//             "linear-gradient(90deg,transparent,#334155,#334155,transparent)",
//           borderRadius: 1,
//           opacity: 0.5,
//         }}
//       />
//     </div>
//   );
// }

import { useEffect, useRef, useState } from "react";
import type { Device, DeviceId, RoomId, ZoneId } from "../engine";
import { RoomCell } from "./RoomCell";
import type { DeviceIconTone } from "./DeviceIcon";

const HOUSE_NATURAL_W = 480;
const HOUSE_NATURAL_H = 440;

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

/**
 * Mobile house scaler. Container dimensions are set by the parent via
 * CSS (flex-1 fills remaining viewport). We just measure our own rect
 * and compute scale — no querying other elements.
 */
export function MobileScaledHouseFrame(props: ScaledHouseFrameProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const measure = () => {
      const { width, height } = host.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      const wScale = (width - 4) / HOUSE_NATURAL_W;
      const hScale = height / HOUSE_NATURAL_H;
      setScale(Math.max(0.42, Math.min(1.58, Math.min(wScale, hScale))));
    };
    measure();
    const ro = new globalThis.ResizeObserver(measure);
    ro.observe(host);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={hostRef} className="relative h-full w-full overflow-visible">
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          width: HOUSE_NATURAL_W,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        <HouseFrame mobile={true} {...props} />
      </div>
    </div>
  );
}

/** Desktop house scaler — same approach as before, measures own container. */
export function ScaledHouseFrame(props: ScaledHouseFrameProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const measure = () => {
      const { width, height } = host.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      const wScale = (width - 8) / HOUSE_NATURAL_W;
      const hScale = height / HOUSE_NATURAL_H;
      setScale(Math.max(0.5, Math.min(1.58, Math.min(wScale, hScale))));
    };
    measure();
    const ro = new globalThis.ResizeObserver(measure);
    ro.observe(host);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={hostRef} className="relative h-full w-full overflow-visible">
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          width: HOUSE_NATURAL_W,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        <HouseFrame mobile={false} {...props} />
      </div>
    </div>
  );
}

// ---- HouseFrame — the house itself. NOT CHANGED. ----

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
          width: "100%",
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
            borderLeft: "40px solid transparent",
            borderRight: "40px solid transparent",
            borderBottom: "38px solid",
            borderBottomColor: "#4a5568",
            filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.35))",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            right: "22%",
            bottom: 0,
            width: 20,
            height: 30,
            background: "linear-gradient(180deg,#6b5744,#5d4a38)",
            borderRadius: "3px 3px 0 0",
            boxShadow: "0 2px 4px rgba(0,0,0,0.35)",
          }}
        >
          <div
            style={{
              position: "absolute",
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
          width: "100%",
          maxWidth,
          background: "linear-gradient(180deg,#7a6450,#6b5744)",
          padding: 3,
          borderRadius: "0 0 6px 6px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
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
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
        >
          <RoomCell {...cellProps("living-room", roomHeight)} />
          <RoomCell {...cellProps("kitchen", roomHeight)} />
        </div>
      </div>
      {/* Foundation */}
      <div
        aria-hidden
        style={{
          width: "100%",
          maxWidth,
          height: 6,
          background: "linear-gradient(to bottom,#3d3228,#2e261f)",
          borderRadius: "0 0 6px 6px",
          boxShadow: "0 3px 8px rgba(0,0,0,0.4)",
        }}
      />
      {/* Porch */}
      <div style={{ width: "100%", maxWidth, marginTop: 5 }}>
        <div
          style={{
            fontSize: 8,
            fontWeight: 800,
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
          width: "100%",
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
