// Skillprint difficulty knobs for Change Word. Names match ../parameters.json,
// ../backend/game-scoring-config.json and GameAdjustmentTester's 'change-word' keys.
//
// The game has word-length tiers (words_arr: 3 to 6 letters), each with a
// time per word, a ramp (time taken off after each solved word) and hint
// counts. The knobs scale those tiers rather than flattening them, and take
// effect immediately. Values are clamped to each range.

// Each tier's own values, captured before any adjustment (this script loads
// after js/game.js).
var SKILLPRINT_BASE_TIERS = (window.words_arr || []).map(function (tier) {
    return { timer: tier.timer, ramp: tier.stage.timer };
});
var SKILLPRINT_TIME_MULTIPLIER = 1;

function skillprintSetTimeMultiplier(m) {
    var factor = m / SKILLPRINT_TIME_MULTIPLIER;
    words_arr.forEach(function (tier, i) {
        tier.timer = Math.round(SKILLPRINT_BASE_TIERS[i].timer * m);
    });
    // The current tier's time per word, keeping how far its ramp has gone.
    if (gameData.stage && gameData.stage.timer > 0) {
        gameData.stage.timer = Math.round(gameData.stage.timer * factor);
    }
    // The word in play: scale its countdown, and so the time left, while it runs.
    if (timeData.enable && timeData.countdown > 0) {
        timeData.countdown = Math.round(timeData.countdown * factor);
    }
    SKILLPRINT_TIME_MULTIPLIER = m;
}

function skillprintSetHints(n) {
    words_arr.forEach(function (tier) {
        tier.hint = n;
        tier.hintfull = n;
    });
    // The current stage's remaining hints, for both hint buttons.
    var resize = false;
    ['hint', 'hintfull'].forEach(function (type) {
        var button = $.letter && $.letter[type];
        if (!button) return;
        button.noti.text = n;
        if (n > 0 && gameData.hintArr && gameData.hintArr.indexOf(type) < 0) {
            gameData.hintArr.push(type);
            button.visible = true;
            resize = true;
        }
        toggleHintButton(type, n > 0);
    });
    if (resize && typeof resizeHintButton === 'function') resizeHintButton();
}

var SKILLPRINT_KNOBS = {
    // Time per word, as a multiple of each tier's own (30 s for 3 letters ...
    // 60 s for 6). Applies to the word in play and every later word.
    timeMultiplier: { min: 0.5, max: 2, integer: false, apply: skillprintSetTimeMultiplier },
    // How much time per word shrinks after each solved word, as a multiple of
    // each tier's own (3 s for 3 letters ... 1 s for 5-6). 0 = no squeeze.
    rampMultiplier: {
        min: 0, max: 2, integer: false,
        apply: function (m) {
            words_arr.forEach(function (tier, i) {
                tier.stage.timer = Math.round(SKILLPRINT_BASE_TIERS[i].ramp * m);
            });
        }
    },
    // Hints of each kind (replaceable letters, replacement letters) per tier,
    // and for the current one: refills or removes them now.
    hintsPerStage: { min: 0, max: 10, integer: true, apply: skillprintSetHints }
};

window.adjustGame = function (obj) {
    if (!obj || typeof obj !== 'object' || !obj.hasOwnProperty('parameterName')) {
        return;
    }
    var name = obj.parameterName;
    var value = Number(obj.parameterValue);
    // Older configs used `timer`: one time per word in ms for every tier.
    // Read it as a multiple of the current tier's own time.
    if (name === 'timer' && isFinite(value)) {
        var base = SKILLPRINT_BASE_TIERS[gameData.wordNum] || SKILLPRINT_BASE_TIERS[0];
        console.warn('[skillprintShim - Change Word] `timer` is retired; using timeMultiplier ' + (value / base.timer).toFixed(2));
        name = 'timeMultiplier';
        value = value / base.timer;
    }
    var knob = SKILLPRINT_KNOBS[name];
    if (!knob) {
        console.warn('[skillprintShim - Change Word] Unknown parameter ' + obj.parameterName);
        return;
    }
    if (!isFinite(value)) {
        console.warn('[skillprintShim - Change Word] Ignoring non-numeric ' + name + ': ' + obj.parameterValue);
        return;
    }
    value = Math.min(knob.max, Math.max(knob.min, value));
    if (knob.integer) value = Math.round(value);
    try {
        knob.apply(value);
        console.log('[skillprintShim - Change Word] ' + name + ' = ' + value);
    } catch (e) {
        console.warn('[skillprintShim - Change Word] Could not apply ' + name, e);
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
        console.log('[skillprintShim - Change Word] Key intercepted in iframe:', event.key);
        window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
    }
}, true); // Use capture phase to intercept before the game calls preventDefault()
