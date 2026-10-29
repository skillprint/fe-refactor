// Elixir's link to Skillprint, through skillprint-js-sdk.
//
// Inside the Skillprint portal, or its iframe test harness, the page around
// the game owns the session: it starts it, uploads what the game posts, and
// sends adjustments back as ADJUST_GAME. Opened on its own with a partner key
// (?skillprintKey=…), the game runs the session itself with the SDK's
// SkillprintManager. Either way the game reports the same things: a frame of
// what the player sees every two seconds, its events in the SDK's vocabulary,
// and its score. A plain visit with no key and no parent page reports nothing.

import { SkillprintConfig, SkillprintManager, WebGLUrlParameterExtractor, GameEvent, Mood } from '../vendor/skillprint-js-sdk/index.js';
import { PARAMETERS, tuning, setParameter } from './params.js';

export { GameEvent };

const SLUG = 'elixir';
// Console prefix, and the window.__<tag>State / __<tag>Tuning test hooks.
const TAG = 'elixir';
const FRAME_SECONDS = 2;
const FRAME_WIDTH = 1024;

const epochMs = (now = performance.now()) => performance.timeOrigin + now;

export class Skillprint {
  /**
   * @param {object} o
   * @param {HTMLCanvasElement} o.canvas the WebGL canvas
   * @param {() => string[]} o.describe lines of text stamped on each frame
   * @param {(ctx: CanvasRenderingContext2D, w: number, h: number) => void} [o.overlay]
   *   draws onto the frame anything the page lays over the canvas that the scorer should see
   */
  constructor({ canvas, describe, overlay = null }) {
    this.canvas = canvas;
    this.describe = describe;
    this.overlay = overlay;
    this.onPause = () => {};
    this.lastFrame = -Infinity;
    this.composing = false;
    this.lastState = '';
    // The frame the SDK reads, swapped in whole once composed, so a capture
    // mid-composition never sees half a frame.
    this.snapshot = document.createElement('canvas');
    this.work = document.createElement('canvas');

    // For test harnesses: `let` bindings in a module aren't window properties.
    window[`__${TAG}Tuning`] = tuning;

    this.embedded = window.parent !== window;
    this.manager = null;
    if (!this.embedded) this.manager = this.standalone();

    if (this.embedded) {
      window.addEventListener('message', (e) => this.receive(e));
      // Keys 1-9 belong to Skillprint's adjustment tester in the portal.
      window.addEventListener('keydown', (e) => {
        if (/^[1-9]$/.test(e.key)) window.parent.postMessage({ type: 'skillprint_keydown', key: e.key }, '*');
      }, true);
    }
  }

  /** True when a page or the SDK is listening: worth offering a Finish button. */
  get reporting() { return this.embedded || Boolean(this.manager); }

  standalone() {
    const params = new URLSearchParams(location.search);
    const key = params.get('skillprintKey');
    if (!key) return null;
    // Keep the key out of the address bar, the history and anything shared from it.
    params.delete('skillprintKey');
    history.replaceState(history.state, '', `${location.pathname}${params.size ? `?${params}` : ''}${location.hash}`);
    const config = new SkillprintConfig({
      gameName: SLUG,
      targetEnvironment: params.get('skillprintEnv') === 'production' ? 'production' : 'staging',
      productionPartnerApiKey: key,
      stagingPartnerApiKey: key,
      gameParameters: PARAMETERS,
      screenshotIntervalSeconds: FRAME_SECONDS,
      enableDebugLogging: params.has('skillprintDebug'),
    });
    const manager = new SkillprintManager(config, () => (this.snapshot.width ? this.snapshot : null));
    for (const p of PARAMETERS) manager.registerParameterModifier(p.parameterName, (v) => this.adjust(p.parameterName, v));
    return manager;
  }

  /** The player has started: open the SDK's session, when the game runs its own. */
  begin() {
    const m = this.manager;
    if (!m || m.isSessionActive) return;
    const url = WebGLUrlParameterExtractor.getSkillprintUrlParameters();
    const mood = Object.values(Mood).includes(url.targetMood) ? url.targetMood : Mood.FOCUS;
    m.startGameSession(mood, url.playerId || null);
    addEventListener('pagehide', () => m.stopGameSession(), { once: true });
  }

