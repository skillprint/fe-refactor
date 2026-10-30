// Elixir: read the recipe, work out each measure, and pour it by eye into a
// vessel marked only empty and full. Each potion is brewed in another
// workshop, with its own room, vessel, tap, ingredients and card.

import * as THREE from 'three';
import { World } from './world.js';
import { Apparatus, MAX_LEVEL } from './flask.js';
import { Card } from './card.js';
import { Sound } from './sound.js';
import { makeRecipe, effectiveTarget, grade, layerPoints, Rng } from './recipes.js';
import { LIQUIDS, GRADE_COLORS } from './look.js';
import { WORKSHOPS, VESSELS, workshopById } from './workshops.js';
import { cardStand } from './rooms.js';
import { FIRST, SECOND, STEPS, TUTORIAL_RATE, FIRST_WINDOW } from './tutorial.js';
import { tuning, onParameter } from './params.js';
import { Skillprint, GameEvent } from './skillprint.js';

const KEY = 'elixir/v1';
const TAP_GAP = 0.25; // presses closer than this make one pour
const $ = (id) => document.getElementById(id);

const defaults = { served: 0, perfect: 0, best: 0, muted: false, shelf: [], tutorialDone: false };
function load() {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return { ...defaults }; }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(store)); } catch { /* private mode */ }
}
const store = load();

const canvas = $('scene');
let world;
try {
  world = new World(canvas);
} catch (e) {
  $('nogl').hidden = false;
  throw e;
}
const flask = new Apparatus(world);
const card = new Card();
const sound = new Sound();
const skillprint = new Skillprint({ canvas, describe });
skillprint.onPause = setPaused;
sound.muted = store.muted;

// The recipe card stands to the left of the vessel, in the workshop's own stand.
let easel = new THREE.Group();
world.shadow(-1.68, 0.1, 0.95, 0.28, 0.7);

/**
 * Turns the stage to this workshop: its room (seeded, so shelves and plants
 * vary), vessel and tap, card stock and stand.
 */
function setWorkshop(ws, seed, vessel = ws.vessel) {
  S.workshop = ws;
  S.vessel = vessel;
  world.setWorkshop(ws, new Rng(seed).next);
  flask.setMarks(ws.marks);
  flask.setVessel(vessel, ws.tap, ws.stand);
  card.setStyle(ws.card);
  const visible = easel.visible;
  world.scene.remove(easel);
  easel.traverse((o) => { o.geometry?.dispose(); if (o.material && o.material.map !== card.texture) o.material.dispose?.(); });
  easel = cardStand(ws.card.style, card.texture);
  easel.position.set(-1.68, 0, 0.18);
  easel.rotation.set(-0.09, 0.16, 0);
  easel.visible = visible;
  world.scene.add(easel);
}

// Every workshop shows before any repeats, and never the same one twice running.
// The first bag leaves out the alcove, where potion 1 was brewed.
const bag = [];
function nextWorkshop() {
  if (!bag.length) {
    const pool = S.cycled ? WORKSHOPS.slice() : WORKSHOPS.filter((w) => w !== S.workshop);
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    if (pool[0] === S.workshop) [pool[0], pool[pool.length - 1]] = [pool[pool.length - 1], pool[0]];
    bag.push(...pool);
    S.cycled = true;
  }
  return bag.shift();
}

const S = {
  mode: 'boot',      // title → brew → judged → bottling → (arriving) → brew …, or done
  clock: 0,          // seconds of play, stopped while paused
  paused: false,
  potion: 0,         // potions begun this session
  served: 0,
  score: 0,
  streak: 0,
  perfectLayers: 0,
  recipe: null,
  layer: 0,
  level: 0,
  starts: [],
  ends: [],
  layerAt: [],
  potionAt: 0,
  pouring: false,
  gesture: null,     // { at, level, lastRelease } while a pour (taps included) is open
  glassTotal: 24,
  glassBase: 24,
  glassLeft: 24,
  results: null,
  lastTick: 0,
  workshop: null,
  vessel: null,
  cycled: false,
  tutorial: null,    // { step, phase, at, stepAt, mistakes, … } while the tutorial runs
};

const rngSeed = () => (Math.random() * 2 ** 31) | 0;

// ---------------------------------------------------------------------------
// Writing measures for the page.

function html(parts) {
  return parts.map((p) => (typeof p === 'string' ? escape(p) : `<span class="fr"><sup>${p.n}</sup>⁄<sub>${p.d}</sub></span>`)).join('');
}
function escape(s) { return s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]); }
function lineHtml(L) {
  return `<span class="drop" style="color:${LIQUIDS[L.ingredient].css}"></span><span class="ing">${L.name}</span> — ${html(L.measure.parts)}`;
}
const pct = (x) => `${(x * 100).toFixed(1)} %`;
const signed = (e) => `${e >= 0 ? '+' : '−'}${Math.abs(e).toFixed(1)} %`;
const clock = (s) => { const t = Math.max(0, Math.ceil(s)); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; };

function capacityLabel(cap) {
  if (!cap) return 'full';
  if (cap.unit === 'ml') return cap.amount >= 1000 ? `${cap.amount / 1000} L` : `${cap.amount} ml`;
  return `${cap.amount} ${cap.unit}`;
}

// ---------------------------------------------------------------------------

