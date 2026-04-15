/*
Copyright © 2026 Defend I.T. Solutions LLC. All Rights Reserved.

This software and its source code are the proprietary property of
Defend I.T. Solutions LLC and are protected by United States and
international copyright laws. Unauthorized reproduction, distribution,
modification, display, or use of this software, in whole or in part, without the
prior written permission of Defend I.T. Solutions LLC, is strictly prohibited.

This software is provided for use only by authorized employees, contractors, or
licensees of Defend I.T. Solutions LLC and may not be disclosed to any third
party without express written consent.
*/

import { useCallback, useRef, useState } from "react";

export type UseGameStateResult<T> = {
  state: T;
  setState: React.Dispatch<React.SetStateAction<T>>;
  reset: () => void;
  resetCount: number;
};

export function useGameState<T>(initial: T | (() => T)): UseGameStateResult<T> {
  const initialRef = useRef<T>(
    typeof initial === "function" ? (initial as () => T)() : initial,
  );
  const [state, setState] = useState<T>(initialRef.current);
  const [resetCount, setResetCount] = useState(0);

  const reset = useCallback(() => {
    setState(initialRef.current);
    setResetCount((c) => c + 1);
  }, []);

  return { state, setState, reset, resetCount };
}
