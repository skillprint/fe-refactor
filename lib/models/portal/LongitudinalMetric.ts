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

/**
 * Thirty daily buckets with a scattering of scored days, seeded by the
 * dimension so each score in the dev result dialog has its own history.
 */
const generateMockHistoryBuckets = (dimension: string): BucketItem[] => {
  const seed = [...dimension].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const today = new Date();
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (29 - i));
    const scored = (seed * 7 + i * 13) % 5 < 2 && i < 29;
    return {
      label: String(d.getDate()).padStart(2, '0'),
      date: d.toISOString().slice(0, 10),
      score: scored ? Math.max(5, Math.min(95, 35 + (seed % 20) + Math.round(i * 0.9) + ((seed * (i + 3)) % 17) - 8)) : null,
      sessionCount: scored ? 1 + (i % 2) : 0,
      isEmpty: !scored,
    };
  });
};

export const generateMockLongitudinalMetric = (pillar?: string, dimension?: string): LongitudinalMetric => ({
  pillar: pillar ?? 'mood',
  dimension: dimension ?? 'focus',
  displayName: 'Focus',
  about: 'Deep concentration',
  range: dimension ? 'M' : 'W',
  period: { start: '2026-04-27', end: '2026-05-04' },
  average: 68,
  buckets: dimension ? generateMockHistoryBuckets(dimension) : [
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
