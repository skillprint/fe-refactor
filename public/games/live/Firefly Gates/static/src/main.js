// Firefly Gates: the loop that flies the swarm down the path, does its sums
// at every gate, and wakes (or doesn't) the beacon at the end.
//
// The simulation runs in fixed 1/60 s steps, so a test can drive it with
// __firefliesControls.step(ms) however the browser throttles frames.

import * as THREE from 'three';
import { World, PATH_HALF } from './world.js';
import { Swarm, radiusFor } from './swarm.js';
import { Gates, laneCenters, laneOf } from './gates.js';
import { Moths } from './moths.js';
import { Beacon } from './beacon.js';
import { Sound } from './sound.js';
import { UI } from './ui.js';
import { buildStage, apply, label, looks } from './stage.js';
import { fontsReady } from './labels.js';
import { Rng, clamp, lerp, smooth, damp } from './rng.js';
import { tuning, onParameter } from './params.js';
import { Skillprint, GameEvent } from './skillprint.js';

const KEY = 'firefly-gates/v1';
const STEP = 1 / 60;
const SPEED = 9.5;          // world units a second at runSpeed 1
const FIRST_ROW = 40;       // from a stage's start to its first row
const ROW_GAP = 33;         // between rows: ~3.5 s at runSpeed 1
const BEACON_AFTER = 34;    // from the last row to the beacon
const STOP_BEFORE = 11;     // where the swarm halts in front of the beacon
const READ = 36;            // a row counts as "seen" from this far off
const XMAX = PATH_HALF - 0.35;
const FOLLOW = 0.32;        // how much the camera follows the swarm sideways
const BACK = 10;            // how far behind the swarm the camera rides
const NAMES = ['The Mossgate', 'Fern Stair', 'Owl Hollow', 'The Lantern Road', 'Bramble Reach', 'Stillwater Bend', 'The Old Oaks', 'Glowcap Glade', 'Willow Turn', 'Hartsfoot Ride', 'The Hush', 'Starfall Clearing'];
const EMBER = [1.8, 0.55, 0.2];

const defaults = { best: 0, lit: 0, muted: false };
function load() {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return { ...defaults }; }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(store)); } catch { /* private mode */ }
}

const store = load();
const rng = new Rng((Math.random() * 2 ** 31) | 0);
const canvas = document.getElementById('scene');

let world;
try {
  world = new World(canvas);
} catch (e) {
  document.getElementById('nogl').hidden = false;
  throw e;
}
const swarm = new Swarm(world.scene);
const gates = new Gates(world.scene);
const moths = new Moths(world.scene);
const ui = new UI();
const sound = new Sound();
sound.muted = store.muted;
const skillprint = new Skillprint({ canvas, describe });
skillprint.onPause = setPaused;

const S = {
  mode: 'boot',
  t: 0,            // simulation time, seconds
  vt: 0,           // visual time; runs on while paused
  acc: 0,
  paused: false,
  s: 0,            // distance flown down the path
  x: 0,
  targetX: 0,
  lift: 0,
  squeeze: 1,
  count: 0,
  score: 0,        // banked from finished stages
  stagePts: 0,
  stageNo: 0,
  lit: 0,          // beacons lit this session: the rung ladder climbs with these
  stage: null,
  rows: [],
  rowIdx: 0,
  gaps: [],
  beacon: null,
  oldBeacon: null,
  arriveT: 0,
  outcome: null,
  optimal: 0,
  mothHits: 0,
  aurora: 0,
  auroraGoal: 0,
  autopilot: null,
};
const keys = { left: false, right: false, since: 0 };
const cam = { pos: new THREE.Vector3(0, 3.4, 9), look: new THREE.Vector3(0, 2, -20) };
const tmp = new THREE.Vector3();

// ---------------------------------------------------------------------------

const rungNow = () => Math.max(1, S.lit + 1 + tuning.levelOffset);
const runningScore = () => S.score + S.stagePts;

