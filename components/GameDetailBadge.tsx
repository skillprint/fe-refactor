'use client';

import React from 'react';

export interface GameDetailBadgeProps {
  badgeName?: string;
  badgeSkill?: string;
  badgePoints?: number;
  isEarned?: boolean;
  gameTitle?: string;
  gameImage?: string;
  earnedDate?: string;
}

export function GameDetailBadge({
  badgeName = 'Eagle',
  badgeSkill = 'Focus',
  badgePoints = 50,
  isEarned = false,
  gameTitle = 'Unknown',
  gameImage = '',
  earnedDate = 'Not earned yet'
}: GameDetailBadgeProps) {
  // If we wanted to hide the card when no badge exists, we'd handle it in the parent component.
  // Here we just render the card.
  return (
    <article aria-labelledby="gdBadge" className="rail-card rail-card--badge sp-card" id="badge">
      <div className="rail-card__head">
        <h2 className="rail-card__title" id="gdBadge">Badge</h2>
      </div>
      <div data-gd-badge>
        <figure className={`sp-badge sp-badge--sm sp-badge--row ${!isEarned ? 'sp-badge--locked' : ''}`}>
          <div className="sp-badge__art-box">
            <img 
              className="sp-badge__art" 
              src={`/assets/images/badges/collection/cuttlefish/cuttlefish-badge-cool-green-gear.svg`} 
              alt="" 
              // Fallback if image doesn't exist yet
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <figcaption className="sp-badge__caption">
            <div className="sp-badge__head">
              <strong className="sp-badge__talent">{badgeSkill}</strong>
              <span className="sp-badge__animal">{badgeName}</span>
            </div>
            
            <span className="sp-badge__points ui-badge ui-badge--pill">
              <b>{badgePoints}</b>&nbsp;{badgePoints === 1 ? 'point' : 'points'}
            </span>
            
            <span className="sp-badge__foot">
              {gameImage && (
                <img className="sp-badge__glyph" src={gameImage} alt="" width="18" height="18" loading="lazy" decoding="async" />
              )}
              <span className="sp-badge__game-name">{gameTitle}</span>
              <span className="sp-badge__dot" aria-hidden="true">·</span>
              <span className="sp-badge__when">
                {!isEarned && (
                  <svg className="sp-icon sp-icon--sm" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-lock"></use></svg>
                )}
                {earnedDate}
              </span>
            </span>
          </figcaption>
        </figure>
      </div>
    </article>
  );
}
