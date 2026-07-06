import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  Calendar,
  Loader2,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { CoachPageTransition, CCard, COACH_ACCENT, TOOLTIP_STYLE } from "../../components/coach2/CoachPageTransition";
import { clubApi } from "../../lib/api/club";
import { apiFetch } from "../../lib/api/authHeaders";

type MedFilter = "Tous" | "Blessé" | "Surveillance" | "Suspendu" | "Disponible";

type ColorScheme = {
  main: string;
  bg: string;
  border: string;
  glow: string;
};

const COLORS = {
  danger: {
    main: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.25)",
    glow: "0 0 20px rgba(239,68,68,0.15)",
  },
  warning: {
    main: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.25)",
    glow: "0 0 20px rgba(245,158,11,0.15)",
  },
  purple: {
    main: "#8b5cf6",
    bg: "rgba(139,92,246,0.12)",
    border: "rgba(139,92,246,0.25)",
    glow: "0 0 20px rgba(139,92,246,0.15)",
  },
  success: {
    main: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.25)",
    glow: "0 0 20px rgba(34,197,94,0.15)",
  },
  blue: {
    main: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
    border: "rgba(59,130,246,0.25)",
    glow: "0 0 20px rgba(59,130,246,0.15)",
  },
  teal: {
    main: "#0d9488",
    bg: "rgba(13,148,136,0.12)",
    border: "rgba(13,148,136,0.25)",
    glow: "0 0 20px rgba(13,148,136,0.15)",
  },
  grey: {
    main: "#6b7280",
    bg: "rgba(107,114,128,0.10)",
    border: "rgba(107,114,128,0.20)",
    glow: "none",
  },
} satisfies Record<string, ColorScheme>;

const getInjuryColor = (injury: string): ColorScheme => {
  const lower = (injury ?? "").toLowerCase();
  if (lower.includes("hamstring") || lower.includes("ischio")) return COLORS.danger;
  if (lower.includes("cheville") || lower.includes("genou")) return COLORS.warning;
  if (lower.includes("tete") || lower.includes("tête") || lower.includes("inflammation"))
    return COLORS.purple;
  if (lower.includes("dos") || lower.includes("epaule")) return COLORS.blue;
  return COLORS.teal;
};

const getStatusColor = (status: string): ColorScheme => {
  if (status === "Blessé") return COLORS.danger;
  if (status === "Surveillance") return COLORS.warning;
  if (status === "Suspendu") return COLORS.purple;
  return COLORS.success;
};

const getFilterColor = (f: MedFilter): ColorScheme => {
  if (f === "Blessé") return COLORS.danger;
  if (f === "Surveillance") return COLORS.warning;
  if (f === "Suspendu") return COLORS.purple;
  if (f === "Disponible") return COLORS.success;
  return {
    main: COACH_ACCENT,
    bg: `${COACH_ACCENT}18`,
    border: `${COACH_ACCENT}30`,
    glow: "none",
  };
};

interface SquadMember {
  id: string;
  name: string;
  number: number;
  positionFull: string;
  status: string;
  statusColor: string;
  fatigue: number | null;
  injury: string | null;
  returnDate: string | null;
  returnDays: number | null;
}

interface ReturnTimelineItem {
  name: string;
  days: number;
  injury: string;
}

function parseReturnDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? null : d;
}

function calcDaysUntilReturn(dateStr: string): number | null {
  const d = parseReturnDate(dateStr);
  if (!d) return null;
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
}

