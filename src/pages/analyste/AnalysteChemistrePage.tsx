import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { Link2, Link, Users, TrendingUp, ArrowRight } from "lucide-react";
import { AnalystePageTransition } from "../../components/analyste/AnalystePageTransition";

const TOOLTIP_STYLE = {
  contentStyle: { background: "rgba(5,8,22,0.96)", border: "1px solid rgba(139,92,246,0.3)", color: "white", borderRadius: 12 },
};

const PLAYERS = [
  "Ahmed", "Ali", "Youssef", "Mohamed", "Karim", "Sami", "Ridha", "Haddad",
];

interface ChemistryLink {
  a: string; b: string; score: number;
  passing: number; movement: number; pressing: number; history: number;
}

const CHEMISTRY_MATRIX: ChemistryLink[] = [
  { a: "Ahmed",   b: "Ali",     score: 92, passing: 95, movement: 91, pressing: 88, history: 94 },
  { a: "Ahmed",   b: "Karim",   score: 45, passing: 42, movement: 48, pressing: 46, history: 44 },
  { a: "Ahmed",   b: "Mohamed", score: 85, passing: 87, movement: 84, pressing: 82, history: 87 },
  { a: "Ali",     b: "Youssef", score: 78, passing: 80, movement: 76, pressing: 77, history: 79 },
  { a: "Ali",     b: "Sami",    score: 82, passing: 83, movement: 80, pressing: 84, history: 81 },
  { a: "Karim",   b: "Ridha",   score: 88, passing: 86, movement: 89, pressing: 90, history: 87 },
  { a: "Karim",   b: "Sami",    score: 75, passing: 74, movement: 77, pressing: 73, history: 76 },
  { a: "Youssef", b: "Mohamed", score: 68, passing: 70, movement: 65, pressing: 68, history: 69 },
  { a: "Ridha",   b: "Haddad",  score: 91, passing: 88, movement: 90, pressing: 93, history: 93 },
  { a: "Mohamed", b: "Ali",     score: 79, passing: 80, movement: 78, pressing: 79, history: 79 },
  { a: "Sami",    b: "Ridha",   score: 84, passing: 82, movement: 85, pressing: 86, history: 83 },
  { a: "Ahmed",   b: "Haddad",  score: 62, passing: 60, movement: 64, pressing: 63, history: 61 },
];

function chemScore(a: string, b: string) {
  return CHEMISTRY_MATRIX.find(m => (m.a === a && m.b === b) || (m.a === b && m.b === a));
}

function chemColor(score: number) {
  if (score >= 85) return "#22C55E";
  if (score >= 70) return "#F59E0B";
  if (score >= 55) return "#FF7A00";
  return "#EF4444";
}

const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  Ahmed:   { x: 50,  y: 15  },
  Ali:     { x: 80,  y: 30  },
  Youssef: { x: 75,  y: 60  },
  Mohamed: { x: 50,  y: 80  },
  Karim:   { x: 20,  y: 60  },
  Sami:    { x: 15,  y: 30  },
  Ridha:   { x: 10,  y: 50  },
  Haddad:  { x: 50,  y: 50  },
};

const ACard = ({ children, className = "", glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) => (
  <motion.div className={`rounded-[20px] border p-5 ${className}`}
    style={{
      background: "rgba(5,8,22,0.7)",
      borderColor: glow ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.06)",
      boxShadow: glow ? "0 0 30px rgba(139,92,246,0.1)" : "0 8px 24px rgba(0,0,0,0.2)",
    }}
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
    {children}
  </motion.div>
);

