// Equilibrium: hang the loose weights so every arm of the mobile rests level.
// This file is the loop, the rules of a mobile from first hang to last
// chime, the pointer, and the HUD.

import { Stage } from './stage.js';
import { Mobile, U } from './mobile.js';
import { Sound } from './sound.js';
import { generate, solution, solved, balanced, clamp, TOP_RUNG } from './puzzle.js';
import { placard } from './labels.js';
import { tuning, onParameter } from './params.js';
import { Skillprint, GameEvent } from './skillprint.js';

const KEY = 'equilibrium/v1';
const defaults = { best: 0, balanced: 0, muted: false };
function load() {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return { ...defaults }; }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(store)); } catch { /* private mode */ }
}
const store = load();

const $ = (id) => document.getElementById(id);
const canvas = $('scene');
let stage;
try {
  stage = new Stage(canvas);
} catch (e) {
  $('nogl').hidden = false;
  throw e;
}
const sound = new Sound();
sound.muted = store.muted;
const skillprint = new Skillprint({ canvas, describe });
skillprint.onPause = setPaused;

const RELEASE_LOOK = 1.7; // seconds the player watches a released mobile before the verdict
const RELEASE_HOLD = 3.3; // …and before the clamp comes back
const FAILED_RELEASE = 30;

const S = {
  mode: 'boot', // title · descend · play · releasing · solved · lost · end · done
  mobile: null,
  leaving: [],
  place: null,
  number: 0, // mobiles hung this session
  balanced: 0, // …and balanced
  score: 0,
  elapsed: 0,
  base: 95,
  duration: 95,
  moves: 0,
  releases: 0,
  failed: 0,
  levels: [],
  selected: -1,
  solveIn: 0,
  releaseT: 0,
  paused: false,
  startedAt: 0,
  lastMoveAt: 0,
  card: false,
  hinted: 0,
};

