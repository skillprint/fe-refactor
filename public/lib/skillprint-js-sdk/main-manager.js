export class SkillprintManager {
    constructor(config, canvasProvider) {
        if (SkillprintManager.instance) {
            console.warn('Another instance of SkillprintManager already exists. Using existing instance.');
            return SkillprintManager.instance;
        }

        this.config = config;
        this.canvasProvider = canvasProvider; // Function that returns the game canvas
        this.currentSessionId = null;
        this.isSessionActive = false;
        this.apiClient = null;
        this.screenshotUtility = null;
        this.screenshotQueue = [];
        this.registeredParameters = new Map();

        // Timers
        this.screenshotCaptureTimer = null;
        this.screenshotPostTimer = null;
        this.pollResultsTimer = null;

        this.initializeSDK();
        SkillprintManager.instance = this;
    }

    static getInstance() {
        return SkillprintManager.instance;
    }

    initializeSDK() {
        if (!this.config) {
            console.error('SkillprintConfig not provided to SkillprintManager. SDK will not function.');
            return;
        }

        if (!this.config.activePartnerApiKey) {
            this.log(`Partner API Key for ${this.config.targetEnvironment} environment is not set. SDK will not function.`, LogLevel.ERROR);
            return;
        }

        if (!this.config.activeApiBaseUrl) {
            this.log(`API Base URL for ${this.config.targetEnvironment} environment is not set. SDK will not function.`, LogLevel.ERROR);
            return;
        }

        this.apiClient = new SkillprintAPIClient(
            this.config.activeApiBaseUrl,
            this.config.activePartnerApiKey,
            this.log.bind(this)
        );

        this.screenshotUtility = new ScreenshotUtility(this.log.bind(this));

        // Prepare registered parameters from config
        this.config.gameParameters.forEach(paramDef => {
            if (!this.registeredParameters.has(paramDef.parameterName)) {
                this.registeredParameters.set(paramDef.parameterName, new ParameterDefinition(paramDef));
            } else {
                this.log(`Duplicate parameter name found in config: ${paramDef.parameterName}. Using first occurrence.`, LogLevel.WARNING);
            }
        });

        this.log(`Skillprint SDK Initialized for ${this.config.targetEnvironment} environment (URL: ${this.config.activeApiBaseUrl}).`);
    }

    registerParameterModifier(parameterName, updateAction, expectedType = null) {
        const paramDef = this.registeredParameters.get(parameterName);
        if (paramDef) {
            // Type check if expectedType is provided
            if (expectedType) {
                let typeMatch = false;
                if (expectedType === 'number' && paramDef.type === ParameterType.FLOAT) typeMatch = true;
                else if (expectedType === 'integer' && paramDef.type === ParameterType.INTEGER) typeMatch = true;
                else if (expectedType === 'boolean' && paramDef.type === ParameterType.BOOLEAN) typeMatch = true;

                if (!typeMatch) {
                    this.log(`Type mismatch for parameter '${parameterName}'. Expected ${paramDef.type}, but got ${expectedType}. Modifier not registered.`, LogLevel.ERROR);
                    return;
                }
            }

            paramDef.updateAction = (value) => {
                try {
                    updateAction(value);
                } catch (error) {
                    this.log(`Error in update action for parameter '${parameterName}': ${error.message}`, LogLevel.ERROR);
                }
            };

            this.log(`Parameter '${parameterName}' modifier registered successfully.`);
        } else {
            this.log(`Attempted to register modifier for undefined parameter: '${parameterName}'. Ensure it's in SkillprintConfig.`, LogLevel.WARNING);
        }
    }

    async startGameSession(targetMood, customPlayerId = null) {
        if (this.isSessionActive) {
            this.log('Session already active. Call stopGameSession first.', LogLevel.WARNING);
            return;
        }

        if (!this.config || !this.config.activePartnerApiKey || !this.config.activeApiBaseUrl) {
            this.log('SDK not configured properly (check environment settings). Cannot start session.', LogLevel.ERROR);
            return;
        }

        this.currentSessionId = this.generateSessionId();
        this.isSessionActive = true;
        this.log(`Starting game session for ${this.config.targetEnvironment} environment.`, LogLevel.INFO);

        // Construct parameter info to send to Skillprint
        const parameterInfos = Array.from(this.registeredParameters.values()).map(p => new ParameterInfo(
            p.parameterName,
            p.type,
            p.description,
            (p.type === ParameterType.FLOAT || p.type === ParameterType.INTEGER) ? p.minValue.toString() : null,
            (p.type === ParameterType.FLOAT || p.type === ParameterType.INTEGER) ? p.maxValue.toString() : null
        ));

        try {
            const result = await this.apiClient.startSession(
                this.currentSessionId,
                targetMood,
                customPlayerId,
                this.config.gameName,
                parameterInfos
            );

            this.log(`Skillprint session started: ${this.currentSessionId}. Response: ${result.data}`);
            
            // Start SDK processes
            this.startScreenshotCaptureLoop();
            this.startScreenshotPostLoop();
            this.startPollResultsLoop();

        } catch (error) {
            this.log(`Failed to start Skillprint session: ${error.message}`, LogLevel.ERROR);
            this.isSessionActive = false;
            this.currentSessionId = null;
        }
    }

    stopGameSession() {
        if (!this.isSessionActive) {
            this.log('No active session to stop.', LogLevel.WARNING);
            return;
        }

        this.log(`Stopping Skillprint session: ${this.currentSessionId}`);
        this.isSessionActive = false;

        // Clear timers
        if (this.screenshotCaptureTimer) clearInterval(this.screenshotCaptureTimer);
        if (this.screenshotPostTimer) clearInterval(this.screenshotPostTimer);
        if (this.pollResultsTimer) clearInterval(this.pollResultsTimer);

        // Clear screenshot queue
        this.screenshotQueue = [];

        this.currentSessionId = null;
        this.log('Skillprint session stopped.');
    }

    startScreenshotCaptureLoop() {
        this.screenshotCaptureTimer = setInterval(async () => {
            if (!this.isSessionActive) return;

            const canvas = this.canvasProvider?.();
            if (!canvas) {
                this.log('No canvas available for screenshot capture', LogLevel.WARNING);
                return;
            }

            const screenshot = await this.screenshotUtility.captureScreenshot(canvas);
            if (screenshot) {
                if (this.screenshotQueue.length < 50) { // Max 50 pending screenshots
                    this.screenshotQueue.push(screenshot);
                    this.log(`Screenshot captured. Queue size: ${this.screenshotQueue.length}`);
                } else {
                    this.log('Screenshot queue full. Discarding new screenshot.', LogLevel.WARNING);
                }
            }
        }, this.config.screenshotIntervalSeconds * 1000);
    }

    startScreenshotPostLoop() {
        this.screenshotPostTimer = setInterval(async () => {
            if (!this.isSessionActive || this.screenshotQueue.length === 0) return;

            const batchSize = Math.max(1, Math.ceil(this.config.screenshotPostIntervalSeconds / this.config.screenshotIntervalSeconds) * 2);
            const batchToPost = this.screenshotQueue.splice(0, Math.min(this.screenshotQueue.length, batchSize));

            if (batchToPost.length > 0) {
                this.log(`Posting ${batchToPost.length} screenshots...`);
                try {
                    const result = await this.apiClient.postScreenshots(this.currentSessionId, batchToPost, false);
                    this.log(`Successfully posted ${batchToPost.length} screenshots. Response: ${result.data}`);
                } catch (error) {
                    this.log(`Failed to post screenshots: ${error.message}`, LogLevel.ERROR);
                }
            }
        }, this.config.screenshotPostIntervalSeconds * 1000);
    }

    startPollResultsLoop() {
        this.pollResultsTimer = setInterval(async () => {
            if (!this.isSessionActive) return;

            try {
                const result = await this.apiClient.pollParameterResults(this.currentSessionId);
                if (result.success && result.data && result.data.length > 0) {
                    this.log(`Received ${result.data.length} parameter updates from API.`);
                    this.applyParameterUpdates(result.data);
                }
            } catch (error) {
                this.log(`Failed to poll results: ${error.message}`, LogLevel.WARNING);
            }
        }, this.config.pollResultsIntervalSeconds * 1000);
    }

    applyParameterUpdates(updates) {
        updates.forEach(update => {
            this.log(`[DEBUG] Received update - Name: ${update.parameterName}, Value: '${update.newValue}', Type: ${typeof update.newValue}`, LogLevel.INFO);
            
            const paramDef = this.registeredParameters.get(update.parameterName);
            if (paramDef) {
                if (!paramDef.updateAction) {
                    this.log(`Parameter '${update.parameterName}' received from API but has no registered modifier. Skipping.`, LogLevel.WARNING);
                    return;
                }

                const convertedValue = paramDef.convertValue(update.newValue);

                if (convertedValue !== null && paramDef.isValid(convertedValue)) {
                    try {
                        this.log(`Applying update: ${paramDef.parameterName} = ${convertedValue} (Type: ${paramDef.type})`);
                        paramDef.updateAction(convertedValue);
                    } catch (error) {
                        this.log(`Error applying update for ${paramDef.parameterName}: ${error.message}`, LogLevel.ERROR);
                    }
                } else {
                    this.log(`Invalid value or type for parameter ${paramDef.parameterName}: '${update.newValue}'. Expected type: ${paramDef.type}, Range: ${paramDef.minValue}-${paramDef.maxValue}. Skipping.`, LogLevel.WARNING);
                }
            } else {
                this.log(`Received update for unknown parameter: ${update.parameterName}. Skipping.`, LogLevel.WARNING);
            }
        });
    }

    generateSessionId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    log(message, level = LogLevel.INFO) {
        if (!this.config.enableDebugLogging && level === LogLevel.INFO) return;

        const prefix = '[SkillprintSDK]';
        switch (level) {
            case LogLevel.INFO:
                console.log(`${prefix} ${message}`);
                break;
            case LogLevel.WARNING:
                console.warn(`${prefix} ${message}`);
                break;
            case LogLevel.ERROR:
                console.error(`${prefix} ${message}`);
                break;
        }
    }

    getCurrentSessionId() {
        return this.currentSessionId;
    }

    getConfig() {
        return this.config;
    }

    // WebGL specific methods
    startGameSessionFromUrl(fallbackMood = 'relax', fallbackPlayerId = null) {
        SkillprintSessionHelper.startSessionWithUrlParams(this, fallbackMood, fallbackPlayerId);
    }

    startGameSessionWithOverrides(fallbackMood = 'relax', fallbackPlayerId = null, overrideMood = null, overridePlayerId = null) {
        SkillprintSessionHelper.startSessionWithUrlParams(this, fallbackMood, fallbackPlayerId, overrideMood, overridePlayerId);
    }

    getUrlParametersInfo() {
        if (!WebGLUrlParameterExtractor.isUrlParameterSupported()) {
            return 'URL parameters not supported on this platform (not in browser)';
        }

        const currentUrl = WebGLUrlParameterExtractor.getCurrentUrl();
        const urlParams = WebGLUrlParameterExtractor.getSkillprintUrlParameters();

        return `Current URL: ${currentUrl}\nMood Parameter: '${urlParams.targetMood || 'not found'}'\nPlayer ID Parameter: '${urlParams.playerId || 'not found'}'`;
    }
}

