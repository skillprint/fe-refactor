/*
 * Skillprint Live Session Console - the Hextris demo scoring dashboard.
 *
 * Three blocks lifted verbatim from the design system's js/skillprint.js:
 * the shared theme controller (the colour-mode toggle), the credential
 * reveal (the eye button on the API key field) and the dashboard module
 * itself. Everything else in that file belongs to pages this package does
 * not carry.
 */

/* === SHARED THEME CONTROLLER: START === */
/* One theme state drives every page that exposes a light/dark control. */
(() => {
  const root = document.documentElement;
  const body = document.body;
  if (!body) return;

  const valueControls = [...document.querySelectorAll('[data-theme-value]')];
  const toggleControls = [...document.querySelectorAll('[data-theme-toggle]')];
  if (!valueControls.length && !toggleControls.length) return;

  /* The portal opens light while the rest of the system opens dark, so it holds
     its own key instead of the shared one. Sharing meant a dark choice made on
     any other page was read first and decided how the portal opened, so the
     page's own default was never reached. The key is deliberately not the old
     skillprint-portal-surface: that name still holds dark wherever the portal
     was toggled before the default moved, and those saved values would outlive
     the change.

     The key belongs to the portal, not to one of its screens. Testing the
     games page alone meant Home, Skills and Profile still read the shared key,
     so a dark choice made anywhere else in the system decided how they opened
     and their own data-theme="light" never took effect. Every portal screen
     carries page--portal, so that is what is tested. */
  const storageKeys = body.classList.contains('page--portal')
    || body.classList.contains('page--portal-games')
    ? ['skillprint-portal-theme']
    : ['skillprint-theme'];
  if (body.classList.contains('page--design-system')) storageKeys.push('skillprint-surface');
  if (body.classList.contains('page--labs-benchmark')) storageKeys.push('skillprint-labs-theme');

  /* The toggle draws the state it switches to. Both marks are in the Untitled
     UI sprite, so this references them rather than carrying its own copy of
     the path data. The two references are written out in full because the
     icons task finds runtime symbols by scanning this file for the literal
     href - build them by interpolation and the symbol is never inlined, so
     the toggle renders empty. */
  const SUN_MARK = '<use href="#ti-sun"></use>';
  const MOON_MARK = '<use href="#ti-moon"></use>';
  const toggleMark = theme => (theme === 'dark' ? SUN_MARK : MOON_MARK);
  const normalize = value => value === 'light' ? 'light' : 'dark';

  const readSavedTheme = () => {
    for (const key of storageKeys) {
      try {
        const value = localStorage.getItem(key);
        if (value === 'light' || value === 'dark') return value;
      } catch (error) {}
    }
    return normalize(root.dataset.theme || root.dataset.surface);
  };

  /* Built as the shared .sp-icon component, like every other icon: the class
     carries fill, stroke, cap, join and the weight that matches its size.
     Setting fill/stroke/stroke-width as attributes here instead left these
     the only icons on the page outside the system - square-capped, and with
     no width of their own, which crushed the one in the mobile header. */
  const updateToggleIcon = (control, theme) => {
    const mark = toggleMark(theme);
    const directSvgs = [...control.children].filter(child => child.tagName?.toLowerCase() === 'svg');
    if (!directSvgs.length) {
      control.innerHTML = `<svg class="sp-icon" aria-hidden="true" viewBox="0 0 24 24">${mark}</svg>`;
    } else if (directSvgs.length === 1) {
      const svg = directSvgs[0];
      svg.setAttribute('class', 'sp-icon');
      svg.setAttribute('viewBox', '0 0 24 24');
      ['fill', 'stroke', 'stroke-width', 'width', 'height'].forEach(name => svg.removeAttribute(name));
      svg.innerHTML = mark;
    }
  };

  const applyTheme = (value, options = {}) => {
    const theme = normalize(value);
    root.dataset.theme = theme;
    root.dataset.surface = theme;
    body.dataset.theme = theme;
    body.dataset.surface = theme;
    body.classList.toggle('light', theme === 'light');
    body.classList.toggle('dark', theme === 'dark');

    valueControls.forEach(control => {
      const selected = control.dataset.themeValue === theme;
      control.classList.toggle('is-active', selected);
      control.setAttribute('aria-pressed', String(selected));
    });
    /* A toggle is usually an icon-only button, and then the action is the whole
       accessible name. The portal's rail row is the exception: it carries a
       visible "Theme" label, and overwriting the name with the bare action
       would leave the one word a reader can see out of the name they can speak.
       A control marks that label with [data-theme-toggle-label] and the action
       is appended to it instead of replacing it. */
    toggleControls.forEach(control => {
      const action = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
      const named = control.querySelector('[data-theme-toggle-label]');
      const label = named ? named.textContent.trim() : '';
      control.setAttribute('aria-label', label ? `${label} — ${action.toLowerCase()}` : action);
      updateToggleIcon(control, theme);
    });

    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute('content', theme === 'dark' ? '#090D27' : '#F8FAFC');
    if (options.persist !== false) {
      for (const key of storageKeys) {
        try { localStorage.setItem(key, theme); } catch (error) {}
      }
    }
    if (options.emit !== false) document.dispatchEvent(new CustomEvent('skillprint:themechange', { detail: { theme } }));
  };

  valueControls.forEach(control => control.addEventListener('click', () => applyTheme(control.dataset.themeValue)));
  toggleControls.forEach(control => control.addEventListener('click', () => applyTheme((root.dataset.theme || root.dataset.surface) === 'dark' ? 'light' : 'dark')));
  applyTheme(readSavedTheme(), { persist: false, emit: false });
})();
/* === SHARED THEME CONTROLLER: END === */

(function () {
  const root = document.documentElement;
  const body = document.body;
  if (!body) return;
  const syncTheme = () => {
    for (const name of ['theme', 'surface', 'mode', 'appearance']) {
      if (root.dataset[name]) body.dataset[name] = root.dataset[name];
      else delete body.dataset[name];
    }
    const selectedTheme = root.dataset.theme || root.dataset.surface;
    for (const themeClass of ['light', 'dark']) {
      body.classList.toggle(themeClass, selectedTheme === themeClass || root.classList.contains(themeClass));
    }
  };
  syncTheme();
  new MutationObserver(syncTheme).observe(root, { attributes: true, attributeFilter: ['class', 'data-theme', 'data-surface', 'data-mode', 'data-appearance'] });
})();

/* === PORTAL CREDENTIALS: START ===
   Copy and reveal for an issued credential.

   The two fields on Settings used to be plain text inputs with placeholders
   reading "Enter User ID" and "Enter API Key", inside a section with no Save,
   no validation and no auto-save. Everything about them invited an edit that
   could not be made and would not have been kept. They are read-only now, and
   these are the two things a reader actually does with a credential.

   Hook-driven rather than page-guarded: the same pair belongs on any surface
   that shows an issued value, and the module stands down where there are none.
   The design system has a [data-copy] handler already, but it lives inside the
   page--design-system gate and copies an attribute rather than a field's
   value, so it cannot serve this. */
(function () {
  var copiers = document.querySelectorAll('[data-credential-copy]');
  var revealers = document.querySelectorAll('[data-credential-reveal]');
  if (!copiers.length && !revealers.length) { return; }

  copiers.forEach(function (button) {
    var field = document.getElementById(button.dataset.credentialCopy);
    var label = button.querySelector('[data-credential-label]');
    if (!field) { return; }

    button.addEventListener('click', function () {
      var done = function (ok) {
        if (!label) { return; }
        var was = label.textContent;
        label.textContent = ok ? 'Copied' : 'Press to copy';
        window.setTimeout(function () { label.textContent = was; }, 1400);
      };
      /* select() first so the fallback path has something to copy, and so a
         reader watching the field sees what was taken. */
      field.removeAttribute('disabled');
      try { field.select(); field.setSelectionRange(0, field.value.length); } catch (error) {}

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(field.value).then(function () { done(true); },
          function () { done(false); });
        return;
      }
      /* execCommand is deprecated and is the only thing that works without a
         secure context, which a prototype opened from file:// is not. */
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (error) { ok = false; }
      done(ok);
    });
  });

  revealers.forEach(function (button) {
    var field = document.getElementById(button.dataset.credentialReveal);
    if (!field) { return; }
    var name = (document.querySelector('label[for="' + field.id + '"]') || {}).textContent || 'value';

    button.addEventListener('click', function () {
      var shown = field.type === 'text';
      field.type = shown ? 'password' : 'text';
      button.setAttribute('aria-pressed', String(!shown));
      button.setAttribute('aria-label', (shown ? 'Show ' : 'Hide ') + name.trim());
      var use = button.querySelector('use');
      if (use) { use.setAttribute('href', shown ? '#ti-eye' : '#ti-eye-off'); }
    });
  });
}());
/* === PORTAL CREDENTIALS: END === */

/* === ADAPTIVE ASSIST PANEL: START === */
/* The Hextris demo scoring dashboard (index.html) - a port of
   the staging admin page's inline script onto the design system. The session
   lifecycle, the one-second capture, the batch of five, the endpoints, the
   five-second polling and the postMessage back into the game are the live
   page's own; only the rendering changed. The original element ids are kept
   so the two stay comparable, and every new hook is a data attribute.

   Where the page runs decides two things. Served from a skillprint.co host
   (the Django template) every request is same-origin, the CSRF cookie is
   sent as the live page sends it, and the game frame can be read - which is
   what the canvas capture and the debug-panel mirror need. Served from
   anywhere else it talks to api.staging.skillprint.co with the API key alone
   and the game frame is cross-origin, so capture falls to the html2canvas
   path and the mirror says so. Both are read off <body> data attributes so
   the template can override them. */
