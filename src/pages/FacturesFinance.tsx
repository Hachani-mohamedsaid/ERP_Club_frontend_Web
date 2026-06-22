import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Clock, CheckCircle, Plus, Download, Eye, CreditCard, AlertTriangle } from "lucide-react";

const F = { primary: "#FF7A00", success: "#22C55E", danger: "#EF4444", info: "#3B82F6", warning: "#F59E0B" };

interface Invoice {
  id: string; reference: string; fournisseur: string;
  type: "Fournisseur" | "Équipement" | "Médical" | "Transport";
  montant: number; date: string;
  status: "Payée" | "En attente" | "Retard";
}

const INVOICES: Invoice[] = [
  { id: "1", reference: "FAC-001", fournisseur: "Équipement Sport Plus",   type: "Équipement",  montant: 15000, date: "01/06/2026", status: "Payée"      },
  { id: "2", reference: "FAC-002", fournisseur: "Maintenance Stade",        type: "Transport",   montant: 8500,  date: "05/06/2026", status: "Payée"      },
  { id: "3", reference: "FAC-003", fournisseur: "Transport Club",           type: "Transport",   montant: 12000, date: "10/06/2026", status: "En attente" },
  { id: "4", reference: "FAC-004", fournisseur: "Assurance Joueurs",        type: "Fournisseur", montant: 25000, date: "15/05/2026", status: "Retard"     },
  { id: "5", reference: "FAC-005", fournisseur: "Fournitures Médicales",    type: "Médical",     montant: 6500,  date: "12/06/2026", status: "En attente" },
  { id: "6", reference: "FAC-006", fournisseur: "Gardiennage Sécurité",     type: "Fournisseur", montant: 9800,  date: "08/06/2026", status: "Payée"      },
  { id: "7", reference: "FAC-007", fournisseur: "Rénovation Vestiaires",    type: "Équipement",  montant: 32000, date: "20/05/2026", status: "Payée"      },
  { id: "8", reference: "FAC-008", fournisseur: "Traitement Pelouse",       type: "Transport",   montant: 7200,  date: "18/06/2026", status: "En attente" },
];

const STATUS_META = {
  "Payée":       { icon: CheckCircle,   color: F.success, bg: "rgba(34,197,94,0.1)",   label: "Payée"      },
  "En attente":  { icon: Clock,         color: F.warning, bg: "rgba(245,158,11,0.1)",  label: "En attente" },
  "Retard":      { icon: AlertTriangle, color: F.danger,  bg: "rgba(239,68,68,0.1)",   label: "Retard"     },
};

type InvoiceStatus = Invoice["status"];

