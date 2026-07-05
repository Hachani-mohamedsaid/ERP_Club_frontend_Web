/**
 * Central data hook for the Joueur role.
 * Fetches ALL backend data needed across every Joueur page.
 * Auto-seeds defaults on first load (handled by backend).
 */
import { useEffect, useState, useCallback } from "react";
import { clubApi } from "../lib/api/club";
import { joueurApi } from "../lib/api/joueur";
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
  yellowCards: number;
  redCards: number;
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
  createdAt?: string;
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
  refetchMedical: () => Promise<void>;
}

// ─── Normalizers (joueur-scoped API → shared shapes) ──────────────────────────

function normalizeJoueurInjuries(raw: unknown, playerName: string): BackendInjury[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, i) => {
    const row = item as Record<string, unknown>;
    return {
      id: String(row.id ?? `inj-${i}`),
      name: playerName,
      injury: String(row.type ?? row.injury ?? row.injuryType ?? ""),
      bodyPart: row.bodyPart != null ? String(row.bodyPart) : "",
      returnDate: String(row.returnDate ?? "—"),
      riskIA: Number(row.riskScore ?? row.riskIA ?? 0),
      createdAt:
        row.createdAt != null
          ? String(row.createdAt)
          : row.date != null
            ? String(row.date)
            : undefined,
    };
  });
}

function normalizeJoueurCalendar(raw: unknown): BackendCalendarEvent[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, i) => {
    const row = item as Record<string, unknown>;
    return {
      id: String(row.id ?? `ev-${i}`),
      title: String(row.title ?? ""),
      eventDate: String(row.eventDate ?? row.date ?? ""),
      eventTime: row.eventTime != null ? String(row.eventTime) : row.time != null ? String(row.time) : null,
      eventType: String(row.eventType ?? row.type ?? ""),
      location: row.location != null ? String(row.location) : null,
    };
  });
}

/**
 * Player calendar rules:
 * - Matches, training, recovery, meetings, scout: always visible (team schedule)
 * - Medical: only RDVs whose title mentions this player (e.g. "Bilan — ilbab")
 * - Hiding REUNION/SCOUT is deferred (optional later)
 */
function filterCalendarForJoueur(
  events: BackendCalendarEvent[],
  playerNames: string[],
): BackendCalendarEvent[] {
  const names = [...new Set(playerNames.map((n) => n.trim().toLowerCase()).filter(Boolean))];

  return events.filter((ev) => {
    const type = (ev.eventType ?? "").toUpperCase();
    if (type !== "MEDICAL") return true;
    if (names.length === 0) return false;
    const title = (ev.title ?? "").toLowerCase();
    return names.some((name) => title.includes(name));
  });
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

  const refetchMedical = useCallback(async () => {
    if (!resolvedPlayerId) return;
    const playerName = myPlayer?.name ?? user?.fullName ?? "";
    try {
      const [statsRaw, injRaw, calRaw] = await Promise.all([
        clubApi.getPlayerStats(resolvedPlayerId).catch(() => null),
        joueurApi.getInjuries().catch(() => []),
        joueurApi.getCalendar().catch(() => []),
      ]);
      setPlayerStats(statsRaw as PlayerStatsPayload | null);
      setInjuries(normalizeJoueurInjuries(injRaw, playerName));
      setCalendarEvents(
        filterCalendarForJoueur(normalizeJoueurCalendar(calRaw), [
          playerName,
          user?.fullName ?? "",
        ]),
      );
    } catch { /* non-blocking */ }
  }, [resolvedPlayerId, myPlayer?.name, user?.fullName]);

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

        // 2. Parallel fetch — injuries & calendar from joueur-scoped APIs (same ClubInjury / ClubCalendarEvent as doctor)
        if (pid) {
          const playerName = own?.name ?? user.fullName ?? "";
          const [statsRaw, matchRaw, awardsRaw, docsRaw, calRaw, injRaw, transfRaw, chemRaw, contractRaw] =
            await Promise.all([
              clubApi.getPlayerStats(pid).catch(() => null),
              clubApi.getMatchStats(pid).catch(() => []),
              clubApi.getAwards(pid).catch(() => []),
              clubApi.getDocuments(pid).catch(() => []),
              joueurApi.getCalendar().catch(() => []),
              joueurApi.getInjuries().catch(() => []),
              clubApi.getTransfers().catch(() => []),
              clubApi.getChemistry().catch(() => []),
              clubApi.getPlayerContract(pid).catch(() => null),
            ]);

          if (cancelled) return;

          setPlayerStats(statsRaw as PlayerStatsPayload | null);
          setMatchStats(Array.isArray(matchRaw) ? (matchRaw as BackendMatchStat[]) : []);
          setAwards(Array.isArray(awardsRaw) ? (awardsRaw as BackendAward[]) : []);
          setDocuments(Array.isArray(docsRaw) ? (docsRaw as BackendDocument[]) : []);
          setCalendarEvents(
            filterCalendarForJoueur(normalizeJoueurCalendar(calRaw), [
              playerName,
              user.fullName ?? "",
            ]),
          );
          setInjuries(normalizeJoueurInjuries(injRaw, playerName));
          setTransfers(Array.isArray(transfRaw) ? (transfRaw as BackendTransfer[]) : []);
          setChemistry(Array.isArray(chemRaw) ? (chemRaw as BackendChemistry[]) : []);
          setMyContract((contractRaw as BackendContract) ?? null);
        } else {
          setCalendarEvents([]);
          setInjuries([]);
          setTransfers([]);
          setChemistry([]);
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
    refetchMedical,
  };
}
