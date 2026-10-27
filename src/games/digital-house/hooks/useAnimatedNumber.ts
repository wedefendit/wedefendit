import { useEffect, useRef, useState } from "react";
type AnimatedNumberOptions = Readonly<{
  durationMs?: number;
  initialValue?: number;
  round?: boolean;
}>;

const ANIMATION_DEFAULTS = { durationMs: 400, easingPower: 3 };

export function useAnimatedNumber(
  target: number,
  options: AnimatedNumberOptions = {},
): number {
  const durationMs = options.durationMs ?? ANIMATION_DEFAULTS.durationMs;
  const initialValue = options.initialValue ?? target;
  const [displayed, setDisplayed] = useState(initialValue);
  const displayedRef = useRef(initialValue);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = displayedRef.current;
    startRef.current = null;
    const tick = (now: number) => {
      startRef.current ??= now;
      const elapsed = now - startRef.current;
      const t = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - t, ANIMATION_DEFAULTS.easingPower);
      const interpolated = from + (target - from) * eased;
      const next = options.round ? Math.round(interpolated) : interpolated;
      displayedRef.current = next;
      setDisplayed(next);
      if (t < 1) {
        rafRef.current = globalThis.requestAnimationFrame(tick);
      }
    };

    rafRef.current = globalThis.requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) {
        globalThis.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [target, durationMs, options.round]);

  return displayed;
}
