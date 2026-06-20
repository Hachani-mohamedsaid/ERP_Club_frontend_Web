import { Download, FileSpreadsheet, HeartPulse, Clock, TrendingUp, Users } from "lucide-react";
import { GlassCard } from "../../components/ui/GlassCard";
import { Button } from "../../components/ui/Button";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { REPORT_KPIS, MONTHLY_INJURY_DATA, INJURY_TYPE_DATA } from "../../data/medicalMockData";

const REPORT_TYPES = [
  { id: "1", title: "Rapport mensuel", desc: "Synthèse blessures et disponibilité — Juin 2026", type: "Mensuel" },
  { id: "2", title: "Rapport joueur", desc: "Dossier complet Ahmed Ben Salah", type: "Joueur" },
  { id: "3", title: "Rapport blessure", desc: "Analyse genou droit — Grade II", type: "Blessure" },
];

export function MedicalRapportsPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Blessures actives", value: REPORT_KPIS.activeInjuries, icon: HeartPulse, color: "var(--color-state-danger)" },
          { label: "Temps moyen retour", value: `${REPORT_KPIS.avgReturnDays}j`, icon: Clock, color: "var(--color-state-warning)" },
          { label: "Retour terrain", value: `${REPORT_KPIS.fieldReturnRate}%`, icon: TrendingUp, color: "var(--color-state-success)" },
          { label: "Disponibilité", value: `${REPORT_KPIS.availability}%`, icon: Users, color: "var(--color-state-info)" },
        ].map(({ label, value, icon: Icon, color }) => (
          <GlassCard key={label} raised className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
                <p className="mt-2 text-2xl font-bold" style={{ color }}>{value}</p>
              </div>
              <Icon size={22} style={{ color }} />
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard raised className="p-5">
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Blessures vs Retours</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={MONTHLY_INJURY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
              <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "var(--surface-panel)", border: "1px solid var(--surface-panel-border)", borderRadius: 8 }} />
              <Legend />
              <Bar dataKey="blessures" fill="#e0584a" name="Blessures" radius={[4, 4, 0, 0]} />
              <Bar dataKey="retours" fill="#2e9e5b" name="Retours" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard raised className="p-5">
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Types de blessures</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={INJURY_TYPE_DATA} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                {INJURY_TYPE_DATA.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--surface-panel)", border: "1px solid var(--surface-panel-border)", borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <GlassCard raised className="p-5">
        <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Évolution disponibilité effectif</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={MONTHLY_INJURY_DATA.map((d, i) => ({ ...d, dispo: 70 + i * 2 + Math.random() * 5 }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
            <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} domain={[60, 100]} />
            <Tooltip contentStyle={{ background: "var(--surface-panel)", border: "1px solid var(--surface-panel-border)", borderRadius: 8 }} />
            <Line type="monotone" dataKey="dispo" stroke="#3a7bd5" strokeWidth={2} dot={{ fill: "#3a7bd5" }} name="Disponibilité %" />
          </LineChart>
        </ResponsiveContainer>
      </GlassCard>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {REPORT_TYPES.map((report) => (
          <GlassCard key={report.id} raised className="p-5">
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
              style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
            >
              {report.type}
            </span>
            <h3 className="mt-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{report.title}</h3>
            <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{report.desc}</p>
            <div className="mt-4 flex gap-2">
              <Button className="flex-1 text-xs"><Download size={14} /> PDF</Button>
              <Button className="flex-1 text-xs" variant="ghost"><FileSpreadsheet size={14} /> Excel</Button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
