// "adjustment": { "parameterName": "nLevel", "parameterValue": 3 }
// nLevel: 1-5 (how many steps back to match). stimulusIntervalMs: 1000-5000 (time per trial).
// trialCount: 5-60 (trials per session).
window.adjustGame = function (obj) {
    if (typeof obj === 'object' && obj.hasOwnProperty('parameterName')) {
        const { parameterName, parameterValue } = obj;
        const c = window.__nbackControls;
        if (!c) return;
        if (parameterName === "nLevel") c.setNLevel(parameterValue);
        else if (parameterName === "stimulusIntervalMs") c.setStimulusIntervalMs(parameterValue);
        else if (parameterName === "trialCount") c.setTrialCount(parameterValue);
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
