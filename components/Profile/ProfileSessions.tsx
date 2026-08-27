import React from 'react';
import Link from 'next/link';

interface Session {
  id: string;
  gameName: string;
  date: string;
  score: number;
  skillMeasured: string;
  duration?: string;
}

interface ProfileSessionsProps {
  sessions: Session[];
}

export default function ProfileSessions({ sessions }: ProfileSessionsProps) {
  return (
    <section className="pp-section" id="sessions">
      <div className="section-head pp-head layout-flex wrap items-end justify-between gap-2xl">
        <div className="section-head-copy">
          <h2>Game sessions</h2>
          <p className="margin-none text-muted">
            Every session you have finished, newest first, with the score it returned and the skill it was measured against.
          </p>
        </div>
        <Link href="/games" className="button button--tertiary button--sm">
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
            <p className="margin-none text-muted font-sm" data-state-text="sessionsLede">
              {sessions.length === 0 ? 'No sessions yet.' : `Showing ${sessions.length} sessions`}
            </p>
          </div>
          <span className="pp-played radius-full layout-inline-flex items-center gap-sm font-xs weight-semibold no-grow">
            Games played <strong data-state-text="sessionsCount">{sessions.length}</strong>
          </span>
        </div>
        
        {sessions.length > 0 ? (
          <ul className="pp-session-list layout-grid gap-md margin-none" data-pp-ledger>
            {sessions.map((s, index) => (
              <li key={s.id || index} className="layout-flex items-center justify-between gap-md padding-md border-subtle radius-md bg-card">
                <div>
                  <h4 className="font-md weight-semibold margin-none">{s.gameName}</h4>
                  <div className="text-muted font-sm">{s.date} • {s.duration || '5m'}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-primary weight-bold">{s.score}</div>
                  <div className="font-xs text-muted uppercase">{s.skillMeasured}</div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="portal-blank" data-state-when="first">
            <span className="sp-icon-frame sp-icon-frame--md no-grow" aria-hidden="true">
              <svg className="sp-icon sp-icon--sm" viewBox="0 0 24 24">
                <use href="#ti-clock"></use>
              </svg>
            </span>
            <p className="portal-blank__title">No sessions yet</p>
            <p className="portal-blank__note">
              Nothing yet. Each finished game lands here with its date, its score and the skill it measured.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
