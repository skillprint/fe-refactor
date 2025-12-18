export class SkillprintConfig {
    constructor(options = {}) {
        // Game Configuration
        this.gameName = options.gameName || 'GAME NAME SLUG REGISTERED IN SKILLPRINT API';
        
        // Environment Configuration
        this.targetEnvironment = options.targetEnvironment || ApiEnvironment.PRODUCTION;
        
        // Production API Configuration
        this.productionPartnerApiKey = options.productionPartnerApiKey || '';
        this.productionApiBaseUrl = options.productionApiBaseUrl || 'https://api.skillprint.com/v1';
        
        // Staging API Configuration
        this.stagingPartnerApiKey = options.stagingPartnerApiKey || '';
        this.stagingApiBaseUrl = options.stagingApiBaseUrl || 'https://staging-api.skillprint.com/v1';
        
        // Gameplay Parameters
        this.gameParameters = options.gameParameters || [];
        
        // SDK Behavior
        this.screenshotIntervalSeconds = options.screenshotIntervalSeconds || 2.0;
        this.screenshotPostIntervalSeconds = options.screenshotPostIntervalSeconds || 5.0;
        this.pollResultsIntervalSeconds = options.pollResultsIntervalSeconds || 5.0;
        this.enableDebugLogging = options.enableDebugLogging || false;
    }

    get activePartnerApiKey() {
        switch (this.targetEnvironment) {
            case ApiEnvironment.PRODUCTION:
                return this.productionPartnerApiKey;
            case ApiEnvironment.STAGING:
                return this.stagingPartnerApiKey || this.productionPartnerApiKey;
            default:
                return this.productionPartnerApiKey;
        }
    }

    get activeApiBaseUrl() {
        switch (this.targetEnvironment) {
            case ApiEnvironment.PRODUCTION:
                return this.productionApiBaseUrl;
            case ApiEnvironment.STAGING:
                return this.stagingApiBaseUrl;
            default:
                return this.productionApiBaseUrl;
        }
    }
}