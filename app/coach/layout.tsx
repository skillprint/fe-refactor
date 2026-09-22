import type { Metadata } from 'next';
import { Suspense } from 'react';
import './coach.css';
import CoachShell from './components/CoachShell';

export const metadata: Metadata = {
  title: { template: 'Skillprint Coach · %s', default: 'Skillprint Coach' },
  description: 'Team rosters, engagement and player detail for coaches.',
};

/**
 * Never prerendered.
 *
 * Every screen under `/coach` is behind a session and reads live data, so a
 * static shell is worth nothing — and trying to build one fails: the shell
 * reaches `useUserSession`, which calls `useSearchParams()`, and that bails out
 * of server rendering. `force-dynamic` says what is actually true about this
 * route group rather than leaving it to be inferred.
 */
export const dynamic = 'force-dynamic';

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  return (
    // The Suspense boundary is the documented fix for the `useSearchParams()`
    // CSR bailout and is kept alongside `force-dynamic` deliberately: the two
    // guard different things, and the boundary is what stops a single hook
    // deep in the tree from failing the whole build again.
    <Suspense fallback={<div className="coach-app" />}>
      <CoachShell>{children}</CoachShell>
    </Suspense>
  );
}
