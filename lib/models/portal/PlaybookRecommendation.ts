export interface PlaybookFocusArea {
  pillar: string;
  slug: string;
  score: number;
  action: string;
}

export interface PlaybookRecommendation {
  focus_areas: PlaybookFocusArea[];
}

export const generateMockPlaybookRecommendation = (): PlaybookRecommendation => ({
  focus_areas: [
    { pillar: "cognition", slug: "verbal", score: 35, action: "IMPROVE" }
  ]
});
