import { CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

interface Contract {
  id: string;
  nom: string;
  dateDebut: string;
  dateFin: string;
  salaire: number;
  prime: number;
  bonus: number;
  status: "Actif" | "Expire bientot" | "Expire";
}

const CONTRACTS: Contract[] = [
  {
    id: "1",
    nom: "Youssef Ben Ali",
    dateDebut: "01/01/2023",
    dateFin: "30/06/2025",
    salaire: 85000,
    prime: 12000,
    bonus: 5000,
    status: "Expire bientot",
  },
  {
    id: "2",
    nom: "Mohamed Diallo",
    dateDebut: "15/03/2022",
    dateFin: "31/12/2026",
    salaire: 95000,
    prime: 15000,
    bonus: 7000,
    status: "Actif",
  },
  {
    id: "3",
    nom: "Nader Trabelsi",
    dateDebut: "10/07/2023",
    dateFin: "31/05/2027",
    salaire: 78000,
    prime: 10000,
    bonus: 4500,
    status: "Actif",
  },
  {
    id: "4",
    nom: "Ali Ben Amor",
    dateDebut: "01/01/2020",
    dateFin: "30/06/2024",
    salaire: 120000,
    prime: 20000,
    bonus: 9000,
    status: "Expire",
  },
  {
    id: "5",
    nom: "Rami Makhlouf",
    dateDebut: "01/09/2023",
    dateFin: "31/12/2025",
    salaire: 45000,
    prime: 5000,
    bonus: 3000,
    status: "Actif",
  },
];

const STATUS_CONFIG = {
  Actif: { icon: CheckCircle, color: "#10B981", bg: "#ECFDF5", label: "🟢 Actif" },
  "Expire bientot": { icon: AlertCircle, color: "#F59E0B", bg: "#FFFBEB", label: "🟡 Expire bientôt" },
  Expire: { icon: XCircle, color: "#EF4444", bg: "#FEF2F2", label: "🔴 Expiré" },
};

const KPI_CARDS = [
  { label: "Contrats actifs", value: "25", color: "#10B981" },
  { label: "Expire bientôt", value: "4", color: "#F59E0B" },
  { label: "Renouvellements", value: "3", color: "#3B82F6" },
];

export function ContratsFinance() {
  // Helper: parse date strings in format DD/MM/YYYY
  function parseDateDMY(d: string) {
    const parts = d.split('/').map((p) => parseInt(p, 10));
    return new Date(parts[2], parts[1] - 1, parts[0]);
  }

  // Build timeline: group contracts by month-year of end date
  const timelineMap: Record<string, Contract[]> = {};
  CONTRACTS.forEach((c) => {
    const dt = parseDateDMY(c.dateFin);
    const key = dt.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
    if (!timelineMap[key]) timelineMap[key] = [];
    timelineMap[key].push(c);
  });

  const timelineKeys = Object.keys(timelineMap).sort((a, b) => {
    const da = parseDateDMY(timelineMap[a][0].dateFin);
    const db = parseDateDMY(timelineMap[b][0].dateFin);
    return da.getTime() - db.getTime();
  });

  const maxCount = Math.max(...Object.values(timelineMap).map((arr) => arr.length), 1);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
              Gestion des Contrats
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Suivi des contrats et dates d'expiration
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost">Renouveler</Button>
            <Button variant="ghost">Résilier</Button>
            <Button variant="ghost">Modifier</Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {KPI_CARDS.map((kpi) => (
          <GlassCard key={kpi.label} className="p-4">
            <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              {kpi.label}
            </p>
            <p className="mt-2 text-2xl font-semibold" style={{ color: kpi.color }}>
              {kpi.value}
            </p>
          </GlassCard>
        ))}
      </div>

      {/* Contracts Table */}
      <GlassCard raised className="p-6">
        <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Liste des Contrats
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--surface-panel-border)" }}>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-muted)" }}>
                  Nom
                </th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-muted)" }}>
                  Date Début
                </th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-muted)" }}>
                  Date Fin
                </th>
                <th className="px-4 py-3 text-right font-semibold" style={{ color: "var(--text-muted)" }}>
                  Salaire
                </th>
                <th className="px-4 py-3 text-right font-semibold" style={{ color: "var(--text-muted)" }}>
                  Prime
                </th>
                <th className="px-4 py-3 text-right font-semibold" style={{ color: "var(--text-muted)" }}>
                  Bonus
                </th>
                <th className="px-4 py-3 text-center font-semibold" style={{ color: "var(--text-muted)" }}>
                  Statut
                </th>
                <th className="px-4 py-3 text-right font-semibold" style={{ color: "var(--text-muted)" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {CONTRACTS.map((contract) => {
                const config = STATUS_CONFIG[contract.status];
                return (
                  <tr key={contract.id} style={{ borderBottom: "1px solid var(--surface-panel-border)" }}>
                    <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>
                      {contract.nom}
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                      {contract.dateDebut}
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                      {contract.dateFin}
                    </td>
                    <td className="px-4 py-3 text-right font-medium" style={{ color: "var(--text-primary)" }}>
                      {contract.salaire.toLocaleString("fr-TN")} DT
                    </td>
                    <td className="px-4 py-3 text-right font-medium" style={{ color: "var(--text-primary)" }}>
                      {contract.prime.toLocaleString("fr-TN")} DT
                    </td>
                    <td className="px-4 py-3 text-right font-medium" style={{ color: "var(--text-primary)" }}>
                      {contract.bonus.toLocaleString("fr-TN")} DT
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge tone={contract.status === "Actif" ? "success" : contract.status === "Expire bientot" ? "warning" : "danger"}>
                        {config.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">Renouveler</Button>
                        <Button variant="ghost" size="sm">Modifier</Button>
                        <Button variant="ghost" size="sm">Résilier</Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Expiration Timeline */}
      <GlassCard raised className="p-6">
        <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          📅 Timeline des expirations
        </h2>
        <div className="space-y-4">
          {timelineKeys.map((month) => {
            const items = timelineMap[month];
            const width = Math.round((items.length / maxCount) * 100);
            return (
              <div key={month} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{month}</div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>{items.length} contrat(s)</div>
                </div>
                <div className="w-full rounded bg-[var(--surface-panel-border)] h-3 overflow-hidden">
                  <div className="h-3 rounded" style={{ width: `${width}%`, background: "linear-gradient(90deg, #F59E0B, #EF4444)" }} />
                </div>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {items.map((c) => (
                    <div key={c.id} className="rounded border p-3" style={{ borderColor: "var(--surface-panel-border)" }}>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{c.nom}</div>
                        <Badge tone={c.status === "Actif" ? "success" : c.status === "Expire bientot" ? "warning" : "danger"}>{STATUS_CONFIG[c.status].label}</Badge>
                      </div>
                      <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{c.dateFin}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
