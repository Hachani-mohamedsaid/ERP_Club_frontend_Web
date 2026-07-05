import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";

export type PosePoint = { x: number; y: number; z?: number; visibility?: number };

export type JointAngles = {
  leftKnee: number;
  rightKnee: number;
  leftHip: number;
  rightHip: number;
  leftAnkle: number;
  rightAnkle: number;
  trunkTilt: number;
  symmetryIndex: number;
};

export type LegPhase = "stance" | "swing" | "drive" | "contact" | "recovery";

export type PoseFrameAnalysis = {
  timeSec: number;
  detected: boolean;
  landmarks: PosePoint[];
  angles: JointAngles;
  leftLegPhase: LegPhase;
  rightLegPhase: LegPhase;
  strideWidthCm: number;
  centerOfMassY: number;
  footStrike: "left" | "right" | "bilateral" | "airborne";
  ballContact: boolean;
  powerIndex: number;
  notes: string[];
};

export const POSE_CONNECTIONS: [number, number][] = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24],
  [23, 25], [25, 27], [27, 29], [29, 31],
  [24, 26], [26, 28], [28, 30], [30, 32],
  [0, 11], [0, 12],
];

export const POSE_MODEL_LABEL = "BlazePose Heavy · Deep Learning MAX (Google MediaPipe)";

const WASM =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.17/wasm";
const MODEL_HEAVY =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task";

const POSE_OPTS = {
  numPoses: 2 as const,
  minPoseDetectionConfidence: 0.35,
  minPosePresenceConfidence: 0.35,
  minTrackingConfidence: 0.35,
};

let imageLandmarkerPromise: Promise<PoseLandmarker> | null = null;
let videoLandmarkerPromise: Promise<PoseLandmarker> | null = null;

async function getImageLandmarker(): Promise<PoseLandmarker> {
  if (!imageLandmarkerPromise) {
    imageLandmarkerPromise = (async () => {
      const vision = await FilesetResolver.forVisionTasks(WASM);
      return PoseLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_HEAVY, delegate: "GPU" },
        runningMode: "IMAGE",
        ...POSE_OPTS,
      });
    })();
  }
  return imageLandmarkerPromise;
}

async function getVideoLandmarker(): Promise<PoseLandmarker> {
  if (!videoLandmarkerPromise) {
    videoLandmarkerPromise = (async () => {
      const vision = await FilesetResolver.forVisionTasks(WASM);
      return PoseLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_HEAVY, delegate: "GPU" },
        runningMode: "VIDEO",
        ...POSE_OPTS,
      });
    })();
  }
  return videoLandmarkerPromise;
}

