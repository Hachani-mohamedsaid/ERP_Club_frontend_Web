import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle2, Clock, Activity, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { CoachPageTransition, CCard, Gauge, COACH_ACCENT, TOOLTIP_STYLE } from "../../components/coach2/CoachPageTransition";
import { SQUAD } from "../../data/coachData";

type MedFilter = "Tous" | "Blessé" | "Surveillance" | "Suspendu" | "Disponible";

const RETURN_TIMELINE = [
  { name: "Ahmed Ben Ali",    days: 14, injury: "Ischio-jambier Grade II",  color: "#EF4444" },
  { name: "Mehdi Trabelsi",   days: 4,  injury: "Surveillance genou",        color: "#F59E0B" },
  { name: "Hamza Selmi",      days: 2,  injury: "Surveillance fatigue",      color: "#F59E0B" },
  { name: "Ali Saidane",      days: 3,  injury: "Suspension disciplinaire",  color: "#8B5CF6" },
];

export function CoachMedicalPage() {
  const [filter, setFilter] = useState<MedFilter>("Tous");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = SQUAD.filter(p => filter === "Tous" || p.status === filter);
  const injured  = SQUAD.filter(p => p.status === "Blessé").length;
  const sурveill = SQUAD.filter(p => p.status === "Surveillance").length;
  const suspended= SQUAD.filter(p => p.status === "Suspendu").length;
  const avail    = SQUAD.filter(p => p.status === "Disponible").length;

  const fatigueCols = [...SQUAD]
    .sort((a, b) => b.fatigue - a.fatigue)
    .slice(0, 10)
    .map(p => ({ name: p.name.split(" ")[0], fatigue: p.fatigue }));

  const sel = selected ? SQUAD.find(p => p.id === selected) : null;

  return (
    <CoachPageTransition>
      <div>
        <h1 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>Centre Médical</h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Suivi santé & disponibilité de l'effectif</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Blessés",     value: injured,   color: "#EF4444", icon: AlertTriangle },
          { label: "Surveillance",value: sурveill,  color: "#F59E0B", icon: Activity      },
          { label: "Suspendus",   value: suspended,  color: "#8B5CF6", icon: Clock         },
          { label: "Disponibles", value: avail,     color: "#22C55E", icon: CheckCircle2  },
        ].map(({ label, value, color, icon: Icon }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <CCard>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: `${color}15` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div>
                  <p className="text-2xl font-extrabold" style={{ color }}>{value}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
                </div>
              </div>
            </CCard>
          </motion.div>
        ))}
      </div>

      {/* Return timeline */}
      <CCard>
        <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
          <Calendar className="inline mr-1.5" size={14} style={{ color: COACH_ACCENT }} />
          Calendrier de retour
        </p>
        <div className="space-y-2">
          {RETURN_TIMELINE.map((r, i) => (
            <motion.div key={r.name} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 rounded-xl border px-4 py-3"
              style={{ background: `${r.color}08`, borderColor: `${r.color}25` }}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-extrabold text-sm"
                style={{ background: `${r.color}20`, color: r.color }}>
                J+{r.days}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{r.name}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{r.injury}</p>
              </div>
              <div>
                <div className="h-2 w-24 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <motion.div className="h-2 rounded-full" style={{ background: r.color }}
                    initial={{ width: 0 }} animate={{ width: `${Math.max(5, 100 - r.days * 5)}%` }} transition={{ duration: 0.8 }} />
                </div>
                <p className="text-[10px] mt-0.5 text-right" style={{ color: "var(--text-muted)" }}>
                  {r.days === 0 ? "Disponible maintenant" : `dans ${r.days} jour${r.days > 1 ? "s" : ""}`}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </CCard>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_380px]">
        {/* Player list */}
        <CCard>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Détail joueurs ({filtered.length})</p>
            <div className="flex flex-wrap gap-1.5">
              {(["Tous","Blessé","Surveillance","Suspendu","Disponible"] as const).map(f => (
                <motion.button key={f} type="button" onClick={() => setFilter(f)}
                  className="rounded-full px-3 py-1 text-[10px] font-semibold"
                  style={{
                    background: filter === f ? `${f === "Blessé" ? "#EF4444" : f === "Surveillance" ? "#F59E0B" : f === "Suspendu" ? "#8B5CF6" : f === "Disponible" ? "#22C55E" : COACH_ACCENT}22` : "rgba(255,255,255,0.04)",
                    color: filter === f ? (f === "Blessé" ? "#EF4444" : f === "Surveillance" ? "#F59E0B" : f === "Suspendu" ? "#8B5CF6" : f === "Disponible" ? "#22C55E" : COACH_ACCENT) : "var(--text-muted)",
                  }}
                  whileHover={{ scale: 1.05 }}>
                  {f}
                </motion.button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filtered.map((p, i) => {
                const c = p.status === "Blessé" ? "#EF4444" : p.status === "Surveillance" ? "#F59E0B" : p.status === "Suspendu" ? "#8B5CF6" : "#22C55E";
                return (
                  <motion.div key={p.id} layout
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.03 }}
                    onClick={() => setSelected(p.id === selected ? null : p.id)}
                    className="flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer"
                    style={{
                      background: selected === p.id ? `${c}08` : "rgba(255,255,255,0.02)",
                      borderColor: selected === p.id ? `${c}30` : "rgba(255,255,255,0.06)",
                    }}>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold"
                      style={{ background: `${c}18`, color: c }}>{p.number}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{p.positionFull}</p>
                    </div>
                    <span className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                      style={{ background: `${c}18`, color: c }}>{p.status}</span>
                    <div className="text-right">
                      <p className="text-[10px] font-bold" style={{ color: p.fatigue > 50 ? "#EF4444" : "#22C55E" }}>{p.fatigue}% fatigue</p>
                      {p.injury && <p className="text-[9px]" style={{ color: "#EF4444" }}>🩺 {p.injury}</p>}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </CCard>

        {/* Fatigue chart + detail */}
        <div className="space-y-3">
          <AnimatePresence mode="wait">
            {sel && (
              <motion.div key={sel.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <CCard>
                  <p className="font-bold mb-2" style={{ color: "var(--text-primary)" }}>{sel.name}</p>
                  <div className="space-y-2">
                    {[
                      { label: "Fatigue",       value: sel.fatigue,       color: sel.fatigue > 50 ? "#EF4444" : "#22C55E" },
                      { label: "Disponibilité", value: 100 - sel.fatigue, color: "#22C55E" },
                    ].map(m => (
                      <div key={m.label}>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span style={{ color: "var(--text-muted)" }}>{m.label}</span>
                          <span className="font-bold" style={{ color: m.color }}>{m.value}%</span>
                        </div>
                        <Gauge value={m.value} color={m.color} />
                      </div>
                    ))}
                  </div>
                  {sel.injury && (
                    <div className="mt-3 rounded-xl border p-2.5" style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.25)" }}>
                      <p className="text-xs font-bold" style={{ color: "#EF4444" }}>🩺 {sel.injury}</p>
                      {sel.returnDate && <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>Retour: {sel.returnDate}</p>}
                    </div>
                  )}
                </CCard>
              </motion.div>
            )}
          </AnimatePresence>
          <CCard>
            <p className="mb-2 text-xs font-bold" style={{ color: "var(--text-primary)" }}>Fatigue équipe (Top 10)</p>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fatigueCols} layout="vertical" barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" domain={[0,100]} tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} width={65} />
                  <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [`${v}%`, "Fatigue"]} />
                  <Bar dataKey="fatigue" radius={[0,6,6,0]} name="Fatigue" fill={COACH_ACCENT} fillOpacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CCard>
        </div>
      </div>
    </CoachPageTransition>
  );
}
