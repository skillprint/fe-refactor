// The customer's voice, all local. Order of preference:
//   1. Kokoro-82M (kokoro-js, Apache-2.0) in a Web Worker: 8-bit weights on
//      WebAssembly, about 90 MB fetched once and cached by the browser. It runs
//      at about twice real time on an M1, so lines are made a sentence at a time
//      and the first sentence plays while the rest are made. No emotion control:
//      the mood shows in the words and the badge.
//   2. The browser's own speechSynthesis, which every browser has.
// Phase 3 adds the local Qwen3-TTS service (emotion instructions) ahead of both,
// behind the same speak() call. Nothing here talks to a paid API.
//
// URL switches: ?ttsDevice=webgpu (faster, but a ~330 MB full-precision model),
// ?ttsDtype=fp16|q8|q4, ?tts=browser (skip Kokoro).

const VOICES = {
  female: ['af_heart', 'af_bella', 'bf_emma', 'af_nicole', 'af_sarah'],
  male: ['am_michael', 'am_fenrir', 'bm_george', 'am_puck', 'bm_fable'],
};

/** 16-bit PCM WAV from float samples. */
function wavBlob(samples, sampleRate) {
  const buf = new ArrayBuffer(44 + samples.length * 2);
  const v = new DataView(buf);
  const str = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  str(0, 'RIFF'); v.setUint32(4, 36 + samples.length * 2, true); str(8, 'WAVE'); str(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); str(36, 'data'); v.setUint32(40, samples.length * 2, true);
  for (let i = 0, o = 44; i < samples.length; i++, o += 2) v.setInt16(o, Math.max(-1, Math.min(1, samples[i])) * 0x7fff, true);
  return new Blob([buf], { type: 'audio/wav' });
}

/** Play one blob; resolves when it ends or is stopped. `onStop` receives the stopper. */
function playBlob(blob, onStop) {
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  return new Promise((resolve, reject) => {
    const finish = () => { URL.revokeObjectURL(url); resolve(); };
    audio.onended = finish;
    audio.onerror = finish;
    onStop(() => { audio.pause(); finish(); });
    audio.play().catch((e) => { URL.revokeObjectURL(url); reject(e); });
  });
}

