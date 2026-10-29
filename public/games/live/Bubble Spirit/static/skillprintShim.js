// Bubble Spirit parameter shim.
//
// Example adjustment format expected:
// {
// "parameterName": "shotLimitScale",
// "parameterValue": 1.5
// }
//
// app.min.js (source in ../unminified/app.max.js) is a classic script, so its
// state is global: aLevelData (json/levelData.json's 50 levels), levelNum,
// bubblesToFire (shots left), launcher (the cannon, rebuilt each level) and
// _levelReset(), which sets up a level on start and restart. The shim rewrites
// the level data from a pristine copy and wraps _levelReset, so every knob
// holds across levels and restarts, and applies to the level in play too.
//
// - shotLimitScale (0.5-2, default 1): scales the shot limit of the levels
//   that have one (36 of 50; the rest are unlimited and stay so). In play,
//   the shots left change by the same amount as the limit (never below 1).
// - specialBubbleRate (0-2, default 1): scales each level's chance that the
//   next bubble is a special one (bomb or rainbow; 0-25% in most levels,
//   capped at 100%). Specials clear bubbles in bulk, so lower is harder.
// - aimGuide (0 or 1, default 1): 0 hides the dotted aiming line and its
//   bounce preview, so the player has to judge angles unaided.

const PARAMS = {
    shotLimitScale: { min: 0.5, max: 2 },
    specialBubbleRate: { min: 0, max: 2 },
    aimGuide: { min: 0, max: 1, integer: true },
};

const tuning = { shotLimitScale: 1, specialBubbleRate: 1, aimGuide: 1 };

let pristine = null; // [{bLimit, specialChance}] by level

function scaledLimit(i) {
    const base = pristine[i].bLimit;
    return base === 0 ? 0 : Math.max(5, Math.round(base * tuning.shotLimitScale));
}

function applyLevelData() {
    const levels = window.aLevelData;
    if (!Array.isArray(levels) || !levels.length) return false;
    if (!pristine) pristine = levels.map(l => ({ bLimit: l['@bLimit'], specialChance: l['@specialChance'] }));
    levels.forEach((l, i) => {
        l['@bLimit'] = scaledLimit(i);
        l['@specialChance'] = Math.min(100, pristine[i].specialChance * tuning.specialBubbleRate);
    });
    return true;
}

// The cannon's aimLineAlpha is set to 1 while the player drags; with the
// guide off it reads back 0, so the line and its bounce preview never draw.
function guardAimLine() {
    const l = window.launcher;
    if (!l || l.__skillprintGuarded) return;
    let alpha = l.aimLineAlpha;
    Object.defineProperty(l, 'aimLineAlpha', {
        get() { return tuning.aimGuide ? alpha : 0; },
        set(v) { alpha = v; },
        configurable: true,
    });
    l.__skillprintGuarded = true;
}

function apply(parameterName, previous) {
    if (!applyLevelData()) return; // the wrapped _levelReset applies it at the first level
    if (parameterName === 'shotLimitScale' && window.gameIsInPlay && typeof window.levelNum === 'number') {
        const i = window.levelNum;
        const base = pristine[i].bLimit;
        if (base !== 0) {
            const before = Math.max(5, Math.round(base * previous));
            window.bubblesToFire = Math.max(1, window.bubblesToFire + scaledLimit(i) - before);
        }
    }
    guardAimLine();
}

window.adjustGame = function (obj) {
    if (typeof obj === 'object' && obj && obj.hasOwnProperty('parameterName')) {
        const { parameterName, parameterValue } = obj;
        const range = PARAMS[parameterName];
        let value = Number(parameterValue);
        if (!range || !Number.isFinite(value)) {
            console.warn('[skillprintShim] Bubble Spirit: unknown parameter or value', parameterName, parameterValue);
            return;
        }
        value = Math.min(range.max, Math.max(range.min, value));
        if (range.integer) value = Math.round(value);
        const previous = tuning[parameterName];
        tuning[parameterName] = value;
        apply(parameterName, previous);
        console.log(`[skillprintShim] Bubble Spirit adjusted ${parameterName} to ${value}`);
    }
};

window.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'ADJUST_GAME') {
        window.adjustGame(event.data.data);
    }
});

// app.min.js loads after this script; wrap _levelReset once it exists. It
// reads the level data while it runs (shot limit, specials) and builds a new
// launcher, so the data goes in before it and the guard after.
(function waitForGame() {
    if (typeof window._levelReset === 'function') {
        const levelReset = window._levelReset;
        window._levelReset = function () {
            applyLevelData();
            const out = levelReset.apply(this, arguments);
            guardAimLine();
            return out;
        };
    } else {
        setTimeout(waitForGame, 100);
    }
})();

// Forward keydown events to the parent window for the GameAdjustmentTester
window.addEventListener('keydown', function (event) {
    if (/^[1-9]$/.test(event.key)) {
        console.log('[skillprintShim - Bubble Spirit] Key intercepted in iframe:', event.key);
        window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
    }
}, true); // Use capture phase to intercept before the game calls preventDefault()
