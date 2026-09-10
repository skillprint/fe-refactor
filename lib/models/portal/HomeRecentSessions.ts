/** `GET /api/portal/home/recent-sessions/` — camelCase on the wire. Newest first. */
export interface HomeRecentSession {
  sessionId: string;
  gameName: string;
  gameSlug: string;
  playedAt: string;
  durationSeconds: number;
  primaryMood: string | null;
  primaryScore: number | null;
}

export const generateMockHomeRecentSessions = (): HomeRecentSession[] => ([
  {
    sessionId: "a1b2c3d4",
    gameName: "Hextris",
    gameSlug: "hextris",
    playedAt: new Date().toISOString(),
    durationSeconds: 330,
    primaryMood: "focus",
    primaryScore: 72
  }
]);
