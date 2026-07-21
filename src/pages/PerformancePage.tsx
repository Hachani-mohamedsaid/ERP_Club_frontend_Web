import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Activity,
  TrendingUp,
  HeartPulse,
  Zap,
  CheckCircle2,
  Loader2,
  Calendar,
  Target,
} from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { clubApi } from "../lib/api/club";
import { apiFetch } from "../lib/api/authHeaders";
import {
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLORS = {
  danger: { main: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.25)" },
  warning: { main: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)" },
  success: { main: "#22c55e", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.25)" },
  info: { main: "#3b82f6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.25)" },
  purple: { main: "#8b5cf6", bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.25)" },
  orange: { main: "#ff7a00", bg: "rgba(255,122,0,0.12)", border: "rgba(255,122,0,0.25)" },
  teal: { main: "#0d9488", bg: "rgba(13,148,136,0.12)", border: "rgba(13,148,136,0.25)" },
};

type ColorSet = (typeof COLORS)[keyof typeof COLORS];

const getAvatarColor = (name: string) => {
  const palette = [
    { bg: "rgba(255,122,0,0.18)", color: "#ff7a00" },
    { bg: "rgba(59,130,246,0.18)", color: "#3b82f6" },
    { bg: "rgba(16,185,129,0.18)", color: "#10b981" },
    { bg: "rgba(139,92,246,0.18)", color: "#8b5cf6" },
    { bg: "rgba(219,39,119,0.18)", color: "#db2777" },
    { bg: "rgba(245,158,11,0.18)", color: "#f59e0b" },
    { bg: "rgba(13,148,136,0.18)", color: "#0d9488" },
  ];
  return palette[(name ?? "A").charCodeAt(0) % palette.length];
};

const translatePosition = (pos: string): string => {
  const map: Record<string, string> = {
    ST: "Attaquant",
    BU: "Buteur",
    MC: "Milieu central",
    MD: "Milieu défensif",
    DC: "Défenseur central",
    LB: "Latéral gauche",
    RB: "Latéral droit",
    GK: "Gardien",
    AG: "Ailier gauche",
    AD: "Ailier droit",
    MOC: "Milieu offensif",
  };
  return map[pos] ?? pos;
};

export function PerformancePage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [injuries, setInjuries] = useState<any[]>([]);
  const [chargeData, setChargeData] = useState<any[]>([]);
  const [statsData, setStatsData] = useState<Record<string, any>>({});
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let playersRes: any[] = [];
      let injuriesRes: any[] = [];
      let chargeRes: any[] = [];
      let calendarRes: any[] = [];

      try {
        playersRes = (await clubApi.getPlayers()) as any[];
      } catch (e) {
        console.warn(e);
      }

      try {
        const r = (await clubApi.getInjuries()) as any;
        injuriesRes = r?.injured ?? [];
      } catch (e) {
        console.warn(e);
      }

      try {
        const r = await apiFetch("/club/preparateur/charge");
        if (r.ok) {
          const j = await r.json();
          chargeRes = j?.rows ?? j ?? [];
          if (!Array.isArray(chargeRes)) chargeRes = [];
        }
      } catch (e) {
        console.warn(e);
      }

      try {
        const r = await apiFetch("/club/calendar");
        if (r.ok) {
          const j = await r.json();
          calendarRes = Array.isArray(j) ? j : j?.events ?? j?.data ?? [];
        }
      } catch (e) {
        console.warn(e);
      }

      const statsMap: Record<string, any> = {};
      await Promise.all(
        playersRes.map(async (p: any) => {
          try {
            const r = await apiFetch(`/club/players/${p.id}/stats`);
            if (r.ok) statsMap[p.id] = await r.json();
          } catch {
            /* ignore */
          }
        }),
      );

      setPlayers(playersRes);
      setInjuries(injuriesRes);
      setChargeData(chargeRes);
      setStatsData(statsMap);
      setSessions(
        calendarRes.filter((e: any) =>
          (e.eventType ?? e.type ?? "").toUpperCase().includes("ENTR"),
        ),
      );
      setLoading(false);
    })();
  }, []);

  const enriched = useMemo(
    () =>
      players.map((p: any) => {
        const charge = chargeData.find((c) => c.id === p.id);
        const stats = statsData[p.id];
        const injury = injuries.find((inj: any) => {
          const injName = (inj.name ?? inj.playerName ?? "").toLowerCase().trim();
          const pName = (p.fullName ?? p.name ?? "").toLowerCase().trim();
          return injName === pName || injName.includes(pName) || pName.includes(injName);
        });
        const fatigue = charge?.fatigueScore ?? null;
        const load = charge?.loadScore ?? null;
        const recovery = charge?.recoveryScore ?? null;
        const form = stats?.form ?? null;
        const chargeStatus = charge?.statut ?? null;

        const statusNorm = (p.status ?? "").toUpperCase().trim();
        const statusScore = statusNorm === "DISPONIBLE" ? 100 : statusNorm === "LIMITE" ? 50 : 0;
        const fatigueContrib = fatigue !== null ? 100 - fatigue : 75;
        const readiness = Math.round(statusScore * 0.4 + fatigueContrib * 0.35 + (form ?? 75) * 0.25);

        return {
          id: p.id,
          name: p.fullName ?? p.name ?? "Joueur",
          position: p.position ?? "—",
          status: p.status ?? "",
          fatigue,
          load,
          recovery,
          form,
          chargeStatus,
          injury,
          readiness,
        };
      }),
    [players, chargeData, statsData, injuries],
  );

  const disponibles = enriched.filter((p) => {
    const s = (p.status ?? "").toUpperCase().trim();
    return s === "DISPONIBLE" && !p.injury;
  }).length;

  const blesses = enriched.filter((p) => {
    const s = (p.status ?? "").toUpperCase().trim();
    return s === "BLESSE" || s === "BLESSÉ" || !!p.injury;
  }).length;

  const surcharge = enriched.filter((p) => p.chargeStatus === "Critique").length;

  const aRisque = enriched.filter(
    (p) =>
      (p.fatigue ?? 0) >= 70 ||
      p.chargeStatus === "Critique" ||
      !!p.injury,
  ).length;

  const avgFatigue = (() => {
    const withData = enriched.filter((p) => p.fatigue !== null);
    if (withData.length === 0) return null;
    return Math.round(withData.reduce((s, p) => s + p.fatigue!, 0) / withData.length);
  })();

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);
  const weekSessions = sessions.filter((s: any) => {
    const d = new Date(s.eventDate ?? s.date ?? "");
    return d >= weekStart && d <= today;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "var(--text-primary)",
          }}
        >
          Performance de l&apos;Effectif
        </h1>
        <p
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
            marginTop: 3,
          }}
        >
          Santé, charge physique et classement interne
        </p>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Loader2
            size={32}
            className="animate-spin"
            style={{
              color: "var(--text-muted)",
              margin: "0 auto",
            }}
          />
        </div>
      )}

      {!loading && (
        <>
          {/* Section 1: KPI cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 12,
            }}
          >
            {[
              {
                label: "Joueurs disponibles",
                value: disponibles,
                sub: `sur ${players.length} total`,
                c: COLORS.success,
                icon: CheckCircle2,
              },
              {
                label: "Joueurs à risque",
                value: aRisque,
                sub: "fatigue ≥ 70% ou charge critique",
                c: COLORS.danger,
                icon: AlertTriangle,
              },
              {
                label: "Fatigue moyenne",
                value: avgFatigue !== null ? `${avgFatigue}%` : "—",
                sub:
                  avgFatigue !== null
                    ? avgFatigue >= 70
                      ? "Niveau élevé — attention"
                      : avgFatigue >= 40
                        ? "Niveau modéré"
                        : "Niveau bas — bonne récupération"
                    : "Données non disponibles",
                c:
                  avgFatigue !== null
                    ? avgFatigue >= 70
                      ? COLORS.danger
                      : avgFatigue >= 40
                        ? COLORS.warning
                        : COLORS.success
                    : COLORS.info,
                icon: Activity,
              },
              {
                label: "Séances cette semaine",
                value: weekSessions.length,
                sub:
                  weekSessions.length > 0
                    ? `Dernière: ${
                        weekSessions[weekSessions.length - 1]?.title?.split("—")[0]?.trim() ?? "—"
                      }`
                    : "Aucune séance enregistrée",
                c: COLORS.purple,
                icon: Calendar,
              },
            ].map((k, i) => {
              const KIcon = k.icon;
              return (
                <motion.div
                  key={k.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  style={{
                    padding: "18px 20px",
                    borderRadius: 16,
                    background: k.c.bg,
                    border: `1px solid ${k.c.border}`,
                    borderLeft: `4px solid ${k.c.main}`,
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
                      background: `${k.c.main}20`,
                      border: `1px solid ${k.c.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <KIcon size={22} style={{ color: k.c.main }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 32,
                        fontWeight: 900,
                        color: k.c.main,
                        lineHeight: 1,
                      }}
                    >
                      {k.value}
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--text-muted)",
                        marginTop: 5,
                      }}
                    >
                      {k.label}
                    </p>
                    <p
                      style={{
                        fontSize: 10,
                        color: "var(--text-muted)",
                        marginTop: 2,
                        opacity: 0.7,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {k.sub}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Section 2: 2-column grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            <GlassCard raised className="p-5">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: COLORS.orange.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TrendingUp size={14} style={{ color: COLORS.orange.main }} />
                </div>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}
                >
                  Classement interne
                </p>
              </div>

              {enriched.length === 0 ? (
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text-muted)",
                    textAlign: "center",
                    padding: "20px 0",
                  }}
                >
                  Aucun joueur enregistré
                </p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  {[...enriched]
                    .sort((a, b) => b.readiness - a.readiness)
                    .map((p, i) => {
                      const av = getAvatarColor(p.name);
                      const readColor =
                        p.readiness >= 75
                          ? COLORS.success.main
                          : p.readiness >= 50
                            ? COLORS.warning.main
                            : COLORS.danger.main;
                      return (
                        <motion.div
                          key={p.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "10px 12px",
                            borderRadius: 10,
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 800,
                              color: "var(--text-muted)",
                              minWidth: 20,
                            }}
                          >
                            #{i + 1}
                          </span>

                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 9,
                              background: av.bg,
                              color: av.color,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 12,
                              fontWeight: 800,
                              flexShrink: 0,
                            }}
                          >
                            {p.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
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
                              {p.name}
                            </p>
                            <p
                              style={{
                                fontSize: 10,
                                color: "var(--text-muted)",
                              }}
                            >
                              {translatePosition(p.position)}
                            </p>
                          </div>

                          <div
                            style={{
                              textAlign: "right",
                              flexShrink: 0,
                              minWidth: 80,
                            }}
                          >
                            <div
                              style={{
                                height: 4,
                                borderRadius: 99,
                                background: "rgba(255,255,255,0.08)",
                                overflow: "hidden",
                                marginBottom: 4,
                              }}
                            >
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${p.readiness}%` }}
                                transition={{ duration: 0.6, delay: i * 0.06 }}
                                style={{
                                  height: "100%",
                                  borderRadius: 99,
                                  background: readColor,
                                }}
                              />
                            </div>
                            <p
                              style={{
                                fontSize: 12,
                                fontWeight: 800,
                                color: readColor,
                              }}
                            >
                              {p.readiness}/100
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              )}
            </GlassCard>

            <GlassCard raised className="p-5">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: COLORS.danger.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AlertTriangle size={14} style={{ color: COLORS.danger.main }} />
                </div>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}
                >
                  Alertes performance
                </p>
              </div>

              {(() => {
                const alerts: {
                  player: string;
                  msg: string;
                  sub: string;
                  c: ColorSet;
                  icon: LucideIcon;
                }[] = [];

                enriched.forEach((p) => {
                  if (p.injury) {
                    alerts.push({
                      player: p.name,
                      msg: `Blessure active — ${p.injury.injury}`,
                      sub: `Retour: ${p.injury.returnDate ?? "—"}`,
                      c: COLORS.danger,
                      icon: HeartPulse,
                    });
                  }
                  if (!p.injury && (p.fatigue ?? 0) >= 70) {
                    alerts.push({
                      player: p.name,
                      msg: `Fatigue élevée — ${p.fatigue}%`,
                      sub: "Repos recommandé avant le prochain match",
                      c: COLORS.warning,
                      icon: Zap,
                    });
                  }
                  if (p.chargeStatus === "Critique") {
                    alerts.push({
                      player: p.name,
                      msg: "Charge critique détectée",
                      sub: "Réduire la charge — risque blessure",
                      c: COLORS.danger,
                      icon: AlertTriangle,
                    });
                  }
                  if (
                    !p.injury &&
                    (p.fatigue ?? 100) < 30 &&
                    (p.status ?? "").toUpperCase().trim() === "DISPONIBLE"
                  ) {
                    alerts.push({
                      player: p.name,
                      msg: "Joueur bien récupéré",
                      sub: "Peut encaisser une charge élevée",
                      c: COLORS.success,
                      icon: CheckCircle2,
                    });
                  }
                });

                if (alerts.length === 0) {
                  return (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "32px 0",
                      }}
                    >
                      <CheckCircle2
                        size={32}
                        style={{
                          color: COLORS.success.main,
                          margin: "0 auto 10px",
                        }}
                      />
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: COLORS.success.main,
                        }}
                      >
                        Aucune alerte
                      </p>
                      <p
                        style={{
                          fontSize: 11,
                          color: "var(--text-muted)",
                          marginTop: 4,
                        }}
                      >
                        Effectif en bonne condition générale
                      </p>
                    </div>
                  );
                }

                return (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    {alerts.slice(0, 6).map((a, i) => {
                      const AIcon = a.icon;
                      return (
                        <motion.div
                          key={`${a.player}-${a.msg}-${i}`}
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 10,
                            padding: "10px 12px",
                            borderRadius: 10,
                            background: a.c.bg,
                            border: `1px solid ${a.c.border}`,
                            borderLeft: `3px solid ${a.c.main}`,
                          }}
                        >
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 8,
                              background: `${a.c.main}20`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <AIcon size={13} style={{ color: a.c.main }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: "var(--text-primary)",
                                marginBottom: 2,
                              }}
                            >
                              {a.player}
                            </p>
                            <p
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: a.c.main,
                              }}
                            >
                              {a.msg}
                            </p>
                            <p
                              style={{
                                fontSize: 10,
                                color: "var(--text-muted)",
                                marginTop: 2,
                              }}
                            >
                              {a.sub}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                );
              })()}
            </GlassCard>
          </div>

          {/* Section 3: Répartition effectif */}
          <GlassCard raised className="p-5">
            <p
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: 16,
              }}
            >
              Répartition de l&apos;effectif
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 10,
              }}
            >
              {[
                {
                  label: "Disponibles",
                  value: disponibles,
                  c: COLORS.success,
                  icon: CheckCircle2,
                },
                {
                  label: "Blessés",
                  value: blesses,
                  c: COLORS.danger,
                  icon: HeartPulse,
                },
                {
                  label: "En surveillance",
                  value: enriched.filter((p) => {
                    const s = (p.status ?? "").toUpperCase().trim();
                    return s === "LIMITE" && !p.injury;
                  }).length,
                  c: COLORS.warning,
                  icon: AlertTriangle,
                },
                {
                  label: "Surcharge",
                  value: surcharge,
                  c: COLORS.purple,
                  icon: Zap,
                },
              ].map((item, i) => {
                const ItemIcon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    style={{
                      padding: "16px",
                      borderRadius: 14,
                      background: item.c.bg,
                      border: `1px solid ${item.c.border}`,
                      borderTop: `3px solid ${item.c.main}`,
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: `${item.c.main}20`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 10px",
                      }}
                    >
                      <ItemIcon size={18} style={{ color: item.c.main }} />
                    </div>
                    <p
                      style={{
                        fontSize: 28,
                        fontWeight: 900,
                        color: item.c.main,
                        lineHeight: 1,
                      }}
                    >
                      {item.value}
                    </p>
                    <p
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--text-muted)",
                        marginTop: 6,
                      }}
                    >
                      {item.label}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </GlassCard>

          {/* Section 4: Charge par joueur */}
          {chargeData.length > 0 && (
            <GlassCard raised className="p-5">
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: 16,
                }}
              >
                Charge physique par joueur
              </p>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={enriched
                      .filter((p) => p.fatigue !== null)
                      .map((p) => ({
                        name: p.name.split(" ")[0],
                        fatigue: p.fatigue,
                        charge: p.load,
                      }))}
                    margin={{ top: 4, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                      axisLine={false}
                      tickLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(14,10,35,0.95)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        borderRadius: 10,
                        fontSize: 12,
                      }}
                    />
                    <Bar
                      dataKey="fatigue"
                      name="Fatigue %"
                      radius={[4, 4, 0, 0]}
                      fill="#ef4444"
                      fillOpacity={0.85}
                    />
                    <Bar
                      dataKey="charge"
                      name="Charge %"
                      radius={[4, 4, 0, 0]}
                      fill="#ff7a00"
                      fillOpacity={0.85}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  justifyContent: "center",
                  marginTop: 10,
                }}
              >
                {[
                  { color: "#ef4444", label: "Fatigue" },
                  { color: "#ff7a00", label: "Charge" },
                ].map((l) => (
                  <div
                    key={l.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 3,
                        background: l.color,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--text-muted)",
                      }}
                    >
                      {l.label}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {chargeData.length === 0 && (
            <GlassCard raised className="p-5">
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: 8,
                }}
              >
                Charge physique par joueur
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  textAlign: "center",
                  padding: "20px 0",
                  fontStyle: "italic",
                }}
              >
                Données disponibles après saisie par le préparateur physique
              </p>
            </GlassCard>
          )}

          {/* Section 5: Historique séances */}
          <GlassCard raised className="p-5">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: COLORS.purple.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Target size={14} style={{ color: COLORS.purple.main }} />
              </div>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                Séances récentes
              </p>
            </div>

            {sessions.slice(0, 5).length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px 0",
                }}
              >
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text-muted)",
                  }}
                >
                  Aucune séance enregistrée
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    marginTop: 4,
                    opacity: 0.7,
                  }}
                >
                  Créez des séances depuis Training Builder
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {sessions
                  .sort((a: any, b: any) =>
                    (b.eventDate ?? b.date ?? "").localeCompare(a.eventDate ?? a.date ?? ""),
                  )
                  .slice(0, 5)
                  .map((s: any, i: number) => {
                    const typeKey = s.title?.split("—")[0]?.trim() ?? "";
                    const typeColorMap: Record<string, string> = {
                      Physique: "#ef4444",
                      Tactique: "#8b5cf6",
                      Technique: "#3b82f6",
                      Vidéo: "#f59e0b",
                      Match: "#22c55e",
                      Récupération: "#0d9488",
                    };
                    const tc = typeColorMap[typeKey] ?? "#ff7a00";
                    const sDate = new Date(s.eventDate ?? s.date ?? "");
                    const isPast = sDate < new Date();
                    return (
                      <motion.div
                        key={s.id ?? i}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "10px 14px",
                          borderRadius: 10,
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          borderLeft: `3px solid ${tc}`,
                        }}
                      >
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 9,
                            background: `${tc}18`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Calendar size={14} style={{ color: tc }} />
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
                            {s.title ?? "Séance"}
                          </p>
                          <p
                            style={{
                              fontSize: 11,
                              color: "var(--text-muted)",
                              marginTop: 2,
                            }}
                          >
                            {sDate.toLocaleDateString("fr-FR", {
                              weekday: "long",
                              day: "numeric",
                              month: "short",
                            })}
                            {s.location ? ` · ${s.location}` : ""}
                          </p>
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: isPast ? COLORS.success.main : COLORS.info.main,
                            background: isPast ? COLORS.success.bg : COLORS.info.bg,
                            border: `1px solid ${isPast ? COLORS.success.border : COLORS.info.border}`,
                            padding: "3px 10px",
                            borderRadius: 99,
                            flexShrink: 0,
                          }}
                        >
                          {isPast ? "Effectuée" : "À venir"}
                        </span>
                      </motion.div>
                    );
                  })}
              </div>
            )}
          </GlassCard>
        </>
      )}
    </div>
  );
}
