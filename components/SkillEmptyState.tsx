import React from 'react';
import { getSkillById } from '@/lib/skillsData';
import Link from 'next/link';

interface SkillEmptyStateProps {
  skillId: string;
}

export function SkillEmptyState({ skillId }: SkillEmptyStateProps) {
  const skill = getSkillById(skillId);

  if (!skill) return null;

  return (
    <>
      <section aria-labelledby="startTitle" className="stat-section separator-top" id="start">
        <div className="progression-start sp-panel layout-grid gap-6">
          <span className="sp-icon-frame sp-icon-frame--lg sp-icon-frame--round progression-start__glyph">
            <svg className="sp-icon sp-icon--sm" aria-hidden="true" viewBox="0 0 24 24">
              <use href={`#${skill.iconId}`}></use>
            </svg>
          </span>
          <div className="progression-start__copy layout-grid gap-md min-width-0">
            <span className="eyebrow eyebrow--compact">Not enough data yet</span>
            <h2 className="portal-section__title margin-none" id="startTitle">Play games to measure {skill.name}</h2>
            <p className="margin-none text-muted">
              You haven&apos;t played enough games that target {skill.name} yet. Once you complete a few sessions, your baseline and progression will appear here.
            </p>
            <div className="cluster wrap mt-4">
              <Link className="button button--primary button--md" href={skill.games.length > 0 ? skill.games[0].url : '/games'}>
                <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-play"></use></svg>
                <span>Play {skill.games.length > 0 ? skill.games[0].name : 'a game'}</span>
              </Link>
              <a className="button button--tertiary button--md" href="#games">
                See the games <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-arrow-right"></use></svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="unlockTitle" className="stat-section separator-top mt-8" id="unlocks">
        <div className="stat-section__head layout-flex items-end justify-between gap-2xl wrap">
          <div className="min-width-0">
            <span className="eyebrow eyebrow--compact">What comes next</span>
            <h2 className="portal-section__title" id="unlockTitle">What you will see here</h2>
          </div>
          <span className="stat-count text-muted font-sm weight-semibold">After 3 scored sessions</span>
        </div>
        <p className="stat-section__lede margin-none text-muted">
          Your progression unlocks will be displayed once we gather enough data.
        </p>
        <ul className="progression-unlocks layout-grid margin-none padding-none mt-6">
          <li className="flex items-start gap-4 p-4 border border-border-subtle rounded-lg">
            <span className="sp-icon-frame sp-icon-frame--md sp-icon-frame--round bg-surface-box text-muted">
              <svg className="sp-icon sp-icon--sm" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-trending"></use></svg>
            </span>
            <div>
              <h3 className="font-semibold text-base m-0">Performance Trends</h3>
              <p className="text-muted text-sm mt-1">See how your {skill.name} is improving over time and compare it with previous weeks.</p>
            </div>
          </li>
          <li className="flex items-start gap-4 p-4 border border-border-subtle rounded-lg">
            <span className="sp-icon-frame sp-icon-frame--md sp-icon-frame--round bg-surface-box text-muted">
              <svg className="sp-icon sp-icon--sm" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-trophy"></use></svg>
            </span>
            <div>
              <h3 className="font-semibold text-base m-0">Community Ranking</h3>
              <p className="text-muted text-sm mt-1">Discover your percentile and see how you stack up against the broader community.</p>
            </div>
          </li>
        </ul>
      </section>
    </>
  );
}