const puzzle = () => S.mobile?.puzzle;
const trayLeft = () => (S.place ? S.place.filter((p) => !p).length : 0);
const levelCount = () => (S.mobile ? S.mobile.measures.filter(balanced).length : 0);
const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const clock = (sec) => { const s = Math.max(0, Math.ceil(sec)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

// ---------------------------------------------------------------------------
// Framing

function pads() {
  const phone = innerWidth < 700;
  if (S.mode === 'title' || S.mode === 'boot') {
    return stage.portrait || phone
      ? { top: 30, bottom: Math.min(innerHeight * 0.48, 330), left: 18, right: 18 }
      : { top: 50, bottom: 50, left: Math.min(innerWidth * 0.46, 560), right: 40 };
  }
  const top = phone ? 70 : 84;
  const bottom = S.card ? Math.min(innerHeight * 0.45, ($('end').offsetHeight || 220) + 34) : phone ? 66 : 76;
  return { top, bottom, left: phone ? 10 : 30, right: phone ? 10 : 30 };
}

function refit(immediate = false) {
  const m = S.mobile;
  if (!m) return;
  stage.frame(S.mode === 'title' ? m.mobileBox : m.box, pads(), immediate);
}

// ---------------------------------------------------------------------------
// Title

function boot() {
  const demo = generate({ rung: 7, maxWeight: 9, seed: (Math.random() * 2 ** 31) | 0, wide: !stage.portrait });
  const m = new Mobile(demo, { place: solution(demo) });
  m.drift = 0.65;
  stage.scene.add(m.rig);
  S.mobile = m;
  S.mode = 'title';
  refit(true);
  $('title').hidden = false;
  $('best').textContent = store.balanced ? `Best show ${store.best} · ${plural(store.balanced, 'mobile')} balanced so far` : '';
  requestAnimationFrame(() => $('veil').classList.remove('on'));
}

function begin() {
  if (S.mode !== 'title') return;
  sound.start();
  skillprint.begin();
  skillprint.event(GameEvent.GAME_START, { best: store.best, balancedBefore: store.balanced, liveTilt: tuning.liveTilt });
  $('title').classList.add('leaving');
  setTimeout(() => { $('title').hidden = true; }, 600);
  $('hud').hidden = false;
  $('actions').hidden = false;
  $('quit').hidden = !skillprint.reporting;
  newMobile();
}

// ---------------------------------------------------------------------------
// A mobile, from arrival to verdict

function newMobile() {
  const rung = clamp(S.balanced + 1 + tuning.levelOffset, 1, TOP_RUNG);
  const p = generate({ rung, maxWeight: tuning.maxWeight, seed: (Math.random() * 2 ** 31) | 0, wide: !stage.portrait });
  const old = S.mobile;
  if (old) {
    old.drift = 0;
    old.leave();
    S.leaving.push(old);
  }
  const m = new Mobile(p, { held: !tuning.liveTilt, hintLevel: tuning.hintLevel });
  stage.scene.add(m.rig);
  m.enter();
  S.mobile = m;
  S.place = m.place.slice();
  S.number += 1;
  S.mode = 'descend';
  S.selected = -1;
  stage.dim = 0;
  stage.setShelf(m.shelfY, -m.trayHalf, m.trayHalf);
  const loose = p.weights.filter((w) => w.loose).length;
  stage.setPlacard(placard([
    `Mobile No. ${S.number}`,
    'painted steel and wire',
    `${plural(p.beams.length, 'beam')}, ${plural(p.weights.length, 'weight')} (${loose} loose)`,
    `rung ${p.rung} · weights to ${p.maxWeight}`,
  ]), m.placardAt.x, m.placardAt.y);
  refit();
  console.info(`[equilibrium] mobile ${S.number} (rung ${p.rung}): ${p.beams.length} beams, ${p.weights.length} weights, loose ${p.weights.filter((w) => w.loose).map((w) => w.w).join(', ')}`);
  hud();
}

function startPlay() {
  const p = puzzle();
  const loose = p.weights.filter((w) => w.loose).length;
  S.mode = 'play';
  S.elapsed = 0;
  S.base = 45 + 25 * loose;
  S.duration = S.base * tuning.candleScale;
  S.moves = 0;
  S.releases = 0;
  S.failed = 0;
  S.solveIn = 0;
  S.startedAt = S.lastMoveAt = performance.now();
  S.levels = S.mobile.measures.map(balanced);
  skillprint.event(GameEvent.LEVEL_START, {
    mobile: S.number, rung: p.rung, beams: p.beams.length, trayWeights: loose, weights: p.weights.length,
    reach: p.beams[0].reach, maxWeight: p.maxWeight, liveTilt: tuning.liveTilt, hintLevel: tuning.hintLevel, candleSec: Math.round(S.duration),
  });
  if (S.number === 1) {
    note(tuning.liveTilt
      ? 'Weight × distance must match on both sides. The numbers above a beam are distances.'
      : 'The beams are held level. Work out where everything goes, then press <b>Release</b>.', 6500);
  } else if (S.number === 2 && tuning.liveTilt) {
    note('Drag, or tap a weight and then a hook. Tap a hung weight to take it down.', 5000);
  }
  report();
  hud();
}

function hangAt(id, hook) {
  const m = S.mobile;
  const before = S.place[id];
  S.place = S.place.slice();
  S.place[id] = { beam: hook.beam, d: hook.d };
  m.setPlace(S.place);
  const w = m.weights[id].w;
  sound.hang(w);
  const now = performance.now();
  skillprint.event('HANG', {
    mobile: S.number, weight: w, beam: hook.beam, distance: Math.abs(hook.d), side: hook.d < 0 ? 'left' : 'right',
    torque: w * Math.abs(hook.d), from: before ? `beam ${before.beam} at ${Math.abs(before.d)}` : 'shelf', msSinceLast: Math.round(now - S.lastMoveAt),
  });
  moved(now);
}

function shelve(id, from) {
  const m = S.mobile;
  S.place = S.place.slice();
  S.place[id] = null;
  m.setPlace(S.place);
  sound.shelve();
  const now = performance.now();
  if (from) skillprint.event('UNHANG', { mobile: S.number, weight: m.weights[id].w, beam: from.beam, distance: Math.abs(from.d), msSinceLast: Math.round(now - S.lastMoveAt) });
  moved(now);
}

function clearAll() {
  if (S.mode !== 'play' || S.paused) return;
  const m = S.mobile;
  const hung = m.weights.filter((v) => !v.pinned && S.place[v.id]);
  if (!hung.length) return;
  for (const v of hung) shelve(v.id, S.place[v.id]);
  deselect();
}

function moved(now) {
  S.moves += 1;
  S.lastMoveAt = now;
  const m = S.mobile;
  m.measures.forEach((x, i) => {
    const lv = balanced(x);
    if (lv && !S.levels[i]) {
      skillprint.event(GameEvent.MATCH, { mobile: S.number, beam: i, torque: x.left, mass: x.mass });
      if (!m.held) sound.level();
    }
  });
  S.levels = m.measures.map(balanced);
  S.solveIn = !m.held && solved(m.puzzle, S.place) ? 0.75 : 0;
  report();
  hud();
}

function release() {
  if (S.mode !== 'play' || S.paused || !S.mobile.held || trayLeft()) return;
  S.mode = 'releasing';
  S.releaseT = 0;
  S.releases += 1;
  S.mobile.setHeld(false);
  sound.release();
  hud();
}

function verdict() {
  const m = S.mobile;
  const ok = solved(m.puzzle, S.place);
  const off = m.crooked();
  skillprint.event('RELEASE', { mobile: S.number, balanced: ok, offBeams: off, releases: S.releases });
  if (ok) return celebrate();
  S.failed += 1;
  skillprint.event(GameEvent.UNMATCH, { mobile: S.number, offBeams: off, penalty: FAILED_RELEASE, failedReleases: S.failed });
  m.flagHeavy(off);
  sound.wrong();
  const names = off.map((i) => beamName(i)).join(' and ');
  note(`Not yet: the ${names} ${off.length === 1 ? 'tips toward the red ring' : 'tip toward the red rings'}.`, 3200);
}

function beamName(i) {
  const b = puzzle().beams[i];
  if (b.parent == null) return 'top beam';
  const side = b.hook < 0 ? 'left' : 'right';
  return b.depth === 1 ? `${side} beam` : `lowest ${side} beam`;
}

function celebrate() {
  const m = S.mobile;
  const p = m.puzzle;
  S.mode = 'solved';
  S.solveIn = 0;
  m.setHeld(false);
  m.spin();
  sound.solved();
  const loose = p.weights.filter((w) => w.loose).length;
  const left = Math.max(0, 1 - S.elapsed / S.duration);
  const parts = {
    hung: 100 * loose,
    structure: 50 * (p.beams.length - 1),
    candle: Math.round(100 * left),
    penalty: -FAILED_RELEASE * S.failed,
  };
  const points = Math.max(20, parts.hung + parts.structure + parts.candle + parts.penalty);
  S.score += points;
  S.balanced += 1;
  store.balanced += 1;
  store.best = Math.max(store.best, S.score);
  save();
  skillprint.event(GameEvent.LEVEL_COMPLETE, {
    mobile: S.number, rung: p.rung, ms: Math.round(performance.now() - S.startedAt), moves: S.moves,
    releases: S.releases, failedReleases: S.failed, candleLeft: +left.toFixed(3), points, score: S.score,
  });
  report();
  hud();
  setTimeout(() => showEnd(true, { loose, beams: p.beams.length, parts, points }), 2300);
}

function lose() {
  const m = S.mobile;
  const p = m.puzzle;
  cancelDrag();
  S.mode = 'lost';
  S.solveIn = 0;
  const placed = p.weights.filter((w) => w.loose && S.place[w.id]).length;
  skillprint.event(GameEvent.LEVEL_FAILED, { mobile: S.number, rung: p.rung, placed, trayLeft: trayLeft(), moves: S.moves, releases: S.releases, score: S.score });
  sound.out();
  deselect();
  stage.dim = 1;
  // One way it balances: the generated answer.
  S.place = solution(p);
  m.setPlace(S.place);
  m.setHeld(false);
  note('The candle’s out. Here’s one way it balances.', 3000);
  report();
  hud();
  setTimeout(() => showEnd(false, { loose: p.weights.filter((w) => w.loose).length, beams: p.beams.length }), 3200);
}

function showEnd(won, r) {
  if (S.mode !== 'solved' && S.mode !== 'lost') return;
  S.mode = 'end';
  const card = $('end');
  $('end-head').innerHTML = won ? 'Balanced<em>.</em>' : 'The candle’s out.';
  $('end-sub').textContent = won
    ? (S.failed ? `Mobile No. ${S.number} rests level, at the ${ordinal(S.releases)} release.` : `Mobile No. ${S.number} rests level.`)
    : `Mobile No. ${S.number} goes back to the workshop. The next one is the same size.`;
  const rows = won
    ? [
      [`${plural(r.loose, 'weight')} hung`, r.parts.hung],
      ...(r.beams > 1 ? [[`${plural(r.beams, 'beam')}`, r.parts.structure]] : []),
      ['Candle left', r.parts.candle],
      ...(S.failed ? [[`${plural(S.failed, 'failed release')}`, r.parts.penalty]] : []),
    ]
    : [['This mobile', 0]];
  $('end-tally').innerHTML = rows.map(([k, v]) => `<li><span>${k}</span><b>${v > 0 ? `+${v}` : v}</b></li>`).join('')
    + `<li class="total"><span>Score</span><span>${S.score}</span></li>`;
  $('finish').hidden = !skillprint.reporting;
  card.hidden = false;
  requestAnimationFrame(() => card.classList.add('show'));
  S.card = true;
  refit();
  hud();
  $('next').focus({ preventScroll: true });
}

const ordinal = (n) => ['first', 'second', 'third', 'fourth', 'fifth'][n - 1] ?? `${n}th`;

function hideCard(id) {
  const card = $(id);
  card.classList.remove('show');
  setTimeout(() => { if (!card.classList.contains('show')) card.hidden = true; }, 500);
}

function next() {
  if (S.mode !== 'end') return;
  hideCard('end');
  S.card = false;
  stage.dim = 0;
  newMobile();
}

// Leaving: the portal shows its results; the SDK closes its session.
function finish() {
  if (S.mode === 'done' || S.mode === 'title' || S.mode === 'boot') return;
  if (S.mode === 'play' || S.mode === 'releasing' || S.mode === 'descend') {
    skillprint.event(GameEvent.LEVEL_QUIT, { mobile: S.number, trayLeft: trayLeft(), moves: S.moves, score: S.score });
  }
  S.mode = 'done';
  deselect();
  skillprint.finish({ score: S.score, mobiles: S.number, balanced: S.balanced });
  hideCard('end');
  S.card = false;
  $('actions').hidden = true;
  $('summary-sub').textContent = S.balanced
    ? `${plural(S.balanced, 'mobile')} balanced${S.number > S.balanced ? ` of ${S.number} hung` : ''}.`
    : 'Nothing balanced this time. The next show is yours.';
  $('summary-tally').innerHTML = `<li><span>Score</span><b>${S.score}</b></li><li><span>Best</span><b>${store.best}</b></li>`;
  const card = $('summary');
  card.hidden = false;
  requestAnimationFrame(() => card.classList.add('show'));
  hud();
}

function again() {
  if (S.mode !== 'done') return;
  hideCard('summary');
  Object.assign(S, { number: 0, balanced: 0, score: 0 });
  $('actions').hidden = false;
  skillprint.begin();
  skillprint.event(GameEvent.GAME_START, { best: store.best, balancedBefore: store.balanced, liveTilt: tuning.liveTilt });
  newMobile();
}

// The portal pauses the game from its own controls; the candle waits.
function setPaused(on) {
  if (S.paused === on) return;
  S.paused = on;
  if (on) cancelDrag();
  skillprint.event(on ? GameEvent.GAME_PAUSE : GameEvent.GAME_RESUME, { mobile: S.number, mode: S.mode });
  hud();
}

// ---------------------------------------------------------------------------
// What the portal keeps, and what the scorer reads off each frame

function report() {
  const p = puzzle();
  const playing = S.mode !== 'title' && S.mode !== 'boot';
  skillprint.state({
    score: S.score, isGameOver: false, mobile: playing ? S.number : 0, balanced: S.balanced, rung: playing ? p?.rung : null,
    beams: p?.beams.length, trayLeft: trayLeft(), beamsLevel: levelCount(), mode: S.mode, liveTilt: tuning.liveTilt, hintLevel: tuning.hintLevel,
  });
}

function describe() {
  const p = puzzle();
  if (!p || S.mode === 'title' || S.mode === 'boot') return ['Equilibrium · title screen'];
  const lines = [`Mobile ${S.number} · rung ${p.rung} · score ${S.score}`];
  const tray = S.mobile.weights.filter((v) => !S.place[v.id]).map((v) => v.w).sort((a, b) => a - b);
  const left = (S.duration - S.elapsed) || 0;
  lines.push(`${tray.length ? `Tray: ${tray.join(', ')}` : 'Tray empty'} · Candle ${clock(left)}${S.paused ? ' · paused' : ''}`);
  if (S.mode === 'solved' || (S.mode === 'end' && S.mobile.measures.every(balanced) && !stage.dim)) lines.push('Balanced');
  else if (S.mode === 'lost' || S.mode === 'end') lines.push('Candle out: showing a solution');
  else lines.push(`Beams level ${levelCount()} of ${p.beams.length}${S.mobile.held ? ' · held level (player sees no tilt)' : ''}`);
  return lines;
}

// ---------------------------------------------------------------------------
// HUD

let noteTimer = 0;
function note(html, ms = 3200) {
  $('note-text').innerHTML = html;
  $('note').classList.add('show');
  clearTimeout(noteTimer);
  noteTimer = setTimeout(() => $('note').classList.remove('show'), ms);
}

function hud() {
  const p = puzzle();
  if (!p || S.mode === 'title') return;
  $('plate-no').textContent = `Mobile ${S.number} · rung ${p.rung}`;
  const left = trayLeft();
  const m = S.mobile;
  let status;
  if (S.mode === 'solved' || (S.mode === 'end' && !stage.dim)) status = 'Balanced';
  else if (S.mode === 'lost' || S.mode === 'end') status = 'The candle’s out';
  else if (S.mode === 'releasing') status = 'Released…';
  else if (S.mode === 'done') status = 'The show is over';
  else if (m.held) status = left ? `<b>${left}</b> more to hang` : 'All hung. <b>Release</b> when it balances';
  else status = `<b>${levelCount()} of ${p.beams.length}</b> level${left ? ` · ${left} to hang` : ''}`;
  if (S.paused) status = 'Paused';
  $('plate-status').innerHTML = status;
  $('score-n').textContent = S.score;
  const rel = $('release');
  rel.hidden = !m.held || (S.mode !== 'play' && S.mode !== 'releasing');
  rel.disabled = S.mode !== 'play' || left > 0 || S.paused;
  rel.title = left ? 'Hang every weight first' : 'Let go and see if it balances';
  $('reset').disabled = S.mode !== 'play' || !m.weights.some((v) => !v.pinned && S.place[v.id]);
}

function candle() {
  const frac = S.mode === 'descend' ? 1 : Math.max(0, 1 - S.elapsed / S.duration);
  const h = 28 * frac;
  $('wax').setAttribute('y', 12 + 28 - h);
  $('wax').setAttribute('height', Math.max(0.5, h));
  const drop = 28 - h;
  $('flame').style.translate = `0 ${drop}px`;
  $('flame').style.opacity = frac > 0 ? 1 : 0;
  $('wick').setAttribute('y1', 9.5 + drop);
  $('wick').setAttribute('y2', 12 + drop);
  $('candle-time').textContent = clock(S.mode === 'descend' ? S.base * tuning.candleScale : S.duration - S.elapsed);
  $('candle').classList.toggle('low', frac < 0.2);
}

// ---------------------------------------------------------------------------
// Pointer: drag a weight to a hook, or tap a weight and then a hook

let drag = null;

function nearestHook(x, y, skip) {
  const m = S.mobile;
  const reach = Math.max(30, 0.55 * U * stage.pxPerUnit());
  let best = null, bestD = reach;
  for (const h of m.openHooks(skip)) {
    const a = stage.toScreen(h.hook), b = stage.toScreen(h.hang);
    const d = segDist(x, y, a.x, a.y, b.x, b.y);
    if (d < bestD) { best = h; bestD = d; }
  }
  return best;
}

function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const t = clamp(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1), 0, 1);
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function deselect() {
  if (S.selected < 0) return;
  S.selected = -1;
  S.mobile.select(-1);
  S.mobile.showHooks(false);
}

function cancelDrag() {
  if (!drag) return;
  if (drag.active) {
    // Whatever was in hand goes back where it was, without counting as a move.
    S.mobile.endDrag();
    if (drag.from) {
      S.place = S.place.slice();
      S.place[drag.id] = drag.from;
    }
    S.mobile.setPlace(S.place);
    S.mobile.showHooks(false);
    S.mobile.showTarget(null);
  }
  drag = null;
  canvas.classList.remove('grabbing');
}

const live = () => S.mode === 'play' && !S.paused;

canvas.addEventListener('pointerdown', (e) => {
  sound.start();
  if (!live()) return;
  const m = S.mobile;
  const id = m.pick(stage.raycaster(e.clientX, e.clientY));
  if (id < 0) {
    if (S.selected >= 0) {
      const h = nearestHook(e.clientX, e.clientY, S.selected);
      const sel = S.selected;
      deselect();
      if (h) hangAt(sel, h);
    }
    return;
  }
  const v = m.weights[id];
  if (v.pinned) {
    m.wiggle(id);
    sound.pinned();
    note('That one’s riveted in place.', 1800);
    return;
  }
  const world = stage.onPlane(e.clientX, e.clientY, 0);
  const at = m.rig.localToWorld(v.pos.clone());
  drag = { id, x: e.clientX, y: e.clientY, active: false, from: S.place[id], grab: at.sub(world), pointer: e.pointerId, target: null };
  canvas.setPointerCapture(e.pointerId);
});

canvas.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'mouse') stage.lean(e.clientX / innerWidth * 2 - 1, e.clientY / innerHeight * 2 - 1);
  const m = S.mobile;
  if (!drag) {
    if (live() && e.pointerType === 'mouse') {
      const id = m.pick(stage.raycaster(e.clientX, e.clientY));
      canvas.classList.toggle('grab', id >= 0 && !m.weights[id].pinned);
    }
    return;
  }
  if (e.pointerId !== drag.pointer) return;
  if (!drag.active) {
    if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 6) return;
    drag.active = true;
    deselect();
    m.startDrag(drag.id);
    if (drag.from) {
      S.place = S.place.slice();
      S.place[drag.id] = null;
      m.setPlace(S.place);
    }
    sound.lift();
    m.showHooks(true, drag.id);
    canvas.classList.add('grabbing');
  }
  m.dragTo(drag.id, stage.onPlane(e.clientX, e.clientY, 0).add(drag.grab));
  drag.target = nearestHook(e.clientX, e.clientY, drag.id);
  m.showTarget(drag.target);
});

