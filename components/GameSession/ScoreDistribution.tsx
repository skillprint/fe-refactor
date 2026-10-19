'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useUserSession } from '../../app/hooks/useUserSession';
import { portalFetch } from '../../lib/models/portal/portalFetch';
import { MetricDistribution, generateMockMetricDistribution } from '../../lib/models/portal/MetricDistribution';
import { LongitudinalMetric, generateMockLongitudinalMetric } from '../../lib/models/portal/LongitudinalMetric';
import {
  ComparableMetric,
  DistributionSummary,
  PopulationModel,
  comparisonHeadline,
  comparisonSentence,
  fitPopulation,
  kernelDensity,
  normalCdf,
  normalPdf,
  parseBuckets,
  summarizeDistribution,
  zScore,
} from './scoreDistributionMath';

export type { ComparableMetric } from './scoreDistributionMath';

/** Fewer players than this and a percentile would be noise, so we say so instead. */
export const MIN_COMPARABLE_PLAYERS = 5;
/** Daily buckets; the weekly "6M" range only catches rollups dated on its step days. */
const HISTORY_RANGE = 'M';

const keyOf = (m: ComparableMetric) => `${m.pillar}:${m.slug}`;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const ordinal = (n: number) => {
  const v = n % 100;
  const suffix = v >= 11 && v <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th';
  return `${n}${suffix}`;
};

interface ComparisonEntry {
  distribution: MetricDistribution | null;
  /** Past daily averages for this player, oldest first, today left out. */
  history: number[];
  loading: boolean;
  error: boolean;
}

/** Today's rollup may already include this session, so only earlier days count as history. */
function historyFromMetric(metric: LongitudinalMetric): number[] {
  const today = new Date().toISOString().slice(0, 10);
  return metric.buckets.filter((b) => b.score !== null && b.date !== today).map((b) => b.score as number);
}

/**
 * Population and personal history for every comparable score, fetched once per
 * score in parallel. A failed history leaves the chart without faded points;
 * a failed distribution is the only error that hides a chart.
 */
