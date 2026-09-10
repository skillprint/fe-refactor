import React from 'react';
import Link from 'next/link';
import type { SkillCatalogEntry } from '@/lib/skillCatalog';
import type { LongitudinalMetric } from '@/lib/models/portal/LongitudinalMetric';
import { unifiedSlugFromBESlug } from '@/app/utils/slugUtils';

interface SkillStatisticsSectionProps {
  skill: SkillCatalogEntry;
  metric: LongitudinalMetric | null;
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

export function SkillStatisticsSection({ skill, metric }: SkillStatisticsSectionProps) {
  const percentile = metric?.percentile ?? null;
  const sessions = metric?.stats.sessions ?? 0;
  const trainingGames = metric?.gamesThatTrainThis || [];

  return (
    <section aria-labelledby="statsTitle" className="stat-section separator-top" id="statistics">
      <div className="stat-section__head layout-flex items-end justify-between gap-2xl wrap">
        <div className="min-width-0">
          <span className="eyebrow eyebrow--compact">Supporting statistics</span>
          <h2 className="portal-section__title" id="statsTitle">How much you have worked on it</h2>
        </div>
        <span className="stat-count text-muted font-sm weight-semibold">{sessions} {sessions === 1 ? 'session' : 'sessions'} in range</span>
      </div>
      <p className="stat-section__lede margin-none text-muted">
        Your {skill.name} score against your own baseline and the wider community.
      </p>

      <div className="stat-breakdown layout-grid gap-2xl items-start mt-6">
        <div className="stat-rank sp-panel">
          <div className="stat-rank__head layout-flex items-start justify-between gap-lg wrap">
            <div className="min-width-0">
              <span className="ui-label layout-block">Your percentile</span>
              <strong className="stat-rank__value layout-block">{percentile === null ? 'Not ranked yet' : ordinal(Math.round(percentile))}</strong>
            </div>
            {percentile !== null && (
              <span className="ui-badge ui-badge--pill ui-badge--md ui-badge--leading stat-rank__badge bg-brand-primary/10 text-brand-primary">
                <svg className="ui-badge__icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-trophy"></use></svg>
                <span>{percentile >= 50 ? 'Above average' : 'Building'}</span>
              </span>
            )}
          </div>
          
          <div className="stat-rank__meter my-4" role="img" aria-label={percentile === null ? 'Percentile not available' : `${ordinal(Math.round(percentile))} percentile`}>
            <div className="h-2 w-full bg-border-subtle rounded-full overflow-hidden relative">
              <div className="h-full bg-brand-primary absolute left-0 top-0" style={{ width: `${percentile ?? 0}%` }}></div>
            </div>
          </div>
          
          <div className="ui-label stat-rank__scale layout-flex items-center justify-between text-muted font-xs" aria-hidden="true">
            <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
          </div>
          <p className="stat-rank__note margin-none font-sm leading-md text-muted mt-4">
            {percentile === null
              ? 'Community ranking appears once enough players have a score for this skill.'
              : `You score higher than ${Math.round(percentile)}% of players in games that measure ${skill.name}.`}
          </p>
        </div>

        <div className="stat-components sp-panel">
          <p className="ui-label stat-components__title margin-none mb-4">Where you stand</p>
          <ul className="stat-components__list margin-none padding-none layout-grid gap-xl">
            <li className="flex justify-between items-center text-sm border-b border-border-subtle pb-2">
              <span className="text-default">Current score</span>
              <span className="text-muted weight-semibold">{skill.score === null ? '—' : Math.round(skill.score)}</span>
            </li>
            <li className="flex justify-between items-center text-sm border-b border-border-subtle pb-2">
              <span className="text-default">Lifetime baseline</span>
              <span className="text-muted weight-semibold">{skill.baselineScore === null ? '—' : Math.round(skill.baselineScore)}</span>
            </li>
            <li className="flex justify-between items-center text-sm border-b border-border-subtle pb-2">
              <span className="text-default">Since you started</span>
              <span className="text-muted weight-semibold">{skill.delta === null ? '—' : `${skill.delta > 0 ? '+' : ''}${Math.round(skill.delta)}`}</span>
            </li>
            <li className="flex justify-between items-center text-sm pb-2">
              <span className="text-default">Average in range</span>
              <span className="text-muted weight-semibold">{metric?.average ?? '—'}</span>
            </li>
          </ul>
          {trainingGames.length > 0 && (
            <>
              <p className="ui-label stat-components__title margin-none mt-6 mb-3">Games that train this</p>
              <ul className="margin-none padding-none layout-flex wrap gap-sm">
                {trainingGames.map((g) => (
                  <li key={g.id}>
                    <Link className="ui-tag" href={`/game/${encodeURIComponent(unifiedSlugFromBESlug(g.slug))}`}>{g.name}</Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
