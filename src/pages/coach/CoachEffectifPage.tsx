import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, Filter, ChevronRight, AlertTriangle, CheckCircle2, Clock, Shield, Zap } from "lucide-react";
import { CoachPageTransition, CCard, Gauge, COACH_ACCENT } from "../../components/coach2/CoachPageTransition";
import { SQUAD, type CoachPlayer } from "../../data/coachData";

type StatusFilter = "Tous" | CoachPlayer["status"];

const STATUS_META: Record<CoachPlayer["status"], { color: string; bg: string; icon: React.ElementType }> = {
  "Disponible":    { color: "#22C55E", bg: "rgba(34,197,94,0.14)",  icon: CheckCircle2 },
  "Surveillance":  { color: "#F59E0B", bg: "rgba(245,158,11,0.14)", icon: AlertTriangle },
  "Blessé":        { color: "#EF4444", bg: "rgba(239,68,68,0.14)",  icon: Zap },
  "Suspendu":      { color: "#8B5CF6", bg: "rgba(139,92,246,0.14)", icon: Shield },
  "En sélection":  { color: "#3B82F6", bg: "rgba(59,130,246,0.14)", icon: Clock },
};

function formeColor(v: number) { return v >= 85 ? "#22C55E" : v >= 70 ? "#FF7A00" : "#EF4444"; }
function fatigueColor(v: number) { return v < 30 ? "#22C55E" : v < 60 ? "#FF7A00" : "#EF4444"; }

function StatusBadge({ status }: { status: CoachPlayer["status"] }) {
  const m = STATUS_META[status];
  const Icon = m.icon;
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
      style={{ background: m.bg, color: m.color, border: `1px solid ${m.color}30` }}>
      <Icon size={9} />{status}
    </span>
  );
}

const POSITIONS = ["Tous","GK","DC","LB","RB","MDF","MC","MOC","AG","AD","BU"];

