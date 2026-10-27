import {
  DifficultyValue,
  type Difficulty,
} from "../../shared/types";

export enum ZoneIdValue {
  Main = "main",
  Guest = "guest",
  IoT = "iot",
}

export type ZoneId = `${ZoneIdValue}`;

export enum RoomIdValue {
  Office = "office",
  LivingRoom = "living-room",
  Kitchen = "kitchen",
  Bedroom = "bedroom",
  EntryExterior = "entry-exterior",
}

export type RoomId = `${RoomIdValue}`;

export type Zone = {
  id: ZoneId;
  name: string;
  shortName: string;
  description: string;
};

export type Room = {
  id: RoomId;
  name: string;
  description: string;
};

export const ZONES: Zone[] = [
  {
    id: ZoneIdValue.Main,
    name: "Main Network",
    shortName: "Main",
    description:
      "For personal and work devices you trust and use every day.",
  },
  {
    id: ZoneIdValue.Guest,
    name: "Guest Network",
    shortName: "Guest",
    description:
      "For visitors and devices that only need temporary internet access.",
  },
  {
    id: ZoneIdValue.IoT,
    name: "Smart Devices / IoT",
    shortName: "IoT",
    description:
      "For TVs, cameras, speakers, and other smart devices that do not need access to personal or work devices.",
  },
];

export const ROOMS: Room[] = [
  {
    id: RoomIdValue.Office,
    name: "Office",
    description:
      "A workspace for computers, printers, and other office devices.",
  },
  {
    id: RoomIdValue.LivingRoom,
    name: "Living Room",
    description: "A shared space for TVs, consoles, speakers, and personal devices.",
  },
  {
    id: RoomIdValue.Kitchen,
    name: "Kitchen",
    description: "A utility space for appliances and smart devices.",
  },
  {
    id: RoomIdValue.Bedroom,
    name: "Bedroom",
    description: "A personal space where phones and tablets are often used.",
  },
  {
    id: RoomIdValue.EntryExterior,
    name: "Entry / Exterior",
    description: "An outdoor area for doorbells, cameras, and other entry devices.",
  },
];

export const ROOM_ZONE_ASSIGNMENTS: Record<
  Difficulty,
  Record<RoomId, ZoneId | null>
> = {
  [DifficultyValue.Easy]: {
    [RoomIdValue.Office]: ZoneIdValue.Main,
    [RoomIdValue.Bedroom]: ZoneIdValue.Main,
    [RoomIdValue.LivingRoom]: ZoneIdValue.IoT,
    [RoomIdValue.Kitchen]: ZoneIdValue.IoT,
    [RoomIdValue.EntryExterior]: ZoneIdValue.IoT,
  },
  [DifficultyValue.Medium]: {
    [RoomIdValue.Office]: ZoneIdValue.Main,
    [RoomIdValue.LivingRoom]: ZoneIdValue.IoT,
    [RoomIdValue.Bedroom]: null,
    [RoomIdValue.Kitchen]: null,
    [RoomIdValue.EntryExterior]: null,
  },
  [DifficultyValue.Hard]: {
    [RoomIdValue.Office]: null,
    [RoomIdValue.LivingRoom]: null,
    [RoomIdValue.Bedroom]: null,
    [RoomIdValue.Kitchen]: null,
    [RoomIdValue.EntryExterior]: null,
  },
};

const ZONE_BY_ID: Record<ZoneId, Zone> = ZONES.reduce(
  (acc, z) => {
    acc[z.id] = z;
    return acc;
  },
  {} as Record<ZoneId, Zone>,
);

const ROOM_BY_ID: Record<RoomId, Room> = ROOMS.reduce(
  (acc, r) => {
    acc[r.id] = r;
    return acc;
  },
  {} as Record<RoomId, Room>,
);

export function getZone(id: ZoneId): Zone {
  return ZONE_BY_ID[id];
}

export function getRoom(id: RoomId): Room {
  return ROOM_BY_ID[id];
}

export function getRoomZone(
  difficulty: Difficulty,
  roomId: RoomId,
): ZoneId | null {
  return ROOM_ZONE_ASSIGNMENTS[difficulty][roomId];
}
