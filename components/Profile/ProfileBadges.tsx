import React from 'react';
import Link from 'next/link';
import { MockDataTag } from '../MockDataTag';
import { FallbackImage } from '../FallbackImage';
import { useProfileBadges } from '../../lib/models/portal/useProfileBadges';

function formatRelativeDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'today';
  if (diffInDays === 1) return 'yesterday';
  if (diffInDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toLowerCase();
}

export default function ProfileBadges() {
  const { data: badges, isLoading } = useProfileBadges();
  const displayBadges = badges || [];
  const hasBadges = displayBadges.length > 0;

  return (
    <section className="pp-section" id="badges" style={{ position: 'relative' }}>
      <div className="section-head pp-head layout-flex wrap items-end justify-between gap-2xl">
        <div className="section-head-copy">
          <h2>Badges</h2>
          <p className="margin-none text-muted">
            Awards your sessions have earned, newest first. Each belongs to the game that measures the skill it is named for.
          </p>
        </div>
        <Link href="/games" className="button button--tertiary button--sm">
          Play a game 
          <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
            <use href="#ti-arrow-right"></use>
          </svg>
        </Link>
      </div>

      <div className="pp-badge-grid" data-pp-badges hidden={!hasBadges}>
        {displayBadges.map((badge) => (
          <article className="pp-badge-card sp-card" key={badge.slug}>
            <figure className="sp-badge sp-badge--lg" data-badge={badge.slug} data-earned="true">
              <FallbackImage 
                className="sp-badge__art layout-block" 
                src={badge.art} 
                alt="" 
                width="610" 
                height="610" 
                loading="lazy" 
                decoding="async" 
              />
              <figcaption className="sp-badge__copy layout-grid min-width-0">
                <strong className="sp-badge__name margin-none">{badge.skill}</strong>
                <span className="sp-badge__animal">{badge.name}</span>
                <span className="sp-badge__points ui-badge ui-badge--pill" data-points={badge.points}>
                  <b>{badge.points}</b>&nbsp;{badge.points === 1 ? 'point' : 'points'}
                </span>
                <span className="sp-badge__foot">
                  <FallbackImage 
                    className="sp-badge__glyph" 
                    src={badge.gameArt} 
                    alt="" 
                    width="18" 
                    height="18" 
                    loading="lazy" 
                    decoding="async" 
                  />
                  <span className="sp-badge__game-name">{badge.gameTitle}</span>
                  <span className="sp-badge__dot" aria-hidden="true">·</span>
                  <span className="sp-badge__when">Earned {formatRelativeDate(badge.unlocked_at)}</span>
                </span>
                {badge.reason && (
                  <p className="sp-badge__reason margin-none">{badge.reason}</p>
                )}
              </figcaption>
            </figure>
          </article>
        ))}
      </div>

      <div className="pp-badge-empty sp-panel" data-pp-badges-empty hidden={hasBadges}>
        <span className="pp-badge-empty__icon" aria-hidden="true">
          <svg className="sp-icon sp-icon--lg" aria-hidden="true" viewBox="0 0 24 24">
            <use href="#ti-trophy"></use>
          </svg>
        </span>
        <div className="layout-grid gap-sm">
          <strong className="font-md leading-md weight-semibold">No badges yet</strong>
          <p className="margin-none text-muted font-sm leading-sm">
            A badge marks something a session showed — a streak held, a skill at its best. Finish a game and the first one is yours.
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
