import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, AlertTriangle, CheckCircle2, Brain, TrendingUp } from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar,
} from "recharts";
import { CoachPageTransition, CCard, Gauge, COACH_ACCENT, TOOLTIP_STYLE } from "../../components/coach2/CoachPageTransition";
import { SQUAD } from "../../data/coachData";

const TABS = ["Performance", "Médical", "Historique", "IA Coach"] as const;
type Tab = typeof TABS[number];

const PERF_HISTORY = [
  { match: "CSS", rating: 7.5, goals: 1, assists: 0 },
  { match: "CAB", rating: 8.8, goals: 3, assists: 1 },
  { match: "ST",  rating: 8.5, goals: 2, assists: 0 },
  { match: "EST", rating: 8.6, goals: 2, assists: 1 },
  { match: "CA",  rating: 7.9, goals: 1, assists: 2 },
  { match: "JSK", rating: 8.2, goals: 1, assists: 0 },
];

const LOAD_HISTORY = [
  { week: "S1", load: 72, fatigue: 28 },
  { week: "S2", load: 85, fatigue: 42 },
  { week: "S3", load: 68, fatigue: 35 },
  { week: "S4", load: 90, fatigue: 55 },
  { week: "S5", load: 78, fatigue: 48 },
  { week: "S6", load: 82, fatigue: 38 },
];

function fatigueColor(v: number) { return v < 30 ? "#22C55E" : v < 60 ? "#FF7A00" : "#EF4444"; }

