// Mountain Appreciator: the loop that ties the light, the twins and the
// player's attention together.

import { World } from './world.js';
import { View } from './view.js';
import { UI } from './ui.js';
import { Sound } from './sound.js';
import { buildRound } from './round.js';
import { ATMOS } from './gfx.js';
import { ARCH_IDS } from './terrain.js';
import { Rng, lerp, clamp } from './noise.js';
import { MISSES, CLOUDS, PERFECT, INTROS, rankFor } from './words.js';
import { KINDS } from './features.js';

const KEY = 'mountain-appreciator/v1';
const MISS_COST = 7;
const BLINK_RATE = 4;
const titleTod = (round) => (round.night ? 0.3 : 0.66);
const FIRST_ARCHES = ['horn', 'volcano', 'massif', 'spires', 'mesa'];

const defaults = { noticed: 0, pairs: 0, score: 0, perfect: 0, range: [], linger: false, muted: false, lastArch: null, lastNight: false };
function load() {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return { ...defaults }; }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(store)); } catch { /* private mode */ }
}

const store = load();
const rng = new Rng((Math.random() * 2 ** 31) | 0);
const mobile = matchMedia('(pointer: coarse)').matches && Math.min(innerWidth, innerHeight) < 820;
const canvas = document.getElementById('scene');

let world;
try {
  world = new World(canvas, { mobile });
} catch (e) {
  document.getElementById('nogl').hidden = false;
  throw e;
}
const view = new View(world, canvas);
const ui = new UI();
const sound = new Sound();
sound.muted = store.muted;

const S = {
  mode: 'boot',
  round: null,
  elapsed: 0,
  duration: 100,
  linger: store.linger,
  lingerTod: 0.55,
  tod: 0.66,
  todGoal: 0.66,
  blink: false,
  blinkT: 0,
  blinkShow: 0,
  t: 0,
  introT: 0,
  shift: 0,
};

const level = () => store.pairs + 1;

function chooseArch(lv) {
  if (lv <= FIRST_ARCHES.length) return FIRST_ARCHES[lv - 1];
  return rng.pick(ARCH_IDS.filter((a) => a !== store.lastArch));
}

// The third pair is the first night; after that, about one in three.
function isNight(lv) {
  if (lv === 3) return true;
  if (lv < 5) return false;
  return !store.lastNight && rng.chance(0.35);
}

function standing() {
  const r = rankFor(store.noticed);
  const kept = store.range.length;
  const next = r.next ? ` · ${r.next.at - store.noticed} more to ${r.next.title}` : '';
  return `${r.title} · ${store.noticed} noticed · ${kept} kept${next}`;
}

function install(round) {
  S.round = round;
  world.setTwins(round.groups, round.fields);
  world.setSky(round);
  view.setHome(round, true);
  ui.ink.clear();
  ui.setPair(round);
  ui.setDots(round.diffs);
  S.duration = 40 + 22 * round.diffs.length;
  S.elapsed = 0;
  sound.setKey([3, 5, 7, 8, 10][round.seed % 5]);
  world.compile();
}

function makeRound(lv) {
  const archId = chooseArch(lv);
  const round = buildRound({ level: lv, seed: rng.int(1, 2 ** 31 - 1), archId, night: isNight(lv) });
  console.info(`[mountain] pair ${lv}: ${archId}/${round.biomeId}${round.night ? ' at night' : ''}, ${round.diffs.length} differences (${round.diffs.map((d) => d.def.id).join(', ')}) in ${round.ms} ms`);
  return round;
}

// ---------------------------------------------------------------------------

function titleShift() { return world.portrait ? 0.2 : 0.17; }

function boot() {
  world.setRange(store.range);
  install(makeRound(level()));
  world.split = 0;
  S.shift = titleShift();
  view.spin = 0.035;
  S.mode = 'title';
  S.tod = S.todGoal = titleTod(S.round);
  ui.showTitle(standing(), S.linger);
  requestAnimationFrame(() => ui.veil(false));
}

function begin() {
  if (S.mode !== 'title') return;
  sound.start();
  store.linger = document.getElementById('linger').checked;
  S.linger = store.linger;
  save();
  ui.hideTitle();
  view.spin = 0;
  view.refit();
  view.reset();
  S.mode = 'intro';
  S.introT = 0;
}

function startPlay() {
  S.mode = 'play';
  S.elapsed = 0;
  S.tod = 0.04;
  ui.hud(true);
  const r = S.round;
  document.getElementById('reveal').textContent = S.linger ? 'Show me' : r.night ? 'Skip to dawn' : 'Let the sun set';
  const clock = S.linger ? 'Take your time.' : r.night ? 'Dawn will wash out the stars.' : 'The sun is already going down.';
  ui.note(r.names.pair, r.night ? 'Night' : '', `${INTROS[r.archId]} ${r.diffs.length} differences, marked by kind at the top right. ${clock}`, 7000);
}

