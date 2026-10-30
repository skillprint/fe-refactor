// Support Desk's link to the Skillprint portal, the same contract Mountain
// Appreciator speaks: inside the portal (or the iframe test bench) the page
// around the game owns the session; the game posts a frame of what the player
// sees every couple of seconds, its events, and its score, and receives
// ADJUST_GAME, GAME_PAUSE and GAME_RESUME. Opened on its own it reports
// nothing and just plays (with ?mock=1, no backend needed).

import { epochMs } from './timing.js';

export class SkillprintBridge {
  /**
   * @param {object} o
   * @param {HTMLElement} o.root what the scorer sees (the whole desk)
   * @param {(name: string, value: unknown) => void} o.onAdjust
   * @param {() => void} o.onPause
   * @param {() => void} o.onResume
   * @param {(config: object) => void} [o.onConfig]
   */
  constructor({ root, frameSeconds = 2.5, frameWidth = 1024, onAdjust, onPause, onResume, onConfig }) {
    this.root = root;
    this.frameSeconds = frameSeconds;
    this.frameWidth = frameWidth;
    this.onAdjust = onAdjust;
    this.onPause = onPause;
    this.onResume = onResume;
    this.onConfig = onConfig;
    this.embedded = window.parent !== window;
    this.timer = null;
    this.capturing = false;
    this.lastState = '';
    this.log = [];
    if (this.embedded) {
      window.addEventListener('message', (e) => this.receive(e));
      // Keys 1-9 belong to the portal's adjustment tester, but not while typing a reply.
      window.addEventListener('keydown', (e) => {
        if (/^[1-9]$/.test(e.key) && !(e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement)) {
          window.parent.postMessage({ type: 'skillprint_keydown', key: e.key }, '*');
        }
      }, true);
    }
  }

  get reporting() { return this.embedded; }

  startFrames() {
    if (!this.embedded || this.timer) return;
    this.capture();
    this.timer = setInterval(() => this.capture(), this.frameSeconds * 1000);
  }

  stopFrames() { if (this.timer) { clearInterval(this.timer); this.timer = null; } }

  /** One frame of the desk, as the scorer sees it. */
  async capture() {
    if (!this.embedded || this.capturing || typeof window.html2canvas !== 'function') return;
    this.capturing = true;
    try {
      const capturedAt = epochMs();
      const scale = Math.min(1, this.frameWidth / Math.max(1, this.root.clientWidth));
      const canvas = await window.html2canvas(this.root, {
        backgroundColor: '#0f1218', scale, logging: false, useCORS: true, removeContainer: true,
        width: this.root.clientWidth, height: this.root.clientHeight, windowWidth: this.root.clientWidth, windowHeight: this.root.clientHeight,
      });
      const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.8));
      if (!blob) return;
      const dataUrl = await new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
      window.parent.postMessage({ type: 'screenshot', dataUrl, capturedAt }, '*');
    } catch (e) {
      console.warn('[support-desk] frame not captured', e);
    } finally {
      this.capturing = false;
    }
  }

  /** A discrete event, universal (LEVEL_START...) or ours (CUSTOMER_REPLY...). */
  event(name, data = {}) {
    const entry = { event: name, at: epochMs(), ...data };
    this.log.push(entry);
    if (this.log.length > 400) this.log.shift();
    if (this.embedded) window.parent.postMessage({ type: 'gameEvent', data: entry }, '*');
  }

  /** Score and whereabouts; the portal keeps `score` and `isGameOver`. */
  state(data) {
    window.__deskState = data;
    const json = JSON.stringify(data);
    if (!this.embedded || json === this.lastState) return;
    this.lastState = json;
    window.parent.postMessage({ type: 'gameState', data }, '*');
  }

  complete(data) {
    this.state({ ...data, isGameOver: true });
    this.stopFrames();
    if (this.embedded) window.parent.postMessage({ type: 'GAME_COMPLETE', data }, '*');
  }

  receive(e) {
    const { type, data } = e.data || {};
    if (type === 'ADJUST_GAME' && data && typeof data.parameterName === 'string') this.onAdjust?.(data.parameterName, data.parameterValue);
    else if (type === 'GAME_PAUSE') this.onPause?.();
    else if (type === 'GAME_RESUME') this.onResume?.();
    else if (type === 'SKILLPRINT_CONFIG' && data && typeof data === 'object') { window.__skillprintConfig = { ...(window.__skillprintConfig || {}), ...data }; this.onConfig?.(data); }
  }
}
