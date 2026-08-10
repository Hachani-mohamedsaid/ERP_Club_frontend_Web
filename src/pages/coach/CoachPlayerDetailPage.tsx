import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  UserX,
  Loader2,
  X,
  ClipboardList,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import {
  CoachPageTransition,
  CCard,
  Gauge,
  COACH_ACCENT,
  TOOLTIP_STYLE,
} from "../../components/coach2/CoachPageTransition";
import { clubApi } from "../../lib/api/club";
import { apiFetch } from "../../lib/api/authHeaders";

const TABS = ["Performance", "Médical", "Historique"] as const;
type Tab = (typeof TABS)[number];

const STAT_LABELS: Record<string, { label: string; icon: string }> = {
  pace: { label: "Vitesse", icon: "⚡" },
  shooting: { label: "Tirs", icon: "🎯" },
  passing: { label: "Passes", icon: "🔄" },
  dribbling: { label: "Dribbles", icon: "⚽" },
  defending: { label: "Défense", icon: "🛡" },
  physical: { label: "Physique", icon: "💪" },
  heading: { label: "Jeu de tête", icon: "👆" },
  vision: { label: "Vision", icon: "👁" },
  stamina: { label: "Endurance", icon: "🏃" },
  strength: { label: "Force", icon: "🏋" },
  vitesse: { label: "Vitesse", icon: "⚡" },
  endurance: { label: "Endurance", icon: "🏃" },
  force: { label: "Force", icon: "🏋" },
  explosivité: { label: "Explosivité", icon: "⚡" },
  explosivite: { label: "Explosivité", icon: "⚡" },
  agilité: { label: "Agilité", icon: "🔄" },
  agilite: { label: "Agilité", icon: "🔄" },
  récupération: { label: "Récupération", icon: "💪" },
  recuperation: { label: "Récupération", icon: "💪" },
};

const translatePosition = (pos: string): string => {
  const map: Record<string, string> = {
    GK: "Gardien de but",
    DC: "Défenseur central",
    LB: "Latéral gauche",
    RB: "Latéral droit",
    MDF: "Milieu défensif",
    MC: "Milieu central",
    MOC: "Milieu offensif",
    AG: "Ailier gauche",
    AD: "Ailier droit",
    BU: "Buteur",
    ST: "Attaquant",
    ATT: "Attaquant",
    DEF: "Défenseur",
    MD: "Milieu défensif",
  };
  return map[pos] ?? pos;
};

const translateBodyPart = (bp: string | null | undefined): string => {
  if (!bp) return "—";
  const lower = bp.toLowerCase();
  const map: Record<string, string> = {
    head: "Tête",
    tete: "Tête",
    "shoulder-left": "Épaule gauche",
    "shoulder-right": "Épaule droite",
    "knee-left": "Genou gauche",
    "knee-right": "Genou droit",
    "ankle-left": "Cheville gauche",
    "ankle-right": "Cheville droite",
    "thigh-left": "Cuisse gauche",
    "thigh-right": "Cuisse droite",
    hamstring: "Ischio-jambiers",
    groin: "Aine",
    back: "Dos",
    "arm-left": "Bras gauche",
    "arm-right": "Bras droit",
    chest: "Poitrine",
    abdomen: "Abdomen",
  };
  if (map[lower]) return map[lower];
  return bp.charAt(0).toUpperCase() + bp.slice(1);
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const AVATAR_COLORS = [
  { bg: "rgba(255,122,0,0.2)", color: "#ff7a00" },
  { bg: "rgba(59,130,246,0.2)", color: "#3b82f6" },
  { bg: "rgba(16,185,129,0.2)", color: "#10b981" },
  { bg: "rgba(139,92,246,0.2)", color: "#8b5cf6" },
  { bg: "rgba(219,39,119,0.2)", color: "#db2777" },
  { bg: "rgba(245,158,11,0.2)", color: "#f59e0b" },
  { bg: "rgba(13,148,136,0.2)", color: "#0d9488" },
];

const getAvatarColor = (name: string | undefined | null) => {
  const safe = name ?? "A";
  return AVATAR_COLORS[safe.charCodeAt(0) % AVATAR_COLORS.length];
};

const mapStatus = (s: string) => ({
  label:
    s === "DISPONIBLE"
      ? "Disponible"
      : s === "BLESSE"
        ? "Blessé"
        : s === "LIMITE"
          ? "Surveillance"
          : s === "FIN_CONTRAT"
            ? "Fin de contrat"
            : "Inconnu",
  color:
    s === "DISPONIBLE"
      ? "#22c55e"
      : s === "BLESSE"
        ? "#ef4444"
        : s === "LIMITE"
          ? "#f59e0b"
          : "#6b7280",
  bg:
    s === "DISPONIBLE"
      ? "rgba(34,197,94,0.12)"
      : s === "BLESSE"
        ? "rgba(239,68,68,0.12)"
        : s === "LIMITE"
          ? "rgba(245,158,11,0.12)"
          : "rgba(107,114,128,0.12)",
});

const calcReadiness = (
  status: string,
  fatigueScore: number | null,
  form: number | null,
  matchTrend: "up" | "down" | "stable" | null,
): {
  score: number;
  label: string;
  color: string;
  recommendation: string;
  confidence: number;
} => {
  const statusScore = status === "DISPONIBLE" ? 100 : status === "LIMITE" ? 50 : 0;
  const fatigueContrib = fatigueScore !== null ? 100 - fatigueScore : 75;
  const formContrib = form ?? 75;
  const trendContrib = matchTrend === "up" ? 100 : matchTrend === "stable" ? 70 : 40;

  const score = Math.round(
    statusScore * 0.3 + fatigueContrib * 0.25 + formContrib * 0.25 + trendContrib * 0.2,
  );

  const confidence =
    status === "BLESSE" ? 5 : fatigueScore === null && form === null ? 40 : Math.min(95, score);

  const label =
    score >= 75 ? "Titulaire recommandé" : score >= 50 ? "Rotation recommandée" : "Repos recommandé";

  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";

  const recommendation =
    score >= 75
      ? "Joueur en bonne condition. Disponible pour démarrer."
      : score >= 50
        ? "Condition acceptable. Rotation ou entrée en jeu recommandée."
        : "Repos conseillé. Ne pas forcer la participation.";

  return { score, label, color, recommendation, confidence };
};

function normalizeInjuries(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) return raw as Record<string, unknown>[];
  if (raw && typeof raw === "object") {
    const data = raw as Record<string, unknown>;
    if (Array.isArray(data.injured)) return data.injured as Record<string, unknown>[];
  }
  return [];
}

