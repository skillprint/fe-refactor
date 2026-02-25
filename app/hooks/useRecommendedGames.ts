'use client';

import { useEffect, useState } from 'react';
import { getRecommendations } from '../api/api';

export function useRecommendedGames(limit: number = 1) {
    const [recommendedGames, setRecommendedGames] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchRecommendations = async () => {
            setIsLoading(true);
            try {
                const response = await getRecommendations(limit);
                const games = response.results ? response.results : response;
                setRecommendedGames(Array.isArray(games) ? games : [games]);
            } catch (error) {
                console.error('Error fetching recommended games:', error);
                setError(error as Error);
            }
            setIsLoading(false);
        };
        fetchRecommendations();
    }, [limit]);

    return {
        recommendedGames,
        isLoading,
        error
    };
}
