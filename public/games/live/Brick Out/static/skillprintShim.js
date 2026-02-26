window.adjustGame = function (obj) {
    if (typeof obj === 'object' && obj.hasOwnProperty('parameterName')) {
        const { parameterName, parameterValue } = obj;

        if (parameterName === "MAX_VELOCITY_LIMIT") {
            window.MAX_VELOCITY_LIMIT = parameterValue;
        } else if (parameterName === "MIN_VELOCITY_LIMIT") {
            window.MIN_VELOCITY_LIMIT = parameterValue;
        } else if (parameterName === "TIME_BOUNCE_BALL") {
            window.TIME_BOUNCE_BALL = parameterValue;
        } else if (parameterName === "MAX_BALL_SPAWN") {
            window.MAX_BALL_SPAWN = parameterValue;
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
        console.log('[skillprintShim - Brick Out] Key intercepted in iframe:', event.key);
        window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
    }
}, true); // Use capture phase to intercept before the game calls preventDefault()
