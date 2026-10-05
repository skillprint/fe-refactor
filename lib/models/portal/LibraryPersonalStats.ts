/**
 * `GET /api/portal/library/personal-stats/{slug}/` — the player's record on
 * one game (SKI-181). camelCase on the wire.
 *
 * Two kinds of number: `*Score` is the game's own score (points, as the game
 * reported it), null when the game reported none; `*FlowScore` is
 * Skillprint's flow measurement for the session's target mood on 0–100.
 * A play is a session that is closed or has media; history across every
 * record for the game counts. An unknown game is a 404.
 */
export interface LibraryPersonalStats {
  gameSlug: string;
  sessionsPlayed: number;
  totalPlaySeconds: number;
  /** Plays in the last 7 days including today. */
  sessionsThisWeek: number;
  /** Consecutive days with a play, counting back from today; 0 once lapsed. */
  streakDays: number;
  lastPlayedAt: string | null;
  bestScore: number | null;
  /** Best before the latest scored session, for "+N on your previous best". */
  previousBestScore: number | null;
  lastScore: number | null;
  bestFlowScore: number | null;
  lastFlowScore: number | null;
}

export const generateMockLibraryPersonalStats = (): LibraryPersonalStats => ({
  gameSlug: "hextris",
  sessionsPlayed: 24,
  totalPlaySeconds: 7920,
  sessionsThisWeek: 3,
  streakDays: 2,
  lastPlayedAt: new Date(Date.now() - 86400000).toISOString(),
  bestScore: 4820,
  previousBestScore: 4110,
  lastScore: 4820,
  bestFlowScore: 81,
  lastFlowScore: 72
});
