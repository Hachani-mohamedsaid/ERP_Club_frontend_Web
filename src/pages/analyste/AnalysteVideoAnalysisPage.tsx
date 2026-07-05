import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud, Play, Pause, Sparkles, Gauge, Activity, Target,
  Brain, Zap, Loader2, Film, ChevronRight, AlertTriangle, Bot, User, TrendingUp,
  Bone, Eye, EyeOff, FileDown,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar, LineChart, Line,
} from "recharts";
import { AnalystePageTransition } from "../../components/analyste/AnalystePageTransition";
import { analysteApi } from "../../lib/api/analyste";
import { nearestVideoPrediction, type VideoAnalysisAiResult } from "../../lib/api/analyste/videoAnalysisTypes";
import { buildDenseTimeline, interpolateDensePrediction } from "../../lib/video/buildDenseTimeline";
import {
  extractVideoFrames, buildClientSpeedTimeline, fmtVideoTime, type ExtractedFrame,
} from "../../lib/video/extractFrames";
import {
  analyzePoseOnFrames, nearestPoseFrame, summarizePoseSession, collectFootTrail,
  POSE_MODEL_LABEL, type PoseFrameAnalysis, type FootTrailPoint,
} from "../../lib/video/poseAnalysis";
import { classifyActionFromPose } from "../../lib/video/actionClassifier";
import { useLivePoseTracking } from "../../lib/video/useLivePoseTracking";
import {
  analyzeYoloOnFrames, nearestYoloPose, preloadYoloModel, YOLO_MODEL_LABEL,
  type YoloPoseDetection,
} from "../../lib/video/yoloPoseAnalysis";
import { exportVideoAnalysisPdf } from "../../lib/video/exportVideoAnalysisPdf";
import { fusePoseFrame } from "../../lib/video/fusePoseEngines";
import { VideoPoseOverlay } from "../../components/analyste/VideoPoseOverlay";

type Phase = "upload" | "ready" | "processing" | "done";

const FOCUS_OPTIONS = [
  "Analyse complète",
  "Vitesse & course",
  "Technique individuelle",
  "Transitions & pressing",
  "Endurance & répétitions",
];

const EVENT_COLORS: Record<string, string> = {
  Sprint: "#3B82F6", Accélération: "#22C55E", Course: "#6366F1",
  Appel: "#F59E0B", Pressing: "#EF4444", Récupération: "#64748B",
};

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={`rounded-[20px] border p-5 ${className}`}
      style={{ background: "rgba(5,8,22,0.75)", borderColor: "rgba(255,255,255,0.07)", boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.div>
  );
}

