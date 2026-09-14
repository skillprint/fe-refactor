'use client';

import React from 'react';
import { FallbackImage } from './FallbackImage';

export interface GameDetailBadgeProps {
  /** Talent name, e.g. "Pattern Matching". */
  badgeName: string;
  /** e.g. "Copycat Cuttlefish". */
  animalName: string;
  points: number;
  /** Badge artwork from lib/badgeArt, or null for an animal without art. */
  art: string | null;
  /** ISO timestamp of the awarding session. */
  earnedAt: string;
  gameTitle: string;
  gameImage?: string;
}

/**
 * A badge this game earned the player (SKI-130 data). Rendered only for an
 * earned badge: which badge a game can earn, and the locked/progress state,
 * waits on the per-game badge lookup (SKI-182).
 */
export function GameDetailBadge({
  badgeName,
  animalName,
  points,
  art,
  earnedAt,
  gameTitle,
  gameImage = ''
}: GameDetailBadgeProps) {
  const earned = new Date(earnedAt);
  const earnedLabel = Number.isNaN(earned.getTime())
    ? 'Earned'
    : `Earned ${earned.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`;

  return (
    <article aria-labelledby="gdBadge" className="rail-card rail-card--badge sp-card" id="badge">
      <div className="rail-card__head">
        <h2 className="rail-card__title" id="gdBadge">Badge</h2>
      </div>
      <div data-gd-badge>
        <figure className="sp-badge sp-badge--sm sp-badge--row" data-earned="true">
          {art ? (
            <FallbackImage
              className="sp-badge__art layout-block"
              src={art}
              alt=""
              width="610"
              height="610"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span className="sp-badge__art layout-grid place-center sp-icon-frame sp-icon-frame--lg" aria-hidden="true">
              <svg className="sp-icon sp-icon--lg" viewBox="0 0 24 24"><use href="#ti-trophy"></use></svg>
            </span>
          )}
          <figcaption className="sp-badge__copy layout-grid min-width-0">
            <strong className="sp-badge__name margin-none">{badgeName}</strong>
            <span className="sp-badge__animal">{animalName}</span>

            <span className="sp-badge__points ui-badge ui-badge--pill">
              <b>{points}</b>&nbsp;{points === 1 ? 'point' : 'points'}
            </span>

            <span className="sp-badge__foot">
              {gameImage && (
                <FallbackImage className="sp-badge__glyph" src={gameImage} alt="" width="18" height="18" loading="lazy" decoding="async" />
              )}
              <span className="sp-badge__game-name">{gameTitle}</span>
              <span className="sp-badge__dot" aria-hidden="true">·</span>
              <span className="sp-badge__when">{earnedLabel}</span>
            </span>
          </figcaption>
        </figure>
      </div>
    </article>
  );
}
