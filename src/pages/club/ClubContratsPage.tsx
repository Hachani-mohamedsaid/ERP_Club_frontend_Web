import { useMemo, useState } from "react";
import { Plus, RefreshCw, TrendingDown, ArrowRightLeft, Sparkles } from "lucide-react";
import { useLocation } from "react-router-dom";
import { ClubPageTransition } from "../../components/club/ClubPageTransition";
import { ClubKpiCard } from "../../components/club/ClubKpiCard";
import { ClubEmptyState } from "../../components/club/ClubEmptyState";
import { clubApi } from "../../lib/api/club";
import { useClubResource } from "../../hooks/useClubResource";
import { usePermissions } from "../../hooks/usePermissions";
import { useAuth } from "../../contexts/AuthContext";
import {
  normalizeContracts,
  buildTimeline,
  buildAiRecommendations,
  getAlertLevel,
  extendContractEndDate,
  type ContractRow,
} from "../../lib/contractNormalize";

import { ContractFormModal, type RosterEntry } from "../../components/club/ContractFormModal";
import { AnimatePresence, motion } from "framer-motion";

function parseSalaryFromContract(s?: string) {
  const n = parseInt(String(s ?? "").replace(/\D/g, ""), 10);
  return Number.isNaN(n) ? 0 : n;
}

const AI_ICONS = {
  Renouveler: RefreshCw,
  Vendre: TrendingDown,
  Prêter: ArrowRightLeft,
} as const;

function formatDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("fr-FR");
}

