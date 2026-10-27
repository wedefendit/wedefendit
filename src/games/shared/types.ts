export enum DifficultyValue {
  Easy = "easy",
  Medium = "medium",
  Hard = "hard",
}

export type Difficulty = `${DifficultyValue}`;

export enum BadgeTierValue {
  Bronze = "bronze",
  Silver = "silver",
  Gold = "gold",
}

export type BadgeTier = `${BadgeTierValue}`;

export type Badge = {
  id: string;
  gameId: string;
  name: string;
  description: string;
  icon?: string;
  tier: BadgeTier;
  condition: string;
};

export type GameScore = {
  gameId: string;
  difficulty: Difficulty;
  score: number;
  details: Record<string, number>;
  completedAt: string;
  bestScore: number;
};

export type GamePreferences = Record<string, Record<string, unknown>>;

export type EarnedBadge = {
  id: string;
  gameId: string;
  tier: BadgeTier;
  earnedAt: string;
};

export type GamesState = {
  badges: EarnedBadge[];
  scores: Record<string, GameScore>;
  preferences: GamePreferences;
};

export type Score = {
  value: number;
  details?: Record<string, number>;
};

export type GameState<T = unknown> = {
  gameId: string;
  difficulty: Difficulty;
  data: T;
};
