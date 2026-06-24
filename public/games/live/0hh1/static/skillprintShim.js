window.settings = {
    maxGridSize: 10,
    hintsAllowed: 1
};

window.adjustGame = function (obj) {
    if (typeof obj === 'object' && obj.hasOwnProperty('parameterName')) {
        const { parameterName, parameterValue } = obj;
        console.log('[skillprintShim - 0hh1] Applying parameter:', parameterName, 'with value:', parameterValue);

        if (parameterName === "qualityThreshold") {
            // Apply it broadly to all sizes
            if (window.Levels && window.Levels.qualityThreshold) {
                window.Levels.qualityThreshold[4] = parameterValue;
                window.Levels.qualityThreshold[6] = parameterValue;
                window.Levels.qualityThreshold[8] = parameterValue;
                window.Levels.qualityThreshold[10] = parameterValue;
            }
        } else if (parameterName === "maxGridSize") {
            window.settings.maxGridSize = parameterValue;
            if (typeof window.refreshSizeSelect === 'function') {
                window.refreshSizeSelect();
            }
        } else if (parameterName === "hintsAllowed") {
            window.settings.hintsAllowed = parameterValue;
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