function bands() {
  const out = [];
  for (let i = 0; i <= S.layer && S.recipe; i++) {
    const to = i < S.layer ? S.ends[i] : S.level;
    out.push({ ingredient: S.recipe.layers[i].ingredient, from: S.starts[i], to });
  }
  return out;
}

function boot() {
  // The title and the first potion are always the candlelit alcove.
  setWorkshop(WORKSHOPS[0], rngSeed());
  // On the title the flask holds a finished potion and the shelf what you've served.
  for (const t of store.shelf.slice(-15)) world.addTrophy(Array.isArray(t) ? { vessel: 'flask', bands: t } : t);
  S.recipe = makeRecipe(3, 7, S.workshop.ingredients);
  S.layer = 1;
  S.starts = [0, 0.375];
  S.ends = [0.375];
  S.level = 0.69;
  flask.setBands(bands());
  flask.setIngredient(S.recipe.layers[1].ingredient, true);
  card.draw({ recipe: S.recipe, number: store.served + 1, current: 1, results: null });
  S.mode = 'title';
  $('standing').textContent = store.served
    ? `${store.served} potion${store.served === 1 ? '' : 's'} served · ${store.perfect} perfect layer${store.perfect === 1 ? '' : 's'} · best ${store.best}`
    : 'Your first night at the bench.';
  $('title').hidden = false;
  $('howto').hidden = !store.tutorialDone;
  layout();
  setTimeout(() => veil(false), 60);
}

// The first play runs the tutorial; after that it's "How to play" on the title.
function begin(tutorial = !store.tutorialDone) {
  if (S.mode !== 'title') return;
  sound.start();
  skillprint.begin();
  skillprint.event(GameEvent.GAME_START, { potionsBefore: store.served });
  $('title').classList.add('leaving');
  setTimeout(() => { $('title').hidden = true; layout(); }, 600);
  S.recipe = null;
  S.layer = 0;
  flask.reset();
  if (tutorial) startTutorial(); else startPotion();
}

// Skillprint's levelOffset moves the recipe up or down the ladder; the ladder
// itself follows how many potions the player has served this session.
function startPotion(rung = Math.max(1, S.served + 1 + tuning.levelOffset)) {
  const recipe = makeRecipe(rung, rngSeed(), S.workshop.ingredients);
  S.recipe = recipe;
  S.potion += 1;
  S.layer = 0;
  S.level = 0;
  S.starts = [0];
  S.ends = [];
  S.layerAt = [S.clock];
  S.results = null;
  S.gesture = null;
  S.glassBase = 15 + 9 * recipe.layers.length;
  S.glassTotal = S.glassLeft = S.glassBase * tuning.brewTimeScale;
  flask.setIngredient(recipe.layers[0].ingredient, flask.busy);
  flask.setFullLabel(capacityLabel(recipe.capacity));
  flask.setBands([]);
  card.draw({ recipe, number: S.potion, current: 0, results: null });
  console.info(`[elixir] potion ${S.potion} (rung ${recipe.rung}): ${recipe.text.join(' | ')}`);
  hud();
  S.mode = flask.busy || world.fading ? 'arriving' : 'brew';
  if (S.mode === 'brew') opened();
}

// The potion is on the bench and the sand is running.
function opened() {
  const r = S.recipe;
  S.potionAt = S.clock;
  S.layerAt = [S.clock];
  skillprint.event(GameEvent.LEVEL_START, {
    potion: S.potion,
    rung: r.rung,
    workshop: S.workshop.id,
    vessel: S.vessel,
    title: r.title,
    intro: r.intro.map((l) => l.text),
    layers: r.layers.map((L) => ({ ingredient: L.ingredient, text: L.text, mode: L.mode, target: +(L.target[0] / L.target[1]).toFixed(4) })),
    capacity: r.capacity,
    hourglassSec: Math.round(S.glassTotal),
    pourRate: tuning.pourRate,
    gradations: tuning.gradations,
  });
  document.body.classList.add('brewing');
  hud();
  report();
}

// ---------------------------------------------------------------------------
// Pouring.

function startPour() {
  if (S.mode !== 'brew' || S.paused || S.pouring) return;
  if (S.level >= MAX_LEVEL - 1e-4) return;
  sound.start();
  S.pouring = true;
  flask.setPouring(true);
  sound.pour(true, S.level);
  if (!S.gesture) {
    S.gesture = { at: S.clock, level: S.level, lastRelease: null, layer: S.layer };
    skillprint.event('POUR_START', { potion: S.potion, layer: S.layer, ingredient: S.recipe.layers[S.layer].ingredient, level: +S.level.toFixed(4) });
  } else S.gesture.lastRelease = null;
}

function stopPour() {
  if (!S.pouring) return;
  S.pouring = false;
  flask.setPouring(false);
  sound.pour(false, S.level);
  if (S.gesture) S.gesture.lastRelease = S.clock;
}

function closeGesture() {
  const g = S.gesture;
  if (!g) return;
  S.gesture = null;
  const end = g.lastRelease ?? S.clock;
  skillprint.event('POUR_STOP', { potion: S.potion, layer: g.layer, level: +S.level.toFixed(4), poured: +(S.level - g.level).toFixed(4), ms: Math.round((end - g.at) * 1000) });
  report();
}

