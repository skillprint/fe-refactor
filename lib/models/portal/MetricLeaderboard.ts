export interface LeaderboardEntry {
  rank: number;
  user_display: string;
  score: number;
  is_you: boolean;
}

export interface MetricLeaderboard {
  pillar: string;
  dimension: string;
  entries: LeaderboardEntry[];
}

export const generateMockMetricLeaderboard = (): MetricLeaderboard => ({
  pillar: "cognition",
  dimension: "attention",
  entries: [
    { rank: 1, user_display: "Alice", score: 92, is_you: false },
    { rank: 2, user_display: "Bob", score: 88, is_you: true }
  ]
});
