// Flanker Task is a fixed-protocol cognitive task: 8 practice and 40 main
// trials, balanced for congruency and direction, so its scores stay
// comparable across players. It has no difficulty knobs; ADJUST_GAME
// messages are logged and ignored.
window.adjustGame = function (obj) {
    if (typeof obj === 'object' && obj && obj.hasOwnProperty('parameterName')) {
        console.warn('[skillprintShim] Flanker Task has no adjustable parameters; ignoring', obj.parameterName);
    }
};

window.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'ADJUST_GAME') window.adjustGame(event.data.data);
});

// Forward keydown events to the parent window for the GameAdjustmentTester
window.addEventListener('keydown', function (event) {
    if (/^[1-9]$/.test(event.key)) {
        window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
    }
}, true);
