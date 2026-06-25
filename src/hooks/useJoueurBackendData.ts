/**
 * Fetches real backend data for the Joueur role.
 * All data is fetched with the bearer token from localStorage (set on login).
 * Falls back to empty arrays / null on network failure so mock data keeps working.
 */
import { useEffect, useState } from "react";
import { clubApi } from "../lib/api/club";
import { useAuth } from "../contexts/AuthContext";

export interface BackendPlayer {
  id: string;
  name: string;
  position: string;
  age: number;
  ovr: number;
  goals: number;
  marketValue: string;
  contract: { salary: string };
  availability: string;
  hasAccount: boolean;
  accountEmail: string | null;
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
  squadPlayers: BackendPlayer[];
  calendarEvents: BackendCalendarEvent[];
  injuries: BackendInjury[];
  loading: boolean;
  error: string | null;
}

export function useJoueurBackendData(): JoueurBackendData {
  const { user } = useAuth();
  const [myPlayer, setMyPlayer] = useState<BackendPlayer | null>(null);
  const [squadPlayers, setSquadPlayers] = useState<BackendPlayer[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<BackendCalendarEvent[]>([]);
  const [injuries, setInjuries] = useState<BackendInjury[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== "joueur") return;

    let cancelled = false;
    setLoading(true);

    Promise.all([
      clubApi.getPlayers().catch(() => []),
      clubApi.getCalendar().catch(() => []),
      clubApi.getInjuries().catch(() => ({ injured: [] })),
    ])
      .then(([playersRaw, calRaw, injRaw]) => {
        if (cancelled) return;

        const players = (Array.isArray(playersRaw) ? playersRaw : []) as BackendPlayer[];
        setSquadPlayers(players);

        // Identify the current joueur's own player record
        const own =
          players.find((p) => p.id === user.playerId) ??
          players.find((p) => p.name.trim().toLowerCase() === (user.fullName ?? "").trim().toLowerCase()) ??
          null;
        setMyPlayer(own);

        const events = (Array.isArray(calRaw) ? calRaw : []) as BackendCalendarEvent[];
        setCalendarEvents(events);

        const injData = injRaw as { injured?: BackendInjury[] };
        setInjuries(injData?.injured ?? []);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [user?.email, user?.playerId]);

  return { myPlayer, squadPlayers, calendarEvents, injuries, loading, error };
}
