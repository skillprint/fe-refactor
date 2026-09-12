// "adjustment": {
// "parameterName": "difficultyMultiplier",
// "parameterValue": 1.2
// }
// difficultyMultiplier: 0.5-1.5, controls all three timing parameters:
//   - Announcement duration (flash length): 1500ms → 500ms
//   - Gap between tiles: 800ms → 300ms
//   - Gap between rounds: 3000ms → 1000ms
// numTiles: 2-8, how many colors are in play.

window.adjustGame = function (obj) {
    if (typeof obj === 'object' && obj.hasOwnProperty('parameterName')) {
        const { parameterName, parameterValue } = obj;

        if (parameterName === "difficultyMultiplier") {
            if (window.__simonControls) window.__simonControls.setDifficultyMultiplier(parameterValue);
        } else if (parameterName === "numTiles") {
            if (window.__simonControls) window.__simonControls.setNumTiles(parameterValue);
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
        console.log('[skillprintShim - Simon Says] Key intercepted in iframe:', event.key);
        window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
    }
}, true); // Use capture phase to intercept before the game calls preventDefault()
