import { DollarSign, AlertCircle, TrendingUp } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

interface Sponsor {
  id: string;
  nom: string;
  montant: number;
  duree: string;
  statut: "Actif" | "Expire bientot" | "Expire";
}

const SPONSORS: Sponsor[] = [
  { id: "1", nom: "Nike", montant: 450000, duree: "2 ans", statut: "Actif" },
  { id: "2", nom: "Emirates", montant: 350000, duree: "3 ans", statut: "Actif" },
  { id: "3", nom: "Ooredoo", montant: 280000, duree: "1 an", statut: "Expire bientot" },
  { id: "4", nom: "STEG", montant: 200000, duree: "2 ans", statut: "Actif" },
];

const KPI_CARDS = [
  { label: "Sponsor Principal", value: "Nike", change: "35%", icon: DollarSign, color: "#3B82F6" },
  { label: "Total Sponsoring", value: "1.28 M DT", change: "+12%", icon: TrendingUp, color: "#10B981" },
  { label: "Contrats proches", value: "1", change: "—", icon: AlertCircle, color: "#F59E0B" },
  { label: "Évolution revenus", value: "+8%", change: "+8% vs N-1", icon: TrendingUp, color: "#8B5CF6" },
];

const STATUS_CONFIG = {
  Actif: { color: "#10B981", bg: "#ECFDF5", label: "Actif" },
  "Expire bientot": { color: "#F59E0B", bg: "#FFFBEB", label: "Expire bientôt" },
  Expire: { color: "#EF4444", bg: "#FEF2F2", label: "Expiré" },
};

export function SponsorsFinance() {
  const CONTRIBUTION = SPONSORS.map((s) => ({ name: s.nom, value: Math.round((s.montant / SPONSORS.reduce((a, b) => a + b.montant, 0)) * 100) }));
  const COLORS = ["#6366F1", "#06B6D4", "#EF4444", "#F59E0B", "#10B981"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Gestion des Sponsors
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Suivi des partenaires et des revenus de sponsoring
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {KPI_CARDS.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <GlassCard key={kpi.label} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                    {kpi.label}
                  </p>
                  <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                    {kpi.value}
                  </p>
                  <p className="mt-1 text-xs font-medium" style={{ color: kpi.color }}>
                    {kpi.change}
                  </p>
                </div>
                <Icon size={20} style={{ color: kpi.color, opacity: 0.6 }} />
              </div>
            </GlassCard>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <GlassCard raised className="col-span-1 p-6 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Liste des Sponsors
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--surface-panel-border)" }}>
                  <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-muted)" }}>
                    Sponsor
                  </th>
                  <th className="px-4 py-3 text-right font-semibold" style={{ color: "var(--text-muted)" }}>
                    Montant Annuel
                  </th>
                  <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-muted)" }}>
                    Durée
                  </th>
                  <th className="px-4 py-3 text-center font-semibold" style={{ color: "var(--text-muted)" }}>
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {SPONSORS.map((sponsor) => {
                  const config = STATUS_CONFIG[sponsor.statut as keyof typeof STATUS_CONFIG];
                  return (
                    <tr key={sponsor.id} style={{ borderBottom: "1px solid var(--surface-panel-border)" }}>
                      <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>
                        {sponsor.nom}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold" style={{ color: "var(--text-primary)" }}>
                        {sponsor.montant.toLocaleString("fr-TN")} DT
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                        {sponsor.duree}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge tone={sponsor.statut === "Actif" ? "success" : "warning"}>
                          {config.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard raised className="p-6">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Contribution Sponsors
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={CONTRIBUTION} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={4}>
                {CONTRIBUTION.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "var(--surface-panel)", border: "1px solid var(--surface-panel-border)", borderRadius: 8 }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 text-xs space-y-2">
            {CONTRIBUTION.map((c) => (
              <div key={c.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ background: COLORS[CONTRIBUTION.findIndex((x) => x.name === c.name) % COLORS.length] }} />
                  <span style={{ color: "var(--text-secondary)" }}>{c.name}</span>
                </div>
                <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{c.value}%</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
