// Where the biometrics engine loads its models and runtimes from.
//
// ME-rPPG's weights are served from this site (public/labs/ai_guide/biometrics,
// see the NOTICE there). The MediaPipe models and the two WebAssembly runtimes
// come from their publishers' CDNs, pinned to the npm versions in package.json,
// so the repo doesn't carry ~45 MB of wasm.

const MEDIAPIPE_VERSION = "0.10.35"; // keep in step with @mediapipe/tasks-vision
const ORT_VERSION = "1.29.0"; // keep in step with onnxruntime-web

export const ASSETS = {
  mediapipeWasm: `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`,
  faceLandmarker:
    "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
  faceDetector:
    "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
  ortWasm: `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ORT_VERSION}/dist/ort-wasm-simd-threaded.wasm`,
  meModel: "/labs/ai_guide/biometrics/me-rppg/model.onnx",
  meState: "/labs/ai_guide/biometrics/me-rppg/state.json",
  meStateBin: "/labs/ai_guide/biometrics/me-rppg/state.bin",
};
