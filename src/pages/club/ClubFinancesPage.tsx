import { useState } from "react";
import { Plus } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { ClubPageTransition } from "../../components/club/ClubPageTransition";
import { ClubKpiCard } from "../../components/club/ClubKpiCard";
import { ClubEmptyState } from "../../components/club/ClubEmptyState";
import { ClubFormModal } from "../../components/club/ClubFormModal";
import { CountUpStat } from "../../components/player/CountUpStat";
import { clubApi } from "../../lib/api/club";
import { useClubResource } from "../../hooks/useClubResource";
import { usePermissions } from "../../hooks/usePermissions";

interface FinanceData {
  kpis: { budget: number; expenses: number; revenue: number; profit: number };
  history: { date: string; amount: number; type: string; category: string }[];
}

export function ClubFinancesPage() {
  const { can } = usePermissions();
  const { data, loading, error, reload } = useClubResource(() => clubApi.getFinance() as Promise<FinanceData>);
  const [showAdd, setShowAdd] = useState(false);
  const kpis = data?.kpis ?? { budget: 0, expenses: 0, revenue: 0, profit: 0 };
  const history = data?.history ?? [];

  const kpiCards = [
    { label: "Budget", value: kpis.budget, suffix: " DT" },
    { label: "Dépenses", value: kpis.expenses, suffix: " DT" },
    { label: "Revenus", value: kpis.revenue, suffix: " DT" },
    { label: "Résultat", value: kpis.profit, suffix: " DT" },
  ];

  return (
    <ClubPageTransition>
      <div className="mb-4 flex justify-end">
        {can("Finances", "créer") && (
          <button type="button" onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#FF6B57,#E65240)" }}>
            <Plus size={16} /> Ajouter transaction
          </button>
        )}
      </div>

      {loading && <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement…</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpiCards.map((kpi, i) => (
          <ClubKpiCard key={kpi.label} delay={i * 0.05}>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{kpi.label}</p>
            <p className="mt-2 text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              <CountUpStat end={kpi.value} suffix={kpi.suffix} />
            </p>
          </ClubKpiCard>
        ))}
      </div>

      <ClubKpiCard hover={false}>
        <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Historique des transactions</h3>
        {!loading && history.length === 0 ? (
          <ClubEmptyState title="Aucune transaction" description="Enregistrez vos revenus et dépenses ici." />
        ) : (
          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border px-4 py-3"
                style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{h.type}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{h.date}</p>
                </div>
                <p className="font-semibold" style={{ color: h.amount < 0 ? "#EF4444" : "#22C55E" }}>
                  {h.amount > 0 ? "+" : ""}{h.amount.toLocaleString("fr-FR")} DT
                </p>
              </div>
            ))}
          </div>
        )}
      </ClubKpiCard>

      <AnimatePresence>
        {showAdd && (
          <ClubFormModal
            title="Nouvelle transaction"
            fields={[
              { key: "label", label: "Libellé" },
              { key: "amount", label: "Montant (DT)", type: "number" },
              { key: "type", label: "Type (REVENUE ou EXPENSE)", placeholder: "EXPENSE" },
              { key: "category", label: "Catégorie", placeholder: "Général" },
            ]}
            onClose={() => setShowAdd(false)}
            onSubmit={async (v) => {
              await clubApi.createFinance({
                label: v.label,
                amount: Number(v.amount) || 0,
                type: v.type?.toUpperCase() === "REVENUE" ? "REVENUE" : "EXPENSE",
                category: v.category || "Général",
              });
              await reload();
            }}
          />
        )}
      </AnimatePresence>
    </ClubPageTransition>
  );
}
