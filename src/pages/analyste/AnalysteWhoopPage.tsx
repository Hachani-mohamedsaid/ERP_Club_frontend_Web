import { useState, useMemo, useEffect, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  Heart,
  Moon,
  Wind,
  Activity,
  Brain,
  Zap,
  Watch,
} from "lucide-react";
import { AnalystePageTransition } from "../../components/analyste/AnalystePageTransition";
import { AnalystePageLoader } from "../../components/analyste/AnalystePageLoader";
import {
  WhoopPremiumBg,
  WhoopPlayerProfile,
  ViivActivityRings,
  ViivMetricTile,
} from "../../components/analyste/whoop";
import { METRIC_COLORS, VIIV_THEME, recoveryColor } from "../../components/analyste/whoop/whoopTheme";
import { useAnalysteWhoop } from "../../hooks/useAnalysteResource";

function formatAgo(iso: string | null | undefined) {
  if (!iso) return "—";
  const sec = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (sec < 60) return `il y a ${sec}s`;
  if (sec < 3600) return `il y a ${Math.floor(sec / 60)} min`;
  if (sec < 86400) return `il y a ${Math.floor(sec / 3600)} h`;
  return new Date(iso).toLocaleString("fr-FR");
}

function parseDistanceKm(gps?: string) {
  if (!gps) return 0;
  const m = gps.match(/([\d.]+)\s*km/i);
  return m ? Number(m[1]) : 0;
}

