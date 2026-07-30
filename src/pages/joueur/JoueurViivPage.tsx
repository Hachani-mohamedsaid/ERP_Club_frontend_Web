import { useState, type CSSProperties } from "react";
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
import { JoueurPageTransition } from "../../components/player/JoueurPageTransition";
import { AnalystePageLoader } from "../../components/analyste/AnalystePageLoader";
import {
  WhoopPremiumBg,
  ViivActivityRings,
  ViivMetricTile,
  ViivAiPredictionsCard,
} from "../../components/analyste/whoop";
import { METRIC_COLORS, VIIV_THEME, recoveryColor } from "../../components/analyste/whoop/whoopTheme";
import type { WhoopPlayerMetrics } from "../../data/whoopData";
import { useJoueurViiv } from "../../hooks/useJoueurViiv";

type ViivTab = "accueil" | "sommeil" | "coeur" | "appareil" | "ia";

const TABS: { id: ViivTab; label: string }[] = [
  { id: "accueil", label: "Accueil" },
  { id: "sommeil", label: "Sommeil" },
  { id: "coeur", label: "Cœur" },
  { id: "appareil", label: "Appareil" },
  { id: "ia", label: "Prédictions IA" },
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

function EmptyGate({ name, onSync, syncing }: { name: string; onSync: () => void; syncing: boolean }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <motion.div
        className="flex h-[120px] w-[120px] items-center justify-center rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(34,211,238,0.35), rgba(34,211,238,0.05), transparent)",
          border: "2px solid rgba(34,211,238,0.5)",
        }}
        animate={{ scale: [0.96, 1.04, 0.96] }}
        transition={{ duration: 1.4, repeat: Infinity }}
      >
        <Watch size={56} style={{ color: VIIV_THEME.cyan }} />
      </motion.div>
      <h2 className="mt-7 text-4xl font-black text-white" style={{ letterSpacing: "-1px" }}>
        Viiv
      </h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
        Bonjour {name}. Synchronisez votre montre depuis l&apos;app mobile pour voir sommeil, FC, pas, SpO₂ —
        en live ici.
      </p>
      <span
        className="mt-3 rounded-full px-3 py-1.5 text-[11px] font-bold"
        style={{ background: "rgba(255,255,255,0.06)", color: VIIV_THEME.cyan }}
      >
        Compatible QWatch Pro · H59 · Viiv GX17
      </span>
      <button
        type="button"
        onClick={onSync}
        disabled={syncing}
        className="mt-8 flex items-center gap-2 px-6 py-3.5 text-sm font-bold"
        style={{
          borderRadius: VIIV_THEME.radiusBtn,
          background: VIIV_THEME.cyan,
          color: VIIV_THEME.bg,
          minWidth: 220,
        }}
      >
        <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
        {syncing ? "Recherche…" : "Actualiser mes données"}
      </button>
      <p className="mt-4 text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>
        Les interfaces santé s&apos;affichent dès qu&apos;une sync mobile est enregistrée.
      </p>
    </div>
  );
}

