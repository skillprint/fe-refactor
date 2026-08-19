import React from 'react';
import Link from 'next/link';

export interface SkillCardProps {
  id: string;
  pillar: 'Mood' | 'Cognition' | 'Personality';
  title: string;
  description: string;
  iconId: string;
  games: { name: string; slug: string }[];
  progression: number; // 0 - 100
  progressionUrl?: string;
  className?: string;
}

export const SkillCard: React.FC<SkillCardProps> = ({
  id,
  pillar,
  title,
  description,
  iconId,
  games,
  progression,
  progressionUrl = `/design-system/skills#${id}`,
  className = '',
}) => {
  return (
    <article className={`skill-card sp-card sp-card--interactive min-width-0 ${className}`} data-skill={id}>
      <div className="skill-card__head layout-flex items-center gap-md">
        <span className="skill-card__icon sp-icon-frame sp-icon-frame--md" aria-hidden="true">
          <svg className="sp-icon sp-icon--sm" viewBox="0 0 24 24">
            <use href={`/assets/design-system/icons/sprite.svg#${iconId}`}></use>
          </svg>
        </span>
        <span className="skill-card__pillar ui-badge ui-badge--pill">{pillar}</span>
      </div>

      <div className="skill-card__copy">
        <h3 className="skill-card__title margin-none">
          <Link className="skill-card__link no-underline text-default" href={progressionUrl}>
            {title}
          </Link>
        </h3>
        <p className="skill-card__desc margin-none text-muted">{description}</p>
      </div>

      <div className="skill-card__games">
        <span className="ui-label skill-card__games-label layout-block">Games to develop this skill</span>
        <ul className="skill-card__game-list layout-flex wrap gap-sm margin-none">
          {games.map((g, idx) => (
            <li key={idx}>
              <Link className="skill-game" href={`/game/${g.slug}`}>
                {g.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <Link
        className="skill-card__action button button--primary sp-progress-button sp-progress-button--compact"
        href={progressionUrl}
        data-meter={progression}
        style={{ '--meter': `${progression}%` } as React.CSSProperties}
      >
        <svg className="sp-icon sp-progress-button__icon" aria-hidden="true" viewBox="0 0 24 24">
          <use href="/assets/design-system/icons/sprite.svg#ti-chart"></use>
        </svg>
        <span className="sp-progress-button__label">Your progression</span>{' '}
        <span className="sp-progress-button__value">{progression}%</span>
        <svg className="sp-icon sp-progress-button__chevron" aria-hidden="true" viewBox="0 0 24 24">
          <use href="/assets/design-system/icons/sprite.svg#ti-chevron-right"></use>
        </svg>
      </Link>
    </article>
  );
};

export default SkillCard;
