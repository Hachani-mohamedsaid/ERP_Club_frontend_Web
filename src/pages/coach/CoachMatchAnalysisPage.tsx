import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Target,
  Crosshair,
  Percent,
  Flag,
  Square,
  CircleDot,
  Star,
  Save,
  FileDown,
  Loader2,
  CheckCircle2,
  XCircle,
  MinusCircle,
} from "lucide-react";
import { jsPDF } from "jspdf";
import {
  CoachPageTransition,
  CCard,
  COACH_ACCENT,
} from "../../components/coach2/CoachPageTransition";
import { clubApi } from "../../lib/api/club";
import { apiFetch } from "../../lib/api/authHeaders";
import { useClubProfile } from "../../hooks/useClubProfile";

const ACCENT = COACH_ACCENT;

const C = {
  accent: { main: ACCENT, bg: "rgba(255,122,0,0.12)", border: "rgba(255,122,0,0.30)" },
  blue: { main: "#3b82f6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.25)" },
  green: { main: "#22c55e", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.25)" },
  red: { main: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.25)" },
  amber: { main: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)" },
  yellow: { main: "#eab308", bg: "rgba(234,179,8,0.12)", border: "rgba(234,179,8,0.25)" },
};

type MatchResult = "V" | "N" | "D";

interface ClubMatch {
  id: string;
  opponent: string;
  competition: string;
  matchDate: string;
  matchDateISO?: string;
  homeAway?: string;
  homeAwayLabel?: string;
  result?: MatchResult;
  score?: string;
  goalsFor?: number;
  goalsAgainst?: number;
}

interface ClubPlayer {
  id?: string;
  fullName?: string;
  name?: string;
  position?: string;
  status?: string;
}

interface InjuryRow {
  name?: string;
}

interface MatchStats {
  goals: string;
  shotsOnTarget: string;
  possession: string;
  corners: string;
  yellowCards: string;
  redCards: string;
}

interface PlayerRating {
  rating: number;
  comment: string;
}

interface AnalysisData {
  stats: MatchStats;
  players: Record<string, PlayerRating>;
  notes: string;
  overall: number;
}

const EMPTY_STATS: MatchStats = {
  goals: "",
  shotsOnTarget: "",
  possession: "",
  corners: "",
  yellowCards: "",
  redCards: "",
};

const LS = (matchId: string) => `odin_match_analysis_v2_${matchId}`;

function lsGet<T>(key: string, def: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : def;
  } catch {
    return def;
  }
}

function lsSet(key: string, val: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    /* ignore */
  }
}

function getMatchDate(m: { matchDateISO?: string; matchDate?: string }) {
  return new Date(m.matchDateISO ?? m.matchDate ?? "");
}

function playerKey(p: ClubPlayer, index: number) {
  return String(p.id ?? p.fullName ?? p.name ?? index);
}

function playerName(p: ClubPlayer) {
  return p.fullName ?? p.name ?? "Joueur";
}

function starsFromRating(rating: number) {
  const filled = Math.round(Math.min(10, Math.max(0, rating)) / 2);
  return filled;
}

function resultMeta(result?: MatchResult) {
  if (result === "V")
    return { label: "Victoire", color: C.green, Icon: CheckCircle2 };
  if (result === "N")
    return { label: "Nul", color: C.amber, Icon: MinusCircle };
  if (result === "D")
    return { label: "Défaite", color: C.red, Icon: XCircle };
  return { label: "À venir", color: C.blue, Icon: Target };
}

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.04)",
  color: "var(--text-primary)",
  fontSize: 13,
  outline: "none",
};

const STAT_FIELDS: {
  key: keyof MatchStats;
  label: string;
  icon: typeof Target;
  color: (typeof C)[keyof typeof C];
  suffix?: string;
}[] = [
  { key: "goals", label: "Buts marqués", icon: Target, color: C.accent },
  { key: "shotsOnTarget", label: "Tirs cadrés", icon: Crosshair, color: C.blue },
  { key: "possession", label: "Possession", icon: Percent, color: C.green, suffix: "%" },
  { key: "corners", label: "Corners", icon: Flag, color: C.amber },
  { key: "yellowCards", label: "Cartons jaunes", icon: Square, color: C.yellow },
  { key: "redCards", label: "Cartons rouges", icon: CircleDot, color: C.red },
];

