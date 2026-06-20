import { motion } from "framer-motion";
import { Shield, Target, Users, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { AnalystePageTransition } from "../../components/analyste/AnalystePageTransition";
import { AnalysteKpiCard } from "../../components/analyste/AnalysteKpiCard";
import { TypewriterText } from "../../components/analyste/TypewriterText";
import { OPPONENT_INTEL } from "../../data/analysteData";

export function AnalysteAdversairePage() {
  const intel = OPPONENT_INTEL;
  const attackData = [
    { zone: "Gauche", pct: intel.leftPct, color: "#EF4444" },
    { zone: "Centre", pct: intel.centerPct, color: "#F59E0B" },
    { zone: "Droit", pct: intel.rightPct, color: "#6366F1" },
  ];

  return (
    <AnalystePageTransition>
      <div className="flex items-center gap-3">
        <Shield size={24} style={{ color: "#FF6B57" }} />
        <div>
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Opponent Intelligence — {intel.name}</h2>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Plan de match IA · Heatmap · Faiblesses</p>
        </div>
      </div>

      <AnalysteKpiCard glow delay={0.05}>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          <Target size={16} style={{ color: "#8B5CF6" }} /> Plan de Match IA
        </h3>
        <p className="mb-4 text-sm" style={{ color: "var(--text-secondary)" }}>
          <TypewriterText text={`${intel.name} joue: ${intel.leftPct}% côté gauche, ${intel.centerPct}% centre, ${intel.rightPct}% côté droit. Conseil: ${intel.advice.join(". ")}.`} speed={18} />
        </p>
        <div className="flex flex-wrap gap-2">
          {intel.advice.map((a) => (
            <span key={a} className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: "rgba(139,92,246,0.15)", color: "#8B5CF6" }}>{a}</span>
          ))}
        </div>
      </AnalysteKpiCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AnalysteKpiCard delay={0.1}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Répartition attaques adversaire</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={attackData}>
              <XAxis dataKey="zone" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} domain={[0, 50]} />
              <Tooltip contentStyle={{ background: "#0F1D3A", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12 }} />
              <Bar dataKey="pct" radius={[8, 8, 0, 0]} animationDuration={1200}>
                {attackData.map((d) => <Cell key={d.zone} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </AnalysteKpiCard>

        <AnalysteKpiCard delay={0.15}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Heatmap — Zones dangereuses</h3>
          <div className="grid grid-cols-2 gap-2">
            {intel.dangerZones.map((z, i) => (
              <motion.div
                key={z.zone}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="rounded-xl border p-3 text-center"
                style={{
                  borderColor: `rgba(239,68,68,${z.intensity / 200})`,
                  background: `rgba(239,68,68,${z.intensity / 400})`,
                }}
              >
                <motion.div
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                >
                  <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{z.zone}</p>
                  <p className="text-2xl font-bold" style={{ color: "#EF4444" }}>{z.intensity}%</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </AnalysteKpiCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AnalysteKpiCard delay={0.2}>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            <Users size={16} /> Joueurs clés
          </h3>
          <div className="space-y-2">
            {intel.keyPlayers.map((p) => (
              <div key={p.name} className="flex items-center justify-between rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.03)" }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{p.role}</p>
                </div>
                <span className="text-lg font-bold" style={{ color: p.threat >= 85 ? "#EF4444" : "#F59E0B" }}>{p.threat}</span>
              </div>
            ))}
          </div>
        </AnalysteKpiCard>

        <AnalysteKpiCard delay={0.25}>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            <AlertTriangle size={16} style={{ color: "#F59E0B" }} /> Faiblesses
          </h3>
          <ul className="space-y-2">
            {intel.weaknesses.map((w) => (
              <li key={w} className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: "rgba(245,158,11,0.2)", color: "var(--text-secondary)" }}>• {w}</li>
            ))}
          </ul>
        </AnalysteKpiCard>
      </div>
    </AnalystePageTransition>
  );
}