(() => {
  if (!document.body || document.body.dataset.skillprintPage !== 'adaptive-assist') return;

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const body = document.body;

  /* ---- Configuration ---------------------------------------------------- */
  const isProd = body.dataset.environment !== 'development';
  const sameHost = /^api(\.staging)?\.skillprint\.co$/.test(location.hostname);
  const directApi = 'https://api.staging.skillprint.co';
  let apiBase = (body.dataset.apiBase ? new URL(body.dataset.apiBase, location.href).href : (sameHost ? location.origin : directApi)).replace(/\/$/, '');
  let relayed = false;
  const CONFIG = {
    isProd,
    games: {
      hextris: {
        dev: {
          url: 'https://skillprint-bucket.s3.amazonaws.com/static/hextris_web/index.html',
          slug: 'hextris-475aff99-6346-4ea4-b432-dc8aa51f2178'
        },
        prod: {
          /* Same-origin endpoint that serves Hextris from static files, so
             the frame's canvas can be read for capture. */
          url: apiBase + '/scoring/admin/hextris-game/',
          slug: 'hextris-475aff99-6346-4ea4-b432-dc8aa51f2178'
        }
      }
    }
  };
  const env = CONFIG.isProd ? 'prod' : 'dev';
  /* The toolbar's game selector. A game becomes selectable by adding an
     <option> and a CONFIG.games entry under the same key; until a key has an
     entry it resolves to Hextris, so every choice loads Hextris for now. */
  const gameFor = key => CONFIG.games[key] || CONFIG.games.hextris;
  let gameKey = 'hextris';
  const selectedGame = () => gameFor(gameKey)[env];
  const slugEnv = selectedGame().slug;
  const params = new URLSearchParams(location.search);
  /* Off the API host the game frame is cross-origin and its canvas cannot be
     read, so the copy of the game that ships in this folder (hextris-game/) is
     preferred wherever the folder is served from; ?game= names any other URL.
     Neither applies on the API host, where the real game is same-origin. */
  let iframeEnv = params.get('game') || body.dataset.gameUrl || CONFIG.games.hextris[env].url;
  const localMirror = sameHost || location.protocol === 'file:' ? '' : new URL('hextris-game/index.html', location.href).href;
  /* From disk the mirror cannot be probed (fetch() refuses file: URLs), but
     it always ships in this folder, so the frame uses it outright. */
  if (location.protocol === 'file:' && !params.get('game') && !body.dataset.gameUrl) iframeEnv = new URL('hextris-game/index.html', location.href).href;
  const defaultApiKeyEnv = body.dataset.defaultApiKey || '';
  const BATCH_SIZE = 5;
  /* At most this many frames leave in one upload; a relay's PHP defaults cap
     files per request at 20, and smaller posts survive a slow API better. */
  const MAX_UPLOAD_FRAMES = 20;
  const CAPTURE_MS = 1000;
  const POLL_MS = 5000;
  const TARGET_MOOD = 'relax';
  const KEY_STORE = 'skillprint-adaptive-assist-key';
  const api = path => apiBase + path;
  /* Hosts the API's CORS policy does not list can carry proxy.php, a
     same-origin relay to the staging API. When its health check answers,
     every call goes through it, and the key travels in a second header the
     host is sure to pass on. Start waits for the probe so nothing races it. */
  const relayProbe = sameHost || location.protocol === 'file:' || body.dataset.apiBase ? '' : new URL('proxy.php?path=health', location.href).href;
  const apiReady = relayProbe
    ? fetch(relayProbe, { cache: 'no-store' }).then(r => (r.ok ? r.json() : null)).then(info => {
        if (!info || !info.ok) return false;
        relayed = true;
        apiBase = new URL('proxy.php?path=', location.href).href;
        return true;
      }).catch(() => false)
    : Promise.resolve(false);

  /* ---- Simulated scoring, for a copy opened straight from disk ------------
     A file:// page sends no origin and the API refuses it, so nothing past
     the start card could happen from disk. Opened from disk (or with ?demo=1
     on any host) the console runs against the scoring API simulated further
     down instead: the game is real, the session, batches, scores and
     adjustments are sample data that follow the API's shapes and timing. The
     env badge, the start card, the session record and the log all say so.
     Every API call goes through call(), which is fetch() everywhere else. */
  const simulated = location.protocol === 'file:' || params.get('demo') === '1';
  const simulation = simulated ? createSimulation() : null;
  const call = (path, init) => (simulated ? simulation.respond(path, init) : fetch(api(path), init));
  const keyHeaders = (apiKey, extra = {}) => {
    const headers = Object.assign({ Authorization: 'Api-Key ' + apiKey }, extra);
    if (relayed) headers['X-Skillprint-Key'] = apiKey;
    return headers;
  };

  /* ---- Elements: the live page's ids, plus the dashboard's hooks -------- */
  const apiKeyInput = $('#apiKey');
  const startButton = $('#startButton');
  const startForm = $('[data-aa-start-form]');
  const startPanel = $('#startPanel');
  const gameSession = $('#gameSession');
  const sessionInfo = $('#sessionInfo');
  const screenshotCounter = $('#screenshotCounter');
  const gameFrame = $('#gameFrame');
  const exitButton = $('#exitButton');
  const statusDiv = $('#status');
  const gameStatusDiv = $('#gameStatus');
  const skillsData = $('#skillsData');
  const flowData = $('#flowData');
  const analysisLog = $('#analysisLog');
  const skillTable = $('#skillTable');
  const flowBadge = $('#flowBadge');
  const flowBadgeValue = $('#flowBadgeValue');
  const flowBadgeMood = $('#flowBadgeMood');
  const chartSvg = $('#speedModifierChart');
  if (!apiKeyInput || !startButton || !gameSession || !gameFrame || !analysisLog) return;

  const hook = name => $('[data-aa-' + name + ']');
  const text = (name, value) => { $$('[data-aa-' + name + ']').forEach(el => { el.textContent = value; }); };

  /* ---- State: the live page's variables ---------------------------------- */
  let sessionId = '';
  let screenshotCount = 0;
  let screenshotInterval = null;
  let lastSentSpeedModifierValue = null;
  let screenshotBatch = [];
  let chunkIds = [];
  let analysisPoller = null;
  let sessionDataPoller = null;
  /* Dashboard bookkeeping, all derived from the same responses. */
  let uploadedChunks = 0;
  const analysedChunks = new Set();
  let adjustmentsSent = 0;
  let lastMetricsJson = '';
  let lastMoodJson = '';
  let speedNoticeLogged = false;
  let logEntries = [];
  let logStick = true;
  let closing = false;
  let uploading = false;

  /* ---- Small formatters --------------------------------------------------- */
  const two = n => String(n).padStart(2, '0');
  const clock = (date = new Date()) => date.toLocaleTimeString();
  const shortClock = (date = new Date()) => two(date.getHours()) + ':' + two(date.getMinutes()) + ':' + two(date.getSeconds());
  const num = (value, digits = 2) => {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n.toFixed(digits) : '—';
  };
  const plural = (n, word) => n + ' ' + word + (n === 1 ? '' : 's');
  const formatSkillName = key => String(key).split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const formatFlowMetric = key => String(key).split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const formatValue = value => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'number') return Number.isInteger(value) ? String(value) : value.toFixed(2);
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };
  const formatStamp = iso => {
    if (!iso) return '—';
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? String(iso) : shortClock(date);
  };
  const icon = (id, extra = '') => '<svg class="sp-icon' + (extra ? ' ' + extra : '') + '" aria-hidden="true" viewBox="0 0 24 24"><use href="#' + id + '"></use></svg>';

  /* ---- Headers ----------------------------------------------------------- */
  const csrfToken = () => {
    const field = $('input[name="csrfmiddlewaretoken"]');
    if (field && field.value) return field.value;
    const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
  };
  const authHeaders = (apiKey, extra = {}) => {
    const headers = keyHeaders(apiKey, extra);
    const token = csrfToken();
    if (token) headers['X-CSRFToken'] = token;
    return headers;
  };

  /* ---- Status, live state and the log ------------------------------------ */
  const TONES = { info: 'info', success: 'success', error: 'danger' };
  const TONE_ICONS = { info: 'ti-info', success: 'ti-success', danger: 'ti-error' };

  /* The strip shows the status in plain words; the log keeps the message
     exactly as the live page wrote it. */
  const PLAIN = [
    [/^Captured screenshot (\d+) \(batch: (\d+)\/(\d+)\)/, m => 'Recording · frame ' + m[1] + ' captured, ' + m[2] + ' of ' + m[3] + ' in the next batch'],
    [/^Uploaded batch of (\d+) screenshots/, m => 'Batch of ' + m[1] + ' frames sent for scoring'],
    [/^Error uploading screenshot batch: (\d+)[^·]*(?:· (.*))?$/, m => 'A batch was turned away by the API (' + m[1] + ')' + (m[2] ? ': ' + m[2].replace(/ Please verify.*$/, '') : '')],
    [/^Batch upload error: Failed to fetch/, () => 'Could not reach the scoring API; retrying with the next batch'],
    [/^Batch upload error: (.*)/, m => 'Could not send a batch: ' + m[1]],
    [/^Session started: /, () => 'Session started · loading the game'],
    [/^Uploading final screenshots/, () => 'Sending the last frames…'],
    [/^Final (batch|screenshots) uploaded/, () => 'All frames sent · the API will close the session'],
    [/^Session marked as complete/, () => 'Session closed'],
    [/^Screenshot error: (.*)/, m => 'Could not capture a frame: ' + m[1]],
    [/^Error loading game iframe/, () => 'The game did not load; frames cannot be captured']
  ];
  const plain = message => {
    for (const [pattern, render] of PLAIN) {
      const m = String(message).match(pattern);
      if (m) return render(m);
    }
    return message;
  };

  function setStatus(message, type = 'info', isGameStatus = false) {
    const element = isGameStatus ? gameStatusDiv : statusDiv;
    if (element) {
      const tone = TONES[type] || 'info';
      element.dataset.alertTone = tone;
      const use = element.querySelector('use');
      if (use) use.setAttribute('href', '#' + TONE_ICONS[tone]);
      const copy = element.querySelector('[data-aa-status-text]');
      if (copy) copy.textContent = isGameStatus ? plain(message) : message;
    }
    addLogEntry(message);
  }

  const LIVE = {
    idle: { tone: 'neutral', label: 'Idle' },
    starting: { tone: 'brand', label: 'Starting' },
    live: { tone: 'success', label: 'Live · recording' },
    closing: { tone: 'warning', label: 'Closing' }
  };

  function setLiveState(state) {
    body.dataset.sessionState = state;
    const badge = hook('live');
    if (badge) {
      badge.dataset.badgeTone = LIVE[state].tone;
      text('live-label', simulated && state === 'live' ? 'Live · simulated' : LIVE[state].label);
    }
    $$('[data-aa-when]').forEach(el => {
      const wants = el.dataset.aaWhen.split(/\s+/);
      el.hidden = !wants.includes(state);
    });
  }

  const logTone = message => {
    if (/error|failed|cannot|not initialized|missing/i.test(message)) return 'error';
    if (/^Sent game adjustment|^Updated|^Created chunk/i.test(message)) return 'update';
    if (/^Uploaded|^Session started|^Final|^Session marked|^Ready/i.test(message)) return 'success';
    return '';
  };

  function renderLogCount() {
    text('log-count', logEntries.length + (logEntries.length === 1 ? ' entry' : ' entries'));
  }

  function appendLogEntry(entry) {
    const row = document.createElement('div');
    row.className = 'aa-log__entry';
    if (entry.tone) row.dataset.tone = entry.tone;
    const time = document.createElement('span');
    time.className = 'aa-log__time';
    time.textContent = entry.time ? '[' + entry.time + ']' : '';
    const copy = document.createElement('span');
    copy.className = 'aa-log__text';
    copy.textContent = entry.message;
    row.append(time, copy);
    analysisLog.appendChild(row);
  }

  function addLogEntry(message, options = {}) {
    const entry = { time: options.time === null ? '' : clock(), message: String(message), tone: options.tone || logTone(message) };
    logEntries.push(entry);
    appendLogEntry(entry);
    renderLogCount();
    if (logStick) analysisLog.scrollTop = analysisLog.scrollHeight;
  }

  function resetLog() {
    logEntries = [];
    analysisLog.innerHTML = '';
    addLogEntry('Session started. Waiting for first analysis...', { time: null, tone: '' });
  }

  const tech = hook('tech');
  if (tech) {
    tech.addEventListener('toggle', () => {
      text('tech-word', tech.open ? 'Collapse' : 'Expand');
      if (tech.open) analysisLog.scrollTop = analysisLog.scrollHeight;
    });
  }

  analysisLog.addEventListener('scroll', () => {
    logStick = analysisLog.scrollHeight - analysisLog.scrollTop - analysisLog.clientHeight < 8;
  });

  const copyToClipboard = async (value, label) => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(value);
      ok = true;
    } catch (error) {
      ok = false;
    }
    if (label) {
      const was = label.textContent;
      label.textContent = ok ? 'Copied' : 'Press to copy';
      window.setTimeout(() => { label.textContent = was; }, 1400);
    }
    return ok;
  };

  hook('log-copy')?.addEventListener('click', event => {
    const lines = logEntries.map(entry => (entry.time ? '[' + entry.time + '] ' : '') + entry.message);
    copyToClipboard(lines.join('\n'), event.currentTarget);
  });

  hook('log-clear')?.addEventListener('click', () => {
    logEntries = [];
    analysisLog.innerHTML = '';
    addLogEntry('Log cleared.', { tone: '' });
  });

  hook('copy')?.addEventListener('click', event => {
    if (!sessionId) return;
    copyToClipboard(sessionId, event.currentTarget.querySelector('[data-aa-copy-label]'));
  });

  /* ---- Tabs: Skills / Flow State ------------------------------------------ */
  const tabButtons = $$('[data-tab]');
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      tabButtons.forEach(other => {
        const current = other === button;
        other.classList.toggle('is-current', current);
        other.setAttribute('aria-selected', String(current));
        other.tabIndex = current ? 0 : -1;
        const panel = document.getElementById(other.dataset.tab + 'Tab');
        if (panel) panel.hidden = !current;
      });
    });
  });

  /* ---- Creation speed modifier: an SVG line drawn from telemetry ---------- */
  const svgNS = 'http://www.w3.org/2000/svg';
  const createSvg = (tag, attrs = {}) => {
    const el = document.createElementNS(svgNS, tag);
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, String(value)));
    return el;
  };

  function initSpeedModifierChart() {
    renderSpeedChart([]);
  }

  function renderSpeedChart(values) {
    if (!chartSvg) return;
    chartSvg.innerHTML = '';
    const empty = hook('chart-empty');
    const count = values.length;
    text('speed-count', plural(count, 'change'));
    if (!count) {
      if (empty) empty.hidden = false;
      chartSvg.setAttribute('aria-label', 'Block speed: no changes yet');
      text('speed-latest', '—');
      text('speed-range', '—');
      return;
    }
    if (empty) empty.hidden = true;
    const width = 360, height = 160;
    const margin = { left: 34, right: 12, top: 12, bottom: 24 };
    const chartW = width - margin.left - margin.right;
    const chartH = height - margin.top - margin.bottom;
    let min = Math.min(...values), max = Math.max(...values);
    if (min === max) { min -= 0.1; max += 0.1; }
    const pad = (max - min) * 0.15;
    min -= pad; max += pad;
    const xFor = index => margin.left + (count === 1 ? chartW / 2 : (index / (count - 1)) * chartW);
    const yFor = value => margin.top + (1 - (value - min) / (max - min)) * chartH;

    for (let step = 0; step <= 3; step++) {
      const value = min + ((max - min) * step) / 3;
      const y = yFor(value);
      chartSvg.appendChild(createSvg('line', { x1: margin.left, x2: width - margin.right, y1: y, y2: y, class: 'grid' }));
      const label = createSvg('text', { x: margin.left - 6, y: y + 3, class: 'axis-label', 'text-anchor': 'end' });
      label.textContent = value.toFixed(2);
      chartSvg.appendChild(label);
    }
    const first = createSvg('text', { x: xFor(0), y: height - 6, class: 'axis-label', 'text-anchor': count === 1 ? 'middle' : 'start' });
    first.textContent = 'Point 1';
    chartSvg.appendChild(first);
    if (count > 1) {
      const last = createSvg('text', { x: xFor(count - 1), y: height - 6, class: 'axis-label', 'text-anchor': 'end' });
      last.textContent = 'Point ' + count;
      chartSvg.appendChild(last);
    }
    const points = values.map((value, index) => [xFor(index), yFor(value)]);
    const path = points.map(([x, y], i) => (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1)).join(' ');
    if (count > 1) {
      const floor = margin.top + chartH;
      chartSvg.appendChild(createSvg('path', { d: path + ' L' + points[count - 1][0].toFixed(1) + ' ' + floor + ' L' + points[0][0].toFixed(1) + ' ' + floor + ' Z', class: 'area' }));
      chartSvg.appendChild(createSvg('path', { d: path, class: 'line' }));
    }
    points.forEach(([x, y], index) => {
      const dot = createSvg('circle', { cx: x, cy: y, r: index === count - 1 ? 4 : 3, class: 'point' + (index === count - 1 ? ' is-latest' : '') });
      const title = createSvg('title');
      title.textContent = 'Point ' + (index + 1) + ' · ' + values[index];
      dot.appendChild(title);
      chartSvg.appendChild(dot);
    });
    chartSvg.setAttribute('aria-label', 'Block speed across ' + plural(count, 'change') + ', now ' + values[count - 1]);
    text('speed-latest', formatValue(values[count - 1]));
    text('speed-range', formatValue(Math.min(...values)) + ' – ' + formatValue(Math.max(...values)));
  }

  function updateSpeedModifierChart(telemetry) {
    const speedModifierEntries = telemetry.filter(item => item.adjustment && item.adjustment.parameterName === 'creationSpeedModifier');

    if (speedModifierEntries.length === 0) {
      if (!speedNoticeLogged) {
        addLogEntry('No speed modifier data found in telemetry');
        speedNoticeLogged = true;
      }
      return;
    }

    /* Send the latest speed modifier adjustment to the game if it changed. */
    const latestEntry = speedModifierEntries[speedModifierEntries.length - 1];
    if (latestEntry && latestEntry.adjustment) {
      const currentParameterValue = latestEntry.adjustment.parameterValue;
      if (currentParameterValue !== lastSentSpeedModifierValue) {
        const adjustmentObject = {
          parameterName: latestEntry.adjustment.parameterName,
          parameterValue: currentParameterValue
        };
        if (gameFrame && gameFrame.contentWindow) {
          gameFrame.contentWindow.postMessage(adjustmentObject, '*');
          lastSentSpeedModifierValue = currentParameterValue;
          adjustmentsSent += 1;
          text('adjustments', String(adjustmentsSent));
          text('adjust-text', (adjustmentObject.parameterName === 'creationSpeedModifier' ? 'Block speed' : adjustmentObject.parameterName) + ' set to ' + formatValue(adjustmentObject.parameterValue));
          text('adjust-time', 'sent ' + shortClock());
          const pill = hook('adjust');
          if (pill) {
            pill.classList.add('is-fresh');
            window.setTimeout(() => pill.classList.remove('is-fresh'), 4000);
          }
          addLogEntry('Sent game adjustment to Hextris: ' + adjustmentObject.parameterName + '=' + adjustmentObject.parameterValue);
        } else {
          addLogEntry('Failed to send game adjustment to Hextris: iframe or contentWindow not available.');
        }
      }
    }

    const values = speedModifierEntries.map(item => parseFloat(item.adjustment.parameterValue)).filter(Number.isFinite);
    renderSpeedChart(values);
    addLogEntry('Updated speed modifier chart with ' + values.length + ' data points');
  }

  /* ---- Flow badge ----------------------------------------------------------- */
  const FLOW_BANDS = [
    { below: 0.2, key: 'very-low', label: 'Very low', tone: 'error' },
    { below: 0.4, key: 'low', label: 'Low', tone: 'warning' },
    { below: 0.6, key: 'medium', label: 'Medium', tone: 'mood' },
    { below: 0.8, key: 'high', label: 'High', tone: 'success' },
    { below: Infinity, key: 'very-high', label: 'Very high', tone: 'cognition' }
  ];

  function paintFlow(flowScore, targetMood) {
    const band = FLOW_BANDS.find(entry => flowScore < entry.below) || FLOW_BANDS[FLOW_BANDS.length - 1];
    if (flowBadge) flowBadge.dataset.flowBand = band.key;
    if (flowBadgeValue) flowBadgeValue.textContent = String(Math.round(Math.max(0, Math.min(1, flowScore)) * 100));
    if (flowBadgeMood) flowBadgeMood.textContent = targetMood.charAt(0).toUpperCase() + targetMood.slice(1);
    const bandBadge = hook('flow-band');
    if (bandBadge) {
      bandBadge.dataset.badgeTone = band.tone;
      bandBadge.textContent = band.label;
    }
    const ring = hook('flow-ring');
    if (ring) {
      ring.style.setProperty('--progress-count', String(Math.round(Math.max(0, Math.min(1, flowScore)) * 100)));
      ring.setAttribute('aria-label', 'Flow score ' + Math.round(flowScore * 100) + ' out of 100, ' + band.label.toLowerCase());
    }
  }

  function updateFlowBadge(moodScores) {
    if (!moodScores) return;
    const flowScore = parseFloat(moodScores.flowScore) || 0;
    const targetMood = moodScores.targetMood || 'relax';
    paintFlow(flowScore, targetMood);
    const confidence = parseFloat(moodScores.confidence);
    const scored = Number.isFinite(confidence) && (confidence > 0 || flowScore > 0);
    text('flow-meta', scored
      ? 'The API is ' + Math.round(Math.max(0, Math.min(1, confidence)) * 100) + '% sure of this reading.'
      : 'No reading yet.');
  }

  /* ---- Skill scores table ---------------------------------------------------- */
  const trendKey = trendValue => (trendValue > 0.01 ? 'up' : trendValue < -0.01 ? 'down' : 'flat');
  const TREND_GLYPH = { up: 'ti-arrow-up', down: 'ti-arrow-down', flat: 'ti-equal' };
  const TREND_WORD = { up: 'Rising', down: 'Falling', flat: 'Steady' };
  const trendCell = (cell, trendValue, asWord) => {
    const key = trendKey(trendValue);
    cell.innerHTML = '<span class="aa-trend" data-trend="' + key + '">' + icon(TREND_GLYPH[key]) + '<span>' + (asWord ? TREND_WORD[key] : trendValue.toFixed(2)) + '</span></span>';
  };

  const scoreCell = (cell, score) => {
    const value = parseFloat(score) || 0;
    cell.innerHTML = '<span class="aa-table__score"><span>' + value.toFixed(2) + '</span>'
      + '<span class="sp-progress" aria-hidden="true"><span class="sp-progress__track"><span class="sp-progress__fill"></span></span></span></span>';
    cell.querySelector('.sp-progress').style.setProperty('--progress', Math.round(Math.max(0, Math.min(1, value)) * 100) + '%');
  };

  /* The live-scores panel beside the game: every skill as a row, highest
     first, drawn from the same metrics as the full table below. */
  function renderSkillList(metrics, flash) {
    const list = hook('skill-list');
    if (!list) return;
    const skills = Object.keys(metrics || {});
    list.innerHTML = '';
    if (!skills.length) {
      const empty = document.createElement('p');
      empty.className = 'aa-placeholder';
      empty.textContent = 'Skill scores appear here after the first analysed batch.';
      list.appendChild(empty);
      return;
    }
    skills.slice().sort((a, b) => (parseFloat((metrics[b] || {}).score) || 0) - (parseFloat((metrics[a] || {}).score) || 0)).forEach(skill => {
      const data = metrics[skill] || {};
      const value = Math.max(0, Math.min(1, parseFloat(data.score) || 0));
      const row = document.createElement('div');
      row.className = 'aa-skill-row' + (flash ? ' is-updated' : '');
      row.dataset.skill = skill;
      row.setAttribute('role', 'listitem');
      const name = document.createElement('span');
      name.className = 'aa-skill-row__name';
      name.textContent = formatSkillName(skill);
      const score = document.createElement('span');
      score.className = 'aa-skill-row__score';
      score.innerHTML = '<span class="sp-progress" aria-hidden="true"><span class="sp-progress__track"><span class="sp-progress__fill"></span></span></span><span class="aa-skill-row__value"></span>';
      score.querySelector('.sp-progress').style.setProperty('--progress', Math.round(value * 100) + '%');
      score.querySelector('.aa-skill-row__value').textContent = Math.round(value * 100) + '%';
      const trend = document.createElement('span');
      trendCell(trend, parseFloat(data.trend) || 0, true);
      row.append(name, score, trend.firstChild);
      row.setAttribute('aria-label', formatSkillName(skill) + ' ' + Math.round(value * 100) + ' out of 100, ' + TREND_WORD[trendKey(parseFloat(data.trend) || 0)].toLowerCase());
      list.appendChild(row);
    });
    if (flash) window.setTimeout(() => list.querySelectorAll('.is-updated').forEach(row => row.classList.remove('is-updated')), 1000);
  }

  function updateSkillTable(skillData) {
    if (!skillData || !skillData.metrics) return;
    const metrics = skillData.metrics;
    const skills = Object.keys(metrics);
    const tbody = skillTable.querySelector('tbody');
    tbody.innerHTML = '';
    renderSkillList(metrics, false);
    if (!skills.length) {
      tbody.innerHTML = '<tr class="aa-table__placeholder"><td colspan="5">Skill data will appear here after processing…</td></tr>';
      text('skill-count', '0 skills');
      return;
    }
    skills.forEach(skill => {
      const data = metrics[skill] || {};
      const row = document.createElement('tr');
      row.dataset.skill = skill;
      const nameCell = document.createElement('td');
      nameCell.className = 'aa-table__skill';
      nameCell.textContent = formatSkillName(skill);
      row.appendChild(nameCell);
      const score = document.createElement('td');
      score.dataset.label = 'Score';
      scoreCell(score, data.score);
      row.appendChild(score);
      const trend = document.createElement('td');
      trend.dataset.label = 'Trend';
      trendCell(trend, parseFloat(data.trend) || 0);
      row.appendChild(trend);
      const confidence = document.createElement('td');
      confidence.dataset.label = 'Confidence';
      confidence.textContent = num(data.confidence);
      row.appendChild(confidence);
      const consistency = document.createElement('td');
      consistency.dataset.label = 'Consistency';
      consistency.textContent = num(data.consistency);
      row.appendChild(consistency);
      tbody.appendChild(row);
    });
    text('skill-count', plural(skills.length, 'skill'));
  }

  function highlightUpdatedSkills(skillData) {
    if (!skillData || !skillData.metrics) return;
    const metrics = skillData.metrics;
    renderSkillList(metrics, true);
    for (const skill in metrics) {
      const row = skillTable.querySelector('tr[data-skill="' + skill + '"]');
      if (!row) continue;
      const cells = row.querySelectorAll('td');
      cells.forEach(cell => {
        cell.classList.add('is-updated');
        window.setTimeout(() => cell.classList.remove('is-updated'), 1000);
      });
      const data = metrics[skill] || {};
      scoreCell(cells[1], data.score);
      trendCell(cells[2], parseFloat(data.trend) || 0);
      cells[3].textContent = num(data.confidence);
      cells[4].textContent = num(data.consistency);
    }
  }

  /* ---- Analysis results panels (chunk LLM output) -------------------------- */
  function updateSkillsPanel(skillsOutput) {
    skillsData.innerHTML = '';
    if (!skillsOutput || Object.keys(skillsOutput).length === 0) {
      skillsData.innerHTML = '<p class="aa-placeholder">No skill data available yet…</p>';
      return;
    }
    for (const [skill, value] of Object.entries(skillsOutput)) {
      const item = document.createElement('div');
      item.className = 'aa-skill-item';
      const name = document.createElement('span');
      name.className = 'aa-skill-item__name';
      name.textContent = formatSkillName(skill);
      const score = document.createElement('span');
      score.className = 'aa-skill-item__score';
      const shown = typeof value === 'object' && value !== null ? (value.score ?? '0') : value;
      score.innerHTML = 'Score <strong></strong>';
      score.querySelector('strong').textContent = formatValue(shown);
      item.append(name, score);
      skillsData.appendChild(item);
    }
  }

  function updateFlowPanel(flowOutput) {
    flowData.innerHTML = '';
    if (!flowOutput || Object.keys(flowOutput).length === 0) {
      flowData.innerHTML = '<p class="aa-placeholder">No flow data available yet…</p>';
      return;
    }
    for (const [key, value] of Object.entries(flowOutput)) {
      const row = document.createElement('div');
      const label = document.createElement('span');
      label.className = 'aa-kv__key';
      label.textContent = formatFlowMetric(key);
      const reading = document.createElement('span');
      reading.className = 'aa-kv__value';
      reading.textContent = formatValue(value);
      row.append(label, reading);
      flowData.appendChild(row);
    }
  }

  /* ---- Session record ---------------------------------------------------------- */
  const STATE_TONES = { OPEN: 'success', CLOSED: 'neutral', PROCESSING: 'brand', ERROR: 'error' };

  function updateSessionRecord(sessionData) {
    const state = String(sessionData.state || '—');
    const badge = hook('state');
    if (badge) {
      badge.textContent = state.charAt(0) + state.slice(1).toLowerCase();
      badge.dataset.badgeTone = STATE_TONES[state] || 'neutral';
    }
    const skillScores = sessionData.skillScores || {};
    text('record-number', sessionData.sessionNumber !== undefined && sessionData.sessionNumber !== null ? String(sessionData.sessionNumber) : '—');
    text('record-user', sessionData.user ? String(sessionData.user) : '—');
    text('record-game', sessionData.game ? String(sessionData.game) : '—');
    text('record-mood', sessionData.targetMood ? String(sessionData.targetMood) : '—');
    text('record-target', sessionData.optimizationTarget ? String(sessionData.optimizationTarget) : '—');
    text('record-telemetry', String(Array.isArray(sessionData.telemetry) ? sessionData.telemetry.length : 0));
    text('record-updates', String(Array.isArray(sessionData.parameterUpdates) ? sessionData.parameterUpdates.length : 0));
    text('record-chunks', String(skillScores.numChunksAnalyzed ?? 0));
    text('record-analysed', formatStamp(skillScores.analyzedAt));
    text('record-duration', sessionData.duration !== null && sessionData.duration !== undefined ? formatValue(sessionData.duration) : '—');
    const meta = hook('skills-meta');
    if (meta) {
      meta.textContent = skillScores.analyzedAt
        ? 'Last scored at ' + formatStamp(skillScores.analyzedAt) + ', from ' + plural(skillScores.numChunksAnalyzed || 0, 'batch') + ' of frames.'
        : 'Nothing scored yet.';
    }
  }

  /* ---- Session data polling (every 5 s) ---------------------------------------- */
  function startSessionDataPolling(apiKey) {
    sessionDataPoller = window.setInterval(() => pollSessionData(apiKey), POLL_MS);
    return sessionDataPoller;
  }

  async function pollSessionData(apiKey) {
    if (!sessionId) return;
    try {
      const response = await call('/games/api/sessions/' + sessionId + '/', {
        headers: keyHeaders(apiKey)
      });
      if (!response.ok || !sessionDataPoller) return;
      const sessionData = await response.json();
      updateSessionRecord(sessionData);

      if (sessionData.telemetry && sessionData.telemetry.length > 0) {
        updateSpeedModifierChart(sessionData.telemetry);
      }

      /* The live page updated on any object; the dashboard updates on a
         change, so the log records movement rather than every poll. */
      const metrics = sessionData.skillScores && sessionData.skillScores.metrics;
      if (metrics && Object.keys(metrics).length > 0) {
        const json = JSON.stringify(metrics);
        if (json !== lastMetricsJson) {
          const existing = skillTable.querySelectorAll('tbody tr[data-skill]').length;
          if (existing && existing === Object.keys(metrics).length) highlightUpdatedSkills(sessionData.skillScores);
          else updateSkillTable(sessionData.skillScores);
          lastMetricsJson = json;
          addLogEntry('Updated skill scores table');
        }
      }

      if (sessionData.moodScores && Object.keys(sessionData.moodScores).length > 0) {
        const json = JSON.stringify(sessionData.moodScores);
        if (json !== lastMoodJson) {
          updateFlowBadge(sessionData.moodScores);
          lastMoodJson = json;
          addLogEntry('Updated flow badge');
        }
      }
    } catch (error) {
      addLogEntry('Session data polling error: ' + error.message);
    }
  }

  /* ---- Analysis polling (every 5 s, per chunk) ----------------------------------- */
  function startAnalysisPolling(apiKey) {
    analysisPoller = window.setInterval(() => pollAnalysisResults(apiKey), POLL_MS);
  }

  async function pollAnalysisResults(apiKey) {
    if (chunkIds.length === 0) return;
    try {
      for (const chunkId of chunkIds) {
        /* A pass runs one chunk at a time, so it can outlive the poller
           that started it; stop writing once the session has been exited. */
        if (!analysisPoller) return;
        const response = await call('/scoring/api/chunks/' + chunkId + '/', {
          headers: keyHeaders(apiKey)
        });
        if (!response.ok) continue;
        const chunkData = await response.json();
        let touched = false;
        if (chunkData.skillLlmOutput && Object.keys(chunkData.skillLlmOutput).length > 0) {
          updateSkillsPanel(chunkData.skillLlmOutput);
          addLogEntry('Updated skills data from chunk ' + chunkId);
          touched = true;
        }
        if (chunkData.flowLlmOutput && Object.keys(chunkData.flowLlmOutput).length > 0) {
          updateFlowPanel(chunkData.flowLlmOutput);
          addLogEntry('Updated flow data from chunk ' + chunkId);
          touched = true;
        }
        if (touched) {
          analysedChunks.add(chunkId);
          text('analysed', String(analysedChunks.size));
          text('analysis-meta', 'Latest scored batch arrived at ' + shortClock() + ' (batch id ' + chunkId + ').');
        }
      }
    } catch (error) {
      addLogEntry('Analysis polling error: ' + error.message);
    }
  }

  /* ---- Screenshot capture (every second, batches of five) ------------------------ */
  function startScreenshotCapture(apiKey) {
    screenshotInterval = window.setInterval(() => captureScreenshot(apiKey), CAPTURE_MS);
  }

  function paintCounter() {
    if (screenshotCounter) screenshotCounter.textContent = String(screenshotCount);
    text('batch', screenshotBatch.length + '/' + BATCH_SIZE);
    const meter = hook('batch-meter');
    if (meter) meter.style.setProperty('--progress', Math.round((Math.min(screenshotBatch.length, BATCH_SIZE) / BATCH_SIZE) * 100) + '%');
  }

  /* Hextris renders on a <canvas>, which html2canvas cannot read, so the
     frame's canvas is read directly first and html2canvas is the fallback. */
  async function captureScreenshot(apiKey) {
    if (!screenshotInterval) return;
    try {
      const iframe = gameFrame;
      let blob = null;

      try {
        if (iframe.contentWindow && iframe.contentWindow.document) {
          const gameCanvas = iframe.contentWindow.document.getElementById('canvas')
            || iframe.contentWindow.document.querySelector('canvas');
          if (gameCanvas) {
            blob = await new Promise(resolve => gameCanvas.toBlob(b => resolve(b), 'image/jpeg', 0.90));
            if (!blob || blob.size === 0) blob = null;
          }
        }
      } catch (canvasError) {
        blob = null;
      }

      if (!blob && simulated) blob = await placeholderFrame(screenshotCount);

      if (!blob && !simulated && typeof html2canvas === 'function') {
        try {
          let targetElement = null;
          let captureOptions = {};
          if (iframe.contentWindow && iframe.contentWindow.document && iframe.contentWindow.document.body) {
            targetElement = iframe.contentWindow.document.body;
            captureOptions = { allowTaint: true, useCORS: true, logging: false, backgroundColor: '#1a1a1a', width: iframe.clientWidth, height: iframe.clientHeight };
          } else {
            targetElement = $('[data-aa-stage-frame]');
            captureOptions = { allowTaint: true, useCORS: true, logging: false, backgroundColor: '#1a1a1a' };
          }
          if (targetElement) {
            const fallbackCanvas = await html2canvas(targetElement, captureOptions);
            blob = await new Promise(resolve => fallbackCanvas.toBlob(b => resolve(b), 'image/jpeg', 0.90));
          }
        } catch (fallbackError) {
          blob = null;
        }
      }

      if (!blob || blob.size === 0) {
        addLogEntry('Screenshot failed: no capture method produced a valid image.');
        return;
      }

      /* The capture was async; the session may have been exited meanwhile. */
      if (!screenshotInterval) return;
      screenshotBatch.push({ blob, index: screenshotCount });
      screenshotCount += 1;
      paintCounter();
      setStatus('Captured screenshot ' + screenshotCount + ' (batch: ' + screenshotBatch.length + '/' + BATCH_SIZE + ')', 'info', true);

      if (screenshotBatch.length >= BATCH_SIZE && !uploading) {
        await uploadScreenshotBatch(apiKey, false);
      }
    } catch (error) {
      setStatus('Screenshot error: ' + error.message, 'error', true);
    }
  }

  /* Two differences from the live page, both on purpose. It kept a rejected
     batch and re-sent it, one frame bigger, every second - so a single blank
     frame captured before play began (which the API refuses as "blank or
     solid-color") poisoned every upload after it, and the batch grew without
     limit. And it started a new upload every second while the previous one
     was still in flight, each carrying the frames of the last. Now one upload
     runs at a time and carries the frames it was handed; on success those
     frames leave the batch and any captured meanwhile wait for the next; a
     4xx discards the frames the server refused and logs its reason; a network
     or server error keeps them for retry. */
  async function uploadScreenshotBatch(apiKey, isLastChunk = false) {
    if (screenshotBatch.length === 0 && !isLastChunk) return false;
    if (!sessionId) {
      setStatus('Error: Missing session ID. Cannot upload screenshots.', 'error', true);
      return false;
    }
    const sending = screenshotBatch.slice(0, MAX_UPLOAD_FRAMES);
    const release = () => { screenshotBatch = screenshotBatch.filter(item => !sending.includes(item)); paintCounter(); };
    uploading = true;
    try {
      const formData = new FormData();
      sending.forEach(item => {
        formData.append('screenshot' + item.index, item.blob, 'screenshot' + item.index + '.jpg');
      });
      formData.append('is_last_chunk', isLastChunk ? 'true' : 'false');

      const response = await call('/games/api/record-session/' + sessionId + '/', {
        method: 'POST',
        headers: authHeaders(apiKey),
        body: formData
      });

      if (response.ok) {
        const responseData = await response.json();
        const newChunkId = responseData && responseData.data ? responseData.data.id : undefined;
        setStatus('Uploaded batch of ' + sending.length + ' screenshots!', 'success', true);
        addLogEntry('Created chunk ID: ' + newChunkId);
        if (newChunkId && !chunkIds.includes(newChunkId)) {
          chunkIds.push(newChunkId);
          uploadedChunks += 1;
          text('chunks', String(uploadedChunks));
        }
        release();
        if (isLastChunk) {
          setStatus('Final batch uploaded. Session will close automatically.', 'success', true);
        }
        return true;
      }
      let reason = '';
      try {
        const detail = await response.json();
        const errors = detail && (detail.ObjectErrors_ || detail.detail || detail.error);
        reason = Array.isArray(errors) ? errors.join(' ') : (errors ? String(errors) : '');
      } catch (error) {
        reason = '';
      }
      setStatus('Error uploading screenshot batch: ' + response.status + ' ' + response.statusText + (reason ? ' · ' + reason : ''), 'error', true);
      if (response.status >= 400 && response.status < 500 && sending.length) {
        addLogEntry('Discarded ' + plural(sending.length, 'rejected frame') + '; the next batch starts fresh.');
        release();
      }
      return false;
    } catch (error) {
      setStatus('Batch upload error: ' + error.message, 'error', true);
      return false;
    } finally {
      uploading = false;
    }
  }

  /* ---- The SDK debug panel inside the game frame --------------------------------- */
  const DEBUG_KEYS = { 'sp-session': 'session', 'sp-mood': 'mood', 'sp-params': 'params', 'sp-api': 'api' };
  let debugObserver = null;
  let debugTimer = null;

  const frameDocument = () => {
    try { return gameFrame.contentDocument || null; } catch (error) { return null; }
  };
  /* Null unless the frame's window can actually be read: a cross-origin frame
     (and any frame beside a page opened from disk) hands back a window whose
     every property read throws, so the probe touches one first. */
  const frameWindow = () => {
    try {
      const win = gameFrame.contentWindow || null;
      if (win) void win.document;
      return win;
    } catch (error) { return null; }
  };
  const debugPanel = () => {
    const doc = frameDocument();
    return doc ? doc.getElementById('skillprint-debug') : null;
  };

  function setDebugState(state, label, tone) {
    const card = hook('debug');
    if (card) card.dataset.aaDebugState = state;
    const badge = hook('debug-badge');
    if (badge) badge.dataset.badgeTone = tone;
    text('debug-badge-label', label);
    $$('[data-aa-debug-action]').forEach(button => { button.disabled = state !== 'live'; });
    const toggle = hook('debug-overlay');
    if (toggle) toggle.disabled = state !== 'live';
  }

  function syncDebugPanel() {
    const panel = debugPanel();
    const win = frameWindow();
    const sdk = win ? win.HextrisSkillprint : null;
    if (!panel) {
      const cross = gameFrame.src && !frameDocument();
      setDebugState(cross ? 'unavailable' : 'waiting',
        cross ? 'Inside the game frame' : 'Waiting for the game',
        'neutral');
      text('debug-note', cross
        ? 'The game is served from another origin here, so the SDK panel stays inside the game frame and cannot be mirrored. Serve this page from the same host as the game to read it.'
        : 'Mirrors the panel the Skillprint SDK draws inside the game frame. It fills in once the game has loaded.');
      const sdkBadge = hook('sdk-badge');
      if (sdkBadge) { sdkBadge.dataset.badgeTone = 'neutral'; text('sdk-label', cross ? 'Game running' : 'Game loading'); }
      return;
    }
    Object.entries(DEBUG_KEYS).forEach(([id, key]) => {
      const el = panel.querySelector('#' + id);
      if (!el) return;
      const raw = el.textContent.trim();
      const value = raw.replace(/^(Session|Mood|Parameters|API)\s*:\s*/i, '');
      const target = document.querySelector('[data-aa-debug-value="' + key + '"]');
      if (target) target.textContent = value || '—';
    });
    const active = !!(sdk && sdk.sessionActive);
    setDebugState('live', active ? 'SDK session active' : 'SDK idle', active ? 'success' : 'neutral');
    text('debug-note', 'Mirrors the panel the Skillprint SDK draws inside the game frame, live. The controls call the SDK\'s own debug functions.');
    const sdkBadge = hook('sdk-badge');
    if (sdkBadge) { sdkBadge.dataset.badgeTone = active ? 'success' : 'neutral'; text('sdk-label', active ? 'Game connected to the API' : 'Game running'); }
    if (!debugObserver) {
      try {
        debugObserver = new MutationObserver(() => syncDebugPanel());
        debugObserver.observe(panel, { childList: true, characterData: true, subtree: true });
      } catch (error) {
        debugObserver = null;
      }
    }
    const toggle = hook('debug-overlay');
    if (toggle) panel.style.display = toggle.checked ? '' : 'none';
  }

  function watchDebugPanel() {
    stopDebugWatch();
    syncDebugPanel();
    debugTimer = window.setInterval(syncDebugPanel, 1000);
  }

  function stopDebugWatch() {
    if (debugTimer) { window.clearInterval(debugTimer); debugTimer = null; }
    if (debugObserver) { debugObserver.disconnect(); debugObserver = null; }
  }

  $$('[data-aa-debug-action]').forEach(button => {
    button.addEventListener('click', () => {
      const win = frameWindow();
      const debug = win && win.HextrisSkillprint && win.HextrisSkillprint.debug;
      if (!debug) { addLogEntry('SDK debug panel is not reachable from this page.'); return; }
      const action = button.dataset.aaDebugAction;
      try {
        if (action === 'status' && debug.checkStatus) debug.checkStatus();
        if (action === 'start' && debug.manualStart) debug.manualStart(button.dataset.mood || 'focus');
        if (action === 'stop' && debug.manualStop) debug.manualStop();
        addLogEntry('SDK debug: ' + action + (button.dataset.mood ? ' (' + button.dataset.mood + ')' : ''), { tone: '' });
      } catch (error) {
        addLogEntry('SDK debug ' + action + ' failed: ' + error.message);
      }
      window.setTimeout(syncDebugPanel, 300);
    });
  });

  hook('debug-overlay')?.addEventListener('change', syncDebugPanel);

  /* The frame's own start screen needs a click inside it; from here, the
     game is started directly through the copy's start handler when the frame
     can be reached, and the frame is focused so the arrow keys land in it.
     Cross-origin, the veil simply lifts and the foot says what to press. */
  const setVeil = state => {
    const veil = hook('stage-veil');
    if (!veil) return;
    veil.dataset.state = state;
    veil.hidden = state === 'off';
    const loading = hook('veil-loading');
    const ready = hook('veil-ready');
    if (loading) loading.hidden = state !== 'loading';
    if (ready) ready.hidden = state !== 'ready';
  };

  const gameReachable = () => {
    const doc = frameDocument();
    const win = frameWindow();
    return !!(doc && win && typeof win.startBtnHandler === 'function');
  };

  function startPlaying() {
    const win = frameWindow();
    try {
      if (win && typeof win.startBtnHandler === 'function') win.startBtnHandler();
    } catch (error) {
      addLogEntry('Could not start the game from the dashboard: ' + error.message);
    }
    setVeil('off');
    try { gameFrame.focus(); if (win) win.focus(); } catch (error) {}
    text('stage-hint', 'Arrow keys rotate the hexagon, P pauses. The game changes as the API sends new settings.');
    addLogEntry('Game started from the dashboard.', { tone: '' });
  }

  hook('play')?.addEventListener('click', startPlaying);

  /* ---- Start ---------------------------------------------------------------------- */
  function resetDashboard() {
    screenshotCount = 0;
    screenshotBatch = [];
    chunkIds = [];
    uploadedChunks = 0;
    analysedChunks.clear();
    adjustmentsSent = 0;
    lastMetricsJson = '';
    lastMoodJson = '';
    speedNoticeLogged = false;
    lastSentSpeedModifierValue = null;
    paintCounter();
    text('chunks', '0');
    text('analysed', '0');
    text('adjustments', '0');
    text('adjust-text', 'None yet');
    text('adjust-time', '');
    text('skill-count', '0 skills');
    text('analysis-meta', 'Waiting for the first scored batch.');
    text('flow-meta', 'No reading yet.');
    ['record-number', 'record-user', 'record-game', 'record-mood', 'record-target', 'record-analysed', 'record-duration'].forEach(key => text(key, '—'));
    ['record-telemetry', 'record-updates', 'record-chunks'].forEach(key => text(key, '0'));
    const state = hook('state');
    if (state) { state.textContent = 'Unknown'; state.dataset.badgeTone = 'neutral'; }
    skillsData.innerHTML = '<p class="aa-placeholder">Analysis data will appear here after processing…</p>';
    flowData.innerHTML = '<p class="aa-placeholder">Flow metrics will appear here after processing…</p>';
    skillTable.querySelector('tbody').innerHTML = '<tr class="aa-table__placeholder"><td colspan="5">Skill data will appear here after processing…</td></tr>';
    renderSkillList({}, false);
    paintFlow(0, 'relax');
    if (flowBadge) flowBadge.dataset.flowBand = 'very-low';
    renderSpeedChart([]);
    setVeil('loading');
  }

  async function startGame() {
    await apiReady;
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey && !simulated) {
      setStatus('Please enter your API key', 'error');
      apiKeyInput.focus();
      return;
    }
    try {
      startButton.setAttribute('aria-busy', 'true');
      setLiveState('starting');
      setStatus('Starting game session...', 'info');

      const sessionResponse = await call('/games/api/sessions/', {
        method: 'POST',
        headers: authHeaders(apiKey, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          session_id: crypto.randomUUID(),
          game: selectedGame().slug,
          target_mood: TARGET_MOOD
        })
      });

      if (!sessionResponse.ok) {
        throw new Error('Failed to create game session: ' + sessionResponse.status + ' ' + sessionResponse.statusText);
      }

      const sessionData = await sessionResponse.json();
      sessionId = sessionData.sessionId;
      if (!sessionId) throw new Error('No session ID returned from API');

      if (apiKey) { try { sessionStorage.setItem(KEY_STORE, apiKey); } catch (error) {} }

      resetLog();
      resetDashboard();
      if (simulated) addLogEntry('Simulated session: the game is real; the scores, batches and adjustments are sample data.' + (location.protocol === 'file:' ? ' The scoring API cannot be reached from a page opened from disk.' : ''), { tone: '' });
      updateSessionRecord(sessionData);
      if (sessionData.moodScores) updateFlowBadge(sessionData.moodScores);

      startPanel.hidden = true;
      gameSession.hidden = false;
      setLiveState('live');
      initSpeedModifierChart();

      if (sessionInfo) sessionInfo.textContent = sessionId;
      setStatus('Session started: ' + sessionId, 'success', true);

      const open = hook('open-game');
      if (open) open.href = iframeEnv;
      gameFrame.src = iframeEnv;

      gameFrame.onload = () => {
        if (gameReachable()) {
          setVeil('ready');
          text('stage-hint', 'Press Play to start. Arrow keys rotate the hexagon, P pauses.');
          window.setTimeout(() => hook('play')?.focus(), 50);
        } else {
          setVeil('off');
          text('stage-hint', 'Click the board to start, then use the arrow keys. The game changes as the API sends new settings.');
        }
        addLogEntry('Game iframe loaded. Starting screenshot capture and data polling.');
        startScreenshotCapture(apiKey);
        startAnalysisPolling(apiKey);
        sessionDataPoller = startSessionDataPolling(apiKey);
        watchDebugPanel();
      };

      gameFrame.onerror = () => {
        setStatus('Error loading game iframe. Screenshots and analysis might not work correctly.', 'error', true);
      };

      gameSession.scrollIntoView({ block: 'start', behavior: 'smooth' });
    } catch (error) {
      setLiveState('idle');
      setStatus('Error: ' + explainFetch(error.message), 'error');
    } finally {
      startButton.removeAttribute('aria-busy');
    }
  }

  /* ---- Exit --------------------------------------------------------------------------- */
  async function exitGame() {
    if (closing) return;
    closing = true;
    const apiKey = apiKeyInput.value.trim();
    exitButton.setAttribute('aria-busy', 'true');
    setLiveState('closing');

    if (screenshotInterval) { window.clearInterval(screenshotInterval); screenshotInterval = null; }
    if (analysisPoller) { window.clearInterval(analysisPoller); analysisPoller = null; }
    if (sessionDataPoller) { window.clearInterval(sessionDataPoller); sessionDataPoller = null; }
    stopDebugWatch();

    if (screenshotBatch.length > 0) {
      setStatus('Uploading final screenshots...', 'info', true);
      try {
        const ok = await uploadScreenshotBatch(apiKey, true);
        if (ok) setStatus('Final screenshots uploaded. Session will close automatically.', 'success', true);
        else addLogEntry('The final batch was not accepted; the session is left for the API to close.');
      } catch (error) {
        setStatus('Error uploading final screenshots: ' + error.message, 'error', true);
      }
    } else {
      try {
        const formData = new FormData();
        formData.append('is_last_chunk', 'true');
        await call('/games/api/record-session/' + sessionId + '/', {
          method: 'POST',
          headers: authHeaders(apiKey),
          body: formData
        });
        setStatus('Session marked as complete. It will close automatically.', 'success', true);
      } catch (error) {
        setStatus('Error marking session as complete: ' + error.message, 'error', true);
      }
    }

    window.setTimeout(() => {
      gameSession.hidden = true;
      startPanel.hidden = false;
      /* Clearing the frame loads about:blank, which would fire the load handler
         set at start and restart the capture and the pollers for a session
         that no longer exists. */
      gameFrame.onload = null;
      gameFrame.onerror = null;
      gameFrame.src = '';
      sessionId = '';
      if (sessionInfo) sessionInfo.textContent = '—';
      resetDashboard();
      resetLog();
      exitButton.removeAttribute('aria-busy');
      closing = false;
      setLiveState('idle');
      setStatus('Ready to start a new game', 'info');
      startPanel.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }, 2000);
  }

  /* ---- The simulated scoring API --------------------------------------------
     Answers the four calls the console makes with the shapes the real API
     returns, on a plausible clock: a batch counts as scored six seconds after
     it was uploaded, every second scored batch moves the block speed, and the
     skill and flow scores settle upwards as batches accumulate. Nothing here
     is measured from the play. */
  function createSimulation() {
    const started = Date.now();
    const simId = 'sim-' + Math.random().toString(16).slice(2, 10);
    const SCORE_AFTER = 6;
    const SPEED_PLAN = [1, 0.85, 0.75, 0.8, 0.9, 0.85, 0.8];
    const BASE = { 'pattern-recognition': 0.62, 'reaction-time': 0.48, 'spatial-reasoning': 0.55, focus: 0.41, planning: 0.37, adaptability: 0.44, persistence: 0.7, 'risk-taking': 0.3 };
    const FLOW_KEYS = ['challenge_skill_balance', 'concentration', 'sense_of_control', 'loss_of_self_consciousness'];
    const chunks = [];
    const adjustments = [];
    let seed = 11;
    const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    const round = value => Math.round(value * 100) / 100;
    const elapsed = () => (Date.now() - started) / 1000;
    const scored = () => chunks.filter(chunk => elapsed() - chunk.at >= SCORE_AFTER);
    const scores = Object.assign({}, BASE);
    let metricsFor = -1;
    let metrics = {};
    const reply = (status, data) => ({ ok: status < 400, status, statusText: status === 201 ? 'Created' : status === 200 ? 'OK' : 'Not Found', json: () => Promise.resolve(data) });
    const settle = done => {
      if (!done.length) return {};
      if (done.length === metricsFor) return metrics;
      metricsFor = done.length;
      metrics = {};
      Object.keys(scores).forEach(key => {
        const before = scores[key];
        const target = Math.min(0.95, BASE[key] + done.length * 0.03);
        const next = Math.max(0.05, Math.min(0.98, before + (target - before) * 0.5 + (rand() - 0.5) * 0.05));
        scores[key] = next;
        metrics[key] = { score: round(next), trend: round(next - before), confidence: round(Math.min(0.95, 0.55 + done.length * 0.05)), consistency: round(Math.min(0.95, 0.45 + next * 0.4)) };
      });
      return metrics;
    };
    const session = () => {
      const done = scored();
      const wanted = Math.min(SPEED_PLAN.length, Math.floor(done.length / 2));
      while (adjustments.length < wanted) {
        adjustments.push({ timestamp: new Date().toISOString(), adjustment: { parameterName: 'creationSpeedModifier', parameterValue: SPEED_PLAN[adjustments.length] } });
      }
      const current = settle(done);
      const last = done[done.length - 1];
      return {
        sessionId: simId, state: 'SIMULATED', sessionNumber: null, user: null, game: slugEnv,
        targetMood: TARGET_MOOD, optimizationTarget: 'flow', duration: Math.round(elapsed()),
        telemetry: adjustments.slice(), parameterUpdates: adjustments.map(entry => entry.adjustment),
        skillScores: { metrics: current, numChunksAnalyzed: done.length, analyzedAt: last ? new Date(started + (last.at + SCORE_AFTER) * 1000).toISOString() : null },
        moodScores: { flowScore: done.length ? round(Math.min(0.86, 0.32 + done.length * 0.07)) : 0, targetMood: TARGET_MOOD, confidence: done.length ? round(Math.min(0.95, 0.5 + done.length * 0.08)) : 0 }
      };
    };
    const chunkResult = chunk => {
      const skills = {};
      Object.keys(BASE).slice(0, 4 + (chunk.id % 3)).forEach(key => { skills[key] = { score: round(Math.max(0.05, Math.min(0.98, scores[key] + (rand() - 0.5) * 0.2))) }; });
      const flow = {};
      FLOW_KEYS.forEach((key, index) => { flow[key] = round(Math.max(0.1, Math.min(0.95, 0.4 + index * 0.08 + (rand() - 0.5) * 0.2))); });
      flow.flow_score = round(Math.min(0.9, 0.3 + chunks.indexOf(chunk) * 0.06));
      return { id: chunk.id, skillLlmOutput: skills, flowLlmOutput: flow };
    };
    const answer = (path, init) => {
      const method = ((init && init.method) || 'GET').toUpperCase();
      if (path === '/games/api/sessions/' && method === 'POST') return reply(201, session());
      if (/^\/games\/api\/sessions\/[^/]+\/$/.test(path)) return reply(200, session());
      if (/^\/games\/api\/record-session\/[^/]+\/$/.test(path)) {
        const chunk = { id: 5000 + chunks.length + 1, at: elapsed() };
        chunks.push(chunk);
        return reply(201, { data: { id: chunk.id } });
      }
      const match = path.match(/^\/scoring\/api\/chunks\/(\d+)\/$/);
      if (match) {
        const chunk = chunks.find(item => String(item.id) === match[1]);
        if (!chunk) return reply(404, { detail: 'No such batch' });
        if (elapsed() - chunk.at < SCORE_AFTER) return reply(200, { id: chunk.id, skillLlmOutput: {}, flowLlmOutput: {} });
        return reply(200, chunkResult(chunk));
      }
      return reply(404, { detail: 'Not simulated: ' + path });
    };
    return {
      respond: (path, init) => new Promise(resolve => { window.setTimeout(() => resolve(answer(path, init)), 200 + Math.round(rand() * 400)); })
    };
  }

  /* A frame to stand in for the game's canvas when it cannot be read - a
     file:// page has no access to the frame it embeds. */
  const placeholderFrame = index => new Promise(resolve => {
    const canvas = document.createElement('canvas');
    canvas.width = 96;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#121838';
    ctx.fillRect(0, 0, 96, 96);
    ctx.fillStyle = '#8f7dff';
    ctx.font = '600 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(index + 1), 48, 60);
    canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.8);
  });

  /* ---- Wire up -------------------------------------------------------------------------- */
  const envName = CONFIG.isProd ? 'Production' : 'Development';
  const fromDisk = location.protocol === 'file:';
  const offOrigin = !sameHost;
  const explainFetch = message => {
    if (!/failed to fetch|networkerror|load failed/i.test(message)) return message;
    if (fromDisk) return message + ' — this page was opened from disk, so the browser sends no origin and the API refuses it. Serve the folder and open it through localhost.';
    return message + ' — the API did not accept the request or is unreachable.';
  };
  text('record-env', simulated ? 'Simulated' : envName);
  text('api-host', apiBase.replace(/^https?:\/\//, ''));
  apiReady.then(viaRelay => {
    if (!viaRelay) return;
    text('api-host', directApi.replace(/^https?:\/\//, '') + ' through this host\u2019s relay');
    addLogEntry('API calls are relayed through proxy.php on ' + location.host + ' to ' + directApi.replace(/^https?:\/\//, '') + '.', { tone: '' });
  });
  text('game-slug', slugEnv);
  text('game-url', fromDisk ? 'hextris-game/index.html (the packaged copy)' : iframeEnv.replace(/^https?:\/\//, ''));
  text('target-mood', TARGET_MOOD);

  let remembered = '';
  try { remembered = sessionStorage.getItem(KEY_STORE) || ''; } catch (error) {}
  if (!apiKeyInput.value) apiKeyInput.value = defaultApiKeyEnv || remembered;

  const keyBox = hook('key-box');
  let borrowedKey = '';
  let keyBoxAutoOpened = false;
  const describeKey = () => {
    if (!keyBox) return;
    if (simulated) {
      keyBox.removeAttribute('data-missing');
      text('key-state', apiKeyInput.value ? 'A key is in place (a simulated run does not use it)' : 'Not needed for a simulated run');
      return;
    }
    const has = !!apiKeyInput.value;
    keyBox.toggleAttribute('data-missing', !has);
    let state = 'A key is in place';
    if (!has) state = 'No key yet — paste a partner API key';
    else if (borrowedKey && apiKeyInput.value === borrowedKey) state = 'Using the demo key from the packaged game';
    else if (defaultApiKeyEnv && apiKeyInput.value === defaultApiKeyEnv) state = 'Using the key this page was given';
    else if (remembered && apiKeyInput.value === remembered) state = 'Using the key from your last session in this tab';
    text('key-state', state);
    if (!has && !keyBox.open) { keyBox.open = true; keyBoxAutoOpened = true; }
    else if (has && keyBoxAutoOpened) { keyBox.open = false; keyBoxAutoOpened = false; }
  };
  apiKeyInput.addEventListener('input', describeKey);
  if (keyBox) keyBox.addEventListener('toggle', () => text('key-word', keyBox.open ? 'Hide' : 'Change'));

  if (statusDiv) {
    const copy = statusDiv.querySelector('[data-aa-status-text]');
    if (copy) copy.textContent = simulated ? 'Ready to start a simulated session: the game is real, the scores are sample data' : 'Ready to start game (' + envName + ' environment)';
    statusDiv.dataset.alertTone = 'info';
  }
  const hint = hook('origin-hint');
  if (hint) {
    if (fromDisk) {
      hint.hidden = false;
      hint.dataset.alertTone = 'info';
      text('origin-hint-text', 'Opened from disk, so the scoring API cannot be reached (a file:// page sends no origin). This run is simulated: the game is real, the scores, batches and adjustments are sample data. Serve the folder (see HOW_TO_RUN.md) for live scoring.');
    } else if (simulated) {
      hint.hidden = false;
      hint.dataset.alertTone = 'info';
      text('origin-hint-text', 'Simulated run (?demo=1): the game is real, the scores, batches and adjustments are sample data. Drop ?demo=1 for live scoring.');
    } else if (offOrigin) {
      hint.hidden = false;
      hint.dataset.alertTone = 'info';
      text('origin-hint-text', 'Running off the API host without the packaged game copy (hextris-game/). Sessions, polling and controls work, but the game frame loads from the API host and its frames cannot be read, so uploads are rejected as blank.');
    }
  }
  /* The demo and the game share one partner key. On the API host the
     template prefills it; beside a local copy of the game the page borrows
     the key that copy already carries, so the demo opens ready to start
     without anyone pasting anything. The field stays editable. */
  if (localMirror) {
    fetch(localMirror, { cache: 'no-store' }).then(async response => {
      if (!response.ok || params.get('game') || body.dataset.gameUrl) return;
      iframeEnv = localMirror;
      text('game-url', localMirror.replace(/^https?:\/\//, ''));
      let borrowed = false;
      if (!apiKeyInput.value && !defaultApiKeyEnv) {
        const source = await response.text();
        const match = source.match(/API_KEY\s*=\s*['"]([^'"]+)['"]/);
        if (match && match[1] && match[1] !== 'YOUR_API_KEY_HERE') {
          apiKeyInput.value = match[1];
          borrowedKey = match[1];
          borrowed = true;
        }
      }
      describeKey();
      const hintEl = hook('origin-hint');
      if (hintEl && !simulated) {
        hintEl.dataset.alertTone = 'success';
        text('origin-hint-text', 'The packaged copy of the game is served from this origin, so frames can be read and the whole loop runs here.'
          + (borrowed ? ' The field carries the demo key from that copy, so Start works straight away.' : ''));
      }
    }).catch(() => {});
  }

  resetLog();
  resetDashboard();
  renderLogCount();
  setLiveState('idle');
  describeKey();

  if (startForm) {
    startForm.addEventListener('submit', event => { event.preventDefault(); startGame(); });
  } else {
    startButton.addEventListener('click', startGame);
  }
  exitButton.addEventListener('click', exitGame);
  /* The game picker is the shared dropdown: the trigger and every item are
     real buttons, aria-expanded and aria-selected carry the state, Escape and
     an outside click close it, the arrow keys walk the items. */
  const picker = hook('game-picker');
  const trigger = hook('game-trigger');
  const gameMenu = picker ? picker.querySelector('.sp-dropdown__menu') : null;
  const gameOptions = $$('[data-aa-game-option]');
  if (picker && trigger && gameMenu && gameOptions.length) {
    const isOpen = () => trigger.getAttribute('aria-expanded') === 'true';
    const setOpen = open => {
      trigger.setAttribute('aria-expanded', String(open));
      gameMenu.hidden = !open;
      if (open) (gameOptions.find(option => option.getAttribute('aria-selected') === 'true') || gameOptions[0]).focus();
    };
    const choose = option => {
      gameKey = option.dataset.aaGameOption;
      const label = option.querySelector('strong').textContent.trim();
      gameOptions.forEach(item => item.setAttribute('aria-selected', String(item === option)));
      text('game-label', label);
      trigger.setAttribute('aria-label', 'Game: ' + label);
      text('game-slug', selectedGame().slug);
      const own = !!CONFIG.games[gameKey];
      addLogEntry('Game selected: ' + label + (own ? '' : ' (loads Hextris for now)') + '.', { tone: '' });
      if (sessionId) setStatus(own ? label + ' selected' : label + ' selected; this session keeps running Hextris', 'info', true);
      setOpen(false);
      trigger.focus();
    };
    trigger.addEventListener('click', () => setOpen(!isOpen()));
    gameOptions.forEach(option => option.addEventListener('click', () => choose(option)));
    document.addEventListener('click', event => { if (isOpen() && !picker.contains(event.target)) setOpen(false); });
    picker.addEventListener('keydown', event => {
      if (event.key === 'Escape' && isOpen()) { event.preventDefault(); setOpen(false); trigger.focus(); return; }
      if (!isOpen() || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const index = gameOptions.indexOf(document.activeElement);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? gameOptions.length - 1
        : event.key === 'ArrowDown' ? Math.min(gameOptions.length - 1, index + 1) : Math.max(0, index - 1);
      gameOptions[next].focus();
    });
  }
})();
/* === ADAPTIVE ASSIST PANEL: END === */
