import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import PortalLayout from '@/components/PortalLayout';
import { SkillDimensionSection } from '@/components/SkillDimensionSection';
import { SkillsRail } from '@/components/SkillsRail';
import { MockDataTag } from '@/components/MockDataTag';

import { 
  MOOD_SKILLS, 
  COGNITION_SKILLS, 
  PERSONALITY_SKILLS,
  MOOD_FEATURED,
  COGNITION_FEATURED,
  PERSONALITY_FEATURED
} from '@/lib/skillsData';

export const metadata: Metadata = {
  title: 'Skills',
};

export default function SkillsPage() {
  return (
    <PortalLayout pageClass="page--portal-skills">
      <div className="portal-head relative">
        <MockDataTag />
        <div className="portal-eyebrow">Skills</div>
        <div className="portal-head__row">
          <h1>Skills</h1>
          <Link className="button button--secondary button--md" href="/profile">
            Go to profile <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-arrow-right"></use></svg>
          </Link>
        </div>
        <p>Play games, generate signals, understand yourself. Everything a session measures lands in one of three dimensions — Mood, Cognition and Personality.</p>
      </div>

      <div className="portal-layout">
        <div className="portal-layout__main">
          <SkillDimensionSection 
            dimensionId="mood"
            dimensionTitle="Mood"
            dimensionDescription="9 states a session moves you through — the energy you bring to the board and the one it leaves you with."
            dimensionIconId="ti-category-mood"
            featuredSkill={MOOD_FEATURED}
            skills={MOOD_SKILLS}
          />
          <SkillDimensionSection 
            dimensionId="cognition"
            dimensionTitle="Cognition"
            dimensionDescription="14 skills, read directly from how a game is played. Pick one to filter the library down to the games that train it."
            dimensionIconId="ti-category-cognition"
            featuredSkill={COGNITION_FEATURED}
            skills={COGNITION_SKILLS}
          />
          <SkillDimensionSection 
            dimensionId="personality"
            dimensionTitle="Personality"
            dimensionDescription="The big 5 traits that make up your personality profile."
            dimensionIconId="ti-category-personality"
            featuredSkill={PERSONALITY_FEATURED}
            skills={PERSONALITY_SKILLS}
          />
        </div>
        <SkillsRail />
      </div>
    </PortalLayout>
  );
}