function pt(landmarks: PosePoint[], i: number): PosePoint | null {
  const p = landmarks[i];
  if (!p || (p.visibility != null && p.visibility < 0.3)) return null;
  return p;
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

export function computeAngles(lm: PosePoint[]): JointAngles {
  const ls = pt(lm, 11);
  const rs = pt(lm, 12);
  const lh = pt(lm, 23);
  const rh = pt(lm, 24);
  const lk = pt(lm, 25);
  const rk = pt(lm, 26);
  const la = pt(lm, 27);
  const ra = pt(lm, 28);
  const lf = pt(lm, 31);
  const rf = pt(lm, 32);

  const leftKnee = lh && lk && la ? angle3(lh, lk, la) : 0;
  const rightKnee = rh && rk && ra ? angle3(rh, rk, ra) : 0;
  const leftHip = ls && lh && lk ? angle3(ls, lh, lk) : 0;
  const rightHip = rs && rh && rk ? angle3(rs, rh, rk) : 0;
  const leftAnkle = lk && la && lf ? angle3(lk, la, lf) : 0;
  const rightAnkle = rk && ra && rf ? angle3(rk, ra, rf) : 0;

  let trunkTilt = 0;
  if (ls && rs && lh && rh) {
    const shoulderMid = { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2 };
    const hipMid = { x: (lh.x + rh.x) / 2, y: (lh.y + rh.y) / 2 };
    trunkTilt = Math.round(Math.atan2(shoulderMid.x - hipMid.x, hipMid.y - shoulderMid.y) * 180 / Math.PI);
  }

  const sym = leftKnee && rightKnee
    ? Math.round(100 - Math.min(40, Math.abs(leftKnee - rightKnee) * 1.2))
    : 80;

  return { leftKnee, rightKnee, leftHip, rightHip, leftAnkle, rightAnkle, trunkTilt, symmetryIndex: sym };
}

function detectLegPhase(knee: number, ankleY: number, prevAnkleY: number | null): LegPhase {
  const dy = prevAnkleY != null ? ankleY - prevAnkleY : 0;
  if (knee < 115 && dy > 0.002) return "drive";
  if (knee < 130) return "stance";
  if (knee > 155 && dy < -0.002) return "swing";
  if (knee > 140) return "recovery";
  return "contact";
}

function inferBallContact(landmarks: PosePoint[], angles: JointAngles): boolean {
  const lw = pt(landmarks, 15);
  const rw = pt(landmarks, 16);
  const la = pt(landmarks, 27);
  const ra = pt(landmarks, 28);
  const lf = pt(landmarks, 31);
  const rf = pt(landmarks, 32);
  const nearFoot = (w: PosePoint, f: PosePoint) =>
    Math.hypot(w.x - f.x, w.y - f.y) < 0.12;
  if (lw && la && nearFoot(lw, la)) return true;
  if (lw && lf && nearFoot(lw, lf)) return true;
  if (rw && ra && nearFoot(rw, ra)) return true;
  if (rw && rf && nearFoot(rw, rf)) return true;
  return angles.leftKnee < 125 && angles.rightKnee < 125 && angles.trunkTilt > 8;
}

export function landmarksToAnalysis(
  timeSec: number,
  landmarks: PosePoint[],
  prev: PoseFrameAnalysis | null,
): PoseFrameAnalysis {
  const angles = computeAngles(landmarks);
  const la = pt(landmarks, 27);
  const ra = pt(landmarks, 28);
  const lh = pt(landmarks, 23);
  const rh = pt(landmarks, 24);

  const leftLegPhase = detectLegPhase(angles.leftKnee, la?.y ?? 0, prev?.landmarks[27]?.y ?? null);
  const rightLegPhase = detectLegPhase(angles.rightKnee, ra?.y ?? 0, prev?.landmarks[28]?.y ?? null);

  const strideWidthCm = lh && rh ? Math.round(Math.abs(lh.x - rh.x) * 120) : 0;
  const comY = lh && rh ? (lh.y + rh.y) / 2 : 0.5;
  const ballContact = inferBallContact(landmarks, angles);

  let footStrike: PoseFrameAnalysis["footStrike"] = "airborne";
  if (leftLegPhase === "stance" && rightLegPhase !== "stance") footStrike = "left";
  else if (rightLegPhase === "stance" && leftLegPhase !== "stance") footStrike = "right";
  else if (leftLegPhase === "stance" && rightLegPhase === "stance") footStrike = "bilateral";

  const powerIndex = Math.min(
    99,
    Math.round(
      (180 - angles.leftKnee) * 0.15
      + (180 - angles.rightKnee) * 0.15
      + angles.symmetryIndex * 0.4
      + (footStrike !== "airborne" ? 12 : 0)
      + (ballContact ? 8 : 0),
    ),
  );

  const notes: string[] = [];
  if (angles.leftKnee < 120) notes.push(`Genou G ${angles.leftKnee}° — ${leftLegPhase}`);
  if (angles.rightKnee < 120) notes.push(`Genou D ${angles.rightKnee}° — ${rightLegPhase}`);
  if (angles.leftAnkle > 0) notes.push(`Cheville G ${angles.leftAnkle}°`);
  if (angles.rightAnkle > 0) notes.push(`Cheville D ${angles.rightAnkle}°`);
  if (angles.symmetryIndex < 75) notes.push(`Asymétrie ${100 - angles.symmetryIndex}%`);
  if (ballContact) notes.push("Contact balle probable (DL)");
  if (footStrike !== "airborne") notes.push(`Appui ${footStrike}`);

  return {
    timeSec,
    detected: landmarks.length > 20,
    landmarks,
    angles,
    leftLegPhase,
    rightLegPhase,
    strideWidthCm,
    centerOfMassY: comY,
    footStrike,
    ballContact,
    powerIndex,
    notes,
  };
}

/** Détection temps réel sur frame vidéo — mode VIDEO (tracking DL) */
export async function detectPoseOnVideoFrame(
  video: HTMLVideoElement,
  timestampMs: number,
): Promise<PosePoint[] | null> {
  const landmarker = await getVideoLandmarker();
  const det = landmarker.detectForVideo(video, timestampMs);
  const raw = det.landmarks[0] ?? det.landmarks.find((l) => l.length > 20);
  if (!raw?.length) return null;
  return raw.map((p) => ({ x: p.x, y: p.y, z: p.z, visibility: p.visibility }));
}

function loadImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image pose indisponible"));
    img.src = dataUrl.startsWith("data:") ? dataUrl : `data:image/jpeg;base64,${dataUrl}`;
  });
}

