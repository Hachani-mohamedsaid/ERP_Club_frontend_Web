import type { BodyZone } from "../medical/BodyInjuryViewer";

export interface ClubHeatZone {
  id: string;
  label: string;
  count: number;
  severity: "low" | "medium" | "critical";
  players: string[];
  lastControl: string;
}

export const CLUB_HEAT_ZONES: ClubHeatZone[] = [
  { id: "knee-left", label: "Genou gauche", count: 2, severity: "critical", players: ["Karim Dridi"], lastControl: "18/06/2026" },
  { id: "knee-right", label: "Genou droit", count: 2, severity: "medium", players: [], lastControl: "12/06/2026" },
  { id: "groin", label: "Ischio-jambiers", count: 2, severity: "critical", players: ["Ahmed Ben Salah", "Mohamed Sassi"], lastControl: "19/06/2026" },
  { id: "ankle-right", label: "Cheville droite", count: 1, severity: "medium", players: ["Youssef Trabelsi"], lastControl: "17/06/2026" },
  { id: "shoulder-right", label: "Épaule droite", count: 1, severity: "low", players: [], lastControl: "05/06/2026" },
];

export const CLUB_BODY_ZONES: BodyZone[] = CLUB_HEAT_ZONES.map((z) => ({
  id: z.id,
  name: z.label,
  severity: z.severity,
  description: `${z.count} blessure${z.count > 1 ? "s" : ""}`,
  risk: z.severity === "critical" ? 78 : z.severity === "medium" ? 52 : 22,
  lastControl: z.lastControl,
  injuryInfo: z.players[0]
    ? { player: z.players[0], grade: "Grade II", risk: z.severity === "critical" ? 82 : 55, daysRemaining: 12 }
    : undefined,
}));
