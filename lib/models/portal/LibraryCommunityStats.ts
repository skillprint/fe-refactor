/**
 * `GET /api/portal/library/community-stats/{slug}/` — everyone's play on one
 * game, over the same sessions and records personal stats count (SKI-181).
 * camelCase on the wire. An unknown game is a 404.
 */
export interface LibraryCommunityStats {
  gameSlug: string;
  totalSessions: number;
  uniquePlayers: number;
  avgDurationSeconds: number;
}

export const generateMockLibraryCommunityStats = (): LibraryCommunityStats => ({
  gameSlug: "hextris",
  totalSessions: 1847,
  uniquePlayers: 312,
  avgDurationSeconds: 198
});
