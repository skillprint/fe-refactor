/** `GET /api/portal/profile/trends/?period=weekly|monthly&points=N` (SKI-131). */

export type ProfileTrendPeriod = 'weekly' | 'monthly';

export interface ProfileTrendDataPoint {
  start: string;
  end: string;
  label: string;
  /** null (not 0) for a bucket with no play, so the line breaks instead of dropping. */
  mood: number | null;
  cognition: number | null;
  personality: number | null;
  sessions: number;
}

export interface ProfileTrendPillarSummary {
  currentScore: number | null;
  /** Mean of the pillar's dimensions' first-ever scores — a lifetime anchor. */
  baselineScore: number | null;
  delta: number | null;
  /** 1 - stdev/mean over non-empty buckets, scaled 0-100; null below two points. */
  consistency: number | null;
}

export interface ProfileTrendsResponse {
  period: ProfileTrendPeriod;
  points: ProfileTrendDataPoint[];
  pillars: {
    mood: ProfileTrendPillarSummary;
    cognition: ProfileTrendPillarSummary;
    personality: ProfileTrendPillarSummary;
  };
}

export const generateMockProfileTrends = (): ProfileTrendsResponse => ({
  period: 'weekly',
  points: [
    { start: '2026-08-01', end: '2026-08-07', label: 'Aug 01', mood: 45, cognition: 50, personality: 55, sessions: 2 },
    { start: '2026-08-08', end: '2026-08-14', label: 'Aug 08', mood: 50, cognition: 48, personality: 56, sessions: 3 },
    { start: '2026-08-15', end: '2026-08-21', label: 'Aug 15', mood: null, cognition: null, personality: null, sessions: 0 },
    { start: '2026-08-22', end: '2026-08-28', label: 'Aug 22', mood: 60, cognition: 58, personality: 60, sessions: 4 },
  ],
  pillars: {
    mood: { currentScore: 60, baselineScore: 49, delta: 11, consistency: 80 },
    cognition: { currentScore: 58, baselineScore: 51, delta: 7, consistency: 85 },
    personality: { currentScore: 60, baselineScore: 54, delta: 6, consistency: 90 },
  },
});
