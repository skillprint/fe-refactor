import React from 'react';
import Link from 'next/link';

export interface PlaybookCardProps {
  title: string;
  slug: string;
  description: string;
  tag: string; // e.g. "Focus", "Learning", "Wellness"
  completedCount: number; // e.g. 1
  totalCount: number; // e.g. 3
  staticArt: string;
  actionText?: string; // e.g. "Continue" | "Start"
  className?: string;
}

export const PlaybookCard: React.FC<PlaybookCardProps> = ({
  title,
  slug,
  description,
  tag,
  completedCount = 0,
  totalCount = 3,
  staticArt,
  actionText = 'Start',
  className = '',
}) => {
  return (
    <article className={`game-card game-card--portal playbook-card sp-card sp-card--interactive card--flush tone tone--pink min-width-0 layout-flex flow-column clip ${className}`}>
      <Link
        className="game-media position-relative clip layout-block"
        href={`/game/${slug}`}
        aria-label={`${actionText} ${title}`}
        tabIndex={-1}
      >
        <span className="art-stack stack position-absolute inset-none clip layout-block">
          <img alt="" aria-hidden="true" className="art-layer art-static position-absolute layout-block opaque" src={staticArt} />
        </span>
        <span className="media-badge playbook-card__tag ui-badge position-absolute layout-inline-flex items-center radius-full font-xs leading-sm">
          {tag}
        </span>
      </Link>

      <div className="game-body layout-flex flow-column">
        <div className="game-head layout-flex items-start justify-between gap-lg">
          <h3>
            <Link className="no-underline text-default" href={`/game/${slug}`}>
              {title}
            </Link>
          </h3>
        </div>

        <p className="game-description text-muted font-md leading-lg">{description}</p>

        <div className="playbook-card__progress">
          <p className="playbook-card__count">{completedCount} of {totalCount} games</p>
          <ol className="nextup-slots flex items-center gap-1.5 mt-1" aria-label={`${completedCount} of ${totalCount} played`}>
            {Array.from({ length: totalCount }).map((_, idx) => (
              <li
                key={idx}
                className={`nextup-slot ${idx < completedCount ? '' : 'nextup-slot--empty'} w-6 h-6 rounded border border-slate-700 overflow-hidden flex items-center justify-center`}
              >
                {idx < completedCount ? (
                  <img src={staticArt} alt="" className="w-full h-full object-cover" />
                ) : null}
              </li>
            ))}
          </ol>
        </div>

        <div className="card-footer layout-flex items-center justify-between gap-lg push-block-end">
          <span className="duration layout-inline-flex items-center gap-md text-muted font-sm weight-semibold">
            <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
              <use href="/assets/design-system/icons/sprite.svg#ti-layout-grid"></use>
            </svg>
            {totalCount} games
          </span>
          <div className="card-actions cluster">
            <Link className="play-btn button button--primary button--md" href={`/game/${slug}`}>
              <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                <use href="/assets/design-system/icons/sprite.svg#ti-play"></use>
              </svg>
              <span>{actionText}</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PlaybookCard;
