import React from 'react';
import Link from 'next/link';

export default function ProfileBadges() {
  return (
    <section className="pp-section" id="badges">
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

      <div className="pp-badge-grid" data-pp-badges>
        {/* We'll leave the mock data here for now but add the empty state below it (hidden if not empty) */}
        <article className="badge-card sp-card">
          <div className="badge-card-icon bg-gradient-to-br from-yellow-400 to-orange-500">🏆</div>
          <div className="badge-card-content">
            <h3 className="badge-title">First Win</h3>
            <p className="badge-desc text-muted font-sm">Awarded for winning your first game.</p>
          </div>
        </article>
        
        <article className="badge-card sp-card">
          <div className="badge-card-icon bg-gradient-to-br from-blue-400 to-indigo-500">🧠</div>
          <div className="badge-card-content">
            <h3 className="badge-title">Sharp Mind</h3>
            <p className="badge-desc text-muted font-sm">Awarded for high focus in a session.</p>
          </div>
        </article>

        <article className="badge-card sp-card">
          <div className="badge-card-icon bg-gradient-to-br from-red-400 to-pink-500">⚡</div>
          <div className="badge-card-content">
            <h3 className="badge-title">Lightning Reflexes</h3>
            <p className="badge-desc text-muted font-sm">Awarded for fast reaction time.</p>
          </div>
        </article>
      </div>

      <div className="pp-badge-empty sp-panel" data-pp-badges-empty hidden>
        <span className="pp-badge-empty__icon" aria-hidden="true">
          <svg className="sp-icon sp-icon--lg" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-trophy"></use></svg>
        </span>
        <div className="layout-grid gap-sm">
          <strong className="font-md leading-md weight-semibold">No badges yet</strong>
          <p className="margin-none text-muted font-sm leading-sm">A badge marks something a session showed — a streak held, a skill at its best. Finish a game and the first one is yours.</p>
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
