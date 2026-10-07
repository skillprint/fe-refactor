// Per-frame face measurement: MediaPipe Face Landmarker for skin ROIs,
// motion, blinks and expression; BlazeFace for the ME-rPPG crop (the model
// was trained on BlazeFace boxes, so we keep that preprocessing).

import { FaceDetector, FaceLandmarker, FilesetResolver, type NormalizedLandmark } from "@mediapipe/tasks-vision";
import { ASSETS } from "./assets";

export type RoiName = "forehead" | "leftCheek" | "rightCheek";
export const ROI_NAMES: RoiName[] = ["forehead", "leftCheek", "rightCheek"];

// Face-mesh landmark sets per region (from pyVHR); we fill their convex hull.
const ROI_LANDMARKS: Record<RoiName, number[]> = {
  forehead: [10, 338, 297, 299, 296, 336, 9, 107, 66, 69, 67, 109],
  leftCheek: [118, 119, 100, 126, 209, 49, 129, 203, 205, 50],
  rightCheek: [347, 348, 329, 355, 429, 279, 358, 423, 425, 280],
};
const STABLE_POINTS = [1, 4, 33, 133, 263, 362, 152, 10]; // nose, eye corners, chin, brow
const AFFECT_KEYS = ["mouthSmileLeft", "mouthSmileRight", "browDownLeft", "browDownRight", "browInnerUp", "jawOpen", "eyeSquintLeft", "eyeSquintRight"] as const;

export interface RoiStat {
  r: number; g: number; b: number; // mean 0–255
  px: number; // pixels averaged
}

export interface FaceFrame {
  t: number;
  face: boolean;
  rois: Partial<Record<RoiName, RoiStat>>;
  /** Mean landmark displacement since the previous frame, in inter-ocular distances. */
  motion: number;
  /** ROI luminance 0–255. */
  luma: number;
  /** Nose tip height in inter-ocular distances, relative to the eyes (breathing moves it slightly). */
  noseY: number;
  blink: number; // 0–1 blendshape
  affect: Record<string, number>;
  hulls: { x: number; y: number }[][]; // for the overlay, in work-canvas pixels
  box: { x: number; y: number; w: number; h: number } | null; // ME-rPPG crop, video pixels
}

const WORK_WIDTH = 320;

class Kalman1D {
  private est: number;
  private err = 1;
  constructor(init: number, private q = 1e-2, private r = 0.5) { this.est = init; }
  update(z: number) {
    const p = this.err + this.q;
    const k = p / (p + this.r);
    this.est += k * (z - this.est);
    this.err = (1 - k) * p;
    return this.est;
  }
}

