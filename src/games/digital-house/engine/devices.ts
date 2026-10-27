import type { ZoneId } from "./zones";

export enum DeviceIdValue {
  WorkLaptop = "work-laptop",
  PersonalPhone = "personal-phone",
  Tablet = "tablet",
  GuestPhone = "guest-phone",
  Printer = "printer",
  SmartTv = "smart-tv",
  SmartSpeaker = "smart-speaker",
  GameConsole = "game-console",
  DoorbellCamera = "doorbell-camera",
  CameraHub = "camera-hub",
}

export type DeviceId = `${DeviceIdValue}`;

export enum DeviceCategoryValue {
  Trusted = "trusted",
  Guest = "guest",
  GrayArea = "gray-area",
  Entertainment = "entertainment",
  Camera = "camera",
}

export type DeviceCategory = `${DeviceCategoryValue}`;

export type Device = {
  id: DeviceId;
  name: string;
  trayName: string;
  toolbarLabel: string;
  category: DeviceCategory;
  idealZone: ZoneId;
  description: string;
};

export const DEVICES: Device[] = [
  {
    id: DeviceIdValue.WorkLaptop,
    name: "Work laptop",
    trayName: "Work Laptop", toolbarLabel: "Laptop",
    category: DeviceCategoryValue.Trusted, idealZone: "main",
    description:
      "Your main work computer, which contains sensitive accounts and data.",
  },
  {
    id: DeviceIdValue.PersonalPhone,
    name: "Personal phone",
    trayName: "Phone", toolbarLabel: "Phone",
    category: DeviceCategoryValue.Trusted, idealZone: "main",
    description:
      "Your phone, with banking, email, and authentication apps.",
  },
  {
    id: DeviceIdValue.Tablet,
    name: "Tablet",
    trayName: "Tablet", toolbarLabel: "Tab",
    category: DeviceCategoryValue.Trusted, idealZone: "main",
    description:
      "A personal device used for browsing, reading, and light work.",
  },
  {
    id: DeviceIdValue.GuestPhone,
    name: "Guest phone",
    trayName: "Guest Phone", toolbarLabel: "Guest",
    category: DeviceCategoryValue.Guest, idealZone: "guest",
    description:
      "A visitor's device that only needs temporary internet access.",
  },
  {
    id: DeviceIdValue.Printer,
    name: "Printer",
    trayName: "Printer", toolbarLabel: "Print",
    category: DeviceCategoryValue.GrayArea, idealZone: "iot",
    description:
      "A printer that may receive security updates less often than your computer or phone.",
  },
  {
    id: DeviceIdValue.SmartTv,
    name: "Smart TV",
    trayName: "Smart TV", toolbarLabel: "TV",
    category: DeviceCategoryValue.Entertainment, idealZone: "iot",
    description: "A connected TV that runs streaming apps and communicates with online services.",
  },
  {
    id: DeviceIdValue.SmartSpeaker,
    name: "Smart speaker",
    trayName: "Speaker", toolbarLabel: "Spkr",
    category: DeviceCategoryValue.Entertainment, idealZone: "iot",
    description:
      "A voice assistant connected to online services and other smart home devices.",
  },
  {
    id: DeviceIdValue.GameConsole,
    name: "Game console",
    trayName: "Console", toolbarLabel: "Game",
    category: DeviceCategoryValue.Entertainment, idealZone: "iot",
    description: "A console used for gaming, streaming, and voice chat.",
  },
  {
    id: DeviceIdValue.DoorbellCamera,
    name: "Doorbell camera",
    trayName: "Doorbell", toolbarLabel: "Bell",
    category: DeviceCategoryValue.Camera, idealZone: "iot",
    description:
      "An internet-connected camera at your front door.",
  },
  {
    id: DeviceIdValue.CameraHub,
    name: "Camera hub / indoor cameras",
    trayName: "Cameras", toolbarLabel: "Cam",
    category: DeviceCategoryValue.Camera, idealZone: "iot",
    description:
      "Indoor cameras and a hub that stores or manages private video.",
  },
];

const DEVICE_BY_ID: Record<DeviceId, Device> = DEVICES.reduce(
  (acc, d) => {
    acc[d.id] = d;
    return acc;
  },
  {} as Record<DeviceId, Device>,
);

export function getDevice(id: DeviceId): Device {
  return DEVICE_BY_ID[id];
}

export function isTrusted(id: DeviceId): boolean {
  return getDevice(id).category === DeviceCategoryValue.Trusted;
}

export function isCamera(id: DeviceId): boolean {
  return getDevice(id).category === DeviceCategoryValue.Camera;
}

export function isEntertainmentOrCamera(id: DeviceId): boolean {
  const category = getDevice(id).category;
  return (
    category === DeviceCategoryValue.Entertainment ||
    category === DeviceCategoryValue.Camera
  );
}
