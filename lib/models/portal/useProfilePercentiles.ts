'use client';

import { useCallback, useState, useEffect } from 'react';
import { useUserSession } from '../../../app/hooks/useUserSession';
import { ProfilePercentiles, generateMockProfilePercentiles } from './ProfilePercentiles';

import { BASE_URL as API_BASE_URL } from '../../../app/api/api';
const BASE_URL = `${API_BASE_URL}api`;

export function useProfilePercentiles(useSyntheticData: boolean = false) {
    const { userToken } = useUserSession();
    const [data, setData] = useState<ProfilePercentiles | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        if (useSyntheticData) {
            setIsLoading(true);
            setTimeout(() => {
                setData(generateMockProfilePercentiles());
                setIsLoading(false);
            }, 500); // Simulate network delay
            return;
        }

        if (!userToken) {
            console.warn('No user token available to fetch useProfilePercentiles.');
            return null;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${BASE_URL}/profile/percentiles/`, {
                headers: {
                    'Authorization': `Token ${userToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch useProfilePercentiles: ${response.status}`);
            }

            const json = await response.json();
            setData(json);
            return json;
        } catch (err: any) {
            console.error('Failed to fetch useProfilePercentiles:', err);
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
