import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flag, Clock, Activity, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { CoachPageTransition, CCard, COACH_ACCENT, TOOLTIP_STYLE } from "../../components/coach2/CoachPageTransition";
import { MATCHES_DATA } from "../../data/coachData";

const TABS = ["Avant match", "Pendant", "Après match"] as const;
type Tab = typeof TABS[number];

const EVENT_META = {
  but:          { emoji: "⚽", color: "#22C55E" },
  carton_jaune: { emoji: "🟨", color: "#F59E0B" },
  carton_rouge: { emoji: "🟥", color: "#EF4444" },
  substitution: { emoji: "🔄", color: "#3B82F6" },
  blessure:     { emoji: "🩺", color: "#8B5CF6" },
};

const STATS_COMPARE = [
  { label: "Tirs",        fcc: 14, adv: 8  },
  { label: "Cadrés",      fcc: 8,  adv: 4  },
  { label: "Possession",  fcc: 56, adv: 44 },
  { label: "Corners",     fcc: 6,  adv: 3  },
  { label: "Fautes",      fcc: 11, adv: 14 },
];

const RADAR_COMP = [
  { subject: "Attaque",   A: 82, B: 71 },
  { subject: "Défense",   A: 75, B: 78 },
  { subject: "Possession",A: 78, B: 62 },
  { subject: "Physique",  A: 80, B: 76 },
  { subject: "Mental",    A: 85, B: 70 },
  { subject: "Pressing",  A: 77, B: 68 },
];