// Set instance to null initially
SkillprintManager.instance = null;

// ================================
// GAME ENGINE ADAPTERS
// ================================

// Phaser Adapter
export class PhaserSkillprintAdapter {
    constructor(scene, config) {
        this.scene = scene;
        this.config = config;
        this.manager = new SkillprintManager(config, () => this.scene.game.canvas);
    }

    static create(scene, config) {
        return new PhaserSkillprintAdapter(scene, config);
    }

    startSession(targetMood, customPlayerId = null) {
        return this.manager.startGameSession(targetMood, customPlayerId);
    }

    stopSession() {
        return this.manager.stopGameSession();
    }

    registerParameter(parameterName, updateAction, expectedType = null) {
        return this.manager.registerParameterModifier(parameterName, updateAction, expectedType);
    }

    // Phaser-specific helper to register sprite property updates
    registerSpriteProperty(parameterName, sprite, propertyName) {
        this.manager.registerParameterModifier(parameterName, (value) => {
            sprite[propertyName] = value;
        });
    }
}

// Three.js Adapter
export class ThreeSkillprintAdapter {
    constructor(renderer, config) {
        this.renderer = renderer;
        this.config = config;
        this.manager = new SkillprintManager(config, () => this.renderer.domElement);
    }

    static create(renderer, config) {
        return new ThreeSkillprintAdapter(renderer, config);
    }