function newStage() {
  const s0 = S.s;
  const rung = rungNow();
  const seed = rng.int(1, 2 ** 31 - 1);
  const stage = buildStage({ rung, seed, numberScale: tuning.numberScale, gateTrickiness: tuning.gateTrickiness, beaconStrictness: tuning.beaconStrictness });
  S.stageNo += 1;
  S.stage = stage;
  stage.name = NAMES[(S.stageNo - 1) % NAMES.length];
  const rowS = stage.rows.map((_, i) => s0 + FIRST_ROW + i * ROW_GAP);
  const beaconS = rowS[rowS.length - 1] + BEACON_AFTER;
  stage.stopS = beaconS - STOP_BEFORE;
  S.rows = gates.build(stage, rowS.map((s) => -s)).map((r, i) => ({ ...r, data: stage.rows[i], seenAt: null, lane: null, laneAt: null }));
  S.rowIdx = 0;
  // Moths live in the gaps, clear of the gates either side.
  S.gaps = rowS.map((s, i) => ({ from: s + 9, to: (i + 1 < rowS.length ? rowS[i + 1] : beaconS - 8) - 10, spawned: false }));
  if (S.beacon && S.outcome?.lost) {
    // Never reached: it would stand in the middle of the new stage's rows.
    S.beacon.dispose();
  } else if (S.beacon) {
    S.oldBeacon?.dispose();
    S.oldBeacon = S.beacon;
    S.oldBeacon.retire();
  }
  S.beacon = new Beacon(world.scene, -beaconS, stage.beacon);
  S.count = stage.start;
  S.stagePts = 0;
  S.optimal = 0;
  S.mothHits = 0;
  S.outcome = null;
  world.setNight(Math.min(1, (S.stageNo - 1) * 0.14));
  console.info(`[fireflies] stage ${S.stageNo} (rung ${rung}): ${stage.start} → best ${stage.best}, beacon ${stage.beacon}, ${stage.rows.length} rows: ${stage.rows.map((r) => r.gates.map(label).join('|')).join('  ')}`);
}

function startStage() {
  // After a beacon, the fireflies stream back out of its lantern; after a
  // swarm burnt out on the way, a new one gathers where it fell.
  const from = S.beacon && !S.outcome?.lost ? S.beacon.mouth : null;
  const fresh = Boolean(S.outcome?.lost);
  newStage();
  const st = S.stage;
  swarm.mode = 'swarm';
  swarm.showLabel = true;
  if (from || fresh) {
    if (from) swarm.center.copy(from);
    swarm.reset(st.start);
  } else {
    swarm.setCount(st.start, { quiet: true });
  }
  S.mode = 'run';
  ui.hud(true);
  ui.setStage({ stage: S.stageNo, rung: st.rung, name: st.name, need: st.beacon, rows: st.rows.length });
  ui.setScore(runningScore());
  ui.showFinishRun(skillprint.reporting);
  ui.toast(`<span class="eyebrow">Stage ${S.stageNo}</span><b>${st.name}</b><span>Wake a beacon of <em>${st.beacon}</em>. You start with ${st.start}.</span>`, 3800);
  if (S.stageNo === 1) ui.hint(true);
  skillprint.event(GameEvent.LEVEL_START, {
    stage: S.stageNo, rung: st.rung, rows: st.rows.length, gatesPerRow: st.gatesPerRow, start: st.start, beacon: st.beacon, best: st.best,
    numberScale: tuning.numberScale, gateTrickiness: tuning.gateTrickiness, beaconStrictness: tuning.beaconStrictness, runSpeed: tuning.runSpeed, hazardDensity: tuning.hazardDensity,
  });
  report();
}

// ---------------------------------------------------------------------------

function report() {
  skillprint.state({
    score: runningScore(), isGameOver: false, mode: S.mode, stage: S.stageNo, rung: S.stage?.rung,
    swarm: S.count, beacon: S.stage?.beacon, row: S.rowIdx, rows: S.rows.length, lit: S.lit,
  });
  ui.setScore(runningScore());
}

function describe() {
  if (!S.stage || S.mode === 'title' || S.mode === 'boot') return ['Firefly Gates · title screen'];
  const st = S.stage;
  const lines = [`Stage ${S.stageNo} · rung ${st.rung} · score ${runningScore()}`];
  if (S.mode === 'run') {
    lines.push(`Swarm ${S.count} · beacon needs ${st.beacon}${S.paused ? ' · paused' : ''}`);
    const row = S.rows[S.rowIdx];
    lines.push(row ? `Row ${S.rowIdx + 1} of ${S.rows.length}: ${row.gates.map((g) => g.label).join('  |  ')}` : 'Beacon ahead');
  } else {
    const lit = S.outcome?.lit;
    lines.push(`Brought ${S.count} · beacon needs ${st.beacon}${S.outcome ? (lit ? ' · lit' : ' · dark') : ''}`);
    lines.push(`Best gates ${S.optimal} of ${S.rowIdx} · best possible ${st.best}`);
  }
  return lines;
}

