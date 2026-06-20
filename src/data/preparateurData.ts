export const PREP_INFO = {
  name: "Hichem Mansouri",
  club: "FC Carthage",
  season: "2026",
};

export type LoadStatus = "normal" | "warning" | "critical";

export interface PlayerLoad {
  id: string;
  name: string;
  position: string;
  charge: number;
  fatigue: number;
  recovery: number;
  status: LoadStatus;
  availability: string;
}

export interface PhysicalProfile {
  id: string;
  name: string;
  speed: number;
  endurance: number;
  force: number;
  explosivity: number;
  agility: number;
  recovery: number;
  evolution: { month: string; speed: number; endurance: number }[];
}

export type ProgramStatus = "brouillon" | "envoye" | "valide" | "refuse";

export interface PlayerDetail {
  id: string;
  name: string;
  age: number;
  weight: string;
  height: string;
  position: string;
  weekCharge: number;
  injuryHistory: { date: string; injury: string; status: string }[];
  activePrograms: string[];
  lastMatch: { opponent: string; date: string; rating: number };
  availability: string;
  charge: number;
  fatigue: number;
  recovery: number;
}

export interface SessionHistoryEntry {
  id: string;
  date: string;
  type: string;
  duration: string;
  intensity: string;
  players: number;
  status: "Terminé" | "Annulé" | "Planifié";
}

export interface MatchReadinessEntry {
  id: string;
  name: string;
  fitness: number;
  fatigue: number;
  risk: number;
  ready: boolean;
}

export interface PrepNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type: "fatigue" | "coach" | "medical" | "programme";
}

export interface TrainingProgram {
  id: string;
  name: string;
  objective: string;
  duration: string;
  intensity: "Basse" | "Moyenne" | "Haute";
  assignedPlayers: string[];
  createdAt: string;
  status: ProgramStatus;
}

export interface CalendarSession {
  id: string;
  title: string;
  type: "cardio" | "force" | "repos" | "vitesse" | "match" | "mobilite";
  intensity: string;
}

export type WeekDay = "Lundi" | "Mardi" | "Mercredi" | "Jeudi" | "Vendredi";

export const PREP_KPIS = [
  { label: "Joueurs disponibles", value: 24, suffix: "", color: "#22C55E" },
  { label: "Charge moyenne", value: 72, suffix: "%", color: "#6366F1" },
  { label: "Fatigue élevée", value: 5, suffix: " joueurs", color: "#F59E0B" },
  { label: "Risque blessure", value: 3, suffix: " joueurs", color: "#EF4444" },
];

export const TEAM_LOAD_7_DAYS = [
  { day: "Lun", load: 68 }, { day: "Mar", load: 74 }, { day: "Mer", load: 71 },
  { day: "Jeu", load: 78 }, { day: "Ven", load: 82 }, { day: "Sam", load: 65 }, { day: "Dim", load: 45 },
];

export const PREP_ALERTS = [
  { id: "1", player: "Ahmed Ben Salah", message: "Fatigue élevée", severity: "critical" as const, time: "09:12" },
  { id: "2", player: "Karim Dridi", message: "Risque musculaire", severity: "warning" as const, time: "08:45" },
  { id: "3", player: "Ali Mansouri", message: "Retour blessure — charge modérée", severity: "info" as const, time: "07:30" },
];

