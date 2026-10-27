import { useCallback, useState } from "react";

export type UseGameStateResult<T> = Readonly<{
  state: T;
  setState: React.Dispatch<React.SetStateAction<T>>;
  reset: () => void;
  resetCount: number;
}>;

function initialState<T>(initial: T | (() => T)): T {
  return typeof initial === "function" ? Reflect.apply(initial, undefined, []) : initial;
}

export function useGameState<T>(initial: T | (() => T)): UseGameStateResult<T> {
  const [baseline] = useState(() => initialState(initial));
  const [state, setState] = useState<T>(baseline);
  const [resetCount, setResetCount] = useState(0);

  const reset = useCallback(() => {
    setState(baseline);
    setResetCount((c) => c + 1);
  }, [baseline]);

  return { state, setState, reset, resetCount };
}
