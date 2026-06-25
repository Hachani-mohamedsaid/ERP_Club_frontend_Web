/**
 * Central data hook for the Joueur role.
 * Fetches ALL backend data needed across every Joueur page.
 * Auto-seeds defaults on first load (handled by backend).
 */
import { useEffect, useState, useCallback } from "react";
import { clubApi } from "../lib/api/club";
import { useAuth } from "../contexts/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BackendPlayer {
  id: string;
  name: string;
  position: string;
  positionFull: string;
  age: number;
  ovr: number;
  goals: number;
  marketValue: string;
  contract: { salary: string };
  availability: string;
  hasAccount: boolean;
  accountEmail: string | null;
  photoUrl?: string | null;
  radar?: Record<string, number> | null;
  stats?: PlayerStatsPayload | null;
  height?: string;
  weight?: string;
  strongFoot?: string;
  birthDate?: string;
  jerseyNumber?: number;
  nationality?: string;
}

export interface BackendContract {
  id: string;
  startDate: string;
  endDate: string;
  salary: string;
  releaseClause: string;
  consumedPct: number;
}

export interface OrgProfile {
  clubName: string;
  league: string;
  country: string;
  logoUrl?: string | null;
  stadium?: string | null;
}

export interface PlayerStatsPayload {
  form: number;
  vitesse: number;
  technique: number;
  physique: number;
  mental: number;
  coachRating: number;
  positionRanking: number;
  performanceEvolution: Array<{ month: string; score: number }>;
  goalContribution: Array<{ name: string; value: number; color: string }>;
  trainingLoad: number;
  trainingSessions: { completed: number; total: number; intensity: string; fatiguePredicted: number };
  seasonStats: { goals: number; assists: number; matches: number };
  dashboardHero: { marketValue: string; coachRating: number; positionRanking: number; positionLabel: string };
  marketValueTrend: { change: string };
}

export interface BackendMatchStat {
  id: string;
  matchDate: string;
  opponent: string;
  result: string;
  goals: number;
  assists: number;
  minutes: number;
  rating: number;
  distance: number;
  sprints: number;
  passAccuracy: number;
  topSpeed: number;
  keyPasses: number;
  heatmapData: unknown;
}

export interface BackendAward {
  id: string;
  title: string;
  season: string;
  icon: string;
  color: string;
  awardType: string;
  year?: string | null;
  club?: string | null;
  event?: string | null;
}

export interface BackendDocument {
  id: string;
  name: string;
  docType: string;
  docDate: string;
  size: string;
}

export interface BackendTransfer {
  id: string;
  playerName: string;
  transferType: string;
  club: string;
  value: string;
  status: string;
  probability: number;
}

export interface BackendChemistry {
  id: string;
  player1Id: string;
  player1Name: string;
  player2Id: string;
  player2Name: string;
  chemistry: number;
}

export interface BackendCalendarEvent {
  id: string;
  title: string;
  eventDate: string;
  eventTime: string | null;
  eventType: string;
  location: string | null;
}

export interface BackendInjury {
  id: string;
  name: string;
  injury: string;
  bodyPart: string;
  returnDate: string;
  riskIA: number;
}

