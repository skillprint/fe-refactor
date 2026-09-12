// "adjustment": { "parameterName": "difficultyMultiplier", "parameterValue": 1.2 }
// difficultyMultiplier: 0.5-1.5, scales the random wait before the "go" stimulus
//   (0.5x: 1500-3500ms, 1.0x: 1000-2750ms, 1.5x: 500-2000ms).
// attemptCount: 3-10, rounds per session.

window.adjustGame = function (obj) {
    if (typeof obj === 'object' && obj.hasOwnProperty('parameterName')) {
        const { parameterName, parameterValue } = obj;
        const c = window.__reactionControls;
        if (!c) return;
        if (parameterName === "difficultyMultiplier") c.setDifficultyMultiplier(parameterValue);
        else if (parameterName === "attemptCount") c.setAttemptCount(parameterValue);
    }
};

window.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'ADJUST_GAME') window.adjustGame(event.data.data);
});

window.addEventListener('keydown', function (event) {
    if (/^[1-9]$/.test(event.key)) {
        window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
    }
}, true);
