window.adjustGame = function (obj) {
    if (typeof obj === 'object' && obj.hasOwnProperty('parameterName')) {
        const { parameterName, parameterValue } = obj;

        if (['seconds_on_clock', 'tilt_seconds', 'tilt_misses'].includes(parameterName)) {
            if (window.oCONFIG) {
                window.oCONFIG[parameterName] = parameterValue;
                console.log(`[skillprintShim] Photo Hunt adjusted ${parameterName} to ${parameterValue}`);
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
        console.log('[skillprintShim - Photo Hunt] Key intercepted in iframe:', event.key);
        window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
    }
}, true); // Use capture phase to intercept before the game calls preventDefault()
