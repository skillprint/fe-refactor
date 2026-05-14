'use client';

import { useCallback, useState, useEffect } from 'react';
import { useUserSession } from '../../../app/hooks/useUserSession';
import { TrendsLongRange, generateMockTrendsLongRange } from './TrendsLongRange';

import { BASE_URL as API_BASE_URL } from '../../../app/api/api';
const BASE_URL = `${API_BASE_URL}api`;

export function useTrendsLongRange(useSyntheticData: boolean = false) {
    const { userToken } = useUserSession();
    const [data, setData] = useState<TrendsLongRange | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        if (useSyntheticData) {
            setIsLoading(true);
            setTimeout(() => {
                setData(generateMockTrendsLongRange());
                setIsLoading(false);
            }, 500); // Simulate network delay
            return;
        }

        if (!userToken) {
            console.warn('No user token available to fetch useTrendsLongRange.');
            return null;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${BASE_URL}/trends/long-range/`, {
                headers: {
                    'Authorization': `Token ${userToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch useTrendsLongRange: ${response.status}`);
            }

            const json = await response.json();
            setData(json);
            return json;
        } catch (err: any) {
            console.error('Failed to fetch useTrendsLongRange:', err);
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
