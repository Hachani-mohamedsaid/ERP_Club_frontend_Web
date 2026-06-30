import { TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, ReferenceLine } from "recharts";
import { AnalystePageTransition } from "../../components/analyste/AnalystePageTransition";
import { AnalysteKpiCard } from "../../components/analyste/AnalysteKpiCard";
import { AnalystePageLoader } from "../../components/analyste/AnalystePageLoader";
import { CountUpStat } from "../../components/player/CountUpStat";
import { useAnalysteEvolution } from "../../hooks/useAnalysteResource";

export function AnalysteEvolutionPage() {
  const { data, loading } = useAnalysteEvolution();
  if (loading && !data) return <AnalystePageLoader />;

  const { forecasts } = data!;
  const forecast = forecasts[0];

  return (
    <AnalystePageTransition>
      <div className="flex items-center gap-3">
        <TrendingUp size={24} style={{ color: "#22C55E" }} />
        <div>
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Physical Evolution Lab</h2>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Deep Learning · Forecast ML · Courbe prédictive</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: `${forecast.metric} actuelle`, value: forecast.current, color: "#8B5CF6" },
          { label: "30 jours", value: forecast.forecast30, color: "#6366F1" },
          { label: "90 jours", value: forecast.forecast90, color: "#22C55E" },
        ].map((k) => (
          <AnalysteKpiCard key={k.label} delay={0.05}>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{k.label}</p>
            <p className="mt-2 text-4xl font-bold" style={{ color: k.color }}><CountUpStat end={k.value} /></p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{forecast.player}</p>
          </AnalysteKpiCard>
        ))}
      </div>

      {forecasts.map((f, i) => (
        <AnalysteKpiCard key={f.player} delay={0.1 + i * 0.05}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{f.player} — {f.metric} (ML Forecast)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={f.history}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <YAxis domain={[80, 96]} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0F1D3A", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12 }} />
              <ReferenceLine x="Juin" stroke="rgba(139,92,246,0.5)" strokeDasharray="4 4" label={{ value: "Aujourd'hui", fill: "#8B5CF6", fontSize: 10 }} />
              <Line type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 4 }} animationDuration={1500} name="Réel" connectNulls />
            </LineChart>
          </ResponsiveContainer>
          <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>Points Juil–Sep : prédictions modèle XGBoost (confiance 87%)</p>
        </AnalysteKpiCard>
      ))}
    </AnalystePageTransition>
  );
}