export function ClubContratsPage() {
  const { user } = useAuth();
  const { can, isClubAdmin } = usePermissions();
  const canManageContracts =
    isClubAdmin || user?.role === "responsable" || can("Contrats", "créer") || can("Contrats", "modifier");
  const location = useLocation();
  const playerFilter = (location.state as { playerName?: string } | null)?.playerName;
  const { data, loading, error, reload } = useClubResource(() => clubApi.getContracts());
  const { data: playersData } = useClubResource(() => clubApi.getPlayers());
  const { data: staffData } = useClubResource(() => clubApi.getStaff());
  const [showAdd, setShowAdd] = useState(false);
  const [renewContract, setRenewContract] = useState<ContractRow | null>(null);
  const [appliedRecs, setAppliedRecs] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const holders = useMemo((): RosterEntry[] => {
    const map = new Map<string, RosterEntry>();
    for (const p of (playersData as { name?: string; contract?: { salary?: string }; salaryMonthly?: number }[] | null) ?? []) {
      if (!p.name) continue;
      const salary =
        p.salaryMonthly ??
        parseSalaryFromContract(p.contract?.salary);
      map.set(p.name, { name: p.name, salaryMonthly: salary });
    }
    for (const s of (staffData as { fullName?: string; salaryMonthly?: number }[] | null) ?? []) {
      if (!s.fullName || map.has(s.fullName)) continue;
      map.set(s.fullName, { name: s.fullName, salaryMonthly: s.salaryMonthly ?? 0 });
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "fr"));
  }, [playersData, staffData]);

  const contracts = useMemo(() => {
    const all = normalizeContracts(data);
    if (!playerFilter) return all;
    return all.filter((c) => c.holderName.toLowerCase().includes(playerFilter.toLowerCase()));
  }, [data, playerFilter]);

  const timeline = useMemo(() => buildTimeline(contracts), [contracts]);
  const aiRecs = useMemo(() => buildAiRecommendations(contracts), [contracts]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 4000);
  }

  function recKey(rec: { action: string; player: string }) {
    return `${rec.action}-${rec.player}`;
  }

  function applyRecommendation(rec: (typeof aiRecs)[number]) {
    const contract = contracts.find((c) => c.id === rec.contractId || c.holderName === rec.player);
    if (!contract) {
      alert("Contrat introuvable pour cette recommandation.");
      return;
    }

    if (rec.action === "Renouveler") {
      if (!canManageContracts) {
        alert("Vous n'avez pas la permission de modifier les contrats.");
        return;
      }
      setRenewContract(contract);
      return;
    }

    setAppliedRecs((prev) => new Set(prev).add(recKey(rec)));
    setHighlightId(contract.id);
    showToast(
      rec.action === "Vendre"
        ? `${rec.player} — dossier transfert ouvert. Suivi activé dans le tableau.`
        : `${rec.player} — prêt recommandé enregistré. Suivi activé dans le tableau.`,
    );
    window.setTimeout(() => setHighlightId(null), 3000);
  }

  return (
    <ClubPageTransition>
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#FF6B57" }}>Admin Club</span>
          <h1 className="text-xl font-extrabold" style={{ color: "var(--text-primary)" }}>Contrats</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Alertes et renouvellements.</p>
        </div>
        {canManageContracts && (
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#FF6B57,#E65240)" }}
          >
            <Plus size={16} /> Créer contrat
          </button>
        )}
      </div>

      {loading && <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement…</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-xl border px-4 py-3 text-sm font-medium"
          style={{ background: "rgba(34,197,94,0.12)", borderColor: "rgba(34,197,94,0.35)", color: "#22C55E" }}
        >
          {toast}
        </motion.div>
      )}

      {/* Timeline expiration */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {timeline.map((bucket, i) => (
          <ClubKpiCard key={bucket.label} delay={i * 0.05}>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: bucket.color }}>
              {bucket.label}
            </p>
            <p className="mt-2 text-3xl font-extrabold" style={{ color: "var(--text-primary)" }}>
              {bucket.count}
            </p>
            {bucket.players.length > 0 && (
              <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {bucket.players.join(", ")}
              </p>
            )}
          </ClubKpiCard>
        ))}
      </div>

      {/* Recommandations IA */}
      {aiRecs.length > 0 && (
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles size={16} style={{ color: "#FF6B57" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Recommandations IA</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {aiRecs.map((rec) => {
              const Icon = AI_ICONS[rec.action as keyof typeof AI_ICONS] ?? RefreshCw;
              const applied = appliedRecs.has(recKey(rec));
              return (
                <ClubKpiCard key={`${rec.action}-${rec.player}`}>
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: `${rec.color}20`, color: rec.color }}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold" style={{ color: rec.color }}>
                        {rec.action} — {rec.player}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                        {rec.reason}
                      </p>
                      <button
                        type="button"
                        disabled={applied}
                        onClick={() => applyRecommendation(rec)}
                        className="mt-3 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-white/5 disabled:opacity-50"
                        style={{ borderColor: `${rec.color}50`, color: rec.color }}
                      >
                        {applied ? "Appliqué ✓" : "Appliquer"}
                      </button>
                    </div>
                  </div>
                </ClubKpiCard>
              );
            })}
          </div>
        </div>
      )}

      {/* Tableau contrats */}
      <ClubKpiCard hover={false} className="overflow-hidden p-0">
        {!loading && contracts.length === 0 ? (
          <div className="p-6">
            <ClubEmptyState title="Aucun contrat" description="Créez les contrats de vos joueurs et staff." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {["Nom", "Début", "Fin", "Salaire", "Bonus", "Clause", "Consommé", "Alerte"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contracts.map((c, i) => {
                  const alert = getAlertLevel(c.daysLeft);
                  return (
                    <motion.tr
                      key={c.id}
                      id={`contract-row-${c.id}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        background: highlightId === c.id ? "rgba(34,197,94,0.08)" : undefined,
                      }}
                      className="hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-3 font-semibold" style={{ color: "var(--text-primary)" }}>
                        {c.holderName}
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{formatDate(c.startDate)}</td>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{formatDate(c.endDate)}</td>
                      <td className="px-4 py-3 font-medium" style={{ color: "#F59E0B" }}>
                        {c.salaryMonthly.toLocaleString("fr-FR")} DT
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                        {c.bonus.toLocaleString("fr-FR")} DT
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                        {c.releaseClause ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex min-w-[100px] items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${c.consumedPct}%`, background: alert.color }}
                            />
                          </div>
                          <span className="text-xs font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>
                            {c.consumedPct}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                          style={{ background: `${alert.color}20`, color: alert.color }}
                        >
                          {alert.label}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </ClubKpiCard>

      <AnimatePresence>
        {renewContract && (
          <ContractFormModal
            holders={holders}
            defaultHolder={renewContract.holderName}
            lockHolder
            title={`Renouveler contrat — ${renewContract.holderName}`}
            initialValues={{
              startDate: renewContract.startDate,
              endDate: extendContractEndDate(renewContract.endDate),
              salaryMonthly: String(renewContract.salaryMonthly),
              bonus: String(renewContract.bonus),
              releaseClause: renewContract.releaseClause ?? "",
            }}
            onClose={() => setRenewContract(null)}
            onSubmit={async (v) => {
              if (!v.endDate) throw new Error("La date de fin est requise.");
              await clubApi.updateContract(renewContract.id, {
                startDate: v.startDate || renewContract.startDate,
                endDate: v.endDate,
                salaryMonthly: Number(v.salaryMonthly) || renewContract.salaryMonthly,
                bonus: Number(v.bonus) || 0,
                releaseClause: v.releaseClause || null,
              });
              setAppliedRecs((prev) => new Set(prev).add(`Renouveler-${renewContract.holderName}`));
              setHighlightId(renewContract.id);
              showToast(`Contrat de ${renewContract.holderName} renouvelé jusqu'au ${formatDate(v.endDate)}.`);
              window.setTimeout(() => setHighlightId(null), 3000);
              await reload();
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAdd && (
          <ContractFormModal
            holders={holders}
            defaultHolder={playerFilter}
            onClose={() => setShowAdd(false)}
            onSubmit={async (v) => {
              if (!v.holderName?.trim()) throw new Error("Sélectionnez un titulaire.");
              if (!v.startDate || !v.endDate) throw new Error("Les dates sont requises.");
              await clubApi.createContract({
                holderName: v.holderName.trim(),
                startDate: v.startDate,
                endDate: v.endDate,
                salaryMonthly: Number(v.salaryMonthly) || 0,
                bonus: Number(v.bonus) || 0,
                releaseClause: v.releaseClause || null,
              });
              await reload();
            }}
          />
        )}
      </AnimatePresence>
    </ClubPageTransition>
  );
}
