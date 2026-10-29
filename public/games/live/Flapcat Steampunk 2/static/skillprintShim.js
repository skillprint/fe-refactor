// Flapcat Steampunk 2 parameter shim (Construct 3).
//
// Example adjustment format expected:
// {
// "parameterName": "gapSize",
// "parameterValue": 160
// }
//
// The walls come in pairs spawned from wall_create, an emitter that bobs up
// and down (Sine) off-screen to the right: wall_up above its top image point,
// wall_down below its bottom one, 200 px apart, with point_cat (the scoring
// sensor) between them. Walls, point_cat and the next spawn all scroll left
// with the `wall` family's Bullet behavior; a new pair spawns whenever a
// point_cat reaches wall_create_go, so pairs are a fixed distance apart.
//
// - wallSpeed (0.6-1.6, default 1): wall scroll speed as a multiple of the
//   game's 300 px/s. Pairs keep their spacing, so they also come more often.
//   Applies to the walls on screen immediately.
// - gapSize (140-320 px, default 200): opening between a pair. Applies to
//   pairs spawned from now on; the ones already on screen keep theirs.
// - gapVariation (0-1.5, default 1): how far the opening moves up and down
//   between pairs, as a multiple of the game's own: wall_create's Sine
//   magnitude, which the event sheet re-rolls (about 90-100 px) as it plays.
//   0 keeps every opening at the same height.

const PARAMS = {
    wallSpeed: { min: 0.6, max: 1.6 },
    gapSize: { min: 140, max: 320 },
    gapVariation: { min: 0, max: 1.5 },
};

const BASE_GAP = 200;          // wall_create's image points 1 and 2
const FALLBACK_SPEED = 300;    // the wall family's Bullet speed
const tuning = { wallSpeed: 1, gapSize: BASE_GAP, gapVariation: 1 };

let runtime = null;
let baseSpeed = FALLBACK_SPEED;
let gameMagnitude = null; // the event sheet's latest roll
let setMagnitude = null;  // what the shim last wrote

function wallInstances() {
    const types = ['wall_up', 'wall_down', 'point_cat'];
    return types.flatMap(name => Array.from(runtime.objects[name].instances()));
}

function applySpeed(inst) {
    inst.behaviors.Bullet.speed = baseSpeed * tuning.wallSpeed;
}

// Every tick: a magnitude the shim didn't write is a new roll from the event
// sheet (or a fresh emitter), so it becomes the base to scale.
function applyVariation() {
    const emitter = runtime.objects.wall_create.getFirstInstance();
    if (!emitter) return;
    const sine = emitter.behaviors.Sine;
    if (sine.magnitude !== setMagnitude) gameMagnitude = sine.magnitude;
    setMagnitude = gameMagnitude * tuning.gapVariation;
    sine.magnitude = setMagnitude;
}

function apply(parameterName) {
    if (!runtime) return; // attach() applies everything once the runtime is up
    if (parameterName === 'wallSpeed') wallInstances().forEach(applySpeed);
}

window.adjustGame = function (obj) {
    if (typeof obj === 'object' && obj && obj.hasOwnProperty('parameterName')) {
        const { parameterName, parameterValue } = obj;
        const range = PARAMS[parameterName];
        const value = Number(parameterValue);
        if (!range || !Number.isFinite(value)) {
            console.warn('[skillprintShim] Flapcat Steampunk 2: unknown parameter or value', parameterName, parameterValue);
            return;
        }
        tuning[parameterName] = Math.min(range.max, Math.max(range.min, value));
        apply(parameterName);
        console.log(`[skillprintShim] Flapcat Steampunk 2 adjusted ${parameterName} to ${tuning[parameterName]}`);
    }
};

window.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'ADJUST_GAME') {
        window.adjustGame(event.data.data);
    }
});

function attach(rt) {
    runtime = rt;
    const firstWall = rt.objects.wall_up.getFirstInstance();
    if (firstWall) baseSpeed = firstWall.behaviors.Bullet.speed;

    // Spawned at wall_create's image points, so the offset widens or narrows
    // the opening about its centre; point_cat stretches to fill it, so every
    // way through still scores.
    const half = () => (tuning.gapSize - BASE_GAP) / 2;
    rt.objects.wall_up.addEventListener('instancecreate', e => { e.instance.y -= half(); applySpeed(e.instance); });
    rt.objects.wall_down.addEventListener('instancecreate', e => { e.instance.y += half(); applySpeed(e.instance); });
    rt.objects.point_cat.addEventListener('instancecreate', e => { e.instance.height = tuning.gapSize; applySpeed(e.instance); });
    rt.addEventListener('tick', applyVariation);

    wallInstances().forEach(applySpeed);
}

// main.js is a module, so the runtime appears after this classic script runs.
(function waitForRuntime() {
    const local = window.c3_runtimeInterface && window.c3_runtimeInterface._localRuntime;
    const rt = local && local.GetIRuntime();
    if (rt && rt.objects && rt.objects.wall_up && rt.objects.wall_create) {
        attach(rt);
    } else {
        setTimeout(waitForRuntime, 100);
    }
})();

// Forward keydown events to the parent window for the GameAdjustmentTester
window.addEventListener('keydown', function (event) {
    if (/^[1-9]$/.test(event.key)) {
        console.log('[skillprintShim - Flapcat Steampunk 2] Key intercepted in iframe:', event.key);
        window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
    }
}, true); // Use capture phase to intercept before the game calls preventDefault()
