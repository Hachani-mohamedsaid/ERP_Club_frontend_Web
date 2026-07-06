import { useCallback, useEffect, useRef, useState } from "react";
import {
  detectPoseOnVideoFrame,
  landmarksToAnalysis,
  type PoseFrameAnalysis,
} from "./poseAnalysis";

type Options = {
  enabled: boolean;
  throttleMs?: number;
};

/** Deep learning pose tracking en temps réel sur la vidéo (BlazePose Full · VIDEO mode) */
export function useLivePoseTracking(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  { enabled, throttleMs = 66 }: Options,
) {
  const [livePose, setLivePose] = useState<PoseFrameAnalysis | null>(null);
  const [engineReady, setEngineReady] = useState(false);
  const prevRef = useRef<PoseFrameAnalysis | null>(null);
  const lastRunRef = useRef(0);
  const rafRef = useRef(0);

  const tick = useCallback(async () => {
    const video = videoRef.current;
    if (!enabled || !video || video.readyState < 2) return;

    const now = performance.now();
    if (now - lastRunRef.current < throttleMs) return;
    lastRunRef.current = now;

    try {
      const raw = await detectPoseOnVideoFrame(video, now);
      if (!raw?.length) return;

      const analysis = landmarksToAnalysis(video.currentTime, raw, prevRef.current);
      prevRef.current = analysis;
      setLivePose(analysis);
      setEngineReady(true);
    } catch {
      /* modèle en chargement */
    }
  }, [enabled, videoRef, throttleMs]);

  useEffect(() => {
    if (!enabled) {
      setLivePose(null);
      prevRef.current = null;
      return;
    }

    const loop = () => {
      void tick();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [enabled, tick]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !enabled) return;
    const onSeek = () => { lastRunRef.current = 0; void tick(); };
    video.addEventListener("seeked", onSeek);
    return () => video.removeEventListener("seeked", onSeek);
  }, [enabled, videoRef, tick]);

  return { livePose, engineReady };
}
