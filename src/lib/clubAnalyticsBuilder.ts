import type { ClubAnalytics, BestXiPlayer, TeamRadarPoint, TeamEvolutionPoint, TopScorer } from "./analyticsNormalize";

export interface AnalyticsPlayerInput {
  id: string;
  name: string;
  position: string;
  ovr: number;
  goals?: number;
  availability?: string;
  status?: string;
}

export interface AnalyticsCalendarInput {
  eventDate: string;
  eventType: string;
}

const FORMATION_433 = [
  { slot: "GB", aliases: ["GB", "GK"], x: 50, y: 82 },
  { slot: "DD", aliases: ["DD", "RB"], x: 88, y: 62 },
  { slot: "DC", aliases: ["DC", "CB"], x: 65, y: 68 },
  { slot: "DC", aliases: ["DC", "CB"], x: 35, y: 68 },
  { slot: "DG", aliases: ["DG", "LB", "LG"], x: 12, y: 62 },
  { slot: "MC", aliases: ["MC", "MDF", "CM"], x: 75, y: 45 },
  { slot: "MOC", aliases: ["MOC", "CAM", "MO"], x: 50, y: 38 },
  { slot: "MC", aliases: ["MC", "MDF", "CM"], x: 25, y: 45 },
  { slot: "AD", aliases: ["AD", "RW"], x: 80, y: 22 },
  { slot: "BU", aliases: ["BU", "ST", "CF", "ATT", "FW"], x: 50, y: 12 },
  { slot: "AG", aliases: ["AG", "LW"], x: 20, y: 22 },
];

const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

function normPos(position: string) {
  return position.trim().toUpperCase().replace(/\s+/g, "");
}

function playerStatus(p: AnalyticsPlayerInput) {
  const raw = p.status ?? p.availability ?? "DISPONIBLE";
  const label = String(raw).toLowerCase();
  if (label.includes("bless")) return "BLESSE";
  if (label.includes("fin contrat")) return "FIN_CONTRAT";
  if (label.includes("limit")) return "LIMITE";
  return "DISPONIBLE";
}

function shortName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return parts.length > 1 ? parts[parts.length - 1]! : fullName;
}

function positionMatches(playerPos: string, aliases: string[]) {
  const p = normPos(playerPos);
  return aliases.some((a) => p === a);
}

function parseRadar(position: string, ovr: number) {
  const pos = normPos(position);
  const isAtk = /BU|ST|AG|AD|ATT|FW|CF/.test(pos);
  const isDef = /DC|DG|DD|GK|GB|DEF|LB|RB|CB/.test(pos);
  const isMid = /MC|MOC|MDF|MID|CM|CAM/.test(pos);

  return {
    shooting: Math.min(99, Math.max(40, isAtk ? ovr + 6 : isMid ? ovr - 4 : ovr - 14)),
    defending: Math.min(99, Math.max(40, isDef ? ovr + 6 : isMid ? ovr - 2 : ovr - 12)),
    physical: Math.min(99, Math.max(40, ovr)),
    passing: Math.min(99, Math.max(40, isMid ? ovr + 4 : ovr - 3)),
    dribbling: Math.min(99, Math.max(40, isAtk ? ovr + 3 : ovr - 6)),
    mental: Math.min(99, Math.max(40, Math.round(ovr * 0.92))),
  };
}

function avg(nums: number[]) {
  if (nums.length === 0) return 0;
  return Math.round(nums.reduce((s, n) => s + n, 0) / nums.length);
}

function buildBestXi(pool: AnalyticsPlayerInput[]): BestXiPlayer[] {
  const slots = FORMATION_433.map((s) => ({ ...s, player: null as AnalyticsPlayerInput | null }));
  const sorted = [...pool].sort((a, b) => b.ovr - a.ovr);

  for (const player of sorted) {
    const slotIdx = slots.findIndex(
      (s) => !s.player && positionMatches(player.position, s.aliases),
    );
    if (slotIdx >= 0) slots[slotIdx].player = player;
  }

  return slots
    .filter((s) => s.player)
    .map((s) => ({
      name: shortName(s.player!.name),
      position: s.slot,
      playerPosition: normPos(s.player!.position),
      x: s.x,
      y: s.y,
    }));
}

function buildTeamEvolution(events: AnalyticsCalendarInput[]): TeamEvolutionPoint[] {
  const now = new Date();
  return MONTHS.slice(0, 6).map((month, idx) => {
    const monthIndex = (now.getMonth() - 5 + idx + 12) % 12;
    const year = now.getMonth() - 5 + idx < 0 ? now.getFullYear() - 1 : now.getFullYear();
    const matches = events.filter((e) => {
      if (String(e.eventType).toUpperCase() !== "MATCH") return false;
      const d = new Date(e.eventDate);
      return d.getMonth() === monthIndex && d.getFullYear() === year;
    });
    const wins = matches.length > 0 ? Math.max(1, Math.round(matches.length * 0.55)) : 0;
    return { month, wins, points: wins * 3 };
  });
}

function buildTopScorers(players: AnalyticsPlayerInput[]): TopScorer[] {
  return [...players]
    .filter((p) => Number(p.goals ?? 0) > 0)
    .sort((a, b) => Number(b.goals ?? 0) - Number(a.goals ?? 0) || b.ovr - a.ovr)
    .slice(0, 3)
    .map((p, i) => ({
      rank: i + 1,
      name: p.name,
      goals: Number(p.goals ?? 0),
      medal: i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉",
    }));
}

export function buildClubAnalyticsFromPlayers(
  players: AnalyticsPlayerInput[],
  events: AnalyticsCalendarInput[] = [],
): ClubAnalytics {
  const normalized = players.map((p) => ({
    ...p,
    position: normPos(p.position),
    goals: Number(p.goals ?? 0),
    status: playerStatus(p),
  }));

  const available = normalized.filter((p) => p.status !== "BLESSE" && p.status !== "FIN_CONTRAT");
  const pool = available.length > 0 ? available : normalized;

  const radars = pool.map((p) => parseRadar(p.position, p.ovr));
  const teamRadar: TeamRadarPoint[] = [
    { stat: "Attaque", value: avg(radars.map((r) => r.shooting)) },
    { stat: "Défense", value: avg(radars.map((r) => r.defending)) },
    { stat: "Physique", value: avg(radars.map((r) => r.physical)) },
    { stat: "Technique", value: avg(radars.map((r) => (r.passing + r.dribbling) / 2)) },
    { stat: "Mental", value: avg(radars.map((r) => r.mental)) },
  ];

  return {
    formation: "4-3-3",
    teamRadar,
    bestXi: { formation: "4-3-3", players: buildBestXi(pool) },
    teamEvolution: buildTeamEvolution(events),
    topScorers: buildTopScorers(normalized),
    playersCount: players.length,
  };
}

export function normalizePlayerForAnalytics(raw: Record<string, unknown>): AnalyticsPlayerInput {
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? raw.fullName ?? ""),
    position: String(raw.position ?? "MC"),
    ovr: Number(raw.ovr ?? 0),
    goals: Number(raw.goals ?? 0),
    availability: raw.availability ? String(raw.availability) : undefined,
    status: raw.status ? String(raw.status) : undefined,
  };
}

export function normalizeCalendarForAnalytics(raw: Record<string, unknown>): AnalyticsCalendarInput {
  const dateRaw = raw.eventDate;
  const iso =
    typeof dateRaw === "string"
      ? dateRaw
      : dateRaw instanceof Date
        ? dateRaw.toISOString()
        : "";
  return {
    eventDate: iso,
    eventType: String(raw.eventType ?? "ENTRAINEMENT"),
  };
}
