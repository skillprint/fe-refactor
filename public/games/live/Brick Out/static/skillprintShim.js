// Skillprint difficulty knobs for Brick Out. Names match ../parameters.json,
// backend/game-scoring-config.json and GameAdjustmentTester's 'brick-out' keys.
// Each value is clamped to its range and takes effect immediately.
var SKILLPRINT_KNOBS = {
    // Base ball speed multiplier (1 = the game's normal speed). Applied to the
    // balls in play and kept through lost balls and new levels.
    ballSpeed: {
        min: 0.6, max: 1.6, integer: false,
        apply: function (v) {
            if (window.s_oGame && typeof s_oGame.setBallSpeed === 'function') {
                s_oGame.setBallSpeed(v);
            } else {
                // Not in a level yet: the next one starts at this speed.
                BALL_SPEED_RATE = v;
                MIN_VELOCITY_LIMIT = 0.5 * v;
                MAX_VELOCITY_LIMIT = 1.5 * v;
            }
        }
    },
    // Multiplies each level's power-up drop chance (0 = no power-ups).
    bonusDropRate: {
        min: 0, max: 2, integer: false,
        apply: function (v) { BONUS_DROP_RATE = v; }
    },
    // Most balls in play from the multi-ball power-up.
    maxBallSpawn: {
        min: 1, max: 6, integer: true,
        apply: function (v) { MAX_BALL_SPAWN = v; }
    }
};

// Older configs used these names.
var SKILLPRINT_KNOB_ALIASES = { MAX_BALL_SPAWN: 'maxBallSpawn' };
// Retired: they never changed difficulty (the velocity limits only bound the
// speed power-ups; TIME_BOUNCE_BALL is a collision debounce). Use ballSpeed.
var SKILLPRINT_RETIRED_KNOBS = [
    'MAX_VELOCITY_LIMIT', 'MIN_VELOCITY_LIMIT', 'TIME_BOUNCE_BALL',
    'maxVelocityLimit', 'minVelocityLimit', 'timeBounceBall'
];

window.adjustGame = function (obj) {
    if (!obj || typeof obj !== 'object' || !obj.hasOwnProperty('parameterName')) {
        return;
    }
    var name = SKILLPRINT_KNOB_ALIASES[obj.parameterName] || obj.parameterName;
    var knob = SKILLPRINT_KNOBS[name];
    if (!knob) {
        if (SKILLPRINT_RETIRED_KNOBS.indexOf(obj.parameterName) >= 0) {
            console.warn('[skillprintShim - Brick Out] ' + obj.parameterName + ' is retired; use ballSpeed, bonusDropRate or maxBallSpawn.');
        } else {
            console.warn('[skillprintShim - Brick Out] Unknown parameter ' + obj.parameterName);
        }
        return;
    }
    var value = Number(obj.parameterValue);
    if (!isFinite(value)) {
        console.warn('[skillprintShim - Brick Out] Ignoring non-numeric ' + name + ': ' + obj.parameterValue);
        return;
    }
    value = Math.min(knob.max, Math.max(knob.min, value));
    if (knob.integer) {
        value = Math.round(value);
    }
    try {
        knob.apply(value);
        console.log('[skillprintShim - Brick Out] ' + name + ' = ' + value);
    } catch (e) {
        console.warn('[skillprintShim - Brick Out] Could not apply ' + name, e);
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
        console.log('[skillprintShim - Brick Out] Key intercepted in iframe:', event.key);
        window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
    }
}, true); // Use capture phase to intercept before the game calls preventDefault()