export function JoueurViivPage() {
  const { metrics, history, hasData, loading, error, reload, playerName } = useJoueurViiv(8000);
  const [tab, setTab] = useState<ViivTab>("accueil");
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    await reload({ silent: true });
    setSyncing(false);
  };

  if (loading && !metrics) {
    return (
      <>
        <WhoopPremiumBg />
        <AnalystePageLoader />
      </>
    );
  }

  const player = metrics;
  const hr = player?.restingHr ?? 0;
  const distKm = parseDistanceKm(player?.gpsActivity);
  const recent = history?.readings ?? [];
  const rc = recoveryColor(player?.recovery ?? 0);

  return (
    <>
      <WhoopPremiumBg />
      <JoueurPageTransition>
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
                {player?.deviceId || "Viiv GX17"} · {player?.battery ?? 0}% · {hr > 0 ? `${hr} bpm` : "— bpm"}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold" style={{ color: VIIV_THEME.cyan }}>
                {playerName} · Mon espace
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

          {error && (
            <div style={glassCard} className="p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {!hasData || !player ? (
            <EmptyGate name={playerName} onSync={() => void handleSync()} syncing={syncing} />
          ) : (
            <>
              <div className="flex gap-0.5 overflow-x-auto border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                {TABS.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className="relative shrink-0 px-4 py-2.5 text-sm font-semibold transition"
                    style={{ color: tab === id ? VIIV_THEME.cyan : "rgba(255,255,255,0.45)" }}
                  >
                    {label}
                    {tab === id && (
                      <motion.span
                        layoutId="joueur-viiv-tab"
                        className="absolute inset-x-2 -bottom-px h-0.5 rounded-full"
                        style={{ background: VIIV_THEME.cyan }}
                      />
                    )}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {tab === "accueil" && (
                    <Accueil player={player} hr={hr} distKm={distKm} recent={recent} rc={rc} />
                  )}
                  {tab === "sommeil" && <Sommeil player={player} />}
                  {tab === "coeur" && <Coeur player={player} hr={hr} />}
                  {tab === "appareil" && (
                    <Appareil player={player} hr={hr} onSync={() => void handleSync()} syncing={syncing} />
                  )}
                  {tab === "ia" && <ViivAiPredictionsCard player={player} />}
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </div>
      </JoueurPageTransition>
    </>
  );
}

function Accueil({
  player,
  hr,
  distKm,
  recent,
  rc,
}: {
  player: WhoopPlayerMetrics;
  hr: number;
  distKm: number;
  recent: { id: string; recordedAt: string; restingHr: number | null; spo2: number | null; viivEnergy: number | null }[];
  rc: string;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-12">
        <motion.div style={glassCard} className="p-5 xl:col-span-5" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
          <p className="text-center text-base font-extrabold text-white">Activité du jour</p>
          <p className="mt-1 text-center text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
            Sync {player.lastSync || formatAgo(player.lastSyncAt)}
          </p>
          <div className="mt-4 flex justify-center">
            <ViivActivityRings steps={player.steps} caloriesTotal={player.calories} distanceKm={distKm} centerHr={hr} />
          </div>
        </motion.div>
        <div className="xl:col-span-7">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            <ViivMetricTile icon={Heart} color={METRIC_COLORS.fc} label="FC" value={hr > 0 ? hr : "—"} unit="bpm" live={player.connected} />
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
              Mes dernières lectures
            </p>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {recent.slice(0, 8).map((r) => (
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
    </div>
  );
}

function Sommeil({ player }: { player: WhoopPlayerMetrics }) {
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
            {s.awake > 0 && <div style={{ flex: Math.max(1, Math.round(s.awake * 100)), background: "#64748B" }} />}
            {s.light > 0 && <div style={{ flex: Math.max(1, Math.round(s.light * 100)), background: "#818CF8" }} />}
            {s.sws > 0 && <div style={{ flex: Math.max(1, Math.round(s.sws * 100)), background: "#4F46E5" }} />}
            {s.rem > 0 && <div style={{ flex: Math.max(1, Math.round(s.rem * 100)), background: "#22D3EE" }} />}
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

function Coeur({ player, hr }: { player: WhoopPlayerMetrics; hr: number }) {
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
          bpm · sync mobile
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
      <div style={glassCard} className="p-4">
        <p className="mb-2 text-sm font-extrabold" style={{ color: VIIV_THEME.hr }}>
          Courbe FC
        </p>
        {chartData.length === 0 ? (
          <p className="py-10 text-center text-xs" style={{ color: VIIV_THEME.muted }}>
            Aucune courbe — Sync avec la montre
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="joueurHrFill" x1="0" y1="0" x2="0" y2="1">
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
              <Area type="monotone" dataKey="bpm" stroke="#EF4444" strokeWidth={2.5} fill="url(#joueurHrFill)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function Appareil({
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
            <p className="text-lg font-black text-white">Ma Viiv</p>
            <p className="text-xs" style={{ color: VIIV_THEME.muted }}>
              QWatch Pro · H59 · Viiv GX17
            </p>
          </div>
        </div>
        <div className="mt-5 space-y-3 text-sm">
          {[
            ["Joueur", player.name],
            ["ID appareil", player.deviceId || "—"],
            ["Firmware", player.firmware || "—"],
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
              <WifiOff size={14} /> Dernier sync mobile
            </span>
          )}
          <span className="inline-flex items-center gap-1.5" style={{ color: VIIV_THEME.cyan }}>
            <Bluetooth size={14} /> {player.lastSync || formatAgo(player.lastSyncAt)}
          </span>
        </div>
        <button
          type="button"
          onClick={onSync}
          disabled={syncing}
          className="mt-5 flex w-full items-center justify-center gap-2 py-3 text-sm font-bold"
          style={{ borderRadius: VIIV_THEME.radiusBtn, background: VIIV_THEME.cyan, color: VIIV_THEME.bg }}
        >
          <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
          {syncing ? "Sync…" : "Actualiser"}
        </button>
      </div>
      <div className="space-y-3">
        <p className="flex items-center gap-2 text-sm font-extrabold" style={{ color: VIIV_THEME.cyan }}>
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
      </div>
    </div>
  );
}
