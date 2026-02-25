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
            if (status === 'loggedOut' && pathname !== '/') {
                router.push('/');
            }
        }
    }, [status, isLoading, pathname, router]);

    return <>{children}</>;
}