function mapSquad(
  playersData: Record<string, unknown>[],
  injuriesData: Record<string, unknown>[],
  chargeData: Record<string, unknown>[],
): SquadMember[] {
  return playersData.map((p, i) => {
    const fullName = String(p.fullName ?? p.name ?? "Joueur");
    const injury = injuriesData.find(
      (inj) => String(inj.name ?? "").toLowerCase() === fullName.toLowerCase(),
    );
    const charge = chargeData.find((c) => c.id === p.id);
    const hasInjury = injuriesData.some(
      (inj) => String(inj.name ?? "").toLowerCase() === fullName.toLowerCase(),
    );

    let statusLabel = (() => {
      const s = String(p.status ?? "").toUpperCase().trim();
      if (s === "DISPONIBLE") return "Disponible";
      if (s === "BLESSE" || s === "BLESSÉ") return "Blessé";
      if (s === "LIMITE" || s === "LIMITÉ") return "Surveillance";
      if (s === "FIN_CONTRAT") return "Suspendu";
      return "Disponible";
    })();

    if (hasInjury) statusLabel = "Blessé";

    const statusColor = getStatusColor(statusLabel).main;
    const returnDate = injury?.returnDate ? String(injury.returnDate) : null;

    return {
      id: String(p.id ?? `player-${i}`),
      name: fullName,
      number: i + 1,
      positionFull: String(p.position ?? "—"),
      status: statusLabel,
      statusColor,
      fatigue: charge?.fatigueScore != null ? Number(charge.fatigueScore) : null,
      injury: injury?.injury ? String(injury.injury) : null,
      returnDate,
      returnDays: returnDate ? calcDaysUntilReturn(returnDate) : null,
    };
  });
}

function getFatigueColor(fatigue: number): ColorScheme {
  if (fatigue >= 70) return COLORS.danger;
  if (fatigue >= 40) return COLORS.warning;
  return COLORS.success;
}

