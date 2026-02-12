import { useState, useEffect, useCallback } from 'react';
import { GameSession, getGameSessions, saveGameSession, getGamesPlayedCount, clearGameSessions, hasViewedProfile, markProfileAsViewed } from '../lib/gameSessionUtils';

export const useGameSessions = () => {
    const [sessions, setSessions] = useState<GameSession[]>([]);
    const [count, setCount] = useState(0);
    const [profileViewed, setProfileViewed] = useState(false);

    const [isLoaded, setIsLoaded] = useState(false);

    const refreshSessions = useCallback(() => {
        const allSessions = getGameSessions();
        setSessions(allSessions);
        setCount(getGamesPlayedCount());
        setProfileViewed(hasViewedProfile());
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        refreshSessions();

        // Optional: Listen for storage changes from other tabs
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'skillprint_game_sessions' || e.key === 'skillprint_profile_viewed') {
                refreshSessions();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        // Custom event for same-tab updates
        window.addEventListener('skillprint_storage_update', refreshSessions);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('skillprint_storage_update', refreshSessions);
        };
    }, [refreshSessions]);

    const addSession = useCallback((session: GameSession) => {
        saveGameSession(session);
        window.dispatchEvent(new Event('skillprint_storage_update'));
        refreshSessions();
    }, [refreshSessions]);

    const clearAll = useCallback(() => {
        clearGameSessions();
        window.dispatchEvent(new Event('skillprint_storage_update'));
        refreshSessions();
    }, [refreshSessions]);

    const markViewed = useCallback(() => {
        markProfileAsViewed();
        window.dispatchEvent(new Event('skillprint_storage_update'));
        refreshSessions();
    }, [refreshSessions]);

    return {
        sessions,
        count,
        profileViewed,
        isLoaded,
        addSession,
        clearAll,
        markViewed,
        refreshSessions
    };
};