// ---------------------------------------------------------------------------
// The simulation.

function simStep(dt) {
  S.t += dt;
  if (S.mode === 'title') {
    S.s += 1.4 * dt;
    S.x = Math.sin(S.t * 0.4) * 1.2;
  } else if (S.mode === 'run') {
    runStep(dt);
  } else if (S.mode === 'arrive') {
    arriveStep(dt);
  }
  // Up and over the last stage's beacon, which stands in the path.
  const over = S.mode === 'run' && [S.beacon, S.oldBeacon].find((b) => b && Math.abs(-b.z - S.s) < 9);
  const liftGoal = over ? 6.8 * Math.sin(Math.PI * clamp((S.s - (-over.z - 9)) / 18, 0, 1)) : 0;
  S.lift = damp(S.lift, liftGoal, 6, dt);
}

function runStep(dt) {
  if (S.autopilot) autopilot();
  // A tap hops a lane (see hop); held past a moment, the swarm glides.
  const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
  if (dir && performance.now() - keys.since > 220) S.targetX = clamp(S.targetX + dir * 9 * dt, -XMAX, XMAX);

  const row = S.rows[S.rowIdx];
  let desire = S.targetX, squeeze = 1;
  if (row) {
    const g = row.gates.length;
    const ahead = -row.z - S.s;
    if (row.seenAt == null && ahead < READ) {
      row.seenAt = S.t;
      row.lane = laneOf(g, S.x);
      row.laneAt = S.t;
    }
    // Near a row the swarm settles into the lane it's in and draws itself
    // in to fit the arch.
    const w = smooth(clamp(1 - (ahead - 1) / 8, 0, 1));
    if (w > 0) {
      const lane = laneOf(g, S.targetX);
      desire = lerp(S.targetX, laneCenters(g)[lane], w * 0.85);
      squeeze = lerp(1, Math.min(1, ((PATH_HALF * 2) / g) * 0.3 / radiusFor(S.count)), w);
    }
    if (row.seenAt != null) {
      const lane = laneOf(g, S.x);
      if (lane !== row.lane) { row.lane = lane; row.laneAt = S.t; }
    }
  }
  S.squeeze = damp(S.squeeze, squeeze, 8, dt);
  S.x = damp(S.x, desire, 7, dt);

  const toStop = S.stage.stopS - S.s;
  const ease = clamp(toStop / 16, 0.12, 1);
  S.s = Math.min(S.stage.stopS, S.s + SPEED * tuning.runSpeed * ease * dt);

  if (row && S.s >= -row.z) cross(row);
  mothStep();
  if (S.mode === 'run' && S.s >= S.stage.stopS - 0.01) arrive();
}

function cross(row) {
  const g = row.gates.length;
  const i = laneOf(g, S.x);
  const before = S.count;
  const results = row.data.gates.map((gate) => apply(gate, before));
  const after = results[i];
  const best = Math.max(...results);
  const optimal = after === best;
  // Did the bigger-looking number lie, for the swarm the player actually had?
  const lk = row.data.gates.map(looks);
  const trap = results[lk.indexOf(Math.max(...lk))] !== best;
  const r = S.rowIdx;
  S.rowIdx += 1;
  S.count = after;
  gates.pass(r, i);
  const gate = row.gates[i];
  swarm.setCount(after, { emberColor: EMBER });
  swarm.float(gate.label, gate.color);
  const rgb = new THREE.Color(gate.color);
  swarm.embers.burst(gate.x, 1.75, row.z, optimal ? 40 : 18, [rgb.r * 2.5, rgb.g * 2.5, rgb.b * 2.5], 3.2, 0.8);
  sound.gate(optimal, before ? after / before : 1);
  if (after < before) sound.fizz(Math.min(1, (before - after) / before));
  if (optimal) { S.optimal += 1; S.stagePts += 25; }
  ui.pip(r, optimal ? 'best' : 'worse');
  if (r === 0) ui.hint(false);

  const seenMs = row.seenAt == null ? 0 : Math.round((S.t - row.seenAt) * 1000);
  skillprint.event(optimal ? GameEvent.MATCH : GameEvent.UNMATCH, {
    stage: S.stageNo, row: r + 1, before, after, chosen: gate.label,
    others: row.gates.filter((_, k) => k !== i).map((x) => x.label),
    otherResults: results.filter((_, k) => k !== i),
    best, lost: best - after, trap,
    decisionMs: row.laneAt == null ? 0 : Math.round((row.laneAt - row.seenAt) * 1000),
    timeAvailableMs: seenMs,
  });
  report();
  if (after <= 0) lose('swarm-lost');
}

