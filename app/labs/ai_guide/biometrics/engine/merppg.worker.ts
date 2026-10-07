// ME-rPPG (Health-HCI-Group, Apache-2.0): a recurrent state-space model that
// takes one 36×36 RGB face crop per frame plus the time step, carries 36
// hidden-state tensors between calls, and emits one BVP sample per frame.
// Contract reverse-engineered from the authors' demo (onnxWorker.js @66c139d).

import * as ort from "onnxruntime-web/wasm";
import { ASSETS } from "./assets";

// The bundled entry embeds the JS glue; only the .wasm binary is fetched.
ort.env.wasm.wasmPaths = { wasm: ASSETS.ortWasm };
// Threads need cross-origin isolation, which the portal doesn't have. One
// thread runs this model in well under a frame.
ort.env.wasm.numThreads = self.crossOriginIsolated ? Math.min(4, navigator.hardwareConcurrency || 1) : 1;

export type MeIn =
  | { type: "init"; origin: string }
  | { type: "frame"; input: Float32Array; t: number; lambda: number }
  | { type: "reset" };
export type MeOut =
  | { type: "ready"; inputs: number; threads: number }
  | { type: "error"; message: string }
  | { type: "bvp"; t: number; v: number; ms: number };

interface StateManifest {
  tensors: Record<string, { shape: number[]; offset: number; length: number }>;
}

let session: ort.InferenceSession | null = null;
const initial: Record<string, ort.Tensor> = {};
let state: Record<string, ort.Tensor> = {};
let lastT: number | null = null;
let busy = Promise.resolve();

// The bundler serves this worker from its own URL, so site paths are resolved
// against the page's origin, which the engine sends first.
async function init(origin: string) {
  const at = (path: string) => new URL(path, origin).href;
  try {
    const [s, manifest, bin] = await Promise.all([
      ort.InferenceSession.create(at(ASSETS.meModel), { executionProviders: ["wasm"] }),
      fetch(at(ASSETS.meState)).then((r) => r.json() as Promise<StateManifest>),
      fetch(at(ASSETS.meStateBin)).then((r) => r.arrayBuffer()),
    ]);
    session = s;
    const floats = new Float32Array(bin);
    for (const [k, { shape, offset, length }] of Object.entries(manifest.tensors)) {
      initial[k] = new ort.Tensor("float32", floats.slice(offset, offset + length), shape);
    }
    state = { ...initial };
    const missing = s.inputNames.slice(1, -1).filter((n) => !(n in initial));
    if (missing.length) throw new Error(`state lacks inputs: ${missing.join(", ")}`);
    post({ type: "ready", inputs: s.inputNames.length, threads: ort.env.wasm.numThreads as number });
  } catch (e) {
    post({ type: "error", message: String(e) });
  }
}

function post(m: MeOut) {
  self.postMessage(m);
}

async function step(input: Float32Array, t: number, lambda: number) {
  if (!session) return;
  const started = performance.now();
  const names = session.inputNames;
  const dt = lastT === null ? 1 / 30 : Math.max((t - lastT) / lambda, 1 / 90);
  lastT = t;
  const feeds: Record<string, ort.Tensor> = { ...state };
  feeds[names[0]] = new ort.Tensor("float32", input, [1, 1, 36, 36, 3]);
  feeds[names[names.length - 1]] = new ort.Tensor("float32", new Float32Array([dt]), []);
  const out = await session.run(feeds);
  const outNames = session.outputNames;
  const v = (out[outNames[0]].data as Float32Array)[0];
  // Output i (i ≥ 1) is the next value of state input i.
  for (let i = 1; i < outNames.length; i++) state[names[i]] = out[outNames[i]];
  post({ type: "bvp", t, v, ms: performance.now() - started });
}

self.onmessage = (ev: MessageEvent<MeIn>) => {
  const m = ev.data;
  if (m.type === "init") {
    void init(m.origin);
    return;
  }
  if (m.type === "reset") {
    busy = busy.then(() => {
      state = { ...initial };
      lastT = null;
    });
    return;
  }
  // Serialise runs: the recurrent state must advance one frame at a time.
  busy = busy.then(() => step(m.input, m.t, m.lambda)).catch((e) => post({ type: "error", message: String(e) }));
};

