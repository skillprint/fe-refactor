// Star Puzzles parameter shim.
//
// Example adjustment format expected:
// {
// "parameterName": "puzzleDifficulty",
// "parameterValue": 0.8
// }
//
// Star Puzzles is a one-stroke puzzle: draw over every line of a star figure
// without lifting the pointer or using a line twice. The 60 puzzles are the
// strings in oCONFIG.puzzles (config.js); level N plays puzzle N, parsed by
// GameManager.doGetPuzzle(N) (js/game/GameManager.js). GameScene.js has two
// one-line Skillprint hooks (search it for "Skillprint hook").
//
// - puzzleDifficulty (-1 to 1, default -1 = off): which puzzle each level
//   serves. Off keeps the game's own order. 0-1 is a quantile of edge count
//   (lines to draw, 4-16): the 60 puzzles are ranked by edge count, and the
//   level serves one of the 10 puzzles nearest rank q * 59, cycling through
//   those 10 as levels advance. 0 = 4-9 lines, 0.5 = 11-12, 1 = 13-16.
//   Applies from the next puzzle built (next level, or a level opened from the
//   menu); the puzzle in play and its retries stay as they are.
// - snapRadius (15-45 game units, default 30): how close the pointer must pass
//   to a star for the line to connect. Read on every frame of a drag
//   (GameScene doUpdate, hook line), so it applies immediately.
// - startHint (0 or 1, default 0): 1 rings the stars a solution has to start
//   from (the two stars with an odd number of lines). In the 20 puzzles where
//   every star has an even number of lines any star works, so none is ringed.
//   Applies to the level in play and every level after.

const PARAMS = {
    puzzleDifficulty: { min: -1, max: 1 },
    snapRadius: { min: 15, max: 45, integer: true },
    startHint: { min: 0, max: 1, integer: true },
};

const tuning = { puzzleDifficulty: -1, snapRadius: 30, startHint: 0 };

const WINDOW = 10; // puzzles per difficulty band

let ranked = null; // puzzle indices (0-based) sorted by edge count, then by position

function edgeCount(puzzleString) {
    const lines = (puzzleString.split('?')[1] || '').split('|');
    return lines.filter(l => l.split(',').length === 3).length;
}

function rankPuzzles() {
    if (ranked) return ranked;
    const puzzles = (window.oCONFIG && oCONFIG.puzzles) || [];
    const edges = puzzles.map(edgeCount);
    ranked = puzzles.map((_, i) => i).sort((a, b) => edges[a] - edges[b] || a - b);
    return ranked;
}

// Which puzzle (1-based) level `which` serves.
function servedPuzzle(which) {
    const q = tuning.puzzleDifficulty;
    if (q < 0) return which;
    const order = rankPuzzles();
    const n = order.length;
    if (!n) return which;
    const w = Math.min(WINDOW, n);
    const start = Math.min(n - w, Math.max(0, Math.round(q * (n - 1)) - Math.floor(w / 2)));
    const slot = ((Math.max(1, which) - 1) % w + w) % w;
    return order[start + slot] + 1;
}

function wrapGetPuzzle() {
    const gm = window.GameManager;
    if (!gm || typeof gm.doGetPuzzle !== 'function') return false;
    if (gm.doGetPuzzle.__skillprintWrapped) return true;
    const getPuzzle = gm.doGetPuzzle;
    const wrapped = function (which) {
        let served = which;
        try { served = servedPuzzle(which); } catch (e) { served = which; }
        const puzzle = getPuzzle.call(this, served);
        try { puzzle.skillprintPuzzle = served; } catch (e) {}
        return puzzle;
    };
    wrapped.__skillprintWrapped = true;
    gm.doGetPuzzle = wrapped;
    return true;
}

// startHint: GameScene's hook calls this with the level's display dots and
// the parsed puzzle each time it builds a level.
let current = null; // { dots, puzzle }

function applyHints() {
    if (!current || !window.createjs) return;
    const { dots, puzzle } = current;
    const degree = {};
    puzzle.lines.forEach(l => {
        degree[l.pt1] = (degree[l.pt1] || 0) + 1;
        degree[l.pt2] = (degree[l.pt2] || 0) + 1;
    });
    let stage = null;
    dots.forEach(dot => {
        if (dot.__skillprintHint) {
            dot.removeChild(dot.__skillprintHint);
            dot.__skillprintHint = null;
        }
        if (tuning.startHint && degree[dot.myid] % 2 === 1) {
            const ring = new createjs.Shape();
            ring.graphics.setStrokeStyle(4).beginStroke('rgba(255,221,0,0.95)').drawCircle(0, 0, 27);
            ring.mouseEnabled = false;
            dot.addChild(ring);
            dot.__skillprintHint = ring;
        }
        stage = stage || dot.stage;
    });
    if (stage) stage.needUpdate = true;
}

window.skillprintOnLevel = function (dots, puzzle) {
    try {
        current = { dots, puzzle };
        applyHints();
    } catch (e) {
        console.warn('[skillprintShim] Star Puzzles: start hint failed', e);
    }
};

window.skillprintSnapRadius = tuning.snapRadius;

function apply(parameterName) {
    if (parameterName === 'snapRadius') window.skillprintSnapRadius = tuning.snapRadius;
    if (parameterName === 'startHint') applyHints();
    if (parameterName === 'puzzleDifficulty') wrapGetPuzzle();
}

window.adjustGame = function (obj) {
    if (typeof obj === 'object' && obj && obj.hasOwnProperty('parameterName')) {
        const { parameterName, parameterValue } = obj;
        const range = PARAMS[parameterName];
        let value = Number(parameterValue);
        if (!range || !Number.isFinite(value)) {
            console.warn('[skillprintShim] Star Puzzles: unknown parameter or value', parameterName, parameterValue);
            return;
        }
        value = Math.min(range.max, Math.max(range.min, value));
        if (range.integer) value = Math.round(value);
        if (parameterName === 'puzzleDifficulty' && value < 0) value = -1; // any negative value = off
        tuning[parameterName] = value;
        try {
            apply(parameterName);
        } catch (e) {
            console.warn('[skillprintShim] Star Puzzles: could not apply', parameterName, e);
        }
        console.log(`[skillprintShim] Star Puzzles adjusted ${parameterName} to ${value}`);
    }
};

window.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'ADJUST_GAME') {
        window.adjustGame(event.data.data);
    }
});

// GameManager is created once the assets load (init.js); wrap its
// doGetPuzzle as soon as it exists so every level goes through the knob.
(function waitForGame() {
    if (!wrapGetPuzzle()) setTimeout(waitForGame, 100);
})();

// Forward keydown events to the parent window for the GameAdjustmentTester
window.addEventListener('keydown', function (event) {
    if (/^[1-9]$/.test(event.key)) {
        console.log('[skillprintShim - Star Puzzles] Key intercepted in iframe:', event.key);
        window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
    }
}, true); // Use capture phase to intercept before the game calls preventDefault()
