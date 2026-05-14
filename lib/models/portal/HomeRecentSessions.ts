export interface HomeRecentSession {
  session_id: string;
  game_name: string;
  game_slug: string;
  played_at: string;
  duration_seconds: number;
  primary_mood: string;
  primary_score: number;
}

export const generateMockHomeRecentSessions = (): HomeRecentSession[] => ([
  {
    session_id: "a1b2c3d4",
    game_name: "Hextris",
    game_slug: "hextris",
    played_at: new Date().toISOString(),
    duration_seconds: 330,
    primary_mood: "focus",
    primary_score: 72
  }
]);
