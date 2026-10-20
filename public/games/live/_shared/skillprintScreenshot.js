// Posts { type: 'screenshot', dataUrl, capturedAt, gameState } to the parent
// every 2s, matching what GameClient.tsx forwards to the Skillprint backend.
// capturedAt is epoch ms; gameState is window.skillprintGameState() at that
// moment, if the game defines it (public/games/GAME_STATE.md). DOM games have no canvas
// to read back, so the page is rasterised with html2canvas (loaded lazily).
(function () {
  if (window.parent === window) return;
  const INTERVAL_MS = 2000;
  let busy = false;
  function readGameState() {
    if (typeof window.skillprintGameState !== 'function') return undefined;
    try {
      const state = window.skillprintGameState();
      return state === undefined ? undefined : JSON.parse(JSON.stringify(state));
    } catch (e) {
      console.warn('[skillprint] skillprintGameState failed', e);
      return undefined;
    }
  }
  function load() {
    return new Promise((res, rej) => {
      if (window.html2canvas) return res();
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
  }
  async function shoot() {
    if (busy || document.hidden || !window.html2canvas) return;
    busy = true;
    try {
      const capturedAt = performance.timeOrigin ? performance.timeOrigin + performance.now() : Date.now();
      const gameState = readGameState();
      const c = await html2canvas(document.body, {
        logging: false,
        useCORS: true,
        scale: Math.min(1, 640 / window.innerWidth),
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
      });
      window.parent.postMessage({ type: 'screenshot', dataUrl: c.toDataURL('image/jpeg', 0.72), capturedAt: capturedAt, gameState: gameState }, '*');
    } catch (e) { console.warn('[skillprint] screenshot failed', e); }
    finally { busy = false; }
  }
  load().then(() => setInterval(shoot, INTERVAL_MS)).catch(() => console.warn('[skillprint] html2canvas failed to load'));
  window.addEventListener('message', (e) => { if (e.data && e.data.type === 'CAPTURE_SCREENSHOT') shoot(); });
})();
