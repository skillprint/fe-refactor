const state = { mazeSize: 11, fogRadius: 0 };
window.__mazeState = state;
const $ = (id) => document.getElementById(id);
const canvas = $('maze'), ctx = canvas.getContext('2d'), msg = $('msg'), playBtn = $('play-btn');
let N = 0, cells = [], px = 0, py = 0, moves = 0, solved = 0, running = false, startAt = 0, tick = null, elapsed = 0;
let best = Number(localStorage.getItem('mazeBest') || 0);
Object.defineProperties(state, {
  running: { get: () => running, enumerable: true }, moves: { get: () => moves, enumerable: true },
  elapsedSec: { get: () => elapsed, enumerable: true }, solved: { get: () => solved, enumerable: true },
});
const DIRS = [[0, -1, 0, 2], [1, 0, 1, 3], [0, 1, 2, 0], [-1, 0, 3, 1]]; // dx, dy, wall index, opposite wall
function generate() {
  N = state.mazeSize; cells = Array.from({ length: N * N }, () => ({ v: false, w: [true, true, true, true] }));
  const stack = [[0, 0]]; cells[0].v = true;
  while (stack.length) {
    const [x, y] = stack[stack.length - 1];
    const opts = DIRS.filter(([dx, dy]) => { const nx = x + dx, ny = y + dy; return nx >= 0 && ny >= 0 && nx < N && ny < N && !cells[ny * N + nx].v; });
    if (!opts.length) { stack.pop(); continue; }
    const [dx, dy, w, ow] = opts[Math.floor(Math.random() * opts.length)];
    const nx = x + dx, ny = y + dy;
    cells[y * N + x].w[w] = false; cells[ny * N + nx].w[ow] = false; cells[ny * N + nx].v = true; stack.push([nx, ny]);
  }
  px = py = 0; moves = 0;
}
function draw() {
  const s = canvas.width / N; ctx.fillStyle = '#1b1b2f'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#c7d2fe'; ctx.lineWidth = Math.max(1.5, s * 0.08); ctx.lineCap = 'round';
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (state.fogRadius > 0 && Math.max(Math.abs(x - px), Math.abs(y - py)) > state.fogRadius) continue;
    const c = cells[y * N + x], X = x * s, Y = y * s;
    ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(X, Y, s, s);
    ctx.beginPath();
    if (c.w[0]) { ctx.moveTo(X, Y); ctx.lineTo(X + s, Y); }
    if (c.w[1]) { ctx.moveTo(X + s, Y); ctx.lineTo(X + s, Y + s); }
    if (c.w[2]) { ctx.moveTo(X, Y + s); ctx.lineTo(X + s, Y + s); }
    if (c.w[3]) { ctx.moveTo(X, Y); ctx.lineTo(X, Y + s); }
    ctx.stroke();
  }
  if (state.fogRadius === 0 || Math.max(Math.abs(N - 1 - px), Math.abs(N - 1 - py)) <= state.fogRadius) {
    ctx.fillStyle = '#2ed573'; ctx.fillRect((N - 1) * s + s * 0.2, (N - 1) * s + s * 0.2, s * 0.6, s * 0.6);
  }
  ctx.fillStyle = '#ffd32a'; ctx.beginPath(); ctx.arc(px * s + s / 2, py * s + s / 2, s * 0.3, 0, Math.PI * 2); ctx.fill();
}
function hud() { $('hud-moves').textContent = moves; $('hud-time').textContent = elapsed.toFixed(1) + 's'; $('hud-solved').textContent = solved; $('hud-best').textContent = best ? best.toFixed(1) + 's' : '—'; }
function move(dx, dy) {
  if (!running) return;
  const d = DIRS.find(([x, y]) => x === dx && y === dy); if (!d) return;
  if (cells[py * N + px].w[d[2]]) return;
  px += dx; py += dy; moves++; draw(); hud();
  if (px === N - 1 && py === N - 1) win();
}
function win() {
  running = false; clearInterval(tick);
  if (!best || elapsed < best) { best = elapsed; localStorage.setItem('mazeBest', best); }
  solved++; hud(); msg.textContent = `🎉 Solved in ${elapsed.toFixed(1)}s with ${moves} moves. Next maze…`;
  setTimeout(() => { generate(); start(); }, 1500);
}
function start() {
  running = true; elapsed = 0; startAt = Date.now(); playBtn.classList.add('hidden');
  msg.textContent = `Reach the green exit (${N}×${N}${state.fogRadius ? ', fog ' + state.fogRadius : ''}).`;
  clearInterval(tick); tick = setInterval(() => { elapsed = (Date.now() - startAt) / 1000; hud(); }, 100);
  draw(); hud();
}
playBtn.addEventListener('click', () => { generate(); start(); });
document.addEventListener('keydown', (e) => {
  const map = { ArrowUp: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1], ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0] };
  const m = map[e.key] || map[e.key.toLowerCase()]; if (m) { e.preventDefault(); move(m[0], m[1]); } else if (e.code === 'Space' && !running) { generate(); start(); }
});
document.querySelectorAll('#pad .btn').forEach((b) => b.addEventListener('click', () => { const [x, y] = b.dataset.d.split(',').map(Number); move(x, y); }));
let touch = null;
canvas.addEventListener('pointerdown', (e) => { touch = [e.clientX, e.clientY]; });
canvas.addEventListener('pointerup', (e) => {
  if (!touch) return; const dx = e.clientX - touch[0], dy = e.clientY - touch[1]; touch = null;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
  Math.abs(dx) > Math.abs(dy) ? move(Math.sign(dx), 0) : move(0, Math.sign(dy));
});
window.__mazeControls = {
  setMazeSize(n) { const v = Math.max(5, Math.min(31, Math.round(n))); if (v === state.mazeSize) return; state.mazeSize = v; generate(); if (running) start(); else draw(); },
  setFogRadius(r) { state.fogRadius = Math.max(0, Math.min(8, Math.round(r))); draw(); },
};
generate(); draw(); hud();
