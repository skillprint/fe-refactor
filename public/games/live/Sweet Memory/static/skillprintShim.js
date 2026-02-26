window.adjustGame = function (obj) {
    if (typeof obj === 'object' && obj.hasOwnProperty('parameterName')) {
        const { parameterName, parameterValue } = obj;

        if (parameterName === 'pairs' || parameterName === 'time') {
            if (window.oCONFIG && window.oCONFIG.levels) {
                // Override parameter for all levels
                window.oCONFIG.levels.forEach(level => {
                    level[parameterName] = parameterValue;
                });
                console.log(`[skillprintShim] Sweet Memory adjusted ${parameterName} to ${parameterValue}`);
            }
        } else {
            console.warn(`[skillprintShim] Unknown parameter ${parameterName}`);
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
        console.log('[skillprintShim - Sweet Memory] Key intercepted in iframe:', event.key);
        window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
    }
}, true); // Use capture phase to intercept before the game calls preventDefault()
