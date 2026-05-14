export interface LibraryPersonalStats {
  game_slug: string;
  sessions_played: number;
  total_play_seconds: number;
}

export const generateMockLibraryPersonalStats = (): LibraryPersonalStats => ({
  game_slug: "hextris",
  sessions_played: 24,
  total_play_seconds: 7920
});
