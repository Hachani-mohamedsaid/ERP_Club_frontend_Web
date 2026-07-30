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
  Battery,
  Wifi,
  WifiOff,
  Bluetooth,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AnalystePageTransition } from "../../components/analyste/AnalystePageTransition";
import { AnalystePageLoader } from "../../components/analyste/AnalystePageLoader";
import {
  WhoopPremiumBg,
  WhoopPlayerProfile,
  ViivActivityRings,
  ViivMetricTile,
} from "../../components/analyste/whoop";
import { METRIC_COLORS, VIIV_THEME, recoveryColor } from "../../components/analyste/whoop/whoopTheme";
import type { WhoopPlayerMetrics } from "../../data/whoopData";
import { useAnalysteWhoop } from "../../hooks/useAnalysteResource";

type ViivTab = "accueil" | "sommeil" | "coeur" | "appareil" | "flux";

const TABS: { id: ViivTab; label: string }[] = [
  { id: "accueil", label: "Accueil" },
  { id: "sommeil", label: "Sommeil" },
  { id: "coeur", label: "Cœur" },
  { id: "appareil", label: "Appareil" },
  { id: "flux", label: "Flux" },
];

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

function formatSleepDuration(hours: number) {
  if (hours <= 0) return null;
  const h = Math.floor(hours);
  const min = Math.round((hours % 1) * 60);
  return `${h} h ${min} min`;
}

const glassCard: CSSProperties = {
  borderRadius: VIIV_THEME.radiusCard,
  background: `linear-gradient(145deg, ${VIIV_THEME.glass}, rgba(22,22,42,0.92))`,
  border: `1px solid ${VIIV_THEME.glassBorder}`,
  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  backdropFilter: `blur(${VIIV_THEME.blur}px)`,
};

function StageRow({ label, hours, color }: { label: string; hours: number; color: string }) {
  return (
    <div className="mb-2.5 flex items-center gap-2.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      <span className="flex-1 text-sm font-semibold text-white">{label}</span>
      <span className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
        {hours > 0 ? `${hours.toFixed(1)} h` : "—"}
      </span>
    </div>
  );
}

