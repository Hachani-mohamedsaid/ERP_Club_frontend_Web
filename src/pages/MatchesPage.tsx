import { useEffect, useMemo, useRef, useState } from "react";
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
  Loader2,
  Target,
  Swords,
  Shield,
  MapPin,
  TrendingUp,
  Users,
  AlertTriangle,
  Activity,
  FileText,
  Crosshair,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { apiFetch } from "../lib/api/authHeaders";
import { clubApi } from "../lib/api/club";

const ACCENT = "#ff7a00";

const C = {
  accent: { main: ACCENT, bg: "rgba(255,122,0,0.12)", border: "rgba(255,122,0,0.30)" },
  blue: { main: "#3b82f6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.25)" },
  green: { main: "#22c55e", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.25)" },
  red: { main: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.25)" },
  amber: { main: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)" },
};

type MatchResult = "V" | "N" | "D";
type HomeAway = "D" | "E";

interface ClubMatch {
  id: string;
  opponent: string;
  competition: string;
  matchDate: string;
  matchDateISO?: string;
  homeAway: HomeAway;
  homeAwayLabel?: string;
  result?: MatchResult;
  score?: string;
  goalsFor?: number;
  goalsAgainst?: number;
  opponentFormation?: string | null;
  opponentStrengths?: string | null;
  opponentWeaknesses?: string | null;
  notes?: string | null;
}

interface ClubPlayer {
  fullName?: string;
  status?: string;
}

interface InjuryRow {
  name?: string;
}

interface MatchObjective {
  id: string;
  label: string;
  done: boolean;
}

type ObjectivesStore = Record<string, MatchObjective[]>;

const OBJECTIVES_KEY = "odin_match_objectives";

const DEFAULT_OBJECTIVES: MatchObjective[] = [
  { id: "1", label: "Remporter le match", done: false },
  { id: "2", label: "Garder la cage inviolée", done: false },
  { id: "3", label: "60% de possession", done: false },
  { id: "4", label: "Marquer en premier", done: false },
];

const EMPTY_MATCH = {
  opponent: "",
  competition: "Ligue 1",
  matchDate: "",
  homeAway: "D" as HomeAway,
  goalsFor: "",
  goalsAgainst: "",
  result: "V" as MatchResult,
  opponentFormation: "",
  opponentStrengths: "",
  opponentWeaknesses: "",
  notes: "",
  isPast: false,
};

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

const getResultPalette = (result: string) =>
  result === "V" ? C.green : result === "N" ? C.amber : C.red;

const parseMatchDate = (m: { matchDateISO?: string; matchDate?: string }) =>
  new Date(m.matchDateISO ?? m.matchDate ?? "");

const COMPETITION_TABS = [
  "Ligue 1",
  "Coupe de Tunisie",
  "Ligue des Champions CAF",
  "Coupe de la CAF",
  "Match amical",
  "Tous",
] as const;

type CompetitionTab = (typeof COMPETITION_TABS)[number];

function isAmicalCompetition(comp: string): boolean {
  return (comp ?? "").toLowerCase().includes("amical");
}

function resultToPoints(result: string | undefined): number {
  if (result === "V") return 3;
  if (result === "N") return 1;
  return 0;
}

