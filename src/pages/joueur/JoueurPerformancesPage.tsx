import { motion } from "framer-motion";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Legend, PieChart, Pie, Cell,
} from "recharts";
import { Zap, Brain, Dumbbell, Heart, Play } from "lucide-react";
import { JoueurPageTransition } from "../../components/player/JoueurPageTransition";
import { JoueurKpiCard } from "../../components/player/JoueurKpiCard";
import { PlayerHeatmap } from "../../components/player/PlayerHeatmap";
import { useCurrentPlayer } from "../../hooks/useCurrentPlayer";
import { useLocale } from "../../contexts/LocaleContext";
import {
  PERFORMANCE_OVERVIEW,
  PERFORMANCE_EVOLUTION,
  TEAM_AVERAGE,
  GOAL_CONTRIBUTION,
  MATCH_RATINGS,
  VIDEO_HIGHLIGHT,
} from "../../data/joueurPersonalData";
import { staggerContainer, staggerItem } from "../../lib/animations";

const OVERVIEW = [
  { key: "vitesse" as const, icon: Zap, color: "#FF6B57" },
  { key: "technique" as const, icon: Brain, color: "#3B82F6" },
  { key: "physique" as const, icon: Dumbbell, color: "#22C55E" },
  { key: "mental" as const, icon: Heart, color: "#F59E0B" },
];

export function JoueurPerformancesPage() {
  const { player } = useCurrentPlayer();
  const { t } = useLocale();
  if (!player) return null;

  const radarSolo = [
    { stat: "Speed", value: player.radar.speed },
    { stat: "Passing", value: player.radar.passing },
    { stat: "Shooting", value: player.radar.shooting },
    { stat: "Physical", value: player.radar.physical },
    { stat: "Vision", value: player.radar.vision },
  ];

  const compareData = [
    { stat: "Speed", Moi: player.radar.speed, Equipe: TEAM_AVERAGE.speed },
    { stat: "Passing", Moi: player.radar.passing, Equipe: TEAM_AVERAGE.passing },
    { stat: "Shooting", Moi: player.radar.shooting, Equipe: TEAM_AVERAGE.shooting },
    { stat: "Physical", Moi: player.radar.physical, Equipe: TEAM_AVERAGE.physical },
    { stat: "Vision", Moi: player.radar.vision, Equipe: TEAM_AVERAGE.vision },
  ];

  const pieData = GOAL_CONTRIBUTION.map((g) => ({ name: g.name, value: g.value, color: g.color }));

  return (
    <JoueurPageTransition>
      <motion.div className="grid grid-cols-2 gap-4 lg:grid-cols-4" variants={staggerContainer} initial="initial" animate="animate">
        {OVERVIEW.map(({ key, icon: Icon, color }) => (
          <motion.div key={key} variants={staggerItem}>
            <JoueurKpiCard>
              <Icon size={18} style={{ color }} />
              <p className="mt-3 text-3xl font-bold" style={{ color }}>{PERFORMANCE_OVERVIEW[key]}%</p>
            </JoueurKpiCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Heatmap premium — full width */}
      <JoueurKpiCard delay={0.08}>
        <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {t.performances.heatmap}
        </h3>
        <PlayerHeatmap />
      </JoueurKpiCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <JoueurKpiCard delay={0.1}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Radar FIFA</h3>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarSolo}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="stat" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <Radar dataKey="value" stroke="#FF6B57" fill="#FF6B57" fillOpacity={0.25} animationDuration={1200} />
            </RadarChart>
          </ResponsiveContainer>
        </JoueurKpiCard>

        <JoueurKpiCard delay={0.12}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Évolution Jan → Juin</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={PERFORMANCE_EVOLUTION}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <YAxis domain={[60, 100]} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#141B2D", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }} />
              <Line type="monotone" dataKey="score" stroke="#FF6B57" strokeWidth={2} dot={{ r: 4, fill: "#FF6B57" }} animationDuration={1500} />
            </LineChart>
          </ResponsiveContainer>
        </JoueurKpiCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <JoueurKpiCard delay={0.15}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.performances.matchRatings}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={MATCH_RATINGS}>
              <XAxis dataKey="label" tick={{ fill: "var(--text-muted)", fontSize: 9 }} />
              <YAxis domain={[6, 10]} tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#141B2D", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }} />
              <Bar dataKey="rating" fill="#FF6B57" radius={[4, 4, 0, 0]} animationDuration={1200} />
            </BarChart>
          </ResponsiveContainer>
        </JoueurKpiCard>

        <JoueurKpiCard delay={0.18}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.performances.goalContribution}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" animationDuration={1200}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#141B2D", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex justify-center gap-4">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                <div className="h-2 w-2 rounded-full" style={{ background: d.color }} />{d.name}
              </div>
            ))}
          </div>
        </JoueurKpiCard>

        <JoueurKpiCard delay={0.2}>
          <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.performances.highlights}</h3>
          <div className="relative overflow-hidden rounded-xl">
            <img src={VIDEO_HIGHLIGHT.thumbnail} alt="" className="h-32 w-full object-cover opacity-80" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <button type="button" className="flex h-12 w-12 items-center justify-center rounded-full transition-all hover:scale-105" style={{ background: "#FF6B57" }}>
                <Play size={20} fill="white" color="white" />
              </button>
            </div>
          </div>
          <p className="mt-2 text-sm font-medium" style={{ color: "var(--text-primary)" }}>{VIDEO_HIGHLIGHT.title}</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{VIDEO_HIGHLIGHT.duration} • {VIDEO_HIGHLIGHT.views} vues</p>
        </JoueurKpiCard>
      </div>

      <JoueurKpiCard delay={0.22}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Moi vs Moyenne équipe</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={compareData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="stat" tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Moi" fill="#FF6B57" radius={[4, 4, 0, 0]} animationDuration={1200} />
              <Bar dataKey="Equipe" fill="rgba(255,255,255,0.2)" radius={[4, 4, 0, 0]} animationDuration={1200} />
            </BarChart>
          </ResponsiveContainer>
        </JoueurKpiCard>
    </JoueurPageTransition>
  );
}
