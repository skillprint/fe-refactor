window.adjustGame = function (obj) {
    if (typeof obj === 'object' && obj.hasOwnProperty('parameterName')) {
        const { parameterName, parameterValue } = obj;

        // Mahjong Deluxe sets values like BONUS_TIME and HINT_PENALTY globally during CMain init.
        // We override these global variables.
        if (typeof window[parameterName] !== 'undefined' || [
            'BONUS_TIME', 'HINT_PENALTY', 'SCORE_BONUS_LAYOUT'
        ].includes(parameterName)) {
            window[parameterName] = parameterValue;
            console.log(`[skillprintShim] Mahjong Deluxe adjusted ${parameterName} to ${parameterValue}`);
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
        console.log('[skillprintShim - Mahjong Deluxe] Key intercepted in iframe:', event.key);
        window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
    }
}, true); // Use capture phase to intercept before the game calls preventDefault()
