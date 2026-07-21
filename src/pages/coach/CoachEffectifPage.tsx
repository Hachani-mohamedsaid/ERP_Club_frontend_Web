import { useState, useMemo, useEffect, type ComponentType, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Zap,
  Loader2,
  UserX,
  Users,
  Activity,
} from "lucide-react";
import { CoachPageTransition, CCard, Gauge, COACH_ACCENT } from "../../components/coach2/CoachPageTransition";
import { clubApi } from "../../lib/api/club";
import { apiFetch } from "../../lib/api/authHeaders";

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
  const safeIndex = (name ?? "A").charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[safeIndex];
};

const mapStatus = (s: string) => {
  const status = (s ?? "").toUpperCase().trim();
  if (status === "DISPONIBLE")
    return {
      label: "Disponible",
      color: "#22c55e",
      bg: "rgba(34,197,94,0.12)",
    };
  if (status === "BLESSE" || status === "BLESSÉ")
    return {
      label: "Blessé",
      color: "#ef4444",
      bg: "rgba(239,68,68,0.12)",
    };
  if (status === "LIMITE" || status === "LIMITÉ")
    return {
      label: "Surveillance",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.12)",
    };
  if (status === "FIN_CONTRAT")
    return {
      label: "Fin de contrat",
      color: "#6b7280",
      bg: "rgba(107,114,128,0.12)",
    };
  return {
    label: "Disponible",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
  };
};

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

interface SquadPlayer {
  id: string;
  name: string;
  number: number;
  position: string;
  positionFull: string;
  age: number | null;
  status: string;
  statusColor: string;
  statusBg: string;
  backendStatus: string;
  forme: number | null;
  fatigue: number | null;
  recovery: number | null;
  chargeStatut: string | null;
  injury: string | null;
  returnDate: string | null;
  avatarBg: string;
  avatarColor: string;
}

type StatusFilter = "Tous" | "Disponible" | "Blessé" | "Surveillance";

const POSITIONS = ["Tous", "GK", "DC", "LB", "RB", "MDF", "MC", "MOC", "AG", "AD", "BU"];

function fatigueColor(v: number) {
  return v < 30 ? "#22c55e" : v < 60 ? "#ff7a00" : "#ef4444";
}

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

function ColoredStatusBadge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold"
      style={{ background: bg, color, border: `1px solid ${color}30` }}
    >
      {label}
    </span>
  );
}

