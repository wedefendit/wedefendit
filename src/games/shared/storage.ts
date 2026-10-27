import type {
  BadgeTier,
  EarnedBadge,
  GamePreferences,
  GameScore,
  GamesState,
} from "./types";

const STORAGE_KEY = "dis-games-state";

const EMPTY_STATE: GamesState = {
  badges: [],
  scores: {},
  preferences: {},
};

function isBrowser(): boolean {
  return globalThis.localStorage !== undefined;
}

function cloneEmpty(): GamesState {
  return { badges: [], scores: {}, preferences: {} };
}

function sanitizePreferences(value: unknown): GamePreferences {
  if (!value || typeof value !== "object") return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([gameId, prefs]) => [
      gameId,
      prefs && typeof prefs === "object"
        ? { ...(prefs as Record<string, unknown>) }
        : {},
    ]),
  );
}

const VALID_TIERS: readonly BadgeTier[] = ["bronze", "silver", "gold"];

function isBadgeTier(value: unknown): value is BadgeTier {
  return typeof value === "string" && (VALID_TIERS as readonly string[]).includes(value);
}

function sanitizeBadges(value: unknown): EarnedBadge[] {
  if (!Array.isArray(value)) return [];
  const out: EarnedBadge[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const b = entry as Partial<EarnedBadge>;
    if (typeof b.id !== "string" || !b.id) continue;
    if (typeof b.gameId !== "string" || !b.gameId) continue;
    if (!isBadgeTier(b.tier)) continue;
    if (typeof b.earnedAt !== "string" || !b.earnedAt) continue;
    out.push({
      id: b.id,
      gameId: b.gameId,
      tier: b.tier,
      earnedAt: b.earnedAt,
    });
  }
  return out;
}

function readState(): GamesState {
  if (!isBrowser()) return cloneEmpty();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneEmpty();
    const parsed = JSON.parse(raw) as Partial<GamesState> & {
      badges?: unknown;
    };
    return {
      badges: sanitizeBadges(parsed.badges),
      scores:
        parsed.scores && typeof parsed.scores === "object" ? parsed.scores : {},
      preferences: sanitizePreferences(parsed.preferences),
    };
  } catch {
    return cloneEmpty();
  }
}

export function getState(): Promise<GamesState> {
  return Promise.resolve(readState());
}

export function setState(state: GamesState): Promise<void> {
  if (!isBrowser()) return Promise.resolve();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    return Promise.resolve();
  }
  return Promise.resolve();
}

export function clearState(): Promise<void> {
  if (!isBrowser()) return Promise.resolve();
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    return Promise.resolve();
  }
  return Promise.resolve();
}

export async function setScore(score: GameScore): Promise<GamesState> {
  const state = await getState();
  const existing = state.scores[score.gameId];
  const bestScore = existing
    ? Math.max(existing.bestScore, score.score)
    : score.score;
  const next: GamesState = {
    ...state,
    scores: {
      ...state.scores,
      [score.gameId]: { ...score, bestScore },
    },
  };
  await setState(next);
  return next;
}

export async function clearScore(gameId: string): Promise<GamesState> {
  const state = await getState();
  if (!(gameId in state.scores)) return state;
  const rest = { ...state.scores };
  delete rest[gameId];
  const next: GamesState = { ...state, scores: rest };
  await setState(next);
  return next;
}

export async function addBadge(badge: EarnedBadge): Promise<GamesState> {
  const state = await getState();
  if (state.badges.some((b) => b.id === badge.id)) return state;
  const next: GamesState = { ...state, badges: [...state.badges, badge] };
  await setState(next);
  return next;
}

export async function getGamePreference<T = unknown>(
  gameId: string,
  key: string,
): Promise<T | undefined> {
  const state = await getState();
  const prefs = state.preferences[gameId];
  if (!prefs) return undefined;
  return prefs[key] as T | undefined;
}

export async function setGamePreference(
  gameId: string,
  key: string,
  value: unknown,
): Promise<GamesState> {
  const state = await getState();
  const next: GamesState = {
    ...state,
    preferences: {
      ...state.preferences,
      [gameId]: {
        ...state.preferences[gameId],
        [key]: value,
      },
    },
  };
  await setState(next);
  return next;
}

export { EMPTY_STATE };