export function AnalysteVideoAnalysisPage() {
  const [phase, setPhase] = useState<Phase>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState("Karim Dridi");
  const [focus, setFocus] = useState(FOCUS_OPTIONS[0]);
  const [playing, setPlaying] = useState(false);
  const [currentSec, setCurrentSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VideoAnalysisAiResult | null>(null);
  const [clientFrames, setClientFrames] = useState<ExtractedFrame[]>([]);
  const [poseFrames, setPoseFrames] = useState<PoseFrameAnalysis[]>([]);
  const [footTrail, setFootTrail] = useState<FootTrailPoint[]>([]);
  const poseHistoryRef = useRef<PoseFrameAnalysis[]>([]);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [yoloFrames, setYoloFrames] = useState<YoloPoseDetection[]>([]);
  const [yoloReady, setYoloReady] = useState(false);
  const [showYolo, setShowYolo] = useState(true);
  const [videoSize, setVideoSize] = useState({ w: 640, h: 360 });
  const [tab, setTab] = useState<"overview" | "profil" | "mouvements" | "pose" | "speed" | "events" | "coach">("overview");

  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = videoContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setVideoSize({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [videoUrl, phase]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void preloadYoloModel().then(setYoloReady);
  }, []);

  const { livePose: dlLivePose, engineReady: dlEngineReady } = useLivePoseTracking(videoRef, {
    enabled: (phase === "ready" || phase === "done") && showSkeleton && !!videoUrl,
    throttleMs: 40,
  });

  useEffect(() => {
    if (!dlLivePose?.detected) return;
    const hist = poseHistoryRef.current;
    const last = hist[hist.length - 1];
    if (!last || Math.abs(last.timeSec - dlLivePose.timeSec) > 0.04) {
      hist.push(dlLivePose);
      if (hist.length > 30) hist.shift();
      setFootTrail(collectFootTrail(hist));
    }
  }, [dlLivePose]);

  useEffect(() => {
    return () => { if (videoUrl) URL.revokeObjectURL(videoUrl); };
  }, [videoUrl]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !playing) return;
    const id = setInterval(() => {
      if (v.paused) return;
      setCurrentSec(v.currentTime);
    }, 200);
    return () => clearInterval(id);
  }, [playing, videoUrl]);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("video/")) {
      setError("Format vidéo requis (MP4, MOV, WebM).");
      return;
    }
    setError(null);
    setFile(f);
    setVideoUrl(URL.createObjectURL(f));
    setResult(null);
    setPoseFrames([]);
    setYoloFrames([]);
    poseHistoryRef.current = [];
    setFootTrail([]);
    setPhase("ready");
    setCurrentSec(0);
  }, []);

  const runAnalysis = async () => {
    if (!file) return;
    setPhase("processing");
    setError(null);
    setProgress("Extraction des frames…");

    try {
      const frames = await extractVideoFrames(file, 14);
      setClientFrames(frames);

      setProgress("ODIN Precision Engine — squelette & angles jambes…");
      const poses = await analyzePoseOnFrames(
        frames.map((f) => ({ timeSec: f.timeSec, base64: f.base64 })),
        (pct) => setProgress(`Pose tracking ${pct}%…`),
      );
      setPoseFrames(poses);
      const poseSummary = summarizePoseSession(poses);

      let yoloResults: YoloPoseDetection[] = [];
      const yoloOk = yoloReady || await preloadYoloModel();
      if (yoloOk) {
        setYoloReady(true);
        setProgress("YOLOv8 Pose — deep learning Ultralytics…");
        yoloResults = await analyzeYoloOnFrames(
          frames.map((f) => ({ timeSec: f.timeSec, base64: f.base64 })),
          (pct) => setProgress(`YOLOv8 ${pct}%…`),
        );
        setYoloFrames(yoloResults);
      }

      const dur = videoRef.current?.duration ?? durationSec ?? 90;

      setProgress("Analyse IA OpenAI Vision + Claude…");
      const res = await analysteApi.processVideoAnalysis({
        playerName: playerName.trim() || "Joueur",
        focus,
        sport: "football",
        durationSec: dur,
        fileName: file.name,
        frames: frames.map((f) => ({ timeSec: f.timeSec, imageBase64: f.base64, motionScore: f.motionScore })),
        poseSummary: {
          detectionRate: poseSummary.detectionRate,
          avgLeftKnee: poseSummary.avgLeftKnee,
          avgRightKnee: poseSummary.avgRightKnee,
          avgSymmetry: poseSummary.avgSymmetry,
          avgPowerIndex: poseSummary.avgPowerIndex,
          dominantFoot: poseSummary.dominantFoot,
          legInsights: poseSummary.legInsights,
          model: poseSummary.model,
        },
        poseFrames: poses.filter((p) => p.detected).map((p) => ({
          timeSec: p.timeSec,
          leftKnee: p.angles.leftKnee,
          rightKnee: p.angles.rightKnee,
          leftHip: p.angles.leftHip,
          rightHip: p.angles.rightHip,
          leftLegPhase: p.leftLegPhase,
          rightLegPhase: p.rightLegPhase,
          footStrike: p.footStrike,
          powerIndex: p.powerIndex,
          symmetryIndex: p.angles.symmetryIndex,
          trunkTilt: p.angles.trunkTilt,
          notes: p.notes,
        })),
      });

      setResult(res);
      setPhase("done");
      setTab("overview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analyse échouée.");
      setPhase("ready");
    } finally {
      setProgress("");
    }
  };

  const speedData = useMemo(() => {
    if (result?.speed.timeline.length) return result.speed.timeline;
    return buildClientSpeedTimeline(clientFrames);
  }, [result, clientFrames]);

  const denseTimeline = useMemo(() => {
    if (!result) return [];
    return buildDenseTimeline(
      durationSec || result.durationSec,
      clientFrames,
      result.videoPredictions,
      result.movementFrames ?? [],
    );
  }, [result, clientFrames, durationSec]);

  const activeEvent = result?.events.find(
    (e) => Math.abs(e.timeSec - currentSec) < 2,
  );

  const livePred = result
    ? interpolateDensePrediction(denseTimeline, currentSec) ?? nearestVideoPrediction(result.videoPredictions, currentSec)
    : null;

  const liveYolo = nearestYoloPose(yoloFrames, currentSec);

  const exportPdf = () => {
    if (!result) return;
    exportVideoAnalysisPdf({
      result,
      playerName,
      fileName: file?.name,
      poseFrames,
      yoloFrames,
    });
  };
  const batchPose = nearestPoseFrame(poseFrames, currentSec);
  const livePose = fusePoseFrame(
    dlLivePose?.detected ? dlLivePose : batchPose,
    liveYolo,
  ) ?? (dlLivePose?.detected ? dlLivePose : batchPose);

  const mlAction = livePose?.detected
    ? classifyActionFromPose(livePose, poseHistoryRef.current.at(-2) ?? null, livePred?.speedKmh ?? 14)
    : null;
  const poseSummary = useMemo(() => summarizePoseSession(poseFrames), [poseFrames]);

  const activeMovement = useMemo(() => {
    const frames = result?.movementFrames;
    if (!frames?.length) return undefined;
    return frames.find((m) => Math.abs(m.timeSec - currentSec) < 0.6)
      ?? frames.reduce((best, m) =>
        Math.abs(m.timeSec - currentSec) < Math.abs(best.timeSec - currentSec) ? m : best,
      frames[0]);
  }, [result?.movementFrames, currentSec]);

  const intensityColor = (i?: string) =>
    i === "max" ? "#EF4444" : i === "high" ? "#F59E0B" : i === "medium" ? "#6366F1" : "#64748B";

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { void v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  };

  const seek = (sec: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = sec;
    setCurrentSec(sec);
  };

  if (phase === "upload") {
    return (
      <AnalystePageTransition>
        <div
          className="flex flex-col items-center justify-center gap-5 rounded-[24px] border-2 border-dashed py-24 text-center cursor-pointer transition-colors"
          style={{ borderColor: "rgba(99,102,241,0.35)", background: "rgba(99,102,241,0.04)" }}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = "#6366F1"; }}
          onDragLeave={(e) => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.35)"; }}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            if (f) handleFile(f);
          }}
        >
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2.2, repeat: Infinity }}>
            <UploadCloud size={52} style={{ color: "#6366F1" }} />
          </motion.div>
          <div>
            <h2 className="text-xl font-extrabold" style={{ color: "var(--text-primary)" }}>
              ODIN Video Analysis Pro
            </h2>
            <p className="mt-2 max-w-md text-sm" style={{ color: "var(--text-muted)" }}>
              Uploadez une vidéo match ou entraînement — détection course, vitesse km/h, sprints, analyse technique & rapport coach IA
            </p>
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>MP4 · MOV · WebM — max ~200 Mo recommandé</p>
          <input ref={fileInputRef} type="file" accept="video/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </div>
      </AnalystePageTransition>
    );
  }

  return (
    <AnalystePageTransition>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "rgba(99,102,241,0.2)" }}>
              <Film size={22} style={{ color: "#6366F1" }} />
            </div>
            <div>
              <h1 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>Video Analysis Pro</h1>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                ULTRA · GPT-4o Vision · Claude Opus · BlazePose Heavy · YOLOv8s
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input value={playerName} onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Nom joueur"
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500/50" />
            <select value={focus} onChange={(e) => setFocus(e.target.value)}
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white outline-none">
              {FOCUS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <motion.button type="button" onClick={() => void runAnalysis()} disabled={phase === "processing"}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#6366F1,#4F46E5)", boxShadow: "0 0 20px rgba(99,102,241,0.35)" }}
              whileTap={{ scale: 0.97 }}>
              {phase === "processing" ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {phase === "processing" ? "Analyse…" : "Analyser IA"}
            </motion.button>
            <button type="button" onClick={() => { setPhase("upload"); setFile(null); setVideoUrl(null); setResult(null); setYoloFrames([]); }}
              className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-400 hover:text-white">
              Nouvelle vidéo
            </button>
            {result && (
              <button type="button" onClick={exportPdf}
                className="flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-500/15 px-3 py-2 text-xs font-bold text-indigo-200 hover:bg-indigo-500/25">
                <FileDown size={14} /> Export PDF
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        {progress && (
          <div className="flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-200">
            <Loader2 size={16} className="animate-spin" /> {progress}
          </div>
        )}

        {!result?.aiEnabled && result && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-3 text-xs text-amber-200">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            Mode démo — ajoutez <code className="mx-1">OPENAI_API_KEY</code> et <code className="mx-1">ANTHROPIC_API_KEY</code> sur Render pour l&apos;analyse réelle.
          </div>
        )}

        <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
          {/* Video player */}
          <GlassCard className="overflow-hidden p-0">
            <div className="relative aspect-video w-full bg-black" ref={videoContainerRef}>
              {videoUrl && (
                <video ref={videoRef} src={videoUrl} className="h-full w-full object-contain"
                  onLoadedMetadata={(e) => setDurationSec(e.currentTarget.duration)}
                  onTimeUpdate={(e) => setCurrentSec(e.currentTarget.currentTime)}
                  onEnded={() => setPlaying(false)} />
              )}
              {(livePose?.detected || dlEngineReady) && (
                <VideoPoseOverlay
                  landmarks={livePose?.landmarks ?? []}
                  width={videoSize.w}
                  height={videoSize.h}
                  show={showSkeleton && (!!livePose?.detected || !!liveYolo?.detected)}
                  footTrail={footTrail}
                  yoloPose={liveYolo}
                  showYolo={showYolo}
                />
              )}
              {/* Tracking + prédictions live sur vidéo */}
              {result && livePred && (
                <>
                  <motion.div
                    className="pointer-events-none absolute flex h-11 w-11 items-center justify-center rounded-full border-2 text-[10px] font-black text-white"
                    style={{
                      borderColor: intensityColor(livePred.intensity),
                      background: `${intensityColor(livePred.intensity)}cc`,
                      boxShadow: `0 0 28px ${intensityColor(livePred.intensity)}80`,
                      left: `${12 + (currentSec / Math.max(durationSec, 1)) * 68}%`,
                      top: `${32 + Math.sin(currentSec * 0.75) * 14}%`,
                    }}
                    animate={{ scale: livePred.intensity === "max" ? [1, 1.2, 1] : 1 }}
                    transition={{ duration: 0.5, repeat: livePred.intensity === "max" ? Infinity : 0 }}
                  >
                    {result.player.jersey?.replace("#", "") || "8"}
                  </motion.div>

                  {/* HUD prédictions in-video */}
                  <div className="pointer-events-none absolute left-3 top-3 space-y-1.5 max-w-[42%]">
                    <div className="rounded-lg border border-indigo-500/40 bg-black/75 px-2.5 py-1.5 backdrop-blur-md">
                      <p className="text-[9px] uppercase tracking-wider text-indigo-300">Action live {mlAction ? "· DL" : ""}</p>
                      <p className="text-xs font-bold text-white">{mlAction?.action ?? livePred.action}</p>
                      <p className="text-[9px] text-slate-400">Next → {mlAction?.actionNext ?? livePred.actionNext}</p>
                      {mlAction && <p className="text-[9px] text-violet-300">ML {mlAction.confidence}%</p>}
                      {livePred.zone && <p className="text-[9px] text-cyan-300">{livePred.zone}</p>}
                    </div>
                    <div className="flex gap-1.5">
                      <div className="rounded-lg border border-blue-500/30 bg-black/70 px-2.5 py-1 text-[10px] font-bold text-blue-300">
                        {livePred.speedKmh} km/h
                      </div>
                      {livePred.accelerationMs2 != null && (
                        <div className="rounded-lg border border-violet-500/30 bg-black/70 px-2.5 py-1 text-[10px] font-bold text-violet-300">
                          {livePred.accelerationMs2 > 0 ? "+" : ""}{livePred.accelerationMs2} m/s²
                        </div>
                      )}
                    </div>
                    {activeMovement?.biomechanics && (
                      <div className="rounded-lg border border-white/10 bg-black/80 px-2.5 py-1.5 backdrop-blur-md">
                        <p className="text-[8px] uppercase tracking-wider text-slate-400">Biomécanique</p>
                        <p className="text-[9px] leading-snug text-slate-200 line-clamp-3">{activeMovement.biomechanics}</p>
                      </div>
                    )}
                    {livePose?.detected && (
                      <div className="rounded-lg border border-emerald-500/40 bg-black/85 px-2.5 py-1.5 backdrop-blur-md">
                        <p className="text-[8px] uppercase tracking-wider text-emerald-400">ODIN Skeleton · Jambe</p>
                        <div className="mt-1 grid grid-cols-2 gap-1 text-[9px]">
                          <span className="text-green-300">G: {livePose.angles.leftKnee}° · {livePose.leftLegPhase}</span>
                          <span className="text-green-300">D: {livePose.angles.rightKnee}° · {livePose.rightLegPhase}</span>
                          <span className="text-cyan-300">Appui: {livePose.footStrike}</span>
                          <span className="text-amber-300">PWR {livePose.powerIndex}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pointer-events-none absolute right-3 top-3 space-y-1.5 text-right">
                    <div className="rounded-lg border border-emerald-500/30 bg-black/70 px-2.5 py-1">
                      <p className="text-[9px] text-emerald-400">PPI live</p>
                      <p className="text-sm font-black text-white">{livePred.ppiLive}</p>
                    </div>
                    <div className="rounded-lg border border-amber-500/30 bg-black/70 px-2.5 py-1">
                      <p className="text-[9px] text-amber-400">Fatigue</p>
                      <p className="text-sm font-black text-white">{livePred.fatiguePct}%</p>
                    </div>
                    <div className="rounded-lg border border-red-500/25 bg-black/70 px-2.5 py-1">
                      <p className="text-[9px] text-red-400">Risque</p>
                      <p className="text-sm font-black text-white">{livePred.injuryRiskPct}%</p>
                    </div>
                    {livePred.postureScore != null && (
                      <div className="rounded-lg border border-cyan-500/25 bg-black/70 px-2.5 py-1">
                        <p className="text-[9px] text-cyan-400">Posture</p>
                        <p className="text-sm font-black text-white">{livePred.postureScore}</p>
                      </div>
                    )}
                  </div>

                  <div className="pointer-events-none absolute bottom-14 left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-black/60 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-white/80">
                    Prédiction IA · {livePred.confidence}% · {livePred.intensity}
                  </div>
                </>
              )}
              {activeEvent && !livePred && (
                <div className="absolute left-3 top-3 rounded-lg px-2 py-1 text-[10px] font-bold text-white"
                  style={{ background: "rgba(99,102,241,0.85)" }}>
                  {activeEvent.type} · {activeEvent.speedKmh ? `${activeEvent.speedKmh} km/h` : ""}
                </div>
              )}
              <div className="absolute bottom-3 left-3 rounded-lg bg-black/60 px-2 py-1 font-mono text-xs text-white">
                {fmtVideoTime(currentSec)} / {fmtVideoTime(durationSec)}
              </div>
              <button type="button" onClick={togglePlay}
                className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full text-white"
                style={{ background: "rgba(99,102,241,0.9)" }}>
                {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
              </button>
              {poseFrames.length > 0 || dlEngineReady ? (
                <button type="button" onClick={() => setShowSkeleton((s) => !s)}
                  className="absolute bottom-3 right-16 flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[10px] font-bold text-white"
                  style={{ background: showSkeleton ? "rgba(34,197,94,0.9)" : "rgba(0,0,0,0.6)" }}>
                  {showSkeleton ? <Eye size={12} /> : <EyeOff size={12} />}
                  Skeleton
                </button>
              ) : null}
            </div>
            <div className="px-4 py-3">
              <input type="range" min={0} max={durationSec || 100} step={0.1} value={currentSec}
                onChange={(e) => seek(Number(e.target.value))}
                className="w-full accent-indigo-500" />
              {file && <p className="mt-1 truncate text-[10px] text-slate-500">{file.name}</p>}
            </div>
          </GlassCard>

          {/* KPIs + profil live */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Vitesse max", value: result ? `${result.speed.maxKmh} km/h` : livePred ? `${livePred.speedKmh} km/h` : "—", icon: Gauge, color: "#3B82F6" },
                { label: "PPI", value: result ? String(result.playerProfile?.ppi ?? "—") : "—", icon: User, color: "#22C55E" },
                { label: "Sprints", value: result ? String(result.speed.sprints) : "—", icon: Zap, color: "#F59E0B" },
                { label: "Potentiel", value: result ? String(result.playerProfile?.potential ?? "—") : "—", icon: TrendingUp, color: "#6366F1" },
              ].map((k) => (
                <GlassCard key={k.label} className="p-4">
                  <k.icon size={14} style={{ color: k.color }} />
                  <p className="mt-2 text-[10px] uppercase tracking-wider text-slate-500">{k.label}</p>
                  <p className="text-xl font-extrabold tabular-nums text-white">{k.value}</p>
                </GlassCard>
              ))}
            </div>

            {(poseFrames.length > 0 || dlEngineReady) && (
              <GlassCard className="p-4 border-emerald-500/20" style={{ boxShadow: "0 0 32px rgba(34,197,94,0.12)" }}>
                <div className="flex items-center gap-2">
                  <Bone size={14} className="text-emerald-400" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">ODIN Precision Engine</p>
                  <span className={`ml-auto rounded-full px-2 py-0.5 text-[8px] font-bold ${dlEngineReady ? "bg-emerald-500/25 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}>
                    {dlEngineReady ? "LIVE DL" : "Chargement…"}
                  </span>
                </div>
                <p className="mt-1 text-[8px] text-slate-500">{POSE_MODEL_LABEL}</p>
                {yoloReady && <p className="text-[8px] text-orange-400">{YOLO_MODEL_LABEL} {liveYolo?.detected ? `· ${liveYolo.confidence}%` : ""}</p>}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[
                    ["Genou G", `${livePose?.angles.leftKnee ?? poseSummary.avgLeftKnee}°`],
                    ["Genou D", `${livePose?.angles.rightKnee ?? poseSummary.avgRightKnee}°`],
                    ["Chev. G/D", `${livePose?.angles.leftAnkle ?? "—"}° / ${livePose?.angles.rightAnkle ?? "—"}°`],
                    ["Symétrie", `${livePose?.angles.symmetryIndex ?? poseSummary.avgSymmetry}%`],
                    ["Puissance", `${livePose?.powerIndex ?? poseSummary.avgPowerIndex}`],
                    ["ML Action", mlAction?.action ?? "—"],
                  ].map(([l, v]) => (
                    <div key={l} className="rounded-lg bg-emerald-500/8 px-2 py-1.5">
                      <p className="text-[9px] text-slate-500">{l}</p>
                      <p className="text-sm font-black text-emerald-300">{v}</p>
                    </div>
                  ))}
                </div>
                {livePose?.notes[0] && (
                  <p className="mt-2 text-[10px] leading-relaxed text-slate-400">{livePose.notes.join(" · ")}</p>
                )}
              </GlassCard>
            )}

            {result?.playerProfile && (
              <GlassCard className="p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Profil RAW — {result.player.name}</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-3xl font-black text-emerald-400">{result.playerProfile.ppi}</p>
                    <p className="text-[9px] text-slate-500">PPI</p>
                  </div>
                  <div className="flex-1 h-12">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={result.playerProfile.ppiTrend.map((v, i) => ({ m: i + 1, ppi: v }))}>
                        <Line type="monotone" dataKey="ppi" stroke="#6366F1" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-400 line-clamp-3">{result.playerProfile.rawAnalysis}</p>
              </GlassCard>
            )}
          </div>
        </div>

        {result && (
          <>
            <div className="flex flex-wrap gap-2">
              {(["overview", "profil", "mouvements", "pose", "speed", "events", "coach"] as const).map((t) => (
                <button key={t} type="button" onClick={() => setTab(t)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold"
                  style={{
                    background: tab === t ? "linear-gradient(135deg,#6366F1,#4F46E5)" : "rgba(255,255,255,0.04)",
                    color: tab === t ? "white" : "var(--text-muted)",
                  }}>
                  {t === "overview" ? "Vue d'ensemble" : t === "profil" ? "Profil RAW" : t === "mouvements" ? "Mouvements" : t === "pose" ? "Squelette" : t === "speed" ? "Vitesse" : t === "events" ? "Événements" : "Rapport Coach"}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-2 text-[10px] text-slate-500">
                {result.models.openai && <span className="flex items-center gap-1"><Bot size={10} /> {result.models.openai}</span>}
                {result.models.claude && <span className="flex items-center gap-1"><Brain size={10} /> Claude</span>}
                <span>{result.processedFrames} frames · {(result.durationMs / 1000).toFixed(1)}s</span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {tab === "overview" && (
                <motion.div key="ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="grid gap-4 lg:grid-cols-2">
                  <GlassCard>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Synthèse IA</p>
                    <p className="mt-3 text-sm leading-relaxed text-slate-200">{result.summary}</p>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                      {[
                        ["Distance est.", `${result.physical.distanceKm} km`],
                        ["Runs HI", String(result.physical.highIntensityRuns)],
                        ["Accélérations", String(result.physical.accelerationPeaks)],
                        ["Work rate", result.physical.workRate],
                      ].map(([l, v]) => (
                        <div key={l} className="rounded-lg bg-white/4 px-2 py-1.5">
                          <p className="text-slate-500">{l}</p>
                          <p className="font-bold text-white">{v}</p>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                  <GlassCard>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Scores techniques</p>
                    <div className="mt-3 space-y-3">
                      {result.technical.map((t) => (
                        <div key={t.category}>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">{t.category}</span>
                            <span className="font-bold" style={{ color: t.score >= 80 ? "#22C55E" : "#F59E0B" }}>{t.score}/100</span>
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/8">
                            <div className="h-full rounded-full bg-indigo-500" style={{ width: `${t.score}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                  <GlassCard className="lg:col-span-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Tactique</p>
                    <div className="mt-3 grid gap-4 md:grid-cols-3">
                      {[["Forces", result.tactical.strengths, "#22C55E"], ["Faiblesses", result.tactical.weaknesses, "#EF4444"], ["Recommandations", result.tactical.recommendations, "#6366F1"]].map(([title, items, c]) => (
                        <div key={title as string}>
                          <p className="text-xs font-bold" style={{ color: c as string }}>{title as string}</p>
                          <ul className="mt-2 space-y-1">
                            {(items as string[]).map((x) => (
                              <li key={x} className="text-xs text-slate-300">• {x}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {tab === "profil" && result.playerProfile && (
                <motion.div key="profil" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="grid gap-4 lg:grid-cols-2">
                  <GlassCard>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400">Analyse profil RAW</p>
                    <p className="mt-3 text-sm leading-relaxed text-slate-200">{result.playerProfile.rawAnalysis}</p>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                      {[
                        ["Âge", `${result.playerProfile.age} ans`],
                        ["Forme", result.playerProfile.form],
                        ["Fatigue", `${result.playerProfile.fatigue}%`],
                        ["Risque blessure", `${result.playerProfile.injuryRisk}%`],
                        ["Potentiel", String(result.playerProfile.potential)],
                        ["Valeur", result.playerProfile.marketValue],
                      ].map(([l, v]) => (
                        <div key={l} className="rounded-lg bg-white/4 px-2 py-1.5">
                          <p className="text-slate-500">{l}</p>
                          <p className="font-bold capitalize text-white">{v}</p>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                  <GlassCard>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Radar attributs PPI</p>
                    <div className="h-56 mt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={Object.entries(result.playerProfile.attributes).map(([k, v]) => ({
                          subject: k.charAt(0).toUpperCase() + k.slice(1),
                          A: v,
                        }))}>
                          <PolarGrid stroke="rgba(255,255,255,0.08)" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 9 }} />
                          <Radar dataKey="A" stroke="#6366F1" fill="#6366F1" fillOpacity={0.25} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </GlassCard>
                  <GlassCard className="lg:col-span-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Prédictions IA profil</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      {result.playerProfile.predictions.map((p) => (
                        <div key={p.label} className="rounded-xl border border-white/8 bg-white/3 p-3">
                          <p className="text-[10px] text-slate-500">{p.label}</p>
                          <p className="text-lg font-black text-white">{p.value}</p>
                          <p className="text-[9px] text-slate-500">{p.horizon} · {p.confidence}%</p>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                  <GlassCard className="lg:col-span-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">Timeline prédictions vidéo</p>
                    <div className="mt-3 max-h-48 overflow-y-auto space-y-1">
                      {result.videoPredictions.map((p) => (
                        <button key={p.timeSec} type="button" onClick={() => seek(p.timeSec)}
                          className="flex w-full items-center gap-3 rounded-lg border border-white/5 px-3 py-2 text-left hover:bg-white/4"
                          style={{ borderColor: currentSec >= p.timeSec - 1 && currentSec <= p.timeSec + 1 ? "#6366F140" : undefined }}>
                          <span className="font-mono text-[10px] text-indigo-400">{fmtVideoTime(p.timeSec)}</span>
                          <span className="text-xs text-white">{p.action}</span>
                          <span className="text-[10px] text-blue-400">{p.speedKmh} km/h</span>
                          <span className="ml-auto text-[10px] text-slate-500">PPI {p.ppiLive}</span>
                        </button>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {tab === "mouvements" && (
                <motion.div key="mv" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="grid gap-4 lg:grid-cols-2">
                  <GlassCard className="lg:col-span-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">Biomécanique globale — ODIN Precision</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
                      {[
                        ["Foulée moy.", `${result.biomechanics?.avgStrideLengthCm ?? "—"} cm`],
                        ["Cadence", `${result.biomechanics?.avgCadenceSpm ?? "—"} spm`],
                        ["Symétrie", `${result.biomechanics?.symmetryIndex ?? "—"}%`],
                        ["Posture", `${result.biomechanics?.postureScore ?? "—"}/100`],
                        ["Explosivité", `${result.biomechanics?.explosivenessIndex ?? "—"}`],
                        ["Charge", `${result.biomechanics?.loadIndex ?? "—"}`],
                      ].map(([l, v]) => (
                        <div key={l} className="rounded-xl border border-white/8 bg-white/3 p-3 text-center">
                          <p className="text-[9px] text-slate-500">{l}</p>
                          <p className="text-sm font-black text-white">{v}</p>
                        </div>
                      ))}
                    </div>
                    {result.biomechanics?.keyFindings && (
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <div>
                          <p className="text-xs font-bold text-emerald-400">Constats clés</p>
                          <ul className="mt-2 space-y-1">
                            {result.biomechanics.keyFindings.map((x) => (
                              <li key={x} className="text-xs text-slate-300">• {x}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-indigo-400">Micro-ajustements</p>
                          <ul className="mt-2 space-y-1">
                            {(result.biomechanics.microAdjustments ?? []).map((x) => (
                              <li key={x} className="text-xs text-slate-300">• {x}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </GlassCard>

                  {(result.movementFrames ?? []).map((m, i) => {
                    const active = Math.abs(m.timeSec - currentSec) < 0.5;
                    return (
                      <motion.button key={`${m.timeSec}-${i}`} type="button" onClick={() => seek(m.timeSec)}
                        className="rounded-xl border p-4 text-left transition-colors hover:bg-white/4"
                        style={{
                          borderColor: active ? "#6366F160" : "rgba(255,255,255,0.06)",
                          background: active ? "rgba(99,102,241,0.08)" : "rgba(5,8,22,0.5)",
                        }}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-400">{m.timeLabel}</span>
                          <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300">{m.speedKmh} km/h</span>
                        </div>
                        <p className="mt-2 text-sm font-bold text-white">{m.action}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <span className="rounded bg-white/6 px-1.5 py-0.5 text-[9px] text-slate-400">{m.zone}</span>
                          <span className="rounded bg-white/6 px-1.5 py-0.5 text-[9px] text-slate-400">{m.direction}</span>
                          {m.ballContact && <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] text-amber-300">Balle</span>}
                          {m.injuryFlag && <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[9px] text-red-300">{m.injuryFlag}</span>}
                        </div>
                        <p className="mt-2 text-[11px] leading-relaxed text-slate-300">{m.biomechanics}</p>
                        <p className="mt-1 text-[10px] text-slate-500">{m.technicalNote}</p>
                        <div className="mt-2 flex gap-3 text-[9px] text-slate-500">
                          <span>Accél. {m.accelerationMs2} m/s²</span>
                          {m.strideLengthCm && <span>Foulée {m.strideLengthCm} cm</span>}
                          <span>Posture {m.postureScore}</span>
                          <span>{m.confidence}%</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}

              {tab === "pose" && (
                <motion.div key="pose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="grid gap-4 lg:grid-cols-2">
                  <GlassCard className="lg:col-span-2 border-emerald-500/25"
                    style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(5,8,22,0.9) 100%)" }}>
                    <div className="flex flex-wrap items-center gap-3">
                      <Bone size={18} className="text-emerald-400" />
                      <div>
                        <p className="text-sm font-black text-white">ODIN Precision Engine — Tracking squelette temps réel</p>
                        <p className="text-xs text-slate-400">{POSE_MODEL_LABEL} · {YOLO_MODEL_LABEL} · Classifieur ML · trajectoires pieds</p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
                      {[
                        ["Détection", `${poseSummary.detectionRate}%`],
                        ["Genou G moy.", `${poseSummary.avgLeftKnee}°`],
                        ["Genou D moy.", `${poseSummary.avgRightKnee}°`],
                        ["Symétrie", `${poseSummary.avgSymmetry}%`],
                        ["Puissance", `${poseSummary.avgPowerIndex}/100`],
                        ["Appui dom.", poseSummary.dominantFoot],
                      ].map(([l, v]) => (
                        <div key={l} className="rounded-xl border border-emerald-500/20 bg-black/30 p-3 text-center">
                          <p className="text-[9px] text-slate-500">{l}</p>
                          <p className="text-sm font-black text-emerald-300">{v}</p>
                        </div>
                      ))}
                    </div>
                    <ul className="mt-4 space-y-1">
                      {poseSummary.legInsights.map((x) => (
                        <li key={x} className="text-xs text-slate-300">▸ {x}</li>
                      ))}
                    </ul>
                  </GlassCard>

                  {yoloFrames.map((y, i) => (
                    <motion.button key={`yolo-${y.timeSec}-${i}`} type="button" onClick={() => seek(y.timeSec)}
                      className="rounded-xl border border-orange-500/25 p-4 text-left hover:bg-orange-500/5"
                      style={{ borderColor: Math.abs(y.timeSec - currentSec) < 0.4 ? "#F9731660" : undefined }}>
                      <div className="flex justify-between">
                        <span className="font-mono text-xs font-bold text-orange-400">{fmtVideoTime(y.timeSec)}</span>
                        <span className="text-[10px] text-orange-300">{y.detected ? `YOLO ${y.confidence}%` : "—"}</span>
                      </div>
                      {y.detected && (
                        <p className="mt-2 text-[10px] text-slate-300">
                          Genoux G/D: {y.angles.leftKnee}° / {y.angles.rightKnee}° · Sym: {y.angles.symmetryIndex}%
                        </p>
                      )}
                    </motion.button>
                  ))}

                  {poseFrames.map((p, i) => (
                    <motion.button key={`pose-${p.timeSec}-${i}`} type="button" onClick={() => seek(p.timeSec)}
                      className="rounded-xl border p-4 text-left hover:bg-white/4"
                      style={{
                        borderColor: p.detected ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.06)",
                        background: Math.abs(p.timeSec - currentSec) < 0.4 ? "rgba(34,197,94,0.1)" : "rgba(5,8,22,0.5)",
                      }}>
                      <div className="flex justify-between">
                        <span className="font-mono text-xs font-bold text-emerald-400">{fmtVideoTime(p.timeSec)}</span>
                        <span className="text-[10px] text-slate-500">{p.detected ? "✓ Pose" : "—"}</span>
                      </div>
                      {p.detected ? (
                        <>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
                            <span className="text-green-300">Genou G: {p.angles.leftKnee}° ({p.leftLegPhase})</span>
                            <span className="text-green-300">Genou D: {p.angles.rightKnee}° ({p.rightLegPhase})</span>
                            <span className="text-cyan-300">Hanche G/D: {p.angles.leftHip}° / {p.angles.rightHip}°</span>
                            <span className="text-amber-300">Appui: {p.footStrike} · PWR {p.powerIndex}</span>
                          </div>
                          <p className="mt-2 text-[11px] text-slate-400">{p.notes.join(" · ")}</p>
                        </>
                      ) : (
                        <p className="mt-2 text-[11px] text-slate-500">Joueur hors champ ou occlusion</p>
                      )}
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {tab === "speed" && (
                <motion.div key="sp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <GlassCard>
                    <p className="mb-4 text-sm font-bold text-white">Courbe vitesse (km/h) — {result.player.name}</p>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={speedData}>
                          <defs>
                            <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#6366F1" stopOpacity={0.5} />
                              <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                          <XAxis dataKey="timeSec" tickFormatter={fmtVideoTime} stroke="#64748B" fontSize={10} />
                          <YAxis unit=" km/h" stroke="#64748B" fontSize={10} domain={[0, "auto"]} />
                          <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", fontSize: 12 }}
                            labelFormatter={(v) => fmtVideoTime(Number(v))} />
                          <Area type="monotone" dataKey="speedKmh" stroke="#6366F1" fill="url(#speedGrad)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={result.technical}>
                          <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                          <XAxis dataKey="category" stroke="#64748B" fontSize={9} interval={0} angle={-15} textAnchor="end" height={50} />
                          <YAxis domain={[0, 100]} stroke="#64748B" fontSize={10} />
                          <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", fontSize: 12 }} />
                          <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                            {result.technical.map((_, i) => (
                              <Cell key={i} fill={["#6366F1", "#22C55E", "#F59E0B", "#EF4444"][i % 4]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {tab === "events" && (
                <motion.div key="ev" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                  {result.events.map((ev, i) => {
                    const color = EVENT_COLORS[ev.type] ?? "#8B5CF6";
                    return (
                      <motion.button key={`${ev.timeSec}-${i}`} type="button" onClick={() => seek(ev.timeSec)}
                        className="flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors hover:bg-white/4"
                        style={{ borderColor: `${color}25`, background: `${color}06` }}
                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                        <div className="flex flex-col items-center shrink-0">
                          <Play size={12} style={{ color }} />
                          <span className="mt-1 font-mono text-[10px] font-bold" style={{ color }}>{ev.timeLabel}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: `${color}20`, color }}>{ev.type}</span>
                            {ev.speedKmh != null && <span className="text-[10px] font-bold text-blue-400">{ev.speedKmh} km/h</span>}
                            <span className="ml-auto text-[10px] text-slate-500">{ev.confidence}%</span>
                          </div>
                          <p className="mt-1 text-xs text-slate-300">{ev.description}</p>
                        </div>
                        <ChevronRight size={14} className="shrink-0 text-slate-600" />
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}

              {tab === "coach" && (
                <motion.div key="co" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <GlassCard className="!p-0 overflow-hidden">
                    <div className="p-5" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(5,8,22,0.8) 100%)" }}>
                    <div className="flex items-center gap-2">
                      <Target size={16} style={{ color: "#6366F1" }} />
                      <p className="text-sm font-bold text-white">Rapport Coach IA — {result.player.name}</p>
                    </div>
                    <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
                      {result.coachReport}
                    </div>
                    <button type="button" onClick={exportPdf}
                      className="mt-4 flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500">
                      <FileDown size={14} /> Télécharger rapport PDF pro
                    </button>
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </AnalystePageTransition>
  );
}
