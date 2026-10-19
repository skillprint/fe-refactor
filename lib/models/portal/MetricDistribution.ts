/**
 * `GET /api/portal/metrics/{pillar}/{dimension}/distribution/` — how every
 * player's current level for one skill, mood or trait is spread out, in ten
 * buckets of ten points. camelCase on the wire.
 */

export interface DistributionBucket {
  /** "0-10", "10-20", … "90-100"; the last bucket includes 100. */
  range: string;
  count: number;
}

export interface MetricDistribution {
  pillar: string;
  dimension: string;
  histogram: DistributionBucket[];
  totalUsers: number;
  /** The requesting player's own profile level, or null when they have none yet. */
  yourScore: number | null;
}

const BUCKET_EDGES = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

/**
 * A bell-shaped population whose peak moves with the dimension name, so the
 * dev dialog shows a different curve for each chip.
 */
export const generateMockMetricDistribution = (
  pillar: string = 'cognition',
  dimension: string = 'attention',
): MetricDistribution => {
  const seed = [...dimension].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const peak = 3 + (seed % 4); // bucket index 3..6, i.e. a peak between 30 and 70
  const histogram = BUCKET_EDGES.slice(0, -1).map((lo, i) => ({
    range: `${lo}-${BUCKET_EDGES[i + 1]}`,
    count: Math.round(72 * Math.exp(-((i - peak) ** 2) / 4.5)) + 2,
  }));
  return {
    pillar,
    dimension,
    histogram,
    totalUsers: histogram.reduce((sum, b) => sum + b.count, 0),
    yourScore: 64,
  };
};
