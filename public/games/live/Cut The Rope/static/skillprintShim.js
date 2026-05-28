window.adjustGame = function (obj) {
    if (typeof obj === 'object' && obj.hasOwnProperty('parameterName')) {
        const { parameterName, parameterValue } = obj;
        console.log(`[skillprintShim - Cut The Rope] Adjusting parameter ${parameterName} to ${parameterValue}`);

        if (parameterName === "gravity") {
            window.gravity = parameterValue;
            // Attempt to hook Box2D or Ctrr physics parameters if exposed
            if (window.Box2D && window.Box2D.Dynamics && window.Box2D.Dynamics.b2World) {
                // If a world instance is found, we could modify its gravity vector
                console.log("[skillprintShim - Cut The Rope] Box2D detected. Setting gravity scale.");
            }
        } else if (parameterName === "ropeElasticity") {
            window.ropeElasticity = parameterValue;
        } else if (parameterName === "scoreMultiplier") {
            window.scoreMultiplier = parameterValue;
        } else if (parameterName === "timeLimitSeconds") {
            window.timeLimitSeconds = parameterValue;
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
        console.log('[skillprintShim - Cut The Rope] Key intercepted in iframe:', event.key);
        window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
    }
}, true); // Use capture phase to intercept before the game calls preventDefault()
