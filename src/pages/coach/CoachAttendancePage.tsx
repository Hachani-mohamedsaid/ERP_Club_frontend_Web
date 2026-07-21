import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Save,
  Users,
  MapPin,
  Target,
  Loader2,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import { CoachPageTransition, CCard } from "../../components/coach2/CoachPageTransition";
import { clubApi } from "../../lib/api/club";
import { apiFetch } from "../../lib/api/authHeaders";

type AttStatus =
  | "Présent"
  | "Retard"
  | "Absent"
  | "Exemption médicale"
  | "Sélection nationale"
  | "Congé autorisé";

const STATUS_META: Record<
  AttStatus,
  {
    color: string;
    bg: string;
    border: string;
    icon: LucideIcon;
    label: string;
    clickable: boolean;
  }
> = {
  Présent: {
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.25)",
    icon: CheckCircle2,
    label: "Présent",
    clickable: true,
  },
  Retard: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.25)",
    icon: Clock,
    label: "Retard",
    clickable: true,
  },
  Absent: {
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.25)",
    icon: XCircle,
    label: "Absent",
    clickable: true,
  },
  "Exemption médicale": {
    color: "#6b7280",
    bg: "rgba(107,114,128,0.10)",
    border: "rgba(107,114,128,0.20)",
    icon: Shield,
    label: "Exemption médicale",
    clickable: false,
  },
  "Sélection nationale": {
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
    border: "rgba(59,130,246,0.25)",
    icon: Shield,
    label: "Sélection nationale",
    clickable: true,
  },
  "Congé autorisé": {
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.12)",
    border: "rgba(139,92,246,0.25)",
    icon: Shield,
    label: "Congé autorisé",
    clickable: true,
  },
};

const CLICKABLE_CYCLE: AttStatus[] = [
  "Présent",
  "Retard",
  "Absent",
  "Sélection nationale",
  "Congé autorisé",
];

type HistoryEntry = {
  sessionId: string;
  sessionTitle: string;
  date: string;
  rate: number;
  records: Record<string, AttStatus>;
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
  };
  return map[pos] ?? pos;
};

