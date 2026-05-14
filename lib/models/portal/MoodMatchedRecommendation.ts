export interface MoodMatchedRecommendation {
  game: { id: number; name: string; slug: string; };
  reason_code: string;
  reason_text: string;
}

export const generateMockMoodMatchedRecommendation = (): MoodMatchedRecommendation[] => ([
  {
    game: { id: 42, name: "Hextris", slug: "hextris" },
    reason_code: "MOOD_MATCH_FOCUS",
    reason_text: "Good for focus"
  }
]);
