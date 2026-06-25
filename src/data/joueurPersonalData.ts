import { getPlayerById } from "./joueurMockData";

/** Cutout joueur PNG transparent — carte FUT */
export const PLAYER_CUTOUT_URL: string | null = "/images/player-cutout.png";

export const STADIUM_BG_URL =
  "https://images.unsplash.com/photo-1459865264687-5955966577e7?w=1200&h=500&fit=crop";

export const TRAINING_LOAD_WEEK = {
  load: 85,
  fatiguePredicted: 72,
  sessionsCompleted: 4,
  sessionsTotal: 5,
  intensity: "Élevée" as const,
};

export const LAST_MATCH_RATINGS = [
  { opponent: "EST", rating: 8.5, goals: 2, date: "15/06" },
  { opponent: "CA",  rating: 7.2, goals: 1, date: "08/06" },
  { opponent: "CSS", rating: 7.8, goals: 0, date: "01/06" },
];

export const CURRENT_PLAYER_ID = "1";

export const PLAYER_ID_BY_EMAIL: Record<string, string> = {
  "joueur@club.com": "1",
};

export function getPlayerIdForEmail(email: string): string {
  return PLAYER_ID_BY_EMAIL[email.toLowerCase()] ?? CURRENT_PLAYER_ID;
}

export const NEXT_MATCH = {
  opponent: "EST",
  home: "FC Carthage",
  away: "EST",
  homeShort: "FCC",
  awayShort: "EST",
  homeColor: "#FF6B57",
  awayColor: "#E11D48",
  label: "FC Carthage vs EST",
  competition: "Ligue 1 · J26",
  stadium: "Stade Olympique de Radès",
  daysUntil: 2,
  date: "21/06/2026",
  time: "20:00",
  starterProbability: 92,
  targetDate: new Date("2026-06-21T20:00:00"),
};

export const DASHBOARD_HERO = {
  formLabel: "Forme Excellente",
  coachRating: 8.7,
  formScore: 92,
  positionRanking: 2,
  positionLabel: "Attaquant",
  marketValue: "2.3M €",
  marketTrend: "+15%",
};

export const SEASON_OBJECTIVES = {
  goals: { current: 15, target: 20 },
  assists: { current: 8, target: 12 },
  minutes: { current: 2140, target: 2700 },
};

export const OVR_PROGRESSION = [
  { month: "Fév", ovr: 83 },
  { month: "Mar", ovr: 84 },
  { month: "Avr", ovr: 85 },
  { month: "Mai", ovr: 86 },
  { month: "Jun", ovr: 87 },
];

export const PLAYER_REWARDS = [
  { id: "1", icon: "🏅", titleKey: "playerOfMonth" as const, color: "#FF6B57" },
  { id: "2", icon: "⚽", titleKey: "topScorer" as const, color: "#22C55E" },
  { id: "3", icon: "🔥", titleKey: "winStreak" as const, color: "#F59E0B" },
];

export const GOAL_CONTRIBUTION = [
  { name: "Buts", value: 15, color: "#FF6B57" },
  { name: "Assists", value: 8, color: "#3B82F6" },
  { name: "Passes clés", value: 24, color: "#22C55E" },
];

export const MATCH_RATINGS = [
  { label: "M1", rating: 8.4 },
  { label: "M2", rating: 7.9 },
  { label: "M3", rating: 9.1 },
  { label: "M4", rating: 8.7 },
  { label: "M5", rating: 8.2 },
  { label: "M6", rating: 7.6 },
  { label: "M7", rating: 8.8 },
  { label: "M8", rating: 8.4 },
  { label: "M9", rating: 9.0 },
  { label: "M10", rating: 7.8 },
];

export const VIDEO_HIGHLIGHT = {
  title: "FC Carthage vs EST — Highlights",
  duration: "4:32",
  thumbnail: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=640&h=360&fit=crop",
  views: "2.4K",
};

export type HeatmapPeriod = "season" | "lastMatch" | "5matches" | "10matches";

export interface HeatBlob {
  id: string;
  x: number;
  y: number;
  intensity: number;
  label: string;
  actions: number;
  shots: number;
  passes: number;
  goals: number;
}

export interface HeatmapPeriodData {
  blobs: HeatBlob[];
  favoriteZone: { label: string; actions: number; trend: string };
}

export const HEATMAP_PLAYER_INFO = {
  mainPosition: "Avant-centre (BU)",
  favoriteZone: "Demi-espace droit",
};

