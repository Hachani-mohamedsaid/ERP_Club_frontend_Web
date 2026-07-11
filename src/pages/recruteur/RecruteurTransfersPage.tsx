import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Wallet, TrendingDown, TrendingUp } from "lucide-react";
import { RecruteurPageTransition } from "../../components/recruteur/RecruteurPageTransition";
import { RecruteurKpiCard } from "../../components/recruteur/RecruteurKpiCard";
import { CountUpStat } from "../../components/player/CountUpStat";
import { clubApi } from "../../lib/api/club";

interface TransferDto {
  id: string;
  playerName: string;
  transferType: string;
  club: string;
  value: string;
  status: string;
  probability: number;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  "Confirmé": "#22C55E",
  "En négociation": "#F59E0B",
  "Offre envoyée": "#3B82F6",
  "Refusée": "#EF4444",
  "Brouillon": "#6366F1",
};
const statusColor = (s: string) => STATUS_COLORS[s] ?? "#8B5CF6";

const EMPTY_FORM = { playerName: "", club: "", value: "", transferType: "ACHAT", status: "En négociation", probability: "60" };

function parseMK(value: string): number {
  const cleaned = value.replace(/\s/g, "").toUpperCase();
  const num = parseFloat(cleaned.replace(/[^\d.,]/g, "").replace(",", "."));
  if (!Number.isFinite(num)) return 0;
  if (cleaned.includes("M")) return num;
  if (cleaned.includes("K")) return num / 1000;
  return num;
}

