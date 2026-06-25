import { useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, Play, Pause, Zap, Send, Target, Crosshair, Footprints, Sparkles } from "lucide-react";
import { RecruteurPageTransition } from "../../components/recruteur/RecruteurPageTransition";
import { RecruteurKpiCard } from "../../components/recruteur/RecruteurKpiCard";
import { VIDEO_TIMELINE, VIDEO_ANALYSIS, type VideoTimelineEvent } from "../../data/recruteurData";

const TYPE_META: Record<VideoTimelineEvent["type"], { color: string; icon: typeof Zap }> = {
  sprint: { color: "#3B82F6", icon: Zap },
  passe: { color: "#22C55E", icon: Send },
  tir: { color: "#EF4444", icon: Target },
  pressing: { color: "#F59E0B", icon: Crosshair },
  dribble: { color: "#A855F7", icon: Footprints },
};

const TOTAL = 1050;

export function RecruteurVideoPage() {
  const [uploaded, setUploaded] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [seconds, setSeconds] = useState(15);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  if (!uploaded) {
    return (
      <RecruteurPageTransition>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); setUploaded(true); }}
          className="flex flex-col items-center justify-center gap-4 rounded-[24px] border-2 border-dashed py-24 text-center transition-colors"
          style={{ borderColor: dragOver ? "#8B5CF6" : "rgba(255,255,255,0.15)", background: dragOver ? "rgba(139,92,246,0.08)" : "rgba(15,29,58,0.4)" }}
        >
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <UploadCloud size={48} style={{ color: "#8B5CF6" }} />
          </motion.div>
          <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Glissez-déposez une vidéo de match</h3>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>MP4, MOV jusqu'à 2GB — l'IA analysera automatiquement les actions clés</p>
          <button type="button" onClick={() => setUploaded(true)} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#8B5CF6,#6366F1)" }}>
            Parcourir les fichiers
          </button>
        </div>
      </RecruteurPageTransition>
    );
  }

  return (
    <RecruteurPageTransition>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <RecruteurKpiCard hover={false} className="overflow-hidden p-0">
            <div className="relative aspect-video w-full" style={{ background: "radial-gradient(circle at 50% 40%, #163a1f, #0a1f12)" }}>
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 38px, rgba(255,255,255,0.06) 38px, rgba(255,255,255,0.06) 76px)" }} />
              <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2" style={{ borderColor: "rgba(255,255,255,0.2)" }} />
              <motion.div
                className="absolute flex h-12 w-12 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: "linear-gradient(135deg,#8B5CF6,#6366F1)", boxShadow: "0 0 24px rgba(139,92,246,0.6)" }}
                animate={{ left: `${20 + (seconds / TOTAL) * 55}%`, top: `${40 + Math.sin(seconds / 3) * 18}%` }}
                transition={{ duration: 0.5 }}
              >
                #9
              </motion.div>
              <div className="absolute bottom-3 left-3 rounded-lg px-2 py-1 text-xs font-mono text-white" style={{ background: "rgba(0,0,0,0.5)" }}>{fmt(seconds)} / {fmt(TOTAL)}</div>
              <button type="button" onClick={() => setPlaying(!playing)} className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full text-white" style={{ background: "rgba(139,92,246,0.9)" }}>
                {playing ? <Pause size={16} /> : <Play size={16} />}
              </button>
            </div>
            <div className="px-4 py-3">
              <input type="range" min={0} max={TOTAL} value={seconds} onChange={(e) => setSeconds(Number(e.target.value))} className="w-full accent-[#8B5CF6]" />
            </div>
          </RecruteurKpiCard>

          <RecruteurKpiCard hover={false}>
            <div className="mb-3 flex items-center gap-2">
              <Sparkles size={15} style={{ color: "#A855F7" }} />
              <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>AI Timeline — actions détectées</h3>
            </div>
            <div className="relative ml-2 border-l-2 pl-5" style={{ borderColor: "rgba(139,92,246,0.3)" }}>
              {VIDEO_TIMELINE.map((ev, i) => {
                const meta = TYPE_META[ev.type];
                const Icon = meta.icon;
                return (
                  <motion.button
                    key={ev.id}
                    type="button"
                    onClick={() => setSeconds(ev.seconds)}
                    className="group relative mb-3 flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-colors hover:bg-white/5"
                    style={{ background: "rgba(255,255,255,0.03)", borderColor: `${meta.color}30` }}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <span className="absolute -left-[27px] flex h-4 w-4 items-center justify-center rounded-full" style={{ background: meta.color, boxShadow: `0 0 10px ${meta.color}` }} />
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `${meta.color}1f`, color: meta.color }}><Icon size={16} /></div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{ev.label}</div>
                      <div className="font-mono text-[11px]" style={{ color: "var(--text-muted)" }}>{ev.time}</div>
                    </div>
                    <Play size={14} className="opacity-0 transition-opacity group-hover:opacity-100" style={{ color: meta.color }} />
                  </motion.button>
                );
              })}
            </div>
          </RecruteurKpiCard>
        </div>

        <div className="space-y-4">
          <RecruteurKpiCard glow hover={false}>
            <h3 className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Analyse IA — Performance</h3>
            <div className="space-y-3">
              {VIDEO_ANALYSIS.map((s, i) => (
                <motion.div key={s.label} className="flex items-center justify-between rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)" }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{s.label}</span>
                  <span className="text-lg font-extrabold" style={{ color: s.color }}>{s.value}</span>
                </motion.div>
              ))}
            </div>
          </RecruteurKpiCard>

          <RecruteurKpiCard hover={false}>
            <h3 className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Heatmap vidéo</h3>
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-xl" style={{ background: "linear-gradient(90deg,#163a1f,#0f2e18)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="absolute inset-y-2 left-1/2 w-px" style={{ background: "rgba(255,255,255,0.15)" }} />
              {[
                { x: 62, y: 42, s: 80, c: "#EF4444" },
                { x: 72, y: 55, s: 60, c: "#F59E0B" },
                { x: 50, y: 38, s: 50, c: "#F59E0B" },
                { x: 80, y: 30, s: 44, c: "#EAB308" },
                { x: 40, y: 60, s: 36, c: "#22C55E" },
              ].map((z, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{ left: `${z.x}%`, top: `${z.y}%`, width: z.s, height: z.s, x: "-50%", y: "-50%", background: `radial-gradient(circle, ${z.c}cc, transparent 70%)`, filter: "blur(4px)" }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                />
              ))}
            </div>
            <p className="mt-2 text-[11px]" style={{ color: "var(--text-muted)" }}>Zone d'influence concentrée dans le dernier tiers offensif droit.</p>
          </RecruteurKpiCard>
        </div>
      </div>
    </RecruteurPageTransition>
  );
}
