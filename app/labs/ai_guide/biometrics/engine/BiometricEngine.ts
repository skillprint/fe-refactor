// The webcam biometrics pipeline from the rPPG lab, without its page: camera
// or video file in, per-frame face measurement, ME-rPPG in a worker, POS /
// CHROM / GREEN, an optional Bluetooth strap for ground truth, and a
// snapshot pushed to the UI once a second. Views (canvases) can attach to get
// the frame with the skin-region overlay drawn on it.

import { Analyzer, METHODS, type Analysis, type AnalysisOptions, type MethodName } from "./analysis";
import { median } from "./dsp";
import { FaceSensor, ROI_NAMES, type FaceFrame, type RoiName } from "./face";
import type { MeIn, MeOut } from "./merppg.worker";
import { Recording } from "./recorder";
import {
  biometricEvent, biometricSignals, indicatorFragment, pickMethod,
  type Baseline, type Primary,
} from "./signals";
import { HeartRateStrap, bluetoothAvailable, type StrapSample } from "./ble-hr";

export { METHODS, ROI_NAMES };
export type { MethodName, Primary, RoiName };

export interface EngineSettings {
  hrWindowSec: number;
  hrvWindowSec: number;
  rois: RoiName[];
  primary: Primary;
  lambda: number;
  lockCamera: boolean;
}

export const DEFAULT_SETTINGS: EngineSettings = {
  hrWindowSec: 10,
  hrvWindowSec: 60,
  rois: [...ROI_NAMES],
  primary: "me-rppg",
  lambda: 1,
  lockCamera: true,
};

export interface HistoryPoint {
  t: number;
  methods: Partial<Record<MethodName, number>>;
  truth: number | null;
}

export interface ErrorStat {
  mae: number | null;
  within5: number | null;
  n: number;
}

export interface Snapshot {
  status: { face: string; me: string; isolated: boolean };
  source: "idle" | "camera" | "file";
  error: string | null;
  analysis: Analysis | null;
  signals: ReturnType<typeof biometricSignals> | null;
  indicators: ReturnType<typeof indicatorFragment>;
  primaryMethod: MethodName | null;
  history: HistoryPoint[];
  errors: Record<MethodName, ErrorStat>;
  meDropped: number;
  roiPixels: number | null;
  cameraLock: string;
  fileProgress: string;
  strap: { available: boolean; state: "off" | "pairing" | "on"; name: string; bpm: number | null; hasRr: boolean; message: string };
  recording: boolean;
  baseline: Baseline | null;
  settings: EngineSettings;
}

/** A reading for the session timeline: event data and when it was measured, in epoch ms. */
export type ReadingListener = (data: Record<string, unknown>, atEpochMs: number) => void;

export class BiometricEngine {
  private sensor = new FaceSensor();
  private analyzer = new Analyzer();
  private video: HTMLVideoElement;
  private worker: Worker;
  private views = new Set<HTMLCanvasElement>();

  private source: Snapshot["source"] = "idle";
  private stream: MediaStream | null = null;
  private lastT: number | null = null;
  private lastFrame: FaceFrame | null = null;
  private recording: Recording | null = null;
  private baseline: Baseline | null = null;
  private strap: HeartRateStrap | null = null;
  private strapState: Snapshot["strap"] = {
    available: false, state: "off", name: "", bpm: null, hasRr: false, message: "",
  };
  private settings: EngineSettings = { ...DEFAULT_SETTINGS, rois: [...DEFAULT_SETTINGS.rois] };
  private meReady = false;
  private sensorReady = false;
  private meInflight = 0;
  private meWarmup = 30; // the authors drop the first second while the state settles
  private meDropped = 0;
  private meWaiter: (() => void) | null = null;
  private fileRun = 0;
  private fileProgress = "—";
  private cameraLock = "";
  private error: string | null = null;
  private status = { face: "loading…", me: "loading…", isolated: false };
  private history: HistoryPoint[] = [];
  private errors: Record<MethodName, number[]> = { "me-rppg": [], pos: [], chrom: [], green: [] };
  private latest: Analysis | null = null;
  private ticker: ReturnType<typeof setInterval> | null = null;
  private disposed = false;

  constructor(
    private onSnapshot: (s: Snapshot) => void,
    private onReading: ReadingListener = () => {},
  ) {
    this.status.isolated = self.crossOriginIsolated;
    this.strapState.available = bluetoothAvailable();
    if (!this.strapState.available) this.strapState.message = "Web Bluetooth needs Chrome or Edge";

    // The frame loop needs a rendered <video>; keep it in the page but invisible.
    this.video = document.createElement("video");
    this.video.muted = true;
    this.video.playsInline = true;
    Object.assign(this.video.style, {
      position: "fixed", left: "0", bottom: "0", width: "2px", height: "2px", opacity: "0", pointerEvents: "none",
    });
    document.body.appendChild(this.video);

    this.worker = new Worker(new URL("./merppg.worker.ts", import.meta.url), { type: "module" });
    this.worker.onmessage = (ev: MessageEvent<MeOut>) => this.onWorker(ev.data);
    this.post({ type: "init", origin: location.origin });
  }

