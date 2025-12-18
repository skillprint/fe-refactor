export class WebGLUrlParameterExtractor {
    static getUrlParameter(parameterName) {
        try {
            const url = new URL(window.location.href);
            return url.searchParams.get(parameterName) || '';
        } catch (error) {
            console.warn(`Failed to get URL parameter '${parameterName}': ${error.message}`);
            return null;
        }
    }

    static getCurrentUrl() {
        try {
            return window.location.href;
        } catch (error) {
            console.warn(`Failed to get current URL: ${error.message}`);
            return null;
        }
    }

    static getSkillprintUrlParameters() {
        const targetMood = this.getUrlParameter('mood') || this.getUrlParameter('targetMood');
        const playerId = this.getUrlParameter('playerId') || 
                        this.getUrlParameter('player_id') || 
                        this.getUrlParameter('userId');

        // Store in localStorage for later use
        if (targetMood) {
            localStorage.setItem('SkillprintMood', targetMood);
        }
        if (playerId) {
            localStorage.setItem('SkillprintPlayerId', playerId);
        }

        return { targetMood, playerId };
    }

    static isUrlParameterSupported() {
        return typeof window !== 'undefined' && typeof window.location !== 'undefined';
    }
}

export class SkillprintSessionHelper {
    static startSessionWithUrlParams(manager, fallbackMood = 'focus', fallbackPlayerId = null, overrideMood = null, overridePlayerId = null) {
        if (!manager) {
            console.error('SkillprintManager is null. Cannot start session.');
            return;
        }

        let targetMood = overrideMood;
        let playerId = overridePlayerId;

        // Only try to get URL parameters if not overridden
        if (!targetMood || !playerId) {
            if (WebGLUrlParameterExtractor.isUrlParameterSupported()) {
                const urlParams = WebGLUrlParameterExtractor.getSkillprintUrlParameters();

                if (!targetMood) {
                    targetMood = urlParams.targetMood || fallbackMood;
                }

                if (!playerId) {
                    playerId = urlParams.playerId || fallbackPlayerId;
                }

                manager.log(`URL Parameters - Mood: '${targetMood}', Player ID: '${playerId}'`, LogLevel.INFO);
            } else {
                // Not in browser, use fallback values
                if (!targetMood) targetMood = fallbackMood;
                if (!playerId) playerId = fallbackPlayerId;

                manager.log(`Non-browser Platform - Using fallback values. Mood: '${targetMood}', Player ID: '${playerId}'`, LogLevel.INFO);
            }
        }

        // Validate mood
        if (!targetMood) {
            manager.log("No target mood specified and no fallback provided. Using 'focus' as default.", LogLevel.WARNING);
            targetMood = 'focus';
        }

        if (!Object.values(Mood).includes(targetMood)) {
            const validMoods = Object.values(Mood).join(', ');
            manager.log(`Invalid mood '${targetMood}'. Valid moods: ${validMoods}. Using 'focus' as fallback.`, LogLevel.WARNING);
            targetMood = 'focus';
        }

        manager.log(`Starting Skillprint session with Mood: '${targetMood}', Player ID: '${playerId || 'none'}'`, LogLevel.INFO);
        manager.startGameSession(targetMood, playerId);
    }
}