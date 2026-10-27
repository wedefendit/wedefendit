"use client";

import { useState } from "react";
import { ToolTypeValue, type ToolInstance } from "../../engine/types";
import { getToolInfo } from "../../engine/loot";
import { GRIDRUNNER_DETAIL_TEXT_CLASS, TOOL_TYPE_PRESENTATION } from "../shared/theme";

type DiscScreenProps = Readonly<{
  onClose: () => void;
  equippedTools: (ToolInstance | null)[];
  inventory: ToolInstance[];
}>;

enum DiscTabValue { Tools = "tools", Types = "types", Threats = "threats", Killchain = "killchain", Intel = "intel" }
type DiscTab = `${DiscTabValue}`;

const TABS: Readonly<{ id: DiscTab; label: string; available: boolean }>[] = [
  { id: DiscTabValue.Tools, label: "TOOLS", available: true },
  { id: DiscTabValue.Types, label: "TYPES", available: true },
  { id: DiscTabValue.Threats, label: "THREATS", available: false },
  { id: DiscTabValue.Killchain, label: "CHAIN", available: false },
  { id: DiscTabValue.Intel, label: "INTEL", available: false },
];
const DISC_VALUES: Readonly<{ button: "button" }> = { button: "button" };
const TAB_STACK_CLASS = "flex flex-col gap-2";
const EXPANDED_DETAIL_CLASS = "mt-2 border-t border-[#1a3a4a] pt-2";

function tabStatusClass(active: boolean, available: boolean): string {
  if (active) return "border-b-2 border-[#00f0ff] text-[#00f0ff]";
  return available ? "text-[#aabbcc]" : "text-[#4a5568] opacity-50";
}

function ToolsTab({ equippedTools, inventory }: Readonly<{ equippedTools: (ToolInstance | null)[]; inventory: ToolInstance[] }>) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const seen = new Set<string>();
  const uniqueTools: ToolInstance[] = [];
  for (const t of [...equippedTools.filter((t): t is ToolInstance => t !== null), ...inventory]) {
    if (!seen.has(t.baseToolId)) { seen.add(t.baseToolId); uniqueTools.push(t); }
  }

  if (uniqueTools.length === 0) {
    return <p className="text-sm text-[#aabbcc]">No tools discovered yet. Win battles to find tools.</p>;
  }

  return (
    <div className={TAB_STACK_CLASS}>
      <p className={GRIDRUNNER_DETAIL_TEXT_CLASS}>Select a tool to learn about it. These entries cover tools used by security professionals and threat actors.</p>
      {uniqueTools.map((tool) => {
        const info = getToolInfo(tool.baseToolId);
        const isOpen = expanded === tool.baseToolId;
        const typePresentation = TOOL_TYPE_PRESENTATION[tool.type];
        return (
          <button
            key={tool.baseToolId}
            type={DISC_VALUES.button}
            onClick={() => setExpanded(isOpen ? null : tool.baseToolId)}
            className="w-full rounded-sm border border-[#1a3a4a] bg-[#0f1b2d] px-3 py-2.5 text-left transition-colors hover:border-[#00f0ff]/50"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#e0e0e0]">{info?.name ?? tool.baseToolId}</span>
              <span className={`text-xs font-bold ${typePresentation.textClass}`}>{info?.type.toUpperCase() ?? "UNKNOWN"}</span>
            </div>
            <p className="mt-1 text-xs text-[#00f0ff]">{info?.description ?? "Unknown tool"}</p>
            {isOpen && (
              <div className={EXPANDED_DETAIL_CLASS}>
                <p className={GRIDRUNNER_DETAIL_TEXT_CLASS}>{typePresentation.toolDescription}</p>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function TypesTab() {
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <div className={TAB_STACK_CLASS}>
      <p className={GRIDRUNNER_DETAIL_TEXT_CLASS}>Each tool has a type. Match it to the enemy weakness for bonus damage.</p>
      {Object.values(ToolTypeValue).map((type) => {
        const row = TOOL_TYPE_PRESENTATION[type];
        const isOpen = expanded === type;
        return (
          <button
            key={type}
            type={DISC_VALUES.button}
            onClick={() => setExpanded(isOpen ? null : type)}
            className="w-full rounded-sm border border-[#1a3a4a] bg-[#0f1b2d] px-3 py-2.5 text-left transition-colors hover:border-[#00f0ff]/50"
          >
            <span className={`text-sm font-bold ${row.textClass}`}>{row.title}</span>
            <div className="mt-1 flex flex-col gap-0.5 text-xs">
              <span className="text-[#00ff41]">Strong vs {row.strong}</span>
              <span className="text-[#ff5c72]">Weak vs {row.weak}</span>
            </div>
            {isOpen && (
              <div className={EXPANDED_DETAIL_CLASS}>
                <p className={GRIDRUNNER_DETAIL_TEXT_CLASS}>{row.chartDescription}</p>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function DiscScreen({ onClose, equippedTools, inventory }: DiscScreenProps) {
  const [activeTab, setActiveTab] = useState<DiscTab>(DiscTabValue.Tools);
  const activeTabAvailable = TABS.find((tab) => tab.id === activeTab)?.available;

  return (
    <div data-testid="gr-disc-overlay" className="absolute inset-0 z-40 flex flex-col bg-[#0a0e1a]/95">
      <header className="flex shrink-0 items-center justify-between border-b border-[#00f0ff] px-3 py-2">
        <h2 className="gr-font-display text-base font-bold tracking-widest text-[#00f0ff]">IDENTITY DISC</h2>
        <button type={DISC_VALUES.button} onClick={onClose} className="gr-font-mono rounded-sm border border-[#1a3a4a] bg-[#0f1b2d] px-2 py-1 text-xs text-[#aabbcc] active:brightness-150">
          BACK
        </button>
      </header>

      <nav aria-label="Disc sections" className="flex shrink-0 border-b border-[#1a3a4a]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type={DISC_VALUES.button}
            onClick={() => tab.available && setActiveTab(tab.id)}
            className={`gr-font-mono flex-1 px-1 py-2 text-xs font-bold tracking-wider transition-colors ${tabStatusClass(activeTab === tab.id, tab.available)}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="gr-font-mono flex-1 overflow-y-auto p-3">
        {activeTab === DiscTabValue.Tools && <ToolsTab equippedTools={equippedTools} inventory={inventory} />}
        {activeTab === DiscTabValue.Types && <TypesTab />}
        {activeTabAvailable === false && (
          <div className="flex flex-1 items-center justify-center">
            <p className="gr-font-mono text-sm text-[#aabbcc]">LOCKED. Keep playing to unlock.</p>
          </div>
        )}
      </div>

      <p className="gr-font-mono shrink-0 border-t border-[#1a3a4a] px-3 py-1.5 text-center text-xs text-[#aabbcc]">
        Press B to go back
      </p>
    </div>
  );
}
