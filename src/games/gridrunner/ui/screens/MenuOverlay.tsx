import { OverlayValue } from "../../engine/game-state";

type MenuTarget =
  | OverlayValue.Disc
  | OverlayValue.Inventory
  | OverlayValue.Operator
  | OverlayValue.Save
  | OverlayValue.Settings;

type MenuOverlayProps = Readonly<{
  onClose: () => void;
  onOpenOverlay: (target: MenuTarget) => void;
  inBattle: boolean;
}>;

type MenuItem = Readonly<{
  id: MenuTarget;
  label: string;
  desc: string;
  battleOk: boolean;
}>;

const MENU_ITEMS: readonly MenuItem[] = [
  {
    id: OverlayValue.Disc,
    label: "DISC",
    desc: "Review tools and types",
    battleOk: true,
  },
  {
    id: OverlayValue.Inventory,
    label: "INVENTORY",
    desc: "Equip and manage tools",
    battleOk: true,
  },
  {
    id: OverlayValue.Operator,
    label: "OPERATOR",
    desc: "View stats, badges, and level",
    battleOk: true,
  },
  {
    id: OverlayValue.Save,
    label: "SAVE",
    desc: "Save your progress",
    battleOk: false,
  },
  {
    id: OverlayValue.Settings,
    label: "SETTINGS",
    desc: "Change audio settings",
    battleOk: true,
  },
];
const MENU_VALUES: Readonly<{ button: "button" }> = { button: "button" };

export function MenuOverlay({
  onClose,
  onOpenOverlay,
  inBattle,
}: MenuOverlayProps) {
  function handleSelect(id: MenuTarget) {
    onOpenOverlay(id);
  }

  return (
    <div
      data-testid="gr-menu-overlay"
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/80"
    >
      <section
        aria-label="Game menu"
        className="flex w-full max-w-[280px] flex-col gap-1 rounded-sm border-2 border-[#00f0ff] bg-[#0a0e1a] p-4"
      >
        <h2 className="gr-font-display mb-2 text-center text-lg font-bold tracking-widest text-[#00f0ff]">
          MENU
        </h2>

        {MENU_ITEMS.map((item) => {
          const disabled = inBattle && !item.battleOk;
          return (
            <button
              key={item.id}
              type={MENU_VALUES.button}
              disabled={disabled}
              onClick={() => handleSelect(item.id)}
              className="gr-font-mono flex items-center justify-between rounded-sm border border-[#1a3a4a] bg-[#0f1b2d] px-3 py-2.5 text-left text-sm text-[#00f0ff] transition-opacity disabled:opacity-30"
            >
              <span className="font-bold tracking-wider">{item.label}</span>
              <span className="text-xs text-[#aabbcc]">{item.desc}</span>
            </button>
          );
        })}

        <p className="gr-font-mono mt-2 text-center text-xs text-[#aabbcc]">
          Press B to close
        </p>
        <button
          type={MENU_VALUES.button}
          onClick={onClose}
          className="gr-font-mono mt-1 min-h-[44px] rounded-sm border border-[#1a3a4a] bg-[#0f1b2d] px-3 py-2.5 text-sm font-bold tracking-widest text-[#aabbcc] active:brightness-150"
        >
          CLOSE
        </button>
      </section>
    </div>
  );
}
