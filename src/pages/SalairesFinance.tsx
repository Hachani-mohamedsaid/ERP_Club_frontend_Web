import { Users, TrendingUp, DollarSign, BarChart3 } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

interface Employee {
  id: string;
  nom: string;
  poste: string;
  categorie: "Joueur" | "Coach" | "Staff";
  salaireMensuel: number;
  salaireAnnuel: number;
}

interface PaymentHistory {
  id: string;
  nom: string;
  mois: string;
  montant: number;
  status: string;
}

const PAYMENT_HISTORY: PaymentHistory[] = [
  { id: "h1", nom: "Youssef Ben Ali", mois: "Juin 2026", montant: 85000, status: "Payé" },
  { id: "h2", nom: "Coach Principal", mois: "Juin 2026", montant: 65000, status: "Payé" },
  { id: "h3", nom: "Dr. Medecin", mois: "Juin 2026", montant: 38000, status: "En attente" },
];

const EMPLOYEES: Employee[] = [
  { id: "1", nom: "Youssef Ben Ali", poste: "Attaquant", categorie: "Joueur", salaireMensuel: 85000, salaireAnnuel: 1020000 },
  { id: "2", nom: "Mohamed Diallo", poste: "Défenseur", categorie: "Joueur", salaireMensuel: 95000, salaireAnnuel: 1140000 },
  { id: "3", nom: "Nader Trabelsi", poste: "Milieu", categorie: "Joueur", salaireMensuel: 78000, salaireAnnuel: 936000 },
  { id: "4", nom: "Coach Principal", poste: "Directeur Technique", categorie: "Coach", salaireMensuel: 65000, salaireAnnuel: 780000 },
  { id: "5", nom: "Assistant Coach", poste: "Préparateur Physique", categorie: "Coach", salaireMensuel: 42000, salaireAnnuel: 504000 },
  { id: "6", nom: "Dr. Medecin", poste: "Médecin du Club", categorie: "Staff", salaireMensuel: 38000, salaireAnnuel: 456000 },
];

const KPI_CARDS = [
  { label: "Masse Salariale", value: "1.2 M DT", change: "+3%", icon: DollarSign, color: "#3B82F6" },
  { label: "Joueurs", value: "900 K DT", change: "+2%", icon: Users, color: "#8B5CF6" },
  { label: "Staff", value: "200 K DT", change: "+1%", icon: BarChart3, color: "#F59E0B" },
  { label: "Coachs", value: "100 K DT", change: "0%", icon: TrendingUp, color: "#10B981" },
];

export function SalairesFinance() {
  const totalByCategory = EMPLOYEES.reduce<Record<string, number>>((acc, e) => {
    acc[e.categorie] = (acc[e.categorie] || 0) + e.salaireAnnuel;
    return acc;
  }, {});

  const DISTRIBUTION = Object.entries(totalByCategory).map(([name, value]) => ({ name, value: Math.round(value / 1000) }));
  const COLORS = ["#8B5CF6", "#10B981", "#F59E0B"];

  const TOP5 = [...EMPLOYEES].sort((a, b) => b.salaireAnnuel - a.salaireAnnuel).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
              Gestion des Salaires
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Suivi de la masse salariale et des rémunérations
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost">Ajouter salaire</Button>
            <Button variant="ghost">Exporter PDF</Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                  <p className="mt-1 text-xs font-medium" style={{ color: "#10B981" }}>
                    {kpi.change}
                  </p>
                </div>
                <Icon size={20} style={{ color: kpi.color, opacity: 0.6 }} />
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Salaries Table + Right-side widgets */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <GlassCard raised className="p-6 lg:col-span-2">
        <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Détail des Salaires
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--surface-panel-border)" }}>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-muted)" }}>
                  Nom
                </th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-muted)" }}>
                  Poste
                </th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-muted)" }}>
                  Catégorie
                </th>
                <th className="px-4 py-3 text-right font-semibold" style={{ color: "var(--text-muted)" }}>
                  Salaire Mensuel
                </th>
                <th className="px-4 py-3 text-right font-semibold" style={{ color: "var(--text-muted)" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {EMPLOYEES.map((emp) => (
                <tr key={emp.id} style={{ borderBottom: "1px solid var(--surface-panel-border)" }}>
                  <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>
                    {emp.nom}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                    {emp.poste}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone="info">{emp.categorie}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-medium" style={{ color: "var(--text-primary)" }}>
                    {emp.salaireMensuel.toLocaleString("fr-TN")} DT
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="text-xs font-medium hover:underline" style={{ color: "var(--accent)" }}>
                        Voir
                      </button>
                      <span style={{ color: "var(--surface-panel-border)" }}>•</span>
                      <button className="text-xs font-medium hover:underline" style={{ color: "var(--accent)" }}>
                        Modifier
                      </button>
                      <span style={{ color: "var(--surface-panel-border)" }}>•</span>
                      <button className="text-xs font-medium hover:underline" style={{ color: "var(--accent)" }}>
                        Historique
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard raised className="p-4">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Salary Distribution</h3>
            <div style={{ height: 220 }} className="mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={DISTRIBUTION} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={4}>
                    {DISTRIBUTION.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--surface-panel)", border: "1px solid var(--surface-panel-border)", borderRadius: 8 }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 text-xs space-y-1">
              {DISTRIBUTION.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span style={{ color: "var(--text-secondary)" }}>{d.name}</span>
                  </div>
                  <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{d.value} K DT</span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard raised className="p-4">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Top 5 Highest Salaries</h3>
            <div className="mt-3 space-y-2 text-sm">
              {TOP5.map((t) => (
                <div key={t.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{t.nom}</div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>{t.poste} • {t.categorie}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold" style={{ color: "var(--text-primary)" }}>{(t.salaireAnnuel / 1000).toFixed(0)} K DT</div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>{(t.salaireMensuel).toLocaleString("fr-TN")} DT / mois</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      <GlassCard raised className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Historique des paiements
            </h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Derniers événements de paie enregistrés
            </p>
          </div>
          <Button variant="ghost">Voir tout</Button>
        </div>
        <div className="space-y-3 text-sm">
          {PAYMENT_HISTORY.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between rounded-[var(--radius-odin-md)] border px-4 py-3" style={{ borderColor: "var(--surface-panel-border)" }}>
              <div>
                <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                  {payment.nom}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {payment.mois}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  {payment.montant.toLocaleString("fr-TN")} DT
                </p>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {payment.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
