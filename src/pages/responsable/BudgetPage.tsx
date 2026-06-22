import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Plus, CheckCircle2, XCircle, TrendingUp, TrendingDown, Clock, Pencil, Wallet } from "lucide-react";
import { RPage, RCard, RHeader, RSection, RRow, RPills, RBtn, RKpiCard, pageVariants, cardVariants } from "../../components/responsable";

/* ── Types & data ─────────────────────────────────────────────── */
type DepenseStatus = "En attente" | "Approuvée" | "Refusée";

interface Budget {
  id: string; category: string; allocated: number; spent: number; remaining: number;
}
interface Depense {
  id: string; label: string; category: string; amount: number;
  requestedBy: string; date: string; status: DepenseStatus; note?: string;
}

const BUDGETS: Budget[] = [
  { id: "b1", category: "Recrutement",    allocated: 120000, spent: 68000,  remaining: 52000 },
  { id: "b2", category: "Équipement",     allocated: 40000,  spent: 28500,  remaining: 11500 },
  { id: "b3", category: "Déplacements",   allocated: 30000,  spent: 18000,  remaining: 12000 },
  { id: "b4", category: "Infrastructure", allocated: 80000,  spent: 45000,  remaining: 35000 },
  { id: "b5", category: "Médical",        allocated: 25000,  spent: 14200,  remaining: 10800 },
];

const INIT_DEPENSES: Depense[] = [
  { id: "d1", label: "Achat équipement médical",  category: "Médical",      amount: 18500, requestedBy: "Médecin Ines",   date: "19/06", status: "En attente" },
  { id: "d2", label: "Transport match Sfax",       category: "Déplacements", amount: 8400,  requestedBy: "Admin",          date: "18/06", status: "En attente" },
  { id: "d3", label: "Prime de victoire joueurs",  category: "Recrutement",  amount: 15000, requestedBy: "Coach Sonia",    date: "17/06", status: "Approuvée" },
  { id: "d4", label: "Rénovation vestiaires",      category: "Infrastructure",amount: 22000, requestedBy: "Admin",          date: "16/06", status: "Refusée", note: "Budget insuffisant." },
  { id: "d5", label: "Maillots nouvelle saison",   category: "Équipement",   amount: 9800,  requestedBy: "Coach Sonia",    date: "14/06", status: "Approuvée" },
];

const STATUS_COLOR: Record<DepenseStatus, string> = {
  "En attente": "#FF7A00",
  "Approuvée":  "#22C55E",
  "Refusée":    "#EF4444",
};
const FILTERS = ["Tous", "En attente", "Approuvée", "Refusée"] as const;

function BudgetBar({ pct, color = "var(--accent)" }: { pct: number; color?: string }) {
  return (
    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
      <motion.div className="h-full rounded-full" style={{ background: color }}
        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
        transition={{ duration: 0.9, ease: "easeOut" }} />
    </div>
  );
}