export const PLAYER_LOAD: PlayerLoad[] = [
  { id: "1", name: "Ahmed Ben Salah", position: "BU", charge: 92, fatigue: 85, recovery: 40, status: "critical", availability: "Limité" },
  { id: "2", name: "Ali Mansouri", position: "AG", charge: 68, fatigue: 20, recovery: 90, status: "normal", availability: "Disponible" },
  { id: "3", name: "Youssef Trabelsi", position: "MOC", charge: 55, fatigue: 35, recovery: 75, status: "normal", availability: "Blessé" },
  { id: "4", name: "Mohamed Sassi", position: "AD", charge: 78, fatigue: 62, recovery: 55, status: "warning", availability: "Disponible" },
  { id: "5", name: "Karim Dridi", position: "MC", charge: 88, fatigue: 78, recovery: 42, status: "critical", availability: "Disponible" },
  { id: "6", name: "Sami Bouazizi", position: "MC", charge: 72, fatigue: 45, recovery: 68, status: "normal", availability: "Disponible" },
  { id: "7", name: "Ridha Ammar", position: "DD", charge: 65, fatigue: 38, recovery: 82, status: "normal", availability: "Disponible" },
  { id: "8", name: "Haddad", position: "GB", charge: 58, fatigue: 25, recovery: 88, status: "normal", availability: "Disponible" },
];

export const PHYSICAL_PROFILES: PhysicalProfile[] = [
  {
    id: "1", name: "Ahmed Ben Salah", speed: 88, endurance: 82, force: 85, explosivity: 90, agility: 84, recovery: 62,
    evolution: [
      { month: "Mars", speed: 84, endurance: 78 }, { month: "Avr", speed: 86, endurance: 80 },
      { month: "Mai", speed: 87, endurance: 81 }, { month: "Juin", speed: 88, endurance: 82 },
    ],
  },
  {
    id: "2", name: "Ali Mansouri", speed: 85, endurance: 88, force: 78, explosivity: 82, agility: 86, recovery: 91,
    evolution: [
      { month: "Mars", speed: 82, endurance: 85 }, { month: "Avr", speed: 83, endurance: 86 },
      { month: "Mai", speed: 84, endurance: 87 }, { month: "Juin", speed: 85, endurance: 88 },
    ],
  },
  {
    id: "4", name: "Mohamed Sassi", speed: 90, endurance: 75, force: 72, explosivity: 88, agility: 89, recovery: 70,
    evolution: [
      { month: "Mars", speed: 87, endurance: 72 }, { month: "Avr", speed: 88, endurance: 73 },
      { month: "Mai", speed: 89, endurance: 74 }, { month: "Juin", speed: 90, endurance: 75 },
    ],
  },
  {
    id: "5", name: "Karim Dridi", speed: 78, endurance: 85, force: 88, explosivity: 75, agility: 76, recovery: 58,
    evolution: [
      { month: "Mars", speed: 76, endurance: 82 }, { month: "Avr", speed: 77, endurance: 83 },
      { month: "Mai", speed: 77, endurance: 84 }, { month: "Juin", speed: 78, endurance: 85 },
    ],
  },
];

export interface InjuryRiskEntry {
  id: string;
  name: string;
  zone: string;
  risk: number;
  recommendation: string[];
  medicalComment?: string;
  medicalAuthor?: string;
}

export const INJURY_RISKS: InjuryRiskEntry[] = [
  { id: "1", name: "Ahmed Ben Salah", zone: "Hamstring", risk: 82, recommendation: ["Réduire charge 20%", "Repos 48h", "Cryothérapie"], medicalComment: "Repos obligatoire 72h. Pas de sprint.", medicalAuthor: "Dr. Amira Khelifi" },
  { id: "5", name: "Karim Dridi", zone: "Genou", risk: 58, recommendation: ["Renforcement proprioception", "Charge -15%", "Suivi médecin"], medicalComment: "Proprioception quotidienne. Éviter changements de direction.", medicalAuthor: "Dr. Amira Khelifi" },
  { id: "3", name: "Youssef Trabelsi", zone: "Cheville", risk: 45, recommendation: ["Réathlétisation progressive", "Pas de sprint"], medicalComment: "Pas de contact. Course linéaire uniquement.", medicalAuthor: "Dr. Amira Khelifi" },
  { id: "4", name: "Mohamed Sassi", zone: "Dos", risk: 38, recommendation: ["Mobilité lombaire", "Étirements quotidiens"] },
];