export function CoachMatchAnalysisPage() {
  const [tab, setTab] = useState<Tab>("Après match");
  const match = MATCHES_DATA.find(m => m.phase === "apres")!;
  const upcoming = MATCHES_DATA.find(m => m.phase === "avant")!;

  return (
    <CoachPageTransition>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>Analyse de Match</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Avant · Pendant · Après — Vue complète</p>
        </div>
      </div>

      {/* Match card */}
      <CCard glow>
        <div className="flex items-center justify-between">
          <div className="text-center">
            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>FC Carthage</p>
            <p className="text-[10px]" style={{ color: COACH_ACCENT }}>Domicile</p>
          </div>
          {match.score ? (
            <motion.div className="text-3xl font-extrabold px-6 py-2 rounded-2xl"
              style={{ background: `${COACH_ACCENT}15`, color: COACH_ACCENT }}
              animate={{ scale: [1,1.04,1] }} transition={{ duration: 2.5, repeat: Infinity }}>
              {match.score}
            </motion.div>
          ) : (
            <div className="text-2xl font-extrabold px-6" style={{ color: "var(--text-muted)" }}>vs</div>
          )}
          <div className="text-center">
            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>ES Tunis</p>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Visiteur</p>
          </div>
        </div>
        <p className="text-center text-xs mt-2" style={{ color: "var(--text-muted)" }}>
          {match.score ? `${match.date} · Ligue 1 · J28` : `Prochain: ${upcoming.date}`}
        </p>
      </CCard>

      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map((t, i) => (
          <motion.button key={t} type="button" onClick={() => setTab(t)}
            className="rounded-xl px-4 py-2 text-xs font-semibold"
            style={{
              background: tab === t ? `linear-gradient(135deg,${COACH_ACCENT},#E66000)` : "rgba(255,255,255,0.04)",
              color: tab === t ? "white" : "var(--text-muted)",
              boxShadow: tab === t ? `0 0 14px ${COACH_ACCENT}40` : "none",
            }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
            {t}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

          {/* Avant match */}
          {tab === "Avant match" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <CCard>
                  <p className="mb-3 text-sm font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                    <Flag size={14} style={{ color: COACH_ACCENT }} /> Composition prévue
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>Formation: <strong style={{ color: COACH_ACCENT }}>4-3-3</strong></p>
                  <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>11 titulaires définis · 7 remplaçants</p>
                  <motion.button type="button"
                    className="mt-3 w-full rounded-xl py-2 text-xs font-bold"
                    style={{ background: `${COACH_ACCENT}18`, color: COACH_ACCENT }}
                    whileHover={{ scale: 1.02 }}>
                    Voir composition →
                  </motion.button>
                </CCard>
                <CCard>
                  <p className="mb-3 text-sm font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                    <Activity size={14} style={{ color: "#8B5CF6" }} /> Disponibilité effectif
                  </p>
                  {[
                    { label: "Disponibles",  value: 22, color: "#22C55E" },
                    { label: "Blessés",      value: 1,  color: "#EF4444" },
                    { label: "Suspendus",    value: 1,  color: "#8B5CF6" },
                    { label: "Surveillance", value: 2,  color: "#F59E0B" },
                  ].map(m => (
                    <div key={m.label} className="flex items-center justify-between py-1 text-xs border-b last:border-0"
                      style={{ borderColor: "var(--surface-panel-border)" }}>
                      <span style={{ color: "var(--text-muted)" }}>{m.label}</span>
                      <span className="font-bold" style={{ color: m.color }}>{m.value}</span>
                    </div>
                  ))}
                </CCard>
              </div>
              <CCard>
                <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Instructions coach avant match</p>
                <div className="space-y-2">
                  {[
                    { txt: "Pressing collectif dès la perte — toute l'équipe remonte", icon: "⬆️" },
                    { txt: "Sorties en contre : Ahmed et Amine en pointe rapide", icon: "⚡" },
                    { txt: "Set-pieces défensifs : marquer zone, 2 gardiens du 2e poteau", icon: "🛡️" },
                    { txt: "Rami Zouaoui : liberté dans le couloir gauche", icon: "🎯" },
                  ].map((ins, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-3 rounded-xl border px-3 py-2.5"
                      style={{ background: `${COACH_ACCENT}05`, borderColor: `${COACH_ACCENT}20` }}>
                      <span>{ins.icon}</span>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{ins.txt}</p>
                    </motion.div>
                  ))}
                </div>
              </CCard>
            </div>
          )}

          {/* Pendant */}
          {tab === "Pendant" && (
            <div className="space-y-4">
              <CCard>
                <p className="mb-3 text-sm font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                  <Clock size={14} style={{ color: COACH_ACCENT }} /> Timeline événements
                </p>
                <div className="relative pl-8">
                  <div className="absolute left-3 top-0 bottom-0 w-px" style={{ background: "rgba(255,255,255,0.08)" }} />
                  {match.events.map((ev, i) => {
                    const m = EVENT_META[ev.type];
                    return (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                        className="relative mb-4">
                        <div className="absolute -left-5 flex h-6 w-6 items-center justify-center rounded-full text-xs"
                          style={{ background: m.color, top: 0 }}>
                          {m.emoji}
                        </div>
                        <div className="rounded-xl border px-3 py-2.5"
                          style={{ background: `${m.color}08`, borderColor: `${m.color}25` }}>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-extrabold" style={{ color: m.color }}>{ev.minute}'</span>
                            <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{ev.player}</span>
                          </div>
                          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{ev.description}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CCard>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Possession", value: `${match.possession}%`, color: COACH_ACCENT },
                  { label: "Tirs",       value: match.shots,             color: "#22C55E" },
                  { label: "Cadrés",     value: match.shotsOnTarget,     color: "#3B82F6" },
                  { label: "Corners",    value: match.corners,           color: "#F59E0B" },
                ].map(m => (
                  <CCard key={m.label}>
                    <p className="text-2xl font-extrabold" style={{ color: m.color }}>{m.value}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>{m.label}</p>
                  </CCard>
                ))}
              </div>
            </div>
          )}

          {/* Après match */}
          {tab === "Après match" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <CCard>
                  <p className="mb-3 text-sm font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                    <BarChart3 size={14} style={{ color: COACH_ACCENT }} /> Comparaison statistiques
                  </p>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={STATS_COMPARE} barCategoryGap="25%" barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis dataKey="label" tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} />
                        <Tooltip {...TOOLTIP_STYLE} />
                        <Bar dataKey="fcc" radius={[4,4,0,0]} fill={COACH_ACCENT} fillOpacity={0.85} name="FC Carthage" />
                        <Bar dataKey="adv" radius={[4,4,0,0]} fill="#6B7280" fillOpacity={0.7} name="EST" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CCard>
                <CCard>
                  <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Performance globale équipes</p>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RADAR_COMP}>
                        <PolarGrid stroke="rgba(255,255,255,0.07)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 9 }} />
                        <Radar name="FC Carthage" dataKey="A" stroke={COACH_ACCENT} fill={COACH_ACCENT} fillOpacity={0.2} strokeWidth={2} />
                        <Radar name="EST" dataKey="B" stroke="#6B7280" fill="#6B7280" fillOpacity={0.1} strokeWidth={1.5} />
                        <Tooltip {...TOOLTIP_STYLE} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CCard>
              </div>

              <CCard>
                <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Meilleurs joueurs du match</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {[
                    { name: "Rami Zouaoui",    rating: 8.6, goals: 2, assists: 1, pos: "MOC" },
                    { name: "Yassine Brahmi",  rating: 8.4, goals: 1, assists: 2, pos: "MC"  },
                    { name: "Sami Ben Khalifa",rating: 8.2, goals: 1, assists: 0, pos: "DC"  },
                  ].map((p, i) => (
                    <motion.div key={p.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      className="rounded-xl border p-3 text-center"
                      style={{ background: `${COACH_ACCENT}06`, borderColor: `${COACH_ACCENT}25` }}>
                      <div className="flex items-center justify-center mb-1">
                        {i === 0 && <span className="text-2xl">🏆</span>}
                        {i === 1 && <span className="text-2xl">🥈</span>}
                        {i === 2 && <span className="text-2xl">🥉</span>}
                      </div>
                      <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                      <p className="text-[9px] mb-1" style={{ color: "var(--text-muted)" }}>{p.pos}</p>
                      <p className="text-xl font-extrabold" style={{ color: COACH_ACCENT }}>{p.rating}</p>
                      <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>/10</p>
                      <div className="flex justify-center gap-2 mt-1 text-[9px]">
                        {p.goals > 0 && <span style={{ color: "#22C55E" }}>⚽{p.goals}</span>}
                        {p.assists > 0 && <span style={{ color: "#3B82F6" }}>🎯{p.assists}</span>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CCard>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </CoachPageTransition>
  );
}
