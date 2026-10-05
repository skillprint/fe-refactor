// Skillprint bridge for Construct 3 exports. Load it before scripts/main.js:
// it has to wrap requestAnimationFrame and getContext before the runtime starts.
//
// - SkillprintC3.setSpeed(x) scales game time. C3 takes each tick's dt from the
//   rAF timestamp (performance.now() is only its fallback), so both are served
//   from one warped clock; warping performance.now alone changes nothing.
// - The WebGL canvas is created with preserveDrawingBuffer, so it can be read
//   back between frames, and is posted to the parent every 2s as
//   { type: 'screenshot', dataUrl } (the message GameClient and the AI Guide upload).
// - Player input is posted as skillprint_mousedown / skillprint_keydown, which
//   the AI Guide takes as the start of play.
// - The event sheet's logEvent({event, ...}) calls are posted as
//   { type: 'gameEvent', data: {event, at, ...} }, the message GameClient
//   records (the same one SkillprintLib's bridge and Hextris send).
// Times sent to the portal (`at`, `capturedAt`) are epoch ms on the REAL clock:
// the warped performance.now() would drift from the portal's once setSpeed runs.
(function () {
  const realNow = performance.now.bind(performance);
  const epochNow = function () {
    return performance.timeOrigin ? performance.timeOrigin + realNow() : Date.now();
  };
  let speed = 1;
  let lastReal = realNow();
  let warped = lastReal;

  function warpedAt(real) {
    // rAF timestamps can trail the latest performance.now() call; extrapolate back
    // rather than moving the clock, so it never runs backwards.
    if (real < lastReal) return warped - (lastReal - real) * speed;
    warped += (real - lastReal) * speed;
    lastReal = real;
    return warped;
  }

  performance.now = function () { return warpedAt(realNow()); };

  const realRaf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = function (cb) {
    return realRaf(function (ts) { cb(warpedAt(ts)); });
  };

  const realGetContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, attrs) {
    if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') {
      attrs = Object.assign({}, attrs, { preserveDrawingBuffer: true });
    }
    return realGetContext.call(this, type, attrs);
  };

  window.SkillprintC3 = {
    setSpeed(x) {
      warpedAt(realNow()); // bank the time run at the old speed first
      speed = x;
    },
    getSpeed() { return speed; },
  };

  if (window.parent === window) return;

  const SCREENSHOT_MS = 2000;
  const MAX_WIDTH = 640;
  const scratch = document.createElement('canvas');

  function shoot() {
    const src = document.querySelector('canvas');
    if (document.hidden || !src || !src.width) return;
    const scale = Math.min(1, MAX_WIDTH / src.width);
    scratch.width = Math.round(src.width * scale);
    scratch.height = Math.round(src.height * scale);
    try {
      const capturedAt = epochNow();
      scratch.getContext('2d').drawImage(src, 0, 0, scratch.width, scratch.height);
      window.parent.postMessage({ type: 'screenshot', dataUrl: scratch.toDataURL('image/jpeg', 0.72), capturedAt: capturedAt }, '*');
    } catch (e) {
      console.warn('[skillprint] screenshot failed', e);
    }
  }

  setInterval(shoot, SCREENSHOT_MS);
  window.addEventListener('message', function (e) {
    if (e.data && e.data.type === 'CAPTURE_SCREENSHOT') shoot();
  });

  window.addEventListener('pointerdown', function () {
    window.parent.postMessage({ type: 'skillprint_mousedown' }, '*');
  }, true);
  // Keys 1-9 double as the GameAdjustmentTester's presets; it ignores the rest.
  window.addEventListener('keydown', function (event) {
    window.parent.postMessage({ type: 'skillprint_keydown', key: event.key }, '*');
  }, true);

  // Game events. Replaces the no-op logEvent stub in the game's index.html; the
  // runtime only starts after this script, so no call is made before it.
  // Legacy names for universal events (the SDK's GameEvent) keep the original
  // in `legacyEvent`. Transport fields are dropped: the portal stamps its own
  // session time from `at`. Never throws into the game.
  const UNIVERSAL_NAMES = { HINT_USED: 'HINT', LEVEL_PASSED: 'LEVEL_COMPLETE', LEVEL_WON: 'LEVEL_COMPLETE' };
  const TRANSPORT_FIELDS = ['messageType', 'timestamp', 'at'];
  function logEvent(params) {
    try {
      const at = epochNow();
      const json = JSON.stringify(params);
      if (typeof json !== 'string') return;
      const data = JSON.parse(json);
      if (!data || typeof data !== 'object' || typeof data.event !== 'string' || !data.event) return;
      TRANSPORT_FIELDS.forEach(function (key) { delete data[key]; });
      if (Object.prototype.hasOwnProperty.call(UNIVERSAL_NAMES, data.event)) {
        data.legacyEvent = data.event;
        data.event = UNIVERSAL_NAMES[data.event];
      }
      data.at = at;
      window.parent.postMessage({ type: 'gameEvent', data: data }, window.location.origin);
    } catch (e) {
      // Telemetry must never break the game.
    }
  }
  globalThis.logEvent = logEvent;
})();
