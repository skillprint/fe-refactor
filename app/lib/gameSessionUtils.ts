export interface GameSession {
    id: string;
    gameSlug: string;
    timestamp: number;
    duration?: number; // in seconds
    score?: number;
    completed: boolean;
    metadata?: Record<string, any>;
}

const STORAGE_KEY = 'skillprint_game_sessions';

/**
 * Retrieves all game sessions from local storage.
 */
export const getGameSessions = (): GameSession[] => {
    if (typeof window === 'undefined') return [];

    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) return [];

    try {
        return JSON.parse(storedData);
    } catch (error) {
        console.error('Failed to parse game sessions from localStorage:', error);
        return [];
    }
};

/**
 * Saves a new game session or updates an existing one.
 */
export const saveGameSession = (session: GameSession): void => {
    if (typeof window === 'undefined') return;

    const sessions = getGameSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);

    if (existingIndex > -1) {
        sessions[existingIndex] = session;
    } else {
        sessions.push(session);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
};

/**
 * Returns the total number of games played.
 */
export const getGamesPlayedCount = (): number => {
    return getGameSessions().length;
};

/**
 * Clears all game sessions (utility for testing/resetting).
 */
export const clearGameSessions = (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PROFILE_VIEWED_KEY);
};

const PROFILE_VIEWED_KEY = 'skillprint_profile_viewed';

export const hasViewedProfile = (): boolean => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(PROFILE_VIEWED_KEY) === 'true';
};

export const markProfileAsViewed = (): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PROFILE_VIEWED_KEY, 'true');
};
