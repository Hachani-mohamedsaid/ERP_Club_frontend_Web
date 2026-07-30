import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, RefreshCw, Bell, Activity, Radio } from "lucide-react";
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

function formatAgo(iso: string | null | undefined) {
  if (!iso) return "—";
  const sec = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (sec < 60) return `il y a ${sec}s`;
  if (sec < 3600) return `il y a ${Math.floor(sec / 60)} min`;
  if (sec < 86400) return `il y a ${Math.floor(sec / 3600)} h`;
  return new Date(iso).toLocaleString("fr-FR");
}

export function AnalysteWhoopPage() {
  const { data, loading, reload } = useAnalysteWhoop(8000);
  const [selectedId, setSelectedId] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    if (!data?.squad?.length) return;
    setSelectedId((prev) => {
      if (prev && data.squad.some((p) => p.id === prev)) return prev;
      return data.defaultPlayerId || data.squad[0].id;
    });
  }, [data]);

  const squad = data?.squad ?? [];
  const summary = data?.mobileSummary;
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

  const handleSync = async () => {
    setSyncing(true);
    await reload({ silent: true });
    setSyncing(false);
  };

  const mobileCount = summary?.playersWithViiv ?? squad.filter((p) => p.fromMobile).length;
  const totalReadings = summary?.totalReadings ?? 0;

  return (
    <>
      <WhoopPremiumBg />
      <AnalystePageTransition>
        <div className="relative mx-auto max-w-[1600px] space-y-5 pb-8">
          <motion.div
            className="flex flex-wrap items-center justify-between gap-4"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">VIIV</span>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                  LIVE
                </span>
              </div>
              <h1 className="mt-1 bg-gradient-to-r from-white via-cyan-100 to-slate-400 bg-clip-text text-2xl font-bold text-transparent lg:text-3xl">
                Smartwatch Hub
              </h1>
              <p className="text-xs text-slate-500">
                Données Viiv mobile · Nom joueur · SpO₂ · FC · Sommeil · Refresh auto 8s
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Rechercher joueur..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-44 rounded-xl border border-white/8 bg-slate-900/60 py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-600 backdrop-blur-md focus:border-cyan-500/40 focus:outline-none"
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
                          <p className="text-[9px] text-slate-500">
                            {a.player} · {a.time}
                          </p>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.button
                type="button"
                onClick={() => void handleSync()}
                disabled={syncing}
                className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-300"
                whileTap={{ scale: 0.97 }}
              >
                <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
                {syncing ? "Sync..." : "Sync équipe"}
              </motion.button>
            </div>
          </motion.div>

          {/* Résumé données mobile */}
          <motion.div
            className="grid gap-3 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 via-slate-900/60 to-emerald-500/10 p-4 sm:grid-cols-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Joueurs Viiv</p>
              <p className="mt-1 text-2xl font-bold text-white">{mobileCount}</p>
              <p className="text-[10px] text-slate-500">avec snapshot mobile</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Enregistrements</p>
              <p className="mt-1 text-2xl font-bold text-cyan-300">{totalReadings}</p>
              <p className="text-[10px] text-slate-500">lectures sauvées depuis mobile</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Dernier joueur</p>
              <p className="mt-1 truncate text-lg font-semibold text-emerald-300">
                {summary?.lastPlayerName ?? player.name}
              </p>
              <p className="text-[10px] text-slate-500">{formatAgo(summary?.lastSyncAt)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Radio size={16} className="text-emerald-400" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Temps réel</p>
                <p className="text-sm font-medium text-white">Polling 8s actif</p>
                <p className="text-[10px] text-slate-500">nom + métriques live</p>
              </div>
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

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  <WhoopGlassMetric
                    label="Recovery"
                    value={player.recovery}
                    suffix="%"
                    delta={`${player.recoveryDelta >= 0 ? "+" : ""}${player.recoveryDelta}%`}
                    progress={player.recovery}
                  />
                  <WhoopGlassMetric
                    label="Énergie Viiv"
                    value={player.viivEnergy}
                    suffix="%"
                    progress={player.viivEnergy}
                    color="#22d3ee"
                  />
                  <WhoopGlassMetric label="SpO₂" value={player.spo2} suffix="%" color="#34d399" />
                  <WhoopGlassMetric label="FC repos" value={player.restingHr} suffix=" bpm" color="#f97316" />
                  <WhoopGlassMetric
                    label="Sleep"
                    value={player.sleepHours}
                    suffix="h"
                    progress={player.sleepPerformance}
                    color="#818cf8"
                    delay={0.05}
                  />
                  <WhoopGlassMetric label="Stress" value={player.stress} suffix="" color="#fb7185" delay={0.08} />
                </div>

                <div className="grid gap-5 lg:grid-cols-12">
                  <motion.div
                    className="lg:col-span-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Effectif · Viiv
                    </p>
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
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Timeline · Aujourd&apos;hui
                      </p>
                      <div className="mt-3">
                        <WhoopTimeline events={player.timeline} />
                      </div>
                    </div>

                    {/* Flux realtime mobile */}
                    <div className="rounded-2xl border border-cyan-500/15 bg-slate-900/50 p-4 backdrop-blur-xl">
                      <div className="flex items-center gap-2">
                        <Activity size={14} className="text-cyan-400" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          Flux mobile realtime
                        </p>
                      </div>
                      <div className="mt-3 max-h-56 space-y-2 overflow-y-auto">
                        {(summary?.recent?.length ? summary.recent : []).map((r) => (
                          <div
                            key={r.id}
                            className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-black/20 px-3 py-2"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">{r.playerName}</p>
                              <p className="text-[10px] text-slate-500">
                                {r.source} · {formatAgo(r.recordedAt)}
                              </p>
                            </div>
                            <div className="shrink-0 text-right text-[10px] tabular-nums text-slate-300">
                              <p>
                                FC {r.restingHr ?? "—"} · SpO₂ {r.spo2 ?? "—"}%
                              </p>
                              <p>
                                Stress {r.stress ?? "—"} · Énergie {r.viivEnergy ?? "—"}%
                              </p>
                            </div>
                          </div>
                        ))}
                        {!summary?.recent?.length && (
                          <p className="text-xs text-slate-500">
                            Aucune lecture mobile pour l&apos;instant. Sync Viiv depuis l&apos;app joueur pour
                            alimenter ce flux.
                          </p>
                        )}
                      </div>
                    </div>

                    <WhoopTeamOverview squad={squad} compareIds={squad.slice(0, 3).map((p) => p.id)} />
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