interface JoueurBackendData {
  myPlayer: BackendPlayer | null;
  myPlayerId: string | null;
  squadPlayers: BackendPlayer[];
  playerStats: PlayerStatsPayload | null;
  matchStats: BackendMatchStat[];
  awards: BackendAward[];
  documents: BackendDocument[];
  transfers: BackendTransfer[];
  chemistry: BackendChemistry[];
  calendarEvents: BackendCalendarEvent[];
  injuries: BackendInjury[];
  orgProfile: OrgProfile | null;
  myContract: BackendContract | null;
  loading: boolean;
  error: string | null;
  refetchDocuments: () => Promise<void>;
  refetchPlayer: () => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useJoueurBackendData(): JoueurBackendData {
  const { user } = useAuth();

  const [myPlayer, setMyPlayer] = useState<BackendPlayer | null>(null);
  const [squadPlayers, setSquadPlayers] = useState<BackendPlayer[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStatsPayload | null>(null);
  const [matchStats, setMatchStats] = useState<BackendMatchStat[]>([]);
  const [awards, setAwards] = useState<BackendAward[]>([]);
  const [documents, setDocuments] = useState<BackendDocument[]>([]);
  const [transfers, setTransfers] = useState<BackendTransfer[]>([]);
  const [chemistry, setChemistry] = useState<BackendChemistry[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<BackendCalendarEvent[]>([]);
  const [injuries, setInjuries] = useState<BackendInjury[]>([]);
  const [orgProfile, setOrgProfile] = useState<OrgProfile | null>(null);
  const [myContract, setMyContract] = useState<BackendContract | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvedPlayerId, setResolvedPlayerId] = useState<string | null>(null);

  const fetchDocuments = useCallback(async (pid: string) => {
    try {
      const docs = await clubApi.getDocuments(pid) as BackendDocument[];
      setDocuments(Array.isArray(docs) ? docs : []);
    } catch {
      // non-blocking
    }
  }, []);

  const refetchDocuments = useCallback(async () => {
    if (resolvedPlayerId) await fetchDocuments(resolvedPlayerId);
  }, [resolvedPlayerId, fetchDocuments]);

  const refetchPlayer = useCallback(async () => {
    if (!resolvedPlayerId) return;
    try {
      const playersRaw = await clubApi.getPlayers().catch(() => []) as BackendPlayer[];
      const players = Array.isArray(playersRaw) ? playersRaw : [];
      const own = players.find((p) => p.id === resolvedPlayerId) ?? null;
      setSquadPlayers(players);
      if (own) setMyPlayer(own);
    } catch { /* non-blocking */ }
  }, [resolvedPlayerId]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        // 0. Fetch org profile (club name, league)
        const profileRaw = await clubApi.getProfile().catch(() => null) as OrgProfile | null;
        if (!cancelled && profileRaw) setOrgProfile(profileRaw);

        // 1. Fetch squad list to resolve current player
        const playersRaw = await clubApi.getPlayers().catch(() => []) as BackendPlayer[];
        const players = Array.isArray(playersRaw) ? playersRaw : [];
        if (cancelled) return;
        setSquadPlayers(players);

        // Resolve own player record (by playerId JWT claim OR by name match)
        const own =
          players.find((p) => p.id === user.playerId) ??
          players.find(
            (p) => p.name.trim().toLowerCase() === (user.fullName ?? "").trim().toLowerCase(),
          ) ??
          (players.length > 0 ? players[0] : null);

        const pid = own?.id ?? null;
        if (cancelled) return;
        setMyPlayer(own);
        setResolvedPlayerId(pid);

        // 2. Parallel fetch for player-scoped and org-scoped data
        if (pid) {
          const [statsRaw, matchRaw, awardsRaw, docsRaw, calRaw, injRaw, transfRaw, chemRaw, contractRaw] =
            await Promise.all([
              clubApi.getPlayerStats(pid).catch(() => null),
              clubApi.getMatchStats(pid).catch(() => []),
              clubApi.getAwards(pid).catch(() => []),
              clubApi.getDocuments(pid).catch(() => []),
              clubApi.getCalendar().catch(() => []),
              clubApi.getInjuries().catch(() => ({ injured: [] })),
              clubApi.getTransfers().catch(() => []),
              clubApi.getChemistry().catch(() => []),
              clubApi.getPlayerContract(pid).catch(() => null),
            ]);

          if (cancelled) return;

          setPlayerStats(statsRaw as PlayerStatsPayload | null);
          setMatchStats(Array.isArray(matchRaw) ? (matchRaw as BackendMatchStat[]) : []);
          setAwards(Array.isArray(awardsRaw) ? (awardsRaw as BackendAward[]) : []);
          setDocuments(Array.isArray(docsRaw) ? (docsRaw as BackendDocument[]) : []);
          setCalendarEvents(Array.isArray(calRaw) ? (calRaw as BackendCalendarEvent[]) : []);
          const injData = injRaw as { injured?: BackendInjury[] };
          setInjuries(injData?.injured ?? []);
          setTransfers(Array.isArray(transfRaw) ? (transfRaw as BackendTransfer[]) : []);
          setChemistry(Array.isArray(chemRaw) ? (chemRaw as BackendChemistry[]) : []);
          setMyContract((contractRaw as BackendContract) ?? null);
        } else {
          // No player linked — fetch org-wide data still
          const [calRaw, injRaw, transfRaw, chemRaw] = await Promise.all([
            clubApi.getCalendar().catch(() => []),
            clubApi.getInjuries().catch(() => ({ injured: [] })),
            clubApi.getTransfers().catch(() => []),
            clubApi.getChemistry().catch(() => []),
          ]);
          if (cancelled) return;
          setCalendarEvents(Array.isArray(calRaw) ? (calRaw as BackendCalendarEvent[]) : []);
          const injData = injRaw as { injured?: BackendInjury[] };
          setInjuries(injData?.injured ?? []);
          setTransfers(Array.isArray(transfRaw) ? (transfRaw as BackendTransfer[]) : []);
          setChemistry(Array.isArray(chemRaw) ? (chemRaw as BackendChemistry[]) : []);
        }

        setError(null);
      } catch (err) {
        if (!cancelled) setError(String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [user?.email, user?.playerId]);

  return {
    myPlayer,
    myPlayerId: resolvedPlayerId,
    squadPlayers,
    playerStats,
    matchStats,
    awards,
    documents,
    transfers,
    chemistry,
    calendarEvents,
    injuries,
    orgProfile,
    myContract,
    loading,
    error,
    refetchDocuments,
    refetchPlayer,
  };
}
