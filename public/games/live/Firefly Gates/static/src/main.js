// Firefly Gates: the loop that flies the swarm down the path, does its sums
// at every gate, and wakes (or doesn't) the beacon at the end. Each stage is
// set in a realm; a lit beacon opens the way to the next in a flash of light.
// A first flight teaches the game by doing it.
//
// The simulation runs in fixed 1/60 s steps, so a test can drive it with
// __firefliesControls.step(ms) however the browser throttles frames.

import * as THREE from 'three';
import { World, PATH_HALF, path } from './world.js';
import { Swarm, radiusFor } from './swarm.js';
import { Gates, laneCenters, laneOf } from './gates.js';
import { Moths } from './moths.js';
import { Beacon } from './beacon.js';
import { Sound } from './sound.js';
import { UI } from './ui.js';
import { buildStage, apply, label, looks } from './stage.js';
import { REALMS, RealmBag, realmById } from './realms.js';
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
const EMBER = [1.8, 0.55, 0.2];
const TUT_SPEED = 0.62;     // the tutorial flies slower
const TUT_HOLD = 1.5;       // and all but stops this many seconds before each row
const TUT_STEPS = ['steer', 'first-row', 'trap-row', 'moth', 'beacon'];

const defaults = { best: 0, lit: 0, muted: false, tutored: false };
function load() {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return { ...defaults }; }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(store)); } catch { /* private mode */ }
}

const store = load();
const rng = new Rng((Math.random() * 2 ** 31) | 0);
const canvas = document.getElementById('scene');
// ?realm=<id> holds every stage (and the title) in one realm: for looking at them.
const forced = new URLSearchParams(location.search).get('realm');

let world;
try {
  world = new World(canvas);
} catch (e) {
  document.getElementById('nogl').hidden = false;
  throw e;
}
const swarm = new Swarm(world.scene, world.mirror);
const gates = new Gates(world.scene, world.mirror);
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
  x: 0,            // across the path, in its own frame
  targetX: 0,
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
  arriveT: 0,
  outcome: null,
  optimal: 0,
  mothHits: 0,
  aurora: 0,
  auroraGoal: 0,
  autopilot: null,
  force: REALMS.some((r) => r.id === forced) ? forced : null,
  bag: new RealmBag(rng, 'mossgate'),
  visits: {},
  dressed: { realm: null, bend: 0 },
  portal: null,    // the flash between realms: { t, swapped, action, warm }
  tut: null,       // the tutorial in progress
  didTutorial: false,
};
const keys = { left: false, right: false, since: 0 };
const cam = { pos: new THREE.Vector3(0, 3.4, 9), look: new THREE.Vector3(0, 2, -20) };
const tmp = new THREE.Vector3();
const tmp2 = new THREE.Vector3();

// ---------------------------------------------------------------------------
// Realms

/** Dress the world for a realm, unless it already is (and the path didn't bend). */
function dress(realm, seed, { jitter = true } = {}) {
  const bend = path.uniforms.uBend.value.x;
  if (!(world.realm === realm && bend === 0 && S.dressed.bend === 0)) {
    world.setRealm(realm, seed, { jitter });
  }
  S.dressed = { realm: realm.id, bend };
  moths.dress(realm.moth);
  swarm.dress(realm.fireflies, { mirrored: world.mirrored, shade: realm.shade || 0 });
}

/** Stage 1 is Mossgate; after that the bag deals. */
function nextRealm() {
  if (S.force) return realmById(S.force);
  if (S.stageNo === 0) return realmById('mossgate');
  return realmById(S.bag.next());
}

/** The flash between realms: half a second in, `action` under full light, then out. */
function portal(action, warm = true) {
  S.mode = 'portal';
  S.portal = { t: 0, swapped: false, action, warm };
}

// ---------------------------------------------------------------------------

const rungNow = () => Math.max(1, S.lit + 1 + tuning.levelOffset);
const runningScore = () => S.score + S.stagePts;

