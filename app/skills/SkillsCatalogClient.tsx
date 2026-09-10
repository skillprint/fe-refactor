'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import PortalLayout from '@/components/PortalLayout';
import { SkillDimensionSection } from '@/components/SkillDimensionSection';
import { SkillsRail } from '@/components/SkillsRail';
import BuckyballLoading from '@/app/components/BuckyballLoading';
import { useTaxonomySkills } from '@/lib/models/portal/useTaxonomySkills';
import { useProfileAggregate } from '@/lib/models/portal/useProfileAggregate';
import { profileDimensionMap } from '@/lib/models/portal/ProfileAggregate';
import { useGamesBySkill } from '@/app/hooks/useGamesBySkill';
import { buildSkillCatalog, featureCardProps } from '@/lib/skillCatalog';

export default function SkillsCatalogClient() {
  const { data: taxonomy, isLoading: isTaxonomyLoading, error } = useTaxonomySkills();
  const { data: profile } = useProfileAggregate();
  const { gamesBySkill, gamesByMood } = useGamesBySkill();

  const scores = useMemo(() => profileDimensionMap(profile), [profile]);
  const catalog = useMemo(
    () => buildSkillCatalog(taxonomy, gamesBySkill, gamesByMood, scores),
    [taxonomy, gamesBySkill, gamesByMood, scores]
  );

  const totalSkills = catalog.reduce((n, d) => n + d.skills.length, 0);

  return (
    <PortalLayout pageClass="page--portal-skills">
      <div className="portal-head relative">
        <div className="portal-eyebrow">Skills</div>
        <div className="portal-head__row">
          <h1>Skills</h1>
          <Link className="button button--secondary button--md" href="/profile">
            Go to profile <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-arrow-right"></use></svg>
          </Link>
        </div>
        <p>
          Play games, generate signals, understand yourself. Everything a session measures lands in one of three dimensions — Mood, Cognition and Personality
          {totalSkills > 0 ? ` — ${totalSkills} skills in all.` : '.'}
        </p>
      </div>

      <div className="portal-layout">
        <div className="portal-layout__main">
          {isTaxonomyLoading && !taxonomy ? (
            <div className="flex justify-center items-center py-20">
              <BuckyballLoading />
            </div>
          ) : error && !taxonomy ? (
            <div className="portal-blank">
              <p className="portal-blank__title">We could not load the skill taxonomy</p>
              <p className="portal-blank__note">Please try again in a moment.</p>
            </div>
          ) : (
            catalog.map((dim) => (
              <SkillDimensionSection
                key={dim.pillar}
                dimensionId={dim.pillar}
                dimensionTitle={dim.title}
                dimensionDescription={dim.description}
                dimensionIconId={dim.iconId}
                featuredSkill={dim.featured ? featureCardProps(dim.featured, dim.title) : null}
                skills={dim.skills}
              />
            ))
          )}
        </div>
        <SkillsRail catalog={catalog} />
      </div>
    </PortalLayout>
  );
}
