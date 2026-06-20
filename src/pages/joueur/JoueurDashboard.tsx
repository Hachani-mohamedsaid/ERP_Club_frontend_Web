import { motion } from "framer-motion";
import { Calendar, TrendingUp, Activity, Target, Zap, Star, Trophy, Euro } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { JoueurPageTransition } from "../../components/player/JoueurPageTransition";
import { JoueurKpiCard } from "../../components/player/JoueurKpiCard";
import { PlayerAvatar } from "../../components/player/PlayerAvatar";
import { SeasonProgressBar } from "../../components/player/SeasonProgressBar";
import { CountUpStat } from "../../components/player/CountUpStat";
import { useCurrentPlayer } from "../../hooks/useCurrentPlayer";
import { useLocale } from "../../contexts/LocaleContext";
import {
  DASHBOARD_HERO,
  NEXT_MATCH,
  SEASON_OBJECTIVES,
  OVR_PROGRESSION,
  PLAYER_REWARDS,
  RECENT_ACTIVITY,
  DASHBOARD_KPIS,
  MARKET_VALUE_TREND,
} from "../../data/joueurPersonalData";
import { staggerContainer, staggerItem } from "../../lib/animations";

const ACTIVITY_ICONS = { training: Activity, match: Target, medical: Zap };

