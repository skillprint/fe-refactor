
// removed uuid import since sessionId is passed as argument

import { getCookie, updateSetting } from "../profile/skillprint";

export enum Mood {
    RELAX = 'relax',
    FOCUS = 'focus',
    CREATIVITY = 'creativity',
    COLLABORATE = 'collaborate',
    GRIT = 'grit',
    JOY = 'joy',
    CURIOSITY = 'curiosity',
    EMPATHY = 'empathy',
    AWE = 'awe'
}

export enum LogLevel {
    INFO = 'info',
    WARNING = 'warning',
    ERROR = 'error'
}

export enum ParameterType {
    FLOAT = 'Float',
    INTEGER = 'Integer',
    BOOLEAN = 'Boolean'
}

export interface SkillprintConfigOptions {
    apiKey: string;
    baseUrl: string;
    logger?: (message: string, level: LogLevel) => void;
    userToken?: string;
}

interface StartSessionRequest {
    sessionId: string;
    game: string;
    targetMood: string;
    is_benchmark?: boolean;
    providerKey?: string;
    llmProviderKey?: string;
    llm_provider_key?: string;
    use_ai?: boolean;
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

export class SkillprintClient {
    private baseUrl: string;
    private apiKey: string;
    private logger?: (message: string, level: LogLevel) => void;
    private userToken: string | null = null;

    private lastScreenshotBlob: Blob | null = null;
    private lastScreenshotDataURI: string | null = null;
    private testEmptyDataBase64String: string = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAQAAAAnOwc2AAAAEUlEQVR42mNk+M+AARiHsiAAcCQK/6Zq45EAAAAASUVORK5CYII=';
    private readonly START_SESSION_ENDPOINT = '/games/api/sessions/';
    private readonly UPLOAD_SCREENSHOTS_ENDPOINT = '/games/api/record-session/{sessionId}/';
    private readonly POLL_RESULTS_ENDPOINT = '/games/api/sessions/{sessionId}/';
    private readonly STOP_SESSION_ENDPOINT = '/games/api/sessions/{sessionId}/stop/';
    private readonly CREATE_USER_ENDPOINT = '/partners/api/users/add/';
    private readonly GET_USER_TOKEN_ENDPOINT = '/partners/api/users/auth/token/';
    private readonly GET_USER_PROFILE_ENDPOINT = '/scoring/api/profiles/';

    private readonly GAME_SLUG_TO_NAME_MAP: Record<string, string> = {
        'gummy-blocks': "gummy-blocks-018b6d5d-9048-40aa-b79a-b7e4435ddb9a"
    };


    constructor(options: SkillprintConfigOptions) {
        this.baseUrl = options.baseUrl.replace(/\/$/, '');
        this.apiKey = options.apiKey;
        this.logger = options.logger;

        if (options.userToken) {
            this.userToken = options.userToken;
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
                this.userToken = token;
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
            this.userToken = await this.createOrGetUserToken(userId);
        } else {
            const customPlayerId = crypto.randomUUID();
            updateSetting('user_id', customPlayerId, () => { });
            if (typeof localStorage !== 'undefined') localStorage.setItem('userId', customPlayerId);
            this.userToken = await this.createOrGetUserToken(customPlayerId);
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
    }

    async startSession(sessionId: string, targetMood: string, gameName: string, isRetry: boolean = false, isBenchmark?: boolean, providerKey?: string, useAi?: boolean): Promise<boolean> {
        let url = `${this.baseUrl}${this.START_SESSION_ENDPOINT}`;
        if (providerKey) {
            url += `?providerKey=${encodeURIComponent(providerKey)}`;
        } else if (useAi) {
            url += `?use_ai=true`;
        }
        this.log(`Starting session: POST ${url}`, LogLevel.INFO);

        const slugToGameId = this.GAME_SLUG_TO_NAME_MAP[gameName] || gameName;

        const requestData: StartSessionRequest = {
            sessionId,
            game: slugToGameId,
            targetMood
        };

        if (isBenchmark !== undefined) {
            requestData.is_benchmark = isBenchmark;
        }

        if (providerKey) {
            requestData.providerKey = providerKey;
            requestData.llmProviderKey = providerKey;
            requestData.llm_provider_key = providerKey;
        } else if (useAi) {
            requestData.use_ai = true;
        }

        let headers: any = {
            'Content-Type': 'application/json'
        };

        if (this.userToken) {
            headers['X-Auth-Token'] = `Token ${this.userToken}`;
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestData)
            });