export function FacturesFinance() {
  const [filter, setFilter] = useState<"Tous" | InvoiceStatus>("Tous");

  const payees     = INVOICES.filter(i => i.status === "Payée");
  const enAttente  = INVOICES.filter(i => i.status === "En attente");
  const retard     = INVOICES.filter(i => i.status === "Retard");

  const totalPayees    = payees.reduce((a, i) => a + i.montant, 0);
  const totalAttente   = enAttente.reduce((a, i) => a + i.montant, 0);
  const totalRetard    = retard.reduce((a, i) => a + i.montant, 0);
  const totalAll       = INVOICES.reduce((a, i) => a + i.montant, 0);

  const filtered = filter === "Tous" ? INVOICES : INVOICES.filter(i => i.status === filter);

  const PROGRESS_CARDS = [
    {
      label: "Factures payées",  sub: `${payees.length} factures`,
      amount: totalPayees, pct: Math.round((totalPayees / totalAll) * 100),
      color: F.success, icon: CheckCircle, bg: "rgba(34,197,94,0.07)",
    },
    {
      label: "En attente",       sub: `${enAttente.length} factures`,
      amount: totalAttente, pct: Math.round((totalAttente / totalAll) * 100),
      color: F.warning, icon: Clock, bg: "rgba(245,158,11,0.07)",
    },
    {
      label: "En retard",        sub: `${retard.length} factures — action requise`,
      amount: totalRetard, pct: Math.round((totalRetard / totalAll) * 100),
      color: F.danger, icon: AlertTriangle, bg: "rgba(239,68,68,0.07)",
    },
    {
      label: "Total factures",   sub: `${INVOICES.length} factures ce mois`,
      amount: totalAll, pct: 100,
      color: F.info, icon: CreditCard, bg: "rgba(59,130,246,0.07)",
    },
  ];

  return (
    <motion.div className="space-y-5" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: "var(--text-primary)" }}>Gestion des Factures</h1>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
            {INVOICES.length} factures · {(totalAll / 1000).toFixed(1)}K DT total
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button type="button" className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold"
            style={{ borderColor: `${F.primary}30`, color: F.primary, background: `${F.primary}08` }}
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}>
            <Plus size={12} /> Nouvelle facture
          </motion.button>
          <motion.button type="button" className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold"
            style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}>
            <Download size={12} /> Export
          </motion.button>
        </div>
      </div>

      {/* Progress KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {PROGRESS_CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div key={i} className="relative overflow-hidden rounded-[20px] border p-4 cursor-pointer"
              style={{ background: card.bg, borderColor: `${card.color}20` }}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              whileHover={{ y: -3, boxShadow: `0 12px 30px rgba(0,0,0,0.3), 0 0 0 1px ${card.color}30` }}
              onClick={() => setFilter(i === 0 ? "Payée" : i === 1 ? "En attente" : i === 2 ? "Retard" : "Tous")}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: `${card.color}18` }}>
                  <Icon size={14} style={{ color: card.color }} />
                </div>
                <span className="text-[9px] font-extrabold rounded-full px-2 py-0.5"
                  style={{ background: `${card.color}15`, color: card.color }}>{card.pct}%</span>
              </div>
              <p className="text-[9px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>{card.label}</p>
              <p className="text-lg font-extrabold mt-0.5" style={{ color: card.color }}>
                {(card.amount / 1000).toFixed(0)}K DT
              </p>
              <p className="text-[8px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{card.sub}</p>
              {/* Bottom progress bar */}
              <div className="mt-3 h-1 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                <motion.div className="h-1 rounded-full" style={{ background: card.color }}
                  initial={{ width: 0 }} animate={{ width: `${card.pct}%` }} transition={{ duration: 0.9, ease: "easeOut", delay: i * 0.1 }} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Alert banner for overdue */}
      <AnimatePresence>
        {retard.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 rounded-[16px] border px-4 py-3"
            style={{ background: "rgba(239,68,68,0.07)", borderColor: "rgba(239,68,68,0.25)", borderLeft: `3px solid ${F.danger}` }}>
            <AlertTriangle size={14} style={{ color: F.danger, flexShrink: 0 }} />
            <p className="text-xs" style={{ color: "var(--text-primary)" }}>
              <span className="font-bold" style={{ color: F.danger }}>Action requise : </span>
              {retard.length} facture{retard.length > 1 ? "s" : ""} en retard pour un total de{" "}
              <span className="font-bold">{(totalRetard / 1000).toFixed(1)}K DT</span>.
              Régulariser avant fin de mois.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter chips */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {(["Tous", "Payée", "En attente", "Retard"] as const).map(f => {
            const color = f === "Tous" ? F.info : STATUS_META[f as InvoiceStatus].color;
            return (
              <motion.button key={f} type="button" onClick={() => setFilter(f)}
                className="rounded-full px-3 py-1 text-[10px] font-bold"
                style={{
                  background: filter === f ? color : "rgba(255,255,255,0.05)",
                  color: filter === f ? "white" : "rgba(255,255,255,0.45)",
                }}
                whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
                {f === "Tous" ? `Toutes (${INVOICES.length})` : f === "Payée" ? `Payées (${payees.length})` : f === "En attente" ? `En attente (${enAttente.length})` : `Retard (${retard.length})`}
              </motion.button>
            );
          })}
        </div>
        <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
          {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Invoice list */}
      <div className="rounded-[22px] border overflow-hidden" style={{ background: "rgba(8,6,24,0.88)", borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="px-5 pt-4 pb-3 border-b flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
            <FileText size={12} className="inline mr-1.5" style={{ color: F.primary }} />
            Liste des factures
          </p>
        </div>
        <div className="divide-y" style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}>
          <AnimatePresence mode="popLayout">
            {filtered.map((inv, i) => {
              const meta = STATUS_META[inv.status];
              const StatusIcon = meta.icon;
              return (
                <motion.div key={inv.id} layout
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-4 px-5 py-3.5"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  whileHover={{ background: "rgba(255,255,255,0.02)" }}>

                  {/* Icon */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: meta.bg }}>
                    <StatusIcon size={13} style={{ color: meta.color }} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                      {inv.reference} — {inv.fournisseur}
                    </p>
                    <p className="text-[9px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {inv.date} · {inv.type}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right shrink-0">
                    <p className="text-sm font-extrabold" style={{ color: "var(--text-primary)" }}>
                      {inv.montant.toLocaleString("fr-TN")} DT
                    </p>
                  </div>

                  {/* Status badge */}
                  <span className="shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold"
                    style={{ background: meta.bg, color: meta.color }}>
                    {meta.label}
                  </span>

                  {/* Actions */}
                  <div className="flex gap-1.5 shrink-0">
                    <motion.button type="button"
                      className="flex items-center gap-1 rounded-lg border px-2 py-1 text-[9px] font-bold"
                      style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.45)" }}
                      whileHover={{ scale: 1.08, borderColor: `${F.info}40`, color: F.info }}>
                      <Eye size={9} /> Voir
                    </motion.button>
                    {inv.status !== "Payée" && (
                      <motion.button type="button"
                        className="flex items-center gap-1 rounded-lg border px-2 py-1 text-[9px] font-bold"
                        style={{ borderColor: `${F.success}30`, color: F.success, background: `${F.success}08` }}
                        whileHover={{ scale: 1.08 }}>
                        <CheckCircle size={9} /> Payer
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
