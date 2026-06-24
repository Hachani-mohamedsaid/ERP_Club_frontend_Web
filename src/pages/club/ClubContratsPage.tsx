import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { ClubPageTransition } from "../../components/club/ClubPageTransition";
import { ClubKpiCard } from "../../components/club/ClubKpiCard";
import { ClubEmptyState } from "../../components/club/ClubEmptyState";
import { ClubFormModal } from "../../components/club/ClubFormModal";
import { clubApi } from "../../lib/api/club";
import { useClubResource } from "../../hooks/useClubResource";
import { usePermissions } from "../../hooks/usePermissions";

interface Contract {
  id: string;
  holderName: string;
  startDate: string;
  endDate: string;
  salaryMonthly: number;
  bonus: number;
  releaseClause: string | null;
  consumedPct: number;
}

function getAlertLevel(daysLeft: number) {
  if (daysLeft <= 30) return { color: "#EF4444", label: "Expire < 30 jours" };
  if (daysLeft <= 90) return { color: "#F59E0B", label: "Expire < 90 jours" };
  return { color: "#22C55E", label: "Actif" };
}

export function ClubContratsPage() {
  const { can } = usePermissions();
  const { data, loading, error, reload } = useClubResource(() => clubApi.getContracts() as Promise<Contract[]>);
  const contracts = data ?? [];
  const [showAdd, setShowAdd] = useState(false);

  return (
    <ClubPageTransition>
      <div className="mb-4 flex justify-end">
        {can("Contrats", "créer") && (
          <button type="button" onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#FF6B57,#E65240)" }}>
            <Plus size={16} /> Créer contrat
          </button>
        )}
      </div>

      {loading && <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement…</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
      {!loading && contracts.length === 0 && (
        <ClubEmptyState title="Aucun contrat" description="Créez les contrats de vos joueurs et staff." />
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {contracts.map((c, i) => {
          const end = new Date(c.endDate);
          const daysLeft = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          const alert = getAlertLevel(daysLeft);
          return (
            <ClubKpiCard key={c.id} delay={i * 0.05}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{c.holderName}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {new Date(c.startDate).toLocaleDateString("fr-FR")} → {end.toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                  style={{ background: `${alert.color}20`, color: alert.color }}>
                  {alert.label}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>Salaire</p>
                  <p className="font-semibold" style={{ color: "#F59E0B" }}>{c.salaryMonthly.toLocaleString("fr-FR")} DT/mois</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>Consommé</p>
                  <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{c.consumedPct}%</p>
                </div>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                <motion.div className="h-full rounded-full" style={{ background: alert.color, width: `${c.consumedPct}%` }}
                  initial={{ width: 0 }} animate={{ width: `${c.consumedPct}%` }} />
              </div>
            </ClubKpiCard>
          );
        })}
      </div>

      <AnimatePresence>
        {showAdd && (
          <ClubFormModal
            title="Nouveau contrat"
            fields={[
              { key: "holderName", label: "Titulaire" },
              { key: "startDate", label: "Date début", type: "date" },
              { key: "endDate", label: "Date fin", type: "date" },
              { key: "salaryMonthly", label: "Salaire mensuel (DT)", type: "number" },
            ]}
            onClose={() => setShowAdd(false)}
            onSubmit={async (v) => {
              await clubApi.createContract({
                holderName: v.holderName,
                startDate: v.startDate,
                endDate: v.endDate,
                salaryMonthly: Number(v.salaryMonthly) || 0,
              });
              await reload();
            }}
          />
        )}
      </AnimatePresence>
    </ClubPageTransition>
  );
}