function useComparisonData(metrics: ComparableMetric[], useSyntheticData: boolean): Record<string, ComparisonEntry> {
  const { userToken } = useUserSession();
  const [entries, setEntries] = useState<Record<string, ComparisonEntry>>({});
  const fetched = useRef(new Set<string>());
  const keys = metrics.map(keyOf).join('|');

  useEffect(() => {
    if (!useSyntheticData && !userToken) return;
    const todo = metrics.filter((m) => !fetched.current.has(keyOf(m)));
    if (todo.length === 0) return;
    let cancelled = false;
    todo.forEach((m) => fetched.current.add(keyOf(m)));
    setEntries((prev) => ({
      ...prev,
      ...Object.fromEntries(todo.map((m) => [keyOf(m), { distribution: null, history: [], loading: true, error: false }])),
    }));

    todo.forEach(async (m) => {
      let entry: ComparisonEntry;
      if (useSyntheticData) {
        await new Promise((resolve) => setTimeout(resolve, 400)); // Simulate network delay
        entry = {
          distribution: generateMockMetricDistribution(m.pillar, m.slug),
          history: historyFromMetric(generateMockLongitudinalMetric(m.pillar, m.slug)),
          loading: false,
          error: false,
        };
      } else {
        const path = `/metrics/${encodeURIComponent(m.pillar)}/${encodeURIComponent(m.slug)}`;
        const [dist, hist] = await Promise.allSettled([
          portalFetch<MetricDistribution>(`${path}/distribution/`, userToken),
          portalFetch<LongitudinalMetric>(`${path}/?range=${HISTORY_RANGE}`, userToken),
        ]);
        if (dist.status === 'rejected') console.error('Failed to fetch metric distribution:', dist.reason);
        if (hist.status === 'rejected') console.error('Failed to fetch metric history:', hist.reason);
        entry = {
          distribution: dist.status === 'fulfilled' ? dist.value : null,
          history: hist.status === 'fulfilled' ? historyFromMetric(hist.value) : [],
          loading: false,
          error: dist.status === 'rejected',
        };
      }
      if (!cancelled) setEntries((prev) => ({ ...prev, [keyOf(m)]: entry }));
    });

    return () => {
      // Strict mode runs effects twice: let the re-run fetch what this run dropped.
      cancelled = true;
      todo.forEach((m) => fetched.current.delete(keyOf(m)));
    };
    // `metrics` is a fresh array every render; `keys` is its identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keys, userToken, useSyntheticData]);

  return entries;
}

interface ScoreComparisonProps {
  metrics: ComparableMetric[];
  /** Dev only: render a mock population and history instead of fetching. */
  useSyntheticData?: boolean;
}

/**
 * "How you compare": one skill or mood score from this session set against
 * every player's level for it, as a smoothed density curve and as a bell
 * curve with the player's point on it, then every comparable score as a small
 * bell with the player's past month faded behind today. Renders nothing when
 * there is nothing comparable.
 */
export default function ScoreComparison({ metrics, useSyntheticData = false }: ScoreComparisonProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const entries = useComparisonData(metrics, useSyntheticData);
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
      <SelectedMetricPanel metric={selected} entry={entries[keyOf(selected)]} />

      <div className="score-dist__glance-head">
        <span className="ui-label">All your scores at a glance</span>
        <span className="score-dist__glance-note font-xs">Today's point in colour, the past 30 days faded behind it</span>
      </div>
      <div className="score-dist__glance">
        {metrics.map((m) => (
          <MiniBell key={keyOf(m)} metric={m} entry={entries[keyOf(m)]} />
        ))}
      </div>
    </section>
  );
}

const note = (message: string, spinning = false) => (
  <p className="margin-none text-muted font-sm layout-flex items-center gap-md">
    {spinning && <span aria-hidden="true" className="session-spinner" style={{ width: '18px', height: '18px' }}></span>}
    <span>{message}</span>
  </p>
);

interface SelectedMetricPanelProps {
  metric: ComparableMetric;
  entry?: ComparisonEntry;
}

function SelectedMetricPanel({ metric, entry }: SelectedMetricPanelProps) {
  const distribution = entry?.distribution ?? null;
  const summary = distribution ? summarizeDistribution(distribution, metric.score) : null;
  const model = distribution ? fitPopulation(distribution) : null;

  let body: React.ReactNode;
  if (!entry || entry.loading) {
    body = note(`Comparing your ${metric.name} score with other players.`, true);
  } else if (!distribution || !summary || !model) {
    body = note(entry.error
      ? `We couldn't load the ${metric.name} comparison right now.`
      : `Not enough players have ${metric.name} scores yet to compare against.`);
  } else if (summary.totalUsers < MIN_COMPARABLE_PLAYERS) {
    body = note(`Only ${summary.totalUsers} ${summary.totalUsers === 1 ? 'player has' : 'players have'} ${metric.name} scores so far, too few to compare against. Check back as more people play.`);
  } else {
    const buckets = parseBuckets(distribution.histogram);
    body = (
      <>
        <div className="score-dist__charts">
          <figure className="score-dist__figure margin-none">
            <figcaption className="ui-label score-dist__caption">Where players&rsquo; {metric.name} levels fall</figcaption>
            <DensityChart distribution={distribution} model={model} metric={metric} summary={summary} />
          </figure>
          <figure className="score-dist__figure margin-none">
            <figcaption className="ui-label score-dist__caption">On the bell curve</figcaption>
            <BellChart model={model} metric={metric} history={entry.history} size="large" />
            <span className="score-dist__fit font-xs">
              Bell fitted to {summary.totalUsers.toLocaleString()} players: average {Math.round(model.mean)}, spread ±{Math.round(model.sd)}
            </span>
          </figure>
        </div>
        <div className="layout-grid gap-sm">
          <strong className="score-dist__headline layout-block">{comparisonHeadline(summary.percentile)}</strong>
          <p className="score-dist__sentence margin-none font-sm leading-md">{comparisonSentence(metric, summary)}</p>
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
      </>
    );
  }

  return (
    <div className="score-dist layout-grid" data-band={metric.band} data-pillar={metric.pillar} data-dimension={metric.slug}>
      {body}
    </div>
  );
}

const anchorFor = (fraction: number): 'start' | 'middle' | 'end' =>
  fraction < 0.12 ? 'start' : fraction > 0.88 ? 'end' : 'middle';

interface DensityChartProps {
  distribution: MetricDistribution;
  model: PopulationModel;
  metric: ComparableMetric;
  summary: DistributionSummary;
}

/**
 * Kernel density estimate of the population over the 0–100 score axis, drawn
 * as a wash and a 2px line over the faint ten-point buckets it was smoothed
 * from, with the player's score marked on the curve.
 */
function DensityChart({ distribution, model, metric, summary }: DensityChartProps) {
  const W = 600, H = 170, PL = 10, PR = 10, PT = 30, PB = 24;
  const base = H - PB;
  const buckets = parseBuckets(distribution.histogram);
  const xs = Array.from({ length: 101 }, (_, i) => i);
  const density = kernelDensity(model, xs);
  const bucketDensity = buckets.map((b) => b.count / (model.total * (b.hi - b.lo)));
  const yMax = Math.max(...density, ...bucketDensity) * 1.1 || 1;
  const x = (v: number) => PL + (v / 100) * (W - PL - PR);
  const y = (d: number) => PT + (base - PT) * (1 - d / yMax);

  const line = xs.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(v).toFixed(1)},${y(density[i]).toFixed(1)}`).join(' ');
  const area = `${line} L${x(100).toFixed(1)},${base} L${x(0).toFixed(1)},${base} Z`;
  const score = clamp(metric.score, 0, 100);
  const scoreY = y(kernelDensity(model, [score])[0]);
  const label = `Smoothed curve of where ${summary.totalUsers} players' ${metric.name} levels fall between 0 and 100. Your score of ${metric.score} is marked on it.`;

  return (
    <svg className="score-dist__svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
      {buckets.map((b, i) => (
        <rect
          key={b.range}
          className="score-dist__hist"
          x={x(b.lo) + 1}
          y={y(bucketDensity[i])}
          width={Math.max(0, x(b.hi) - x(b.lo) - 2)}
          height={Math.max(0, base - y(bucketDensity[i]))}
        >
          <title>{`${b.lo}–${b.hi}: ${b.count.toLocaleString()} ${b.count === 1 ? 'player' : 'players'}`}</title>
        </rect>
      ))}
      <path className="score-dist__area" d={area} />
      <path className="score-dist__line" d={line} />
      <line className="score-dist__baseline" x1={PL} x2={W - PR} y1={base} y2={base} />
      <line className="score-dist__marker" x1={x(score)} x2={x(score)} y1={scoreY} y2={base} />
      <circle className="score-dist__dot" cx={x(score)} cy={scoreY} r={6} />
      <text className="score-dist__you-label" x={x(score)} y={scoreY - 12} textAnchor={anchorFor(score / 100)}>You · {metric.score}</text>
      <text className="score-dist__tick" x={x(0)} y={H - 6} textAnchor="start">0</text>
      <text className="score-dist__tick" x={x(50)} y={H - 6} textAnchor="middle">50</text>
      <text className="score-dist__tick" x={x(100)} y={H - 6} textAnchor="end">100</text>
    </svg>
  );
}

