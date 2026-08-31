import React from 'react';
import Link from 'next/link';
import { MockDataTag } from '../MockDataTag';
import { FallbackImage } from '../FallbackImage';
// Mock data matching the redesign's PORTAL_BADGES
const MOCK_BADGES = [
  {
    slug: 'cuttlefish',
    name: 'Copycat Cuttlefish',
    skill: 'Pattern Matching',
    art: '/assets/images/badges/collection/cuttlefish/cuttlefish-badge-cool-green-gear.svg',
    gameTitle: 'Hextris',
    gameArt: '/assets/images/games/game-hextris.svg',
    reason: 'You kept clearing sets while the outer ring was closing in, and your accuracy never dropped with the pace.',
    earned: 'Today',
    points: 20
  },
  {
    slug: 'gorilla',
    name: 'Gameplan Gorilla',
    skill: 'Planning',
    art: '/assets/images/badges/collection/gorilla/gorilla-badge-skills-pink-star.svg',
    gameTitle: 'Box Tower',
    gameArt: '/assets/images/games/game-box-tower.svg',
    reason: 'Every block placed where the next one could still land. The tower held because the plan did.',
    earned: 'Sunday',
    points: 30
  },
  {
    slug: 'beaver',
    name: 'Building Beaver',
    skill: 'Organizing',
    art: '/assets/images/badges/collection/beaver/beaver-badge-mindset-violet-flower.svg',
    gameTitle: 'Gummy Blocks',
    gameArt: '/assets/images/games/game-gummy-blocks.svg',
    reason: 'You cleared the board by grouping before placing, and never boxed yourself into a corner.',
    earned: 'Friday',
    points: 15
  }
];

export default function ProfileBadges() {
  const hasBadges = MOCK_BADGES.length > 0;

  return (
    <section className="pp-section" id="badges" style={{ position: 'relative' }}>
      <MockDataTag />
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
        {MOCK_BADGES.map((badge) => (
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
                  <span className="sp-badge__when">Earned {badge.earned.toLowerCase()}</span>
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