export const HEATMAP_BY_PERIOD: Record<HeatmapPeriod, HeatmapPeriodData> = {
  season: {
    favoriteZone: { label: "Surface adverse", actions: 128, trend: "+15%" },
    blobs: [
      { id: "s1", x: 72, y: 82, intensity: 0.92, label: "Surface adverse", actions: 128, shots: 22, passes: 14, goals: 6 },
      { id: "s2", x: 58, y: 78, intensity: 0.88, label: "Surface adverse", actions: 112, shots: 18, passes: 12, goals: 5 },
      { id: "s3", x: 85, y: 75, intensity: 0.85, label: "Demi-espace droit", actions: 98, shots: 15, passes: 11, goals: 4 },
      { id: "s4", x: 45, y: 72, intensity: 0.72, label: "Surface centrale", actions: 76, shots: 12, passes: 18, goals: 3 },
      { id: "s5", x: 65, y: 65, intensity: 0.58, label: "Entrée surface", actions: 54, shots: 8, passes: 22, goals: 2 },
      { id: "s6", x: 38, y: 58, intensity: 0.42, label: "Axe offensif", actions: 38, shots: 5, passes: 28, goals: 1 },
      { id: "s7", x: 55, y: 52, intensity: 0.32, label: "Milieu offensif", actions: 28, shots: 3, passes: 32, goals: 0 },
      { id: "s8", x: 70, y: 48, intensity: 0.22, label: "Couloir droit", actions: 18, shots: 2, passes: 14, goals: 0 },
    ],
  },
  lastMatch: {
    favoriteZone: { label: "Surface adverse", actions: 34, trend: "+22%" },
    blobs: [
      { id: "l1", x: 68, y: 80, intensity: 0.95, label: "Surface adverse", actions: 34, shots: 6, passes: 4, goals: 2 },
      { id: "l2", x: 55, y: 76, intensity: 0.82, label: "Demi-espace droit", actions: 22, shots: 4, passes: 3, goals: 1 },
      { id: "l3", x: 78, y: 72, intensity: 0.68, label: "Surface droite", actions: 16, shots: 3, passes: 2, goals: 0 },
      { id: "l4", x: 42, y: 68, intensity: 0.45, label: "Surface centrale", actions: 10, shots: 1, passes: 5, goals: 0 },
    ],
  },
  "5matches": {
    favoriteZone: { label: "Surface adverse", actions: 89, trend: "+12%" },
    blobs: [
      { id: "m5-1", x: 70, y: 81, intensity: 0.9, label: "Surface adverse", actions: 89, shots: 14, passes: 10, goals: 4 },
      { id: "m5-2", x: 52, y: 77, intensity: 0.78, label: "Demi-espace droit", actions: 62, shots: 10, passes: 8, goals: 2 },
      { id: "m5-3", x: 82, y: 74, intensity: 0.65, label: "Surface droite", actions: 45, shots: 7, passes: 6, goals: 1 },
      { id: "m5-4", x: 48, y: 66, intensity: 0.5, label: "Entrée surface", actions: 32, shots: 5, passes: 12, goals: 1 },
      { id: "m5-5", x: 35, y: 55, intensity: 0.35, label: "Axe offensif", actions: 20, shots: 2, passes: 18, goals: 0 },
    ],
  },
  "10matches": {
    favoriteZone: { label: "Surface adverse", actions: 112, trend: "+18%" },
    blobs: [
      { id: "m10-1", x: 71, y: 82, intensity: 0.91, label: "Surface adverse", actions: 112, shots: 19, passes: 12, goals: 5 },
      { id: "m10-2", x: 56, y: 78, intensity: 0.84, label: "Demi-espace droit", actions: 88, shots: 14, passes: 10, goals: 3 },
      { id: "m10-3", x: 44, y: 70, intensity: 0.62, label: "Surface centrale", actions: 58, shots: 9, passes: 15, goals: 2 },
      { id: "m10-4", x: 84, y: 73, intensity: 0.55, label: "Surface droite", actions: 42, shots: 6, passes: 8, goals: 1 },
      { id: "m10-5", x: 60, y: 58, intensity: 0.38, label: "Milieu offensif", actions: 26, shots: 3, passes: 24, goals: 0 },
    ],
  },
};