function endPointer(e) {
  if (!drag || e.pointerId !== drag.pointer) return;
  const d = drag;
  drag = null;
  canvas.classList.remove('grabbing');
  const m = S.mobile;
  if (!live()) return;
  if (d.active) {
    m.endDrag();
    m.showHooks(false);
    m.showTarget(null);
    if (d.target) hangAt(d.id, d.target);
    else if (d.from) shelve(d.id, d.from);
    else m.setPlace(S.place);
    return;
  }
  // A tap: a hung weight goes home; a shelved one waits for a hook.
  if (d.from) {
    shelve(d.id, d.from);
  } else if (S.selected === d.id) {
    deselect();
  } else {
    deselect();
    S.selected = d.id;
    m.select(d.id);
    m.showHooks(true, -1);
    sound.lift();
    if (S.hinted++ < 2) note(`Now tap a hook for the <b>${m.weights[d.id].w}</b>.`, 2200);
  }
}
canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', (e) => { if (drag && e.pointerId === drag.pointer) cancelDrag(); });
canvas.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && !drag) stage.lean(0, 0); });

// ---------------------------------------------------------------------------
// Parameters that act at once. levelOffset and maxWeight wait for the next mobile.

onParameter((name, value) => {
  const m = S.mobile;
  if (name === 'candleScale') {
    const next = S.base * value;
    S.elapsed *= next / S.duration;
    S.duration = next;
  } else if (name === 'hintLevel') {
    if (m && S.mode !== 'title') m.setHints(value);
  } else if (name === 'liveTilt') {
    if (m && (S.mode === 'play' || S.mode === 'descend')) {
      m.setHeld(!value);
      if (S.mode === 'play') S.solveIn = value && solved(m.puzzle, S.place) ? 0.75 : 0;
    }
  }
  report();
  hud();
});

