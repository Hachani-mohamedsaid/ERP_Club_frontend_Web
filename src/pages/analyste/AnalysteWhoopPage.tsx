import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, RefreshCw, Bell } from "lucide-react";
import { AnalystePageTransition } from "../../components/analyste/AnalystePageTransition";
import { AnalystePageLoader } from "../../components/analyste/AnalystePageLoader";
import {
  WhoopPremiumBg,
  WhoopHero,
  WhoopSquadList,
  WhoopRightRail,
  WhoopAICoach,
  WhoopTimeline,
  WhoopGlassMetric,
  WhoopPlayerProfile,
  WhoopTeamOverview,
} from "../../components/analyste/whoop";
import { useAnalysteWhoop } from "../../hooks/useAnalysteResource";

export function AnalysteWhoopPage() {
  const { data, loading } = useAnalysteWhoop();
  const [selectedId, setSelectedId] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    if (data) setSelectedId(data.defaultPlayerId);
  }, [data]);

  const squad = data?.squad ?? [];
  const player = squad.find((p) => p.id === selectedId) ?? squad[0];

  const filtered = useMemo(
    () => squad.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [squad, search],
  );

  const allAlerts = useMemo(
    () => squad.flatMap((p) => p.alerts.map((a) => ({ ...a, player: p.name }))),
    [squad],
  );

  if (loading && !data) return <AnalystePageLoader />;
  if (!player) return <AnalystePageLoader />;

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setProfileOpen(false);
  };

  const openProfile = (id: string) => {
    setSelectedId(id);
    setProfileOpen(true);
  };

  return (
    <>
      <WhoopPremiumBg />
      <AnalystePageTransition>
        <div className="relative mx-auto max-w-[1600px] space-y-5 pb-8">
          {/* Header */}
          <motion.div
            className="flex flex-wrap items-center justify-between gap-4"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-orange-400/80">WHOOP</span>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold text-emerald-400">LIVE</span>
              </div>
              <h1 className="mt-1 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-2xl font-bold text-transparent lg:text-3xl">
                Wearables Hub
              </h1>
              <p className="text-xs text-slate-500">FC Carthage · Telemetry · Recovery Intelligence</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Kar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-44 rounded-xl border border-white/8 bg-slate-900/60 py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-600 backdrop-blur-md focus:border-orange-500/40 focus:outline-none"
                />
              </div>

              <div className="relative">
                <motion.button
                  type="button"
                  onClick={() => setNotifOpen((o) => !o)}
                  className="relative rounded-xl border border-white/8 bg-slate-900/60 p-2.5 text-slate-300 backdrop-blur-md"
                  whileTap={{ scale: 0.95 }}
                >
                  <Bell size={16} />
                  {allAlerts.filter((a) => a.type !== "ok").length > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                      {allAlerts.filter((a) => a.type !== "ok").length}
                    </span>
                  )}
                </motion.button>
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-white/10 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-xl"
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    >
                      {allAlerts.slice(0, 5).map((a, i) => (
                        <motion.div
                          key={a.id}
                          className="border-b border-white/5 py-2 last:border-0"
                          initial={{ opacity: 0, x: 16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <p className="text-[11px] text-white">{a.message}</p>
                          <p className="text-[9px] text-slate-500">{a.player} · {a.time}</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.button
                type="button"
                onClick={() => { setSyncing(true); setTimeout(() => setSyncing(false), 2000); }}
                disabled={syncing}
                className="flex items-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-xs font-semibold text-orange-300"
                whileTap={{ scale: 0.97 }}
              >
                <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
                {syncing ? "Sync..." : "Sync équipe"}
              </motion.button>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {profileOpen ? (
              <WhoopPlayerProfile
                key="profile"
                player={player}
                onBack={() => setProfileOpen(false)}
              />
            ) : (
              <motion.div
                key="hub"
                className="space-y-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <WhoopHero player={player} />

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <WhoopGlassMetric label="Recovery" value={player.recovery} suffix="%" delta={`${player.recoveryDelta >= 0 ? "+" : ""}${player.recoveryDelta}%`} progress={player.recovery} />
                  <WhoopGlassMetric label="Strain" value={player.strain} color="#f97316" />
                  <WhoopGlassMetric label="Sleep" value={player.sleepHours} suffix="h" progress={player.sleepPerformance} color="#818cf8" delay={0.05} />
                  <WhoopGlassMetric label="HRV" value={player.hrv} suffix=" ms" delay={0.1} />
                </div>

                <div className="grid gap-5 lg:grid-cols-12">
                  <motion.div
                    className="lg:col-span-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Effectif</p>
                    <WhoopSquadList
                      players={filtered}
                      selectedId={selectedId}
                      onSelect={handleSelect}
                      onOpenProfile={openProfile}
                    />
                    <motion.button
                      type="button"
                      onClick={() => openProfile(selectedId)}
                      className="mt-3 w-full rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-2 text-xs font-semibold text-emerald-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Voir profil complet →
                    </motion.button>
                  </motion.div>

                  <div className="space-y-4 lg:col-span-6">
                    <WhoopAICoach player={player} />
                    <div className="rounded-2xl border border-white/8 bg-slate-900/50 p-4 backdrop-blur-xl">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Timeline · Aujourd&apos;hui</p>
                      <div className="mt-3">
                        <WhoopTimeline events={player.timeline} />
                      </div>
                    </div>
                    <WhoopTeamOverview squad={squad} compareIds={["2", "1", "3"]} />
                  </div>

                  <motion.div
                    className="lg:col-span-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <WhoopRightRail player={player} />
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </AnalystePageTransition>
    </>
  );
}
