// The portal's scoring client. Every request goes through skillprint-js-sdk's
// SkillprintAPIClient; this class adds the portal's own identity handling
// (the guest id in localStorage / cookie) and the retry on an expired token.

import {
    LogLevel,
    Mood,
    ParameterInfo,
    ParameterType,
    SkillprintAPIClient,
    SkillprintApiError,
} from 'skillprint-js-sdk';
import { getCookie, setCookie } from "../utils/cookieUtils";

export { LogLevel, Mood, ParameterType };

export interface SkillprintConfigOptions {
    apiKey: string;
    baseUrl: string;
    logger?: (message: string, level: LogLevel) => void;
    userToken?: string;
}

/** Parameter definition the backend auto-provisions into the game's GameScoringConfig. */
export interface SdkGameParameter {
    name: string;
    type: 'Float' | 'Integer' | 'Boolean' | 'String';
    description?: string;
    min_value?: string;
    max_value?: string;
    adjustment_guide?: string;
}

export interface ParameterUpdateResult {
    parameterName: string;
    newValue: any;
}

export interface Adjustment {
    gameSlug: string;
    createDate: string;
    parameterName: string;
    parameterValue: number;
}

export interface TelemetryItem {
    tips: any;
    adjustment: Adjustment;
}

export interface SkillMetric {
    score: number;
    trend: number;
    momentum: number;
    confidence: number;
    volatility: number;
    consistency: number;
    trendScore: number;
    valueScore: number;
}

export interface SkillScores {
    metrics: {
        [key: string]: SkillMetric;
    };
    analyzedAt: string;
    numChunksAnalyzed: number;
}

export interface MoodScores {
    confidence: number;
    flowScore: number;
    targetMood: string;
}

export interface UserProfile {
    [key: string]: any;
}

export interface PollResultsResponse {
    gameplayTips?: string;
    state?: string;
    parameterUpdates?: {
        parameterName: string;
        newValue: any;
    }[];
    telemetry?: TelemetryItem[];
    skillScores?: SkillScores;
    moodScores?: MoodScores;
}

const isInvalidTokenError = (error: unknown) =>
    error instanceof SkillprintApiError && error.status === 401 && /invalid token/i.test(error.body);

export class SkillprintClient {
    private logger?: (message: string, level: LogLevel) => void;
    private userToken: string | null = null;

    // Session calls go out in the SDK's host mode: no partner key, so the
    // session belongs to the signed-in player (the backend knows the portal by
    // its Origin). Only the partner-user endpoints and the profile use the key.
    private sessions: SkillprintAPIClient;
    private partner: SkillprintAPIClient;

    private lastScreenshotDataURI: string | null = null;
    private testEmptyDataBase64String: string = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAQAAAAnOwc2AAAAEUlEQVR42mNk+M+AARiHsiAAcCQK/6Zq45EAAAAASUVORK5CYII=';

    constructor(options: SkillprintConfigOptions) {
        this.logger = options.logger;
        const log = (message: string, level?: LogLevel) => this.log(message, level ?? LogLevel.INFO);
        this.sessions = new SkillprintAPIClient(options.baseUrl, '', log);
        this.partner = new SkillprintAPIClient(options.baseUrl, options.apiKey, log);

        if (options.userToken) {
            this.setUserToken(options.userToken);
        }
    }

    async setupUser(): Promise<void> {
        if (this.userToken) return;

        let userId: string | null = null;
        let token: string | null = null;

        // 1. check local storage first
        if (typeof localStorage !== 'undefined') {
            token = localStorage.getItem('userToken');
            if (token) {
                this.setUserToken(token);
                return;
            }
            userId = localStorage.getItem('userId');
        }

        // 2. check if user id in cookie
        if (!userId && typeof document !== 'undefined') {
            userId = getCookie('user_id') || null;
        }

        if (userId) {
            if (typeof localStorage !== 'undefined') localStorage.setItem('userId', userId);
            this.setUserToken(await this.createOrGetUserToken(userId));
        } else {
            const customPlayerId = crypto.randomUUID();
            setCookie('user_id', customPlayerId);
            if (typeof localStorage !== 'undefined') localStorage.setItem('userId', customPlayerId);
            this.setUserToken(await this.createOrGetUserToken(customPlayerId));
        }

        if (typeof localStorage !== 'undefined' && this.userToken) {
            localStorage.setItem('userToken', this.userToken);
        }
    }

    private log(message: string, level: LogLevel) {
        if (this.logger) {
            this.logger(message, level);
        }
    }

    setUserToken(token: string) {
        this.userToken = token;
        this.sessions.setPlayerToken(token);
        this.partner.setPlayerToken(token);
    }

