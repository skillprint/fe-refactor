// Gameplay events for the portal, posted as {type: 'gameEvent', data: {event, at, ...}}:
// the message GameClient records and uploads with the next screenshot (as Hextris's
// skillprint.js does). `at` is when it happened, in epoch ms.
const emitEvent = (event, data) => {
  try {
    if (window.parent === window) return;
    const at = performance.timeOrigin + performance.now();
    window.parent.postMessage({ type: 'gameEvent', data: Object.assign({}, data, { event, at }) }, window.location.origin);
  } catch (e) { /* telemetry must never break the game */ }
};

const state = { nLevel: 2, stimulusIntervalMs: 2500, trialCount: 20 };
window.__nbackState = state;
const LETTERS = ['C', 'H', 'K', 'L', 'Q', 'R', 'S', 'T'];
const $ = (id) => document.getElementById(id);
const grid = $('grid'), msg = $('msg'), playBtn = $('play-btn'), posBtn = $('pos-btn'), sndBtn = $('snd-btn');
const cells = [];
for (let i = 0; i < 9; i++) { const c = document.createElement('div'); c.className = 'cell'; grid.appendChild(c); cells.push(c); }
let running = false, trial = 0, seq = [], hits = 0, misses = 0, falseAlarms = 0, timer = null, posPressed = false, sndPressed = false;
let shownAt = 0, posRt = null, sndRt = null; // response times from stimulus onset
let best = Number(localStorage.getItem('nbackBest') || 0);
const accuracy = () => { const t = hits + misses + falseAlarms; return t ? Math.round(100 * hits / t) : 0; };
Object.defineProperties(state, {
  running: { get: () => running, enumerable: true }, trial: { get: () => trial, enumerable: true },
  hits: { get: () => hits, enumerable: true }, misses: { get: () => misses, enumerable: true },
  falseAlarms: { get: () => falseAlarms, enumerable: true }, accuracy: { get: () => accuracy(), enumerable: true },
});
function hud() { $('hud-n').textContent = state.nLevel; $('hud-trial').textContent = `${trial}/${state.trialCount}`; $('hud-acc').textContent = accuracy() + '%'; $('hud-best').textContent = best + '%'; }
function speak(l) { try { if (!window.speechSynthesis) return; const u = new SpeechSynthesisUtterance(l); u.rate = 1.2; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) {} }
function flash(btn, ok) { btn.classList.add(ok ? 'good' : 'bad'); setTimeout(() => btn.classList.remove('good', 'bad'), 350); }
function matches(kind) { const t = seq.length - 1, n = state.nLevel; return t >= n && seq[t][kind] === seq[t - n][kind]; }
function evaluate() {
  const last = seq[seq.length - 1], pm = matches('pos'), sm = matches('snd');
  emitEvent('TRIAL_END', {
    trial, n: state.nLevel, scored: seq.length - 1 >= state.nLevel, position: last.pos, letter: last.snd,
    positionMatch: pm, letterMatch: sm, positionPressed: posPressed, letterPressed: sndPressed,
    positionCorrect: pm === posPressed, letterCorrect: sm === sndPressed, positionRt: posRt, letterRt: sndRt,
  });
  if (seq.length - 1 < state.nLevel) return;
  if (pm && posPressed) hits++; else if (pm) { misses++; flash(posBtn, false); } else if (posPressed) falseAlarms++;
  if (sm && sndPressed) hits++; else if (sm) { misses++; flash(sndBtn, false); } else if (sndPressed) falseAlarms++;
}
function nextTrial() {
  if (!running) return;
  if (seq.length) evaluate();
  if (trial >= state.trialCount) return finish();
  const n = state.nLevel, back = seq.length >= n ? seq[seq.length - n] : null;
  let pos = Math.floor(Math.random() * 9), snd = LETTERS[Math.floor(Math.random() * LETTERS.length)];
  if (back && Math.random() < 0.3) pos = back.pos;
  if (back && Math.random() < 0.3) snd = back.snd;
  seq.push({ pos, snd }); trial++; posPressed = sndPressed = false; hud();
  shownAt = performance.now(); posRt = sndRt = null;
  cells.forEach((c) => { c.classList.remove('on'); c.textContent = ''; });
  cells[pos].classList.add('on'); cells[pos].textContent = snd; speak(snd);
  setTimeout(() => { cells[pos].classList.remove('on'); cells[pos].textContent = ''; }, Math.min(1000, state.stimulusIntervalMs * 0.5));
  timer = setTimeout(nextTrial, state.stimulusIntervalMs);
}
function finish() {
  running = false; clearTimeout(timer);
  const acc = accuracy();
  if (acc > best) { best = acc; localStorage.setItem('nbackBest', best); }
  hud();
  msg.textContent = `Done — ${acc}% (hits ${hits}, misses ${misses}, false alarms ${falseAlarms})`;
  emitEvent('LEVEL_COMPLETE', { trials: trial, n: state.nLevel, accuracy: acc, hits, misses, falseAlarms });
  playBtn.textContent = '🔄'; playBtn.classList.remove('hidden');
}
function start() {
  if (running) return;
  running = true; trial = 0; seq = []; hits = misses = falseAlarms = 0;
  playBtn.classList.add('hidden');
  emitEvent('LEVEL_START', { n: state.nLevel, trials: state.trialCount, stimulusIntervalMs: state.stimulusIntervalMs });
  msg.textContent = `${state.nLevel}-back: press Position (A) or Sound (L) when it matches ${state.nLevel} steps back.`;
  hud(); nextTrial();
}
function press(kind) {
  if (!running || !seq.length) return;
  const btn = kind === 'pos' ? posBtn : sndBtn;
  if (kind === 'pos') { if (posPressed) return; posPressed = true; } else { if (sndPressed) return; sndPressed = true; }
  const rt = Math.round(performance.now() - shownAt);
  if (kind === 'pos') posRt = rt; else sndRt = rt;
  flash(btn, matches(kind));
}
playBtn.addEventListener('click', start);
posBtn.addEventListener('click', () => press('pos'));
sndBtn.addEventListener('click', () => press('snd'));
document.addEventListener('keydown', (e) => { const k = e.key.toLowerCase(); if (k === 'a') press('pos'); else if (k === 'l') press('snd'); else if (e.code === 'Space' && !running) start(); });
window.__nbackControls = {
  setNLevel(n) { state.nLevel = Math.max(1, Math.min(5, Math.round(n))); hud(); },
  setStimulusIntervalMs(ms) { state.stimulusIntervalMs = Math.max(1000, Math.min(5000, Math.round(ms))); },
  setTrialCount(n) { state.trialCount = Math.max(5, Math.min(60, Math.round(n))); hud(); },
};
hud();
