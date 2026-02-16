'use client';

import { useCallback, useState, useEffect } from 'react';
import { useUserSession } from './useUserSession';
import { SkillprintClient, LogLevel, UserProfile } from '../lib/skillprintSdk';
import { useGameSessions } from './useGameSessions';

export function useUserProfile() {
    const { userToken, userId, setToken } = useUserSession();
    const { count, isLoaded: isSessionsLoaded } = useGameSessions();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

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

        setIsLoading(true);
        setError(null);

        const client = new SkillprintClient({
            apiKey: getApiKey(),
            baseUrl: BASE_URL,
            logger: (msg, level) => {
                console.log(`[Skillprint SDK] [${level}] ${msg}`);
            }
        });

        client.setUserToken(userToken);

        try {
            const profileData = await client.getUserProfile();
            console.log('User Profile Data:', profileData);
            setProfile(profileData);
            return profileData;
        } catch (error: any) {
            // Check for 401 Unauthorized
            if (error.message && error.message.includes('401')) {
                console.log('Got 401 Unauthorized. Attempting to refresh token...');
                if (userId) {
                    try {
                        const newToken = await client.createOrGetUserToken(userId);
                        if (newToken) {
                            console.log('Token refreshed, retrying profile fetch...');

                            // Update session state and localStorage
                            setToken(newToken);

                            // Update the client instance
                            client.setUserToken(newToken);

                            // Retry the profile fetch
                            const retryProfile = await client.getUserProfile();
                            console.log('User Profile Data (retried):', retryProfile);
                            setProfile(retryProfile);
                            return retryProfile;
                        } else {
                            console.error('Failed to obtain a new token during refresh.');
                            setError(new Error('Failed to refresh token'));
                        }
                    } catch (refreshError: any) {
                        console.error('Failed to refresh token:', refreshError);
                        setError(refreshError);
                    }
                } else {
                    console.warn('Cannot refresh token: No userId available.');
                    setError(new Error('Cannot refresh token: No userId available'));
                }
            } else {
                console.error('Failed to fetch user profile:', error);
                setError(error);
            }
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [userToken, userId, setToken]);

    // Automatically fetch profile when token is available and user has played at least 3 games
    useEffect(() => {
        if (userToken && isSessionsLoaded && count >= 3) {
            fetchUserProfile();
        }
    }, [userToken, fetchUserProfile, isSessionsLoaded, count]);

    return {
        profile,
        isLoading,
        error,
        fetchUserProfile
    };
}
