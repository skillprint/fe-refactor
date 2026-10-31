/** `GET /api/portal/recommendations/next-game/` — camelCase on the wire. */
export interface NextGameRecommendation {
  /** `url`: where the game plays (marketplace #154); null when it has none. */
  game: { name: string; slug: string; url?: string | null; };
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
