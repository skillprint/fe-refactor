/** `GET /api/portal/metrics/{pillar}/{dimension}/?range=D|W|M|6M|Y` — camelCase on the wire. */

export type MetricRange = 'D' | 'W' | 'M' | '6M' | 'Y';

export interface BucketItem {
  label: string;
  date: string;
  score: number | null;
  sessionCount: number;
  isEmpty: boolean;
}

export interface LongitudinalMetric {
  pillar: string;
  dimension: string;
  displayName: string;
  about: string;
  range: MetricRange | string;
  period: { start: string; end: string };
  average: number | null;
  buckets: BucketItem[];
  trend: { direction: string; magnitudePct: number | null; label: string };
  comparison: {
    thisPeriod: { label: string; score: number | null };
    priorPeriod: { label: string; score: number | null };
    delta: number | null;
    deltaPct: number | null;
  };
  stats: { sessions: number; totalPlaySeconds: number; peakScore: number | null; consistency: number | null };
  /** null until percentile ranks are scheduled (tracked separately on the backend). */
  percentile: number | null;
  gamesThatTrainThis: { id: number; name: string; slug: string }[];
}

export const generateMockLongitudinalMetric = (): LongitudinalMetric => ({
  pillar: 'mood',
  dimension: 'focus',
  displayName: 'Focus',
  about: 'Deep concentration',
  range: 'W',
  period: { start: '2026-04-27', end: '2026-05-04' },
  average: 68,
  buckets: [
    { label: 'Mon', date: '2026-04-28', score: 72, sessionCount: 2, isEmpty: false },
    { label: 'Tue', date: '2026-04-29', score: null, sessionCount: 0, isEmpty: true },
    { label: 'Wed', date: '2026-04-30', score: 65, sessionCount: 1, isEmpty: false },
  ],
  trend: { direction: 'improving', magnitudePct: 8, label: 'Up 8%' },
  comparison: {
    thisPeriod: { label: 'Recent', score: 72 },
    priorPeriod: { label: 'Prior', score: 64 },
    delta: 8,
    deltaPct: 12,
  },
  stats: { sessions: 5, totalPlaySeconds: 1650, peakScore: 81, consistency: null },
  percentile: null,
  gamesThatTrainThis: [{ id: 42, name: 'Hextris', slug: 'hextris' }],
});
