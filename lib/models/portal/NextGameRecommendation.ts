/** `GET /api/portal/recommendations/next-game/` — camelCase on the wire. */
export interface NextGameRecommendation {
  game: { name: string; slug: string; };
  reasonCode: string;
  reasonText: string;
}

export const generateMockNextGameRecommendation = (): NextGameRecommendation[] => ([
  {
    game: { name: "Sweet Memory", slug: "sweet-memory" },
    reasonCode: "GENERAL",
    reasonText: "Recommended based on your profile"
  }
]);
