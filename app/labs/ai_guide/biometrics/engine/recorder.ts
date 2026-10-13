// Records a lab session to a JSON file (per-frame ROI colours, ME-rPPG
// output, strap samples, per-second estimates) and, optionally, the raw
// camera video for offline evaluation (offline/evaluate.py).
// Everything stays in the browser until you save the files yourself.

import type { Analysis } from "./analysis";
import type { FaceFrame } from "./face";
import type { StrapSample } from "./ble-hr";

export class Recording {
  readonly startedAt = performance.now() / 1000;
  readonly frames: Omit<FaceFrame, "hulls" | "box">[] = [];
  readonly me: { t: number; v: number }[] = [];
  readonly strap: StrapSample[] = [];
  readonly ticks: unknown[] = [];
  readonly signals: unknown[] = [];
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  videoStartedAt: number | null = null;
  videoMime = "";

  constructor(private meta: Record<string, unknown>, stream: MediaStream | null) {
    if (!stream) return;
    const mime = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/mp4"].find((m) => MediaRecorder.isTypeSupported(m));
    if (!mime) return;
    this.videoMime = mime;
    // A high bitrate matters: lossy compression erases much of the sub-1 % colour change rPPG reads.
    this.recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 25_000_000 });
    this.recorder.ondataavailable = (e) => e.data.size && this.chunks.push(e.data);
    this.recorder.start(1000);
    this.videoStartedAt = performance.now() / 1000;
  }

  frame(f: FaceFrame): void {
    const { hulls: _h, box: _b, ...rest } = f;
    this.frames.push(rest);
  }

  tick(a: Analysis): void {
    const methods: Record<string, unknown> = {};
    for (const [m, r] of Object.entries(a.methods)) {
      methods[m] = r.hr ? { bpm: r.hr.perMin, snr_db: r.hr.snrDb, rmssd_ms: r.hrv?.rmssdMs ?? null } : null;
    }
    this.ticks.push({
      t: a.t,
      methods,
      truth: a.truth ? { bpm: a.truth.bpm, rmssd_ms: a.truth.hrv?.rmssdMs ?? null } : null,
      respiration_rpm: a.respiration?.perMin ?? null,
      blinks_per_min: a.blinksPerMin,
      quality: a.quality,
    });
  }

  async stop(): Promise<void> {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    if (this.recorder && this.recorder.state !== "inactive") {
      await new Promise<void>((resolve) => {
        this.recorder!.onstop = () => resolve();
        this.recorder!.stop();
      });
      const ext = this.videoMime.startsWith("video/mp4") ? "mp4" : "webm";
      save(new Blob(this.chunks, { type: this.videoMime }), `rppg-${stamp}.${ext}`);
    }
    const body = {
      format: "rppg-lab/1",
      clock: "seconds on the page's performance.now() clock (file mode: video media time)",
      started_at: this.startedAt,
      video_started_at: this.videoStartedAt,
      meta: this.meta,
      frames: this.frames,
      me_rppg: this.me,
      strap: this.strap,
      ticks: this.ticks,
      biometric_signals: this.signals,
    };
    save(new Blob([JSON.stringify(body)], { type: "application/json" }), `rppg-${stamp}.json`);
  }
}

function save(blob: Blob, name: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
}