  /** The player is done: the portal shows its results; the SDK closes the session. */
  finish(data) {
    this.event(GameEvent.GAME_END, data);
    this.state({ ...data, isGameOver: true });
    if (this.embedded) window.parent.postMessage({ type: 'GAME_COMPLETE', data }, '*');
    else this.manager?.stopGameSession();
  }

  event(name, data = {}) {
    if (this.embedded) window.parent.postMessage({ type: 'gameEvent', data: { event: name, at: epochMs(), ...data } }, '*');
    else if (this.manager?.isSessionActive) this.manager.logEvent(name, data);
  }

  /** The game's score and whereabouts; the portal keeps the last one for the results. */
  state(data) {
    window[`__${TAG}State`] = data;
    const json = JSON.stringify(data);
    if (!this.embedded || json === this.lastState) return;
    this.lastState = json;
    window.parent.postMessage({ type: 'gameState', data }, '*');
  }

  receive(e) {
    const { type, data } = e.data || {};
    if (type === 'ADJUST_GAME' && data && typeof data.parameterName === 'string') this.adjust(data.parameterName, data.parameterValue);
    else if (type === 'GAME_PAUSE') this.onPause(true);
    else if (type === 'GAME_RESUME') this.onPause(false);
  }

  adjust(name, raw) {
    const value = setParameter(name, raw);
    if (value == null) console.warn(`[${TAG}] ignored adjustment ${name} = ${raw}`);
    else console.info(`[${TAG}] ${name} = ${value}`);
  }

  // Called right after each render, while the drawing buffer still holds the
  // frame (the renderer doesn't preserve it, so a capture any later is blank).
  frame(now) {
    if (now - this.lastFrame < FRAME_SECONDS * 1000 || this.composing) return;
    if (!this.embedded && !this.manager?.isSessionActive) return;
    this.lastFrame = now;
    this.compose(now).catch((e) => console.warn(`[${TAG}] frame not captured`, e));
  }

  async compose(now) {
    this.composing = true;
    try {
      const src = this.canvas;
      const scale = Math.min(1, FRAME_WIDTH / src.width);
      const w = Math.round(src.width * scale), h = Math.round(src.height * scale);
      const work = this.work;
      work.width = w;
      work.height = h;
      const ctx = work.getContext('2d');
      // Synchronous from here to the snapshot copy: the drawing buffer is only
      // good until the browser composites this frame.
      ctx.drawImage(src, 0, 0, w, h);
      if (this.overlay) {
        ctx.save();
        this.overlay(ctx, w, h);
        ctx.restore();
      }
      stamp(ctx, this.describe(), w);

      this.snapshot.width = w;
      this.snapshot.height = h;
      this.snapshot.getContext('2d').drawImage(work, 0, 0);
      if (this.embedded) {
        // toBlob encodes off the main thread; toDataURL stalls a frame or three.
        const blob = await new Promise((r) => work.toBlob(r, 'image/jpeg', 0.8));
        if (!blob) return;
        const dataUrl = await new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
        window.parent.postMessage({ type: 'screenshot', dataUrl, capturedAt: epochMs(now) }, '*');
      }
    } finally {
      this.composing = false;
    }
  }
}

// What the HUD says, in a corner of the frame: the scorer sees the image, not the page.
function stamp(ctx, lines, w) {
  if (!lines.length) return;
  const size = Math.max(12, Math.round(w / 64));
  ctx.font = `500 ${size}px ui-monospace, Menlo, monospace`;
  const pad = Math.round(size * 0.6), lh = Math.round(size * 1.35);
  const bw = Math.max(...lines.map((l) => ctx.measureText(l).width)) + pad * 2;
  ctx.fillStyle = 'rgba(12, 16, 28, 0.72)';
  ctx.fillRect(0, 0, bw, lines.length * lh + pad * 2 - (lh - size));
  ctx.fillStyle = '#f5ecda';
  ctx.textBaseline = 'top';
  lines.forEach((l, i) => ctx.fillText(l, pad, pad + i * lh));
}
