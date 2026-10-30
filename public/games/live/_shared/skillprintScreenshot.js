// Posts { type: 'screenshot', dataUrl } to the parent every 2s, matching what
// GameClient.tsx forwards to the Skillprint backend. DOM games have no canvas
// to read back, so the page is rasterised with html2canvas (loaded lazily).
(function () {
  if (window.parent === window) return;
  const INTERVAL_MS = 2000;
  let busy = false;
  // Player inputs since the last screenshot, sent with it: the portal can't
  // listen to a frame on the games CDN (NEW-30).
  let inputs = 0;
  ['keydown', 'pointerdown', 'pointermove', 'touchstart', 'wheel'].forEach((type) => {
    window.addEventListener(type, () => { inputs += 1; }, { capture: true, passive: true });
  });
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
    const inputCount = inputs;
    inputs = 0;
    try {
      const c = await html2canvas(document.body, {
        logging: false,
        useCORS: true,
        scale: Math.min(1, 640 / window.innerWidth),
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
      });
      window.parent.postMessage({ type: 'screenshot', dataUrl: c.toDataURL('image/jpeg', 0.72), inputCount }, '*');
    } catch (e) { console.warn('[skillprint] screenshot failed', e); }
    finally { busy = false; }
  }
  load().then(() => setInterval(shoot, INTERVAL_MS)).catch(() => console.warn('[skillprint] html2canvas failed to load'));
  window.addEventListener('message', (e) => { if (e.data && e.data.type === 'CAPTURE_SCREENSHOT') shoot(); });
})();
