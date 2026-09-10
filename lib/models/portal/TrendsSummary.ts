/** `GET /api/portal/trends/?range=D|W|M|6M|Y` — camelCase on the wire. */
export interface TrendPillarMetric {
  slug: string;
  avgScore: number;
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
  range: 'W',
  pillars: {
    mood: [{ slug: 'focus', avgScore: 72, sessions: 5 }],
    cognition: [{ slug: 'attention', avgScore: 78, sessions: 5 }],
    personality: [{ slug: 'openness', avgScore: 68, sessions: 5 }],
  },
});
