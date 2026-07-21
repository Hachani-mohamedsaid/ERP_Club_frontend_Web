import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, X, Phone, Mail, Users, DollarSign, TrendingUp, Star } from "lucide-react";
import { RecruteurPageTransition } from "../../components/recruteur/RecruteurPageTransition";
import { scoutApi } from "../../lib/api/scout";

interface Agent {
  id: string;
  name: string;
  agency: string;
  country: string;
  flag: string;
  phone: string;
  email: string;
  players: string[];
  commission: number;
  deals: number;
  totalValue: string;
  rating: number;
  status: "Partenaire" | "Négociation" | "Inactif";
  lastContact: string;
}

interface Negotiation {
  player: string;
  date: string;
  status: string;
  amount: string;
}

const STATUS_FROM_SCOUT: Record<string, Agent["status"]> = {
  actif: "Partenaire",
  négociation: "Négociation",
  inactif: "Inactif",
};

function StatusBadge({ status }: { status: Agent["status"] }) {
  const colors: Record<Agent["status"], string> = {
    "Partenaire": "#22C55E", "Négociation": "#F59E0B", "Inactif": "#6B7280",
  };
  const c = colors[status];
  return (
    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
      style={{ background: `${c}18`, color: c, border: `1px solid ${c}33` }}>
      {status}
    </span>
  );
}

function RCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[20px] border p-5 ${className}`}
      style={{ background: "rgba(14,10,35,0.8)", borderColor: "var(--surface-panel-border)" }}>
      {children}
    </div>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={10} className={i <= Math.round(n) ? "fill-yellow-400 text-yellow-400" : "text-gray-600"} />
      ))}
      <span className="ml-1 text-[10px]" style={{ color: "var(--text-muted)" }}>{n}</span>
    </span>
  );
}

export function RecruteurAgentsPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Agent | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await scoutApi.getAgents();
        const mapped: Agent[] = (res.agents ?? []).map((a) => ({
          id: a.id,
          name: a.name,
          agency: a.agency,
          country: a.country,
          flag: a.flag,
          phone: a.phone,
          email: a.email,
          players: (a.players ?? []).map((p) => p.name),
          commission: 8,
          deals: a.deals,
          totalValue: "—",
          rating: a.rating,
          status: STATUS_FROM_SCOUT[a.status] ?? "Partenaire",
          lastContact: a.lastContact,
        }));
        if (!cancelled) setAgents(mapped);
      } catch {
        if (!cancelled) setAgents([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.agency.toLowerCase().includes(search.toLowerCase()) ||
      a.country.toLowerCase().includes(search.toLowerCase()),
  );

  const negotiations: Negotiation[] = [];

  return (
    <RecruteurPageTransition>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>Gestion Agents</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {loading ? "Chargement…" : `${agents.length} agents · ${agents.filter((a) => a.status === "Partenaire").length} partenaires · données club`}
          </p>
        </div>
        <motion.button type="button" onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)", boxShadow: "0 0 16px rgba(139,92,246,0.35)" }}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Plus size={14} /> Ajouter Agent
        </motion.button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Agents partenaires", value: agents.filter(a => a.status === "Partenaire").length, color: "#22C55E" },
          { label: "Joueurs représentés", value: agents.reduce((a, ag) => a + ag.players.length, 0), color: "#8B5CF6" },
          { label: "Deals conclus", value: agents.reduce((a, ag) => a + ag.deals, 0), color: "#3B82F6" },
          { label: "Valeur totale", value: "—", color: "#F59E0B" },
        ].map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <RCard>
              <p className="text-2xl font-extrabold" style={{ color: k.color }}>{k.value}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{k.label}</p>
            </RCard>
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_380px]">
        {/* Agent list */}
        <RCard>
          <div className="mb-4 flex items-center gap-2 rounded-xl border px-3 py-2"
            style={{ background: "rgba(255,255,255,0.03)", borderColor: "var(--surface-panel-border)" }}>
            <Search size={14} style={{ color: "var(--text-muted)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher agent, agence, pays..."
              className="flex-1 bg-transparent text-sm outline-none" style={{ color: "var(--text-primary)" }} />
          </div>
          <div className="space-y-2">
            {filtered.map((ag, i) => (
              <motion.div key={ag.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => setSelected(ag === selected ? null : ag)}
                className="flex cursor-pointer items-center gap-3 rounded-xl border p-3"
                style={{
                  background: selected?.id === ag.id ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.02)",
                  borderColor: selected?.id === ag.id ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.06)",
                }}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black"
                  style={{ background: "rgba(139,92,246,0.18)", color: "#8B5CF6" }}>
                  {ag.flag}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{ag.name}</p>
                    <StatusBadge status={ag.status} />
                  </div>
                  <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{ag.agency} · {ag.country}</p>
                  <Stars n={ag.rating} />
                </div>
                <div className="flex gap-3 text-center shrink-0">
                  <div>
                    <p className="text-sm font-bold" style={{ color: "#8B5CF6" }}>{ag.players.length}</p>
                    <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>Joueurs</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: "#22C55E" }}>{ag.deals}</p>
                    <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>Deals</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: "#F59E0B" }}>{ag.commission}%</p>
                    <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>Commission</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </RCard>

        {/* Detail */}
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div key={selected.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              <RCard>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl text-xl"
                      style={{ background: "rgba(139,92,246,0.18)" }}>{selected.flag}</div>
                    <div>
                      <p className="font-bold" style={{ color: "var(--text-primary)" }}>{selected.name}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{selected.agency}</p>
                      <StatusBadge status={selected.status} />
                    </div>
                  </div>
                  <button type="button" onClick={() => setSelected(null)} className="rounded-lg p-1.5"
                    style={{ background: "rgba(255,255,255,0.06)" }}>
                    <X size={12} style={{ color: "var(--text-muted)" }} />
                  </button>
                </div>
                <div className="space-y-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                  <p className="flex items-center gap-2"><Phone size={11} /> {selected.phone}</p>
                  <p className="flex items-center gap-2"><Mail size={11} /> {selected.email}</p>
                  <p className="flex items-center gap-2"><DollarSign size={11} /> Commission: <strong style={{ color: "#F59E0B" }}>{selected.commission}%</strong></p>
                  <p className="flex items-center gap-2"><TrendingUp size={11} /> Total deals: <strong style={{ color: "#22C55E" }}>{selected.totalValue}</strong></p>
                  <p>Dernier contact: {selected.lastContact}</p>
                </div>
              </RCard>

              <RCard>
                <p className="mb-2 text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                  Joueurs représentés ({selected.players.length})
                </p>
                {selected.players.map((pl, i) => (
                  <div key={pl} className="mb-1.5 flex items-center gap-2 rounded-lg border px-2 py-1.5"
                    style={{ background: "rgba(255,255,255,0.02)", borderColor: "var(--surface-panel-border)" }}>
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                      style={{ background: "rgba(139,92,246,0.2)", color: "#8B5CF6" }}>{i + 1}</div>
                    <span className="text-xs flex-1" style={{ color: "var(--text-muted)" }}>{pl}</span>
                    <Users size={10} style={{ color: "var(--text-muted)" }} />
                  </div>
                ))}
              </RCard>

              <RCard>
                <p className="mb-2 text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                  Historique négociations ({negotiations.length})
                </p>
                {negotiations.length > 0 ? negotiations.map((n, i) => (
                  <div key={i} className="mb-1.5 rounded-xl border px-3 py-2"
                    style={{ background: "rgba(255,255,255,0.02)", borderColor: "var(--surface-panel-border)" }}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{n.player}</span>
                      <span className="text-xs font-bold" style={{ color: "#22C55E" }}>{n.amount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{n.date}</span>
                      <span className="text-[10px] rounded-full px-2 py-0.5"
                        style={{
                          background: n.status === "Conclu" ? "rgba(34,197,94,0.1)" : n.status === "En cours" ? "rgba(139,92,246,0.1)" : "rgba(245,158,11,0.1)",
                          color: n.status === "Conclu" ? "#22C55E" : n.status === "En cours" ? "#8B5CF6" : "#F59E0B",
                        }}>{n.status}</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>Aucune négociation enregistrée</p>
                )}
              </RCard>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <RCard className="flex flex-col items-center justify-center py-16">
                <Users size={32} className="mb-3 opacity-25" style={{ color: "var(--text-muted)" }} />
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Sélectionner un agent</p>
              </RCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
                <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Nouvel Agent</p>
                <button type="button" onClick={() => setShowModal(false)} className="rounded-lg p-1.5"
                  style={{ background: "rgba(255,255,255,0.06)" }}>
                  <X size={14} style={{ color: "var(--text-muted)" }} />
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Nom complet",  placeholder: "Ex: Mourad Belhaj" },
                  { label: "Agence",       placeholder: "Ex: Sport Elite TN" },
                  { label: "Pays",         placeholder: "Ex: Tunisie" },
                  { label: "Téléphone",    placeholder: "+216 ..." },
                  { label: "Email",        placeholder: "agent@agence.com" },
                  { label: "Commission %", placeholder: "Ex: 8" },
                ].map(({ label, placeholder }) => (
                  <div key={label}>
                    <label className="block text-[11px] font-medium mb-1" style={{ color: "var(--text-muted)" }}>{label}</label>
                    <input placeholder={placeholder} className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                      style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }} />
                  </div>
                ))}
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="rounded-xl border px-4 py-2 text-xs" style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-muted)" }}>
                  Annuler
                </button>
                <motion.button type="button" onClick={() => setShowModal(false)}
                  className="rounded-xl px-5 py-2 text-xs font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)" }}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  Enregistrer
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </RecruteurPageTransition>
  );
}