function mothStep() {
  const st = S.stage;
  for (const gap of S.gaps) {
    if (gap.spawned || S.s < gap.from - 64) continue;
    gap.spawned = true;
    const n = Math.floor(tuning.hazardDensity + rng.next());
    for (let k = 0; k < n; k++) {
      moths.spawn({
        x: rng.range(-XMAX, XMAX),
        z: -rng.range(gap.from, Math.max(gap.from + 1, gap.to)),
        amp: rng.range(0.5, 1.1 + 0.12 * Math.min(st.rung, 6)),
        freq: rng.range(0.5, 1.2),
        phase: rng.range(0, Math.PI * 2),
      });
    }
  }
  const c = { x: S.x, y: 1.6 + S.lift, z: -S.s };
  for (const _ of moths.hits(S.t, c, radiusFor(S.count) * S.squeeze)) {
    // A bite is sized against the stage's best finish, not the swarm in hand:
    // 7 lost from 72 before a "−42" gate would be a quarter of the finish.
    const before = S.count;
    const lost = clamp(Math.round(st.best * rng.range(0.03, 0.08)), 1, Math.ceil(before / 2));
    S.count = before - lost;
    S.mothHits += 1;
    swarm.setCount(S.count, { emberColor: [1.2, 0.35, 1.6] });
    swarm.float(`−${lost}`, '#d58cff');
    sound.moth();
    skillprint.event(GameEvent.GENERIC_NEGATIVE, { stage: S.stageNo, cause: 'moth', before, lost, after: S.count, row: S.rowIdx });
    report();
    if (S.count <= 0) return lose('swarm-lost');
  }
}

function arrive() {
  S.mode = 'arrive';
  S.arriveT = 0;
  swarm.pour(S.beacon.mouth);
  S.beacon.showFill(0);
  ui.hint(false);
}

function arriveStep(dt) {
  S.arriveT += dt;
  const need = S.stage.beacon;
  if (!S.outcome) {
    S.beacon.showFill(Math.round(S.count * smooth(clamp(S.arriveT / 2.3, 0, 1))));
    if (S.arriveT >= 2.5) settle(S.count >= need);
  } else if (S.arriveT >= S.outcome.at + 1.8 && !S.outcome.shown) {
    S.outcome.shown = true;
    showResult();
  }
}

function settle(lit) {
  const st = S.stage;
  const flawless = S.optimal === st.rows.length && S.mothHits === 0;
  const pts = { gates: S.stagePts, beacon: 0, light: 0, flawless: 0 };
  if (lit) {
    pts.beacon = 100 + 25 * st.rung;
    pts.light = Math.round(100 * Math.min(1, S.count / st.best));
    pts.flawless = flawless ? 100 : 0;
    S.beacon.wake();
    swarm.column();
    S.auroraGoal = 1;
    sound.lit();
    S.lit += 1;
    store.lit += 1;
  } else {
    S.beacon.fizzle();
    swarm.scatter();
    sound.cold();
  }
  const total = pts.gates + pts.beacon + pts.light + pts.flawless;
  S.stagePts = total;
  S.outcome = { lit, at: S.arriveT, pts, total, flawless, shown: false };
  S.beacon.showFill(S.count);
  ui.beacon(lit ? 'lit' : 'cold');
  const outcome = { stage: S.stageNo, rung: st.rung, final: S.count, beacon: st.beacon, best: st.best, optimalGates: S.optimal, rows: st.rows.length, mothHits: S.mothHits, points: total };
  S.score += total;
  S.stagePts = 0;
  store.best = Math.max(store.best, S.score);
  save();
  skillprint.event(lit ? GameEvent.LEVEL_COMPLETE : GameEvent.LEVEL_FAILED, { ...outcome, score: S.score, reason: lit ? undefined : 'beacon' });
  report();
}

