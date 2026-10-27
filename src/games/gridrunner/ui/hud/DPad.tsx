import { DirectionValue, type Direction } from "../../engine/movement";

export type DPadDirection = Direction;

type DPadProps = Readonly<{
  onPress?: (direction: DPadDirection) => void;
  onRelease?: (direction: DPadDirection) => void;
}>;

const DIRECTION_PRESENTATION: Record<Direction, Readonly<{
  rotation: string;
  gridArea: string;
}>> = {
  [DirectionValue.Up]: { rotation: "rotate-0", gridArea: "1 / 2 / 2 / 3" },
  [DirectionValue.Down]: { rotation: "rotate-180", gridArea: "3 / 2 / 4 / 3" },
  [DirectionValue.Left]: { rotation: "-rotate-90", gridArea: "2 / 1 / 3 / 2" },
  [DirectionValue.Right]: { rotation: "rotate-90", gridArea: "2 / 3 / 3 / 4" },
};

function DPadArrow({ className }: Readonly<{ className?: string }>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="currentColor" className={className}>
      <path d="M12 4 19 16H5Z" />
    </svg>
  );
}

export function DPad({ onPress, onRelease }: DPadProps) {
  return (
    <nav
      data-testid="gr-dpad"
      aria-label="Directional pad"
      className="grid grid-cols-[repeat(3,32px)] grid-rows-[repeat(3,32px)] gap-0.5 sm:grid-cols-[repeat(3,40px)] sm:grid-rows-[repeat(3,40px)] lg:grid-cols-[repeat(3,48px)] lg:grid-rows-[repeat(3,48px)]"
    >
      {Object.values(DirectionValue).map((dir) => (
        <button
          key={dir}
          type="button"
          data-testid={`gr-dpad-${dir}`}
          aria-label={`Move ${dir}`}
          onPointerDown={() => onPress?.(dir)}
          onPointerUp={() => onRelease?.(dir)}
          onPointerCancel={() => onRelease?.(dir)}
          className="flex h-8 w-8 touch-none items-center justify-center rounded-sm border border-[#1a3a4a] bg-[#0f1b2d] text-[#00f0ff] shadow-[inset_0_0_6px_rgba(0,240,255,0.08)] active:brightness-150 sm:h-10 sm:w-10 lg:h-12 lg:w-12"
          style={{ gridArea: DIRECTION_PRESENTATION[dir].gridArea }}
        >
          <DPadArrow
            className={`h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 ${DIRECTION_PRESENTATION[dir].rotation}`}
          />
        </button>
      ))}
      <div
        aria-hidden
        className="rounded-sm border border-[#1a3a4a] bg-[#0a1220] [grid-area:2/2/3/3]"
      />
    </nav>
  );
}
