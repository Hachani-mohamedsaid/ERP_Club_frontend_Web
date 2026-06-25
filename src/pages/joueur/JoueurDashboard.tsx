import { motion } from "framer-motion";
import { TrendingUp, Activity, Target, Zap, Star, Trophy, Euro, Flame, BarChart3 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { JoueurPageTransition } from "../../components/player/JoueurPageTransition";
import { JoueurKpiCard } from "../../components/player/JoueurKpiCard";
import { FifaPlayerCard } from "../../components/player/FifaPlayerCard";
import { MatchPreviewCard } from "../../components/player/MatchPreviewCard";
import { SeasonProgressBar } from "../../components/player/SeasonProgressBar";
import { CountUpStat } from "../../components/player/CountUpStat";
import { useCurrentPlayer } from "../../hooks/useCurrentPlayer";
import { useJoueurBackendData } from "../../hooks/useJoueurBackendData";
import { useLocale } from "../../contexts/LocaleContext";
import { staggerContainer, staggerItem } from "../../lib/animations";

const STADIUM_BG = "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80";

const ACTIVITY_ICONS = { training: Activity, match: Target, medical: Zap };

export function JoueurDashboard() {
  const { player, photoUrl, handleFileChange, backendPlayer } = useCurrentPlayer();
  const { playerStats, matchStats, calendarEvents, injuries, awards, orgProfile } = useJoueurBackendData();
  const { t } = useLocale();

  if (!player) return null;

  // ── Derived from backend stats ──────────────────────────────
  const stats = playerStats;
  const trainingLoad = stats?.trainingLoad ?? 65;
  const sess = stats?.trainingSessions ?? { completed: 4, total: 5, intensity: "Moyenne", fatiguePredicted: 45 };
  const fatiguePredicted = sess.fatiguePredicted;
  const loadColor = trainingLoad >= 80 ? "#EF4444" : trainingLoad >= 60 ? "#F59E0B" : "#22C55E";

  const seasonGoals = stats?.seasonStats?.goals ?? player.ovr > 0 ? matchStats.reduce((s, m) => s + m.goals, 0) : 0;
  const seasonAssists = stats?.seasonStats?.assists ?? matchStats.reduce((s, m) => s + m.assists, 0);
  const seasonMatches = stats?.seasonStats?.matches ?? matchStats.length;
  const goalTarget = Math.max(seasonGoals + 3, 10);
  const assistTarget = Math.max(seasonAssists + 2, 8);
  const minutesTotal = matchStats.reduce((s, m) => s + m.minutes, 0);

  const heroMarketValue = stats?.dashboardHero?.marketValue ?? player.marketValue;
  const heroCoachRating = stats?.dashboardHero?.coachRating ?? 7.8;
  const heroPosRanking = stats?.dashboardHero?.positionRanking ?? 2;
  const heroMvTrend = stats?.marketValueTrend?.change ?? "+5%";

  // OVR progression from performance evolution
  const ovrProgression = (stats?.performanceEvolution ?? []).map((p) => ({
    month: p.month,
    ovr: Math.round(player.ovr * 0.95 + p.score * 0.05),
  }));

  // Last match ratings
  const lastMatchRatings = matchStats.slice(0, 3);

  // Recent activity from calendar + injuries
  const recentActivity = [
    ...calendarEvents.slice(0, 2).map((e) => ({
      id: e.id,
      type: (e.eventType === "MATCH" ? "match" : "training") as keyof typeof ACTIVITY_ICONS,
      title: e.title,
      description: e.location ?? "",
      time: new Date(e.eventDate).toLocaleDateString("fr-FR"),
    })),
    ...injuries.slice(0, 1).map((inj) => ({
      id: inj.id,
      type: "medical" as keyof typeof ACTIVITY_ICONS,
      title: `Blessure: ${inj.injury}`,
      description: inj.bodyPart ?? "",
      time: inj.returnDate,
    })),
  ].slice(0, 4);

  // Club name and league from org profile
  const clubName = orgProfile?.clubName ?? "Mon Club";
  const leagueName = orgProfile?.league ?? "Liga 1";

  // Jersey number from backend player
  const jerseyNumber = backendPlayer?.jerseyNumber ?? 0;

  // Rewards from backend awards (first 3 award-type items)
  const awardItems = awards.filter((a) => a.awardType === "award").slice(0, 3);
  const rewardsList = awardItems.length > 0
    ? awardItems.map((a) => ({ id: a.id, icon: a.icon, color: a.color ?? "#d99a1f", text: a.title }))
    : [
        { id: "placeholder-1", icon: "🏆", color: "#d99a1f", text: t.dashboard.playerOfMonth },
        { id: "placeholder-2", icon: "⚽", color: "#FF6B57", text: t.dashboard.topScorer },
        { id: "placeholder-3", icon: "🎯", color: "#22C55E", text: t.dashboard.winStreak },
      ];

  return (
    <JoueurPageTransition>
      {/* ── HERO ── */}
      <motion.div
        className="relative overflow-hidden rounded-[24px] border"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="absolute inset-0">
          <img src={STADIUM_BG} alt="" className="h-full w-full object-cover opacity-20" />
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(135deg, rgba(255,107,87,0.15) 0%, rgba(7,11,26,0.97) 45%, rgba(7,11,26,0.99) 100%)" }} />
        </div>

        <div className="relative z-10 p-6 lg:p-8">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[280px_1fr_300px]">

            {/* FIFA Card */}
            <div className="flex flex-col items-center gap-3 overflow-visible px-2 py-3" style={{ minWidth: 260 }}>
              <FifaPlayerCard
                name={player.name}
                position={player.position}
                ovr={player.ovr}
                age={player.age}
                flag={player.flag}
                nationality={player.nationality}
                number={jerseyNumber > 0 ? String(jerseyNumber) : String(player.ovr % 20 + 5)}
                radar={player.radar}
                badge="forme"
                cutoutUrl={photoUrl}
                onPhotoUpload={handleFileChange}
              />
              <div className="flex flex-wrap justify-center gap-2">
                <div className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
                  style={{ background: "rgba(255,107,87,0.15)", color: "#FF6B57" }}>
                  🔥 {t.dashboard.formExcellent}
                </div>
                <div className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ background: "rgba(34,197,94,0.12)", color: "#22C55E" }}>
                  {stats?.form ?? player.ovr}% forme
                </div>
              </div>
            </div>

            {/* Centre */}
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#FF6B57" }}>
                  Saison {new Date().getFullYear() - 1}-{String(new Date().getFullYear()).slice(2)} · {player.position}
                </p>
                <h2 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>{player.name}</h2>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {player.flag} {player.nationality} · {clubName} · {heroMarketValue}
                </p>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { icon: Trophy, label: t.dashboard.positionRanking, value: `#${heroPosRanking}`, sub: leagueName, color: "#F59E0B" },
                  { icon: Euro, label: t.dashboard.marketValue, value: heroMarketValue, sub: `↗ ${heroMvTrend}`, color: "#22C55E" },
                  { icon: Star, label: t.dashboard.coachRating, value: `${heroCoachRating}`, sub: "/10", color: "#FF6B57" },
                  { icon: Target, label: t.dashboard.nextGoal, value: `${seasonGoals}/${goalTarget}`, sub: "buts", color: "#3B82F6" },
                ].map(({ icon: Icon, label, value, sub, color }, i) => (
                  <motion.div key={label}
                    className="rounded-[16px] border p-3"
                    style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                    whileHover={{ y: -3, borderColor: `${color}35` }}>
                    <Icon size={13} style={{ color }} />
                    <p className="mt-1.5 text-[9px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</p>
                    <p className="text-lg font-black" style={{ color }}>{value}</p>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{sub}</p>
                  </motion.div>
                ))}
              </div>

              {/* Training load + fatigue */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <motion.div className="rounded-[18px] border p-4"
                  style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 size={14} style={{ color: loadColor }} />
                      <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>Charge cette semaine</span>
                    </div>
                    <span className="text-sm font-black" style={{ color: loadColor }}>{trainingLoad}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <motion.div className="h-full rounded-full" style={{ background: loadColor }}
                      initial={{ width: 0 }} animate={{ width: `${trainingLoad}%` }} transition={{ duration: 1 }} />
                  </div>
                  <p className="mt-1.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
                    {sess.completed}/{sess.total} séances · Intensité {sess.intensity}
                  </p>
                </motion.div>

                <motion.div className="rounded-[18px] border p-4"
                  style={{ borderColor: "rgba(245,158,11,0.2)", background: "rgba(245,158,11,0.06)" }}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                  <div className="mb-2 flex items-center gap-2">
                    <Flame size={14} style={{ color: "#F59E0B" }} />
                    <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>Fatigue prévue</span>
                    <span className="ml-auto text-sm font-black" style={{ color: "#F59E0B" }}>{fatiguePredicted}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <motion.div className="h-full rounded-full" style={{ background: "#F59E0B" }}
                      initial={{ width: 0 }} animate={{ width: `${fatiguePredicted}%` }} transition={{ duration: 1, delay: 0.1 }} />
                  </div>
                  <p className="mt-1.5 text-[10px]" style={{ color: "var(--text-muted)" }}>Analyse des {matchStats.length} derniers matchs</p>
                </motion.div>
              </div>

              {/* Last 3 match ratings */}
              {lastMatchRatings.length > 0 && (
                <div className="rounded-[18px] border p-4" style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    Derniers matchs
                  </p>
                  <div className="flex gap-3">
                    {lastMatchRatings.map((m, i) => {
                      const ratingColor = m.rating >= 8 ? "#22C55E" : m.rating >= 7 ? "#F59E0B" : "#EF4444";
                      return (
                        <motion.div key={m.id} className="flex-1 rounded-xl border p-3 text-center"
                          style={{ borderColor: `${ratingColor}25`, background: `${ratingColor}08` }}
                          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.06 }}
                          whileHover={{ y: -2 }}>
                          <p className="text-[10px] font-bold" style={{ color: "var(--text-muted)" }}>vs {m.opponent.split(" ").pop()}</p>
                          <p className="text-xl font-black" style={{ color: ratingColor }}>{m.rating.toFixed(1)}</p>
                          <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>
                            {m.goals > 0 ? `${m.goals}⚽` : "—"} · {new Date(m.matchDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Match preview */}
            <MatchPreviewCard starterLabel={t.dashboard.starterProb} />
          </div>
        </div>
      </motion.div>

      {/* Objectives + OVR + Rewards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <JoueurKpiCard delay={0.05}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            🎯 {t.dashboard.seasonGoals}
          </h3>
          <SeasonProgressBar label={t.dashboard.goalTarget} current={seasonGoals} target={goalTarget} />
          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl border p-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <p className="text-lg font-bold" style={{ color: "#3B82F6" }}>{seasonAssists}/{assistTarget}</p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Assists</p>
            </div>
            <div className="rounded-xl border p-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <p className="text-lg font-bold" style={{ color: "#F59E0B" }}>{minutesTotal}</p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Minutes</p>
            </div>
          </div>
        </JoueurKpiCard>

        <JoueurKpiCard delay={0.1}>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            <TrendingUp size={16} style={{ color: "#FF6B57" }} />
            {t.dashboard.ovrProgress}
          </h3>
          {ovrProgression.length > 0 ? (
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={ovrProgression}>
                <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 100]} hide />
                <Tooltip contentStyle={{ background: "#141B2D", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="ovr" stroke="#FF6B57" strokeWidth={2.5} dot={{ fill: "#FF6B57", r: 4 }} animationDuration={1500} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-36 items-center justify-center text-sm" style={{ color: "var(--text-muted)" }}>Chargement…</div>
          )}
        </JoueurKpiCard>

        <JoueurKpiCard delay={0.15}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>🏆 {t.dashboard.rewards}</h3>
          <motion.div className="space-y-2" variants={staggerContainer} initial="initial" animate="animate">
            {rewardsList.map((r) => (
              <motion.div key={r.id} variants={staggerItem}
                className="flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all hover:scale-[1.02]"
                style={{ borderColor: "rgba(255,255,255,0.06)", background: `${r.color}11` }}>
                <span className="text-xl">{r.icon}</span>
                <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{r.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </JoueurKpiCard>
      </div>

      {/* KPIs + Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <JoueurKpiCard delay={0.2}>
          <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.dashboard.whatsNext}</h3>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "OVR", value: player.ovr, color: "#FF6B57" },
              { label: "Buts", value: seasonGoals, color: "#22C55E" },
              { label: "Assists", value: seasonAssists, color: "#3B82F6" },
              { label: "Matchs", value: seasonMatches, color: "#F59E0B" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-xl border p-2 text-center" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <p className="text-lg font-bold" style={{ color }}><CountUpStat end={value} suffix="" /></p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</p>
              </div>
            ))}
          </div>
        </JoueurKpiCard>

        <JoueurKpiCard delay={0.25}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.dashboard.recentActivity}</h3>
          <div className="space-y-3">
            {recentActivity.length > 0 ? recentActivity.map((event, idx) => {
              const Icon = ACTIVITY_ICONS[event.type] ?? Activity;
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
            }) : (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucune activité récente</p>
            )}
          </div>
        </JoueurKpiCard>
      </div>
    </JoueurPageTransition>
  );
}
