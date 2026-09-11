import React from 'react';
import Link from 'next/link';

interface ProfileRailProps {
  skillsCount: number;
  totalSkills: number;
  daysPlayed: number;
  sessions?: any[];
}

/** Monday-based weekday index (0 = Monday) of a local date. */
const weekdayIndex = (d: Date) => (d.getDay() + 6) % 7;

/** Local midnight on the Monday of the week containing `now`. */
const startOfWeek = (now: Date) => {
  const start = new Date(now);
  start.setDate(now.getDate() - weekdayIndex(now));
  start.setHours(0, 0, 0, 0);
  return start;
};

export default function ProfileRail({ skillsCount, totalSkills, daysPlayed, sessions = [] }: ProfileRailProps) {
  const completePct = Math.round((skillsCount / totalSkills) * 100) || 0;
  const recentSessions = sessions.slice(0, 5);

  // SKI-141: the "This week" card used to read the lifetime count from the
  // profile aggregate while the weekday dots read the local session log, so a
  // fresh session lit a day while the label still said "No sessions yet".
  // Both now come from the same sessions list, and the label counts the week
  // the dots show.
  const weekStart = startOfWeek(new Date());
  const weekDays = new Set<number>();
  let weekSessions = 0;
  sessions.forEach((session) => {
    const when = new Date(session.date ?? session.timestamp);
    if (isNaN(when.getTime()) || when < weekStart) return;
    const day = weekdayIndex(when);
    if (when.getTime() - weekStart.getTime() >= 7 * 24 * 60 * 60 * 1000) return;
    weekDays.add(day);
    weekSessions += 1;
  });
  const lifetimeSessions = Math.max(daysPlayed, sessions.length);
  const streakLabel = weekSessions > 0
    ? `${weekSessions} ${weekSessions === 1 ? 'session' : 'sessions'} this week`
    : lifetimeSessions > 0
      ? 'No sessions this week'
      : 'No sessions yet';
  
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
          <span className="text-muted" data-state-text="streakLabel">{streakLabel}</span>
          <div className="pp-streak-days layout-flex gap-sm" data-pp-streak aria-label={streakLabel}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, index) => {
              const isActive = weekDays.has(index);
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
