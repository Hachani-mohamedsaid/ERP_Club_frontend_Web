import type { VideoAnalysisAiResult } from "../api/analyste/videoAnalysisTypes";
import type { ExtractedFrame } from "./extractFrames";
import { motionToSpeedKmh } from "./extractFrames";

export type DenseVideoPrediction = VideoAnalysisAiResult["videoPredictions"][number] & {
  accelerationMs2?: number;
  zone?: string;
  biomechanics?: string;
  postureScore?: number;
  cadenceSpm?: number;
  strideLengthCm?: number;
  ballContact?: boolean;
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function pickIntensity(speed: number): DenseVideoPrediction["intensity"] {
  if (speed >= 28) return "max";
  if (speed >= 22) return "high";
  if (speed >= 14) return "medium";
  return "low";
}

function nearestMovement(
  sortedMove: VideoAnalysisAiResult["movementFrames"],
  timeSec: number,
  step: number,
) {
  if (!sortedMove.length) return undefined;
  return (
    sortedMove.find((m) => Math.abs(m.timeSec - timeSec) < step * 0.6)
    ?? sortedMove.reduce((best, m) =>
      Math.abs(m.timeSec - timeSec) < Math.abs(best.timeSec - timeSec) ? m : best,
    sortedMove[0])
  );
}

/** Timeline dense (0.25s) — fusion motion client + prédictions IA */
export function buildDenseTimeline(
  durationSec: number,
  clientFrames: ExtractedFrame[],
  aiPredictions: VideoAnalysisAiResult["videoPredictions"],
  movementFrames: VideoAnalysisAiResult["movementFrames"] = [],
): DenseVideoPrediction[] {
  if (!aiPredictions.length) return [];

  const step = durationSec <= 6 ? 0.25 : durationSec <= 30 ? 0.5 : 1;
  const steps = Math.max(2, Math.ceil(durationSec / step));
  const sortedAi = [...aiPredictions].sort((a, b) => a.timeSec - b.timeSec);
  const sortedMove = [...movementFrames].sort((a, b) => a.timeSec - b.timeSec);
  const sortedClient = [...clientFrames].sort((a, b) => a.timeSec - b.timeSec);

  const out: DenseVideoPrediction[] = [];

  for (let i = 0; i <= steps; i++) {
    const timeSec = Math.round(i * step * 100) / 100;
    if (timeSec > durationSec) break;

    const nearestClient = sortedClient.length
      ? sortedClient.reduce((best, f) =>
          Math.abs(f.timeSec - timeSec) < Math.abs(best.timeSec - timeSec) ? f : best,
        sortedClient[0])
      : null;

    const clientSpeed = nearestClient ? motionToSpeedKmh(nearestClient.motionScore) : 12;
    const move = nearestMovement(sortedMove, timeSec, step);

    let prev = sortedAi[0];
    let next = sortedAi[sortedAi.length - 1];
    for (let j = 0; j < sortedAi.length - 1; j++) {
      if (sortedAi[j].timeSec <= timeSec && sortedAi[j + 1].timeSec >= timeSec) {
        prev = sortedAi[j];
        next = sortedAi[j + 1];
        break;
      }
    }
    if (timeSec <= sortedAi[0].timeSec) prev = next = sortedAi[0];
    if (timeSec >= sortedAi[sortedAi.length - 1].timeSec) prev = next = sortedAi[sortedAi.length - 1];

    const span = Math.max(next.timeSec - prev.timeSec, 0.001);
    const t = Math.min(1, Math.max(0, (timeSec - prev.timeSec) / span));

    const aiSpeed = lerp(prev.speedKmh, next.speedKmh, t);
    const speedKmh = Math.round(move?.speedKmh ?? lerp(clientSpeed, aiSpeed, 0.55));
    const prevOut = out[out.length - 1];

    out.push({
      timeSec,
      speedKmh,
      action: move?.action ?? (t < 0.5 ? prev.action : next.action),
      actionNext: move?.actionNext ?? next.actionNext,
      fatiguePct: Math.round(lerp(prev.fatiguePct, next.fatiguePct, t)),
      ppiLive: Math.round(lerp(prev.ppiLive, next.ppiLive, t)),
      injuryRiskPct: Math.round(lerp(prev.injuryRiskPct, next.injuryRiskPct, t)),
      intensity: pickIntensity(speedKmh),
      confidence: Math.round(lerp(prev.confidence, next.confidence, t)),
      accelerationMs2:
        move?.accelerationMs2
        ?? Math.round(((speedKmh - (prevOut?.speedKmh ?? speedKmh)) / step) * 10) / 10,
      zone: move?.zone,
      biomechanics: move?.biomechanics,
      postureScore: move?.postureScore,
      cadenceSpm: move?.cadenceSpm,
      strideLengthCm: move?.strideLengthCm,
      ballContact: move?.ballContact,
    });
  }

  return out;
}

export function interpolateDensePrediction(
  timeline: DenseVideoPrediction[],
  currentSec: number,
): DenseVideoPrediction | null {
  if (!timeline.length) return null;
  return timeline.reduce((best, p) =>
    Math.abs(p.timeSec - currentSec) < Math.abs(best.timeSec - currentSec) ? p : best,
  timeline[0]);
}
