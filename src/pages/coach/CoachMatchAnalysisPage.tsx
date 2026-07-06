import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  ChevronLeft,
  ChevronRight,
  Trophy,
  Calendar,
  MapPin,
  Target,
  Shield,
  Activity,
  Users,
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  Brain,
  Save,
  Loader2,
  Flag,
  Plus,
  X,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  CoachPageTransition,
  CCard,
  TOOLTIP_STYLE,
} from "../../components/coach2/CoachPageTransition";
import { clubApi } from "../../lib/api/club";
import { apiFetch } from "../../lib/api/authHeaders";

const C = {
  accent: { main: "#ff7a00", bg: "rgba(255,122,0,0.12)", border: "rgba(255,122,0,0.25)" },
  blue: { main: "#3b82f6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.25)" },
  violet: { main: "#8b5cf6", bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.25)" },
  green: { main: "#22c55e", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.25)" },
  red: { main: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.25)" },
  amber: { main: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)" },
  teal: { main: "#0d9488", bg: "rgba(13,148,136,0.12)", border: "rgba(13,148,136,0.25)" },
  indigo: { main: "#6366f1", bg: "rgba(99,102,241,0.12)", border: "rgba(99,102,241,0.25)" },
  grey: { main: "#6b7280", bg: "rgba(107,114,128,0.10)", border: "rgba(107,114,128,0.20)" },
};

const getResultColor = (result: string) =>
  result === "V" ? C.green : result === "N" ? C.amber : C.red;

const translatePosition = (pos: string) => {
  const map: Record<string, string> = {
    ST: "Attaquant",
    BU: "Buteur",
    MC: "Milieu central",
    MD: "Milieu défensif",
    DC: "Défenseur central",
    GK: "Gardien",
    LB: "Latéral gauche",
    RB: "Latéral droit",
    AG: "Ailier gauche",
    AD: "Ailier droit",
  };
  return map[pos] ?? pos;
};

const LS_KEY = (matchId: string, suffix: string) => `odin_match_${matchId}_${suffix}`;

const lsGet = (key: string, def: any) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : def;
  } catch {
    return def;
  }
};

const lsSet = (key: string, val: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    /* ignore */
  }
};

const getMatchDate = (m: any) => new Date(m.matchDateISO ?? m.matchDate ?? "");

type Objective = { id: string; label: string; done: boolean };

type PlayerPerf = {
  rating: string;
  goals: string;
  assists: string;
  minutes: string;
  yellowCard: boolean;
  redCard: boolean;
};