function loadObjectivesStore(): ObjectivesStore {
  try {
    const raw = localStorage.getItem(OBJECTIVES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ObjectivesStore;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveObjectivesStore(store: ObjectivesStore) {
  try {
    localStorage.setItem(OBJECTIVES_KEY, JSON.stringify(store));
  } catch {
    /* ignore */
  }
}

function playerStatus(p: ClubPlayer): string {
  return (p.status ?? "").toUpperCase().trim();
}

function hasMatchingInjury(p: ClubPlayer, injuries: InjuryRow[]): boolean {
  const name = (p.fullName ?? "").toLowerCase().trim();
  if (!name) return false;
  return injuries.some((inj) => (inj.name ?? "").toLowerCase().trim() === name);
}

export function MatchesPage() {
  const navigate = useNavigate();

  const [past, setPast] = useState<ClubMatch[]>([]);
  const [upcoming, setUpcoming] = useState<ClubMatch[]>([]);
  const [nextMatch, setNextMatch] = useState<ClubMatch | null>(null);
  const [daysToNext, setDaysToNext] = useState<number | null>(null);
  const [injuries, setInjuries] = useState<InjuryRow[]>([]);
  const [players, setPlayers] = useState<ClubPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddMatch, setShowAddMatch] = useState(false);
  const [competitionFilter, setCompetitionFilter] =
    useState<CompetitionTab>("Ligue 1");
  const [submitting, setSubmitting] = useState(false);
  const classementTouchX = useRef<number | null>(null);

  const [matchForm, setMatchForm] = useState(EMPTY_MATCH);
  const [newObjective, setNewObjective] = useState("");
  const [hoveredAction, setHoveredAction] = useState<number | null>(null);

  const [objectivesStore, setObjectivesStore] = useState<ObjectivesStore>(() => loadObjectivesStore());

  const reloadMatches = async () => {
    try {
      const r = await apiFetch("/club/matches");
      if (r.ok) {
        const d = (await r.json()) as {
          past?: ClubMatch[];
          upcoming?: ClubMatch[];
          nextMatch?: ClubMatch | null;
          daysToNext?: number | null;
        };
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
      let matchesData: {
        past?: ClubMatch[];
        upcoming?: ClubMatch[];
        nextMatch?: ClubMatch | null;
        daysToNext?: number | null;
      } | null = null;
      let injuriesData: InjuryRow[] = [];
      let playersData: ClubPlayer[] = [];

      try {
        const r = await apiFetch("/club/matches");
        if (r.ok) matchesData = await r.json();
      } catch (e) {
        console.warn(e);
      }

      try {
        const r = (await clubApi.getInjuries()) as { injured?: InjuryRow[] };
        injuriesData = r?.injured ?? [];
      } catch (e) {
        console.warn(e);
      }

      try {
        playersData = (await clubApi.getPlayers()) as ClubPlayer[];
      } catch (e) {
        console.warn(e);
      }

      if (matchesData) {
        setPast(matchesData.past ?? []);
        setUpcoming(matchesData.upcoming ?? []);
        setNextMatch(matchesData.nextMatch ?? null);
        setDaysToNext(matchesData.daysToNext ?? null);
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
      const body: Record<string, string | number | null> = {
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

  const openPlanifier = () => {
    setMatchForm({ ...EMPTY_MATCH, isPast: false });
    setShowAddMatch(true);
  };

  const openResultat = () => {
    setMatchForm({ ...EMPTY_MATCH, isPast: true });
    setShowAddMatch(true);
  };

  const matchObjectives: MatchObjective[] = nextMatch
    ? objectivesStore[nextMatch.id] ?? DEFAULT_OBJECTIVES
    : [];

  const persistObjectives = (matchId: string, list: MatchObjective[]) => {
    const next = { ...objectivesStore, [matchId]: list };
    setObjectivesStore(next);
    saveObjectivesStore(next);
  };

  const toggleObjective = (id: string) => {
    if (!nextMatch) return;
    const list = matchObjectives.map((o) => (o.id === id ? { ...o, done: !o.done } : o));
    persistObjectives(nextMatch.id, list);
  };

  const addObjective = () => {
    if (!nextMatch || !newObjective.trim()) return;
    const list = [
      ...matchObjectives,
      { id: `${Date.now()}`, label: newObjective.trim(), done: false },
    ];
    persistObjectives(nextMatch.id, list);
    setNewObjective("");
  };

  const disponibles = players.filter((p) => {
    const s = playerStatus(p);
    return s === "DISPONIBLE" && !hasMatchingInjury(p, injuries);
  }).length;

  const limites = players.filter((p) => {
    const s = playerStatus(p);
    return (s === "LIMITE" || s === "LIMITÉ") && !hasMatchingInjury(p, injuries);
  }).length;

  const blessesCount = Math.max(
    injuries.length,
    players.filter((p) => {
      const s = playerStatus(p);
      return s === "BLESSE" || s === "BLESSÉ";
    }).length,
  );

  const totalPlayers = Math.max(players.length, 1);
  const availabilityPct = Math.round((disponibles / totalPlayers) * 100);
  const objectivesDone = matchObjectives.filter((o) => o.done).length;
  const objectivesTotal = Math.max(matchObjectives.length, 1);
  const objectivesPct = nextMatch ? Math.round((objectivesDone / objectivesTotal) * 100) : 0;

  const readinessScore = (() => {
    const availPart = availabilityPct * 0.4;
    const injuryPart = Math.max(0, 100 - blessesCount * 12) * 0.25;
    const objPart = (nextMatch ? objectivesPct : 0) * 0.2;
    const nextPart = nextMatch ? 15 : 0;
    return Math.round(Math.min(100, availPart + injuryPart + objPart + nextPart));
  })();

  const readinessColor =
    readinessScore >= 75 ? C.green.main : readinessScore >= 50 ? C.amber.main : C.red.main;

  const seasonKpis = (() => {
    const played = past.length;
    const wins = past.filter((m) => m.result === "V").length;
    const draws = past.filter((m) => m.result === "N").length;
    const losses = past.filter((m) => m.result === "D").length;
    const goalsFor = past.reduce((s, m) => s + (m.goalsFor ?? 0), 0);
    const goalsAgainst = past.reduce((s, m) => s + (m.goalsAgainst ?? 0), 0);
    const cleanSheets = past.filter((m) => (m.goalsAgainst ?? 0) === 0).length;
    return [
      { label: "Joués", value: played, color: C.blue.main },
      { label: "Victoires", value: wins, color: C.green.main },
      { label: "Nuls", value: draws, color: C.amber.main },
      { label: "Défaites", value: losses, color: C.red.main },
      { label: "Buts+", value: goalsFor, color: ACCENT },
      { label: "Buts−", value: goalsAgainst, color: C.red.main },
      { label: "Cages inviolées", value: cleanSheets, color: C.green.main },
    ];
  })();

  const teamForm = past.slice(0, 5).map((m) => m.result ?? "D");

  const competitionFilterIndex = COMPETITION_TABS.indexOf(competitionFilter);

  const competitionStats = useMemo(() => {
    const filtered = past.filter((m) => {
      const comp = m.competition ?? "";
      if (competitionFilter === "Tous") return !isAmicalCompetition(comp);
      return comp === competitionFilter;
    });

    const isAmical = competitionFilter === "Match amical";
    const countable = isAmical
      ? []
      : filtered.filter((m) => !isAmicalCompetition(m.competition ?? ""));

    const points = countable.reduce(
      (sum, m) => sum + resultToPoints(m.result),
      0
    );

    return {
      points: isAmical ? 0 : points,
      played: filtered.length,
      wins: filtered.filter((m) => m.result === "V").length,
      draws: filtered.filter((m) => m.result === "N").length,
      losses: filtered.filter((m) => m.result === "D").length,
      isAmical,
    };
  }, [past, competitionFilter]);

  const swipeCompetition = (dir: -1 | 1) => {
    const i = competitionFilterIndex < 0 ? 0 : competitionFilterIndex;
    const next =
      (i + dir + COMPETITION_TABS.length) % COMPETITION_TABS.length;
    setCompetitionFilter(COMPETITION_TABS[next]);
  };

  const quickActions: {
    label: string;
    icon: LucideIcon;
    onClick: () => void;
  }[] = [
    { label: "Créer match", icon: Plus, onClick: openPlanifier },
    { label: "Composition", icon: Users, onClick: () => navigate("/coach/lineup") },
    { label: "Tableau tactique", icon: Crosshair, onClick: () => navigate("/coach/tactical") },
    { label: "Analyse", icon: Target, onClick: () => navigate("/coach/match-analysis") },
    { label: "Rapport", icon: FileText, onClick: () => navigate("/coach/match-analysis") },
  ];

  const briefLines: string[] = [];
  if (nextMatch) {
    if (nextMatch.opponentFormation) {
      briefLines.push(`Formation adverse probable : ${nextMatch.opponentFormation}.`);
    }
    if (nextMatch.opponentStrengths) {
      briefLines.push(`Forces : ${nextMatch.opponentStrengths}.`);
    }
    if (nextMatch.opponentWeaknesses) {
      briefLines.push(`Faiblesses à exploiter : ${nextMatch.opponentWeaknesses}.`);
    }
    if (nextMatch.notes) {
      briefLines.push(`Notes : ${nextMatch.notes}.`);
    }
    if (blessesCount > 0) {
      briefLines.push(
        `Recommandation médicale : ${blessesCount} blessé${blessesCount > 1 ? "s" : ""} — adapter la composition et limiter la charge.`,
      );
    } else {
      briefLines.push("Effectif médical : aucun blessé signalé — pleine disponibilité pour la sélection.");
    }
    if (briefLines.length === 1) {
      briefLines.unshift(
        `Brief ${nextMatch.opponent} : complétez forces / faiblesses / formation pour affiner le plan.`,
      );
    }
  }

  return (
    <>
      <style>{`
  .odin-select option {
    background: #12141c !important;
    color: #ffffff !important;
  }
  .odin-select {
    background: rgba(255,255,255,0.05) !important;
    color: #ffffff !important;
  }
`}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* 1. Header */}
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
            <p
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              Centre Match
            </p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              Commande jour de match — préparation, résultats, objectifs
            </p>
          </div>
          <motion.button
            type="button"
            onClick={openPlanifier}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              borderRadius: 12,
              background: `linear-gradient(135deg,${ACCENT},#e66000)`,
              color: "white",
              fontSize: 13,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
            }}
          >
            <Calendar size={15} />
            Planifier
          </motion.button>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Loader2
              size={32}
              className="animate-spin"
              style={{ color: "var(--text-muted)", margin: "0 auto" }}
            />
          </div>
        )}

        {!loading && (
          <>
            {/* 2. Hero: Next Match + Readiness */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0,1fr) 220px",
                gap: 14,
                alignItems: "stretch",
              }}
              className="matches-hero-grid"
            >
              <style>{`
                @media (max-width: 900px) {
                  .matches-hero-grid { grid-template-columns: 1fr !important; }
                }
              `}</style>

              {nextMatch ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: "24px 28px",
                    borderRadius: 18,
                    background:
                      "linear-gradient(145deg, rgba(18,20,28,0.95) 0%, rgba(255,122,0,0.08) 100%)",
                    border: "1px solid rgba(255,122,0,0.25)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: -50,
                      right: -30,
                      width: 180,
                      height: 180,
                      borderRadius: "50%",
                      background: "rgba(255,122,0,0.06)",
                      pointerEvents: "none",
                    }}
                  />

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto 1fr auto",
                      gap: 20,
                      alignItems: "center",
                      position: "relative",
                      zIndex: 1,
                    }}
                    className="matches-vs-grid"
                  >
                    <style>{`
                      @media (max-width: 700px) {
                        .matches-vs-grid { grid-template-columns: 1fr !important; text-align: center; }
                      }
                    `}</style>

                    <div>
                      <p
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: ACCENT,
                          textTransform: "uppercase",
                          letterSpacing: "0.12em",
                          marginBottom: 8,
                        }}
                      >
                        Prochain match
                      </p>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "rgba(255,255,255,0.55)",
                          marginBottom: 4,
                        }}
                      >
                        ODIN FC
                      </p>
                      <p style={{ fontSize: 11, color: "var(--text-muted)" }}>Équipe</p>
                    </div>

                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: C.accent.bg,
                        border: `1px solid ${C.accent.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        fontWeight: 900,
                        color: ACCENT,
                      }}
                    >
                      VS
                    </div>

                    <div>
                      <p
                        style={{
                          fontSize: 22,
                          fontWeight: 900,
                          color: "var(--text-primary)",
                          lineHeight: 1.15,
                          marginBottom: 8,
                        }}
                      >
                        {nextMatch.opponent}
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        <span
                          style={{
                            fontSize: 12,
                            color: "rgba(255,255,255,0.6)",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <Trophy size={11} style={{ color: ACCENT }} />
                          {nextMatch.competition}
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            color: "rgba(255,255,255,0.6)",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <Calendar size={11} style={{ color: C.blue.main }} />
                          {nextMatch.matchDate}
                        </span>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            marginTop: 2,
                            fontSize: 11,
                            fontWeight: 700,
                            color: ACCENT,
                            background: C.accent.bg,
                            border: `1px solid ${C.accent.border}`,
                            padding: "3px 10px",
                            borderRadius: 8,
                            width: "fit-content",
                          }}
                        >
                          <MapPin size={10} />
                          {nextMatch.homeAwayLabel ??
                            (nextMatch.homeAway === "D" ? "Domicile" : "Extérieur")}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: "center", minWidth: 90 }}>
                      <p
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "rgba(255,255,255,0.4)",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          marginBottom: 4,
                        }}
                      >
                        J −
                      </p>
                      <p
                        style={{
                          fontSize: 42,
                          fontWeight: 900,
                          lineHeight: 1,
                          color: ACCENT,
                        }}
                      >
                        {daysToNext === 0 ? "0" : daysToNext ?? "—"}
                      </p>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
                        {daysToNext === 0
                          ? "Aujourd'hui"
                          : daysToNext === 1
                            ? "jour"
                            : "jours"}
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      marginTop: 20,
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    {(
                      [
                        { label: "Voir adversaire", path: "/coach/opponent", icon: Swords },
                        { label: "Composition", path: "/coach/lineup", icon: Users },
                        { label: "Tableau tactique", path: "/coach/tactical", icon: Crosshair },
                      ] as const
                    ).map((cta) => {
                      const Icon = cta.icon;
                      return (
                        <motion.button
                          key={cta.path}
                          type="button"
                          onClick={() => navigate(cta.path)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "8px 14px",
                            borderRadius: 10,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            color: "var(--text-primary)",
                          }}
                        >
                          <Icon size={13} style={{ color: ACCENT }} />
                          {cta.label}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    padding: "24px 28px",
                    borderRadius: 18,
                    background: "rgba(255,255,255,0.02)",
                    border: "1px dashed rgba(255,255,255,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 16,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: C.accent.bg,
                        border: `1px solid ${C.accent.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Swords size={22} style={{ color: ACCENT }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-muted)" }}>
                        Aucun match programmé
                      </p>
                      <p
                        style={{
                          fontSize: 12,
                          color: "var(--text-muted)",
                          marginTop: 3,
                          opacity: 0.7,
                        }}
                      >
                        Planifiez un match pour activer le centre de commande
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={openPlanifier}
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: ACCENT,
                      background: C.accent.bg,
                      border: `1px solid ${C.accent.border}`,
                      borderRadius: 12,
                      padding: "10px 18px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Plus size={14} />
                    Planifier
                  </button>
                </motion.div>
              )}

              {/* Readiness card */}
              <GlassCard
                raised
                className="p-5"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  gap: 10,
                }}
              >
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "var(--text-muted)",
                  }}
                >
                  Préparation match
                </p>
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: "50%",
                    border: `3px solid ${readinessColor}`,
                    boxShadow: `0 0 24px ${readinessColor}33`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                  }}
                >
                  <span style={{ fontSize: 28, fontWeight: 900, color: readinessColor, lineHeight: 1 }}>
                    {readinessScore}
                  </span>
                  <span style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>/100</span>
                </motion.div>
                <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 4 }}>
                  {[
                    { label: "Disponibilité", value: `${availabilityPct}%` },
                    { label: "Blessés", value: String(blessesCount) },
                    { label: "Objectifs", value: nextMatch ? `${objectivesPct}%` : "—" },
                    { label: "Match planifié", value: nextMatch ? "✓" : "Non" },
                  ].map((row) => (
                    <div
                      key={row.label}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 11,
                        color: "var(--text-muted)",
                      }}
                    >
                      <span>{row.label}</span>
                      <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* 3. Season KPIs */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                gap: 10,
              }}
              className="matches-kpi-grid"
            >
              <style>{`
                @media (max-width: 1000px) {
                  .matches-kpi-grid { grid-template-columns: repeat(4, 1fr) !important; }
                }
                @media (max-width: 600px) {
                  .matches-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
                }
              `}</style>
              {seasonKpis.map((k, i) => (
                <motion.div
                  key={k.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <GlassCard raised className="p-3" style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 22, fontWeight: 900, color: k.color, lineHeight: 1 }}>
                      {k.value}
                    </p>
                    <p
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "var(--text-muted)",
                        marginTop: 6,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {k.label}
                    </p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>

            {/* 4. Recent + side cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0,1.6fr) minmax(240px,0.9fr)",
                gap: 14,
              }}
              className="matches-mid-grid"
            >
              <style>{`
                @media (max-width: 900px) {
                  .matches-mid-grid { grid-template-columns: 1fr !important; }
                }
              `}</style>

              <GlassCard raised className="p-5">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 14,
                  }}
                >
                  <Trophy size={15} style={{ color: ACCENT }} />
                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                    Matchs récents
                  </p>
                  <button
                    type="button"
                    onClick={openResultat}
                    style={{
                      marginLeft: "auto",
                      fontSize: 11,
                      fontWeight: 600,
                      color: ACCENT,
                      background: C.accent.bg,
                      border: `1px solid ${C.accent.border}`,
                      borderRadius: 8,
                      padding: "4px 10px",
                      cursor: "pointer",
                    }}
                  >
                    + Résultat
                  </button>
                </div>

                {past.length === 0 ? (
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--text-muted)",
                      textAlign: "center",
                      padding: "28px 0",
                    }}
                  >
                    Aucun résultat enregistré
                  </p>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead>
                        <tr style={{ color: "var(--text-muted)", textAlign: "left" }}>
                          {["Date", "Adversaire", "Résultat", "Compétition", "Analyse"].map((h) => (
                            <th
                              key={h}
                              style={{
                                padding: "8px 10px",
                                fontWeight: 600,
                                fontSize: 10,
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                borderBottom: "1px solid rgba(255,255,255,0.08)",
                              }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {past.slice(0, 8).map((m, i) => {
                          const rc = getResultPalette(m.result ?? "D");
                          return (
                            <motion.tr
                              key={m.id}
                              initial={{ opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.03 }}
                              style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                            >
                              <td style={{ padding: "10px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                                {m.matchDate}
                              </td>
                              <td style={{ padding: "10px", fontWeight: 700, color: "var(--text-primary)" }}>
                                vs {m.opponent}
                              </td>
                              <td style={{ padding: "10px" }}>
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    padding: "3px 8px",
                                    borderRadius: 6,
                                    background: rc.bg,
                                    border: `1px solid ${rc.border}`,
                                    color: rc.main,
                                    fontWeight: 800,
                                  }}
                                >
                                  {m.result}
                                  <span style={{ fontWeight: 600, opacity: 0.9 }}>{m.score}</span>
                                </span>
                              </td>
                              <td style={{ padding: "10px", color: "var(--text-muted)" }}>{m.competition}</td>
                              <td style={{ padding: "10px" }}>
                                <button
                                  type="button"
                                  onClick={() => navigate("/coach/match-analysis")}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 2,
                                    background: "none",
                                    border: "none",
                                    color: ACCENT,
                                    fontWeight: 700,
                                    fontSize: 12,
                                    cursor: "pointer",
                                    padding: 0,
                                  }}
                                >
                                  Analyse
                                  <ChevronRight size={13} />
                                </button>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </GlassCard>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Team Form */}
                <GlassCard raised className="p-4">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <Activity size={14} style={{ color: ACCENT }} />
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                      Forme (5 derniers)
                    </p>
                  </div>
                  {teamForm.length === 0 ? (
                    <p style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>
                      Pas encore de résultats
                    </p>
                  ) : (
                    <div style={{ display: "flex", gap: 6 }}>
                      {teamForm.map((f, i) => {
                        const rc = getResultPalette(f);
                        return (
                          <motion.span
                            key={`${f}-${i}`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 8,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 12,
                              fontWeight: 800,
                              color: "white",
                              background: rc.main,
                            }}
                          >
                            {f}
                          </motion.span>
                        );
                      })}
                    </div>
                  )}
                </GlassCard>

                {/* Classement — points from results, filter by competition */}
                <GlassCard raised className="p-4">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 10,
                    }}
                  >
                    <TrendingUp size={14} style={{ color: ACCENT }} />
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--text-primary)",
                      }}
                    >
                      Classement
                    </p>
                  </div>

                  <p
                    style={{
                      fontSize: 10,
                      color: "var(--text-muted)",
                      marginBottom: 8,
                    }}
                  >
                    ← → ou glisser pour changer de compétition
                  </p>

                  {/* Swipe / filter */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 12,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => swipeCompetition(-1)}
                      aria-label="Compétition précédente"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        flexShrink: 0,
                        background: "rgba(255,122,0,0.12)",
                        border: `1px solid ${C.accent.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: ACCENT,
                      }}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        gap: 6,
                        overflowX: "auto",
                        paddingBottom: 2,
                        scrollbarWidth: "none",
                      }}
                    >
                      {COMPETITION_TABS.map((tab) => {
                        const active = competitionFilter === tab;
                        return (
                          <button
                            key={tab}
                            type="button"
                            onClick={() => setCompetitionFilter(tab)}
                            style={{
                              flexShrink: 0,
                              padding: "6px 11px",
                              borderRadius: 99,
                              fontSize: 10,
                              fontWeight: 700,
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                              border: `1px solid ${
                                active ? ACCENT : "rgba(255,255,255,0.10)"
                              }`,
                              background: active
                                ? "rgba(255,122,0,0.15)"
                                : "rgba(255,255,255,0.04)",
                              color: active ? ACCENT : "var(--text-muted)",
                            }}
                          >
                            {tab === "Ligue des Champions CAF"
                              ? "CAF CL"
                              : tab === "Coupe de la CAF"
                                ? "Coupe CAF"
                                : tab === "Coupe de Tunisie"
                                  ? "Coupe TN"
                                  : tab}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => swipeCompetition(1)}
                      aria-label="Compétition suivante"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        flexShrink: 0,
                        background: "rgba(255,122,0,0.12)",
                        border: `1px solid ${C.accent.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: ACCENT,
                      }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      marginBottom: 8,
                    }}
                  >
                    {competitionFilter}
                    {competitionStats.isAmical
                      ? " · pas de points officiels"
                      : ` · ${competitionStats.played} match(s)`}
                  </p>

                  <div
                    onTouchStart={(e) => {
                      classementTouchX.current = e.touches[0]?.clientX ?? null;
                    }}
                    onTouchEnd={(e) => {
                      const start = classementTouchX.current;
                      classementTouchX.current = null;
                      if (start == null) return;
                      const dx = (e.changedTouches[0]?.clientX ?? start) - start;
                      if (Math.abs(dx) < 40) return;
                      swipeCompetition(dx < 0 ? 1 : -1);
                    }}
                    style={{
                      padding: "14px 16px",
                      borderRadius: 10,
                      background: competitionStats.isAmical
                        ? C.amber.bg
                        : C.blue.bg,
                      border: `1px solid ${
                        competitionStats.isAmical
                          ? C.amber.border
                          : C.blue.border
                      }`,
                      textAlign: "center",
                      touchAction: "pan-y",
                      userSelect: "none",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 28,
                        fontWeight: 900,
                        color: competitionStats.isAmical
                          ? C.amber.main
                          : C.blue.main,
                        lineHeight: 1,
                      }}
                    >
                      {competitionStats.points}
                    </p>
                    <p
                      style={{
                        fontSize: 10,
                        color: "var(--text-muted)",
                        marginTop: 6,
                      }}
                    >
                      {competitionStats.isAmical
                        ? "Points (amicaux exclus)"
                        : "Points (V=3 · N=1 · D=0)"}
                    </p>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 6,
                      marginTop: 10,
                    }}
                  >
                    {[
                      {
                        label: "V",
                        value: competitionStats.wins,
                        c: C.green,
                      },
                      {
                        label: "N",
                        value: competitionStats.draws,
                        c: C.amber,
                      },
                      {
                        label: "D",
                        value: competitionStats.losses,
                        c: C.red,
                      },
                    ].map((row) => (
                      <div
                        key={row.label}
                        style={{
                          textAlign: "center",
                          padding: "6px 4px",
                          borderRadius: 8,
                          background: row.c.bg,
                          border: `1px solid ${row.c.border}`,
                        }}
                      >
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: row.c.main,
                          }}
                        >
                          {row.value}
                        </p>
                        <p
                          style={{
                            fontSize: 9,
                            color: "var(--text-muted)",
                          }}
                        >
                          {row.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {/* Squad Availability */}
                <GlassCard raised className="p-4">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <Shield size={14} style={{ color: C.green.main }} />
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                      Disponibilité effectif
                    </p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {(
                      [
                        { label: "Disponibles", value: disponibles, color: C.green },
                        { label: "Limités", value: limites, color: C.amber },
                        { label: "Blessés", value: blessesCount, color: C.red },
                      ] as const
                    ).map((row) => (
                      <div
                        key={row.label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 10px",
                          borderRadius: 8,
                          background: row.color.bg,
                          border: `1px solid ${row.color.border}`,
                        }}
                      >
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{row.label}</span>
                        <span style={{ fontSize: 16, fontWeight: 900, color: row.color.main }}>
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/coach/medical")}
                    style={{
                      marginTop: 12,
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      padding: "8px",
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 700,
                      color: ACCENT,
                      background: C.accent.bg,
                      border: `1px solid ${C.accent.border}`,
                      cursor: "pointer",
                    }}
                  >
                    <AlertTriangle size={12} />
                    Voir médical
                  </button>
                </GlassCard>
              </div>
            </div>

            {/* 5. Upcoming matches */}
            <GlassCard raised className="p-5">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Calendar size={15} style={{ color: C.blue.main }} />
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                  Matchs à venir
                </p>
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 11,
                    fontWeight: 600,
                    color: C.blue.main,
                    background: C.blue.bg,
                    border: `1px solid ${C.blue.border}`,
                    padding: "2px 8px",
                    borderRadius: 99,
                  }}
                >
                  {upcoming.length}
                </span>
              </div>

              {upcoming.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Aucun match à venir</p>
                  <button
                    type="button"
                    onClick={openPlanifier}
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      color: ACCENT,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    + Planifier un match
                  </button>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ color: "var(--text-muted)", textAlign: "left" }}>
                        {["Date", "Adversaire", "Compétition", "Lieu"].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: "8px 10px",
                              fontWeight: 600,
                              fontSize: 10,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              borderBottom: "1px solid rgba(255,255,255,0.08)",
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {upcoming.map((m, i) => {
                        const d = parseMatchDate(m);
                        return (
                          <motion.tr
                            key={m.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.04 }}
                            style={{
                              borderBottom: "1px solid rgba(255,255,255,0.04)",
                              background: i === 0 ? "rgba(255,122,0,0.04)" : "transparent",
                            }}
                          >
                            <td style={{ padding: "10px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                              {Number.isNaN(d.getTime())
                                ? m.matchDate
                                : d.toLocaleDateString("fr-FR", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })}
                            </td>
                            <td style={{ padding: "10px", fontWeight: 700, color: "var(--text-primary)" }}>
                              vs {m.opponent}
                            </td>
                            <td style={{ padding: "10px", color: "var(--text-muted)" }}>{m.competition}</td>
                            <td style={{ padding: "10px" }}>
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  color: m.homeAway === "D" ? ACCENT : C.blue.main,
                                  background: m.homeAway === "D" ? C.accent.bg : C.blue.bg,
                                  border: `1px solid ${
                                    m.homeAway === "D" ? C.accent.border : C.blue.border
                                  }`,
                                  padding: "3px 8px",
                                  borderRadius: 8,
                                }}
                              >
                                {m.homeAway === "D" ? "Domicile" : "Extérieur"}
                              </span>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </GlassCard>

            {/* 6. Match Objectives */}
            <GlassCard raised className="p-5">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Target size={15} style={{ color: ACCENT }} />
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                  Objectifs du match
                </p>
                {nextMatch && (
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 12,
                      fontWeight: 800,
                      color: readinessColor,
                    }}
                  >
                    {objectivesDone}/{matchObjectives.length}
                  </span>
                )}
              </div>

              {!nextMatch ? (
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  Planifiez un prochain match pour définir les objectifs.
                </p>
              ) : (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                    {matchObjectives.map((obj) => (
                      <motion.button
                        key={obj.id}
                        type="button"
                        onClick={() => toggleObjective(obj.id)}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "12px 14px",
                          borderRadius: 12,
                          textAlign: "left",
                          cursor: "pointer",
                          background: obj.done ? C.green.bg : "rgba(255,255,255,0.03)",
                          border: `1px solid ${obj.done ? C.green.border : "rgba(255,255,255,0.08)"}`,
                        }}
                      >
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 6,
                            flexShrink: 0,
                            background: obj.done ? C.green.main : "rgba(255,255,255,0.08)",
                            border: `1px solid ${obj.done ? C.green.main : "rgba(255,255,255,0.2)"}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            color: "white",
                            fontWeight: 800,
                          }}
                        >
                          {obj.done ? "✓" : ""}
                        </div>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: obj.done ? "var(--text-muted)" : "var(--text-primary)",
                            textDecoration: obj.done ? "line-through" : "none",
                          }}
                        >
                          {obj.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      value={newObjective}
                      onChange={(e) => setNewObjective(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addObjective();
                      }}
                      placeholder="Nouvel objectif..."
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={addObjective}
                      disabled={!newObjective.trim()}
                      style={{
                        padding: "0 16px",
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: newObjective.trim() ? "pointer" : "default",
                        background: newObjective.trim() ? C.accent.bg : "rgba(255,255,255,0.04)",
                        border: `1px solid ${
                          newObjective.trim() ? C.accent.border : "rgba(255,255,255,0.08)"
                        }`,
                        color: newObjective.trim() ? ACCENT : "var(--text-muted)",
                      }}
                    >
                      Ajouter
                    </button>
                  </div>
                </>
              )}
            </GlassCard>

            {/* 7. AI Match Brief */}
            <GlassCard raised className="p-5">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Sparkles size={15} style={{ color: ACCENT }} />
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                  Brief IA Match
                </p>
              </div>
              {!nextMatch ? (
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  Le brief s&apos;active dès qu&apos;un prochain match est planifié.
                </p>
              ) : (
                <div
                  style={{
                    padding: "14px 16px",
                    borderRadius: 12,
                    background: "rgba(255,122,0,0.06)",
                    border: "1px solid rgba(255,122,0,0.18)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {briefLines.map((line, i) => (
                    <p
                      key={i}
                      style={{
                        fontSize: 13,
                        lineHeight: 1.55,
                        color: "rgba(255,255,255,0.78)",
                        display: "flex",
                        gap: 8,
                      }}
                    >
                      <CheckCircle2
                        size={14}
                        style={{ color: ACCENT, flexShrink: 0, marginTop: 3 }}
                      />
                      {line}
                    </p>
                  ))}
                </div>
              )}
            </GlassCard>

            {/* 8. Quick actions */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 10,
              }}
              className="matches-actions-grid"
            >
              <style>{`
                @media (max-width: 800px) {
                  .matches-actions-grid { grid-template-columns: repeat(3, 1fr) !important; }
                }
                @media (max-width: 480px) {
                  .matches-actions-grid { grid-template-columns: repeat(2, 1fr) !important; }
                }
              `}</style>
              {quickActions.map((item, i) => {
                const Icon = item.icon;
                const hovered = hoveredAction === i;
                return (
                  <motion.button
                    key={item.label}
                    type="button"
                    onClick={item.onClick}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onMouseEnter={() => setHoveredAction(i)}
                    onMouseLeave={() => setHoveredAction(null)}
                    style={{
                      padding: "16px 10px",
                      borderRadius: 14,
                      background: hovered ? C.accent.bg : "rgba(255,255,255,0.03)",
                      border: `1px solid ${hovered ? C.accent.border : "rgba(255,255,255,0.08)"}`,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 10,
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 11,
                        background: C.accent.bg,
                        border: `1px solid ${C.accent.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={18} style={{ color: ACCENT }} />
                    </div>
                    <span
                      style={{
                        fontSize: 11,
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

      {/* Add match modal */}
      <AnimatePresence>
        {showAddMatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddMatch(false)}
            style={{
              position: "fixed",
              inset: 0,
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
                background: "rgba(12,14,22,0.98)",
                border: "1px solid rgba(255,122,0,0.30)",
                borderTop: `4px solid ${ACCENT}`,
                borderRadius: 20,
                padding: 24,
                boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
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

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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
                    {(
                      [
                        { val: "D" as const, label: "Domicile" },
                        { val: "E" as const, label: "Extérieur" },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setMatchForm((p) => ({ ...p, homeAway: opt.val }))}
                        style={{
                          flex: 1,
                          padding: 8,
                          borderRadius: 10,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          border: `1px solid ${
                            matchForm.homeAway === opt.val ? ACCENT : "rgba(255,255,255,0.10)"
                          }`,
                          background:
                            matchForm.homeAway === opt.val
                              ? "rgba(255,122,0,0.15)"
                              : "rgba(255,255,255,0.04)",
                          color: matchForm.homeAway === opt.val ? ACCENT : "var(--text-muted)",
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
                        {(
                          [
                            { val: "V" as const, label: "Victoire", c: "#22c55e" },
                            { val: "N" as const, label: "Nul", c: "#f59e0b" },
                            { val: "D" as const, label: "Défaite", c: "#ef4444" },
                          ] as const
                        ).map((opt) => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => setMatchForm((p) => ({ ...p, result: opt.val }))}
                            style={{
                              flex: 1,
                              padding: 8,
                              borderRadius: 10,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                              border: `1px solid ${
                                matchForm.result === opt.val ? opt.c : "rgba(255,255,255,0.10)"
                              }`,
                              background:
                                matchForm.result === opt.val ? `${opt.c}20` : "rgba(255,255,255,0.04)",
                              color: matchForm.result === opt.val ? opt.c : "var(--text-muted)",
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
                  padding: 14,
                  background:
                    submitting || !matchForm.opponent || !matchForm.matchDate
                      ? "rgba(255,255,255,0.10)"
                      : `linear-gradient(135deg,${ACCENT},#e66000)`,
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
    </>
  );
}