const Z_MAX = 3.5;
const BANDS = [
  { from: -1, to: 1, kind: 'inner' },
  { from: -2, to: -1, kind: 'mid' },
  { from: 1, to: 2, kind: 'mid' },
  { from: -3, to: -2, kind: 'outer' },
  { from: 2, to: 3, kind: 'outer' },
  { from: -Z_MAX, to: -3, kind: 'tail' },
  { from: 3, to: Z_MAX, kind: 'tail' },
];
/** The share of a normal population in each band, placed where the band has room. */
const BAND_LABELS = [
  { z: -0.5, text: '34.1%', lift: 0.42 },
  { z: 0.5, text: '34.1%', lift: 0.42 },
  { z: -1.5, text: '13.6%', lift: 0.13 },
  { z: 1.5, text: '13.6%', lift: 0.13 },
  { z: -2.5, text: '2.1%', lift: 0.1 },
  { z: 2.5, text: '2.1%', lift: 0.1 },
];

interface BellChartProps {
  model: PopulationModel;
  metric: ComparableMetric;
  history: number[];
  size: 'large' | 'small';
}

/**
 * A stylised normal curve with the ±1σ, ±2σ and ±3σ bands shaded, fitted to
 * the population's mean and spread. The player's score sits on the curve as a
 * dot; earlier daily scores sit behind it, fading with age. The large size
 * adds the band shares and the scores at each σ step on the axis.
 */
