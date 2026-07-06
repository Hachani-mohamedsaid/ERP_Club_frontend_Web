import * as ort from "onnxruntime-web";
import type { JointAngles, PosePoint } from "./poseAnalysis";

export const YOLO_MODEL_LABEL = "YOLOv8s-Pose · Ultralytics ONNX MAX";

const MODEL_URL = "/models/yolov8s-pose.onnx";
const INPUT = 640;
const CONF_THRESH = 0.28;
const IOU_THRESH = 0.4;

/** COCO 17 keypoints */
export const YOLO_CONNECTIONS: [number, number][] = [
  [5, 6], [5, 7], [7, 9], [6, 8], [8, 10],
  [5, 11], [6, 12], [11, 12],
  [11, 13], [13, 15], [12, 14], [14, 16],
  [0, 1], [0, 2], [1, 3], [2, 4],
];

export type YoloPoseDetection = {
  timeSec: number;
  detected: boolean;
  confidence: number;
  landmarks: PosePoint[];
  angles: JointAngles;
  bbox: { x: number; y: number; w: number; h: number };
};

type Letterbox = {
  scale: number;
  padX: number;
  padY: number;
  origW: number;
  origH: number;
};

let sessionPromise: Promise<ort.InferenceSession> | null = null;

function configureOrt() {
  ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/";
}

async function getSession(): Promise<ort.InferenceSession> {
  if (!sessionPromise) {
    configureOrt();
    sessionPromise = ort.InferenceSession.create(MODEL_URL, {
      executionProviders: ["wasm"],
      graphOptimizationLevel: "all",
    });
  }
  return sessionPromise;
}

function letterbox(w: number, h: number): Letterbox {
  const scale = Math.min(INPUT / w, INPUT / h);
  const nw = w * scale;
  const nh = h * scale;
  return {
    scale,
    padX: (INPUT - nw) / 2,
    padY: (INPUT - nh) / 2,
    origW: w,
    origH: h,
  };
}

function preprocess(canvas: HTMLCanvasElement, lb: Letterbox): ort.Tensor {
  const off = document.createElement("canvas");
  off.width = INPUT;
  off.height = INPUT;
  const ctx = off.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, INPUT, INPUT);
  ctx.drawImage(
    canvas,
    0, 0, canvas.width, canvas.height,
    lb.padX, lb.padY, canvas.width * lb.scale, canvas.height * lb.scale,
  );
  const { data } = ctx.getImageData(0, 0, INPUT, INPUT);
  const float = new Float32Array(3 * INPUT * INPUT);
  for (let i = 0; i < INPUT * INPUT; i++) {
    const r = data[i * 4] / 255;
    const g = data[i * 4 + 1] / 255;
    const b = data[i * 4 + 2] / 255;
    float[i] = r;
    float[INPUT * INPUT + i] = g;
    float[2 * INPUT * INPUT + i] = b;
  }
  return new ort.Tensor("float32", float, [1, 3, INPUT, INPUT]);
}

function toNorm(x: number, y: number, lb: Letterbox): PosePoint {
  const ox = (x - lb.padX) / lb.scale;
  const oy = (y - lb.padY) / lb.scale;
  return {
    x: Math.max(0, Math.min(1, ox / lb.origW)),
    y: Math.max(0, Math.min(1, oy / lb.origH)),
    visibility: 1,
  };
}

function iou(a: { x: number; y: number; w: number; h: number }, b: typeof a) {
  const ax2 = a.x + a.w;
  const ay2 = a.y + a.h;
  const bx2 = b.x + b.w;
  const by2 = b.y + b.h;
  const ix = Math.max(0, Math.min(ax2, bx2) - Math.max(a.x, b.x));
  const iy = Math.max(0, Math.min(ay2, by2) - Math.max(a.y, b.y));
  const inter = ix * iy;
  const union = a.w * a.h + b.w * b.h - inter;
  return union > 0 ? inter / union : 0;
}

function nms(dets: YoloPoseDetection[]): YoloPoseDetection[] {
  const sorted = [...dets].sort((a, b) => b.confidence - a.confidence);
  const kept: YoloPoseDetection[] = [];
  for (const d of sorted) {
    if (kept.some((k) => iou(k.bbox, d.bbox) > IOU_THRESH)) continue;
    kept.push(d);
    if (kept.length >= 1) break;
  }
  return kept;
}

function angle3(a: PosePoint, b: PosePoint, c: PosePoint): number {
  const bax = a.x - b.x;
  const bay = a.y - b.y;
  const bcx = c.x - b.x;
  const bcy = c.y - b.y;
  const dot = bax * bcx + bay * bcy;
  const mag = Math.hypot(bax, bay) * Math.hypot(bcx, bcy);
  if (mag < 1e-6) return 0;
  return Math.round((Math.acos(Math.max(-1, Math.min(1, dot / mag))) * 180) / Math.PI);
}

function yoloAngles(lm: PosePoint[]): JointAngles {
  const g = (i: number) => lm[i];
  const lk = g(13);
  const rk = g(14);
  const lh = g(11);
  const rh = g(12);
  const la = g(15);
  const ra = g(16);
  const ls = g(5);
  const rs = g(6);
  const leftKnee = lh && lk && la ? angle3(lh, lk, la) : 0;
  const rightKnee = rh && rk && ra ? angle3(rh, rk, ra) : 0;
  const leftHip = ls && lh && lk ? angle3(ls, lh, lk) : 0;
  const rightHip = rs && rh && rk ? angle3(rs, rh, rk) : 0;
  const sym = leftKnee && rightKnee
    ? Math.round(100 - Math.min(40, Math.abs(leftKnee - rightKnee) * 1.2))
    : 80;
  return {
    leftKnee, rightKnee, leftHip, rightHip,
    leftAnkle: 0, rightAnkle: 0, trunkTilt: 0, symmetryIndex: sym,
  };
}

