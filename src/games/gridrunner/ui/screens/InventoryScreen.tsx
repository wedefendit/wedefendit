import type { ToolInstance } from "../../engine/types";
import { RARITY_DEFINITIONS, toolDisplayName } from "../../engine/loot";
import { OverlayShell } from "../shared/OverlayShell";
import { GRIDRUNNER_DETAIL_TEXT_CLASS, TOOL_TYPE_PRESENTATION } from "../shared/theme";

const INVENTORY_VALUES: Readonly<{ button: "button" }> = { button: "button" };

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
  const slots = equippedTools.map((tool, index) => ({
    tool,
    index,
    number: index + 1,
    rowKey: tool?.id ?? `empty-${index}`,
    actionKey: `slot-${index}`,
  }));
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
        {slots.map((slot) => (
          <div
            key={slot.rowKey}
            className={`rounded-sm border bg-[#0f1b2d] px-2.5 py-2 ${
              slot.tool
                ? RARITY_DEFINITIONS[slot.tool.rarity].borderClass
                : "border-dashed border-[#1a3a4a]"
            }`}
          >
            {slot.tool ? (
              <div className="flex flex-col">
                <span className={`text-sm font-bold ${RARITY_DEFINITIONS[slot.tool.rarity].textClass}`}>
                  Slot {slot.number}: {toolDisplayName(slot.tool)}
                </span>
                <span className={GRIDRUNNER_DETAIL_TEXT_CLASS}>
                  {TOOL_TYPE_PRESENTATION[slot.tool.type].label} · Pwr {slot.tool.power} · Acc {slot.tool.accuracy}% · EN {slot.tool.energyCost}
                </span>
              </div>
            ) : (
              <span className="text-xs text-[#4a5568]">
                Slot {slot.number} · Empty
              </span>
            )}
          </div>
        ))}
      </div>

      <h3 className="mb-1.5 text-xs font-bold tracking-wider text-[#ff6b00]">
        BACKPACK ({inventory.length})
      </h3>
      {inventory.length === 0 ? (
        <p className={GRIDRUNNER_DETAIL_TEXT_CLASS}>
          No items. Win battles to collect loot.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {inventory.map((tool) => (
            <div
              key={tool.id}
              className={`rounded-sm border bg-[#0f1b2d] px-2.5 py-2 ${RARITY_DEFINITIONS[tool.rarity].borderClass}`}
            >
              <div className="flex flex-col gap-1">
                <span className={`text-sm font-bold ${RARITY_DEFINITIONS[tool.rarity].textClass}`}>
                  {toolDisplayName(tool)}
                </span>
                <span className={GRIDRUNNER_DETAIL_TEXT_CLASS}>
                  {TOOL_TYPE_PRESENTATION[tool.type].label} · Pwr {tool.power} · Acc {tool.accuracy}% · EN {tool.energyCost}
                </span>
                <div className="flex flex-wrap gap-1 pt-1">
                  {slots.map((slot) => (
                    <button
                      key={slot.actionKey}
                      type={INVENTORY_VALUES.button}
                      onClick={() => onEquip(tool.id, slot.index)}
                      className="rounded-sm border border-[#00f0ff] bg-[#0a1220] px-2.5 py-1.5 text-xs font-bold text-[#00f0ff] active:brightness-150"
                    >
                      Equip Slot {slot.number}
                    </button>
                  ))}
                  <button
                    type={INVENTORY_VALUES.button}
                    onClick={() => onScrap(tool.id)}
                    className="rounded-sm border border-[#ff003c] bg-[#0a1220] px-2.5 py-1.5 text-xs font-bold text-[#ff003c] active:brightness-150"
                  >
                    Scrap +{RARITY_DEFINITIONS[tool.rarity].scrapValue}
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
