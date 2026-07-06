import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Trophy,
  Calendar,
  Plus,
  X,
  Save,
  CheckCircle2,
  Loader2,
  Target,
  Swords,
  Shield,
  Star,
  MapPin,
  TrendingUp,
  Users,
  AlertTriangle,
} from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { apiFetch } from "../lib/api/authHeaders";
import { clubApi } from "../lib/api/club";

const PALETTE = {
  accent: { main: "#ff7a00", bg: "rgba(255,122,0,0.12)", border: "rgba(255,122,0,0.30)" },
  blue: { main: "#3b82f6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.25)" },
  violet: { main: "#8b5cf6", bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.25)" },
  green: { main: "#22c55e", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.25)" },
  red: { main: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.25)" },
  amber: { main: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)" },
  teal: { main: "#0d9488", bg: "rgba(13,148,136,0.12)", border: "rgba(13,148,136,0.25)" },
  indigo: { main: "#6366f1", bg: "rgba(99,102,241,0.12)", border: "rgba(99,102,241,0.25)" },
};

const CHECKLIST_ICONS: Record<string, LucideIcon> = {
  "Analyse adversaire complétée": Shield,
  "Composition définie": Users,
  "Séance tactique planifiée": Calendar,
  "Effectif médical validé": CheckCircle2,
  "Briefing joueurs programmé": Target,
};

const CHECKLIST_COLORS = [
  PALETTE.blue,
  PALETTE.violet,
  PALETTE.teal,
  PALETTE.green,
  PALETTE.accent,
];

const QUICK_ACTIONS = [
  { label: "Composition", icon: Shield, path: "/coach/lineup", iconColor: PALETTE.blue },
  { label: "Analyse Match", icon: Target, path: "/coach/match-analysis", iconColor: PALETTE.violet },
  {
    label: "Training Builder",
    icon: Calendar,
    path: "/coach/training-builder",
    iconColor: PALETTE.teal,
  },
  { label: "Assistant IA", icon: Star, path: "/coach/ai", iconColor: PALETTE.accent },
];

const getResultPalette = (result: string) =>
  result === "V" ? PALETTE.green : result === "N" ? PALETTE.amber : PALETTE.red;

const parseMatchDate = (m: { matchDateISO?: string; matchDate?: string }) =>
  new Date(m.matchDateISO ?? m.matchDate ?? "");

const EMPTY_MATCH = {
  opponent: "",
  competition: "Ligue 1",
  matchDate: "",
  matchTime: "17:00",
  homeAway: "D" as "D" | "E",
  goalsFor: "",
  goalsAgainst: "",
  result: "V" as "V" | "N" | "D",
  opponentFormation: "",
  opponentStrengths: "",
  opponentWeaknesses: "",
  notes: "",
  isPast: false,
};

const DEFAULT_CHECKLIST = [
  { id: "1", label: "Analyse adversaire complétée", done: false },
  { id: "2", label: "Composition définie", done: false },
  { id: "3", label: "Séance tactique planifiée", done: false },
  { id: "4", label: "Effectif médical validé", done: false },
  { id: "5", label: "Briefing joueurs programmé", done: false },
];

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 10,
  fontSize: 13,
  color: "var(--text-primary)",
  outline: "none",
  colorScheme: "dark",
};

const selectStyle: CSSProperties = {
  ...inputStyle,
  colorScheme: "dark",
  appearance: "auto",
};

const labelStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "rgba(255,255,255,0.45)",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  display: "block",
  marginBottom: 6,
};

