/** `GET /api/portal/home/just-played/` — camelCase on the wire. Empty body when nothing has been played. */
export interface HomeJustPlayed {
  sessionId: string;
  game: { name: string; slug: string; };
  playedAt: string;
  durationSeconds: number;
  targetMood: string;
  targetScore: number;
}

export const generateMockHomeJustPlayed = (): HomeJustPlayed => ({
  sessionId: "a1b2c3d4",
  game: { name: "Hextris", slug: "hextris" },
  playedAt: new Date().toISOString(),
  durationSeconds: 330,
  targetMood: "focus",
  targetScore: 72
});
