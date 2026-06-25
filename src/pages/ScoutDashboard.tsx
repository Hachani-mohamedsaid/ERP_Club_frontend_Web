import { Star, Zap } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";
import { NotificationPanel } from "../components/coach/NotificationPanel";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const SCOUT_KPI = [
  { label: "Prospects observés", value: 42, tone: "info" as const },
  { label: "Rapports créés", value: 18, tone: "success" as const },
  { label: "Favoris", value: 7, tone: "info" as const },
  { label: "Recrutements validés", value: 5, tone: "success" as const },
];

const PROSPECTS_BY_POSITION = [
  { name: "BU", value: 8 },
  { name: "MC", value: 6 },
  { name: "DG", value: 4 },
  { name: "DD", value: 5 },
  { name: "DC", value: 7 },
  { name: "Ailier", value: 3 },
];

const PROSPECTS_BY_COUNTRY = [
  { name: "Tunisie", value: 18 },
  { name: "Algérie", value: 10 },
  { name: "Maroc", value: 8 },
  { name: "Côte d'Ivoire", value: 4 },
  { name: "Sénégal", value: 2 },
];

const COLORS = ["#FF6B57", "#22C55E", "#38BDF8", "#F59E0B", "#8B5CF6", "#EC4899"];

const AI_RECOMMENDATIONS = [
  { player: "Youssef Ben Ali", potential: 89, reason: "Potentiel offensive remarquable" },
  { player: "Mohamed Diallo", potential: 85, reason: "Profil défensif très solide" },
];

const NOTIFICATIONS = [
  { title: "Nouveau prospect chaud", subtitle: "Youssef Ben Ali - Potentiel 89" },
  { title: "Rapport scout urgent", subtitle: "3 prospects attendent validation" },
  { title: "Match à suivre demain", subtitle: "Nader Trabelsi joue pour Stade Tunisien" },
];

export function ScoutDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Tableau de Bord Scout
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Analyse de prospects, rapports scouts et recommandations
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {SCOUT_KPI.map((item) => (
          <GlassCard key={item.label} className="p-4">
            <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{item.label}</p>
            <p className="mt-3 text-3xl font-semibold" style={{ color: "var(--text-primary)" }}>{item.value}</p>
            <Badge tone={item.tone}>{item.tone === "success" ? "Actif" : "En cours"}</Badge>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <GlassCard raised className="p-6">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Prospects par poste
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PROSPECTS_BY_POSITION}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface-panel)",
                    border: "1px solid var(--surface-panel-border)",
                    color: "var(--text-primary)",
                  }}
                />
                <Bar dataKey="value" fill="var(--accent)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard raised className="p-6">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Prospects par pays
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={PROSPECTS_BY_COUNTRY} dataKey="value" nameKey="name" innerRadius={42} outerRadius={88} paddingAngle={5}>
                  {PROSPECTS_BY_COUNTRY.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--surface-panel)",
                    border: "1px solid var(--surface-panel-border)",
                    color: "var(--text-primary)",
                  }}
                />
                <Legend verticalAlign="bottom" height={30} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-4 items-start xl:grid-cols-2">
        <GlassCard raised className="p-6 xl:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={18} style={{ color: "var(--accent)" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              🤖 Recommandations ODIN
            </h2>
          </div>
          <div className="space-y-3">
            {AI_RECOMMENDATIONS.map((rec, idx) => (
              <div key={idx} className="rounded-[var(--radius-odin-md)] border p-4 flex items-start justify-between gap-3" style={{ borderColor: "var(--surface-panel-border)" }}>
                <div className="flex-1">
                  <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                    {rec.player}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                    {rec.reason}
                  </p>
                </div>
                <div className="text-right">
                  <Star size={18} fill="var(--accent)" style={{ color: "var(--accent)" }} />
                  <p className="text-lg font-bold mt-1" style={{ color: "var(--accent)" }}>
                    {rec.potential}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <NotificationPanel notifications={NOTIFICATIONS} />
      </div>
    </div>
  );
}