function emptyPose(timeSec: number, note: string): PoseFrameAnalysis {
  return {
    timeSec,
    detected: false,
    landmarks: [],
    angles: { leftKnee: 0, rightKnee: 0, leftHip: 0, rightHip: 0, leftAnkle: 0, rightAnkle: 0, trunkTilt: 0, symmetryIndex: 0 },
    leftLegPhase: "stance",
    rightLegPhase: "stance",
    strideWidthCm: 0,
    centerOfMassY: 0.5,
    footStrike: "airborne",
    ballContact: false,
    powerIndex: 0,
    notes: [note],
  };
}

/** Analyse batch frames — BlazePose Full */
export async function analyzePoseOnFrames(
  frames: { timeSec: number; base64: string }[],
  onProgress?: (pct: number) => void,
): Promise<PoseFrameAnalysis[]> {
  const landmarker = await getImageLandmarker();
  const results: PoseFrameAnalysis[] = [];
  let prev: PoseFrameAnalysis | null = null;

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    onProgress?.(Math.round(((i + 1) / frames.length) * 100));

    try {
      const img = await loadImageFromDataUrl(frame.base64);
      const det = landmarker.detect(img);
      const raw = det.landmarks[0] ?? det.landmarks.find((l) => l.length > 20);
      if (raw?.length) {
        const landmarks: PosePoint[] = raw.map((p) => ({
          x: p.x, y: p.y, z: p.z, visibility: p.visibility,
        }));
        const analysis = landmarksToAnalysis(frame.timeSec, landmarks, prev);
        results.push(analysis);
        prev = analysis;
      } else {
        results.push(emptyPose(frame.timeSec, "Joueur non détecté"));
      }
    } catch {
      results.push(emptyPose(frame.timeSec, "Erreur détection pose"));
    }
  }

  return results;
}

export function nearestPoseFrame(frames: PoseFrameAnalysis[], currentSec: number) {
  if (!frames.length) return null;
  return frames.reduce((best, f) =>
    Math.abs(f.timeSec - currentSec) < Math.abs(best.timeSec - currentSec) ? f : best,
  frames[0]);
}

export type FootTrailPoint = { x: number; y: number; side: "L" | "R" };

export function collectFootTrail(
  history: PoseFrameAnalysis[],
  maxPoints = 24,
): FootTrailPoint[] {
  const trail: FootTrailPoint[] = [];
  for (const frame of history.slice(-maxPoints)) {
    const la = pt(frame.landmarks, 31) ?? pt(frame.landmarks, 27);
    const ra = pt(frame.landmarks, 32) ?? pt(frame.landmarks, 28);
    if (la) trail.push({ x: la.x, y: la.y, side: "L" });
    if (ra) trail.push({ x: ra.x, y: ra.y, side: "R" });
  }
  return trail;
}