export const HEATMAP_FILTERS: { id: HeatmapPeriod; label: string }[] = [
  { id: "season", label: "Saison" },
  { id: "lastMatch", label: "Dernier Match" },
  { id: "5matches", label: "5 Matchs" },
  { id: "10matches", label: "10 Matchs" },
];

export const HEATMAP_LEGEND = [
  { label: "0-20 actions", color: "rgba(255,214,0,0.5)" },
  { label: "20-50 actions", color: "rgba(255,140,0,0.65)" },
  { label: "50-100 actions", color: "rgba(255,99,71,0.75)" },
  { label: "100+ actions", color: "rgba(185,28,28,0.9)" },
];

function intensityColors(intensity: number) {
  if (intensity >= 0.75) {
    return { inner: "rgba(185,28,28,0.95)", mid: "rgba(220,38,38,0.45)", size: 88 };
  }
  if (intensity >= 0.45) {
    return { inner: "rgba(255,99,71,0.9)", mid: "rgba(255,140,0,0.35)", size: 72 };
  }
  if (intensity >= 0.2) {
    return { inner: "rgba(255,193,7,0.85)", mid: "rgba(255,214,0,0.3)", size: 58 };
  }
  return { inner: "rgba(255,214,0,0.4)", mid: "rgba(255,214,0,0.15)", size: 44 };
}

export { intensityColors };

export const MEDICAL_WELLNESS = {
  fatigue: 75,
  sleep: "7h45",
  hydration: 82,
  injuryPredictions: [
    { zone: "Hamstring", risk: 32, color: "#F59E0B" },
    { zone: "Genou", risk: 18, color: "#22C55E" },
    { zone: "Cheville", risk: 12, color: "#22C55E" },
  ],
};

export const DAILY_TIMELINE = [
  { time: "08:00", title: "Training", subtitle: "Séance collective — Technique", type: "training" as const },
  { time: "14:00", title: "Gym", subtitle: "Renforcement — Core & jambes", type: "training" as const },
  { time: "18:00", title: "Recovery", subtitle: "Physio + cryothérapie", type: "rest" as const },
];

export const MATCH_WEATHER = {
  temp: 28,
  condition: "Ensoleillé",
  wind: "Vent faible",
  humidity: 62,
};

export const AI_WEEKLY_INSIGHTS = {
  speedChange: "+8%",
  enduranceChange: "-3%",
  fatigueRisk: "Moyen",
  advice: "Repos demain matin — charge élevée cette semaine",
};

export const AI_COACH_QUESTIONS = [
  "Comment marquer plus ?",
  "Comment améliorer ma détente ?",
  "Pourquoi mon score baisse ?",
  "Comment améliorer ma vitesse ?",
];

export const AI_CHAT_HISTORY = [
  { id: "h1", period: "Aujourd'hui", question: "Comment améliorer ma vitesse ?" },
  { id: "h2", period: "Hier", question: "Pourquoi mon score baisse ?" },
  { id: "h3", period: "12/06/2026", question: "Comment améliorer mon physique ?" },
  { id: "h4", period: "10/06/2026", question: "Quel est mon point faible ?" },
];

export const PLAYER_BODY_ZONES = [
  { id: "head", name: "Tête", severity: "none" as const, risk: 5, lastControl: "01/03/2026" },
  { id: "shoulder-left", name: "Épaule gauche", severity: "none" as const, risk: 8, lastControl: "15/04/2026" },
  { id: "shoulder-right", name: "Épaule droite", severity: "low" as const, risk: 12, lastControl: "20/05/2026" },
  { id: "arm-left", name: "Bras gauche", severity: "none" as const, risk: 4, lastControl: "01/01/2026" },
  { id: "arm-right", name: "Bras droit", severity: "none" as const, risk: 4, lastControl: "01/01/2026" },
  { id: "chest", name: "Poitrine", severity: "none" as const, risk: 6, lastControl: "10/05/2026" },
  { id: "abdomen", name: "Abdomen", severity: "none" as const, risk: 7, lastControl: "10/05/2026" },
  { id: "groin", name: "Dos / Lombaires", severity: "low" as const, risk: 15, lastControl: "05/06/2026" },
  { id: "knee-left", name: "Genou gauche", severity: "low" as const, risk: 14, lastControl: "08/06/2026" },
  { id: "knee-right", name: "Genou droit", severity: "medium" as const, risk: 18, lastControl: "12/06/2026" },
  { id: "ankle-left", name: "Cheville gauche", severity: "none" as const, risk: 10, lastControl: "01/04/2026" },
  { id: "ankle-right", name: "Cheville droite", severity: "none" as const, risk: 12, lastControl: "12/06/2026" },
];

