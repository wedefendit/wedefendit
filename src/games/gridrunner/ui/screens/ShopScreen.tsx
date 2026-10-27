"use client";

import { useState } from "react";
import type { PlayerState } from "../../engine/types";
import { SHOP_ITEMS, type ShopItem } from "../../engine/shop";
import { getBaseTool } from "../../engine/loot";
import { OverlayShell } from "../shared/OverlayShell";
import { TOOL_TYPE_PRESENTATION } from "../shared/theme";

const FLASH_TIMING = { errorMs: 1500, successMs: 1200 };

function purchaseButtonLabel(
  levelLocked: boolean,
  inventoryFull: boolean,
  price: number,
): string {
  if (levelLocked) return "---";
  return inventoryFull ? "FULL" : `BUY ${price}`;
}

function purchaseFailureMessage(tooPoor: boolean, inventoryFull: boolean): string {
  if (tooPoor) return "NOT ENOUGH BITS";
  return inventoryFull ? "INVENTORY FULL" : "LEVEL TOO LOW";
}

type ShopScreenProps = Readonly<{
  onClose: () => void;
  player: PlayerState;
  bits: number;
  inventoryFull: boolean;
  onBuy: (baseToolId: string) => void;
}>;

function ShopRow({
  item, player, bits, inventoryFull, onBuy, flashMsg,
}: Readonly<{
  item: ShopItem;
  player: PlayerState;
  bits: number;
  inventoryFull: boolean;
  onBuy: (baseToolId: string) => void;
  flashMsg: string | null;
}>) {
  const base = getBaseTool(item.baseToolId);
  if (!base) return null;
  const typePresentation = TOOL_TYPE_PRESENTATION[base.type];

  const levelLocked = player.level < item.minLevel;
  const tooPoor = bits < item.price;
  const disabled = levelLocked || tooPoor || inventoryFull;

  return (
    <div className={`rounded-sm border bg-[#0f1b2d] p-2.5 ${typePresentation.badgeClass.split(" ")[1]}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-[#e0e0e0]">{base.name}</span>
        <span className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-bold tracking-widest ${typePresentation.badgeClass}`}>
          {typePresentation.label}
        </span>
      </div>
      {levelLocked ? (
        <p className="mt-1 text-xs text-[#ff6b00]">UNLOCKED AT LEVEL {item.minLevel}</p>
      ) : (
        <>
          <p className="mt-0.5 text-xs text-[#aabbcc]">PWR {base.basePower} / ACC {base.baseAccuracy}% / EN {base.baseEnergy}</p>
          <p className="mt-0.5 text-xs text-[#8899aa]">{base.description}</p>
        </>
      )}
      <div className="mt-1.5 flex items-center justify-between">
        <span className="gr-font-mono text-[10px] text-[#8899aa]">{flashMsg ?? ""}</span>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onBuy(item.baseToolId)}
          data-testid={`gr-shop-buy-${item.baseToolId}`}
          className="gr-font-mono min-h-[32px] rounded-sm border border-[#00f0ff] bg-[#0f1b2d] px-3 py-1 text-xs font-bold tracking-widest text-[#00f0ff] active:brightness-150 disabled:border-[#1a3a4a] disabled:text-[#4a5568]"
        >
          {purchaseButtonLabel(levelLocked, inventoryFull, item.price)}
        </button>
      </div>
    </div>
  );
}

export function ShopScreen({ onClose, player, bits, inventoryFull, onBuy }: ShopScreenProps) {
  const [flash, setFlash] = useState<{ id: string; msg: string } | null>(null);

  function handleBuy(baseToolId: string) {
    const item = SHOP_ITEMS.find((s) => s.baseToolId === baseToolId);
    if (!item) return;
    if (player.level < item.minLevel || bits < item.price || inventoryFull) {
      setFlash({
        id: baseToolId,
        msg: purchaseFailureMessage(bits < item.price, inventoryFull),
      });
      globalThis.setTimeout(() => setFlash(null), FLASH_TIMING.errorMs);
      return;
    }
    onBuy(baseToolId);
    setFlash({ id: baseToolId, msg: "PURCHASED" });
    globalThis.setTimeout(() => setFlash(null), FLASH_TIMING.successMs);
  }

  return (
    <OverlayShell
      testId="gr-shop-overlay"
      title="TOOL SHOP"
      onClose={onClose}
      headerRight={<span className="gr-font-mono text-xs text-[#ff9500]">{bits} Bits</span>}
    >
      {SHOP_ITEMS.map((item) => (
        <ShopRow
          key={item.baseToolId}
          item={item}
          player={player}
          bits={bits}
          inventoryFull={inventoryFull}
          onBuy={handleBuy}
          flashMsg={flash?.id === item.baseToolId ? flash.msg : null}
        />
      ))}
    </OverlayShell>
  );
}
