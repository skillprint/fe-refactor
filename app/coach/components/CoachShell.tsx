'use client';

/**
 * The `/coach` chrome and auth gate (SKI-212).
 *
 * Separate from `PortalLayout` on purpose: a coach is not a player looking at a
 * different tab, and sharing the player shell would put the player sidebar
 * (Games, Playbooks, Profile) around a roster screen.
 *
 * The gate asks `/api/coach/context/`, which answers `isCoach: false` with a
 * 200 rather than a 403 — the question is asked *in order to* decide what to
 * render, so "no" is an answer. A non-coach gets a plain explanation, not an
 * error page.
 */
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { COACH_MOCKS_ENABLED, useCoachContext } from '@/lib/models/coach';
import { ErrorState, Loading } from './ui';

function MockBar() {
  if (!COACH_MOCKS_ENABLED) return null;
  return (
    <div className="coach-mockbar" role="status">
      <strong>Mock data.</strong>
      <span>
        Every figure below is generated in <code>lib/models/coach/mocks</code> — no player on this
        screen is real. Set <code>NEXT_PUBLIC_COACH_MOCKS=false</code> to read the live API.
      </span>
    </div>
  );
}

export default function CoachShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data, isLoading, error, refetch } = useCoachContext();

  const nav = [
    { href: '/coach/teams', label: 'Teams' },
  ];

  return (
    <div className="coach-app">
      <MockBar />

      <header className="coach-top">
        <div className="coach-brand">
          <span className="coach-brand__mark" aria-hidden="true">S</span>
          <span>Skillprint Coach</span>
          {data?.organizations?.[0] && (
            <span className="coach-brand__org">· {data.organizations[0].name}</span>
          )}
        </div>
        <nav className="coach-nav" aria-label="Coach sections">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname?.startsWith(item.href) ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <div className="coach-content">
        {isLoading && !data && <Loading rows={4} />}

        {error && <ErrorState error={error} onRetry={refetch} />}

        {data && !data.isCoach && (
          <div className="coach-state">
            <h3>This account does not coach anything</h3>
            <p>
              Coaching access is granted per organisation. If you expect to see a team here, ask an
              administrator to add you as a coach.
            </p>
          </div>
        )}

        {data?.isCoach && children}
      </div>
    </div>
  );
}
