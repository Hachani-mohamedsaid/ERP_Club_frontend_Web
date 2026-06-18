import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";

const INSIGHTS = [
  { label: "Player Performance Index", value: "Ahmed — 88/100", tone: "success" as const },
  { label: "Injury Risk", value: "12%", tone: "warning" as const },
  { label: "Talent Ranking", value: "Top Prospects", tone: "info" as const },
  { label: "Budget Forecast", value: "6 / 12 mois", tone: "neutral" as const },
];

const RANKING = ["Youssef Ben Ali", "Nader Trabelsi", "Mouhamed Diallo"];

export function OdinAiPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          ODIN AI
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Analyses intelligentes, risques et prévisions budget
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {INSIGHTS.map((insight) => (
          <GlassCard key={insight.label} className="p-4">
            <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{insight.label}</p>
            <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{insight.value}</p>
            <div className="mt-3">
              <Badge tone={insight.tone}>{insight.label}</Badge>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <GlassCard raised className="p-6">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Analyse performance
          </h2>
          <div className="rounded-[var(--radius-odin-md)] border px-4 py-3" style={{ borderColor: "var(--surface-panel-border)" }}>
            <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Player Performance Index</p>
            <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Ahmed — 88/100</p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[var(--radius-odin-md)] border px-4 py-3" style={{ borderColor: "var(--surface-panel-border)" }}>
              <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Injury Risk</p>
              <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>12%</p>
            </div>
            <div className="rounded-[var(--radius-odin-md)] border px-4 py-3" style={{ borderColor: "var(--surface-panel-border)" }}>
              <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Budget Forecast</p>
              <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>6 mois / 12 mois</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Talent Ranking
          </h2>
          <div className="space-y-3">
            {RANKING.map((name, index) => (
              <div
                key={name}
                className="flex items-center justify-between rounded-[var(--radius-odin-md)] border px-4 py-3"
                style={{ borderColor: "var(--surface-panel-border)" }}
              >
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  {index + 1}. {name}
                </p>
                <Badge tone="info">Top prospect</Badge>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
