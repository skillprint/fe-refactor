window.settings = {
    shootVelocity: 900,
    aimGuideEnabled: 1,
    bubbleLimitMultiplier: 1.0
};

window.adjustGame = function (obj) {
    if (typeof obj === 'object' && obj.hasOwnProperty('parameterName')) {
        const { parameterName, parameterValue } = obj;
        console.log('[skillprintShim - Bubble Spirit] Applying adjustment:', parameterName, '=', parameterValue);
        if (parameterName === 'shootVelocity') {
            window.settings.shootVelocity = Number(parameterValue);
        } else if (parameterName === 'aimGuideEnabled') {
            window.settings.aimGuideEnabled = Number(parameterValue);
        } else if (parameterName === 'bubbleLimitMultiplier') {
            window.settings.bubbleLimitMultiplier = Number(parameterValue);
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
        console.log('[skillprintShim - Bubble Spirit] Key intercepted in iframe:', event.key);
        window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
    }
}, true); // Use capture phase to intercept before the game calls preventDefault()