// The next ingredient, or the serve once the last is in.
function advance() {
  if (S.mode === 'title') return begin();
  if (S.tutorial) return tutorialEnter();
  if (S.mode === 'judged') return nextPotion();
  if (S.mode !== 'brew') return;
  if (S.layer >= S.recipe.layers.length - 1) return serve(false);
  nextLayer();
}

function nextLayer() {
  stopPour();
  closeGesture();
  S.ends[S.layer] = S.level;
  S.layer += 1;
  S.starts[S.layer] = S.level;
  S.layerAt[S.layer] = S.clock;
  flask.setIngredient(S.recipe.layers[S.layer].ingredient);
  flask.setBands(bands());
  sound.valve();
  drawCard();
  hud();
  report();
}

function drawCard() {
  card.draw({ recipe: S.recipe, number: S.potion, current: S.layer, results: S.results, heading: S.tutorial ? 'PRACTICE' : null });
}

// ---------------------------------------------------------------------------
// Judging.

function serve(timeUp) {
  if (S.mode !== 'brew' || S.tutorial) return;
  stopPour();
  closeGesture();
  const r = S.recipe;
  S.ends[S.layer] = S.level;
  const n = r.layers.length;
  const tol = tuning.tolerance;
  const ms = Math.round((S.clock - S.potionAt) * 1000);
  const results = r.layers.map((L, i) => {
    if (i > S.layer) return { grade: 'Spoiled', errorPct: null, target: null, level: null, points: 0 };
    const target = effectiveTarget(r.layers, i, S.starts, S.ends);
    const errorPct = (S.ends[i] - target) * 100;
    return { grade: grade(errorPct, tol), errorPct, target, level: S.ends[i], points: layerPoints(errorPct, tol), layerMs: Math.round(((i < S.layer ? S.layerAt[i + 1] : S.clock) - S.layerAt[i]) * 1000) };
  });
  const base = results.reduce((a, x) => a + x.points, 0);
  const bonus = timeUp ? 0 : Math.round(base * 0.3 * Math.max(0, S.glassLeft / S.glassTotal));
  const clean = results.every((x) => x.grade === 'Perfect' || x.grade === 'Fine');
  S.streak = clean ? S.streak + 1 : 0;
  const mult = 1 + 0.1 * Math.min(5, Math.max(0, S.streak - 1));
  const points = Math.round((base + bonus) * mult);
  S.score += points;
  S.served += 1;
  S.results = results;
  S.mode = 'judged';
  document.body.classList.remove('brewing');

  const perfect = results.filter((x) => x.grade === 'Perfect').length;
  S.perfectLayers += perfect;
  store.served += 1;
  store.perfect += perfect;
  store.best = Math.max(store.best, S.score);
  save();

  results.forEach((x, i) => {
    const L = r.layers[i];
    const good = x.grade === 'Perfect' || x.grade === 'Fine';
    skillprint.event(good ? GameEvent.MATCH : GameEvent.UNMATCH, {
      potion: S.potion, layer: i, ingredient: L.ingredient, text: L.text, mode: L.mode,
      target: x.target == null ? null : +x.target.toFixed(4), level: x.level == null ? null : +x.level.toFixed(4),
      errorPct: x.errorPct == null ? null : +x.errorPct.toFixed(2), grade: x.grade, layerMs: x.layerMs ?? null, msToServe: ms,
    });
    sound.grade(x.grade, i);
  });
  const outcome = { potion: S.potion, rung: r.rung, grades: results.map((x) => x.grade), points, base, timeBonus: bonus, streak: S.streak, multiplier: mult, score: S.score, ms, timeUp };
  skillprint.event(timeUp ? GameEvent.LEVEL_FAILED : GameEvent.LEVEL_COMPLETE, outcome);

  flask.showTargets(results.map((x, i) => (x.target == null ? null : { level: x.target, text: `${signed(x.errorPct)}`, color: GRADE_COLORS[x.grade], i })).filter(Boolean));
  card.draw({ recipe: r, number: S.potion, current: S.layer, results });
  showResult(results, { points, base, bonus, mult, timeUp });
  hud();
  report();
}

function verdict(results, timeUp) {
  const g = results.map((x) => x.grade);
  if (timeUp) return ['The sand ran out', 'Served as it stood.'];
  if (g.every((x) => x === 'Perfect')) return ['Perfectly measured', 'The alchemist nods, slowly, twice.'];
  if (g.every((x) => x === 'Perfect' || x === 'Fine')) return ['A fine potion', 'It glows the way it should.'];
  if (g.includes('Spoiled')) return ['Spoiled', 'It smells faintly of burnt sugar. Pour the next one truer.'];
  return ['Drinkable', 'Close. The gold lines show where it should have been.'];
}

function showResult(results, { points, base, bonus, mult, timeUp }) {
  const r = S.recipe;
  const [head, sub] = verdict(results, timeUp);
  $('result-head').textContent = head;
  $('result-sub').textContent = sub;
  $('result-list').innerHTML = results.map((x, i) => {
    const L = r.layers[i];
    const detail = x.errorPct == null ? 'not poured before the sand ran out' : `poured to ${pct(x.level)} · the line was ${pct(x.target)} · ${signed(x.errorPct)}`;
    return `<li><span>${lineHtml(L)}</span><span class="grade" style="color:${GRADE_COLORS[x.grade]}">${x.grade}</span><span class="detail">${detail}</span></li>`;
  }).join('');
  const parts = [`layers ${base}`];
  if (bonus) parts.push(`sand ${bonus}`);
  let line = parts.join(' + ');
  if (mult > 1) line = `(${line}) × ${mult.toFixed(1)} streak`;
  $('result-score').textContent = `${line} = ${points}  ·  total ${S.score}`;
  $('finish').hidden = !skillprint.reporting;
  $('bar').hidden = true;
  $('result').hidden = false;
  requestAnimationFrame(() => $('result').classList.add('show'));
  layout();
}

