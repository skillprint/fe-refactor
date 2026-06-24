window.adjustGame = function (obj) {
    if (typeof obj === 'object' && obj.hasOwnProperty('parameterName')) {
        const { parameterName, parameterValue } = obj;
        console.log('[skillprintShim - 2048] Adjusting parameter:', parameterName, 'to:', parameterValue);

        if (parameterName === "startTiles") {
            if (window.gameManager) {
                window.gameManager.startTiles = parameterValue;
            } else {
                // If it hasn't booted yet, hook it
                const originalGameManager = window.GameManager;
                window.GameManager = function (size, InputManager, Actuator, StorageManager) {
                    const gm = new originalGameManager(size, InputManager, Actuator, StorageManager);
                    gm.startTiles = parameterValue;
                    window.gameManager = gm; // save reference for future adjustments
                    return gm;
                };
            }
        } else if (parameterName === "fourProbability") {
            if (window.gameManager) {
                window.gameManager.fourProbability = parameterValue;
            }
        } else if (parameterName === "targetValue") {
            if (window.gameManager) {
                window.gameManager.targetValue = parameterValue;
            }
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
        console.log('[skillprintShim - 2048] Key intercepted in iframe:', event.key);
        window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
    }
}, true); // Use capture phase to intercept before the game calls preventDefault()
