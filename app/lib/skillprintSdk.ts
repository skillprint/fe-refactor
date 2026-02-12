
// removed uuid import since sessionId is passed as argument

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
}

interface StartSessionRequest {
    sessionId: string;
    game: string;
    targetMood: string;
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

    private lastScreenshotBlob: Blob | null = null;
    private lastScreenshotDataURI: string | null = null;
    private testEmptyDataBase64String: string = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKAP/2Q==';

    private readonly START_SESSION_ENDPOINT = '/games/api/sessions/';
    private readonly UPLOAD_SCREENSHOTS_ENDPOINT = '/games/api/record-session/{sessionId}/';
    private readonly POLL_RESULTS_ENDPOINT = '/games/api/sessions/{sessionId}/';
    private readonly STOP_SESSION_ENDPOINT = '/games/api/sessions/{sessionId}/stop/';

    constructor(options: SkillprintConfigOptions) {
        this.baseUrl = options.baseUrl.replace(/\/$/, '');
        this.apiKey = options.apiKey;
        this.logger = options.logger;
    }

    private log(message: string, level: LogLevel) {
        if (this.logger) {
            this.logger(message, level);
        }
    }

    async startSession(sessionId: string, targetMood: string, gameName: string): Promise<boolean> {
        const url = `${this.baseUrl}${this.START_SESSION_ENDPOINT}`;
        this.log(`Starting session: POST ${url}`, LogLevel.INFO);

        // Validate mood
        if (!Object.values(Mood).includes(targetMood as Mood)) {
            const validMoods = Object.values(Mood).join(', ');
            this.log(`Invalid targetMood: '${targetMood}'. Valid moods are: ${validMoods}.`, LogLevel.ERROR);
            throw new Error(`Invalid targetMood: '${targetMood}'`);
        }

        const requestData: StartSessionRequest = {
            sessionId,
            game: gameName,
            targetMood
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Api-Key ${this.apiKey}`
                },
                body: JSON.stringify(requestData)
            });

            if (response.ok) {
                this.log(`StartSession successful.`, LogLevel.INFO);
                return true;
            } else {
                const text = await response.text();
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
            const fetchedResponse = await fetch(this.testEmptyDataBase64String);
            const blob = await fetchedResponse.blob();
            formData.append('screenshot_0', blob, 'screenshot_0.jpg');
        } else {
            screenshots.forEach((screenshot, i) => {
                if (screenshot) {
                    // Assuming JPEG for now, as per original SDK implications or just generic blob
                    const filename = `screenshot_${i}.jpg`;
                    formData.append(`screenshot${i}`, screenshot, filename);
                }
            });
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    // 'Authorization': `Api-Key ${this.apiKey}`
                    // Do not set Content-Type for FormData, fetch handles it
                },
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

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    // 'Authorization': `Api-Key ${this.apiKey}`,
                    'Accept': 'application/json'
                }
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
}
