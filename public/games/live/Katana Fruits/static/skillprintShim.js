window.adjustGame = function (obj) {
    if (typeof obj === 'object' && obj.hasOwnProperty('parameterName')) {
        const { parameterName, parameterValue } = obj;

        // Katana Fruits sets values like OCCURENCE_FRUIT, MAX_FRUIT_ROT_SPEED globally inside `js/settings.js` overrides or during CMain init.
        // We will override these global variables directly as they are used in `CMain.js` and `this.init()`
        if (typeof window[parameterName] !== 'undefined' || [
            'OCCURENCE_FRUIT', 'MAX_FRUIT_ROT_SPEED', 'NUM_LIVES', 'STARTING_SIMULTANEOUS_FRUITS',
            'MAX_SIMULTANEOUS_FRUITS', 'FRUIT_TO_CUT_FOR_LEVEL_UP', 'TIME_FOR_COMBO', 'COMBO_TWO_FRUIT'
        ].includes(parameterName)) {
            window[parameterName] = parameterValue;
            console.log(`[skillprintShim] Katana Fruits adjusted ${parameterName} to ${parameterValue}`);
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
        console.log('[skillprintShim - Katana Fruits] Key intercepted in iframe:', event.key);
        window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
    }
}, true); // Use capture phase to intercept before the game calls preventDefault()
