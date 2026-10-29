// Elixir: read the recipe, work out each measure, and pour it by eye into a
// flask marked only empty and full.

import * as THREE from 'three';
import { World } from './world.js';
import { Apparatus, MAX_LEVEL } from './flask.js';
import { Card } from './card.js';
import { Sound } from './sound.js';
import { makeRecipe, effectiveTarget, grade, layerPoints } from './recipes.js';
import { LIQUIDS, GRADE_COLORS } from './look.js';
import { tuning, onParameter } from './params.js';
import { Skillprint, GameEvent } from './skillprint.js';

const KEY = 'elixir/v1';
const TAP_GAP = 0.25; // presses closer than this make one pour
const $ = (id) => document.getElementById(id);

const defaults = { served: 0, perfect: 0, best: 0, muted: false, shelf: [] };
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

// The recipe card stands on a little easel to the right of the flask.
const easel = new THREE.Group();
{
  const page = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 1.9),
    new THREE.MeshStandardMaterial({ map: card.texture, roughness: 0.95, emissive: '#ffffff', emissiveMap: card.texture, emissiveIntensity: 0.3, envMapIntensity: 0.15 }),
  );
  page.position.y = 1.02;
  easel.add(page);
  const woodMat = new THREE.MeshStandardMaterial({ color: '#4a2f1c', roughness: 0.8 });
  const ledge = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.06, 0.1), woodMat);
  ledge.position.set(0, 0.06, 0.04);
  easel.add(ledge);
  const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.9, 0.04), woodMat);
  leg.position.set(0, 0.92, -0.22);
  leg.rotation.x = -0.2;
  easel.add(leg);
  easel.position.set(-1.68, 0, 0.18);
  easel.rotation.set(-0.09, 0.16, 0);
  world.scene.add(easel);
  world.shadow(-1.68, 0.1, 0.95, 0.28, 0.7);
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
  // On the title the flask holds a finished potion and the shelf what you've served.
  for (const t of store.shelf.slice(-15)) world.addTrophy(t);
  S.recipe = makeRecipe(3, 7);
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
  layout();
  setTimeout(() => veil(false), 60);
}

function begin() {
  if (S.mode !== 'title') return;
  sound.start();
  skillprint.begin();
  skillprint.event(GameEvent.GAME_START, { potionsBefore: store.served });
  $('title').classList.add('leaving');
  setTimeout(() => { $('title').hidden = true; layout(); }, 600);
  S.recipe = null;
  S.layer = 0;
  flask.reset();
  startPotion();
}

// Skillprint's levelOffset moves the recipe up or down the ladder; the ladder
// itself follows how many potions the player has served this session.
function startPotion(rung = Math.max(1, S.served + 1 + tuning.levelOffset)) {
  const recipe = makeRecipe(rung, rngSeed());
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
  S.mode = flask.busy ? 'arriving' : 'brew';
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
  if (S.mode === 'judged') return nextPotion();
  if (S.mode !== 'brew') return;
  if (S.layer >= S.recipe.layers.length - 1) return serve(false);
  stopPour();
  closeGesture();
  S.ends[S.layer] = S.level;
  S.layer += 1;
  S.starts[S.layer] = S.level;
  S.layerAt[S.layer] = S.clock;
  flask.setIngredient(S.recipe.layers[S.layer].ingredient);
  flask.setBands(bands());
  sound.valve();
  card.draw({ recipe: S.recipe, number: S.potion, current: S.layer, results: null });
  hud();
  report();
}

// ---------------------------------------------------------------------------
// Judging.

