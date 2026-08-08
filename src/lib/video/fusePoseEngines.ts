import type { PoseFrameAnalysis } from "./poseAnalysis";
import type { YoloPoseDetection } from "./yoloPoseAnalysis";

/** Fusionne BlazePose + YOLOv8 — meilleure détection par frame */
export function fusePoseFrame(
  mp: PoseFrameAnalysis | null | undefined,
  yolo: YoloPoseDetection | null | undefined,
): PoseFrameAnalysis | null {
  if (yolo?.detected && !mp?.detected) {
    return {
      timeSec: yolo.timeSec,
      detected: true,
      landmarks: yolo.landmarks,
      angles: yolo.angles,
      leftLegPhase: "stance",
      rightLegPhase: "stance",
      strideWidthCm: 0,
      centerOfMassY: 0.5,
      footStrike: "bilateral",
      ballContact: false,
      powerIndex: Math.min(99, yolo.confidence),
      notes: [`YOLOv8 détection ${yolo.confidence}%`],
    };
  }
  if (!mp?.detected) return mp ?? null;
  if (!yolo?.detected) return mp;

  const wMp = 0.55;
  const wYolo = 0.45;
  const avg = (a: number, b: number) => Math.round(a * wMp + b * wYolo);

  return {
    ...mp,
    angles: {
      leftKnee: avg(mp.angles.leftKnee, yolo.angles.leftKnee),
      rightKnee: avg(mp.angles.rightKnee, yolo.angles.rightKnee),
      leftHip: avg(mp.angles.leftHip, yolo.angles.leftHip),
      rightHip: avg(mp.angles.rightHip, yolo.angles.rightHip),
      leftAnkle: mp.angles.leftAnkle,
      rightAnkle: mp.angles.rightAnkle,
      trunkTilt: mp.angles.trunkTilt,
      symmetryIndex: avg(mp.angles.symmetryIndex, yolo.angles.symmetryIndex),
    },
    powerIndex: Math.min(99, avg(mp.powerIndex, yolo.confidence)),
    notes: [...mp.notes, `Fusion YOLO ${yolo.confidence}%`],
  };
}

export function fusePoseTimeline(
  mpFrames: PoseFrameAnalysis[],
  yoloFrames: YoloPoseDetection[],
): PoseFrameAnalysis[] {
  return mpFrames.map((mp) => {
    const yolo = yoloFrames.find((y) => Math.abs(y.timeSec - mp.timeSec) < 0.35);
    return fusePoseFrame(mp, yolo) ?? mp;
  });
}
