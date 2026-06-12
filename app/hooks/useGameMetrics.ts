'use client';

import { useState, useCallback, useEffect } from 'react';
import { getGameMetrics } from '../api/api';
import { useUserSession } from './useUserSession';

export function useGameMetrics(games: string[]) {
    const { userToken } = useUserSession();
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchGameMetrics = useCallback(async () => {
        if (!games || games.length === 0) {
            setData(null);
            return null;
        }
        setIsLoading(true);
        setError(null);
        try {
            const metricsData = await getGameMetrics(games, userToken);
            setData(metricsData);
            return metricsData;
        } catch (err: any) {
            console.error('Failed to fetch game metrics:', err);
            setError(err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [userToken, games]);

    useEffect(() => {
        if (userToken && games && games.length > 0) {
            fetchGameMetrics();
        } else if (!games || games.length === 0) {
            setData(null);
        }
    }, [userToken, games, fetchGameMetrics]);

    return {
        data,
        isLoading,
        error,
        fetchGameMetrics
    };
}
