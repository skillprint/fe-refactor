'use client';

import { useCallback, useState, useEffect } from 'react';
import { useUserSession } from '../../../app/hooks/useUserSession';
import { LibraryCommunityStats, generateMockLibraryCommunityStats } from './LibraryCommunityStats';

import { BASE_URL as API_BASE_URL } from '../../../app/api/api';
const BASE_URL = `${API_BASE_URL}api`;

export function useLibraryCommunityStats(slug: string, useSyntheticData: boolean = false) {
    const { userToken } = useUserSession();
    const [data, setData] = useState<LibraryCommunityStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        if (useSyntheticData) {
            setIsLoading(true);
            setTimeout(() => {
                setData(generateMockLibraryCommunityStats());
                setIsLoading(false);
            }, 500); // Simulate network delay
            return;
        }

        if (!userToken) {
            console.warn('No user token available to fetch useLibraryCommunityStats.');
            return null;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${BASE_URL}/library/community-stats/${slug}/`, {
                headers: {
                    'Authorization': `Token ${userToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch useLibraryCommunityStats: ${response.status}`);
            }

            const json = await response.json();
            setData(json);
            return json;
        } catch (err: any) {
            console.error('Failed to fetch useLibraryCommunityStats:', err);
            setError(err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [userToken, useSyntheticData, slug]);

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
