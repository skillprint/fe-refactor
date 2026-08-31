import React from 'react';
import Link from 'next/link';

interface Session {
  id: string;
  gameSlug: string;
  gameName: string;
  gameImage?: string;
  date: string | number;
  score: number;
  skillMeasured: string;
}

interface ProfileSessionsProps {
  sessions: Session[];
}

export default function ProfileSessions({ sessions }: ProfileSessionsProps) {
  const formatDate = (dateValue: string | number) => {
    try {
      const d = new Date(dateValue);
      if (isNaN(d.getTime())) {
        return String(dateValue);
      }
      return d.toLocaleString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit' 
      });
    } catch {
      return String(dateValue);
    }
  };

  return (
    <section className="pp-section" id="sessions">
      <div className="section-head pp-head layout-flex wrap items-end justify-between gap-2xl">
        <div className="section-head-copy">
          <h2>Game sessions</h2>
          <p className="margin-none text-muted">
            Every session you have finished, newest first, with the score it returned and the skill it was measured against.
          </p>
        </div>
        <Link className="button button--tertiary button--sm" href="/games">
          Play a game 
          <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
            <use href="#ti-arrow-right"></use>
          </svg>
        </Link>
      </div>

      <div className="pp-sessions sp-panel">
        <div className="pp-sessions__head separator-bottom layout-flex wrap items-end justify-between gap-lg">
          <div className="min-width-0">
            <h3>All sessions</h3>
            <p className="margin-none text-muted font-sm">
              {sessions.length === 0 ? "No sessions yet." : "Your complete play history."}
            </p>
          </div>
          <span className="pp-played radius-full layout-inline-flex items-center gap-sm font-xs weight-semibold no-grow">
            Games played <strong>{sessions.length}</strong>
          </span>
        </div>
        
        {sessions.length > 0 ? (
          <ul className="pp-session-list layout-grid gap-md margin-none">
            {sessions.map((session) => (
              <li className="pp-session" key={session.id}>
                <Link className="pp-session__link surface-box border-subtle" href={`/game_detail?game=${session.gameSlug}&from=session`}>
                  {session.gameImage ? (
                    <img className="pp-session__icon radius-compact" alt={session.gameName} src={session.gameImage} />
                  ) : (
                    <div className="pp-session__icon radius-compact bg-surface-variant flex items-center justify-center">
                      <svg className="sp-icon sp-icon--sm" viewBox="0 0 24 24"><use href="#ti-gamepad"></use></svg>
                    </div>
                  )}
                  <div className="min-width-0">
                    <p className="margin-none weight-semibold">{session.gameName}</p>
                    <p className="margin-none text-muted font-sm leading-sm">
                      {formatDate(session.date)} &middot; {session.skillMeasured} &middot; 5 min
                    </p>
                  </div>
                  <div className="pp-session__score"><strong className="font-mono">{session.score.toLocaleString()}</strong></div>
                  <svg className="sp-icon sp-icon--sm sp-icon--muted pp-session__cue" aria-hidden="true" viewBox="0 0 24 24">
                    <use href="#ti-chevron-right"></use>
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="portal-blank">
            <span className="sp-icon-frame sp-icon-frame--md no-grow" aria-hidden="true">
              <svg className="sp-icon sp-icon--sm" viewBox="0 0 24 24"><use href="#ti-clock"></use></svg>
            </span>
            <p className="portal-blank__title">No sessions yet</p>
            <p className="portal-blank__note">Nothing yet. Each finished game lands here with its date, its score and the skill it measured.</p>
          </div>
        )}
      </div>
    </section>
  );
}
