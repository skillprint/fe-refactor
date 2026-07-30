import { useState, useEffect, useCallback } from 'react';
import { GameSession, clearGameSessions, hasViewedProfile, markProfileAsViewed, getPlayCountFromTalentsResponse } from '../lib/gameSessionUtils';
import { useUserSession } from './useUserSession';
import { get } from '../api/api';
import { unifiedSlugFromBESlug } from '../game/[slug]/GameClient';

export const useGameSessions = () => {
    const { userToken, isLoading: isUserLoading } = useUserSession();
    const [sessions, setSessions] = useState<GameSession[]>([]);
    const [count, setCount] = useState(0);
    const [profileViewed, setProfileViewed] = useState(false);
    const [fromBenchmark, setFromBenchmark] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setFromBenchmark(localStorage.getItem('from_benchmark') === 'true');
        }
    }, []);

    const targetGames = fromBenchmark ? 2 : 3;

    const refreshSessions = useCallback(async () => {
        if (isUserLoading) {
            return;
        }
        if (!userToken) {
            setSessions([]);
            setCount(0);
            setProfileViewed(hasViewedProfile());
            setIsLoaded(true);
            return;
        }

        setIsLoaded(false);

        try {
            const headers: any = {};
            headers["X-Auth-Token"] = `Token ${userToken}`;
            const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'test-api-key';
            if (apiKey) {
                headers["Authorization"] = `Api-Key ${apiKey}`;
            }

            const response = await get('games/api/talents/me/', false, headers);
            if (response) {
                const gamesPlayedCount = typeof response.totalGamesPlayed === 'number'
                    ? response.totalGamesPlayed
                    : (Array.isArray(response.gamesPlayed)
                        ? response.gamesPlayed.length
                        : getPlayCountFromTalentsResponse(response));
                setCount(gamesPlayedCount);

                const mockSessions: GameSession[] = [];
                if (Array.isArray(response.gamesPlayed)) {
                    response.gamesPlayed.forEach((game: any) => {
                        const unifiedSlug = unifiedSlugFromBESlug(game.gameSlug);
                        mockSessions.push({
                            id: game.gameSlug,
                            gameSlug: unifiedSlug,
                            timestamp: Date.now(),
                            duration: game.totalPlaySeconds,
                            completed: (game.totalPlays || 0) > 0,
                        });
                    });
                }
                setSessions(mockSessions);
            }
        } catch (error) {
            console.error('[useGameSessions] Failed to fetch talents/me from backend:', error);
        } finally {
            setProfileViewed(hasViewedProfile());
            setIsLoaded(true);
        }
    }, [userToken, isUserLoading]);

    useEffect(() => {
        refreshSessions();
    }, [refreshSessions]);

    const addSession = useCallback((session: GameSession) => {
        refreshSessions();
    }, [refreshSessions]);

    const clearAll = useCallback(() => {
        clearGameSessions();
        refreshSessions();
    }, [refreshSessions]);

    const markViewed = useCallback(() => {
        markProfileAsViewed();
        setProfileViewed(true);
    }, []);

    return {
        sessions,
        count,
        targetGames,
        profileViewed,
        isLoaded,
        addSession,
        clearAll,
        markViewed,
        refreshSessions
    };
};
