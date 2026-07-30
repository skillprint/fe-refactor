export interface GameSession {
    id: string;
    gameSlug: string;
    timestamp: number;
    duration?: number; // in seconds
    score?: number;
    completed: boolean;
    metadata?: Record<string, any>;
}

/**
 * Computes the total session plays from the backend talents/me response.
 */
export const getPlayCountFromTalentsResponse = (response: any): number => {
    if (!response || !Array.isArray(response.gamesPlayed)) {
        return 0;
    }
    return response.gamesPlayed.reduce((sum: number, game: any) => sum + (game.totalPlays || 0), 0);
};

const STORAGE_KEY = 'skillprint_game_sessions';

/**
 * Retrieves all game sessions. FE no longer tracks sessions in local storage.
 */
export const getGameSessions = (): GameSession[] => {
    return [];
};

/**
 * Saves a new game session. FE no longer tracks game sessions in local storage.
 */
export const saveGameSession = (session: GameSession): void => {
    // No-op. Backend is the source of truth.
};

/**
 * Returns the total number of games played locally. Deprecated in favor of BE talents/me count.
 */
export const getGamesPlayedCount = (): number => {
    return 0;
};

/**
 * Clears all game sessions.
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
