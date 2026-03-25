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
                const gamesArray = Array.isArray(games) ? games : [games];
                const gamesToFilterBySlug = ["hextris", "lastwar-frontline", "flappy-bird", "flappy-bird-1", "fruit-ninja", "infinite-runner-3d", "last-war-zombie"];
                const filteredGames = gamesArray.filter((game: any) => !gamesToFilterBySlug.includes(game.slug));
                setRecommendedGames(filteredGames);
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
