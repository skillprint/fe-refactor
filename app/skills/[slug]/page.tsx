'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import PortalLayout from '@/components/PortalLayout';
import { SkillProgressionHeader } from '@/components/SkillProgressionHeader';
import { SkillFilter } from '@/components/SkillFilter';
import { SkillTrendSection } from '@/components/SkillTrendSection';
import { SkillStatisticsSection } from '@/components/SkillStatisticsSection';
import { SkillSessionsTable } from '@/components/SkillSessionsTable';
import { SkillEmptyState } from '@/components/SkillEmptyState';
import { GameTile } from '@/components/GameTile';
import BuckyballLoading from '@/app/components/BuckyballLoading';
import { useTaxonomySkills } from '@/lib/models/portal/useTaxonomySkills';
import { useProfileAggregate } from '@/lib/models/portal/useProfileAggregate';
import { profileDimensionMap } from '@/lib/models/portal/ProfileAggregate';
import { useLongitudinalMetric } from '@/lib/models/portal/useLongitudinalMetric';
import type { MetricRange } from '@/lib/models/portal/LongitudinalMetric';
import { useGamesBySkill } from '@/app/hooks/useGamesBySkill';
import { buildSkillCatalog, findSkillEntry } from '@/lib/skillCatalog';

/**
 * Skill progression (SKI-133): the skill itself comes from the taxonomy
 * endpoint; its history from `/metrics/{pillar}/{dimension}/`.
 */
export default function SkillProgressionPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = React.use(params);
  const [currentSkillId, setCurrentSkillId] = useState(resolvedParams.slug);
  const [range, setRange] = useState<MetricRange>('W');

  // Update URL shallowly if skill changes internally
  useEffect(() => {
    if (currentSkillId !== resolvedParams.slug) {
      window.history.pushState(null, '', `/skills/${currentSkillId}`);
    }
  }, [currentSkillId, resolvedParams.slug]);

  const { data: taxonomy, isLoading: isTaxonomyLoading } = useTaxonomySkills();
  const { data: profile } = useProfileAggregate();
  const { gamesBySkill, gamesByMood } = useGamesBySkill();

  const scores = useMemo(() => profileDimensionMap(profile), [profile]);
  const catalog = useMemo(
    () => buildSkillCatalog(taxonomy, gamesBySkill, gamesByMood, scores),
    [taxonomy, gamesBySkill, gamesByMood, scores]
  );
  const skill = findSkillEntry(catalog, currentSkillId);

  const { data: metric, isLoading: isMetricLoading, notFound } = useLongitudinalMetric(
    skill?.pillar || '',
    skill?.id || '',
    false,
    range
  );

  if (isTaxonomyLoading && !taxonomy) {
    return (
      <PortalLayout pageClass="page--portal-skill-progression">
        <div className="flex justify-center items-center py-20"><BuckyballLoading /></div>
      </PortalLayout>
    );
  }

  if (!skill) {
    return (
      <PortalLayout pageClass="page--portal-skill-progression">
        <div className="portal-head">
          <h1>Skill not found</h1>
          <p>We couldn&apos;t find a skill called &ldquo;{currentSkillId}&rdquo; in the taxonomy.</p>
          <Link className="button button--secondary button--md mt-4" href="/skills">Back to Skills</Link>
        </div>
      </PortalLayout>
    );
  }

  const hasData = !notFound && !!metric && (metric.stats.sessions > 0 || skill.score !== null);
  const games = skill.gameTiles;

  return (
    <PortalLayout pageClass="page--portal-skill-progression">
      <SkillProgressionHeader skill={skill} />
      
      <SkillFilter 
        catalog={catalog}
        currentSkillId={currentSkillId} 
        onSkillChange={setCurrentSkillId} 
      />

      {isMetricLoading && !metric ? (
        <div className="flex justify-center items-center py-12"><BuckyballLoading /></div>
      ) : hasData ? (
        <>
          <SkillTrendSection skill={skill} metric={metric} isLoading={isMetricLoading} range={range} onRangeChange={setRange} />
          <SkillStatisticsSection skill={skill} metric={metric} />
          <SkillSessionsTable skill={skill} metric={metric} />
        </>
      ) : (
        <SkillEmptyState skill={skill} />
      )}

      <section aria-labelledby="gamesTitle" className="stat-section separator-top" id="games">
        <div className="stat-section__head layout-flex items-end justify-between gap-2xl wrap">
          <div className="min-width-0">
            <span className="eyebrow eyebrow--compact">Keep playing</span>
            <h2 className="portal-section__title" id="gamesTitle">Games to develop this skill</h2>
          </div>
          <span className="stat-count text-muted font-sm weight-semibold">{games.length} {games.length === 1 ? 'game' : 'games'}</span>
        </div>
        <p className="stat-section__lede margin-none text-muted">
          {games.length > 0 ? `Playing these games will generate signals for ${skill.name}.` : `No games in the library measure ${skill.name} yet.`}
        </p>
        
        {games.length > 0 && (
          <div className="stat-games card-grid grid mt-6" role="list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {games.map((game) => (
              <GameTile key={game.id} {...game} />
            ))}
          </div>
        )}
        
        <div className="stat-cta layout-flex items-center justify-between gap-2xl wrap separator-top mt-8 pt-8">
          <p className="margin-none text-muted font-sm leading-md">
            Jump into a session now to improve your {skill.name} score.
          </p>
          <div className="cluster wrap no-grow">
            <Link className="button button--secondary button--md" href="/skills">All skills</Link>
            <Link className="button button--primary button--md" href={games.length > 0 ? games[0].url : '/games'}>
              <span>Play now</span> 
              <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-arrow-right"></use></svg>
            </Link>
          </div>
        </div>
      </section>
    </PortalLayout>
  );
}
