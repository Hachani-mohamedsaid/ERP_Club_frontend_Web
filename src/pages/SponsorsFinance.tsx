import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, DollarSign, AlertCircle, RefreshCw, Eye, Plus } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const F = { primary: "#FF7A00", success: "#22C55E", danger: "#EF4444", info: "#3B82F6", warning: "#F59E0B" };

interface Sponsor {
  id: string; nom: string; logo: string; secteur: string;
  montant: number; debut: string; fin: string; renouvellement: number;
  statut: "Actif" | "Expire bientot" | "Expire";
  contact: string; notes: string;
}

const SPONSORS: Sponsor[] = [
  { id: "1", nom: "Nike",    logo: "👟", secteur: "Équipement", montant: 450000, debut: "2024-01", fin: "2027-01", renouvellement: 95, statut: "Actif",          contact: "Sophie Martin",   notes: "Partenaire équipementier principal" },
  { id: "2", nom: "Emirates",logo: "✈️", secteur: "Aviation",   montant: 350000, debut: "2023-06", fin: "2026-06", renouvellement: 80, statut: "Actif",          contact: "John Blake",      notes: "Sponsor maillot domicile" },
  { id: "3", nom: "Ooredoo", logo: "📡", secteur: "Télécom",    montant: 280000, debut: "2025-08", fin: "2026-08", renouvellement: 55, statut: "Expire bientot", contact: "Ahmed Karoui",    notes: "À renouveler avant août" },
  { id: "4", nom: "STEG",    logo: "⚡", secteur: "Énergie",    montant: 200000, debut: "2024-01", fin: "2026-01", renouvellement: 40, statut: "Expire bientot", contact: "Leila Ben Salem",  notes: "Proposition de renouvellement envoyée" },
  { id: "5", nom: "Attijari", logo: "🏦", secteur: "Finance",   montant: 150000, debut: "2022-01", fin: "2025-12", renouvellement: 10, statut: "Expire",        contact: "Mehdi Dridi",     notes: "Négociations en pause" },
];

const STATUS_META = {
  "Actif":          { color: F.success, bg: "rgba(34,197,94,0.1)",   label: "Actif",         ring: "rgba(34,197,94,0.3)"   },
  "Expire bientot": { color: F.warning, bg: "rgba(245,158,11,0.1)",  label: "Expire bientôt", ring: "rgba(245,158,11,0.3)"  },
  "Expire":         { color: F.danger,  bg: "rgba(239,68,68,0.1)",   label: "Expiré",         ring: "rgba(239,68,68,0.3)"   },
};

const PIE_COLORS = [F.primary, F.info, F.warning, F.success, F.danger];

const KPI = [
  { label: "Total Sponsoring",   value: "1.43M DT",  trend: "+12%",  color: F.success, icon: DollarSign  },
  { label: "Sponsors actifs",    value: "2",          trend: "stable",color: F.info,    icon: TrendingUp  },
  { label: "À renouveler",       value: "2",          trend: "urgent",color: F.warning, icon: AlertCircle },
  { label: "Revenus ce mois",    value: "119K DT",    trend: "+3%",   color: F.primary, icon: TrendingUp  },
];

