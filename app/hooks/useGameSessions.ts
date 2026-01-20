import { useState, useEffect, useCallback } from 'react';
import { GameSession, getGameSessions, saveGameSession, getGamesPlayedCount, clearGameSessions } from '../lib/gameSessionUtils';

export const useGameSessions = () => {
    const [sessions, setSessions] = useState<GameSession[]>([]);
    const [count, setCount] = useState(0);

    const [isLoaded, setIsLoaded] = useState(false);

    const refreshSessions = useCallback(() => {
        const allSessions = getGameSessions();
        setSessions(allSessions);
        setCount(getGamesPlayedCount());
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        refreshSessions();

        // Optional: Listen for storage changes from other tabs
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'skillprint_game_sessions') {
                refreshSessions();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [refreshSessions]);

    const addSession = (session: GameSession) => {
        saveGameSession(session);
        refreshSessions();
    };

    const clearAll = () => {
        clearGameSessions();
        refreshSessions();
    };

    return {
        sessions,
        count,
        isLoaded,
        addSession,
        clearAll,
        refreshSessions
    };
};
