// "adjustment": { "parameterName": "exhaleSec", "parameterValue": 8 }
// inhaleSec 2-10, holdSec 0-10, exhaleSec 2-12 (seconds per phase, applied from the next phase).
// sessionLengthMin 1-10 total session length.
window.adjustGame = function (obj) {
    if (typeof obj === 'object' && obj.hasOwnProperty('parameterName')) {
        const { parameterName, parameterValue } = obj;
        const c = window.__breathControls;
        if (!c) return;
        if (parameterName === "inhaleSec") c.setInhaleSec(parameterValue);
        else if (parameterName === "holdSec") c.setHoldSec(parameterValue);
        else if (parameterName === "exhaleSec") c.setExhaleSec(parameterValue);
        else if (parameterName === "sessionLengthMin") c.setSessionLengthMin(parameterValue);
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
