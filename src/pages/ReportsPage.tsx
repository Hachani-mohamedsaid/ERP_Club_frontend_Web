import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";
import { useAuth } from "../contexts/AuthContext";
import { PerformanceChart } from "../components/coach/PerformanceChart";
import { AICard } from "../components/coach/AICard";
import { NotificationPanel } from "../components/coach/NotificationPanel";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const RESPONSABLE_KPI_CARDS = [
  { label: "Revenus mensuels", value: "1.2M DT", tone: "success" as const },
  { label: "ROE", value: "+18%", tone: "info" as const },
  { label: "Prospects finals", value: 14, tone: "warning" as const },
];

const COACH_KPI_CARDS = [
  { label: "Performance équipe", value: "87/100", tone: "success" as const },
  { label: "Évolution joueurs", value: "+6%", tone: "info" as const },
  { label: "Blessures actives", value: 3, tone: "warning" as const },
];

const RECRUITMENT_BREAKDOWN = [
  { name: "Validés", value: 14 },
  { name: "En cours", value: 9 },
  { name: "Refusés", value: 5 },
];

const REVENUE_HISTORY = [
  { name: "Jan", value: 720 },
  { name: "Fév", value: 810 },
  { name: "Mar", value: 910 },
  { name: "Avr", value: 860 },
  { name: "Mai", value: 980 },
  { name: "Juin", value: 1040 },
];

const MEDICAL_TREND = [
  { name: "S1", value: 18 },
  { name: "S2", value: 16 },
  { name: "S3", value: 14 },
  { name: "S4", value: 12 },
  { name: "S5", value: 10 },
];

const RADAR_DATA = [
  { subject: "Physique", A: 88, fullMark: 100 },
  { subject: "Technique", A: 82, fullMark: 100 },
  { subject: "Tactique", A: 79, fullMark: 100 },
  { subject: "Mental", A: 84, fullMark: 100 },
  { subject: "Discipline", A: 75, fullMark: 100 },
];

const PLAYER_PROFILE = {
  name: "Yassine Brahmi",
  position: "BU",
  age: 28,
  status: "En forme",
  score: 87,
  recent: "4 buts, 2 passes décisives",
};

const NOTIFICATIONS = [
  { title: "Charge physique élevée", subtitle: "Séance du 22 juin" },
  { title: "Blessure mineure détectée", subtitle: "Ali Ben Youssef — genou" },
  { title: "Nouvelle opportunité", subtitle: "Prospect milieu défensif à valider" },
];

const COLORS = ["#f97316", "#22c55e", "#38bdf8"];

export function ReportsPage() {
  const { user } = useAuth();
  const isCoach = user?.role === "coach";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Rapports</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {isCoach
            ? "Rapports sportifs, progression et gestion des blessures"
            : "Rapports financiers, recrutement et médical consolidés"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {(isCoach ? COACH_KPI_CARDS : RESPONSABLE_KPI_CARDS).map((item) => (
          <GlassCard key={item.label} className="p-4">
            <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{item.label}</p>
            <p className="mt-3 text-3xl font-semibold" style={{ color: "var(--text-primary)" }}>{item.value}</p>
            <Badge tone={item.tone}>{item.tone === "success" ? "Stable" : item.tone === "info" ? "Suivi" : "Urgent"}</Badge>
          </GlassCard>
        ))}
      </div>

      {isCoach ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <GlassCard raised className="p-6 xl:col-span-2">
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Radar des performances</h2>
            <div className="mt-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={RADAR_DATA}>
                  <PolarGrid stroke="var(--surface-panel-border)" />
                  <PolarAngleAxis dataKey="subject" stroke="var(--text-muted)" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                  <Radar name="Team" dataKey="A" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.3} />
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

          <div className="space-y-4">
            <AICard
              title="Recommandation IA"
              message="Yassine Brahmi est en forme optimale pour le prochain match."
              accent="success"
            />
            <AICard
              title="Risque Blessure"
              message="Ahmed Ben Salah : risque élevé 72% dans les 48 prochaines heures."
              accent="warning"
            />
            <GlassCard className="p-5">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Profil joueur</p>
              <p className="mt-3 text-base font-semibold" style={{ color: "var(--text-primary)" }}>{PLAYER_PROFILE.name}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{PLAYER_PROFILE.position} · {PLAYER_PROFILE.age} ans · {PLAYER_PROFILE.status}</p>
              <div className="mt-3 rounded-[var(--radius-odin-md)] border px-3 py-3" style={{ borderColor: "var(--surface-panel-border)" }}>
                <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Forme</p>
                <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--accent)" }}>{PLAYER_PROFILE.score}/100</p>
                <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>{PLAYER_PROFILE.recent}</p>
              </div>
            </GlassCard>
            <NotificationPanel notifications={NOTIFICATIONS} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <GlassCard raised className="p-6">
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Recrutement par statut</h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={RECRUITMENT_BREAKDOWN} dataKey="value" nameKey="name" innerRadius={42} outerRadius={88} paddingAngle={5} stroke="var(--surface-panel-border)">
                    {RECRUITMENT_BREAKDOWN.map((entry, index) => (
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
                  <Legend verticalAlign="bottom" height={30} wrapperStyle={{ color: "var(--text-muted)" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <PerformanceChart
            title="Revenus mensuels"
            subtitle="Performance financière trimestrielle"
            data={REVENUE_HISTORY}
            type="area"
            height={280}
            dataKey="value"
          />

          <PerformanceChart
            title="Tendance médicale"
            subtitle="Nombre de blessures actives"
            data={MEDICAL_TREND}
            type="line"
            height={280}
            dataKey="value"
          />
        </div>
      )}
    </div>
  );
}
