import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";
import { ChartLine } from "lucide-react";
import { PerformanceChart } from "../components/coach/PerformanceChart";

const TEAM_STATS = [
  { label: "Victoires", value: 12 },
  { label: "Défaites", value: 3 },
  { label: "Nuls", value: 4 },
  { label: "Buts marqués", value: 28 },
];

const TOP_PLAYERS = [
  { name: "Yassine Brahmi", position: "BU", score: 87 },
  { name: "Karim Sassi", position: "MC", score: 81 },
  { name: "Fares Msakni", position: "AG", score: 80 },
  { name: "Anis Khelifi", position: "DC", score: 79 },
  { name: "Walid Hammami", position: "MD", score: 83 },
];

const PERFORMANCE_HISTORY = [
  { name: "S1", value: 78 },
  { name: "S2", value: 81 },
  { name: "S3", value: 79 },
  { name: "S4", value: 85 },
  { name: "S5", value: 87 },
];

export function PerformancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Performance</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Indicateurs équipe, forme et joueurs clés</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {TEAM_STATS.map((item) => (
          <GlassCard key={item.label} className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{item.label}</p>
              <Badge tone="info">Team</Badge>
            </div>
            <p className="mt-3 text-3xl font-semibold" style={{ color: "var(--text-primary)" }}>{item.value}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <PerformanceChart
          title="Tendance ODIN Score"
          subtitle="Performance de l'équipe sur 5 semaines"
          data={PERFORMANCE_HISTORY}
          type="area"
          height={260}
          dataKey="value"
        />

        <GlassCard raised className="p-6">
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Performance Comparative</h2>
          <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            Analyse par domaines clés
          </p>
          <div className="mt-4 space-y-3">
            <div className="rounded-[var(--radius-odin-md)] border px-4 py-3" style={{ borderColor: "var(--surface-panel-border)" }}>
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Physique</p>
                <p className="text-lg font-semibold" style={{ color: "var(--accent)" }}>88%</p>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[color:var(--surface-panel-border)]">
                <div className="h-2 rounded-full" style={{ width: "88%", background: "var(--accent)" }} />
              </div>
            </div>
            <div className="rounded-[var(--radius-odin-md)] border px-4 py-3" style={{ borderColor: "var(--surface-panel-border)" }}>
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Technique</p>
                <p className="text-lg font-semibold" style={{ color: "var(--accent)" }}>82%</p>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[color:var(--surface-panel-border)]">
                <div className="h-2 rounded-full" style={{ width: "82%", background: "var(--accent)" }} />
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard raised className="p-6">
        <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          <ChartLine size={18} /> Charge physique
        </div>
        <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          Stabilisation positive : moyenne de 75 à 82 sur les 4 derniers matchs.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[var(--radius-odin-md)] border px-4 py-3" style={{ borderColor: "var(--surface-panel-border)" }}>
            <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Récupération</p>
            <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>82%</p>
          </div>
          <div className="rounded-[var(--radius-odin-md)] border px-4 py-3" style={{ borderColor: "var(--surface-panel-border)" }}>
            <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Diffusion Tactique</p>
            <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>88%</p>
          </div>
          <div className="rounded-[var(--radius-odin-md)] border px-4 py-3" style={{ borderColor: "var(--surface-panel-border)" }}>
            <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Intensité Moyenne</p>
            <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>76%</p>
          </div>
          <div className="rounded-[var(--radius-odin-md)] border px-4 py-3" style={{ borderColor: "var(--surface-panel-border)" }}>
            <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Risque Fatigue</p>
            <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--color-state-warning)" }}>34%</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard raised className="p-6">
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Top 5 joueurs</h2>
        <div className="mt-4 space-y-3">
          {TOP_PLAYERS.map((player) => (
            <div key={player.name} className="rounded-[var(--radius-odin-md)] border border-[color:var(--surface-panel-border)] bg-slate-900 p-4 transition-all duration-300 hover:bg-accent/5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-slate-700" />
                  <div>
                    <p className="font-medium" style={{ color: "var(--text-primary)" }}>{player.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{player.position}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold" style={{ color: "var(--accent)" }}>{player.score}/100</p>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[color:var(--surface-panel-border)]">
                <div className="h-2 rounded-full" style={{ width: `${player.score}%`, background: "var(--accent)" }} />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
