window.adjustGame = function (obj) {
    if (typeof obj === 'object' && obj.hasOwnProperty('parameterName')) {
        const { parameterName, parameterValue } = obj;
        if (parameterName === "maxCategoryComplexity") {
            window.maxCategoryComplexity = parameterValue;
            if (window.SceneManager && typeof window.SceneManager.doPopulatePages === 'function') {
                window.SceneManager.doPopulatePages();
            }
        } else if (parameterName === "zoomLevelsCount") {
            window.zoomLevelsCount = parameterValue;
            if (window.SceneManager && typeof window.SceneManager.doClampZoom === 'function') {
                window.SceneManager.doClampZoom();
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
        console.log('[skillprintShim - Colorize 2] Key intercepted in iframe:', event.key);
        window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
    }
}, true); // Use capture phase to intercept before the game calls preventDefault()