// The swarm burnt out before the beacon.
function lose(reason) {
  if (S.mode !== 'run') return;
  S.mode = 'arrive';
  S.arriveT = 0;
  swarm.scatter();
  sound.cold();
  const st = S.stage;
  const total = S.stagePts;
  S.outcome = { lit: false, lost: true, at: 0, pts: { gates: total, beacon: 0, light: 0, flawless: 0 }, total, shown: false };
  S.score += total;
  S.stagePts = 0;
  store.best = Math.max(store.best, S.score);
  save();
  skillprint.event(GameEvent.LEVEL_FAILED, { stage: S.stageNo, rung: st.rung, final: 0, beacon: st.beacon, best: st.best, optimalGates: S.optimal, rows: st.rows.length, rowReached: S.rowIdx, mothHits: S.mothHits, points: total, score: S.score, reason });
  report();
}

function showResult() {
  S.mode = 'result';
  const st = S.stage, o = S.outcome;
  const head = o.lit ? (o.flawless ? 'Not a firefly wasted.' : 'The beacon wakes.') : o.lost ? 'The swarm has gone out.' : 'The beacon stays dark.';
  const sub = o.lost
    ? `Every last firefly burnt out at row ${S.rowIdx} of ${st.rows.length}.`
    : `You brought ${S.count.toLocaleString()}. It needed ${st.beacon.toLocaleString()}.`;
  const facts = [
    ['Best gates', `${S.optimal} of ${S.rowIdx}`],
    ['Moths', String(S.mothHits)],
    ['Best possible', st.best.toLocaleString()],
  ];
  const parts = [`gates ${o.pts.gates}`];
  if (o.pts.beacon) parts.push(`beacon ${o.pts.beacon}`);
  if (o.pts.light) parts.push(`light ${o.pts.light}`);
  if (o.pts.flawless) parts.push(`flawless ${o.pts.flawless}`);
  ui.showResult({
    head, sub, facts,
    score: `${parts.join(' + ')} = ${o.total}   ·   total ${S.score.toLocaleString()}`,
    next: o.lit ? 'Onward' : 'Try another',
    finish: skillprint.reporting,
  });
  report();
}

function next() {
  if (S.mode !== 'result') return;
  ui.hideResult();
  S.auroraGoal = 0;
  startStage();
}

function finish() {
  if (S.mode === 'done' || S.mode === 'title' || S.mode === 'boot') return;
  if (S.mode === 'run') {
    const st = S.stage;
    S.score += S.stagePts;
    skillprint.event(GameEvent.LEVEL_QUIT, { stage: S.stageNo, rung: st.rung, swarm: S.count, beacon: st.beacon, rowReached: S.rowIdx, points: S.stagePts, score: S.score });
    S.stagePts = 0;
  }
  S.mode = 'done';
  store.best = Math.max(store.best, S.score);
  save();
  skillprint.finish({ score: S.score, stages: S.stageNo, beaconsLit: S.lit });
  ui.hint(false);
  ui.showFinishRun(false);
  ui.showResult({
    head: 'The wood goes quiet.',
    sub: `${S.lit} beacon${S.lit === 1 ? '' : 's'} woken in ${S.stageNo} stage${S.stageNo === 1 ? '' : 's'}.`,
    facts: [['Score', S.score.toLocaleString()], ['Your best', store.best.toLocaleString()]],
    score: 'Thanks for flying.',
    next: null,
    finish: false,
  });
}

function setPaused(on) {
  if (S.paused === on) return;
  S.paused = on;
  skillprint.event(on ? GameEvent.GAME_PAUSE : GameEvent.GAME_RESUME, { stage: S.stageNo, mode: S.mode });
}

// For tests: aim at the best (or worst) gate of the next row, sidestepping moths.
function autopilot() {
  const row = S.rows[S.rowIdx];
  if (!row) return;
  const results = row.data.gates.map((g) => apply(g, S.count));
  const pick = S.autopilot === 'worst' ? results.indexOf(Math.min(...results)) : S.autopilot === 'random' ? row.pick ??= rng.int(0, results.length - 1) : results.indexOf(Math.max(...results));
  S.targetX = laneCenters(row.gates.length)[pick];
  const r = radiusFor(S.count) + 1.2;
  const rowAhead = -row.z - S.s;
  for (const m of moths.list) {
    const ahead = -m.z - S.s;
    if (m.hit || ahead < 0 || ahead > 14 || ahead > rowAhead) continue;
    const at = moths.where(m, S.t + ahead / (SPEED * tuning.runSpeed)).x;
    if (Math.abs(at - S.targetX) < r) S.targetX = clamp(at + (at > 0 ? -r - 0.4 : r + 0.4), -XMAX, XMAX);
  }
}

