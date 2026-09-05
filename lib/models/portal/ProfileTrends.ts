export interface ProfileTrendDataPoint {
  start: string;
  end: string;
  label: string;
  mood: number | null;
  cognition: number | null;
  personality: number | null;
  sessions: number;
}

export interface ProfileTrendPillarSummary {
  currentScore: number | null;
  baselineScore: number | null;
  delta: number | null;
  consistency: number | null;
}

export interface ProfileTrendsResponse {
  period: string;
  points: ProfileTrendDataPoint[];
  pillars: {
    mood: ProfileTrendPillarSummary;
    cognition: ProfileTrendPillarSummary;
    personality: ProfileTrendPillarSummary;
  };
}

export const generateMockProfileTrends = (): ProfileTrendsResponse => ({
  period: "weekly",
  points: [
    { start: "2026-08-01", end: "2026-08-07", label: "Aug 07", mood: 45, cognition: 50, personality: 55, sessions: 2 },
    { start: "2026-08-08", end: "2026-08-14", label: "Aug 14", mood: 50, cognition: 48, personality: 56, sessions: 3 },
    { start: "2026-08-15", end: "2026-08-21", label: "Aug 21", mood: 52, cognition: 55, personality: 52, sessions: 1 },
    { start: "2026-08-22", end: "2026-08-28", label: "Aug 28", mood: 60, cognition: 58, personality: 60, sessions: 4 },
  ],
  pillars: {
    mood: { currentScore: 60, baselineScore: 49, delta: 11, consistency: 80 },
    cognition: { currentScore: 58, baselineScore: 51, delta: 7, consistency: 85 },
    personality: { currentScore: 60, baselineScore: 54, delta: 6, consistency: 90 },
  }
});
