// ── Scout Design Tokens ──────────────────────────────────────────────────────
export const S = {
  primary:  "#FF7A00",   // Orange – primary CTAs only
  success:  "#22C55E",   // Green  – validated, active, recruited
  warning:  "#F59E0B",   // Amber  – analysis, waiting
  danger:   "#EF4444",   // Red    – injury, risk, refusal
  info:     "#3B82F6",   // Blue   – general info
  accent:   "#6366F1",   // Indigo – scout identity, active menu, highlights
  muted:    "rgba(255,255,255,0.45)",
};

// ── Prospect Data ─────────────────────────────────────────────────────────────
export type Priority = "A" | "B" | "C";
export type WorkflowStatus = "new" | "analysis" | "validation" | "signature" | "done";

export interface Prospect {
  id: string;
  name: string;
  age: number;
  nationality: string;
  flag: string;
  club: string;
  league: string;
  position: string;
  potential: number;
  currentRating: number;
  marketValue: string;
  valueMK: number; // in thousands €
  priority: Priority;
  status: WorkflowStatus;
  aiScore: number;
  injuryRisk: number;
  foot: "Droit" | "Gauche" | "Les deux";
  height: number;
  weight: number;
  goals: number;
  assists: number;
  matches: number;
  speed: number;
  dribble: number;
  passing: number;
  defense: number;
  physical: number;
  mental: number;
  contractEnd: string;
  agent?: string;
  addedDate: string;
  notes: { date: string; text: string }[];
  matchHistory: { match: string; date: string; rating: number; goals: number; assists: number; minutes: number }[];
  monthlyPotential: number[]; // 6-month trend
  heatmapZones: { zone: string; intensity: number }[];
}