// ---------------------------------------------------------------------------
// Loop

function step(dt) {
  if (S.mode === 'descend' && !S.mobile.moving) startPlay();
  if (S.mode === 'play' && !S.paused) {
    S.elapsed += dt;
    if (S.solveIn > 0) {
      S.solveIn -= dt;
      if (S.solveIn <= 0 && solved(puzzle(), S.place)) celebrate();
    }
    if (S.mode === 'play' && S.elapsed >= S.duration) lose();
  } else if (S.mode === 'releasing' && !S.paused) {
    S.elapsed += dt;
    const before = S.releaseT;
    S.releaseT += dt;
    if (before < RELEASE_LOOK && S.releaseT >= RELEASE_LOOK) verdict();
    if (S.mode === 'releasing' && S.releaseT >= RELEASE_HOLD) {
      S.mode = 'play';
      S.mobile.setHeld(!tuning.liveTilt);
      if (S.elapsed >= S.duration) lose();
      hud();
    }
  }
  const frac = S.duration ? S.elapsed / S.duration : 0;
  const warmGoal = S.mode === 'play' || S.mode === 'releasing' ? clamp((frac - 0.7) / 0.3, 0, 1) : 0;
  stage.warmth += (warmGoal - stage.warmth) * (1 - Math.exp(-dt * 2));
  for (const m of S.leaving) m.update(dt);
  S.leaving = S.leaving.filter((m) => {
    if (m.moving) return true;
    m.dispose();
    return false;
  });
  S.mobile?.update(dt);
  stage.update(dt);
  if (S.mode !== 'title' && S.mode !== 'boot') candle();
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  step(dt);
  stage.render();
  skillprint.frame(now);
  requestAnimationFrame(loop);
}

