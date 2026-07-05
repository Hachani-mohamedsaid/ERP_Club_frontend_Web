import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Zap, Target, TrendingUp } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";
import { CoachPageTransition, CCard, COACH_ACCENT, TOOLTIP_STYLE } from "../../components/coach2/CoachPageTransition";
import { OPPONENTS } from "../../data/coachData";

export function CoachOpponentPage() {
  const [selectedId, setSelectedId] = useState(OPPONENTS[0].id);
  const opp = OPPONENTS.find(o => o.id === selectedId) ?? OPPONENTS[0];

  const radarData = [
    { subject: "Attaque",     A: 78, B: selectedId === "op1" ? 82 : 70 },
    { subject: "Défense",     A: 75, B: selectedId === "op1" ? 68 : 77 },
    { subject: "Physique",    A: 80, B: selectedId === "op1" ? 75 : 80 },
    { subject: "Pressing",    A: 77, B: selectedId === "op1" ? 84 : 70 },
    { subject: "Mental",      A: 85, B: selectedId === "op1" ? 76 : 74 },
    { subject: "Possession",  A: 78, B: selectedId === "op1" ? 66 : 72 },
  ];

  return (
    <CoachPageTransition>
      <div>
        <h1 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>Analyse Adversaire</h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Forces, faiblesses, joueurs clés, note tactique</p>
      </div>

      {/* Opponent selector */}
      <div className="flex flex-wrap gap-3">
        {OPPONENTS.map(o => (
          <motion.button key={o.id} type="button" onClick={() => setSelectedId(o.id)}
            className="flex items-center gap-2 rounded-2xl border px-4 py-3"
            style={{
              background: selectedId === o.id ? `${COACH_ACCENT}12` : "rgba(255,255,255,0.04)",
              borderColor: selectedId === o.id ? `${COACH_ACCENT}40` : "rgba(255,255,255,0.08)",
              boxShadow: selectedId === o.id ? `0 0 16px ${COACH_ACCENT}20` : "none",
            }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <span className="text-xl">{o.flag}</span>
            <div className="text-left">
              <p className="text-sm font-bold" style={{ color: selectedId === o.id ? COACH_ACCENT : "var(--text-primary)" }}>{o.name}</p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Formation: {o.formation}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={opp.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
          {/* Tactical note banner */}
          <CCard glow>
            <div className="flex items-start gap-3">
              <motion.div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
                style={{ background: `${COACH_ACCENT}15` }}
                animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
                {opp.flag}
              </motion.div>
              <div>
                <p className="font-bold text-sm" style={{ color: COACH_ACCENT }}>{opp.name} — Note tactique ODIN AI</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{opp.tacticalNote}</p>
                <p className="text-[10px] mt-1 font-semibold" style={{ color: "var(--text-muted)" }}>Formation habituelle: <strong style={{ color: COACH_ACCENT }}>{opp.formation}</strong></p>
              </div>
            </div>
          </CCard>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {/* Strengths */}
            <CCard>
              <p className="mb-3 text-sm font-bold flex items-center gap-2" style={{ color: "#22C55E" }}>
                <TrendingUp size={14} /> Points forts
              </p>
              <div className="space-y-2">
                {opp.strengths.map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                    className="flex items-center gap-3 rounded-xl border px-3 py-2.5"
                    style={{ background: "rgba(34,197,94,0.05)", borderColor: "rgba(34,197,94,0.2)" }}>
                    <Zap size={12} style={{ color: "#22C55E" }} className="shrink-0" />
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{s}</p>
                  </motion.div>
                ))}
              </div>
            </CCard>

            {/* Weaknesses */}
            <CCard>
              <p className="mb-3 text-sm font-bold flex items-center gap-2" style={{ color: "#EF4444" }}>
                <Target size={14} /> Points faibles — À exploiter
              </p>
              <div className="space-y-2">
                {opp.weaknesses.map((w, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                    className="flex items-center gap-3 rounded-xl border px-3 py-2.5"
                    style={{ background: "rgba(239,68,68,0.05)", borderColor: "rgba(239,68,68,0.2)" }}>
                    <Shield size={12} style={{ color: "#EF4444" }} className="shrink-0" />
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{w}</p>
                  </motion.div>
                ))}
              </div>
            </CCard>
          </div>

          {/* Key players */}
          <CCard>
            <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Joueurs clés à surveiller</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {opp.keyPlayers.map((kp, i) => {
                const c = kp.danger === "Très élevé" ? "#EF4444" : kp.danger === "Élevé" ? "#F59E0B" : "#22C55E";
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3 rounded-xl border px-4 py-3"
                    style={{ background: `${c}06`, borderColor: `${c}25` }}>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-sm"
                      style={{ background: `${c}18`, color: c }}>
                      {kp.position}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{kp.name}</p>
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{kp.position}</p>
                    </div>
                    <span className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                      style={{ background: `${c}18`, color: c }}>
                      Danger {kp.danger}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </CCard>

          {/* Radar + recent results */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <CCard>
              <p className="mb-2 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                FC Carthage <span style={{ color: "var(--text-muted)" }}>vs</span> {opp.name}
              </p>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.07)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 9 }} />
                    <Radar name="FC Carthage" dataKey="A" stroke={COACH_ACCENT} fill={COACH_ACCENT} fillOpacity={0.2} strokeWidth={2} />
                    <Radar name={opp.name} dataKey="B" stroke="#6B7280" fill="#6B7280" fillOpacity={0.1} strokeWidth={1.5} />
                    <Tooltip {...TOOLTIP_STYLE} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 text-[10px]">
                <span className="flex items-center gap-1"><span className="h-2 w-4 rounded-full inline-block" style={{ background: COACH_ACCENT }} /> FC Carthage</span>
                <span className="flex items-center gap-1"><span className="h-2 w-4 rounded-full inline-block bg-gray-500" /> {opp.name}</span>
              </div>
            </CCard>

            <CCard>
              <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Résultats récents {opp.name}</p>
              <div className="space-y-2">
                {opp.recentResults.map((r, i) => {
                  const isWin = r.includes(opp.name.split(" ")[0]) && r.split("-")[0].match(/\d+/) && r.split("-")[1].match(/\d+/) &&
                    parseInt(r.split("-")[0].split(" ").slice(-1)[0]) > parseInt(r.split("-")[1].split(" ")[0]);
                  return (
                    <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                      className="flex items-center gap-3 rounded-xl border px-4 py-3"
                      style={{ background: "rgba(255,255,255,0.02)", borderColor: "var(--surface-panel-border)" }}>
                      <span className="text-lg">{i === 0 ? "🏟️" : i === 1 ? "⚽" : "📊"}</span>
                      <p className="flex-1 text-sm font-bold" style={{ color: "var(--text-primary)" }}>{r}</p>
                    </motion.div>
                  );
                })}
              </div>
              {/* Tactical recommendations */}
              <div className="mt-4 rounded-xl border p-3"
                style={{ background: `${COACH_ACCENT}06`, borderColor: `${COACH_ACCENT}25` }}>
                <p className="text-xs font-bold mb-1" style={{ color: COACH_ACCENT }}>💡 Recommandation IA</p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                  {selectedId === "op1"
                    ? "Utilisez des transitions rapides sur les flancs. Le pressing adversaire crée des espaces en zone 3. Ahmed et Amine peuvent exploiter les couloirs dès la récupération."
                    : "Exploitez les latéraux défensifs adverses par des débordements. Créez la supériorité numérique sur les ailes et centralisez vers Rami Zouaoui."
                  }
                </p>
              </div>
            </CCard>
          </div>
        </motion.div>
      </AnimatePresence>
    </CoachPageTransition>
  );
}