function newStage() {
  const s0 = S.s;
  const rung = rungNow();
  const seed = rng.int(1, 2 ** 31 - 1);
  const stage = buildStage({ rung, seed, numberScale: tuning.numberScale, gateTrickiness: tuning.gateTrickiness, beaconStrictness: tuning.beaconStrictness });
  const realm = nextRealm();
  S.stageNo += 1;
  S.stage = stage;
  stage.realm = realm.id;
  const visits = (S.visits[realm.id] = (S.visits[realm.id] || 0) + 1);
  stage.name = realm.places[(visits - 1) % realm.places.length];
  const rowS = stage.rows.map((_, i) => s0 + FIRST_ROW + i * ROW_GAP);
  const beaconS = rowS[rowS.length - 1] + BEACON_AFTER;
  stage.stopS = beaconS - STOP_BEFORE;

  // The path: straight through Mossgate, elsewhere a gentle seeded bend,
  // straight again at both ends.
  const prng = new Rng(seed ^ 0x5bd1e995);
  const bend = realm.bend ? realm.bend * prng.range(0.75, 1.1) * (prng.chance(0.5) ? -1 : 1) : 0;
  path.set(bend, s0, beaconS - 4, prng.range(0.028, 0.04), prng.range(0, Math.PI * 2));
  dress(realm, seed, { jitter: S.stageNo > 1 || Boolean(S.force) });

  S.rows = gates.build(stage, rowS.map((s) => -s), realm, world.mirrored).map((r, i) => ({ ...r, data: stage.rows[i], seenAt: null, lane: null, laneAt: null }));
  S.rowIdx = 0;
  // Moths live in the gaps, clear of the gates either side.
  S.gaps = rowS.map((s, i) => ({ from: s + 9, to: (i + 1 < rowS.length ? rowS[i + 1] : beaconS - 8) - 10, spawned: false }));
  moths.clear();
  S.beacon?.dispose();
  S.beacon = new Beacon(world.scene, -beaconS, stage.beacon, realm.beacon, world.mirrored ? world.mirror : null);
  S.count = stage.start;
  S.stagePts = 0;
  S.optimal = 0;
  S.mothHits = 0;
  S.outcome = null;
  console.info(`[fireflies] stage ${S.stageNo} (rung ${rung}) in ${realm.id}: ${stage.start} → best ${stage.best}, beacon ${stage.beacon}, ${stage.rows.length} rows: ${stage.rows.map((r) => r.gates.map(label).join('|')).join('  ')}`);
}

function startStage() {
  const fromTitle = S.mode === 'title';
  S.tut = null;
  S.watch = false;
  newStage();
  const st = S.stage;
  swarm.mode = 'swarm';
  swarm.showLabel = true;
  if (fromTitle) {
    swarm.setCount(st.start, { quiet: true });
  } else {
    // Under the flash: a fresh swarm gathers on the path, the camera behind it.
    swarm.center.set(S.x + path.x(-S.s), 1.6, -S.s);
    swarm.reset(st.start);
    snapCamera();
  }
  S.mode = 'run';
  ui.hud(true);
  ui.coachOff();
  ui.setStage({ eyebrow: `Stage ${S.stageNo} · rung ${st.rung}`, name: st.name, need: st.beacon, rows: st.rows.length });
  ui.setScore(runningScore());
  ui.showFinishRun(skillprint.reporting);
  const realm = realmById(st.realm);
  ui.toast(`<span class="eyebrow">Stage ${S.stageNo} · ${realm.name}</span><b>${st.name}</b><span>Wake a beacon of <em>${st.beacon}</em>. You start with ${st.start}.</span>`, 3800);
  if (S.stageNo === 1 && !S.didTutorial) ui.hint(true);
  skillprint.event(GameEvent.LEVEL_START, {
    stage: S.stageNo, rung: st.rung, rows: st.rows.length, gatesPerRow: st.gatesPerRow, start: st.start, beacon: st.beacon, best: st.best, realm: st.realm,
    numberScale: tuning.numberScale, gateTrickiness: tuning.gateTrickiness, beaconStrictness: tuning.beaconStrictness, runSpeed: tuning.runSpeed, hazardDensity: tuning.hazardDensity,
  });
  report();
}

// ---------------------------------------------------------------------------

