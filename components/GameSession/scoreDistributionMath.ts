import type { DistributionBucket, MetricDistribution } from '../../lib/models/portal/MetricDistribution';

/** A score from the result dialog that can be set against the community. */
export interface ComparableMetric {
  pillar: 'cognition' | 'mood';
  slug: string;
  name: string;
  /** 0–100 */
  score: number;
  /** The dialog's score band, so the charts' highlight matches the score card. */
  band: string;
}

export interface ParsedBucket extends DistributionBucket {
  lo: number;
  hi: number;
}

export const parseBuckets = (histogram: DistributionBucket[]): ParsedBucket[] =>
  histogram
    .map((b) => {
      const [lo, hi] = b.range.split('-').map(Number);
      return { ...b, lo, hi };
    })
    .filter((b) => Number.isFinite(b.lo) && Number.isFinite(b.hi) && b.hi > b.lo)
    .sort((a, b) => a.lo - b.lo);

export interface DistributionSummary {
  /** Share of players (0–100) whose level is below this score. */
  percentile: number;
  /** The ten-point bucket this score falls in. */
  bucketIndex: number;
  /** The range the middle half of players fall in. */
  typicalLow: number;
  typicalHigh: number;
  totalUsers: number;
  maxCount: number;
}

/**
 * Where a score sits in a bucketed population. Players inside the score's own
 * bucket are assumed to be spread evenly across it, so a score halfway through
 * a bucket counts half of that bucket as below it.
 */
export function summarizeDistribution(distribution: MetricDistribution, score: number): DistributionSummary | null {
  const buckets = parseBuckets(distribution.histogram);
  const total = buckets.reduce((sum, b) => sum + b.count, 0);
  if (buckets.length === 0 || total === 0) return null;

  const clamped = Math.max(0, Math.min(100, score));
  const last = buckets.length - 1;
  const bucketIndex = Math.max(0, buckets.findIndex((b, i) => clamped < b.hi || i === last));

  let below = 0;
  buckets.forEach((b, i) => {
    if (i < bucketIndex) below += b.count;
    else if (i === bucketIndex) below += b.count * ((clamped - b.lo) / (b.hi - b.lo));
  });

  let running = 0;
  let typicalLow = buckets[0].lo;
  let typicalHigh = buckets[last].hi;
  let foundLow = false;
  for (const b of buckets) {
    running += b.count;
    if (!foundLow && running >= total * 0.25) {
      typicalLow = b.lo;
      foundLow = true;
    }
    if (running >= total * 0.75) {
      typicalHigh = b.hi;
      break;
    }
  }

  return {
    percentile: Math.round((below / total) * 100),
    bucketIndex,
    typicalLow,
    typicalHigh,
    totalUsers: total,
    maxCount: Math.max(...buckets.map((b) => b.count)),
  };
}

/** Narrower than this and the bell collapses to a spike; wide enough to read. */
export const MIN_SD = 5;
/** Points per bucket when the buckets are spread into pseudo-samples. */
const SPREAD = 5;

export interface PopulationModel {
  mean: number;
  sd: number;
  total: number;
  /** Weighted pseudo-samples: each bucket spread evenly across its range. */
  samples: { x: number; w: number }[];
  /** Gaussian kernel bandwidth for the density estimate, in score points. */
  bandwidth: number;
}

/**
 * Mean, spread and kernel bandwidth of a bucketed population. Each bucket's
 * players are spread evenly across its ten points, which keeps the density
 * estimate from showing a comb of spikes at bucket midpoints.
 */
export function fitPopulation(distribution: MetricDistribution): PopulationModel | null {
  const buckets = parseBuckets(distribution.histogram);
  const total = buckets.reduce((sum, b) => sum + b.count, 0);
  if (buckets.length === 0 || total === 0) return null;

  const samples: { x: number; w: number }[] = [];
  for (const b of buckets) {
    if (b.count === 0) continue;
    const step = (b.hi - b.lo) / SPREAD;
    for (let k = 0; k < SPREAD; k++) {
      samples.push({ x: b.lo + step * (k + 0.5), w: b.count / SPREAD });
    }
  }
  const mean = samples.reduce((sum, s) => sum + s.x * s.w, 0) / total;
  const variance = samples.reduce((sum, s) => sum + s.w * (s.x - mean) ** 2, 0) / total;
  const sd = Math.max(MIN_SD, Math.sqrt(variance));
  // Silverman's rule of thumb, floored so a tight population still draws a curve.
  const bandwidth = Math.max(3, 0.9 * sd * total ** -0.2);
  return { mean, sd, total, samples, bandwidth };
}

/** Gaussian kernel density estimate at each x, as a probability density per score point. */
export function kernelDensity(model: PopulationModel, xs: number[]): number[] {
  const { samples, bandwidth, total } = model;
  const norm = 1 / (total * bandwidth * Math.sqrt(2 * Math.PI));
  return xs.map((x) => {
    let sum = 0;
    for (const s of samples) {
      const u = (x - s.x) / bandwidth;
      sum += s.w * Math.exp(-0.5 * u * u);
    }
    return sum * norm;
  });
}

export const normalPdf = (z: number): number => Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);

/** Standard normal CDF, via Abramowitz & Stegun 7.1.26 (error under 1.5e-7). */
export function normalCdf(z: number): number {
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  const poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  const erf = 1 - poly * Math.exp(-x * x);
  return 0.5 * (1 + sign * erf);
}

export const zScore = (model: PopulationModel, score: number): number => (score - model.mean) / model.sd;

/** The one-line verdict, in plain words rather than a percentile. */
export function comparisonHeadline(percentile: number): string {
  if (percentile >= 90) return 'In the top 10% of players';
  if (percentile >= 75) return 'In the top quarter of players';
  if (percentile >= 55) return 'Above most players';
  if (percentile >= 45) return 'Right around the middle';
  if (percentile >= 25) return 'Below the middle, with room to grow';
  return 'Still building, like many first sessions';
}

/** The sentence under the headline: the percentile and where the middle half of players sit. */
export function comparisonSentence(metric: ComparableMetric, summary: DistributionSummary): string {
  const players = `${summary.totalUsers.toLocaleString()} ${summary.totalUsers === 1 ? 'player' : 'players'}`;
  // "Higher than 100% of players" cannot be true of the player themselves.
  const higherThan = Math.min(99, summary.percentile);
  const standing = higherThan === 0
    ? `Your ${metric.name} score of ${metric.score} is at the low end of the ${players} with ${metric.name} scores.`
    : `Your ${metric.name} score of ${metric.score} is higher than about ${higherThan}% of the ${players} with ${metric.name} scores.`;
  return `${standing} Half of all players land between ${summary.typicalLow} and ${summary.typicalHigh}.`;
}