function evaluate(pick, cx, cy) {
  let best = null, bestScore = Infinity;
  const field = world.fields[pick.twin];
  const cam = world.camera.position;
  for (const d of S.round.diffs) {
    if (d.found) continue;
    const pts = d.def.pos ? [d.def.pos(d.site, S.t)] : d.points;
    for (const p of pts) {
      if (pick.hit) {
        const dd = pick.hit.distanceTo(p) / d.def.radius;
        if (dd < 1 && dd < bestScore) { best = d; bestScore = dd; }
      }
      const sp = world.project(p, pick.panel);
      if (sp.behind) continue;
      const px = Math.hypot(sp.x - cx, sp.y - cy);
      const rpx = Math.max(d.def.minPx ?? 22, d.def.radius * world.pxPerUnit(p, pick.panel) * 0.9);
      if (px > rpx) continue;
      if (field.occluded(cam.x, cam.y, cam.z, p.x, p.y, p.z, 1.5)) continue;
      if (px / rpx < bestScore) { best = d; bestScore = px / rpx; }
    }
  }
  return best;
}

function onClick(x, y) {
  if (S.mode !== 'play') return;
  sound.start();
  const pick = world.pick(x, y);
  if (!pick) return;
  const d = evaluate(pick, x, y);
  if (d) return discover(d);
  if (!pick.hit) {
    ui.float(pick.cloud ? rng.pick(CLOUDS) : 'Just sky.', x, y, 'soft');
    return;
  }
  if (!S.linger) {
    S.elapsed = Math.min(S.duration, S.elapsed + MISS_COST);
    ui.flashSun();
  }
  ui.float(rng.pick(MISSES), x, y);
  sound.miss();
}

function discover(d) {
  const diffs = S.round.diffs;
  d.found = true;
  d.num = diffs.filter((x) => x.found).length;
  ui.ink.mark(d, d.num, 'found');
  ui.setDots(diffs);
  ui.note(`No. ${d.num} · ${KINDS[d.cat]}`, d.title, d.note);
  sound.found(d.num - 1);
  if (diffs.every((x) => x.found)) setTimeout(() => endRound(true), 1100);
}

function endRound(perfect) {
  if (S.mode !== 'play') return;
  S.mode = 'end';
  S.blink = false;
  setBlinkButton(false);
  const r = S.round;
  const found = r.diffs.filter((d) => d.found).length;
  let n = found;
  for (const d of r.diffs) {
    if (d.found) continue;
    d.missed = true;
    d.num = ++n;
    ui.ink.mark(d, d.num, 'missed');
  }
  ui.setDots(r.diffs);
  ui.hideNote();
  document.getElementById('actions').hidden = true;
  // Every pair ends in the best light: sunset by day, sunrise after a night.
  S.todGoal = r.night ? Math.max(S.tod, perfect ? 0.95 : 0.985) : Math.max(S.tod, perfect ? 0.84 : 0.9);

  const daylight = perfect && !S.linger ? Math.round((1 - S.elapsed / S.duration) * 300) : 0;
  const total = found * 100 + daylight + (perfect ? 150 : 0);
  const before = rankFor(store.noticed).title;
  store.noticed += found;
  store.pairs += 1;
  store.score += total;
  if (perfect) store.perfect += 1;
  store.lastArch = r.archId;
  store.lastNight = r.night;
  save();
  const after = rankFor(store.noticed).title;

  const gone = r.night ? 'Dawn.' : 'The light’s gone.';
  const head = perfect ? rng.pick(PERFECT) : found === 0 ? gone : `${gone} You noticed ${found} of ${r.diffs.length}.`;
  const sub = perfect ? `${r.names.twins[0]} and ${r.names.twins[1]}, told apart.` : 'The ones you missed are circled in red.';
  const parts = [`${found} × 100`];
  if (daylight) parts.push(`daylight ${daylight}`);
  if (perfect) parts.push('thorough 150');
  let score = `${parts.join(' + ')} = ${total}`;
  if (after !== before) score += `  ·  New rank: ${after}`;
  ui.showEnd({ head, sub, diffs: [...r.diffs].sort((a, b) => a.num - b.num), score, names: r.names });
  if (perfect) sound.complete(); else sound.dusk();
}

function keep(i) {
  const r = S.round;
  if (S.mode !== 'end' || r.kept != null) return;
  r.kept = i;
  store.range.push({ seed: r.seed, arch: r.archId, name: r.names.twins[i], level: r.level, at: Date.now() });
  if (store.range.length > 24) store.range.shift();
  save();
  world.setRange(store.range);
  const has = r.diffs.filter((d) => d.has === i);
  let quip;
  if (has.length === r.diffs.length) quip = 'You kept the one with everything. A maximalist.';
  else if (has.length === 0) quip = 'You kept the plainer twin. A purist’s choice.';
  else {
    const d = [...r.diffs].sort((a, b) => a.num - b.num)[0];
    quip = d.def.keep[d.has === i ? 0 : 1];
  }
  ui.kept(`${quip} ${r.names.twins[i]} now stands on your horizon.`);
  sound.keep();
}

