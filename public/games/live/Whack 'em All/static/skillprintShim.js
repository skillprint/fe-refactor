window.adjustGame = function (obj) {
    if (typeof obj === 'object' && obj.hasOwnProperty('parameterName')) {
        const { parameterName, parameterValue } = obj;

        if (['START_SPAWN_TIME', 'TIME_OFFSET_PER_SPAWN_DECREASE', 'OFFSET_SPAWN_TIME', 'TIME_SUPER_HAMMER_CHECK', 'SUPER_HAMMER_MULT', 'SUPER_HAMMER_TIME', 'TIME_LEVEL', 'CHARACTER_POINTS'].includes(parameterName) || typeof window[parameterName] !== 'undefined') {
            window[parameterName] = parameterValue;
            console.log(`[skillprintShim] Whack 'em All adjusted ${parameterName} to`, parameterValue);
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
        console.log('[skillprintShim - Whack \'em All] Key intercepted in iframe:', event.key);
        window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
    }
}, true); // Use capture phase to intercept before the game calls preventDefault()