function hideResult() {
  $('result').classList.remove('show');
  setTimeout(() => { if (S.mode !== 'judged') $('result').hidden = true; layout(); }, 450);
}

// Cork it, set it on the shelf, and bring the next flask.
function nextPotion() {
  if (S.mode !== 'judged') return;
  S.mode = 'bottling';
  hideResult();
  const b = bands().filter((x) => x.to - x.from > 1e-3);
  const blend = new THREE.Color(0, 0, 0);
  let vol = 0;
  for (const x of b) {
    const v = x.to - x.from;
    blend.add(new THREE.Color(LIQUIDS[x.ingredient].glow).multiplyScalar(v));
    vol += v;
  }
  if (vol > 0) blend.multiplyScalar(1 / vol); else blend.set(LIQUIDS[S.recipe.layers[0].ingredient].glow);
  const top = Math.max(1e-3, ...b.map((x) => x.to), 0.05);
  const trophy = { vessel: S.vessel, bands: b.map((x) => ({ color: LIQUIDS[x.ingredient].glow, from: x.from / Math.max(1, top), to: Math.min(1, x.to / Math.max(1, top)) })) };
  sound.cork();
  flask.bottle(world.nextTrophySpot(), blend, () => {
    world.addTrophy(trophy, true);
    store.shelf.push(trophy);
    if (store.shelf.length > 15) store.shelf.shift();
    save();
    sound.shelf();
    // Fade to the next workshop, and grow its vessel there.
    const ws = nextWorkshop();
    world.transition(() => {
      setWorkshop(ws, rngSeed());
      flask.group.scale.setScalar(0.001);
      flask.group.visible = false;
      flask.regrow();
      layout();
      startPotion();
    });
  });
}

function finish() {
  if (S.mode !== 'judged') return;
  S.mode = 'done';
  skillprint.finish({ score: S.score, potions: S.served, perfectLayers: S.perfectLayers });
  hideResult();
  $('bar').hidden = true;
  $('summary-head').textContent = `${S.score} points`;
  $('summary-text').textContent = `${S.served} potion${S.served === 1 ? '' : 's'} served tonight. The shelf will keep them.`;
  $('summary').hidden = false;
}

// ---------------------------------------------------------------------------
// The tutorial: learn by doing, one instruction at a time, in the alcove.
// No sand, no score, no rungs; a slow pour whatever the parameters say, and
// misses are shown, never charged.

function startTutorial() {
  S.tutorial = { step: -1, phase: 'pour', at: S.clock, stepAt: S.clock, mistakes: 0, then: null, lastLevel: null };
  skillprint.event('TUTORIAL_START', { replay: Boolean(store.tutorialDone) });
  flask.setTicks(0);
  $('coach').hidden = false;
  document.body.classList.add('brewing');
  tutorialStep(0);
}

function tutorialStep(n) {
  const T = S.tutorial;
  if (T.step >= 0) skillprint.event('TUTORIAL_STEP', { step: T.step + 1, name: STEPS[T.step].name, ms: Math.round((S.clock - T.stepAt) * 1000) });
  Object.assign(T, { step: n, stepAt: S.clock, phase: 'pour', then: null, lastLevel: null });
  stopPour();
  S.gesture = null;
  // Steps 1 and 3 start a fresh flask; 2 and 4 pour its next layer.
  if (n === 0 || n === 2) practice(n === 0 ? FIRST : SECOND);
  else nextLayer();
  flask.setGuide(n === 0 ? 0.5 : null);
  coach(STEPS[n]);
  hud();
  report();
}

function practice(recipe) {
  Object.assign(S, { recipe, layer: 0, level: 0, starts: [0], ends: [], layerAt: [S.clock], results: null, gesture: null, mode: 'brew', glassTotal: 30, glassLeft: 30 });
  flask.reset();
  flask.setIngredient(recipe.layers[0].ingredient, true);
  flask.setFullLabel(capacityLabel(recipe.capacity));
  flask.setBands([]);
  drawCard();
}

/** What the coach card says; `next` labels its button when the step waits on one. */
function coach({ title, text, note = '', next = null }) {
  const T = S.tutorial;
  // While a step waits on a pour, the button is the step's action.
  if (!next && T.phase === 'pour') next = ['', 'Check', 'Next ingredient', 'Serve'][T.step] || null;
  $('coach-kicker').textContent = `Tutorial · step ${T.step + 1} of ${STEPS.length}`;
  $('coach-title').textContent = title;
  $('coach-text').innerHTML = text;
  $('coach-note').textContent = note;
  $('coach-next').hidden = !next;
  if (next) $('coach-next-label').textContent = next;
  layout();
}

const later = (sec, fn) => { S.tutorial.then = fn; S.tutorial.thenAt = S.clock + sec; };

