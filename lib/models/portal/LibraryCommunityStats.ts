export interface LibraryCommunityStats {
  game_slug: string;
  total_sessions: number;
  unique_players: number;
  avg_duration_seconds: number;
}

export const generateMockLibraryCommunityStats = (): LibraryCommunityStats => ({
  game_slug: "hextris",
  total_sessions: 1847,
  unique_players: 312,
  avg_duration_seconds: 198
});
