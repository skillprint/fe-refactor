// Color palette, ordered so the first 2/3/4/... entries are used when
// numTiles is lowered. Extends the original 4-color game up to 8.
const PALETTE = [
  { id: 'red', grad: 'linear-gradient(135deg, #fd79a8, #e84393)', freq: 261.63 },
  { id: 'yellow', grad: 'linear-gradient(135deg, #ffeaa7, #fdcb6e)', freq: 329.63 },
  { id: 'green', grad: 'linear-gradient(135deg, #55efc4, #00cec9)', freq: 392.0 },
  { id: 'purple', grad: 'linear-gradient(135deg, #a29bfe, #6c5ce7)', freq: 523.25 },
  { id: 'blue', grad: 'linear-gradient(135deg, #74b9ff, #0984e3)', freq: 587.33 },
  { id: 'orange', grad: 'linear-gradient(135deg, #fab1a0, #e17055)', freq: 659.25 },
  { id: 'pink', grad: 'linear-gradient(135deg, #ff9ff3, #f368e0)', freq: 698.46 },
  { id: 'teal', grad: 'linear-gradient(135deg, #81ecec, #00b894)', freq: 783.99 },
];

let gameSeq = [];
let userSeq = [];
let started = false;
let level = 0;
let highScore = localStorage.getItem('simonHighScore') || 0;
let isShowingSequence = false;

// Skillprint instrumentation state, exposed by reference so skillprintShim.js
// (and window.__simonControls below) can retune the game live.
const state = {
  numTiles: 4,                      // 2-8: how many colors are in play
  difficultyMultiplier: 1,          // 0.5-1.5: master difficulty slider
};
window.__simonState = state;
Object.defineProperties(state, {
  level: { get: () => level, enumerable: true },
  highScore: { get: () => Number(highScore), enumerable: true },
  started: { get: () => started, enumerable: true },
});

// Difficulty slider maps to three independent timings
function getTimingsForDifficulty(slider) {
  // Normalize slider (0.5-1.5) to t (0-1): easy → hard
  const t = (slider - 0.5) / 1.0;
  return {
    announcementMs: Math.round(1500 - t * 1000),  // 1500ms→500ms (harder=shorter)
    gapMs: Math.round(800 - t * 500),              // 800ms→300ms (harder=shorter)
    roundMs: Math.round(3000 - t * 2000),          // 3000ms→1000ms (harder=shorter)
  };
}

const RING_R = 26;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R;

// DOM elements
const h2 = document.getElementById('game-status');
const playBtn = document.getElementById('play-btn');
const currentLevelDisplay = document.getElementById('current-level');
const highScoreDisplay = document.getElementById('high-score');
const difficultySlider = document.getElementById('difficulty-slider');
const difficultyValue = document.getElementById('difficulty-value');
const btnContainer = document.getElementById('btn-container');
const statusBadge = document.getElementById('status-badge');
const checkmark = document.getElementById('checkmark');
const ringProgress = document.getElementById('countdown-ring-progress');

highScoreDisplay.textContent = highScore;
ringProgress.style.strokeDasharray = String(RING_CIRCUMFERENCE);
ringProgress.style.strokeDashoffset = '0';

// Sound effects (simple beep sounds using Web Audio API)
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(frequency, duration = 200) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + duration / 1000
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration / 1000);
}

function colorFreq(id) {
  const c = PALETTE.find((p) => p.id === id);
  return c ? c.freq : 440;
}

function activeColors() {
  return PALETTE.slice(0, state.numTiles).map((c) => c.id);
}

function attachTileEvents(btn) {
  btn.addEventListener('click', btnPress);

  btn.addEventListener('touchstart', function (e) {
    e.preventDefault();
    if (!started || isShowingSequence) return;
    playSound(colorFreq(this.id), 50);
  });

  btn.addEventListener('touchend', function (e) {
    e.preventDefault();
    if (!started || isShowingSequence) return;
    btnPress.call(this);
  });

  btn.addEventListener('mouseenter', function () {
    if (!isShowingSequence && started && !('ontouchstart' in window)) {
      playSound(colorFreq(this.id), 50);
    }
  });
}

