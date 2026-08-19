import React from 'react';
import Link from 'next/link';

export interface DevelopedSkill {
  name: string;
  iconId: string;
  dimension?: 'cognition' | 'mood' | 'personality';
}

export interface FullGameCardProps {
  title: string;
  slug: string;
  description: string;
  duration: string; // e.g. "8–20 min"
  staticArt: string;
  animatedArt?: string;
  mediaBadge?: string; // e.g. "Recommended"
  bestFlowScore?: number; // e.g. 73
  skillsDeveloped?: DevelopedSkill[];
  className?: string;
}

export const FullGameCard: React.FC<FullGameCardProps> = ({
  title,
  slug,
  description,
  duration,
  staticArt,
  animatedArt,
  mediaBadge = 'Recommended',
  bestFlowScore,
  skillsDeveloped = [],
  className = '',
}) => {
  return (
    <article
      className={`game-card game-card--portal sp-card sp-card--interactive card--flush min-width-0 layout-flex flow-column clip ${className}`}
      data-game-slug={slug}
      role="listitem"
    >
      <Link
        className="game-media position-relative clip layout-block"
        href={`/game/${slug}`}
        aria-label={`Play ${title}`}
        tabIndex={-1}
      >
        <span className="art-stack stack position-absolute inset-none clip layout-block">
          <img alt={`${title} game artwork`} className="art-layer art-static position-absolute layout-block opaque" src={staticArt} />
          {animatedArt && (
            <img alt="" aria-hidden="true" className="art-layer art-animated position-absolute layout-block" src={animatedArt} />
          )}
        </span>
        {mediaBadge && (
          <span
            className="media-badge ui-badge position-absolute layout-inline-flex items-center radius-full"
            data-status={
              mediaBadge.toLowerCase().includes('recommended')
                ? 'recommended'
                : mediaBadge.toLowerCase().includes('played')
                ? 'played'
                : mediaBadge.toLowerCase().includes('new')
                ? 'new'
                : mediaBadge.toLowerCase().includes('progress')
                ? 'in-progress'
                : 'recommended'
            }
          >
            {mediaBadge}
          </span>
        )}
      </Link>

      <div className="game-body layout-flex flow-column">
        <div className="game-head layout-flex items-start justify-between gap-lg">
          <h3>
            <Link className="no-underline text-default" href={`/game/${slug}`}>
              {title}
            </Link>
          </h3>
          {bestFlowScore !== undefined && (
            <span className="game-head__best font-mono weight-semibold" title="Your best flow score">
              {bestFlowScore}
            </span>
          )}
        </div>

        <p className="game-description text-muted font-md leading-lg">{description}</p>

        {skillsDeveloped.length > 0 && (
          <div className="trait-group layout-grid gap-sm items-start">
            <span className="ui-label trait-label">Skills developed</span>
            <ul className="trait-skills layout-flex wrap items-center margin-none padding-none">
              {skillsDeveloped.map((skill, idx) => (
                <li key={idx} className="trait-skill">
                  <svg className={`sp-icon sp-icon--2xs ${skill.dimension ? `sp-icon--${skill.dimension}` : ''}`} aria-hidden="true" viewBox="0 0 24 24">
                    <use href={`/assets/design-system/icons/sprite.svg#${skill.iconId}`}></use>
                  </svg>
                  {skill.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="card-footer layout-flex items-center justify-between gap-lg push-block-end">
          <span className="duration layout-inline-flex items-center gap-md text-muted font-sm weight-semibold">
            <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
              <use href="/assets/design-system/icons/sprite.svg#ti-clock"></use>
            </svg>
            {duration}
          </span>
          <div className="card-actions cluster">
            <Link className="details-btn button button--secondary button--md" href={`/game/${slug}/detail`}>
              <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                <use href="/assets/design-system/icons/sprite.svg#ti-info"></use>
              </svg>
              <span>Details</span>
              <span className="sr-only"> for {title}</span>
            </Link>
            <Link className="play-btn button button--primary button--md" href={`/game/${slug}`}>
              <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                <use href="/assets/design-system/icons/sprite.svg#ti-play"></use>
              </svg>
              <span>Play</span>
              <span className="sr-only"> {title}</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default FullGameCard;
