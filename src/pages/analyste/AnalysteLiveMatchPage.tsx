import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from "recharts";
import { Play, Pause, Radio, TrendingUp, AlertTriangle, RefreshCw, Users } from "lucide-react";
import { AnalystePageTransition } from "../../components/analyste/AnalystePageTransition";

const TOOLTIP_STYLE = {
  contentStyle: { background: "rgba(5,8,22,0.96)", border: "1px solid rgba(139,92,246,0.3)", color: "white", borderRadius: 12 },
};

interface MatchEvent { minute: number; type: "goal" | "card" | "sub" | "var"; player: string; team: "home" | "away"; desc: string; }
interface MinuteData  { minute: number; possession: number; fatigue: number; winProb: number; xg: number; }

const INIT_DATA: MinuteData[] = [
  { minute: 0,  possession: 50, fatigue: 10, winProb: 43, xg: 0.0 },
  { minute: 5,  possession: 55, fatigue: 14, winProb: 46, xg: 0.1 },
  { minute: 10, possession: 58, fatigue: 18, winProb: 50, xg: 0.3 },
  { minute: 15, possession: 62, fatigue: 22, winProb: 54, xg: 0.6 },
  { minute: 20, possession: 59, fatigue: 27, winProb: 52, xg: 0.8 },
  { minute: 25, possession: 63, fatigue: 33, winProb: 56, xg: 1.1 },
  { minute: 30, possession: 60, fatigue: 39, winProb: 58, xg: 1.4 },
  { minute: 35, possession: 55, fatigue: 45, winProb: 55, xg: 1.6 },
  { minute: 40, possession: 52, fatigue: 51, winProb: 52, xg: 1.8 },
  { minute: 45, possession: 57, fatigue: 56, winProb: 54, xg: 2.0 },
  { minute: 50, possession: 61, fatigue: 60, winProb: 57, xg: 2.2 },
  { minute: 55, possession: 59, fatigue: 65, winProb: 55, xg: 2.4 },
  { minute: 60, possession: 54, fatigue: 70, winProb: 53, xg: 2.6 },
  { minute: 65, possession: 50, fatigue: 76, winProb: 50, xg: 2.7 },
];

const EVENTS: MatchEvent[] = [
  { minute: 12, type: "goal",  player: "Ali Mansouri",    team: "home", desc: "But — tête sur corner" },
  { minute: 28, type: "card",  player: "Karim Dridi",     team: "home", desc: "Carton jaune — faute tactique" },
  { minute: 45, type: "goal",  player: "---",             team: "away", desc: "Égalisation adverse" },
  { minute: 61, type: "sub",   player: "Ahmed Ben Salah", team: "home", desc: "Remplacement — fatigue élevée (85%)" },
];

const PLAYERS_LIVE = [
  { name: "Ali Mansouri",  fatigue: 55, risk: 18, readiness: 92, shouldSub: false },
  { name: "Karim Dridi",   fatigue: 82, risk: 62, readiness: 58, shouldSub: true  },
  { name: "Mohamed Sassi", fatigue: 68, risk: 42, readiness: 72, shouldSub: false },
  { name: "Sami Bouazizi", fatigue: 47, risk: 22, readiness: 88, shouldSub: false },
  { name: "Ridha Ammar",   fatigue: 50, risk: 20, readiness: 85, shouldSub: false },
];

