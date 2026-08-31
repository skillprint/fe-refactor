import React from 'react';
import Link from 'next/link';

interface ProfileRailProps {
  skillsCount: number;
  totalSkills: number;
  daysPlayed: number;
  sessions?: any[];
}

export default function ProfileRail({ skillsCount, totalSkills, daysPlayed, sessions = [] }: ProfileRailProps) {
  const completePct = Math.round((skillsCount / totalSkills) * 100) || 0;
  const recentSessions = sessions.slice(0, 5);
  
  return (
    <>
      <article className="rail-card sp-card sp-card--raised" aria-labelledby="railNext">
        <div className="rail-card__head">
          <h2 className="rail-card__title" id="railNext">Next</h2>
          <span className="ui-badge ui-badge--sm" data-state-text="nextBadge">Not started</span>
        </div>
        <p className="margin-none font-sm leading-md" data-state-text="nextCopy">
          Nothing here is scored until you play. A session runs five to ten minutes, and five of them is a first reading.
        </p>
        <Link href="/games" className="button button--primary button--md full-width" data-state-link="next">
          <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
            <use href="#ti-play"></use>
          </svg>
          <span data-state-text="nextAction">Play a game</span>
        </Link>
        <Link href="/games" className="portal-section__link font-sm">
          Choose Game 
          <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
            <use href="#ti-chevron-right"></use>
          </svg>
        </Link>
      </article>

      <article className="rail-card sp-card" aria-labelledby="summaryTitle">
        <div className="rail-card__head">
          <span className="rail-card__label" id="summaryTitle">This week</span>
        </div>
        <div className="layout-grid gap-sm">
          <div className="layout-flex items-center justify-between gap-md font-sm">
            <span className="text-muted">Skillprint complete</span>
            <span className="weight-semibold" data-state-text="completePct">{completePct}%</span>
          </div>
          <div className="rail-meter" data-meter={completePct} style={{ '--meter-fill': `${completePct}%` } as React.CSSProperties}><i></i></div>
        </div>
        <div className="layout-flex items-center justify-between gap-md separator-top font-sm">
          <span className="text-muted" data-state-text="streakLabel">{daysPlayed > 0 ? `${daysPlayed} Sessions` : 'No sessions yet'}</span>
          <div className="pp-streak-days layout-flex gap-sm" data-pp-streak>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, index) => {
              const now = new Date();
              const dayOfWeek = (now.getDay() + 6) % 7;
              const startOfWeek = new Date(now);
              startOfWeek.setDate(now.getDate() - dayOfWeek);
              startOfWeek.setHours(0, 0, 0, 0);

              const isActive = sessions.some(session => {
                const sessionDate = new Date(session.date || session.timestamp);
                const diffTime = sessionDate.getTime() - startOfWeek.getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                return diffDays === index;
              });

              const className = `day layout-grid place-center border-subtle radius-round ${isActive ? 'done text-deep' : ''}`;
              return (
                <span key={index} className={className.trim()}>{label}</span>
              );
            })}
          </div>
        </div>
      </article>

      <article className="rail-card sp-card" id="recent-sessions" aria-labelledby="railRecent">
        <div className="rail-card__head">
          <span className="rail-card__label" id="railRecent">Recent sessions</span>
          {recentSessions.length > 0 && (
            <span className="ui-badge ui-badge--sm" data-state-text="recentBadge">
              {recentSessions.length < 5 ? `Last ${recentSessions.length}` : 'Last 5'}
            </span>
          )}
        </div>
        <ul className="rail-list" data-pp-session-list="">
          {recentSessions.map((session, i) => (
            <li key={session.id || i}>
              <Link className="rail-list__link" href={`/game/${session.gameSlug || session.id}`}>
                <img className="rail-thumb" alt="" src={session.gameImage || '/images/default-game.jpg'} />
                <span className="rail-list__name">{session.gameName}</span>
                <span className="rail-list__value">{session.score}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="empty-state text-center" data-pp-session-empty="" hidden={recentSessions.length > 0}>
          <svg className="sp-icon sp-icon--xl sp-icon--muted" aria-hidden="true" viewBox="0 0 24 24">
            <use href="#ti-gamepad"></use>
          </svg>
          <p className="margin-none text-muted font-sm">No sessions recorded yet.</p>
          <p className="margin-none font-xs text-subtle">Start playing to see your history.</p>
        </div>
        <Link className="portal-section__link font-sm" href="#sessions">
          All sessions 
          <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
            <use href="#ti-chevron-right"></use>
          </svg>
        </Link>
      </article>
    </>
  );
}
