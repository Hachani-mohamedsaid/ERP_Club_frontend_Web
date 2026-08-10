import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw, Save, Star, Users, Shield,
  AlertTriangle, CheckCircle2, Brain,
  Trophy, Calendar,
  Zap, Activity, Target, Flag,
  Loader2,
} from "lucide-react";
import {
  CoachPageTransition, CCard, COACH_ACCENT,
} from "../../components/coach2/CoachPageTransition";
import { FORMATIONS } from "../../data/coachData";
import { clubApi } from "../../lib/api/club";
import { apiFetch } from "../../lib/api/authHeaders";

const C = {
  green:  { main: "#22c55e", bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.25)"  },
  red:    { main: "#ef4444", bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.25)"  },
  amber:  { main: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)" },
  blue:   { main: "#3b82f6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.25)" },
  violet: { main: "#8b5cf6", bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.25)" },
  orange: { main: "#ff7a00", bg: "rgba(255,122,0,0.12)",  border: "rgba(255,122,0,0.25)"  },
  teal:   { main: "#0d9488", bg: "rgba(13,148,136,0.12)", border: "rgba(13,148,136,0.25)" },
};

const formeColor = (v: number) =>
  v >= 85 ? C.green.main
  : v >= 70 ? C.orange.main
  : C.red.main;

interface CoachPlayer {
  id: string;
  name: string;
  number: number;
  position: string;
  positionFull: string;
  status: "Disponible" | "Blessé" | "Surveillance" | "Suspendu" | "En sélection";
  forme: number;
  fatigue: number;
  odinScore: number;
}

interface SavedLineup {
  matchId: string;
  formation: string;
  starters: (string | null)[];
  subs: string[];
  reserves: string[];
  captain: string | null;
  viceCaptain: string | null;
  penaltyTaker: string | null;
  freeKickTaker: string | null;
  cornerLeftTaker: string | null;
  cornerRightTaker: string | null;
  savedAt: string;
}

const POSITION_GROUPS: Record<string, string[]> = {
  "GK":  ["GK", "GB"],
  "DC":  ["DC", "DEF", "CB"],
  "LB":  ["LB", "DC", "DEF"],
  "RB":  ["RB", "DC", "DEF"],
  "MC":  ["MC", "MD", "MOC", "MDF", "MO"],
  "MDF": ["MDF", "MD", "MC"],
  "MOC": ["MOC", "MO", "MC", "AG", "AD"],
  "AG":  ["AG", "ATT", "BU", "ST", "MOC"],
  "AD":  ["AD", "ATT", "BU", "ST", "MOC"],
  "BU":  ["BU", "ST", "ATT", "AG", "AD"],
  "ST":  ["ST", "BU", "ATT"],
};

const POSITION_LABELS: Record<string, string> = {
  "GK": "Gardien", "DC": "Défenseur central",
  "LB": "Latéral gauche", "RB": "Latéral droit",
  "MC": "Milieu central", "MD": "Milieu défensif",
  "MOC": "Milieu offensif", "MO": "Milieu offensif",
  "AG": "Ailier gauche", "AD": "Ailier droit",
  "BU": "Buteur", "ST": "Attaquant",
  "ATT": "Attaquant", "DEF": "Défenseur",
  "MDF": "Milieu défensif",
};

const FORMATION_KEYS = Object.keys(FORMATIONS) as (keyof typeof FORMATIONS)[];

// Pitch dimensions in SVG units
const W = 400;
const H = 600;

