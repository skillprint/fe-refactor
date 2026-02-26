window.adjustGame = function (obj) {
    if (typeof obj === 'object' && obj.hasOwnProperty('parameterName')) {
        const { parameterName, parameterValue } = obj;

        if (parameterName === "qualityThreshold") {
            // Apply it broadly to all sizes
            if (window.Levels && window.Levels.qualityThreshold) {
                window.Levels.qualityThreshold[4] = parameterValue;
                window.Levels.qualityThreshold[6] = parameterValue;
                window.Levels.qualityThreshold[8] = parameterValue;
                window.Levels.qualityThreshold[10] = parameterValue;
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
        console.log('[skillprintShim - 0hh1] Key intercepted in iframe:', event.key);
        window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
    }
}, true); // Use capture phase to intercept before the game calls preventDefault()
