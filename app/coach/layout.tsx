import type { Metadata } from 'next';
import { Suspense } from 'react';
import './coach.css';
import { CoachAuthProvider } from '@/lib/models/coach/CoachAuthContext';
import CoachShell from './components/CoachShell';

export const metadata: Metadata = {
  title: { template: 'Skillprint Coach · %s', default: 'Skillprint Coach' },
  description: 'Team rosters, engagement and player detail for coaches.',
};

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  return (
    // Every screen under `/coach` is behind a session and reads live data, so
    // it renders in the browser. The shell reaches `useUserSession`, which
    // calls `useSearchParams()`; this boundary is what lets the route
    // prerender (as the static export must) without failing the build.
    <Suspense fallback={<div className="coach-app" />}>
      <CoachAuthProvider>
        <CoachShell>{children}</CoachShell>
      </CoachAuthProvider>
    </Suspense>
  );
}
