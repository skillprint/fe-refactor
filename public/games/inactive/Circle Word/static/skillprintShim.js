window.adjustGame = function (obj) {
    if (typeof obj === 'object' && obj.hasOwnProperty('parameterName')) {
        const { parameterName, parameterValue } = obj;

        if (parameterName === "timer") {
            if (window.words_arr) {
                window.words_arr.forEach(w => {
                    w.timer = parameterValue;
                });
            }
        } else if (parameterName === "angleSpeed") {
            if (window.gameSettings && window.gameSettings.letters) {
                window.gameSettings.letters.angleSpeed = parameterValue;
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
        console.log('[skillprintShim] Key intercepted in iframe:', event.key);
        window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
    }
}, true); // Use capture phase to intercept before the game calls preventDefault()