function renderTiles() {
  const count = state.numTiles;
  const cols = count <= 4 ? 2 : count <= 6 ? 3 : 4;
  btnContainer.style.setProperty('--cols', cols);

  const oldTiles = Array.from(btnContainer.querySelectorAll('.btn'));
  const oldCount = oldTiles.length;

  if (oldCount > count) {
    // Tiles are being removed — animate them out
    oldTiles.slice(count).forEach((tile, idx) => {
      tile.classList.add('disappear');
      setTimeout(() => {
        tile.remove();
      }, 400 + idx * 30);
    });
  }

  // Add new tiles
  const newTiles = PALETTE.slice(oldCount, count);
  newTiles.forEach((c) => {
    const el = document.createElement('div');
    el.className = `btn ${c.id} appear`;
    el.id = c.id;
    el.style.background = c.grad;
    attachTileEvents(el);
    btnContainer.appendChild(el);
    setTimeout(() => el.classList.remove('appear'), 500);
  });
}

// Difficulty slider (0.5x - 1.5x, replaces the old easy/normal/hard select)
difficultySlider.addEventListener('input', function () {
  state.difficultyMultiplier = parseFloat(this.value);
  difficultyValue.textContent = state.difficultyMultiplier.toFixed(2) + 'x';
});

playBtn.addEventListener('click', startGame);

document.addEventListener('keypress', function (event) {
  if (event.code === 'Space' && !started) {
    startGame();
  }
});

function startGame() {
  if (started) return;

  started = true;
  level = 0;
  gameSeq = [];
  userSeq = [];

  playBtn.classList.add('hidden');
  h2.textContent = 'Watch the sequence...';

  setTimeout(() => {
    levelUp();
  }, 1000);
}

function gameFlash(btn) {
  playSound(colorFreq(btn.id), 150);
  btn.classList.add('flash', 'pulse');
  setTimeout(function () {
    btn.classList.remove('flash', 'pulse');
  }, 200);
}

function userFlash(btn) {
  playSound(colorFreq(btn.id), 100);
  btn.classList.add('userflash', 'pulse');
  setTimeout(function () {
    btn.classList.remove('userflash', 'pulse');
  }, 200);
}

function levelUp() {
  userSeq = [];
  level++;
  currentLevelDisplay.textContent = level;
  h2.textContent = `Level ${level} - Watch carefully!`;

  const colors = activeColors();
  let randColor = colors[Math.floor(Math.random() * colors.length)];

  // Avoid immediate repeats after level 3
  if (
    level > 3 &&
    gameSeq.length > 0 &&
    randColor === gameSeq[gameSeq.length - 1] &&
    Math.random() < 0.7
  ) {
    randColor = colors[Math.floor(Math.random() * colors.length)];
  }

  gameSeq.push(randColor);
  showSequence();
}

function showSequence() {
  isShowingSequence = true;
  disableButtons();

  const timings = getTimingsForDifficulty(state.difficultyMultiplier);
  let delay = 500;

  gameSeq.forEach((color, index) => {
    setTimeout(() => {
      const btn = document.getElementById(color);
      gameFlash(btn);

      if (index === gameSeq.length - 1) {
        setTimeout(() => {
          isShowingSequence = false;
          enableButtons();
          h2.textContent = `Your turn! Repeat the sequence (${gameSeq.length} colors)`;
        }, timings.gapMs);
      }
    }, delay + index * (timings.announcementMs + timings.gapMs));
  });
}

function checkAns(idx) {
  if (userSeq[idx] === gameSeq[idx]) {
    if (userSeq.length === gameSeq.length) {
      // Correct sequence completed — show a checkmark + countdown arc
      // instead of a "Correct! Next level coming..." text message.
      disableButtons();
      h2.textContent = '';
      showLevelUpFeedback();
    }
  } else {
    gameOver();
  }
}

