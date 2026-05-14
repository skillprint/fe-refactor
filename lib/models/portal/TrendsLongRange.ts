export interface TrendDataPoint {
  date: string;
  score: number;
  sessions: number;
}

export interface TrendsLongRange {
  pillar: string;
  dimension: string;
  data_points: TrendDataPoint[];
}

export const generateMockTrendsLongRange = (): TrendsLongRange => ({
  pillar: "mood",
  dimension: "focus",
  data_points: [
    { date: "2026-04-20", score: 65, sessions: 2 },
    { date: "2026-04-21", score: 70, sessions: 1 }
  ]
});
