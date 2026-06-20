import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { AnalystePageTransition } from "../../components/analyste/AnalystePageTransition";
import { AnalysteKpiCard } from "../../components/analyste/AnalysteKpiCard";
import { ProgressRing } from "../../components/analyste/ProgressRing";
import { SCOUTING_COMPARE } from "../../data/analysteData";

export function AnalysteScoutingPage() {
  const data = SCOUTING_COMPARE;
  const radarData = [
    { stat: "OVR", internal: data.internal.ovr, external: data.external.ovr },
    { stat: "Vitesse", internal: data.internal.speed, external: data.external.speed },
    { stat: "Technique", internal: data.internal.technique, external: data.external.technique },
    { stat: "Physique", internal: data.internal.physical, external: data.external.physical },
    { stat: "Potentiel", internal: data.internal.potential, external: data.external.potential },
  ];

  return (
    <AnalystePageTransition>
      <div className="flex items-center gap-3">
        <Search size={24} style={{ color: "#3B82F6" }} />
        <div>
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Scouting Intelligence</h2>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Comparaison IA · Similarité · Top 10 joueurs similaires</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <AnalysteKpiCard glow className="flex flex-col items-center justify-center lg:col-span-1">
          <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Similarité IA</p>
          <div className="my-4">
            <ProgressRing value={data.similarity} size={140} stroke={10} color="#3B82F6" />
          </div>
          <p className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
            {data.internal.name} vs {data.external.name}
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{data.external.club}</p>
        </AnalysteKpiCard>

        <AnalysteKpiCard delay={0.1} className="lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Radar comparatif</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="stat" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <Radar name={data.internal.name.split(" ")[0]} dataKey="internal" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.25} animationDuration={1000} />
              <Radar name={data.external.name.split(" ")[0]} dataKey="external" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} animationDuration={1000} />
              <Tooltip contentStyle={{ background: "#0F1D3A", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12 }} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </AnalysteKpiCard>
      </div>

      <AnalysteKpiCard delay={0.15}>
        <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Top 10 joueurs similaires</h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {data.similarPlayers.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="rounded-xl border p-3 transition-colors hover:bg-white/[0.04]"
              style={{ borderColor: "rgba(255,255,255,0.05)" }}
            >
              <p className="text-xs font-bold" style={{ color: "#3B82F6" }}>#{i + 1}</p>
              <p className="mt-1 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{p.name}</p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{p.club}</p>
              <p className="mt-2 text-lg font-bold" style={{ color: "#22C55E" }}>{p.match}%</p>
            </motion.div>
          ))}
        </div>
      </AnalysteKpiCard>
    </AnalystePageTransition>
  );
}
