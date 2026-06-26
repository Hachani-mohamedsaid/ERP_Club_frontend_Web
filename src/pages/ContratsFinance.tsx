import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, XCircle, FileText, Plus, Download, RefreshCw, Clock, X } from "lucide-react";
import { useFinanceBackendData } from "../hooks/useFinanceBackendData";
import type { BackendContract } from "../hooks/useFinanceBackendData";
import { clubApi } from "../lib/api/club";

const F = { primary: "#FF7A00", success: "#22C55E", danger: "#EF4444", info: "#3B82F6", warning: "#F59E0B" };

function contractStatus(c: BackendContract): "Actif" | "Expire bientot" | "Expire" {
  const daysLeft = Math.ceil((new Date(c.endDate).getTime() - Date.now()) / 86400000);
  if (daysLeft < 0) return "Expire";
  if (daysLeft <= 90) return "Expire bientot";
  return "Actif";
}

function daysLeft(c: BackendContract): number {
  return Math.ceil((new Date(c.endDate).getTime() - Date.now()) / 86400000);
}

const STATUS_META = {
  Actif: { icon: CheckCircle, color: F.success, label: "Actif" },
  "Expire bientot": { icon: AlertCircle, color: F.warning, label: "Expire bientôt" },
  Expire: { icon: XCircle, color: F.danger, label: "Expiré" },
};

const RENEWAL_BUCKETS = [
  { label: "🔴 30 jours", max: 30, color: F.danger },
  { label: "🟠 60 jours", max: 60, color: F.warning },
  { label: "🟡 90 jours", max: 90, color: "#F97316" },
];