export function BudgetPage() {
  const [depenses, setDepenses] = useState<Depense[]>(INIT_DEPENSES);
  const [filter, setFilter] = useState<string>("En attente");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ label: "", category: "Recrutement", amount: "", note: "" });

  const filtered = filter === "Tous" ? depenses : depenses.filter(d => d.status === filter);

  const totalAllocated = BUDGETS.reduce((s, b) => s + b.allocated, 0);
  const totalSpent = BUDGETS.reduce((s, b) => s + b.spent, 0);
  const totalRemaining = totalAllocated - totalSpent;

  function decide(id: string, status: DepenseStatus) {
    setDepenses(prev => prev.map(d => d.id === id ? { ...d, status } : d));
  }

  function submitDepense() {
    if (!form.label || !form.amount) return;
    const newD: Depense = {
      id: `d${Date.now()}`, label: form.label, category: form.category,
      amount: Number(form.amount), requestedBy: "Responsable", date: "21/06",
      status: "En attente", note: form.note || undefined,
    };
    setDepenses(prev => [newD, ...prev]);
    setShowModal(false);
    setForm({ label: "", category: "Recrutement", amount: "", note: "" });
  }

  return (
    <RPage>
      <RHeader
        title="Gestion Budget"
        subtitle="Vue globale des budgets, dépenses et approbations."
        action={<RBtn onClick={() => setShowModal(true)}><Plus size={14} /> Nouvelle dépense</RBtn>}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <RKpiCard label="Total alloué"   value={`${(totalAllocated/1000).toFixed(0)} kDT`}  icon={Wallet}        color="#3B82F6" />
        <RKpiCard label="Dépensé"        value={`${(totalSpent/1000).toFixed(0)} kDT`}       icon={TrendingUp}    color="#FF7A00" />
        <RKpiCard label="Restant"        value={`${(totalRemaining/1000).toFixed(0)} kDT`}   icon={TrendingDown}  color="#22C55E" />
        <RKpiCard label="En attente"     value={String(depenses.filter(d => d.status === "En attente").length)} icon={Clock} color="#F59E0B" />
      </div>

      {/* Budget bars */}
      <RSection title="Répartition budgétaire" subtitle="Par catégorie">
        <motion.div className="space-y-4" variants={pageVariants} initial="hidden" animate="visible">
          {BUDGETS.map(b => {
            const pct = Math.round((b.spent / b.allocated) * 100);
            const color = pct > 85 ? "#EF4444" : pct > 65 ? "#FF7A00" : "#22C55E";
            return (
              <motion.div key={b.id} variants={cardVariants} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium" style={{ color: "var(--text-primary)" }}>{b.category}</span>
                  <div className="flex gap-3 text-[11px]">
                    <span style={{ color: "var(--text-muted)" }}>Alloué: <strong style={{ color: "var(--text-primary)" }}>{b.allocated.toLocaleString()} DT</strong></span>
                    <span style={{ color: "var(--text-muted)" }}>Dépensé: <strong style={{ color }}>{b.spent.toLocaleString()} DT</strong></span>
                    <span style={{ color: "var(--text-muted)" }}>Restant: <strong style={{ color: "#22C55E" }}>{b.remaining.toLocaleString()} DT</strong></span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <BudgetBar pct={pct} color={color} />
                  <span className="shrink-0 text-xs font-bold" style={{ color }}>{pct}%</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </RSection>

      {/* Dépenses */}
      <div>
        <div className="mb-3">
          <RPills options={[...FILTERS]} value={filter} onChange={setFilter} />
        </div>
        <RSection title="Demandes de dépense" subtitle={`${filtered.length} dépense${filtered.length !== 1 ? "s" : ""}`}>
          <div className="space-y-3">
            {filtered.map((d, i) => (
              <motion.div key={d.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <RRow>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: "rgba(255,122,0,0.12)" }}>
                        <DollarSign size={14} style={{ color: "var(--accent)" }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{d.label}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{d.category} · {d.requestedBy} · {d.date}</p>
                        {d.note && <p className="mt-0.5 text-[11px] italic" style={{ color: "#EF4444" }}>{d.note}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-base font-extrabold" style={{ color: "var(--accent)" }}>{d.amount.toLocaleString()} DT</p>
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{ background: `${STATUS_COLOR[d.status]}18`, color: STATUS_COLOR[d.status] }}>
                          {d.status}
                        </span>
                      </div>
                      {d.status === "En attente" && (
                        <div className="flex gap-1.5">
                          <RBtn onClick={() => decide(d.id, "Approuvée")} variant="success"><CheckCircle2 size={12} /></RBtn>
                          <RBtn onClick={() => decide(d.id, "Refusée")} variant="danger"><XCircle size={12} /></RBtn>
                        </div>
                      )}
                    </div>
                  </div>
                </RRow>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>Aucune dépense</div>
            )}
          </div>
        </RSection>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="w-full max-w-md rounded-[24px] border p-6"
              style={{ background: "rgba(10,16,30,0.97)", borderColor: "rgba(255,122,0,0.3)" }}
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>Créer une demande de dépense</h3>
              <div className="space-y-3">
                {[
                  { label: "Libellé", key: "label", type: "text", placeholder: "Ex: Achat équipement" },
                  { label: "Montant (DT)", key: "amount", type: "number", placeholder: "0" },
                  { label: "Note", key: "note", type: "text", placeholder: "Optionnel" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs mb-1 block" style={{ color: "var(--text-muted)" }}>{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder}
                      value={form[f.key as keyof typeof form]}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                      style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-primary)" }} />
                  </div>
                ))}
                <div>
                  <label className="text-xs mb-1 block" style={{ color: "var(--text-muted)" }}>Catégorie</label>
                  <select value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                    style={{ background: "rgba(30,35,50,0.97)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-primary)" }}>
                    {BUDGETS.map(b => <option key={b.id} value={b.category}>{b.category}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <RBtn onClick={submitDepense}><CheckCircle2 size={14} /> Créer</RBtn>
                <RBtn onClick={() => setShowModal(false)} variant="ghost">Annuler</RBtn>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </RPage>
  );
}
