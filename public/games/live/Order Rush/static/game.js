(function () {
  const LOGICAL_W = 1000, LOGICAL_H = 600;
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');

  const FOOD_TYPES = [
    { id: 'burger', icon: '🍔', tip: 5, cook: 1.0 },
    { id: 'pizza', icon: '🍕', tip: 6, cook: 1.2 },
    { id: 'salad', icon: '🥗', tip: 4, cook: 0.8 },
    { id: 'pasta', icon: '🍝', tip: 7, cook: 1.3 },
    { id: 'sushi', icon: '🍣', tip: 8, cook: 1.4 },
    { id: 'coffee', icon: '☕', tip: 3, cook: 0.5 },
    { id: 'donut', icon: '🍩', tip: 3, cook: 0.5 },
    { id: 'taco', icon: '🌮', tip: 5, cook: 0.9 },
  ];

  const CUSTOMER_TYPES = [
    { id: 'regular', weight: 60, color: '#F4A259', dark: '#B9703A', patienceMult: 1.0, tipMult: 1.0 },
    { id: 'vip', weight: 20, color: '#9C8CFF', dark: '#5C46D6', patienceMult: 0.72, tipMult: 1.7 },
    { id: 'chill', weight: 20, color: '#7BD9FF', dark: '#2E8FB8', patienceMult: 1.55, tipMult: 0.75 },
  ];

  const TABLE_POS = [
    { x: 230, y: 200 }, { x: 410, y: 200 }, { x: 590, y: 200 }, { x: 770, y: 200 },
    { x: 230, y: 430 }, { x: 410, y: 430 }, { x: 590, y: 430 }, { x: 770, y: 430 },
  ];
  const QUEUE_POS = [120, 200, 280, 360, 440].map(y => ({ x: 80, y }));
  const DOOR = { x: 80, y: 50 };
  const COUNTER = { x: 935, y: 320, top: 90, bottom: 560 };
  const SERVER_HOME = { x: 500, y: 555 };
  const SERVER_SPEED = 480; // px/sec

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];
  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const fmtMoney = (n) => `$${n.toFixed(0)}`;

  function weightedPick(list) {
    const total = list.reduce((s, c) => s + c.weight, 0);
    let r = Math.random() * total;
    for (const c of list) { if ((r -= c.weight) <= 0) return c; }
    return list[list.length - 1];
  }

  const params = {
    customerSpawnIntervalMs: 3500,
    patienceSec: 22,
    cookTimeMs: 3000,
    tableCount: 4,
    difficultyMultiplier: 1.0,
    sessionLengthSec: 180,
  };

  let uid = 1;
  const nextId = () => uid++;

  const state = {
    phase: 'loading', // loading | ready | playing | upgrade | gameover
    score: 0,
    tips: 0,
    combo: 1,
    comboBest: 1,
    lives: 3,
    served: 0,
    elapsed: 0,
    tableCount: params.tableCount,
    tables: [],
    queue: [],
    readyTray: [],
    cooking: [],
    server: { x: SERVER_HOME.x, y: SERVER_HOME.y, job: null, queue: [] },
    selectedCustomerId: null,
    spawnAt: 900,
    nextUpgradeAt: 42,
    particles: [],
    toasts: [],
    shake: 0,
  };
  window.__orderRushState = state;
  Object.defineProperty(window.__orderRushState, 'running', { get: () => state.phase === 'playing', enumerable: true });

  function resetGame() {
    state.score = 0; state.tips = 0; state.combo = 1; state.comboBest = 1; state.lives = 3;
    state.served = 0; state.elapsed = 0;
    state.tableCount = clamp(params.tableCount, 2, 8);
    state.tables = TABLE_POS.slice(0, state.tableCount).map((p, i) => ({
      id: i, x: p.x, y: p.y, status: 'clean', customer: null, decideAt: 0, cookId: null,
    }));
    state.queue = [];
    state.readyTray = [];
    state.cooking = [];
    state.server = { x: SERVER_HOME.x, y: SERVER_HOME.y, job: null, queue: [] };
    state.selectedCustomerId = null;
    state.spawnAt = 900;
    state.nextUpgradeAt = 42;
    state.particles = [];
    state.toasts = [];
    state.shake = 0;
  }
  resetGame();

  function spawnIntervalNow() {
    const rampMs = Math.max(0, params.customerSpawnIntervalMs - state.elapsed * 55);
    return clamp(rampMs / params.difficultyMultiplier, 900, 9000);
  }
  function patienceSecNow(mult) {
    const ramp = Math.max(0.55, 1 - state.elapsed / 900);
    return clamp(params.patienceSec * mult * ramp / params.difficultyMultiplier, 5, 90);
  }

  function spawnCustomer() {
    if (state.queue.length >= QUEUE_POS.length) return;
    const type = weightedPick(CUSTOMER_TYPES);
    state.queue.push({
      id: nextId(), type, patience: 1, patienceMax: patienceSecNow(type.patienceMult) * 1.3,
      bob: Math.random() * Math.PI * 2, x: DOOR.x, y: DOOR.y, tx: 0, ty: 0,
    });
  }

  function layoutQueue() {
    state.queue.forEach((c, i) => { const p = QUEUE_POS[i]; c.tx = p.x; c.ty = p.y; });
  }

  function addToast(x, y, text, color) {
    state.toasts.push({ x, y, text, color, life: 1.1 });
  }
  function addBurst(x, y, color) {
    for (let i = 0; i < 10; i++) {
      const a = Math.random() * Math.PI * 2, sp = 60 + Math.random() * 90;
      state.particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.6, color });
    }
  }

  function comboMultiplier() { return 1 + (state.combo - 1) * 0.14; }

  function loseLife(table) {
    state.lives -= 1;
    state.combo = 1;
    state.shake = 0.35;
    addToast(table ? table.x : DOOR.x, table ? table.y - 60 : DOOR.y - 30, 'Walked out! 😡', '#ff5d73');
    if (state.lives <= 0) endGame(false);
  }

  function customerLeavesTable(table, angry) {
    if (angry) loseLife(table);
    state.cooking = state.cooking.filter(c => c.tableId !== table.id);
    state.readyTray = state.readyTray.filter(c => c.tableId !== table.id);
    table.customer = null;
    table.status = 'dirty';
  }

  function removeFromQueue(id) {
    const i = state.queue.findIndex(c => c.id === id);
    if (i >= 0) state.queue.splice(i, 1);
    layoutQueue();
  }

  // --- server job queue -----------------------------------------------
  function enqueueJob(job) {
    state.server.queue = [job]; // latest click wins; keeps controls snappy
  }

  function startNextJob() {
    if (state.server.job || state.server.queue.length === 0) return;
    state.server.job = state.server.queue.shift();
    const j = state.server.job;
    j.fromX = state.server.x; j.fromY = state.server.y;
    j.d = Math.max(1, dist({ x: j.fromX, y: j.fromY }, { x: j.x, y: j.y }));
    j.t = 0;
  }

  function finishJob(job) {
    if (job.type === 'seat') {
      const t = state.tables.find(tb => tb.id === job.tableId);
      const c = job.customer;
      if (t && t.status === 'clean' && c) {
        t.status = 'deciding'; t.customer = c; t.decideAt = 0.9;
      }
    } else if (job.type === 'order') {
      const t = state.tables.find(tb => tb.id === job.tableId);
      if (t && t.status === 'order-ready' && t.customer) {
        const food = pick(FOOD_TYPES);
        const cookMs = params.cookTimeMs * food.cook / params.difficultyMultiplier;
        t.customer.order = food;
        t.status = 'cooking';
        state.cooking.push({ tableId: t.id, food, doneAt: cookMs / 1000 });
      }
    } else if (job.type === 'pickup') {
      const idx = state.readyTray.findIndex(d => d.tableId === job.dish.tableId);
      if (idx >= 0) {
        const dish = state.readyTray.splice(idx, 1)[0];
        state.server.carrying = dish;
      }
    } else if (job.type === 'deliver') {
      const t = state.tables.find(tb => tb.id === job.tableId);
      const carrying = state.server.carrying;
      if (t && carrying && carrying.tableId === t.id && t.customer) {
        const ratio = clamp(t.customer.patience, 0, 1);
        const tip = carrying.food.tip * t.customer.type.tipMult * (0.4 + 0.6 * ratio) * comboMultiplier();
        state.tips += tip;
        state.score += Math.round(tip * 10);
        state.combo = Math.min(12, state.combo + 1);
        state.comboBest = Math.max(state.comboBest, state.combo);
        state.served += 1;
        addBurst(t.x, t.y - 40, '#7CFFB2');
        addToast(t.x, t.y - 50, `+${fmtMoney(tip)}`, '#7CFFB2');
        t.status = 'eating';
        t.customer.eatLeft = 3.2;
        state.server.carrying = null;
      }
    } else if (job.type === 'bus') {
      const t = state.tables.find(tb => tb.id === job.tableId);
      if (t && t.status === 'dirty') { t.status = 'clean'; addBurst(t.x, t.y, '#9fd3ff'); }
    }
  }

  function tryHandleClick(mx, my) {
    if (state.phase !== 'playing') return;

    for (const c of state.queue) {
      if (dist({ x: mx, y: my }, { x: c.tx, y: c.ty }) < 30) {
        state.selectedCustomerId = (state.selectedCustomerId === c.id) ? null : c.id;
        return;
      }
    }

    if (mx > COUNTER.x - 55 && mx < COUNTER.x + 55 && my > COUNTER.top && my < COUNTER.bottom) {
      if (!state.server.carrying && state.readyTray.length > 0) {
        enqueueJob({ type: 'pickup', x: COUNTER.x, y: 240, dish: state.readyTray[0] });
      }
      return;
    }

    for (const t of state.tables) {
      if (dist({ x: mx, y: my }, { x: t.x, y: t.y }) < 62) {
        if (t.status === 'clean' && state.selectedCustomerId != null) {
          const ci = state.queue.find(c => c.id === state.selectedCustomerId);
          if (ci) {
            removeFromQueue(ci.id);
            state.selectedCustomerId = null;
            enqueueJob({ type: 'seat', x: t.x, y: t.y + 46, tableId: t.id, customer: ci });
          }
        } else if (t.status === 'order-ready') {
          enqueueJob({ type: 'order', x: t.x, y: t.y + 46, tableId: t.id });
        } else if (state.server.carrying && state.server.carrying.tableId === t.id) {
          enqueueJob({ type: 'deliver', x: t.x, y: t.y + 46, tableId: t.id });
        } else if (t.status === 'dirty') {
          enqueueJob({ type: 'bus', x: t.x, y: t.y + 46, tableId: t.id });
        }
        return;
      }
    }
  }

  // --- update -----------------------------------------------------------
  function updateServer(dt) {
    startNextJob();
    const job = state.server.job;
    if (!job) return;
    job.t += dt * SERVER_SPEED / job.d;
    const t = clamp(job.t, 0, 1);
    state.server.x = lerp(job.fromX, job.x, t);
    state.server.y = lerp(job.fromY, job.y, t);
    if (t >= 1) {
      finishJob(job);
      state.server.job = null;
    }
  }

  function updateQueue(dt) {
    for (let i = state.queue.length - 1; i >= 0; i--) {
      const c = state.queue[i];
      c.bob += dt * 4;
      c.patience -= dt / c.patienceMax;
      if (c.patience <= 0) {
        addToast(c.tx, c.ty - 30, 'Left 🚶', '#ffb199');
        state.combo = 1;
        state.queue.splice(i, 1);
        layoutQueue();
      }
    }
  }

  function updateTables(dt) {
    for (const t of state.tables) {
      if (t.status === 'deciding') {
        t.decideAt -= dt;
        if (t.decideAt <= 0) t.status = 'order-ready';
      }
      if (t.customer && (t.status === 'deciding' || t.status === 'order-ready' || t.status === 'cooking')) {
        const c = t.customer;
        const pmax = patienceSecNow(c.type.patienceMult);
        c.patience -= dt / pmax;
        c.bob += dt * 3;
        if (c.patience <= 0) customerLeavesTable(t, true);
      } else if (t.status === 'eating' && t.customer) {
        t.customer.eatLeft -= dt;
        t.customer.bob += dt * 2;
        if (t.customer.eatLeft <= 0) customerLeavesTable(t, false);
      }
    }
  }

  function updateCooking(dt) {
    for (let i = state.cooking.length - 1; i >= 0; i--) {
      const j = state.cooking[i];
      j.doneAt -= dt;
      if (j.doneAt <= 0) {
        state.cooking.splice(i, 1);
        state.readyTray.push({ tableId: j.tableId, food: j.food });
      }
    }
  }

  function updateFx(dt) {
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 220 * dt; p.life -= dt;
      if (p.life <= 0) state.particles.splice(i, 1);
    }
    for (let i = state.toasts.length - 1; i >= 0; i--) {
      const tst = state.toasts[i];
      tst.y -= dt * 26; tst.life -= dt;
      if (tst.life <= 0) state.toasts.splice(i, 1);
    }
    state.shake = Math.max(0, state.shake - dt);
  }

  const UPGRADE_POOL = [
    { id: 'table', label: 'Open a Table', emoji: '\u{1FA91}', desc: '+1 table for the rest of the shift', active: () => state.tableCount < 8 },
    { id: 'kitchen', label: 'Sharper Knives', emoji: '🔪', desc: 'Kitchen cooks 18% faster', active: () => true },
    { id: 'patience', label: 'Happy Hour', emoji: '🍻', desc: 'Guests are 15% more patient', active: () => true },
    { id: 'life', label: 'Second Wind', emoji: '❤️', desc: '+1 life', active: () => state.lives < 3 },
  ];
  function applyUpgrade(id) {
    if (id === 'table' && state.tableCount < 8) {
      state.tableCount += 1;
      state.tables.push({ id: state.tableCount - 1, ...TABLE_POS[state.tableCount - 1], status: 'clean', customer: null, decideAt: 0 });
    } else if (id === 'kitchen') {
      params.cookTimeMs = Math.max(900, params.cookTimeMs * 0.82);
    } else if (id === 'patience') {
      params.patienceSec = Math.min(60, params.patienceSec * 1.15);
    } else if (id === 'life') {
      state.lives = Math.min(3, state.lives + 1);
    }
  }

  function maybeTriggerUpgrade() {
    if (state.elapsed >= state.nextUpgradeAt) {
      state.nextUpgradeAt += 42;
      showUpgrade();
    }
  }

  function update(dt) {
    if (state.phase !== 'playing') return;
    state.elapsed += dt;
    state.spawnAt -= dt * 1000;
    if (state.spawnAt <= 0) { spawnCustomer(); layoutQueue(); state.spawnAt = spawnIntervalNow(); }

    updateServer(dt);
    updateQueue(dt);
    updateTables(dt);
    updateCooking(dt);
    updateFx(dt);
    maybeTriggerUpgrade();

    if (state.elapsed >= params.sessionLengthSec) endGame(true);
    updateHud();
  }

  // --- rendering ----------------------------------------------------------
  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawFloor() {
    ctx.fillStyle = '#241a63';
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
    const tile = 42;
    for (let y = 0; y < LOGICAL_H; y += tile) {
      for (let x = 0; x < LOGICAL_W; x += tile) {
        const even = (((x / tile) | 0) + ((y / tile) | 0)) % 2 === 0;
        ctx.fillStyle = even ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.08)';
        ctx.fillRect(x, y, tile, tile);
      }
    }
    ctx.strokeStyle = 'rgba(255,255,255,.08)';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, LOGICAL_W - 20, LOGICAL_H - 20);
  }

  function drawDoorAndQueue() {
    ctx.fillStyle = '#FFD166';
    ctx.font = '26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🚪', DOOR.x, DOOR.y + 10);
    ctx.font = '11px Arial';
    ctx.fillStyle = 'rgba(255,255,255,.65)';
    ctx.fillText('ENTRANCE', DOOR.x, DOOR.y + 30);

    state.queue.forEach(c => drawCustomer(c, c.tx, c.ty + Math.sin(c.bob) * 3, state.selectedCustomerId === c.id));
  }

  function drawPatienceRing(x, y, ratio) {
    const color = ratio > 0.55 ? '#7CFFB2' : ratio > 0.25 ? '#FFD166' : '#ff5d73';
    ctx.beginPath();
    ctx.arc(x, y, 22, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp(ratio, 0, 1));
    ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.stroke();
  }

  function drawCustomer(c, x, y, selected) {
    if (selected) {
      ctx.beginPath(); ctx.arc(x, y, 26, 0, Math.PI * 2);
      ctx.strokeStyle = '#FFD166'; ctx.lineWidth = 3; ctx.stroke();
    }
    if (c.patience !== undefined && c.patienceMax !== undefined) drawPatienceRing(x, y - 4, c.patience);
    ctx.fillStyle = c.type.color;
    roundRect(x - 13, y - 2, 26, 26, 8); ctx.fill();
    ctx.beginPath(); ctx.arc(x, y - 16, 13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.type.dark;
    ctx.beginPath(); ctx.arc(x - 5, y - 17, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 5, y - 17, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    if (c.patience !== undefined && c.patience < 0.3) { ctx.arc(x, y - 11, 3, Math.PI, 0); } else { ctx.arc(x, y - 10, 3, 0, Math.PI); }
    ctx.strokeStyle = c.type.dark; ctx.lineWidth = 1.6; ctx.stroke();

    if (c.order && (c.eatLeft === undefined)) {
      ctx.font = '20px sans-serif';
      ctx.fillText(c.order.icon, x, y - 42);
    } else if (c.eatLeft !== undefined) {
      ctx.font = '16px sans-serif';
      ctx.fillText('😋', x, y - 40);
    }
  }

  function drawTable(t) {
    const chairColor = 'rgba(0,0,0,.25)';
    ctx.fillStyle = chairColor;
    [[-46, -46], [46, -46], [-46, 46], [46, 46]].forEach(([dx, dy]) => {
      ctx.beginPath(); ctx.arc(t.x + dx, t.y + dy, 11, 0, Math.PI * 2); ctx.fill();
    });

    let cloth = '#F6E7C9';
    if (t.status === 'dirty') cloth = '#8a7358';
    else if (t.status === 'clean') cloth = '#F6E7C9';
    else cloth = '#FBEFD8';

    ctx.fillStyle = 'rgba(0,0,0,.25)';
    ctx.beginPath(); ctx.ellipse(t.x, t.y + 6, 48, 40, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = cloth;
    ctx.beginPath(); ctx.ellipse(t.x, t.y, 46, 38, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(84,61,235,.35)'; ctx.lineWidth = 3;
    ctx.stroke();

    if (t.status === 'dirty') {
      ctx.font = '20px sans-serif';
      ctx.fillText('🧻', t.x, t.y + 6);
    }

    if (t.customer) {
      drawCustomer(t.customer, t.x, t.y - 4 + (t.customer.bob ? Math.sin(t.customer.bob) * 2 : 0));
      if (t.status === 'cooking') {
        ctx.font = '11px Arial'; ctx.fillStyle = '#FFD166';
        ctx.fillText('cooking…', t.x, t.y + 30);
      } else if (t.status === 'order-ready') {
        ctx.font = '18px sans-serif';
        ctx.fillText('💬', t.x + 26, t.y - 38);
      }
      const readyHere = state.readyTray.some(d => d.tableId === t.id);
      if (readyHere) {
        ctx.font = '16px sans-serif';
        ctx.fillText('🔔', t.x - 30, t.y - 38);
      }
    }
  }

  function drawCounter() {
    ctx.fillStyle = 'rgba(0,0,0,.2)';
    roundRect(COUNTER.x - 60, COUNTER.top - 30, 120, COUNTER.bottom - COUNTER.top + 40, 20); ctx.fill();
    ctx.strokeStyle = 'rgba(84,61,235,.5)'; ctx.lineWidth = 3;
    roundRect(COUNTER.x - 60, COUNTER.top - 30, 120, COUNTER.bottom - COUNTER.top + 40, 20); ctx.stroke();

    ctx.font = '30px sans-serif'; ctx.fillStyle = '#fff';
    ctx.fillText('🔥', COUNTER.x, COUNTER.top + 10);
    ctx.font = '10px Arial'; ctx.fillStyle = 'rgba(255,255,255,.6)';
    ctx.fillText('KITCHEN', COUNTER.x, COUNTER.top + 30);

    state.cooking.forEach((j, i) => {
      ctx.font = '18px sans-serif'; ctx.globalAlpha = 0.55;
      ctx.fillText(j.food.icon, COUNTER.x - 30 + (i % 2) * 30, COUNTER.top + 65 + Math.floor(i / 2) * 28);
      ctx.globalAlpha = 1;
    });

    state.readyTray.forEach((d, i) => {
      const y = 240 + i * 46;
      ctx.fillStyle = 'rgba(255,209,102,.18)';
      roundRect(COUNTER.x - 32, y - 20, 64, 40, 10); ctx.fill();
      ctx.font = '24px sans-serif'; ctx.fillStyle = '#fff';
      ctx.fillText(d.food.icon, COUNTER.x, y + 8);
    });
  }

  function drawServer() {
    const s = state.server;
    ctx.fillStyle = 'rgba(0,0,0,.3)';
    ctx.beginPath(); ctx.ellipse(s.x, s.y + 20, 16, 6, 0, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#543DEB';
    roundRect(s.x - 13, s.y - 6, 26, 26, 9); ctx.fill();
    ctx.fillStyle = '#ffd9b3';
    ctx.beginPath(); ctx.arc(s.x, s.y - 20, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    roundRect(s.x - 13, s.y - 30, 26, 9, 4); ctx.fill();

    if (s.carrying) {
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      ctx.beginPath(); ctx.ellipse(s.x + 20, s.y - 6, 14, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.font = '18px sans-serif'; ctx.fillStyle = '#000';
      ctx.fillText(s.carrying.food.icon, s.x + 20, s.y - 2);
    }
  }

  function drawFx() {
    state.particles.forEach(p => {
      ctx.globalAlpha = clamp(p.life / 0.6, 0, 1);
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
    state.toasts.forEach(t => {
      ctx.globalAlpha = clamp(t.life / 1.1, 0, 1);
      ctx.font = 'bold 16px Arial'; ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);
    });
    ctx.globalAlpha = 1;
  }

  function render() {
    ctx.save();
    if (state.shake > 0) {
      ctx.translate((Math.random() - 0.5) * 8 * state.shake, (Math.random() - 0.5) * 8 * state.shake);
    }
    drawFloor();
    drawCounter();
    drawDoorAndQueue();
    state.tables.forEach(drawTable);
    drawServer();
    drawFx();
    ctx.restore();
  }

  function updateHud() {
    document.getElementById('hud-score').textContent = state.score;
    document.getElementById('hud-tips').textContent = fmtMoney(state.tips);
    document.getElementById('hud-combo').textContent = `x${comboMultiplier().toFixed(1)}`;
    document.getElementById('hud-lives').textContent = '♥'.repeat(Math.max(0, state.lives)) + '♡'.repeat(Math.max(0, 3 - state.lives));
    document.getElementById('hud-timer').textContent = fmtTime(Math.max(0, params.sessionLengthSec - state.elapsed));
  }

  // --- flow: start / upgrade / end --------------------------------------
  const $ = (id) => document.getElementById(id);
  function showScreen(id) {
    ['start-screen', 'upgrade-modal', 'gameover-screen'].forEach(s => $(s).classList.toggle('hidden', s !== id));
  }

  function startGame() {
    resetGame();
    state.phase = 'playing';
    $('start-screen').classList.add('hidden');
    $('upgrade-modal').classList.add('hidden');
    $('gameover-screen').classList.add('hidden');
    updateHud();
  }

  function showUpgrade() {
    state.phase = 'upgrade';
    const pool = UPGRADE_POOL.filter(u => u.active());
    const picks = [];
    while (picks.length < 2 && pool.length) {
      const i = (Math.random() * pool.length) | 0;
      picks.push(pool.splice(i, 1)[0]);
    }
    const box = $('upgrade-choices');
    box.innerHTML = '';
    picks.forEach(u => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.innerHTML = `<span class="emoji">${u.emoji}</span><span>${u.label}</span><span class="desc">${u.desc}</span>`;
      btn.onclick = () => { applyUpgrade(u.id); resumeFromUpgrade(); };
      box.appendChild(btn);
    });
    showScreen('upgrade-modal');
  }
  function resumeFromUpgrade() {
    state.phase = 'playing';
    showScreen(null);
  }

  function endGame(timeUp) {
    state.phase = 'gameover';
    $('gameover-title').textContent = timeUp ? 'Shift Complete!' : 'The Line Walked Out…';
    $('gameover-stats').innerHTML = `
      <span class="k">Score</span><span class="v">${state.score}</span>
      <span class="k">Tips Earned</span><span class="v">${fmtMoney(state.tips)}</span>
      <span class="k">Guests Served</span><span class="v">${state.served}</span>
      <span class="k">Best Combo</span><span class="v">x${(1 + (state.comboBest - 1) * 0.14).toFixed(1)}</span>
    `;
    showScreen('gameover-screen');
  }

  $('play-btn').addEventListener('click', startGame);
  $('restart-btn').addEventListener('click', startGame);

  canvas.addEventListener('pointerdown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scale = LOGICAL_W / rect.width;
    const mx = (e.clientX - rect.left) * scale;
    const my = (e.clientY - rect.top) * scale;
    tryHandleClick(mx, my);
  });

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr * (rect.width / LOGICAL_W), 0, 0, dpr * (rect.height / LOGICAL_H), 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    render();
    requestAnimationFrame(loop);
  }
  state.phase = 'ready';
  requestAnimationFrame(loop);

  const clampInt = (v, lo, hi) => clamp(Math.round(v), lo, hi);
  window.__orderRushControls = {
    setCustomerSpawnIntervalMs(v) { params.customerSpawnIntervalMs = clampInt(v, 1500, 6000); },
    setPatienceSec(v) { params.patienceSec = clamp(v, 12, 40); },
    setCookTimeMs(v) { params.cookTimeMs = clampInt(v, 1500, 6000); },
    setTableCount(v) {
      const n = clampInt(v, 2, 8);
      params.tableCount = n;
      if (state.phase === 'playing') {
        if (n > state.tableCount) {
          for (let i = state.tableCount; i < n; i++) state.tables.push({ id: i, ...TABLE_POS[i], status: 'clean', customer: null, decideAt: 0 });
        } else if (n < state.tableCount) {
          state.tables = state.tables.slice(0, n);
        }
        state.tableCount = n;
      }
    },
    setDifficultyMultiplier(v) { params.difficultyMultiplier = clamp(v, 0.5, 1.5); },
    setSessionLengthSec(v) { params.sessionLengthSec = clampInt(v, 60, 360); },
  };
})();
