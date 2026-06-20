import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { ClubPageTransition } from "../../components/club/ClubPageTransition";
import { ClubKpiCard } from "../../components/club/ClubKpiCard";
import { CountUpStat } from "../../components/player/CountUpStat";
import { FINANCE_KPIS, EXPENSE_BREAKDOWN, FINANCE_HISTORY, REVENUE_SOURCES, EXPENSES_MONTHLY } from "../../data/clubAdminData";

export function ClubFinancesPage() {
  return (
    <ClubPageTransition>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {FINANCE_KPIS.map((kpi, i) => (
          <ClubKpiCard key={kpi.label} delay={i * 0.05}>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{kpi.label}</p>
            <p className="mt-2 text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              <CountUpStat end={kpi.value} suffix={kpi.suffix} />
            </p>
          </ClubKpiCard>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ClubKpiCard delay={0.1}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Revenue Sources</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={REVENUE_SOURCES} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={95} animationDuration={1000}>
                {REVENUE_SOURCES.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#0F1D3A", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {REVENUE_SOURCES.map((e) => (
              <div key={e.name} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                <div className="h-2 w-2 rounded-full" style={{ background: e.color }} />{e.name} ({e.value}%)
              </div>
            ))}
          </div>
        </ClubKpiCard>

        <ClubKpiCard delay={0.15}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Dépenses mensuelles (K DT)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={EXPENSES_MONTHLY}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0F1D3A", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12 }} />
              <Bar dataKey="amount" fill="#FF6B57" radius={[6, 6, 0, 0]} animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        </ClubKpiCard>

        <ClubKpiCard delay={0.2}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Répartition des dépenses</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={EXPENSE_BREAKDOWN} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} animationDuration={1000}>
                {EXPENSE_BREAKDOWN.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#0F1D3A", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ClubKpiCard>

        <ClubKpiCard delay={0.25} hover={false}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Historique</h3>
          <div className="space-y-2">
            {FINANCE_HISTORY.map((tx) => (
              <div key={tx.date + tx.type} className="flex items-center justify-between rounded-xl border px-4 py-3" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{tx.type}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{tx.date}</p>
                </div>
                <span className="font-bold" style={{ color: tx.category === "in" ? "#22C55E" : "#EF4444" }}>
                  {tx.category === "in" ? "+" : "-"}{tx.amount.toLocaleString()} DT
                </span>
              </div>
            ))}
          </div>
        </ClubKpiCard>
      </div>
    </ClubPageTransition>
  );
}
