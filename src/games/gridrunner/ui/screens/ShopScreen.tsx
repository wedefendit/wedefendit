/*
Copyright © 2026 Defend I.T. Solutions LLC. All Rights Reserved.
*/

import { useState } from "react";
import type { PlayerState } from "../../engine/types";
import { SHOP_ITEMS, type ShopItem } from "../../engine/shop";
import { getBaseTool } from "../../engine/loot";

type ShopScreenProps = Readonly<{
  onClose: () => void;
  player: PlayerState;
  bits: number;
  inventoryFull: boolean;
  onBuy: (baseToolId: string) => void;
}>;

const TYPE_COLORS: Record<string, string> = {
  recon: "text-[#00f0ff] border-[#00f0ff]/40",
  exploit: "text-[#ff5c72] border-[#ff5c72]/40",
  defense: "text-[#00ff41] border-[#00ff41]/40",
  persistence: "text-[#a855f7] border-[#a855f7]/40",
};

const TYPE_LABELS: Record<string, string> = {
  recon: "RECON",
  exploit: "EXPLOIT",
  defense: "DEFENSE",
  persistence: "PERSIST",
};

function ShopRow({
  item,
  player,
  bits,
  inventoryFull,
  onBuy,
  flashMsg,
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

  const levelLocked = player.level < item.minLevel;
  const tooPoor = bits < item.price;
  const disabled = levelLocked || tooPoor || inventoryFull;

  return (
    <div
      className={`rounded-sm border bg-[#0f1b2d] p-2.5 ${TYPE_COLORS[base.type].split(" ")[1]}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-[#e0e0e0]">{base.name}</span>
        <span
          className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-bold tracking-widest ${TYPE_COLORS[base.type]}`}
        >
          {TYPE_LABELS[base.type]}
        </span>
      </div>
      {levelLocked ? (
        <p className="mt-1 text-xs text-[#ff6b00]">
          UNLOCKED AT LEVEL {item.minLevel}
        </p>
      ) : (
        <>
          <p className="mt-0.5 text-xs text-[#aabbcc]">
            PWR {base.basePower} · ACC {base.baseAccuracy}% · EN{" "}
            {base.baseEnergy}
          </p>
          <p className="mt-0.5 text-xs text-[#8899aa]">{base.description}</p>
        </>
      )}
      <div className="mt-1.5 flex items-center justify-between">
        <span className="gr-font-mono text-[10px] text-[#8899aa]">
          {flashMsg ?? ""}
        </span>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onBuy(item.baseToolId)}
          data-testid={`gr-shop-buy-${item.baseToolId}`}
          className="gr-font-mono min-h-[32px] rounded-sm border border-[#00f0ff] bg-[#0f1b2d] px-3 py-1 text-xs font-bold tracking-widest text-[#00f0ff] active:brightness-150 disabled:border-[#1a3a4a] disabled:text-[#4a5568]"
        >
          {levelLocked ? "---" : inventoryFull ? "FULL" : `BUY ◊${item.price}`}
        </button>
      </div>
    </div>
  );
}

export function ShopScreen({
  onClose,
  player,
  bits,
  inventoryFull,
  onBuy,
}: ShopScreenProps) {
  const [flash, setFlash] = useState<{ id: string; msg: string } | null>(null);

  function handleBuy(baseToolId: string) {
    const item = SHOP_ITEMS.find((s) => s.baseToolId === baseToolId);
    if (!item) return;
    if (player.level < item.minLevel || bits < item.price || inventoryFull) {
      setFlash({
        id: baseToolId,
        msg:
          bits < item.price
            ? "NOT ENOUGH BITS"
            : inventoryFull
              ? "INVENTORY FULL"
              : "LEVEL TOO LOW",
      });
      globalThis.setTimeout(() => setFlash(null), 1500);
      return;
    }
    onBuy(baseToolId);
    setFlash({ id: baseToolId, msg: "PURCHASED" });
    globalThis.setTimeout(() => setFlash(null), 1200);
  }

  return (
    <div
      data-testid="gr-shop-overlay"
      className="absolute inset-0 z-40 flex flex-col bg-[#0a0e1a]/95"
    >
      <header className="flex shrink-0 items-center justify-between border-b border-[#00f0ff] px-3 py-2">
        <h2 className="gr-font-display text-base font-bold tracking-widest text-[#00f0ff]">
          TOOL SHOP
        </h2>
        <div className="flex items-center gap-3">
          <span className="gr-font-mono text-xs text-[#ff9500]">◊ {bits}</span>
          <button
            type="button"
            onClick={onClose}
            data-testid="gr-shop-close"
            className="gr-font-mono min-h-[32px] rounded-sm border border-[#1a3a4a] bg-[#0f1b2d] px-2 py-1 text-xs text-[#aabbcc] active:brightness-150"
          >
            CLOSE
          </button>
        </div>
      </header>

      <div className="gr-font-mono flex flex-1 flex-col gap-2 overflow-y-auto p-3">
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
      </div>
    </div>
  );
}
