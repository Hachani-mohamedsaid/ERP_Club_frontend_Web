import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { ClubPageTransition } from "../../components/club/ClubPageTransition";
import { ClubKpiCard } from "../../components/club/ClubKpiCard";
import {
  TEAM_EVOLUTION, TOP_SCORERS, MARKET_VALUE_EVOLUTION, OVR_EVOLUTION, POSITION_DISTRIBUTION, TEAM_RADAR, BEST_XI,
} from "../../data/clubAdminData";

export function ClubAnalyticsPage() {
  return (
    <ClubPageTransition>
      {/* Team Radar + Best XI — WOW row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ClubKpiCard delay={0.05}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Team Radar</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={TEAM_RADAR}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="stat" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <Radar name="Équipe" dataKey="value" stroke="#FF6B57" fill="#FF6B57" fillOpacity={0.25} animationDuration={1000} />
              <Tooltip contentStyle={{ background: "#0F1D3A", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </ClubKpiCard>

        <ClubKpiCard delay={0.1}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Best XI</h3>
            <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: "rgba(255,107,87,0.15)", color: "#FF6B57" }}>
              {BEST_XI.formation}
            </span>
          </div>
          <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl border" style={{ borderColor: "rgba(34,197,94,0.2)", background: "linear-gradient(180deg, rgba(34,197,94,0.08) 0%, rgba(34,197,94,0.03) 50%, rgba(34,197,94,0.08) 100%)" }}>
            <div className="absolute inset-x-0 top-1/2 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
            <div className="absolute inset-x-0 top-1/4 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
            <div className="absolute inset-x-0 top-3/4 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
            <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border" style={{ borderColor: "rgba(255,255,255,0.08)" }} />
            {BEST_XI.players.map((p) => (
              <div
                key={p.name}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold shadow-lg" style={{ background: "#FF6B57", color: "white" }}>
                  {p.position}
                </div>
                <span className="mt-0.5 max-w-[60px] truncate text-[9px] font-medium" style={{ color: "var(--text-primary)" }}>{p.name}</span>
              </div>
            ))}
          </div>
        </ClubKpiCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ClubKpiCard delay={0.15}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Évolution équipe</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={TEAM_EVOLUTION}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0F1D3A", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12 }} />
              <Line type="monotone" dataKey="points" stroke="#FF6B57" strokeWidth={2} dot={{ r: 4 }} animationDuration={1000} name="Points" />
            </LineChart>
          </ResponsiveContainer>
        </ClubKpiCard>

        <ClubKpiCard delay={0.2}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Top Buteurs — Podium</h3>
          <div className="space-y-3">
            {TOP_SCORERS.map((scorer, i) => (
              <div
                key={scorer.name}
                className="flex items-center gap-4 rounded-xl border px-4 py-3"
                style={{ borderColor: "rgba(255,255,255,0.05)", background: i === 0 ? "rgba(255,107,87,0.08)" : "transparent" }}
              >
                <span className="text-2xl">{scorer.medal}</span>
                <p className="flex-1 font-semibold" style={{ color: "var(--text-primary)" }}>{scorer.name}</p>
                <span className="text-xl font-bold" style={{ color: "#FF6B57" }}>{scorer.goals} buts</span>
              </div>
            ))}
          </div>
        </ClubKpiCard>

        <ClubKpiCard delay={0.25}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Valeur Marchande (M €)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={MARKET_VALUE_EVOLUTION}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0F1D3A", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12 }} />
              <Line type="monotone" dataKey="value" stroke="#22C55E" strokeWidth={2} dot={{ r: 4 }} animationDuration={1000} />
            </LineChart>
          </ResponsiveContainer>
        </ClubKpiCard>

        <ClubKpiCard delay={0.3}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Évolution OVR</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={OVR_EVOLUTION}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} domain={[75, 85]} />
              <Tooltip contentStyle={{ background: "#0F1D3A", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12 }} />
              <Line type="monotone" dataKey="ovr" stroke="#6366F1" strokeWidth={2} dot={{ r: 4 }} animationDuration={1000} />
            </LineChart>
          </ResponsiveContainer>
        </ClubKpiCard>
      </div>

      <ClubKpiCard delay={0.35} className="max-w-md">
        <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Répartition postes</h3>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={POSITION_DISTRIBUTION} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} animationDuration={1000}>
              {POSITION_DISTRIBUTION.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: "#0F1D3A", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </ClubKpiCard>
    </ClubPageTransition>
  );
}
