'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { SkillprintClient, LogLevel } from '../lib/skillprintSdk';
import { isUserWhitelisted } from '../config/whitelist';
import { getApiBaseUrl } from '../utils/cookieUtils';
import { readPlayerSession } from '../../lib/models/portal/playerSession';
import { forgetToken, holdToken, sharedToken } from '../../lib/models/portal/sharedToken';

// Configuration flag to enable/disable user token caching. 
// Set to false for now, can be overridden in the future.
const USE_TOKEN_CACHING = false;

// The token request is shared across components (and Strict Mode's double
// render) per identity, in lib/models/portal/sharedToken.

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

            // 1b. A player session from an assignment email's link (SKI-233)
            // is a specific account, not a guest: use it as-is, and keep its
            // token where the SDK looks first so games start as this player.
            if (!currentUserId) {
                const playerSession = readPlayerSession();
                if (playerSession) {
                    setUserId(String(playerSession.userId));
                    localStorage.setItem('userToken', playerSession.token);
                    holdToken(`player:${playerSession.userId}`, playerSession.token);
                    setUserToken(playerSession.token);
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
                    // Shared per identity: a guest never reuses a token held
                    // for someone else, such as a player who just signed out.
                    const token = await sharedToken(`guest:${currentUserId}`, () =>
                        client.createOrGetUserToken(currentUserId as string),
                    );
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
                    forgetToken(`guest:${currentUserId}`); // Allow retry on failure
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
        holdToken(`guest:${userId}`, token);
        setUserToken(token);
    }, [userId]);

    return {
        getUserId: () => userId,
        getUserToken: () => userToken,
        setToken,
        userId,
        userToken,
        isWhitelisted: isUserWhitelisted(userId)
    };
}
