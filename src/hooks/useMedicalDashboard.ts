import { useCallback, useEffect, useState } from "react";
import { clubApi } from "../lib/api/club";
import { apiFetch } from "../lib/api/authHeaders";
import { parseApiError } from "../lib/api/config";
import { normalizeInjuryData, type InjuryRow } from "../lib/injuryNormalize";

export interface MedicalDashboardKpis {
  injured: number;
  available: number;
  avgRisk: number;
}

export interface MedicalPlayer {
  id: string;
  fullName: string;
  position: string;
  status?: string;
}

export interface MedicalCalendarEvent {
  id?: string;
  title?: string;
  name?: string;
  eventDate: string;
  eventType?: string;
  location?: string | null;
  player?: string;
}

export interface MedicalPriority {
  player: string;
  position: string;
  reason: string;
  type: "danger" | "warning";
  action: string;
}

export interface MedicalAlert {
  message: string;
  type: "danger" | "warning" | "success";
}

function normalizePlayers(raw: unknown): MedicalPlayer[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, i) => {
    const row = item as Record<string, unknown>;
    return {
      id: String(row.id ?? `player-${i}`),
      fullName: String(row.fullName ?? row.name ?? ""),
      position: String(row.position ?? ""),
      status: row.status != null ? String(row.status) : undefined,
    };
  });
}

function getTodayFormats(): { iso: string; fr: string } {
  const now = new Date();
  return {
    iso: now.toISOString().split("T")[0],
    fr: now.toLocaleDateString("fr-FR"),
  };
}

function normalizeEventDate(dateRaw: unknown): string {
  if (typeof dateRaw === "string") {
    if (dateRaw.includes("/")) return dateRaw;
    return dateRaw.split("T")[0];
  }
  if (dateRaw instanceof Date) return dateRaw.toISOString().split("T")[0];
  return "";
}

function isTodayEvent(eventDate: string, today: { iso: string; fr: string }): boolean {
  const normalized = normalizeEventDate(eventDate);
  if (normalized === today.iso || normalized === today.fr) return true;
  if (normalized.includes("/")) {
    const parts = normalized.split("/").map(Number);
    if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
      const [day, month, year] = parts;
      const isoFromFr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      return isoFromFr === today.iso;
    }
  }
  return false;
}

function filterTodayEvents(raw: unknown): MedicalCalendarEvent[] {
  const today = getTodayFormats();
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      const row = item as Record<string, unknown>;
      return {
        id: row.id != null ? String(row.id) : undefined,
        title: row.title != null ? String(row.title) : undefined,
        name: row.name != null ? String(row.name) : undefined,
        eventDate: normalizeEventDate(row.eventDate),
        eventType: row.eventType != null ? String(row.eventType) : undefined,
        location: row.location != null ? String(row.location) : null,
        player: row.player != null ? String(row.player) : undefined,
      };
    })
    .filter((event) => isTodayEvent(event.eventDate, today));
}

async function fetchCalendar(): Promise<unknown> {
  const response = await apiFetch("/club/calendar");
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json();
}

function parseReturnDate(returnDate: string): Date | null {
  if (!returnDate || returnDate === "—") return null;
  if (returnDate.includes("/")) {
    const parts = returnDate.split("/").map(Number);
    if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
      const [day, month, year] = parts;
      return new Date(year, month - 1, day);
    }
  }
  const isoMatch = returnDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch.map(Number);
    return new Date(year, month - 1, day);
  }
  const parsed = new Date(returnDate);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function injuryDaysRemaining(returnDate: string): number | null {
  const target = parseReturnDate(returnDate);
  if (!target) return null;
  const diff = target.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function findPlayerPosition(playerName: string, players: MedicalPlayer[]): string {
  const key = playerName.trim().toLowerCase();
  const match = players.find((player) => player.fullName.trim().toLowerCase() === key);
  return match?.position?.trim() || "—";
}

function countHighRiskPlayers(injured: InjuryRow[]): number {
  const players = new Set<string>();
  for (const injury of injured) {
    if (injury.riskIA >= 7) {
      players.add(injury.name.trim().toLowerCase());
    }
  }
  return players.size;
}

function buildPriorities(injured: InjuryRow[], players: MedicalPlayer[]): MedicalPriority[] {
  const items: MedicalPriority[] = [];

  for (const injury of injured) {
    const position = findPlayerPosition(injury.name, players);

    if (injury.riskIA >= 7) {
      items.push({
        player: injury.name,
        position,
        reason: injury.injury,
        type: "danger",
        action: "Évaluation clinique",
      });
    }

    const days = injuryDaysRemaining(injury.returnDate);
    if (days !== null && days <= 3 && days >= 0) {
      items.push({
        player: injury.name,
        position,
        reason: injury.injury,
        type: "warning",
        action: "Test de reprise",
      });
    }
  }

  return items.sort((a, b) => {
    if (a.type === b.type) return 0;
    return a.type === "danger" ? -1 : 1;
  });
}

function buildAlerts(injured: InjuryRow[]): MedicalAlert[] {
  const alerts: MedicalAlert[] = [];

  for (const injury of injured) {
    const days = injuryDaysRemaining(injury.returnDate);
    if (days === 0) {
      alerts.push({
        message: `Retour prévu aujourd'hui — ${injury.name} (${injury.injury})`,
        type: "warning",
      });
    }
    if (injury.riskIA >= 7) {
      alerts.push({
        message: `Risque élevé détecté — ${injury.name} (${injury.injury})`,
        type: "danger",
      });
    }
  }

  if (alerts.length === 0) {
    return [{ message: "Aucune alerte médicale aujourd'hui", type: "success" }];
  }

  return alerts;
}

export function useMedicalDashboard() {
  const [kpis, setKpis] = useState<MedicalDashboardKpis>({
    injured: 0,
    available: 0,
    avgRisk: 0,
  });
  const [injured, setInjured] = useState<InjuryRow[]>([]);
  const [players, setPlayers] = useState<MedicalPlayer[]>([]);
  const [todayEvents, setTodayEvents] = useState<MedicalCalendarEvent[]>([]);
  const [highRiskCount, setHighRiskCount] = useState(0);
  const [priorities, setPriorities] = useState<MedicalPriority[]>([]);
  const [alerts, setAlerts] = useState<MedicalAlert[]>([
    { message: "Aucune alerte médicale aujourd'hui", type: "success" },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [injuriesRes, playersRes, calendarRes] = await Promise.all([
        clubApi.getInjuries(),
        clubApi.getPlayers(),
        fetchCalendar(),
      ]);
      const normalized = normalizeInjuryData(injuriesRes);
      const normalizedPlayers = normalizePlayers(playersRes);
      const eventsToday = filterTodayEvents(calendarRes);

      setKpis(normalized.kpis);
      setInjured(normalized.injured);
      setPlayers(normalizedPlayers);
      setTodayEvents(eventsToday);
      setHighRiskCount(countHighRiskPlayers(normalized.injured));
      setPriorities(buildPriorities(normalized.injured, normalizedPlayers));
      setAlerts(buildAlerts(normalized.injured));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    kpis,
    injured,
    players,
    todayEvents,
    highRiskCount,
    priorities,
    alerts,
    loading,
    error,
  };
}
