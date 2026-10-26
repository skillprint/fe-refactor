/**
 * `GET /api/portal/library/games/{slug}/leaderboard/?limit=10&period=all|week`
 * — the top players on one game by the game's own score (marketplace #148).
 * camelCase on the wire. An unknown game is a 404.
 *
 * One row per player, their best scored play, best first. Ranks are
 * competition ranks (1, 2, 2, 4). Rows are anonymised: the viewer is "You",
 * everyone else "Player N". `score` is the game's own number — points, as the
 * game reported it — not a Skillprint measurement, so it is on no fixed scale.
 */
export type LeaderboardPeriod = 'all' | 'week';

export interface GameLeaderboardEntry {
  rank: number;
  userDisplay: string;
  score: number;
  /** When the player first reached this score. */
  achievedAt: string;
  isYou: boolean;
}

/** The viewer's own standing, whether or not their row made the top. */
export interface GameLeaderboardStanding {
  rank: number;
  score: number;
  achievedAt: string;
  sessionId: string;
}

export interface LibraryGameLeaderboard {
  gameSlug: string;
  period: LeaderboardPeriod;
  /** Players with a scored play of the game in the period. */
  totalPlayers: number;
  entries: GameLeaderboardEntry[];
  /** Null when the viewer has no scored play of the game in the period. */
  you: GameLeaderboardStanding | null;
}

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

/** A busy board with the viewer in fourth; the week view is a smaller field with the viewer on top. */
export const generateMockLibraryGameLeaderboard = (period: LeaderboardPeriod = 'all'): LibraryGameLeaderboard => {
  const scores = period === 'week'
    ? [3120, 2980, 2980, 2410, 1870]
    : [4820, 4410, 4110, 3990, 3700, 3480, 3120, 2980, 2980, 2410];
  const yourIndex = period === 'week' ? 0 : 3;
  let rank = 0;
  const entries = scores.map((score, i) => {
    if (score !== scores[i - 1]) rank = i + 1;
    const isYou = i === yourIndex;
    return { rank, userDisplay: isYou ? 'You' : `Player ${i + 1}`, score, achievedAt: daysAgo(i * 2 + 1), isYou };
  });
  const yours = entries[yourIndex];
  return {
    gameSlug: 'hextris',
    period,
    totalPlayers: period === 'week' ? 23 : 159,
    entries,
    you: { rank: yours.rank, score: yours.score, achievedAt: yours.achievedAt, sessionId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
  };
};