export function JoueurDashboard() {
  const { player } = useCurrentPlayer();
  const { t } = useLocale();

  if (!player) return null;

  const rewardTitles = {
    playerOfMonth: t.dashboard.playerOfMonth,
    topScorer: t.dashboard.topScorer,
    winStreak: t.dashboard.winStreak,
  };

  return (
    <JoueurPageTransition>
      {/* Hero — narrative first */}
      <motion.div
        className="relative overflow-hidden rounded-[24px] border p-6 lg:p-8"
        style={{
          background: "linear-gradient(135deg, rgba(255,107,87,0.2) 0%, #141B2D 50%, #070B1A 100%)",
          borderColor: "rgba(255,255,255,0.08)",
        }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, rgba(255,107,87,0.4) 0%, transparent 70%)" }} />

        <div className="relative z-10 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_auto_1fr]">
          <div className="flex gap-5">
            <PlayerAvatar name={player.name} size={88} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {t.dashboard.formExcellent}
                </h2>
              </div>
              <p className="mt-1 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                {player.name} • {player.position} • OVR {player.ovr}
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-xl border px-3 py-1.5" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  <Star size={14} style={{ color: "#F59E0B" }} />
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>{t.dashboard.coachRating}:</span>
                  <span className="text-sm font-bold" style={{ color: "#FF6B57" }}>
                    {DASHBOARD_HERO.coachRating}/10
                  </span>
                </div>
                <div className="rounded-xl px-3 py-1.5 text-sm font-semibold" style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E" }}>
                  {DASHBOARD_KPIS.form}% {t.dashboard.whereAmI}
                </div>
              </div>
            </div>
          </div>

          {/* Centre — fill empty space */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-1 xl:gap-3">
            <motion.div
              className="rounded-[16px] border px-4 py-3"
              style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
            >
              <div className="flex items-center gap-2">
                <Trophy size={14} style={{ color: "#F59E0B" }} />
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  {t.dashboard.positionRanking}
                </span>
              </div>
              <p className="mt-1 text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                #{DASHBOARD_HERO.positionRanking}{" "}
                <span className="text-base font-semibold" style={{ color: "#FF6B57" }}>{DASHBOARD_HERO.positionLabel}</span>
              </p>
            </motion.div>

            <motion.div
              className="rounded-[16px] border px-4 py-3"
              style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
            >
              <div className="flex items-center gap-2">
                <Euro size={14} style={{ color: "#22C55E" }} />
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  {t.dashboard.marketValue}
                </span>
              </div>
              <p className="mt-1 text-xl font-bold" style={{ color: "var(--text-primary)" }}>{DASHBOARD_HERO.marketValue}</p>
              <p className="text-xs font-semibold" style={{ color: "#22C55E" }}>↗ {MARKET_VALUE_TREND.change}</p>
            </motion.div>

            <motion.div
              className="rounded-[16px] border px-4 py-3"
              style={{ borderColor: "rgba(255,107,87,0.25)", background: "rgba(255,107,87,0.06)" }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2">
                <Target size={14} style={{ color: "#FF6B57" }} />
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  {t.dashboard.nextGoal}
                </span>
              </div>
              <p className="mt-1 text-xl font-bold" style={{ color: "#FF6B57" }}>
                {SEASON_OBJECTIVES.goals.current}/{SEASON_OBJECTIVES.goals.target} buts
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "#FF6B57" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(SEASON_OBJECTIVES.goals.current / SEASON_OBJECTIVES.goals.target) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          </div>

          <div className="rounded-[20px] border p-5 lg:min-w-[260px]" style={{ borderColor: "rgba(255,107,87,0.3)", background: "rgba(255,107,87,0.06)" }}>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#FF6B57" }}>
              {t.dashboard.nextMatch}
            </p>
            <p className="mt-1 text-lg font-bold" style={{ color: "var(--text-primary)" }}>{NEXT_MATCH.label}</p>
            <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
              <Calendar size={12} />
              {NEXT_MATCH.date} • {NEXT_MATCH.time}
            </div>
            <div className="mt-3 rounded-xl border px-3 py-2" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t.dashboard.starterProb}</p>
              <p className="text-2xl font-bold" style={{ color: "#22C55E" }}>
                <CountUpStat end={NEXT_MATCH.starterProbability} suffix="%" />
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Objectives + OVR + Rewards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <JoueurKpiCard delay={0.05}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            🎯 {t.dashboard.seasonGoals}
          </h3>
          <SeasonProgressBar
            label={t.dashboard.goalTarget}
            current={SEASON_OBJECTIVES.goals.current}
            target={SEASON_OBJECTIVES.goals.target}
          />
          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl border p-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <p className="text-lg font-bold" style={{ color: "#3B82F6" }}>{SEASON_OBJECTIVES.assists.current}/{SEASON_OBJECTIVES.assists.target}</p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Assists</p>
            </div>
            <div className="rounded-xl border p-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <p className="text-lg font-bold" style={{ color: "#F59E0B" }}>{SEASON_OBJECTIVES.minutes.current}</p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Minutes</p>
            </div>
          </div>
        </JoueurKpiCard>

        <JoueurKpiCard delay={0.1}>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            <TrendingUp size={16} style={{ color: "#FF6B57" }} />
            {t.dashboard.ovrProgress}
          </h3>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={OVR_PROGRESSION}>
              <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[82, 88]} hide />
              <Tooltip contentStyle={{ background: "#141B2D", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }} />
              <Line type="monotone" dataKey="ovr" stroke="#FF6B57" strokeWidth={2.5} dot={{ fill: "#FF6B57", r: 4 }} animationDuration={1500} />
            </LineChart>
          </ResponsiveContainer>
        </JoueurKpiCard>

        <JoueurKpiCard delay={0.15}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            🏆 {t.dashboard.rewards}
          </h3>
          <motion.div className="space-y-2" variants={staggerContainer} initial="initial" animate="animate">
            {PLAYER_REWARDS.map((r) => (
              <motion.div
                key={r.id}
                variants={staggerItem}
                className="flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all hover:scale-[1.02]"
                style={{ borderColor: "rgba(255,255,255,0.06)", background: `${r.color}11` }}
              >
                <span className="text-xl">{r.icon}</span>
                <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  {rewardTitles[r.titleKey]}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </JoueurKpiCard>
      </div>

      {/* Compact KPIs + Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <JoueurKpiCard delay={0.2}>
          <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.dashboard.whatsNext}</h3>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "OVR", value: DASHBOARD_KPIS.ovr, color: "#FF6B57" },
              { label: "Buts", value: DASHBOARD_KPIS.goals, color: "#22C55E" },
              { label: "Assists", value: DASHBOARD_KPIS.assists, color: "#3B82F6" },
              { label: "Dispo", value: DASHBOARD_KPIS.availability, color: "#22C55E", suffix: "%" },
            ].map(({ label, value, color, suffix = "" }) => (
              <div key={label} className="rounded-xl border p-2 text-center" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <p className="text-lg font-bold" style={{ color }}><CountUpStat end={value} suffix={suffix} /></p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</p>
              </div>
            ))}
          </div>
        </JoueurKpiCard>

        <JoueurKpiCard delay={0.25}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.dashboard.recentActivity}</h3>
          <div className="space-y-3">
            {RECENT_ACTIVITY.map((event, idx) => {
              const Icon = ACTIVITY_ICONS[event.type];
              return (
                <motion.div key={event.id} className="flex gap-3" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + idx * 0.1 }}>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: "rgba(255,107,87,0.12)" }}>
                    <Icon size={14} style={{ color: "#FF6B57" }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{event.title}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{event.description} • {event.time}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </JoueurKpiCard>
      </div>
    </JoueurPageTransition>
  );
}