export function drawFootTrails(
  ctx: CanvasRenderingContext2D,
  trail: FootTrailPoint[],
  width: number,
  height: number,
) {
  for (let i = 1; i < trail.length; i++) {
    const a = trail[i - 1];
    const b = trail[i];
    if (a.side !== b.side) continue;
    ctx.strokeStyle = a.side === "L" ? `rgba(34,197,94,${0.2 + (i / trail.length) * 0.6})` : `rgba(56,189,248,${0.2 + (i / trail.length) * 0.6})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(a.x * width, a.y * height);
    ctx.lineTo(b.x * width, b.y * height);
    ctx.stroke();
  }
}

export function drawPoseSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: PosePoint[],
  width: number,
  height: number,
  highlightLegs = true,
  footTrail: FootTrailPoint[] = [],
) {
  if (footTrail.length) drawFootTrails(ctx, footTrail, width, height);
  if (!landmarks.length) return;

  const toPx = (p: PosePoint) => ({ x: p.x * width, y: p.y * height });

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const [a, b] of POSE_CONNECTIONS) {
    const pa = pt(landmarks, a);
    const pb = pt(landmarks, b);
    if (!pa || !pb) continue;

    const isLeg = (a >= 23 && a <= 32) || (b >= 23 && b <= 32);
    ctx.strokeStyle = isLeg && highlightLegs ? "rgba(34,197,94,0.95)" : "rgba(99,102,241,0.85)";
    ctx.lineWidth = isLeg && highlightLegs ? 4 : 2.5;
    ctx.shadowColor = isLeg ? "#22C55E" : "#6366F1";
    ctx.shadowBlur = isLeg ? 14 : 6;

    const A = toPx(pa);
    const B = toPx(pb);
    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.lineTo(B.x, B.y);
    ctx.stroke();
  }

  ctx.shadowBlur = 0;
  const legJoints = [23, 24, 25, 26, 27, 28, 31, 32];
  for (const i of legJoints) {
    const p = pt(landmarks, i);
    if (!p) continue;
    const { x, y } = toPx(p);
    ctx.beginPath();
    ctx.arc(x, y, i >= 27 ? 7 : 5, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 1 ? "#22C55E" : "#38BDF8";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  for (let i = 0; i < landmarks.length; i++) {
    if (legJoints.includes(i)) continue;
    const p = pt(landmarks, i);
    if (!p) continue;
    const { x, y } = toPx(p);
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(147,197,253,0.9)";
    ctx.fill();
  }
}

export function summarizePoseSession(frames: PoseFrameAnalysis[]) {
  const detected = frames.filter((f) => f.detected);
  if (!detected.length) {
    return {
      detectionRate: 0,
      avgLeftKnee: 0,
      avgRightKnee: 0,
      avgSymmetry: 0,
      avgPowerIndex: 0,
      dominantFoot: "—" as const,
      legInsights: [] as string[],
      model: POSE_MODEL_LABEL,
    };
  }

  const avg = (fn: (f: PoseFrameAnalysis) => number) =>
    Math.round(detected.reduce((s, f) => s + fn(f), 0) / detected.length);

  const leftStance = detected.filter((f) => f.footStrike === "left").length;
  const rightStance = detected.filter((f) => f.footStrike === "right").length;
  const dominantFoot = leftStance > rightStance ? "Gauche" : rightStance > leftStance ? "Droit" : "Équilibré";

  const legInsights = [
    `[${POSE_MODEL_LABEL}]`,
    `Genou G moy: ${avg((f) => f.angles.leftKnee)}° — D: ${avg((f) => f.angles.rightKnee)}°`,
    `Cheville G: ${avg((f) => f.angles.leftAnkle)}° — D: ${avg((f) => f.angles.rightAnkle)}°`,
    `Symétrie: ${avg((f) => f.angles.symmetryIndex)}% · Puissance: ${avg((f) => f.powerIndex)}/100`,
    `Appui dominant: pied ${dominantFoot}`,
    `Contacts balle DL: ${detected.filter((f) => f.ballContact).length}/${detected.length} frames`,
  ];

  return {
    detectionRate: Math.round((detected.length / frames.length) * 100),
    avgLeftKnee: avg((f) => f.angles.leftKnee),
    avgRightKnee: avg((f) => f.angles.rightKnee),
    avgSymmetry: avg((f) => f.angles.symmetryIndex),
    avgPowerIndex: avg((f) => f.powerIndex),
    dominantFoot,
    legInsights,
    model: POSE_MODEL_LABEL,
  };
}
