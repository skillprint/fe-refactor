// Mine Rusher parameter shim (Construct 3).
//
// Example adjustment format expected:
// {
// "parameterName": "speedMultiplier",
// "parameterValue": 1.3
// }
//
// How the game moves: once the first tap sets movON to 1, every tick the
// tiles, coins and start platform scroll down by ydecrease*dt and the ball
// rolls sideways by xdecrease*dt. Each tap flips the sign of xdecrease
// (xdecrease -= 2*xdecrease) and scores a point. Start of layout sets
// ydecrease = 187.5*0.7 = 131.25 px/s and xdecrease = 360*0.7 = 252 px/s, and
// nothing changes them during a run: the game has no speed-up of its own
// (GameSpeed grows every tick but is only read at start of layout, while it
// is still 0.7). Retry resets the globals and restarts the layout.
//
// - speedMultiplier (0.6-1.8, default 1): scrolling and rolling speed as a
//   multiple of the game's own. Both are scaled together, so the ball still
//   follows the diagonal tile path; xdecrease keeps its sign (direction).
//   Applies immediately, including mid-run.
// - speedRampPerTap (0-3, default 0 = the game's constant speed): adds a
//   speed-up the game doesn't have: each tap (turn) adds this percentage of
//   the game's own speed (times speedMultiplier), up to MAX_FACTOR times the
//   game's own speed. A change applies to the taps that follow, so the speed
//   never jumps; every run starts again from speedMultiplier.

const PARAMS = {
    speedMultiplier: { min: 0.6, max: 1.8 },
    speedRampPerTap: { min: 0, max: 3 },
};

const MAX_FACTOR = 2.5; // the ramp never takes the game past 2.5x its own speed
const tuning = { speedMultiplier: 1, speedRampPerTap: 0 };

let runtime = null;
// Per run: the game's own speeds (captured when movON turns 1, before the
// shim has written anything), taps, the speed-up they have added, and the
// ball's last direction.
let run = null;

function speedFactor() {
    const factor = tuning.speedMultiplier * (1 + run.ramp);
    return Math.max(tuning.speedMultiplier, Math.min(MAX_FACTOR, factor));
}

function onTick() {
    try {
        const g = runtime.globalVars;
        if (g.movON !== 1) { run = null; return; } // not started, or game over
        const sign = g.xdecrease < 0 ? -1 : 1;
        if (!run) {
            run = { baseY: g.ydecrease, baseX: Math.abs(g.xdecrease), taps: 0, ramp: 0, sign };
        } else if (sign !== run.sign) { // the game flips xdecrease on every tap
            run.taps++;
            run.ramp += tuning.speedRampPerTap / 100;
            run.sign = sign;
        }
        const f = speedFactor();
        g.ydecrease = run.baseY * f;
        g.xdecrease = sign * run.baseX * f;
    } catch (e) {
        console.warn('[skillprintShim] Mine Rusher: tick failed', e);
    }
}

window.adjustGame = function (obj) {
    try {
        if (typeof obj === 'object' && obj && obj.hasOwnProperty('parameterName')) {
            const { parameterName, parameterValue } = obj;
            const range = PARAMS[parameterName];
            const value = Number(parameterValue);
            if (!range || !Number.isFinite(value)) {
                console.warn('[skillprintShim] Mine Rusher: unknown parameter or value', parameterName, parameterValue);
                return;
            }
            tuning[parameterName] = Math.min(range.max, Math.max(range.min, value));
            console.log(`[skillprintShim] Mine Rusher adjusted ${parameterName} to ${tuning[parameterName]}`);
        }
    } catch (e) {
        console.warn('[skillprintShim] Mine Rusher: adjustGame failed', e);
    }
};

window.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'ADJUST_GAME') {
        window.adjustGame(event.data.data);
    }
});

// main.js is a module, so the runtime appears after this classic script runs.
// The tick listener reads the knobs every tick, so values set before the
// runtime exists apply as soon as it does.
(function waitForRuntime() {
    const local = window.c3_runtimeInterface && window.c3_runtimeInterface._localRuntime;
    const rt = local && local.GetIRuntime();
    if (rt && rt.globalVars && 'ydecrease' in rt.globalVars) {
        runtime = rt;
        rt.addEventListener('tick', onTick);
    } else {
        setTimeout(waitForRuntime, 100);
    }
})();

// Forward keydown events to the parent window for the GameAdjustmentTester
window.addEventListener('keydown', function (event) {
    if (/^[1-9]$/.test(event.key)) {
        console.log('[skillprintShim - Mine Rusher] Key intercepted in iframe:', event.key);
        window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
    }
}, true); // Use capture phase to intercept before the game calls preventDefault()
