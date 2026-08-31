import React, { useMemo } from 'react';
import Link from 'next/link';
import { PORTAL_SKILLS, PortalSkill } from '../../app/config/skillsTaxonomy';
import { MockDataTag } from '../MockDataTag';

interface ProfileSkillBreakdownProps {
  scores: Record<string, number>;
}

const DIMENSIONS = [
  { key: 'mood', label: 'Mood' },
  { key: 'cognition', label: 'Cognition' },
  { key: 'personality', label: 'Personality' },
];

export default function ProfileSkillBreakdown({ scores }: ProfileSkillBreakdownProps) {
  const totalSkills = Object.keys(PORTAL_SKILLS).length;
  const scoredSkills = Object.keys(scores).filter((slug) => typeof scores[slug] === 'number');
  const scoredCount = scoredSkills.length;
  const leftCount = totalSkills - scoredCount;
  const meterPercent = totalSkills > 0 ? (scoredCount / totalSkills) * 100 : 0;

  const groups = useMemo(() => {
    return DIMENSIONS.map((dim) => {
      const items = Object.keys(PORTAL_SKILLS)
        .filter((slug) => PORTAL_SKILLS[slug].pillar === dim.key)
        .map((slug) => ({
          slug,
          skill: PORTAL_SKILLS[slug],
          score: scores[slug],
        }))
        .sort((a, b) => {
          const aScore = typeof a.score === 'number' ? a.score : -1;
          const bScore = typeof b.score === 'number' ? b.score : -1;
          if (bScore !== aScore) return bScore - aScore;
          return a.skill.name.localeCompare(b.skill.name);
        });

      const doneInGroup = items.filter((item) => typeof item.score === 'number').length;
      const leftInGroup = items.length - doneInGroup;

      return {
        key: dim.key,
        label: dim.label,
        items,
        done: doneInGroup,
        left: leftInGroup,
        total: items.length,
      };
    });
  }, [scores]);

  return (
    <aside className="pp-wheel-layout__aside" aria-labelledby="skill-breakdown" style={{ position: 'relative' }}>
      <MockDataTag />
      <div className="section-head pp-head pp-subhead">
        <div className="section-head-copy">
          <h3 id="skill-breakdown">Skill breakdown</h3>
          <p className="margin-none text-muted">
            Where each of the 28 skills stands now, ranked within its dimension. Open a row to see it session by session.
          </p>
        </div>
      </div>
      <div className="pp-breakdown sp-panel padding-none clip">
        <div className="pp-breakdown__head separator-bottom">
          <div className="layout-flex items-center justify-between gap-md font-sm">
            <span className="weight-semibold">{scoredCount} of {totalSkills} skills have a score</span>
            <span className="text-muted">{leftCount} still {leftCount === 1 ? 'needs' : 'need'} play</span>
          </div>
          <div
            className="rail-meter"
            role="img"
            aria-label="Skills measured"
            style={{ '--meter': `${meterPercent}%` } as React.CSSProperties}
          >
            <i></i>
          </div>
          <p className="margin-none text-subtle font-xs leading-md">
            A bar is a skill your sessions have measured, and how far it has come.{' '}
            <span className="weight-semibold">Needs play</span> means no finished game has measured it yet &mdash; those are
            what the games recommended on Home are picked to reach.
          </p>
        </div>
        <div className="pp-breakdown__scroll">
          {groups.map((group) => (
            <div key={group.key} className="pp-breakdown__group" data-pillar={group.key} role="group" aria-label={`${group.label} skills`}>
              <p className="portal-eyebrow pp-breakdown__label">
                <span>{group.label}</span>
                <span className="ui-label pp-breakdown__count">
                  {group.done} of {group.total} read &middot; {group.left} {group.left === 1 ? 'needs' : 'need'} play
                </span>
              </p>
              {group.items.map((item) => {
                const hasScore = typeof item.score === 'number';
                const href = `/profile/skills/${item.slug}`; // Assuming a route exists or will exist

                return (
                  <Link
                    key={item.slug}
                    href={href}
                    className={`pp-skill ${!hasScore ? 'pp-skill--empty' : ''}`}
                    data-pillar={group.key}
                    data-score={hasScore ? item.score : undefined}
                  >
                    <svg className="sp-icon sp-icon--sm pp-skill__icon" aria-hidden="true" viewBox="0 0 24 24">
                      <use href={`#ti-${group.key}-${item.slug}`}></use>
                    </svg>
                    <span className="pp-skill__name weight-medium">{item.skill.name}</span>
                    {hasScore ? (
                      <>
                        <span className="pp-skill__track track radius-full" aria-hidden="true">
                          <i className="radius-full" style={{ '--track-fill': `${Math.max(0, Math.min(100, item.score as number))}%` } as React.CSSProperties}></i>
                        </span>
                        <span className="pp-skill__value font-sm">{Math.round(item.score as number)}</span>
                      </>
                    ) : (
                      <span className="pp-skill__state font-sm text-muted">Needs play</span>
                    )}
                    <svg className="sp-icon sp-icon--sm sp-icon--muted" aria-hidden="true" viewBox="0 0 24 24">
                      <use href="#ti-chevron-right"></use>
                    </svg>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
