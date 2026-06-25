import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, RefreshCw, TrendingDown, ArrowRightLeft, Sparkles, Save, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { ClubPageTransition } from "../../components/club/ClubPageTransition";
import { ClubKpiCard } from "../../components/club/ClubKpiCard";
import { ClubEmptyState } from "../../components/club/ClubEmptyState";
import { clubApi } from "../../lib/api/club";
import { useClubResource } from "../../hooks/useClubResource";
import { usePermissions } from "../../hooks/usePermissions";
import {
  normalizeContracts,
  buildTimeline,
  buildAiRecommendations,
  getAlertLevel,
} from "../../lib/contractNormalize";

const CONTRACT_EXTRA_FIELDS = [
  { key: "startDate", label: "Date début", type: "date" },
  { key: "endDate", label: "Date fin", type: "date" },
  { key: "salaryMonthly", label: "Salaire mensuel (DT)", type: "number" },
  { key: "bonus", label: "Bonus (DT)", type: "number", placeholder: "5000" },
  { key: "releaseClause", label: "Clause libératoire", placeholder: "15M €" },
] as const;

interface RosterEntry {
  name: string;
  salaryMonthly: number;
}

function parseSalaryFromContract(s?: string) {
  const n = parseInt(String(s ?? "").replace(/\D/g, ""), 10);
  return Number.isNaN(n) ? 0 : n;
}

function ContractFormModal({
  holders,
  defaultHolder,
  onClose,
  onSubmit,
}: {
  holders: RosterEntry[];
  defaultHolder?: string;
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => Promise<void>;
}) {
  const [holderName, setHolderName] = useState(defaultHolder ?? "");
  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    salaryMonthly: "",
    bonus: "",
    releaseClause: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (defaultHolder && holders.some((h) => h.name === defaultHolder)) {
      setHolderName(defaultHolder);
      const entry = holders.find((h) => h.name === defaultHolder);
      if (entry?.salaryMonthly) {
        setForm((f) => ({ ...f, salaryMonthly: String(entry.salaryMonthly) }));
      }
    }
  }, [defaultHolder, holders]);

  function onHolderChange(name: string) {
    setHolderName(name);
    const entry = holders.find((h) => h.name === name);
    if (entry?.salaryMonthly) {
      setForm((f) => ({ ...f, salaryMonthly: String(entry.salaryMonthly) }));
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md rounded-[24px] border p-6"
        style={{ background: "rgba(10,18,40,0.98)", borderColor: "rgba(255,107,87,0.25)" }}
        initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>Nouveau contrat</h2>
          <button type="button" onClick={onClose} className="rounded-xl p-2 hover:bg-white/10"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Titulaire
            </label>
            {holders.length > 0 ? (
              <select
                value={holderName}
                onChange={(e) => onHolderChange(e.target.value)}
                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                style={{ background: "rgba(30,35,50,0.97)", borderColor: "rgba(255,255,255,0.1)", color: "var(--text-primary)" }}
              >
                <option value="">Sélectionner un joueur ou staff…</option>
                {holders.map((h) => (
                  <option key={h.name} value={h.name}>{h.name}</option>
                ))}
              </select>
            ) : (
              <input
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                placeholder="Nom du joueur"
                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)", color: "var(--text-primary)" }}
              />
            )}
            {holders.length === 0 && (
              <p className="mt-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                Ajoutez des joueurs dans Gestion Joueurs pour les sélectionner ici.
              </p>
            )}
          </div>
          {CONTRACT_EXTRA_FIELDS.map((f) => (
            <div key={f.key}>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                {f.label}
              </label>
              <input
                type={f.type ?? "text"}
                value={form[f.key as keyof typeof form] ?? ""}
                onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={"placeholder" in f ? f.placeholder : undefined}
                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)", color: "var(--text-primary)" }}
              />
            </div>
          ))}
        </div>
        <motion.button
          type="button"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            try {
              await onSubmit({ holderName, ...form });
              onClose();
            } catch (err) {
              alert(err instanceof Error ? err.message : "Erreur");
            } finally {
              setSaving(false);
            }
          }}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#FF6B57,#E65240)" }}
        >
          <Save size={14} /> {saving ? "Enregistrement…" : "Enregistrer"}
        </motion.button>
      </motion.div>
    </motion.div>
  );
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
  const { can } = usePermissions();
  const location = useLocation();
  const playerFilter = (location.state as { playerName?: string } | null)?.playerName;
  const { data, loading, error, reload } = useClubResource(() => clubApi.getContracts());
  const { data: playersData } = useClubResource(() => clubApi.getPlayers());
  const { data: staffData } = useClubResource(() => clubApi.getStaff());
  const [showAdd, setShowAdd] = useState(false);

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

  return (
    <ClubPageTransition>
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#FF6B57" }}>Admin Club</span>
          <h1 className="text-xl font-extrabold" style={{ color: "var(--text-primary)" }}>Contrats</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Alertes et renouvellements.</p>
        </div>
        {can("Contrats", "créer") && (
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
                        className="mt-3 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-white/5"
                        style={{ borderColor: `${rec.color}50`, color: rec.color }}
                      >
                        Appliquer
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
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
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