/** A layer judged as the game would, at tolerance 1 whatever the session's is. */
function judgeLayer(i) {
  const ends = [...S.ends.slice(0, S.layer), S.level];
  const target = effectiveTarget(S.recipe.layers, i, S.starts, ends);
  const errorPct = (ends[i] - target) * 100;
  return { target, errorPct, grade: grade(errorPct, 1), level: ends[i], points: 0 };
}

// Step 1 moves on by itself once a pour has stopped near the dotted line.
function tutorialTick() {
  const T = S.tutorial;
  if (T.then) {
    if (S.clock >= T.thenAt) { const f = T.then; T.then = null; f(); }
    return;
  }
  if (T.step !== 0 || T.phase !== 'pour' || S.pouring || S.gesture || S.level < 0.005 || T.lastLevel === S.level) return;
  T.lastLevel = S.level;
  const off = S.level - 0.5;
  if (Math.abs(off) <= FIRST_WINDOW) {
    T.phase = 'done';
    sound.grade(Math.abs(off) <= 0.01 ? 'Perfect' : 'Fine');
    coach({ title: 'Right on the line', text: `You stopped at <b>${pct(S.level)}</b>. That’s the whole trick: let go on the line.` });
    later(1.8, () => tutorialStep(1));
  } else if (off > FIRST_WINDOW) {
    T.phase = 'miss';
    T.mistakes += 1;
    sound.grade('Fair');
    coach({ title: 'A little past it', text: `That’s <b>${signed(off * 100)}</b> past the line, and there’s no draining. Let’s pour that one again.`, note: 'The level stops the instant you let go, so let go on the line.' });
    later(2.6, () => { T.phase = 'pour'; T.lastLevel = null; practice(FIRST); flask.setGuide(0.5); coach(STEPS[0]); hud(); });
  } else {
    $('coach-note').textContent = `${pct(S.level)} so far: a little more. Quick taps nudge it up.`;
  }
}

// Enter, Check, Next, Serve: whatever the step is waiting for.
function tutorialEnter() {
  const T = S.tutorial;
  if (T.then || T.step === 0) return;
  const need = (what) => { $('coach-note').textContent = `Pour some ${what} first: hold anywhere, or Space.`; };
  const bad = (g) => g === 'Fair' || g === 'Spoiled';
  if (T.step === 1) {
    if (T.phase === 'checked') return tutorialStep(2);
    if (S.level < S.starts[1] + 0.01) return need('Emberwine');
    stopPour();
    closeGesture();
    const r = judgeLayer(1);
    T.phase = 'checked';
    if (bad(r.grade)) T.mistakes += 1;
    sound.grade(r.grade);
    flask.showTargets([{ level: r.target, text: signed(r.errorPct), color: GRADE_COLORS[r.grade] }]);
    const hint = Math.abs(r.errorPct) <= 1 ? '' : ' ¾ sits halfway between ½ and full.';
    coach({ title: r.grade, text: `You stopped at <b>${pct(r.level)}</b>; the gold line is ¾, at <b>${pct(r.target)}</b> (${signed(r.errorPct)}).${hint}`, note: 'Perfect is within 1 % of the flask, Fine within 3 %, Fair within 6 %. Beyond that, it’s Spoiled.', next: 'Next' });
    hud();
    return;
  }
  if (T.step === 2) {
    if (S.level < 0.01) return need('Nightshade');
    stopPour();
    closeGesture();
    const r = judgeLayer(0);
    T.phase = 'checked';
    if (bad(r.grade)) T.mistakes += 1;
    sound.grade(r.grade);
    flask.showTargets([{ level: r.target, text: signed(r.errorPct), color: GRADE_COLORS[r.grade] }]);
    coach({ title: '50 of 200 drops is ¼', text: `A quarter of the flask is <b>${pct(r.target)}</b>. You poured <b>${pct(r.level)}</b> (${signed(r.errorPct)}): ${r.grade}.` });
    later(2.4, () => tutorialStep(3));
    hud();
    return;
  }
  if (T.step === 3) {
    if (T.phase === 'served') return completeTutorial();
    if (S.level < S.starts[1] + 0.01) return need('Sunmilk');
    stopPour();
    closeGesture();
    S.ends[1] = S.level;
    S.results = [judgeLayer(0), judgeLayer(1)];
    T.phase = 'served';
    for (const [i, r] of S.results.entries()) { if (bad(r.grade)) T.mistakes += 1; sound.grade(r.grade, i); }
    flask.showTargets(S.results.map((r) => ({ level: r.target, text: signed(r.errorPct), color: GRADE_COLORS[r.grade] })));
    drawCard();
    const last = S.results[1];
    coach({ title: 'That’s the craft', text: 'Read the recipe, work out where the line falls, pour, and let go on it. From here each potion is brewed in a different workshop, with the sand running.', note: `Sunmilk: ${signed(last.errorPct)}, ${last.grade}. The card shows every layer’s grade.`, next: 'Brew potion 1' });
    hud();
  }
}

function completeTutorial() {
  const T = S.tutorial;
  skillprint.event('TUTORIAL_STEP', { step: T.step + 1, name: STEPS[T.step].name, ms: Math.round((S.clock - T.stepAt) * 1000) });
  skillprint.event('TUTORIAL_COMPLETE', { ms: Math.round((S.clock - T.at) * 1000), mistakes: T.mistakes });
  endTutorial();
}

function skipTutorial() {
  if (!S.tutorial) return;
  skillprint.event('TUTORIAL_SKIP', { step: S.tutorial.step + 1 });
  endTutorial();
}