export const CAREER_TIMELINE = [
  { year: "2023", club: "Club Africain", event: "Début professionnel" },
  { year: "2024", club: "FC Carthage", event: "Transfert record" },
  { year: "2025", club: "Sélection U23", event: "International" },
  { year: "2026", club: "FC Carthage", event: "Capitaine adjoint" },
];

export const PLAYER_TROPHIES = [
  { icon: "🏆", name: "Championnat", year: "2024" },
  { icon: "🥇", name: "Top Scorer", year: "2025-26" },
  { icon: "🎖", name: "Coupe de Tunisie", year: "2025" },
];

export const MARKET_VALUE_TREND = {
  value: "2.3M €",
  change: "+15%",
  positive: true,
};

export const MESSAGE_NOTIFICATIONS = [
  { id: "n1", from: "Coach", role: "coach" as const, message: "Présence obligatoire demain 09h", time: "14:32", unread: true },
  { id: "n2", from: "Médecin", role: "medical" as const, message: "Contrôle genou vendredi 14h", time: "Hier", unread: true },
  { id: "n3", from: "Direction", role: "direction" as const, message: "Renouvellement contrat à discuter", time: "Il y a 2j", unread: false },
];

export const DASHBOARD_KPIS = {
  ovr: 87,
  goals: 15,
  assists: 8,
  minutes: 2140,
  availability: 100,
  form: 92,
};

export const RECENT_ACTIVITY = [
  { id: "1", title: "Coach a créé séance", description: "Séance technique — Mercredi 09h00", time: "Il y a 3h", type: "training" as const },
  { id: "2", title: "Match validé", description: "FC Carthage vs CSS — 1-0", time: "Il y a 1j", type: "match" as const },
  { id: "3", title: "Rapport médical ajouté", description: "Contrôle genou — Disponible", time: "Il y a 2j", type: "medical" as const },
];

export const PERFORMANCE_OVERVIEW = {
  vitesse: 88,
  technique: 85,
  physique: 85,
  mental: 82,
};

export const TEAM_AVERAGE = {
  speed: 74,
  passing: 76,
  shooting: 71,
  physical: 75,
  vision: 73,
  defending: 68,
};

export const TOP_CLUB_PLAYER = {
  name: "Youssef Msakni",
  position: "MOC",
  ovr: 86,
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=faces",
  radar: {
    speed: 82,
    passing: 88,
    shooting: 79,
    physical: 76,
    vision: 90,
    defending: 62,
  },
};

export const VIDEO_ANALYSIS = {
  match: "FC Carthage vs CSS",
  date: "15/06/2026",
  result: "1-0",
  thumbnail: "https://images.unsplash.com/photo-1574629810360-43c2d185f1d8?w=720&h=400&fit=crop",
  goals: [
    { minute: 67, type: "Pied droit", xG: 0.72, description: "Enveloppé surface — angle fermé" },
    { minute: 82, type: "Tête", xG: 0.41, description: "Corner — 2e poteau" },
  ],
  passes: { completed: 28, key: 4, accuracy: 84, intoBox: 6 },
  missedChances: [
    { minute: 23, xG: 0.61, reason: "Tir cadré — arrêt gardien" },
    { minute: 54, xG: 0.38, reason: "Hors cadre — pied gauche" },
  ],
};

export const PERFORMANCE_EVOLUTION = [
  { month: "Jan", score: 78 },
  { month: "Fév", score: 82 },
  { month: "Mar", score: 85 },
  { month: "Avr", score: 87 },
  { month: "Mai", score: 89 },
  { month: "Jun", score: 87 },
];

export const MEDICAL_STATUS = {
  status: "Disponible" as const,
  label: "Disponible",
  riskScore: 25,
  nextAppointment: { date: "21/06/2026", time: "14:00", doctor: "Dr. Ben Ammar", reason: "Contrôle genou" },
};

export const INJURY_HISTORY = [
  { id: "1", year: "2024", injury: "Entorse cheville", status: "Récupéré" },
  { id: "2", year: "2025", injury: "Genou — Grade I", status: "Récupéré" },
  { id: "3", year: "2026", injury: "Genou Droit — Grade II", status: "Récupéré" },
];

export type PlanningEventType = "match" | "training" | "medical" | "rest";