export const PLAYER_DETAILS: PlayerDetail[] = [
  { id: "1", name: "Ahmed Ben Salah", age: 24, weight: "78 kg", height: "1.84 m", position: "BU", weekCharge: 92, injuryHistory: [{ date: "2026", injury: "Hamstring Grade II", status: "En cours" }, { date: "2025", injury: "Entorse cheville", status: "Récupéré" }], activePrograms: ["Pré-saison", "Explosivité attaquants"], lastMatch: { opponent: "EST", date: "15/06/2026", rating: 8.5 }, availability: "Limité", charge: 92, fatigue: 85, recovery: 40 },
  { id: "2", name: "Ali Mansouri", age: 26, weight: "72 kg", height: "1.78 m", position: "AG", weekCharge: 68, injuryHistory: [], activePrograms: ["Pré-saison"], lastMatch: { opponent: "CA", date: "08/06/2026", rating: 7.8 }, availability: "Disponible", charge: 68, fatigue: 20, recovery: 90 },
  { id: "3", name: "Youssef Trabelsi", age: 23, weight: "74 kg", height: "1.80 m", position: "MOC", weekCharge: 55, injuryHistory: [{ date: "2026", injury: "Entorse cheville", status: "Rééducation" }], activePrograms: ["Retour blessure"], lastMatch: { opponent: "CSS", date: "01/06/2026", rating: 6.5 }, availability: "Blessé", charge: 55, fatigue: 35, recovery: 75 },
  { id: "4", name: "Mohamed Sassi", age: 22, weight: "70 kg", height: "1.76 m", position: "AD", weekCharge: 78, injuryHistory: [{ date: "2026", injury: "Lombalgie légère", status: "Surveillance" }], activePrograms: ["Explosivité attaquants"], lastMatch: { opponent: "EST", date: "15/06/2026", rating: 7.2 }, availability: "Disponible", charge: 78, fatigue: 62, recovery: 55 },
  { id: "5", name: "Karim Dridi", age: 27, weight: "76 kg", height: "1.81 m", position: "MC", weekCharge: 88, injuryHistory: [{ date: "2026", injury: "Genou — légère", status: "Surveillance" }], activePrograms: ["Pré-saison"], lastMatch: { opponent: "CA", date: "08/06/2026", rating: 7.0 }, availability: "Disponible", charge: 88, fatigue: 78, recovery: 42 },
  { id: "6", name: "Sami Bouazizi", age: 25, weight: "73 kg", height: "1.79 m", position: "MC", weekCharge: 72, injuryHistory: [], activePrograms: [], lastMatch: { opponent: "CSS", date: "01/06/2026", rating: 7.5 }, availability: "Disponible", charge: 72, fatigue: 45, recovery: 68 },
  { id: "7", name: "Ridha Ammar", age: 28, weight: "75 kg", height: "1.82 m", position: "DD", weekCharge: 65, injuryHistory: [], activePrograms: [], lastMatch: { opponent: "EST", date: "15/06/2026", rating: 7.3 }, availability: "Disponible", charge: 65, fatigue: 38, recovery: 82 },
  { id: "8", name: "Haddad", age: 30, weight: "82 kg", height: "1.88 m", position: "GB", weekCharge: 58, injuryHistory: [], activePrograms: [], lastMatch: { opponent: "CA", date: "08/06/2026", rating: 7.6 }, availability: "Disponible", charge: 58, fatigue: 25, recovery: 88 },
];

export function getPlayerDetail(id: string): PlayerDetail | undefined {
  return PLAYER_DETAILS.find((p) => p.id === id);
}

export const SESSION_HISTORY: SessionHistoryEntry[] = [
  { id: "h1", date: "18/06/2026", type: "Cardio", duration: "60 min", intensity: "Moyenne", players: 24, status: "Terminé" },
  { id: "h2", date: "17/06/2026", type: "Force", duration: "75 min", intensity: "Haute", players: 22, status: "Terminé" },
  { id: "h3", date: "16/06/2026", type: "Vitesse", duration: "45 min", intensity: "Haute", players: 18, status: "Terminé" },
  { id: "h4", date: "15/06/2026", type: "Match", duration: "90 min", intensity: "Max", players: 18, status: "Terminé" },
  { id: "h5", date: "14/06/2026", type: "Mobilité", duration: "40 min", intensity: "Basse", players: 26, status: "Terminé" },
  { id: "h6", date: "20/06/2026", type: "Cardio", duration: "55 min", intensity: "Moyenne", players: 24, status: "Planifié" },
];