function report() {
  skillprint.state({
    score: runningScore(), isGameOver: false, mode: S.tut ? 'tutorial' : S.mode, stage: S.stageNo, rung: S.stage?.rung,
    swarm: S.count, beacon: S.stage?.beacon, row: S.rowIdx, rows: S.rows.length, lit: S.lit, ...(S.tut ? { tutorialStep: S.tut.step } : {}),
  });
  ui.setScore(runningScore());
}

function describe() {
  if (S.tut) {
    const row = S.rows[S.rowIdx];
    return [
      `Tutorial · step ${S.tut.step} of ${TUT_STEPS.length}`,
      `Swarm ${S.count}${S.stage.beacon ? ` · beacon needs ${S.stage.beacon}` : ''}`,
      row ? `Gates: ${row.gates.map((g) => g.label).join('  |  ')}` : 'Beacon ahead',
    ];
  }
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
  const P = S.portal;
  if (P) {
    P.t += dt;
    if (!P.swapped && P.t >= 0.5) {
      P.swapped = true;
      P.action();
    }
    if (P.t >= 1.5) S.portal = null;
  }
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
  const pace = S.tut ? SPEED * TUT_SPEED * tutorialPace(row, dt) : SPEED * tuning.runSpeed;
  S.s = Math.min(S.stage.stopS, S.s + pace * ease * dt);

  if (row && S.s >= -row.z) cross(row);
  mothStep();
  if (S.tut) tutorialTick();
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
  const at = gates.center(r, i, tmp);
  swarm.embers.burst(at.x, at.y, at.z, optimal ? 40 : 18, [rgb.r * 2.5, rgb.g * 2.5, rgb.b * 2.5], 3.2, 0.8);
  sound.gate(optimal, before ? after / before : 1);
  if (after < before) sound.fizz(Math.min(1, (before - after) / before));
  ui.pip(r, optimal ? 'best' : 'worse');
  if (r === 0) ui.hint(false);
  if (S.tut) return tutorialCross(r, row, i, before, after, results, optimal);
  if (optimal) { S.optimal += 1; S.stagePts += 25; }

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
  const c = { x: S.x, y: 1.6, z: -S.s };
  for (const _ of moths.hits(S.t, c, radiusFor(S.count) * S.squeeze)) {
    const before = S.count;
    // In the tutorial a bite is a lesson, not a loss worth counting.
    // Otherwise it is sized against the stage's best finish, not the swarm in
    // hand: 7 lost from 72 before a "−42" gate would be a quarter of the finish.
    const lost = S.tut ? Math.min(2, before - 1) : clamp(Math.round(st.best * rng.range(0.03, 0.08)), 1, Math.ceil(before / 2));
    S.count = before - lost;
    swarm.setCount(S.count, { emberColor: [1.2, 0.35, 1.6] });
    swarm.float(`−${lost}`, '#d58cff');
    sound.moth();
    if (S.tut) { report(); continue; }
    S.mothHits += 1;
    skillprint.event(GameEvent.GENERIC_NEGATIVE, { stage: S.stageNo, cause: 'moth', before, lost, after: S.count, row: S.rowIdx });
    report();
    if (S.count <= 0) return lose('swarm-lost');
  }
}

function arrive() {
  S.mode = 'arrive';
  S.watch = true;
  S.arriveT = 0;
  swarm.pour(S.beacon.mouth);
  S.beacon.showFill(0);
  ui.hint(false);
}