    startSession(targetMood, customPlayerId = null) {
        return this.manager.startGameSession(targetMood, customPlayerId);
    }

    stopSession() {
        return this.manager.stopGameSession();
    }

    registerParameter(parameterName, updateAction, expectedType = null) {
        return this.manager.registerParameterModifier(parameterName, updateAction, expectedType);
    }

    // Three.js-specific helper to register object property updates
    registerObjectProperty(parameterName, object, propertyName) {
        this.manager.registerParameterModifier(parameterName, (value) => {
            if (propertyName.includes('.')) {
                const props = propertyName.split('.');
                let target = object;
                for (let i = 0; i < props.length - 1; i++) {
                    target = target[props[i]];
                }
                target[props[props.length - 1]] = value;
            } else {
                object[propertyName] = value;
            }
        });
    }
}

// PixiJS Adapter
export class PixiSkillprintAdapter {
    constructor(app, config) {
        this.app = app;
        this.config = config;
        this.manager = new SkillprintManager(config, () => this.app.view);
    }

    static create(app, config) {
        return new PixiSkillprintAdapter(app, config);
    }

    startSession(targetMood, customPlayerId = null) {
        return this.manager.startGameSession(targetMood, customPlayerId);
    }

    stopSession() {
        return this.manager.stopGameSession();
    }

    registerParameter(parameterName, updateAction, expectedType = null) {
        return this.manager.registerParameterModifier(parameterName, updateAction, expectedType);
    }

    // PixiJS-specific helper to register display object property updates
    registerDisplayObjectProperty(parameterName, displayObject, propertyName) {
        this.manager.registerParameterModifier(parameterName, (value) => {
            displayObject[propertyName] = value;
        });
    }
}

// Generic Canvas Adapter
export class GenericCanvasSkillprintAdapter {
    constructor(canvas, config) {
        this.canvas = canvas;
        this.config = config;
        this.manager = new SkillprintManager(config, () => this.canvas);
    }

    static create(canvas, config) {
        return new GenericCanvasSkillprintAdapter(canvas, config);
    }

    startSession(targetMood, customPlayerId = null) {
        return this.manager.startGameSession(targetMood, customPlayerId);
    }

    stopSession() {
        return this.manager.stopGameSession();
    }

    registerParameter(parameterName, updateAction, expectedType = null) {
        return this.manager.registerParameterModifier(parameterName, updateAction, expectedType);
    }
}

// Export all classes and constants for easy importing
export {
    ApiEnvironment,
    ParameterType,
    Mood,
    LogLevel
};