'use client';

import React, { useState } from 'react';
import { useMetricDistribution } from '../../lib/models/portal/useMetricDistribution';
import type { DistributionBucket, MetricDistribution } from '../../lib/models/portal/MetricDistribution';

/** A score from the result dialog that can be set against the community. */
export interface ComparableMetric {
  pillar: 'cognition' | 'mood';
  slug: string;
  name: string;
  /** 0–100 */
  score: number;
  /** The dialog's score band, so the chart's highlight matches the score card. */
  band: string;
}

/** Fewer players than this and a percentile would be noise, so we say so instead. */
export const MIN_COMPARABLE_PLAYERS = 5;

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

interface ParsedBucket extends DistributionBucket {
  lo: number;
  hi: number;
}

const parseBuckets = (histogram: DistributionBucket[]): ParsedBucket[] =>
  histogram
    .map((b) => {
      const [lo, hi] = b.range.split('-').map(Number);
      return { ...b, lo, hi };
    })
    .filter((b) => Number.isFinite(b.lo) && Number.isFinite(b.hi))
    .sort((a, b) => a.lo - b.lo);

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

interface ScoreComparisonProps {
  metrics: ComparableMetric[];
  /** Dev only: render a mock population instead of fetching. */
  useSyntheticData?: boolean;
}

/**
 * "How you compare": one skill or mood score from this session set against
 * every player's level for it. A chip row picks the score when the session
 * produced more than one. Renders nothing when there is nothing comparable.
 */
export default function ScoreComparison({ metrics, useSyntheticData = false }: ScoreComparisonProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const keyOf = (m: ComparableMetric) => `${m.pillar}:${m.slug}`;
  const selected = metrics.find((m) => keyOf(m) === selectedKey) ?? metrics[0];

  if (!selected) return null;

  return (
    <section aria-labelledby="scoreComparisonTitle" className="game-result__section separator-top layout-grid relative">
      <h3 className="portal-eyebrow game-result__section-title" id="scoreComparisonTitle">How you compare</h3>
      {metrics.length > 1 && (
        <div className="score-dist__chips" role="group" aria-label="Score to compare">
          {metrics.map((m) => (
            <button
              key={keyOf(m)}
              type="button"
              className="ui-tag"
              aria-pressed={keyOf(m) === keyOf(selected)}
              onClick={() => setSelectedKey(keyOf(m))}
            >
              {m.name}
              <span className="score-dist__chip-score">{m.score}</span>
            </button>
          ))}
        </div>
      )}
      <DistributionPanel key={keyOf(selected)} metric={selected} useSyntheticData={useSyntheticData} />
    </section>
  );
}

interface DistributionPanelProps {
  metric: ComparableMetric;
  useSyntheticData: boolean;
}

function DistributionPanel({ metric, useSyntheticData }: DistributionPanelProps) {
  const { data, isLoading, error } = useMetricDistribution(metric.pillar, metric.slug, useSyntheticData);
  const matches = !!data && data.pillar === metric.pillar && data.dimension === metric.slug;
  const summary = matches ? summarizeDistribution(data, metric.score) : null;

  const note = (message: string, spinning = false) => (
    <p className="margin-none text-muted font-sm layout-flex items-center gap-md">
      {spinning && <span aria-hidden="true" className="session-spinner" style={{ width: '18px', height: '18px' }}></span>}
      <span>{message}</span>
    </p>
  );

  let body: React.ReactNode;
  if (!matches && (isLoading || (!error && !data))) {
    body = note(`Comparing your ${metric.name} score with other players.`, true);
  } else if (!matches || !summary) {
    body = note(error
      ? `We couldn't load the ${metric.name} comparison right now.`
      : `Not enough players have ${metric.name} scores yet to compare against.`);
  } else if (summary.totalUsers < MIN_COMPARABLE_PLAYERS) {
    body = note(`Only ${summary.totalUsers} ${summary.totalUsers === 1 ? 'player has' : 'players have'} ${metric.name} scores so far, too few to compare against. Check back as more people play.`);
  } else {
    body = (
      <>
        <DistributionChart distribution={data} metric={metric} summary={summary} />
        <div className="layout-grid gap-sm">
          <strong className="score-dist__headline layout-block">{comparisonHeadline(summary.percentile)}</strong>
          <p className="score-dist__sentence margin-none font-sm leading-md">{comparisonSentence(metric, summary)}</p>
        </div>
      </>
    );
  }

  return (
    <div className="score-dist layout-grid" data-band={metric.band} data-pillar={metric.pillar} data-dimension={metric.slug}>
      {body}
    </div>
  );
}

interface DistributionChartProps {
  distribution: MetricDistribution;
  metric: ComparableMetric;
  summary: DistributionSummary;
}

/**
 * Ten thin columns, one per ten-point bucket; the player's own bucket wears the
 * score band's colour and carries a "You" flag, the rest stay muted. The same
 * numbers sit in a visually hidden table for screen readers.
 */
function DistributionChart({ distribution, metric, summary }: DistributionChartProps) {
  const buckets = parseBuckets(distribution.histogram);
  const label = `Where players' ${metric.name} levels fall, from 0 to 100. Your score of ${metric.score} is in the ${buckets[summary.bucketIndex]?.lo}–${buckets[summary.bucketIndex]?.hi} range.`;

  return (
    <figure className="score-dist__chart margin-none">
      <div className="score-dist__bars" role="img" aria-label={label}>
        {buckets.map((b, i) => {
          const isYou = i === summary.bucketIndex;
          const pct = summary.maxCount > 0 ? (b.count / summary.maxCount) * 100 : 0;
          return (
            <div
              key={b.range}
              className="score-dist__bin"
              data-you={isYou ? 'true' : undefined}
              title={`${b.lo}–${b.hi}: ${b.count.toLocaleString()} ${b.count === 1 ? 'player' : 'players'}${isYou ? ' (you)' : ''}`}
            >
              {isYou && <span className="score-dist__you" aria-hidden="true">You</span>}
              <span className="score-dist__bar" style={{ height: `${b.count > 0 ? Math.max(pct, 4) : 0}%` }}></span>
            </div>
          );
        })}
      </div>
      <div className="score-dist__axis" aria-hidden="true">
        <span>0</span><span>50</span><span>100</span>
      </div>
      <table className="sr-only">
        <caption>{metric.name} levels across {summary.totalUsers.toLocaleString()} players</caption>
        <thead><tr><th scope="col">Score range</th><th scope="col">Players</th></tr></thead>
        <tbody>
          {buckets.map((b, i) => (
            <tr key={b.range}><th scope="row">{b.lo} to {b.hi}{i === summary.bucketIndex ? ' (your score)' : ''}</th><td>{b.count}</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
