export interface ProfileDimensionStat {
  slug: string;
  score: number;
  sessions: number;
}

export interface ProfileWeeklyGridItem {
  date: string;
  mood_score: number | null;
  cognition_score: number | null;
  session_count: number;
}

export interface ProfileAggregate {
  user: { first_name: string; joined_at: string; };
  totals: { sessions: number; total_play_seconds: number; active_days: number; };
  top_dimensions: {
    mood: ProfileDimensionStat[];
    cognition: ProfileDimensionStat[];
    personality: ProfileDimensionStat[];
  };
  percentiles: {
    mood: { slug: string; percentile: number }[];
    cognition: { slug: string; percentile: number }[];
    personality: { slug: string; percentile: number }[];
  };
  weekly_grid: ProfileWeeklyGridItem[];
}

export const generateMockProfileAggregate = (): ProfileAggregate => ({
  user: { first_name: "Gabriel", joined_at: "2025-11-15T00:00:00Z" },
  totals: { sessions: 142, total_play_seconds: 47520, active_days: 38 },
  top_dimensions: {
    mood: [{ slug: "focus", score: 74, sessions: 80 }],
    cognition: [{ slug: "attention", score: 81, sessions: 92 }],
    personality: [{ slug: "conscientiousness", score: 72, sessions: 50 }]
  },
  percentiles: {
    mood: [{ slug: "focus", percentile: 78 }],
    cognition: [{ slug: "attention", percentile: 85 }],
    personality: [{ slug: "openness", percentile: 70 }]
  },
  weekly_grid: [
    { date: "2026-04-28", mood_score: 72, cognition_score: 68, session_count: 3 }
  ]
});