export interface PlanningEvent {
  id: string;
  title: string;
  date: string;
  day: number;
  start: string;
  end: string;
  type: PlanningEventType;
  location: string;
  responsible: string;
  logo: string;
}

export const PLANNING_EVENTS: PlanningEvent[] = [
  { id: "1", title: "FC Carthage vs EST", date: "21/06/2026", day: 21, start: "20:00", end: "22:00", type: "match", location: "Stade Olympique de Rades", responsible: "Nabil Maaloul", logo: "⚽" },
  { id: "2", title: "Entraînement — Physique", date: "19/06/2026", day: 19, start: "09:00", end: "11:00", type: "training", location: "Centre d'entraînement", responsible: "Karim Gharbi", logo: "🏃" },
  { id: "3", title: "Entraînement — Technique", date: "20/06/2026", day: 20, start: "09:00", end: "11:00", type: "training", location: "Terrain synthétique A", responsible: "Nabil Maaloul", logo: "⚽" },
  { id: "4", title: "Consultation médicale", date: "21/06/2026", day: 21, start: "14:00", end: "15:00", type: "medical", location: "Infirmerie club", responsible: "Dr. Ben Ammar", logo: "🩺" },
  { id: "5", title: "Repos actif", date: "22/06/2026", day: 22, start: "—", end: "—", type: "rest", location: "Domicile", responsible: "Staff médical", logo: "😴" },
  { id: "6", title: "Entraînement — Tactique", date: "23/06/2026", day: 23, start: "10:00", end: "12:00", type: "training", location: "Centre d'entraînement", responsible: "Nabil Maaloul", logo: "📋" },
  { id: "7", title: "Match amical", date: "25/06/2026", day: 25, start: "18:00", end: "20:00", type: "match", location: "Stade Hamda Lassoued", responsible: "Nabil Maaloul", logo: "⚽" },
];

export const PLANNING_TYPE_COLORS: Record<PlanningEventType, string> = {
  match: "#22C55E",
  training: "#3B82F6",
  medical: "#FF6B57",
  rest: "#6B7280",
};

export const PLAYER_PROFILE_INFO = {
  number: 9,
  height: "1.82 m",
  weight: "78 kg",
  foot: "Droit",
  birthDate: "14/03/2002",
  birthPlace: "Tunis, Tunisie",
};

export const PLAYER_DOCUMENTS = [
  { id: "1", name: "Contrat.pdf", type: "Contrat", size: "2.4 MB" },
  { id: "2", name: "Licence.pdf", type: "Licence", size: "890 KB" },
  { id: "3", name: "Certificat médical.pdf", type: "Médical", size: "1.1 MB" },
];

export function getCoachAIResponse(question: string, playerName: string): string {
  const q = question.toLowerCase();
  if (q.includes("vitesse") || q.includes("speed")) {
    return `Votre vitesse a augmenté de 8% ce trimestre (82 → 88). Nous recommandons 2 séances sprint par semaine avec récupération 48h entre chaque. Intégrez des exercices de pliométrie le mardi et jeudi.`;
  }
  if (q.includes("marquer") || q.includes("but") || q.includes("goal")) {
    return `Pour marquer plus: 1) Positionnez-vous entre les défenseurs centraux 2) Timing de course +0.3s 3) Finition 1-touch. Votre xG cette saison: 18.2 vs 15 buts — potentiel +3 buts.`;
  }
  if (q.includes("détente") || q.includes("jump") || q.includes("head")) {
    return `Votre détente verticale: 68cm (+4cm vs début saison). Programme: 3x/semaine pliométrie + squats. Objectif: 72cm en 6 semaines.`;
  }
  if (q.includes("baisse") || q.includes("why") && q.includes("score")) {
    return `Votre score a légèrement baissé (-2 pts) après le match vs CSS. Cause principale: moins de touches dans la surface (4 vs moyenne 7). Concentrez-vous sur les appels dans le 16m lors des prochains entraînements.`;
  }
  if (q.includes("physique") || q.includes("physical")) {
    return `Votre indice physique est à 85/100. Pour progresser: ajoutez 1 séance de renforcement (core + jambes) et maintenez 7.5h de sommeil. Votre charge actuelle (72%) est optimale.`;
  }
  if (q.includes("faible") || q.includes("point faible") || q.includes("weak")) {
    return `Votre point faible identifié: jeu de tête (72/100) et pressing défensif (68/100). Programme personnalisé disponible dans Mes Entraînements. Amélioration estimée: +6 pts en 8 semaines.`;
  }
  if (q.includes("blessure") || q.includes("medical") || q.includes("genou")) {
    return `Votre genou est en bonne voie de récupération. Risk score: 25%. Prochain contrôle le 21/06. Évitez les changements de direction à haute intensité cette semaine.`;
  }
  return `${playerName}, votre forme actuelle est excellente (92%). OVR 87, 15 buts cette saison. Continuez le protocole actuel et préparez-vous pour EST dans 2 jours.`;
}