function AccueilTab({
  player,
  hr,
  distKm,
  recent,
  onOpenProfile,
}: {
  player: WhoopPlayerMetrics;
  hr: number;
  distKm: number;
  recent: { id: string; recordedAt: string; restingHr: number | null; spo2: number | null; viivEnergy: number | null }[];
  onOpenProfile: () => void;
}) {
  const rc = recoveryColor(player.recovery);
  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-12">
        <motion.div
          style={glassCard}
          className="p-5 xl:col-span-5"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p className="text-center text-base font-extrabold text-white">Activité du jour</p>
          <p className="mt-1 text-center text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
            Sync {player.lastSync || formatAgo(player.lastSyncAt)}
          </p>
          <div className="mt-4 flex justify-center">
            <ViivActivityRings
              steps={player.steps}
              calories={player.calories}
              distanceKm={distKm}
              centerHr={hr}
            />
          </div>
        </motion.div>

        <div className="xl:col-span-7">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            <ViivMetricTile icon={Heart} color={METRIC_COLORS.fc} label="FC" value={hr > 0 ? hr : "—"} unit="bpm" live={player.connected} delay={0.02} />
            <ViivMetricTile icon={Moon} color={METRIC_COLORS.sleep} label="Sommeil" value={player.sleepHours > 0 ? player.sleepHours.toFixed(1) : "—"} unit="h" delay={0.05} />
            <ViivMetricTile icon={Wind} color={METRIC_COLORS.spo2} label="SpO₂" value={player.spo2 > 0 ? player.spo2 : "—"} unit="%" delay={0.08} />
            <ViivMetricTile icon={Activity} color={METRIC_COLORS.hrv} label="HRV" value={player.hrv > 0 ? player.hrv : "—"} unit="ms" delay={0.11} />
            <ViivMetricTile icon={Brain} color={METRIC_COLORS.stress} label="Stress" value={player.stress > 0 ? player.stress : "—"} delay={0.14} />
            <ViivMetricTile icon={Zap} color={METRIC_COLORS.energy} label="Énergie" value={player.viivEnergy > 0 ? player.viivEnergy : "—"} unit="%" delay={0.17} />
          </div>

          {player.recovery > 0 && (
            <div style={glassCard} className="mt-2.5 flex items-center gap-3 p-4">
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
        </div>
      </div>

      {recent.length > 0 && (
        <div style={glassCard} className="p-4">
          <div className="flex items-center gap-2">
            <Watch size={14} style={{ color: VIIV_THEME.cyan }} />
            <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: VIIV_THEME.muted }}>
              Dernières lectures · {player.name}
            </p>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {recent.slice(0, 4).map((r) => (
              <div
                key={r.id}
                className="rounded-xl border px-3 py-2 text-[11px]"
                style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.22)", color: VIIV_THEME.textSecondary }}
              >
                <p style={{ color: VIIV_THEME.muted }}>{formatAgo(r.recordedAt)}</p>
                <p className="mt-1 tabular-nums">
                  FC {r.restingHr ?? "—"} · SpO₂ {r.spo2 ?? "—"}% · Énergie {r.viivEnergy ?? "—"}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onOpenProfile}
        className="w-full py-3 text-sm font-bold transition sm:max-w-xs"
        style={{
          borderRadius: VIIV_THEME.radiusBtn,
          background: VIIV_THEME.cyan,
          color: VIIV_THEME.bg,
        }}
      >
        Voir profil complet
      </button>
    </div>
  );
}

function SommeilTab({ player }: { player: WhoopPlayerMetrics }) {
  const s = player.sleepStages;
  const total = (s?.awake ?? 0) + (s?.light ?? 0) + (s?.sws ?? 0) + (s?.rem ?? 0);
  const hasSleep = player.sleepHours > 0 || total > 0;
  const duration = formatSleepDuration(player.sleepHours);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div style={glassCard} className="p-5">
        <p className="text-lg font-black text-white">Sommeil</p>
        {hasSleep && duration ? (
          <>
            <p className="mt-2 text-[32px] font-black leading-none text-white">{duration}</p>
            <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
              Performance {player.sleepPerformance}% · besoin {player.sleepNeed.toFixed(0)} h
            </p>
          </>
        ) : (
          <p className="mt-3 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.54)" }}>
            Aucune donnée sommeil.
            <br />
            Portez la montre toute la nuit, puis Sync depuis le mobile.
          </p>
        )}
      </div>

      {hasSleep && total > 0 && (
        <div style={glassCard} className="p-5">
          <p className="font-extrabold text-white">Stades</p>
          <div className="mt-3.5 flex h-[18px] overflow-hidden rounded-[9px]">
            {s.awake > 0 && (
              <div style={{ flex: Math.max(1, Math.round(s.awake * 100)), background: "#64748B" }} />
            )}
            {s.light > 0 && (
              <div style={{ flex: Math.max(1, Math.round(s.light * 100)), background: "#818CF8" }} />
            )}
            {s.sws > 0 && (
              <div style={{ flex: Math.max(1, Math.round(s.sws * 100)), background: "#4F46E5" }} />
            )}
            {s.rem > 0 && (
              <div style={{ flex: Math.max(1, Math.round(s.rem * 100)), background: "#22D3EE" }} />
            )}
          </div>
          <div className="mt-3.5">
            <StageRow label="Éveil" hours={s.awake} color="#64748B" />
            <StageRow label="Léger" hours={s.light} color="#818CF8" />
            <StageRow label="Profond" hours={s.sws} color="#4F46E5" />
            <StageRow label="REM" hours={s.rem} color="#22D3EE" />
          </div>
        </div>
      )}
    </div>
  );
}

