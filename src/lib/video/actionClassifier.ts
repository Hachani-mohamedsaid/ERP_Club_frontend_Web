import type { LegPhase, PoseFrameAnalysis } from "./poseAnalysis";

export type MlAction =
  | "Sprint"
  | "Dribble"
  | "Frappe"
  | "Passe"
  | "Course"
  | "Marche"
  | "Saut"
  | "Appui"
  | "Récupération";

const ACTION_NEXT: Record<MlAction, MlAction> = {
  Sprint: "Récupération",
  Dribble: "Passe",
  Frappe: "Récupération",
  Passe: "Course",
  Course: "Sprint",
  Marche: "Course",
  Saut: "Appui",
  Appui: "Sprint",
  Récupération: "Course",
};

/** Classifieur actions football — features biomécaniques (genoux, chevilles, vitesse) */
export function classifyActionFromPose(
  pose: PoseFrameAnalysis,
  prev: PoseFrameAnalysis | null,
  speedKmh = 12,
): { action: MlAction; confidence: number; actionNext: string } {
  const { angles, leftLegPhase, rightLegPhase, footStrike, ballContact } = pose;
  const lk = angles.leftKnee;
  const rk = angles.rightKnee;
  const avgKnee = (lk + rk) / 2;
  const kneeAsym = Math.abs(lk - rk);

  let ankleVel = 0;
  if (prev?.landmarks[27] && prev.landmarks[28] && pose.landmarks[27] && pose.landmarks[28]) {
    const dl = Math.hypot(
      pose.landmarks[27].x - prev.landmarks[27].x,
      pose.landmarks[27].y - prev.landmarks[27].y,
    );
    const dr = Math.hypot(
      pose.landmarks[28].x - prev.landmarks[28].x,
      pose.landmarks[28].y - prev.landmarks[28].y,
    );
    ankleVel = (dl + dr) * 500;
  }

  const scores: Record<MlAction, number> = {
    Sprint: 0,
    Dribble: 0,
    Frappe: 0,
    Passe: 0,
    Course: 0,
    Marche: 0,
    Saut: 0,
    Appui: 0,
    Récupération: 0,
  };

  if (speedKmh >= 26) scores.Sprint += 35;
  else if (speedKmh >= 18) scores.Course += 28;
  else if (speedKmh >= 10) scores.Marche += 20;
  else scores.Récupération += 25;

  if (avgKnee < 115) scores.Sprint += 20;
  if (leftLegPhase === "drive" || rightLegPhase === "drive") scores.Sprint += 18;
  if (leftLegPhase === "swing" && rightLegPhase === "stance") scores.Dribble += 22;
  if (rightLegPhase === "swing" && leftLegPhase === "stance") scores.Dribble += 22;

  if (ballContact) {
    scores.Dribble += 30;
    scores.Passe += 18;
    scores.Frappe += 15;
  }

  if (ankleVel > 8 && avgKnee < 130) scores.Dribble += 15;
  if (angles.trunkTilt > 15 && avgKnee < 125) scores.Frappe += 25;
  if (footStrike !== "airborne" && ankleVel < 3) scores.Appui += 22;
  if (leftLegPhase === "recovery" || rightLegPhase === "recovery") scores.Récupération += 18;
  if (kneeAsym > 25 && speedKmh > 15) scores.Sprint += 12;
  if (pose.centerOfMassY < 0.42 && avgKnee < 110) scores.Saut += 28;

  const ranked = (Object.entries(scores) as [MlAction, number][]).sort((a, b) => b[1] - a[1]);
  const [action, top] = ranked[0];
  const second = ranked[1][1];
  const confidence = Math.min(96, Math.round(55 + (top - second) * 2.5 + (pose.detected ? 12 : 0)));

  return {
    action,
    confidence,
    actionNext: ACTION_NEXT[action] ?? "Course",
  };
}

export function classifyActionSequence(poses: PoseFrameAnalysis[], speedTimeline: { timeSec: number; speedKmh: number }[]) {
  return poses.map((p, i) => {
    const speed = speedTimeline.find((s) => Math.abs(s.timeSec - p.timeSec) < 0.5)?.speedKmh ?? 14;
    const c = classifyActionFromPose(p, poses[i - 1] ?? null, speed);
    return { timeSec: p.timeSec, ...c };
  });
}
