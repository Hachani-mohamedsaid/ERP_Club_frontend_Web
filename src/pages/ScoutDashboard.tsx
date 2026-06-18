import { Star, TrendingUp } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";
import { PerformanceChart } from "../components/coach/PerformanceChart";
import { AICard } from "../components/coach/AICard";
import { NotificationPanel } from "../components/coach/NotificationPanel";

const SCOUT_KPI = [
  { label: "Prospects évalués", value: 47, tone: "success" as const },
  { label: "Profils recommandés", value: 12, tone: "info" as const },
  { label: "En attente validation", value: 5, tone: "warning" as const },
];

const MARKET_TRENDS = [
  { name: "Jan", value: 18 },
  { name: "Fév", value: 24 },
  { name: "Mar", value: 31 },
  { name: "Avr", value: 28 },
  { name: "Mai", value: 35 },
  { name: "Juin", value: 42 },
];

const TOP_PROSPECTS = [
  { name: "Youssef Ben Ali", age: 17, position: "Attaquant", club: "AS Ariana", potential: 89, status: "Hot" },
  { name: "Nader Trabelsi", age: 19, position: "Milieu défensif", club: "Stade Tunisien", potential: 84, status: "Recommended" },
  { name: "Mouhamed Diallo", age: 21, position: "Ailier", club: "AFAD Djékanou", potential: 81, status: "Analyzing" },
  { name: "Karim Sassi", age: 22, position: "Défenseur central", club: "US Monastir", potential: 78, status: "Analyzing" },
];

const SCOUTING_REGIONS = [
  { name: "Tunisie", prospects: 23, recommendations: 5 },
  { name: "Afrique de l'Ouest", prospects: 12, recommendations: 4 },
  { name: "France", prospects: 8, recommendations: 2 },
  { name: "Belgique", prospects: 4, recommendations: 1 },
];

const RECENT_REPORTS = [
  { title: "Analyse offensive explosive", prospect: "Youssef Ben Ali", rating: 9.1, date: "Aujourd'hui" },
  { title: "Technique sûre et progressive", prospect: "Nader Trabelsi", rating: 8.4, date: "Hier" },
  { title: "Bon profil pour recrutement", prospect: "Mouhamed Diallo", rating: 8.1, date: "2 jours" },
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
          Analyse de prospects, rapports scouts et recommandations de recrutement
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {SCOUT_KPI.map((item) => (
          <GlassCard key={item.label} className="p-4">
            <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{item.label}</p>
            <p className="mt-3 text-3xl font-semibold" style={{ color: "var(--text-primary)" }}>{item.value}</p>
            <Badge tone={item.tone}>{item.tone === "warning" ? "En cours" : item.tone === "success" ? "Actif" : "Recommandé"}</Badge>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <PerformanceChart
          title="Activité Scout (6 mois)"
          subtitle="Nombre de prospects analysés par mois"
          data={MARKET_TRENDS}
          type="bar"
          height={280}
          dataKey="value"
        />

        <GlassCard raised className="p-6">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Régions de scouting
          </h2>
          <div className="space-y-3">
            {SCOUTING_REGIONS.map((region) => (
              <div key={region.name} className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="font-medium" style={{ color: "var(--text-primary)" }}>{region.name}</p>
                  <Badge tone="info">{region.recommendations} recommandés</Badge>
                </div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {region.prospects} prospects analysés
                </p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard raised className="p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Top Prospects
          </h2>
          <Star size={18} style={{ color: "var(--accent)" }} />
        </div>
        <div className="space-y-3">
          {TOP_PROSPECTS.map((prospect) => (
            <div
              key={prospect.name}
              className="rounded-[var(--radius-odin-md)] border p-4 transition-all duration-200 hover:bg-accent/5"
              style={{ borderColor: "var(--surface-panel-border)" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{prospect.name}</p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    {prospect.age} ans · {prospect.position} · {prospect.club}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold" style={{ color: "var(--accent)" }}>{prospect.potential}</p>
                  <Badge tone={prospect.status === "Hot" ? "danger" : prospect.status === "Recommended" ? "success" : "info"}>
                    {prospect.status}
                  </Badge>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[color:var(--surface-panel-border)]">
                <div
                  className="h-2 rounded-full"
                  style={{ width: `${prospect.potential}%`, background: "var(--accent)" }}
                />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <GlassCard raised className="p-6 xl:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} style={{ color: "var(--accent)" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Derniers rapports
            </h2>
          </div>
          <div className="space-y-3">
            {RECENT_REPORTS.map((report) => (
              <div key={report.prospect} className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-medium" style={{ color: "var(--text-primary)" }}>{report.title}</p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{report.prospect}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold" style={{ color: "var(--accent)" }}>{report.rating}</p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{report.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="space-y-4">
          <AICard
            title="Prospect du mois"
            message="Youssef Ben Ali : profil exceptionnel en phase offensive avec potentiel 89/100"
            accent="success"
          />
          <NotificationPanel notifications={NOTIFICATIONS} />
        </div>
      </div>
    </div>
  );
}