export function AnalysteWhoopPage() {
  const { data, loading, reload } = useAnalysteWhoop(8000);
  const [selectedId, setSelectedId] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [tab, setTab] = useState<"accueil" | "flux">("accueil");

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

  const recentForPlayer = useMemo(() => {
    const all = summary?.recent ?? [];
    if (!player) return all;
    const mine = all.filter((r) => r.playerName === player.name);
    return mine.length ? mine : all;
  }, [summary, player]);

  if (loading && !data) return <AnalystePageLoader />;
  if (!player) return <AnalystePageLoader />;

  const handleSync = async () => {
    setSyncing(true);
    await reload({ silent: true });
    setSyncing(false);
  };

  const hr = player.restingHr;
  const distKm = parseDistanceKm(player.gpsActivity);
  const rc = recoveryColor(player.recovery);

  const glassCard: CSSProperties = {
    borderRadius: VIIV_THEME.radiusCard,
    background: `linear-gradient(145deg, ${VIIV_THEME.glass}, rgba(22,22,42,0.92))`,
    border: `1px solid ${VIIV_THEME.glassBorder}`,
    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
    backdropFilter: `blur(${VIIV_THEME.blur}px)`,
  };

  return (
    <>
      <WhoopPremiumBg />
      <AnalystePageTransition>
        <div className="relative mx-auto max-w-[720px] space-y-4 px-1 pb-10">
          {/* Header — mobile _QWatchHeader */}
          <motion.div
            className="flex items-start justify-between gap-3 pt-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <div className="flex items-center gap-2">
                <h1
                  className="text-[22px] font-black leading-none text-white"
                  style={{ letterSpacing: "-0.5px" }}
                >
                  Viiv
                </h1>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-black"
                  style={{ background: "rgba(34,197,94,0.2)", color: VIIV_THEME.green }}
                >
                  LIVE
                </span>
              </div>
              <p className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                {player.deviceId || "Viiv GX17"} · {player.battery}% · {hr > 0 ? `${hr} bpm` : "— bpm"}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold" style={{ color: VIIV_THEME.cyan }}>
                {player.name}
                {player.fromMobile ? " · Mobile" : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleSync()}
              disabled={syncing}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border transition"
              style={{
                borderColor: "rgba(34,211,238,0.35)",
                background: "rgba(34,211,238,0.08)",
                color: VIIV_THEME.cyan,
              }}
              aria-label="Synchroniser"
            >
              <RefreshCw size={18} className={syncing ? "animate-spin" : ""} />
            </button>
          </motion.div>

          {/* Player chips — multi-joueur web */}
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {squad.map((p) => {
              const sel = p.id === player.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(p.id);
                    setProfileOpen(false);
                  }}
                  className="flex shrink-0 items-center gap-2 rounded-full border px-2.5 py-1.5 text-left transition"
                  style={{
                    borderColor: sel ? "rgba(34,211,238,0.55)" : VIIV_THEME.glassBorder,
                    background: sel ? "rgba(34,211,238,0.12)" : "rgba(22,22,42,0.55)",
                  }}
                >
                  <img src={p.photo} alt="" className="h-7 w-7 rounded-full object-cover" />
                  <span className="max-w-[110px] truncate text-xs font-semibold text-white">{p.name}</span>
                </button>
              );
            })}
          </div>

          {/* Tabs Accueil / Flux — like mobile tabs, slim */}
          <div className="flex gap-1 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            {(
              [
                ["accueil", "Accueil"],
                ["flux", "Flux mobile"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className="relative px-4 py-2.5 text-sm font-semibold transition"
                style={{ color: tab === id ? VIIV_THEME.cyan : "rgba(255,255,255,0.45)" }}
              >
                {label}
                {tab === id && (
                  <motion.span
                    layoutId="viiv-tab"
                    className="absolute inset-x-2 -bottom-px h-0.5 rounded-full"
                    style={{ background: VIIV_THEME.cyan }}
                  />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {profileOpen ? (
              <WhoopPlayerProfile
                key="profile"
                player={player}
                onBack={() => setProfileOpen(false)}
              />
            ) : tab === "flux" ? (
              <motion.div
                key="flux"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="grid grid-cols-2 gap-2.5">
                  <div style={glassCard} className="p-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: VIIV_THEME.muted }}>
                      Joueurs Viiv
                    </p>
                    <p className="mt-1 text-2xl font-black text-white">
                      {summary?.playersWithViiv ?? squad.filter((p) => p.fromMobile).length}
                    </p>
                  </div>
                  <div style={glassCard} className="p-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: VIIV_THEME.muted }}>
                      Enregistrements
                    </p>
                    <p className="mt-1 text-2xl font-black" style={{ color: VIIV_THEME.cyan }}>
                      {summary?.totalReadings ?? 0}
                    </p>
                  </div>
                </div>
                <div style={glassCard} className="p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: VIIV_THEME.muted }}>
                    Lectures realtime
                  </p>
                  <div className="mt-3 max-h-[420px] space-y-2 overflow-y-auto">
                    {(summary?.recent ?? []).map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border px-3 py-2.5"
                        style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.22)" }}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">{r.playerName}</p>
                          <p className="text-[10px]" style={{ color: VIIV_THEME.muted }}>
                            {r.source} · {formatAgo(r.recordedAt)}
                          </p>
                        </div>
                        <div className="shrink-0 text-right text-[10px] tabular-nums" style={{ color: VIIV_THEME.textSecondary }}>
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
                      <p className="text-xs" style={{ color: VIIV_THEME.muted }}>
                        Aucune lecture mobile. Sync Viiv depuis l&apos;app joueur.
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="accueil"
                className="space-y-4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {/* Activité du jour — rings hero */}
                <motion.div
                  style={glassCard}
                  className="p-5"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <p className="text-center text-base font-extrabold text-white">Activité du jour</p>
                  <p className="mt-1 text-center text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Sync {player.lastSync || formatAgo(player.lastSyncAt)}
                  </p>
                  <div className="mt-4">
                    <ViivActivityRings
                      steps={player.steps}
                      calories={player.calories}
                      distanceKm={distKm}
                      centerHr={hr}
                    />
                  </div>
                </motion.div>

                {/* Metric grid 2×3 — mobile Accueil */}
                <div className="grid grid-cols-2 gap-2.5">
                  <ViivMetricTile
                    icon={Heart}
                    color={METRIC_COLORS.fc}
                    label="FC"
                    value={hr > 0 ? hr : "—"}
                    unit="bpm"
                    live={player.connected}
                    delay={0.02}
                  />
                  <ViivMetricTile
                    icon={Moon}
                    color={METRIC_COLORS.sleep}
                    label="Sommeil"
                    value={player.sleepHours > 0 ? player.sleepHours.toFixed(1) : "—"}
                    unit="h"
                    delay={0.05}
                  />
                  <ViivMetricTile
                    icon={Wind}
                    color={METRIC_COLORS.spo2}
                    label="SpO₂"
                    value={player.spo2 > 0 ? player.spo2 : "—"}
                    unit="%"
                    delay={0.08}
                  />
                  <ViivMetricTile
                    icon={Activity}
                    color={METRIC_COLORS.hrv}
                    label="HRV"
                    value={player.hrv > 0 ? player.hrv : "—"}
                    unit="ms"
                    delay={0.11}
                  />
                  <ViivMetricTile
                    icon={Brain}
                    color={METRIC_COLORS.stress}
                    label="Stress"
                    value={player.stress > 0 ? player.stress : "—"}
                    delay={0.14}
                  />
                  <ViivMetricTile
                    icon={Zap}
                    color={METRIC_COLORS.energy}
                    label="Énergie"
                    value={player.viivEnergy > 0 ? player.viivEnergy : "—"}
                    unit="%"
                    delay={0.17}
                  />
                </div>

                {/* Recovery + strain */}
                {player.recovery > 0 && (
                  <div style={glassCard} className="flex items-center gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-white">Recovery</p>
                      <p className="text-xs" style={{ color: VIIV_THEME.muted }}>
                        <span style={{ color: rc }}>{player.recovery}%</span> · {player.readiness}
                      </p>
                    </div>
                    <p className="text-[28px] font-black tabular-nums" style={{ color: VIIV_THEME.orange }}>
                      {player.strain.toFixed(1)}
                    </p>
                    <span className="text-[11px]" style={{ color: VIIV_THEME.muted }}>
                      strain
                    </span>
                  </div>
                )}

                {/* Mini flux for selected player */}
                {recentForPlayer.length > 0 && (
                  <div style={glassCard} className="p-4">
                    <div className="flex items-center gap-2">
                      <Watch size={14} style={{ color: VIIV_THEME.cyan }} />
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: VIIV_THEME.muted }}>
                        Dernières lectures · {player.name}
                      </p>
                    </div>
                    <div className="mt-3 space-y-2">
                      {recentForPlayer.slice(0, 4).map((r) => (
                        <div
                          key={r.id}
                          className="flex justify-between gap-2 text-[11px]"
                          style={{ color: VIIV_THEME.textSecondary }}
                        >
                          <span style={{ color: VIIV_THEME.muted }}>{formatAgo(r.recordedAt)}</span>
                          <span className="tabular-nums">
                            FC {r.restingHr ?? "—"} · SpO₂ {r.spo2 ?? "—"}% · Énergie {r.viivEnergy ?? "—"}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setProfileOpen(true)}
                  className="w-full py-3 text-sm font-bold transition"
                  style={{
                    borderRadius: VIIV_THEME.radiusBtn,
                    background: VIIV_THEME.cyan,
                    color: VIIV_THEME.bg,
                  }}
                >
                  Voir profil complet
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </AnalystePageTransition>
    </>
  );
}
