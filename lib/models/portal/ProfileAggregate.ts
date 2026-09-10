/** `GET /api/portal/profile/` — lifetime aggregate profile. camelCase on the wire. */

export interface ProfileDimensionStat {
  slug: string;
  score: number;
  /** First-ever recorded score for the dimension; null with no rollup history. */
  baselineScore: number | null;
  /** score - baselineScore; null when baseline is null. */
  delta: number | null;
  sessions: number;
}

export interface ProfileWeeklyGridItem {
  date: string;
  moodScore: number | null;
  cognitionScore: number | null;
  sessionCount: number;
}

export interface ProfilePercentileItem {
  slug: string;
  percentile: number | null;
}

export interface ProfileAggregate {
  user: { firstName: string; joinedAt: string };
  totals: { sessions: number; totalPlaySeconds: number; activeDays: number };
  topDimensions: {
    mood: ProfileDimensionStat[];
    cognition: ProfileDimensionStat[];
    personality: ProfileDimensionStat[];
  };
  percentiles: {
    mood: ProfilePercentileItem[];
    cognition: ProfilePercentileItem[];
    personality: ProfilePercentileItem[];
  };
  weeklyGrid: ProfileWeeklyGridItem[];
}

/** Flatten `topDimensions` into slug → stat, across all three pillars. */
export function profileDimensionMap(profile: ProfileAggregate | null | undefined): Record<string, ProfileDimensionStat> {
  const out: Record<string, ProfileDimensionStat> = {};
  if (!profile) return out;
  for (const pillar of ['mood', 'cognition', 'personality'] as const) {
    for (const stat of profile.topDimensions?.[pillar] || []) {
      out[stat.slug] = stat;
    }
  }
  return out;
}

export const generateMockProfileAggregate = (): ProfileAggregate => ({
  user: { firstName: 'Gabriel', joinedAt: '2025-11-15T00:00:00Z' },
  totals: { sessions: 142, totalPlaySeconds: 47520, activeDays: 38 },
  topDimensions: {
    mood: [
      { slug: 'focus', score: 74, baselineScore: 51, delta: 23, sessions: 80 },
      { slug: 'relax', score: 68, baselineScore: null, delta: null, sessions: 45 },
    ],
    cognition: [
      { slug: 'attention', score: 81, baselineScore: 60, delta: 21, sessions: 92 },
      { slug: 'pattern-matching', score: 76, baselineScore: 70, delta: 6, sessions: 88 },
    ],
    personality: [
      { slug: 'conscientiousness', score: 72, baselineScore: 66, delta: 6, sessions: 50 },
      { slug: 'openness', score: 68, baselineScore: 62, delta: 6, sessions: 50 },
    ],
  },
  percentiles: {
    mood: [{ slug: 'focus', percentile: 78 }],
    cognition: [{ slug: 'attention', percentile: 85 }],
    personality: [{ slug: 'openness', percentile: 70 }],
  },
  weeklyGrid: [
    { date: '2026-04-28', moodScore: 72, cognitionScore: 68, sessionCount: 3 },
  ],
});