export function RecruteurTransfersPage() {
  const [rows, setRows] = useState<TransferDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchRows = useCallback(() => {
    setLoading(true);
    setError(null);
    (clubApi.getTransfers() as Promise<TransferDto[]>)
      .then(setRows)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Erreur de chargement."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const engaged = rows.filter(r => r.transferType === "ACHAT" && r.status !== "Refusée").reduce((s, r) => s + parseMK(r.value), 0);
  const incoming = rows.filter(r => r.transferType === "VENTE" && r.status !== "Refusée").reduce((s, r) => s + parseMK(r.value), 0);

  async function submitTransfer() {
    if (!form.playerName.trim() || !form.club.trim() || !form.value.trim()) return;
    setSaving(true);
    try {
      const created = await clubApi.createTransfer({
        playerName: form.playerName,
        club: form.club,
        value: form.value,
        transferType: form.transferType,
        status: form.status,
        probability: Number(form.probability) || 0,
      }) as TransferDto;
      setRows(prev => [created, ...prev]);
      setForm(EMPTY_FORM);
      setShowModal(false);
      flash(`Transfert créé pour ${created.playerName}`);
    } catch {
      // keep modal open so the user can retry
    } finally {
      setSaving(false);
    }
  }

  async function cancelTransfer(id: string, player: string) {
    setRows(prev => prev.filter(r => r.id !== id));
    await clubApi.deleteTransfer(id).catch(() => {});
    flash(`Transfert annulé pour ${player}`);
  }

  return (
    <RecruteurPageTransition>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>{rows.length} transferts suivis</p>
        <motion.button type="button" onClick={() => { setForm(EMPTY_FORM); setShowModal(true); }}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)", boxShadow: "0 0 16px rgba(139,92,246,0.35)" }}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Plus size={14} /> Nouveau transfert
        </motion.button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <RecruteurKpiCard glow>
          <div className="flex items-center gap-2"><Wallet size={16} style={{ color: "#3B82F6" }} /><span className="text-xs" style={{ color: "var(--text-muted)" }}>Transferts suivis</span></div>
          <div className="mt-2 text-3xl font-extrabold" style={{ color: "var(--text-primary)" }}>{loading ? "…" : <CountUpStat end={rows.length} />}</div>
        </RecruteurKpiCard>
        <RecruteurKpiCard delay={0.08}>
          <div className="flex items-center gap-2"><TrendingDown size={16} style={{ color: "#EF4444" }} /><span className="text-xs" style={{ color: "var(--text-muted)" }}>Engagé (achats)</span></div>
          <div className="mt-2 text-3xl font-extrabold" style={{ color: "#EF4444" }}>{loading ? "…" : <CountUpStat end={engaged} decimals={1} suffix="M€" />}</div>
        </RecruteurKpiCard>
        <RecruteurKpiCard delay={0.16}>
          <div className="flex items-center gap-2"><TrendingUp size={16} style={{ color: "#22C55E" }} /><span className="text-xs" style={{ color: "var(--text-muted)" }}>Attendu (ventes)</span></div>
          <div className="mt-2 text-3xl font-extrabold" style={{ color: "#22C55E" }}>{loading ? "…" : <CountUpStat end={incoming} decimals={1} suffix="M€" />}</div>
        </RecruteurKpiCard>
      </div>

      {error && !loading && (
        <RecruteurKpiCard hover={false}><p className="text-center text-sm text-red-400">{error}</p></RecruteurKpiCard>
      )}

      {!error && (
        <RecruteurKpiCard hover={false} className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                  {["Joueur", "Club", "Type", "Valeur", "Statut", "Probabilité", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center" style={{ color: "var(--text-muted)" }}>Chargement…</td></tr>
                )}
                {!loading && rows.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center" style={{ color: "var(--text-muted)" }}>Aucun transfert suivi</td></tr>
                )}
                {!loading && rows.map((r, i) => {
                  const color = statusColor(r.status);
                  return (
                    <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-t" style={{ borderColor: "var(--surface-panel-border)" }}>
                      <td className="px-4 py-3 font-semibold" style={{ color: "var(--text-primary)" }}>{r.playerName}</td>
                      <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{r.club}</td>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{r.transferType}</td>
                      <td className="px-4 py-3 font-bold" style={{ color: "#A855F7" }}>{r.value}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: `${color}1f`, color }}>{r.status}</span>
                      </td>
                      <td className="px-4 py-3 font-medium" style={{ color: "var(--text-muted)" }}>{r.probability}%</td>
                      <td className="px-4 py-3">
                        <button type="button" onClick={() => void cancelTransfer(r.id, r.playerName)}
                          className="rounded-lg px-2.5 py-1.5 text-xs hover:bg-red-500/10" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }} title="Annuler">
                          <X size={12} />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </RecruteurKpiCard>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setShowModal(false)}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="w-full max-w-md rounded-[24px] border p-6"
              style={{ background: "rgba(14,10,35,0.98)", borderColor: "rgba(139,92,246,0.35)" }}
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Nouveau transfert</p>
                <button type="button" onClick={() => setShowModal(false)} className="rounded-lg p-1.5"
                  style={{ background: "rgba(255,255,255,0.06)" }}>
                  <X size={14} style={{ color: "var(--text-muted)" }} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium mb-1" style={{ color: "var(--text-muted)" }}>Joueur</label>
                  <input value={form.playerName} onChange={e => setForm(f => ({ ...f, playerName: e.target.value }))}
                    placeholder="Ex: Ahmed Ali" className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <label className="block text-[11px] font-medium mb-1" style={{ color: "var(--text-muted)" }}>Club</label>
                  <input value={form.club} onChange={e => setForm(f => ({ ...f, club: e.target.value }))}
                    placeholder="Ex: Académie Sfax" className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium mb-1" style={{ color: "var(--text-muted)" }}>Type</label>
                    <select value={form.transferType} onChange={e => setForm(f => ({ ...f, transferType: e.target.value }))}
                      className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                      style={{ background: "var(--surface-modal)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}>
                      {["ACHAT", "VENTE", "PRET"].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium mb-1" style={{ color: "var(--text-muted)" }}>Valeur</label>
                    <input value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                      placeholder="Ex: 1.2M€" className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                      style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium mb-1" style={{ color: "var(--text-muted)" }}>Statut</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                      className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                      style={{ background: "var(--surface-modal)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}>
                      {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium mb-1" style={{ color: "var(--text-muted)" }}>Probabilité %</label>
                    <input type="number" min={0} max={100} value={form.probability} onChange={e => setForm(f => ({ ...f, probability: e.target.value }))}
                      className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                      style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }} />
                  </div>
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="rounded-xl border px-4 py-2 text-xs" style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-muted)" }}>
                  Annuler
                </button>
                <motion.button type="button" onClick={() => void submitTransfer()} disabled={saving || !form.playerName.trim() || !form.club.trim() || !form.value.trim()}
                  className="rounded-xl px-5 py-2 text-xs font-bold text-white disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)" }}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  {saving ? "Création…" : "Créer"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-2xl"
            style={{ background: "linear-gradient(135deg,#8B5CF6,#6366F1)" }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </RecruteurPageTransition>
  );
}
