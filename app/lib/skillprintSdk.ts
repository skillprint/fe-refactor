// The portal's scoring client. Every request goes through skillprint-js-sdk's
// SkillprintAPIClient; this class adds the portal's own identity handling
// (the guest id in localStorage / cookie), the retry on an expired token, and
// the session timeline that stamps the game's frames and events.

import {
    LogLevel,
    MAX_EVENTS_PER_UPLOAD,
    Mood,
    ParameterInfo,
    ParameterType,
    SessionTimeline,
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

/**
 * Epoch milliseconds at high resolution. A game frame's
 * `performance.timeOrigin + performance.now()` reads the same, so times the
 * game stamps can be placed on this page's session timeline.
 */
export const epochNow = (): number =>
    typeof performance !== 'undefined' && performance.timeOrigin
        ? performance.timeOrigin + performance.now()
        : Date.now();

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
    // Session time of the last frame the game sent, for the closing upload,
    // which resends that frame.
    private lastScreenshotOffsetMs: number | null = null;

    /** Session time: the game's frames and events, in ms since the session started. */
    readonly timeline = new SessionTimeline(epochNow);
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

        if (!isRetry) {
            // Session time counts from the request, as the SDK's manager does.
            this.timeline.start();
            this.lastScreenshotOffsetMs = null;
        }

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
     * Queues a game event (universal or game-specific) for the next upload.
     * `at` is when it happened in epoch ms (see `epochNow`); default now.
     */
    recordEvent(event: string, data: Record<string, unknown> = {}, at?: number): void {
        if (!this.timeline.isStarted) return;
        if (!this.timeline.record(event, data, at)) {
            this.log(`Event queue full. Dropping '${event}'.`, LogLevel.WARNING);
        }
    }

    /**
     * `gameState` is what the game last reported about itself (e.g. `{score}`). It is
     * sent as the last screenshot's `game_state<n>` field; the backend takes its
     * `score` as the session's score.
     *
     * `inputCount` is how many player inputs the chunk covers. The backend leaves a
     * chunk with 0 out of skill scores; omit it when inputs aren't being counted.
     *
     * `capturedAt` is when the (last) screenshot was taken, in epoch ms. It and the
     * events queued since the last upload go with the batch, each in session time.
     */
    async postScreenshots(sessionId: string, screenshots: Blob[], isLastChunk: boolean = false, gameState?: object | null, inputCount?: number | null, capturedAt?: number | null): Promise<boolean> {
        if (screenshots.length === 0 && !isLastChunk) {
            this.log("No screenshots provided, and 'is_last_chunk' is false.", LogLevel.WARNING);
            return false;
        }

        // The last chunk always carries exactly one screenshot, so the final
        // game state has a frame to ride on: the last frame given, else the
        // last one the game sent, else a blank placeholder.
        const batch = isLastChunk ? [await this.finalChunkScreenshot(screenshots)] : screenshots;
        const last = batch.length - 1;
        const gameStates = gameState
            ? batch.map((_, i) => (i === last ? (gameState as Record<string, unknown>) : null))
            : undefined;

        let offset: number | null = null;
        if (typeof capturedAt === 'number' && this.timeline.isStarted) {
            offset = this.timeline.offsetMs(capturedAt);
        } else if (isLastChunk && screenshots.length === 0) {
            offset = this.lastScreenshotOffsetMs; // the resent frame keeps its time
        }
        if (!isLastChunk && offset !== null) this.lastScreenshotOffsetMs = offset;
        const offsetsMs = batch.map((_, i) => (i === last ? offset : null));

        if (isLastChunk) {
            // Everything left goes before the session closes; the closing upload
            // takes what fits in one upload.
            while (this.timeline.pendingEvents > MAX_EVENTS_PER_UPLOAD) {
                await this.sessions.postScreenshots(sessionId, [], false, { events: this.timeline.takeEvents() });
            }
            const events = this.timeline.takeEvents();
            this.timeline.reset();
            await this.sessions.postScreenshots(sessionId, batch, true, { gameStates, inputCount, offsetsMs, events });
            return true;
        }

        const events = this.timeline.takeEvents();
        try {
            await this.sessions.postScreenshots(sessionId, batch, false, { gameStates, inputCount, offsetsMs, events });
        } catch (error) {
            // A network error or 5xx may pass next time; a 4xx won't.
            if (!(error instanceof SkillprintApiError && error.status < 500) && this.timeline.isStarted) {
                this.timeline.requeue(events);
            }
            throw error;
        }
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