export function CoachPlayerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const player = SQUAD.find(p => p.id === id) ?? SQUAD[0];
  const [tab, setTab] = useState<Tab>("Performance");

  const radarData = [
    { subject: "Vitesse",   A: player.speed     },
    { subject: "Endurance", A: player.endurance  },
    { subject: "Passes",    A: player.passes     },
    { subject: "Tirs",      A: player.shots      },
    { subject: "Défense",   A: player.defense    },
    { subject: "Mental",    A: player.mental     },
  ];

  const riskScore = Math.round(player.fatigue * 0.5 + (player.status === "Blessé" ? 40 : 0));
  const riskColor = riskScore < 25 ? "#22C55E" : riskScore < 55 ? "#FF7A00" : "#EF4444";

  const aiRecs: { icon: string; text: string; type: "good" | "warn" | "info" }[] = [];
  if (player.fatigue > 50) aiRecs.push({ icon: "⚡", text: `Fatigue ${player.fatigue}% — recommander repos demain`, type: "warn" });
  if (player.forme >= 85) aiRecs.push({ icon: "🔥", text: `Forme excellente (${player.forme}/100) — titulaire prioritaire`, type: "good" });
  if (player.status === "Surveillance") aiRecs.push({ icon: "👁️", text: "Surveillance médicale requise avant prochain match", type: "warn" });
  if (player.contractEnd <= "2026-12") aiRecs.push({ icon: "📋", text: `Contrat expire ${player.contractEnd} — anticiper renouvellement`, type: "info" });
  if (player.mental >= 85) aiRecs.push({ icon: "🧠", text: `Mental fort (${player.mental}/100) — idéal pour matchs sous pression`, type: "good" });
  if (aiRecs.length === 0) aiRecs.push({ icon: "✅", text: "Joueur en très bon état — aucune alerte IA", type: "good" });

  return (
    <CoachPageTransition>
      {/* Back */}
      <div className="flex items-center gap-3">
        <motion.button type="button" onClick={() => navigate(-1)}
          className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold"
          style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-muted)", background: "rgba(255,255,255,0.03)" }}
          whileHover={{ borderColor: `${COACH_ACCENT}50`, color: COACH_ACCENT }} whileTap={{ scale: 0.96 }}>
          <ArrowLeft size={13} /> Retour effectif
        </motion.button>
      </div>

      {/* Hero */}
      <CCard glow>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <motion.div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-2xl font-extrabold text-white"
            style={{ background: `linear-gradient(135deg,${COACH_ACCENT},#E66000)` }}
            animate={{ boxShadow: [`0 0 0px ${COACH_ACCENT}00`, `0 0 30px ${COACH_ACCENT}60`, `0 0 0px ${COACH_ACCENT}00`] }}
            transition={{ duration: 2.5, repeat: Infinity }}>
            {player.number}
          </motion.div>
          <div className="flex-1">
            <h2 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>{player.name}</h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{player.positionFull} · {player.age} ans · {player.flag} {player.nationality}</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Contrat jusqu'à {player.contractEnd} · #{player.number}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${player.status === "Disponible" ? "text-green-400" : player.status === "Blessé" ? "text-red-400" : "text-yellow-400"}`}
                style={{ background: player.status === "Disponible" ? "rgba(34,197,94,0.14)" : player.status === "Blessé" ? "rgba(239,68,68,0.14)" : "rgba(245,158,11,0.14)" }}>
                {player.status}
              </span>
              <span className="rounded-full px-3 py-0.5 text-xs font-bold" style={{ background: `${COACH_ACCENT}18`, color: COACH_ACCENT }}>
                ODIN Score: {player.odinScore}/100
              </span>
            </div>
          </div>
          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-3">
            {[
              { label: "Buts", value: player.goals, color: "#22C55E" },
              { label: "Passes D.", value: player.assists, color: "#3B82F6" },
              { label: "Matchs", value: player.matches, color: COACH_ACCENT },
            ].map(m => (
              <div key={m.label} className="rounded-xl border p-2 text-center"
                style={{ background: "rgba(255,255,255,0.03)", borderColor: "var(--surface-panel-border)" }}>
                <p className="text-xl font-extrabold" style={{ color: m.color }}>{m.value}</p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </CCard>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t, i) => (
          <motion.button key={t} type="button" onClick={() => setTab(t)}
            className="rounded-xl px-4 py-2 text-xs font-semibold"
            style={{
              background: tab === t ? `linear-gradient(135deg,${COACH_ACCENT},#E66000)` : "rgba(255,255,255,0.04)",
              color: tab === t ? "white" : "var(--text-muted)",
              boxShadow: tab === t ? `0 0 14px ${COACH_ACCENT}40` : "none",
            }}
            initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
            {t}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

          {/* Performance */}
          {tab === "Performance" && (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <CCard>
                <p className="mb-2 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Profil FIFA</p>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.07)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                      <Radar dataKey="A" stroke={COACH_ACCENT} fill={COACH_ACCENT} fillOpacity={0.22} strokeWidth={2} />
                      <Tooltip {...TOOLTIP_STYLE} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CCard>
              <CCard>
                <p className="mb-2 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Derniers matchs — Note</p>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={PERF_HISTORY} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="match" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[5,10]} tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Bar dataKey="rating" radius={[6,6,0,0]} fill={COACH_ACCENT} fillOpacity={0.85} name="Note" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CCard>
              <CCard className="xl:col-span-2">
                <p className="mb-2 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Charge & Fatigue (6 semaines)</p>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={LOAD_HISTORY}>
                      <defs>
                        <linearGradient id="loadG" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={COACH_ACCENT} stopOpacity={0.4} /><stop offset="100%" stopColor={COACH_ACCENT} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="fatG" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#EF4444" stopOpacity={0.3} /><stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="week" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Area type="monotone" dataKey="load" stroke={COACH_ACCENT} fill="url(#loadG)" strokeWidth={2} name="Charge" />
                      <Area type="monotone" dataKey="fatigue" stroke="#EF4444" fill="url(#fatG)" strokeWidth={2} name="Fatigue" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CCard>
            </div>
          )}

          {/* Médical */}
          {tab === "Médical" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <CCard>
                <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Statut médical</p>
                <div className="flex items-center gap-4 mb-4">
                  <motion.div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 text-xl font-extrabold"
                    style={{ borderColor: riskColor, color: "var(--text-primary)" }}
                    animate={{ boxShadow: [`0 0 0px ${riskColor}00`, `0 0 20px ${riskColor}55`, `0 0 0px ${riskColor}00`] }}
                    transition={{ duration: 2, repeat: Infinity }}>
                    {riskScore}%
                  </motion.div>
                  <div>
                    <p className="font-bold" style={{ color: riskColor }}>
                      {riskScore < 25 ? "Risque faible" : riskScore < 55 ? "Risque modéré" : "Risque élevé"}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Score risque blessure IA</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {[
                    { label: "Fatigue",      value: player.fatigue, color: fatigueColor(player.fatigue) },
                    { label: "Disponibilité",value: 100 - player.fatigue, color: "#22C55E" },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span style={{ color: "var(--text-muted)" }}>{label}</span>
                        <span className="font-bold" style={{ color }}>{value}%</span>
                      </div>
                      <Gauge value={value} color={color} />
                    </div>
                  ))}
                </div>
                {player.status === "Blessé" && (
                  <div className="mt-3 rounded-xl border p-3" style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.3)" }}>
                    <p className="text-xs font-bold" style={{ color: "#EF4444" }}>🩺 Blessure actuelle</p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{player.injury}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#EF4444" }}>Retour prévu: {player.returnDate}</p>
                  </div>
                )}
              </CCard>
              <CCard>
                <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Historique médical</p>
                {player.status === "Blessé" ? (
                  <div className="flex items-start gap-2 rounded-xl border p-3"
                    style={{ background: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.2)" }}>
                    <AlertTriangle size={14} style={{ color: "#EF4444" }} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{player.injury}</p>
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Retour: {player.returnDate}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <CheckCircle2 size={28} style={{ color: "#22C55E" }} className="mb-2 opacity-70" />
                    <p className="text-sm font-medium" style={{ color: "#22C55E" }}>Aucune blessure active</p>
                  </div>
                )}
              </CCard>
            </div>
          )}

          {/* Historique */}
          {tab === "Historique" && (
            <CCard>
              <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Derniers matchs</p>
              <div className="space-y-2">
                {player.recentMatches.map((m, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                    className="flex items-center gap-3 rounded-xl border px-4 py-3"
                    style={{ background: "rgba(255,255,255,0.02)", borderColor: "var(--surface-panel-border)" }}>
                    <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>{m.date}</span>
                    <span className="flex-1 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>vs {m.vs}</span>
                    <div className="flex items-center gap-3">
                      {m.goals > 0 && <span className="text-xs" style={{ color: "#22C55E" }}>⚽ {m.goals}</span>}
                      {m.assists > 0 && <span className="text-xs" style={{ color: "#3B82F6" }}>🎯 {m.assists}</span>}
                      <span className="text-lg font-extrabold" style={{ color: m.rating >= 8 ? "#22C55E" : m.rating >= 7 ? COACH_ACCENT : "#EF4444" }}>
                        {m.rating}
                      </span>
                      <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>/10</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  { label: "Buts saison",      value: player.goals },
                  { label: "Passes D.",         value: player.assists },
                  { label: "Matchs joués",      value: player.matches },
                ].map(m => (
                  <div key={m.label} className="rounded-xl border p-3 text-center"
                    style={{ background: "rgba(255,255,255,0.03)", borderColor: "var(--surface-panel-border)" }}>
                    <p className="text-xl font-extrabold" style={{ color: COACH_ACCENT }}>{m.value}</p>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{m.label}</p>
                  </div>
                ))}
              </div>
            </CCard>
          )}

          {/* IA Coach */}
          {tab === "IA Coach" && (
            <div className="space-y-3">
              <CCard glow>
                <div className="flex items-center gap-3 mb-4">
                  <motion.div className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: `linear-gradient(135deg,${COACH_ACCENT},#E66000)`, boxShadow: `0 0 20px ${COACH_ACCENT}50` }}
                    animate={{ scale: [1,1.08,1] }} transition={{ duration: 2, repeat: Infinity }}>
                    <Brain size={18} className="text-white" />
                  </motion.div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Analyse IA — {player.name}</p>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Recommandations personnalisées</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {aiRecs.map((rec, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-3 rounded-xl border p-3"
                      style={{
                        background: rec.type === "good" ? "rgba(34,197,94,0.08)" : rec.type === "warn" ? "rgba(245,158,11,0.08)" : "rgba(59,130,246,0.08)",
                        borderColor: rec.type === "good" ? "rgba(34,197,94,0.25)" : rec.type === "warn" ? "rgba(245,158,11,0.25)" : "rgba(59,130,246,0.25)",
                      }}>
                      <span className="text-base shrink-0">{rec.icon}</span>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{rec.text}</p>
                    </motion.div>
                  ))}
                </div>
              </CCard>
              <CCard>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={14} style={{ color: COACH_ACCENT }} />
                  <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Indicateurs clés IA</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Risque blessure",  value: `${riskScore}%`, color: riskColor },
                    { label: "Fatigue actuelle",  value: `${player.fatigue}%`, color: fatigueColor(player.fatigue) },
                    { label: "Forme",             value: `${player.forme > 0 ? player.forme : "N/A"}/100`, color: player.forme > 0 ? "#22C55E" : "#6B7280" },
                    { label: "ODIN Score",        value: `${player.odinScore}/100`, color: COACH_ACCENT },
                  ].map(m => (
                    <div key={m.label} className="rounded-xl border p-3"
                      style={{ background: `${m.color}08`, borderColor: `${m.color}20` }}>
                      <p className="text-lg font-extrabold" style={{ color: m.color }}>{m.value}</p>
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{m.label}</p>
                    </div>
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
