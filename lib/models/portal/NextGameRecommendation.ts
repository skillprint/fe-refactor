/** `GET /api/portal/recommendations/next-game/` — camelCase on the wire. */
export interface NextGameRecommendation {
  /** `buildDir`: folder on the games CDN, null without a build (absent before marketplace #154). */
  game: { name: string; slug: string; buildDir?: string | null; };
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
