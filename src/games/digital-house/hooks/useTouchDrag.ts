import { useCallback, useEffect, useRef } from "react";
import type { DeviceId } from "../engine/devices";
import { RoomIdValue, type RoomId } from "../engine/zones";

enum TouchEventValue { Move = "touchmove", End = "touchend", Cancel = "touchcancel" }
type TouchDragState = { deviceId: DeviceId; ghost: HTMLElement; currentRoom: RoomId | null };
const TOUCH_DRAG = {
  ghostTag: "div", iconTag: "span", devicePrefix: "dh-device-",
  roomSelector: "[data-testid^='dh-room-']",
  roomPattern: /^dh-room-(.+)$/,
  ghostStyle:
    "position:fixed;z-index:9999;pointer-events:none;width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;transform:translate(-50%,-50%) scale(1.1);",
  iconSize: "44px", iconRadius: "12px",
  fallbackBackground: "rgba(56,189,248,0.85)", fallbackBorder: "2px solid #0ea5e9",
  fallbackShadow: "0 8px 24px rgba(56,189,248,0.5)",
};

function createDragGhost(deviceId: DeviceId): HTMLElement {
  const ghost = document.createElement(TOUCH_DRAG.ghostTag);
  ghost.style.cssText = TOUCH_DRAG.ghostStyle;
  const card = document.querySelector(
    `[data-testid="${TOUCH_DRAG.devicePrefix}${deviceId}"]`,
  );
  const icon = card?.querySelector(TOUCH_DRAG.iconTag);
  if (!icon) {
    ghost.style.background = TOUCH_DRAG.fallbackBackground;
    ghost.style.border = TOUCH_DRAG.fallbackBorder;
    ghost.style.boxShadow = TOUCH_DRAG.fallbackShadow;
    return ghost;
  }
  const clone = icon.cloneNode(true) as HTMLElement;
  clone.style.width = TOUCH_DRAG.iconSize;
  clone.style.height = TOUCH_DRAG.iconSize;
  clone.style.borderRadius = TOUCH_DRAG.iconRadius;
  const background = getComputedStyle(icon).backgroundColor;
  clone.style.backgroundColor = background;
  clone.style.boxShadow = `0 8px 24px ${background.replace(")", ", 0.55)").replace("rgb(", "rgba(")}`;
  ghost.appendChild(clone);
  return ghost;
}

function roomAtPoint(x: number, y: number): RoomId | null {
  const element = document.elementFromPoint(x, y);
  const room = element?.closest(TOUCH_DRAG.roomSelector);
  const testId = room instanceof HTMLElement ? (room.dataset.testid ?? "") : "";
  const candidate = TOUCH_DRAG.roomPattern.exec(testId)?.[1];
  return Object.values(RoomIdValue).find((roomId) => roomId === candidate) ?? null;
}

export function useTouchDrag(
  onPlace: (deviceId: DeviceId, roomId: RoomId) => void,
  onHoverRoom: (roomId: RoomId | null) => void,
) {
  const stateRef = useRef<TouchDragState | null>(null);
  const onPlaceRef = useRef(onPlace);
  const onHoverRef = useRef(onHoverRoom);

  useEffect(() => {
    onPlaceRef.current = onPlace;
    onHoverRef.current = onHoverRoom;
  }, [onHoverRoom, onPlace]);

  const startDrag = useCallback((deviceId: DeviceId, originTouch: Touch) => {
    const ghost = createDragGhost(deviceId);
    ghost.style.left = originTouch.clientX + "px";
    ghost.style.top = originTouch.clientY + "px";
    document.body.appendChild(ghost);
    stateRef.current = { deviceId, ghost, currentRoom: null };

    const onMove = (event: TouchEvent) => {
      const state = stateRef.current;
      const touch = event.touches[0];
      if (!state || !touch) return;
      event.preventDefault();
      state.ghost.style.left = touch.clientX + "px";
      state.ghost.style.top = touch.clientY + "px";
      const roomId = roomAtPoint(touch.clientX, touch.clientY);
      if (roomId === state.currentRoom) return;
      state.currentRoom = roomId;
      onHoverRef.current(roomId);
    };

    const onEnd = () => {
      const state = stateRef.current;
      state?.ghost.remove();
      if (state?.currentRoom) {
        onPlaceRef.current(state.deviceId, state.currentRoom);
      }
      onHoverRef.current(null);
      stateRef.current = null;
      document.removeEventListener(TouchEventValue.Move, onMove, {
        capture: true,
      });
      document.removeEventListener(TouchEventValue.End, onEnd);
      document.removeEventListener(TouchEventValue.Cancel, onEnd);
    };

    document.addEventListener(TouchEventValue.Move, onMove, {
      passive: false,
      capture: true,
    });
    document.addEventListener(TouchEventValue.End, onEnd);
    document.addEventListener(TouchEventValue.Cancel, onEnd);
  }, []);

  const handleTouchStart = useCallback(
    (deviceId: DeviceId, event: React.TouchEvent) => {
      const touch = event.nativeEvent.touches[0];
      if (touch) startDrag(deviceId, touch);
    },
    [startDrag],
  );

  return { handleTouchStart };
}