    async startSession(sessionId: string, targetMood: string, gameName: string, isRetry: boolean = false, gameParameters?: SdkGameParameter[], deviceContext?: Record<string, unknown>): Promise<boolean> {
        // Callers pass the canonical catalog slug (see lib/gameSlug resolveCatalogGame).
        const parameters = (gameParameters || []).map((p) => new ParameterInfo(
            p.name,
            p.type,
            p.description || '',
            p.min_value != null ? String(p.min_value) : null,
            p.max_value != null ? String(p.max_value) : null,
            p.adjustment_guide || ''
        ));

        try {
            await this.sessions.startSession(sessionId, targetMood, null, gameName, parameters, { deviceContext });
            return true;
        } catch (error) {
            if (isRetry || !isInvalidTokenError(error)) throw error;

            this.log(`Token invalid, attempting to refresh and retry...`, LogLevel.WARNING);
            try {
                await this.refreshUserToken();
            } catch (e) {
                this.log(`Failed to refresh token: ${e}`, LogLevel.ERROR);
                throw error;
            }
            return await this.startSession(sessionId, targetMood, gameName, true, gameParameters, deviceContext);
        }
    }

    /** Drops the stored token and gets a new one for the same player id. */
    private async refreshUserToken(): Promise<void> {
        this.userToken = null;
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('userToken');
        }

        let currentUserId = typeof localStorage !== 'undefined' ? localStorage.getItem('userId') : null;
        if (!currentUserId && typeof document !== 'undefined') {
            currentUserId = getCookie('user_id') || null;
        }

        if (currentUserId) {
            this.setUserToken(await this.createOrGetUserToken(currentUserId));
        } else {
            await this.setupUser();
        }

        if (typeof localStorage !== 'undefined' && this.userToken) {
            localStorage.setItem('userToken', this.userToken);
        }
    }

    async setLastScreenshotDataURI(dataURI: string): Promise<void> {
        this.lastScreenshotDataURI = dataURI;
    }

    /**
     * `gameState` is what the game last reported about itself (e.g. `{score}`). It is
     * sent as the last screenshot's `game_state<n>` field; the backend takes its
     * `score` as the session's score.
     *
     * `inputCount` is how many player inputs the chunk covers. The backend leaves a
     * chunk with 0 out of skill scores; omit it when inputs aren't being counted.
     */
    async postScreenshots(sessionId: string, screenshots: Blob[], isLastChunk: boolean = false, gameState?: object | null, inputCount?: number | null): Promise<boolean> {
        if (screenshots.length === 0 && !isLastChunk) {
            this.log("No screenshots provided, and 'is_last_chunk' is false.", LogLevel.WARNING);
            return false;
        }

        // The last chunk always carries exactly one screenshot, so the final
        // game state has a frame to ride on: the last frame given, else the
        // last one the game sent, else a blank placeholder.
        const batch = isLastChunk ? [await this.finalChunkScreenshot(screenshots)] : screenshots;
        const gameStates = gameState
            ? batch.map((_, i) => (i === batch.length - 1 ? (gameState as Record<string, unknown>) : null))
            : undefined;

        await this.sessions.postScreenshots(sessionId, batch, isLastChunk, { gameStates, inputCount });
        return true;
    }

    private async finalChunkScreenshot(screenshots: Blob[]): Promise<Blob | null> {
        try {
            if (screenshots.length > 0) return screenshots[screenshots.length - 1];
            if (this.lastScreenshotDataURI) return await (await fetch(this.lastScreenshotDataURI)).blob();

            const byteCharacters = atob(this.testEmptyDataBase64String.split(',')[1]);
            const bytes = Uint8Array.from(byteCharacters, (c) => c.charCodeAt(0));
            return new Blob([bytes], { type: 'image/png' });
        } catch (e: any) {
            this.log(`Failed to create fallback blob: ${e.message}`, LogLevel.ERROR);
            return null;
        }
    }

    async pollParameterResults(sessionId: string): Promise<PollResultsResponse> {
        return (await this.sessions.getSession(sessionId)) as unknown as PollResultsResponse;
    }

    async createOrGetUserToken(customPlayerId: string): Promise<string> {
        return this.partner.createOrGetUserToken(customPlayerId);
    }

    async createUser(internalId: string): Promise<string> {
        return this.partner.createUser(internalId);
    }

    async getUserToken(internalId: string): Promise<string> {
        return this.partner.getUserToken(internalId);
    }

    async getUserProfile(): Promise<UserProfile> {
        return this.partner.getUserProfile();
    }
}
