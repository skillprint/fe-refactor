export interface BucketItem {
  label: string;
  date: string;
  score: number | null;
  session_count: number;
  is_empty: boolean;
}

export interface LongitudinalMetric {
  pillar: string;
  dimension: string;
  display_name: string;
  about: string;
  range: string;
  period: { start: string; end: string };
  average: number;
  buckets: BucketItem[];
  trend: { direction: string; magnitude_pct: number; label: string };
  comparison: {
    this_period: { label: string; score: number };
    prior_period: { label: string; score: number };
    delta: number;
    delta_pct: number;
  };
  stats: { sessions: number; total_play_seconds: number; peak_score: number; consistency: number | null };
  percentile: number | null;
  games_that_train_this: { id: number; name: string; slug: string }[];
}

export const generateMockLongitudinalMetric = (): LongitudinalMetric => ({
  pillar: "mood",
  dimension: "focus",
  display_name: "Focus",
  about: "Deep concentration",
  range: "W",
  period: { start: "2026-04-27", end: "2026-05-04" },
  average: 68,
  buckets: [
    { label: "Mon", date: "2026-04-28", score: 72, session_count: 2, is_empty: false }
  ],
  trend: { direction: "improving", magnitude_pct: 8, label: "Up 8%" },
  comparison: {
    this_period: { label: "Recent", score: 72 },
    prior_period: { label: "Prior", score: 64 },
    delta: 8,
    delta_pct: 12
  },
  stats: { sessions: 5, total_play_seconds: 1650, peak_score: 81, consistency: null },
  percentile: null,
  games_that_train_this: [{ id: 42, name: "Hextris", slug: "hextris" }]
});
