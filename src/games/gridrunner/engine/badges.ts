/*
Copyright © 2026 Defend I.T. Solutions LLC. All Rights Reserved.
*/

import type { EarnedBadge } from "../../shared/types";
import type { GridRunnerSave } from "./types";
import { intel } from "../data/sectors";

const GAME_ID = "gridrunner";

/**
 * Given the previous and current save states, return the list of badges
 * that should be awarded as a result of this transition. Pure helper —
 * no I/O. The hook observes state changes and persists via storage.addBadge.
 *
 * Handles:
 *   - Boss first-kill badges (bossId in defeatedBosses maps to intel[id].badgeId)
 *   - Tutorial completion (completedTutorial flips false -> true -> "grid-runner")
 */
export function badgesForTransition(
  prev: GridRunnerSave | null,
  next: GridRunnerSave | null,
  now: string,
): EarnedBadge[] {
  if (!next) return [];
  const prevBosses = new Set(prev?.defeatedBosses ?? []);
  const newlyDefeated = next.defeatedBosses.filter((id) => !prevBosses.has(id));
  const earned: EarnedBadge[] = [];

  for (const bossId of newlyDefeated) {
    const boss = intel[bossId];
    if (!boss) continue;
    earned.push({
      id: boss.badgeId,
      gameId: GAME_ID,
      tier: "bronze",
      earnedAt: now,
    });
  }

  const tutorialJustCompleted =
    next.completedTutorial && !(prev?.completedTutorial ?? false);
  if (tutorialJustCompleted) {
    earned.push({
      id: "grid-runner",
      gameId: GAME_ID,
      tier: "bronze",
      earnedAt: now,
    });
  }

  return earned;
}
