/** `GET /api/portal/sessions/?limit=&cursor=&game_slug=&mood=` — camelCase on the wire. */
export interface SessionSummaryItem {
  sessionId: string;
  gameName: string;
  gameSlug: string;
  playedAt: string;
  durationSeconds: number;
  primaryMood: string | null;
  primaryScore: number | null;
}

export interface PaginatedSession {
  next: string | null;
  previous: string | null;
  results: SessionSummaryItem[];
}

export interface SessionListQuery {
  limit?: number;
  cursor?: string;
  gameSlug?: string;
  mood?: string;
}

export const generateMockPaginatedSession = (): PaginatedSession => ({
  next: null,
  previous: null,
  results: [
    {
      sessionId: 'a1b2c3d4',
      gameName: 'Hextris',
      gameSlug: 'hextris',
      playedAt: new Date().toISOString(),
      durationSeconds: 330,
      primaryMood: 'focus',
      primaryScore: 72,
    },
  ],
});
