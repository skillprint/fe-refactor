'use client';

import React, { useState, useEffect } from 'react';
import PortalLayout from '@/components/PortalLayout';
import { MockDataTag } from '@/components/MockDataTag';
import { SkillProgressionHeader } from '@/components/SkillProgressionHeader';
import { SkillFilter } from '@/components/SkillFilter';
import { SkillTrendSection } from '@/components/SkillTrendSection';
import { SkillStatisticsSection } from '@/components/SkillStatisticsSection';
import { SkillSessionsTable } from '@/components/SkillSessionsTable';
import { SkillEmptyState } from '@/components/SkillEmptyState';
import { getSkillById } from '@/lib/skillsData';
import Link from 'next/link';

export default function SkillProgressionPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = React.use(params);
  const [currentSkillId, setCurrentSkillId] = useState(resolvedParams.slug);
  const [hasData, setHasData] = useState(true); // Toggle this to test Empty State

  // Update URL shallowly if skill changes internally
  useEffect(() => {
    if (currentSkillId !== resolvedParams.slug) {
      window.history.pushState(null, '', `/skills/${currentSkillId}`);
    }
  }, [currentSkillId, resolvedParams.slug]);

  const skill = getSkillById(currentSkillId);

  if (!skill) {
    return (
      <PortalLayout pageClass="page--portal-skill-progression">
        <div className="portal-head">
          <h1>Skill not found</h1>
          <p>We couldn't find data for this skill.</p>
          <Link className="button button--secondary button--md mt-4" href="/skills">Back to Skills</Link>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout pageClass="page--portal-skill-progression">
      <MockDataTag />
      
      <SkillProgressionHeader skillId={currentSkillId} />
      
      <SkillFilter 
        currentSkillId={currentSkillId} 
        onSkillChange={setCurrentSkillId} 
      />

      {hasData ? (
        <>
          <SkillTrendSection skillId={currentSkillId} />
          <SkillStatisticsSection skillId={currentSkillId} />
          <SkillSessionsTable skillId={currentSkillId} />
        </>
      ) : (
        <SkillEmptyState skillId={currentSkillId} />
      )}

      <section aria-labelledby="gamesTitle" className="stat-section separator-top" id="games">
        <div className="stat-section__head layout-flex items-end justify-between gap-2xl wrap">
          <div className="min-width-0">
            <span className="eyebrow eyebrow--compact">Keep playing</span>
            <h2 className="portal-section__title" id="gamesTitle">Games to develop this skill</h2>
          </div>
          <span className="stat-count text-muted font-sm weight-semibold">{skill.games.length} games</span>
        </div>
        <p className="stat-section__lede margin-none text-muted">
          Playing these games will generate signals for {skill.name}.
        </p>
        
        <div className="stat-games card-grid grid mt-6" role="list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {skill.games.map(game => (
            <div key={game.id} className="sp-card card--game p-4 border border-border-subtle rounded-xl flex flex-col h-full">
              <img src={game.image} alt={game.name} className="w-full h-32 object-contain rounded-md bg-surface-box" />
              <h3 className="font-semibold text-lg mt-4">{game.name}</h3>
              <p className="text-muted text-sm flex-grow">{game.description}</p>
              <Link href={game.url} className="button button--secondary button--sm mt-4 w-full">
                Play
              </Link>
            </div>
          ))}
        </div>
        
        <div className="stat-cta layout-flex items-center justify-between gap-2xl wrap separator-top mt-8 pt-8">
          <p className="margin-none text-muted font-sm leading-md">
            Jump into a session now to improve your {skill.name} score.
          </p>
          <div className="cluster wrap no-grow">
            <Link className="button button--secondary button--md" href="/skills">All skills</Link>
            <Link className="button button--primary button--md" href={skill.games.length > 0 ? skill.games[0].url : '/games'}>
              <span>Play now</span> 
              <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-arrow-right"></use></svg>
            </Link>
          </div>
        </div>
      </section>
    </PortalLayout>
  );
}