            if (response.ok) {
                this.log(`StartSession successful.`, LogLevel.INFO);
                return true;
            } else {
                const text = await response.text();

                if (response.status === 401 && !isRetry) {
                    try {
                        const errorData = JSON.parse(text);
                        if (errorData.detail && errorData.detail.toLowerCase() === "invalid token.") {
                            this.log(`Token invalid, attempting to refresh and retry...`, LogLevel.WARNING);
                            this.userToken = null;
                            if (typeof localStorage !== 'undefined') {
                                localStorage.removeItem('userToken');
                            }

                            // Re-fetch token using context's userId if possible, or fallback
                            let currentUserId = typeof localStorage !== 'undefined' ? localStorage.getItem('userId') : null;
                            if (!currentUserId && typeof document !== 'undefined') {
                                currentUserId = getCookie('user_id') || null;
                            }

                            if (currentUserId) {
                                this.userToken = await this.createOrGetUserToken(currentUserId);
                                if (typeof localStorage !== 'undefined' && this.userToken) {
                                    localStorage.setItem('userToken', this.userToken);
                                }
                            } else {
                                await this.setupUser();
                                if (typeof localStorage !== 'undefined' && this.userToken) {
                                    localStorage.setItem('userToken', this.userToken);
                                }
                            }

                            return await this.startSession(sessionId, targetMood, gameName, true, isBenchmark, providerKey, useAi);
                        }
                    } catch (e) {
                        this.log(`Failed to parse 401 response or refresh token: ${e}`, LogLevel.ERROR);
                    }
                }

                this.log(`StartSession Error: ${response.status}. Response: ${text}`, LogLevel.ERROR);
                throw new Error(`${response.status} | ${text}`);
            }
        } catch (error: any) {
            this.log(`StartSession Error: ${error.message}`, LogLevel.ERROR);
            throw error;
        }
    }

    async setLastScreenshotDataURI(dataURI: string): Promise<void> {
        this.lastScreenshotDataURI = dataURI;
    }

    async postScreenshots(sessionId: string, screenshots: Blob[], isLastChunk: boolean = false): Promise<boolean> {
        const url = `${this.baseUrl}${this.UPLOAD_SCREENSHOTS_ENDPOINT.replace('{sessionId}', sessionId)}`;
        this.log(`Posting ${screenshots.length} screenshots (isLastChunk: ${isLastChunk}): POST ${url}`, LogLevel.INFO);

        if (screenshots.length === 0 && !isLastChunk) {
            this.log("No screenshots provided, and 'is_last_chunk' is false.", LogLevel.WARNING);
            return false;
        }

        this.lastScreenshotBlob = screenshots[screenshots.length - 1];

        const formData = new FormData();
        formData.append('is_last_chunk', isLastChunk.toString().toLowerCase());

        if (isLastChunk) {
            try {
                const base64Data = this.testEmptyDataBase64String.split(',')[1];
                const byteCharacters = atob(base64Data);
                const byteArrays = [];
                for (let offset = 0; offset < byteCharacters.length; offset += 512) {
                    const slice = byteCharacters.slice(offset, offset + 512);
                    const byteNumbers = new Array(slice.length);
                    for (let i = 0; i < slice.length; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    byteArrays.push(byteArray);
                }
                const blob = new Blob(byteArrays, { type: 'image/png' });
                formData.append('screenshot_0', blob, 'screenshot_0.png');
            } catch (e: any) {
                this.log(`Failed to create fallback blob: ${e.message}`, LogLevel.ERROR);
            }
        } else {
            screenshots.forEach((screenshot, i) => {
                if (screenshot) {
                    // Assuming JPEG for now, as per original SDK implications or just generic blob
                    const filename = `screenshot_${i}.jpg`;
                    formData.append(`screenshot_${i}`, screenshot, filename);
                }
            });
        }

        let headers: any = {};

        if (this.userToken) {
            headers['X-Auth-Token'] = `Token ${this.userToken}`;
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: formData
            });

            if (response.ok) {
                this.log(`PostScreenshots successful.`, LogLevel.INFO);
                return true;
            } else {
                const text = await response.text();
                this.log(`PostScreenshots Error: ${response.status}. Response: ${text}`, LogLevel.ERROR);
                throw new Error(`${response.status} | ${text}`);
            }
        } catch (error: any) {
            this.log(`PostScreenshots Error: ${error.message}`, LogLevel.ERROR);
            throw error;
        }
    }

    async pollParameterResults(sessionId: string): Promise<PollResultsResponse> {
        const url = `${this.baseUrl}${this.POLL_RESULTS_ENDPOINT.replace('{sessionId}', sessionId)}`;
        this.log(`Polling results: GET ${url}`, LogLevel.INFO);

        let headers: any = {
            'Content-Type': 'application/json',
        };

        if (this.userToken) {
            headers['X-Auth-Token'] = `Token ${this.userToken}`;
        }

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: headers,
            });

            const text = await response.text();

            if (response.ok) {
                this.log(`PollResults successful.`, LogLevel.INFO);
                try {
                    const parsedResponse: PollResultsResponse = JSON.parse(text);
                    return parsedResponse;
                } catch (parseError: any) {
                    this.log(`PollResults JSON parsing error: ${parseError.message}`, LogLevel.ERROR);
                    throw parseError;
                }
            } else {
                this.log(`PollResults Error: ${response.status}. Response: ${text}`, LogLevel.ERROR);
                throw new Error(`${response.status} | ${text}`);
            }
        } catch (error: any) {
            this.log(`PollResults Error: ${error.message}`, LogLevel.ERROR);
            throw error;
        }
    }

    async createOrGetUserToken(customPlayerId: string) {
        if (!customPlayerId) {
            throw new Error('Custom player ID cannot be null or empty');
        }

        try {
            // First, try to get an existing user token
            return await this.getUserToken(customPlayerId);
        } catch (error) {
            // User doesn't exist or token retrieval failed, try to create user
            try {
                await this.createUser(customPlayerId);
                // User created successfully, now get token
                return await this.getUserToken(customPlayerId);
            } catch (createError: any) {
                throw new Error(`Failed to create user: ${createError.message}`);
            }
        }
    }

    async createUser(internalId: string) {
        const url = `${this.baseUrl}${this.CREATE_USER_ENDPOINT}`;
        this.logger?.(`Creating user: POST ${url} with internalId: ${internalId}`, LogLevel.INFO);

        const requestData = { internalId };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Api-Key ${this.apiKey}`
            },
            body: JSON.stringify(requestData)
        });

        const responseText = await response.text();

        if (response.ok) {
            this.logger?.(`CreateUser successful. Response: ${responseText}`, LogLevel.INFO);
            return responseText;
        } else {
            this.logger?.(`CreateUser Error: ${response.status}. Response: ${responseText}`, LogLevel.ERROR);
            throw new Error(`${response.status} | ${responseText}`);
        }
    }

    async getUserToken(internalId: string) {
        const url = `${this.baseUrl}${this.GET_USER_TOKEN_ENDPOINT}`;
        this.logger?.(`Getting user token: POST ${url} with internalId: ${internalId}`, LogLevel.INFO);

        const requestData = { internalId };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Api-Key ${this.apiKey}`
            },
            body: JSON.stringify(requestData)
        });

        const responseText = await response.text();

        if (response.ok) {
            this.logger?.(`GetUserToken successful. Response: ${responseText}`, LogLevel.INFO);

            try {
                const tokenResponse = JSON.parse(responseText);
                if (tokenResponse.token) {
                    return tokenResponse.token;
                } else {
                    throw new Error('Token not found in response');
                }
            } catch (parseError: any) {
                this.logger?.(`Failed to parse token response: ${parseError.message}`, LogLevel.ERROR);
                throw new Error('Failed to parse token response');
            }
        } else {
            this.logger?.(`GetUserToken Error: ${response.status}. Response: ${responseText}`, LogLevel.ERROR);
            throw new Error(`${response.status} | ${responseText}`);
        }
    }



    async getUserProfile(): Promise<UserProfile> {
        const url = `${this.baseUrl}${this.GET_USER_PROFILE_ENDPOINT}`;
        this.log(`Getting user profile: GET ${url}`, LogLevel.INFO);

        let headers: any = {
            'Content-Type': 'application/json',
            'Authorization': `Api-Key ${this.apiKey}`
        };

        if (this.userToken) {
            headers['X-Auth-Token'] = `Token ${this.userToken}`;
        }

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: headers
            });

            const text = await response.text();

            if (response.ok) {
                this.log(`GetUserProfile successful. Response: ${text}`, LogLevel.INFO);
                try {
                    const parsedResponse = JSON.parse(text);
                    return parsedResponse;
                } catch (parseError: any) {
                    this.log(`GetUserProfile JSON parsing error: ${parseError.message}`, LogLevel.ERROR);
                    throw parseError;
                }
            } else {
                this.log(`GetUserProfile Error: ${response.status}. Response: ${text}`, LogLevel.ERROR);
                throw new Error(`${response.status} | ${text}`);
            }
        } catch (error: any) {
            this.log(`GetUserProfile Error: ${error.message}`, LogLevel.ERROR);
            throw error;
        }
    }
}
