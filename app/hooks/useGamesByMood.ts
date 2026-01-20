'use client';

import { useEffect, useState } from 'react';
import { getCatalogItemsByMood } from '../api/api';

export function useGamesByMood(moodSlug: string) {
    const [games, setGames] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchGames = async () => {
            if (!moodSlug) return;
            setIsLoading(true);
            try {
                const data = await getCatalogItemsByMood(moodSlug);
                // The API returns { results: [...] } based on useGamesBySkill.ts
                setGames(data.results || []);
            } catch (err) {
                setError(err as Error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchGames();
    }, [moodSlug]);

    return { games, isLoading, error };
}
