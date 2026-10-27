import {
  RarityValue,
  ToolTypeValue,
  type Rarity,
  type ToolInstance,
  type ToolType,
} from "./types";

export enum BaseToolIdValue { Nmap = "nmap", Wireshark = "wireshark", Metasploit = "metasploit", FirewallRule = "firewall-rule", BurpSuite = "burp-suite", YaraRules = "yara-rules", Mimikatz = "mimikatz", Hashcat = "hashcat", Ghidra = "ghidra", CobaltStrike = "cobalt-strike", SnortSuricata = "snort-suricata", ZeroDay = "zero-day" }
export type BaseToolId = `${BaseToolIdValue}`;

interface BaseToolDef {
  id: BaseToolId;
  name: string;
  type: ToolType;
  basePower: number;
  baseAccuracy: number;
  baseEnergy: number;
  description: string;
}

const BASE_TOOLS: BaseToolDef[] = [
  {
    id: BaseToolIdValue.Nmap,
    name: "Nmap",
    type: ToolTypeValue.Recon,
    basePower: 15,
    baseAccuracy: 95,
    baseEnergy: 5,
    description: "Scans networks for open ports and services",
  },
  {
    id: BaseToolIdValue.Wireshark,
    name: "Wireshark",
    type: ToolTypeValue.Recon,
    basePower: 10,
    baseAccuracy: 100,
    baseEnergy: 3,
    description: "Analyzes network traffic",
  },
  {
    id: BaseToolIdValue.Metasploit,
    name: "Metasploit",
    type: ToolTypeValue.Exploit,
    basePower: 35,
    baseAccuracy: 75,
    baseEnergy: 15,
    description: "Tests vulnerabilities by running controlled exploits",
  },
  {
    id: BaseToolIdValue.FirewallRule,
    name: "Firewall Rule",
    type: ToolTypeValue.Defense,
    basePower: 12,
    baseAccuracy: 85,
    baseEnergy: 8,
    description: "Controls network traffic and can block unwanted connections",
  },
  {
    id: BaseToolIdValue.BurpSuite,
    name: "Burp Suite",
    type: ToolTypeValue.Recon,
    basePower: 25,
    baseAccuracy: 90,
    baseEnergy: 10,
    description: "Tests web applications for security weaknesses",
  },
  {
    id: BaseToolIdValue.YaraRules,
    name: "YARA Rules",
    type: ToolTypeValue.Defense,
    basePower: 0,
    baseAccuracy: 90,
    baseEnergy: 6,
    description: "Matches files against patterns used to identify malware",
  },
  {
    id: BaseToolIdValue.Mimikatz,
    name: "Mimikatz",
    type: ToolTypeValue.Persistence,
    basePower: 40,
    baseAccuracy: 80,
    baseEnergy: 18,
    description: "Extracts credentials from Windows memory",
  },
  {
    id: BaseToolIdValue.Hashcat,
    name: "Hashcat",
    type: ToolTypeValue.Exploit,
    basePower: 30,
    baseAccuracy: 85,
    baseEnergy: 12,
    description: "Tests password hashes by trying possible passwords",
  },
  {
    id: BaseToolIdValue.Ghidra,
    name: "Ghidra",
    type: ToolTypeValue.Recon,
    basePower: 20,
    baseAccuracy: 95,
    baseEnergy: 8,
    description: "Analyzes compiled software",
  },
  {
    id: BaseToolIdValue.CobaltStrike,
    name: "Cobalt Strike",
    type: ToolTypeValue.Exploit,
    basePower: 45,
    baseAccuracy: 70,
    baseEnergy: 20,
    description: "Simulates adversary activity and command-and-control operations",
  },
  {
    id: BaseToolIdValue.SnortSuricata,
    name: "Snort/Suricata",
    type: ToolTypeValue.Defense,
    basePower: 0,
    baseAccuracy: 88,
    baseEnergy: 12,
    description: "Detects and, in some configurations, blocks suspicious network traffic",
  },
  {
    id: BaseToolIdValue.ZeroDay,
    name: "Zero-Day",
    type: ToolTypeValue.Exploit,
    basePower: 60,
    baseAccuracy: 50,
    baseEnergy: 30,
    description: "Represents a vulnerability without an available fix",
  },
];

interface RarityDef {
  multiplierMin: number;
  multiplierMax: number;
  dropWeight: number;
  label: string;
  textClass: string;
  borderClass: string;
  scrapValue: number;
}

