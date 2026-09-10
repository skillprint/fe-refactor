'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useProfileTrends } from '../../lib/models/portal/useProfileTrends';
import { useTrendsSummary } from '../../lib/models/portal/useTrendsSummary';
import { useProfileAggregate } from '../../lib/models/portal/useProfileAggregate';
import { profileDimensionMap } from '../../lib/models/portal/ProfileAggregate';
import type { ProfileTrendPeriod } from '../../lib/models/portal/ProfileTrends';
import { PORTAL_SKILLS } from '../../app/config/skillsTaxonomy';
import { Pillar, PILLAR_LABELS, PILLARS, skillIconId, titleFromSlug } from '../../lib/skillIcons';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

const POINT_OPTIONS = [
  { value: 4, label: 'Last 4' },
  { value: 8, label: 'Last 8' },
  { value: 12, label: 'Last 12' },
];

function signed(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—';
  const r = Math.round(n);
  return `${r > 0 ? '+' : ''}${r}`;
}

/** Performance trends (SKI-131): pillar-level series from `GET /api/portal/profile/trends/`. */
export default function ProfilePerformanceTrends() {
  const [pillar, setPillar] = useState<Pillar>('mood');
  const [chartType, setChartType] = useState<'BarLine' | 'Area'>('BarLine');
  const [period, setPeriod] = useState<ProfileTrendPeriod>('weekly');
  const [points, setPoints] = useState(8);
  const [orbitView, setOrbitView] = useState<Pillar>('mood');

  const { data: trendsData, isLoading } = useProfileTrends(false, period, points);
  const { data: weekTrends } = useTrendsSummary();
  const { data: profile } = useProfileAggregate();

  const series = trendsData?.points || [];
  const summary = trendsData?.pillars?.[pillar];
  const hasPoints = series.some((p) => typeof p[pillar] === 'number');
  const bucketWord = period === 'weekly' ? 'weeks' : 'months';

  const baselines = useMemo(() => profileDimensionMap(profile), [profile]);

  // "This week by skill": per-dimension averages for the selected pillar
  // (`/trends/?range=W`) against each dimension's lifetime baseline.
  const weekRows = useMemo(() => {
    const rows = (weekTrends?.pillars?.[orbitView] || [])
      .filter((m) => typeof m.avgScore === 'number')
      .map((m) => {
        const base = baselines[m.slug]?.baselineScore ?? null;
        return {
          slug: m.slug,
          name: PORTAL_SKILLS[m.slug]?.name || titleFromSlug(m.slug),
          score: Math.round(m.avgScore),
          sessions: m.sessions,
          baseline: base === null ? null : Math.round(base),
          change: base === null ? null : Math.round(m.avgScore - base),
        };
      });
    return rows.sort((a, b) => b.score - a.score);
  }, [weekTrends, orbitView, baselines]);

  const tooltipStyle = { backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '0.75rem', color: 'var(--foreground)' };
  const baselineLine = typeof summary?.baselineScore === 'number'
    ? <ReferenceLine y={summary.baselineScore} stroke="var(--muted-foreground)" strokeDasharray="4 4" label={{ value: 'Baseline', fill: 'var(--muted-foreground)', fontSize: 11, position: 'insideTopRight' }} />
    : null;

  return (
    <section className="pp-section" id="trends">
      <div className="section-head pp-head layout-flex wrap items-end justify-between gap-2xl">
        <div className="section-head-copy">
          <h2>Performance trends</h2>
          <p className="margin-none text-muted">
            How your Skillprint is moving. Pick mood, cognition or personality and follow it {period === 'weekly' ? 'week by week' : 'month by month'}.
          </p>
        </div>
        <div className="pp-toolbar cluster wrap items-center gap-lg">
          <div className="status-tabs layout-inline-flex" role="group" aria-label="Dimension">
            {PILLARS.map((p) => (
              <button key={p} aria-pressed={pillar === p} className="status-tab" onClick={() => setPillar(p)} type="button">{PILLAR_LABELS[p]}</button>
            ))}
          </div>
          <div className="chart-view-switch layout-inline-flex" role="group" aria-label="Chart type">
            <button aria-pressed={chartType === 'BarLine'} className={chartType === 'BarLine' ? 'is-active' : ''} onClick={() => setChartType('BarLine')} type="button">Line</button>
            <button aria-pressed={chartType === 'Area'} className={chartType === 'Area' ? 'is-active' : ''} onClick={() => setChartType('Area')} type="button">Area</button>
          </div>
          <div className="field pp-compare" data-size="sm">
            <label htmlFor="ppPeriod">Period:</label>
            <select id="ppPeriod" name="period" value={period} onChange={(e) => setPeriod(e.target.value as ProfileTrendPeriod)}>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="field pp-compare" data-size="sm">
            <label htmlFor="ppPoints">Show:</label>
            <select id="ppPoints" name="points" value={points} onChange={(e) => setPoints(Number(e.target.value))}>
              {POINT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label} {bucketWord}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="pp-metric-bar filter-panel sp-card" data-pp-metrics="">
        <div className="filter-group">
          <span className="ui-label filter-label">{PILLAR_LABELS[pillar]} summary</span>
          <div className="ontology-metrics layout-grid gap-md">
            <article className="ontology-metric layout-flex flow-column justify-between border-subtle radius-compact min-width-0">
              <strong className="font-mono">{summary?.currentScore ?? '—'}</strong>
              <span className="text-muted font-xs leading-md">Current score</span>
            </article>
            <article className="ontology-metric layout-flex flow-column justify-between border-subtle radius-compact min-width-0">
              <strong className="font-mono">{summary?.baselineScore ?? '—'}</strong>
              <span className="text-muted font-xs leading-md">Lifetime baseline</span>
            </article>
            <article className="ontology-metric layout-flex flow-column justify-between border-subtle radius-compact min-width-0">
              <strong className="font-mono" style={{ color: (summary?.delta ?? 0) < 0 ? 'var(--text-danger, inherit)' : undefined }}>{signed(summary?.delta)}</strong>
              <span className="text-muted font-xs leading-md">Since you started</span>
            </article>
            <article className="ontology-metric layout-flex flow-column justify-between border-subtle radius-compact min-width-0">
              <strong className="font-mono">{summary?.consistency === null || summary?.consistency === undefined ? '—' : `${Math.round(summary.consistency)}%`}</strong>
              <span className="text-muted font-xs leading-md">Consistency</span>
            </article>
          </div>
        </div>
        <p className="field__help pp-metric-note margin-none text-muted font-xs" role="status">
          Baseline is the first score you ever recorded, so the change reads as how far you have come. Gaps in the line are {bucketWord} with no play.
        </p>
      </div>

      <article className="chart-card sp-card min-width-0">
        <div className="chart-card-head">
          <div className="chart-card-title">
            <span className="theme-label">{PILLAR_LABELS[pillar]}</span>
            <strong>{PILLAR_LABELS[pillar]} score, last {series.length || points} {bucketWord}</strong>
            <span>One point per {period === 'weekly' ? 'week' : 'month'}, against your lifetime baseline</span>
          </div>
        </div>
        
        <div className="chart-frame h-[320px]" data-pp-trends="" id="ppTrends">
          {isLoading && !trendsData ? (
            <div className="p-8 text-center h-full flex flex-col justify-center items-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></div>
          ) : !hasPoints ? (
            <div className="portal-blank">
              <span className="sp-icon-frame sp-icon-frame--md no-grow" aria-hidden="true"><svg className="sp-icon sp-icon--sm" viewBox="0 0 24 24"><use href="#ti-gamepad"></use></svg></span>
              <p className="portal-blank__title">Nothing to plot yet</p>
              <p className="portal-blank__note">This is the empty chart your {PILLAR_LABELS[pillar].toLowerCase()} scores will draw across. Play a game and the first {period === 'weekly' ? 'week' : 'month'} appears.</p>
              <Link className="button button--secondary button--sm" href="/games">Play a game <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-arrow-right"></use></svg></Link>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'BarLine' ? (
                <LineChart data={series} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)' }} dy={10} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)' }} dx={-10} />
                  <RechartsTooltip contentStyle={tooltipStyle} formatter={(value: any, name: any) => [value, name === pillar ? PILLAR_LABELS[pillar] : name]} />
                  {baselineLine}
                  <Line type="monotone" dataKey={pillar} name={pillar} stroke="var(--primary)" strokeWidth={3} connectNulls={false} dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 2, stroke: 'var(--background)' }} activeDot={{ r: 6 }} />
                </LineChart>
              ) : (
                <AreaChart data={series} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)' }} dy={10} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)' }} dx={-10} />
                  <RechartsTooltip contentStyle={tooltipStyle} formatter={(value: any, name: any) => [value, name === pillar ? PILLAR_LABELS[pillar] : name]} />
                  {baselineLine}
                  <Area type="monotone" dataKey={pillar} name={pillar} stroke="var(--primary)" connectNulls={false} fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
                </AreaChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
        
        <div className="chart-key" data-pp-trend-key="">
          <span className="key-item" data-series={pillar}><i></i>{PILLAR_LABELS[pillar]}</span>
          {typeof summary?.baselineScore === 'number' && <span className="key-item" data-series="baseline"><i></i>Baseline</span>}
        </div>
      </article>

      <article className="chart-card sp-card min-width-0">
        <div className="chart-card-head">
          <div className="chart-card-title">
            <span className="theme-label">This week</span>
            <strong>Your skills this week</strong>
            <span>One dimension at a time, this week&apos;s average against your lifetime baseline.</span>
          </div>
          <div className="chart-actions status-tabs layout-inline-flex" data-scroll-fade role="group" aria-label="Dimension">
            {PILLARS.map((p) => (
              <button key={p} aria-pressed={orbitView === p} className="status-tab" onClick={() => setOrbitView(p)} type="button">{PILLAR_LABELS[p]}</button>
            ))}
          </div>
        </div>
        
        {weekRows.length === 0 ? (
          <div className="portal-blank">
            <span className="sp-icon-frame sp-icon-frame--md no-grow" aria-hidden="true"><svg className="sp-icon sp-icon--sm" viewBox="0 0 24 24"><use href="#ti-gamepad"></use></svg></span>
            <p className="portal-blank__title">No {PILLAR_LABELS[orbitView].toLowerCase()} skill has a score this week</p>
            <p className="portal-blank__note">A finished game puts a reading on the skills it measured.</p>
            <Link className="button button--secondary button--sm" href="/games">Play a game <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-arrow-right"></use></svg></Link>
          </div>
        ) : (
          <div className="pp-breakdown__scroll">
            <div className="pp-breakdown__group" data-pillar={orbitView} role="group" aria-label={`${PILLAR_LABELS[orbitView]} skills this week`}>
              {weekRows.map((row) => (
                <Link key={row.slug} href={`/skills/${row.slug}`} className="pp-skill" data-pillar={orbitView} data-score={row.score}>
                  <svg className="sp-icon sp-icon--sm pp-skill__icon" aria-hidden="true" viewBox="0 0 24 24">
                    <use href={`#${skillIconId(orbitView, row.slug)}`}></use>
                  </svg>
                  <span className="pp-skill__name weight-medium">{row.name}</span>
                  <span className="pp-skill__track track radius-full" aria-hidden="true">
                    <i className="radius-full" style={{ '--track-fill': `${Math.max(0, Math.min(100, row.score))}%` } as React.CSSProperties}></i>
                  </span>
                  <span className="pp-skill__value font-sm">{row.score}</span>
                  <span className="font-xs text-muted" title={row.baseline === null ? 'No baseline yet' : `Baseline ${row.baseline}`}>
                    {row.change === null ? 'new' : signed(row.change)}
                  </span>
                  <svg className="sp-icon sp-icon--sm sp-icon--muted" aria-hidden="true" viewBox="0 0 24 24">
                    <use href="#ti-chevron-right"></use>
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        )}
        
        <div className="chart-key">
          <span className="key-item" data-series={orbitView}><i></i>{PILLAR_LABELS[orbitView]} this week</span>
          <span className="key-item" data-series="baseline"><i></i>Change vs baseline</span>
        </div>
      </article>
    </section>
  );
}