// ---------------------------------------------------------------------------
// Picture.

function frame(dt) {
  S.vt += dt;
  const z = -S.s;
  const p = world.portraitness;

  // The swarm itself.
  swarm.center.set(S.x, 1.6 + S.lift + Math.sin(S.vt * 1.3) * 0.12, z);
  if (S.mode === 'run' || S.mode === 'title') {
    swarm.radius = damp(swarm.radius, radiusFor(S.count), 4, dt);
    swarm.squeeze = S.squeeze;
  }
  swarm.update(dt);
  swarm.label.sprite.visible = swarm.label.sprite.visible && S.mode !== 'title';
  gates.update(S.s);
  moths.update(S.t, S.paused ? 0 : dt, z);
  S.beacon?.update(dt);
  S.oldBeacon?.update(dt);
  if (S.oldBeacon && -S.oldBeacon.z < S.s - 40) { S.oldBeacon.dispose(); S.oldBeacon = null; }
  S.aurora = damp(S.aurora, S.auroraGoal, S.auroraGoal ? 0.8 : 0.35, dt);
  world.setAurora(S.aurora);

  // The camera: low behind the swarm on the path, pulled back to watch the beacon.
  const goal = tmp;
  if ((S.mode === 'arrive' || S.mode === 'result' || S.mode === 'done') && S.beacon && !S.outcome?.lost) {
    const bz = S.beacon.z;
    goal.set(0, 5.2 + p * 2.5, bz + 19 + p * 9);
    cam.pos.lerp(goal, 1 - Math.exp(-dt * 1.6));
    cam.look.lerp(tmp.set(0, 4.6, bz), 1 - Math.exp(-dt * 2));
  } else {
    const back = BACK + p * 2;
    goal.set(S.x * FOLLOW, 5.1 + p * 1.4 + S.lift * 0.75, z + back);
    cam.pos.x = damp(cam.pos.x, goal.x, 4, dt);
    cam.pos.y = damp(cam.pos.y, goal.y, 4, dt);
    cam.pos.z = damp(cam.pos.z, goal.z, 6, dt);
    cam.look.set(S.x * (FOLLOW + 0.1), 0.9 + S.lift * 0.6, z - 17);
  }
  world.camera.position.copy(cam.pos);
  world.camera.lookAt(cam.look);
  world.update(Math.min(z, cam.pos.z - 10), dt);
  world.render();
  skillprint.frame(performance.now());
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.1, Math.max(0, (now - last) / 1000));
  last = now;
  if (!S.paused) {
    S.acc += dt;
    let n = 0;
    while (S.acc >= STEP && n++ < 8) { simStep(STEP); S.acc -= STEP; }
    if (n >= 8) S.acc = 0;
  }
  frame(dt);
  requestAnimationFrame(loop);
}

// ---------------------------------------------------------------------------
// Input.

function steerTo(clientX) {
  if (S.mode !== 'run') return;
  // Put the swarm under the pointer, allowing for the camera's own drift.
  const ndc = (clientX / innerWidth) * 2 - 1;
  const cam3 = world.camera;
  const hw = Math.tan(THREE.MathUtils.degToRad(cam3.fov) / 2) * cam3.aspect * (BACK + world.portraitness * 2);
  S.targetX = clamp((ndc * hw) / (1 - FOLLOW), -XMAX, XMAX);
}

canvas.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'mouse' || e.buttons) steerTo(e.clientX);
});
canvas.addEventListener('pointerdown', (e) => {
  sound.start();
  steerTo(e.clientX);
});

// One lane over, towards the next row's gate on that side.
function hop(dir) {
  if (S.mode !== 'run') return;
  const g = S.rows[S.rowIdx]?.gates.length ?? 2;
  const lane = clamp(laneOf(g, S.targetX) + dir, 0, g - 1);
  S.targetX = laneCenters(g)[lane];
}