export function ContratsFinance() {
  const { contracts, loading, refetchContracts } = useFinanceBackendData();
  const [activeTab, setActiveTab] = useState<"liste" | "renouvellement">("liste");
  const [filter, setFilter] = useState<"Tous" | "Actif" | "Expire bientot" | "Expire">("Tous");
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ holderName: "", startDate: "", endDate: "", salaryMonthly: "", bonus: "", releaseClause: "" });
  const [saving, setSaving] = useState(false);

  const contractList = contracts?.list ?? [];

  const filtered =
    filter === "Tous" ? contractList : contractList.filter(c => contractStatus(c) === filter);

  const upcoming = contractList
    .filter(c => { const d = daysLeft(c); return d > 0 && d <= 90; })
    .sort((a, b) => daysLeft(a) - daysLeft(b));

  const active = contractList.filter(c => contractStatus(c) === "Actif").length;
  const expiringSoon = contractList.filter(c => contractStatus(c) === "Expire bientot").length;
  const expired = contractList.filter(c => contractStatus(c) === "Expire").length;

  const KPI = [
    { label: "Contrats actifs", value: String(active), color: F.success, icon: CheckCircle },
    { label: "Expire bientôt", value: String(expiringSoon), color: F.warning, icon: AlertCircle },
    { label: "À renouveler", value: String(expiringSoon), color: F.primary, icon: RefreshCw },
    { label: "Expirés", value: String(expired), color: F.danger, icon: XCircle },
  ];

  const handleCreate = async () => {
    if (!form.holderName || !form.startDate || !form.endDate) return;
    setSaving(true);
    try {
      await clubApi.createContract({
        holderName: form.holderName,
        startDate: form.startDate,
        endDate: form.endDate,
        salaryMonthly: Number(form.salaryMonthly) || 0,
        bonus: Number(form.bonus) || 0,
        releaseClause: form.releaseClause || undefined,
      });
      setShowAddModal(false);
      setForm({ holderName: "", startDate: "", endDate: "", salaryMonthly: "", bonus: "", releaseClause: "" });
      refetchContracts();
    } catch (_) {
      /* silent */
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce contrat ?")) return;
    try {
      await clubApi.deleteContract(id);
      refetchContracts();
    } catch (_) { /* silent */ }
  };

  const handleExportPDF = () => {
    const lines = contractList.map(c => {
      const d = daysLeft(c);
      return `${c.holderName} | ${(c.salaryMonthly / 1000).toFixed(0)}K DT/mois | Fin: ${new Date(c.endDate).toLocaleDateString("fr-FR")} | ${d > 0 ? d + "j restants" : "Expiré"}`;
    });
    const content = ["RAPPORT CONTRATS — " + new Date().toLocaleDateString("fr-FR"), "", ...lines].join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "contrats.txt";
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw size={20} className="animate-spin" style={{ color: "var(--accent)" }} />
        <span className="ml-3 text-sm" style={{ color: "var(--text-muted)" }}>Chargement des contrats…</span>
      </div>
    );
  }

  return (
    <motion.div className="space-y-5" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: "var(--text-primary)" }}>Gestion des Contrats</h1>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
            {contractList.length} contrats · Saison en cours
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold"
            style={{ borderColor: `${F.primary}30`, color: F.primary, background: `${F.primary}08` }}
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
          >
            <Plus size={12} /> Nouveau contrat
          </motion.button>
          <motion.button
            type="button"
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold"
            style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
          >
            <Download size={12} /> Export
          </motion.button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {KPI.map((k, i) => {
          const Icon = k.icon;
          return (
            <motion.div
              key={i} className="rounded-[18px] border p-4"
              style={{ background: "rgba(8,6,24,0.88)", borderColor: `${k.color}18` }}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              whileHover={{ y: -2, borderColor: `${k.color}35` }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: `${k.color}12` }}>
                  <Icon size={13} style={{ color: k.color }} />
                </div>
              </div>
              <p className="text-[9px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>{k.label}</p>
              <p className="text-2xl font-extrabold" style={{ color: k.color }}>{k.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: "liste", label: "📋 Liste des contrats" },
          { id: "renouvellement", label: "🔔 Contrats à renouveler" },
        ].map(tab => (
          <motion.button
            key={tab.id} type="button"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className="rounded-xl px-4 py-2 text-xs font-bold"
            style={{
              background: activeTab === tab.id ? `${F.primary}14` : "rgba(255,255,255,0.04)",
              color: activeTab === tab.id ? F.primary : "rgba(255,255,255,0.4)",
              border: `1px solid ${activeTab === tab.id ? F.primary + "35" : "transparent"}`,
            }}
            whileHover={{ scale: 1.04 }}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "liste" && (
          <motion.div key="liste" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="flex flex-wrap gap-2 mb-4">
              {(["Tous", "Actif", "Expire bientot", "Expire"] as const).map(f => {
                const color = f === "Tous" ? F.info : STATUS_META[f as keyof typeof STATUS_META].color;
                return (
                  <motion.button
                    key={f} type="button" onClick={() => setFilter(f)}
                    className="rounded-full px-3 py-1 text-[10px] font-bold"
                    style={{ background: filter === f ? color : "rgba(255,255,255,0.05)", color: filter === f ? "white" : "rgba(255,255,255,0.45)" }}
                    whileHover={{ scale: 1.06 }}
                  >
                    {f === "Tous" ? "Tous" : STATUS_META[f as keyof typeof STATUS_META].label}
                  </motion.button>
                );
              })}
            </div>

            <div className="rounded-[22px] border overflow-hidden" style={{ background: "rgba(8,6,24,0.88)", borderColor: "rgba(255,255,255,0.07)" }}>
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText size={32} style={{ color: "rgba(255,255,255,0.2)" }} className="mb-2" />
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Aucun contrat trouvé</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filtered.map((c, i) => {
                    const status = contractStatus(c);
                    const meta = STATUS_META[status];
                    const StatusIcon = meta.icon;
                    const days = daysLeft(c);
                    const urgent = days > 0 && days <= 30;
                    return (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-4 px-5 py-4"
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                        whileHover={{ background: "rgba(255,255,255,0.02)" }}
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: `${meta.color}12` }}>
                          <StatusIcon size={15} style={{ color: meta.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{c.holderName}</p>
                            {urgent && (
                              <motion.span
                                className="rounded-full px-1.5 py-0.5 text-[7px] font-extrabold"
                                style={{ background: `${F.danger}15`, color: F.danger }}
                                animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                              >URGENT</motion.span>
                            )}
                          </div>
                          <p className="text-[9px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                            {new Date(c.startDate).toLocaleDateString("fr-FR")} → {new Date(c.endDate).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-extrabold" style={{ color: "var(--text-primary)" }}>
                            {(c.salaryMonthly / 1000).toFixed(0)}K DT/mois
                          </p>
                          <p className="text-[8px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                            +{((c.bonus) / 1000).toFixed(0)}K primes
                          </p>
                        </div>
                        <div className="shrink-0 text-right min-w-[60px]">
                          {days > 0 ? (
                            <p className="text-[9px] font-bold" style={{ color: days <= 30 ? F.danger : days <= 90 ? F.warning : F.success }}>
                              {days}j restants
                            </p>
                          ) : (
                            <p className="text-[9px] font-bold" style={{ color: F.danger }}>Expiré</p>
                          )}
                        </div>
                        <span className="shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold" style={{ background: `${meta.color}12`, color: meta.color }}>
                          {meta.label}
                        </span>
                        <div className="flex gap-1.5 shrink-0">
                          <motion.button
                            type="button"
                            onClick={() => handleDelete(c.id)}
                            className="rounded-lg border px-2 py-1 text-[9px] font-bold"
                            style={{ borderColor: `${F.danger}25`, color: F.danger }}
                            whileHover={{ scale: 1.08 }}
                          >
                            <X size={8} className="inline mr-0.5" />Supprimer
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "renouvellement" && (
          <motion.div key="renewal" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
              Contrats arrivant à expiration dans les 90 prochains jours — action recommandée
            </p>
            {RENEWAL_BUCKETS.map(bucket => {
              const items = upcoming.filter(c => {
                const d = daysLeft(c);
                const prevMax = bucket.max === 30 ? 0 : bucket.max === 60 ? 30 : 60;
                return d > prevMax && d <= bucket.max;
              });
              if (items.length === 0) return null;
              return (
                <div key={bucket.label}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-0.5 flex-1 rounded-full" style={{ background: `${bucket.color}30` }} />
                    <span className="text-[10px] font-extrabold px-3 py-1 rounded-full" style={{ background: `${bucket.color}12`, color: bucket.color }}>
                      {bucket.label} — {items.length} contrat{items.length > 1 ? "s" : ""}
                    </span>
                    <div className="h-0.5 flex-1 rounded-full" style={{ background: `${bucket.color}30` }} />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((c, i) => {
                      const d = daysLeft(c);
                      return (
                        <motion.div
                          key={c.id}
                          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}
                          className="relative overflow-hidden rounded-[20px] border p-4"
                          style={{ background: "rgba(8,6,24,0.92)", borderColor: `${bucket.color}25`, borderLeft: `3px solid ${bucket.color}` }}
                          whileHover={{ y: -3, boxShadow: `0 12px 28px rgba(0,0,0,0.4), 0 0 0 1px ${bucket.color}30` }}
                        >
                          {d <= 15 && (
                            <motion.div
                              className="absolute top-3 right-3 h-2 w-2 rounded-full"
                              style={{ background: F.danger }}
                              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                          )}
                          <div className="flex items-start gap-3 mb-3">
                            <div
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold text-white"
                              style={{ background: `linear-gradient(135deg,${bucket.color},${bucket.color}88)` }}
                            >
                              {c.holderName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                            </div>
                            <div>
                              <p className="text-xs font-extrabold" style={{ color: "var(--text-primary)" }}>{c.holderName}</p>
                              <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                                {(c.salaryMonthly / 1000).toFixed(0)}K DT/mois
                              </p>
                            </div>
                          </div>
                          <div className="space-y-1.5 mb-3">
                            <div className="flex items-center justify-between text-[9px]">
                              <span style={{ color: "rgba(255,255,255,0.35)" }}>Expiration</span>
                              <span className="font-bold" style={{ color: bucket.color }}>{new Date(c.endDate).toLocaleDateString("fr-FR")}</span>
                            </div>
                            <div className="flex items-center justify-between text-[9px]">
                              <span style={{ color: "rgba(255,255,255,0.35)" }}>Jours restants</span>
                              <span className="font-extrabold text-sm" style={{ color: bucket.color }}>{d}j</span>
                            </div>
                          </div>
                          <div className="h-1.5 w-full rounded-full overflow-hidden mb-3" style={{ background: "rgba(255,255,255,0.07)" }}>
                            <motion.div
                              className="h-1.5 rounded-full"
                              style={{ background: bucket.color }}
                              initial={{ width: "100%" }}
                              animate={{ width: `${Math.max(5, (d / 90) * 100)}%` }}
                              transition={{ duration: 1 }}
                            />
                          </div>
                          <div className="flex gap-1.5">
                            <motion.button
                              type="button"
                              className="flex-1 flex items-center justify-center gap-1 rounded-xl py-1.5 text-[9px] font-bold text-white"
                              style={{ background: `linear-gradient(135deg,${bucket.color},${bucket.color}cc)` }}
                              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                            >
                              <RefreshCw size={9} /> Renouveler
                            </motion.button>
                            <motion.button
                              type="button"
                              className="flex items-center justify-center gap-1 rounded-xl border px-3 py-1.5 text-[9px] font-bold"
                              style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.45)" }}
                              whileHover={{ scale: 1.04 }}
                            >
                              <FileText size={9} /> Voir
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {upcoming.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CheckCircle size={40} style={{ color: F.success }} className="mb-3" />
                <p className="text-sm font-bold" style={{ color: F.success }}>Aucun contrat à renouveler</p>
                <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>Tous les contrats sont valides pour les 90 prochains jours</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Contract Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border p-6" style={{ background: "var(--surface-panel)", borderColor: "var(--surface-panel-border)" }}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Nouveau contrat</h3>
              <button onClick={() => setShowAddModal(false)}><X size={16} style={{ color: "var(--text-muted)" }} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Titulaire *</label>
                <input
                  value={form.holderName}
                  onChange={e => setForm(f => ({ ...f, holderName: e.target.value }))}
                  placeholder="Nom du joueur / staff"
                  className="w-full rounded-xl border px-3 py-2 text-xs"
                  style={{ background: "var(--surface-input)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Date début *</label>
                  <input
                    type="date" value={form.startDate}
                    onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2 text-xs"
                    style={{ background: "var(--surface-input)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Date fin *</label>
                  <input
                    type="date" value={form.endDate}
                    onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2 text-xs"
                    style={{ background: "var(--surface-input)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Salaire mensuel (DT)</label>
                  <input
                    type="number" value={form.salaryMonthly}
                    onChange={e => setForm(f => ({ ...f, salaryMonthly: e.target.value }))}
                    placeholder="0"
                    className="w-full rounded-xl border px-3 py-2 text-xs"
                    style={{ background: "var(--surface-input)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Prime (DT)</label>
                  <input
                    type="number" value={form.bonus}
                    onChange={e => setForm(f => ({ ...f, bonus: e.target.value }))}
                    placeholder="0"
                    className="w-full rounded-xl border px-3 py-2 text-xs"
                    style={{ background: "var(--surface-input)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Clause libératoire</label>
                <input
                  value={form.releaseClause}
                  onChange={e => setForm(f => ({ ...f, releaseClause: e.target.value }))}
                  placeholder="Ex: 2.5M DT"
                  className="w-full rounded-xl border px-3 py-2 text-xs"
                  style={{ background: "var(--surface-input)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
                />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 rounded-xl border py-2 text-xs font-bold"
                style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-muted)" }}
              >Annuler</button>
              <button
                onClick={handleCreate}
                disabled={saving || !form.holderName || !form.startDate || !form.endDate}
                className="flex-1 rounded-xl py-2 text-xs font-bold text-white disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,var(--accent),#ff9d00)" }}
              >{saving ? "Enregistrement…" : "Créer le contrat"}</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
