'use client';

/**
 * The `/coach` chrome and its guard (SKI-212, SKI-213, SKI-253).
 *
 * Separate from `PortalLayout` on purpose: a coach is not a player looking at a
 * different tab, and sharing the player shell would put the player sidebar
 * (Games, Playbooks, Profile) around a roster screen.
 *
 * ## Three gates, in order, and why that order
 *
 * 1. **Restoring.** The stored session is unreadable during server rendering,
 *    so the first client render always looks signed out. Redirecting here would
 *    bounce a signed-in coach on every page load.
 * 2. **Signed in?** No session means the sign-in screen, carrying `next` so a
 *    deep link survives.
 * 3. **A coach?** `/api/coach/context/` answers `isCoach: false` with a 200,
 *    because the question is asked *in order to* decide what to render. A
 *    signed-in non-coach gets an explanation, not an error.
 *
 * Asking 3 before 2 would fire an unauthenticated request on every load and
 * fill the logs with 401s that mean nothing.
 */
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { COACH_MOCKS_ENABLED, useCoachAuth, useCoachContext } from '@/lib/models/coach';
import { ErrorState, Loading } from './ui';

/** Routes that must render without a session. */
const PUBLIC_COACH_PATHS = ['/coach/login', '/coach/forgot-password', '/coach/set-password'];

function MockBar() {
  if (!COACH_MOCKS_ENABLED) return null;
  return (
    <div className="coach-mockbar" role="status">
      <strong>Mock data.</strong>
      <span>
        Nothing on this screen is a real player.
        <span className="coach-mockbar__long">
          {' '}Generated in <code>lib/models/coach/mocks</code>; set{' '}
          <code>NEXT_PUBLIC_COACH_MOCKS=false</code> to read the live API.
        </span>
      </span>
    </div>
  );
}

/** The dashboard, once we know who is looking. */
function CoachDashboard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, signOut } = useCoachAuth();
  const { data, isLoading, error, refetch } = useCoachContext();

  async function onSignOut() {
    await signOut();
    router.replace('/coach/login');
  }

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
          <Link href="/coach/teams" aria-current={pathname?.startsWith('/coach/teams') ? 'page' : undefined}>
            Teams
          </Link>
          <Link href="/coach/playbooks" aria-current={pathname?.startsWith('/coach/playbooks') ? 'page' : undefined}>
            Playbooks
          </Link>
          <Link href="/coach/assignments" aria-current={pathname?.startsWith('/coach/assignments') ? 'page' : undefined}>
            Assignments
          </Link>
          <span className="coach-nav__who" title={session?.email}>
            {session?.displayName}
          </span>
          <button type="button" onClick={onSignOut} className="coach-nav__signout">
            Sign out
          </button>
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

export default function CoachShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, isRestoring } = useCoachAuth();

  const isPublic = PUBLIC_COACH_PATHS.some((path) => pathname?.startsWith(path));

  React.useEffect(() => {
    if (isRestoring || isPublic || session) return;
    const next = pathname && pathname !== '/coach' ? `?next=${encodeURIComponent(pathname)}` : '';
    router.replace(`/coach/login${next}`);
  }, [isRestoring, isPublic, session, pathname, router]);

  // The credential screens render on their own, with no dashboard chrome
  // around them — we do not know who this is yet.
  if (isPublic) return <div className="coach-app">{children}</div>;

  if (isRestoring || !session) {
    return (
      <div className="coach-app">
        <div className="coach-content">
          <Loading rows={3} />
        </div>
      </div>
    );
  }

  return <CoachDashboard>{children}</CoachDashboard>;
}