export const RARITY_DEFINITIONS: Record<Rarity, RarityDef> = {
  [RarityValue.Common]: { multiplierMin: 0.8, multiplierMax: 1.0, dropWeight: 55, label: "Common", textClass: "text-[#e0e0e0]", borderClass: "border-[#e0e0e0]/30", scrapValue: 3 },
  [RarityValue.Uncommon]: { multiplierMin: 0.9, multiplierMax: 1.15, dropWeight: 25, label: "Uncommon", textClass: "text-[#00ff41]", borderClass: "border-[#00ff41]/30", scrapValue: 8 },
  [RarityValue.Rare]: { multiplierMin: 1.0, multiplierMax: 1.3, dropWeight: 13, label: "Rare", textClass: "text-[#4da6ff]", borderClass: "border-[#4da6ff]/30", scrapValue: 20 },
  [RarityValue.Epic]: { multiplierMin: 1.1, multiplierMax: 1.5, dropWeight: 5, label: "Epic", textClass: "text-[#a855f7]", borderClass: "border-[#a855f7]/30", scrapValue: 50 },
  [RarityValue.Legendary]: { multiplierMin: 1.3, multiplierMax: 1.7, dropWeight: 2, label: "Legendary", textClass: "text-[#ff9500]", borderClass: "border-[#ff9500]/30", scrapValue: 120 },
};

const RARITY_ORDER: Rarity[] = Object.values(RarityValue);
const RARITY_UNLOCKS: ReadonlyArray<Readonly<{ minLevel: number; rarity: Rarity }>> = [
  { minLevel: 15, rarity: RarityValue.Legendary },
  { minLevel: 10, rarity: RarityValue.Epic },
  { minLevel: 5, rarity: RarityValue.Rare },
  { minLevel: 3, rarity: RarityValue.Uncommon },
];
const TOOL_LIMITS = { accuracy: 100 };

function maxRarityForLevel(level: number): Rarity {
  return (
    RARITY_UNLOCKS.find((unlock) => level >= unlock.minLevel)?.rarity ??
    RarityValue.Common
  );
}

function rollRarity(playerLevel: number): Rarity {
  const maxIdx = RARITY_ORDER.indexOf(maxRarityForLevel(playerLevel));
  const available = RARITY_ORDER.slice(0, maxIdx + 1);

  let totalWeight = 0;
  for (const r of available) {
    totalWeight += RARITY_DEFINITIONS[r].dropWeight;
  }

  let roll = Math.random() * totalWeight;
  for (const r of available) {
    roll -= RARITY_DEFINITIONS[r].dropWeight;
    if (roll <= 0) return r;
  }
  return RarityValue.Common;
}

let instanceCounter = 0;

function rollStat(base: number, rarity: Rarity): number {
  const def = RARITY_DEFINITIONS[rarity];
  const mult =
    def.multiplierMin + Math.random() * (def.multiplierMax - def.multiplierMin);
  return Math.max(1, Math.round(base * mult));
}

function rollEnergy(base: number, rarity: Rarity): number {
  const def = RARITY_DEFINITIONS[rarity];
  const mult =
    def.multiplierMax - Math.random() * (def.multiplierMax - def.multiplierMin);
  return Math.max(1, Math.round(base * mult));
}

export function generateTool(playerLevel: number): ToolInstance {
  const baseTool = BASE_TOOLS[Math.floor(Math.random() * BASE_TOOLS.length)];
  const rarity = rollRarity(playerLevel);

  instanceCounter += 1;
  const id = `${baseTool.id}-${Date.now()}-${instanceCounter}`;

  return {
    id,
    baseToolId: baseTool.id,
    rarity,
    power: rollStat(baseTool.basePower, rarity),
    accuracy: Math.min(
      TOOL_LIMITS.accuracy,
      rollStat(baseTool.baseAccuracy, rarity),
    ),
    energyCost: rollEnergy(baseTool.baseEnergy, rarity),
    prefix: null,
    suffix: null,
    type: baseTool.type,
  };
}

export function rollLootDrop(
  playerLevel: number,
  isBoss: boolean,
): ToolInstance | null {
  if (!isBoss && Math.random() > 0.6) return null;
  return generateTool(playerLevel);
}

export function createCommonTool(baseId: string): ToolInstance | null {
  const baseTool = BASE_TOOLS.find((t) => t.id === baseId);
  if (!baseTool) return null;
  instanceCounter += 1;
  return {
    id: `${baseTool.id}-${Date.now()}-${instanceCounter}`,
    baseToolId: baseTool.id,
    rarity: RarityValue.Common,
    power: baseTool.basePower,
    accuracy: baseTool.baseAccuracy,
    energyCost: baseTool.baseEnergy,
    prefix: null,
    suffix: null,
    type: baseTool.type,
  };
}

export function getBaseTool(baseId: string): {
  id: string;
  name: string;
  type: ToolType;
  basePower: number;
  baseAccuracy: number;
  baseEnergy: number;
  description: string;
} | null {
  return BASE_TOOLS.find((t) => t.id === baseId) ?? null;
}

const TOOL_NAMES: Record<string, string> = {};
for (const t of BASE_TOOLS) {
  TOOL_NAMES[t.id] = t.name;
}

export function toolDisplayName(tool: ToolInstance): string {
  const name = TOOL_NAMES[tool.baseToolId] ?? tool.baseToolId;
  return `${RARITY_DEFINITIONS[tool.rarity].label} ${name}`;
}

export function getToolInfo(
  baseToolId: string,
): { name: string; description: string; type: ToolType } | null {
  const def = BASE_TOOLS.find((t) => t.id === baseToolId);
  if (!def) return null;
  return { name: def.name, description: def.description, type: def.type };
}
