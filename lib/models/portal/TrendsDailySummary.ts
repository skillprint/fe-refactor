export interface DailyDimension {
  pillar: string;
  slug: string;
  avg_score: number;
  sessions: number;
  duration_seconds: number;
}

export interface TrendsDailySummary {
  date: string;
  dimensions: DailyDimension[];
}

export const generateMockTrendsDailySummary = (): TrendsDailySummary => ({
  date: "2026-05-04",
  dimensions: [
    { pillar: "mood", slug: "focus", avg_score: 72, sessions: 2, duration_seconds: 600 }
  ]
});
