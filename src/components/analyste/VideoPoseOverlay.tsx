import { useEffect, useRef } from "react";
import { drawPoseSkeleton, type FootTrailPoint, type PoseFrameAnalysis } from "../../lib/video/poseAnalysis";
import { drawYoloSkeleton, type YoloPoseDetection } from "../../lib/video/yoloPoseAnalysis";

type Props = {
  landmarks: PoseFrameAnalysis["landmarks"];
  width: number;
  height: number;
  show: boolean;
  footTrail?: FootTrailPoint[];
  yoloPose?: YoloPoseDetection | null;
  showYolo?: boolean;
};

export function VideoPoseOverlay({
  landmarks, width, height, show, footTrail = [], yoloPose, showYolo = true,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !show) return;
    if (!landmarks.length && !yoloPose?.detected) return;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    if (landmarks.length) drawPoseSkeleton(ctx, landmarks, width, height, true, footTrail);
    if (showYolo && yoloPose?.detected && yoloPose.landmarks.length) {
      drawYoloSkeleton(ctx, yoloPose.landmarks, width, height);
    }
  }, [landmarks, width, height, show, footTrail, yoloPose, showYolo]);

  if (!show || (!landmarks.length && !yoloPose?.detected)) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
