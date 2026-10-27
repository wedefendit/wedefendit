import { ToolTypeValue, type ToolType } from "../../engine/types";

export const GRIDRUNNER_DETAIL_TEXT_CLASS = "text-xs text-[#aabbcc]";

export const TOOL_TYPE_PRESENTATION: Record<ToolType, Readonly<{
  textClass: string;
  badgeClass: string;
  label: string;
  title: string;
  strong: string;
  weak: string;
  chartDescription: string;
  toolDescription: string;
}>> = {
  [ToolTypeValue.Recon]: { textClass: "text-[#00f0ff]", badgeClass: "text-[#00f0ff] border-[#00f0ff]/40", label: "RECON", title: "Recon", strong: "Persistence (1.5x)", weak: "Defense (0.75x)", chartDescription: "Scanning and information gathering. Know your target before you strike.", toolDescription: "Security teams use reconnaissance to map systems and identify weaknesses. In battle, Recon is strong against Persistence but weak against Defense." },
  [ToolTypeValue.Exploit]: { textClass: "text-[#ff5c72]", badgeClass: "text-[#ff5c72] border-[#ff5c72]/40", label: "EXPLOIT", title: "Exploit", strong: "Defense (1.5x)", weak: "Persistence (0.75x)", chartDescription: "Direct attacks that break through defenses. High risk, high reward.", toolDescription: "Penetration testers use controlled exploits to confirm that a vulnerability can be used. In battle, Exploit is strong against Defense but weak against Persistence." },
  [ToolTypeValue.Defense]: { textClass: "text-[#00ff41]", badgeClass: "text-[#00ff41] border-[#00ff41]/40", label: "DEFENSE", title: "Defense", strong: "Exploit (1.5x)", weak: "Recon (0.75x)", chartDescription: "Shields and detection. Blocks incoming attacks and reveals threats.", toolDescription: "Defensive tools help block, detect, and investigate attacks. In battle, Defense is strong against Exploit but weak against Recon." },
  [ToolTypeValue.Persistence]: { textClass: "text-[#ff00de]", badgeClass: "text-[#a855f7] border-[#a855f7]/40", label: "PERSIST", title: "Persistence", strong: "Recon (1.5x)", weak: "Exploit (0.75x)", chartDescription: "Maintaining access. Slow damage over time that is hard to remove.", toolDescription: "Threat actors use persistence techniques to maintain access after a compromise. In battle, Persistence is strong against Recon but weak against Exploit." },
};

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
