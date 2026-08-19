import React from 'react';
import Link from 'next/link';

export interface SkillFeatureCardProps {
  pillarEyebrow: string; // e.g. "Featured Mood skill"
  title: string;
  copy: string;
  iconId: string;
  gamesHeadline?: string;
  viewAllUrl?: string;
  children: React.ReactNode; // GameRail
  className?: string;
}

export const SkillFeatureCard: React.FC<SkillFeatureCardProps> = ({
  pillarEyebrow,
  title,
  copy,
  iconId,
  gamesHeadline = "Games that best develop this skill",
  viewAllUrl = "/games",
  children,
  className = '',
}) => {
  return (
    <article className={`skill-feature sp-card ${className}`}>
      <div className="skill-feature__head">
        <div className="skill-feature__identity layout-flex items-center gap-lg">
          <span className="skill-feature__icon sp-icon-frame sp-icon-frame--lg" aria-hidden="true">
            <svg className="sp-icon sp-icon--md" viewBox="0 0 24 24">
              <use href={`/assets/design-system/icons/sprite.svg#${iconId}`}></use>
            </svg>
          </span>
          <div className="min-width-0">
            <span className="portal-eyebrow skill-feature__eyebrow layout-block">{pillarEyebrow}</span>
            <h3 className="skill-feature__title margin-none">{title}</h3>
          </div>
        </div>
        <p className="skill-feature__copy margin-none text-muted">{copy}</p>
        <div className="skill-feature__rule"></div>
      </div>

      <div className="skill-feature__bar layout-flex items-center justify-between gap-lg wrap">
        <h4 className="margin-none">{gamesHeadline}</h4>
        <Link className="skill-feature__all layout-inline-flex items-center gap-xs font-sm weight-semibold" href={viewAllUrl}>
          <span>View all</span>
          <svg className="sp-icon sp-icon--sm" aria-hidden="true" viewBox="0 0 24 24">
            <use href="/assets/design-system/icons/sprite.svg#ti-chevron-right"></use>
          </svg>
        </Link>
      </div>

      {children}
    </article>
  );
};

export default SkillFeatureCard;
