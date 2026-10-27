// "adjustment": { "parameterName": "conflictRatio", "parameterValue": 0.75 }
// conflictRatio: 0-1 share of rounds where the word names a different colour than its ink.
// responseWindowMs: 500-5000 time allowed per round. roundCount: 5-60 rounds per session.
window.adjustGame = function (obj) {
    if (typeof obj === 'object' && obj.hasOwnProperty('parameterName')) {
        const { parameterName, parameterValue } = obj;
        const c = window.__stroopControls;
        if (!c) return;
        if (parameterName === "conflictRatio") c.setConflictRatio(parameterValue);
        else if (parameterName === "responseWindowMs") c.setResponseWindowMs(parameterValue);
        else if (parameterName === "roundCount") c.setRoundCount(parameterValue);
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

// Score for the Skillprint shell: accuracy so far (0–100), the figure the
// game itself keeps as its best; over once every round has run.
window.SKILLPRINT_STATE = function () {
    const s = window.__stroopState;
    return { score: s.accuracy, isGameOver: !s.running && s.round > 0 && s.round >= s.roundCount };
};
