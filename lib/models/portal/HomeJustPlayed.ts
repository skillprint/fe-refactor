export interface HomeJustPlayed {
  session_id: string;
  game: { name: string; slug: string; };
  played_at: string;
  duration_seconds: number;
  target_mood: string;
  target_score: number;
}

export const generateMockHomeJustPlayed = (): HomeJustPlayed => ({
  session_id: "a1b2c3d4",
  game: { name: "Hextris", slug: "hextris" },
  played_at: new Date().toISOString(),
  duration_seconds: 330,
  target_mood: "focus",
  target_score: 72
});