let ringTimeout = null;
function showLevelUpFeedback() {
  const timings = getTimingsForDifficulty(state.difficultyMultiplier);
  const durationMs = timings.roundMs;

  statusBadge.classList.add('visible');
  checkmark.classList.add('show');

  // Reset the ring, then force a reflow so the transition restarts cleanly.
  ringProgress.style.transition = 'none';
  ringProgress.style.strokeDashoffset = '0';
  void ringProgress.getBoundingClientRect();
  ringProgress.style.transition = `stroke-dashoffset ${durationMs}ms linear`;
  ringProgress.style.strokeDashoffset = String(RING_CIRCUMFERENCE);

  clearTimeout(ringTimeout);
  ringTimeout = setTimeout(() => {
    statusBadge.classList.remove('visible');
    checkmark.classList.remove('show');
    levelUp();
  }, durationMs);
}

function gameOver() {
  let gameOverText = `🎯 Game Over! You reached level <strong>${level}</strong>`;

  if (level > highScore) {
    highScore = level;
    highScoreDisplay.textContent = highScore;
    localStorage.setItem('simonHighScore', highScore);
    gameOverText += `<br><br>🏆 New High Score!`;
  }

  h2.innerHTML = gameOverText;

  document.body.classList.add('game-over');
  playSound(150, 500); // Low error sound

  setTimeout(() => {
    document.body.classList.remove('game-over');
    showRestartOption();
  }, 1000);
}

function showRestartOption() {
  playBtn.classList.remove('hidden');
  playBtn.textContent = '🔄';
  reset();
}

function btnPress() {
  if (!started || isShowingSequence) return;

  userFlash(this);
  userSeq.push(this.id);
  checkAns(userSeq.length - 1);
}

function disableButtons() {
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.style.pointerEvents = 'none';
    btn.style.opacity = '0.7';
  });
}

function enableButtons() {
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.style.pointerEvents = 'auto';
    btn.style.opacity = '1';
  });
}

function reset() {
  started = false;
  gameSeq = [];
  userSeq = [];
  level = 0;
  currentLevelDisplay.textContent = '0';
  isShowingSequence = false;
  enableButtons();
}

// Keyboard controls: number keys map to tiles in on-screen order (1st tile,
// 2nd tile, ...) so they keep working regardless of numTiles.
document.addEventListener('keydown', function (event) {
  if (!started || isShowingSequence) return;

  const tiles = Array.from(document.querySelectorAll('.btn'));
  const n = parseInt(event.key, 10);
  if (!Number.isNaN(n) && n >= 1 && n <= tiles.length) {
    tiles[n - 1].click();
    return;
  }

  const legacyMap = { q: 0, w: 1, a: 2, s: 3 };
  const legacyIdx = legacyMap[event.key.toLowerCase()];
  if (legacyIdx !== undefined && tiles[legacyIdx]) {
    tiles[legacyIdx].click();
  }
});

// Orientation and resize handling
window.addEventListener('orientationchange', function () {
  setTimeout(() => {
    if (window.DeviceOrientationEvent) {
      window.scrollTo(0, 1);
    }
  }, 100);
});

window.addEventListener('resize', function () {
  if (started && !isShowingSequence) {
    btnContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});

// Skillprint instrumentation controls — called from skillprintShim.js.
window.__simonControls = {
  setNumTiles(n) {
    const clamped = Math.max(2, Math.min(8, Math.round(n)));
    if (clamped === state.numTiles) return;
    state.numTiles = clamped;
    renderTiles();
    if (started) {
      // Mid-round tile-count changes would desync the running sequence —
      // end the round cleanly instead of leaving stale buttons wired up.
      reset();
      playBtn.classList.remove('hidden');
      playBtn.textContent = '▶';
      h2.textContent = '';
    }
  },
  setDifficultyMultiplier(m) {
    const clamped = Math.max(0.5, Math.min(1.5, m));
    state.difficultyMultiplier = clamped;
    difficultySlider.value = String(clamped);
    difficultyValue.textContent = clamped.toFixed(2) + 'x';
  },
};

renderTiles();