const ACard = ({ children, className = "", glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) => (
  <motion.div className={`rounded-[20px] border p-5 ${className}`}
    style={{
      background: "rgba(5,8,22,0.7)",
      borderColor: glow ? "rgba(239,68,68,0.35)" : "rgba(255,255,255,0.06)",
      boxShadow: glow ? "0 0 30px rgba(239,68,68,0.1)" : "0 8px 24px rgba(0,0,0,0.2)",
    }}
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
    {children}
  </motion.div>
);

export function AnalysteLiveMatchPage() {
  const [live, setLive] = useState(false);
  const [currentMinute, setCurrentMinute] = useState(65);
  const [data, setData] = useState(INIT_DATA);
  const [score, setScore] = useState({ home: 1, away: 1 });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentData = data.find(d => d.minute === currentMinute) ?? data[data.length - 1];

  function toggleLive() {
    if (live) {
      clearInterval(intervalRef.current!);
      setLive(false);
    } else {
      setLive(true);
      intervalRef.current = setInterval(() => {
        setCurrentMinute(prev => {
          if (prev >= 90) { clearInterval(intervalRef.current!); setLive(false); return 90; }
          const next = prev + 1;
          setData(prevData => {
            const lastFatigue = prevData[prevData.length - 1]?.fatigue ?? 65;
            const lastWin = prevData[prevData.length - 1]?.winProb ?? 50;
            const lastXg = prevData[prevData.length - 1]?.xg ?? 2.6;
            const lastPoss = prevData[prevData.length - 1]?.possession ?? 50;
            return [...prevData, {
              minute: next,
              possession: Math.max(35, Math.min(70, lastPoss + (Math.random() - 0.5) * 6)),
              fatigue: Math.min(99, lastFatigue + 0.7),
              winProb: Math.max(20, Math.min(80, lastWin + (Math.random() - 0.45) * 3)),
              xg: parseFloat((lastXg + 0.04).toFixed(2)),
            }];
          });
          return next;
        });
      }, 500);
    }
  }

  useEffect(() => () => clearInterval(intervalRef.current!), []);

  const displayedData = data.filter(d => d.minute <= currentMinute);

  return (
    <AnalystePageTransition>
      {/* Live header */}
      <ACard glow>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <motion.div className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: "rgba(239,68,68,0.18)" }}
              animate={{ scale: live ? [1, 1.15, 1] : 1 }} transition={{ duration: 0.8, repeat: live ? Infinity : 0 }}>
              <Radio size={18} style={{ color: "#EF4444" }} />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>FC Carthage vs EST</h2>
                {live && (
                  <motion.span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{ background: "rgba(239,68,68,0.2)", color: "#EF4444" }}
                    animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                    ● LIVE
                  </motion.span>
                )}
              </div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Stade El Menzah · Journée 30 · Ligue 1</p>
            </div>
          </div>

          {/* Score */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>{score.home}</span>
              <span className="text-lg font-bold" style={{ color: "var(--text-muted)" }}>-</span>
              <span className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>{score.away}</span>
            </div>
            <div className="rounded-xl border px-3 py-1.5 text-center"
              style={{ borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)" }}>
              <p className="text-lg font-black" style={{ color: "#EF4444" }}>{currentMinute}'</p>
              <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>Minute</p>
            </div>
          </div>

          <motion.button type="button" onClick={toggleLive}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white"
            style={{ background: live ? "rgba(239,68,68,0.25)" : "linear-gradient(135deg,#EF4444,#DC2626)", border: live ? "1px solid rgba(239,68,68,0.5)" : "none" }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            {live ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Simuler Live</>}
          </motion.button>
        </div>
      </ACard>

      {/* KPIs live */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Probabilité victoire", value: `${Math.round(currentData.winProb)}%`, color: currentData.winProb >= 55 ? "#22C55E" : "#FF7A00", icon: TrendingUp },
          { label: "Fatigue équipe",       value: `${Math.round(currentData.fatigue)}%`, color: currentData.fatigue >= 70 ? "#EF4444" : "#FF7A00", icon: AlertTriangle },
          { label: "Possession",           value: `${Math.round(currentData.possession)}%`, color: "#3B82F6", icon: Users },
          { label: "xG",                   value: String(currentData.xg),                   color: "#8B5CF6", icon: RefreshCw },
        ].map(({ label, value, color, icon: Icon }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <div className="rounded-[16px] border p-4" style={{ background: "rgba(5,8,22,0.7)", borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2">
                <motion.div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${color}18`, color }}
                  animate={live ? { boxShadow: [`0 0 0px ${color}00`, `0 0 14px ${color}50`, `0 0 0px ${color}00`] } : {}}
                  transition={{ duration: 1.2, repeat: live ? Infinity : 0 }}>
                  <Icon size={14} />
                </motion.div>
                <div>
                  <motion.p className="text-xl font-extrabold" style={{ color }} key={value}
                    initial={{ scale: 1.2 }} animate={{ scale: 1 }}>
                    {value}
                  </motion.p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
        {/* Charts */}
        <div className="space-y-4">
          <ACard>
            <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Probabilité victoire en temps réel</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={displayedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="minute" tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} label={{ value: "min", position: "insideRight", fill: "var(--text-muted)", fontSize: 9 }} />
                  <YAxis domain={[20, 80]} tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [`${Math.round(v)}%`, "Win prob."]} />
                  <Line type="monotone" dataKey="winProb" stroke="#22C55E" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ACard>

          <ACard>
            <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Fatigue & Possession</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={displayedData}>
                  <defs>
                    <linearGradient id="fatGr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EF4444" stopOpacity={0.35} /><stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="posGr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} /><stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="minute" tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Area type="monotone" dataKey="fatigue"    stroke="#EF4444" strokeWidth={2} fill="url(#fatGr)" name="Fatigue %" isAnimationActive={false} />
                  <Area type="monotone" dataKey="possession" stroke="#3B82F6" strokeWidth={2} fill="url(#posGr)" name="Possession %" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ACard>
        </div>

        {/* Events + substitutions */}
        <div className="space-y-4">
          <ACard>
            <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Événements</p>
            <div className="space-y-2">
              {EVENTS.filter(e => e.minute <= currentMinute).map((ev, i) => {
                const color = ev.type === "goal" ? "#22C55E" : ev.type === "card" ? "#F59E0B" : ev.type === "sub" ? "#3B82F6" : "#8B5CF6";
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-2.5 rounded-xl border p-2.5"
                    style={{ background: `${color}06`, borderColor: `${color}20` }}>
                    <span className="shrink-0 rounded-lg px-1.5 py-0.5 text-[10px] font-black"
                      style={{ background: `${color}20`, color }}>{ev.minute}'</span>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{ev.player}</p>
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{ev.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </ACard>

          <ACard>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Remplacement suggéré IA</p>
              <motion.div className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]"
                style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444" }}
                animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
                <Radio size={8} /> Live
              </motion.div>
            </div>
            <div className="space-y-2">
              {PLAYERS_LIVE.map((p, i) => {
                const fColor = p.fatigue >= 75 ? "#EF4444" : p.fatigue >= 60 ? "#FF7A00" : "#22C55E";
                return (
                  <motion.div key={p.name} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 rounded-xl border p-2.5"
                    style={{
                      background: p.shouldSub ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.02)",
                      borderColor: p.shouldSub ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.06)",
                    }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                      <p className="text-[10px]" style={{ color: fColor }}>Fatigue {p.fatigue}%</p>
                    </div>
                    {p.shouldSub && (
                      <motion.span className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold"
                        style={{ background: "rgba(239,68,68,0.2)", color: "#EF4444" }}
                        animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        ↗ Remplacer
                      </motion.span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </ACard>
        </div>
      </div>
    </AnalystePageTransition>
  );
}
