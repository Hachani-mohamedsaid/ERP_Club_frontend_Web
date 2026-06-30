import { motion } from "framer-motion";
import { Sparkles, Brain, Activity, Crosshair } from "lucide-react";
import { AnalystePageTransition } from "../../components/analyste/AnalystePageTransition";
import { AnalysteKpiCard } from "../../components/analyste/AnalysteKpiCard";
import { AnalystePageLoader } from "../../components/analyste/AnalystePageLoader";
import { TypewriterText } from "../../components/analyste/TypewriterText";
import { useAnalystePatterns } from "../../hooks/useAnalysteResource";

const CATEGORY_CONFIG = {
  performance: { icon: Brain, color: "#8B5CF6", label: "Performance" },
  injury: { icon: Activity, color: "#EF4444", label: "Blessure" },
  tactical: { icon: Crosshair, color: "#6366F1", label: "Tactique" },
};

export function AnalystePatternsPage() {
  const { data, loading } = useAnalystePatterns();
  if (loading && !data) return <AnalystePageLoader />;

  const { patterns, summary } = data!;

  return (
    <AnalystePageTransition>
      <div className="flex items-center gap-3">
        <Sparkles size={24} style={{ color: "#8B5CF6" }} />
        <div>
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Deep Learning Insights</h2>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Pattern Detection Premium · Découvertes automatiques IA</p>
        </div>
      </div>

      <AnalysteKpiCard glow delay={0.05}>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          <TypewriterText text={summary} speed={16} />
        </p>
      </AnalysteKpiCard>

      <div className="space-y-4">
        {patterns.map((p, i) => {
          const cfg = CATEGORY_CONFIG[p.category];
          const Icon = cfg.icon;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.1 }}
            >
              <AnalysteKpiCard hover={false}>
                <div className="flex flex-wrap items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ background: `${cfg.color}20` }}>
                    <Icon size={22} style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase" style={{ background: `${cfg.color}20`, color: cfg.color }}>{cfg.label}</span>
                      <span className="text-xs font-bold" style={{ color: cfg.color }}>{p.confidence}% confiance</span>
                    </div>
                    <p className="mt-2 text-base font-medium" style={{ color: "var(--text-primary)" }}>{p.pattern}</p>
                  </div>
                  <div className="h-2 w-32 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <motion.div className="h-full rounded-full" style={{ background: cfg.color }} initial={{ width: 0 }} animate={{ width: `${p.confidence}%` }} transition={{ duration: 1, delay: 0.3 + i * 0.1 }} />
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
