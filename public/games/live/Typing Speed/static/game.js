const TIERS = {
  1: 'the and for you are was with this that from they have more will what when make like time just know take into year your good some them see other than then now look only come its over also back after use two how our work first well way even new want because any these give day most'.split(' '),
  2: 'people through before should around another between country however without example against himself program question company problem business although service important remember children history language develop understand together interest process research government possible general different information sometimes national'.split(' '),
  3: 'consciousness infrastructure responsibility characteristic photosynthesis extraordinary unpredictable representative sustainability administration philosophical communication acknowledgement transformation approximately sophisticated encyclopaedia entrepreneurship recommendation configuration unquestionably parliamentarian interdisciplinary'.split(' '),
};
const state = { wordDifficulty: 1, timeLimitSec: 60 };
window.__typingState = state;
const $ = (id) => document.getElementById(id);
const wordsEl = $('words'), input = $('input'), msg = $('msg'), playBtn = $('play-btn');
let running = false, started = false, words = [], idx = 0, correctWords = 0, typedWords = 0, correctChars = 0, timeLeft = state.timeLimitSec, tick = null;
let best = Number(localStorage.getItem('typingBest') || 0);
const elapsedMin = () => Math.max(1, state.timeLimitSec - timeLeft) / 60;
const wpm = () => started ? Math.round((correctChars / 5) / elapsedMin()) : 0;
const accuracy = () => typedWords ? Math.round(100 * correctWords / typedWords) : 100;
Object.defineProperties(state, {
  running: { get: () => running, enumerable: true }, timeLeftSec: { get: () => timeLeft, enumerable: true },
  wpm: { get: () => wpm(), enumerable: true }, accuracy: { get: () => accuracy(), enumerable: true },
  typedWords: { get: () => typedWords, enumerable: true },
});
function hud() { $('hud-time').textContent = timeLeft + 's'; $('hud-wpm').textContent = wpm(); $('hud-acc').textContent = accuracy() + '%'; $('hud-best').textContent = best; }
function generate() {
  const pool = TIERS[state.wordDifficulty] || TIERS[1];
  words = Array.from({ length: 50 }, () => pool[Math.floor(Math.random() * pool.length)]);
  idx = 0;
  wordsEl.innerHTML = words.map((w, i) => `<span class="w${i === 0 ? ' current' : ''}">${w}</span>`).join('');
}
function scrollCurrent() { const cur = wordsEl.children[idx]; if (cur && cur.offsetTop - wordsEl.offsetTop > wordsEl.clientHeight * 0.55) wordsEl.scrollTop = cur.offsetTop - wordsEl.offsetTop - 10; }
function commit() {
  const typed = input.value.trim(); input.value = '';
  if (!typed) return;
  const span = wordsEl.children[idx], target = words[idx];
  typedWords++;
  if (typed === target) { correctWords++; correctChars += target.length + 1; span.classList.add('good'); } else span.classList.add('bad');
  span.classList.remove('current'); idx++;
  if (idx >= words.length) { generate(); wordsEl.scrollTop = 0; } else { wordsEl.children[idx].classList.add('current'); scrollCurrent(); }
  hud();
}
input.addEventListener('input', () => {
  if (!running) return;
  if (!started) { started = true; tick = setInterval(() => { timeLeft--; hud(); if (timeLeft <= 0) finish(); }, 1000); }
  if (input.value.endsWith(' ')) commit();
});
function finish() {
  running = false; clearInterval(tick); input.disabled = true;
  const w = wpm();
  if (w > best) { best = w; localStorage.setItem('typingBest', best); }
  hud(); msg.textContent = `Time! ${w} WPM · ${accuracy()}% accuracy (${correctWords}/${typedWords} words)`;
  playBtn.textContent = '🔄'; playBtn.classList.remove('hidden');
}
function start() {
  if (running) return;
  running = true; started = false; correctWords = typedWords = correctChars = 0; timeLeft = state.timeLimitSec;
  generate(); wordsEl.scrollTop = 0; input.disabled = false; input.value = ''; input.focus();
  playBtn.classList.add('hidden'); msg.textContent = 'Go! The timer starts on your first keystroke.'; hud();
}
playBtn.addEventListener('click', start);
window.__typingControls = {
  setWordDifficulty(n) { state.wordDifficulty = Math.max(1, Math.min(3, Math.round(n))); if (!running) generate(); },
  setTimeLimitSec(s) { state.timeLimitSec = Math.max(15, Math.min(180, Math.round(s))); if (!running) { timeLeft = state.timeLimitSec; hud(); } },
};
generate(); hud();