function endTutorial() {
  store.tutorialDone = true;
  save();
  stopPour();
  S.tutorial = null;
  S.gesture = null;
  $('coach').hidden = true;
  $('pointer').hidden = true;
  flask.setGuide(null);
  flask.reset();
  flask.setTicks(tuning.gradations);
  S.results = null;
  startPotion();
}

// The ring on whatever the coach is talking about, found on screen each frame.
const screenOf = (v) => { const p = v.clone().project(world.camera); return { x: ((p.x + 1) / 2) * innerWidth, y: ((1 - p.y) / 2) * innerHeight }; };
const centreOf = (el) => { if (!el || el.hidden) return null; const r = el.getBoundingClientRect(); return r.width ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null; };

function updatePointer() {
  const el = $('pointer');
  const T = S.tutorial;
  let at = null, line = null;
  if (T && S.mode === 'brew' && !world.fading) {
    const s = flask.shape;
    const lineAt = (level) => {
      const l = screenOf(new THREE.Vector3(-s.left, s.yOf(level), 0)), r = screenOf(new THREE.Vector3(s.right, s.yOf(level), 0));
      return { x: (l.x + r.x) / 2, y: (l.y + r.y) / 2, w: r.x - l.x + 26 };
    };
    if (T.step === 0 && T.phase === 'pour') line = lineAt(0.5);
    else if (T.step === 1 && T.phase === 'checked') line = lineAt(0.75);
    else if (T.step === 1) at = easel.visible ? screenOf(easel.userData.page.localToWorld(new THREE.Vector3(-0.1, 0.32, 0))) : centreOf(document.querySelector('#recipe-panel .line.now'));
    else if (T.step === 2 && T.phase === 'pour') at = screenOf(flask.fullLabel.getWorldPosition(new THREE.Vector3()));
    else if (T.step === 3 && T.phase === 'pour') at = S.clock - T.stepAt < 3.5 ? centreOf($('glass-timer')) : centreOf($('coach-next'));
  }
  const p = line || at;
  el.hidden = !p;
  if (!p) return;
  el.classList.toggle('wide', Boolean(line));
  el.style.left = `${p.x}px`;
  el.style.top = `${p.y}px`;
  if (line) { el.style.width = `${line.w}px`; el.style.marginLeft = `${-line.w / 2}px`; } else { el.style.width = ''; el.style.marginLeft = ''; }
}

// ---------------------------------------------------------------------------
// The page around the scene.

function hud() {
  const r = S.recipe;
  const playing = S.mode !== 'title' && S.mode !== 'boot' && S.mode !== 'done';
  $('top').hidden = !playing;
  // In the tutorial the coach card carries the instruction and its button.
  $('bar').hidden = !playing || S.mode === 'judged' || S.mode === 'bottling' || Boolean(S.tutorial);
  if (!r) return;
  const T = S.tutorial;
  $('potion-no').textContent = T ? 'Tutorial · practice' : `Potion ${S.potion} · rung ${r.rung}`;
  $('potion-name').textContent = r.title;
  $('score').textContent = T ? '—' : S.score;
  $('streak').textContent = !T && S.streak > 1 ? `✦ streak ${S.streak}` : '';
  const L = r.layers[S.layer];
  const last = S.layer >= r.layers.length - 1;
  $('step-kicker').textContent = `Layer ${S.layer + 1} of ${r.layers.length}${r.capacity ? ` · flask holds ${capacityLabel(r.capacity)}` : ''}`;
  $('step').innerHTML = lineHtml(L);
  $('next-label').textContent = last ? 'Serve' : 'Next ingredient';
  // On tall screens the recipe is too small to read on the card; it goes up top instead.
  const panel = $('recipe-panel');
  panel.hidden = !world.portrait || !playing || S.mode === 'done';
  if (!panel.hidden) {
    const intro = r.intro.map((l) => `<p class="intro">${html(l.parts)}</p>`).join('');
    const lines = r.layers.map((x, i) => `<p class="line${!S.results && i === S.layer ? ' now' : ''}${!S.results && i < S.layer ? ' done' : ''}">${lineHtml(x)}</p>`).join('');
    panel.innerHTML = intro + lines;
  }
  layout();
}

function hourglass() {
  const k = Math.max(0, Math.min(1, S.glassLeft / S.glassTotal));
  $('sand-top').setAttribute('y', String(2 + 15 * (1 - k)));
  $('sand-top').setAttribute('height', String(15 * k));
  $('sand-bottom').setAttribute('y', String(32 - 15 * (1 - k)));
  $('sand-bottom').setAttribute('height', String(15 * (1 - k)));
  $('time').textContent = S.tutorial ? 'practice' : clock(S.glassLeft);
  $('glass-timer').classList.toggle('low', S.mode === 'brew' && S.glassLeft < 6);
}

