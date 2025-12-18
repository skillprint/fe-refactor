export class SkillprintAPIClient {
    constructor(baseUrl, partnerApiKey, logger) {
        this.baseUrl = baseUrl.replace(/\/$/, '');
        this.partnerApiKey = partnerApiKey;
        this.logger = logger;

        // API Endpoints
        this.START_SESSION_ENDPOINT = '/games/api/sessions/';
        this.UPLOAD_SCREENSHOTS_ENDPOINT = '/games/api/record-session/{sessionId}/';
        this.POLL_RESULTS_ENDPOINT = '/games/api/sessions/{sessionId}/';
        this.CREATE_USER_ENDPOINT = '/partners/api/users/add/';
        this.GET_USER_TOKEN_ENDPOINT = '/partners/api/users/auth/token/';
    }

    async startSession(sessionId, targetMood, customPlayerId, gameName, gameParameters) {
        const url = `${this.baseUrl}${this.START_SESSION_ENDPOINT}`;
        this.logger?.(`Starting session: POST ${url}`, LogLevel.INFO);
        this.logger?.(`Starting session: MOOD ${targetMood}`, LogLevel.WARNING);

        // Validate mood
        if (!Object.values(Mood).includes(targetMood)) {
            const validMoods = Object.values(Mood).join(', ');
            const errorMessage = `Invalid targetMood: '${targetMood}'. Valid moods are: ${validMoods}.`;
            this.logger?.(errorMessage, LogLevel.ERROR);
            throw new Error(errorMessage);
        }

        // Get user token if customPlayerId is provided
        let userToken = null;
        if (customPlayerId) {
            try {
                userToken = await this.createOrGetUserToken(customPlayerId);
                this.logger?.(`User token obtained successfully for player: ${customPlayerId}`, LogLevel.INFO);
            } catch (error) {
                this.logger?.(`Failed to obtain user token: ${error.message}`, LogLevel.ERROR);
                this.logger?.(`Proceeding with session creation without user token`, LogLevel.WARNING);
            }
        }

        const requestData = new StartSessionRequest(sessionId, gameName, targetMood);

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Api-Key ${this.partnerApiKey}`
        };

        if (userToken) {
            headers['X-Auth-Token'] = `Token ${userToken}`;
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestData)
            });

            const responseText = await response.text();

            if (response.ok) {
                this.logger?.(`StartSession successful. Response: ${responseText}`, LogLevel.INFO);
                return { success: true, data: responseText };
            } else {
                this.logger?.(`StartSession Error: ${response.status}. Response: ${responseText}`, LogLevel.ERROR);
                throw new Error(`${response.status} | ${responseText}`);
            }
        } catch (error) {
            this.logger?.(`StartSession Error: ${error.message}`, LogLevel.ERROR);
            throw error;
        }
    }

    async postScreenshots(sessionId, screenshots, isLastChunk = false) {
        const url = `${this.baseUrl}${this.UPLOAD_SCREENSHOTS_ENDPOINT.replace('{sessionId}', sessionId)}`;
        this.logger?.(`Posting ${screenshots.length} screenshots (isLastChunk: ${isLastChunk}): POST ${url}`, LogLevel.INFO);

        if (screenshots.length === 0 && !isLastChunk) {
            const errorMsg = "No screenshots provided, and 'is_last_chunk' is false. API likely requires files in this case.";
            this.logger?.(errorMsg, LogLevel.WARNING);
            throw new Error(errorMsg);
        }

        const formData = new FormData();
        formData.append('is_last_chunk', isLastChunk.toString().toLowerCase());

        for (let i = 0; i < screenshots.length; i++) {
            if (screenshots[i]) {
                const fieldName = `screenshot${i}`;
                const filename = `screenshot_${i}.jpg`;
                formData.append(fieldName, screenshots[i], filename);
            } else {
                this.logger?.(`Screenshot at index ${i} is null, skipping.`, LogLevel.WARNING);
            }
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Api-Key ${this.partnerApiKey}`
                },
                body: formData
            });

            const responseText = await response.text();

            if (response.ok) {
                this.logger?.(`PostScreenshots successful. Response: ${responseText}`, LogLevel.INFO);
                return { success: true, data: responseText };
            } else {
                this.logger?.(`PostScreenshots Error: ${response.status}. Response: ${responseText}`, LogLevel.ERROR);
                throw new Error(`${response.status} | ${responseText}`);
            }
        } catch (error) {
            this.logger?.(`PostScreenshots Error: ${error.message}`, LogLevel.ERROR);
            throw error;
        }
    }

    async pollParameterResults(sessionId) {
        const url = `${this.baseUrl}${this.POLL_RESULTS_ENDPOINT.replace('{sessionId}', sessionId)}`;
        this.logger?.(`Polling results: GET ${url}`, LogLevel.INFO);

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Api-Key ${this.partnerApiKey}`,
                    'Accept': 'application/json'
                }
            });

            const responseText = await response.text();

            if (response.ok) {
                this.logger?.(`PollResults successful. Response: ${responseText}`, LogLevel.INFO);
                
                try {
                    const parsedResponse = JSON.parse(responseText);
                    const pollResults = new PollResultsResponse(parsedResponse);
                    
                    if (pollResults.parameterUpdates && pollResults.parameterUpdates.length > 0) {
                        this.logger?.(`Successfully parsed ${pollResults.parameterUpdates.length} parameter updates`, LogLevel.INFO);
                        
                        // Log each parameter update for debugging
                        pollResults.parameterUpdates.forEach(update => {
                            const parsedValue = update.getParsedValue();
                            this.logger?.(`Parameter Update: ${update.parameterName} = ${parsedValue} (Type: ${typeof parsedValue})`, LogLevel.INFO);
                        });
                    } else {
                        this.logger?.("No parameter updates found in response", LogLevel.WARNING);
                    }

                    return { success: true, data: pollResults.parameterUpdates || [] };
                } catch (parseError) {
                    this.logger?.(`PollResults JSON parsing error: ${parseError.message}. Response: ${responseText}`, LogLevel.ERROR);
                    throw parseError;
                }
            } else {
                this.logger?.(`PollResults Error: ${response.status}. Response: ${responseText}`, LogLevel.ERROR);
                throw new Error(`${response.status} | ${responseText}`);
            }
        } catch (error) {
            this.logger?.(`PollResults Error: ${error.message}`, LogLevel.ERROR);
            throw error;
        }
    }

    async createOrGetUserToken(customPlayerId) {
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
            } catch (createError) {
                throw new Error(`Failed to create user: ${createError.message}`);
            }
        }
    }

    async createUser(internalId) {
        const url = `${this.baseUrl}${this.CREATE_USER_ENDPOINT}`;
        this.logger?.(`Creating user: POST ${url} with internalId: ${internalId}`, LogLevel.INFO);

        const requestData = { internalId };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Api-Key ${this.partnerApiKey}`
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

    async getUserToken(internalId) {
        const url = `${this.baseUrl}${this.GET_USER_TOKEN_ENDPOINT}`;
        this.logger?.(`Getting user token: POST ${url} with internalId: ${internalId}`, LogLevel.INFO);

        const requestData = { internalId };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Api-Key ${this.partnerApiKey}`
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
            } catch (parseError) {
                this.logger?.(`Failed to parse token response: ${parseError.message}`, LogLevel.ERROR);
                throw new Error('Failed to parse token response');
            }
        } else {
            this.logger?.(`GetUserToken Error: ${response.status}. Response: ${responseText}`, LogLevel.ERROR);
            throw new Error(`${response.status} | ${responseText}`);
        }
    }
}