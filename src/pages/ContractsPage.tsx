import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScrollText, Plus, AlertTriangle, CheckCircle2, Clock, RefreshCw,
  Download, Pencil, XCircle, TrendingUp, DollarSign, Users, Calendar,
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { RPage, RCard, RHeader, RSection, RRow, RPills, RBtn, RKpiCard, RSearch, pageVariants, cardVariants } from "../components/responsable";

/* ── Data ──────────────────────────────────────────────────────── */
type ContractStatus = "Actif" | "Expirant" | "Expiré" | "En négociation";

interface Contract {
  id: string; player: string; position: string; salary: number; bonus: number;
  start: string; end: string; daysLeft: number; status: ContractStatus; note?: string;
}

const CONTRACTS: Contract[] = [
  { id: "c1", player: "Yassine Brahmi",   position: "Attaquant",         salary: 18000, bonus: 2500,  start: "01/07/2024", end: "12/05/2027", daysLeft: 325, status: "Actif" },
  { id: "c2", player: "Karim Sassi",      position: "Milieu offensif",   salary: 14000, bonus: 1800,  start: "01/07/2023", end: "30/06/2028", daysLeft: 374, status: "Actif" },
  { id: "c3", player: "Walid Hammami",    position: "Défenseur central", salary: 16500, bonus: 2000,  start: "01/07/2024", end: "02/03/2025", daysLeft: 22,  status: "Expirant",       note: "Renouvellement prioritaire" },
  { id: "c4", player: "Ahmed Ben Salah",  position: "Gardien",           salary: 12000, bonus: 1200,  start: "15/01/2024", end: "30/06/2025", daysLeft: 9,   status: "Expirant",       note: "Offre envoyée, en attente réponse" },
  { id: "c5", player: "Nader Trabelsi",   position: "Milieu défensif",   salary: 11500, bonus: 900,   start: "01/08/2025", end: "31/07/2027", daysLeft: 405, status: "Actif" },
  { id: "c6", player: "Seif Ben Amara",   position: "Ailier droit",      salary: 13200, bonus: 1600,  start: "01/07/2022", end: "30/06/2024", daysLeft: 0,   status: "Expiré",         note: "Contrat terminé — non renouvelé" },
  { id: "c7", player: "Omar Sassi",       position: "Défenseur latéral", salary: 9800,  bonus: 800,   start: "01/09/2024", end: "31/08/2026", daysLeft: 71,  status: "En négociation", note: "Révision salaire +15%" },
  { id: "c8", player: "Hatem Mejri",      position: "Attaquant",         salary: 20000, bonus: 3000,  start: "01/07/2025", end: "30/06/2028", daysLeft: 738, status: "Actif" },
];

const STATUS_COLOR: Record<ContractStatus, string> = {
  Actif:           "#22C55E",
  Expirant:        "#FF7A00",
  Expiré:          "#EF4444",
  "En négociation":"#8B5CF6",
};
const FILTER_OPTIONS = ["Tous", "Actif", "Expirant", "Expiré", "En négociation"];

const PIE_DATA = FILTER_OPTIONS.slice(1).map(s => ({
  name: s, value: CONTRACTS.filter(c => c.status === s).length
}));
const PIE_COLORS = ["#22C55E", "#FF7A00", "#EF4444", "#8B5CF6"];

const SALARY_CHART = CONTRACTS.slice(0, 6).map(c => ({
  name: c.player.split(" ")[0], salary: c.salary / 1000,
}));

const cardV = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: "easeOut" } } };

function DaysLeftBar({ days }: { days: number }) {
  const max = 800;
  const pct = Math.min(100, (days / max) * 100);
  const color = days === 0 ? "#EF4444" : days < 30 ? "#FF7A00" : days < 90 ? "#F59E0B" : "#22C55E";
  return (
    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
      <motion.div className="h-full rounded-full" style={{ background: color }}
        initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
    </div>
  );
}

