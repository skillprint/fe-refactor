window.settings = {
    combineDistance: 40,
    combineDuration: 400
};

window.adjustGame = function (obj) {
    if (typeof obj === 'object' && obj.hasOwnProperty('parameterName')) {
        const { parameterName, parameterValue } = obj;
        console.log('[skillprintShim - Alchemy] Adjusting parameter:', parameterName, 'to:', parameterValue);

        if (parameterName === "combineDistance") {
            window.settings.combineDistance = parameterValue;
        } else if (parameterName === "combineDuration") {
            window.settings.combineDuration = parameterValue;
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
        console.log('[skillprintShim - Alchemy] Key intercepted in iframe:', event.key);
        window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
    }
}, true); // Use capture phase to intercept before the game calls preventDefault()
