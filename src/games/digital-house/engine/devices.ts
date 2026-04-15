/*
Copyright © 2026 Defend I.T. Solutions LLC. All Rights Reserved.

This software and its source code are the proprietary property of
Defend I.T. Solutions LLC and are protected by United States and
international copyright laws. Unauthorized reproduction, distribution,
modification, display, or use of this software, in whole or in part, without the
prior written permission of Defend I.T. Solutions LLC, is strictly prohibited.

This software is provided for use only by authorized employees, contractors, or
licensees of Defend I.T. Solutions LLC and may not be disclosed to any third
party without express written consent.
*/

export type DeviceId =
  | "work-laptop"
  | "personal-phone"
  | "tablet"
  | "guest-phone"
  | "printer"
  | "smart-tv"
  | "smart-speaker"
  | "game-console"
  | "doorbell-camera"
  | "camera-hub";

export type DeviceCategory =
  | "trusted"
  | "guest"
  | "gray-area"
  | "entertainment"
  | "camera";

export type Device = {
  id: DeviceId;
  name: string;
  shortName: string;
  category: DeviceCategory;
  description: string;
};

export const DEVICES: Device[] = [
  {
    id: "work-laptop",
    name: "Work laptop",
    shortName: "Laptop",
    category: "trusted",
    description:
      "Your primary work machine. Handles sensitive accounts and data.",
  },
  {
    id: "personal-phone",
    name: "Personal phone",
    shortName: "Phone",
    category: "trusted",
    description:
      "Your daily driver with banking, email, and authenticator apps.",
  },
  {
    id: "tablet",
    name: "Tablet",
    shortName: "Tablet",
    category: "trusted",
    description:
      "A personal device you use for reading, browsing, and light work.",
  },
  {
    id: "guest-phone",
    name: "Guest phone",
    shortName: "Guest",
    category: "guest",
    description:
      "A visitor's device that only needs short-term internet access.",
  },
  {
    id: "printer",
    name: "Printer",
    shortName: "Printer",
    category: "gray-area",
    description:
      "A home printer. Works anywhere, but rarely patched and often a quiet weak spot.",
  },
  {
    id: "smart-tv",
    name: "Smart TV",
    shortName: "TV",
    category: "entertainment",
    description: "A connected TV with streaming apps and built-in microphones.",
  },
  {
    id: "smart-speaker",
    name: "Smart speaker",
    shortName: "Speaker",
    category: "entertainment",
    description:
      "An always-listening voice assistant tied to other smart home gear.",
  },
  {
    id: "game-console",
    name: "Game console",
    shortName: "Console",
    category: "entertainment",
    description: "A console used for games, streaming, and chat.",
  },
  {
    id: "doorbell-camera",
    name: "Doorbell camera",
    shortName: "Doorbell",
    category: "camera",
    description:
      "An exterior camera covering the front entry. Internet-facing by design.",
  },
  {
    id: "camera-hub",
    name: "Camera hub / indoor cameras",
    shortName: "Cameras",
    category: "camera",
    description:
      "Indoor cameras and the hub that records them. Private video inside the home.",
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

export const TRUSTED_DEVICE_IDS: DeviceId[] = [
  "work-laptop",
  "personal-phone",
  "tablet",
];

export const ENTERTAINMENT_AND_CAMERA_IDS: DeviceId[] = [
  "smart-tv",
  "smart-speaker",
  "game-console",
  "doorbell-camera",
  "camera-hub",
];

export const CAMERA_IDS: DeviceId[] = ["doorbell-camera", "camera-hub"];

export function isTrusted(id: DeviceId): boolean {
  return TRUSTED_DEVICE_IDS.includes(id);
}

export function isCamera(id: DeviceId): boolean {
  return CAMERA_IDS.includes(id);
}

export function isEntertainmentOrCamera(id: DeviceId): boolean {
  return ENTERTAINMENT_AND_CAMERA_IDS.includes(id);
}
