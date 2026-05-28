window.adjustGame = function (obj) {
    if (typeof obj === 'object' && obj.hasOwnProperty('parameterName')) {
        const { parameterName, parameterValue } = obj;
        console.log(`[skillprintShim - Omnomrun] Adjusting parameter ${parameterName} to ${parameterValue}`);

        if (parameterName === "speedScale") {
            window.speedScale = parseFloat(parameterValue);
        } else if (parameterName === "invincibilityDuration") {
            window.invincibilityDuration = parseInt(parameterValue);
        } else if (parameterName === "magnetRadius") {
            window.magnetRadius = parseInt(parameterValue);
        } else if (parameterName === "coinSpawnRate") {
            window.coinSpawnRate = parseInt(parameterValue);
        }
    }
}

window.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'ADJUST_GAME') {
        window.adjustGame(event.data.data);
    }
});

// Forward keydown events to the parent window for the GameAdjustmentTester
window.addEventListener('keydown', function (event) {
    if (/^[1-9]$/.test(event.key)) {
        console.log('[skillprintShim - Omnomrun] Key intercepted in iframe:', event.key);
        window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
    }
}, true); // Use capture phase to intercept before the game calls preventDefault()

// Function to apply PlayCanvas hooks once scripts are loaded
function applyPlayCanvasHooks() {
    if (window.GameConfig && window.GameConfig.getAttribute && !window.GameConfig.attributesHooked) {
        window.GameConfig.attributesHooked = true;
        const originalGetAttribute = window.GameConfig.getAttribute;
        window.GameConfig.getAttribute = function(key) {
            let value = originalGetAttribute(key);
            if (key === 'movementSpeed' || key === 'maxMovementSpeed') {
                const scale = (typeof window.speedScale === 'number') ? window.speedScale : 1.0;
                return value * scale;
            }
            if (key === 'magnetPullDistance') {
                const radius = (typeof window.magnetRadius === 'number') ? window.magnetRadius : 3.0;
                return value * (radius / 3.0);
            }
            return value;
        };
        console.log('[skillprintShim - Omnomrun] Successfully hooked GameConfig.getAttribute');
    }

    if (window.Coin && window.Coin.prototype && !window.Coin.prototype.reusedHooked) {
        window.Coin.prototype.reusedHooked = true;
        const originalReused = window.Coin.prototype.onEntityReusedFromCache;
        window.Coin.prototype.onEntityReusedFromCache = function() {
            originalReused.call(this);
            const spawnRate = (typeof window.coinSpawnRate === 'number') ? window.coinSpawnRate : 2;
            if (spawnRate === 1) {
                // Determine if we should disable this coin to simulate lower density
                const pos = this.entity.getPosition();
                const seed = Math.abs(Math.floor(pos.x * 10 + pos.z * 10));
                if (seed % 2 === 0) {
                    this.entity.enabled = false;
                } else {
                    this.entity.enabled = true;
                }
            } else {
                this.entity.enabled = true;
            }

            if (spawnRate >= 3) {
                this.rewardValue = spawnRate - 1; // scale rewards for higher rates
            } else {
                this.rewardValue = 1;
            }
        };
        console.log('[skillprintShim - Omnomrun] Successfully hooked Coin.prototype.onEntityReusedFromCache');
    }
    
    // Periodically update power-up durations if window.Constants is available
    if (window.Constants && window.Constants.PowerupDuration && window.Constants.Powerups) {
        const duration = (typeof window.invincibilityDuration === 'number') ? window.invincibilityDuration : 10;
        const powerupTypes = [
            window.Constants.Powerups.FIRST_PERSON_VIEW,
            window.Constants.Powerups.ROCKET,
            window.Constants.Powerups.MAGNET,
            window.Constants.Powerups.DOUBLE_COINS,
            window.Constants.Powerups.HIGH_JUMP
        ];
        powerupTypes.forEach(type => {
            if (type && window.Constants.PowerupDuration[type] !== duration) {
                window.Constants.PowerupDuration[type] = duration;
            }
        });
    }
}

// Poll to apply hooks once PlayCanvas scripts are loaded
setInterval(applyPlayCanvasHooks, 200);
