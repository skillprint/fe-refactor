// Space Trip parameter shim. Expects ../../_shared/skillprintC3.js, which owns
// the game clock, screenshots and input forwarding.
//
// Example adjustment format expected:
// {
// "parameterName": "fuelBurnMultiplier",
// "parameterValue": 0.8
// }
//
// - speedModifier (0.6-1.5, default 1): game clock. Obstacle speed, spawn
//   cadence and the astronaut's own movement all scale with it.
// - fuelBurnMultiplier (0.5-2, default 1): the event sheet takes 0.25 fuel per
//   tick, so a 120 Hz display burns it twice as fast. The shim re-bases the burn
//   to 15 units per second of game time (the 60 Hz rate: a full 896 tank lasts
//   about a minute at 1x), times this multiplier.
// - meteoriteDensity (0.25-1, default 1): share of spawned meteorites that are
//   kept. Planets and satellites are unaffected.

const PARAMS = {
    speedModifier: { min: 0.6, max: 1.5 },
    fuelBurnMultiplier: { min: 0.5, max: 2 },
    meteoriteDensity: { min: 0.25, max: 1 },
};

const FULL_TANK = 896;           // fuel set by a fuel booster
const SHEET_BURN_PER_TICK = 0.25;
const BASE_BURN_PER_SECOND = 15; // SHEET_BURN_PER_TICK at 60 ticks/s
const STATE_FLYING = 1;

const tuning = { fuelBurnMultiplier: 1, meteoriteDensity: 1 };

window.adjustGame = function (obj) {
    if (typeof obj === 'object' && obj.hasOwnProperty('parameterName')) {
        const { parameterName, parameterValue } = obj;
        const range = PARAMS[parameterName];
        const value = Number(parameterValue);
        if (!range || !Number.isFinite(value)) return;

        const clamped = Math.min(range.max, Math.max(range.min, value));
        if (parameterName === "speedModifier") {
            window.SkillprintC3.setSpeed(clamped);
        } else {
            tuning[parameterName] = clamped;
        }
    }
}

window.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'ADJUST_GAME') {
        window.adjustGame(event.data.data);
    }
});

function attach(runtime) {
    runtime.addEventListener('tick', function () {
        const player = runtime.objects.player.getFirstInstance();
        if (!player || runtime.globalVars.state !== STATE_FLYING) return;
        const fuel = player.instVars.fuel;
        // The sheet only burns between 1 and a full tank; mirror its condition.
        if (fuel < 1 || fuel > FULL_TANK) return;
        const burn = BASE_BURN_PER_SECOND * tuning.fuelBurnMultiplier * runtime.dt;
        player.instVars.fuel = Math.min(FULL_TANK, fuel + SHEET_BURN_PER_TICK - burn);
    });

    runtime.objects.meteorites.addEventListener('instancecreate', function (e) {
        if (Math.random() >= tuning.meteoriteDensity) e.instance.destroy();
    });
}

// main.js is a module, so the runtime appears after this classic script runs.
(function waitForRuntime() {
    const local = window.c3_runtimeInterface && window.c3_runtimeInterface._localRuntime;
    const runtime = local && local.GetIRuntime();
    if (runtime && runtime.objects && runtime.objects.player) {
        attach(runtime);
    } else {
        setTimeout(waitForRuntime, 100);
    }
})();