function arriveStep(dt) {
  S.arriveT += dt;
  if (S.tut) return tutorialArrive();
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

// A lit beacon opens the way to the next realm in a flash of its light; a
// dark one, in a fall of dusk.
function next() {
  if (S.mode !== 'result') return;
  ui.hideResult();
  S.auroraGoal = 0;
  portal(startStage, Boolean(S.outcome?.lit));
}

function finish() {
  if (S.mode === 'done' || S.mode === 'title' || S.mode === 'boot' || S.mode === 'portal') return;
  if (S.tut) {
    S.tut = null;
    ui.coachOff();
  } else if (S.mode === 'run') {
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
// The tutorial: a short scripted flight through Mossgate. One instruction at
// a time, each step done by doing it. It flies slowly and all but stops
// before each row until the player has picked a lane. Wrong choices get the
// arithmetic, never a penalty; nothing here scores or counts towards the rung.

const SYM = { '+': 'op-p', '−': 'op-m', '×': 'op-x', '÷': 'op-d' };
const sum = (n, k, v, r) => `${n} <span class="${SYM[k]}">${k} ${v}</span> = ${r}`;
const sums = (...parts) => parts.join('<span class="dot">·</span>');

function tutorialRow(n, a, b) {
  const gatesOf = [{ steps: [a] }, { steps: [b] }];
  const results = gatesOf.map((g) => apply(g, n));
  const best = results.indexOf(Math.max(...results));
  const lk = gatesOf.map(looks);
  return { n, gates: gatesOf, results, best, trap: lk.indexOf(Math.max(...lk)) !== best };
}

// The trap row, from whatever the player arrived with: the gate with the
// bigger number loses by two (16: ÷2 makes 8, −10 only 6). A trap as the
// generator means it, with the answer in the other lane from row 1's.
function trapRow(n) {
  return tutorialRow(n, { k: '÷', v: 2 }, { k: '−', v: Math.ceil(n / 2) + 2 });
}

function startTutorial() {
  const realm = realmById('mossgate');
  const s0 = S.s;
  const r1 = s0 + 34, r2 = r1 + 44, beaconS = r2 + 90;
  path.set(0, 0, 1);
  dress(realm, 1, { jitter: false });
  const row1 = tutorialRow(8, { k: '+', v: 5 }, { k: '×', v: 2 });
  S.stage = { rung: 0, start: 8, rows: [row1], gatesPerRow: 2, best: 0, beacon: 0, stopS: beaconS - STOP_BEFORE, name: 'First Flight', realm: realm.id, r2 };
  S.rows = gates.build(S.stage, [-r1], realm, world.mirrored, 2).map((r, i) => ({ ...r, data: S.stage.rows[i], seenAt: null, lane: null, laneAt: null }));
  S.rowIdx = 0;
  S.gaps = [];
  moths.clear();
  S.beacon?.dispose();
  S.beacon = new Beacon(world.scene, -beaconS, '?', realm.beacon, null);
  S.count = 8;
  S.stagePts = 0;
  S.optimal = 0;
  S.mothHits = 0;
  S.outcome = null;
  swarm.mode = 'swarm';
  swarm.showLabel = true;
  swarm.setCount(8, { quiet: true });
  S.watch = false;
  S.tut = { step: 0, t0: S.t, stepT0: S.t, mistakes: 0, minX: 0, maxX: 0, cleared: -1, holding: false, holdT: 0, lastSteer: -9, go: false, release: 1, say: null, next: 0, moth: null, lit: 0 };
  S.mode = 'run';
  S.didTutorial = true;
  ui.hud(true);
  ui.setStage({ eyebrow: 'Tutorial', name: 'First Flight', need: '?', rows: 2 });
  ui.showFinishRun(false);
  skillprint.event('TUTORIAL_START', { steps: TUT_STEPS.length });
  tutorialGo(1);
  report();
}

/** Show step n's instruction. */
function tutorialGo(n) {
  const T = S.tut;
  T.step = n;
  T.stepT0 = S.t;
  T.say = null;
  T.next = 0;
  if (n === 4) {
    // One slow moth, right in the swarm's way.
    T.moth = moths.spawn({ x: clamp(S.targetX, -XMAX + 0.8, XMAX - 0.8), z: -(S.s + 24), amp: 0.35, freq: 0.45, phase: 0 });
  }
  if (n === 5) {
    const need = Math.max(1, S.count - (S.count > 4 ? 2 : 1));
    S.stage.beacon = need;
    S.beacon.setNeed(need);
    ui.need(need);
  }
  coachNow();
  report();
}

/** The step is done: tell Skillprint how it went. */
function tutorialDone(extra = {}) {
  const T = S.tut;
  skillprint.event('TUTORIAL_STEP', { step: T.step, name: TUT_STEPS[T.step - 1], ms: Math.round((S.t - T.stepT0) * 1000), ...extra });
}

/** Say something for a while (the arithmetic of what just happened), then go on to step `next`. */
function tutorialSay(html, secs, next) {
  const T = S.tut;
  T.say = { html, until: S.t + secs };
  T.next = next;
  coachNow();
}

function coachNow() {
  const T = S.tut;
  if (!T) return;
  const of = TUT_STEPS.length;
  if (T.say) return ui.coach({ step: T.step, of, text: T.say.html, say: true });
  const row = S.rows[S.rowIdx];
  const n = S.count;
  switch (T.step) {
    case 1:
      return ui.coach({ step: 1, of, text: 'Drag, or use <kbd>←</kbd> <kbd>→</kbd>, to lead your swarm.', hint: T.minX < -1.2 ? 'Now the other way.' : T.maxX > 1.2 ? 'Now the other way.' : 'Try both ways.' });
    case 2:
      return ui.coach({ step: 2, of, text: 'Every gate does a sum to your swarm. Fly through the one that <b>leaves you more</b>.', sums: sums(sum(8, '+', 5, 13), sum(8, '×', 2, 16)), hint: T.holding ? 'Steer into a gate, then fly on (Space).' : '' });
    case 3: {
      const a = row ? row.data.gates[1].steps[0].v : 0;
      // An odd swarm halves to a fraction: say up front that ÷ keeps the whole part.
      const halves = n % 2 ? ' No half fireflies: ÷ rounds down.' : '';
      return ui.coach({ step: 3, of, text: `The bigger-looking number isn’t always the better sum.${halves}`, sums: row ? sums(sum(n, '÷', 2, '?'), sum(n, '−', a, '?')) : '', hint: T.holding ? 'Work them out, then steer (Space to fly on).' : '' });
    }
    case 4:
      return ui.coach({ step: 4, of, text: 'Moths eat fireflies. <b>Steer around it.</b>' });
    case 5:
      return ui.coach({ step: 5, of, text: 'Bring at least this many to <b>wake the beacon</b>.', sums: `Beacon ${S.stage.beacon}<span class="dot">·</span>Swarm ${n}` });
  }
}

// Near a row the tutorial all but stops, until the player has picked a lane
// and let it settle (or pressed Space). Step 1 has to be done first.
function tutorialPace(row, dt) {
  const T = S.tut;
  if (!row) return 1;
  const r = S.rowIdx;
  if (T.cleared >= r) {
    T.release = Math.min(1, T.release + dt / 0.8);
    return 0.04 + 0.96 * smooth(T.release);
  }
  const holdD = TUT_HOLD * SPEED * TUT_SPEED;
  const ahead = -row.z - S.s;
  if (ahead <= holdD + 0.3 && !T.holding) {
    T.holding = true;
    T.holdT = S.t;
    T.go = false;
    coachNow();
  }
  if (T.holding && T.step === r + 2 && !T.say) {
    const settled = T.lastSteer >= T.holdT && S.t - T.lastSteer > 0.7;
    if (settled || T.go) {
      T.cleared = r;
      T.release = 0;
      T.holding = false;
      coachNow();
    }
  }
  return 0.04 + 0.96 * smooth(clamp((ahead - holdD) / 6, 0, 1));
}

function tutorialTick() {
  const T = S.tut;
  T.minX = Math.min(T.minX, S.x);
  T.maxX = Math.max(T.maxX, S.x);
  if (T.say && S.t >= T.say.until) {
    T.say = null;
    if (T.next) return tutorialGo(T.next);
    coachNow();
  }
  if (T.step === 1) {
    if (T.minX < -1.2 && T.maxX > 1.2) {
      tutorialDone();
      tutorialGo(2);
    } else if ((T.minX < -1.2 || T.maxX > 1.2) && !T.halfway) {
      T.halfway = true;
      coachNow();
    }
  } else if (T.step === 4 && T.moth && !T.say) {
    const m = T.moth;
    if (m.hit || m.z > -S.s + 0.8) {
      tutorialDone({ dodged: !m.hit });
      T.moth = null;
      tutorialSay(m.hit ? 'It took a couple. Next time slip past to one side.' : 'Nicely dodged.', 2.4, 5);
    }
  }
}

function tutorialCross(r, row, i, before, after, results, optimal) {
  const T = S.tut;
  if (!optimal) T.mistakes += 1;
  const [ga, gb] = row.data.gates.map((g) => g.steps[0]);
  const [ra, rb] = results;
  tutorialDone({ correct: optimal, before, after, chosen: row.gates[i].label });
  let say;
  if (r === 0) {
    say = optimal
      ? `Yes: ${sum(8, '×', 2, 16)} beats ${sum(8, '+', 5, 13)}.`
      : `${sum(8, '+', 5, 13)}, but ${sum(8, '×', 2, 16)}: the × gate left more. No harm done, it’s practice.`;
    // The trap row is built from what they actually have, so the lesson holds either way.
    const data = trapRow(after);
    const out = gates.addRow(data, -S.stage.r2, true);
    S.stage.rows.push(data);
    S.rows.push({ ...out, data, seenAt: null, lane: null, laneAt: null });
    tutorialSay(say, 3.2, 3);
  } else {
    const div = sum(before, '÷', ga.v, ra), sub = sum(before, '−', gb.v, rb);
    const halves = before % ga.v ? ' (÷ rounds down: no half fireflies.)' : '';
    say = optimal
      ? `Right: ${div} beats ${sub}${halves}. The bigger number on the gate wasn’t the better sum.`
      : `${sub}, but ${div}${halves}. The bigger-looking number isn’t always the better sum.`;
    tutorialSay(say, halves ? 4.4 : 3.4, 4);
  }
  report();
}

function tutorialArrive() {
  const T = S.tut;
  S.beacon.showFill(Math.round(S.count * smooth(clamp(S.arriveT / 2.3, 0, 1))));
  if (S.arriveT >= 2.5 && !T.lit) {
    T.lit = S.t;
    S.beacon.wake();
    S.beacon.showFill(S.count);
    swarm.column();
    S.auroraGoal = 1;
    sound.lit();
    ui.beacon('lit');
    tutorialDone({ brought: S.count, need: S.stage.beacon });
    ui.coach({ step: 5, of: TUT_STEPS.length, text: `You woke it: ${S.count} fireflies for a beacon of ${S.stage.beacon}. Now for real.`, say: true });
  } else if (T.lit && S.t - T.lit > 2.8) {
    skillprint.event('TUTORIAL_COMPLETE', { ms: Math.round((S.t - T.t0) * 1000), mistakes: T.mistakes });
    endTutorial();
  }
}

function skipTutorial() {
  if (!S.tut || S.mode === 'portal') return;
  skillprint.event('TUTORIAL_SKIP', { step: S.tut.step });
  endTutorial();
}

function endTutorial() {
  store.tutored = true;
  save();
  ui.coachOff();
  S.auroraGoal = 0;
  portal(() => { S.tut = null; startStage(); }, true);
}

/** Steering input, for the tutorial's "picked a lane" test. */
function noteSteer() { if (S.tut) S.tut.lastSteer = S.t; }

// Where the tutorial's pointer goes: the swarm, the row, the moth, the beacon.
function tutorialPointer() {
  const T = S.tut;
  if (!T || T.say || S.portal) return ui.pointer(null);
  let at = null, kind = 'ring';
  const row = S.rows[S.rowIdx];
  if (T.step === 1) at = tmp2.copy(swarm.center);
  else if ((T.step === 2 || T.step === 3) && row && T.cleared < S.rowIdx) { at = tmp2.set(row.cx, 4.6, row.z); kind = 'arrow'; }
  else if (T.step === 4 && T.moth) at = tmp2.copy(T.moth.g.position);
  else if (T.step === 5 && S.mode === 'run') { at = S.beacon.platePosition(tmp2); kind = 'arrow'; at.y += 1.0; }
  if (!at) return ui.pointer(null);
  at.project(world.camera);
  if (at.z > 1 || Math.abs(at.x) > 1.1 || Math.abs(at.y) > 1.1) return ui.pointer(null);
  ui.pointer((at.x + 1) / 2 * innerWidth, (1 - at.y) / 2 * innerHeight, kind);
}

// ---------------------------------------------------------------------------
// Picture.

function runCamera(z, p, out, look) {
  const back = BACK + p * 2;
  out.set(path.x(z + back) + S.x * FOLLOW, 5.1 + p * 1.4, z + back);
  look.set(path.x(z - 17) + S.x * (FOLLOW + 0.1), 0.9, z - 17);
}

function snapCamera() {
  runCamera(-S.s, world.portraitness, cam.pos, cam.look);
}

function frame(dt) {
  S.vt += dt;
  const z = -S.s;
  const p = world.portraitness;

  // The swarm itself, over the path wherever it bends.
  swarm.center.set(S.x + path.x(z), 1.6 + Math.sin(S.vt * 1.3) * 0.12, z);
  if (S.mode === 'run' || S.mode === 'title') {
    swarm.radius = damp(swarm.radius, radiusFor(S.count), 4, dt);
    swarm.squeeze = S.squeeze;
  }
  swarm.update(dt);
  swarm.label.sprite.visible = swarm.label.sprite.visible && S.mode !== 'title';
  gates.update(S.s, dt);
  moths.update(S.t, S.paused ? 0 : dt, z);
  S.beacon?.update(dt);
  S.aurora = damp(S.aurora, S.auroraGoal, S.auroraGoal ? 0.8 : 0.35, dt);
  world.setAurora(S.aurora);

  // The camera: low behind the swarm on the path, pulled back to watch the beacon.
  const watching = S.watch && S.beacon && !S.outcome?.lost;
  if (watching) {
    const bx = S.beacon.group.position.x, bz = S.beacon.z;
    cam.pos.lerp(tmp.set(bx, 5.2 + p * 2.5, bz + 19 + p * 9), 1 - Math.exp(-dt * 1.6));
    cam.look.lerp(tmp.set(bx, 4.6, bz), 1 - Math.exp(-dt * 2));
  } else {
    runCamera(z, p, tmp, tmp2);
    cam.pos.x = damp(cam.pos.x, tmp.x, 4, dt);
    cam.pos.y = damp(cam.pos.y, tmp.y, 4, dt);
    cam.pos.z = damp(cam.pos.z, tmp.z, 6, dt);
    cam.look.copy(tmp2);
  }
  world.camera.position.copy(cam.pos);
  world.camera.lookAt(cam.look);
  world.update(Math.min(z, cam.pos.z - 10), dt);

  const P = S.portal;
  ui.flash(P ? (P.t < 0.5 ? smooth(P.t / 0.5) : 1 - smooth(clamp((P.t - 0.55) / 0.9, 0, 1))) : 0, P ? P.warm : true);
  tutorialPointer();
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
  const x = clamp((ndc * hw) / (1 - FOLLOW), -XMAX, XMAX);
  if (Math.abs(x - S.targetX) > 0.05) noteSteer();
  S.targetX = x;
}

canvas.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'mouse' || e.buttons) steerTo(e.clientX);
});
canvas.addEventListener('pointerdown', (e) => {
  sound.start();
  noteSteer();
  steerTo(e.clientX);
});