export const PROSPECTS: Prospect[] = [
  {
    id: "pr1", name: "Youssef Ben Ali", age: 17, nationality: "Tunisie", flag: "🇹🇳",
    club: "AS Ariana", league: "Ligue 2 TUN", position: "BU", potential: 89,
    currentRating: 74, marketValue: "1.2M €", valueMK: 1200, priority: "A",
    status: "validation", aiScore: 92, injuryRisk: 12, foot: "Droit",
    height: 183, weight: 76, goals: 18, assists: 6, matches: 28, contractEnd: "2027-06",
    agent: "Karim Boutaïeb",
    speed: 88, dribble: 84, passing: 72, defense: 42, physical: 80, mental: 81,
    addedDate: "2026-05-10",
    notes: [
      { date: "21/06", text: "Très bon match contre EST — accélération explosif. Suivi priorité." },
      { date: "14/06", text: "Entraînement observé. Technique au-dessus de la moyenne pour 17 ans." },
    ],
    matchHistory: [
      { match: "vs EST", date: "18/06", rating: 8.6, goals: 2, assists: 1, minutes: 90 },
      { match: "vs CSS", date: "14/06", rating: 8.1, goals: 1, assists: 0, minutes: 90 },
      { match: "vs CA",  date: "08/06", rating: 7.4, goals: 0, assists: 2, minutes: 75 },
      { match: "vs ST",  date: "02/06", rating: 8.7, goals: 3, assists: 0, minutes: 90 },
      { match: "vs ESZ", date: "28/05", rating: 7.8, goals: 1, assists: 1, minutes: 85 },
    ],
    monthlyPotential: [83, 84, 85, 86, 88, 89],
    heatmapZones: [
      { zone: "Attaque gauche",  intensity: 85 },
      { zone: "Axe central att.", intensity: 92 },
      { zone: "Attaque droite",  intensity: 60 },
      { zone: "Milieu offensif", intensity: 70 },
      { zone: "Milieu central",  intensity: 35 },
      { zone: "Défense",         intensity: 10 },
    ],
  },
  {
    id: "pr2", name: "Nader Trabelsi", age: 19, nationality: "Tunisie", flag: "🇹🇳",
    club: "Stade Tunisien", league: "Ligue 1 TUN", position: "MC", potential: 84,
    currentRating: 72, marketValue: "850K €", valueMK: 850, priority: "A",
    status: "analysis", aiScore: 85, injuryRisk: 22, foot: "Les deux",
    height: 178, weight: 72, goals: 8, assists: 14, matches: 30, contractEnd: "2026-12",
    agent: undefined,
    speed: 76, dribble: 80, passing: 88, defense: 65, physical: 74, mental: 83,
    addedDate: "2026-05-18",
    notes: [{ date: "10/06", text: "Vision de jeu exceptionnelle. Contrat expire décembre — opportunité à saisir vite." }],
    matchHistory: [
      { match: "vs CAB", date: "17/06", rating: 7.9, goals: 0, assists: 3, minutes: 90 },
      { match: "vs AS",  date: "11/06", rating: 7.5, goals: 1, assists: 1, minutes: 82 },
      { match: "vs ESZ", date: "05/06", rating: 8.2, goals: 0, assists: 2, minutes: 90 },
    ],
    monthlyPotential: [79, 80, 81, 82, 83, 84],
    heatmapZones: [
      { zone: "Attaque gauche",  intensity: 45 },
      { zone: "Axe central att.", intensity: 65 },
      { zone: "Attaque droite",  intensity: 40 },
      { zone: "Milieu offensif", intensity: 90 },
      { zone: "Milieu central",  intensity: 88 },
      { zone: "Défense",         intensity: 50 },
    ],
  },
  {
    id: "pr3", name: "Mouhamed Diallo", age: 21, nationality: "Côte d'Ivoire", flag: "🇨🇮",
    club: "AFAD Djékanou", league: "Ligue 1 CI", position: "Ailier G", potential: 81,
    currentRating: 71, marketValue: "750K €", valueMK: 750, priority: "B",
    status: "new", aiScore: 78, injuryRisk: 18, foot: "Gauche",
    height: 174, weight: 68, goals: 12, assists: 9, matches: 25, contractEnd: "2027-06",
    speed: 92, dribble: 88, passing: 74, defense: 48, physical: 72, mental: 75,
    addedDate: "2026-06-01",
    notes: [],
    matchHistory: [
      { match: "vs ASEC", date: "15/06", rating: 7.6, goals: 1, assists: 2, minutes: 90 },
      { match: "vs ASI",  date: "09/06", rating: 8.0, goals: 2, assists: 1, minutes: 90 },
    ],
    monthlyPotential: [77, 78, 79, 79, 80, 81],
    heatmapZones: [
      { zone: "Attaque gauche",  intensity: 94 },
      { zone: "Axe central att.", intensity: 50 },
      { zone: "Attaque droite",  intensity: 20 },
      { zone: "Milieu offensif", intensity: 72 },
      { zone: "Milieu central",  intensity: 28 },
      { zone: "Défense",         intensity: 8 },
    ],
  },
  {
    id: "pr4", name: "Karim Sassi", age: 22, nationality: "Tunisie", flag: "🇹🇳",
    club: "US Monastir", league: "Ligue 1 TUN", position: "DC", potential: 78,
    currentRating: 70, marketValue: "650K €", valueMK: 650, priority: "B",
    status: "signature", aiScore: 74, injuryRisk: 8, foot: "Droit",
    height: 190, weight: 85, goals: 3, assists: 1, matches: 24, contractEnd: "2028-06",
    speed: 68, dribble: 55, passing: 70, defense: 84, physical: 88, mental: 80,
    addedDate: "2026-04-20",
    notes: [{ date: "05/06", text: "Défenseur très solide. Grande taille, bonne lecture du jeu. Signature en cours." }],
    matchHistory: [
      { match: "vs CAB", date: "16/06", rating: 7.8, goals: 1, assists: 0, minutes: 90 },
      { match: "vs AS",  date: "10/06", rating: 7.4, goals: 0, assists: 0, minutes: 90 },
    ],
    monthlyPotential: [73, 74, 75, 76, 77, 78],
    heatmapZones: [
      { zone: "Attaque gauche",  intensity: 5 },
      { zone: "Axe central att.", intensity: 15 },
      { zone: "Attaque droite",  intensity: 5 },
      { zone: "Milieu offensif", intensity: 30 },
      { zone: "Milieu central",  intensity: 60 },
      { zone: "Défense",         intensity: 95 },
    ],
  },
  {
    id: "pr5", name: "Ali Messi", age: 20, nationality: "Algérie", flag: "🇩🇿",
    club: "JS Kabylie", league: "Ligue 1 DZ", position: "DG", potential: 76,
    currentRating: 68, marketValue: "550K €", valueMK: 550, priority: "C",
    status: "done", aiScore: 70, injuryRisk: 35, foot: "Gauche",
    height: 176, weight: 71, goals: 4, assists: 8, matches: 22, contractEnd: "2027-06",
    speed: 84, dribble: 78, passing: 76, defense: 72, physical: 75, mental: 70,
    addedDate: "2026-03-15",
    notes: [],
    matchHistory: [
      { match: "vs USMA", date: "14/06", rating: 7.1, goals: 0, assists: 1, minutes: 90 },
    ],
    monthlyPotential: [71, 72, 73, 74, 75, 76],
    heatmapZones: [
      { zone: "Attaque gauche",  intensity: 80 },
      { zone: "Axe central att.", intensity: 30 },
      { zone: "Attaque droite",  intensity: 10 },
      { zone: "Milieu offensif", intensity: 55 },
      { zone: "Milieu central",  intensity: 48 },
      { zone: "Défense",         intensity: 75 },
    ],
  },
  {
    id: "pr6", name: "Ibrahim Touré", age: 19, nationality: "Sénégal", flag: "🇸🇳",
    club: "Génération Foot", league: "Elite 1 SN", position: "MC", potential: 86,
    currentRating: 72, marketValue: "900K €", valueMK: 900, priority: "A",
    status: "analysis", aiScore: 88, injuryRisk: 14, foot: "Droit",
    height: 180, weight: 74, goals: 6, assists: 11, matches: 27, contractEnd: "2027-06",
    agent: "Samba Diallo Agency",
    speed: 82, dribble: 85, passing: 86, defense: 62, physical: 78, mental: 82,
    addedDate: "2026-05-25",
    notes: [{ date: "18/06", text: "Formation Génération Foot — lié à FC Metz. Profil pré-Europe. Budget nécessaire ~1M." }],
    matchHistory: [
      { match: "vs Jaraaf", date: "17/06", rating: 8.4, goals: 1, assists: 2, minutes: 90 },
      { match: "vs Diaraf",  date: "11/06", rating: 8.0, goals: 0, assists: 3, minutes: 90 },
    ],
    monthlyPotential: [80, 81, 83, 84, 85, 86],
    heatmapZones: [
      { zone: "Attaque gauche",  intensity: 50 },
      { zone: "Axe central att.", intensity: 75 },
      { zone: "Attaque droite",  intensity: 55 },
      { zone: "Milieu offensif", intensity: 88 },
      { zone: "Milieu central",  intensity: 85 },
      { zone: "Défense",         intensity: 40 },
    ],
  },
];

export const WORKFLOW_COLS: { id: WorkflowStatus; label: string; color: string; bg: string }[] = [
  { id: "new",        label: "Nouveau",    color: "#3B82F6", bg: "rgba(59,130,246,0.1)" },
  { id: "analysis",   label: "Analyse",    color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  { id: "validation", label: "Validation", color: "#8B5CF6", bg: "rgba(139,92,246,0.1)" },
  { id: "signature",  label: "Signature",  color: "#FF7A00", bg: "rgba(255,122,0,0.1)"  },
  { id: "done",       label: "Terminé",    color: "#22C55E", bg: "rgba(34,197,94,0.1)"  },
];

export const PRIORITY_META: Record<Priority, { color: string; bg: string; label: string }> = {
  A: { color: "#EF4444", bg: "rgba(239,68,68,0.14)",  label: "Priorité A — Critique" },
  B: { color: "#F59E0B", bg: "rgba(245,158,11,0.14)", label: "Priorité B — Suivi actif" },
  C: { color: "#3B82F6", bg: "rgba(59,130,246,0.14)", label: "Priorité C — Surveillance" },
};
