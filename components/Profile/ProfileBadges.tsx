'use client';

import React from 'react';
import Link from 'next/link';
import { FallbackImage } from '../FallbackImage';
import { useProfileBadges } from '../../lib/models/portal/useProfileBadges';
import { getBadgeArt } from '../../lib/badgeArt';
import { getGameDetails } from '../../app/config/gameConfig';
import { unifiedSlugFromBESlug } from '../../app/utils/slugUtils';

function formatRelativeDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays <= 0) return 'today';
  if (diffInDays === 1) return 'yesterday';
  if (diffInDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toLowerCase();
}

/** Badges section (SKI-130) — backed by `GET /api/portal/profile/badges/`. */
export default function ProfileBadges() {
  const { data, isLoading } = useProfileBadges();
  const badges = data?.badges || [];
  const hasBadges = badges.length > 0;

  return (
    <section className="pp-section" id="badges">
      <div className="section-head pp-head layout-flex wrap items-end justify-between gap-2xl">
        <div className="section-head-copy">
          <h2>Badges</h2>
          <p className="margin-none text-muted">
            Awards your sessions have earned, newest first. Each belongs to the game that measures the skill it is named for.
          </p>
          {data && (
            <p className="margin-none text-muted font-sm" data-pp-badge-totals>
              <strong className="text-default">{data.totalUnlocked}</strong> of {data.totalBadges} earned
              <span className="sp-badge__dot" aria-hidden="true"> · </span>
              <strong className="text-default">{data.totalPoints}</strong> {data.totalPoints === 1 ? 'point' : 'points'}
            </p>
          )}
        </div>
        <Link href="/games" className="button button--tertiary button--sm">
          Play a game 
          <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
            <use href="#ti-arrow-right"></use>
          </svg>
        </Link>
      </div>

      <div className="pp-badge-grid" data-pp-badges hidden={!hasBadges}>
        {badges.map((badge) => {
          const art = getBadgeArt(badge);
          const localGame = badge.gameSlug ? getGameDetails(unifiedSlugFromBESlug(badge.gameSlug)) : null;
          return (
            <article className="pp-badge-card sp-card" key={`${badge.slug}-${badge.earnedAt}`}>
              <figure className="sp-badge sp-badge--lg" data-badge={badge.slug} data-earned="true" data-seen={badge.seen ? 'true' : 'false'}>
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
                  <strong className="sp-badge__name margin-none">
                    {badge.name}
                    {!badge.seen && <span className="ui-badge ui-badge--sm ml-2">New</span>}
                  </strong>
                  <span className="sp-badge__animal">{badge.animalName}</span>
                  <span className="sp-badge__points ui-badge ui-badge--pill" data-points={badge.points}>
                    <b>{badge.points}</b>&nbsp;{badge.points === 1 ? 'point' : 'points'}
                  </span>
                  <span className="sp-badge__foot">
                    {localGame?.image && (
                      <FallbackImage 
                        className="sp-badge__glyph" 
                        src={localGame.image} 
                        alt="" 
                        width="18" 
                        height="18" 
                        loading="lazy" 
                        decoding="async" 
                      />
                    )}
                    <span className="sp-badge__game-name">{badge.gameName || localGame?.name || 'Game no longer available'}</span>
                    <span className="sp-badge__dot" aria-hidden="true">·</span>
                    <span className="sp-badge__when">Earned {formatRelativeDate(badge.earnedAt)}</span>
                  </span>
                  {badge.reason && (
                    <p className="sp-badge__reason margin-none">{badge.reason}</p>
                  )}
                  {badge.animalFunFact && (
                    <p className="sp-badge__reason margin-none text-muted font-xs">{badge.animalFunFact}</p>
                  )}
                </figcaption>
              </figure>
            </article>
          );
        })}
      </div>

      <div className="pp-badge-empty sp-panel" data-pp-badges-empty hidden={hasBadges || isLoading}>
        <span className="pp-badge-empty__icon" aria-hidden="true">
          <svg className="sp-icon sp-icon--lg" aria-hidden="true" viewBox="0 0 24 24">
            <use href="#ti-trophy"></use>
          </svg>
        </span>
        <div className="layout-grid gap-sm">
          <strong className="font-md leading-md weight-semibold">No badges yet</strong>
          <p className="margin-none text-muted font-sm leading-sm">
            A badge marks something a session showed — a streak held, a skill at its best. Finish a game and the first one is yours.
            {data ? ` There are ${data.totalBadges} to collect.` : ''}
          </p>
        </div>
        <Link href="/games" className="button button--secondary button--sm">
          Browse games 
          <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
            <use href="#ti-arrow-right"></use>
          </svg>
        </Link>
      </div>
    </section>
  );
}
