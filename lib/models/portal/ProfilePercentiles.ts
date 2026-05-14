export interface PercentileEntry {
  slug: string;
  display_name: string;
  score: number;
  percentile: number;
}

export interface ProfilePercentiles {
  mood: PercentileEntry[];
  cognition: PercentileEntry[];
  personality: PercentileEntry[];
}

export const generateMockProfilePercentiles = (): ProfilePercentiles => ({
  mood: [{ slug: "focus", display_name: "Focus", score: 74, percentile: 78 }],
  cognition: [{ slug: "attention", display_name: "Attention", score: 81, percentile: 85 }],
  personality: [{ slug: "openness", display_name: "Openness", score: 68, percentile: 70 }]
});
