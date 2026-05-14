export interface NextGameRecommendation {
  game: { name: string; slug: string; };
  reason_code: string;
  reason_text: string;
}

export const generateMockNextGameRecommendation = (): NextGameRecommendation[] => ([
  {
    game: { name: "Sweet Memory", slug: "sweet-memory" },
    reason_code: "GENERAL",
    reason_text: "Recommended based on your profile"
  }
]);
