'use client';

import { useState, useCallback, useEffect } from 'react';
import { getVisualizeSkillProfile } from '../api/api';
import { useUserSession } from './useUserSession';

export function useVisualizeSkillProfile() {
    const { userToken } = useUserSession();
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchVisualizeSkillProfile = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const profileData = await getVisualizeSkillProfile(userToken);
            setData(profileData);
            return profileData;
        } catch (err: any) {
            console.error('Failed to fetch visualize skill profile:', err);
            setError(err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [userToken]);

    useEffect(() => {
        if (userToken) {
            fetchVisualizeSkillProfile();
        }
    }, [userToken, fetchVisualizeSkillProfile]);

    return {
        data,
        isLoading,
        error,
        fetchVisualizeSkillProfile
    };
}