export function CoachMatchAnalysisPage() {
  const { clubName } = useClubProfile();

  const [matches, setMatches] = useState<ClubMatch[]>([]);
  const [players, setPlayers] = useState<ClubPlayer[]>([]);
  const [injuries, setInjuries] = useState<InjuryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchIndex, setMatchIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const [stats, setStats] = useState<MatchStats>(EMPTY_STATS);
  const [playerRatings, setPlayerRatings] = useState<Record<string, PlayerRating>>({});
  const [notes, setNotes] = useState("");
  const [overall, setOverall] = useState(7);

  useEffect(() => {
    (async () => {
      let matchData: {
        past?: ClubMatch[];
        upcoming?: ClubMatch[];
      } | null = null;
      let playersData: ClubPlayer[] = [];
      let injuriesData: InjuryRow[] = [];

      try {
        const r = await apiFetch("/club/matches");
        if (r.ok) matchData = await r.json();
      } catch (e) {
        console.warn(e);
      }

      try {
        playersData = (await clubApi.getPlayers()) as ClubPlayer[];
      } catch (e) {
        console.warn(e);
      }

      try {
        const r = (await clubApi.getInjuries()) as { injured?: InjuryRow[] };
        injuriesData = r?.injured ?? [];
      } catch (e) {
        console.warn(e);
      }

      const past = [...(matchData?.past ?? [])].sort(
        (a, b) => getMatchDate(b).getTime() - getMatchDate(a).getTime(),
      );
      const upcoming = [...(matchData?.upcoming ?? [])].sort(
        (a, b) => getMatchDate(a).getTime() - getMatchDate(b).getTime(),
      );
      // Prefer past matches for analysis; keep upcoming at the end if needed
      const all = past.length > 0 ? past : [...past, ...upcoming];

      setMatches(all);
      setPlayers(playersData);
      setInjuries(injuriesData);
      setMatchIndex(0);
      setLoading(false);
    })();
  }, []);

  const selectedMatch = matches[matchIndex] ?? null;

  useEffect(() => {
    if (!selectedMatch) return;
    const stored = lsGet<AnalysisData | null>(LS(selectedMatch.id), null);

    const goalsDefault =
      selectedMatch.goalsFor != null ? String(selectedMatch.goalsFor) : "";

    if (stored) {
      setStats({
        ...EMPTY_STATS,
        ...stored.stats,
        goals: stored.stats?.goals || goalsDefault,
      });
      setPlayerRatings(stored.players ?? {});
      setNotes(stored.notes ?? "");
      setOverall(stored.overall > 0 ? stored.overall : 7);
    } else {
      // Light migration from older local keys
      const oldStats = lsGet<Record<string, string>>(
        `odin_match_${selectedMatch.id}_stats`,
        {},
      );
      const oldNotes = lsGet<string>(`odin_match_${selectedMatch.id}_coachNotes`, "");
      setStats({
        goals: goalsDefault,
        shotsOnTarget: oldStats.shotsOnTarget ?? "",
        possession: oldStats.possession ?? "",
        corners: oldStats.corners ?? "",
        yellowCards: oldStats.yellowCards ?? "",
        redCards: oldStats.redCards ?? "",
      });
      setPlayerRatings({});
      setNotes(typeof oldNotes === "string" ? oldNotes : "");
      setOverall(7);
    }
  }, [selectedMatch?.id]);

  const squad = useMemo(() => {
    return players.filter((p) => {
      const name = (p.fullName ?? p.name ?? "").toLowerCase().trim();
      const status = (p.status ?? "").toUpperCase().trim();
      const injured = injuries.some(
        (inj) => (inj.name ?? "").toLowerCase().trim() === name,
      );
      if (injured) return false;
      if (status && status !== "DISPONIBLE" && status !== "AVAILABLE") return false;
      return Boolean(name);
    });
  }, [players, injuries]);

  const scoreLine = (() => {
    if (!selectedMatch) return "—";
    if (selectedMatch.score) return selectedMatch.score;
    if (
      selectedMatch.goalsFor != null &&
      selectedMatch.goalsAgainst != null
    ) {
      return `${selectedMatch.goalsFor} - ${selectedMatch.goalsAgainst}`;
    }
    return "—";
  })();

  const result = resultMeta(selectedMatch?.result);

  const setPlayerField = (
    key: string,
    patch: Partial<PlayerRating>,
  ) => {
    setPlayerRatings((prev) => ({
      ...prev,
      [key]: {
        rating: prev[key]?.rating ?? 0,
        comment: prev[key]?.comment ?? "",
        ...patch,
      },
    }));
  };

  const buildPayload = (): AnalysisData => ({
    stats,
    players: playerRatings,
    notes,
    overall,
  });

  const handleSave = () => {
    if (!selectedMatch) return;
    setSaving(true);
    lsSet(LS(selectedMatch.id), buildPayload());
    setTimeout(() => {
      setSaving(false);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1800);
    }, 350);
  };

  const handleExport = () => {
    if (!selectedMatch) return;
    const doc = new jsPDF();
    const our = clubName || "Mon Club";
    let y = 18;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Analyse de match", 14, y);
    y += 10;

    doc.setFontSize(12);
    doc.text(`${our}  vs  ${selectedMatch.opponent}`, 14, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(90);
    doc.text(
      `${selectedMatch.competition} · ${selectedMatch.matchDate} · Score ${scoreLine} · ${result.label}`,
      14,
      y,
    );
    y += 12;
    doc.setTextColor(20);

    doc.setFont("helvetica", "bold");
    doc.text("Statistiques", 14, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    STAT_FIELDS.forEach((f) => {
      const val = stats[f.key] || "—";
      doc.text(`${f.label}: ${val}${f.suffix && val !== "—" ? f.suffix : ""}`, 18, y);
      y += 6;
    });

    y += 4;
    doc.setFont("helvetica", "bold");
    doc.text(`Note d'équipe: ${overall.toFixed(1)} / 10`, 14, y);
    y += 10;

    doc.text("Notes joueurs", 14, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    squad.forEach((p, i) => {
      if (y > 270) {
        doc.addPage();
        y = 18;
      }
      const key = playerKey(p, i);
      const r = playerRatings[key];
      const rating = r?.rating ? `${r.rating}/10` : "—";
      const comment = r?.comment?.trim() || "";
      doc.text(`${playerName(p)} — ${rating}${comment ? ` · ${comment}` : ""}`, 18, y);
      y += 6;
    });

    y += 4;
    if (y > 250) {
      doc.addPage();
      y = 18;
    }
    doc.setFont("helvetica", "bold");
    doc.text("Notes du coach", 14, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    const noteLines = doc.splitTextToSize(notes.trim() || "—", 180) as string[];
    noteLines.forEach((line) => {
      if (y > 280) {
        doc.addPage();
        y = 18;
      }
      doc.text(line, 18, y);
      y += 6;
    });

    const safeOpp = selectedMatch.opponent.replace(/[^\w\-]+/g, "_");
    doc.save(`Analyse_${safeOpp}_${selectedMatch.id}.pdf`);
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

  if (!selectedMatch) {
    return (
      <CoachPageTransition>
        <CCard>
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: 24 }}>
            Aucun match à analyser. Ajoutez un résultat depuis Matchs.
          </p>
        </CCard>
      </CoachPageTransition>
    );
  }

  const ResultIcon = result.Icon;
  const overallStars = starsFromRating(overall);

  return (
    <CoachPageTransition>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* ── Match Header ── */}
        <CCard glow className="!p-0 overflow-hidden">
          <div
            style={{
              padding: "22px 20px 20px",
              background:
                "radial-gradient(ellipse at top, rgba(255,122,0,0.14), transparent 60%)",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                marginBottom: 14,
              }}
            >
              <button
                type="button"
                aria-label="Match précédent"
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
                  color: "var(--text-muted)",
                }}
              >
                <ChevronLeft size={16} />
              </button>

              <div style={{ flex: 1, textAlign: "center" }}>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: ACCENT,
                    marginBottom: 8,
                  }}
                >
                  Analyse de match
                </p>
                <p
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: "var(--text-primary)",
                    lineHeight: 1.2,
                  }}
                >
                  {clubName || "Mon Club"}{" "}
                  <span style={{ color: ACCENT, margin: "0 8px", fontSize: 14 }}>
                    vs
                  </span>{" "}
                  {selectedMatch.opponent}
                </p>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                  {selectedMatch.competition}
                  {" · "}
                  {selectedMatch.matchDate}
                  {selectedMatch.homeAwayLabel
                    ? ` · ${selectedMatch.homeAwayLabel}`
                    : ""}
                </p>
              </div>

              <button
                type="button"
                aria-label="Match suivant"
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
                  color: "var(--text-muted)",
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontWeight: 700,
                }}
              >
                Score final
              </p>
              <p
                style={{
                  fontSize: 40,
                  fontWeight: 900,
                  color: "var(--text-primary)",
                  lineHeight: 1,
                  letterSpacing: 2,
                }}
              >
                {scoreLine}
              </p>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 12px",
                  borderRadius: 99,
                  background: result.color.bg,
                  border: `1px solid ${result.color.border}`,
                  color: result.color.main,
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                <ResultIcon size={14} />
                {result.label}
              </span>
            </div>
          </div>
        </CCard>

        {/* ── Stats + Overall ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.4fr) minmax(240px, 0.8fr)",
            gap: 16,
          }}
          className="match-analysis-split"
        >
          <CCard>
            <p
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: "var(--text-primary)",
                marginBottom: 14,
              }}
            >
              Statistiques du match
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 10,
              }}
            >
              {STAT_FIELDS.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.key}
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      background: f.color.bg,
                      border: `1px solid ${f.color.border}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 8,
                      }}
                    >
                      <Icon size={13} style={{ color: f.color.main }} />
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "var(--text-muted)",
                        }}
                      >
                        {f.label}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <input
                        type="number"
                        min={0}
                        max={f.key === "possession" ? 100 : undefined}
                        value={stats[f.key]}
                        onChange={(e) =>
                          setStats((s) => ({ ...s, [f.key]: e.target.value }))
                        }
                        placeholder="—"
                        style={{
                          ...inputStyle,
                          padding: "8px 10px",
                          fontSize: 18,
                          fontWeight: 800,
                          color: f.color.main,
                          background: "rgba(0,0,0,0.2)",
                        }}
                      />
                      {f.suffix && (
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "var(--text-muted)",
                          }}
                        >
                          {f.suffix}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CCard>

          <CCard glow>
            <p
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: "var(--text-primary)",
                marginBottom: 6,
              }}
            >
              Note d&apos;équipe
            </p>
            <p
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                marginBottom: 16,
              }}
            >
              Performance globale
            </p>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 6,
                  marginBottom: 12,
                }}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setOverall(n * 2)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 2,
                    }}
                    aria-label={`${n} étoiles`}
                  >
                    <Star
                      size={26}
                      fill={n <= overallStars ? ACCENT : "transparent"}
                      style={{
                        color: n <= overallStars ? ACCENT : "rgba(255,255,255,0.2)",
                      }}
                    />
                  </button>
                ))}
              </div>
              <p
                style={{
                  fontSize: 36,
                  fontWeight: 900,
                  color: ACCENT,
                  lineHeight: 1,
                }}
              >
                {overall.toFixed(1)}
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    marginLeft: 4,
                  }}
                >
                  / 10
                </span>
              </p>
              <input
                type="range"
                min={1}
                max={10}
                step={0.1}
                value={overall}
                onChange={(e) => setOverall(Number(e.target.value))}
                style={{ width: "100%", marginTop: 16, accentColor: ACCENT }}
              />
            </div>
          </CCard>
        </div>

        {/* ── Player Ratings (main) ── */}
        <CCard>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 14,
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: "var(--text-primary)",
                }}
              >
                Notes joueurs
              </p>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                Note /10 + commentaire optionnel
              </p>
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: ACCENT,
                background: C.accent.bg,
                border: `1px solid ${C.accent.border}`,
                padding: "4px 10px",
                borderRadius: 99,
              }}
            >
              {squad.length} joueurs
            </span>
          </div>

          {squad.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: 16 }}>
              Aucun joueur disponible dans l&apos;effectif.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(120px, 1.2fr) 160px minmax(0, 1.6fr)",
                  gap: 10,
                  padding: "0 4px 6px",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
                className="match-analysis-player-head"
              >
                <span>Joueur</span>
                <span>Note</span>
                <span>Commentaire</span>
              </div>
              {squad.map((p, i) => {
                const key = playerKey(p, i);
                const row = playerRatings[key] ?? { rating: 0, comment: "" };
                const filled = starsFromRating(row.rating);
                return (
                  <div
                    key={key}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(120px, 1.2fr) 160px minmax(0, 1.6fr)",
                      gap: 10,
                      alignItems: "center",
                      padding: "10px 12px",
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                    className="match-analysis-player-row"
                  >
                    <div>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "var(--text-primary)",
                        }}
                      >
                        {playerName(p)}
                      </p>
                      {p.position && (
                        <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
                          {p.position}
                        </p>
                      )}
                    </div>

                    <div>
                      <div style={{ display: "flex", gap: 2, marginBottom: 6 }}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setPlayerField(key, { rating: n * 2 })}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: 0,
                            }}
                          >
                            <Star
                              size={14}
                              fill={n <= filled ? ACCENT : "transparent"}
                              style={{
                                color:
                                  n <= filled ? ACCENT : "rgba(255,255,255,0.18)",
                              }}
                            />
                          </button>
                        ))}
                      </div>
                      <select
                        value={row.rating || ""}
                        onChange={(e) =>
                          setPlayerField(key, {
                            rating: Number(e.target.value) || 0,
                          })
                        }
                        style={{
                          ...inputStyle,
                          padding: "6px 8px",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        <option value="">—</option>
                        {Array.from({ length: 10 }, (_, n) => n + 1).map((n) => (
                          <option key={n} value={n}>
                            {n}/10
                          </option>
                        ))}
                      </select>
                    </div>

                    <input
                      type="text"
                      value={row.comment}
                      onChange={(e) =>
                        setPlayerField(key, { comment: e.target.value })
                      }
                      placeholder="Commentaire court…"
                      style={inputStyle}
                      maxLength={120}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </CCard>

        {/* ── Coach Notes ── */}
        <CCard>
          <p
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: "var(--text-primary)",
              marginBottom: 10,
            }}
          >
            Notes du coach
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              "L’équipe a bien défendu.\nAméliorer la finition.\nBon état d’esprit."
            }
            rows={5}
            style={{
              ...inputStyle,
              resize: "vertical",
              minHeight: 120,
              lineHeight: 1.5,
            }}
          />
        </CCard>

        {/* ── Actions ── */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            justifyContent: "flex-end",
          }}
        >
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExport}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 18px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
              color: "var(--text-primary)",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <FileDown size={16} />
            Exporter le rapport
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saving}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 20px",
              borderRadius: 12,
              border: "none",
              background: `linear-gradient(135deg,${ACCENT},#e66000)`,
              color: "white",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(255,122,0,0.25)",
            }}
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : savedFlash ? (
              <CheckCircle2 size={16} />
            ) : (
              <Save size={16} />
            )}
            {savedFlash ? "Enregistré" : "Sauvegarder l’analyse"}
          </motion.button>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .match-analysis-split {
            grid-template-columns: 1fr !important;
          }
          .match-analysis-player-head,
          .match-analysis-player-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </CoachPageTransition>
  );
}