export function CoachEffectifPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [posFilter, setPosFilter] = useState("Tous");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Tous");
  const [selected, setSelected] = useState<SquadPlayer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [players, setPlayers] = useState<Record<string, unknown>[]>([]);
  const [injuries, setInjuries] = useState<Record<string, unknown>[]>([]);
  const [chargeData, setChargeData] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("odin_token");
      if (!token) {
        if (!cancelled) {
          setError("Session expirée. Veuillez vous reconnecter.");
          setLoading(false);
        }
        return;
      }

      let playersData: Record<string, unknown>[] = [];
      let injuriesData: Record<string, unknown>[] = [];
      let chargeRows: Record<string, unknown>[] = [];

      try {
        const res = await clubApi.getPlayers();
        playersData = Array.isArray(res) ? (res as Record<string, unknown>[]) : [];
      } catch (e) {
        console.warn("Players fetch failed:", e);
      }

      try {
        const injRes = (await clubApi.getInjuries()) as unknown;
        injuriesData = normalizeInjuries(injRes);
      } catch (e) {
        console.warn("Injuries fetch failed:", e);
      }

      try {
        const chargeRes = await apiFetch("/club/preparateur/charge");
        if (chargeRes.ok) {
          const chargeJson = await chargeRes.json();
          chargeRows = normalizeChargeRows(chargeJson);
        }
      } catch (e) {
        console.warn("Charge fetch failed:", e);
      }

      if (cancelled) return;
      setPlayers(playersData);
      setInjuries(injuriesData);
      setChargeData(chargeRows);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const squad = useMemo<SquadPlayer[]>(() => {
    const validPlayers = players.filter(
      (p) => p && (p.fullName || p.name),
    );
    return validPlayers.map((p, i) => {
      const displayName = String(p.fullName ?? p.name ?? "Joueur");
      const injury = injuries.find(
        (inj) => inj.name?.toLowerCase() === String(p.fullName ?? "").toLowerCase(),
      );
      const charge = chargeData.find((c) => c.id === p.id);
      const st = mapStatus(String(p.status ?? ""));
      const av = getAvatarColor(displayName);

      return {
        id: String(p.id ?? `player-${i}`),
        name: displayName,
        number: i + 1,
        position: String(p.position ?? "—"),
        positionFull: translatePosition(String(p.position ?? "")),
        age: p.age != null ? Number(p.age) : null,
        status: st.label,
        statusColor: st.color,
        statusBg: st.bg,
        backendStatus: String(p.status ?? ""),
        forme: charge?.loadScore != null ? Number(charge.loadScore) : null,
        fatigue: charge?.fatigueScore != null ? Number(charge.fatigueScore) : null,
        recovery: charge?.recoveryScore != null ? Number(charge.recoveryScore) : null,
        chargeStatut: charge?.statut ? String(charge.statut) : null,
        injury: injury?.injury ? String(injury.injury) : null,
        returnDate: injury?.returnDate ? String(injury.returnDate) : null,
        avatarBg: av.bg,
        avatarColor: av.color,
      };
    });
  }, [players, injuries, chargeData]);

  const filtered = useMemo(
    () =>
      squad.filter((p) => {
        if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (posFilter !== "Tous" && p.position !== posFilter) return false;
        if (statusFilter !== "Tous" && p.status !== statusFilter) return false;
        return true;
      }),
    [squad, search, posFilter, statusFilter],
  );

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

  if (squad.length === 0) {
    return (
      <CoachPageTransition>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <UserX size={48} style={{ color: "var(--text-muted)" }} />
          <p className="mt-4 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Aucun joueur enregistré
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Ajoutez des joueurs depuis la gestion de l&apos;effectif.
          </p>
        </div>
      </CoachPageTransition>
    );
  }

  const total = squad.length;
  const disponibles = squad.filter((p) => p.status === "Disponible").length;
  const blesses = squad.filter((p) => p.status === "Blessé").length;
  const surveillance = squad.filter((p) => p.status === "Surveillance").length;
  const critiques = squad.filter((p) => p.chargeStatut === "Critique").length;
  const withFatigue = squad.filter((p) => p.fatigue !== null);
  const avgFatigue =
    withFatigue.length > 0
      ? Math.round(withFatigue.reduce((s, p) => s + p.fatigue!, 0) / withFatigue.length)
      : null;

  const kpis: {
    label: string;
    value: string | number;
    color: string;
    icon: ComponentType<{ size?: number; style?: CSSProperties }>;
  }[] = [
    { label: "Effectif total", value: total, color: "#ff7a00", icon: Users },
    { label: "Disponibles", value: disponibles, color: "#22c55e", icon: CheckCircle2 },
    { label: "Blessés", value: blesses, color: "#ef4444", icon: Zap },
    { label: "Surveillance", value: surveillance, color: "#f59e0b", icon: AlertTriangle },
    { label: "Charge critique", value: critiques, color: "#8b5cf6", icon: Shield },
    {
      label: "Fatigue moyenne",
      value: avgFatigue !== null ? `${avgFatigue}%` : "—",
      color: "#3b82f6",
      icon: Activity,
    },
  ];

  const selectedReadiness = selected
    ? calcReadiness(selected.backendStatus, selected.fatigue, null, null)
    : null;

  return (
    <CoachPageTransition>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>
            Effectif / Squad
          </h1>
          <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
            {squad.length} joueurs · Saison en cours
          </p>
        </div>
        <motion.button
          type="button"
          onClick={() => navigate("/coach/lineup")}
          className="rounded-xl px-4 py-2 text-sm font-bold text-white"
          style={{
            background: `linear-gradient(135deg,${COACH_ACCENT},#E66000)`,
            boxShadow: `0 0 16px ${COACH_ACCENT}40`,
          }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          Composer l&apos;équipe →
        </motion.button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                borderLeft: `3px solid ${k.color}`,
                background: `${k.color}12`,
                borderRadius: 14,
                padding: "14px 16px",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-3xl font-bold leading-none" style={{ color: k.color }}>
                    {k.value}
                  </p>
                  <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    {k.label}
                  </p>
                </div>
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ background: `${k.color}20` }}
                >
                  <Icon size={16} style={{ color: k.color }} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div
          className="flex items-center gap-2 rounded-xl border px-3 py-2"
          style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}
        >
          <Search size={13} style={{ color: "var(--text-muted)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher joueur..."
            className="w-36 bg-transparent text-sm outline-none"
            style={{ color: "var(--text-primary)" }}
          />
        </div>
        <div
          className="flex items-center gap-1.5 rounded-xl border px-2 py-1.5"
          style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}
        >
          <Filter size={11} style={{ color: "var(--text-muted)" }} />
          <select
            value={posFilter}
            onChange={(e) => setPosFilter(e.target.value)}
            className="bg-transparent text-xs outline-none"
            style={{ color: "var(--text-muted)" }}
          >
            {POSITIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["Tous", "Disponible", "Blessé", "Surveillance"] as const).map((s) => {
            const activeColor =
              s === "Disponible"
                ? "#22c55e"
                : s === "Blessé"
                  ? "#ef4444"
                  : s === "Surveillance"
                    ? "#f59e0b"
                    : COACH_ACCENT;
            return (
              <motion.button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className="rounded-full px-3 py-1 text-[10px] font-semibold"
                style={{
                  background:
                    statusFilter === s ? `${activeColor}22` : "rgba(255,255,255,0.04)",
                  color: statusFilter === s ? activeColor : "var(--text-muted)",
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
              >
                {s}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
        <CCard className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: 720 }}>
              <thead>
                <tr
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    borderBottom: "2px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {["#", "Joueur", "Âge", "Statut", "Fatigue", "Charge", "Actions"].map((col) => (
                    <th
                      key={col}
                      style={{
                        padding: "12px 16px",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        textAlign: col === "Actions" ? "right" : "left",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filtered.map((p, i) => (
                    <motion.tr
                      key={p.id}
                      layout
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => setSelected(p === selected ? null : p)}
                      style={{
                        minHeight: 64,
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        cursor: "pointer",
                        transition: "background 0.15s",
                        background: selected?.id === p.id ? `${COACH_ACCENT}08` : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (selected?.id !== p.id) {
                          e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          selected?.id === p.id ? `${COACH_ACCENT}08` : "transparent";
                      }}
                    >
                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "var(--text-muted)",
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            background: "rgba(255,255,255,0.05)",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {p.number}
                        </span>
                      </td>

                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 12,
                              background: p.avatarBg,
                              border: `2px solid ${p.avatarColor}40`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 15,
                              fontWeight: 800,
                              color: p.avatarColor,
                              flexShrink: 0,
                              boxShadow: `0 0 12px ${p.avatarColor}25`,
                            }}
                          >
                            {getInitials(p.name)}
                          </div>
                          <div>
                            <p
                              style={{
                                fontSize: 14,
                                fontWeight: 700,
                                color: "var(--text-primary)",
                                letterSpacing: "0.01em",
                                marginBottom: 3,
                              }}
                            >
                              {p.name}
                            </p>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: p.avatarColor,
                                background: p.avatarBg,
                                border: `1px solid ${p.avatarColor}30`,
                                padding: "2px 8px",
                                borderRadius: 6,
                              }}
                            >
                              {translatePosition(p.position)}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                          {p.age ?? "—"}
                        </span>
                      </td>

                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            color: p.statusColor,
                            background: p.statusBg,
                            border: `1px solid ${p.statusColor}40`,
                            padding: "5px 12px",
                            borderRadius: 99,
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: p.statusColor,
                              boxShadow: `0 0 6px ${p.statusColor}`,
                            }}
                          />
                          {p.status}
                        </span>
                      </td>

                      <td style={{ padding: "14px 16px", minWidth: 120 }}>
                        {p.fatigue !== null ? (
                          <div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: 4,
                              }}
                            >
                              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Fatigue</span>
                              <span
                                style={{
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color:
                                    p.fatigue >= 70
                                      ? "#ef4444"
                                      : p.fatigue >= 40
                                        ? "#f59e0b"
                                        : "#22c55e",
                                }}
                              >
                                {p.fatigue}%
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
                              <div
                                style={{
                                  width: `${p.fatigue}%`,
                                  height: "100%",
                                  borderRadius: 99,
                                  background:
                                    p.fatigue >= 70
                                      ? "#ef4444"
                                      : p.fatigue >= 40
                                        ? "#f59e0b"
                                        : "#22c55e",
                                  transition: "width 0.6s ease",
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span
                            style={{
                              fontSize: 11,
                              color: "var(--text-muted)",
                              fontStyle: "italic",
                            }}
                          >
                            Non renseignée
                          </span>
                        )}
                      </td>

                      <td style={{ padding: "14px 16px" }}>
                        {p.chargeStatut ? (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              padding: "4px 10px",
                              borderRadius: 99,
                              background:
                                p.chargeStatut === "Critique"
                                  ? "rgba(239,68,68,0.15)"
                                  : p.chargeStatut === "Attention"
                                    ? "rgba(245,158,11,0.15)"
                                    : "rgba(34,197,94,0.15)",
                              color:
                                p.chargeStatut === "Critique"
                                  ? "#ef4444"
                                  : p.chargeStatut === "Attention"
                                    ? "#f59e0b"
                                    : "#22c55e",
                              border: `1px solid ${
                                p.chargeStatut === "Critique"
                                  ? "#ef444440"
                                  : p.chargeStatut === "Attention"
                                    ? "#f59e0b40"
                                    : "#22c55e40"
                              }`,
                            }}
                          >
                            {p.chargeStatut}
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>—</span>
                        )}
                      </td>

                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/coach/player/${p.id}`);
                          }}
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "var(--accent)",
                            background: "rgba(255,122,0,0.10)",
                            border: "1px solid rgba(255,122,0,0.25)",
                            borderRadius: 8,
                            padding: "6px 14px",
                            cursor: "pointer",
                            transition: "all 0.15s",
                            whiteSpace: "nowrap",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(255,122,0,0.20)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(255,122,0,0.10)";
                          }}
                        >
                          Voir fiche →
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                Aucun joueur trouvé
              </div>
            )}
          </div>
        </CCard>

        <AnimatePresence mode="wait">
          {selected && selectedReadiness ? (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <CCard glow>
                <div className="mb-3 flex items-start gap-3">
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-sm font-black"
                    style={{ background: selected.avatarBg, color: selected.avatarColor }}
                  >
                    {getInitials(selected.name)}
                  </div>
                  <div>
                    <p className="font-extrabold" style={{ color: "var(--text-primary)" }}>
                      {selected.name}
                    </p>
                    <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                      {selected.positionFull}
                      {selected.age ? ` · ${selected.age} ans` : ""}
                    </p>
                    <ColoredStatusBadge
                      label={selected.status}
                      color={selected.statusColor}
                      bg={selected.statusBg}
                    />
                  </div>
                </div>

                <div
                  className="mb-3 rounded-xl border p-3"
                  style={{
                    background: `${selectedReadiness.color}10`,
                    borderColor: `${selectedReadiness.color}30`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full border-4"
                      style={{ borderColor: selectedReadiness.color }}
                    >
                      <span className="text-lg font-extrabold" style={{ color: selectedReadiness.color }}>
                        {selectedReadiness.score}
                      </span>
                      <span className="text-[8px]" style={{ color: "var(--text-muted)" }}>
                        /100
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: selectedReadiness.color }}>
                        {selectedReadiness.label}
                      </p>
                      <p className="mt-0.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
                        Confiance: {selectedReadiness.confidence}%
                      </p>
                      <p className="mt-1 text-[10px]" style={{ color: "var(--text-secondary)" }}>
                        {selectedReadiness.recommendation}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-3 grid grid-cols-3 gap-2">
                  {[
                    { label: "Buts", color: "#22c55e" },
                    { label: "Passes D.", color: "#3b82f6" },
                    { label: "Matchs", color: COACH_ACCENT },
                  ].map((m) => (
                    <div
                      key={m.label}
                      className="rounded-xl border p-2 text-center"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        borderColor: "rgba(255,255,255,0.06)",
                      }}
                    >
                      <p className="text-lg font-extrabold" style={{ color: m.color }}>
                        —
                      </p>
                      <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>
                        {m.label}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mb-3 text-center text-[9px]" style={{ color: "var(--text-muted)" }}>
                  Stats disponibles après saisie des matchs
                </p>

                {selected.injury ? (
                  <div
                    className="mb-3 rounded-xl border p-2.5"
                    style={{
                      background: "rgba(239,68,68,0.10)",
                      borderColor: "rgba(239,68,68,0.30)",
                    }}
                  >
                    <p className="text-xs font-bold" style={{ color: "#ef4444" }}>
                      🩺 {selected.injury} — Retour: {selected.returnDate ?? "—"}
                    </p>
                  </div>
                ) : null}

                <div className="space-y-2">
                  {selected.fatigue !== null ||
                  selected.forme !== null ||
                  selected.recovery !== null ? (
                    [
                      { label: "Charge", value: selected.forme, color: COACH_ACCENT },
                      { label: "Fatigue", value: selected.fatigue, color: fatigueColor(selected.fatigue ?? 0) },
                      { label: "Récupération", value: selected.recovery, color: "#22c55e" },
                    ].map(({ label, value, color }) =>
                      value !== null ? (
                        <div key={label}>
                          <div className="mb-0.5 flex justify-between text-[10px]">
                            <span style={{ color: "var(--text-muted)" }}>{label}</span>
                            <span className="font-bold" style={{ color }}>
                              {value}%
                            </span>
                          </div>
                          <Gauge value={value} color={color} />
                        </div>
                      ) : null,
                    )
                  ) : (
                    <div
                      className="rounded-xl border border-dashed p-4 text-center"
                      style={{ borderColor: "rgba(255,255,255,0.1)" }}
                    >
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Données de charge non encore renseignées par le préparateur physique.
                      </p>
                    </div>
                  )}
                </div>
              </CCard>

              <div className="flex flex-wrap gap-2">
                <motion.button
                  type="button"
                  onClick={() => navigate(`/coach/player/${selected.id}`)}
                  className="flex-1 rounded-xl py-2 text-xs font-bold text-white"
                  style={{ background: `linear-gradient(135deg,${COACH_ACCENT},#E66000)` }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  Voir fiche complète
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <CCard className="flex flex-col items-center justify-center py-16">
                <div className="mb-3 text-4xl">👤</div>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Sélectionner un joueur
                </p>
              </CCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </CoachPageTransition>
  );
}
