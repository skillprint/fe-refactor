// Skillprint difficulty knobs for Photo Hunt. Names match ../parameters.json,
// backend/game-scoring-config.json and GameAdjustmentTester's 'photo-hunt' keys.
// Each value is clamped to its range and takes effect immediately.
function skillprintGameScene() {
    return (window.SceneManager && typeof SceneManager.doRescaleTimer === 'function') ? SceneManager : null;
}

var SKILLPRINT_KNOBS = {
    // Time per puzzle as a multiple of the puzzle's own (120 s for every
    // puzzle today). The puzzle in play rescales too: its time left keeps
    // the same fraction of the clock.
    timeMultiplier: {
        min: 0.25, max: 2, integer: false,
        apply: function (v) {
            oCONFIG.timeMultiplier = v;
            var scene = skillprintGameScene();
            if (scene) { scene.doRescaleTimer(); }
        }
    },
    // Seconds taken off the clock by each wrong tap (0 = no penalty, the
    // game's default). Makes tapping at random costly.
    missPenaltySeconds: {
        min: 0, max: 10, integer: false,
        apply: function (v) { oCONFIG.missPenaltySeconds = v; }
    },
    // Wrong taps allowed within one second before the game locks taps for a
    // second ("TILT!"). The lockout fires on the (tiltMisses + 1)th quick miss.
    tiltMisses: {
        min: 1, max: 10, integer: true,
        apply: function (v) { oCONFIG.tilt_misses = v; }
    }
};

// Older configs used these names.
var SKILLPRINT_KNOB_ALIASES = { tilt_misses: 'tiltMisses' };

// seconds_on_clock was never read (every puzzle sets its own time); convert
// it to the equivalent multiplier of the current puzzle's time.
function skillprintConvertRetired(name, value) {
    if (name === 'seconds_on_clock') {
        var base = (typeof puzzle !== 'undefined' && puzzle && puzzle.time) ? puzzle.time : 120;
        console.warn('[skillprintShim - Photo Hunt] seconds_on_clock is retired; converting to timeMultiplier.');
        return { name: 'timeMultiplier', value: Number(value) / base };
    }
    if (name === 'tilt_seconds') {
        console.warn('[skillprintShim - Photo Hunt] tilt_seconds is retired (the tilt window stays 1 s); use tiltMisses or missPenaltySeconds.');
    }
    return null;
}

window.adjustGame = function (obj) {
    if (!obj || typeof obj !== 'object' || !obj.hasOwnProperty('parameterName')) {
        return;
    }
    var name = SKILLPRINT_KNOB_ALIASES[obj.parameterName] || obj.parameterName;
    var value = obj.parameterValue;
    var knob = SKILLPRINT_KNOBS[name];
    if (!knob) {
        var converted = skillprintConvertRetired(name, value);
        if (!converted) {
            if (name !== 'tilt_seconds') {
                console.warn('[skillprintShim - Photo Hunt] Unknown parameter ' + name);
            }
            return;
        }
        name = converted.name;
        value = converted.value;
        knob = SKILLPRINT_KNOBS[name];
    }
    value = Number(value);
    if (!isFinite(value)) {
        console.warn('[skillprintShim - Photo Hunt] Ignoring non-numeric ' + name + ': ' + obj.parameterValue);
        return;
    }
    value = Math.min(knob.max, Math.max(knob.min, value));
    if (knob.integer) {
        value = Math.round(value);
    }
    try {
        knob.apply(value);
        console.log('[skillprintShim - Photo Hunt] ' + name + ' = ' + value);
    } catch (e) {
        console.warn('[skillprintShim - Photo Hunt] Could not apply ' + name, e);
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
        console.log('[skillprintShim - Photo Hunt] Key intercepted in iframe:', event.key);
        window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
    }
}, true); // Use capture phase to intercept before the game calls preventDefault()
