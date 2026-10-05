import React from 'react';
import Link from 'next/link';
import { GamePill, GamePillProps } from './GamePill';

export interface SkillCardProps {
  id: string;
  name: string;
  description: string;
  dimension: 'mood' | 'cognition' | 'personality';
  iconId: string;
  progressPercentage?: number;
  games?: GamePillProps[];
}

export function SkillCard({
  id,
  name,
  description,
  dimension,
  iconId,
  progressPercentage = 0,
  games = []
}: SkillCardProps) {
  const href = `/skills/${id}`;

  return (
    <article className="skill-card sp-card sp-card--interactive min-width-0" data-skill={id} data-dimension={dimension}>
      <div className="skill-card__head layout-flex items-center gap-md">
        <span className="skill-card__icon sp-icon-frame sp-icon-frame--md" aria-hidden="true">
          <svg className="sp-icon sp-icon--sm" aria-hidden="true" viewBox="0 0 24 24">
            <use href={`#${iconId}`}></use>
          </svg>
        </span>
        <span className="skill-card__pillar ui-badge ui-badge--pill">
          {dimension.charAt(0).toUpperCase() + dimension.slice(1)}
        </span>
      </div>
      <div className="skill-card__copy">
        <h3 className="skill-card__title margin-none">
          <Link className="skill-card__link no-underline text-default" data-card-link="" href={href}>
            {name}
          </Link>
        </h3>
        <p className="skill-card__desc margin-none text-muted">{description}</p>
      </div>
      {games.length > 0 && (
        <div className="skill-card__games">
          <span className="ui-label skill-card__games-label layout-block">Games to develop this skill</span>
          <ul className="skill-card__game-list layout-flex wrap gap-sm margin-none">
            {games.map(game => (
              <li key={game.slug}>
                <GamePill {...game} />
              </li>
            ))}
          </ul>
        </div>
      )}
      <Link className="skill-card__action button button--primary sp-progress-button sp-progress-button--compact" href={href} data-meter={progressPercentage}>
        <svg className="sp-icon sp-progress-button__icon" aria-hidden="true" viewBox="0 0 24 24">
          <use href="#ti-chart"></use>
        </svg>
        <span className="sp-progress-button__label">
          {progressPercentage > 0 ? 'Continue progression' : 'Start progression'}
        </span> 
        <span className="sp-progress-button__value">{progressPercentage}%</span>
        <svg className="sp-icon sp-progress-button__chevron" aria-hidden="true" viewBox="0 0 24 24">
          <use href="#ti-chevron-right"></use>
        </svg>
      </Link>
    </article>
  );
}
