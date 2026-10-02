// Fruit Boom parameter shim. Expects ../../_shared/skillprintC3.js, which owns
// the game clock, screenshots and input forwarding.
//
// Example adjustment format expected:
// {
// "parameterName": "spawnIntervalMultiplier",
// "parameterValue": 1.5
// }
//
// - speedModifier (0.6-1.5, default 1): game clock. Fruit flight, gravity and
//   the spawn timer all scale with it.
// - spawnIntervalMultiplier (0.5-2, default 1): the sheet launches a fruit every
//   random(Spawn_Time, Spawn_Time + 0.5) seconds and steps Spawn_Time down with
//   the score (4s, then 2s at 10, 1s at 15, 0.5s at 30, 0.4s at 80). The shim
//   re-applies that ramp every tick, times this multiplier. Higher is calmer.
// - bombDensity (0-1, default 1): share of spawned bombs that are kept. Slashing
//   a bomb ends the run; missed fruit (3 allowed) still counts as before.

const PARAMS = {
    speedModifier: { min: 0.6, max: 1.5 },
    spawnIntervalMultiplier: { min: 0.5, max: 2 },
    bombDensity: { min: 0, max: 1 },
};

// [score, Spawn_Time] steps from evGame, highest first.
const SPAWN_RAMP = [[80, 0.4], [30, 0.5], [15, 1], [10, 2], [0, 4]];
const BOMB_FRAME = 12;

const tuning = { spawnIntervalMultiplier: 1, bombDensity: 1 };

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
    const seen = new WeakSet();

    runtime.addEventListener('tick', function () {
        if (!runtime.layout || runtime.layout.name !== 'Game') return;
        const vars = runtime.globalVars;
        const base = SPAWN_RAMP.find(([score]) => vars.Score >= score)[1];
        vars.Spawn_Time = base * tuning.spawnIntervalMultiplier;

        // Spawn_Fruit sets the frame after creating the instance, so bombs are
        // only recognisable from the next tick on.
        for (const fruit of runtime.objects.Fruit.instances()) {
            if (seen.has(fruit)) continue;
            seen.add(fruit);
            if (fruit.animationFrame === BOMB_FRAME && Math.random() >= tuning.bombDensity) {
                fruit.destroy();
            }
        }
    });
}

// main.js is a module, so the runtime appears after this classic script runs.
(function waitForRuntime() {
    const local = window.c3_runtimeInterface && window.c3_runtimeInterface._localRuntime;
    const runtime = local && local.GetIRuntime();
    if (runtime && runtime.objects && runtime.objects.Fruit) {
        attach(runtime);
    } else {
        setTimeout(waitForRuntime, 100);
    }
})();
