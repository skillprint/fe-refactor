// I Love Hue parameter shim (Construct 3).
//
// Example adjustment format expected:
// {
// "parameterName": "shuffleShare",
// "parameterValue": 0.5
// }
//
// Each of the 50 levels in game_data.json is a grid of colour tiles forming a
// gradient. Some tiles are fixed (marked with a dot); the game shuffles the
// rest (each map entry's realCoordinate -> swapCoordinate) and the player
// swaps them back. The game's scripts are bundled into c3runtime.js, but it
// keeps the parsed game_data.json objects and reads a level's map each time
// the level starts, so the shim captures that object as it is parsed and
// rewrites every level from a pristine copy whenever a knob changes. Changes
// apply from the next level started (or a restart), not to the board in play.
//
// - shuffleShare (0.25-1, default 1): share of a level's movable tiles that
//   start shuffled. The rest start in place and are pinned like the game's
//   own fixed tiles. The choice is seeded by the level number, so a level
//   looks the same each time at a given value.
// - colorContrast (0.5-1.5, default 1): scales each tile's colour difference
//   from the level's average colour. Lower values make neighbouring tiles
//   harder to tell apart.

const PARAMS = {
    shuffleShare: { min: 0.25, max: 1 },
    colorContrast: { min: 0.5, max: 1.5 },
};

const tuning = { shuffleShare: 1, colorContrast: 1 };

let levels = null;   // the game's own level objects
let pristine = null; // untouched copies, by index

const key = c => c.x + ',' + c.y;

function mulberry32(seed) {
    return function () {
        seed |= 0; seed = seed + 0x6D2B79F5 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

// The game's shuffle is a permutation of the movable tiles. Pinning tiles
// takes them out of its cycles (a -> b -> c -> a without b is a -> c -> a),
// so what's left is still a permutation. A tile left alone in its cycle is in
// place too, so it is pinned with the rest. Pinning can collapse short cycles,
// so the shim pins as many tiles as it can while at least the requested share
// (and never fewer than two tiles) stays shuffled.
function shuffledEntries(orig) {
    const movable = orig.map.filter(t => !t.data.isFixed);
    const target = new Map(movable.map(t => [key(t.realCoordinate), t.swapCoordinate]));
    const rng = mulberry32(orig.no * 9973 + 1);
    const order = movable.map(t => [rng(), key(t.realCoordinate)]).sort((a, b) => a[0] - b[0]).map(p => p[1]);
    const want = Math.max(2, Math.round(tuning.shuffleShare * movable.length));
    let pinCount = movable.length - want;

    while (pinCount >= 0) {
        const pinned = new Set(order.slice(0, pinCount));
        const next = new Map();
        for (const t of movable) {
            const from = key(t.realCoordinate);
            if (pinned.has(from)) continue;
            let to = target.get(from);
            while (pinned.has(key(to))) to = target.get(key(to));
            next.set(from, to);
        }
        const moved = [...next].filter(([from, to]) => from !== key(to)).length;
        if (moved >= want || pinCount === 0) return next;
        pinCount--;
    }
}

function rebuild(level, orig) {
    const n = orig.map.length;
    const mean = ['r', 'g', 'b'].map(ch => orig.map.reduce((s, t) => s + t.data.color[ch], 0) / n);
    const k = tuning.colorContrast;
    const next = tuning.shuffleShare < 1 ? shuffledEntries(orig) : null;

    orig.map.forEach((o, i) => {
        const t = level.map[i];
        const c = o.data.color;
        t.data.color = {
            r: Math.min(1, Math.max(0, mean[0] + k * (c.r - mean[0]))),
            g: Math.min(1, Math.max(0, mean[1] + k * (c.g - mean[1]))),
            b: Math.min(1, Math.max(0, mean[2] + k * (c.b - mean[2]))),
            a: c.a,
        };
        t.data.isFixed = o.data.isFixed;
        t.swapCoordinate = { x: o.swapCoordinate.x, y: o.swapCoordinate.y };
        if (next && !o.data.isFixed) {
            const to = next.get(key(o.realCoordinate));
            if (!to || key(to) === key(o.realCoordinate)) {
                t.data.isFixed = true;
                t.swapCoordinate = { x: o.realCoordinate.x, y: o.realCoordinate.y };
            } else {
                t.swapCoordinate = { x: to.x, y: to.y };
            }
        }
    });
}

function applyAll() {
    if (!levels) return; // the capture below applies everything once the data loads
    levels.forEach((level, i) => rebuild(level, pristine[i]));
}

// Catch the game's own parse of game_data.json (its only {levels: [...]}), so
// its level objects can be rewritten in place, then step out of the way.
const realParse = JSON.parse;
JSON.parse = function (text, reviver) {
    const out = realParse.call(this, text, reviver);
    if (!levels && out && Array.isArray(out.levels) && out.levels.length && out.levels[0].map && out.levels[0].grid) {
        JSON.parse = realParse;
        levels = out.levels;
        pristine = realParse(text).levels;
        applyAll();
    }
    return out;
};

window.adjustGame = function (obj) {
    if (typeof obj === 'object' && obj && obj.hasOwnProperty('parameterName')) {
        const { parameterName, parameterValue } = obj;
        const range = PARAMS[parameterName];
        const value = Number(parameterValue);
        if (!range || !Number.isFinite(value)) {
            console.warn('[skillprintShim] I Love Hue: unknown parameter or value', parameterName, parameterValue);
            return;
        }
        tuning[parameterName] = Math.min(range.max, Math.max(range.min, value));
        applyAll();
        console.log(`[skillprintShim] I Love Hue adjusted ${parameterName} to ${tuning[parameterName]} (from the next level)`);
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
        console.log('[skillprintShim - I Love Hue] Key intercepted in iframe:', event.key);
        window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
    }
}, true); // Use capture phase to intercept before the game calls preventDefault()