function normalizeChargeRows(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) return raw as Record<string, unknown>[];
  if (raw && typeof raw === "object") {
    const data = raw as Record<string, unknown>;
    if (Array.isArray(data.rows)) return data.rows as Record<string, unknown>[];
  }
  return [];
}

function normalizeConditionRows(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) return raw as Record<string, unknown>[];
  if (raw && typeof raw === "object") {
    const data = raw as Record<string, unknown>;
    if (Array.isArray(data.rows)) return data.rows as Record<string, unknown>[];
  }
  return [];
}

function normalizeMatchStats(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) return raw as Record<string, unknown>[];
  if (raw && typeof raw === "object") {
    const data = raw as Record<string, unknown>;
    if (Array.isArray(data.matchStats)) return data.matchStats as Record<string, unknown>[];
    if (Array.isArray(data.stats)) return data.stats as Record<string, unknown>[];
  }
  return [];
}

function fatigueColor(v: number) {
  return v < 30 ? "#22c55e" : v < 60 ? "#ff7a00" : "#ef4444";
}

export function CoachPlayerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("Performance");

  const [player, setPlayer] = useState<Record<string, unknown> | null>(null);
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [matchStats, setMatchStats] = useState<Record<string, unknown>[]>([]);
  const [charge, setCharge] = useState<Record<string, unknown> | null>(null);
  const [condition, setCondition] = useState<Record<string, unknown> | null>(null);
  const [injuries, setInjuries] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [playersRes, statsRes, matchStatsRes, chargeRes, injuriesRes, conditionRes] =
          await Promise.all([
            clubApi.getPlayers(),
            apiFetch(`/club/players/${id}/stats`)
              .then((r) => (r.ok ? r.json() : null))
              .catch(() => null),
            apiFetch(`/club/players/${id}/match-stats`)
              .then((r) => (r.ok ? r.json() : []))
              .catch(() => []),
            apiFetch("/club/preparateur/charge")
              .then((r) => r.json())
              .catch(() => null),
            clubApi.getInjuries(),
            apiFetch("/club/preparateur/condition")
              .then((r) => r.json())
              .catch(() => null),
          ]);

        if (cancelled) return;

        const playersList = Array.isArray(playersRes)
          ? (playersRes as Record<string, unknown>[])
          : [];
        const found = playersList.find((p) => String(p.id) === id) ?? null;

        const chargeRows = normalizeChargeRows(chargeRes);
        const conditionRows = normalizeConditionRows(conditionRes);

        setPlayer(found);
        setStats(statsRes && typeof statsRes === "object" ? (statsRes as Record<string, unknown>) : null);
        setMatchStats(normalizeMatchStats(matchStatsRes));
        setCharge(chargeRows.find((c) => String(c.id) === id) ?? null);
        setCondition(conditionRows.find((c) => String(c.id) === id) ?? null);
        setInjuries(normalizeInjuries(injuriesRes));
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Erreur de chargement");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const playerInjury = useMemo(() => {
    if (!player) return null;
    const name = String(player.fullName ?? "").toLowerCase();
    return injuries.find((inj) => String(inj.name ?? "").toLowerCase() === name) ?? null;
  }, [player, injuries]);

  const matchRatings = useMemo(
    () =>
      matchStats
        .filter((m) => m.rating != null)
        .map((m) => Number(m.rating))
        .slice(-5),
    [matchStats],
  );

  const matchTrend: "up" | "down" | "stable" | null = useMemo(() => {
    if (matchRatings.length < 2) return null;
    const last = matchRatings[matchRatings.length - 1];
    const first = matchRatings[0];
    if (last > first) return "up";
    if (last < first) return "down";
    return "stable";
  }, [matchRatings]);

  if (loading) {
    return (
      <CoachPageTransition>
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="animate-spin" size={32} style={{ color: COACH_ACCENT }} />
        </div>
      </CoachPageTransition>
    );
  }

  if (error) {
    return (
      <CoachPageTransition>
        <CCard className="border border-red-500/30 p-6 text-center">
          <p className="text-sm font-medium" style={{ color: "#ef4444" }}>
            Erreur de chargement: {error}
          </p>
        </CCard>
      </CoachPageTransition>
    );
  }

  if (!player) {
    return (
      <CoachPageTransition>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <UserX size={48} style={{ color: "var(--text-muted)" }} />
          <p className="mt-4 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Joueur introuvable.
          </p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-4 rounded-xl px-4 py-2 text-sm font-semibold"
            style={{ background: `${COACH_ACCENT}18`, color: COACH_ACCENT }}
          >
            ← Retour
          </button>
        </div>
      </CoachPageTransition>
    );
  }

  const playerName = String(player.fullName ?? player.name ?? "Joueur");
  const st = mapStatus(String(player.status ?? ""));
  const av = getAvatarColor(
    String(player?.fullName ?? player?.name ?? "A")
  );
  const playerStatus = String(player.status ?? "DISPONIBLE");

  const fatigueScore = charge?.fatigueScore != null ? Number(charge.fatigueScore) : null;
  const formScore = stats?.form != null ? Number(stats.form) : null;

  const readiness = calcReadiness(playerStatus, fatigueScore, formScore, matchTrend);

  const seasonStats =
    stats?.seasonStats && typeof stats.seasonStats === "object"
      ? (stats.seasonStats as Record<string, unknown>)
      : null;

  const radarData =
    condition &&
    condition.speed != null &&
    condition.endurance != null
      ? [
          { subject: "Vitesse", A: Number(condition.speed ?? 0) },
          { subject: "Endurance", A: Number(condition.endurance ?? 0) },
          { subject: "Force", A: Number(condition.force ?? 0) },
          { subject: "Explosivité", A: Number(condition.explosivity ?? 0) },
          { subject: "Agilité", A: Number(condition.agility ?? 0) },
          { subject: "Récupération", A: Number(condition.recovery ?? 0) },
        ]
      : [];

  const attrs =
    condition && condition.speed != null
      ? [
          { label: "Vitesse", v: Number(condition.speed ?? 0) },
          { label: "Endurance", v: Number(condition.endurance ?? 0) },
          { label: "Force", v: Number(condition.force ?? 0) },
          { label: "Explosivité", v: Number(condition.explosivity ?? 0) },
          { label: "Agilité", v: Number(condition.agility ?? 0) },
          { label: "Récupération", v: Number(condition.recovery ?? 0) },
        ].sort((a, b) => b.v - a.v)
      : [];

  const strengths = attrs.slice(0, 2);
  const weaknesses = attrs.slice(-2);

  const perfChartData = matchStats.slice(-5).map((m, i) => ({
    match: String(m.opponent ?? m.vs ?? `M${i + 1}`),
    rating: Number(m.rating ?? 0),
  }));

  const riskScore = playerInjury
    ? Math.round(80 + (fatigueScore ?? 0) * 0.2)
    : Math.round((fatigueScore ?? 20) * 0.5);
  const riskColor = riskScore < 25 ? "#22c55e" : riskScore < 55 ? "#f59e0b" : "#ef4444";
  const riskLabel =
    riskScore < 25 ? "Risque faible" : riskScore < 55 ? "Risque modéré" : "Risque élevé";

  const specificStats = radarData
    .map((item) => {
      const key = String(item.subject ?? "").toLowerCase();
      return {
        key,
        label: STAT_LABELS[key]?.label ?? String(item.subject ?? ""),
        icon: STAT_LABELS[key]?.icon ?? "•",
        value: Number(item.A ?? 0),
      };
    })
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value);

  const playerPhase = (() => {
    try {
      const phases = JSON.parse(
        localStorage.getItem("odin_reeducation_phases") ?? "{}"
      ) as Record<string, number>;
      const playerInjuryId = playerInjury
        ? String((playerInjury as { id?: unknown }).id ?? "")
        : null;
      return playerInjuryId ? (phases[playerInjuryId] ?? null) : null;
    } catch {
      return null;
    }
  })();

  const phaseLabel =
    playerPhase === 1
      ? "Phase 1 — Immobilisation"
      : playerPhase === 2
        ? "Phase 2 — Renforcement"
        : playerPhase === 3
          ? "Retour terrain"
          : null;

  const phaseColor =
    playerPhase === 1 ? "#3b82f6" : playerPhase === 2 ? "#8b5cf6" : "#22c55e";

  const avail = {
    training: playerStatus !== "BLESSE",
    match: playerStatus === "DISPONIBLE",
    medical: !playerInjury,
  };

  if (!player && !loading) {
    return (
      <CoachPageTransition>
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <p style={{ color: "var(--text-muted)", fontSize: 16 }}>Joueur introuvable.</p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              marginTop: 16,
              padding: "8px 20px",
              background: "var(--accent)",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            ← Retour
          </button>
        </div>
      </CoachPageTransition>
    );
  }

  return (
    <CoachPageTransition>
      <div className="flex items-center gap-3">
        <motion.button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold"
          style={{
            borderColor: "rgba(255,255,255,0.08)",
            color: "var(--text-muted)",
            background: "rgba(255,255,255,0.03)",
          }}
          whileHover={{ borderColor: `${COACH_ACCENT}50`, color: COACH_ACCENT }}
          whileTap={{ scale: 0.96 }}
        >
          <ArrowLeft size={13} /> Retour effectif
        </motion.button>
      </div>

      <CCard glow>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-xl font-extrabold"
            style={{
              background: av?.bg ?? "rgba(255,122,0,0.2)",
              color: av?.color ?? "#ff7a00",
            }}
          >
            {getInitials(playerName)}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>
              {playerName}
            </h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {translatePosition(String(player.position ?? ""))}
              {player.age ? ` · ${String(player.age)} ans` : ""}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span
                className="rounded-full px-3 py-0.5 text-xs font-bold"
                style={{ background: st.bg, color: st.color }}
              >
                {st.label}
              </span>
              {playerInjury ? (
                <span
                  className="rounded-full px-3 py-0.5 text-xs font-bold"
                  style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444" }}
                >
                  🩺 {String(playerInjury.injury ?? "Blessure")}
                </span>
              ) : null}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {seasonStats ? (
              [
                { label: "Buts", value: seasonStats.goals ?? 0, color: "#22c55e" },
                { label: "Passes D.", value: seasonStats.assists ?? 0, color: "#3b82f6" },
                { label: "Matchs", value: seasonStats.matches ?? 0, color: COACH_ACCENT },
              ].map((m) => (
                <div
                  key={m.label}
                  className="rounded-xl border p-2 text-center"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    borderColor: "rgba(255,255,255,0.06)",
                  }}
                >
                  <p className="text-xl font-extrabold" style={{ color: m.color }}>
                    {String(m.value)}
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    {m.label}
                  </p>
                </div>
              ))
            ) : (
              ["Buts", "Passes D.", "Matchs"].map((label) => (
                <div
                  key={label}
                  className="rounded-xl border p-2 text-center"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    borderColor: "rgba(255,255,255,0.06)",
                  }}
                >
                  <p className="text-xl font-extrabold" style={{ color: "var(--text-muted)" }}>
                    —
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    {label}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
        {!seasonStats ? (
          <p className="mt-3 text-center text-[10px]" style={{ color: "var(--text-muted)" }}>
            En attente de données
          </p>
        ) : null}
      </CCard>

      <CCard glow>
        <p
          className="mb-4 text-xs uppercase tracking-wide"
          style={{ color: "var(--text-muted)" }}
        >
          Recommandation de sélection
        </p>
        <div className="flex flex-wrap items-center gap-6">
          <motion.div
            animate={{
              boxShadow: [
                `0 0 0px ${readiness.color}00`,
                `0 0 24px ${readiness.color}60`,
                `0 0 0px ${readiness.color}00`,
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              border: `4px solid ${readiness.color}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 22, fontWeight: 800, color: readiness.color }}>
              {readiness.score}
            </span>
            <span style={{ fontSize: 9, color: "var(--text-muted)" }}>/100</span>
          </motion.div>

          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold" style={{ color: readiness.color }}>
              {readiness.label}
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
              {readiness.recommendation}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                Confiance:
              </span>
              <div
                className="overflow-hidden rounded-full"
                style={{ width: 120, height: 6, background: "rgba(255,255,255,0.1)" }}
              >
                <div
                  style={{
                    width: `${readiness.confidence}%`,
                    height: "100%",
                    background: readiness.color,
                    borderRadius: 99,
                  }}
                />
              </div>
              <span className="text-xs font-bold" style={{ color: readiness.color }}>
                {readiness.confidence}%
              </span>
            </div>
          </div>

          <div className="grid min-w-32 grid-cols-1 gap-2">
            {[
              { label: "Entraînement", ok: avail.training },
              { label: "Match", ok: avail.match },
              {
                label: "Médical",
                ok: avail.medical,
                text: playerInjury ? "Blessé" : "Apte",
              },
            ].map((a) => (
              <div key={a.label} className="flex items-center gap-2">
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: a.ok ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {a.ok ? (
                    <CheckCircle2 size={10} color="#22c55e" />
                  ) : (
                    <X size={10} color="#ef4444" />
                  )}
                </span>
                <span className="text-xs" style={{ color: "var(--text-primary)" }}>
                  {a.label}
                </span>
                <span
                  className="ml-auto text-xs"
                  style={{ color: a.ok ? "#22c55e" : "#ef4444" }}
                >
                  {a.text ?? (a.ok ? "✅" : "❌")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CCard>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t, i) => (
          <motion.button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="rounded-xl px-4 py-2 text-xs font-semibold"
            style={{
              background:
                tab === t ? `linear-gradient(135deg,${COACH_ACCENT},#E66000)` : "rgba(255,255,255,0.04)",
              color: tab === t ? "white" : "var(--text-muted)",
              boxShadow: tab === t ? `0 0 14px ${COACH_ACCENT}40` : "none",
            }}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
          >
            {t}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {tab === "Performance" && (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <CCard>
                <p className="mb-2 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  Profil physique
                </p>
                {radarData.length > 0 ? (
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.07)" />
                        <PolarAngleAxis
                          dataKey="subject"
                          tick={{ fill: "var(--text-muted)", fontSize: 10 }}
                        />
                        <Radar
                          dataKey="A"
                          stroke={COACH_ACCENT}
                          fill={COACH_ACCENT}
                          fillOpacity={0.22}
                          strokeWidth={2}
                        />
                        <Tooltip {...TOOLTIP_STYLE} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                      Profil physique non disponible.
                    </p>
                    <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                      Données à renseigner par le préparateur physique.
                    </p>
                  </div>
                )}
              </CCard>

              {specificStats.length > 0 ? (
                <CCard>
                  <p
                    className="mb-3 text-sm font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Statistiques spécifiques
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {specificStats.map((s) => {
                      const color =
                        s.value >= 80
                          ? "#22c55e"
                          : s.value >= 65
                            ? "#ff7a00"
                            : "#ef4444";
                      return (
                        <div key={s.key}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: 4,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 12,
                                color: "var(--text-secondary)",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              {s.icon} {s.label}
                            </span>
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color,
                              }}
                            >
                              {s.value}
                            </span>
                          </div>
                          <div
                            style={{
                              height: 5,
                              borderRadius: 99,
                              background: "rgba(255,255,255,0.08)",
                              overflow: "hidden",
                            }}
                          >
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${s.value}%` }}
                              transition={{ duration: 0.6 }}
                              style={{
                                height: "100%",
                                borderRadius: 99,
                                background: color,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CCard>
              ) : (
                <CCard>
                  <p
                    className="mb-3 text-sm font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Statistiques spécifiques
                  </p>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "32px 0",
                      borderRadius: 12,
                      border: "1px dashed rgba(255,255,255,0.08)",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 13,
                        color: "var(--text-muted)",
                      }}
                    >
                      Statistiques non disponibles
                    </p>
                    <p
                      style={{
                        fontSize: 11,
                        color: "var(--text-muted)",
                        marginTop: 4,
                        opacity: 0.7,
                      }}
                    >
                      Données à renseigner par le préparateur
                    </p>
                  </div>
                </CCard>
              )}

              {attrs.length > 0 ? (
                <CCard>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div
                      className="rounded-xl border p-3"
                      style={{
                        borderColor: "rgba(34,197,94,0.25)",
                        background: "rgba(34,197,94,0.06)",
                      }}
                    >
                      <p className="mb-2 text-xs font-bold" style={{ color: "#22c55e" }}>
                        Points forts
                      </p>
                      {strengths.map((s) => (
                        <p key={s.label} className="text-xs" style={{ color: "var(--text-secondary)" }}>
                          ★ {s.label} ({s.v})
                        </p>
                      ))}
                    </div>
                    <div
                      className="rounded-xl border p-3"
                      style={{
                        borderColor: "rgba(245,158,11,0.25)",
                        background: "rgba(245,158,11,0.06)",
                      }}
                    >
                      <p className="mb-2 text-xs font-bold" style={{ color: "#f59e0b" }}>
                        Axes d&apos;amélioration
                      </p>
                      {weaknesses.map((w) => (
                        <p key={w.label} className="text-xs" style={{ color: "var(--text-secondary)" }}>
                          △ {w.label} ({w.v})
                        </p>
                      ))}
                    </div>
                  </div>
                </CCard>
              ) : null}

              <CCard className={attrs.length > 0 ? "" : "xl:col-span-1"}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                    Tendance performance
                  </p>
                  {matchTrend === "up" ? (
                    <span className="flex items-center gap-1 text-xs" style={{ color: "#22c55e" }}>
                      <TrendingUp size={14} /> En progression
                    </span>
                  ) : matchTrend === "down" ? (
                    <span className="flex items-center gap-1 text-xs" style={{ color: "#ef4444" }}>
                      <TrendingDown size={14} /> En baisse
                    </span>
                  ) : matchRatings.length > 0 ? (
                    <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                      <Minus size={14} /> Stable
                    </span>
                  ) : null}
                </div>
                {perfChartData.length > 0 ? (
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={perfChartData} barCategoryGap="30%">
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.04)"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="match"
                          tick={{ fill: "var(--text-muted)", fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          domain={[5, 10]}
                          tick={{ fill: "var(--text-muted)", fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip {...TOOLTIP_STYLE} />
                        <Bar
                          dataKey="rating"
                          radius={[6, 6, 0, 0]}
                          fill={COACH_ACCENT}
                          fillOpacity={0.85}
                          name="Note"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed py-8 text-center">
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                      Aucun match enregistré.
                    </p>
                    <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                      Les statistiques apparaîtront après saisie des matchs par le staff.
                    </p>
                  </div>
                )}
              </CCard>

              <CCard className="xl:col-span-2">
                <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  Charge & récupération
                </p>
                {charge ? (
                  <div className="space-y-3">
                    {[
                      {
                        label: "Charge",
                        value: Number(charge.loadScore ?? 0),
                        color: COACH_ACCENT,
                      },
                      {
                        label: "Fatigue",
                        value: Number(charge.fatigueScore ?? 0),
                        color: fatigueColor(Number(charge.fatigueScore ?? 0)),
                      },
                      {
                        label: "Récupération",
                        value: Number(charge.recoveryScore ?? 0),
                        color: "#22c55e",
                      },
                    ].map(({ label, value, color }) => (
                      <div key={label}>
                        <div className="mb-0.5 flex justify-between text-xs">
                          <span style={{ color: "var(--text-muted)" }}>{label}</span>
                          <span className="font-bold" style={{ color }}>
                            {value}%
                          </span>
                        </div>
                        <Gauge value={value} color={color} />
                      </div>
                    ))}
                    {charge.statut ? (
                      <span
                        className="inline-flex rounded-full px-3 py-0.5 text-xs font-bold"
                        style={{
                          background:
                            charge.statut === "Critique"
                              ? "rgba(239,68,68,0.12)"
                              : charge.statut === "Attention"
                                ? "rgba(245,158,11,0.12)"
                                : "rgba(34,197,94,0.12)",
                          color:
                            charge.statut === "Critique"
                              ? "#ef4444"
                              : charge.statut === "Attention"
                                ? "#f59e0b"
                                : "#22c55e",
                        }}
                      >
                        {String(charge.statut)}
                      </span>
                    ) : null}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed p-4">
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                      Données de charge non disponibles.
                    </p>
                    <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                      Le préparateur physique doit enregistrer les séances d&apos;entraînement.
                    </p>
                  </div>
                )}
              </CCard>
            </div>
          )}

          {tab === "Médical" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <CCard>
                <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  Statut médical
                </p>
                <div className="mb-4 flex items-center gap-4">
                  <motion.div
                    className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 text-xl font-extrabold"
                    style={{ borderColor: riskColor, color: "var(--text-primary)" }}
                    animate={{
                      boxShadow: [
                        `0 0 0px ${riskColor}00`,
                        `0 0 20px ${riskColor}55`,
                        `0 0 0px ${riskColor}00`,
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {riskScore}%
                  </motion.div>
                  <div>
                    <p className="font-bold" style={{ color: riskColor }}>
                      {riskLabel}
                    </p>
                    <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                      Score risque blessure
                    </p>
                  </div>
                </div>
                {charge ? (
                  <div className="space-y-2.5">
                    {[
                      {
                        label: "Fatigue",
                        value: Number(charge.fatigueScore ?? 0),
                        color: fatigueColor(Number(charge.fatigueScore ?? 0)),
                      },
                      {
                        label: "Récupération",
                        value: Number(charge.recoveryScore ?? 0),
                        color: "#22c55e",
                      },
                    ].map(({ label, value, color }) => (
                      <div key={label}>
                        <div className="mb-0.5 flex justify-between text-xs">
                          <span style={{ color: "var(--text-muted)" }}>{label}</span>
                          <span className="font-bold" style={{ color }}>
                            {value}%
                          </span>
                        </div>
                        <Gauge value={value} color={color} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Données de fatigue et récupération non disponibles.
                  </p>
                )}
              </CCard>

              <CCard>
                <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  État blessure
                </p>
                {playerInjury ? (
                  <div
                    className="rounded-xl border p-4"
                    style={{
                      background: "rgba(239,68,68,0.08)",
                      borderColor: "rgba(239,68,68,0.30)",
                    }}
                  >
                    <p className="text-sm font-bold" style={{ color: "#ef4444" }}>
                      🩺 {String(playerInjury.injury ?? "Blessure")}
                    </p>
                    <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
                      Zone: {translateBodyPart(String(playerInjury.bodyPart ?? ""))}
                    </p>
                    <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                      Retour estimé: {String(playerInjury.returnDate ?? "—")}
                    </p>
                    <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                      Risque: {Number(playerInjury.riskIA ?? 0) * 10}%
                    </p>
                  </div>
                ) : (
                  <div
                    className="flex flex-col items-center justify-center rounded-xl border p-6"
                    style={{
                      background: "rgba(34,197,94,0.06)",
                      borderColor: "rgba(34,197,94,0.25)",
                    }}
                  >
                    <CheckCircle2 size={28} style={{ color: "#22c55e" }} className="mb-2" />
                    <p className="text-sm font-medium" style={{ color: "#22c55e" }}>
                      ✅ Aucune blessure active
                    </p>
                    <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                      Joueur médicalement apte.
                    </p>
                  </div>
                )}
              </CCard>

              <div style={{ gridColumn: "1 / -1" }}>
                <CCard>
                  <p
                    className="mb-3 text-sm font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Disponibilité médicale
                  </p>

                  {phaseLabel ? (
                    <div
                      style={{
                        padding: "10px 14px",
                        borderRadius: 10,
                        background: `${phaseColor}12`,
                        border: `1px solid ${phaseColor}30`,
                        borderLeft: `3px solid ${phaseColor}`,
                        marginBottom: 12,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: phaseColor,
                          flexShrink: 0,
                        }}
                      />
                      <div>
                        <p
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: phaseColor,
                          }}
                        >
                          En rééducation — {phaseLabel}
                        </p>
                        <p
                          style={{
                            fontSize: 10,
                            color: "var(--text-muted)",
                            marginTop: 2,
                          }}
                        >
                          Suivi médical en cours
                        </p>
                      </div>
                    </div>
                  ) : null}

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        marginBottom: 4,
                      }}
                    >
                      Autorisation médicale
                    </p>
                    {[
                      {
                        label: "Entraînement",
                        ok: st.label !== "Blessé",
                      },
                      {
                        label: "Match",
                        ok: st.label === "Disponible",
                      },
                      {
                        label: "Contact physique",
                        ok: st.label === "Disponible" && !playerInjury,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 12px",
                          borderRadius: 9,
                          background: item.ok
                            ? "rgba(34,197,94,0.06)"
                            : "rgba(239,68,68,0.06)",
                          border: `1px solid ${
                            item.ok
                              ? "rgba(34,197,94,0.20)"
                              : "rgba(239,68,68,0.20)"
                          }`,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            color: "var(--text-primary)",
                          }}
                        >
                          {item.label}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: item.ok ? "#22c55e" : "#ef4444",
                            background: item.ok
                              ? "rgba(34,197,94,0.12)"
                              : "rgba(239,68,68,0.12)",
                            padding: "3px 10px",
                            borderRadius: 99,
                          }}
                        >
                          {item.ok ? "✓ Autorisé" : "✗ Interdit"}
                        </span>
                      </div>
                    ))}
                  </div>
                </CCard>
              </div>
            </div>
          )}

          {tab === "Historique" && (
            <div>
              {seasonStats ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4,1fr)",
                    gap: 10,
                    marginBottom: 16,
                  }}
                >
                  {[
                    {
                      label: "Matchs joués",
                      value: seasonStats.matches ?? 0,
                      color: "#ff7a00",
                      bg: "rgba(255,122,0,0.10)",
                      border: "rgba(255,122,0,0.25)",
                    },
                    {
                      label: "Buts",
                      value: seasonStats.goals ?? 0,
                      color: "#22c55e",
                      bg: "rgba(34,197,94,0.10)",
                      border: "rgba(34,197,94,0.25)",
                    },
                    {
                      label: "Passes décisives",
                      value: seasonStats.assists ?? 0,
                      color: "#3b82f6",
                      bg: "rgba(59,130,246,0.10)",
                      border: "rgba(59,130,246,0.25)",
                    },
                    {
                      label: "Note moyenne",
                      value:
                        matchStats.length > 0
                          ? (
                              matchStats
                                .filter((m) => m.rating != null)
                                .reduce(
                                  (s, m) => s + Number(m.rating ?? 0),
                                  0
                                ) /
                              Math.max(
                                1,
                                matchStats.filter((m) => m.rating != null).length
                              )
                            ).toFixed(1)
                          : "—",
                      color: "#8b5cf6",
                      bg: "rgba(139,92,246,0.10)",
                      border: "rgba(139,92,246,0.25)",
                    },
                  ].map((k, i) => (
                    <motion.div
                      key={k.label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 12,
                        background: k.bg,
                        border: `1px solid ${k.border}`,
                        borderLeft: `3px solid ${k.color}`,
                        textAlign: "center",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 22,
                          fontWeight: 900,
                          color: k.color,
                          lineHeight: 1,
                        }}
                      >
                        {String(k.value)}
                      </p>
                      <p
                        style={{
                          fontSize: 10,
                          color: "var(--text-muted)",
                          marginTop: 5,
                        }}
                      >
                        {k.label}
                      </p>
                    </motion.div>
                  ))}
                </div>
              ) : null}

              <CCard>
                <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  Historique des matchs
                </p>
                {matchStats.length > 0 ? (
                  <div className="space-y-2">
                    {matchStats.map((m, i) => {
                      const rating = m.rating != null ? Number(m.rating) : null;
                      const goals = Number(m.goals ?? 0);
                      const assists = Number(m.assists ?? 0);
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.07 }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "12px 14px",
                            borderRadius: 12,
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            borderLeft: `3px solid ${
                              rating !== null
                                ? rating >= 8
                                  ? "#22c55e"
                                  : rating >= 7
                                    ? "#ff7a00"
                                    : "#ef4444"
                                : "rgba(255,255,255,0.15)"
                            }`,
                          }}
                        >
                          <div
                            style={{
                              flexShrink: 0,
                              textAlign: "center",
                              minWidth: 52,
                            }}
                          >
                            <p
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: "var(--text-muted)",
                              }}
                            >
                              {String(m.matchDate ?? m.date ?? "—").slice(0, 5)}
                            </p>
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: "var(--text-primary)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              vs {String(m.opponent ?? m.vs ?? "—")}
                            </p>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              gap: 12,
                              alignItems: "center",
                              flexShrink: 0,
                            }}
                          >
                            {goals > 0 ? (
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: "#22c55e",
                                  background: "rgba(34,197,94,0.10)",
                                  padding: "2px 8px",
                                  borderRadius: 99,
                                }}
                              >
                                ⚽ {goals}
                              </span>
                            ) : null}
                            {assists > 0 ? (
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: "#3b82f6",
                                  background: "rgba(59,130,246,0.10)",
                                  padding: "2px 8px",
                                  borderRadius: 99,
                                }}
                              >
                                🎯 {assists}
                              </span>
                            ) : null}
                            {rating !== null ? (
                              <div
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 10,
                                  background:
                                    rating >= 8
                                      ? "rgba(34,197,94,0.12)"
                                      : rating >= 7
                                        ? "rgba(255,122,0,0.12)"
                                        : "rgba(239,68,68,0.12)",
                                  border: `1px solid ${
                                    rating >= 8
                                      ? "rgba(34,197,94,0.25)"
                                      : rating >= 7
                                        ? "rgba(255,122,0,0.25)"
                                        : "rgba(239,68,68,0.25)"
                                  }`,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 14,
                                  fontWeight: 900,
                                  color:
                                    rating >= 8
                                      ? "#22c55e"
                                      : rating >= 7
                                        ? "#ff7a00"
                                        : "#ef4444",
                                }}
                              >
                                {rating}
                              </div>
                            ) : (
                              <div
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 10,
                                  background: "rgba(255,255,255,0.04)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 12,
                                  color: "var(--text-muted)",
                                }}
                              >
                                —
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed py-12 text-center">
                    <ClipboardList
                      size={40}
                      style={{
                        color: "var(--text-muted)",
                        margin: "0 auto 12px",
                        display: "block",
                      }}
                    />
                    <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                      Aucun match enregistré
                    </p>
                    <p
                      className="mx-auto mt-1 max-w-xs text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      L&apos;historique des matchs apparaîtra après saisie par le staff
                      technique.
                    </p>
                  </div>
                )}
              </CCard>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </CoachPageTransition>
  );
}
