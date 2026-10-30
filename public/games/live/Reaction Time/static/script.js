// Reaction Time Tester — Skillprint adaptive version
// State machine: idle -> wait (red) -> go (green) -> result -> next attempt / summary

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

const RING_R = 26;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R;

// Skillprint instrumentation state
const state = {
  difficultyMultiplier: 1,          // 0.5-1.5: controls delay speed
  attemptCount: 5,                  // 3-10: number of rounds per session
};
window.__reactionState = state;
Object.defineProperties(state, {
  phase: { get: () => phase, enumerable: true },
  attempt: { get: () => attempt, enumerable: true },
  lastMs: { get: () => times[times.length - 1] ?? null, enumerable: true },
  bestMs: { get: () => bestTime, enumerable: true },
});

// Base timing config (easier at 1.0x)
function getTimingsForDifficulty(slider) {
  // Normalize slider (0.5-1.5) to t (0-1): easy → hard
  const t = (slider - 0.5) / 1.0;
  return {
    minDelayMs: Math.round(1500 - t * 500),   // 1500ms→1000ms (easier=longer wait)
    maxDelayMs: Math.round(3500 - t * 1500),  // 3500ms→2000ms (easier=longer wait)
  };
}

// DOM elements
const board = document.getElementById('board');
const head = document.getElementById('head');
const sub = document.getElementById('sub');
const stars = document.getElementById('stars');
const playBtn = document.getElementById('play-btn');
const difficultySlider = document.getElementById('difficulty-slider');
const difficultyValue = document.getElementById('difficulty-value');
const currentAttemptDisplay = document.getElementById('current-attempt');
const bestTimeDisplay = document.getElementById('best-time');
const statusBadge = document.getElementById('status-badge');
const checkmark = document.getElementById('checkmark');
const ringProgress = document.getElementById('countdown-ring-progress');

let phase = 'idle'; // idle | wait | go | early | summary
let waitTimer = null;
let goAt = 0;
let waitStartedAt = 0, delayMs = 0;
let attempt = 0;
let times = [];
let bestTime = localStorage.getItem('reactionBestTime') || null;

if (bestTime) {
  bestTimeDisplay.textContent = `${bestTime}ms`;
}

ringProgress.style.strokeDasharray = String(RING_CIRCUMFERENCE);
ringProgress.style.strokeDashoffset = '0';

function setPhase(next) {
  phase = next;
  board.className = next === 'wait' ? 'wait' : next === 'go' ? 'go' : next === 'early' ? 'early' : next === 'summary' ? 'result' : '';
}

function starsForAvg(avg) {
  if (avg <= 200) return '★★★★★';
  if (avg <= 300) return '★★★★☆';
  if (avg <= 400) return '★★★☆☆';
  if (avg <= 550) return '★★☆☆☆';
  return '★☆☆☆☆';
}

function startAttempt() {
  attempt++;
  currentAttemptDisplay.innerHTML = `<b>${attempt}</b>/${state.attemptCount}`;
  sub.textContent = 'Wait for green...';
  stars.textContent = '';
  setPhase('wait');
  
  const timings = getTimingsForDifficulty(state.difficultyMultiplier);
  const delay = timings.minDelayMs + Math.random() * Math.max(0, timings.maxDelayMs - timings.minDelayMs);
  waitStartedAt = performance.now(); delayMs = Math.round(delay);
  
  waitTimer = setTimeout(() => {
    goAt = performance.now();
    head.textContent = 'Click!';
    sub.textContent = '';
    setPhase('go');
  }, delay);
}

function showFeedback() {
  const timings = getTimingsForDifficulty(state.difficultyMultiplier);
  const durationMs = 1000;

  statusBadge.classList.add('visible');
  checkmark.classList.add('show');

  ringProgress.style.transition = 'none';
  ringProgress.style.strokeDashoffset = '0';
  void ringProgress.getBoundingClientRect();
  ringProgress.style.transition = `stroke-dashoffset ${durationMs}ms linear`;
  ringProgress.style.strokeDashoffset = String(RING_CIRCUMFERENCE);

  setTimeout(() => {
    statusBadge.classList.remove('visible');
    checkmark.classList.remove('show');
    if (attempt < state.attemptCount) {
      setTimeout(startAttempt, 600);
    } else {
      setTimeout(finishSession, 600);
    }
  }, durationMs);
}

function finishSession() {
  const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  emitEvent('LEVEL_COMPLETE', { attempts: times.length, meanRtMs: avg, bestRtMs: Math.min(...times), times: times.slice() });
  setPhase('summary');
  head.textContent = `Average: ${avg} ms`;
  sub.textContent = `Times: ${times.map(t => `${t}ms`).join(', ')}`;
  stars.textContent = starsForAvg(avg);
  
  if (!bestTime || avg < parseInt(bestTime)) {
    bestTime = avg;
    bestTimeDisplay.textContent = `${bestTime}ms`;
    localStorage.setItem('reactionBestTime', bestTime);
  }
  
  playBtn.classList.remove('hidden');
  playBtn.textContent = '🔄';
}

function handleBoardClick() {
  if (phase === 'wait') {
    clearTimeout(waitTimer);
    emitEvent('FALSE_START', { attempt, msBeforeGo: Math.round(delayMs - (performance.now() - waitStartedAt)), delayMs });
    setPhase('early');
    head.textContent = 'Too soon!';
    sub.textContent = 'Wait for the screen to turn green.';
    setTimeout(startAttempt, 1200);
  } else if (phase === 'go') {
    const rt = Math.round(performance.now() - goAt);
    times.push(rt);
    emitEvent('TRIAL_END', { attempt, rt, delayMs });
    head.textContent = `${rt} ms`;
    sub.textContent = '';
    setPhase('idle');
    showFeedback();
  }
}

playBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  playBtn.classList.add('hidden');
  attempt = 0;
  times = [];
  emitEvent('LEVEL_START', { attempts: state.attemptCount, difficultyMultiplier: state.difficultyMultiplier });
  startAttempt();
});

// Difficulty slider
difficultySlider.addEventListener('input', function () {
  state.difficultyMultiplier = parseFloat(this.value);
  difficultyValue.textContent = state.difficultyMultiplier.toFixed(2) + 'x';
});

document.addEventListener('keypress', function (event) {
  if (event.code === 'Space' && phase === 'idle' && playBtn.classList.contains('hidden') === false) {
    playBtn.click();
  }
});

board.addEventListener('mousedown', handleBoardClick);
board.addEventListener('touchstart', (e) => { e.preventDefault(); handleBoardClick(); }, { passive: false });

// Skillprint instrumentation controls
window.__reactionControls = {
  setDifficultyMultiplier(m) {
    const clamped = Math.max(0.5, Math.min(1.5, m));
    state.difficultyMultiplier = clamped;
    difficultySlider.value = String(clamped);
    difficultyValue.textContent = clamped.toFixed(2) + 'x';
  },
  setAttemptCount(n) {
    const clamped = Math.max(3, Math.min(10, Math.round(n)));
    if (clamped === state.attemptCount) return;
    state.attemptCount = clamped;
    if (phase === 'idle' && playBtn.classList.contains('hidden') === false) {
      // Update display only if not in progress
      currentAttemptDisplay.innerHTML = `<b>0</b>/${state.attemptCount}`;
    }
  },
};