export const MATCH_READINESS: MatchReadinessEntry[] = [
  { id: "1", name: "Ahmed Ben Salah", fitness: 92, fatigue: 85, risk: 82, ready: false },
  { id: "2", name: "Ali Mansouri", fitness: 90, fatigue: 20, risk: 10, ready: true },
  { id: "3", name: "Youssef Trabelsi", fitness: 55, fatigue: 35, risk: 45, ready: false },
  { id: "4", name: "Mohamed Sassi", fitness: 88, fatigue: 62, risk: 38, ready: true },
  { id: "5", name: "Karim Dridi", fitness: 85, fatigue: 78, risk: 58, ready: false },
  { id: "6", name: "Sami Bouazizi", fitness: 82, fatigue: 45, risk: 22, ready: true },
  { id: "7", name: "Ridha Ammar", fitness: 86, fatigue: 38, risk: 15, ready: true },
  { id: "8", name: "Haddad", fitness: 84, fatigue: 25, risk: 8, ready: true },
];

export const AI_DASHBOARD_RECOMMENDATIONS = [
  "Réduire charge défenseurs de 10%",
  "Prévoir récupération active jeudi",
  "Risque musculaire élevé — Ahmed & Karim",
];

export const PROGRAM_STATUS_CONFIG: Record<ProgramStatus, { label: string; color: string }> = {
  brouillon: { label: "Brouillon", color: "#6366F1" },
  envoye: { label: "Envoyé Coach", color: "#F59E0B" },
  valide: { label: "Validé", color: "#22C55E" },
  refuse: { label: "Refusé", color: "#EF4444" },
};

export const TRAINING_PROGRAMS: TrainingProgram[] = [
  { id: "p1", name: "Pré-saison", objective: "Base aérobie + force générale", duration: "4 semaines", intensity: "Haute", assignedPlayers: ["Ahmed Ben Salah", "Ali Mansouri", "Karim Dridi"], createdAt: "01/06/2026", status: "valide" },
  { id: "p2", name: "Retour blessure", objective: "Réathlétisation progressive", duration: "3 semaines", intensity: "Moyenne", assignedPlayers: ["Youssef Trabelsi"], createdAt: "10/06/2026", status: "envoye" },
  { id: "p3", name: "Explosivité attaquants", objective: "Sprint + pliométrie", duration: "2 semaines", intensity: "Haute", assignedPlayers: ["Mohamed Sassi", "Ahmed Ben Salah"], createdAt: "15/06/2026", status: "brouillon" },
];

export const DEFAULT_WEEK_SCHEDULE: Record<WeekDay, CalendarSession[]> = {
  Lundi: [{ id: "s1", title: "Cardio", type: "cardio", intensity: "Modérée" }],
  Mardi: [{ id: "s2", title: "Force", type: "force", intensity: "Haute" }],
  Mercredi: [{ id: "s3", title: "Repos actif", type: "repos", intensity: "Basse" }],
  Jeudi: [{ id: "s4", title: "Vitesse", type: "vitesse", intensity: "Haute" }],
  Vendredi: [{ id: "s5", title: "Match", type: "match", intensity: "Max" }],
};

export const SESSION_PALETTE: CalendarSession[] = [
  { id: "pal1", title: "Cardio", type: "cardio", intensity: "Modérée" },
  { id: "pal2", title: "Force", type: "force", intensity: "Haute" },
  { id: "pal3", title: "Repos", type: "repos", intensity: "Basse" },
  { id: "pal4", title: "Vitesse", type: "vitesse", intensity: "Haute" },
  { id: "pal5", title: "Mobilité", type: "mobilite", intensity: "Basse" },
  { id: "pal6", title: "Match", type: "match", intensity: "Max" },
];

