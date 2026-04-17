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

import { useCallback, useEffect, useState } from "react";
import * as storage from "../storage";
import type { Badge, GameScore, GamesState } from "../types";

const EMPTY_STATE: GamesState = { badges: [], scores: {}, preferences: {} };

export function useLocalScores() {
  const [gamesState, setGamesState] = useState<GamesState>(EMPTY_STATE);

  useEffect(() => {
    let cancelled = false;
    storage.getState().then((s) => {
      if (!cancelled) setGamesState(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const recordScore = useCallback(async (score: GameScore) => {
    const next = await storage.setScore(score);
    setGamesState(next);
    return next;
  }, []);

  const earnBadge = useCallback(async (badge: Badge) => {
    const next = await storage.addBadge({
      id: badge.id,
      gameId: badge.gameId,
      tier: badge.tier,
      earnedAt: new Date().toISOString(),
    });
    setGamesState(next);
    return next;
  }, []);

  const clearGame = useCallback(async (gameId: string) => {
    const next = await storage.clearScore(gameId);
    setGamesState(next);
    return next;
  }, []);

  const clearAll = useCallback(async () => {
    await storage.clearState();
    setGamesState(EMPTY_STATE);
  }, []);

  const hasBadge = useCallback(
    (badgeId: string) => gamesState.badges.some((b) => b.id === badgeId),
    [gamesState.badges],
  );

  const getScore = useCallback(
    (gameId: string): GameScore | undefined => gamesState.scores[gameId],
    [gamesState.scores],
  );

  return {
    state: gamesState,
    recordScore,
    earnBadge,
    clearGame,
    clearAll,
    hasBadge,
    getScore,
  };
}
