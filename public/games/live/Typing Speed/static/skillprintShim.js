// "adjustment": { "parameterName": "wordDifficulty", "parameterValue": 2 }
// wordDifficulty: 1 short common words, 2 medium, 3 long/rare words. timeLimitSec: 15-180.
window.adjustGame = function (obj) {
    if (typeof obj === 'object' && obj.hasOwnProperty('parameterName')) {
        const { parameterName, parameterValue } = obj;
        const c = window.__typingControls;
        if (!c) return;
        if (parameterName === "wordDifficulty") c.setWordDifficulty(parameterValue);
        else if (parameterName === "timeLimitSec") c.setTimeLimitSec(parameterValue);
    }
};

window.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'ADJUST_GAME') window.adjustGame(event.data.data);
});

window.addEventListener('keydown', function (event) {
    if (/^[1-9]$/.test(event.key) && document.activeElement !== document.getElementById('input')) {
        window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
    }
}, true);
