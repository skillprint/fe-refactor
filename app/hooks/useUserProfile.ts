'use client';

import { useCallback } from 'react';
import { useUserSession } from './useUserSession';
import { SkillprintClient, LogLevel } from '../lib/skillprintSdk';

export function useUserProfile() {
    const { userToken, userId } = useUserSession();

    const getApiKey = () => {
        if (typeof document === 'undefined') return '';
        const cookie = document.cookie.split('; ').find(row => row.startsWith('api_key='));
        return cookie ? cookie.split('=')[1] : 'test-api-key';
    };
    const BASE_URL = 'https://api.skillprint.co/';

    const fetchUserProfile = useCallback(async () => {
        if (!userToken) {
            console.warn('No user token available to fetch profile. Please wait for session initialization.');
            return null;
        }

        const client = new SkillprintClient({
            apiKey: getApiKey(),
            baseUrl: BASE_URL,
            logger: (msg, level) => {
                // The user requested to "only output diagnostic information in the js console"
                // So we log everything to console for now
                console.log(`[Skillprint SDK] [${level}] ${msg}`);
            }
        });

        client.setUserToken(userToken);

        try {
            const profile = await client.getUserProfile();
            console.log('User Profile Data:', profile);
            return profile;
        } catch (error: any) {
            // Check for 401 Unauthorized
            if (error.message && error.message.includes('401')) {
                console.log('Got 401 Unauthorized. Attempting to refresh token...');
                if (userId) {
                    try {
                        const newToken = await client.createOrGetUserToken(userId);
                        if (newToken) {
                            console.log('Token refreshed, retrying profile fetch...');

                            // Update local storage so the session persists
                            localStorage.setItem('userToken', newToken);

                            // Update the client instance
                            client.setUserToken(newToken);

                            // Retry the profile fetch
                            const retryProfile = await client.getUserProfile();
                            console.log('User Profile Data (retried):', retryProfile);
                            return retryProfile;
                        } else {
                            console.error('Failed to obtain a new token during refresh.');
                        }
                    } catch (refreshError) {
                        console.error('Failed to refresh token:', refreshError);
                    }
                } else {
                    console.warn('Cannot refresh token: No userId available.');
                }
            }
            console.error('Failed to fetch user profile:', error);
            return null;
        }
    }, [userToken, userId]);

    return {
        fetchUserProfile
    };
}
