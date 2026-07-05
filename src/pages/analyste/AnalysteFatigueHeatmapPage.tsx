import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area,
} from "recharts";
import { Activity, TrendingDown, AlertTriangle, Clock } from "lucide-react";
import { AnalystePageTransition } from "../../components/analyste/AnalystePageTransition";
import { AnalystePageLoader } from "../../components/analyste/AnalystePageLoader";
import { useAnalysteFatigue } from "../../hooks/useAnalysteResource";

const TOOLTIP_STYLE = {
  contentStyle: { background: "rgba(5,8,22,0.96)", border: "1px solid rgba(139,92,246,0.3)", color: "white", borderRadius: 12 },
};

function fatigueColor(v: number) {
  if (v >= 80) return "#EF4444";
  if (v >= 60) return "#FF7A00";
  if (v >= 40) return "#F59E0B";
  return "#22C55E";
}

function HeatCell({ value }: { value: number }) {
  const color = fatigueColor(value);
  return (
    <motion.div className="flex h-14 w-full flex-col items-center justify-center rounded-xl text-sm font-extrabold"
      style={{ background: `${color}20`, color }}
      initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}>
      {value}%
    </motion.div>
  );
}

const ACard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <motion.div className={`rounded-[20px] border p-5 ${className}`}
    style={{ background: "rgba(5,8,22,0.7)", borderColor: "var(--surface-panel-border)", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
    {children}
  </motion.div>
);

export function AnalysteFatigueHeatmapPage() {
  const { data, loading } = useAnalysteFatigue();
  const [view, setView] = useState<"team" | "individual">("team");
  const [selectedPlayer, setSelectedPlayer] = useState("");

  useEffect(() => {
    if (data?.playerHeatmaps[0]) setSelectedPlayer(data.playerHeatmaps[0].name);
  }, [data]);

  if (loading && !data) return <AnalystePageLoader />;

  const { teamFatigue: TEAM_FATIGUE_BY_MIN, playerHeatmaps: PLAYER_HEATMAPS, summary } = data!;
  const playerData = PLAYER_HEATMAPS.find(p => p.name === selectedPlayer) ?? PLAYER_HEATMAPS[0];

  return (
    <AnalystePageTransition>
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Fatigue max équipe",       value: `${summary.maxFatigue}%`, color: "#EF4444", icon: Activity },
          { label: "Effondrement physique",     value: summary.collapseRange,               color: "#FF7A00", icon: TrendingDown },
          { label: "Erreurs période critique",  value: `${summary.criticalErrors} erreurs`,    color: "#8B5CF6", icon: AlertTriangle },
          { label: "Actions 75-90 vs 0-15",    value: `${summary.actionsDelta}`,                       color: "#F59E0B", icon: Clock },
        ].map(({ label, value, color, icon: Icon }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <div className="rounded-[16px] border p-4" style={{ background: "rgba(5,8,22,0.7)", borderColor: "var(--surface-panel-border)" }}>
              <div className="flex items-center gap-2">
                <motion.div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${color}18`, color }}
                  animate={{ boxShadow: [`0 0 0px ${color}00`, `0 0 12px ${color}40`, `0 0 0px ${color}00`] }}
                  transition={{ duration: 2.2, repeat: Infinity }}>
                  <Icon size={14} />
                </motion.div>
                <div>
                  <p className="text-xl font-extrabold" style={{ color }}>{value}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* View toggle */}
      <div className="flex gap-2">
        {(["team", "individual"] as const).map(v => (
          <motion.button key={v} type="button" onClick={() => setView(v)}
            className="rounded-xl px-4 py-2 text-xs font-semibold"
            style={{
              background: view === v ? "linear-gradient(135deg,#8B5CF6,#6D28D9)" : "rgba(255,255,255,0.04)",
              color: view === v ? "white" : "var(--text-muted)",
            }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
            {v === "team" ? "Équipe" : "Individuel"}
          </motion.button>
        ))}
      </div>

      {view === "team" && (
        <div className="space-y-4">
          {/* Team heatmap grid */}
          <ACard>
            <p className="mb-4 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              Heatmap fatigue équipe — Par tranche de 15 minutes
            </p>
            <div className="grid grid-cols-6 gap-2 mb-4">
              {TEAM_FATIGUE_BY_MIN.map((d, i) => (
                <div key={d.interval} className="space-y-1">
                  <p className="text-center text-[10px] font-bold" style={{ color: "var(--text-muted)" }}>{d.interval}</p>
                  <HeatCell value={d.fatigue} />
                </div>
              ))}
            </div>
            {/* Gradient legend */}
            <div className="flex items-center gap-2">
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Faible</span>
              <div className="flex-1 h-2 rounded-full" style={{ background: "linear-gradient(90deg,#22C55E,#F59E0B,#FF7A00,#EF4444)" }} />
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Critique</span>
            </div>
          </ACard>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Fatigue line chart */}
            <ACard>
              <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Courbe fatigue équipe</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={TEAM_FATIGUE_BY_MIN}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="interval" tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} />
                    <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [`${v}%`, "Fatigue"]} />
                    <Line type="monotone" dataKey="fatigue" stroke="#EF4444" strokeWidth={2.5}
                      dot={(props) => {
                        const { cx, cy, value } = props;
                        return <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={5} fill={fatigueColor(value as number)} strokeWidth={0} />;
                      }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ACard>

            {/* Actions + errors bar */}
            <ACard>
              <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Actions & Erreurs par période</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={TEAM_FATIGUE_BY_MIN} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="interval" tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} />
                    <Tooltip {...TOOLTIP_STYLE} />
                    <Bar dataKey="actions" name="Actions" radius={[3,3,0,0]} fill="#3B82F6" fillOpacity={0.7} />
                    <Bar dataKey="errors"  name="Erreurs" radius={[3,3,0,0]} fill="#EF4444" fillOpacity={0.85} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ACard>
          </div>

          {/* Insight card */}
          <ACard>
            <p className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>
              <AlertTriangle size={12} className="inline mr-1.5" style={{ color: "#FF7A00" }} />
              Analyse IA — Zone d'effondrement physique
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {[
                { period: "0-45min",  insight: "Performance optimale. Actions: 142→128. Intensité élevée maintenue.", color: "#22C55E" },
                { period: "45-65min", insight: "Légère baisse post-mi-temps. Fatigue monte à 74%. Surveiller.", color: "#FF7A00" },
                { period: "65-90min", insight: "⚠ Effondrement physique. Actions: 94 (-34%). Erreurs x3. Remplacements urgents.", color: "#EF4444" },
              ].map(({ period, insight, color }) => (
                <div key={period} className="rounded-xl border p-3" style={{ background: `${color}06`, borderColor: `${color}20` }}>
                  <p className="text-xs font-bold mb-1" style={{ color }}>{period}</p>
                  <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{insight}</p>
                </div>
              ))}
            </div>
          </ACard>
        </div>
      )}

      {view === "individual" && (
        <div className="space-y-4">
          {/* Player selector */}
          <div className="flex flex-wrap gap-2">
            {PLAYER_HEATMAPS.map(p => (
              <motion.button key={p.name} type="button" onClick={() => setSelectedPlayer(p.name)}
                className="rounded-xl px-3 py-2 text-xs font-semibold"
                style={{
                  background: selectedPlayer === p.name ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.04)",
                  color: selectedPlayer === p.name ? "#8B5CF6" : "var(--text-muted)",
                  border: "1px solid var(--surface-panel-border)",
                }}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
                {p.name}
              </motion.button>
            ))}
          </div>

          {/* Individual heatmap */}
          <ACard>
            <p className="mb-4 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              {selectedPlayer} — Fatigue par période
            </p>
            <div className="grid grid-cols-6 gap-2 mb-5">
              {playerData.data.map((d) => (
                <div key={d.interval} className="space-y-1">
                  <p className="text-center text-[10px] font-bold" style={{ color: "var(--text-muted)" }}>{d.interval}</p>
                  <HeatCell value={d.fatigue} />
                  <p className="text-center text-[10px]" style={{ color: "var(--text-muted)" }}>{d.sprints} sp.</p>
                </div>
              ))}
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={playerData.data}>
                  <defs>
                    <linearGradient id="indGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="interval" tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Area type="monotone" dataKey="fatigue" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#indGrad)" name="Fatigue %" />
                  <Area type="monotone" dataKey="sprints" stroke="#F59E0B" strokeWidth={2} fill="none" name="Sprints" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ACard>
        </div>
      )}
    </AnalystePageTransition>
  );
}
