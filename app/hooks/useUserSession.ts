'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { SkillprintClient, LogLevel } from '../lib/skillprintSdk';
import { isUserWhitelisted } from '../config/whitelist';
import { getApiBaseUrl } from '../utils/cookieUtils';

// Configuration flag to enable/disable user token caching. 
// Set to false for now, can be overridden in the future.
const USE_TOKEN_CACHING = false;

// Global promise cache to prevent duplicate fetching across components and Strict Mode
let activeTokenPromise: Promise<string | null> | null = null;

export function useUserSession() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [userId, setUserId] = useState<string | null>(null);
    const [userToken, setUserToken] = useState<string | null>(null);

    const getApiKey = () => {
        return process.env.NEXT_PUBLIC_API_KEY || 'test-api-key';
        // if (typeof document === 'undefined') return '';
        // const cookie = document.cookie.split('; ').find(row => row.startsWith('api_key='));
        // return cookie ? cookie.split('=')[1] : 'test-api-key';
    };
    const BASE_URL = getApiBaseUrl();


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

                // For embed routes, do NOT remove parameters from the URL
                if (pathname && pathname.startsWith('/profile/embed')) {
                    // Let initialization proceed without redirecting
                } else {
                    // Remove userId from URL
                    const newSearchParams = new URLSearchParams(searchParams);
                    newSearchParams.delete('userId');
                    const newPath = newSearchParams.toString() ? `${pathname}?${newSearchParams.toString()}` : pathname;
                    router.replace(newPath, { scroll: false });

                    // Stop here to wait for re-render with clean URL
                    return;
                }
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
            let currentUserToken = USE_TOKEN_CACHING ? localStorage.getItem('userToken') : null;

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
                    if (!activeTokenPromise) {
                        activeTokenPromise = client.createOrGetUserToken(currentUserId as string);
                    }
                    const token = await activeTokenPromise;
                    if (token) {
                        if (USE_TOKEN_CACHING) {
                            localStorage.setItem('userToken', token);
                        } else {
                            localStorage.removeItem('userToken');
                        }
                        setUserToken(token);
                    }
                } catch (e) {
                    console.error("Failed to retrieve or create user token", e);
                    activeTokenPromise = null; // Allow retry on failure
                    // If create user fails because already created (or other error),
                    // we still have the userId stored in localStorage from step 1/2/3.
                }
            } else if (currentUserToken) {
                setUserToken(currentUserToken);
            }
        };

        initializeUser();
    }, [searchParams, pathname, router]);


    const setToken = useCallback((token: string) => {
        if (USE_TOKEN_CACHING) {
            localStorage.setItem('userToken', token);
        }
        activeTokenPromise = Promise.resolve(token);
        setUserToken(token);
    }, []);

    return {
        getUserId: () => userId,
        getUserToken: () => userToken,
        setToken,
        userId,
        userToken,
        isWhitelisted: isUserWhitelisted(userId)
    };
}
