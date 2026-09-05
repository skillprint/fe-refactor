'use client';

import { useCallback, useState, useEffect } from 'react';
import { useUserSession } from '../../../app/hooks/useUserSession';
import { ProfileTrendsResponse, generateMockProfileTrends } from './ProfileTrends';

import { BASE_URL as API_BASE_URL } from '../../../app/api/api';
const BASE_URL = `${API_BASE_URL}api`;

export function useProfileTrends(useSyntheticData: boolean = false) {
    const { userToken } = useUserSession();
    const [data, setData] = useState<ProfileTrendsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        if (useSyntheticData) {
            setIsLoading(true);
            setTimeout(() => {
                setData(generateMockProfileTrends());
                setIsLoading(false);
            }, 500); // Simulate network delay
            return;
        }

        if (!userToken) {
            console.warn('No user token available to fetch useProfileTrends.');
            return null;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${BASE_URL}/portal/profile/trends/`, {
                headers: {
                    'Authorization': `Token ${userToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch useProfileTrends: ${response.status}`);
            }

            const json = await response.json();
            setData(json);
            return json;
        } catch (err: any) {
            console.error('Failed to fetch useProfileTrends:', err);
            setError(err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [userToken, useSyntheticData]);

    useEffect(() => {
        if (useSyntheticData || userToken) {
            fetchData();
        }
    }, [useSyntheticData, userToken, fetchData]);

    return {
        data,
        isLoading,
        error,
        refetch: fetchData
    };
}