// One lane over, towards the next row's gate on that side.
function hop(dir) {
  if (S.mode !== 'run') return;
  const g = S.rows[S.rowIdx]?.gates.length ?? 2;
  const lane = clamp(laneOf(g, S.targetX) + dir, 0, g - 1);
  S.targetX = laneCenters(g)[lane];
  noteSteer();
}

window.addEventListener('keydown', (e) => {
  const k = e.key;
  const left = k === 'ArrowLeft' || k === 'a' || k === 'A', right = k === 'ArrowRight' || k === 'd' || k === 'D';
  if (left || right) {
    e.preventDefault();
    if (!e.repeat) { keys.since = performance.now(); hop(left ? -1 : 1); }
    keys.left ||= left;
    keys.right ||= right;
  } else if (k === 'Enter' || k === ' ') {
    if (S.mode === 'title') { e.preventDefault(); begin(); }
    else if (S.mode === 'result') { e.preventDefault(); next(); }
    else if (S.tut && S.tut.holding) { e.preventDefault(); S.tut.go = true; }
  } else if (k === 'Escape') {
    if (S.tut) { e.preventDefault(); skipTutorial(); }
  } else if (k === 'm' || k === 'M') muteBtn.click();
});
window.addEventListener('keyup', (e) => {
  const k = e.key;
  if (k === 'ArrowLeft' || k === 'a' || k === 'A') keys.left = false;
  if (k === 'ArrowRight' || k === 'd' || k === 'D') keys.right = false;
});
window.addEventListener('blur', () => { keys.left = keys.right = false; });
window.addEventListener('resize', () => world.resize());

