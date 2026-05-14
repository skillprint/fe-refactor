export interface SessionSummaryItem {
  session_id: string;
  game_name: string;
  game_slug: string;
  played_at: string;
  duration_seconds: number;
  primary_mood: string;
  primary_score: number;
}

export interface PaginatedSession {
  next: string | null;
  previous: string | null;
  results: SessionSummaryItem[];
}

export const generateMockPaginatedSession = (): PaginatedSession => ({
  next: null,
  previous: null,
  results: [
    {
      session_id: "a1b2c3d4",
      game_name: "Hextris",
      game_slug: "hextris",
      played_at: new Date().toISOString(),
      duration_seconds: 330,
      primary_mood: "focus",
      primary_score: 72
    }
  ]
});