function serve(timeUp) {
  if (S.mode !== 'brew') return;
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
  const trophy = b.map((x) => ({ color: LIQUIDS[x.ingredient].glow, from: x.from / Math.max(1, top), to: Math.min(1, x.to / Math.max(1, top)) }));
  sound.cork();
  flask.bottle(world.nextTrophySpot(), blend, () => {
    world.addTrophy(trophy, true);
    store.shelf.push(trophy);
    if (store.shelf.length > 15) store.shelf.shift();
    save();
    sound.shelf();
    startPotion();
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
// The page around the scene.

function hud() {
  const r = S.recipe;
  const playing = S.mode !== 'title' && S.mode !== 'boot' && S.mode !== 'done';
  $('top').hidden = !playing;
  $('bar').hidden = !playing || S.mode === 'judged' || S.mode === 'bottling';
  if (!r) return;
  $('potion-no').textContent = `Potion ${S.potion} · rung ${r.rung}`;
  $('potion-name').textContent = r.title;
  $('score').textContent = S.score;
  $('streak').textContent = S.streak > 1 ? `✦ streak ${S.streak}` : '';
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
  $('time').textContent = clock(S.glassLeft);
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
  if (res && S.mode === 'judged') {
    // Docked over the card, which says the same; frame the flask and the sill.
    if (document.body.classList.contains('wide')) { left = res.right + 8; bottom = 22; noCard = true; } else bottom = h - res.top + 8;
  } else if (b) bottom = h - b.top + 8;
  else bottom = 130;
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
  const lines = [`Potion ${S.potion} · rung ${r.rung} · score ${S.score}${S.streak > 1 ? ` · streak ${S.streak}` : ''}`];
  for (const t of r.text) lines.push(`Recipe: ${t}`);
  if (S.mode === 'brew') {
    lines.push(`Layer ${S.layer + 1} of ${r.layers.length} (${r.layers[S.layer].name}): level ${pct(S.level)} · target hidden${S.pouring ? ' · pouring' : ''}`);
    lines.push(`Hourglass ${clock(S.glassLeft)}${S.paused ? ' · paused' : ''}`);
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
  } else if (name === 'gradations') flask.setTicks(value);
});

function veil(on, text) {
  if (text) $('veil-text').textContent = text;
  $('veil').classList.toggle('on', on);
}

// ---------------------------------------------------------------------------

function tick(dt) {
  if (!S.paused && (S.mode === 'brew' || S.mode === 'judged' || S.mode === 'bottling' || S.mode === 'arriving')) S.clock += dt;
  if (S.mode === 'arriving' && !flask.busy) { S.mode = 'brew'; opened(); }
  if (S.mode === 'brew' && !S.paused) {
    if (S.pouring) {
      S.level = Math.min(MAX_LEVEL, S.level + (tuning.pourRate / 6) * dt);
      if (S.level >= MAX_LEVEL) stopPour();
      sound.pour(true, S.level);
      flask.setBands(bands());
    }
    if (S.gesture && !S.pouring && S.gesture.lastRelease != null && S.clock - S.gesture.lastRelease >= TAP_GAP) closeGesture();
    S.glassLeft -= dt;
    if (S.glassLeft < 5.5 && Math.ceil(S.glassLeft) !== S.lastTick) { S.lastTick = Math.ceil(S.glassLeft); sound.tick(); }
    if (S.glassLeft <= 0) { S.glassLeft = 0; serve(true); }
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

$('begin').addEventListener('click', begin);
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
  } else if (e.key === 'm' || e.key === 'M') {
    muteBtn.click();
  }
});
window.addEventListener('keyup', (e) => { if (e.code === 'Space') stopPour(); });
window.addEventListener('resize', () => { world.resize(); hud(); });

// For test harnesses: drive the game without real time or real hands.
window.__elixirControls = {
  start: () => begin(),
  state: () => ({ mode: S.mode, paused: S.paused, potion: S.potion, rung: S.recipe?.rung, layer: S.layer, level: S.level, score: S.score, streak: S.streak, glassLeft: S.glassLeft, glassTotal: S.glassTotal, ticks: flask.ticks.children.length, recipe: S.recipe?.text, results: S.results?.map((x) => ({ grade: x.grade, errorPct: x.errorPct, target: x.target })) }),
  step(ms) { let left = ms / 1000; while (left > 0) { const d = Math.min(1 / 60, left); tick(d); left -= d; } },
  /** Advances and draws n frames by hand, for a tab whose frames are throttled. */
  render(n = 1) { for (let i = 0; i < n; i++) { tick(1 / 60); if (S.recipe) hourglass(); world.render(); skillprint.frame(performance.now()); } return S.mode; },
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
