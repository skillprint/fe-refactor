'use client';

import { useState, useCallback, useEffect } from 'react';
import { getVisualizeMoodProfile } from '../api/api';
import { useUserSession } from './useUserSession';

export function useVisualizeMoodProfile() {
    const { userToken } = useUserSession();
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchVisualizeMoodProfile = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const profileData = await getVisualizeMoodProfile(userToken);
            setData(profileData);
            return profileData;
        } catch (err: any) {
            console.error('Failed to fetch visualize mood profile:', err);
            setError(err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [userToken]);

    useEffect(() => {
        if (userToken) {
            fetchVisualizeMoodProfile();
        }
    }, [userToken, fetchVisualizeMoodProfile]);

    return {
        data,
        isLoading,
        error,
        fetchVisualizeMoodProfile
    };
}
