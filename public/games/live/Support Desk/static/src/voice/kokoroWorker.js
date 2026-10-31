// Kokoro-82M off the main thread. Synthesis on WebAssembly runs single-threaded
// here (the portal is not cross-origin isolated) at roughly twice real time on
// an M1, and it blocks whatever thread it runs on, so it runs in this worker.
// Lines are made a sentence at a time so the first one can play while the rest
// are still being made.
//
// in:  {type:'load', dtype, device}
//      {type:'speak', id, text, voice, speed}
//      {type:'cancel', id}
// out: {type:'progress', status, progress}
//      {type:'loaded', device, dtype}
//      {type:'chunk', id, samples: Float32Array, rate, text}
//      {type:'done', id}
//      {type:'error', id?, message}

const KOKORO_URL = 'https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/+esm';
const KOKORO_MODEL = 'onnx-community/Kokoro-82M-v1.0-ONNX';

let tts = null;
let loading = null;
const cancelled = new Set();

const sentences = (text) => (String(text).match(/[^.!?…]+[.!?…]*["')\]]*\s*/g) || [String(text)])
  .map((s) => s.trim())
  .filter(Boolean);

async function load(dtype, device) {
  if (tts) return tts;
  if (!loading) {
    loading = (async () => {
      const mod = await import(KOKORO_URL);
      tts = await mod.KokoroTTS.from_pretrained(KOKORO_MODEL, {
        dtype, device,
        progress_callback: (p) => {
          if (p && p.status === 'progress' && typeof p.progress === 'number') self.postMessage({ type: 'progress', status: p.status, progress: p.progress });
        },
      });
      self.postMessage({ type: 'loaded', device, dtype });
      return tts;
    })();
  }
  return loading;
}

self.onmessage = async (e) => {
  const m = e.data || {};
  try {
    if (m.type === 'load') {
      await load(m.dtype || 'q8', m.device || 'wasm');
    } else if (m.type === 'cancel') {
      cancelled.add(m.id);
    } else if (m.type === 'speak') {
      const model = await load(m.dtype || 'q8', m.device || 'wasm');
      for (const s of sentences(m.text)) {
        if (cancelled.has(m.id)) break;
        const audio = await model.generate(s, { voice: m.voice, speed: m.speed || 1 });
        if (cancelled.has(m.id)) break;
        self.postMessage({ type: 'chunk', id: m.id, samples: audio.audio, rate: audio.sampling_rate, text: s });
      }
      cancelled.delete(m.id);
      self.postMessage({ type: 'done', id: m.id });
    }
  } catch (err) {
    self.postMessage({ type: 'error', id: m.id, message: String((err && err.message) || err) });
  }
};
