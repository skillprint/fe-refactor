import React from 'react';
import { getSkillById } from '@/lib/skillsData';

interface SkillStatisticsSectionProps {
  skillId: string;
}

export function SkillStatisticsSection({ skillId }: SkillStatisticsSectionProps) {
  const skill = getSkillById(skillId);

  if (!skill) return null;

  return (
    <section aria-labelledby="statsTitle" className="stat-section separator-top" id="statistics">
      <div className="stat-section__head layout-flex items-end justify-between gap-2xl wrap">
        <div className="min-width-0">
          <span className="eyebrow eyebrow--compact">Supporting statistics</span>
          <h2 className="portal-section__title" id="statsTitle">How much you have worked on it</h2>
        </div>
        <span className="stat-count text-muted font-sm weight-semibold">12 sessions total</span>
      </div>
      <p className="stat-section__lede margin-none text-muted">
        Details on your {skill.name} baseline relative to the community, and what affects it.
      </p>

      <div className="stat-breakdown layout-grid gap-2xl items-start mt-6">
        <div className="stat-rank sp-panel">
          <div className="stat-rank__head layout-flex items-start justify-between gap-lg wrap">
            <div className="min-width-0">
              <span className="ui-label layout-block">Your percentile</span>
              <strong className="stat-rank__value layout-block">68th</strong>
            </div>
            <span className="ui-badge ui-badge--pill ui-badge--md ui-badge--leading stat-rank__badge bg-brand-primary/10 text-brand-primary">
              <svg className="ui-badge__icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-trophy"></use></svg>
              <span>Above average</span>
            </span>
          </div>
          
          <div className="stat-rank__meter my-4" role="img" aria-label="68th percentile">
            <div className="h-2 w-full bg-border-subtle rounded-full overflow-hidden relative">
              <div className="h-full bg-brand-primary absolute left-0 top-0" style={{ width: '68%' }}></div>
            </div>
          </div>
          
          <div className="ui-label stat-rank__scale layout-flex items-center justify-between text-muted font-xs" aria-hidden="true">
            <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
          </div>
          <p className="stat-rank__note margin-none font-sm leading-md text-muted mt-4">
            You score higher than 68% of players in games that measure {skill.name}.
          </p>
        </div>

        <div className="stat-components sp-panel">
          <p className="ui-label stat-components__title margin-none mb-4">What carries the score</p>
          <ul className="stat-components__list margin-none padding-none layout-grid gap-xl">
            <li className="flex justify-between items-center text-sm border-b border-border-subtle pb-2">
              <span className="text-default">Accuracy</span>
              <span className="text-muted weight-semibold">High impact</span>
            </li>
            <li className="flex justify-between items-center text-sm border-b border-border-subtle pb-2">
              <span className="text-default">Speed</span>
              <span className="text-muted weight-semibold">Medium impact</span>
            </li>
            <li className="flex justify-between items-center text-sm pb-2">
              <span className="text-default">Combo Streaks</span>
              <span className="text-muted weight-semibold">Medium impact</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
