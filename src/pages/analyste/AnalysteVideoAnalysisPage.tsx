import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Film, Mic, Play, Star, Camera, Zap, TrendingUp } from "lucide-react";
import { AnalystePageTransition } from "../../components/analyste/AnalystePageTransition";
import { AnalystePageLoader } from "../../components/analyste/AnalystePageLoader";
import { MatchReplayTimeline } from "../../components/analyste/MatchReplayTimeline";
import { useAnalysteVideoAnalysis } from "../../hooks/useAnalysteResource";

type Tab = "replay" | "ai-coach" | "highlights";

const EVENT_COLORS: Record<string, string> = {
  But: "#22C55E", Faute: "#F59E0B", Occasion: "#8B5CF6", Remplacement: "#3B82F6", Danger: "#EF4444",
};

const ACard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <motion.div className={`rounded-[20px] border p-5 ${className}`}
    style={{ background: "rgba(5,8,22,0.7)", borderColor: "var(--surface-panel-border)", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
    {children}
  </motion.div>
);

export function AnalysteVideoAnalysisPage() {
  const { data, loading } = useAnalysteVideoAnalysis();
  const [tab, setTab] = useState<Tab>("replay");

  if (loading && !data) return <AnalystePageLoader />;

  const { matchTitle, highlights: HIGHLIGHTS, insights: AI_INSIGHTS, events } = data!;

  const tabs: { id: Tab; label: string; icon: typeof Film }[] = [
    { id: "replay",    label: "Match Replay",   icon: Film },
    { id: "ai-coach",  label: "AI Video Coach", icon: Mic  },
    { id: "highlights",label: "Highlights IA",  icon: Star },
  ];

  return (
    <AnalystePageTransition>
      {/* Header */}
      <div className="flex items-center gap-3">
        <motion.div className="flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ background: "rgba(99,102,241,0.18)" }}
          animate={{ boxShadow: ["0 0 0px #6366F100","0 0 20px #6366F155","0 0 0px #6366F100"] }}
          transition={{ duration: 2, repeat: Infinity }}>
          <Camera size={22} style={{ color: "#6366F1" }} />
        </motion.div>
        <div>
          <h2 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>Video Analysis Center</h2>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Replay · Events · AI Coach · Highlights — Tout en un</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <motion.button key={t.id} type="button" onClick={() => setTab(t.id)}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold"
              style={{
                background: tab === t.id ? "linear-gradient(135deg,#6366F1,#4F46E5)" : "rgba(255,255,255,0.04)",
                color: tab === t.id ? "white" : "var(--text-muted)",
                boxShadow: tab === t.id ? "0 0 16px rgba(99,102,241,0.3)" : "none",
              }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
              <Icon size={12} /> {t.label}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* Replay tab */}
        {tab === "replay" && (
          <motion.div key="replay" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <MatchReplayTimeline events={events} />
          </motion.div>
        )}

        {/* AI Coach tab */}
        {tab === "ai-coach" && (
          <motion.div key="ai-coach" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <ACard>
              <div className="flex items-center gap-2 mb-4">
                <motion.div className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: "rgba(99,102,241,0.18)", color: "#6366F1" }}
                  animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                  <Mic size={14} />
                </motion.div>
                <div>
                  <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Analyse IA — {matchTitle}</p>
                  <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Rapport automatique · Confiance: 94%</p>
                </div>
              </div>
              <div className="rounded-xl border p-4 space-y-3"
                style={{ background: "rgba(99,102,241,0.06)", borderColor: "rgba(99,102,241,0.2)" }}>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-primary)" }}>
                  FC Carthage a délivré une performance solide en première période avec un pressing haut efficace
                  et une possession dominante (62%). La structure 4-3-3 a créé des espaces pour Mansouri sur le
                  côté gauche, générant 3 occasions franches.
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-primary)" }}>
                  En seconde période, la fatigue accumulée (89% à 80min) a affaibli le pressing. La perte de
                  balle à 78' en zone défensive exposait le couloir gauche. Le remplacement d'Ahmed à 61' était
                  tactiquement correct compte tenu de sa charge (92%) et fatigue (85%).
                </p>
                <p className="text-xs font-semibold" style={{ color: "#6366F1" }}>
                  Recommandation: Introduire rotation sur le milieu gauche dès 65min lors du prochain match.
                </p>
              </div>
            </ACard>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {AI_INSIGHTS.map((p, i) => {
                const trendColor = p.trend === "up" ? "#22C55E" : p.trend === "down" ? "#EF4444" : "#F59E0B";
                return (
                  <motion.div key={p.player} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                    <ACard>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{p.player}</p>
                          <TrendingUp size={10} className="inline mr-1" style={{ color: trendColor }} />
                          <span className="text-[10px]" style={{ color: trendColor }}>{p.trend === "up" ? "En hausse" : p.trend === "down" ? "En baisse" : "Stable"}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xl font-extrabold" style={{ color: p.rating >= 8 ? "#22C55E" : p.rating >= 7 ? "#F59E0B" : "#EF4444" }}>
                            {p.rating}
                          </span>
                          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>/10</span>
                        </div>
                      </div>
                      <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>{p.analysis}</p>
                    </ACard>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Highlights tab */}
        {tab === "highlights" && (
          <motion.div key="highlights" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            <ACard>
              <div className="flex items-center gap-2 mb-4">
                <Star size={14} style={{ color: "#F59E0B" }} />
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  Highlights auto-détectés — {HIGHLIGHTS.length} événements clés
                </p>
              </div>
              <div className="space-y-3">
                {HIGHLIGHTS.map((h, i) => {
                  const color = EVENT_COLORS[h.type] ?? "#8B5CF6";
                  return (
                    <motion.div key={h.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                      className="flex items-start gap-3 rounded-xl border p-3"
                      style={{ background: `${color}06`, borderColor: `${color}20` }}>
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <motion.div className="flex h-9 w-9 items-center justify-center rounded-xl"
                          style={{ background: `${color}18`, color }}
                          whileHover={{ scale: 1.15 }}>
                          <Play size={14} />
                        </motion.div>
                        <span className="text-[10px] font-black" style={{ color }}>{h.time}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold mr-2"
                              style={{ background: `${color}20`, color }}>{h.type}</span>
                            <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{h.player}</span>
                          </div>
                          <div className="flex items-center gap-1 rounded-full px-2 py-0.5"
                            style={{ background: "rgba(255,255,255,0.06)" }}>
                            <Zap size={9} style={{ color: "#F59E0B" }} />
                            <span className="text-[10px] font-bold" style={{ color: "#F59E0B" }}>{h.conf}%</span>
                          </div>
                        </div>
                        <p className="mt-1 text-[11px]" style={{ color: "var(--text-muted)" }}>{h.desc}</p>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {h.tags.map(tag => (
                            <span key={tag} className="rounded-full px-1.5 py-0.5 text-[9px]"
                              style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }}>{tag}</span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </ACard>
          </motion.div>
        )}
      </AnimatePresence>
    </AnalystePageTransition>
  );
}
