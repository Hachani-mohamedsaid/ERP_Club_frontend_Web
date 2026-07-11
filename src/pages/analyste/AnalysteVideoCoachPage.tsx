import { useState } from "react";
import { motion } from "framer-motion";
import { Mic, Play, Volume2, Star, AlertCircle, Target, TrendingUp } from "lucide-react";
import { AnalystePageTransition } from "../../components/analyste/AnalystePageTransition";
import { AnalysteKpiCard } from "../../components/analyste/AnalysteKpiCard";
import { AnalystePageLoader } from "../../components/analyste/AnalystePageLoader";
import { useAnalysteVideoCoach } from "../../hooks/useAnalysteResource";

const CATEGORY_CONFIG = {
  top: { icon: Star, color: "#22C55E", label: "Top actions" },
  strong: { icon: TrendingUp, color: "#6366F1", label: "Points forts" },
  error: { icon: AlertCircle, color: "#EF4444", label: "Erreurs" },
  weak: { icon: Target, color: "#F59E0B", label: "Zones faibles" },
};

export function AnalysteVideoCoachPage() {
  const { data, loading } = useAnalysteVideoCoach();
  const [playing, setPlaying] = useState(false);

  if (loading && !data) return <AnalystePageLoader />;

  const { insights } = data!;

  return (
    <AnalystePageTransition>
      <div className="flex items-center gap-3">
        <Mic size={24} style={{ color: "#FF6B57" }} />
        <div>
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>AI Video Coach</h2>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Summary post-match · Voice AI · Analyse automatique</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <AnalysteKpiCard glow className="lg:col-span-2">
          <div className="relative aspect-video overflow-hidden rounded-xl" style={{ background: "linear-gradient(135deg, #0F1D3A, #1a1040)" }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                type="button"
                onClick={() => setPlaying(!playing)}
                className="flex h-16 w-16 items-center justify-center rounded-full border-2 transition-transform hover:scale-110"
                style={{ borderColor: "rgba(255,107,87,0.5)", background: "rgba(255,107,87,0.15)" }}
              >
                <Play size={28} style={{ color: "#FF6B57" }} fill="#FF6B57" />
              </button>
            </div>
            {playing && (
              <motion.div
                className="absolute bottom-4 left-4 right-4 rounded-xl border p-3"
                style={{ background: "rgba(0,0,0,0.7)", borderColor: "rgba(255,107,87,0.3)" }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2">
                  <Volume2 size={14} style={{ color: "#FF6B57" }} />
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    « Ahmed, excellent appel à 25 minutes. Attention couloir droit en 2ème MT — 3 occasions concédées. »
                  </p>
                </div>
              </motion.div>
            )}
            <p className="absolute left-4 top-4 text-xs font-medium" style={{ color: "var(--text-muted)" }}>FC Carthage 2-1 EST · AI Summary</p>
          </div>
        </AnalysteKpiCard>

        <AnalysteKpiCard delay={0.1}>
          <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Voice AI Coach</h3>
          <div className="space-y-3">
            {["Analyse offensive", "Défense & transitions", "Recommandations"].map((s, i) => (
              <motion.button
                key={s}
                type="button"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors hover:bg-white/[0.04]"
                style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-secondary)" }}
              >
                <Volume2 size={14} style={{ color: "#FF6B57" }} /> {s}
              </motion.button>
            ))}
          </div>
        </AnalysteKpiCard>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {insights.map((insight, i) => {
          const cfg = CATEGORY_CONFIG[insight.category];
          const Icon = cfg.icon;
          return (
            <motion.div
              key={insight.title}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
            >
              <AnalysteKpiCard hover={false}>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: `${cfg.color}20` }}>
                    <Icon size={18} style={{ color: cfg.color }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase" style={{ color: cfg.color }}>{cfg.label}</span>
                      {insight.timestamp && <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{insight.timestamp}</span>}
                    </div>
                    <p className="mt-1 font-semibold" style={{ color: "var(--text-primary)" }}>{insight.title}</p>
                    <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>{insight.detail}</p>
                  </div>
                </div>
              </AnalysteKpiCard>
            </motion.div>
          );
        })}
      </div>
    </AnalystePageTransition>
  );
}
