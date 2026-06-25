import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { AnalystePageTransition } from "../../components/analyste/AnalystePageTransition";
import { AnalysteKpiCard } from "../../components/analyste/AnalysteKpiCard";
import { ProgressRing } from "../../components/analyste/ProgressRing";
import { INJURY_PREDICTIONS } from "../../data/analysteData";

export function AnalysteBlessuresPage() {
  return (
    <AnalystePageTransition>
      <div className="flex items-center gap-3">
        <Activity size={24} style={{ color: "#EF4444" }} />
        <div>
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Injury Prediction Lab</h2>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Modèle ML — Probabilités 7 / 14 / 30 jours</p>
        </div>
      </div>

      <div className="space-y-6">
        {INJURY_PREDICTIONS.map((p, i) => (
          <AnalysteKpiCard key={p.id} delay={i * 0.08}>
            <div className="flex flex-wrap items-start gap-6">
              <div className="flex-1 min-w-[200px]">
                <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{p.name}</h3>
                <p className="mt-1 text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Contributing Factors</p>
                <div className="mt-3 space-y-2">
                  {p.factors.map((f) => (
                    <div key={f.label}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span style={{ color: "var(--text-secondary)" }}>{f.label}</span>
                        <span style={{ color: f.color }}>{f.value}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: f.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${f.value}%` }}
                          transition={{ duration: 1, delay: 0.2 + i * 0.1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <ProgressRing value={p.prob7} color="#EF4444" label="7j" />
                <ProgressRing value={p.prob14} color="#F59E0B" label="14j" />
                <ProgressRing value={p.prob30} color="#22C55E" label="30j" />
              </div>
            </div>
          </AnalysteKpiCard>
        ))}
      </div>
    </AnalystePageTransition>
  );
}
