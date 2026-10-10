'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { safeNext } from '../../lib/emailLinks';

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { status, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading) {
            // Whitelisted paths that don't require login
            // `/coach` is not public — it has its own guard and its own
            // credential (CoachShell / SKI-213). It is excluded here because
            // this guard only knows about *player* sessions, and it was
            // bouncing coaches to the player welcome screen (SKI-253).
            // `/meditation/play/<id>` is a shareable player: the id is the capability.
            const isPublicRoute = pathname === '/' || pathname.startsWith('/test-embed') || pathname.startsWith('/test-mageduel') || pathname.startsWith('/profile/embed') || pathname.startsWith('/benchmark') || pathname.startsWith('/coach') || pathname.startsWith('/start') || pathname.startsWith('/guide') || pathname.startsWith('/meditation/play');
            const isEmbedded = typeof window !== 'undefined' && window.self !== window.top;

            if (status === 'loggedOut' && !isPublicRoute && !isEmbedded) {
                // Keep where the browser was going, so signing in -- or
                // "Play as guest" -- lands there rather than on home (SKI-271).
                const here = `${pathname}${window.location.search}${window.location.hash}`;
                router.push(`/?next=${encodeURIComponent(here)}`);
                return;
            }

            // Signed in on the welcome screen with somewhere to go: go there.
            if (status !== 'loggedOut' && pathname === '/') {
                const next = safeNext(new URLSearchParams(window.location.search).get('next'));
                if (next) router.replace(next);
            }
        }
    }, [status, isLoading, pathname, router]);

    return <>{children}</>;
}
