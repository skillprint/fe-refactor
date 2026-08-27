import React from 'react';
import Link from 'next/link';
import { SkillFeatureCard, SkillFeatureCardProps } from './SkillFeatureCard';
import { SkillCard, SkillCardProps } from './SkillCard';

export interface SkillDimensionSectionProps {
  dimensionId: string;
  dimensionTitle: string;
  dimensionDescription: string;
  dimensionIconId: string;
  featuredSkill: SkillFeatureCardProps;
  skills: SkillCardProps[];
}

export function SkillDimensionSection({
  dimensionId,
  dimensionTitle,
  dimensionDescription,
  dimensionIconId,
  featuredSkill,
  skills
}: SkillDimensionSectionProps) {
  return (
    <section className="portal-section skills-section" id={dimensionId} data-dimension={dimensionId} data-skills-section aria-labelledby={`${dimensionId}Title`}>
      <div className="portal-section__bar">
        <div>
          <h2 className="portal-section__title portal-section__title--category" id={`${dimensionId}Title`}>
            <svg className="sp-icon sp-icon--sm" aria-hidden="true" viewBox="0 0 24 24">
              <use href={`#${dimensionIconId}`}></use>
            </svg>
            {dimensionTitle}
          </h2>
          <p className="portal-section__hint">{dimensionDescription}</p>
        </div>
        <Link className="portal-section__link" href={`/games?skill=${dimensionId}#games`}>
          Games by {dimensionTitle.toLowerCase()} <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-chevron-right"></use></svg>
        </Link>
      </div>

      {featuredSkill && <SkillFeatureCard {...featuredSkill} />}

      <h3 className="skills-section__index-title">All {dimensionTitle} skills</h3>
      <div className="skill-grid grid">
        {skills.map(skill => (
          <SkillCard key={skill.id} {...skill} />
        ))}
      </div>
    </section>
  );
}
