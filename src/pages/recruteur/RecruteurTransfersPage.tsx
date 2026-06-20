import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Pencil, X, Wallet } from "lucide-react";
import { RecruteurPageTransition } from "../../components/recruteur/RecruteurPageTransition";
import { RecruteurKpiCard } from "../../components/recruteur/RecruteurKpiCard";
import { CountUpStat } from "../../components/player/CountUpStat";
import { TRANSFER_ROWS, TRANSFER_STATUS_CONFIG, type TransferRow, type TransferStatus } from "../../data/recruteurData";

export function RecruteurTransfersPage() {
  const [rows, setRows] = useState<TransferRow[]>(TRANSFER_ROWS);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const setStatus = (id: string, status: TransferStatus, msg: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    flash(msg);
  };

  const budget = 5;
  const spent = rows.filter((r) => r.status === "acceptee").reduce((s, r) => s + parseFloat(r.offer), 0);

  return (
    <RecruteurPageTransition>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <RecruteurKpiCard glow>
          <div className="flex items-center gap-2"><Wallet size={16} style={{ color: "#3B82F6" }} /><span className="text-xs" style={{ color: "var(--text-muted)" }}>Budget alloué</span></div>
          <div className="mt-2 text-3xl font-extrabold" style={{ color: "var(--text-primary)" }}><CountUpStat end={budget} decimals={1} suffix="M€" /></div>
        </RecruteurKpiCard>
        <RecruteurKpiCard delay={0.08}>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>Engagé (accepté)</span>
          <div className="mt-2 text-3xl font-extrabold" style={{ color: "#EF4444" }}><CountUpStat end={spent} decimals={1} suffix="M€" /></div>
        </RecruteurKpiCard>
        <RecruteurKpiCard delay={0.16}>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>Disponible</span>
          <div className="mt-2 text-3xl font-extrabold" style={{ color: "#22C55E" }}><CountUpStat end={budget - spent} decimals={1} suffix="M€" /></div>
        </RecruteurKpiCard>
      </div>

      <RecruteurKpiCard hover={false} className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                {["Joueur", "Club", "Valeur", "Offre", "Statut", "Impact budget", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const cfg = TRANSFER_STATUS_CONFIG[r.status];
                return (
                  <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                    <td className="px-4 py-3 font-semibold" style={{ color: "var(--text-primary)" }}>{r.player}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{r.club}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{r.value}</td>
                    <td className="px-4 py-3 font-bold" style={{ color: "#A855F7" }}>{r.offer}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: `${cfg.color}1f`, color: cfg.color }}>{cfg.label}</span>
                    </td>
                    <td className="px-4 py-3 font-medium" style={{ color: r.budgetImpact.startsWith("-") ? "#EF4444" : "var(--text-muted)" }}>{r.budgetImpact}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button type="button" onClick={() => setStatus(r.id, "offre_envoyee", `Offre envoyée pour ${r.player}`)} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white" style={{ background: "linear-gradient(135deg,#3B82F6,#6366F1)" }} title="Envoyer offre"><Send size={12} /></button>
                        <button type="button" onClick={() => setStatus(r.id, "en_negociation", `Offre modifiée pour ${r.player}`)} className="rounded-lg px-2.5 py-1.5 text-xs hover:bg-white/10" style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-muted)" }} title="Modifier"><Pencil size={12} /></button>
                        <button type="button" onClick={() => setStatus(r.id, "refusee", `Offre annulée pour ${r.player}`)} className="rounded-lg px-2.5 py-1.5 text-xs hover:bg-red-500/10" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }} title="Annuler"><X size={12} /></button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </RecruteurKpiCard>

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
