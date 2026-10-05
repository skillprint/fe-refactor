const state = { inhaleSec: 4, holdSec: 4, exhaleSec: 6, sessionLengthMin: 2 };
window.__breathState = state;
const $ = (id) => document.getElementById(id);
const circle = $('circle'), phaseEl = $('phase'), countEl = $('count'), msg = $('msg'), playBtn = $('play-btn');
let running = false, phase = 'idle', cycles = 0, startAt = 0, elapsed = 0, phaseTimer = null, countTimer = null, tick = null;
Object.defineProperties(state, {
  running: { get: () => running, enumerable: true }, phase: { get: () => phase, enumerable: true },
  cycles: { get: () => cycles, enumerable: true }, elapsedSec: { get: () => elapsed, enumerable: true },
});
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
function hud() { $('hud-cycles').textContent = cycles; $('hud-time').textContent = `${fmt(elapsed)} / ${fmt(state.sessionLengthMin * 60)}`; }
function runPhase(name, sec, scale, next) {
  phase = name; phaseEl.textContent = name;
  circle.style.transition = `transform ${sec}s ease-in-out`; circle.style.transform = `scale(${scale})`;
  let left = sec; countEl.textContent = left;
  clearInterval(countTimer); countTimer = setInterval(() => { left--; countEl.textContent = left > 0 ? left : ''; }, 1000);
  phaseTimer = setTimeout(next, sec * 1000);
}
function cycle() {
  if (!running) return;
  runPhase('Breathe in', state.inhaleSec, 1.9, () => {
    const exhale = () => runPhase('Breathe out', state.exhaleSec, 1, () => {
      cycles++; hud();
      if (elapsed >= state.sessionLengthMin * 60) finish(); else cycle();
    });
    state.holdSec > 0 ? runPhase('Hold', state.holdSec, 1.9, exhale) : exhale();
  });
}
function finish() {
  running = false; phase = 'done'; clearTimeout(phaseTimer); clearInterval(countTimer); clearInterval(tick);
  phaseEl.textContent = 'Done'; countEl.textContent = '';
  circle.style.transition = 'transform 2s ease'; circle.style.transform = 'scale(1)';
  msg.textContent = `Session complete — ${cycles} breaths in ${fmt(elapsed)}. Well done.`;
  playBtn.textContent = '🔄'; playBtn.classList.remove('hidden');
}
function start() {
  if (running) return;
  running = true; cycles = 0; elapsed = 0; startAt = Date.now(); playBtn.classList.add('hidden');
  msg.textContent = 'Relax your shoulders and follow the circle.';
  tick = setInterval(() => { elapsed = Math.round((Date.now() - startAt) / 1000); hud(); }, 1000);
  hud(); cycle();
}
playBtn.addEventListener('click', start);
document.addEventListener('keydown', (e) => { if (e.code === 'Space' && !running) start(); });
const clampInt = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.round(v)));
window.__breathControls = {
  setInhaleSec(s) { state.inhaleSec = clampInt(s, 2, 10); },
  setHoldSec(s) { state.holdSec = clampInt(s, 0, 10); },
  setExhaleSec(s) { state.exhaleSec = clampInt(s, 2, 12); },
  setSessionLengthMin(m) { state.sessionLengthMin = clampInt(m, 1, 10); hud(); },
};
hud();
