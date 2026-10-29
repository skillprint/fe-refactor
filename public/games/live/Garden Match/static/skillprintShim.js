// Garden Match parameter shim (Construct 3).
//
// Example adjustment format expected:
// {
// "parameterName": "moveBudgetMultiplier",
// "parameterValue": 1.5
// }
//
// Each of the 40 levels is static/level-N.json, which the game fetches with
// the AJAX plugin when GameScene starts (also on every restart) and loads into
// Construct arrays. Its third entry is the level's settings array
// (ArrayTemp2), which game_init reads into the globals:
//   At(0, 1..3) target fruit frames  -> the three goal fruits
//   At(1, 0..2) target counts        -> Target1..Target3
//   At(2, 0)    move budget          -> moves
//   At(3, 0)    colours in play      -> max_color (new tiles are frame
//                                       round(random(1, max_color)))
// The shim catches the game's JSON.parse of a level file (its only array whose
// first cell is "redfoc-sweetsaga") and rewrites the settings before the
// event sheet reads them, so the level starts with adjusted values.
//
// - moveBudgetMultiplier (0.5-2, default 1): scales the level's move budget.
//   Applies to the level in play at once (never below one move left) and to
//   every level started or restarted after.
// - targetMultiplier (0.5-1.5, default 1): scales the three goal counts
//   (never below 1). Applies from the next level started or restarted.
// - colorCount (4-6, default 6): most fruit colours on the board. The level's
//   own count (5 on levels 1-2, 6 after) is used when it is lower, so 6 is
//   the game as shipped. A goal fruit whose colour is cut is swapped for a
//   colour still in play, so the level stays winnable. Applies from the next
//   level started or restarted (cutting colours mid-level could strand a goal).

const PARAMS = {
    moveBudgetMultiplier: { min: 0.5, max: 2 },
    targetMultiplier: { min: 0.5, max: 1.5 },
    colorCount: { min: 4, max: 6, integer: true },
};

const tuning = { moveBudgetMultiplier: 1, targetMultiplier: 1, colorCount: 6 };

const LEVEL_MARKER = 'redfoc-sweetsaga';
let runtime = null;
let current = null; // the pristine settings of the level last loaded, and its number

const cell = (data, x, y) => data[x][y][0];
const setCell = (data, x, y, value) => { data[x][y][0] = String(value); };

function scaledMoves(base) {
    return Math.max(1, Math.round(base * tuning.moveBudgetMultiplier));
}

// settings: the parsed ArrayTemp2 c2array; pristine: its untouched values.
function rewrite(settings, pristine) {
    const data = settings.data;
    setCell(data, 2, 0, scaledMoves(pristine.moves));
    pristine.targets.forEach((t, i) => {
        if (t > 0) setCell(data, 1, i, Math.max(1, Math.round(t * tuning.targetMultiplier)));
    });
    const colors = Math.min(pristine.maxColor, tuning.colorCount);
    setCell(data, 3, 0, colors);
    // Goal fruits must be colours that still spawn: keep the ones in range,
    // move the rest to the lowest free colours.
    const frames = pristine.frames.slice();
    const used = new Set(frames.filter(f => f >= 1 && f <= colors));
    frames.forEach((f, i) => {
        if (f > colors) {
            let g = 1;
            while (used.has(g) && g < colors) g++;
            used.add(g);
            frames[i] = g;
        }
        setCell(data, 0, i + 1, frames[i]);
    });
}

function readPristine(data) {
    return {
        frames: [1, 2, 3].map(y => Number(cell(data, 0, y))),
        targets: [0, 1, 2].map(y => Number(cell(data, 1, y))),
        moves: Number(cell(data, 2, 0)),
        maxColor: Number(cell(data, 3, 0)),
    };
}

const realParse = JSON.parse;
JSON.parse = function (text, reviver) {
    const out = realParse.call(this, text, reviver);
    try {
        if (out && out.c2array && Array.isArray(out.data) && out.data[0] && out.data[0][0] &&
            out.data[0][0][0] === LEVEL_MARKER && out.data[2] && typeof out.data[2][0][0] === 'string') {
            const settings = realParse(out.data[2][0][0]);
            const pristine = readPristine(settings.data);
            if ([pristine.moves, pristine.maxColor].every(Number.isFinite)) {
                rewrite(settings, pristine);
                out.data[2][0][0] = JSON.stringify(settings);
                current = { pristine, level: runtime ? runtime.globalVars.cur_level : null };
            }
        }
    } catch (e) {
        console.warn('[skillprintShim] Garden Match: could not adjust level data', e);
    }
    return out;
};

function layoutName() {
    try { return runtime.layout.name; } catch (e) { return null; }
}

// Moves are the one knob safe to change mid-level: the game ends the level
// when cur_moves (moves used) reaches moves, so leave at least one move.
function applyMovesNow() {
    if (!runtime || !current || layoutName() !== 'GameScene') return;
    const g = runtime.globalVars;
    if (g.game_mode !== 'level' || (current.level !== null && current.level !== g.cur_level)) return;
    if (['gameover', 'no-moves', 'win', 'completed'].includes(g.state)) return;
    const moves = Math.max(g.cur_moves + 1, scaledMoves(current.pristine.moves));
    g.moves = moves;
    // game_init may not have read the settings yet.
    const settings = runtime.objects.ArrayTemp2 && runtime.objects.ArrayTemp2.getFirstInstance();
    if (settings) settings.setAt(String(moves), 2, 0, 0);
    const label = runtime.objects.MovesFont && runtime.objects.MovesFont.getFirstInstance();
    if (label) label.text = String(moves - g.cur_moves);
}

window.adjustGame = function (obj) {
    try {
        if (typeof obj === 'object' && obj && obj.hasOwnProperty('parameterName')) {
            const { parameterName, parameterValue } = obj;
            const range = PARAMS[parameterName];
            let value = Number(parameterValue);
            if (!range || !Number.isFinite(value)) {
                console.warn('[skillprintShim] Garden Match: unknown parameter or value', parameterName, parameterValue);
                return;
            }
            if (range.integer) value = Math.round(value);
            tuning[parameterName] = Math.min(range.max, Math.max(range.min, value));
            if (parameterName === 'moveBudgetMultiplier') applyMovesNow();
            const when = parameterName === 'moveBudgetMultiplier' ? 'now' : 'from the next level';
            console.log(`[skillprintShim] Garden Match adjusted ${parameterName} to ${tuning[parameterName]} (${when})`);
        }
    } catch (e) {
        console.warn('[skillprintShim] Garden Match: adjustment failed', e);
    }
};

window.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'ADJUST_GAME') {
        window.adjustGame(event.data.data);
    }
});

// main.js is a module, so the runtime appears after this classic script runs.
(function waitForRuntime() {
    const local = window.c3_runtimeInterface && window.c3_runtimeInterface._localRuntime;
    const rt = local && local.GetIRuntime();
    if (rt && rt.globalVars) {
        runtime = rt;
    } else {
        setTimeout(waitForRuntime, 100);
    }
})();

// Forward keydown events to the parent window for the GameAdjustmentTester
window.addEventListener('keydown', function (event) {
    if (/^[1-9]$/.test(event.key)) {
        console.log('[skillprintShim - Garden Match] Key intercepted in iframe:', event.key);
        window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
    }
}, true); // Use capture phase to intercept before the game calls preventDefault()