export function CoachMedicalPage() {
  const [filter, setFilter] = useState<MedFilter>("Tous");
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [playersData, setPlayersData] = useState<Record<string, unknown>[]>([]);
  const [injuriesData, setInjuriesData] = useState<Record<string, unknown>[]>([]);
  const [chargeData, setChargeData] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      let players: Record<string, unknown>[] = [];
      let injuries: Record<string, unknown>[] = [];
      let charge: Record<string, unknown>[] = [];

      try {
        const res = await clubApi.getPlayers();
        players = Array.isArray(res) ? (res as Record<string, unknown>[]) : [];
      } catch (e) {
        console.warn(e);
      }

      try {
        const res = (await clubApi.getInjuries()) as Record<string, unknown>;
        injuries = Array.isArray(res?.injured) ? (res.injured as Record<string, unknown>[]) : [];
      } catch (e) {
        console.warn(e);
      }

      try {
        const res = await apiFetch("/club/preparateur/charge");
        if (res.ok) {
          const json = (await res.json()) as Record<string, unknown>;
          charge = Array.isArray(json?.rows)
            ? (json.rows as Record<string, unknown>[])
            : Array.isArray(json)
              ? (json as Record<string, unknown>[])
              : [];
        }
      } catch (e) {
        console.warn(e);
      }

      if (cancelled) return;
      setPlayersData(players);
      setInjuriesData(injuries);
      setChargeData(charge);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const squad = useMemo(
    () => mapSquad(playersData, injuriesData, chargeData),
    [playersData, injuriesData, chargeData],
  );

  const filtered = useMemo(
    () => squad.filter((p) => filter === "Tous" || p.status === filter),
    [squad, filter],
  );

  const injured = squad.filter((p) => p.injury !== null).length;
  const surveill = squad.filter((p) => p.status === "Surveillance").length;
  const suspended = squad.filter((p) => p.status === "Suspendu").length;
  const avail = squad.filter((p) => !p.injury && p.status === "Disponible").length;

  const returnTimeline = useMemo<ReturnTimelineItem[]>(() => {
    return injuriesData
      .filter((inj) => inj.returnDate)
      .map((inj) => {
        const returnDate = String(inj.returnDate);
        const injuryLabel = String(inj.injury ?? "Blessure");
        const days = calcDaysUntilReturn(returnDate) ?? 0;
        return {
          name: String(inj.name ?? "Joueur"),
          days,
          injury: injuryLabel,
        };
      })
      .sort((a, b) => a.days - b.days);
  }, [injuriesData]);

  const fatigueCols = useMemo(
    () =>
      squad
        .filter((p) => p.fatigue !== null)
        .sort((a, b) => (b.fatigue ?? 0) - (a.fatigue ?? 0))
        .slice(0, 10)
        .map((p) => ({
          name: p.name.split(" ")[0],
          fatigue: p.fatigue as number,
        })),
    [squad],
  );

  const sel = selected ? squad.find((p) => p.id === selected) : null;
  const selRowColor = sel ? getStatusColor(sel.status) : COLORS.success;

  const KPIS = [
    { label: "Blessés", value: injured, c: COLORS.danger, Icon: AlertTriangle },
    { label: "Surveillance", value: surveill, c: COLORS.warning, Icon: Activity },
    { label: "Suspendus", value: suspended, c: COLORS.purple, Icon: Clock },
    { label: "Disponibles", value: avail, c: COLORS.success, Icon: CheckCircle2 },
  ] as const;

  if (loading) {
    return (
      <CoachPageTransition>
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="animate-spin" size={32} style={{ color: COACH_ACCENT }} />
        </div>
      </CoachPageTransition>
    );
  }

  return (
    <CoachPageTransition>
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {KPIS.map(({ label, value, c, Icon }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            style={{
              padding: "18px 20px",
              borderRadius: 16,
              borderLeft: `4px solid ${c.main}`,
              background: c.bg,
              border: `1px solid ${c.border}`,
              boxShadow: c.glow,
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: `${c.main}20`,
                border: `1px solid ${c.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon size={22} style={{ color: c.main }} />
            </div>
            <div>
              <p
                style={{
                  fontSize: 36,
                  fontWeight: 900,
                  color: c.main,
                  lineHeight: 1,
                  textShadow: c.glow,
                }}
              >
                {value}
              </p>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginTop: 6,
                  letterSpacing: "0.02em",
                }}
              >
                {label}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Return timeline */}
      <CCard>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: COLORS.warning.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Calendar size={14} style={{ color: COLORS.warning.main }} />
          </div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
            Calendrier de retour
          </p>
          <span
            style={{
              marginLeft: "auto",
              fontSize: 11,
              fontWeight: 700,
              color: COLORS.warning.main,
              background: COLORS.warning.bg,
              border: `1px solid ${COLORS.warning.border}`,
              padding: "3px 10px",
              borderRadius: 99,
            }}
          >
            {returnTimeline.length} blessure(s)
          </span>
        </div>

        {returnTimeline.length > 0 && returnTimeline.every((r) => r.days < 0) && (
          <div
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              background: COLORS.warning.bg,
              border: `1px solid ${COLORS.warning.border}`,
              marginBottom: 10,
              fontSize: 12,
              color: COLORS.warning.main,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <AlertTriangle size={13} />
            Dates dépassées — Mettez à jour depuis le module Médical
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {returnTimeline.map((r, i) => {
            const c = getInjuryColor(r.injury);
            return (
              <motion.div
                key={`${r.name}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: c.bg,
                  border: `1px solid ${c.border}`,
                  borderLeft: `3px solid ${c.main}`,
                }}
              >
                {r.days < 0 ? (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#9ca3af",
                      background: "rgba(156,163,175,0.12)",
                      border: "1px solid rgba(156,163,175,0.25)",
                      padding: "3px 10px",
                      borderRadius: 6,
                      flexShrink: 0,
                      minWidth: 80,
                      textAlign: "center",
                    }}
                  >
                    {Math.abs(r.days)}j dépassé
                  </span>
                ) : r.days === 0 ? (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: COLORS.success.main,
                      background: COLORS.success.bg,
                      border: `1px solid ${COLORS.success.border}`,
                      padding: "3px 10px",
                      borderRadius: 6,
                      flexShrink: 0,
                      minWidth: 80,
                      textAlign: "center",
                    }}
                  >
                    Aujourd&apos;hui !
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: c.main,
                      background: c.bg,
                      border: `1px solid ${c.border}`,
                      padding: "3px 10px",
                      borderRadius: 6,
                      flexShrink: 0,
                      minWidth: 80,
                      textAlign: "center",
                    }}
                  >
                    J+{r.days}
                  </span>
                )}

                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {r.name}
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      fontWeight: 400,
                      marginLeft: 8,
                    }}
                  >
                    {r.injury}
                  </span>
                </p>

                <div style={{ width: 80, flexShrink: 0 }}>
                  <div
                    style={{
                      height: 4,
                      borderRadius: 99,
                      background: "rgba(255,255,255,0.08)",
                      overflow: "hidden",
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: r.days < 0 ? "100%" : `${Math.max(8, 100 - (r.days / 30) * 100)}%`,
                      }}
                      transition={{ duration: 0.6 }}
                      style={{
                        height: "100%",
                        borderRadius: 99,
                        background: c.main,
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {returnTimeline.length === 0 && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <CheckCircle2
              size={28}
              style={{ color: COLORS.success.main, margin: "0 auto 8px", display: "block" }}
            />
            <p style={{ fontSize: 13, color: COLORS.success.main, fontWeight: 600 }}>
              Aucun retour prévu
            </p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
              Tous les joueurs sont disponibles
            </p>
          </div>
        )}
      </CCard>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_380px]">
        {/* Player list */}
        <CCard>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              Détail joueurs ({filtered.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(["Tous", "Blessé", "Surveillance", "Suspendu", "Disponible"] as const).map((f) => {
                const fc = getFilterColor(f);
                const active = filter === f;
                return (
                  <motion.button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className="rounded-full px-3 py-1 text-[10px] font-semibold"
                    style={{
                      background: active ? fc.bg : "rgba(255,255,255,0.04)",
                      color: active ? fc.main : "var(--text-muted)",
                      border: active ? `1px solid ${fc.border}` : "1px solid transparent",
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {f}
                  </motion.button>
                );
              })}
            </div>
          </div>
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filtered.map((p, i) => {
                const rowColor = getStatusColor(p.status);
                return (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setSelected(p.id === selected ? null : p.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: `1px solid ${rowColor.border}`,
                      borderLeft: `4px solid ${rowColor.main}`,
                      background: selected === p.id ? rowColor.bg : "rgba(255,255,255,0.02)",
                      cursor: "pointer",
                      marginBottom: 6,
                      transition: "background 0.15s",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: rowColor.bg,
                        border: `1px solid ${rowColor.border}`,
                        color: rowColor.main,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {p.number}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          marginBottom: 2,
                        }}
                      >
                        {p.name}
                      </p>
                      <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.positionFull}</p>
                    </div>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        color: rowColor.main,
                        background: rowColor.bg,
                        border: `1px solid ${rowColor.border}`,
                        padding: "4px 12px",
                        borderRadius: 99,
                        flexShrink: 0,
                      }}
                    >
                      <motion.span
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: rowColor.main,
                          display: "inline-block",
                        }}
                      />
                      {p.status}
                    </span>
                    <div
                      style={{
                        textAlign: "right",
                        flexShrink: 0,
                        minWidth: 70,
                      }}
                    >
                      {p.fatigue !== null ? (
                        <>
                          <p
                            style={{
                              fontSize: 14,
                              fontWeight: 800,
                              color: getFatigueColor(p.fatigue).main,
                              lineHeight: 1,
                            }}
                          >
                            {p.fatigue}%
                          </p>
                          <p
                            style={{
                              fontSize: 10,
                              color: "var(--text-muted)",
                              marginTop: 3,
                            }}
                          >
                            fatigue
                          </p>
                        </>
                      ) : (
                        <p
                          style={{
                            fontSize: 10,
                            color: "var(--text-muted)",
                            fontStyle: "italic",
                          }}
                        >
                          N/R
                        </p>
                      )}
                    </div>
                    {p.injury && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: COLORS.danger.main,
                          background: COLORS.danger.bg,
                          border: `1px solid ${COLORS.danger.border}`,
                          borderRadius: 6,
                          padding: "3px 8px",
                          flexShrink: 0,
                          maxWidth: 110,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        🩺 {p.injury}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </CCard>

        {/* Fatigue chart + detail */}
        <div className="space-y-3">
          <AnimatePresence mode="wait">
            {sel && (
              <motion.div
                key={sel.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
              >
                <CCard>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 16,
                      paddingBottom: 12,
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: selRowColor.bg,
                        border: `2px solid ${selRowColor.main}40`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                        fontWeight: 800,
                        color: selRowColor.main,
                      }}
                    >
                      {sel.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "var(--text-primary)",
                        }}
                      >
                        {sel.name}
                      </p>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: selRowColor.main,
                          background: selRowColor.bg,
                          padding: "2px 8px",
                          borderRadius: 99,
                        }}
                      >
                        {sel.status}
                      </span>
                    </div>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    {sel.fatigue !== null ? (
                      [
                        {
                          label: "Fatigue",
                          value: sel.fatigue,
                          color: getFatigueColor(sel.fatigue).main,
                        },
                        {
                          label: "Disponibilité",
                          value: 100 - sel.fatigue,
                          color: COLORS.success.main,
                        },
                      ].map((m) => (
                        <div key={m.label} style={{ marginBottom: 10 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: 4,
                            }}
                          >
                            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                              {m.label}
                            </span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: m.color }}>
                              {m.value}%
                            </span>
                          </div>
                          <div
                            style={{
                              height: 6,
                              borderRadius: 99,
                              background: "rgba(255,255,255,0.08)",
                              overflow: "hidden",
                            }}
                          >
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${m.value}%` }}
                              transition={{ duration: 0.6 }}
                              style={{
                                height: "100%",
                                borderRadius: 99,
                                background: m.color,
                              }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p
                        style={{
                          fontSize: 12,
                          color: "var(--text-muted)",
                          fontStyle: "italic",
                          textAlign: "center",
                          padding: "12px 0",
                        }}
                      >
                        Non renseignée par le préparateur
                      </p>
                    )}
                  </div>

                  {sel.injury && (
                    <div
                      style={{
                        padding: "10px 14px",
                        borderRadius: 10,
                        background: COLORS.danger.bg,
                        border: `1px solid ${COLORS.danger.border}`,
                        borderLeft: `3px solid ${COLORS.danger.main}`,
                      }}
                    >
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: COLORS.danger.main,
                          marginBottom: 4,
                        }}
                      >
                        🩺 Blessure active
                      </p>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                        }}
                      >
                        {sel.injury}
                      </p>
                      {sel.returnDate && (
                        <p
                          style={{
                            fontSize: 11,
                            color: "var(--text-muted)",
                            marginTop: 4,
                          }}
                        >
                          Retour estimé: {sel.returnDate}
                        </p>
                      )}
                    </div>
                  )}
                </CCard>
              </motion.div>
            )}
          </AnimatePresence>
          <CCard>
            <p className="mb-2 text-xs font-bold" style={{ color: "var(--text-primary)" }}>
              Fatigue équipe (Top 10)
            </p>
            {fatigueCols.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Données de fatigue non disponibles.
                </p>
                <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                  Le préparateur physique doit enregistrer les séances.
                </p>
              </div>
            ) : (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fatigueCols} layout="vertical" barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fill: "var(--text-muted)", fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: "var(--text-muted)", fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                      width={65}
                    />
                    <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [`${v}%`, "Fatigue"]} />
                    <Bar
                      dataKey="fatigue"
                      radius={[0, 6, 6, 0]}
                      name="Fatigue"
                      fill={COLORS.warning.main}
                      fillOpacity={0.85}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CCard>
        </div>
      </div>
    </CoachPageTransition>
  );
}
