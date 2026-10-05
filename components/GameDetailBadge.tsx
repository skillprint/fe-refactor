'use client';

import React from 'react';
import { FallbackImage } from './FallbackImage';
import type { GameBadge } from '@/lib/models/portal/LibraryGameBadges';
import { getBadgeArt } from '@/lib/badgeArt';

export interface GameDetailBadgeProps {
  /** The badges playing this game works toward, with the player's standing (SKI-182). */
  badges: GameBadge[];
  gameTitle: string;
  gameImage?: string;
}

function earnedLabel(iso: string | null): string {
  const earned = iso ? new Date(iso) : null;
  if (!earned || Number.isNaN(earned.getTime())) return 'Earned';
  return `Earned ${earned.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`;
}

/**
 * Badge rail on the game detail page. Each badge is a talent unlocked by
 * mastering one of the skills this game trains; a locked one shows how far
 * the player's mastery is toward the unlock threshold. Renders nothing for a
 * game whose skills carry no active badge.
 */
export function GameDetailBadge({ badges, gameTitle, gameImage = '' }: GameDetailBadgeProps) {
  if (badges.length === 0) return null;
  const earnedCount = badges.filter((b) => b.unlocked).length;

  return (
    <article aria-labelledby="gdBadge" className="rail-card rail-card--badge sp-card" id="badge">
      <div className="rail-card__head">
        <h2 className="rail-card__title" id="gdBadge">{badges.length === 1 ? 'Badge' : 'Badges'}</h2>
        <p className="rail-card__hint" data-gd-badge-hint="">
          {badges.length === 1
            ? `Playing ${gameTitle} works toward this badge.`
            : `Playing ${gameTitle} works toward ${badges.length} badges${earnedCount > 0 ? `, ${earnedCount} earned` : ''}.`}
        </p>
      </div>
      <div data-gd-badge className="layout-grid gap-lg">
        {badges.map((badge) => {
          const art = getBadgeArt(badge);
          const percent = Math.round(Math.max(0, Math.min(1, badge.progress)) * 100);
          return (
            <figure
              key={badge.slug}
              className={`sp-badge sp-badge--sm sp-badge--row margin-none${badge.unlocked ? '' : ' sp-badge--locked'}`}
              data-badge={badge.slug}
              data-earned={badge.unlocked ? 'true' : 'false'}
            >
              {art ? (
                <FallbackImage className="sp-badge__art layout-block" src={art} alt="" width="610" height="610" loading="lazy" decoding="async" />
              ) : (
                <span className="sp-badge__art layout-grid place-center sp-icon-frame sp-icon-frame--lg" aria-hidden="true">
                  <svg className="sp-icon sp-icon--lg" viewBox="0 0 24 24"><use href="#ti-trophy"></use></svg>
                </span>
              )}
              <figcaption className="sp-badge__copy layout-grid min-width-0">
                <strong className="sp-badge__name margin-none">
                  {badge.name}
                  {badge.unlocked && badge.seen === false && <span className="ui-badge ui-badge--sm ml-2">New</span>}
                </strong>
                <span className="sp-badge__animal">{badge.animalName}</span>

                <span className="sp-badge__points ui-badge ui-badge--pill" data-points={badge.points}>
                  <b>{badge.points}</b>&nbsp;{badge.points === 1 ? 'point' : 'points'}
                </span>

                {!badge.unlocked && (
                  <span className="sp-badge__progress layout-grid gap-sm" data-badge-progress={percent}>
                    <span
                      aria-label={`${badge.name} badge progress`}
                      aria-valuemax={100}
                      aria-valuemin={0}
                      aria-valuenow={percent}
                      className="sp-progress"
                      role="progressbar"
                    >
                      <span className="sp-progress__track">
                        <span className="sp-progress__fill" style={{ '--progress': `${percent}%` } as React.CSSProperties}></span>
                      </span>
                    </span>
                    <span className="font-xs text-muted">
                      {percent === 0
                        ? `Play ${gameTitle} to start measuring ${badge.name.toLowerCase()}.`
                        : `${percent}% of the way to unlocking it.`}
                    </span>
                  </span>
                )}

                <span className="sp-badge__foot">
                  {gameImage && (
                    <FallbackImage className="sp-badge__glyph" src={gameImage} alt="" width="18" height="18" loading="lazy" decoding="async" />
                  )}
                  <span className="sp-badge__game-name">{gameTitle}</span>
                  <span className="sp-badge__dot" aria-hidden="true">·</span>
                  <span className="sp-badge__when">
                    {!badge.unlocked && (
                      <svg className="sp-icon sp-icon--sm" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-lock"></use></svg>
                    )}
                    {badge.unlocked ? earnedLabel(badge.earnedAt) : 'Not earned yet'}
                  </span>
                </span>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </article>
  );
}