function convexHull(pts: { x: number; y: number }[]) {
  const p = [...pts].sort((a, b) => a.x - b.x || a.y - b.y);
  const cross = (o: typeof p[0], a: typeof p[0], b: typeof p[0]) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower: typeof p = [], upper: typeof p = [];
  for (const q of p) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop();
    lower.push(q);
  }
  for (const q of p.reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop();
    upper.push(q);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

export class FaceSensor {
  private landmarker!: FaceLandmarker;
  private detector!: FaceDetector;
  readonly work = document.createElement("canvas");
  private closed = false;
  private workCtx = this.work.getContext("2d", { willReadFrequently: true })!;
  private mask = document.createElement("canvas");
  private maskCtx = this.mask.getContext("2d", { willReadFrequently: true })!;
  private crop = document.createElement("canvas");
  private cropCtx = this.crop.getContext("2d", { willReadFrequently: true })!;
  private prev: NormalizedLandmark[] | null = null;
  private kf: Kalman1D[] | null = null;
  private lastTs = 0;
  delegate = "GPU";

  async init(): Promise<void> {
    const fileset = await FilesetResolver.forVisionTasks(ASSETS.mediapipeWasm);
    const make = async (delegate: "GPU" | "CPU") => {
      this.landmarker = await FaceLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: ASSETS.faceLandmarker, delegate },
        runningMode: "VIDEO",
        numFaces: 1,
        outputFaceBlendshapes: true,
      });
    };
    try {
      await make("GPU");
    } catch {
      this.delegate = "CPU";
      await make("CPU");
    }
    this.detector = await FaceDetector.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: ASSETS.faceDetector, delegate: "CPU" },
      runningMode: "VIDEO",
      minDetectionConfidence: 0.5,
    });
    this.crop.width = this.crop.height = 36;
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    this.landmarker?.close();
    this.detector?.close();
  }

  reset(): void {
    this.prev = null;
    this.kf = null;
  }

  /** Measures one frame. `meInput` receives the 36×36 crop when a face box is found. */
  measure(video: HTMLVideoElement, t: number, meInput: (crop: Float32Array) => void): FaceFrame {
    const vw = video.videoWidth, vh = video.videoHeight;
    const w = WORK_WIDTH, h = Math.round((WORK_WIDTH * vh) / vw);
    if (this.work.width !== w || this.work.height !== h) {
      this.work.width = this.mask.width = w;
      this.work.height = this.mask.height = h;
    }
    this.workCtx.drawImage(video, 0, 0, w, h);
    // MediaPipe wants strictly increasing timestamps per task.
    const ts = Math.max(this.lastTs + 1, performance.now());
    this.lastTs = ts;

    const res = this.landmarker.detectForVideo(video, ts);
    const lm = res.faceLandmarks?.[0];
    const frame: FaceFrame = { t, face: false, rois: {}, motion: NaN, luma: NaN, noseY: NaN, blink: NaN, affect: {}, hulls: [], box: null };
    if (!lm) {
      this.prev = null;
      return frame;
    }
    frame.face = true;

    const iod = Math.hypot((lm[33].x - lm[263].x) * vw, (lm[33].y - lm[263].y) * vh) || 1;
    if (this.prev) {
      let d = 0;
      for (const i of STABLE_POINTS) d += Math.hypot((lm[i].x - this.prev[i].x) * vw, (lm[i].y - this.prev[i].y) * vh);
      frame.motion = d / STABLE_POINTS.length / iod;
    }
    this.prev = lm;
    frame.noseY = (((lm[1].y - (lm[33].y + lm[263].y) / 2) * vh) / iod);

    // Skin ROIs: fill each hull on a mask, average the frame pixels under it.
    const img = this.workCtx.getImageData(0, 0, w, h).data;
    let lumaSum = 0, lumaN = 0;
    for (const name of ROI_NAMES) {
      const hull = convexHull(ROI_LANDMARKS[name].map((i) => ({ x: lm[i].x * w, y: lm[i].y * h })));
      frame.hulls.push(hull);
      this.maskCtx.clearRect(0, 0, w, h);
      this.maskCtx.beginPath();
      hull.forEach((p, i) => (i ? this.maskCtx.lineTo(p.x, p.y) : this.maskCtx.moveTo(p.x, p.y)));
      this.maskCtx.closePath();
      this.maskCtx.fill();
      const xs = hull.map((p) => p.x), ys = hull.map((p) => p.y);
      const x0 = Math.max(0, Math.floor(Math.min(...xs))), x1 = Math.min(w - 1, Math.ceil(Math.max(...xs)));
      const y0 = Math.max(0, Math.floor(Math.min(...ys))), y1 = Math.min(h - 1, Math.ceil(Math.max(...ys)));
      if (x1 <= x0 || y1 <= y0) continue;
      const m = this.maskCtx.getImageData(x0, y0, x1 - x0 + 1, y1 - y0 + 1).data;
      let r = 0, g = 0, b = 0, n = 0;
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          if (m[((y - y0) * (x1 - x0 + 1) + (x - x0)) * 4 + 3] < 128) continue;
          const k = (y * w + x) * 4;
          const pr = img[k], pg = img[k + 1], pb = img[k + 2];
          if (pr < 10 || pr > 250 || pg > 250 || pb > 250) continue; // clipped
          r += pr; g += pg; b += pb; n++;
        }
      }
      if (n >= 20) {
        frame.rois[name] = { r: r / n, g: g / n, b: b / n, px: n };
        lumaSum += (0.299 * r + 0.587 * g + 0.114 * b);
        lumaN += n;
      }
    }
    frame.luma = lumaN ? lumaSum / lumaN : NaN;

    const shapes = res.faceBlendshapes?.[0]?.categories ?? [];
    const score = (k: string) => shapes.find((c) => c.categoryName === k)?.score ?? NaN;
    frame.blink = (score("eyeBlinkLeft") + score("eyeBlinkRight")) / 2;
    for (const k of AFFECT_KEYS) frame.affect[k] = score(k);

    // ME-rPPG crop, preprocessed exactly like the authors' demo.
    const det = this.detector.detectForVideo(video, ts).detections[0]?.boundingBox;
    if (det) {
      const raw = [det.originX, det.originY, det.width, det.height];
      if (!this.kf) this.kf = raw.map((v) => new Kalman1D(v));
      const [x, y0, bw, bh0] = raw.map((v, i) => this.kf![i].update(v));
      const bh = bh0 * 1.2;
      const y = y0 - bh * 0.2;
      const cx = Math.max(0, x), cy = Math.max(0, y);
      const cw = Math.min(bw, vw - cx), ch = Math.min(bh, vh - cy);
      frame.box = { x: cx, y: cy, w: cw, h: ch };
      this.cropCtx.imageSmoothingEnabled = true;
      this.cropCtx.imageSmoothingQuality = "high";
      this.cropCtx.drawImage(video, cx, cy, cw, ch, 0, 0, 36, 36);
      const px = this.cropCtx.getImageData(0, 0, 36, 36).data;
      const input = new Float32Array(36 * 36 * 3);
      for (let i = 0; i < 36 * 36; i++) {
        input[i * 3] = px[i * 4] / 255;
        input[i * 3 + 1] = px[i * 4 + 1] / 255;
        input[i * 3 + 2] = px[i * 4 + 2] / 255;
      }
      meInput(input);
    }
    return frame;
  }
}
