// Skillprint difficulty knobs for Match Doodle. Names match ../parameters.json,
// backend/game-scoring-config.json and GameAdjustmentTester's 'match-doodle' keys.
// Each value is clamped to its range and applied to the level in progress as
// well as every level after it.
function skillprintGameScene() {
    return (window.SceneManager && typeof SceneManager.doSetPairs === 'function') ? SceneManager : null;
}

var SKILLPRINT_KNOBS = {
    // Pairs in the heap. Replaces the built-in 5, 10, ... 40 progression; in a
    // level, pairs are dealt in or taken out of the heap (never the card on the
    // drop pad or one in the player's hand).
    pairs: {
        min: 2, max: 40, integer: true,
        apply: function (v) {
            oCONFIG.levels.forEach(function (level) { level.pairs = v; });
            var scene = skillprintGameScene();
            if (scene) { scene.doSetPairs(v); }
        }
    },
    // Heap radius multiplier (1 = the game's normal heap). Lower packs the
    // cards tighter, so more of them overlap.
    clusterSpread: {
        min: 0.5, max: 2, integer: false,
        apply: function (v) {
            var old = Number(oCONFIG.clusterSpread) || 1;
            oCONFIG.clusterSpread = v;
            var scene = skillprintGameScene();
            if (scene) { scene.doSetSpread(old, v); }
        }
    },
    // Largest tilt of a card in the heap, in degrees (0 = upright, 180 = any
    // orientation, the game's default).
    cardRotation: {
        min: 0, max: 180, integer: true,
        apply: function (v) {
            oCONFIG.cardRotation = v;
            var scene = skillprintGameScene();
            if (scene) { scene.doSetRotation(); }
        }
    }
};

window.adjustGame = function (obj) {
    if (!obj || typeof obj !== 'object' || !obj.hasOwnProperty('parameterName')) {
        return;
    }
    var name = obj.parameterName;
    var knob = SKILLPRINT_KNOBS[name];
    if (!knob) {
        console.warn('[skillprintShim - Match Doodle] Unknown parameter ' + name);
        return;
    }
    var value = Number(obj.parameterValue);
    if (!isFinite(value)) {
        console.warn('[skillprintShim - Match Doodle] Ignoring non-numeric ' + name + ': ' + obj.parameterValue);
        return;
    }
    value = Math.min(knob.max, Math.max(knob.min, value));
    if (knob.integer) {
        value = Math.round(value);
    }
    try {
        knob.apply(value);
        console.log('[skillprintShim - Match Doodle] ' + name + ' = ' + value);
    } catch (e) {
        console.warn('[skillprintShim - Match Doodle] Could not apply ' + name, e);
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
        console.log('[skillprintShim - Match Doodle] Key intercepted in iframe:', event.key);
        window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
    }
}, true); // Use capture phase to intercept before the game calls preventDefault()
