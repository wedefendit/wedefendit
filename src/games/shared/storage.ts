/*
Copyright © 2025 Defend I.T. Solutions LLC. All Rights Reserved.

This software and its source code are the proprietary property of
Defend I.T. Solutions LLC and are protected by United States and
international copyright laws. Unauthorized reproduction, distribution,
modification, display, or use of this software, in whole or in part, without the
prior written permission of Defend I.T. Solutions LLC, is strictly prohibited.

This software is provided for use only by authorized employees, contractors, or
licensees of Defend I.T. Solutions LLC and may not be disclosed to any third
party without express written consent.
*/

import type { GameScore, GamesState } from "./types";

const STORAGE_KEY = "dis-games-state";

const EMPTY_STATE: GamesState = {
  badges: [],
  scores: {},
};

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function cloneEmpty(): GamesState {
  return { badges: [], scores: {} };
}

export function getState(): GamesState {
  if (!isBrowser()) return cloneEmpty();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneEmpty();
    const parsed = JSON.parse(raw) as Partial<GamesState>;
    return {
      badges: Array.isArray(parsed.badges) ? parsed.badges : [],
      scores: parsed.scores && typeof parsed.scores === "object" ? parsed.scores : {},
    };
  } catch {
    return cloneEmpty();
  }
}

export function setState(state: GamesState): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota or privacy mode — silently ignore. V1 is best-effort local only.
  }
}

export function clearState(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function getScore(gameId: string): GameScore | undefined {
  return getState().scores[gameId];
}

export function setScore(score: GameScore): GamesState {
  const state = getState();
  const existing = state.scores[score.gameId];
  const bestScore = existing ? Math.max(existing.bestScore, score.score) : score.score;
  const next: GamesState = {
    ...state,
    scores: {
      ...state.scores,
      [score.gameId]: { ...score, bestScore },
    },
  };
  setState(next);
  return next;
}

export function clearScore(gameId: string): GamesState {
  const state = getState();
  if (!(gameId in state.scores)) return state;
  const { [gameId]: _removed, ...rest } = state.scores;
  void _removed;
  const next: GamesState = { ...state, scores: rest };
  setState(next);
  return next;
}

export function getBadges(): string[] {
  return getState().badges;
}

export function hasBadge(badgeId: string): boolean {
  return getState().badges.includes(badgeId);
}

export function addBadge(badgeId: string): GamesState {
  const state = getState();
  if (state.badges.includes(badgeId)) return state;
  const next: GamesState = { ...state, badges: [...state.badges, badgeId] };
  setState(next);
  return next;
}

export function clearBadges(): GamesState {
  const state = getState();
  const next: GamesState = { ...state, badges: [] };
  setState(next);
  return next;
}

export const STORAGE_KEY_NAME = STORAGE_KEY;
export { EMPTY_STATE };