export const SESSION_COLORS: Record<CalendarSession["type"], string> = {
  cardio: "#3B82F6", force: "#EF4444", repos: "#22C55E", vitesse: "#F59E0B", match: "#FF6B57", mobilite: "#6366F1",
};

export const REPORT_HISTORY = [
  { id: "r1", player: "Ahmed Ben Salah", date: "18/06/2026", type: "Hebdomadaire", charge: 92, fatigue: 85 },
  { id: "r2", player: "Ali Mansouri", date: "18/06/2026", type: "Hebdomadaire", charge: 68, fatigue: 20 },
  { id: "r3", player: "Karim Dridi", date: "17/06/2026", type: "Risque blessure", charge: 88, fatigue: 78 },
  { id: "r4", player: "Équipe", date: "15/06/2026", type: "Synthèse mensuelle", charge: 72, fatigue: 48 },
];

export const PREP_NOTIFICATIONS: PrepNotification[] = [
  { id: "n1", title: "Fatigue critique", message: "Ahmed Ben Salah dépasse fatigue 85%", time: "09:12", unread: true, type: "fatigue" },
  { id: "n2", title: "Programme validé", message: "Coach a validé le programme Pré-saison", time: "08:30", unread: true, type: "coach" },
  { id: "n3", title: "Alerte médicale", message: "Médecin a signalé blessure hamstring — Ahmed", time: "07:45", unread: true, type: "medical" },
  { id: "n4", title: "Charge équipe", message: "Charge équipe +8% vs semaine dernière", time: "Hier", unread: false, type: "programme" },
  { id: "n5", title: "Rapport généré", message: "Rapport hebdomadaire disponible", time: "Hier", unread: false, type: "programme" },
];

export const AI_PREP_QUESTIONS = [
  "Qui risque une blessure ?",
  "Qui est prêt pour jouer ?",
  "Qui doit récupérer ?",
  "Quel joueur progresse ?",
];

export function getPrepAIResponse(q: string): string {
  const lower = q.toLowerCase();
  if (lower.includes("blessure") || lower.includes("risque")) {
    return "Ahmed Ben Salah présente un risque musculaire de 82% (hamstring). Karim Dridi à 58% (genou). Recommandation : réduire charge Ahmed de 20%, repos 48h, cryothérapie.";
  }
  if (lower.includes("prêt") || lower.includes("jouer")) {
    return "Prêts match : Ali Mansouri (recovery 90%), Ridha Ammar (82%), Haddad (88%). Ahmed limité — charge max 60%. Youssef Trabelsi non disponible.";
  }
  if (lower.includes("récupér") || lower.includes("recuper")) {
    return "Priorité récupération : Ahmed Ben Salah, Karim Dridi, Mohamed Sassi. Protocole : repos actif, cryo, sommeil 9h, hydratation renforcée.";
  }
  if (lower.includes("progresse")) {
    return "Meilleure progression : Ali Mansouri (+6% endurance sur 3 mois), Mohamed Sassi (+3% vitesse). Ahmed en baisse temporaire (-4% recovery) post-blessure.";
  }
  return "Analyse effectif FC Carthage : charge moyenne 72%, 5 joueurs fatigue élevée, 3 à risque. Consultez Charge Équipe pour actions.";
}

export function getStatusBadge(status: LoadStatus) {
  const map = {
    normal: { label: "Normal", color: "#22C55E", emoji: "🟢" },
    warning: { label: "Attention", color: "#F59E0B", emoji: "🟠" },
    critical: { label: "Critique", color: "#EF4444", emoji: "🔴" },
  };
  return map[status];
}

export function getRiskColor(risk: number) {
  if (risk >= 60) return "#EF4444";
  if (risk >= 30) return "#F59E0B";
  return "#22C55E";
}