function BellChart({ model, metric, history, size }: BellChartProps) {
  const large = size === 'large';
  const W = large ? 600 : 220;
  const H = large ? 210 : 92;
  const PL = large ? 10 : 6;
  const PR = PL;
  const PT = large ? 30 : 14;
  const PB = large ? 34 : 10;
  const base = H - PB;
  const plotH = base - PT;
  const x = (z: number) => PL + ((z + Z_MAX) / (2 * Z_MAX)) * (W - PL - PR);
  const y = (z: number) => base - plotH * (normalPdf(z) / normalPdf(0));
  const curve = (from: number, to: number, steps = 40) =>
    Array.from({ length: steps + 1 }, (_, i) => {
      const z = from + ((to - from) * i) / steps;
      return `${x(z).toFixed(1)},${y(z).toFixed(1)}`;
    });
  const bandPath = (from: number, to: number) =>
    `M${x(from).toFixed(1)},${base} L${curve(from, to).join(' L')} L${x(to).toFixed(1)},${base} Z`;
  const linePath = `M${curve(-Z_MAX, Z_MAX, 120).join(' L')}`;

  const rawZ = zScore(model, metric.score);
  const z = clamp(rawZ, -3.3, 3.3);
  const percentile = Math.round(normalCdf(rawZ) * 100);
  const pastZ = history.map((h) => clamp(zScore(model, h), -3.3, 3.3));
  const scoreAt = (step: number) => Math.round(model.mean + step * model.sd);
  const pastText = history.length > 0 ? ` ${history.length} earlier ${history.length === 1 ? 'day sits' : 'days sit'} faded behind it.` : '';
  const label = `${metric.name} on a bell curve fitted to other players. Your score of ${metric.score} is at about the ${ordinal(percentile)} percentile.${pastText}`;

  return (
    <svg className={`score-dist__svg score-dist__bell score-dist__bell--${size}`} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
      {BANDS.map((b) => (
        <path key={`${b.from}:${b.to}`} className={`score-dist__band score-dist__band--${b.kind}`} d={bandPath(b.from, b.to)} />
      ))}
      <path className="score-dist__line" d={linePath} />
      <line className="score-dist__baseline" x1={PL} x2={W - PR} y1={base} y2={base} />
      {large && BAND_LABELS.map((l) => (
        <text key={l.z} className="score-dist__band-label" x={x(l.z)} y={base - plotH * l.lift} textAnchor="middle">{l.text}</text>
      ))}
      {large && [-2, -1, 0, 1, 2].map((step) => {
        const value = scoreAt(step);
        if (value < 0 || value > 100) return null;
        return (
          <text key={step} className="score-dist__tick" x={x(step)} y={H - 6} textAnchor="middle">{value}</text>
        );
      })}
      {pastZ.map((pz, i) => (
        <circle
          key={i}
          className="score-dist__past"
          cx={x(pz)}
          cy={y(pz)}
          r={large ? 4 : 3}
          style={{ opacity: 0.15 + 0.45 * ((i + 1) / pastZ.length) }}
        />
      ))}
      {/* The label lives in the headroom above the curve, clear of the band
          shares, with a leader down to the dot. */}
      {large && <line className="score-dist__leader" x1={x(z)} x2={x(z)} y1={PT - 4} y2={y(z) - 9} />}
      <circle className="score-dist__dot" cx={x(z)} cy={y(z)} r={large ? 7 : 4.5} />
      {large && (
        <text className="score-dist__you-label" x={x(z)} y={PT - 10} textAnchor={anchorFor((z + Z_MAX) / (2 * Z_MAX))}>
          You · {metric.score} · {ordinal(percentile)} percentile
        </text>
      )}
    </svg>
  );
}

interface MiniBellProps {
  metric: ComparableMetric;
  entry?: ComparisonEntry;
}

function MiniBell({ metric, entry }: MiniBellProps) {
  const distribution = entry?.distribution ?? null;
  const model = distribution ? fitPopulation(distribution) : null;
  const total = model?.total ?? 0;
  const ready = !!model && total >= MIN_COMPARABLE_PLAYERS;
  const history = entry?.history ?? [];
  const percentile = model ? Math.round(normalCdf(zScore(model, metric.score)) * 100) : null;

  let footnote: string;
  if (!entry || entry.loading) footnote = 'Comparing…';
  else if (!ready) footnote = entry.error ? 'Comparison unavailable' : 'Not enough players yet';
  else footnote = `${ordinal(percentile as number)} percentile · ${history.length === 0 ? 'first scored day' : `${history.length} earlier ${history.length === 1 ? 'day' : 'days'}`}`;

  return (
    <div className="score-dist__mini layout-grid" data-band={metric.band}>
      <div className="layout-flex items-baseline justify-between gap-md">
        <span className="ui-label score-dist__mini-name">{metric.name}</span>
        <strong className="score-dist__mini-score">{metric.score}</strong>
      </div>
      {ready ? (
        <BellChart model={model as PopulationModel} metric={metric} history={history} size="small" />
      ) : (
        <div className="score-dist__mini-empty" aria-hidden="true"></div>
      )}
      <span className="score-dist__mini-note font-xs">{footnote}</span>
      {history.length > 0 && <span className="sr-only">Earlier daily scores, oldest first: {history.join(', ')}.</span>}
    </div>
  );
}