/** Begin; the first time ever (or from "How to play"), with the tutorial. */
function begin(tutorial = !store.tutored) {
  if (S.mode !== 'title') return;
  sound.start();
  skillprint.begin();
  skillprint.event(GameEvent.GAME_START, { best: store.best, tutorial });
  ui.hideTitle();
  S.x = S.targetX = 0;
  if (tutorial) startTutorial();
  else startStage();
}

document.getElementById('begin').addEventListener('click', () => begin());
document.getElementById('howto').addEventListener('click', () => begin(true));
document.getElementById('skip').addEventListener('click', skipTutorial);
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
// The tutorial reads none of them.
onParameter((name, value) => {
  if (name === 'hazardDensity' && value === 0 && !S.tut) {
    // No moths means none: clear the ones still ahead.
    for (let i = moths.list.length - 1; i >= 0; i--) if (moths.list[i].z < -S.s - 2 && !moths.list[i].hit) moths.remove(i);
  }
});

// ---------------------------------------------------------------------------
// Test hooks: `let` bindings in a module aren't window properties.

function snapshot() {
  const row = S.rows[S.rowIdx];
  return {
    mode: S.mode, stage: S.stageNo, rung: S.stage?.rung, realm: S.stage?.realm ?? world.realm?.id, count: S.count, beacon: S.stage?.beacon, best: S.stage?.best,
    row: S.rowIdx, rows: S.rows.length, next: row ? row.gates.map((g) => g.label) : null,
    x: +S.x.toFixed(2), s: +S.s.toFixed(1), score: runningScore(), lit: S.lit, optimal: S.optimal, mothHits: S.mothHits,
    moths: moths.list.length, outcome: S.outcome && { lit: S.outcome.lit, lost: !!S.outcome.lost, total: S.outcome.total }, paused: S.paused,
    tutorial: S.tut ? tutorialState() : null, portal: Boolean(S.portal),
  };
}