export function CoachEffectifPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [posFilter, setPosFilter] = useState("Tous");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Tous");
  const [selected, setSelected] = useState<CoachPlayer | null>(null);

  const filtered = useMemo(() => SQUAD.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (posFilter !== "Tous" && p.position !== posFilter) return false;
    if (statusFilter !== "Tous" && p.status !== statusFilter) return false;
    return true;
  }), [search, posFilter, statusFilter]);

  const kpis = [
    { label: "Effectif total",    value: SQUAD.length,                                           color: COACH_ACCENT },
    { label: "Disponibles",       value: SQUAD.filter(p => p.status === "Disponible").length,    color: "#22C55E" },
    { label: "Blessés",           value: SQUAD.filter(p => p.status === "Blessé").length,        color: "#EF4444" },
    { label: "Suspendus",         value: SQUAD.filter(p => p.status === "Suspendu").length,      color: "#8B5CF6" },
    { label: "Surveillance",      value: SQUAD.filter(p => p.status === "Surveillance").length,  color: "#F59E0B" },
    { label: "Forme moy.",        value: `${Math.round(SQUAD.filter(p => p.forme > 0).reduce((a, p) => a + p.forme, 0) / SQUAD.filter(p => p.forme > 0).length)}/100`, color: "#3B82F6" },
  ];

  return (
    <CoachPageTransition>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>Effectif / Squad</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{SQUAD.length} joueurs · FC Carthage · Saison 2026</p>
        </div>
        <motion.button type="button" onClick={() => navigate("/coach/lineup")}
          className="rounded-xl px-4 py-2 text-sm font-bold text-white"
          style={{ background: `linear-gradient(135deg,${COACH_ACCENT},#E66000)`, boxShadow: `0 0 16px ${COACH_ACCENT}40` }}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          Composer l'équipe →
        </motion.button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <CCard>
              <p className="text-xl font-extrabold leading-none" style={{ color: k.color }}>{k.value}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>{k.label}</p>
            </CCard>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-2 rounded-xl border px-3 py-2"
          style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
          <Search size={13} style={{ color: "var(--text-muted)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher joueur..."
            className="bg-transparent text-sm outline-none w-36" style={{ color: "var(--text-primary)" }} />
        </div>
        <div className="flex items-center gap-1.5 rounded-xl border px-2 py-1.5"
          style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
          <Filter size={11} style={{ color: "var(--text-muted)" }} />
          <select value={posFilter} onChange={e => setPosFilter(e.target.value)}
            className="bg-transparent text-xs outline-none" style={{ color: "var(--text-muted)" }}>
            {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["Tous","Disponible","Blessé","Suspendu","Surveillance"] as const).map(s => (
            <motion.button key={s} type="button" onClick={() => setStatusFilter(s)}
              className="rounded-full px-3 py-1 text-[10px] font-semibold"
              style={{
                background: statusFilter === s ? `${s === "Tous" ? COACH_ACCENT : STATUS_META[s as CoachPlayer["status"]]?.color ?? COACH_ACCENT}22` : "rgba(255,255,255,0.04)",
                color: statusFilter === s ? (s === "Tous" ? COACH_ACCENT : STATUS_META[s as CoachPlayer["status"]]?.color ?? COACH_ACCENT) : "var(--text-muted)",
              }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
              {s}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
        {/* Player list */}
        <CCard className="!p-0 overflow-hidden">
          {/* Table head */}
          <div className="grid grid-cols-[40px_1fr_70px_60px_90px_80px_80px_100px] gap-2 border-b px-4 py-3 text-[10px] font-semibold uppercase"
            style={{ borderColor: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }}>
            <span>#</span><span>Joueur</span><span>Poste</span><span>Âge</span><span>Statut</span><span>Forme</span><span>Fatigue</span><span className="text-right">Contrat</span>
          </div>
          <div>
            <AnimatePresence mode="popLayout">
              {filtered.map((p, i) => (
                <motion.div key={p.id} layout
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.03 }}
                  onClick={() => setSelected(p === selected ? null : p)}
                  className="grid grid-cols-[40px_1fr_70px_60px_90px_80px_80px_100px] gap-2 items-center border-b px-4 py-3 cursor-pointer transition-colors"
                  style={{
                    borderColor: "rgba(255,255,255,0.04)",
                    background: selected?.id === p.id ? `${COACH_ACCENT}08` : "transparent",
                  }}>
                  <span className="text-xs font-mono font-bold" style={{ color: "var(--text-muted)" }}>{p.number}</span>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black"
                      style={{ background: `${COACH_ACCENT}18`, color: COACH_ACCENT }}>
                      {p.name.split(" ").map(n => n[0]).join("").slice(0,2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                      <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>{p.flag} {p.nationality}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center justify-center rounded-md px-1.5 py-0.5 text-[9px] font-bold"
                    style={{ background: `${COACH_ACCENT}15`, color: COACH_ACCENT }}>{p.position}</span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{p.age}</span>
                  <StatusBadge status={p.status} />
                  <div>
                    <p className="text-[10px] font-bold mb-0.5" style={{ color: formeColor(p.forme) }}>{p.forme > 0 ? p.forme : "—"}</p>
                    {p.forme > 0 && <Gauge value={p.forme} color={formeColor(p.forme)} />}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold mb-0.5" style={{ color: fatigueColor(p.fatigue) }}>{p.fatigue}%</p>
                    <Gauge value={p.fatigue} color={fatigueColor(p.fatigue)} />
                  </div>
                  <div className="text-right flex items-center justify-end gap-1">
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{p.contractEnd}</span>
                    <ChevronRight size={11} style={{ color: "var(--text-muted)" }} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {filtered.length === 0 && (
              <div className="py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>Aucun joueur trouvé</div>
            )}
          </div>
        </CCard>

        {/* Detail panel */}
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div key={selected.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              <CCard glow>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <motion.div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-black text-white"
                      style={{ background: `linear-gradient(135deg,${COACH_ACCENT},#E66000)` }}
                      animate={{ boxShadow: [`0 0 0px ${COACH_ACCENT}00`, `0 0 20px ${COACH_ACCENT}60`, `0 0 0px ${COACH_ACCENT}00`] }}
                      transition={{ duration: 2, repeat: Infinity }}>
                      {selected.number}
                    </motion.div>
                    <div>
                      <p className="font-extrabold" style={{ color: "var(--text-primary)" }}>{selected.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{selected.positionFull} · {selected.age} ans</p>
                      <StatusBadge status={selected.status} />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-extrabold" style={{ color: COACH_ACCENT }}>{selected.odinScore}</p>
                    <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>ODIN</p>
                  </div>
                </div>

                {selected.status === "Blessé" && (
                  <div className="rounded-xl border p-2.5 mb-2"
                    style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.25)" }}>
                    <p className="text-xs font-bold" style={{ color: "#EF4444" }}>🩺 {selected.injury}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>Retour prévu: {selected.returnDate}</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 my-3">
                  {[
                    { label: "Buts", value: selected.goals, color: "#22C55E" },
                    { label: "Passes D.", value: selected.assists, color: "#3B82F6" },
                    { label: "Matchs", value: selected.matches, color: COACH_ACCENT },
                  ].map(m => (
                    <div key={m.label} className="rounded-xl border p-2 text-center"
                      style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.06)" }}>
                      <p className="text-lg font-extrabold" style={{ color: m.color }}>{m.value}</p>
                      <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>{m.label}</p>
                    </div>
                  ))}
                </div>

                {/* Attributes */}
                <div className="space-y-2">
                  {[
                    { label: "Vitesse",    value: selected.speed,     color: "#F59E0B" },
                    { label: "Endurance",  value: selected.endurance,  color: "#3B82F6" },
                    { label: "Passes",     value: selected.passes,     color: "#8B5CF6" },
                    { label: "Tirs",       value: selected.shots,      color: "#EF4444" },
                    { label: "Défense",    value: selected.defense,    color: "#22C55E" },
                    { label: "Mental",     value: selected.mental,     color: COACH_ACCENT },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-[10px] mb-0.5">
                        <span style={{ color: "var(--text-muted)" }}>{label}</span>
                        <span className="font-bold" style={{ color }}>{value}</span>
                      </div>
                      <Gauge value={value} color={color} />
                    </div>
                  ))}
                </div>
              </CCard>

              {/* Recent matches */}
              <CCard>
                <p className="mb-2 text-xs font-bold" style={{ color: "var(--text-primary)" }}>Derniers matchs</p>
                {selected.recentMatches.map((m, i) => (
                  <div key={i} className="mb-1.5 flex items-center gap-3 rounded-xl border px-3 py-2"
                    style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{m.date}</span>
                    <span className="flex-1 text-xs font-semibold" style={{ color: "var(--text-primary)" }}>vs {m.vs}</span>
                    <span className="text-xs font-bold" style={{ color: COACH_ACCENT }}>{m.rating}/10</span>
                    {m.goals > 0 && <span className="text-[10px]" style={{ color: "#22C55E" }}>⚽{m.goals}</span>}
                    {m.assists > 0 && <span className="text-[10px]" style={{ color: "#3B82F6" }}>🎯{m.assists}</span>}
                  </div>
                ))}
              </CCard>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <motion.button type="button" onClick={() => navigate(`/coach/player/${selected.id}`)}
                  className="flex-1 rounded-xl py-2 text-xs font-bold text-white"
                  style={{ background: `linear-gradient(135deg,${COACH_ACCENT},#E66000)` }}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  Voir fiche complète
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <CCard className="flex flex-col items-center justify-center py-16">
                <div className="text-4xl mb-3">👤</div>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Sélectionner un joueur</p>
              </CCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </CoachPageTransition>
  );
}