export function SponsorsFinance() {
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<"Tous" | Sponsor["statut"]>("Tous");

  const sel = selected ? SPONSORS.find(s => s.id === selected) : null;
  const filtered = SPONSORS.filter(s => filter === "Tous" || s.statut === filter);

  const pieData = SPONSORS.map(s => ({ name: s.nom, value: Math.round((s.montant / SPONSORS.reduce((a, b) => a + b.montant, 0)) * 100) }));
  const totalMontant = SPONSORS.reduce((a, s) => a + s.montant, 0);

  return (
    <motion.div className="space-y-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: "var(--text-primary)" }}>Gestion des Sponsors</h1>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
            {SPONSORS.length} partenaires · {(totalMontant / 1000).toFixed(0)}K DT / an
          </p>
        </div>
        <motion.button type="button"
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white"
          style={{ background: `linear-gradient(135deg,${F.primary},${F.primary}cc)` }}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Plus size={12} /> Nouveau sponsor
        </motion.button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {KPI.map((k, i) => {
          const Icon = k.icon;
          return (
            <motion.div key={i} className="rounded-[18px] border p-4"
              style={{ background: "rgba(8,6,24,0.88)", borderColor: "rgba(255,255,255,0.07)" }}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              whileHover={{ y: -2 }}>
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
          <motion.button key={f} type="button" onClick={() => setFilter(f)}
            className="rounded-full px-3 py-1 text-[10px] font-bold"
            style={{
              background: filter === f ? F.primary : "rgba(255,255,255,0.05)",
              color: filter === f ? "white" : "rgba(255,255,255,0.4)",
            }}
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
            {f === "Tous" ? "Tous" : STATUS_META[f as Sponsor["statut"]].label}
          </motion.button>
        ))}
      </div>

      {/* Sponsor cards + pie */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((s, i) => {
              const meta = STATUS_META[s.statut];
              const isSel = selected === s.id;
              return (
                <motion.div key={s.id} layout
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative overflow-hidden rounded-[22px] border cursor-pointer"
                  style={{
                    background: isSel ? `${F.primary}06` : "rgba(8,6,24,0.88)",
                    borderColor: isSel ? `${F.primary}40` : `${meta.color}20`,
                  }}
                  whileHover={{ y: -3, boxShadow: `0 12px 32px rgba(0,0,0,0.35), 0 0 0 1px ${meta.color}30` }}
                  onClick={() => setSelected(isSel ? null : s.id)}>

                  {/* Status strip */}
                  <div className="h-0.5 w-full" style={{ background: meta.color }} />

                  <div className="p-5">
                    {/* Logo + name */}
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

                    {/* Renewal progress */}
                    <div className="mb-3">
                      <div className="flex justify-between text-[9px] mb-1">
                        <span style={{ color: "rgba(255,255,255,0.4)" }}>Probabilité renouvellement</span>
                        <span className="font-bold" style={{ color: meta.color }}>{s.renouvellement}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                        <motion.div className="h-1.5 rounded-full" style={{ background: meta.color }}
                          initial={{ width: 0 }} animate={{ width: `${s.renouvellement}%` }} transition={{ duration: 0.9, ease: "easeOut" }} />
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center justify-between text-[9px]">
                      <span style={{ color: "rgba(255,255,255,0.3)" }}>Contrat: {s.debut} → {s.fin}</span>
                      <div className="flex gap-1.5">
                        <motion.button type="button"
                          className="flex items-center gap-1 rounded-lg border px-2 py-1 text-[9px] font-bold"
                          style={{ borderColor: `${meta.color}30`, color: meta.color, background: `${meta.color}08` }}
                          onClick={e => e.stopPropagation()}
                          whileHover={{ scale: 1.08 }}>
                          <Eye size={9} /> Voir
                        </motion.button>
                        {s.statut !== "Actif" && (
                          <motion.button type="button"
                            className="flex items-center gap-1 rounded-lg border px-2 py-1 text-[9px] font-bold"
                            style={{ borderColor: `${F.primary}30`, color: F.primary, background: `${F.primary}08` }}
                            onClick={e => e.stopPropagation()}
                            whileHover={{ scale: 1.08 }}>
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

        {/* Pie chart + detail */}
        <div className="space-y-3">
          <div className="rounded-[20px] border p-5" style={{ background: "rgba(8,6,24,0.88)", borderColor: "rgba(255,255,255,0.07)" }}>
            <p className="text-xs font-bold mb-3" style={{ color: "var(--text-primary)" }}>Répartition sponsoring</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" innerRadius={45} outerRadius={75} paddingAngle={4}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "rgba(8,6,24,0.97)", border: "1px solid rgba(255,255,255,0.1)", color: "white", borderRadius: 10 }} formatter={(v: number) => [`${v}%`, "Part"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-1 space-y-1.5">
              {SPONSORS.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2 text-[9px]">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="flex-1" style={{ color: "rgba(255,255,255,0.5)" }}>{s.nom}</span>
                  <span className="font-bold" style={{ color: "var(--text-primary)" }}>{(s.montant / 1000).toFixed(0)}K</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected detail */}
          <AnimatePresence>
            {sel && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="rounded-[20px] border p-4"
                style={{ background: "rgba(8,6,24,0.95)", borderColor: `${STATUS_META[sel.statut].color}25` }}>
                <p className="text-[10px] font-bold mb-2" style={{ color: STATUS_META[sel.statut].color }}>
                  {sel.logo} {sel.nom} — Détail
                </p>
                <div className="space-y-1.5 text-[10px]">
                  {[
                    { l: "Contact",  v: sel.contact },
                    { l: "Montant",  v: `${(sel.montant / 1000).toFixed(0)}K DT / an` },
                    { l: "Contrat",  v: `${sel.debut} → ${sel.fin}` },
                    { l: "Note",     v: sel.notes },
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
    </motion.div>
  );
}
