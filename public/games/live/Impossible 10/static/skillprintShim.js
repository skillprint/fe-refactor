// Impossible 10 parameter shim (Construct 3).
//
// Example adjustment format expected:
// {
// "parameterName": "spawnSpread",
// "parameterValue": 3
// }
//
// How the game deals numbers: each block's animation frame is its value minus
// one (frame 0 = "1", frame 9 = "10"). The board is 5x5. Start of layout
// (game start and every restart) sets each block to choose(0,0,1,2): values
// 1, 1, 2 or 3. When blocks merge and fall, the five launchers above the board
// spawn new ones with frame floor(random(maxBlock-4, maxBlock)), so a new
// block is one of the four values maxBlock-3 .. maxBlock, with value 1 for
// anything below (the frame clamps to 0). maxBlock starts at 3 and goes up by
// one whenever a merge makes a block above it. The run ends when no two
// neighbours match, and is won at 10.
//
// - spawnSpread (integer 2-6, default 4 = the game's own roll): how many
//   different values a new block can take. Other values re-roll each new
//   block one tick after it spawns, uniformly over the spawnSpread highest
//   values up to maxBlock (never below 1). Fewer values mean more matches.
// - startBoardSpread (integer 2-6, default 3 = the game's own board): the
//   starting board's values run from 1 to startBoardSpread, with 1 twice as
//   likely as each of the others (the game's own weighting). Applies from
//   the next game start or restart.

const PARAMS = {
    spawnSpread: { min: 2, max: 6, integer: true },
    startBoardSpread: { min: 2, max: 6, integer: true },
};

const GAME_SPAWN_SPREAD = 4;  // floor(random(maxBlock-4, maxBlock))
const GAME_BOARD_SPREAD = 3;  // choose(0,0,1,2)
const MAX_SPAWN_FRAME = 8;    // the game turns a spawned 10 into a 9
const tuning = { spawnSpread: GAME_SPAWN_SPREAD, startBoardSpread: GAME_BOARD_SPREAD };

let runtime = null;
const pending = new Set(); // blocks spawned this tick, re-rolled on the next

function randInt(lo, hi) { // inclusive
    return lo + Math.floor(Math.random() * (hi - lo + 1));
}

function spawnFrame() {
    const top = Math.min(MAX_SPAWN_FRAME, runtime.globalVars.maxBlock - 1);
    return randInt(Math.max(0, top - tuning.spawnSpread + 1), top);
}

function boardFrame() {
    const f = randInt(-1, tuning.startBoardSpread - 1); // -1 = the extra 1
    return Math.max(0, f);
}

function onTick() {
    if (!pending.size) return;
    if (tuning.spawnSpread !== GAME_SPAWN_SPREAD) {
        for (const block of pending) {
            try {
                block.animationFrame = spawnFrame();
            } catch (e) { // e.g. destroyed since it spawned
                console.warn('[skillprintShim] Impossible 10: spawn re-roll failed', e);
            }
        }
    }
    pending.clear();
}

// After the Game layout's own start-of-layout events, which dealt the board.
function onGameStart() {
    pending.clear(); // the board's own blocks, not spawns
    try {
        if (tuning.startBoardSpread === GAME_BOARD_SPREAD) return;
        for (const block of runtime.objects.block.instances()) block.animationFrame = boardFrame();
    } catch (e) {
        console.warn('[skillprintShim] Impossible 10: board re-roll failed', e);
    }
}

window.adjustGame = function (obj) {
    try {
        if (typeof obj === 'object' && obj && obj.hasOwnProperty('parameterName')) {
            const { parameterName, parameterValue } = obj;
            const range = PARAMS[parameterName];
            const value = Number(parameterValue);
            if (!range || !Number.isFinite(value)) {
                console.warn('[skillprintShim] Impossible 10: unknown parameter or value', parameterName, parameterValue);
                return;
            }
            tuning[parameterName] = Math.min(range.max, Math.max(range.min, Math.round(value)));
            console.log(`[skillprintShim] Impossible 10 adjusted ${parameterName} to ${tuning[parameterName]}`);
        }
    } catch (e) {
        console.warn('[skillprintShim] Impossible 10: adjustGame failed', e);
    }
};

window.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'ADJUST_GAME') {
        window.adjustGame(event.data.data);
    }
});

function attach(rt) {
    runtime = rt;
    const game = rt.getLayout('Game');
    rt.objects.block.addEventListener('instancecreate', e => {
        if (game === rt.layout) pending.add(e.instance);
    });
    rt.addEventListener('tick', onTick);
    game.addEventListener('afterlayoutstart', onGameStart);
}

// main.js is a module, so the runtime appears after this classic script runs.
// The game opens on its Loader and Main layouts, so this attaches before the
// first Game board is dealt.
(function waitForRuntime() {
    try {
        const local = window.c3_runtimeInterface && window.c3_runtimeInterface._localRuntime;
        const rt = local && local.GetIRuntime();
        if (rt && rt.objects && rt.objects.block && rt.getLayout) {
            attach(rt);
            return;
        }
    } catch (e) {
        console.warn('[skillprintShim] Impossible 10: attach failed', e);
        return;
    }
    setTimeout(waitForRuntime, 100);
})();

// Forward keydown events to the parent window for the GameAdjustmentTester
window.addEventListener('keydown', function (event) {
    if (/^[1-9]$/.test(event.key)) {
        console.log('[skillprintShim - Impossible 10] Key intercepted in iframe:', event.key);
        window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
    }
}, true); // Use capture phase to intercept before the game calls preventDefault()
