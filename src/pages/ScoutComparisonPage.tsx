import { ArrowLeftRight } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const PLAYER_A = {
  name: "Youssef Ben Ali",
  age: 17,
  potential: 89,
  marketValue: "1.2M €",
  height: "182cm",
  weight: "72kg",
  stats: [
    { subject: "Technique", value: 88 },
    { subject: "Physique", value: 85 },
    { subject: "Mental", value: 82 },
    { subject: "Tactique", value: 79 },
    { subject: "Vitesse", value: 91 },
  ],
};

const PLAYER_B = {
  name: "Nader Trabelsi",
  age: 19,
  potential: 84,
  marketValue: "850K €",
  height: "178cm",
  weight: "70kg",
  stats: [
    { subject: "Technique", value: 85 },
    { subject: "Physique", value: 82 },
    { subject: "Mental", value: 88 },
    { subject: "Tactique", value: 86 },
    { subject: "Vitesse", value: 78 },
  ],
};

export function ScoutComparisonPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-4">
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-center" style={{ color: "var(--text-primary)" }}>
            {PLAYER_A.name}
          </h1>
        </div>
        <div className="flex items-center justify-center w-12 h-12 rounded-full" style={{ background: "var(--accent)" }}>
          <ArrowLeftRight size={20} style={{ color: "white" }} />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-center" style={{ color: "var(--text-primary)" }}>
            {PLAYER_B.name}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <GlassCard raised className="p-6">
          <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            Radar - {PLAYER_A.name}
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={PLAYER_A.stats}>
                <PolarGrid stroke="var(--surface-panel-border)" />
                <PolarAngleAxis dataKey="subject" stroke="var(--text-muted)" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                <Radar
                  name="Compétences"
                  dataKey="value"
                  stroke="var(--accent)"
                  fill="var(--accent)"
                  fillOpacity={0.3}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface-panel)",
                    border: "1px solid var(--surface-panel-border)",
                    color: "var(--text-primary)",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard raised className="p-6">
          <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            Radar - {PLAYER_B.name}
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={PLAYER_B.stats}>
                <PolarGrid stroke="var(--surface-panel-border)" />
                <PolarAngleAxis dataKey="subject" stroke="var(--text-muted)" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                <Radar
                  name="Compétences"
                  dataKey="value"
                  stroke="var(--color-state-warning)"
                  fill="var(--color-state-warning)"
                  fillOpacity={0.3}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface-panel)",
                    border: "1px solid var(--surface-panel-border)",
                    color: "var(--text-primary)",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <GlassCard raised className="p-6">
        <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          Comparaison détaillée
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: "var(--text-muted)" }}>
                <th className="pb-3 text-xs font-medium text-center">Critère</th>
                <th className="pb-3 text-xs font-medium text-center">{PLAYER_A.name}</th>
                <th className="pb-3 text-xs font-medium text-center">{PLAYER_B.name}</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Âge", a: PLAYER_A.age, b: PLAYER_B.age },
                { label: "Potentiel", a: PLAYER_A.potential, b: PLAYER_B.potential },
                { label: "Valeur", a: PLAYER_A.marketValue, b: PLAYER_B.marketValue },
                { label: "Taille", a: PLAYER_A.height, b: PLAYER_B.height },
                { label: "Poids", a: PLAYER_A.weight, b: PLAYER_B.weight },
              ].map((row, idx) => (
                <tr key={idx} style={{ borderTop: "1px solid var(--surface-panel-border)" }} className="hover:bg-accent/5">
                  <td className="py-3 font-medium" style={{ color: "var(--text-primary)" }}>
                    {row.label}
                  </td>
                  <td className="py-3 text-center" style={{ color: "var(--text-secondary)" }}>
                    {row.a}
                  </td>
                  <td className="py-3 text-center" style={{ color: "var(--text-secondary)" }}>
                    {row.b}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