export function CoachAttendancePage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [injuries, setInjuries] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [att, setAtt] = useState<Record<string, AttStatus>>({});
  const [sessionStatus, setSessionStatus] = useState<"planned" | "inprogress" | "done">("planned");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const stored = localStorage.getItem("odin_attendance");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    (async () => {
      let playersData: any[] = [];
      let injuriesData: any[] = [];
      let calendarData: any[] = [];

      try {
        playersData = (await clubApi.getPlayers()) as any[];
      } catch (e) {
        console.warn(e);
      }

      try {
        const res = (await clubApi.getInjuries()) as any;
        injuriesData = res?.injured ?? [];
      } catch (e) {
        console.warn(e);
      }

      try {
        const res = await apiFetch("/club/calendar");
        if (res.ok) {
          const json = await res.json();
          calendarData = Array.isArray(json) ? json : json.events ?? json.data ?? [];
        }
      } catch (e) {
        console.warn(e);
      }

      setPlayers(playersData);
      setInjuries(injuriesData);

      const trainingSessions = calendarData
        .filter((e: any) => (e.eventType ?? e.type ?? "").toUpperCase().includes("ENTR"))
        .sort((a: any, b: any) =>
          (b.eventDate ?? b.date ?? "").localeCompare(a.eventDate ?? a.date ?? ""),
        );
      setSessions(trainingSessions);

      const today = new Date().toISOString().split("T")[0];
      const todaySession = trainingSessions.find(
        (s: any) => (s.eventDate ?? s.date ?? "").slice(0, 10) === today,
      );
      const defaultSession = todaySession ?? trainingSessions[0] ?? null;
      if (defaultSession) {
        setSelectedSessionId(defaultSession.id);
      }

      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (players.length === 0) return;
    const rec: Record<string, AttStatus> = {};
    players.forEach((p: any) => {
      const isInjured = injuries.some(
        (inj: any) => inj.name?.toLowerCase() === p.fullName?.toLowerCase(),
      );
      if (isInjured || p.status === "BLESSE") {
        rec[p.id] = "Exemption médicale";
      } else if (p.status === "LIMITE") {
        rec[p.id] = "Exemption médicale";
      } else {
        rec[p.id] = "Présent";
      }
    });
    setAtt(rec);
  }, [players, injuries, selectedSessionId]);

  const selectedSession = useMemo(
    () => sessions.find((s) => s.id === selectedSessionId) ?? null,
    [sessions, selectedSessionId],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = {
      Présent: 0,
      Retard: 0,
      Absent: 0,
      "Exemption médicale": 0,
      "Sélection nationale": 0,
      "Congé autorisé": 0,
    };
    Object.values(att).forEach((s) => {
      c[s] = (c[s] ?? 0) + 1;
    });
    return c;
  }, [att]);

  const presenceRate = useMemo(() => {
    const total = players.length;
    if (total === 0) return 0;
    const present = (counts["Présent"] ?? 0) + (counts["Retard"] ?? 0);
    return Math.round((present / total) * 100);
  }, [counts, players]);

  const getPlayerInjury = (player: any) =>
    injuries.find(
      (inj: any) => inj.name?.toLowerCase() === player.fullName?.toLowerCase(),
    );

  const cycleStatus = (playerId: string) => {
    setAtt((prev) => {
      const cur = prev[playerId] ?? "Présent";
      if (!STATUS_META[cur].clickable) return prev;
      const idx = CLICKABLE_CYCLE.indexOf(cur as AttStatus);
      const next = CLICKABLE_CYCLE[(idx + 1) % CLICKABLE_CYCLE.length];
      return { ...prev, [playerId]: next };
    });
  };

  const saveAttendance = () => {
    if (!selectedSession) return;
    const record: HistoryEntry = {
      sessionId: selectedSession.id,
      sessionTitle: selectedSession.title ?? "Séance",
      date: selectedSession.eventDate ?? selectedSession.date ?? "",
      rate: presenceRate,
      records: { ...att },
    };
    const updated = [record, ...history.filter((h) => h.sessionId !== selectedSession.id)].slice(
      0,
      20,
    );
    setHistory(updated);
    try {
      localStorage.setItem("odin_attendance", JSON.stringify(updated));
    } catch {
      /* ignore */
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <CoachPageTransition>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "var(--text-primary)",
              }}
            >
              Présence à l&apos;Entraînement
            </h1>
            <p
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                marginTop: 3,
              }}
            >
              Enregistrement officiel des présences par séance
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {selectedSession && (
              <div style={{ display: "flex", gap: 6 }}>
                {(["planned", "inprogress", "done"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSessionStatus(s)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      border: "none",
                      background:
                        sessionStatus === s
                          ? s === "done"
                            ? "#22c55e"
                            : s === "inprogress"
                              ? "#ff7a00"
                              : "#3b82f6"
                          : "rgba(255,255,255,0.06)",
                      color: sessionStatus === s ? "white" : "var(--text-muted)",
                    }}
                  >
                    {s === "planned" ? "Planifiée" : s === "inprogress" ? "En cours" : "Terminée"}
                  </button>
                ))}
              </div>
            )}

            <motion.button
              type="button"
              onClick={saveAttendance}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                borderRadius: 12,
                background: saved ? "#22c55e" : "linear-gradient(135deg,#ff7a00,#e66000)",
                boxShadow: saved
                  ? "0 0 20px rgba(34,197,94,0.35)"
                  : "0 0 20px rgba(255,122,0,0.35)",
                color: "white",
                fontSize: 13,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
            >
              {saved ? (
                <>
                  <CheckCircle2 size={15} /> Sauvegardé
                </>
              ) : (
                <>
                  <Save size={15} /> Sauvegarder
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Session selector */}
        <CCard>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginBottom: 10,
            }}
          >
            Séance d&apos;entraînement
          </p>

          {sessions.length === 0 ? (
            <div
              style={{
                padding: "16px",
                borderRadius: 10,
                background: "rgba(255,122,0,0.06)",
                border: "1px solid rgba(255,122,0,0.15)",
                fontSize: 13,
                color: "var(--text-muted)",
              }}
            >
              Aucune séance trouvée — Créez des séances depuis le Training Builder
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {sessions.slice(0, 5).map((s: any) => {
                const isSelected = s.id === selectedSessionId;
                const sDate = new Date(s.eventDate ?? s.date ?? "");
                const isToday = sDate.toDateString() === new Date().toDateString();
                return (
                  <motion.button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSessionId(s.id)}
                    whileHover={{ scale: 1.02 }}
                    style={{
                      padding: "10px 16px",
                      borderRadius: 12,
                      cursor: "pointer",
                      border: `1px solid ${
                        isSelected ? "rgba(255,122,0,0.40)" : "rgba(255,255,255,0.08)"
                      }`,
                      background: isSelected ? "rgba(255,122,0,0.12)" : "rgba(255,255,255,0.03)",
                      textAlign: "left",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: isSelected ? "#ff7a00" : "var(--text-primary)",
                        marginBottom: 2,
                      }}
                    >
                      {s.title ?? "Séance"}
                    </p>
                    <p
                      style={{
                        fontSize: 10,
                        color: "var(--text-muted)",
                      }}
                    >
                      {isToday
                        ? "Aujourd'hui"
                        : sDate.toLocaleDateString("fr-FR", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                      {s.eventTime ? ` · ${s.eventTime}` : ""}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          )}
        </CCard>

        {/* Hero: session info */}
        {selectedSession && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: "18px 22px",
              borderRadius: 16,
              background: "rgba(255,122,0,0.06)",
              border: "1px solid rgba(255,122,0,0.20)",
              borderLeft: "4px solid #ff7a00",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div
              style={{
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
                  background: "rgba(255,122,0,0.15)",
                  border: "1px solid rgba(255,122,0,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Target size={22} style={{ color: "#ff7a00" }} />
              </div>
              <div>
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    marginBottom: 4,
                  }}
                >
                  {selectedSession.title ?? "Séance d'entraînement"}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    flexWrap: "wrap",
                  }}
                >
                  {selectedSession.eventTime && (
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Clock size={11} />
                      {selectedSession.eventTime}
                    </span>
                  )}
                  {selectedSession.location && (
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <MapPin size={11} />
                      {selectedSession.location}
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Users size={11} />
                    {players.length} joueurs
                  </span>
                </div>
              </div>
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color:
                  sessionStatus === "done"
                    ? "#22c55e"
                    : sessionStatus === "inprogress"
                      ? "#ff7a00"
                      : "#3b82f6",
                background:
                  sessionStatus === "done"
                    ? "rgba(34,197,94,0.12)"
                    : sessionStatus === "inprogress"
                      ? "rgba(255,122,0,0.12)"
                      : "rgba(59,130,246,0.12)",
                border: `1px solid ${
                  sessionStatus === "done"
                    ? "rgba(34,197,94,0.25)"
                    : sessionStatus === "inprogress"
                      ? "rgba(255,122,0,0.25)"
                      : "rgba(59,130,246,0.25)"
                }`,
                padding: "6px 16px",
                borderRadius: 99,
              }}
            >
              {sessionStatus === "done"
                ? "Terminée"
                : sessionStatus === "inprogress"
                  ? "En cours"
                  : "Planifiée"}
            </span>
          </motion.div>
        )}

        {/* Attendance summary */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: 8,
          }}
        >
          {[
            {
              label: "Total",
              value: players.length,
              color: "#ff7a00",
              bg: "rgba(255,122,0,0.10)",
            },
            {
              label: "Présents",
              value: counts["Présent"] ?? 0,
              color: "#22c55e",
              bg: "rgba(34,197,94,0.10)",
            },
            {
              label: "Retards",
              value: counts["Retard"] ?? 0,
              color: "#f59e0b",
              bg: "rgba(245,158,11,0.10)",
            },
            {
              label: "Absents",
              value: counts["Absent"] ?? 0,
              color: "#ef4444",
              bg: "rgba(239,68,68,0.10)",
            },
            {
              label: "Médicaux",
              value: counts["Exemption médicale"] ?? 0,
              color: "#6b7280",
              bg: "rgba(107,114,128,0.10)",
            },
            {
              label: "Présence",
              value: `${presenceRate}%`,
              color: presenceRate >= 90 ? "#22c55e" : presenceRate >= 75 ? "#f59e0b" : "#ef4444",
              bg:
                presenceRate >= 90
                  ? "rgba(34,197,94,0.10)"
                  : presenceRate >= 75
                    ? "rgba(245,158,11,0.10)"
                    : "rgba(239,68,68,0.10)",
            },
          ].map((k, i) => (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                background: k.bg,
                border: `1px solid ${k.color}25`,
                borderLeft: `3px solid ${k.color}`,
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: k.color,
                  lineHeight: 1,
                }}
              >
                {k.value}
              </p>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  marginTop: 5,
                }}
              >
                {k.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Player list */}
        <CCard>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginBottom: 14,
            }}
          >
            Liste des joueurs ({players.length})
          </p>

          {loading ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <Loader2
                size={28}
                className="animate-spin"
                style={{
                  color: "var(--text-muted)",
                  margin: "0 auto",
                }}
              />
            </div>
          ) : players.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "32px 0",
              }}
            >
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Aucun joueur enregistré</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {players.map((p: any, i: number) => {
                const status = att[p.id] ?? "Présent";
                const meta = STATUS_META[status];
                const StatusIcon = meta.icon;
                const injury = getPlayerInjury(p);
                const initials = (p.fullName ?? "?")
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);
                const playerHistory = history
                  .map((h) => h.records[p.id])
                  .filter(Boolean) as AttStatus[];
                const playerRate =
                  playerHistory.length > 0
                    ? Math.round(
                        (playerHistory.filter((s) => s === "Présent" || s === "Retard").length /
                          playerHistory.length) *
                          100,
                      )
                    : null;

                return (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => cycleStatus(p.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "12px 14px",
                      borderRadius: 12,
                      background: meta.bg,
                      border: `1px solid ${meta.border}`,
                      borderLeft: `4px solid ${meta.color}`,
                      cursor: meta.clickable ? "pointer" : "default",
                      transition: "all 0.15s",
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: `${meta.color}20`,
                        border: `1px solid ${meta.color}30`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        fontWeight: 800,
                        color: meta.color,
                        flexShrink: 0,
                      }}
                    >
                      {initials}
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
                        {p.fullName}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--text-muted)",
                          }}
                        >
                          {translatePosition(p.position ?? "—")}
                        </span>
                        {injury && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: "#6b7280",
                              background: "rgba(107,114,128,0.10)",
                              border: "1px solid rgba(107,114,128,0.20)",
                              padding: "1px 7px",
                              borderRadius: 99,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <AlertTriangle size={9} />
                            {injury.injury}
                          </span>
                        )}
                      </div>
                    </div>

                    {playerRate !== null && (
                      <div
                        style={{
                          textAlign: "right",
                          flexShrink: 0,
                        }}
                      >
                        <p
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color:
                              playerRate >= 90
                                ? "#22c55e"
                                : playerRate >= 75
                                  ? "#f59e0b"
                                  : "#ef4444",
                          }}
                        >
                          {playerRate}%
                        </p>
                        <p
                          style={{
                            fontSize: 10,
                            color: "var(--text-muted)",
                          }}
                        >
                          présence
                        </p>
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 14px",
                        borderRadius: 99,
                        background: `${meta.color}15`,
                        border: `1px solid ${meta.border}`,
                        flexShrink: 0,
                      }}
                    >
                      <StatusIcon size={13} style={{ color: meta.color }} />
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: meta.color,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {meta.label}
                      </span>
                    </div>

                    {meta.clickable && (
                      <ChevronDown
                        size={14}
                        style={{
                          color: "var(--text-muted)",
                          flexShrink: 0,
                          opacity: 0.5,
                        }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </CCard>

        {/* Attendance history */}
        {history.length > 0 && (
          <CCard>
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                marginBottom: 14,
              }}
            >
              Historique des présences
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {history.slice(0, 8).map((h, i) => {
                const date = new Date(h.date);
                const rateColor =
                  h.rate >= 90 ? "#22c55e" : h.rate >= 75 ? "#f59e0b" : "#ef4444";
                return (
                  <motion.div
                    key={h.sessionId}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "10px 14px",
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderLeft: `3px solid ${rateColor}`,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          marginBottom: 2,
                        }}
                      >
                        {h.sessionTitle}
                      </p>
                      <p
                        style={{
                          fontSize: 11,
                          color: "var(--text-muted)",
                        }}
                      >
                        {date.toLocaleDateString("fr-FR", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}
                      </p>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          width: 60,
                          height: 5,
                          borderRadius: 99,
                          background: "rgba(255,255,255,0.08)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${h.rate}%`,
                            height: "100%",
                            background: rateColor,
                            borderRadius: 99,
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: rateColor,
                          minWidth: 36,
                        }}
                      >
                        {h.rate}%
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CCard>
        )}
      </div>
    </CoachPageTransition>
  );
}