function nextPair() {
  if (S.mode !== 'end') return;
  S.mode = 'moving';
  ui.veil(true, 'Walking to the next pair…');
  setTimeout(() => {
    install(makeRound(level()));
    ui.hideEnd();
    S.tod = 0.04;
    S.todGoal = 0.04;
    setTimeout(() => {
      ui.veil(false);
      startPlay();
    }, 60);
  }, 650);
}

function setBlinkButton(on) { document.getElementById('blink').classList.toggle('on', on); }

function setBlink(on) {
  if (S.mode !== 'play') on = false;
  if (S.blink === on) return;
  S.blink = on;
  S.blinkT = 0;
  S.blinkShow = 0;
  setBlinkButton(on);
}

// ---------------------------------------------------------------------------

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  S.t += dt;
  ATMOS.uTime.value = S.t;
  const r = S.round;

  if (S.mode === 'intro') {
    S.introT += dt / 1.6;
    const e = S.introT >= 1 ? 1 : 1 - Math.pow(1 - S.introT, 3);
    world.split = e;
    S.shift = titleShift() * (1 - e);
    S.tod = lerp(titleTod(r), 0.04, e);
    view.refit();
    if (S.introT >= 1) startPlay();
  }

  if (S.mode === 'play') {
    if (!S.linger) {
      S.elapsed += dt * (S.blink ? BLINK_RATE : 1);
      S.tod = lerp(0.04, 0.93, clamp(S.elapsed / S.duration, 0, 1));
      if (S.elapsed >= S.duration) endRound(false);
    } else {
      S.tod = S.lingerTod;
    }
  } else if (S.mode === 'end' || S.mode === 'title') {
    S.tod += (S.todGoal - S.tod) * (1 - Math.exp(-dt * 0.5));
  }
  world.shift = S.shift;
  const liftGoal = S.mode === 'end' ? (world.portrait ? 0.1 : 0.17) : 0;
  world.lift += (liftGoal - world.lift) * (1 - Math.exp(-dt * 3));
  world.setTime(S.tod, r.sunAz, r.night);

  if (S.blink) {
    S.blinkT += dt;
    const show = Math.floor(S.blinkT / 0.4) % 2;
    if (show !== S.blinkShow) { S.blinkShow = show; sound.tick(); }
    world.panels[0].show = world.panels[1].show = show;
  } else {
    world.panels[0].show = 0;
    world.panels[1].show = 1;
  }

  view.update(dt);
  for (const fns of r.updates) for (const f of fns) f(S.t, world.camera);
  world.render();
  ui.ink.update(world, S.t);
  if (S.mode === 'play' || S.mode === 'end') {
    ui.captions(world, r, S.blink);
    const remaining = S.linger ? 1 - (S.lingerTod - 0.04) / 0.89 : 1 - S.elapsed / S.duration;
    ui.setDaylight(remaining, (S.duration - S.elapsed) / (S.blink ? BLINK_RATE : 1), S.linger, r.night);
  }
  requestAnimationFrame(loop);
}

// ---------------------------------------------------------------------------

view.onClick = onClick;
window.addEventListener('resize', () => { world.resize(); view.refit(); });

document.getElementById('begin').addEventListener('click', begin);
document.getElementById('keep0').addEventListener('click', () => keep(0));
document.getElementById('keep1').addEventListener('click', () => keep(1));
document.getElementById('next').addEventListener('click', nextPair);
document.getElementById('home').addEventListener('click', () => view.reset());
document.getElementById('reveal').addEventListener('click', () => endRound(false));
document.getElementById('light-range').addEventListener('input', (e) => { S.lingerTod = Number(e.target.value); });

const blinkBtn = document.getElementById('blink');
blinkBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); setBlink(true); });
for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) blinkBtn.addEventListener(ev, () => setBlink(false));

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

window.addEventListener('keydown', (e) => {
  if (e.target instanceof HTMLInputElement && e.target.type === 'range') return;
  if (e.code === 'Space') {
    if (S.mode === 'play') { e.preventDefault(); setBlink(true); }
  } else if (e.key === 'Enter' && S.mode === 'title') {
    begin();
  } else if (e.key === 'r' || e.key === 'R') {
    view.reset();
  } else if (e.key === 'm' || e.key === 'M') {
    muteBtn.click();
  }
});
window.addEventListener('keyup', (e) => { if (e.code === 'Space') setBlink(false); });
window.addEventListener('blur', () => setBlink(false));

// Let the veil paint before the first (slow) build.
requestAnimationFrame(() => setTimeout(() => {
  boot();
  requestAnimationFrame(loop);
}, 30));