export function createVoice({ onStatus = () => {} } = {}) {
  const opts = new URLSearchParams(location.search);
  const device = opts.get('ttsDevice') === 'webgpu' && navigator.gpu ? 'webgpu' : 'wasm';
  const dtype = opts.get('ttsDtype') || (device === 'webgpu' ? 'fp32' : 'q8');
  const kokoroAllowed = opts.get('tts') !== 'browser' && typeof Worker !== 'undefined';

  let enabled = false;
  let worker = null;
  let kokoroReady = false;
  let kokoroFailed = !kokoroAllowed;
  let seq = 0;
  let current = null;                // {stop()}
  const handlers = new Map();        // speak id → message handler
  const voiceFor = new Map();        // persona name → voice id, stable across tickets

  const pickVoice = (persona) => {
    const key = persona?.name || 'customer';
    if (!voiceFor.has(key)) {
      const list = VOICES[persona?.voice === 'male' ? 'male' : 'female'];
      voiceFor.set(key, list[voiceFor.size % list.length]);
    }
    return voiceFor.get(key);
  };

  function startWorker() {
    if (worker || kokoroFailed) return;
    try {
      worker = new Worker(new URL('./kokoroWorker.js', import.meta.url), { type: 'module' });
    } catch (e) {
      console.warn('[support-desk] no worker for Kokoro, using the browser voice', e);
      kokoroFailed = true;
      return;
    }
    let lastPct = -1;
    onStatus('Loading the voice model…');
    worker.onmessage = (e) => {
      const m = e.data || {};
      if (m.type === 'progress') {
        const pct = Math.round(m.progress);
        if (pct !== lastPct && pct % 10 === 0) { lastPct = pct; onStatus(`Loading the voice model… ${pct}%`); }
      } else if (m.type === 'loaded') {
        kokoroReady = true;
        onStatus(`Voice ready (Kokoro, ${m.device})`);
      } else if (m.type === 'error' && m.id == null) {
        console.warn('[support-desk] Kokoro unavailable, using the browser voice:', m.message);
        kokoroFailed = true;
        onStatus('Voice ready (browser)');
      } else if (m.id != null) {
        handlers.get(m.id)?.(m);
      }
    };
    worker.onerror = (e) => {
      console.warn('[support-desk] Kokoro worker failed, using the browser voice', e.message || e);
      kokoroFailed = true;
      kokoroReady = false;
      onStatus('Voice ready (browser)');
      for (const h of handlers.values()) h({ type: 'error', message: 'worker failed' });
    };
    worker.postMessage({ type: 'load', dtype, device });
  }

  function stop() {
    if (current) { try { current.stop(); } catch { /* ignore */ } current = null; }
  }

  async function speakKokoro(text, { voice, rate }) {
    const id = ++seq;
    const queue = [];
    let done = false;
    let error = null;
    let stopped = false;
    let wake = null;
    let stopAudio = null;
    handlers.set(id, (m) => {
      if (m.type === 'chunk') queue.push(m);
      else if (m.type === 'done') done = true;
      else if (m.type === 'error') { error = m.message; done = true; }
      if (wake) { const w = wake; wake = null; w(); }
    });
    const me = {
      stop: () => {
        stopped = true;
        worker?.postMessage({ type: 'cancel', id });
        if (stopAudio) stopAudio();
        if (wake) { const w = wake; wake = null; w(); }
      },
    };
    current = me;
    worker.postMessage({ type: 'speak', id, text, voice, speed: rate, dtype, device });
    let startedAt = null;
    try {
      for (;;) {
        if (stopped) break;
        if (queue.length) {
          const c = queue.shift();
          startedAt ??= performance.now();
          await playBlob(wavBlob(c.samples, c.rate), (s) => { stopAudio = s; });
          stopAudio = null;
          continue;
        }
        if (done) break;
        await new Promise((r) => { wake = r; });
      }
    } finally {
      handlers.delete(id);
      if (current === me) current = null;
    }
    if (error && startedAt == null) throw new Error(error);
    return { startedAt: startedAt ?? performance.now(), endedAt: performance.now(), backend: 'kokoro' };
  }

  function speakBrowser(text, { affect, rate, persona }) {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) return resolve(null);
      const u = new SpeechSynthesisUtterance(text);
      const voices = speechSynthesis.getVoices();
      const wantFemale = persona?.voice !== 'male';
      const en = voices.filter((v) => /^en/i.test(v.lang));
      const pick = en.find((v) => (wantFemale ? /female|samantha|karen|moira|tessa|zira|susan/i : /male|daniel|alex|fred|david|george/i).test(v.name)) || en[0];
      if (pick) u.voice = pick;
      // No emotion control either, but anger reads as faster and lower, resignation as slower.
      u.rate = rate * (affect === 'angry' ? 1.12 : affect === 'resigned' ? 0.9 : 1);
      u.pitch = affect === 'angry' ? 0.85 : affect === 'tense' ? 0.95 : 1;
      const started = performance.now();
      const me = { stop: () => { speechSynthesis.cancel(); resolve({ startedAt: started, endedAt: performance.now(), backend: 'speechSynthesis' }); } };
      current = me;
      u.onend = () => { if (current === me) current = null; resolve({ startedAt: started, endedAt: performance.now(), backend: 'speechSynthesis' }); };
      u.onerror = () => { if (current === me) current = null; resolve(null); };
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
    });
  }

  return {
    get enabled() { return enabled; },
    get backend() { return kokoroReady ? 'kokoro' : kokoroFailed ? 'speechSynthesis' : enabled ? 'loading' : 'off'; },
    async enable() {
      enabled = true;
      onStatus('Voice on');
      startWorker(); // loads in the background; lines before it is ready use the browser voice
      return true;
    },
    disable() { enabled = false; stop(); onStatus('Voice off'); },
    stop,
    /**
     * Speak one customer line. Resolves when playback ends with
     * {startedAt, endedAt, backend}, or null when nothing was spoken.
     */
    async speak(text, { affect = 'calm', persona = null, rate = 1 } = {}) {
      if (!enabled || !text) return null;
      stop();
      const voice = pickVoice(persona);
      const useKokoro = kokoroReady && !kokoroFailed && worker;
      const once = async () => {
        if (useKokoro) {
          try {
            return await speakKokoro(text, { voice, rate });
          } catch (e) {
            console.warn('[support-desk] Kokoro failed on a line, falling back', e);
          }
        }
        return speakBrowser(text, { affect, rate, persona });
      };
      // A line must never hold up the game, and a browser voice in a hidden tab
      // may never report its end: give up after roughly how long the line should
      // take to make and play, plus a margin.
      const t0 = performance.now();
      const audioMs = (text.length * 75) / rate;
      const limitMs = Math.max(6000, audioMs * (useKokoro ? 3.5 : 1.3) + 3000);
      let timer;
      const guard = new Promise((resolve) => {
        timer = setTimeout(() => { stop(); resolve({ startedAt: t0, endedAt: performance.now(), backend: 'timeout' }); }, limitMs);
      });
      try {
        return await Promise.race([once(), guard]);
      } finally {
        clearTimeout(timer);
      }
    },
    /** Phase 3: speech input. Not available yet. */
    async listen() { throw new Error('listen() arrives with voice mode in Phase 3'); },
  };
}
