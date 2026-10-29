// Intercept Canvas WebGL context creation to force preserveDrawingBuffer: true.
// This is required to capture screenshots of the WebGL canvas asynchronously.
(function () {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, attributes) {
        if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') {
            attributes = attributes || {};
            if (attributes.preserveDrawingBuffer === undefined) {
                attributes.preserveDrawingBuffer = true;
            }
        }
        return originalGetContext.call(this, type, attributes);
    };
})();

// Cut The Rope parameter shim.
//
// Example adjustment format expected:
// {
// "parameterName": "gravity",
// "parameterValue": 1.5
// }
//
// ctrr.js (a Haxe export) keeps its classes inside a closure, so three marked
// one-line edits in it read globals this shim sets. They are read every
// physics step, so a change applies at once, in the level in play, and holds
// across restarts and levels (nothing in the game resets them).
//
// - gravity (0.5-2, default 1) -> window.__skillprintGravityScale. Multiplies
//   the gravity each rope point and candy feels (physics_ConstraintPoint.update),
//   and the lift of soap bubbles by the same amount so bubbles still float.
//   Higher = the candy falls and swings faster, so cuts must be timed more
//   precisely; lower = slower, floatier play with more time to react.
// - ropeElasticity (1-2, default 1) -> window.__skillprintRopeIterations, the
//   constraint-solver passes per rope per step (game_Bungee.update; the game
//   uses 30). Each +0.25 halves them: 1 = 30 (as shipped, ropes barely
//   stretch), 1.5 = 8, 2 = 2 (ropes stretch and bounce visibly). Values below
//   1 are not offered: at 30 passes the ropes already stretch < 1%.

const PARAMS = {
    gravity: { min: 0.5, max: 2 },
    ropeElasticity: { min: 1, max: 2 },
};

const tuning = { gravity: 1, ropeElasticity: 1 };

function apply() {
    window.__skillprintGravityScale = tuning.gravity;
    window.__skillprintRopeIterations = Math.max(1, Math.round(30 / Math.pow(2, (tuning.ropeElasticity - 1) * 4)));
}

window.adjustGame = function (obj) {
    try {
        if (typeof obj === 'object' && obj && obj.hasOwnProperty('parameterName')) {
            const { parameterName, parameterValue } = obj;
            const range = PARAMS[parameterName];
            let value = Number(parameterValue);
            if (!range || !Number.isFinite(value)) {
                console.warn('[skillprintShim] Cut The Rope: unknown parameter or value', parameterName, parameterValue);
                return;
            }
            value = Math.min(range.max, Math.max(range.min, value));
            tuning[parameterName] = value;
            apply();
            console.log(`[skillprintShim] Cut The Rope adjusted ${parameterName} to ${value}`);
        }
    } catch (e) {
        console.warn('[skillprintShim] Cut The Rope: adjustment failed', e);
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
        console.log('[skillprintShim - Cut The Rope] Key intercepted in iframe:', event.key);
        window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
    }
}, true); // Use capture phase to intercept before the game calls preventDefault()