function parseOutput(
  tensor: ort.Tensor,
  lb: Letterbox,
  timeSec: number,
): YoloPoseDetection[] {
  const data = tensor.data as Float32Array;
  const anchors = tensor.dims[2] ?? 8400;
  const dets: YoloPoseDetection[] = [];

  for (let i = 0; i < anchors; i++) {
    const conf = data[4 * anchors + i];
    if (conf < CONF_THRESH) continue;

    const cx = data[0 * anchors + i];
    const cy = data[1 * anchors + i];
    const w = data[2 * anchors + i];
    const h = data[3 * anchors + i];

    const landmarks: PosePoint[] = [];
    for (let k = 0; k < 17; k++) {
      const kx = data[(5 + k * 3) * anchors + i];
      const ky = data[(5 + k * 3 + 1) * anchors + i];
      const kc = data[(5 + k * 3 + 2) * anchors + i];
      if (kc < 0.3) landmarks.push({ x: 0, y: 0, visibility: 0 });
      else landmarks.push({ ...toNorm(kx, ky, lb), visibility: kc });
    }

    const x1 = (cx - w / 2 - lb.padX) / lb.scale;
    const y1 = (cy - h / 2 - lb.padY) / lb.scale;

    dets.push({
      timeSec,
      detected: true,
      confidence: Math.round(conf * 100),
      landmarks,
      angles: yoloAngles(landmarks),
      bbox: {
        x: Math.max(0, x1 / lb.origW),
        y: Math.max(0, y1 / lb.origH),
        w: w / lb.scale / lb.origW,
        h: h / lb.scale / lb.origH,
      },
    });
  }

  return nms(dets);
}

async function detectOnCanvas(
  canvas: HTMLCanvasElement,
  timeSec: number,
): Promise<YoloPoseDetection | null> {
  const session = await getSession();
  const lb = letterbox(canvas.width, canvas.height);
  const input = preprocess(canvas, lb);
  const feeds: Record<string, ort.Tensor> = {};
  feeds[session.inputNames[0]] = input;
  const out = await session.run(feeds);
  const key = session.outputNames[0];
  const parsed = parseOutput(out[key], lb, timeSec);
  return parsed[0] ?? null;
}

function loadImage(base64: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = base64.startsWith("data:") ? base64 : `data:image/jpeg;base64,${base64}`;
  });
}

/** YOLOv8 pose sur frames extraites */
export async function analyzeYoloOnFrames(
  frames: { timeSec: number; base64: string }[],
  onProgress?: (pct: number) => void,
): Promise<YoloPoseDetection[]> {
  const results: YoloPoseDetection[] = [];
  for (let i = 0; i < frames.length; i++) {
    onProgress?.(Math.round(((i + 1) / frames.length) * 100));
    try {
      const img = await loadImage(frames[i].base64);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      const det = await detectOnCanvas(canvas, frames[i].timeSec);
      results.push(det ?? {
        timeSec: frames[i].timeSec,
        detected: false,
        confidence: 0,
        landmarks: [],
        angles: { leftKnee: 0, rightKnee: 0, leftHip: 0, rightHip: 0, leftAnkle: 0, rightAnkle: 0, trunkTilt: 0, symmetryIndex: 0 },
        bbox: { x: 0, y: 0, w: 0, h: 0 },
      });
    } catch {
      results.push({
        timeSec: frames[i].timeSec,
        detected: false,
        confidence: 0,
        landmarks: [],
        angles: { leftKnee: 0, rightKnee: 0, leftHip: 0, rightHip: 0, leftAnkle: 0, rightAnkle: 0, trunkTilt: 0, symmetryIndex: 0 },
        bbox: { x: 0, y: 0, w: 0, h: 0 },
      });
    }
  }
  return results;
}

export function nearestYoloPose(frames: YoloPoseDetection[], sec: number) {
  if (!frames.length) return null;
  return frames.reduce((best, f) =>
    Math.abs(f.timeSec - sec) < Math.abs(best.timeSec - sec) ? f : best,
  frames[0]);
}

export function drawYoloSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: PosePoint[],
  width: number,
  height: number,
) {
  const pt = (i: number) => {
    const p = landmarks[i];
    if (!p || (p.visibility != null && p.visibility < 0.3)) return null;
    return { x: p.x * width, y: p.y * height };
  };

  ctx.lineCap = "round";
  for (const [a, b] of YOLO_CONNECTIONS) {
    const A = pt(a);
    const B = pt(b);
    if (!A || !B) continue;
    const isLeg = a >= 11 || b >= 11;
    ctx.strokeStyle = isLeg ? "rgba(249,115,22,0.95)" : "rgba(251,191,36,0.8)";
    ctx.lineWidth = isLeg ? 3.5 : 2;
    ctx.shadowColor = "#F97316";
    ctx.shadowBlur = isLeg ? 10 : 4;
    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.lineTo(B.x, B.y);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;

  for (let i = 0; i < landmarks.length; i++) {
    const P = pt(i);
    if (!P) continue;
    ctx.beginPath();
    ctx.arc(P.x, P.y, i >= 11 ? 5 : 3, 0, Math.PI * 2);
    ctx.fillStyle = i >= 11 ? "#F97316" : "#FBBF24";
    ctx.fill();
  }
}

export async function preloadYoloModel(): Promise<boolean> {
  try {
    await getSession();
    return true;
  } catch {
    return false;
  }
}