export function ContractsPage() {
  const [filter, setFilter] = useState("Tous");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Contract | null>(null);

  const filtered = useMemo(() => {
    return CONTRACTS.filter(c => {
      const matchStatus = filter === "Tous" || c.status === filter;
      const matchSearch = c.player.toLowerCase().includes(search.toLowerCase()) ||
        c.position.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [filter, search]);

  const totalSalary = CONTRACTS.filter(c => c.status === "Actif").reduce((s, c) => s + c.salary + c.bonus, 0);
  const expiringSoon = CONTRACTS.filter(c => c.daysLeft > 0 && c.daysLeft <= 90).length;

  return (
    <RPage>
      <RHeader
        title="Gestion des Contrats"
        subtitle="Contrats joueurs — alertes et renouvellements."
        action={<RBtn><Plus size={14} /> Nouveau contrat</RBtn>}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <RKpiCard label="Total contrats"   value={String(CONTRACTS.length)}   icon={ScrollText}    color="#3B82F6" />
        <RKpiCard label="Actifs"           value={String(CONTRACTS.filter(c => c.status === "Actif").length)} icon={CheckCircle2} color="#22C55E" />
        <RKpiCard label="Expirent < 90j"   value={String(expiringSoon)}        icon={AlertTriangle} color="#FF7A00" trend="Urgent" />
        <RKpiCard label="Masse salariale"  value={`${(totalSalary/1000).toFixed(0)} kDT`} icon={DollarSign} color="#F59E0B" trend="/mois" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <RCard hover={false}>
          <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Répartition par statut</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={PIE_DATA} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={4}>
                  {PIE_DATA.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "rgba(10,16,30,0.95)", border: "1px solid rgba(255,122,0,0.2)", color: "var(--text-primary)", borderRadius: 12 }} />
                <Legend wrapperStyle={{ color: "var(--text-muted)", fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </RCard>

        <RCard hover={false}>
          <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Salaires mensuels (kDT)</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SALARY_CHART} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "rgba(10,16,30,0.95)", border: "1px solid rgba(255,122,0,0.2)", color: "var(--text-primary)", borderRadius: 12 }} formatter={(v: number) => [`${v}k DT`, "Salaire"]} />
                <Bar dataKey="salary" radius={[6, 6, 0, 0]}
                  fill="url(#salGrad)" />
                <defs>
                  <linearGradient id="salGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF7A00" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#FF7A00" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </RCard>
      </div>

      {/* Filter + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <RSearch value={search} onChange={setSearch} placeholder="Rechercher joueur, position..." />
        </div>
        <RPills options={FILTER_OPTIONS} value={filter} onChange={setFilter} />
      </div>

      {/* Main table + detail panel */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
        {/* Contract list */}
        <RSection title="Liste des contrats" subtitle={`${filtered.length} contrat${filtered.length > 1 ? "s" : ""}`}>
          <AnimatePresence mode="wait">
            <motion.div key={filter + search} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {filtered.map((c, i) => {
                const color = STATUS_COLOR[c.status];
                const isSelected = selected?.id === c.id;
                return (
                  <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    onClick={() => setSelected(isSelected ? null : c)} className="cursor-pointer">
                    <motion.div
                      className="rounded-xl border p-4"
                      style={{
                        background: isSelected ? "rgba(255,122,0,0.06)" : "rgba(255,255,255,0.02)",
                        borderColor: isSelected ? "rgba(255,122,0,0.4)" : "rgba(255,255,255,0.06)",
                      }}
                      whileHover={{ borderColor: "rgba(255,122,0,0.3)", background: "rgba(255,122,0,0.04)", x: 3 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <motion.div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-sm text-white"
                            style={{ background: `${color}22`, color }}
                            animate={c.status === "Expirant" ? { boxShadow: [`0 0 0px ${color}00`, `0 0 14px ${color}60`, `0 0 0px ${color}00`] } : {}}
                            transition={{ duration: 1.6, repeat: Infinity }}
                          >
                            {c.player.split(" ").map(n => n[0]).join("")}
                          </motion.div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>{c.player}</p>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{c.position}</p>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-bold" style={{ color: "var(--accent)" }}>{c.salary.toLocaleString()} DT</p>
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                            style={{ background: `${color}18`, color }}>
                            {c.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-[11px]" style={{ color: "var(--text-muted)" }}>
                          <span>{c.start} → {c.end}</span>
                          <span className={c.daysLeft <= 30 ? "font-bold" : ""} style={{ color: c.daysLeft <= 30 ? STATUS_COLOR[c.status] : "var(--text-muted)" }}>
                            {c.daysLeft === 0 ? "Expiré" : `${c.daysLeft}j restants`}
                          </span>
                        </div>
                        <DaysLeftBar days={c.daysLeft} />
                      </div>
                      {c.note && (
                        <p className="mt-2 text-[11px] italic" style={{ color: "var(--text-muted)" }}>{c.note}</p>
                      )}
                    </motion.div>
                  </motion.div>
                );
              })}
              {filtered.length === 0 && (
                <div className="py-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>Aucun contrat trouvé</div>
              )}
            </motion.div>
          </AnimatePresence>
        </RSection>

        {/* Detail panel */}
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div key={selected.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <RSection title="Détail contrat" subtitle={selected.player}
                action={<RBtn onClick={() => setSelected(null)} variant="ghost">Fermer</RBtn>}>
                <div className="space-y-4">
                  {/* Header */}
                  <motion.div className="rounded-2xl p-4" style={{ background: `${STATUS_COLOR[selected.status]}08`, border: `1px solid ${STATUS_COLOR[selected.status]}25` }}
                    initial={{ scale: 0.96 }} animate={{ scale: 1 }}>
                    <div className="flex items-center gap-3">
                      <motion.div className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-black text-white"
                        style={{ background: `${STATUS_COLOR[selected.status]}30`, color: STATUS_COLOR[selected.status] }}
                        animate={{ boxShadow: [`0 0 0px ${STATUS_COLOR[selected.status]}00`, `0 0 20px ${STATUS_COLOR[selected.status]}50`, `0 0 0px ${STATUS_COLOR[selected.status]}00`] }}
                        transition={{ duration: 2, repeat: Infinity }}>
                        {selected.player.split(" ").map(n => n[0]).join("")}
                      </motion.div>
                      <div>
                        <p className="font-bold text-base" style={{ color: "var(--text-primary)" }}>{selected.player}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{selected.position}</p>
                        <span className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{ background: `${STATUS_COLOR[selected.status]}18`, color: STATUS_COLOR[selected.status] }}>
                          {selected.status}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Info rows */}
                  {[
                    { label: "Salaire brut",  value: `${selected.salary.toLocaleString()} DT/mois`, color: "#FF7A00" },
                    { label: "Prime",         value: `${selected.bonus.toLocaleString()} DT/mois`,   color: "#F59E0B" },
                    { label: "Total mensuel", value: `${(selected.salary + selected.bonus).toLocaleString()} DT`, color: "#22C55E" },
                    { label: "Début",         value: selected.start },
                    { label: "Fin",           value: selected.end },
                    { label: "Jours restants",value: selected.daysLeft === 0 ? "Expiré" : `${selected.daysLeft} jours`, color: STATUS_COLOR[selected.status] },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center justify-between rounded-xl border px-4 py-3"
                      style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
                      <span className="text-sm" style={{ color: "var(--text-muted)" }}>{label}</span>
                      <span className="text-sm font-semibold" style={{ color: color ?? "var(--text-primary)" }}>{value}</span>
                    </div>
                  ))}

                  {selected.note && (
                    <div className="rounded-xl border p-3" style={{ background: "rgba(255,122,0,0.06)", borderColor: "rgba(255,122,0,0.2)" }}>
                      <p className="text-xs italic" style={{ color: "var(--accent)" }}>{selected.note}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="grid grid-cols-1 gap-2">
                    <RBtn><RefreshCw size={13} /> Proposer renouvellement</RBtn>
                    <RBtn variant="ghost"><Pencil size={13} /> Modifier conditions</RBtn>
                    <RBtn variant="ghost"><Download size={13} /> Télécharger PDF</RBtn>
                    {selected.status !== "Expiré" && (
                      <RBtn variant="danger"><XCircle size={13} /> Résilier contrat</RBtn>
                    )}
                  </div>
                </div>
              </RSection>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <RSection title="Statistiques" subtitle="Vue globale des contrats" hover={false}>
                <div className="space-y-4">
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={PIE_DATA} dataKey="value" nameKey="name" innerRadius={45} outerRadius={72} paddingAngle={4}>
                          {PIE_DATA.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: "rgba(10,16,30,0.95)", border: "1px solid rgba(255,122,0,0.2)", color: "var(--text-primary)", borderRadius: 12 }} />
                        <Legend wrapperStyle={{ color: "var(--text-muted)", fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {CONTRACTS.filter(c => c.daysLeft > 0 && c.daysLeft <= 90).map(c => (
                      <div key={c.id} className="flex items-center justify-between rounded-xl border px-3 py-2.5 cursor-pointer"
                        style={{ background: "rgba(255,122,0,0.05)", borderColor: "rgba(255,122,0,0.2)" }}
                        onClick={() => setSelected(c)}>
                        <div>
                          <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{c.player}</p>
                          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{c.position}</p>
                        </div>
                        <div className="text-right">
                          <motion.span className="text-xs font-bold" style={{ color: "#FF7A00" }}
                            animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                            {c.daysLeft}j
                          </motion.span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
                    ← Cliquer sur un contrat pour voir les détails
                  </p>
                </div>
              </RSection>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </RPage>
  );
}
