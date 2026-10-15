// Skillprint difficulty knobs for Box Tower. Names match ../parameters.json,
// backend/game-scoring-config.json and GameAdjustmentTester's 'box-tower' keys.
// Each value is clamped to its range and takes effect immediately; CGame
// re-applies them when a new game starts (it resets STACK_VELOCITY).
var SKILLPRINT_KNOBS = {
    // Pixels the moving box travels per frame (30 fps). 5 is the game's
    // default: about 4 s to cross the tower.
    stackVelocity: {
        min: 2, max: 20, integer: false,
        apply: function (v) { STACK_VELOCITY = v; }
    },
    // How far off (pixels) a drop can land and still count as perfect: the
    // box snaps into place instead of being cut. 1 is the game's default.
    perfectRange: {
        min: 0, max: 15, integer: false,
        apply: function (v) { PERFECT_RANGE = v; }
    }
};

var skillprintKnobValues = {};

window.skillprintReapplyKnobs = function () {
    for (var name in skillprintKnobValues) {
        SKILLPRINT_KNOBS[name].apply(skillprintKnobValues[name]);
    }
};

window.adjustGame = function (obj) {
    if (!obj || typeof obj !== 'object' || !obj.hasOwnProperty('parameterName')) {
        return;
    }
    var name = obj.parameterName;
    var knob = SKILLPRINT_KNOBS[name];
    if (!knob) {
        console.warn('[skillprintShim - Box Tower] Unknown parameter ' + name);
        return;
    }
    var value = Number(obj.parameterValue);
    if (!isFinite(value)) {
        console.warn('[skillprintShim - Box Tower] Ignoring non-numeric ' + name + ': ' + obj.parameterValue);
        return;
    }
    value = Math.min(knob.max, Math.max(knob.min, value));
    if (knob.integer) {
        value = Math.round(value);
    }
    try {
        knob.apply(value);
        skillprintKnobValues[name] = value;
        console.log('[skillprintShim - Box Tower] ' + name + ' = ' + value);
    } catch (e) {
        console.warn('[skillprintShim - Box Tower] Could not apply ' + name, e);
    }
};

window.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'ADJUST_GAME') {
        window.adjustGame(event.data.data);
    }
});

// Forward keydown events to the parent window for the GameAdjustmentTester
window.addEventListener('keydown', function (event) {
    if (/^[1-9]$/.test(event.key)) {
        console.log('[skillprintShim] Key intercepted in iframe:', event.key);
        window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
    }
}, true); // Use capture phase to intercept before the game calls preventDefault()

// The game is played by clicking or tapping, so forward pointer presses too:
// the AI Guide opens its session on the first skillprint_mousedown.
window.addEventListener('pointerdown', function () {
    window.parent.postMessage({ type: 'skillprint_mousedown' }, '*');
}, true);
