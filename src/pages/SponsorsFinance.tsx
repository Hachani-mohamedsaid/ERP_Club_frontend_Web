import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, DollarSign, AlertCircle, RefreshCw, Eye, Plus, X, Trash2 } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { useFinanceBackendData, BackendSponsor } from "../hooks/useFinanceBackendData";
import { clubApi } from "../lib/api/club";

const F = { primary: "#FF7A00", success: "#22C55E", danger: "#EF4444", info: "#3B82F6", warning: "#F59E0B" };

const STATUS_META = {
  Actif: { color: F.success, bg: "rgba(34,197,94,0.1)", label: "Actif", ring: "rgba(34,197,94,0.3)" },
  "Expire bientot": { color: F.warning, bg: "rgba(245,158,11,0.1)", label: "Expire bientôt", ring: "rgba(245,158,11,0.3)" },
  Expire: { color: F.danger, bg: "rgba(239,68,68,0.1)", label: "Expiré", ring: "rgba(239,68,68,0.3)" },
};

const PIE_COLORS = [F.primary, F.info, F.warning, F.success, F.danger];

function getSponsorMeta(s: BackendSponsor) {
  return STATUS_META[s.status as keyof typeof STATUS_META] ?? STATUS_META["Actif"];
}

export function SponsorsFinance() {
  const { sponsors, loading, refetchSponsors } = useFinanceBackendData();
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<"Tous" | string>("Tous");
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    nom: "", logo: "🤝", secteur: "", montant: "", startDate: "", endDate: "",
    renewalProbability: "50", status: "Actif", contact: "", notes: "",
  });
  const [saving, setSaving] = useState(false);

  const sponsorList = sponsors?.list ?? [];
  const sel = selected ? sponsorList.find(s => s.id === selected) : null;
  const filtered = filter === "Tous" ? sponsorList : sponsorList.filter(s => s.status === filter);

  const pieData = sponsorList.map(s => ({
    name: s.nom,
    value: Math.round((s.montant / (sponsorList.reduce((a, b) => a + b.montant, 0) || 1)) * 100),
  }));
  const totalAnnual = sponsors?.totalAnnual ?? 0;
  const activeSponsors = sponsors?.active ?? 0;
  const expiringSoon = sponsors?.expiringSoon ?? 0;

  const KPI = [
    { label: "Total Sponsoring", value: `${(totalAnnual / 1000).toFixed(0)}K DT`, trend: "+actif", color: F.success, icon: DollarSign },
    { label: "Sponsors actifs", value: String(activeSponsors), trend: "stable", color: F.info, icon: TrendingUp },
    { label: "À renouveler", value: String(expiringSoon), trend: expiringSoon > 0 ? "urgent" : "aucun", color: F.warning, icon: AlertCircle },
    { label: "Revenus ce mois", value: `${(totalAnnual / 12 / 1000).toFixed(0)}K DT`, trend: "+actif", color: F.primary, icon: TrendingUp },
  ];

  const handleCreate = async () => {
    if (!form.nom || !form.endDate) return;
    setSaving(true);
    try {
      await clubApi.createSponsor({
        nom: form.nom,
        logo: form.logo,
        secteur: form.secteur || "Partenaire",
        montant: Number(form.montant) || 0,
        startDate: form.startDate || undefined,
        endDate: form.endDate,
        renewalProbability: Number(form.renewalProbability) || 50,
        status: form.status,
        contact: form.contact || undefined,
        notes: form.notes || undefined,
      });
      setShowAddModal(false);
      setForm({ nom: "", logo: "🤝", secteur: "", montant: "", startDate: "", endDate: "", renewalProbability: "50", status: "Actif", contact: "", notes: "" });
      refetchSponsors();
    } catch (_) { /* silent */ } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce sponsor ?")) return;
    try {
      await clubApi.deleteSponsor(id);
      if (selected === id) setSelected(null);
      refetchSponsors();
    } catch (_) { /* silent */ }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw size={20} className="animate-spin" style={{ color: "var(--accent)" }} />
        <span className="ml-3 text-sm" style={{ color: "var(--text-muted)" }}>Chargement des sponsors…</span>
      </div>
    );
  }

  return (
    <motion.div className="space-y-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: "var(--text-primary)" }}>Gestion des Sponsors</h1>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
            {sponsorList.length} partenaires · {(totalAnnual / 1000).toFixed(0)}K DT / an
          </p>
        </div>
        <motion.button
          type="button" onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white"
          style={{ background: `linear-gradient(135deg,${F.primary},${F.primary}cc)` }}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        >
          <Plus size={12} /> Nouveau sponsor
        </motion.button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {KPI.map((k, i) => {
          const Icon = k.icon;
          return (
            <motion.div
              key={i} className="rounded-[18px] border p-4"
              style={{ background: "rgba(8,6,24,0.88)", borderColor: "rgba(255,255,255,0.07)" }}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: `${k.color}14` }}>
                  <Icon size={13} style={{ color: k.color }} />
                </div>
                <span className="text-[9px] font-bold" style={{ color: k.color }}>{k.trend}</span>
              </div>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>{k.label}</p>
              <p className="text-lg font-extrabold mt-0.5" style={{ color: k.color }}>{k.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {(["Tous", "Actif", "Expire bientot", "Expire"] as const).map(f => (
          <motion.button
            key={f} type="button" onClick={() => setFilter(f)}
            className="rounded-full px-3 py-1 text-[10px] font-bold"
            style={{
              background: filter === f ? F.primary : "rgba(255,255,255,0.05)",
              color: filter === f ? "white" : "rgba(255,255,255,0.4)",
            }}
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
          >
            {f === "Tous" ? "Tous" : STATUS_META[f as keyof typeof STATUS_META]?.label ?? f}
          </motion.button>
        ))}
      </div>

      {sponsorList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-[20px] border"
          style={{ background: "rgba(8,6,24,0.88)", borderColor: "rgba(255,255,255,0.07)" }}>
          <DollarSign size={40} style={{ color: "rgba(255,255,255,0.2)" }} className="mb-3" />
          <p className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>Aucun sponsor enregistré</p>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>Cliquez sur "Nouveau sponsor" pour en ajouter un</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
          {/* Sponsor cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {filtered.map((s, i) => {
                const meta = getSponsorMeta(s);
                const isSel = selected === s.id;
                return (
                  <motion.div
                    key={s.id} layout
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative overflow-hidden rounded-[22px] border cursor-pointer"
                    style={{
                      background: isSel ? `${F.primary}06` : "rgba(8,6,24,0.88)",
                      borderColor: isSel ? `${F.primary}40` : `${meta.color}20`,
                    }}
                    whileHover={{ y: -3, boxShadow: `0 12px 32px rgba(0,0,0,0.35), 0 0 0 1px ${meta.color}30` }}
                    onClick={() => setSelected(isSel ? null : s.id)}
                  >
                    <div className="h-0.5 w-full" style={{ background: meta.color }} />
                    <div className="p-5">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl"
                          style={{ background: `${meta.color}10`, border: `1.5px solid ${meta.color}30` }}>
                          {s.logo}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-extrabold" style={{ color: "var(--text-primary)" }}>{s.nom}</p>
                          <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>{s.secteur}</p>
                          <div className="mt-1 flex items-center gap-1.5">
                            <div className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                            <span className="text-[9px] font-bold" style={{ color: meta.color }}>{meta.label}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-base font-extrabold" style={{ color: F.success }}>{(s.montant / 1000).toFixed(0)}K DT</p>
                          <p className="text-[8px]" style={{ color: "rgba(255,255,255,0.3)" }}>par an</p>
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between text-[9px] mb-1">
                          <span style={{ color: "rgba(255,255,255,0.4)" }}>Probabilité renouvellement</span>
                          <span className="font-bold" style={{ color: meta.color }}>{s.renewalProbability}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                          <motion.div
                            className="h-1.5 rounded-full" style={{ background: meta.color }}
                            initial={{ width: 0 }} animate={{ width: `${s.renewalProbability}%` }}
                            transition={{ duration: 0.9, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[9px]">
                        <span style={{ color: "rgba(255,255,255,0.3)" }}>
                          {new Date(s.startDate).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })} → {new Date(s.endDate).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}
                        </span>
                        <div className="flex gap-1.5">
                          <motion.button
                            type="button"
                            className="flex items-center gap-1 rounded-lg border px-2 py-1 text-[9px] font-bold"
                            style={{ borderColor: `${meta.color}30`, color: meta.color, background: `${meta.color}08` }}
                            onClick={e => e.stopPropagation()}
                            whileHover={{ scale: 1.08 }}
                          >
                            <Eye size={9} /> Voir
                          </motion.button>
                          <motion.button
                            type="button"
                            className="flex items-center gap-1 rounded-lg border px-2 py-1 text-[9px] font-bold"
                            style={{ borderColor: `${F.danger}30`, color: F.danger, background: `${F.danger}08` }}
                            onClick={e => { e.stopPropagation(); handleDelete(s.id); }}
                            whileHover={{ scale: 1.08 }}
                          >
                            <Trash2 size={9} />
                          </motion.button>
                          {s.status !== "Actif" && (
                            <motion.button
                              type="button"
                              className="flex items-center gap-1 rounded-lg border px-2 py-1 text-[9px] font-bold"
                              style={{ borderColor: `${F.primary}30`, color: F.primary, background: `${F.primary}08` }}
                              onClick={e => e.stopPropagation()}
                              whileHover={{ scale: 1.08 }}
                            >
                              <RefreshCw size={9} /> Renouveler
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Right: pie + detail */}
          <div className="space-y-3">
            <div className="rounded-[20px] border p-5" style={{ background: "rgba(8,6,24,0.88)", borderColor: "rgba(255,255,255,0.07)" }}>
              <p className="text-xs font-bold mb-3" style={{ color: "var(--text-primary)" }}>Répartition sponsoring</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" innerRadius={45} outerRadius={75} paddingAngle={4}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "rgba(8,6,24,0.97)", border: "1px solid rgba(255,255,255,0.1)", color: "white", borderRadius: 10 }}
                      formatter={(v: number) => [`${v}%`, "Part"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-1 space-y-1.5">
                {sponsorList.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-2 text-[9px]">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="flex-1" style={{ color: "rgba(255,255,255,0.5)" }}>{s.nom}</span>
                    <span className="font-bold" style={{ color: "var(--text-primary)" }}>{(s.montant / 1000).toFixed(0)}K</span>
                  </div>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {sel && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="rounded-[20px] border p-4"
                  style={{ background: "rgba(8,6,24,0.95)", borderColor: `${getSponsorMeta(sel).color}25` }}
                >
                  <p className="text-[10px] font-bold mb-2" style={{ color: getSponsorMeta(sel).color }}>
                    {sel.logo} {sel.nom} — Détail
                  </p>
                  <div className="space-y-1.5 text-[10px]">
                    {[
                      { l: "Contact", v: sel.contact ?? "—" },
                      { l: "Secteur", v: sel.secteur },
                      { l: "Montant", v: `${(sel.montant / 1000).toFixed(0)}K DT / an` },
                      { l: "Contrat", v: `${new Date(sel.startDate).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })} → ${new Date(sel.endDate).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}` },
                      { l: "Note", v: sel.notes ?? "—" },
                    ].map(r => (
                      <div key={r.l} className="flex gap-2">
                        <span className="shrink-0 w-14" style={{ color: "rgba(255,255,255,0.3)" }}>{r.l}:</span>
                        <span style={{ color: "var(--text-primary)" }}>{r.v}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Add Sponsor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl border p-6 overflow-y-auto max-h-[90vh]"
            style={{ background: "var(--surface-panel)", borderColor: "var(--surface-panel-border)" }}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Nouveau sponsor</h3>
              <button onClick={() => setShowAddModal(false)}><X size={16} style={{ color: "var(--text-muted)" }} /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Nom *</label>
                  <input value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} placeholder="Nom du sponsor"
                    className="w-full rounded-xl border px-3 py-2 text-xs" style={{ background: "var(--surface-input)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Logo (emoji)</label>
                  <input value={form.logo} onChange={e => setForm(f => ({ ...f, logo: e.target.value }))} placeholder="🤝"
                    className="w-full rounded-xl border px-3 py-2 text-xs" style={{ background: "var(--surface-input)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Secteur</label>
                  <input value={form.secteur} onChange={e => setForm(f => ({ ...f, secteur: e.target.value }))} placeholder="Équipement, Télécom…"
                    className="w-full rounded-xl border px-3 py-2 text-xs" style={{ background: "var(--surface-input)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Montant annuel (DT)</label>
                  <input type="number" value={form.montant} onChange={e => setForm(f => ({ ...f, montant: e.target.value }))} placeholder="0"
                    className="w-full rounded-xl border px-3 py-2 text-xs" style={{ background: "var(--surface-input)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Date début</label>
                  <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2 text-xs" style={{ background: "var(--surface-input)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Date fin *</label>
                  <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2 text-xs" style={{ background: "var(--surface-input)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>% renouvellement</label>
                  <input type="number" min="0" max="100" value={form.renewalProbability} onChange={e => setForm(f => ({ ...f, renewalProbability: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2 text-xs" style={{ background: "var(--surface-input)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Statut</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2 text-xs" style={{ background: "var(--surface-input)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}>
                    <option value="Actif">Actif</option>
                    <option value="Expire bientot">Expire bientôt</option>
                    <option value="Expire">Expiré</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Contact</label>
                <input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} placeholder="Nom du contact"
                  className="w-full rounded-xl border px-3 py-2 text-xs" style={{ background: "var(--surface-input)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }} />
              </div>
              <div>
                <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Informations complémentaires…" rows={2}
                  className="w-full rounded-xl border px-3 py-2 text-xs" style={{ background: "var(--surface-input)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }} />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setShowAddModal(false)} className="flex-1 rounded-xl border py-2 text-xs font-bold"
                style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-muted)" }}>Annuler</button>
              <button onClick={handleCreate} disabled={saving || !form.nom || !form.endDate}
                className="flex-1 rounded-xl py-2 text-xs font-bold text-white disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,var(--accent),#ff9d00)" }}>
                {saving ? "Enregistrement…" : "Créer le sponsor"}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