export function getCurrentPlayerData(playerId: string = CURRENT_PLAYER_ID) {
  const player = getPlayerById(playerId);
  if (!player) return null;
  return { ...player, ...DASHBOARD_KPIS };
}

/* ─── FIFA / FUT Card attributes ──────────────────────────────── */
export interface FifaAttributes {
  pac: number; sho: number; pas: number; dri: number; def: number; phy: number;
}

export function getFifaAttributes(radar: {
  speed: number; passing: number; shooting: number; physical: number; vision: number; defending: number;
}): FifaAttributes {
  return {
    pac: radar.speed,
    sho: radar.shooting,
    pas: radar.passing,
    dri: Math.round((radar.vision + radar.speed) / 2),
    def: radar.defending,
    phy: radar.physical,
  };
}

/* ─── Career Stats (cumulative) ───────────────────────────────── */
export const CAREER_STATS = {
  matches: 128,
  goals: 84,
  assists: 29,
  minutes: 10240,
  yellowCards: 14,
  redCards: 2,
  cleanSheets: 0,
  trophies: 3,
  seasons: 4,
};

export const CAREER_STATS_BY_SEASON = [
  { season: "2022-23", club: "Club Africain", matches: 22, goals: 9,  assists: 4 },
  { season: "2023-24", club: "FC Carthage",   matches: 34, goals: 21, assists: 8 },
  { season: "2024-25", club: "FC Carthage",   matches: 38, goals: 26, assists: 9 },
  { season: "2025-26", club: "FC Carthage",   matches: 34, goals: 28, assists: 8 },
];

/* ─── AI Coach: Strengths / Weaknesses / Training Plan ────────── */
export const AI_STRENGTHS = [
  { label: "Finition", value: 91, note: "Top 5% du championnat" },
  { label: "Vitesse de pointe", value: 88, note: "+8% ce trimestre" },
  { label: "Jeu sans ballon", value: 86, note: "Appels intelligents" },
];

export const AI_WEAKNESSES = [
  { label: "Jeu de tête", value: 72, note: "Travailler le timing du saut" },
  { label: "Pressing défensif", value: 68, note: "Intensité à améliorer" },
  { label: "Pied gauche", value: 64, note: "Finition à renforcer" },
];

export type TrainingFocus = "Sprint" | "Finishing" | "Repos" | "Tactique" | "Force" | "Récupération";

export interface TrainingDay {
  day: string;
  focus: TrainingFocus;
  detail: string;
  intensity: number;
  icon: string;
}

export const AI_TRAINING_PLAN: TrainingDay[] = [
  { day: "Lundi",    focus: "Sprint",       detail: "Pliométrie + sprints 30m × 8", intensity: 85, icon: "⚡" },
  { day: "Mardi",    focus: "Finishing",    detail: "Finition 1-touch · 60 frappes", intensity: 75, icon: "🎯" },
  { day: "Mercredi", focus: "Repos",        detail: "Repos actif + mobilité",        intensity: 20, icon: "😴" },
  { day: "Jeudi",    focus: "Tactique",     detail: "Appels dans la surface · vidéo", intensity: 60, icon: "📋" },
  { day: "Vendredi", focus: "Force",        detail: "Core + jambes · renforcement",   intensity: 80, icon: "💪" },
  { day: "Samedi",   focus: "Récupération", detail: "Cryothérapie + physio",          intensity: 30, icon: "🧊" },
];

export const AI_INJURY_PREVENTION = {
  zone: "Genou droit",
  risk: 32,
  level: "Modéré",
  advice: "Limiter les changements de direction à haute intensité. Renforcement ischio-jambiers recommandé 2×/semaine.",
};

export const AI_RECOMMENDATIONS = [
  "Maintenir 7h30 de sommeil minimum avant chaque match",
  "Ajouter 1 séance de jeu de tête par semaine (point faible identifié)",
  "Hydratation +0.5L les jours d'entraînement intense",
];
