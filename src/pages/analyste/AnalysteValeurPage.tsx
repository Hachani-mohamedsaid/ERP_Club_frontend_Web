import { motion } from "framer-motion";
import { DollarSign, TrendingUp } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";
import { AnalystePageTransition } from "../../components/analyste/AnalystePageTransition";
import { AnalysteKpiCard } from "../../components/analyste/AnalysteKpiCard";
import { AnalystePageLoader } from "../../components/analyste/AnalystePageLoader";
import { useAnalysteMarketValue } from "../../hooks/useAnalysteResource";

export function AnalysteValeurPage() {
  const { data, loading } = useAnalysteMarketValue();
  if (loading && !data) return <AnalystePageLoader />;

  const { values } = data!;

  return (
    <AnalystePageTransition>
      <div className="flex items-center gap-3">
        <DollarSign size={24} style={{ color: "#F59E0B" }} />
        <div>
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Player Market Value Predictor</h2>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Estimation IA · Projection 3 / 6 mois</p>
        </div>
      </div>

      {values.map((p, i) => {
        const radarData = p.factors.map((f) => ({ factor: f.label, score: f.score }));
        return (
          <div key={p.player} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AnalysteKpiCard delay={i * 0.08} glow>
              <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{p.player}</h3>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { label: "Actuelle", value: p.current, highlight: false },
                  { label: "3 mois", value: p.m3, highlight: true },
                  { label: "6 mois", value: p.m6, highlight: true },
                ].map((v) => (
                  <motion.div
                    key={v.label}
                    className="rounded-xl border p-3 text-center"
                    style={{ borderColor: v.highlight ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.05)", background: v.highlight ? "rgba(34,197,94,0.06)" : "transparent" }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <p className="text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>{v.label}</p>
                    <p className="mt-1 text-xl font-bold" style={{ color: v.highlight ? "#22C55E" : "var(--text-primary)" }}>{v.value}</p>
                    {v.highlight && <TrendingUp size={14} className="mx-auto mt-1" style={{ color: "#22C55E" }} />}
                  </motion.div>
                ))}
              </div>
            </AnalysteKpiCard>
            <AnalysteKpiCard delay={0.1 + i * 0.08}>
              <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Facteurs de valorisation</h3>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="factor" tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                  <Radar dataKey="score" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} animationDuration={1200} />
                  <Tooltip contentStyle={{ background: "#0F1D3A", border: "1px solid var(--surface-panel-border)", borderRadius: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            </AnalysteKpiCard>
          </div>
        );
      })}
    </AnalystePageTransition>
  );
}