function tutorialState() {
  const T = S.tut;
  return { step: T.step, name: TUT_STEPS[T.step - 1], holding: T.holding, cleared: T.cleared, saying: Boolean(T.say), mistakes: T.mistakes, text: document.getElementById('coach-text').textContent };
}

window.__firefliesControls = {
  start: begin,
  next,
  finish,
  state: snapshot,
  stage: () => S.stage,
  steer(x) { S.targetX = clamp(x, -XMAX, XMAX); noteSteer(); },
  lane(i) { const row = S.rows[S.rowIdx]; if (row) { S.targetX = laneCenters(row.gates.length)[i]; noteSteer(); } },
  autopilot(mode) { S.autopilot = mode || null; },
  pause: setPaused,
  /** Hold every later stage (and the title) in one realm, or null to let the bag deal. */
  realm(id) { S.force = REALMS.some((r) => r.id === id) ? id : null; },
  realms: () => REALMS.map((r) => r.id),
  /** From the title: begin with the tutorial. */
  tutorial: () => begin(true),
  tutorialStep: () => (S.tut ? tutorialState() : null),
  /** In the tutorial, "fly on" (Space). */
  go() { if (S.tut) S.tut.go = true; },
  skipTutorial,
  /** What the last frame cost to draw. */
  info() {
    const info = world.renderer.info;
    info.autoReset = false;
    info.reset();
    world.render();
    const out = { calls: info.render.calls, triangles: info.render.triangles, points: info.render.points };
    info.autoReset = true;
    return out;
  },
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
  const realm = realmById(S.force || 'mossgate');
  path.set(0, 0, 1);
  dress(realm, 7, { jitter: false });
  swarm.reset(24);
  swarm.showLabel = false;
  ui.howTo(store.tutored);
  ui.showTitle(store.best ? `Your best ${store.best.toLocaleString()} · M for sound` : 'M for sound · ← → to steer');
  report();
  requestAnimationFrame(() => ui.veil(false));
}

fontsReady().then(() => {
  boot();
  requestAnimationFrame(loop);
});