function CoeurTab({ player, hr }: { player: WhoopPlayerMetrics; hr: number }) {
  const chartData = player.hourlyHr ?? [];

  return (
    <div className="space-y-4">
      <div style={glassCard} className="p-6 text-center">
        <motion.p
          className="text-[56px] font-black leading-none tabular-nums"
          style={{ color: VIIV_THEME.hr }}
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 0.7, repeat: Infinity, repeatType: "reverse" }}
        >
          {hr > 0 ? hr : "—"}
        </motion.p>
        <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
          bpm · {player.connected ? "live / sync mobile" : "dernière sync"}
        </p>
        <div className="mt-4 flex justify-evenly">
          {[
            { k: "HRV", v: player.hrv > 0 ? `${player.hrv} ms` : "—" },
            { k: "SpO₂", v: player.spo2 > 0 ? `${player.spo2}%` : "—" },
            { k: "Stress", v: player.stress > 0 ? `${player.stress}` : "—" },
          ].map((m) => (
            <div key={m.k}>
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                {m.k}
              </p>
              <p className="mt-1 font-extrabold text-white">{m.v}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 flex items-center gap-2 text-sm font-extrabold" style={{ color: VIIV_THEME.hr }}>
          <span className="inline-block h-1 w-4 rounded-full" style={{ background: VIIV_THEME.hr }} />
          Courbe FC
        </p>
        <div style={glassCard} className="p-4">
          {chartData.length === 0 ? (
            <p className="py-10 text-center text-xs" style={{ color: VIIV_THEME.muted }}>
              Aucune courbe — Sync avec la montre au poignet
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="hrFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="hour" tick={{ fill: "#A8ABB8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[40, 180]} tick={{ fill: "#A8ABB8", fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip
                  contentStyle={{
                    background: "#16162A",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="bpm" stroke="#EF4444" strokeWidth={2.5} fill="url(#hrFill)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {(player.zones?.length ?? 0) > 0 && (
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-extrabold" style={{ color: VIIV_THEME.hr }}>
            <span className="inline-block h-1 w-4 rounded-full" style={{ background: VIIV_THEME.hr }} />
            Zones FC
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {player.zones.map((z) => (
              <div key={z.zone} style={glassCard} className="flex items-center gap-2.5 px-3.5 py-2.5">
                <span className="h-2 w-2 rounded-full" style={{ background: z.color }} />
                <span className="flex-1 text-sm font-semibold text-white">{z.zone}</span>
                <span className="text-sm" style={{ color: VIIV_THEME.muted }}>
                  {z.minutes} min
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AppareilTab({
  player,
  hr,
  onSync,
  syncing,
}: {
  player: WhoopPlayerMetrics;
  hr: number;
  onSync: () => void;
  syncing: boolean;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div style={glassCard} className="p-5">
        <div className="flex items-center gap-3">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(34,211,238,0.35), rgba(34,211,238,0.05))",
              border: "2px solid rgba(34,211,238,0.45)",
            }}
          >
            <Watch size={28} style={{ color: VIIV_THEME.cyan }} />
          </span>
          <div>
            <p className="text-lg font-black text-white">Viiv Smartwatch</p>
            <p className="text-xs" style={{ color: VIIV_THEME.muted }}>
              Compatible QWatch Pro · H59 · Viiv GX17
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3 text-sm">
          {[
            ["Joueur", player.name],
            ["ID appareil", player.deviceId || "—"],
            ["Firmware", player.firmware || "—"],
            ["Athlete ID", player.athleteId || "—"],
            ["GPS", player.gpsActivity || "—"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 border-b border-white/5 pb-2">
              <span style={{ color: VIIV_THEME.muted }}>{k}</span>
              <span className="max-w-[60%] truncate text-right font-semibold text-white">{v}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-xs" style={{ color: VIIV_THEME.textSecondary }}>
          <span className="inline-flex items-center gap-1.5">
            <Battery size={14} /> {player.battery}%
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Heart size={14} style={{ color: VIIV_THEME.hr }} /> {hr > 0 ? `${hr} bpm` : "—"}
          </span>
          {player.connected ? (
            <span className="inline-flex items-center gap-1.5" style={{ color: VIIV_THEME.green }}>
              <Wifi size={14} /> Connectée
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-red-400">
              <WifiOff size={14} /> Déconnectée (dernier sync mobile)
            </span>
          )}
          <span className="inline-flex items-center gap-1.5" style={{ color: VIIV_THEME.cyan }}>
            <Bluetooth size={14} /> Sync {player.lastSync || formatAgo(player.lastSyncAt)}
          </span>
        </div>

        <button
          type="button"
          onClick={onSync}
          disabled={syncing}
          className="mt-5 flex w-full items-center justify-center gap-2 py-3 text-sm font-bold"
          style={{
            borderRadius: VIIV_THEME.radiusBtn,
            background: VIIV_THEME.cyan,
            color: VIIV_THEME.bg,
          }}
        >
          <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
          {syncing ? "Sync…" : "Actualiser depuis le serveur"}
        </button>
      </div>

      <div className="space-y-3">
        <p className="flex items-center gap-2 text-sm font-extrabold" style={{ color: VIIV_THEME.cyan }}>
          <span className="inline-block h-1 w-4 rounded-full" style={{ background: VIIV_THEME.cyan }} />
          Journal sync
        </p>
        {(player.syncLog?.length ? player.syncLog : []).map((e, i) => (
          <div key={`${e.time}-${i}`} style={glassCard} className="flex items-center gap-2.5 p-3">
            {e.status === "ok" ? (
              <CheckCircle2 size={18} style={{ color: VIIV_THEME.green }} />
            ) : (
              <AlertTriangle size={18} style={{ color: VIIV_THEME.stress }} />
            )}
            <span className="flex-1 text-sm font-semibold text-white">{e.type}</span>
            <span className="text-[11px]" style={{ color: VIIV_THEME.muted }}>
              {e.time}
            </span>
          </div>
        ))}
        {!player.syncLog?.length && (
          <div style={glassCard} className="p-4 text-sm" >
            <p style={{ color: VIIV_THEME.muted }}>Aucun journal sync pour ce joueur.</p>
          </div>
        )}

        {(player.readingsCount ?? 0) > 0 && (
          <div style={glassCard} className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: VIIV_THEME.muted }}>
              Historique mobile
            </p>
            <p className="mt-1 text-2xl font-black" style={{ color: VIIV_THEME.cyan }}>
              {player.readingsCount} lectures
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function AnalysteWhoopPage() {
  const { data, loading, reload } = useAnalysteWhoop(8000);
  const [selectedId, setSelectedId] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [tab, setTab] = useState<ViivTab>("accueil");

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

  return (
    <>
      <WhoopPremiumBg />
      <AnalystePageTransition>
        <div className="relative mx-auto w-full max-w-[1600px] space-y-4 px-2 pb-10 sm:px-4 lg:px-6">
          <motion.div
            className="flex flex-wrap items-start justify-between gap-3 pt-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[22px] font-black leading-none text-white" style={{ letterSpacing: "-0.5px" }}>
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
                  <span className="max-w-[140px] truncate text-xs font-semibold text-white">{p.name}</span>
                </button>
              );
            })}
          </div>

          {/* Tabs like mobile: Accueil | Sommeil | Cœur | Appareil */}
          <div className="flex gap-0.5 overflow-x-auto border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setTab(id);
                  setProfileOpen(false);
                }}
                className="relative shrink-0 px-4 py-2.5 text-sm font-semibold transition"
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
              <WhoopPlayerProfile key="profile" player={player} onBack={() => setProfileOpen(false)} />
            ) : (
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {tab === "accueil" && (
                  <AccueilTab
                    player={player}
                    hr={hr}
                    distKm={distKm}
                    recent={recentForPlayer}
                    onOpenProfile={() => setProfileOpen(true)}
                  />
                )}
                {tab === "sommeil" && <SommeilTab player={player} />}
                {tab === "coeur" && <CoeurTab player={player} hr={hr} />}
                {tab === "appareil" && (
                  <AppareilTab player={player} hr={hr} onSync={() => void handleSync()} syncing={syncing} />
                )}
                {tab === "flux" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
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
                      <div style={glassCard} className="p-3.5 lg:col-span-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: VIIV_THEME.muted }}>
                          Dernier joueur
                        </p>
                        <p className="mt-1 truncate text-lg font-semibold" style={{ color: VIIV_THEME.green }}>
                          {summary?.lastPlayerName ?? player.name}
                        </p>
                        <p className="text-[10px]" style={{ color: VIIV_THEME.muted }}>
                          {formatAgo(summary?.lastSyncAt)}
                        </p>
                      </div>
                    </div>
                    <div style={glassCard} className="p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: VIIV_THEME.muted }}>
                        Lectures realtime
                      </p>
                      <div className="mt-3 grid max-h-[480px] gap-2 overflow-y-auto sm:grid-cols-2">
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
                            <div
                              className="shrink-0 text-right text-[10px] tabular-nums"
                              style={{ color: VIIV_THEME.textSecondary }}
                            >
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
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </AnalystePageTransition>
    </>
  );
}
