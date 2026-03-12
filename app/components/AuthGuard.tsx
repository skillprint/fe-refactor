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
            const isPublicRoute = pathname === '/' || pathname.startsWith('/test-embed');
            const isEmbedded = typeof window !== 'undefined' && window.self !== window.top;

            if (status === 'loggedOut' && !isPublicRoute && !isEmbedded) {
                router.push('/');
            }
        }
    }, [status, isLoading, pathname, router]);

    return <>{children}</>;
}
