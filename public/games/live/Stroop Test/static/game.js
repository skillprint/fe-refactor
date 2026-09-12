const COLORS = [
  { name: 'RED', hex: '#ff4757', key: 'r' }, { name: 'GREEN', hex: '#2ed573', key: 'g' },
  { name: 'BLUE', hex: '#1e90ff', key: 'b' }, { name: 'YELLOW', hex: '#ffd32a', key: 'y' },
];
const state = { conflictRatio: 0.5, responseWindowMs: 2000, roundCount: 20 };
window.__stroopState = state;
const $ = (id) => document.getElementById(id);
const word = $('word'), msg = $('msg'), playBtn = $('play-btn'), answers = $('answers');
let running = false, round = 0, correct = 0, rts = [], cur = null, shownAt = 0, timer = null;
let best = Number(localStorage.getItem('stroopBest') || 0);
const meanRt = () => rts.length ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length) : 0;
const accuracy = () => round ? Math.round(100 * correct / round) : 0;
Object.defineProperties(state, {
  running: { get: () => running, enumerable: true }, round: { get: () => round, enumerable: true },
  correct: { get: () => correct, enumerable: true }, accuracy: { get: () => accuracy(), enumerable: true },
  meanRtMs: { get: () => meanRt(), enumerable: true },
});
COLORS.forEach((c, i) => {
  const b = document.createElement('button'); b.className = 'btn'; b.textContent = c.name; b.style.background = c.hex;
  b.addEventListener('click', () => answer(i)); answers.appendChild(b);
});
function hud() { $('hud-round').textContent = `${round}/${state.roundCount}`; $('hud-acc').textContent = accuracy() + '%'; $('hud-rt').textContent = (meanRt() || '—') + ' ms'; $('hud-best').textContent = best + '%'; }
function nextRound() {
  if (!running) return;
  if (round >= state.roundCount) return finish();
  round++;
  const ink = Math.floor(Math.random() * COLORS.length);
  let text = ink;
  if (Math.random() < state.conflictRatio) { do { text = Math.floor(Math.random() * COLORS.length); } while (text === ink); }
  cur = { ink, text };
  word.textContent = COLORS[text].name; word.style.color = COLORS[ink].hex;
  word.classList.add('pop'); setTimeout(() => word.classList.remove('pop'), 120);
  shownAt = performance.now(); hud();
  timer = setTimeout(() => answer(null), state.responseWindowMs);
}
function answer(idx) {
  if (!running || !cur) return;
  clearTimeout(timer);
  const rt = Math.round(performance.now() - shownAt);
  if (idx === cur.ink) { correct++; rts.push(rt); msg.textContent = `✓ ${rt} ms`; }
  else msg.textContent = idx === null ? '✗ Too slow' : `✗ It was ${COLORS[cur.ink].name}`;
  cur = null; word.textContent = ''; hud();
  setTimeout(nextRound, 450);
}
function finish() {
  running = false; word.textContent = 'DONE'; word.style.color = '#fff';
  const acc = accuracy();
  if (acc > best) { best = acc; localStorage.setItem('stroopBest', best); }
  hud(); msg.textContent = `Accuracy ${acc}% · mean reaction ${meanRt()} ms`;
  playBtn.textContent = '🔄'; playBtn.classList.remove('hidden');
}
function start() {
  if (running) return;
  running = true; round = 0; correct = 0; rts = []; playBtn.classList.add('hidden');
  msg.textContent = 'Pick the INK colour. Keys: R G B Y.'; word.textContent = '';
  hud(); setTimeout(nextRound, 600);
}
playBtn.addEventListener('click', start);
document.addEventListener('keydown', (e) => { const i = COLORS.findIndex((c) => c.key === e.key.toLowerCase()); if (i >= 0) answer(i); else if (e.code === 'Space' && !running) start(); });
window.__stroopControls = {
  setConflictRatio(r) { state.conflictRatio = Math.max(0, Math.min(1, Number(r))); },
  setResponseWindowMs(ms) { state.responseWindowMs = Math.max(500, Math.min(5000, Math.round(ms))); },
  setRoundCount(n) { state.roundCount = Math.max(5, Math.min(60, Math.round(n))); hud(); },
};
hud();
