import type { ScoutProspectDto } from "./api/scout";
import type { ScoutPlayer } from "../data/recruteurData";

const POSITION_FULL: Record<string, string> = {
  BU: "Buteur",
  AG: "Ailier gauche",
  AD: "Ailier droit",
  MC: "Milieu central",
  MOC: "Milieu offensif",
  MDC: "Milieu défensif",
  DC: "Défenseur central",
  DG: "Arrière gauche",
  DD: "Arrière droit",
  GB: "Gardien de but",
};

// Mirrors the mapping used by the recruteur AI search (backend recruteur.service.ts)
// so a prospect looks identical whether it comes from the plain list or an AI search.
export function mapProspectToScoutPlayer(p: ScoutProspectDto, shortlisted = false): ScoutPlayer {
  const technique = Math.round((p.dribble + p.passing) / 2);
  const finishing = Math.min(99, Math.round(p.goals * 2 + p.potential * 0.3));

  return {
    id: p.id,
    name: p.name,
    club: p.club,
    country: p.nationality,
    countryFlag: p.flag,
    age: p.age,
    position: p.position,
    positionFull: POSITION_FULL[p.position] ?? p.position,
    foot: p.foot === "Gauche" ? "Gauche" : "Droit",
    height: `${(p.height / 100).toFixed(2)} m`,
    value: p.marketValue,
    valueNum: Math.round((p.valueMK / 1000) * 10) / 10,
    salary: "—",
    aiScore: p.aiScore,
    potential: p.potential,
    injuryRisk: p.injuryRisk,
    teamCompat: Math.min(99, Math.round(p.potential * 0.95)),
    transferSuccess: Math.min(99, Math.round(70 + p.potential * 0.2)),
    speed: p.speed,
    technique,
    physical: p.physical,
    vision: p.passing,
    mental: p.mental,
    finishing,
    goals: p.goals,
    assists: p.assists,
    xg: 0,
    matches: p.matches,
    league: p.league,
    similarTo: [],
    replaces: "",
    valueHistory: [],
    shortlisted,
  };
}

const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

// Monthly market-value growth estimate derived from real attributes (potential, age) —
// same spirit as getContractAdvice: a transparent formula over real data, not a fabricated series.
export function estimateValueTrajectory(player: Pick<ScoutPlayer, "valueNum" | "potential" | "age">) {
  const baseRate = player.potential >= 90 ? 0.03 : player.potential >= 80 ? 0.02 : player.potential >= 70 ? 0.01 : 0.003;
  const ageFactor = player.age >= 28 ? 0.5 : player.age <= 21 ? 1.3 : 1;
  const monthlyRate = baseRate * ageFactor;

  const now = new Date();
  const points: { month: string; value: number; predicted?: boolean }[] = [];
  for (let i = -3; i <= 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const value = Math.round(player.valueNum * Math.pow(1 + monthlyRate, i) * 10) / 10;
    points.push({ month: MONTHS[d.getMonth()], value, predicted: i > 0 });
  }
  return points;
}
