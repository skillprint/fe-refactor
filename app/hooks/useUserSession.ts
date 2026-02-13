'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { SkillprintClient, LogLevel } from '../lib/skillprintSdk';

export function useUserSession() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [userId, setUserId] = useState<string | null>(null);
    const [userToken, setUserToken] = useState<string | null>(null);

    const getApiKey = () => {
        if (typeof document === 'undefined') return '';
        const cookie = document.cookie.split('; ').find(row => row.startsWith('api_key='));
        return cookie ? cookie.split('=')[1] : 'test-api-key';
    };
    const BASE_URL = 'https://api.skillprint.co/';

    useEffect(() => {
        const initializeUser = async () => {
            // Get userId from Query Params
            const queryUserId = searchParams.get('userId');
            let currentUserId: string | null = null;

            // 1. Check Query String
            if (queryUserId) {
                currentUserId = queryUserId;
                localStorage.setItem('userId', queryUserId);
                setUserId(currentUserId);

                // Remove userId from URL
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.delete('userId');
                const newPath = newSearchParams.toString() ? `${pathname}?${newSearchParams.toString()}` : pathname;
                router.replace(newPath, { scroll: false });

                // Stop here to wait for re-render with clean URL
                return;
            }

            // 2. Check LocalStorage
            if (!currentUserId) {
                currentUserId = localStorage.getItem('userId');
            }

            // 3. If not set, create new user (generate UUID)
            if (!currentUserId) {
                currentUserId = crypto.randomUUID();
                localStorage.setItem('userId', currentUserId);
            }

            setUserId(currentUserId);

            // 4. Handle User Token
            let currentUserToken = localStorage.getItem('userToken');

            if (!currentUserToken && currentUserId) {
                const client = new SkillprintClient({
                    apiKey: getApiKey(),
                    baseUrl: BASE_URL,
                    logger: (msg, level) => {
                        if (level === LogLevel.ERROR) console.error(`[Skillprint SDK] ${msg}`);
                    }
                });

                try {
                    // Use SDK to create token (will create user if needed)
                    // We cast currentUserId to string because flow analysis might not catch it inside async
                    const token = await client.createOrGetUserToken(currentUserId as string);
                    if (token) {
                        localStorage.setItem('userToken', token);
                        setUserToken(token);
                    }
                } catch (e) {
                    console.error("Failed to retrieve or create user token", e);
                    // If create user fails because already created (or other error),
                    // we still have the userId stored in localStorage from step 1/2/3.
                }
            } else if (currentUserToken) {
                setUserToken(currentUserToken);
            }
        };

        initializeUser();
    }, [searchParams, pathname, router]);

    return {
        getUserId: () => userId,
        getUserToken: () => userToken,
        userId,
        userToken
    };
}