export function CoachLineupPage() {
  const [squad, setSquad] = useState<CoachPlayer[]>([]);
  const [nextMatch, setNextMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [formation, setFormation] =
    useState<keyof typeof FORMATIONS>("4-3-3");
  const [starters, setStarters] =
    useState<(CoachPlayer | null)[]>(Array(11).fill(null));
  const [subs, setSubs] = useState<CoachPlayer[]>([]);
  const [reserves, setReserves] =
    useState<CoachPlayer[]>([]);

  const [captain, setCaptain] =
    useState<string | null>(null);
  const [viceCaptain, setViceCaptain] =
    useState<string | null>(null);
  const [penaltyTaker, setPenaltyTaker] =
    useState<string | null>(null);
  const [freeKickTaker, setFreeKickTaker] =
    useState<string | null>(null);
  const [cornerLeftTaker, setCornerLeftTaker] =
    useState<string | null>(null);
  const [cornerRightTaker, setCornerRightTaker] =
    useState<string | null>(null);

  const [selectingSlot, setSelectingSlot] =
    useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [lineupLoaded, setLineupLoaded] =
    useState(false);

  useEffect(() => {
    const load = async () => {
      let playersData: any[] = [];
      let injuriesData: any[] = [];
      let chargeData: any[] = [];

      try {
        playersData =
          await clubApi.getPlayers() as any[];
      } catch (e) { console.warn(e); }

      try {
        const r = await clubApi.getInjuries() as any;
        injuriesData = r?.injured ?? [];
      } catch (e) { console.warn(e); }

      try {
        const r = await apiFetch(
          "/club/preparateur/charge"
        );
        if (r.ok) {
          const j = await r.json();
          if (Array.isArray(j)) {
            chargeData = j;
          } else if (Array.isArray(j?.rows)) {
            chargeData = j.rows;
          } else if (Array.isArray(j?.data)) {
            chargeData = j.data;
          } else if (Array.isArray(j?.players)) {
            chargeData = j.players;
          } else {
            chargeData = [];
          }
        }
      } catch (e) { console.warn(e); }

      try {
        const r = await apiFetch("/club/matches");
        if (r.ok) {
          const j = await r.json();
          setNextMatch(j?.nextMatch ?? null);
        }
      } catch (e) { console.warn(e); }

      const mapped: CoachPlayer[] = playersData.map(
        (p: any, i: number) => {
          const isInjured = injuriesData.some(
            (inj: any) =>
              (inj.name ?? "").toLowerCase().trim() ===
              (p.fullName ?? p.name ?? "")
                .toLowerCase().trim()
          );
          const charge = Array.isArray(chargeData)
            ? chargeData.find((c: any) => c.id === p.id)
            : null;
          const statusMap: Record<string, CoachPlayer["status"]> = {
            "DISPONIBLE": "Disponible",
            "BLESSE": "Blessé",
            "LIMITE": "Surveillance",
            "FIN_CONTRAT": "Suspendu",
          };
          return {
            id: p.id,
            name: p.fullName ?? p.name ??
                  p.firstName ?? `Joueur ${i + 1}`,
            number: p.number ?? p.jerseyNumber ??
                    p.shirtNumber ?? (i + 1),
            position: p.position ?? "MC",
            positionFull: POSITION_LABELS[
              p.position ?? ""
            ] ?? p.position ?? "—",
            status: isInjured ? "Blessé"
              : statusMap[
                  (p.status ?? "").toUpperCase()
                ] ?? "Disponible",
            forme: charge?.loadScore ?? 75,
            fatigue: charge?.fatigueScore ?? 30,
            odinScore: 72,
          };
        }
      );

      setSquad(mapped);
      setLoading(false);
    };
    load();
  }, []);

  const LS_KEY = nextMatch
    ? `odin_lineup_match_${nextMatch.id}`
    : `odin_lineup_${formation}`;

  useEffect(() => {
    if (squad.length === 0) return;
    if (lineupLoaded) return;
    try {
      const savedRaw = localStorage.getItem(LS_KEY);
      if (savedRaw) {
        const data: SavedLineup = JSON.parse(savedRaw);
        if (data.formation) {
          setFormation(
            data.formation as keyof typeof FORMATIONS
          );
        }
        setStarters(
          (data.starters ?? []).map(
            (id: string | null) =>
              id ? squad.find(p => p.id === id)
                 ?? null : null
          ).concat(Array(11).fill(null)).slice(0, 11)
        );
        setSubs(
          (data.subs ?? [])
            .map((id: string) =>
              squad.find(p => p.id === id)
            ).filter(Boolean) as CoachPlayer[]
        );
        setReserves(
          (data.reserves ?? [])
            .map((id: string) =>
              squad.find(p => p.id === id)
            ).filter(Boolean) as CoachPlayer[]
        );
        setCaptain(data.captain ?? null);
        setViceCaptain(data.viceCaptain ?? null);
        setPenaltyTaker(data.penaltyTaker ?? null);
        setFreeKickTaker(data.freeKickTaker ?? null);
        setCornerLeftTaker(
          data.cornerLeftTaker ?? null
        );
        setCornerRightTaker(
          data.cornerRightTaker ?? null
        );
      }
    } catch {}
    setLineupLoaded(true);
  }, [squad, LS_KEY]);

  const saveLineup = () => {
    const data: SavedLineup = {
      matchId: nextMatch?.id ?? "no-match",
      formation,
      starters: starters.map(p => p?.id ?? null),
      subs: subs.map(p => p.id),
      reserves: reserves.map(p => p.id),
      captain,
      viceCaptain,
      penaltyTaker,
      freeKickTaker,
      cornerLeftTaker,
      cornerRightTaker,
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(data));
    } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const formationDef = FORMATIONS[formation];

  const available = squad.filter(
    p => p.status === "Disponible" ||
         p.status === "Surveillance"
  );

  const usedIds = [
    ...starters.filter(Boolean).map(p => p!.id),
    ...subs.map(p => p.id),
    ...reserves.map(p => p.id),
  ];

  const bench = available.filter(
    p => !usedIds.includes(p.id)
  );

  const starterCount = starters.filter(Boolean).length;

  const avgForme = starters.filter(Boolean).length > 0
    ? Math.round(
        starters.filter(Boolean)
          .reduce((a, p) => a + (p?.forme ?? 0), 0) /
        starters.filter(Boolean).length
      )
    : 0;

  const avgFatigue = starters.filter(Boolean).length > 0
    ? Math.round(
        starters.filter(Boolean)
          .reduce((a, p) => a + (p?.fatigue ?? 0), 0) /
        starters.filter(Boolean).length
      )
    : 0;

  const defenders = starters.filter(p =>
    p && ["DC", "LB", "RB", "DEF"].includes(
      p.position.toUpperCase()
    )
  ).length;
  const midfielders = starters.filter(p =>
    p && ["MC", "MD", "MOC", "MDF", "MO", "AG", "AD"]
      .includes(p.position.toUpperCase())
  ).length;
  const forwards = starters.filter(p =>
    p && ["BU", "ST", "ATT"].includes(
      p.position.toUpperCase()
    )
  ).length;

  const chemistry = Math.min(100, Math.round(
    (starterCount / 11) * 50 +
    (captain ? 10 : 0) +
    (avgForme > 70 ? 20 : 10) +
    (avgFatigue < 50 ? 20 : 10)
  ));

  const readiness = Math.min(100, Math.round(
    (starterCount / 11) * 40 +
    (subs.length >= 3 ? 20 : subs.length * 7) +
    (captain ? 10 : 0) +
    (avgForme > 70 ? 20 : 10) +
    (avgFatigue < 60 ? 10 : 0)
  ));

  const warnings: {
    type: "error" | "warning" | "info";
    msg: string;
  }[] = [];

  if (!starters.some(p =>
    p?.position?.toUpperCase() === "GK" ||
    p?.position?.toUpperCase() === "GB"
  )) warnings.push({
    type: "error",
    msg: "Aucun gardien de but sélectionné",
  });

  if (starterCount < 11) warnings.push({
    type: "error",
    msg: `${11 - starterCount} poste(s) non attribué(s)`,
  });

  if (!captain) warnings.push({
    type: "warning",
    msg: "Aucun capitaine désigné",
  });

  if (!viceCaptain) warnings.push({
    type: "info",
    msg: "Aucun vice-capitaine désigné",
  });

  if (avgFatigue > 70) warnings.push({
    type: "warning",
    msg: `Fatigue moyenne élevée (${avgFatigue}%)`,
  });

  starters.forEach((p, i) => {
    if (!p) return;
    const slotPos =
      formationDef.positions[i]?.pos ?? "";
    const matching =
      POSITION_GROUPS[slotPos] ?? [slotPos];
    const isOutOfPosition = !matching.some(mp =>
      p.position.toUpperCase() === mp.toUpperCase()
    );
    if (isOutOfPosition) warnings.push({
      type: "info",
      msg: `${p.name} joue hors de son poste (${slotPos})`,
    });
  });

  const aiSuggestions: {
    icon: typeof Zap;
    color: string;
    msg: string;
  }[] = [];

  if (avgFatigue > 65) aiSuggestions.push({
    icon: Zap,
    color: C.amber.main,
    msg: `Fatigue élevée (${avgFatigue}%) — Envisager une rotation pour préserver les joueurs clés`,
  });

  if (defenders < 3) aiSuggestions.push({
    icon: Shield,
    color: C.red.main,
    msg: "Défense insuffisante — Renforcer le bloc défensif",
  });

  if (forwards === 0) aiSuggestions.push({
    icon: Target,
    color: C.orange.main,
    msg: "Aucun attaquant en titulaire — Ajouter un point fixe offensif",
  });

  if (avgForme >= 80) aiSuggestions.push({
    icon: Activity,
    color: C.green.main,
    msg: `Excellente forme collective (${avgForme}/100) — Formation idéale pour attaquer`,
  });

  if (chemistry >= 80) aiSuggestions.push({
    icon: Brain,
    color: C.violet.main,
    msg: `Cohésion équipe optimale (${chemistry}%) — Bonne synergie défensive prévue`,
  });

  if (aiSuggestions.length === 0) aiSuggestions.push({
    icon: Brain,
    color: C.blue.main,
    msg: "Complétez le onze titulaire pour recevoir des recommandations tactiques personnalisées",
  });

  const getPlayersForPosition = (posLabel: string) => {
    const matching =
      POSITION_GROUPS[posLabel] ?? [posLabel];
    const primary = bench.filter(p =>
      matching.some(mp =>
        p.position.toUpperCase() === mp.toUpperCase()
      )
    );
    const secondary = bench.filter(p =>
      !matching.some(mp =>
        p.position.toUpperCase() === mp.toUpperCase()
      )
    );
    return { primary, secondary };
  };

  const handleFormationChange = (
    f: keyof typeof FORMATIONS
  ) => {
    setFormation(f);
    setStarters(Array(11).fill(null));
    setSubs([]);
    setReserves([]);
    setCaptain(null);
    setViceCaptain(null);
    setPenaltyTaker(null);
    setFreeKickTaker(null);
    setCornerLeftTaker(null);
    setCornerRightTaker(null);
    setLineupLoaded(false);
  };

  const removeStarter = (idx: number) => {
    setStarters(prev => {
      const n = [...prev];
      n[idx] = null;
      return n;
    });
  };

  const removeSub = (id: string) =>
    setSubs(s => s.filter(p => p.id !== id));

  const removeReserve = (id: string) =>
    setReserves(r => r.filter(p => p.id !== id));

  const addToSub = (player: CoachPlayer) => {
    if (subs.length >= 7) return;
    setSubs(s => [
      ...s.filter(p => p.id !== player.id), player,
    ]);
    setStarters(prev =>
      prev.map(p => p?.id === player.id ? null : p)
    );
    setReserves(r => r.filter(p => p.id !== player.id));
  };

  const addToReserve = (player: CoachPlayer) => {
    setReserves(r => [
      ...r.filter(p => p.id !== player.id), player,
    ]);
    setStarters(prev =>
      prev.map(p => p?.id === player.id ? null : p)
    );
    setSubs(s => s.filter(p => p.id !== player.id));
  };

  const resetAll = () => {
    setStarters(Array(11).fill(null));
    setSubs([]);
    setReserves([]);
    setCaptain(null);
    setViceCaptain(null);
    setPenaltyTaker(null);
    setFreeKickTaker(null);
    setCornerLeftTaker(null);
    setCornerRightTaker(null);
  };

  return (
    <>
      <style>{`
        .odin-select option {
          background: #1a1a2e !important;
          color: #ffffff !important;
        }
        @media (max-width: 1100px) {
          .lineup-main-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <CoachPageTransition>
        {loading && (
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "center",
            flexDirection: "column", gap: 12,
            padding: "80px 0",
          }}>
            <Loader2 size={32} style={{
              color: "var(--text-muted)",
              animation: "spin 1s linear infinite",
            }} />
            <p style={{
              fontSize: 13, color: "var(--text-muted)",
            }}>
              Chargement de l'effectif...
            </p>
          </div>
        )}

        {!loading && (
          <div style={{
            display: "flex", flexDirection: "column", gap: 16,
          }}>
            {/* HEADER */}
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap", gap: 12,
            }}>
              <div>
                <h1 style={{
                  fontSize: 20, fontWeight: 800,
                  color: "var(--text-primary)",
                }}>
                  Composition d'équipe
                </h1>
                <p style={{
                  fontSize: 12, color: "var(--text-muted)",
                  marginTop: 3,
                }}>
                  {starterCount}/11 titulaires ·{" "}
                  {subs.length} remplaçants ·{" "}
                  {reserves.length} réservistes
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <motion.button
                  type="button"
                  onClick={resetAll}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    display: "flex", alignItems: "center",
                    gap: 6, padding: "8px 14px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    color: "var(--text-muted)",
                    fontSize: 12, fontWeight: 600,
                    cursor: "pointer",
                  }}>
                  <RotateCcw size={13} /> Réinitialiser
                </motion.button>
                <motion.button
                  type="button"
                  onClick={saveLineup}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    display: "flex", alignItems: "center",
                    gap: 6, padding: "8px 18px",
                    borderRadius: 10,
                    background: saved
                      ? C.green.main
                      : `linear-gradient(135deg,#ff7a00,#e66000)`,
                    boxShadow: saved
                      ? `0 0 20px ${C.green.main}40`
                      : `0 0 20px rgba(255,122,0,0.35)`,
                    color: "white", fontSize: 12,
                    fontWeight: 700, cursor: "pointer",
                    border: "none",
                    transition: "all 0.3s",
                  }}>
                  <Save size={13} />
                  {saved ? "Composition sauvegardée ✓"
                         : "Sauvegarder"}
                </motion.button>
              </div>
            </div>

            {/* MATCH BANNER */}
            {nextMatch && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: "14px 20px",
                  borderRadius: 14,
                  background: `linear-gradient(135deg,
                    rgba(59,130,246,0.12),
                    rgba(139,92,246,0.08))`,
                  border: "1px solid rgba(99,102,241,0.30)",
                  borderLeft: "4px solid #3b82f6",
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap", gap: 12,
                }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 16,
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: "rgba(59,130,246,0.15)",
                    border: "1px solid rgba(59,130,246,0.25)",
                    display: "flex", alignItems: "center",
                    justifyContent: "center", flexShrink: 0,
                  }}>
                    <Trophy size={20}
                      style={{ color: "#3b82f6" }} />
                  </div>
                  <div>
                    <p style={{
                      fontSize: 10, fontWeight: 700,
                      color: "rgba(99,102,241,0.9)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em", marginBottom: 4,
                    }}>
                      Composition pour
                    </p>
                    <p style={{
                      fontSize: 16, fontWeight: 800,
                      color: "var(--text-primary)",
                    }}>
                      vs {nextMatch.opponent}
                    </p>
                  </div>
                </div>
                <div style={{
                  display: "flex", gap: 12, flexWrap: "wrap",
                }}>
                  <span style={{
                    fontSize: 12, color: "rgba(255,255,255,0.55)",
                    display: "flex", alignItems: "center", gap: 5,
                  }}>
                    <Trophy size={11} style={{ color: "#3b82f6" }} />
                    {nextMatch.competition}
                  </span>
                  <span style={{
                    fontSize: 12, color: "rgba(255,255,255,0.55)",
                    display: "flex", alignItems: "center", gap: 5,
                  }}>
                    <Calendar size={11}
                      style={{ color: "#8b5cf6" }} />
                    {nextMatch.matchDate}
                  </span>
                  <span style={{
                    fontSize: 12, fontWeight: 700,
                    color: nextMatch.homeAway === "D"
                      ? C.orange.main : C.violet.main,
                    background: nextMatch.homeAway === "D"
                      ? C.orange.bg : C.violet.bg,
                    border: `1px solid ${nextMatch.homeAway === "D"
                      ? C.orange.border : C.violet.border}`,
                    padding: "3px 10px", borderRadius: 99,
                  }}>
                    {nextMatch.homeAwayLabel}
                  </span>
                  {nextMatch.daysToNext !== null && nextMatch.daysToNext !== undefined && (
                    <span style={{
                      fontSize: 14, fontWeight: 900,
                      color: "#3b82f6",
                      background: "rgba(59,130,246,0.12)",
                      border: "1px solid rgba(59,130,246,0.25)",
                      padding: "3px 12px", borderRadius: 99,
                    }}>
                      J-{nextMatch.daysToNext}
                    </span>
                  )}
                </div>
              </motion.div>
            )}

            {/* FORMATION SELECTOR */}
            <div style={{
              display: "flex", flexWrap: "wrap",
              gap: 8, alignItems: "center",
            }}>
              <span style={{
                fontSize: 12, fontWeight: 600,
                color: "var(--text-muted)",
              }}>
                Formation:
              </span>
              {FORMATION_KEYS.map(f => (
                <motion.button
                  key={f} type="button"
                  onClick={() => handleFormationChange(f)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    borderRadius: 10, padding: "6px 14px",
                    fontSize: 12, fontWeight: 700,
                    background: formation === f
                      ? `linear-gradient(135deg,#ff7a00,#e66000)`
                      : "rgba(255,255,255,0.06)",
                    color: formation === f
                      ? "white" : "var(--text-muted)",
                    boxShadow: formation === f
                      ? "0 0 14px rgba(255,122,0,0.40)"
                      : "none",
                    border: "none", cursor: "pointer",
                  }}>
                  {FORMATIONS[f].label}
                </motion.button>
              ))}
            </div>

            {/* MAIN GRID */}
            <div
              className="lineup-main-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 320px",
                gap: 16,
                alignItems: "start",
              }}>
              {/* LEFT — Terrain */}
              <CCard className="!p-4">
                <div className="flex justify-center">
                  <svg
                    className="tactical-svg"
                    viewBox={`0 0 ${W} ${H}`}
                    style={{ width: "100%", maxWidth: 420, borderRadius: 16, display: "block" }}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Background grass gradient */}
                    <defs>
                      <linearGradient id="grassGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1a5c30" />
                        <stop offset="50%" stopColor="#1e6b38" />
                        <stop offset="100%" stopColor="#1a5c30" />
                      </linearGradient>
                      {/* Stripe pattern */}
                      <pattern id="stripes" x="0" y="0" width={W} height="50" patternUnits="userSpaceOnUse">
                        <rect x="0" y="0" width={W} height="25" fill="rgba(255,255,255,0.025)" />
                        <rect x="0" y="25" width={W} height="25" fill="rgba(0,0,0,0.0)" />
                      </pattern>
                      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={COACH_ACCENT} floodOpacity="0.8" />
                      </filter>
                      <filter id="shadowGK" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#F59E0B" floodOpacity="0.8" />
                      </filter>
                    </defs>

                    {/* Pitch background */}
                    <rect x="0" y="0" width={W} height={H} fill="url(#grassGrad)" rx="16" />
                    <rect x="0" y="0" width={W} height={H} fill="url(#stripes)" rx="16" />

                    {/* Outer border */}
                    <rect x="20" y="20" width={W - 40} height={H - 40} fill="none"
                      stroke="rgba(255,255,255,0.55)" strokeWidth="2.5" rx="4" />

                    {/* Halfway line */}
                    <line x1="20" y1={H / 2} x2={W - 20} y2={H / 2}
                      stroke="rgba(255,255,255,0.5)" strokeWidth="2" />

                    {/* Center circle */}
                    <circle cx={W / 2} cy={H / 2} r="55"
                      fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
                    <circle cx={W / 2} cy={H / 2} r="4" fill="rgba(255,255,255,0.7)" />

                    {/* Top penalty area (opponent) */}
                    <rect x="110" y="20" width="180" height="100"
                      fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.45)" strokeWidth="2" />
                    {/* Top 6-yard box */}
                    <rect x="150" y="20" width="100" height="40"
                      fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
                    {/* Top goal */}
                    <rect x="155" y="14" width="90" height="14"
                      fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.6)" strokeWidth="2" rx="2" />
                    {/* Top penalty spot */}
                    <circle cx={W / 2} cy="88" r="4" fill="rgba(255,255,255,0.65)" />
                    {/* Top penalty arc */}
                    <path d={`M 148 120 A 55 55 0 0 1 252 120`}
                      fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8" />

                    {/* Bottom penalty area (our team) */}
                    <rect x="110" y={H - 120} width="180" height="100"
                      fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.45)" strokeWidth="2" />
                    {/* Bottom 6-yard box */}
                    <rect x="150" y={H - 60} width="100" height="40"
                      fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
                    {/* Bottom goal */}
                    <rect x="155" y={H - 28} width="90" height="14"
                      fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.6)" strokeWidth="2" rx="2" />
                    {/* Bottom penalty spot */}
                    <circle cx={W / 2} cy={H - 88} r="4" fill="rgba(255,255,255,0.65)" />
                    {/* Bottom penalty arc */}
                    <path d={`M 148 ${H - 120} A 55 55 0 0 0 252 ${H - 120}`}
                      fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8" />

                    {/* Corner arcs */}
                    <path d="M 20 40 A 20 20 0 0 1 40 20" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
                    <path d={`M ${W - 40} 20 A 20 20 0 0 1 ${W - 20} 40`} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
                    <path d={`M 20 ${H - 40} A 20 20 0 0 0 40 ${H - 20}`} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
                    <path d={`M ${W - 40} ${H - 20} A 20 20 0 0 0 ${W - 20} ${H - 40}`} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />

                    {/* Player positions */}
                    {formationDef.positions.map((pos, idx) => {
                      const player = starters[idx];
                      const px = (pos.x / 100) * W;
                      const py = (pos.y / 100) * H;
                      const isGK = pos.pos === "GK";
                      const r = 24;

                      return (
                        <g
                          key={idx}
                          onClick={() => player ? removeStarter(idx) : setSelectingSlot(idx)}
                          style={{ cursor: "pointer" }}
                        >
                          {player ? (
                            <>
                              {/* Glow ring */}
                              <circle cx={px} cy={py} r={r + 5}
                                fill={isGK ? "rgba(245,158,11,0.18)" : `rgba(255,122,0,0.18)`}
                                stroke={isGK ? "rgba(245,158,11,0.5)" : `rgba(255,122,0,0.5)`}
                                strokeWidth="1.5" />
                              {/* Main circle */}
                              <circle cx={px} cy={py} r={r}
                                fill={isGK ? "url(#gkGrad)" : "url(#playerGrad)"}
                                stroke="rgba(255,255,255,0.9)" strokeWidth="2.5"
                                filter={isGK ? "url(#shadowGK)" : "url(#shadow)"} />
                              {/* Number */}
                              <text x={px} y={py - 2} textAnchor="middle" dominantBaseline="middle"
                                fill="white" fontSize="12" fontWeight="900" fontFamily="system-ui">
                                {player.number}
                              </text>
                              {/* Name label */}
                              <rect x={px - 32} y={py + r + 2} width="64" height="18" rx="5"
                                fill="rgba(0,0,0,0.72)" />
                              <text x={px} y={py + r + 12} textAnchor="middle" dominantBaseline="middle"
                                fill="white" fontSize="9.5" fontWeight="700" fontFamily="system-ui">
                                {(() => {
                                  const displayName = player.name
                                    ? player.name.split(" ").slice(-1)[0]
                                        .substring(0, 10)
                                    : "?";
                                  return displayName;
                                })()}
                              </text>
                              {/* Forme dot */}
                              <circle cx={px + r - 4} cy={py - r + 4} r="6"
                                fill={formeColor(player.forme)} stroke="rgba(0,0,0,0.6)" strokeWidth="1" />
                              <text x={px + r - 4} y={py - r + 4} textAnchor="middle" dominantBaseline="middle"
                                fill="white" fontSize="6" fontWeight="900" fontFamily="system-ui">
                                {player.forme > 0 ? player.forme : "—"}
                              </text>
                              {/* Captain badge */}
                              {captain === player.id && (
                                <circle cx={px - r + 4} cy={py - r + 4} r="7"
                                  fill="#F59E0B" stroke="rgba(0,0,0,0.5)" strokeWidth="1" />
                              )}
                              {captain === player.id && (
                                <text x={px - r + 4} y={py - r + 4} textAnchor="middle" dominantBaseline="middle"
                                  fill="white" fontSize="7" fontWeight="900">C</text>
                              )}
                            </>
                          ) : (
                            <>
                              {/* Empty slot */}
                              <circle cx={px} cy={py} r={r}
                                fill="rgba(255,255,255,0.06)"
                                stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeDasharray="5 3"
                                style={{ cursor: "pointer" }} />
                              <text x={px} y={py - 2} textAnchor="middle" dominantBaseline="middle"
                                fill="rgba(255,255,255,0.5)" fontSize="9" fontWeight="700" fontFamily="system-ui">
                                {pos.pos}
                              </text>
                              <text x={px} y={py + 8} textAnchor="middle" dominantBaseline="middle"
                                fill="rgba(255,255,255,0.25)" fontSize="7" fontFamily="system-ui">
                                Cliquer
                              </text>
                            </>
                          )}
                        </g>
                      );
                    })}

                    {/* Gradients for players */}
                    <defs>
                      <linearGradient id="playerGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF9A40" />
                        <stop offset="100%" stopColor="#E66000" />
                      </linearGradient>
                      <linearGradient id="gkGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FBBF24" />
                        <stop offset="100%" stopColor="#D97706" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Subs strip */}
                {subs.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] font-semibold mb-2 px-1" style={{ color: "var(--text-muted)" }}>
                      Remplaçants ({subs.length}/7)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {subs.map(p => (
                        <motion.div key={p.id} initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                          className="flex items-center gap-1.5 rounded-xl border px-2 py-1.5 cursor-pointer"
                          style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)" }}
                          onClick={() => removeSub(p.id)}>
                          <div className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold"
                            style={{ background: "rgba(255,122,0,0.2)", color: COACH_ACCENT }}>{p.number}</div>
                          <div>
                            <p className="text-[10px] font-semibold leading-none" style={{ color: "var(--text-primary)" }}>{p.name.split(" ").slice(-1)[0]}</p>
                            <p className="text-[8px]" style={{ color: "var(--text-muted)" }}>{p.position}</p>
                          </div>
                          <span className="text-[9px] font-bold ml-1" style={{ color: formeColor(p.forme) }}>{p.forme}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reserves strip */}
                {reserves.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <p style={{
                      fontSize: 10, fontWeight: 600,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: 8,
                    }}>
                      Réservistes ({reserves.length})
                    </p>
                    <div style={{
                      display: "flex", flexWrap: "wrap", gap: 6,
                    }}>
                      {reserves.map(p => (
                        <motion.div
                          key={p.id}
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          onClick={() => removeReserve(p.id)}
                          style={{
                            display: "flex", alignItems: "center",
                            gap: 8, padding: "6px 10px",
                            borderRadius: 10, cursor: "pointer",
                            background: C.blue.bg,
                            border: `1px solid ${C.blue.border}`,
                          }}>
                          <div style={{
                            width: 26, height: 26, borderRadius: "50%",
                            background: C.blue.bg,
                            display: "flex", alignItems: "center",
                            justifyContent: "center",
                            fontSize: 10, fontWeight: 800,
                            color: C.blue.main,
                          }}>
                            {p.number}
                          </div>
                          <div>
                            <p style={{
                              fontSize: 10, fontWeight: 700,
                              color: "var(--text-primary)",
                              lineHeight: 1,
                            }}>
                              {p.name.split(" ").slice(-1)[0]}
                            </p>
                            <p style={{
                              fontSize: 8, color: "var(--text-muted)",
                              marginTop: 2,
                            }}>
                              {p.position}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Legend */}
                <div className="mt-3 flex flex-wrap gap-3 text-[10px]" style={{ color: "var(--text-muted)" }}>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-3 w-3 rounded-full" style={{ background: COACH_ACCENT }} />
                    Joueur de champ
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-3 w-3 rounded-full" style={{ background: "#F59E0B" }} />
                    Gardien
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-3 w-3 rounded-full bg-green-500" />
                    Forme ≥85
                  </span>
                  <span className="flex items-center gap-1.5">🖱 Cliquer poste = placer · joueur = retirer</span>
                </div>
              </CCard>

              {/* RIGHT — Panel */}
              <div style={{
                display: "flex", flexDirection: "column",
                gap: 12,
              }}>
                {/* TEAM METRICS */}
                <CCard>
                  <p style={{
                    fontSize: 12, fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: 12,
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <Activity size={13}
                      style={{ color: C.orange.main }} />
                    Métriques équipe
                  </p>

                  {[
                    {
                      label: "Forme moyenne",
                      value: avgForme,
                      color: avgForme >= 80 ? C.green.main
                           : avgForme >= 65 ? C.orange.main
                           : C.red.main,
                    },
                    {
                      label: "Fatigue moyenne",
                      value: avgFatigue,
                      color: avgFatigue >= 70 ? C.red.main
                           : avgFatigue >= 45 ? C.amber.main
                           : C.green.main,
                    },
                    {
                      label: "Cohésion équipe",
                      value: chemistry,
                      color: chemistry >= 80 ? C.green.main
                           : chemistry >= 60 ? C.orange.main
                           : C.red.main,
                    },
                    {
                      label: "Préparation match",
                      value: readiness,
                      color: readiness >= 80 ? C.green.main
                           : readiness >= 50 ? C.amber.main
                           : C.red.main,
                    },
                  ].map(m => (
                    <div key={m.label} style={{ marginBottom: 10 }}>
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}>
                        <span style={{
                          fontSize: 11, color: "var(--text-muted)",
                        }}>
                          {m.label}
                        </span>
                        <span style={{
                          fontSize: 12, fontWeight: 700,
                          color: m.color,
                        }}>
                          {starterCount > 0 ? `${m.value}%` : "—"}
                        </span>
                      </div>
                      <div style={{
                        height: 5, borderRadius: 99,
                        background: "rgba(255,255,255,0.08)",
                        overflow: "hidden",
                      }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: starterCount > 0
                              ? `${m.value}%` : "0%",
                          }}
                          transition={{ duration: 0.6 }}
                          style={{
                            height: "100%", borderRadius: 99,
                            background: m.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}

                  {starterCount >= 3 && (
                    <div style={{ marginTop: 8 }}>
                      <p style={{
                        fontSize: 10, color: "var(--text-muted)",
                        marginBottom: 6,
                      }}>
                        Équilibre tactique
                      </p>
                      <div style={{
                        display: "flex", gap: 3, height: 20,
                        borderRadius: 8, overflow: "hidden",
                      }}>
                        <div style={{
                          flex: defenders || 1,
                          background: C.blue.main,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 9, fontWeight: 700,
                          color: "white",
                        }}>
                          {defenders}D
                        </div>
                        <div style={{
                          flex: midfielders || 1,
                          background: C.orange.main,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 9, fontWeight: 700,
                          color: "white",
                        }}>
                          {midfielders}M
                        </div>
                        <div style={{
                          flex: forwards || 1,
                          background: C.green.main,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 9, fontWeight: 700,
                          color: "white",
                        }}>
                          {forwards}A
                        </div>
                      </div>
                    </div>
                  )}
                </CCard>

                {/* AVAILABLE PLAYERS */}
                <CCard>
                  <p style={{
                    fontSize: 12, fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: 10,
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <Users size={13}
                      style={{ color: C.blue.main }} />
                    Effectif disponible ({bench.length})
                  </p>
                  <div style={{
                    display: "flex", flexDirection: "column",
                    gap: 4, maxHeight: 200, overflowY: "auto",
                  }}>
                    {bench.map((p, i) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        style={{
                          display: "flex", alignItems: "center",
                          gap: 8, padding: "7px 10px",
                          borderRadius: 9,
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.07)",
                        }}>
                        <div style={{
                          width: 28, height: 28,
                          borderRadius: "50%", flexShrink: 0,
                          background: `linear-gradient(
                            135deg,#ff7a00,#e66000)`,
                          display: "flex", alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10, fontWeight: 900,
                          color: "white",
                        }}>
                          {p.number}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            fontSize: 11, fontWeight: 700,
                            color: "var(--text-primary)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                            {p.name}
                          </p>
                          <p style={{
                            fontSize: 9,
                            color: "var(--text-muted)",
                          }}>
                            {p.positionFull}
                          </p>
                        </div>
                        <span style={{
                          fontSize: 10, fontWeight: 700,
                          color: formeColor(p.forme),
                          flexShrink: 0,
                        }}>
                          {p.forme}
                        </span>
                        <div style={{
                          display: "flex", gap: 4,
                        }}>
                          <button
                            type="button"
                            onClick={() => addToSub(p)}
                            style={{
                              fontSize: 9, fontWeight: 700,
                              color: C.blue.main,
                              background: C.blue.bg,
                              border: `1px solid ${C.blue.border}`,
                              borderRadius: 6,
                              padding: "2px 7px",
                              cursor: "pointer",
                            }}>
                            Rem.
                          </button>
                          <button
                            type="button"
                            onClick={() => addToReserve(p)}
                            style={{
                              fontSize: 9, fontWeight: 700,
                              color: C.teal.main,
                              background: C.teal.bg,
                              border: `1px solid ${C.teal.border}`,
                              borderRadius: 6,
                              padding: "2px 7px",
                              cursor: "pointer",
                            }}>
                            Rés.
                          </button>
                        </div>
                      </motion.div>
                    ))}
                    {bench.length === 0 && (
                      <p style={{
                        textAlign: "center", padding: "16px 0",
                        fontSize: 12, color: "var(--text-muted)",
                      }}>
                        Tous les joueurs sont placés ✓
                      </p>
                    )}
                  </div>

                  {squad.filter(p =>
                    p.status === "Blessé" ||
                    p.status === "Suspendu"
                  ).length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <p style={{
                        fontSize: 9, fontWeight: 700,
                        color: C.red.main,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        marginBottom: 6,
                      }}>
                        Indisponibles
                      </p>
                      {squad
                        .filter(p =>
                          p.status === "Blessé" ||
                          p.status === "Suspendu"
                        )
                        .map(p => (
                          <div key={p.id} style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8, padding: "5px 8px",
                            borderRadius: 8, opacity: 0.6,
                            background: C.red.bg,
                            border: `1px solid ${C.red.border}`,
                            marginBottom: 4,
                          }}>
                            <div style={{
                              width: 22, height: 22,
                              borderRadius: "50%",
                              background: C.red.bg,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 9, fontWeight: 800,
                              color: C.red.main, flexShrink: 0,
                            }}>
                              {p.number}
                            </div>
                            <p style={{
                              fontSize: 10, fontWeight: 600,
                              color: "var(--text-primary)", flex: 1,
                            }}>
                              {p.name}
                            </p>
                            <span style={{
                              fontSize: 9, color: C.red.main,
                            }}>
                              {p.status}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </CCard>

                {/* RESPONSIBILITIES */}
                <CCard>
                  <p style={{
                    fontSize: 12, fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: 10,
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <Star size={13}
                      style={{ color: C.amber.main }} />
                    Responsabilités match
                  </p>

                  {[
                    {
                      label: "Capitaine",
                      icon: "👑",
                      value: captain,
                      setter: setCaptain,
                      color: C.amber,
                    },
                    {
                      label: "Vice-capitaine",
                      icon: "🥈",
                      value: viceCaptain,
                      setter: setViceCaptain,
                      color: C.blue,
                    },
                    {
                      label: "Tireur penaltys",
                      icon: "⚽",
                      value: penaltyTaker,
                      setter: setPenaltyTaker,
                      color: C.green,
                    },
                    {
                      label: "Coups francs",
                      icon: "🎯",
                      value: freeKickTaker,
                      setter: setFreeKickTaker,
                      color: C.violet,
                    },
                    {
                      label: "Corners gauche",
                      icon: "↖",
                      value: cornerLeftTaker,
                      setter: setCornerLeftTaker,
                      color: C.teal,
                    },
                    {
                      label: "Corners droit",
                      icon: "↗",
                      value: cornerRightTaker,
                      setter: setCornerRightTaker,
                      color: C.orange,
                    },
                  ].map(r => (
                    <div key={r.label} style={{
                      marginBottom: 8,
                    }}>
                      <label style={{
                        fontSize: 9, fontWeight: 700,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        display: "block", marginBottom: 4,
                      }}>
                        {r.icon} {r.label}
                      </label>
                      <select
                        value={r.value ?? ""}
                        onChange={e =>
                          r.setter(e.target.value || null)
                        }
                        className="odin-select"
                        style={{
                          width: "100%", padding: "7px 10px",
                          background: "rgba(255,255,255,0.05)",
                          border: `1px solid ${r.color.border}`,
                          borderRadius: 8, fontSize: 11,
                          color: "var(--text-primary)",
                          outline: "none", colorScheme: "dark",
                        }}>
                        <option value="">
                          — Choisir —
                        </option>
                        {starters.filter(Boolean).map(p => (
                          <option key={p!.id} value={p!.id}>
                            {p!.name} ({p!.position})
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </CCard>

                {/* TACTICAL WARNINGS */}
                <CCard>
                  <p style={{
                    fontSize: 12, fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: 10,
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <AlertTriangle size={13}
                      style={{
                        color: warnings.some(
                          w => w.type === "error"
                        ) ? C.red.main : C.amber.main,
                      }} />
                    Alertes tactiques
                    {warnings.length > 0 && (
                      <span style={{
                        marginLeft: "auto",
                        fontSize: 10, fontWeight: 700,
                        color: warnings.some(
                          w => w.type === "error"
                        ) ? C.red.main : C.amber.main,
                        background: warnings.some(
                          w => w.type === "error"
                        ) ? C.red.bg : C.amber.bg,
                        padding: "1px 7px", borderRadius: 99,
                      }}>
                        {warnings.length}
                      </span>
                    )}
                  </p>

                  {warnings.length === 0 ? (
                    <div style={{
                      display: "flex", alignItems: "center",
                      gap: 8, padding: "10px 12px",
                      borderRadius: 10, background: C.green.bg,
                      border: `1px solid ${C.green.border}`,
                    }}>
                      <CheckCircle2 size={14}
                        style={{ color: C.green.main }} />
                      <p style={{
                        fontSize: 12, color: C.green.main,
                        fontWeight: 600,
                      }}>
                        Composition validée ✓
                      </p>
                    </div>
                  ) : (
                    <div style={{
                      display: "flex",
                      flexDirection: "column", gap: 6,
                    }}>
                      {warnings.map((w, i) => {
                        const wc = w.type === "error" ? C.red
                          : w.type === "warning" ? C.amber
                          : C.blue;
                        const Icon = w.type === "error"
                          ? AlertTriangle
                          : w.type === "warning"
                          ? AlertTriangle : Flag;
                        return (
                          <div key={i} style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 8, padding: "8px 10px",
                            borderRadius: 9,
                            background: wc.bg,
                            border: `1px solid ${wc.border}`,
                            borderLeft: `3px solid ${wc.main}`,
                          }}>
                            <Icon size={12}
                              style={{
                                color: wc.main, flexShrink: 0,
                                marginTop: 2,
                              }} />
                            <p style={{
                              fontSize: 11, color: "var(--text-primary)",
                              lineHeight: 1.4,
                            }}>
                              {w.msg}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CCard>

                {/* AI SUGGESTIONS */}
                <CCard>
                  <p style={{
                    fontSize: 12, fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: 10,
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <Brain size={13}
                      style={{ color: C.violet.main }} />
                    Suggestions IA
                  </p>
                  <div style={{
                    display: "flex",
                    flexDirection: "column", gap: 6,
                  }}>
                    {aiSuggestions.map((s, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 10, padding: "10px 12px",
                          borderRadius: 10,
                          background: "rgba(139,92,246,0.06)",
                          border: "1px solid rgba(139,92,246,0.18)",
                          borderLeft: `3px solid ${s.color}`,
                        }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 8,
                          background: `${s.color}18`,
                          display: "flex", alignItems: "center",
                          justifyContent: "center", flexShrink: 0,
                        }}>
                          <s.icon size={13}
                            style={{ color: s.color }} />
                        </div>
                        <p style={{
                          fontSize: 11,
                          color: "var(--text-primary)",
                          lineHeight: 1.5, flex: 1,
                        }}>
                          {s.msg}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </CCard>
              </div>
            </div>

            {/* SAVE BANNER */}
            <AnimatePresence>
              {starterCount === 11 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  style={{
                    padding: "16px 20px",
                    borderRadius: 16,
                    background: `rgba(255,122,0,0.08)`,
                    border: `1px solid rgba(255,122,0,0.25)`,
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap", gap: 12,
                  }}>
                  <div>
                    <p style={{
                      fontWeight: 700, color: C.orange.main,
                      fontSize: 14,
                    }}>
                      ✓ Composition complète —{" "}
                      {FORMATIONS[formation].label}
                    </p>
                    <p style={{
                      fontSize: 11, color: "var(--text-muted)",
                      marginTop: 4, display: "flex",
                      gap: 16, flexWrap: "wrap",
                    }}>
                      <span>
                        Forme: <strong style={{ color: C.green.main }}>
                          {avgForme}%
                        </strong>
                      </span>
                      <span>
                        Fatigue: <strong style={{
                          color: avgFatigue > 70
                            ? C.red.main : C.green.main,
                        }}>
                          {avgFatigue}%
                        </strong>
                      </span>
                      <span>
                        Préparation: <strong style={{
                          color: readiness >= 80
                            ? C.green.main : C.amber.main,
                        }}>
                          {readiness}%
                        </strong>
                      </span>
                      {captain && (
                        <span>
                          Capitaine: <strong
                            style={{ color: C.amber.main }}>
                            {starters.find(
                              p => p?.id === captain
                            )?.name}
                          </strong>
                        </span>
                      )}
                    </p>
                  </div>
                  <motion.button
                    type="button"
                    onClick={saveLineup}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      padding: "10px 20px",
                      borderRadius: 12,
                      background: saved
                        ? C.green.main
                        : `linear-gradient(135deg,#ff7a00,#e66000)`,
                      color: "white", fontSize: 13,
                      fontWeight: 700, border: "none",
                      cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 6,
                    }}>
                    <Save size={14} />
                    {saved ? "Sauvegardé ✓" : "Enregistrer"}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* POSITION SELECTOR MODAL */}
        <AnimatePresence>
          {selectingSlot !== null && (() => {
            const slotPos =
              formationDef.positions[selectingSlot];
            const { primary, secondary } =
              getPlayersForPosition(slotPos?.pos ?? "");
            return (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectingSlot(null)}
                  style={{
                    position: "fixed", inset: 0,
                    background: "rgba(0,0,0,0.75)",
                    backdropFilter: "blur(8px)",
                    zIndex: 40,
                    display: "flex", alignItems: "center",
                    justifyContent: "center", padding: 16,
                  }}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    onClick={e => e.stopPropagation()}
                    style={{
                      width: "100%", maxWidth: 380,
                      maxHeight: "85vh", overflowY: "auto",
                      background: "rgba(14,10,35,0.98)",
                      border: "1px solid rgba(255,122,0,0.30)",
                      borderTop: "4px solid #ff7a00",
                      borderRadius: 20, padding: 22,
                      boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
                    }}>

                    <div style={{
                      display: "flex", alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 18,
                    }}>
                      <div>
                        <p style={{
                          fontSize: 15, fontWeight: 800,
                          color: "var(--text-primary)",
                        }}>
                          Choisir un joueur
                        </p>
                        <p style={{
                          fontSize: 11,
                          color: "var(--text-muted)",
                          marginTop: 2,
                        }}>
                          Poste: <strong
                            style={{ color: C.orange.main }}>
                            {POSITION_LABELS[slotPos?.pos ?? ""]
                             ?? slotPos?.pos}
                          </strong>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectingSlot(null)}
                        style={{
                          width: 30, height: 30,
                          borderRadius: 8,
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.10)",
                          display: "flex", alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer", color: "white",
                          fontSize: 14,
                        }}>
                        ✕
                      </button>
                    </div>

                    {primary.length > 0 && (
                      <>
                        <p style={{
                          fontSize: 10, fontWeight: 700,
                          color: C.green.main,
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                          marginBottom: 8,
                        }}>
                          ✓ Recommandés pour ce poste
                        </p>
                        <div style={{
                          display: "flex",
                          flexDirection: "column", gap: 6,
                          marginBottom: 14,
                        }}>
                          {primary.map(p => (
                            <motion.button
                              key={p.id} type="button"
                              onClick={() => {
                                setStarters(prev => {
                                  const n = [...prev];
                                  n[selectingSlot!] = p;
                                  return n;
                                });
                                setSubs(s =>
                                  s.filter(x => x.id !== p.id)
                                );
                                setReserves(r =>
                                  r.filter(x => x.id !== p.id)
                                );
                                setSelectingSlot(null);
                              }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12, padding: "10px 14px",
                                borderRadius: 12,
                                background: C.green.bg,
                                border: `1px solid ${C.green.border}`,
                                borderLeft: "3px solid #22c55e",
                                cursor: "pointer",
                                width: "100%", textAlign: "left",
                              }}>
                              <div style={{
                                width: 38, height: 38,
                                borderRadius: 10, flexShrink: 0,
                                background:
                                  "linear-gradient(135deg,#ff7a00,#e66000)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 13, fontWeight: 900,
                                color: "white",
                              }}>
                                {p.number}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{
                                  fontSize: 13, fontWeight: 700,
                                  color: "var(--text-primary)",
                                }}>
                                  {p.name}
                                </p>
                                <p style={{
                                  fontSize: 10,
                                  color: "var(--text-muted)",
                                  marginTop: 2,
                                }}>
                                  {p.positionFull}
                                </p>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <p style={{
                                  fontSize: 13, fontWeight: 800,
                                  color: formeColor(p.forme),
                                }}>
                                  {p.forme}
                                </p>
                                <p style={{
                                  fontSize: 9,
                                  color: "var(--text-muted)",
                                }}>
                                  forme
                                </p>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </>
                    )}

                    {secondary.length > 0 && (
                      <>
                        <p style={{
                          fontSize: 10, fontWeight: 700,
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                          marginBottom: 8,
                        }}>
                          Autres joueurs disponibles
                        </p>
                        <div style={{
                          display: "flex",
                          flexDirection: "column", gap: 6,
                        }}>
                          {secondary.map(p => (
                            <motion.button
                              key={p.id} type="button"
                              onClick={() => {
                                setStarters(prev => {
                                  const n = [...prev];
                                  n[selectingSlot!] = p;
                                  return n;
                                });
                                setSubs(s =>
                                  s.filter(x => x.id !== p.id)
                                );
                                setReserves(r =>
                                  r.filter(x => x.id !== p.id)
                                );
                                setSelectingSlot(null);
                              }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12, padding: "10px 14px",
                                borderRadius: 12,
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                borderLeft:
                                  "3px solid rgba(255,255,255,0.15)",
                                cursor: "pointer",
                                width: "100%", textAlign: "left",
                              }}>
                              <div style={{
                                width: 38, height: 38,
                                borderRadius: 10, flexShrink: 0,
                                background: "rgba(255,122,0,0.15)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 13, fontWeight: 900,
                                color: "#ff7a00",
                              }}>
                                {p.number}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{
                                  fontSize: 13, fontWeight: 700,
                                  color: "var(--text-primary)",
                                }}>
                                  {p.name}
                                </p>
                                <p style={{
                                  fontSize: 10,
                                  color: "var(--text-muted)",
                                  marginTop: 2,
                                }}>
                                  {p.positionFull}
                                  <span style={{
                                    marginLeft: 6, fontSize: 9,
                                    color: C.amber.main,
                                  }}>
                                    ⚠ Hors poste
                                  </span>
                                </p>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <p style={{
                                  fontSize: 13, fontWeight: 800,
                                  color: formeColor(p.forme),
                                }}>
                                  {p.forme}
                                </p>
                                <p style={{
                                  fontSize: 9,
                                  color: "var(--text-muted)",
                                }}>
                                  forme
                                </p>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </>
                    )}

                    {primary.length === 0 &&
                     secondary.length === 0 && (
                      <div style={{
                        textAlign: "center", padding: "28px 0",
                        borderRadius: 12,
                        border: "1px dashed rgba(255,255,255,0.08)",
                      }}>
                        <p style={{
                          fontSize: 13,
                          color: "var(--text-muted)",
                        }}>
                          Tous les joueurs disponibles
                          sont déjà placés
                        </p>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              </>
            );
          })()}
        </AnimatePresence>
      </CoachPageTransition>
    </>
  );
}
