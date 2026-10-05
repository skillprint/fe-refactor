'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useHomeSummary } from '@/lib/models/portal/useHomeSummary';
import { useTrendsSummary } from '@/lib/models/portal/useTrendsSummary';
import { useProfileAggregate } from '@/lib/models/portal/useProfileAggregate';
import { useGoalSetting } from '@/app/hooks/useGoalSetting';
import { PORTAL_SKILLS } from '@/app/config/skillsTaxonomy';
import type { SkillCatalogDimension } from '@/lib/skillCatalog';
import { PILLARS, Pillar, pillarLabel, skillIconId, titleFromSlug } from '@/lib/skillIcons';

interface SkillsRailProps {
  catalog?: SkillCatalogDimension[];
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function startOfIsoWeek(now: Date): Date {
  const d = new Date(now);
  const dayOfWeek = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - dayOfWeek);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function SkillsRail({ catalog = [] }: SkillsRailProps) {
  const { data: home } = useHomeSummary();
  const { data: trends } = useTrendsSummary();
  const { data: profile } = useProfileAggregate();
  const { goalSkills, goalMoods } = useGoalSetting();

  const totalSkills = catalog.reduce((n, d) => n + d.skills.length, 0) || Object.keys(PORTAL_SKILLS).length;

  const skillName = (pillar: Pillar, slug: string) => {
    const fromCatalog = catalog.find((d) => d.pillar === pillar)?.skills.find((s) => s.id === slug);
    return fromCatalog?.name || PORTAL_SKILLS[slug]?.name || titleFromSlug(slug);
  };

  const sessionsThisWeek = home?.sessionsThisWeek ?? null;
  const streakDays = home?.streakDays ?? null;

  const averageScore = useMemo(() => {
    if (!home) return null;
    const values = Object.values(home.pillarAverages || {}).filter((v): v is number => typeof v === 'number');
    if (!values.length) return null;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }, [home]);

  const touched = useMemo(() => {
    if (!trends) return null;
    return PILLARS.reduce((n, p) => n + (trends.pillars?.[p] || []).filter((m) => m.sessions > 0).length, 0);
  }, [trends]);

  const strongest = useMemo(() => {
    if (!trends) return [];
    return PILLARS.map((pillar) => {
      const best = [...(trends.pillars?.[pillar] || [])]
        .filter((m) => typeof m.avgScore === 'number')
        .sort((a, b) => b.avgScore - a.avgScore)[0];
      return best ? { pillar, slug: best.slug, score: Math.round(best.avgScore) } : null;
    }).filter((x): x is { pillar: Pillar; slug: string; score: number } => x !== null);
  }, [trends]);

  const activeDays = useMemo(() => {
    const active = new Set<number>();
    if (!profile?.weeklyGrid) return active;
    const weekStart = startOfIsoWeek(new Date());
    for (const day of profile.weeklyGrid) {
      if (!day.sessionCount) continue;
      const date = new Date(`${day.date}T00:00:00`);
      const diff = Math.floor((date.getTime() - weekStart.getTime()) / 86400000);
      if (diff >= 0 && diff < 7) active.add(diff);
    }
    return active;
  }, [profile]);

  const targets = [
    ...goalSkills.map((slug) => ({ slug, pillar: 'cognition' as Pillar })),
    ...goalMoods.map((slug) => ({ slug, pillar: 'mood' as Pillar })),
  ];

  const fmt = (v: number | null) => (v === null ? '—' : String(v));

  return (
    <aside className="portal-rail" aria-label="This week">
      <article className="rail-card sp-card" aria-labelledby="skillBreakdownTitle">
        <div className="skill-panel__head">
          <span className="ui-label skill-panel__week layout-block">This week</span>
          <h2 className="margin-none" id="skillBreakdownTitle">Skill breakdown</h2>
        </div>
        <div className="skill-panel__metrics">
          <div className="metric metric--portal metric--stacked border-subtle">
            <span className="ui-label metric__label layout-block">Sessions</span>
            <strong className="metric__value layout-block">{fmt(sessionsThisWeek)}</strong>
            <small className="metric__note layout-block font-xs leading-compact weight-semibold">
              {home ? `${home.totalSessions} all time` : 'Loading'}
            </small>
          </div>
          <div className="metric metric--portal metric--stacked border-subtle">
            <span className="ui-label metric__label layout-block">Average score</span>
            <strong className="metric__value layout-block">{fmt(averageScore)}</strong>
            <small className="metric__note layout-block font-xs leading-compact weight-semibold">
              {averageScore === null ? 'Nothing measured yet' : 'Across measured dimensions'}
            </small>
          </div>
          <div className="metric metric--portal metric--stacked border-subtle">
            <span className="ui-label metric__label layout-block">Skills touched</span>
            <strong className="metric__value layout-block">{fmt(touched)}</strong>
            <small className="metric__note layout-block font-xs leading-compact weight-semibold">of {totalSkills} across all three</small>
          </div>
        </div>

        {strongest.length > 0 && (
          <div className="skill-panel__meters">
            <span className="ui-label skill-panel__label layout-block">Strongest this week</span>
            {strongest.map((item) => (
              <div className="skill-meter" data-dimension={item.pillar} key={item.pillar}>
                <div className="skill-meter__head layout-flex items-center justify-between gap-md font-sm">
                  <span className="layout-inline-flex items-center gap-sm">
                    <svg className="sp-icon sp-icon--sm skill-meter__icon" aria-hidden="true" viewBox="0 0 24 24"><use href={`#${skillIconId(item.pillar, item.slug)}`}></use></svg>
                    {skillName(item.pillar, item.slug)}
                  </span>
                  <span className="skill-meter__reading layout-inline-flex items-center gap-sm">
                    <span className="skill-meter__pillar font-xs weight-semibold">{pillarLabel(item.pillar)}</span>
                    <strong className="font-mono font-xs">{item.score}</strong>
                  </span>
                </div>
                <div className="sp-progress skill-meter__bar">
                  <span className="sp-progress__track"><span className="sp-progress__fill" style={{ width: `${item.score}%` }}></span></span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="skill-panel__streak layout-flex items-center justify-between gap-lg wrap separator-top text-muted font-sm">
          <span>{streakDays === null ? 'No streak yet' : streakDays > 0 ? `${streakDays}-day playing streak` : 'No active streak'}</span>
          <div className="skill-panel__days layout-flex gap-sm">
            {DAY_LABELS.map((label, index) => (
              <span key={index} className={`skill-day ${activeDays.has(index) ? 'is-done' : ''} layout-grid place-center border-subtle`.replace(/\s+/g, ' ')}>{label}</span>
            ))}
          </div>
        </div>
      </article>

      <article className="rail-card sp-card skill-goal" data-pp-goal="skills" aria-labelledby="targetSkillsTitle">
        <div className="skill-goal__head layout-flex items-start justify-between gap-lg">
          <div className="min-width-0">
            <span className="portal-eyebrow skill-goal__eyebrow layout-block">My goals</span>
            <h2 className="margin-none" id="targetSkillsTitle">Target skills</h2>
          </div>
          <Link className="button button--tertiary button--sm no-grow" href="/profile#goals">
            <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-edit"></use></svg>Edit
          </Link>
        </div>
        <p className="skill-goal__copy margin-none text-muted font-sm">Pick the skills you want your sessions to push. Recommendations follow the list.</p>
        
        <div className="skill-goal__view" data-pp-goal-view="">
          {targets.length === 0 ? (
            <p className="margin-none text-muted font-sm">No targets yet. Set up to three on your profile.</p>
          ) : (
            <div className="skill-goal__chips cluster wrap gap-md" data-pp-goal-chips="">
              {targets.map((t) => (
                <span className="ui-tag is-selected" key={`${t.pillar}-${t.slug}`}>
                  <svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24"><use href={`#${skillIconId(t.pillar, t.slug)}`}></use></svg>{skillName(t.pillar, t.slug)}
                </span>
              ))}
            </div>
          )}
        </div>

        <p className="skill-goal__note margin-none text-muted font-sm separator-top">
          <svg className="sp-icon sp-icon--sm" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-info"></use></svg>
          <span>Three targets is the sweet spot. More than that and a week of play spreads too thin to read.</span>
        </p>
      </article>
    </aside>
  );
}