function normalizeForm(form: unknown): string[] {
  if (Array.isArray(form)) return form;
  if (typeof form === "string" && form.trim()) {
    return form.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

export function MatchesPage() {
  const navigate = useNavigate();

  const [past, setPast] = useState<any[]>([]);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [nextMatch, setNextMatch] = useState<any>(null);
  const [daysToNext, setDaysToNext] = useState<number | null>(null);
  const [standing, setStanding] = useState<any>(null);
  const [injuries, setInjuries] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddMatch, setShowAddMatch] = useState(false);
  const [showEditStanding, setShowEditStanding] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [matchForm, setMatchForm] = useState(EMPTY_MATCH);

  const [standingForm, setStandingForm] = useState({
    competition: "Ligue 1",
    position: "",
    points: "",
    played: "",
    won: "",
    drawn: "",
    lost: "",
    goalsFor: "",
    goalsAgainst: "",
    form: [] as string[],
  });

  const [tacticalFocus, setTacticalFocus] = useState(() => {
    try {
      return localStorage.getItem("odin_tactical_focus") ?? "";
    } catch {
      return "";
    }
  });

  const [hoveredQuickAction, setHoveredQuickAction] = useState<number | null>(null);

  const [checklist, setChecklist] = useState<{ id: string; label: string; done: boolean }[]>(() => {
    try {
      const stored = localStorage.getItem("odin_match_checklist");
      return stored ? JSON.parse(stored) : DEFAULT_CHECKLIST;
    } catch {
      return DEFAULT_CHECKLIST;
    }
  });

  const reloadMatches = async () => {
    try {
      const r = await apiFetch("/club/matches");
      if (r.ok) {
        const d = await r.json();
        setPast(d.past ?? []);
        setUpcoming(d.upcoming ?? []);
        setNextMatch(d.nextMatch ?? null);
        setDaysToNext(d.daysToNext ?? null);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    (async () => {
      let matchesData: any = null;
      let standingData: any = null;
      let injuriesData: any[] = [];
      let playersData: any[] = [];

      try {
        const r = await apiFetch("/club/matches");
        if (r.ok) matchesData = await r.json();
      } catch (e) {
        console.warn(e);
      }

      try {
        const r = await apiFetch("/club/standing");
        if (r.ok) standingData = await r.json();
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
        playersData = (await clubApi.getPlayers()) as any[];
      } catch (e) {
        console.warn(e);
      }

      if (matchesData) {
        setPast(matchesData.past ?? []);
        setUpcoming(matchesData.upcoming ?? []);
        setNextMatch(matchesData.nextMatch ?? null);
        setDaysToNext(matchesData.daysToNext ?? null);
      }
      if (standingData?.exists) {
        setStanding(standingData);
        setStandingForm({
          competition: standingData.competition,
          position: String(standingData.position),
          points: String(standingData.points),
          played: String(standingData.played),
          won: String(standingData.won),
          drawn: String(standingData.drawn),
          lost: String(standingData.lost),
          goalsFor: String(standingData.goalsFor),
          goalsAgainst: String(standingData.goalsAgainst),
          form: normalizeForm(standingData.form),
        });
      }
      setInjuries(injuriesData);
      setPlayers(playersData);
      setLoading(false);
    })();
  }, []);

  const saveMatch = async () => {
    if (!matchForm.opponent || !matchForm.matchDate) return;
    setSubmitting(true);
    try {
      const body: any = {
        opponent: matchForm.opponent,
        competition: matchForm.competition,
        matchDate: matchForm.matchDate,
        homeAway: matchForm.homeAway,
        opponentFormation: matchForm.opponentFormation || null,
        opponentStrengths: matchForm.opponentStrengths || null,
        opponentWeaknesses: matchForm.opponentWeaknesses || null,
        notes: matchForm.notes || null,
      };
      if (matchForm.isPast) {
        body.goalsFor = Number(matchForm.goalsFor);
        body.goalsAgainst = Number(matchForm.goalsAgainst);
        body.result = matchForm.result;
      }
      const r = await apiFetch("/club/matches", {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (r.ok) {
        await reloadMatches();
        setShowAddMatch(false);
        setMatchForm(EMPTY_MATCH);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setSubmitting(false);
    }
  };

  const saveStanding = async () => {
    setSubmitting(true);
    try {
      const r = await apiFetch("/club/standing", {
        method: "PATCH",
        body: JSON.stringify({
          competition: standingForm.competition,
          position: Number(standingForm.position),
          points: Number(standingForm.points),
          played: Number(standingForm.played),
          won: Number(standingForm.won),
          drawn: Number(standingForm.drawn),
          lost: Number(standingForm.lost),
          goalsFor: Number(standingForm.goalsFor),
          goalsAgainst: Number(standingForm.goalsAgainst),
          form: standingForm.form.join(","),
        }),
      });
      if (r.ok) {
        const d = await r.json();
        setStanding(d);
        setShowEditStanding(false);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setSubmitting(false);
    }
  };

  const saveTacticalFocus = (val: string) => {
    setTacticalFocus(val);
    try {
      localStorage.setItem("odin_tactical_focus", val);
    } catch {
      /* ignore */
    }
  };

  const toggleCheck = (id: string) => {
    const updated = checklist.map((c) => (c.id === id ? { ...c, done: !c.done } : c));
    setChecklist(updated);
    try {
      localStorage.setItem("odin_match_checklist", JSON.stringify(updated));
    } catch {
      /* ignore */
    }
  };

  const toggleFormResult = (r: string) => {
    setStandingForm((prev) => {
      const form = [...prev.form];
      if (form.length >= 5) form.shift();
      form.push(r);
      return { ...prev, form };
    });
  };

  const disponibles = players.filter((p: any) => {
    const s = (p.status ?? "").toUpperCase().trim();
    const hasInjury = injuries.some(
      (inj: any) =>
        (inj.name ?? "").toLowerCase().trim() === (p.fullName ?? "").toLowerCase().trim(),
    );
    return s === "DISPONIBLE" && !hasInjury;
  }).length;
  const blessesCount = Math.max(
    injuries.length,
    players.filter((p: any) => (p.status ?? "").toUpperCase().trim() === "BLESSE").length,
  );
  const checklistDone = checklist.filter((c) => c.done).length;
  const checklistTotal = checklist.length;
  const prepProgress = Math.round((checklistDone / Math.max(checklistTotal, 1)) * 100);

  const standingFormArray = normalizeForm(standing?.form);

  return (
    <>
      <style>{`
  .odin-select option {
    background: #1a1a2e !important;
    color: #ffffff !important;
  }
  .odin-select {
    background: rgba(255,255,255,0.05) !important;
    color: #ffffff !important;
  }
`}</style>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <motion.button
            type="button"
            onClick={() => {
              setMatchForm(EMPTY_MATCH);
              setShowAddMatch(true);
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              borderRadius: 12,
              background: "linear-gradient(135deg,#ff7a00,#e66000)",
              boxShadow: "0 0 20px rgba(255,122,0,0.35)",
              color: "white",
              fontSize: 13,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
            }}
          >
            <Plus size={15} />
            Ajouter un match
          </motion.button>
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
            {nextMatch ? (
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
                  boxShadow:
                    "0 0 40px rgba(99,102,241,0.12), 0 0 80px rgba(59,130,246,0.06)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -40,
                    right: -40,
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
                    gap: 32,
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
                        marginBottom: 8,
                      }}
                    >
                      Prochain match
                    </p>
                    <p
                      style={{
                        fontSize: 26,
                        fontWeight: 900,
                        color: "var(--text-primary)",
                        marginBottom: 10,
                        lineHeight: 1.1,
                      }}
                    >
                      vs {nextMatch.opponent}
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <span
                        style={{
                          fontSize: 13,
                          color: "rgba(255,255,255,0.6)",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Trophy size={12} style={{ color: PALETTE.accent.main }} />
                        {nextMatch.competition}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          color: "rgba(255,255,255,0.6)",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Calendar size={12} style={{ color: PALETTE.blue.main }} />
                        {nextMatch.matchDate}
                      </span>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          marginTop: 4,
                          fontSize: 12,
                          fontWeight: 700,
                          color:
                            nextMatch.homeAway === "D"
                              ? PALETTE.accent.main
                              : PALETTE.violet.main,
                          background:
                            nextMatch.homeAway === "D" ? PALETTE.accent.bg : PALETTE.violet.bg,
                          border: `1px solid ${
                            nextMatch.homeAway === "D"
                              ? PALETTE.accent.border
                              : PALETTE.violet.border
                          }`,
                          padding: "4px 12px",
                          borderRadius: 99,
                          width: "fit-content",
                        }}
                      >
                        <MapPin size={10} />
                        {nextMatch.homeAwayLabel}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      width: 1,
                      height: 80,
                      background:
                        "linear-gradient(to bottom, transparent, rgba(139,92,246,0.40), transparent)",
                    }}
                  />

                  <div style={{ textAlign: "center" }}>
                    <p
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "rgba(139,92,246,0.9)",
                        textTransform: "uppercase",
                        letterSpacing: "0.10em",
                        marginBottom: 8,
                      }}
                    >
                      Compte à rebours
                    </p>
                    <p
                      style={{
                        fontSize: 56,
                        fontWeight: 900,
                        lineHeight: 1,
                        background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {daysToNext === 0 ? "0" : daysToNext}
                    </p>
                    <p
                      style={{
                        fontSize: 13,
                        color: "rgba(255,255,255,0.5)",
                        marginTop: 4,
                      }}
                    >
                      {daysToNext === 0
                        ? "Match aujourd'hui !"
                        : daysToNext === 1
                          ? "jour restant"
                          : "jours restants"}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  padding: "24px 32px",
                  borderRadius: 20,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px dashed rgba(255,255,255,0.10)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 16,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: "rgba(99,102,241,0.10)",
                      border: "1px solid rgba(99,102,241,0.20)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Swords size={22} style={{ color: "rgba(99,102,241,0.6)" }} />
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "var(--text-muted)",
                      }}
                    >
                      Aucun match programmé
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        marginTop: 3,
                        opacity: 0.6,
                      }}
                    >
                      Planifiez un match pour commencer la préparation
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMatchForm({ ...EMPTY_MATCH, isPast: false });
                    setShowAddMatch(true);
                  }}
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: PALETTE.accent.main,
                    background: PALETTE.accent.bg,
                    border: `1px solid ${PALETTE.accent.border}`,
                    borderRadius: 12,
                    padding: "10px 20px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Plus size={14} />
                  Planifier un match
                </button>
              </motion.div>
            )}

            {standing ? (
              <GlassCard raised className="p-5">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: PALETTE.accent.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <TrendingUp size={14} style={{ color: PALETTE.accent.main }} />
                    </div>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--text-primary)",
                      }}
                    >
                      {standing.competition}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEditStanding(true)}
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 8,
                      padding: "4px 12px",
                      cursor: "pointer",
                    }}
                  >
                    Modifier
                  </button>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                    marginBottom: 16,
                  }}
                >
                  {[
                    {
                      label: "Position",
                      value: `#${standing.position}`,
                      color: PALETTE.accent.main,
                      bg: PALETTE.accent.bg,
                    },
                    {
                      label: "Points",
                      value: standing.points,
                      color: PALETTE.blue.main,
                      bg: PALETTE.blue.bg,
                    },
                    {
                      label: "Diff. buts",
                      value:
                        standing.goalDifference >= 0
                          ? `+${standing.goalDifference}`
                          : String(standing.goalDifference),
                      color:
                        standing.goalDifference >= 0 ? PALETTE.green.main : PALETTE.red.main,
                      bg: standing.goalDifference >= 0 ? PALETTE.green.bg : PALETTE.red.bg,
                    },
                    {
                      label: "Matchs joués",
                      value: standing.played,
                      color: PALETTE.violet.main,
                      bg: PALETTE.violet.bg,
                    },
                  ].map((k) => (
                    <div
                      key={k.label}
                      style={{
                        padding: "14px 16px",
                        borderRadius: 12,
                        background: k.bg,
                        border: `1px solid ${k.color}25`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontSize: 24,
                            fontWeight: 900,
                            color: k.color,
                            lineHeight: 1,
                          }}
                        >
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
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      fontWeight: 600,
                      marginRight: 4,
                    }}
                  >
                    Forme:
                  </p>
                  {standingFormArray.length > 0 ? (
                    standingFormArray.slice(-5).map((f: string, i: number) => (
                      <motion.span
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: 800,
                          color: "white",
                          background:
                            f === "V"
                              ? PALETTE.green.main
                              : f === "N"
                                ? PALETTE.amber.main
                                : PALETTE.red.main,
                          boxShadow: `0 0 10px ${
                            f === "V"
                              ? PALETTE.green.main
                              : f === "N"
                                ? PALETTE.amber.main
                                : PALETTE.red.main
                          }40`,
                        }}
                      >
                        {f}
                      </motion.span>
                    ))
                  ) : (
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        fontStyle: "italic",
                      }}
                    >
                      Non renseignée
                    </span>
                  )}
                </div>
              </GlassCard>
            ) : (
              <div
                style={{
                  padding: "16px 20px",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px dashed rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text-muted)",
                  }}
                >
                  Classement non renseigné
                </p>
                <button
                  type="button"
                  onClick={() => setShowEditStanding(true)}
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: PALETTE.accent.main,
                    background: PALETTE.accent.bg,
                    border: `1px solid ${PALETTE.accent.border}`,
                    borderRadius: 8,
                    padding: "6px 14px",
                    cursor: "pointer",
                  }}
                >
                  Renseigner le classement
                </button>
              </div>
            )}

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
                    marginBottom: 14,
                  }}
                >
                  <Calendar size={15} style={{ color: PALETTE.blue.main }} />
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    Prochains matchs
                  </p>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 11,
                      fontWeight: 600,
                      color: PALETTE.blue.main,
                      background: PALETTE.blue.bg,
                      border: `1px solid ${PALETTE.blue.border}`,
                      padding: "2px 8px",
                      borderRadius: 99,
                    }}
                  >
                    {upcoming.length}
                  </span>
                </div>

                {upcoming.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "24px 0",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 13,
                        color: "var(--text-muted)",
                      }}
                    >
                      Aucun match à venir
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setMatchForm({ ...EMPTY_MATCH, isPast: false });
                        setShowAddMatch(true);
                      }}
                      style={{
                        marginTop: 8,
                        fontSize: 12,
                        color: "#ff7a00",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      + Ajouter un match
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    {upcoming.map((m: any, i: number) => {
                      const matchDate = parseMatchDate(m);
                      return (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 14px",
                          borderRadius: 10,
                          background:
                            i === 0
                              ? "linear-gradient(135deg,rgba(59,130,246,0.10),rgba(139,92,246,0.08))"
                              : "rgba(255,255,255,0.02)",
                          border: `1px solid ${
                            i === 0 ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.05)"
                          }`,
                          borderLeft: `3px solid ${
                            i === 0 ? PALETTE.indigo.main : "rgba(255,255,255,0.10)"
                          }`,
                        }}
                      >
                        <div
                          style={{
                            flexShrink: 0,
                            textAlign: "center",
                            padding: "4px 10px",
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 8,
                            minWidth: 52,
                          }}
                        >
                          <p
                            style={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: i === 0 ? PALETTE.indigo.main : "var(--text-muted)",
                            }}
                          >
                            {matchDate.getDate()}
                          </p>
                          <p
                            style={{
                              fontSize: 9,
                              color: "var(--text-muted)",
                              textTransform: "uppercase",
                            }}
                          >
                            {matchDate.toLocaleDateString("fr-FR", { month: "short" })}
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
                            vs {m.opponent}
                          </p>
                          <p
                            style={{
                              fontSize: 10,
                              color: "var(--text-muted)",
                              marginTop: 2,
                            }}
                          >
                            {m.competition}
                          </p>
                        </div>

                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: m.homeAway === "D" ? PALETTE.accent.main : PALETTE.violet.main,
                            background: m.homeAway === "D" ? PALETTE.accent.bg : PALETTE.violet.bg,
                            border: `1px solid ${
                              m.homeAway === "D" ? PALETTE.accent.border : PALETTE.violet.border
                            }`,
                            padding: "3px 8px",
                            borderRadius: 99,
                            flexShrink: 0,
                          }}
                        >
                          {m.homeAway === "D" ? "Domicile" : "Extérieur"}
                        </span>
                      </motion.div>
                    );})}
                  </div>
                )}
              </GlassCard>

              <GlassCard raised className="p-5">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 14,
                  }}
                >
                  <Trophy size={15} style={{ color: "#ff7a00" }} />
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    Résultats récents
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMatchForm({ ...EMPTY_MATCH, isPast: true });
                      setShowAddMatch(true);
                    }}
                    style={{
                      marginLeft: "auto",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#ff7a00",
                      background: "rgba(255,122,0,0.10)",
                      border: "1px solid rgba(255,122,0,0.25)",
                      borderRadius: 8,
                      padding: "3px 10px",
                      cursor: "pointer",
                    }}
                  >
                    + Résultat
                  </button>
                </div>

                {past.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "24px 0",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 13,
                        color: "var(--text-muted)",
                      }}
                    >
                      Aucun résultat enregistré
                    </p>
                    <p
                      style={{
                        fontSize: 11,
                        color: "var(--text-muted)",
                        marginTop: 4,
                        opacity: 0.7,
                      }}
                    >
                      Ajoutez les résultats après chaque match
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    {past.slice(0, 5).map((m: any, i: number) => {
                      const rc = getResultPalette(m.result);
                      return (
                        <motion.div
                          key={m.id}
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "10px 14px",
                            borderRadius: 10,
                            background: rc.bg,
                            border: `1px solid ${rc.border}`,
                            borderLeft: `3px solid ${rc.main}`,
                          }}
                        >
                          <div
                            style={{
                              flexShrink: 0,
                              textAlign: "center",
                              padding: "4px 12px",
                              background: `${rc.main}20`,
                              border: `1px solid ${rc.border}`,
                              borderRadius: 8,
                            }}
                          >
                            <p
                              style={{
                                fontSize: 16,
                                fontWeight: 900,
                                color: rc.main,
                                lineHeight: 1,
                              }}
                            >
                              {m.score}
                            </p>
                            <p
                              style={{
                                fontSize: 9,
                                fontWeight: 700,
                                color: rc.main,
                                textTransform: "uppercase",
                                marginTop: 2,
                              }}
                            >
                              {m.result === "V"
                                ? "Victoire"
                                : m.result === "N"
                                  ? "Nul"
                                  : "Défaite"}
                            </p>
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: "var(--text-primary)",
                              }}
                            >
                              vs {m.opponent}
                            </p>
                            <p
                              style={{
                                fontSize: 10,
                                color: "var(--text-muted)",
                                marginTop: 2,
                              }}
                            >
                              {m.matchDate} · {m.competition}
                            </p>
                          </div>

                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: "var(--text-muted)",
                              flexShrink: 0,
                            }}
                          >
                            {m.homeAwayLabel}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </GlassCard>
            </div>

            <GlassCard raised className="p-5">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <Target size={15} style={{ color: "#ff7a00" }} />
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}
                >
                  Préparation du prochain match
                </p>
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 13,
                    fontWeight: 800,
                    color:
                      prepProgress >= 80 ? "#22c55e" : prepProgress >= 50 ? "#f59e0b" : "#ef4444",
                  }}
                >
                  {prepProgress}%
                </span>
              </div>

              <div
                style={{
                  height: 6,
                  borderRadius: 99,
                  background: "rgba(255,255,255,0.08)",
                  overflow: "hidden",
                  marginBottom: 16,
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${prepProgress}%` }}
                  transition={{ duration: 0.8 }}
                  style={{
                    height: "100%",
                    borderRadius: 99,
                    background:
                      prepProgress >= 80 ? "#22c55e" : prepProgress >= 50 ? "#f59e0b" : "#ef4444",
                  }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                {checklist.map((item, i) => {
                  const Icon = CHECKLIST_ICONS[item.label] ?? CheckCircle2;
                  const c = item.done
                    ? PALETTE.green
                    : CHECKLIST_COLORS[i % CHECKLIST_COLORS.length];
                  return (
                    <motion.div
                      key={item.id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => toggleCheck(item.id)}
                      style={{
                        padding: "14px 16px",
                        borderRadius: 14,
                        background: item.done ? PALETTE.green.bg : "rgba(255,255,255,0.03)",
                        border: `1px solid ${
                          item.done ? PALETTE.green.border : "rgba(255,255,255,0.08)"
                        }`,
                        borderTop: `3px solid ${item.done ? PALETTE.green.main : c.main}`,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          marginBottom: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 9,
                            background: item.done ? PALETTE.green.bg : c.bg,
                            border: `1px solid ${item.done ? PALETTE.green.border : c.border}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Icon
                            size={14}
                            style={{
                              color: item.done ? PALETTE.green.main : c.main,
                            }}
                          />
                        </div>
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 5,
                            background: item.done ? PALETTE.green.main : "rgba(255,255,255,0.08)",
                            border: `1px solid ${
                              item.done ? PALETTE.green.main : "rgba(255,255,255,0.15)"
                            }`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {item.done && <CheckCircle2 size={10} style={{ color: "white" }} />}
                        </div>
                      </div>
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: item.done ? "var(--text-muted)" : "var(--text-primary)",
                          textDecoration: item.done ? "line-through" : "none",
                          lineHeight: 1.4,
                        }}
                      >
                        {item.label}
                      </p>
                    </motion.div>
                  );
                })}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                {(
                  [
                    {
                      label: "Joueurs disponibles",
                      value: disponibles,
                      c: PALETTE.green,
                      icon: CheckCircle2,
                    },
                    {
                      label: "Indisponibles",
                      value: blessesCount,
                      c: PALETTE.red,
                      icon: AlertTriangle,
                    },
                  ] as {
                    label: string;
                    value: number;
                    c: (typeof PALETTE)[keyof typeof PALETTE];
                    icon: LucideIcon;
                  }[]
                ).map((k) => {
                  const KIcon = k.icon;
                  return (
                    <div
                      key={k.label}
                      style={{
                        padding: "14px 18px",
                        borderRadius: 12,
                        background: k.c.bg,
                        border: `1px solid ${k.c.border}`,
                        borderLeft: `4px solid ${k.c.main}`,
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: `${k.c.main}20`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <KIcon size={16} style={{ color: k.c.main }} />
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: 26,
                            fontWeight: 900,
                            color: k.c.main,
                            lineHeight: 1,
                          }}
                        >
                          {k.value}
                        </p>
                        <p
                          style={{
                            fontSize: 11,
                            color: "var(--text-muted)",
                            marginTop: 4,
                            fontWeight: 500,
                          }}
                        >
                          {k.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            <GlassCard raised className="p-5">
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
                    background: PALETTE.violet.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Shield size={14} style={{ color: PALETTE.violet.main }} />
                </div>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}
                >
                  Focus tactique de la semaine
                </p>
              </div>
              <textarea
                value={tacticalFocus}
                onChange={(e) => saveTacticalFocus(e.target.value)}
                placeholder="Ex: Pressing haut dès la perte, organisation en 4-3-3 défensif..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${PALETTE.violet.border}`,
                  borderRadius: 10,
                  fontSize: 13,
                  color: "var(--text-primary)",
                  resize: "vertical",
                  outline: "none",
                  fontFamily: "inherit",
                  lineHeight: 1.6,
                }}
              />
              <p
                style={{
                  fontSize: 10,
                  color: "var(--text-muted)",
                  marginTop: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <CheckCircle2 size={9} />
                Sauvegardé automatiquement
              </p>
            </GlassCard>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 10,
              }}
            >
              {QUICK_ACTIONS.map((item, i) => {
                const ItemIcon = item.icon;
                const isHovered = hoveredQuickAction === i;
                return (
                  <motion.button
                    key={item.label}
                    type="button"
                    onClick={() => navigate(item.path)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onMouseEnter={() => setHoveredQuickAction(i)}
                    onMouseLeave={() => setHoveredQuickAction(null)}
                    style={{
                      padding: "18px 12px",
                      borderRadius: 16,
                      background: isHovered ? PALETTE.accent.bg : "rgba(255,255,255,0.03)",
                      border: `1px solid ${
                        isHovered ? PALETTE.accent.border : "rgba(255,255,255,0.08)"
                      }`,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 12,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: item.iconColor.bg,
                        border: `1px solid ${item.iconColor.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ItemIcon size={20} style={{ color: item.iconColor.main }} />
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        textAlign: "center",
                      }}
                    >
                      {item.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {showAddMatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddMatch(false)}
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
              padding: "16px",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: 520,
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
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: "var(--text-primary)",
                  }}
                >
                  {matchForm.isPast ? "Ajouter un résultat" : "Planifier un match"}
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddMatch(false)}
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

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: 20,
                }}
              >
                {[
                  { label: "Match à venir", isPast: false },
                  { label: "Résultat passé", isPast: true },
                ].map((opt) => (
                  <button
                    key={String(opt.isPast)}
                    type="button"
                    onClick={() => setMatchForm((p) => ({ ...p, isPast: opt.isPast }))}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      border: "none",
                      background:
                        matchForm.isPast === opt.isPast ? "#ff7a00" : "rgba(255,255,255,0.06)",
                      color: matchForm.isPast === opt.isPast ? "white" : "var(--text-muted)",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                <div>
                  <label style={labelStyle}>Adversaire *</label>
                  <input
                    placeholder="Ex: ES Sahel, Club Africain..."
                    value={matchForm.opponent}
                    onChange={(e) => setMatchForm((p) => ({ ...p, opponent: e.target.value }))}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Compétition</label>
                  <select
                    className="odin-select"
                    value={matchForm.competition}
                    onChange={(e) => setMatchForm((p) => ({ ...p, competition: e.target.value }))}
                    style={selectStyle}
                  >
                    <option>Ligue 1</option>
                    <option>Coupe de Tunisie</option>
                    <option>Ligue des Champions CAF</option>
                    <option>Coupe de la CAF</option>
                    <option>Match amical</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Date *</label>
                  <input
                    type="date"
                    value={matchForm.matchDate}
                    onChange={(e) => setMatchForm((p) => ({ ...p, matchDate: e.target.value }))}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Lieu</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[
                      { val: "D", label: "Domicile" },
                      { val: "E", label: "Extérieur" },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() =>
                          setMatchForm((p) => ({ ...p, homeAway: opt.val as "D" | "E" }))
                        }
                        style={{
                          flex: 1,
                          padding: "8px",
                          borderRadius: 10,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          border: `1px solid ${
                            matchForm.homeAway === opt.val ? "#ff7a00" : "rgba(255,255,255,0.10)"
                          }`,
                          background:
                            matchForm.homeAway === opt.val
                              ? "rgba(255,122,0,0.15)"
                              : "rgba(255,255,255,0.04)",
                          color:
                            matchForm.homeAway === opt.val ? "#ff7a00" : "var(--text-muted)",
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {matchForm.isPast && (
                  <>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto 1fr",
                        gap: 8,
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <label style={labelStyle}>Buts marqués</label>
                        <input
                          type="number"
                          min="0"
                          value={matchForm.goalsFor}
                          onChange={(e) =>
                            setMatchForm((p) => ({ ...p, goalsFor: e.target.value }))
                          }
                          style={inputStyle}
                        />
                      </div>
                      <p
                        style={{
                          fontSize: 20,
                          fontWeight: 800,
                          color: "var(--text-muted)",
                          textAlign: "center",
                          marginTop: 20,
                        }}
                      >
                        —
                      </p>
                      <div>
                        <label style={labelStyle}>Buts concédés</label>
                        <input
                          type="number"
                          min="0"
                          value={matchForm.goalsAgainst}
                          onChange={(e) =>
                            setMatchForm((p) => ({ ...p, goalsAgainst: e.target.value }))
                          }
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={labelStyle}>Résultat</label>
                      <div style={{ display: "flex", gap: 6 }}>
                        {[
                          { val: "V", label: "Victoire", c: "#22c55e" },
                          { val: "N", label: "Nul", c: "#f59e0b" },
                          { val: "D", label: "Défaite", c: "#ef4444" },
                        ].map((opt) => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() =>
                              setMatchForm((p) => ({ ...p, result: opt.val as "V" | "N" | "D" }))
                            }
                            style={{
                              flex: 1,
                              padding: "8px",
                              borderRadius: 10,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                              border: `1px solid ${
                                matchForm.result === opt.val ? opt.c : "rgba(255,255,255,0.10)"
                              }`,
                              background:
                                matchForm.result === opt.val
                                  ? `${opt.c}20`
                                  : "rgba(255,255,255,0.04)",
                              color:
                                matchForm.result === opt.val ? opt.c : "var(--text-muted)",
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label style={labelStyle}>Formation adversaire (optionnel)</label>
                  <input
                    placeholder="Ex: 4-3-3, 4-4-2..."
                    value={matchForm.opponentFormation}
                    onChange={(e) =>
                      setMatchForm((p) => ({ ...p, opponentFormation: e.target.value }))
                    }
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Forces adversaire (optionnel)</label>
                  <input
                    placeholder="Ex: Jeu long, pressing intense..."
                    value={matchForm.opponentStrengths}
                    onChange={(e) =>
                      setMatchForm((p) => ({ ...p, opponentStrengths: e.target.value }))
                    }
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Faiblesses adversaire (optionnel)</label>
                  <input
                    placeholder="Ex: Jeu aérien, transitions..."
                    value={matchForm.opponentWeaknesses}
                    onChange={(e) =>
                      setMatchForm((p) => ({ ...p, opponentWeaknesses: e.target.value }))
                    }
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Notes (optionnel)</label>
                  <textarea
                    rows={2}
                    placeholder="Observations personnelles..."
                    value={matchForm.notes}
                    onChange={(e) => setMatchForm((p) => ({ ...p, notes: e.target.value }))}
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                </div>
              </div>

              <motion.button
                type="button"
                onClick={saveMatch}
                disabled={submitting || !matchForm.opponent || !matchForm.matchDate}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: "100%",
                  marginTop: 20,
                  padding: "14px",
                  background:
                    submitting || !matchForm.opponent || !matchForm.matchDate
                      ? "rgba(255,255,255,0.10)"
                      : "linear-gradient(135deg,#ff7a00,#e66000)",
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
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Enregistrement...
                  </>
                ) : (
                  <>
                    <Save size={16} /> Enregistrer
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditStanding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEditStanding(false)}
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
              padding: "16px",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: 440,
                maxHeight: "90vh",
                overflowY: "auto",
                background: "rgba(14,10,35,0.98)",
                border: "1px solid rgba(59,130,246,0.30)",
                borderTop: "4px solid #3b82f6",
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
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: "var(--text-primary)",
                  }}
                >
                  Classement
                </p>
                <button
                  type="button"
                  onClick={() => setShowEditStanding(false)}
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

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  {(
                    [
                      { label: "Position", key: "position" },
                      { label: "Points", key: "points" },
                      { label: "Joués", key: "played" },
                      { label: "Victoires", key: "won" },
                      { label: "Nuls", key: "drawn" },
                      { label: "Défaites", key: "lost" },
                      { label: "Buts marqués", key: "goalsFor" },
                      { label: "Buts concédés", key: "goalsAgainst" },
                    ] as const
                  ).map((f) => (
                    <div key={f.key}>
                      <label style={labelStyle}>{f.label}</label>
                      <input
                        type="number"
                        min="0"
                        value={standingForm[f.key]}
                        onChange={(e) =>
                          setStandingForm((p) => ({ ...p, [f.key]: e.target.value }))
                        }
                        style={inputStyle}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label style={labelStyle}>Forme récente (5 derniers matchs)</label>
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    {["V", "N", "D"].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => toggleFormResult(r)}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 800,
                          cursor: "pointer",
                          border: "none",
                          background: r === "V" ? "#22c55e" : r === "N" ? "#f59e0b" : "#ef4444",
                          color: "white",
                        }}
                      >
                        {r}
                      </button>
                    ))}
                    <div
                      style={{
                        display: "flex",
                        gap: 4,
                        marginLeft: 8,
                      }}
                    >
                      {standingForm.form.map((f, i) => (
                        <span
                          key={i}
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 6,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            fontWeight: 800,
                            color: "white",
                            background: f === "V" ? "#22c55e" : f === "N" ? "#f59e0b" : "#ef4444",
                          }}
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                    {standingForm.form.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setStandingForm((p) => ({ ...p, form: [] }))}
                        style={{
                          fontSize: 10,
                          color: "var(--text-muted)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <motion.button
                type="button"
                onClick={saveStanding}
                disabled={submitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: "100%",
                  marginTop: 20,
                  padding: "14px",
                  background: "linear-gradient(135deg,#3b82f6,#2563eb)",
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
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save size={16} /> Sauvegarder
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
