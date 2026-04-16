/*
Copyright © 2026 Defend I.T. Solutions LLC. All Rights Reserved.
*/

import type { ToolInstance } from "../../engine/types";
import { toolDisplayName } from "../../engine/loot";
import { OverlayShell } from "../shared/OverlayShell";
import { RARITY_TEXT, RARITY_BORDER, SCRAP_VALUES, TYPE_LABELS } from "../shared/theme";

type InventoryScreenProps = Readonly<{
  onClose: () => void;
  equippedTools: (ToolInstance | null)[];
  inventory: ToolInstance[];
  onEquip: (toolId: string, slotIndex: number) => void;
  onScrap: (toolId: string) => void;
}>;

export function InventoryScreen({
  onClose,
  equippedTools,
  inventory,
  onEquip,
  onScrap,
}: InventoryScreenProps) {
  return (
    <OverlayShell
      testId="gr-inventory-overlay"
      title="INVENTORY"
      onClose={onClose}
      closeLabel="BACK"
    >
      <h3 className="mb-1.5 text-xs font-bold tracking-wider text-[#00f0ff]">
        EQUIPPED
      </h3>
      <div className="mb-3 flex flex-col gap-1">
        {equippedTools.map((tool, i) => (
          <div
            key={tool?.id ?? `empty-${i}`}
            className={`rounded-sm border bg-[#0f1b2d] px-2.5 py-2 ${
              tool
                ? RARITY_BORDER[tool.rarity]
                : "border-dashed border-[#1a3a4a]"
            }`}
          >
            {tool ? (
              <div className="flex flex-col">
                <span className={`text-sm font-bold ${RARITY_TEXT[tool.rarity]}`}>
                  Slot {i + 1}: {toolDisplayName(tool)}
                </span>
                <span className="text-xs text-[#aabbcc]">
                  {TYPE_LABELS[tool.type]} -- Pwr {tool.power} / Acc {tool.accuracy}% / EN {tool.energyCost}
                </span>
              </div>
            ) : (
              <span className="text-xs text-[#4a5568]">
                Slot {i + 1} -- Empty
              </span>
            )}
          </div>
        ))}
      </div>

      <h3 className="mb-1.5 text-xs font-bold tracking-wider text-[#ff6b00]">
        BACKPACK ({inventory.length})
      </h3>
      {inventory.length === 0 ? (
        <p className="text-xs text-[#aabbcc]">
          No items. Win battles to collect loot.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {inventory.map((tool) => (
            <div
              key={tool.id}
              className={`rounded-sm border bg-[#0f1b2d] px-2.5 py-2 ${RARITY_BORDER[tool.rarity]}`}
            >
              <div className="flex flex-col gap-1">
                <span className={`text-sm font-bold ${RARITY_TEXT[tool.rarity]}`}>
                  {toolDisplayName(tool)}
                </span>
                <span className="text-xs text-[#aabbcc]">
                  {TYPE_LABELS[tool.type]} -- Pwr {tool.power} / Acc {tool.accuracy}% / EN {tool.energyCost}
                </span>
                <div className="flex flex-wrap gap-1 pt-1">
                  {equippedTools.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onEquip(tool.id, i)}
                      className="rounded-sm border border-[#00f0ff] bg-[#0a1220] px-2.5 py-1.5 text-xs font-bold text-[#00f0ff] active:brightness-150"
                    >
                      Equip Slot {i + 1}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => onScrap(tool.id)}
                    className="rounded-sm border border-[#ff003c] bg-[#0a1220] px-2.5 py-1.5 text-xs font-bold text-[#ff003c] active:brightness-150"
                  >
                    Scrap +{SCRAP_VALUES[tool.rarity] ?? 3}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </OverlayShell>
  );
}