export function CoachMatchAnalysisPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [injuries, setInjuries] = useState<any[]>([]);
  const [standing, setStanding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [matchIndex, setMatchIndex] = useState(0);

  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [instructions, setInstructions] = useState("");
  const [prepChecks, setPrepChecks] = useState<Record<string, boolean>>({});
  const [matchStats, setMatchStats] = useState({
    possession: "",
    shots: "",
    shotsOnTarget: "",
    passAccuracy: "",
    corners: "",
    fouls: "",
    yellowCards: "",
    redCards: "",
    oppPossession: "",
    oppShots: "",
    oppShotsOnTarget: "",
    oppCorners: "",
  });
  const [playerPerfs, setPlayerPerfs] = useState<Record<string, PlayerPerf>>({});
  const [tacticalEval, setTacticalEval] = useState({
    pressing: 50,
    defense: 50,
    transitions: 50,
    possession: 50,
    setpieces: 50,
  });
  const [coachStars, setCoachStars] = useState({
    attack: 0,
    defense: 0,
    mentality: 0,
    intensity: 0,
  });
  const [coachNotes, setCoachNotes] = useState("");
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showPerfModal, setShowPerfModal] = useState(false);
  const [newObjective, setNewObjective] = useState("");
  const [importanceLevel, setImportanceLevel] = useState(3);

  useEffect(() => {
    (async () => {
      let matchData: any = null;
      let playersData: any[] = [];
      let injuriesData: any[] = [];
      let standingData: any = null;

      try {
        const r = await apiFetch("/club/matches");
        if (r.ok) matchData = await r.json();
      } catch (e) {
        console.warn(e);
      }

      try {
        playersData = (await clubApi.getPlayers()) as any[];
      } catch (e) {
        console.warn(e);
      }

      try {
        const r = (await clubApi.getInjuries()) as any;
        injuriesData = r?.injured ?? [];
      } catch (e) {
        console.warn(e);
      }

      try {
        const r = await apiFetch("/club/standing");
        if (r.ok) standingData = await r.json();
      } catch (e) {
        console.warn(e);
      }

      const allMatches = [...(matchData?.upcoming ?? []), ...(matchData?.past ?? [])].sort(
        (a: any, b: any) => getMatchDate(a).getTime() - getMatchDate(b).getTime(),
      );

      setMatches(allMatches);
      setPlayers(playersData);
      setInjuries(injuriesData);
      setStanding(standingData?.exists ? standingData : null);

      const nextIdx = allMatches.findIndex((m: any) => getMatchDate(m) >= new Date());
      setMatchIndex(nextIdx >= 0 ? nextIdx : Math.max(0, allMatches.length - 1));
      setLoading(false);
    })();
  }, []);

  const selectedMatch = matches[matchIndex] ?? null;

  useEffect(() => {
    if (!selectedMatch) return;
    const id = selectedMatch.id;
    setObjectives(
      lsGet(LS_KEY(id, "objectives"), [
        { id: "1", label: "Remporter le match", done: false },
        { id: "2", label: "Garder un clean sheet", done: false },
        { id: "3", label: "60% de possession", done: false },
        { id: "4", label: "Marquer en premier", done: false },
      ]),
    );
    setInstructions(lsGet(LS_KEY(id, "instructions"), ""));
    setPrepChecks(
      lsGet(LS_KEY(id, "prepChecks"), {
        "Plan tactique": false,
        "Sélection d'équipe": false,
        "Validation médicale": false,
        Déplacement: false,
        "Briefing joueurs": false,
      }),
    );
    setMatchStats(
      lsGet(LS_KEY(id, "stats"), {
        possession: "",
        shots: "",
        shotsOnTarget: "",
        passAccuracy: "",
        corners: "",
        fouls: "",
        yellowCards: "",
        redCards: "",
        oppPossession: "",
        oppShots: "",
        oppShotsOnTarget: "",
        oppCorners: "",
      }),
    );
    setPlayerPerfs(lsGet(LS_KEY(id, "playerPerfs"), {}));
    setTacticalEval(
      lsGet(LS_KEY(id, "tacticalEval"), {
        pressing: 50,
        defense: 50,
        transitions: 50,
        possession: 50,
        setpieces: 50,
      }),
    );
    setCoachStars(
      lsGet(LS_KEY(id, "coachStars"), {
        attack: 0,
        defense: 0,
        mentality: 0,
        intensity: 0,
      }),
    );
    setCoachNotes(lsGet(LS_KEY(id, "coachNotes"), ""));
    setImportanceLevel(lsGet(LS_KEY(id, "importance"), 3));
  }, [matchIndex, matches, selectedMatch?.id]);

  const isPast = selectedMatch ? getMatchDate(selectedMatch) < new Date() : false;
  const isCompleted = isPast && selectedMatch?.result;

  const disponibles = players.filter((p: any) => {
    const s = (p.status ?? "").toUpperCase().trim();
    const hasInj = injuries.some(
      (inj: any) =>
        (inj.name ?? "").toLowerCase() === (p.fullName ?? p.name ?? "").toLowerCase(),
    );
    return s === "DISPONIBLE" && !hasInj;
  }).length;

  const blessesCount = injuries.length;

  const aiAnalysis = useMemo(() => {
    if (!isCompleted) return null;
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recs: string[] = [];
    if (tacticalEval.defense >= 80) strengths.push("Organisation défensive solide");
    if (tacticalEval.pressing >= 75) strengths.push("Pressing collectif efficace");
    if (Number(matchStats.passAccuracy) >= 85) strengths.push("Bonne précision dans les passes");
    if (tacticalEval.transitions < 70) weaknesses.push("Transitions défensives à améliorer");
    if (tacticalEval.pressing < 60) weaknesses.push("Pressing insuffisant après 70 minutes");
    if (Number(matchStats.shots) < 8) weaknesses.push("Peu d'occasions créées");
    if (weaknesses.includes("Transitions défensives à améliorer"))
      recs.push("Travailler les transitions cette semaine");
    if (Number(matchStats.shots) < 8) recs.push("Augmenter les occasions de but");
    recs.push("Récupérer l'effectif avant le prochain match");
    return { strengths, weaknesses, recs };
  }, [isCompleted, tacticalEval, matchStats]);

  const save = (suffix: string, val: any) => {
    if (!selectedMatch) return;
    lsSet(LS_KEY(selectedMatch.id, suffix), val);
  };

  const updateObjective = (id: string) => {
    const updated = objectives.map((o) => (o.id === id ? { ...o, done: !o.done } : o));
    setObjectives(updated);
    save("objectives", updated);
  };

  const addObjective = () => {
    if (!newObjective.trim()) return;
    const updated = [
      ...objectives,
      { id: Date.now().toString(), label: newObjective.trim(), done: false },
    ];
    setObjectives(updated);
    save("objectives", updated);
    setNewObjective("");
  };

  const updatePrepCheck = (label: string) => {
    const updated = { ...prepChecks, [label]: !prepChecks[label] };
    setPrepChecks(updated);
    save("prepChecks", updated);
  };

  const saveStats = () => {
    save("stats", matchStats);
    setShowStatsModal(false);
  };

  const savePerfs = () => {
    save("playerPerfs", playerPerfs);
    setShowPerfModal(false);
  };

  const updateTactical = (key: string, val: number) => {
    const updated = { ...tacticalEval, [key]: val };
    setTacticalEval(updated);
    save("tacticalEval", updated);
  };

  const updateCoachStar = (key: string, val: number) => {
    const updated = { ...coachStars, [key]: val };
    setCoachStars(updated);
    save("coachStars", updated);
  };

  if (loading) {
    return (
      <CoachPageTransition>
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Loader2
            size={32}
            className="animate-spin"
            style={{ color: "var(--text-muted)", margin: "0 auto" }}
          />
        </div>
      </CoachPageTransition>
    );
  }

  return (
    <CoachPageTransition>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <button
            type="button"
            onClick={() => setMatchIndex((i) => Math.max(0, i - 1))}
            disabled={matchIndex === 0}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.10)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              opacity: matchIndex === 0 ? 0.3 : 1,
            }}
          >
            <ChevronLeft size={16} style={{ color: "var(--text-muted)" }} />
          </button>

          <div style={{ flex: 1, textAlign: "center" }}>
            {selectedMatch ? (
              <>
                <p style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>
                  vs {selectedMatch.opponent}
                </p>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                  {selectedMatch.competition} · {selectedMatch.matchDate} ·{" "}
                  {selectedMatch.homeAwayLabel}
                </p>
              </>
            ) : (
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                Aucun match — Ajoutez depuis la page Matchs
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMatchIndex((i) => Math.min(matches.length - 1, i + 1))}
            disabled={matchIndex >= matches.length - 1}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.10)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              opacity: matchIndex >= matches.length - 1 ? 0.3 : 1,
            }}
          >
            <ChevronRight size={16} style={{ color: "var(--text-muted)" }} />
          </button>
        </div>

        {matches.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Flag size={40} style={{ color: "var(--text-muted)", margin: "0 auto 12px" }} />
            <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-muted)" }}>
              Aucun match enregistré
            </p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, opacity: 0.7 }}>
              Ajoutez des matchs depuis la page Matchs
            </p>
          </div>
        ) : (
          selectedMatch && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: "28px 32px",
                  borderRadius: 20,
                  background: `linear-gradient(135deg,
      rgba(59,130,246,0.15) 0%,
      rgba(139,92,246,0.15) 50%,
      rgba(99,102,241,0.10) 100%)`,
                  border: "1px solid rgba(139,92,246,0.30)",
                  boxShadow: "0 0 40px rgba(99,102,241,0.12)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    borderRadius: "50%",
                    background: "rgba(139,92,246,0.08)",
                    pointerEvents: "none",
                  }}
                />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto 1fr",
                    gap: 24,
                    alignItems: "center",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "rgba(139,92,246,0.9)",
                        textTransform: "uppercase",
                        letterSpacing: "0.10em",
                        marginBottom: 6,
                      }}
                    >
                      {selectedMatch.homeAway === "D" ? "Domicile" : "Extérieur"}
                    </p>
                    <p
                      style={{
                        fontSize: 20,
                        fontWeight: 900,
                        color: "var(--text-primary)",
                        marginBottom: 4,
                      }}
                    >
                      Notre Club
                    </p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: C.green.main,
                          background: C.green.bg,
                          border: `1px solid ${C.green.border}`,
                          padding: "2px 8px",
                          borderRadius: 99,
                        }}
                      >
                        {disponibles} dispo
                      </span>
                      {blessesCount > 0 && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: C.red.main,
                            background: C.red.bg,
                            border: `1px solid ${C.red.border}`,
                            padding: "2px 8px",
                            borderRadius: 99,
                          }}
                        >
                          {blessesCount} indispo
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ textAlign: "center", flexShrink: 0 }}>
                    {isCompleted && selectedMatch.score ? (
                      <>
                        <motion.p
                          animate={{ scale: [1, 1.04, 1] }}
                          transition={{ duration: 2.5, repeat: Infinity }}
                          style={{
                            fontSize: 36,
                            fontWeight: 900,
                            background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            lineHeight: 1,
                          }}
                        >
                          {selectedMatch.score}
                        </motion.p>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: getResultColor(selectedMatch.result).main,
                            background: getResultColor(selectedMatch.result).bg,
                            border: `1px solid ${getResultColor(selectedMatch.result).border}`,
                            padding: "3px 12px",
                            borderRadius: 99,
                            display: "inline-block",
                            marginTop: 8,
                          }}
                        >
                          {selectedMatch.result === "V"
                            ? "Victoire"
                            : selectedMatch.result === "N"
                              ? "Nul"
                              : "Défaite"}
                        </span>
                      </>
                    ) : (
                      <>
                        <p
                          style={{
                            fontSize: 28,
                            fontWeight: 900,
                            color: "rgba(255,255,255,0.25)",
                            lineHeight: 1,
                          }}
                        >
                          vs
                        </p>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: C.blue.main,
                            background: C.blue.bg,
                            border: `1px solid ${C.blue.border}`,
                            padding: "3px 12px",
                            borderRadius: 99,
                            display: "inline-block",
                            marginTop: 8,
                          }}
                        >
                          {isPast ? "Résultat à saisir" : "À venir"}
                        </span>
                      </>
                    )}
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <p
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "rgba(139,92,246,0.9)",
                        textTransform: "uppercase",
                        letterSpacing: "0.10em",
                        marginBottom: 6,
                      }}
                    >
                      Adversaire
                    </p>
                    <p
                      style={{
                        fontSize: 20,
                        fontWeight: 900,
                        color: "var(--text-primary)",
                        marginBottom: 4,
                      }}
                    >
                      {selectedMatch.opponent}
                    </p>
                    {selectedMatch.opponentFormation && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: C.violet.main,
                          background: C.violet.bg,
                          border: `1px solid ${C.violet.border}`,
                          padding: "2px 8px",
                          borderRadius: 99,
                        }}
                      >
                        {selectedMatch.opponentFormation}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    marginTop: 20,
                    paddingTop: 16,
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    flexWrap: "wrap",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {(
                    [
                      { icon: Trophy, text: selectedMatch.competition, color: C.accent.main },
                      { icon: Calendar, text: selectedMatch.matchDate, color: C.blue.main },
                      { icon: MapPin, text: selectedMatch.homeAwayLabel, color: C.violet.main },
                    ] as { icon: LucideIcon; text: string; color: string }[]
                  ).map((item, i) => {
                    const ItemIcon = item.icon;
                    return (
                      <span
                        key={i}
                        style={{
                          fontSize: 12,
                          color: "rgba(255,255,255,0.55)",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <ItemIcon size={11} style={{ color: item.color }} />
                        {item.text}
                      </span>
                    );
                  })}

                  <div
                    style={{
                      marginLeft: "auto",
                      display: "flex",
                      gap: 3,
                      alignItems: "center",
                    }}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        size={14}
                        style={{
                          color: n <= importanceLevel ? C.accent.main : "rgba(255,255,255,0.15)",
                          cursor: "pointer",
                          fill: n <= importanceLevel ? C.accent.main : "transparent",
                        }}
                        onClick={() => {
                          setImportanceLevel(n);
                          save("importance", n);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 10,
                }}
              >
                {[
                  {
                    label: "Notre classement",
                    value: standing ? `#${standing.position}` : "—",
                    color: C.accent.main,
                    bg: C.accent.bg,
                    border: C.accent.border,
                  },
                  {
                    label: "Points",
                    value: standing ? standing.points : "—",
                    color: C.blue.main,
                    bg: C.blue.bg,
                    border: C.blue.border,
                  },
                  {
                    label: "Disponibles",
                    value: disponibles,
                    color: C.green.main,
                    bg: C.green.bg,
                    border: C.green.border,
                  },
                  {
                    label: "Importance",
                    value: "★".repeat(importanceLevel),
                    color: C.amber.main,
                    bg: C.amber.bg,
                    border: C.amber.border,
                  },
                ].map((k, i) => (
                  <motion.div
                    key={k.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    style={{
                      padding: "14px 16px",
                      borderRadius: 14,
                      background: k.bg,
                      border: `1px solid ${k.border}`,
                      borderLeft: `3px solid ${k.color}`,
                    }}
                  >
                    <p style={{ fontSize: 22, fontWeight: 900, color: k.color, lineHeight: 1 }}>
                      {k.value}
                    </p>
                    <p
                      style={{
                        fontSize: 11,
                        color: "var(--text-muted)",
                        marginTop: 5,
                        fontWeight: 500,
                      }}
                    >
                      {k.label}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <CCard>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      marginBottom: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Target size={14} style={{ color: C.accent.main }} />
                    Objectifs tactiques
                  </p>

                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}
                  >
                    {objectives.map((obj) => (
                      <motion.div
                        key={obj.id}
                        onClick={() => updateObjective(obj.id)}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "8px 10px",
                          borderRadius: 9,
                          cursor: "pointer",
                          background: obj.done ? C.green.bg : "rgba(255,255,255,0.02)",
                          border: `1px solid ${obj.done ? C.green.border : "rgba(255,255,255,0.06)"}`,
                          borderLeft: `3px solid ${obj.done ? C.green.main : "rgba(255,255,255,0.10)"}`,
                        }}
                      >
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 5,
                            background: obj.done ? C.green.main : "rgba(255,255,255,0.08)",
                            border: `1px solid ${obj.done ? C.green.main : "rgba(255,255,255,0.15)"}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {obj.done && <CheckCircle2 size={10} style={{ color: "white" }} />}
                        </div>
                        <p
                          style={{
                            fontSize: 12,
                            color: obj.done ? "var(--text-muted)" : "var(--text-primary)",
                            textDecoration: obj.done ? "line-through" : "none",
                            flex: 1,
                          }}
                        >
                          {obj.label}
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
                    <input
                      placeholder="Nouvel objectif..."
                      value={newObjective}
                      onChange={(e) => setNewObjective(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addObjective()}
                      style={{
                        flex: 1,
                        padding: "7px 12px",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        borderRadius: 8,
                        fontSize: 12,
                        color: "var(--text-primary)",
                        outline: "none",
                      }}
                    />
                    <button
                      type="button"
                      onClick={addObjective}
                      style={{
                        padding: "7px 12px",
                        background: C.accent.bg,
                        border: `1px solid ${C.accent.border}`,
                        borderRadius: 8,
                        cursor: "pointer",
                      }}
                    >
                      <Plus size={14} style={{ color: C.accent.main }} />
                    </button>
                  </div>

                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      marginBottom: 8,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Flag size={14} style={{ color: C.violet.main }} />
                    Instructions coach
                  </p>
                  <textarea
                    value={instructions}
                    onChange={(e) => {
                      setInstructions(e.target.value);
                      save("instructions", e.target.value);
                    }}
                    placeholder="Consignes tactiques, plan de jeu..."
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      background: "rgba(255,255,255,0.04)",
                      border: `1px solid ${C.violet.border}`,
                      borderRadius: 9,
                      fontSize: 12,
                      color: "var(--text-primary)",
                      resize: "vertical",
                      outline: "none",
                      fontFamily: "inherit",
                      lineHeight: 1.6,
                      marginBottom: 16,
                    }}
                  />

                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      marginBottom: 8,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <CheckCircle2 size={14} style={{ color: C.teal.main }} />
                    Progression préparation
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {Object.entries(prepChecks).map(([label, done]) => (
                      <div
                        key={label}
                        onClick={() => updatePrepCheck(label)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "6px 10px",
                          borderRadius: 8,
                          cursor: "pointer",
                          background: done ? "rgba(34,197,94,0.06)" : "rgba(255,255,255,0.02)",
                        }}
                      >
                        <div
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: 4,
                            background: done ? C.green.main : "transparent",
                            border: `1px solid ${done ? C.green.main : "rgba(255,255,255,0.20)"}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {done && <CheckCircle2 size={8} style={{ color: "white" }} />}
                        </div>
                        <p
                          style={{
                            fontSize: 12,
                            color: done ? "var(--text-muted)" : "var(--text-primary)",
                            textDecoration: done ? "line-through" : "none",
                          }}
                        >
                          {label}
                        </p>
                        <span
                          style={{
                            marginLeft: "auto",
                            fontSize: 10,
                            fontWeight: 600,
                            color: done ? C.green.main : C.amber.main,
                          }}
                        >
                          {done ? "Fait" : "En attente"}
                        </span>
                      </div>
                    ))}
                  </div>
                </CCard>

                <CCard>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      marginBottom: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Shield size={14} style={{ color: C.blue.main }} />
                    Analyse adversaire
                  </p>

                  {selectedMatch.opponentFormation ||
                  selectedMatch.opponentStrengths ||
                  selectedMatch.opponentWeaknesses ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {selectedMatch.opponentFormation && (
                        <div
                          style={{
                            padding: "10px 14px",
                            borderRadius: 10,
                            background: C.blue.bg,
                            border: `1px solid ${C.blue.border}`,
                            borderLeft: `3px solid ${C.blue.main}`,
                          }}
                        >
                          <p
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: C.blue.main,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              marginBottom: 4,
                            }}
                          >
                            Formation
                          </p>
                          <p style={{ fontSize: 18, fontWeight: 900, color: "var(--text-primary)" }}>
                            {selectedMatch.opponentFormation}
                          </p>
                        </div>
                      )}
                      {selectedMatch.opponentStrengths && (
                        <div
                          style={{
                            padding: "10px 14px",
                            borderRadius: 10,
                            background: C.red.bg,
                            border: `1px solid ${C.red.border}`,
                            borderLeft: `3px solid ${C.red.main}`,
                          }}
                        >
                          <p
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: C.red.main,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              marginBottom: 4,
                            }}
                          >
                            Forces
                          </p>
                          <p style={{ fontSize: 13, color: "var(--text-primary)" }}>
                            {selectedMatch.opponentStrengths}
                          </p>
                        </div>
                      )}
                      {selectedMatch.opponentWeaknesses && (
                        <div
                          style={{
                            padding: "10px 14px",
                            borderRadius: 10,
                            background: C.green.bg,
                            border: `1px solid ${C.green.border}`,
                            borderLeft: `3px solid ${C.green.main}`,
                          }}
                        >
                          <p
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: C.green.main,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              marginBottom: 4,
                            }}
                          >
                            Faiblesses
                          </p>
                          <p style={{ fontSize: 13, color: "var(--text-primary)" }}>
                            {selectedMatch.opponentWeaknesses}
                          </p>
                        </div>
                      )}
                      {selectedMatch.notes && (
                        <div
                          style={{
                            padding: "10px 14px",
                            borderRadius: 10,
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)",
                          }}
                        >
                          <p
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: "var(--text-muted)",
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              marginBottom: 4,
                            }}
                          >
                            Notes
                          </p>
                          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                            {selectedMatch.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "32px 16px",
                        borderRadius: 12,
                        border: "1px dashed rgba(255,255,255,0.08)",
                      }}
                    >
                      <Shield size={28} style={{ color: "var(--text-muted)", margin: "0 auto 10px" }} />
                      <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Aucune donnée adversaire</p>
                      <p
                        style={{
                          fontSize: 11,
                          color: "var(--text-muted)",
                          marginTop: 4,
                          opacity: 0.7,
                        }}
                      >
                        Ajoutez les informations depuis la page Matchs lors de la création du match
                      </p>
                    </div>
                  )}
                </CCard>
              </div>

              {isPast && (
                <>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      onClick={() => setShowStatsModal(true)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "10px 18px",
                        borderRadius: 12,
                        background: `linear-gradient(135deg,${C.accent.main},#e66000)`,
                        boxShadow: `0 0 20px ${C.accent.main}40`,
                        color: "white",
                        fontSize: 13,
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <BarChart3 size={15} />
                      {matchStats.possession
                        ? "Modifier les statistiques"
                        : "Saisir les statistiques du match"}
                    </button>
                  </div>

                  {matchStats.possession && (
                    <>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(4, 1fr)",
                          gap: 10,
                        }}
                      >
                        {[
                          {
                            label: "Possession",
                            value: `${matchStats.possession}%`,
                            color: C.accent.main,
                            bg: C.accent.bg,
                            border: C.accent.border,
                          },
                          {
                            label: "Tirs",
                            value: matchStats.shots,
                            color: C.blue.main,
                            bg: C.blue.bg,
                            border: C.blue.border,
                          },
                          {
                            label: "Cadrés",
                            value: matchStats.shotsOnTarget,
                            color: C.violet.main,
                            bg: C.violet.bg,
                            border: C.violet.border,
                          },
                          {
                            label: "Précision passes",
                            value: `${matchStats.passAccuracy}%`,
                            color: C.green.main,
                            bg: C.green.bg,
                            border: C.green.border,
                          },
                        ].map((k, i) => (
                          <motion.div
                            key={k.label}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                            style={{
                              padding: "14px 16px",
                              borderRadius: 14,
                              background: k.bg,
                              border: `1px solid ${k.border}`,
                              borderLeft: `3px solid ${k.color}`,
                              textAlign: "center",
                            }}
                          >
                            <p style={{ fontSize: 24, fontWeight: 900, color: k.color, lineHeight: 1 }}>
                              {k.value || "—"}
                            </p>
                            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 5 }}>
                              {k.label}
                            </p>
                          </motion.div>
                        ))}
                      </div>

                      <CCard>
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "var(--text-primary)",
                            marginBottom: 12,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <BarChart3 size={14} style={{ color: C.accent.main }} />
                          Comparaison avec l&apos;adversaire
                        </p>
                        <div style={{ height: 180 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={[
                                {
                                  label: "Tirs",
                                  nous: Number(matchStats.shots) || 0,
                                  eux: Number(matchStats.oppShots) || 0,
                                },
                                {
                                  label: "Cadrés",
                                  nous: Number(matchStats.shotsOnTarget) || 0,
                                  eux: Number(matchStats.oppShotsOnTarget) || 0,
                                },
                                {
                                  label: "Corners",
                                  nous: Number(matchStats.corners) || 0,
                                  eux: Number(matchStats.oppCorners) || 0,
                                },
                              ]}
                              barCategoryGap="30%"
                              barGap={4}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(255,255,255,0.04)"
                                vertical={false}
                              />
                              <XAxis
                                dataKey="label"
                                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                              />
                              <YAxis
                                tick={{ fill: "var(--text-muted)", fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                              />
                              <Tooltip {...TOOLTIP_STYLE} />
                              <Bar
                                dataKey="nous"
                                name="Notre club"
                                radius={[4, 4, 0, 0]}
                                fill={C.accent.main}
                                fillOpacity={0.85}
                              />
                              <Bar
                                dataKey="eux"
                                name="Adversaire"
                                radius={[4, 4, 0, 0]}
                                fill={C.grey.main}
                                fillOpacity={0.6}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CCard>
                    </>
                  )}

                  <CCard>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 14,
                      }}
                    >
                      <Users size={14} style={{ color: C.violet.main }} />
                      <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                        Performances joueurs
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowPerfModal(true)}
                        style={{
                          marginLeft: "auto",
                          fontSize: 11,
                          fontWeight: 600,
                          color: C.accent.main,
                          background: C.accent.bg,
                          border: `1px solid ${C.accent.border}`,
                          borderRadius: 8,
                          padding: "4px 12px",
                          cursor: "pointer",
                        }}
                      >
                        {Object.keys(playerPerfs).length > 0
                          ? "Modifier"
                          : "Saisir les performances"}
                      </button>
                    </div>

                    {Object.keys(playerPerfs).length > 0 ? (
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead>
                            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                              {["Joueur", "Poste", "Note", "Buts", "Passes", "Min", "Cards"].map(
                                (h) => (
                                  <th
                                    key={h}
                                    style={{
                                      padding: "8px 10px",
                                      textAlign: "left",
                                      fontSize: 10,
                                      fontWeight: 600,
                                      color: "var(--text-muted)",
                                      textTransform: "uppercase",
                                      letterSpacing: "0.06em",
                                    }}
                                  >
                                    {h}
                                  </th>
                                ),
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {players
                              .map((p: any) => {
                                const perf = playerPerfs[p.id];
                                if (!perf?.minutes) return null;
                                const rating = Number(perf.rating);
                                const rColor =
                                  rating >= 8
                                    ? C.green.main
                                    : rating >= 6.5
                                      ? C.accent.main
                                      : C.red.main;
                                return (
                                  <tr
                                    key={p.id}
                                    style={{ borderBottom: "0.5px solid rgba(255,255,255,0.04)" }}
                                  >
                                    <td style={{ padding: "10px" }}>
                                      <p
                                        style={{
                                          fontSize: 13,
                                          fontWeight: 700,
                                          color: "var(--text-primary)",
                                        }}
                                      >
                                        {p.fullName ?? p.name}
                                      </p>
                                    </td>
                                    <td style={{ padding: "10px" }}>
                                      <span
                                        style={{
                                          fontSize: 10,
                                          fontWeight: 600,
                                          color: C.violet.main,
                                          background: C.violet.bg,
                                          padding: "2px 7px",
                                          borderRadius: 99,
                                        }}
                                      >
                                        {translatePosition(p.position)}
                                      </span>
                                    </td>
                                    <td style={{ padding: "10px" }}>
                                      <p style={{ fontSize: 16, fontWeight: 900, color: rColor }}>
                                        {perf.rating || "—"}
                                      </p>
                                    </td>
                                    <td style={{ padding: "10px" }}>
                                      <p
                                        style={{
                                          fontSize: 13,
                                          fontWeight: 700,
                                          color:
                                            Number(perf.goals) > 0
                                              ? C.green.main
                                              : "var(--text-muted)",
                                        }}
                                      >
                                        {perf.goals || "0"}
                                      </p>
                                    </td>
                                    <td style={{ padding: "10px" }}>
                                      <p style={{ fontSize: 13, color: "var(--text-primary)" }}>
                                        {perf.assists || "0"}
                                      </p>
                                    </td>
                                    <td style={{ padding: "10px" }}>
                                      <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                                        {perf.minutes}&apos;
                                      </p>
                                    </td>
                                    <td style={{ padding: "10px" }}>
                                      {perf.redCard ? (
                                        <span
                                          style={{
                                            fontSize: 10,
                                            fontWeight: 700,
                                            color: C.red.main,
                                            background: C.red.bg,
                                            padding: "2px 6px",
                                            borderRadius: 4,
                                          }}
                                        >
                                          CR
                                        </span>
                                      ) : perf.yellowCard ? (
                                        <span
                                          style={{
                                            fontSize: 10,
                                            fontWeight: 700,
                                            color: C.amber.main,
                                            background: C.amber.bg,
                                            padding: "2px 6px",
                                            borderRadius: 4,
                                          }}
                                        >
                                          CJ
                                        </span>
                                      ) : (
                                        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
                                          —
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })
                              .filter(Boolean)}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "24px 0",
                          border: "1px dashed rgba(255,255,255,0.08)",
                          borderRadius: 12,
                        }}
                      >
                        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                          Aucune performance saisie
                        </p>
                      </div>
                    )}
                  </CCard>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <CCard>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          marginBottom: 14,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Activity size={14} style={{ color: C.teal.main }} />
                        Évaluation tactique
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {[
                          { key: "pressing", label: "Pressing" },
                          { key: "defense", label: "Organisation défensive" },
                          { key: "transitions", label: "Transitions" },
                          { key: "possession", label: "Possession de balle" },
                          { key: "setpieces", label: "Coups de pied arrêtés" },
                        ].map((item) => {
                          const val = (tacticalEval as any)[item.key];
                          const color =
                            val >= 80 ? C.green.main : val >= 60 ? C.accent.main : C.red.main;
                          return (
                            <div key={item.key}>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  marginBottom: 4,
                                }}
                              >
                                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                  {item.label}
                                </span>
                                <span style={{ fontSize: 13, fontWeight: 700, color }}>{val}%</span>
                              </div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                value={val}
                                onChange={(e) => updateTactical(item.key, Number(e.target.value))}
                                style={{ width: "100%", accentColor: color }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </CCard>

                    <CCard>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          marginBottom: 14,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Target size={14} style={{ color: C.accent.main }} />
                        Bilan des objectifs
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {objectives.map((obj) => (
                          <motion.div
                            key={obj.id}
                            onClick={() => updateObjective(obj.id)}
                            whileTap={{ scale: 0.98 }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "10px 12px",
                              borderRadius: 10,
                              cursor: "pointer",
                              background: obj.done ? C.green.bg : C.red.bg,
                              border: `1px solid ${obj.done ? C.green.border : C.red.border}`,
                              borderLeft: `3px solid ${obj.done ? C.green.main : C.red.main}`,
                            }}
                          >
                            {obj.done ? (
                              <CheckCircle2
                                size={15}
                                style={{ color: C.green.main, flexShrink: 0 }}
                              />
                            ) : (
                              <XCircle size={15} style={{ color: C.red.main, flexShrink: 0 }} />
                            )}
                            <p
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: "var(--text-primary)",
                                flex: 1,
                              }}
                            >
                              {obj.label}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                      <div
                        style={{
                          marginTop: 12,
                          padding: "10px",
                          borderRadius: 10,
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          textAlign: "center",
                        }}
                      >
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 800,
                            color:
                              objectives.filter((o) => o.done).length >= objectives.length * 0.75
                                ? C.green.main
                                : C.amber.main,
                          }}
                        >
                          {objectives.filter((o) => o.done).length}/{objectives.length} objectifs
                          atteints
                        </p>
                      </div>
                    </CCard>
                  </div>

                  <CCard>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        marginBottom: 14,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Star size={14} style={{ color: C.amber.main }} />
                      Évaluation du coach
                    </p>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: 10,
                        marginBottom: 16,
                      }}
                    >
                      {[
                        { key: "attack", label: "Attaque" },
                        { key: "defense", label: "Défense" },
                        { key: "mentality", label: "Mentalité" },
                        { key: "intensity", label: "Intensité" },
                      ].map((item) => (
                        <div
                          key={item.key}
                          style={{
                            padding: "12px",
                            borderRadius: 12,
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            textAlign: "center",
                          }}
                        >
                          <p
                            style={{
                              fontSize: 11,
                              color: "var(--text-muted)",
                              marginBottom: 8,
                              fontWeight: 600,
                            }}
                          >
                            {item.label}
                          </p>
                          <div style={{ display: "flex", gap: 3, justifyContent: "center" }}>
                            {[1, 2, 3, 4, 5].map((n) => (
                              <Star
                                key={n}
                                size={14}
                                onClick={() => updateCoachStar(item.key, n)}
                                style={{
                                  cursor: "pointer",
                                  color:
                                    n <= (coachStars as any)[item.key]
                                      ? C.amber.main
                                      : "rgba(255,255,255,0.15)",
                                  fill:
                                    n <= (coachStars as any)[item.key]
                                      ? C.amber.main
                                      : "transparent",
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <textarea
                      value={coachNotes}
                      onChange={(e) => {
                        setCoachNotes(e.target.value);
                        save("coachNotes", e.target.value);
                      }}
                      placeholder="Notes personnelles du coach après le match..."
                      rows={3}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        borderRadius: 9,
                        fontSize: 12,
                        color: "var(--text-primary)",
                        resize: "vertical",
                        outline: "none",
                        fontFamily: "inherit",
                        lineHeight: 1.6,
                      }}
                    />
                  </CCard>

                  {aiAnalysis && (
                    <CCard>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          marginBottom: 14,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Brain size={14} style={{ color: C.violet.main }} />
                        Analyse IA
                      </p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                        {[
                          { title: "Forces", items: aiAnalysis.strengths, c: C.green },
                          { title: "Points à améliorer", items: aiAnalysis.weaknesses, c: C.red },
                          { title: "Recommandations", items: aiAnalysis.recs, c: C.violet },
                        ].map((section) => (
                          <div
                            key={section.title}
                            style={{
                              padding: "14px",
                              borderRadius: 12,
                              background: section.c.bg,
                              border: `1px solid ${section.c.border}`,
                              borderTop: `3px solid ${section.c.main}`,
                            }}
                          >
                            <p
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: section.c.main,
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                marginBottom: 10,
                              }}
                            >
                              {section.title}
                            </p>
                            {section.items.length > 0 ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                {section.items.map((item, i) => (
                                  <p
                                    key={i}
                                    style={{
                                      fontSize: 12,
                                      color: "var(--text-primary)",
                                      lineHeight: 1.5,
                                      display: "flex",
                                      gap: 6,
                                    }}
                                  >
                                    <span style={{ color: section.c.main, flexShrink: 0 }}>•</span>
                                    {item}
                                  </p>
                                ))}
                              </div>
                            ) : (
                              <p
                                style={{
                                  fontSize: 11,
                                  color: "var(--text-muted)",
                                  fontStyle: "italic",
                                }}
                              >
                                Données insuffisantes
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CCard>
                  )}
                </>
              )}

              {matches.length > 1 && (
                <CCard>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      marginBottom: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Clock size={14} style={{ color: C.blue.main }} />
                    Historique des matchs
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {matches.map((m: any, i: number) => {
                      const isSelected = i === matchIndex;
                      const rc = m.result ? getResultColor(m.result) : C.blue;
                      return (
                        <motion.button
                          key={m.id}
                          type="button"
                          onClick={() => setMatchIndex(i)}
                          whileHover={{ scale: 1.03 }}
                          style={{
                            padding: "8px 14px",
                            borderRadius: 10,
                            cursor: "pointer",
                            background: isSelected ? rc.bg : "rgba(255,255,255,0.03)",
                            border: `1px solid ${isSelected ? rc.border : "rgba(255,255,255,0.08)"}`,
                            borderLeft: `3px solid ${isSelected ? rc.main : "rgba(255,255,255,0.10)"}`,
                          }}
                        >
                          <p
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: isSelected ? rc.main : "var(--text-primary)",
                            }}
                          >
                            {m.result
                              ? `${m.score} · ${m.result === "V" ? "Victoire" : m.result === "N" ? "Nul" : "Défaite"}`
                              : "À venir"}
                          </p>
                          <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
                            vs {m.opponent}
                          </p>
                        </motion.button>
                      );
                    })}
                  </div>
                </CCard>
              )}
            </>
          )
        )}
      </div>

      <AnimatePresence>
        {showStatsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowStatsModal(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(8px)",
              zIndex: 40,
              padding: 16,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: 500,
                maxHeight: "90vh",
                overflowY: "auto",
                background: "rgba(14,10,35,0.98)",
                border: "1px solid rgba(255,122,0,0.30)",
                borderTop: "4px solid #ff7a00",
                borderRadius: 20,
                padding: 24,
                boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                }}
              >
                <p style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>
                  Statistiques du match
                </p>
                <button
                  type="button"
                  onClick={() => setShowStatsModal(false)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <X size={14} style={{ color: "var(--text-muted)" }} />
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: C.accent.main,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      textAlign: "center",
                      marginBottom: 10,
                    }}
                  >
                    Notre club
                  </p>
                  {[
                    { label: "Possession (%)", key: "possession" },
                    { label: "Tirs", key: "shots" },
                    { label: "Tirs cadrés", key: "shotsOnTarget" },
                    { label: "Précision passes (%)", key: "passAccuracy" },
                    { label: "Corners", key: "corners" },
                    { label: "Fautes", key: "fouls" },
                    { label: "Cartons jaunes", key: "yellowCards" },
                    { label: "Cartons rouges", key: "redCards" },
                  ].map((f) => (
                    <div key={f.key} style={{ marginBottom: 10 }}>
                      <label
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: "rgba(255,255,255,0.45)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          display: "block",
                          marginBottom: 4,
                        }}
                      >
                        {f.label}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={(matchStats as any)[f.key]}
                        onChange={(e) =>
                          setMatchStats((p) => ({ ...p, [f.key]: e.target.value }))
                        }
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.10)",
                          borderRadius: 8,
                          fontSize: 13,
                          color: "var(--text-primary)",
                          outline: "none",
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: C.grey.main,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      textAlign: "center",
                      marginBottom: 10,
                    }}
                  >
                    Adversaire
                  </p>
                  {[
                    { label: "Possession (%)", key: "oppPossession" },
                    { label: "Tirs", key: "oppShots" },
                    { label: "Tirs cadrés", key: "oppShotsOnTarget" },
                    { label: "Corners", key: "oppCorners" },
                  ].map((f) => (
                    <div key={f.key} style={{ marginBottom: 10 }}>
                      <label
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: "rgba(255,255,255,0.45)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          display: "block",
                          marginBottom: 4,
                        }}
                      >
                        {f.label}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={(matchStats as any)[f.key]}
                        onChange={(e) =>
                          setMatchStats((p) => ({ ...p, [f.key]: e.target.value }))
                        }
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.10)",
                          borderRadius: 8,
                          fontSize: 13,
                          color: "var(--text-primary)",
                          outline: "none",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={saveStats}
                style={{
                  width: "100%",
                  marginTop: 20,
                  padding: "13px",
                  background: "linear-gradient(135deg,#ff7a00,#e66000)",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 700,
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Save size={15} />
                Enregistrer les statistiques
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPerfModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPerfModal(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(8px)",
              zIndex: 40,
              padding: 16,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: 520,
                maxHeight: "90vh",
                overflowY: "auto",
                background: "rgba(14,10,35,0.98)",
                border: `1px solid ${C.violet.border}`,
                borderTop: `4px solid ${C.violet.main}`,
                borderRadius: 20,
                padding: 24,
                boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                }}
              >
                <p style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>
                  Performances des joueurs
                </p>
                <button
                  type="button"
                  onClick={() => setShowPerfModal(false)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <X size={14} style={{ color: "var(--text-muted)" }} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {players.map((p: any) => {
                  const perf = playerPerfs[p.id] ?? {
                    rating: "",
                    goals: "0",
                    assists: "0",
                    minutes: "90",
                    yellowCard: false,
                    redCard: false,
                  };
                  return (
                    <div
                      key={p.id}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 12,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          marginBottom: 10,
                        }}
                      >
                        {p.fullName ?? p.name}
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 500,
                            color: "var(--text-muted)",
                            marginLeft: 8,
                          }}
                        >
                          {translatePosition(p.position)}
                        </span>
                      </p>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(4, 1fr)",
                          gap: 8,
                        }}
                      >
                        {(
                          [
                            { label: "Note (/10)", key: "rating", placeholder: "7.5" },
                            { label: "Buts", key: "goals", placeholder: "0" },
                            { label: "Passes D.", key: "assists", placeholder: "0" },
                            { label: "Minutes", key: "minutes", placeholder: "90" },
                          ] as const
                        ).map((f) => (
                          <div key={f.key}>
                            <label
                              style={{
                                fontSize: 9,
                                fontWeight: 600,
                                color: "rgba(255,255,255,0.35)",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                display: "block",
                                marginBottom: 3,
                              }}
                            >
                              {f.label}
                            </label>
                            <input
                              type="number"
                              placeholder={f.placeholder}
                              value={perf[f.key]}
                              onChange={(e) => {
                                setPlayerPerfs({
                                  ...playerPerfs,
                                  [p.id]: { ...perf, [f.key]: e.target.value },
                                });
                              }}
                              style={{
                                width: "100%",
                                padding: "6px 8px",
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(255,255,255,0.10)",
                                borderRadius: 7,
                                fontSize: 12,
                                color: "var(--text-primary)",
                                outline: "none",
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        {(
                          [
                            { label: "Carton jaune", key: "yellowCard", color: C.amber.main },
                            { label: "Carton rouge", key: "redCard", color: C.red.main },
                          ] as const
                        ).map((card) => (
                          <button
                            key={card.key}
                            type="button"
                            onClick={() => {
                              setPlayerPerfs({
                                ...playerPerfs,
                                [p.id]: { ...perf, [card.key]: !perf[card.key] },
                              });
                            }}
                            style={{
                              padding: "4px 10px",
                              borderRadius: 8,
                              fontSize: 10,
                              fontWeight: 600,
                              cursor: "pointer",
                              border: `1px solid ${perf[card.key] ? card.color : "rgba(255,255,255,0.10)"}`,
                              background: perf[card.key]
                                ? `${card.color}20`
                                : "rgba(255,255,255,0.04)",
                              color: perf[card.key] ? card.color : "var(--text-muted)",
                            }}
                          >
                            {card.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={savePerfs}
                style={{
                  width: "100%",
                  marginTop: 20,
                  padding: "13px",
                  background: `linear-gradient(135deg, ${C.violet.main}, #6d28d9)`,
                  color: "white",
                  fontSize: 14,
                  fontWeight: 700,
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Save size={15} />
                Enregistrer les performances
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </CoachPageTransition>
  );
}