// Keep the flask framed in the space the HUD leaves.
function layout() {
  const h = innerHeight, w = innerWidth;
  // The card arrives with the first recipe; on tall screens the panel up top replaces it.
  easel.visible = !world.portrait && S.mode !== 'title' && S.mode !== 'boot';
  document.body.classList.toggle('wide', !world.portrait && w >= 900);
  let top = 12, bottom = 18, left = 18, right = 18;
  const vis = (id) => !$(id).hidden && $(id).getBoundingClientRect();
  const t = vis('top');
  if (t) top = t.bottom + 8;
  const p = vis('recipe-panel');
  if (p) {
    $('recipe-panel').style.top = `${(t ? t.bottom : 12) + 8}px`;
    top = $('recipe-panel').getBoundingClientRect().bottom + 6;
  }
  const b = vis('bar');
  const res = vis('result');
  let noCard = false;
  const wide = document.body.classList.contains('wide');
  const co = vis('coach');
  if (res && S.mode === 'judged') {
    // Docked over the card, which says the same; frame the flask and the sill.
    if (wide) { left = res.right + 8; bottom = 22; noCard = true; } else bottom = h - res.top + 8;
  } else if (co && !wide) {
    // The coach card sits above the bar on narrow screens; the stage keeps clear of it.
    $('coach').style.bottom = `${(b ? h - b.top : 14) + 8}px`;
    bottom = h - $('coach').getBoundingClientRect().top + 6;
  } else if (b) bottom = h - b.top + 8;
  else bottom = S.tutorial ? 24 : 130;
  // On wide screens it docks right.
  if (co && wide) right = w - co.left + 8;
  const ti = !$('title').classList.contains('leaving') && vis('title');
  if (ti && !world.portrait) { left = ti.right + 10; noCard = true; }
  if (ti && world.portrait) bottom = h - ti.top + 8;
  world.fit({ top, bottom, left, right, noCard });
}

function report() {
  const r = S.recipe;
  skillprint.state({
    score: S.score, isGameOver: false, potions: S.served, potion: S.potion, rung: r?.rung,
    layer: S.layer, layers: r?.layers.length, level: +S.level.toFixed(4), mode: S.mode, streak: S.streak,
  });
}

// What the scorer reads off each frame. The numeric target is never written
// before serving: working it out from the recipe is the game.
function describe() {
  const r = S.recipe;
  if (!r || S.mode === 'boot' || S.mode === 'title') return ['Elixir · title screen'];
  const T = S.tutorial;
  const lines = [T ? `Tutorial · step ${T.step + 1} of ${STEPS.length}` : `Potion ${S.potion} · rung ${r.rung} · score ${S.score}${S.streak > 1 ? ` · streak ${S.streak}` : ''}`];
  for (const t of r.text) lines.push(`Recipe: ${t}`);
  if (S.mode === 'brew') {
    lines.push(`Layer ${S.layer + 1} of ${r.layers.length} (${r.layers[S.layer].name}): level ${pct(S.level)} · target hidden${S.pouring ? ' · pouring' : ''}`);
    if (!T) lines.push(`Hourglass ${clock(S.glassLeft)}${S.paused ? ' · paused' : ''}`);
  } else if (S.results) {
    lines.push(`Served: ${S.results.map((x, i) => `${r.layers[i].name} ${x.errorPct == null ? 'not poured' : signed(x.errorPct)} ${x.grade}`).join(', ')}`);
  }
  return lines;
}

function setPaused(on) {
  if (S.paused === on) return;
  S.paused = on;
  if (on) stopPour();
  skillprint.event(on ? GameEvent.GAME_PAUSE : GameEvent.GAME_RESUME, { potion: S.potion, mode: S.mode });
}

onParameter((name, value, before) => {
  if (name === 'brewTimeScale' && S.recipe) {
    const next = S.glassBase * value;
    S.glassLeft *= next / S.glassTotal;
    S.glassTotal = next;
  } else if (name === 'gradations' && !S.tutorial) flask.setTicks(value);
});

function veil(on, text) {
  if (text) $('veil-text').textContent = text;
  $('veil').classList.toggle('on', on);
}

// ---------------------------------------------------------------------------

function tick(dt) {
  if (!S.paused && (S.mode === 'brew' || S.mode === 'judged' || S.mode === 'bottling' || S.mode === 'arriving')) S.clock += dt;
  if (S.mode === 'arriving' && !flask.busy && !world.fading) { S.mode = 'brew'; opened(); }
  if (S.mode === 'brew' && !S.paused) {
    if (S.pouring) {
      S.level = Math.min(MAX_LEVEL, S.level + ((S.tutorial ? TUTORIAL_RATE : tuning.pourRate) / 6) * dt);
      if (S.level >= MAX_LEVEL) stopPour();
      sound.pour(true, S.level);
      flask.setBands(bands());
    }
    if (S.gesture && !S.pouring && S.gesture.lastRelease != null && S.clock - S.gesture.lastRelease >= TAP_GAP) closeGesture();
    if (S.tutorial) tutorialTick();
    else {
      S.glassLeft -= dt;
      if (S.glassLeft < 5.5 && Math.ceil(S.glassLeft) !== S.lastTick) { S.lastTick = Math.ceil(S.glassLeft); sound.tick(); }
      if (S.glassLeft <= 0) { S.glassLeft = 0; serve(true); }
    }
  }
  world.update(dt);
  flask.update(dt);
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  tick(dt);
  if (S.recipe) hourglass();
  world.render();
  skillprint.frame(now);
  updatePointer();
  requestAnimationFrame(loop);
}

// ---------------------------------------------------------------------------

canvas.addEventListener('pointerdown', (e) => {
  if (e.button !== 0) return;
  // Inside the portal's iframe, a press on the stage must also bring the keys (Space, Enter) here.
  window.focus();
  sound.start();
  if (S.mode === 'brew') { canvas.setPointerCapture?.(e.pointerId); startPour(); }
});
for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(ev, stopPour);
window.addEventListener('blur', stopPour);
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

