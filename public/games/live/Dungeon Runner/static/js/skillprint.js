/**
 * Skillprint bridge for Dungeon Runner.
 *
 * Speaks the portal's existing iframe contract (see app/game/[slug]/GameClient.tsx and
 * public/games/live/Hextris/static/skillprintShim.js):
 *
 *   parent → game   { type: 'ADJUST_GAME', data: { parameterName, parameterValue } }
 *   parent → game   { type: 'GAME_PAUSE' } / { type: 'GAME_RESUME' }
 *   game → parent   { type: 'screenshot', dataUrl }            every SCREENSHOT_INTERVAL_MS
 *   game → parent   { type: 'skillprint_keydown', key }         keys 1–9 (portal tester)
 *   game → parent   { type: 'GAME_COMPLETE', data: {...} }
 *   game → parent   { type: 'GAME_SCORE_UPDATE', data: {...} }
 *   game → parent   { type: 'REGISTER_ADJUSTMENTS', mappings }  on load
 *
 * The game also exposes window.adjustGame(obj) and window.SKILLPRINT_PARAMETERS
 * (the backend parameter_definitions JSON) for tooling.
 */
import { setParam, applyPreset, PRESETS, toBackendDefinitions, toSdkParameterInfos } from './params.js';

export const SCREENSHOT_INTERVAL_MS = 2500;
const SCREENSHOT_WIDTH = 640;

const embedded = () => window.parent && window.parent !== window;

function post(msg) {
  if (!embedded()) return;
  try { window.parent.postMessage(msg, '*'); } catch (e) { /* ignore */ }
}

export function getTargetFromUrl() {
  const q = new URLSearchParams(window.location.search);
  return {
    mood: q.get('targetMood') || q.get('mood') || null,
    skill: q.get('targetSkill') || q.get('skill') || null,
  };
}

/**
 * @param {object} hooks
 * @param {(name:string, value:any, def:object, source:string) => void} hooks.onAdjust
 * @param {() => void} hooks.onPause
 * @param {() => void} hooks.onResume
 */
export function initSkillprint(hooks) {
  const state = { lastShot: 0, shots: 0, offscreen: null, lastAdjustAt: 0 };

  window.SKILLPRINT_PARAMETERS = toBackendDefinitions(2);
  window.DungeonRunnerPresets = PRESETS;
  window.SKILLPRINT_PARAMETER_INFOS = toSdkParameterInfos(2);

  window.adjustGame = function adjustGame(obj) {
    if (!obj || typeof obj !== 'object') return;
    // Accept both { parameterName, parameterValue } and { name, value }.
    const name = obj.parameterName ?? obj.name;
    const value = obj.parameterValue ?? obj.value ?? obj.newValue;
    if (name === undefined) return;
    const res = setParam(name, value, 'backend');
    if (res.ok) {
      state.lastAdjustAt = performance.now();
      console.log(`[DungeonRunner] adjusted ${name}: ${res.previous} → ${res.value}`);
      hooks.onAdjust?.(name, res.value, res, 'backend');
      post({ type: 'ADJUSTMENT_MADE', parameterName: name, parameterValue: res.value });
    } else {
      console.warn(`[DungeonRunner] rejected adjustment ${name}=${value}: ${res.reason}`);
    }
  };

  window.addEventListener('message', (event) => {
    const msg = event.data;
    if (!msg || typeof msg !== 'object') return;
    switch (msg.type) {
      case 'ADJUST_GAME': {
        const payload = msg.data && typeof msg.data === 'object' ? msg.data : msg;
        if (Array.isArray(payload)) payload.forEach((p) => window.adjustGame(p));
        else window.adjustGame(payload);
        break;
      }
      case 'GAME_PAUSE':
        hooks.onPause?.();
        break;
      case 'GAME_RESUME':
        hooks.onResume?.();
        break;
      default:
        break;
    }
  });

  // Keys 1–9: forward to the portal tester when embedded (it echoes ADJUST_GAME back),
  // otherwise apply the local preset so the standalone harness behaves the same way.
  window.addEventListener('keydown', (event) => {
    if (!/^[1-9]$/.test(event.key)) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (embedded()) {
      post({ type: 'skillprint_keydown', key: event.key });
    } else {
      const r = applyPreset(event.key, 'preset');
      if (r) {
        for (const res of r.results) {
          if (res.ok) hooks.onAdjust?.(res.name, res.value, res, 'preset');
        }
      }
    }
  }, true);

  // Announce test mappings (same shape public/games/lib/skillprint-adjustment.js uses).
  const mappings = {};
  for (const [key, p] of Object.entries(PRESETS)) {
    const [firstName, firstValue] = Object.entries(p.values)[0];
    mappings[key] = { parameterName: firstName, description: p.label, value: firstValue, values: p.values };
  }
  post({ type: 'REGISTER_ADJUSTMENTS', mappings });

  return {
    embedded,
    /** Call right after renderer.render() each frame; posts a composite JPEG when due. */
    tickScreenshot(now, glCanvas, hudCanvas) {
      if (now - state.lastShot < SCREENSHOT_INTERVAL_MS) return;
      if (!glCanvas.width || !glCanvas.height || (hudCanvas && (!hudCanvas.width || !hudCanvas.height))) return; // not laid out yet
      state.lastShot = now;
      try {
        const w = SCREENSHOT_WIDTH;
        const h = Math.round((glCanvas.height / glCanvas.width) * w) || 360;
        if (!state.offscreen) state.offscreen = document.createElement('canvas');
        const c = state.offscreen;
        if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
        const ctx = c.getContext('2d');
        ctx.drawImage(glCanvas, 0, 0, w, h);
        if (hudCanvas) ctx.drawImage(hudCanvas, 0, 0, w, h);
        const dataUrl = c.toDataURL('image/jpeg', 0.72);
        state.shots += 1;
        window.__lastDungeonScreenshot = dataUrl; // handy for the standalone harness
        post({ type: 'screenshot', dataUrl });
        window.dispatchEvent(new CustomEvent('dungeon:screenshot', { detail: { dataUrl, count: state.shots } }));
      } catch (e) {
        console.warn('[DungeonRunner] screenshot failed', e);
      }
    },
    sendScore(data) {
      post({ type: 'GAME_SCORE_UPDATE', data });
    },
    sendComplete(data) {
      post({ type: 'GAME_COMPLETE', data });
    },
    get screenshotCount() { return state.shots; },
  };
}
