export interface TrendPillarMetric {
  slug: string;
  avg_score: number;
  sessions: number;
}

export interface TrendsSummary {
  range: string;
  pillars: {
    mood: TrendPillarMetric[];
    cognition: TrendPillarMetric[];
    personality: TrendPillarMetric[];
  };
}

export const generateMockTrendsSummary = (): TrendsSummary => ({
  range: "W",
  pillars: {
    mood: [{ slug: "focus", avg_score: 72, sessions: 5 }],
    cognition: [{ slug: "attention", avg_score: 78, sessions: 5 }],
    personality: [{ slug: "openness", avg_score: 68, sessions: 5 }]
  }
});
