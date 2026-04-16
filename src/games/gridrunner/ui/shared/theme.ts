/*
Copyright © 2026 Defend I.T. Solutions LLC. All Rights Reserved.
*/

/* ------------------------------------------------------------------ */
/*  Color tokens — single source of truth for all GRIDRUNNER UI       */
/* ------------------------------------------------------------------ */

export const GR = {
  bgDeep: "#0a0e1a",
  bgPanel: "#0f1b2d",
  bgDarker: "#080c16",
  bgInput: "#0a1220",
  bgLog: "#060a12",
  bgMeter: "#0d1520",
  border: "#1a3a4a",
  borderCyan: "#00f0ff",
  cyan: "#00f0ff",
  magenta: "#ff00de",
  orange: "#ff6b00",
  red: "#ff003c",
  green: "#00ff41",
  discRed: "#ff5c72",
  text: "#e0e0e0",
  textDim: "#aabbcc",
  textMuted: "#8899aa",
  textDisabled: "#4a5568",
  textBright: "#d0d8e0",
  lootOrange: "#ff9500",
  lootPurple: "#a855f7",
  lootBlue: "#4da6ff",
} as const;

/* ------------------------------------------------------------------ */
/*  Rarity color maps                                                 */
/* ------------------------------------------------------------------ */

export const RARITY_TEXT: Record<string, string> = {
  common: "text-[#e0e0e0]",
  uncommon: "text-[#00ff41]",
  rare: "text-[#4da6ff]",
  epic: "text-[#a855f7]",
  legendary: "text-[#ff9500]",
};

export const RARITY_BORDER: Record<string, string> = {
  common: "border-[#e0e0e0]/30",
  uncommon: "border-[#00ff41]/30",
  rare: "border-[#4da6ff]/30",
  epic: "border-[#a855f7]/30",
  legendary: "border-[#ff9500]/30",
};

export const SCRAP_VALUES: Record<string, number> = {
  common: 3,
  uncommon: 8,
  rare: 20,
  epic: 50,
  legendary: 120,
};

/* ------------------------------------------------------------------ */
/*  Tool type color maps                                              */
/* ------------------------------------------------------------------ */

export const TYPE_TEXT: Record<string, string> = {
  recon: "text-[#00f0ff]",
  exploit: "text-[#ff5c72]",
  defense: "text-[#00ff41]",
  persistence: "text-[#ff00de]",
};

export const TYPE_LABELS: Record<string, string> = {
  recon: "RECON",
  exploit: "EXPLOIT",
  defense: "DEFENSE",
  persistence: "PERSIST",
};

export const TYPE_BADGE: Record<string, string> = {
  recon: "text-[#00f0ff] border-[#00f0ff]/40",
  exploit: "text-[#ff5c72] border-[#ff5c72]/40",
  defense: "text-[#00ff41] border-[#00ff41]/40",
  persistence: "text-[#a855f7] border-[#a855f7]/40",
};

/* ------------------------------------------------------------------ */
/*  Battle log tag colors                                             */
/* ------------------------------------------------------------------ */

export const TAG_COLORS: Record<string, string> = {
  SYS: "text-[#00f0ff]",
  ATK: "text-[#00f0ff]",
  HIT: "text-[#00ff41]",
  MISS: "text-[#aabbcc]",
  DMG: "text-[#ff003c]",
  HEAL: "text-[#ff00de]",
  WIN: "text-[#00ff41]",
  LOSS: "text-[#ff003c]",
  WARN: "text-[#ff6b00]",
  RUN: "text-[#ff6b00]",
};
