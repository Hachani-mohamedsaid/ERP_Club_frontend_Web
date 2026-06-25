export interface TeamRadarPoint {
  stat: string;
  value: number;
}

export interface BestXiPlayer {
  name: string;
  position: string;
  playerPosition?: string;
  x: number;
  y: number;
}

export interface TeamEvolutionPoint {
  month: string;
  wins: number;
  points: number;
}

export interface TopScorer {
  rank: number;
  name: string;
  goals: number;
  medal: string;
}

export interface ClubAnalytics {
  formation: string;
  teamRadar: TeamRadarPoint[];
  bestXi: { formation: string; players: BestXiPlayer[] };
  teamEvolution: TeamEvolutionPoint[];
  topScorers: TopScorer[];
  playersCount: number;
}

export function normalizeAnalytics(raw: Record<string, unknown>): ClubAnalytics {
  const teamRadar = Array.isArray(raw.teamRadar)
    ? raw.teamRadar.map((r) => {
        const row = r as Record<string, unknown>;
        return { stat: String(row.stat ?? ""), value: Number(row.value ?? 0) };
      })
    : [];

  const bestXiRaw = raw.bestXi as Record<string, unknown> | undefined;
  const bestXiPlayers = Array.isArray(bestXiRaw?.players)
    ? bestXiRaw!.players.map((p) => {
        const row = p as Record<string, unknown>;
        return {
          name: String(row.name ?? "—"),
          position: String(row.position ?? ""),
          x: Number(row.x ?? 50),
          y: Number(row.y ?? 50),
        };
      })
    : [];

  const teamEvolution = Array.isArray(raw.teamEvolution)
    ? raw.teamEvolution.map((r) => {
        const row = r as Record<string, unknown>;
        return {
          month: String(row.month ?? ""),
          wins: Number(row.wins ?? 0),
          points: Number(row.points ?? 0),
        };
      })
    : [];

  const topScorers = Array.isArray(raw.topScorers)
    ? raw.topScorers.map((r) => {
        const row = r as Record<string, unknown>;
        return {
          rank: Number(row.rank ?? 0),
          name: String(row.name ?? ""),
          goals: Number(row.goals ?? 0),
          medal: String(row.medal ?? ""),
        };
      })
    : [];

  return {
    formation: String(raw.formation ?? "4-3-3"),
    teamRadar,
    bestXi: {
      formation: String(bestXiRaw?.formation ?? "4-3-3"),
      players: bestXiPlayers,
    },
    teamEvolution,
    topScorers,
    playersCount: Number(raw.playersCount ?? 0),
  };
}