export function AnalysteChemistrePage() {
  const [focusPlayer, setFocusPlayer] = useState<string | null>(null);
  const [selectedLink, setSelectedLink] = useState<ChemistryLink | null>(null);

  const teamAvg = Math.round(CHEMISTRY_MATRIX.reduce((s, m) => s + m.score, 0) / CHEMISTRY_MATRIX.length);
  const bestPair = [...CHEMISTRY_MATRIX].sort((a, b) => b.score - a.score)[0];
  const worstPair = [...CHEMISTRY_MATRIX].sort((a, b) => a.score - b.score)[0];

  const focusLinks = focusPlayer
    ? CHEMISTRY_MATRIX.filter(m => m.a === focusPlayer || m.b === focusPlayer)
    : CHEMISTRY_MATRIX;

  const radarData = selectedLink
    ? [
        { subject: "Passes",    A: selectedLink.passing  },
        { subject: "Mouvement", A: selectedLink.movement },
        { subject: "Pressing",  A: selectedLink.pressing },
        { subject: "Historique",A: selectedLink.history  },
        { subject: "Global",    A: selectedLink.score    },
      ]
    : [];

  return (
    <AnalystePageTransition>
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Chimie moyenne équipe",   value: `${teamAvg}%`,           color: teamAvg >= 80 ? "#22C55E" : "#FF7A00", icon: Users },
          { label: "Meilleure combinaison",   value: `${bestPair.a} ↔ ${bestPair.b}`, color: "#22C55E", icon: Link2 },
          { label: "Score meilleur duo",      value: `${bestPair.score}%`,     color: "#22C55E", icon: TrendingUp },
          { label: "Duo à améliorer",         value: `${worstPair.a} ↔ ${worstPair.b}`, color: "#EF4444", icon: Link },
        ].map(({ label, value, color, icon: Icon }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <div className="rounded-[16px] border p-4" style={{ background: "rgba(5,8,22,0.7)", borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2">
                <motion.div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${color}18`, color }}
                  animate={{ boxShadow: [`0 0 0px ${color}00`, `0 0 10px ${color}40`, `0 0 0px ${color}00`] }}
                  transition={{ duration: 2.2, repeat: Infinity }}>
                  <Icon size={13} />
                </motion.div>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold truncate" style={{ color }}>{value}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.5fr_1fr]">
        {/* Graph + Matrix */}
        <div className="space-y-4">
          {/* Visual graph */}
          <ACard glow>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                <Link2 size={13} className="inline mr-1.5" style={{ color: "#8B5CF6" }} />
                Graphe relationnel
              </p>
              <div className="flex flex-wrap gap-2">
                {PLAYERS.map(p => (
                  <motion.button key={p} type="button" onClick={() => setFocusPlayer(focusPlayer === p ? null : p)}
                    className="rounded-lg px-2 py-1 text-[10px] font-semibold"
                    style={{
                      background: focusPlayer === p ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.04)",
                      color: focusPlayer === p ? "#8B5CF6" : "var(--text-muted)",
                    }}
                    whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}>
                    {p}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="relative h-72 overflow-hidden rounded-xl" style={{ background: "rgba(0,0,0,0.3)" }}>
              {/* Edges (SVG) */}
              <svg className="absolute inset-0 h-full w-full" style={{ zIndex: 0 }}>
                {focusLinks.map((link, i) => {
                  const posA = NODE_POSITIONS[link.a];
                  const posB = NODE_POSITIONS[link.b];
                  if (!posA || !posB) return null;
                  const color = chemColor(link.score);
                  const opacity = link.score >= 80 ? 0.7 : link.score >= 65 ? 0.45 : 0.22;
                  const width = link.score >= 85 ? 3 : link.score >= 70 ? 2 : 1;
                  return (
                    <motion.line key={i}
                      x1={`${posA.x}%`} y1={`${posA.y}%`} x2={`${posB.x}%`} y2={`${posB.y}%`}
                      stroke={color} strokeWidth={width} strokeOpacity={opacity}
                      initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: opacity }}
                      transition={{ duration: 0.8, delay: i * 0.04 }}
                      className="cursor-pointer"
                      onClick={() => setSelectedLink(link)} />
                  );
                })}
              </svg>
              {/* Nodes */}
              {PLAYERS.map(player => {
                const pos = NODE_POSITIONS[player];
                if (!pos) return null;
                const links = CHEMISTRY_MATRIX.filter(m => m.a === player || m.b === player);
                const avg = links.length ? Math.round(links.reduce((s, l) => s + l.score, 0) / links.length) : 0;
                const color = chemColor(avg);
                const isFocused = focusPlayer === player || !focusPlayer;
                return (
                  <motion.button key={player} type="button"
                    className="absolute flex flex-col items-center cursor-pointer"
                    style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%, -50%)", zIndex: 1, opacity: isFocused ? 1 : 0.3 }}
                    onClick={() => setFocusPlayer(focusPlayer === player ? null : player)}
                    whileHover={{ scale: 1.15 }}>
                    <motion.div className="flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs font-black text-white"
                      style={{ background: `${color}22`, borderColor: color, color }}
                      animate={{ boxShadow: [`0 0 0px ${color}00`, `0 0 12px ${color}55`, `0 0 0px ${color}00`] }}
                      transition={{ duration: 2, repeat: Infinity }}>
                      {player.slice(0, 2)}
                    </motion.div>
                    <span className="mt-0.5 rounded px-1 text-[9px] font-bold" style={{ background: "rgba(0,0,0,0.7)", color }}>
                      {avg}%
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </ACard>

          {/* Matrix table */}
          <ACard>
            <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Matrice de chimie</p>
            <div className="space-y-2">
              {[...CHEMISTRY_MATRIX].sort((a, b) => b.score - a.score).slice(0, 8).map((link, i) => {
                const color = chemColor(link.score);
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                    <button type="button" onClick={() => setSelectedLink(link === selectedLink ? null : link)}
                      className="flex w-full items-center gap-3 rounded-xl border p-2.5 text-left"
                      style={{
                        background: selectedLink?.a === link.a && selectedLink?.b === link.b ? `${color}10` : "rgba(255,255,255,0.02)",
                        borderColor: selectedLink?.a === link.a && selectedLink?.b === link.b ? `${color}35` : "rgba(255,255,255,0.06)",
                      }}>
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{link.a}</span>
                        <ArrowRight size={10} style={{ color: "var(--text-muted)" }} />
                        <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{link.b}</span>
                      </div>
                      <div className="flex flex-1 items-center gap-2">
                        <div className="flex-1 h-2 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <motion.div className="h-full rounded-full" style={{ background: color }}
                            initial={{ width: 0 }} animate={{ width: `${link.score}%` }}
                            transition={{ duration: 0.7, delay: 0.3 + i * 0.04 }} />
                        </div>
                        <span className="text-xs font-extrabold w-10 text-right" style={{ color }}>{link.score}%</span>
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </ACard>
        </div>

        {/* Detail panel */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {selectedLink ? (
              <motion.div key={`${selectedLink.a}-${selectedLink.b}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <ACard glow>
                  <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                    {selectedLink.a} ↔ {selectedLink.b}
                  </p>
                  <div className="flex items-center justify-center mb-4">
                    <motion.div className="flex h-20 w-20 items-center justify-center rounded-full border-4 text-2xl font-black"
                      style={{ borderColor: chemColor(selectedLink.score), color: "var(--text-primary)" }}
                      animate={{ boxShadow: [`0 0 0px ${chemColor(selectedLink.score)}00`, `0 0 24px ${chemColor(selectedLink.score)}60`, `0 0 0px ${chemColor(selectedLink.score)}00`] }}
                      transition={{ duration: 2, repeat: Infinity }}>
                      {selectedLink.score}%
                    </motion.div>
                  </div>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.07)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 9 }} />
                        <Radar name="Chimie" dataKey="A" stroke={chemColor(selectedLink.score)} fill={chemColor(selectedLink.score)} fillOpacity={0.2} strokeWidth={2} />
                        <Tooltip {...TOOLTIP_STYLE} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {[
                      { label: "Passes",     value: selectedLink.passing },
                      { label: "Mouvement",  value: selectedLink.movement },
                      { label: "Pressing",   value: selectedLink.pressing },
                      { label: "Historique", value: selectedLink.history },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-xl border p-2 text-center"
                        style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
                        <p className="text-sm font-bold" style={{ color: chemColor(value) }}>{value}%</p>
                        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</p>
                      </div>
                    ))}
                  </div>
                </ACard>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex h-48 items-center justify-center rounded-[20px] border"
                style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(5,8,22,0.5)" }}>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Sélectionner un lien pour le détail</p>
              </motion.div>
            )}
          </AnimatePresence>

          <ACard>
            <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Top duos recommandés</p>
            <div className="space-y-2">
              {[...CHEMISTRY_MATRIX].sort((a, b) => b.score - a.score).slice(0, 4).map((link, i) => {
                const color = chemColor(link.score);
                return (
                  <div key={i} className="flex items-center justify-between rounded-xl border px-3 py-2"
                    style={{ background: `${color}06`, borderColor: `${color}20` }}>
                    <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                      {link.a} ↔ {link.b}
                    </span>
                    <span className="text-sm font-extrabold" style={{ color }}>{link.score}%</span>
                  </div>
                );
              })}
            </div>
          </ACard>
        </div>
      </div>
    </AnalystePageTransition>
  );
}