$('begin').addEventListener('click', () => begin());
$('howto').addEventListener('click', () => begin(true));
$('skip').addEventListener('click', skipTutorial);
$('coach-next').addEventListener('click', advance);
$('next').addEventListener('click', advance);
$('again').addEventListener('click', nextPotion);
$('finish').addEventListener('click', finish);
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
  if (e.code === 'Space') {
    e.preventDefault();
    if (!e.repeat) startPour();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (!e.repeat) advance();
  } else if (e.key === 'Escape') {
    skipTutorial();
  } else if (e.key === 'm' || e.key === 'M') {
    muteBtn.click();
  }
});
window.addEventListener('keyup', (e) => { if (e.code === 'Space') stopPour(); });
window.addEventListener('resize', () => { world.resize(); hud(); });

// For test harnesses: drive the game without real time or real hands.
window.__elixirControls = {
  start: () => begin(),
  state: () => ({ mode: S.mode, paused: S.paused, workshop: S.workshop?.id, vessel: S.vessel, potion: S.potion, rung: S.recipe?.rung, layer: S.layer, level: S.level, score: S.score, streak: S.streak, glassLeft: S.glassLeft, glassTotal: S.glassTotal, ticks: flask.ticks?.children.length ?? 0, recipe: S.recipe?.text, results: S.results?.map((x) => ({ grade: x.grade, errorPct: x.errorPct, target: x.target })) }),
  step(ms) { let left = ms / 1000; while (left > 0) { const d = Math.min(1 / 60, left); tick(d); left -= d; } },
  /** Advances and draws n frames by hand, for a tab whose frames are throttled. */
  render(n = 1) { for (let i = 0; i < n; i++) { tick(1 / 60); if (S.recipe) hourglass(); world.render(); skillprint.frame(performance.now()); updatePointer(); } return S.mode; },
  /** Starts the tutorial: from the title, or over whatever is brewing. */
  tutorial() { if (S.mode === 'title') begin(true); else if (!S.tutorial && S.mode === 'brew') { flask.reset(); startTutorial(); } return this.tutorialStep(); },
  tutorialStep: () => (S.tutorial ? { step: S.tutorial.step + 1, of: STEPS.length, name: STEPS[S.tutorial.step].name, phase: S.tutorial.phase, mistakes: S.tutorial.mistakes, title: $('coach-title').textContent, text: $('coach-text').textContent, note: $('coach-note').textContent } : null),
  tutorialSkip: () => skipTutorial(),
  /** Waits out a tutorial pause (its feedback beat) in simulated time. */
  tutorialWait() { if (S.tutorial?.then) this.step(Math.max(0, (S.tutorial.thenAt - S.clock) * 1000) + 40); return this.tutorialStep(); },
  pour(ms) { startPour(); this.step(ms); stopPour(); },
  pourTo(level) {
    if (S.mode !== 'brew' || level < S.level) return false;
    startPour();
    S.level = Math.min(MAX_LEVEL, level);
    flask.setBands(bands());
    stopPour();
    this.step(TAP_GAP * 1000 + 20);
    return true;
  },
  /** The level this layer should end at, from what the flask really holds. */
  target: () => (S.recipe ? effectiveTarget(S.recipe.layers, S.layer, S.starts, [...S.ends.slice(0, S.layer), S.level]) : null),
  next: () => advance(),
  serve: () => serve(false),
  nextPotion: () => nextPotion(),
  finish: () => finish(),
  newPotion(rung) { if (S.mode !== 'brew') return false; flask.reset(); S.potion -= 1; startPotion(rung); return S.recipe.text; },
  /** Moves to a workshop (and optionally another vessel) at once, with a fresh potion at `rung`. */
  workshop(id, rung = S.recipe?.rung ?? 1, vessel) {
    if (S.mode !== 'brew') return false;
    stopPour();
    setWorkshop(workshopById(id), rngSeed(), vessel && VESSELS[vessel] ? vessel : undefined);
    flask.reset();
    flask.setTicks(tuning.gradations);
    S.potion -= 1;
    startPotion(rung);
    layout();
    return { workshop: S.workshop.id, vessel: S.vessel, recipe: S.recipe.text };
  },
  frame: () => ({ ...world.frameSpec, pxPerUnit: world.pxPerUnit, pxPerPercent: (world.pxPerUnit * flask.shape.h) / 100 }),
  solve(error = 0) {
    for (let i = S.layer; i < S.recipe.layers.length; i++) {
      this.pourTo(this.target() + error);
      if (i < S.recipe.layers.length - 1) advance();
    }
    serve(false);
    return S.results.map((x) => x.grade);
  },
};

flask.setTicks(tuning.gradations);
// Let the veil paint before the first build; timers, not frames, so a hidden tab still boots.
setTimeout(async () => {
  const fonts = ['500 40px "Cormorant Garamond"', '600 40px "Cormorant Garamond"', '700 40px "Cormorant Garamond"', 'italic 600 40px "Cormorant Garamond"'];
  try { await Promise.race([Promise.all(fonts.map((f) => document.fonts.load(f))), new Promise((r) => setTimeout(r, 2000))]); } catch { /* fonts are a nicety */ }
  boot();
  requestAnimationFrame(loop);
}, 30);
