'use client';

import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import type { SkillCatalogEntry } from '@/lib/skillCatalog';
import type { LongitudinalMetric, MetricRange } from '@/lib/models/portal/LongitudinalMetric';

interface SkillTrendSectionProps {
  skill: SkillCatalogEntry;
  metric: LongitudinalMetric | null;
  isLoading: boolean;
  range: MetricRange;
  onRangeChange: (range: MetricRange) => void;
}

const RANGES: { value: MetricRange; label: string }[] = [
  { value: 'W', label: 'Last week' },
  { value: 'M', label: 'Last month' },
  { value: '6M', label: 'Last 6 months' },
];

function formatPlaySeconds(seconds: number): string {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

export function SkillTrendSection({ skill, metric, isLoading, range, onRangeChange }: SkillTrendSectionProps) {
  const delta = metric?.comparison?.delta ?? null;
  const deltaPct = metric?.comparison?.deltaPct ?? null;
  const direction = metric?.trend?.direction || 'flat';
  const chartData = (metric?.buckets || []).map((b) => ({ label: b.label, score: b.score, sessions: b.sessionCount }));
  const hasPoints = chartData.some((b) => typeof b.score === 'number');

  return (
    <section aria-labelledby="trendTitle" className="stat-section separator-top" id="progression">
      <div className="stat-section__head layout-flex items-end justify-between gap-2xl wrap">
        <div className="min-width-0">
          <span className="eyebrow eyebrow--compact">Progression</span>
          <h2 className="portal-section__title" id="trendTitle">How it has changed</h2>
        </div>
        <div className="layout-inline-flex button-group no-grow padding-none" role="group" aria-label="Range">
          {RANGES.map((r) => (
            <button
              key={r.value}
              aria-pressed={range === r.value}
              className={`button-group__item ${range === r.value ? 'is-active' : ''}`}
              onClick={() => onRangeChange(r.value)}
              type="button"
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      
      <p className="stat-section__lede margin-none text-muted">
        Your {skill.name} score across the selected range, against your lifetime baseline.
      </p>

      <div className="stat-trends layout-grid gap-2xl items-start mt-6">
        <div className="stat-trend sp-panel">
          <div className="stat-trend__head layout-flex items-start justify-between gap-lg wrap">
            <div className="min-width-0">
              <span className="ui-label layout-block">Change over period</span>
              <strong className="stat-trend__value layout-block">
                {delta === null ? '—' : `${delta > 0 ? '+' : ''}${Math.round(delta)} pts`}
              </strong>
              <span className="layout-block font-sm text-muted">
                {metric?.trend?.label || (direction === 'improving' ? 'Upward trend' : direction === 'declining' ? 'Downward trend' : 'Holding steady')}
              </span>
            </div>
            {deltaPct !== null && (
              <span className="ui-badge ui-badge--pill ui-badge--md ui-badge--leading stat-trend__badge">
                <svg className="ui-badge__icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-trending"></use></svg>
                <span>{deltaPct > 0 ? '+' : ''}{Math.round(deltaPct)}%</span>
              </span>
            )}
          </div>
          
          <div className="stat-trend__chart chart-frame padding-none h-[250px] mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-muted">Loading…</div>
            ) : hasPoints ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} dy={8} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} dx={-8} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '0.75rem', color: 'var(--foreground)' }}
                    formatter={(value: any, name: any) => [value, name === 'score' ? skill.name : name]}
                  />
                  {typeof skill.baselineScore === 'number' && (
                    <ReferenceLine y={skill.baselineScore} stroke="var(--muted-foreground)" strokeDasharray="4 4" label={{ value: 'Baseline', fill: 'var(--muted-foreground)', fontSize: 11, position: 'insideTopRight' }} />
                  )}
                  <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={3} connectNulls={false} dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 2, stroke: 'var(--background)' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted">No sessions in this range</div>
            )}
          </div>
        </div>

        <div className="stat-weeks sp-panel">
          <p className="ui-label stat-weeks__title margin-none">In this range</p>
          <ul className="stat-weeks__list margin-none padding-none layout-grid gap-lg mt-4">
            <li className="flex justify-between items-center text-sm">
              <span className="text-muted">Sessions</span>
              <span className="weight-semibold">{metric ? metric.stats.sessions : '—'}</span>
            </li>
            <li className="flex justify-between items-center text-sm">
              <span className="text-muted">Time played</span>
              <span className="weight-semibold">{metric ? formatPlaySeconds(metric.stats.totalPlaySeconds) : '—'}</span>
            </li>
            <li className="flex justify-between items-center text-sm">
              <span className="text-muted">Peak score</span>
              <span className="weight-semibold">{metric?.stats.peakScore ?? '—'}</span>
            </li>
            <li className="flex justify-between items-center text-sm">
              <span className="text-muted">Consistency</span>
              <span className="weight-semibold">{metric?.stats.consistency === null || metric?.stats.consistency === undefined ? '—' : `${Math.round(metric.stats.consistency)}%`}</span>
            </li>
          </ul>
          <div className="stat-weeks__foot streak-row cluster justify-between separator-top text-muted font-sm mt-4 pt-4">
            <span className="layout-inline-flex items-center gap-md">
              <svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-calendar"></use></svg>
              <span>{metric ? `${metric.period.start} → ${metric.period.end}` : 'Period'}</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
