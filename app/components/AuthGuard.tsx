'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

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
            const isPublicRoute = pathname === '/' || pathname.startsWith('/test-embed') || pathname.startsWith('/test-mageduel') || pathname.startsWith('/profile/embed') || pathname.startsWith('/corporate') || pathname.startsWith('/benchmark') || pathname.startsWith('/coach') || pathname.startsWith('/start');
            const isEmbedded = typeof window !== 'undefined' && window.self !== window.top;

            if (status === 'loggedOut' && !isPublicRoute && !isEmbedded) {
                router.push('/');
            }
        }
    }, [status, isLoading, pathname, router]);

    return <>{children}</>;
}