window.addEventListener('keydown', (e) => {
  const k = e.key;
  const left = k === 'ArrowLeft' || k === 'a' || k === 'A', right = k === 'ArrowRight' || k === 'd' || k === 'D';
  if (left || right) {
    e.preventDefault();
    if (!e.repeat) { keys.since = performance.now(); hop(left ? -1 : 1); }
    keys.left ||= left;
    keys.right ||= right;
  }
  else if (k === 'Enter' || k === ' ') {
    if (S.mode === 'title') { e.preventDefault(); begin(); }
    else if (S.mode === 'result') { e.preventDefault(); next(); }
  } else if (k === 'm' || k === 'M') muteBtn.click();
});
window.addEventListener('keyup', (e) => {
  const k = e.key;
  if (k === 'ArrowLeft' || k === 'a' || k === 'A') keys.left = false;
  if (k === 'ArrowRight' || k === 'd' || k === 'D') keys.right = false;
});
window.addEventListener('blur', () => { keys.left = keys.right = false; });
window.addEventListener('resize', () => world.resize());

function begin() {
  if (S.mode !== 'title') return;
  sound.start();
  skillprint.begin();
  skillprint.event(GameEvent.GAME_START, { best: store.best });
  ui.hideTitle();
  S.x = S.targetX = 0;
  startStage();
}

document.getElementById('begin').addEventListener('click', begin);
document.getElementById('next').addEventListener('click', next);
document.getElementById('finish').addEventListener('click', finish);
document.getElementById('finish-run').addEventListener('click', finish);
const muteBtn = document.getElementById('mute');
function syncMute() {
  muteBtn.setAttribute('aria-pressed', String(store.muted));
  muteBtn.setAttribute('aria-label', store.muted ? 'Sound off' : 'Sound on');
  muteBtn.classList.toggle('off', store.muted);
}
muteBtn.addEventListener('click', () => {
  store.muted = !store.muted;
  sound.start();
  sound.setMuted(store.muted);
  syncMute();
  save();
});
syncMute();

// runSpeed and hazardDensity are read live; the rest wait for the next stage.
onParameter((name, value) => {
  if (name === 'hazardDensity' && value === 0) {
    // No moths means none: clear the ones still ahead.
    for (let i = moths.list.length - 1; i >= 0; i--) if (moths.list[i].z < -S.s - 2 && !moths.list[i].hit) moths.remove(i);
  }
});

// ---------------------------------------------------------------------------
// Test hooks: `let` bindings in a module aren't window properties.

function snapshot() {
  const row = S.rows[S.rowIdx];
  return {
    mode: S.mode, stage: S.stageNo, rung: S.stage?.rung, count: S.count, beacon: S.stage?.beacon, best: S.stage?.best,
    row: S.rowIdx, rows: S.rows.length, next: row ? row.gates.map((g) => g.label) : null,
    x: +S.x.toFixed(2), s: +S.s.toFixed(1), score: runningScore(), lit: S.lit, optimal: S.optimal, mothHits: S.mothHits,
    moths: moths.list.length, outcome: S.outcome && { lit: S.outcome.lit, lost: !!S.outcome.lost, total: S.outcome.total }, paused: S.paused,
  };
}

window.__firefliesControls = {
  start: begin,
  next,
  finish,
  state: snapshot,
  stage: () => S.stage,
  steer(x) { S.targetX = clamp(x, -XMAX, XMAX); },
  lane(i) { const row = S.rows[S.rowIdx]; if (row) S.targetX = laneCenters(row.gates.length)[i]; },
  autopilot(mode) { S.autopilot = mode || null; },
  pause: setPaused,
  /** Advance the simulation by ms of game time (none while paused), then draw one frame. */
  step(ms = 1000 / 60) {
    let n = Math.round(ms / (1000 * STEP));
    while (n-- > 0 && !S.paused) simStep(STEP);
    frame(Math.min(0.1, ms / 1000));
    return snapshot();
  },
  /** Step until pred(state) holds, or maxMs of game time passes. */
  until(pred, maxMs = 60000) {
    for (let t = 0; t < maxMs && !S.paused; t += 100) {
      for (let k = 0; k < 6; k++) simStep(STEP);
      frame(0.1);
      if (pred(snapshot())) break;
    }
    frame(0.05);
    return snapshot();
  },
};

// ---------------------------------------------------------------------------

function boot() {
  S.mode = 'title';
  swarm.reset(24);
  swarm.showLabel = false;
  ui.showTitle(store.best ? `Your best ${store.best.toLocaleString()} · M for sound` : 'M for sound · ← → to steer');
  report();
  requestAnimationFrame(() => ui.veil(false));
}

fontsReady().then(() => {
  boot();
  requestAnimationFrame(loop);
});