// ---------------------------------------------------------------------------
// Buttons and keys

$('begin').addEventListener('click', begin);
$('release').addEventListener('click', release);
$('reset').addEventListener('click', clearAll);
$('next').addEventListener('click', next);
$('finish').addEventListener('click', finish);
$('quit').addEventListener('click', finish);
$('again').addEventListener('click', again);

const muteBtn = $('mute');
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

window.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  if (e.code === 'Space') {
    if (S.mode === 'play') { e.preventDefault(); release(); }
  } else if (e.key === 'Enter') {
    if (S.mode === 'title') begin();
    else if (S.mode === 'end') { e.preventDefault(); next(); }
    else if (S.mode === 'done') again();
  } else if (e.key === 'c' || e.key === 'C') {
    clearAll();
  } else if (e.key === 'm' || e.key === 'M') {
    muteBtn.click();
  } else if (e.key === 'Escape') {
    deselect();
  }
});

window.addEventListener('resize', () => { stage.resize(); refit(true); });
window.addEventListener('blur', () => cancelDrag());

// ---------------------------------------------------------------------------
// Test hooks: `let` bindings in a module aren't window properties.

window.__equilibriumControls = {
  start: begin,
  state: () => ({
    mode: S.mode, mobile: S.number, balanced: S.balanced, score: S.score, rung: puzzle()?.rung, held: S.mobile?.held,
    elapsed: +S.elapsed.toFixed(2), duration: +S.duration.toFixed(2), moves: S.moves, releases: S.releases, failed: S.failed,
    weights: S.mobile?.weights.map((v) => ({ id: v.id, w: v.w, pinned: v.pinned, at: S.place?.[v.id] ?? null, home: { beam: v.def.beam, d: v.def.d } })),
    beams: S.mobile?.measures.map((x, i) => ({ id: i, ...x, theta: +S.mobile.beams[i].theta.toFixed(3) })),
  }),
  hang: (id, beam, d) => { if (live()) hangAt(id, { beam, d }); },
  shelve: (id) => { if (live() && S.place[id]) shelve(id, S.place[id]); },
  solve() {
    if (!live()) return;
    const p = puzzle();
    for (const w of p.weights) if (w.loose && S.place[w.id]) shelve(w.id, S.place[w.id]);
    for (const w of p.weights) if (w.loose) hangAt(w.id, { beam: w.beam, d: w.d });
  },
  release,
  next,
  finish,
  clear: clearAll,
  // The same path an ADJUST_GAME message takes.
  adjust: (name, value) => skillprint.adjust(name, value),
  jump(rung) {
    S.balanced = Math.max(0, rung - 1 - tuning.levelOffset);
    if (S.mode === 'end') next();
    else if (S.mode === 'play' || S.mode === 'descend') { S.mode = 'end'; next(); }
  },
  step(ms) {
    for (let t = 0; t < ms; t += 1000 / 60) step(1 / 60);
    stage.render();
    skillprint.frame(performance.now());
  },
  // Screen positions, for driving the pointer in tests.
  screen() {
    const m = S.mobile;
    return {
      weights: m.weights.map((v) => ({ id: v.id, w: v.w, pinned: v.pinned, ...stage.toScreen(m.rig.localToWorld(v.pos.clone().setY(v.pos.y - v.shape.h / 2))) })),
      hooks: m.openHooks().map((h) => ({ beam: h.beam, d: h.d, ...stage.toScreen(h.hook) })),
    };
  },
};

// Fonts first, so the numbers on the weights are drawn in the right face.
Promise.race([
  Promise.all([document.fonts.load('700 112px "Outfit"'), document.fonts.load('500 50px "Outfit"'), document.fonts.load('italic 400 52px "Fraunces"')]),
  new Promise((r) => setTimeout(r, 2500)),
]).catch(() => {}).then(() => {
  boot();
  requestAnimationFrame(loop);
});