  async init(): Promise<void> {
    this.emit();
    try {
      await this.sensor.init();
      this.sensorReady = true;
      this.status.face = `ready · ${this.sensor.delegate}`;
    } catch (e) {
      this.status.face = `error: ${e}`;
    }
    this.emit();
  }

  get ready(): boolean {
    return this.sensorReady;
  }

  // ── Views ──────────────────────────────────────────────────────────────

  attachView(canvas: HTMLCanvasElement): () => void {
    this.views.add(canvas);
    if (this.lastFrame) this.drawViews(this.lastFrame);
    return () => this.views.delete(canvas);
  }

  private drawViews(f: FaceFrame) {
    const vw = this.video.videoWidth, vh = this.video.videoHeight;
    if (!vw || !vh) return;
    for (const canvas of this.views) {
      if (canvas.width !== vw || canvas.height !== vh) {
        canvas.width = vw;
        canvas.height = vh;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      ctx.drawImage(this.video, 0, 0, vw, vh);
      if (!f.face) continue;
      const sx = vw / this.sensor.work.width, sy = vh / this.sensor.work.height;
      ctx.lineWidth = Math.max(2, vw / 320);
      ctx.strokeStyle = "rgba(80, 220, 140, 0.95)";
      ctx.fillStyle = "rgba(80, 220, 140, 0.18)";
      for (const hull of f.hulls) {
        ctx.beginPath();
        hull.forEach((p, i) => (i ? ctx.lineTo(p.x * sx, p.y * sy) : ctx.moveTo(p.x * sx, p.y * sy)));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      if (f.box) {
        ctx.strokeStyle = "rgba(140, 170, 255, 0.85)";
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(f.box.x, f.box.y, f.box.w, f.box.h);
        ctx.setLineDash([]);
      }
    }
  }

  // ── Sources ────────────────────────────────────────────────────────────

  async startCamera(): Promise<void> {
    this.stop();
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 }, facingMode: "user" },
        audio: false,
      });
      this.cameraLock = await this.lockCamera(this.stream.getVideoTracks()[0]);
      this.video.srcObject = this.stream;
      await this.video.play();
      this.source = "camera";
      this.begin();
    } catch (e) {
      this.error = `Camera: ${(e as Error).message ?? e}`;
      this.stop();
    }
  }

  private async lockCamera(track: MediaStreamTrack): Promise<string> {
    if (!this.settings.lockCamera) return "auto";
    const caps = (track.getCapabilities?.() ?? {}) as Record<string, unknown>;
    const locked: string[] = [];
    for (const key of ["exposureMode", "whiteBalanceMode"]) {
      const modes = caps[key];
      if (!Array.isArray(modes) || !modes.includes("manual")) continue;
      try {
        await track.applyConstraints({ advanced: [{ [key]: "manual" } as MediaTrackConstraintSet] });
        locked.push(key === "exposureMode" ? "exposure" : "white balance");
      } catch {
        /* camera refused; leave it on auto */
      }
    }
    return locked.length ? `locked ${locked.join(" + ")}` : "camera won't lock (auto)";
  }

  /** Steps a video file (or same-origin URL) frame by frame: repeatable, no drops, works in a background tab. */
  async startFile(file: File | string, fps = 30): Promise<void> {
    this.stop();
    this.video.srcObject = null;
    this.video.src = typeof file === "string" ? file : URL.createObjectURL(file);
    try {
      await new Promise((resolve, reject) => {
        this.video.onloadeddata = resolve;
        this.video.onerror = () => reject(new Error(this.video.error?.message ?? "cannot decode"));
      });
    } catch (e) {
      this.error = `Video: ${(e as Error).message}`;
      this.stop();
      return;
    }
    this.source = "file";
    this.cameraLock = "n/a";
    this.begin();
    void this.runFile(fps);
  }

  private async runFile(fps: number) {
    const run = ++this.fileRun;
    let nextTick = 1;
    for (let i = 0; ; i++) {
      const t = i / fps;
      if (t > this.video.duration || this.source !== "file" || run !== this.fileRun) break;
      await new Promise((resolve) => {
        this.video.addEventListener("seeked", resolve, { once: true });
        this.video.currentTime = t + 0.5 / fps; // land mid-frame
      });
      await this.processFrame(t, true);
      this.fileProgress = `${t.toFixed(1)} / ${this.video.duration.toFixed(1)} s`;
      if (t >= nextTick) {
        this.tick(true);
        nextTick += 1;
      }
    }
    if (run === this.fileRun) {
      this.fileProgress += " · done";
      this.tick(true);
    }
  }

  private begin() {
    if (!this.sensorReady) {
      this.error = "Face tracking is still loading. Try again in a moment.";
      this.stop();
      return;
    }
    this.error = null;
    this.analyzer.clear();
    this.sensor.reset();
    this.post({ type: "reset" });
    this.meWarmup = 30;
    this.meDropped = 0;
    this.lastT = null;
    this.history = [];
    this.latest = null;
    if (this.source === "camera") {
      this.video.requestVideoFrameCallback(this.onFrame);
      this.ticker = setInterval(() => this.tick(), 1000);
    }
    this.emit();
  }

  stop(): void {
    this.fileRun++;
    if (this.ticker) clearInterval(this.ticker);
    this.ticker = null;
    if (this.recording) void this.toggleRecording(false);
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.video.pause();
    if (this.video.src.startsWith("blob:")) URL.revokeObjectURL(this.video.src);
    this.video.removeAttribute("src");
    this.video.srcObject = null;
    this.source = "idle";
    for (const c of this.views) c.getContext("2d")?.clearRect(0, 0, c.width, c.height);
    this.emit();
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();
    this.strap?.disconnect();
    this.worker.terminate();
    this.sensor.close();
    this.video.remove();
    this.views.clear();
  }

  // ── Per frame ──────────────────────────────────────────────────────────

  private onFrame = (now: number, meta: VideoFrameCallbackMetadata) => {
    if (this.source !== "camera") return;
    // Camera frames are timed by capture, on the same clock as the strap.
    const ct = meta.captureTime;
    const t = (ct !== undefined && Math.abs(ct - now) < 1000 ? ct : now) / 1000;
    if (this.lastT === null || t > this.lastT) void this.processFrame(t, false);
    this.video.requestVideoFrameCallback(this.onFrame);
  };

  /** Measures the current frame; with `wait`, resolves once ME-rPPG has consumed it. */
  private processFrame(t: number, wait: boolean): Promise<void> {
    this.lastT = t;
    let posted = false;
    const f = this.sensor.measure(this.video, t, (crop) => {
      if (!this.meReady) return;
      if (this.meInflight >= 4) return void this.meDropped++;
      this.meInflight++;
      posted = true;
      this.post({ type: "frame", input: crop, t, lambda: this.settings.lambda }, [crop.buffer]);
    });
    this.analyzer.pushFrame(f);
    this.recording?.frame(f);
    this.lastFrame = f;
    this.drawViews(f);
    return wait && posted ? new Promise((resolve) => (this.meWaiter = resolve)) : Promise.resolve();
  }

  private post(msg: MeIn, transfer: Transferable[] = []) {
    this.worker.postMessage(msg, transfer);
  }

  private onWorker(m: MeOut) {
    if (m.type === "ready") {
      this.meReady = true;
      this.status.me = `ready · ${m.threads} thread${m.threads > 1 ? "s" : ""}`;
      this.emit();
    } else if (m.type === "error") {
      this.status.me = `error: ${m.message}`;
      console.error("ME-rPPG", m.message);
      this.emit();
    } else {
      this.meInflight--;
      this.meWaiter?.();
      this.meWaiter = null;
      if (this.meWarmup > 0) return void this.meWarmup--;
      this.analyzer.pushMe({ t: m.t, v: m.v, ms: m.ms });
      this.recording?.me.push({ t: m.t, v: m.v });
    }
  }

  // ── Once a second ──────────────────────────────────────────────────────

  private options(): AnalysisOptions {
    return {
      hrWindowSec: this.settings.hrWindowSec,
      hrvWindowSec: this.settings.hrvWindowSec,
      respWindowSec: 30,
      rois: this.settings.rois.length ? this.settings.rois : ["forehead"],
    };
  }

  private tick(force = false) {
    if (this.lastT === null || (this.source !== "camera" && !force)) return;
    const a = this.analyzer.analyze(this.lastT, this.options());
    this.latest = a;
    const entry: HistoryPoint = { t: a.t, methods: {}, truth: a.truth?.bpm ?? null };
    for (const m of METHODS) {
      const hr = a.methods[m].hr;
      if (hr) entry.methods[m] = hr.perMin;
      if (hr && a.truth && a.quality.facePresent >= 0.8) this.errors[m].push(Math.abs(hr.perMin - a.truth.bpm));
    }
    this.history.push(entry);
    while (this.history.length && this.history[0].t < a.t - 120) this.history.shift();
    this.recording?.tick(a);

    const signals = biometricSignals(a, this.settings.primary);
    const indicators = indicatorFragment(a, this.settings.primary, this.baseline);
    this.recording?.signals.push({ t: a.t, biometric_signals: signals, indicators });
    // A camera reading is stamped when its window ended. A file's times are its
    // own, so its readings are stamped now and marked, for testing the pipeline
    // with a known clip (?bio_src=).
    const event = biometricEvent(a, this.settings.primary, this.baseline);
    if (this.source === "camera") this.onReading(event, performance.timeOrigin + a.t * 1000);
    else this.onReading({ ...event, from: "file" }, performance.timeOrigin + performance.now());
    this.emit();
  }

  // ── Controls ───────────────────────────────────────────────────────────

  updateSettings(patch: Partial<EngineSettings>): void {
    this.settings = { ...this.settings, ...patch };
    this.emit();
  }

  setBaseline(): Baseline | null {
    if (this.lastT === null) return null;
    const a = this.analyzer.analyze(this.lastT, this.options());
    const m = pickMethod(a, this.settings.primary);
    if (!m) {
      this.error = "No heart rate yet. Wait for the first estimates.";
      this.emit();
      return null;
    }
    const recent = this.history
      .filter((h) => h.t >= this.lastT! - 60)
      .map((h) => h.methods[m])
      .filter((v): v is number => v !== undefined);
    this.baseline = { hr: median(recent), rmssd: a.methods[m].hrv?.rmssdMs ?? null, at: this.lastT };
    this.error = null;
    this.emit();
    return this.baseline;
  }

  resetErrors(): void {
    for (const m of METHODS) this.errors[m] = [];
    this.emit();
  }

  async toggleRecording(includeVideo: boolean): Promise<void> {
    if (this.recording) {
      const r = this.recording;
      this.recording = null;
      this.emit();
      await r.stop();
      return;
    }
    const settings = this.stream?.getVideoTracks()[0]?.getSettings();
    this.recording = new Recording(
      {
        mode: this.source, userAgent: navigator.userAgent, camera: settings ?? null,
        camera_lock: this.cameraLock, options: this.options(), strap: this.strap?.name ?? null,
      },
      includeVideo && this.source === "camera" ? this.stream : null,
    );
    this.emit();
  }

  async toggleStrap(): Promise<void> {
    if (this.strap) {
      this.strap.disconnect();
      return;
    }
    const strap = new HeartRateStrap(
      (s: StrapSample) => {
        this.analyzer.pushStrap(s);
        this.recording?.strap.push(s);
        this.strapState = { ...this.strapState, state: "on", bpm: s.bpm, hasRr: s.rrSec.length > 0, message: "" };
      },
      () => {
        this.strap = null;
        this.strapState = { ...this.strapState, state: "off", bpm: null, hasRr: false, message: "Disconnected" };
        this.emit();
      },
    );
    this.strap = strap;
    this.strapState = { ...this.strapState, state: "pairing", message: "Pairing…" };
    this.emit();
    try {
      await strap.connect();
      this.strapState = { ...this.strapState, state: "on", name: strap.name, message: "Waiting for data" };
    } catch (e) {
      this.strap = null;
      this.strapState = { ...this.strapState, state: "off", message: String((e as Error).message ?? e) };
    }
    this.emit();
  }

  // ── Snapshot ───────────────────────────────────────────────────────────

  private emit() {
    if (this.disposed) return;
    const a = this.latest;
    const errors = {} as Record<MethodName, ErrorStat>;
    for (const m of METHODS) {
      const e = this.errors[m];
      errors[m] = {
        n: e.length,
        mae: e.length ? e.reduce((s, v) => s + v, 0) / e.length : null,
        within5: e.length ? (100 * e.filter((v) => v <= 5).length) / e.length : null,
      };
    }
    this.onSnapshot({
      status: { ...this.status },
      source: this.source,
      error: this.error,
      analysis: a,
      signals: a ? biometricSignals(a, this.settings.primary) : null,
      indicators: a ? indicatorFragment(a, this.settings.primary, this.baseline) : null,
      primaryMethod: a ? pickMethod(a, this.settings.primary) : null,
      history: [...this.history],
      errors,
      meDropped: this.meDropped,
      roiPixels: this.lastFrame ? Object.values(this.lastFrame.rois).reduce((s, r) => s + (r?.px ?? 0), 0) : null,
      cameraLock: this.cameraLock,
      fileProgress: this.fileProgress,
      strap: { ...this.strapState },
      recording: !!this.recording,
      baseline: this.baseline,
      settings: { ...this.settings, rois: [...this.settings.rois] },
    });
  }
}
