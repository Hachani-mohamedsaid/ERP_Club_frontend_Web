import { SQUAD_PLAYERS } from "./joueurMockData";

export interface CareerStep {
  year: string;
  club: string;
  event?: string;
}

export interface PlayerExtended {
  career: CareerStep[];
  matchCount: number;
  yellowCards: number;
  redCards: number;
  evolution: { month: string; ovr: number; marketValue: number; performance: number }[];
  heatmapZones: { row: number; col: number; intensity: number; touches: number; passes: number; shots: number }[];
  training: { physical: number; technical: number; tactical: number; presence: number; charge: number; fatigue: number };
  nutrition: { weight: number; bmi: number; calories: number; hydration: number };
  sleep: { quality: number; hours: number; recovery: number };
  matchAnalysis: { distance: number; sprints: number; passAccuracy: number; topSpeed: number };
  aiInsight: { riskInjury: number; performance: number; fatigue: number; recommendation: string; why: string; predictedOvr: number };
  ratingHistory: { label: string; rating: number }[];
  social: { followers: string; interviews: number; news: { title: string; date: string }[] };
}

export const PLAYER_EXTENDED: Record<string, PlayerExtended> = {
  "1": {
    career: [
      { year: "2021", club: "Club Africain", event: "Début pro" },
      { year: "2023", club: "FC Carthage", event: "Transfert record" },
      { year: "2026", club: "Équipe Nationale", event: "Sélection A" },
    ],
    matchCount: 28,
    yellowCards: 3,
    redCards: 0,
    evolution: [
      { month: "Jul", ovr: 82, marketValue: 1.8, performance: 72 },
      { month: "Aoû", ovr: 83, marketValue: 1.9, performance: 75 },
      { month: "Sep", ovr: 84, marketValue: 2.0, performance: 78 },
      { month: "Oct", ovr: 84, marketValue: 2.0, performance: 82 },
      { month: "Nov", ovr: 85, marketValue: 2.1, performance: 85 },
      { month: "Déc", ovr: 86, marketValue: 2.2, performance: 84 },
      { month: "Jan", ovr: 86, marketValue: 2.2, performance: 86 },
      { month: "Fév", ovr: 87, marketValue: 2.3, performance: 88 },
      { month: "Mar", ovr: 87, marketValue: 2.3, performance: 87 },
      { month: "Avr", ovr: 87, marketValue: 2.3, performance: 89 },
      { month: "Mai", ovr: 87, marketValue: 2.3, performance: 87 },
      { month: "Jun", ovr: 87, marketValue: 2.3, performance: 85 },
    ],
    heatmapZones: [
      { row: 0, col: 2, intensity: 0.9, touches: 42, passes: 18, shots: 12 },
      { row: 0, col: 3, intensity: 0.85, touches: 38, passes: 15, shots: 10 },
      { row: 1, col: 2, intensity: 0.7, touches: 28, passes: 22, shots: 5 },
      { row: 1, col: 3, intensity: 0.65, touches: 25, passes: 20, shots: 4 },
      { row: 0, col: 1, intensity: 0.4, touches: 12, passes: 8, shots: 2 },
      { row: 0, col: 4, intensity: 0.35, touches: 10, passes: 7, shots: 1 },
    ],
    training: { physical: 88, technical: 85, tactical: 82, presence: 95, charge: 72, fatigue: 55 },
    nutrition: { weight: 78, bmi: 23.5, calories: 3200, hydration: 88 },
    sleep: { quality: 78, hours: 7.5, recovery: 72 },
    matchAnalysis: { distance: 10.8, sprints: 34, passAccuracy: 82, topSpeed: 32.4 },
    aiInsight: {
      riskInjury: 23,
      performance: 87,
      fatigue: 55,
      recommendation: "Réduire la charge d'entraînement de 10% — genou en rééducation",
      why: "Historique genou Grade II + charge élevée cette semaine. Risque rechute si intensité maintenue.",
      predictedOvr: 89,
    },
    ratingHistory: [
      { label: "M1", rating: 8.5 }, { label: "M2", rating: 7.9 }, { label: "M3", rating: 9.1 },
      { label: "M4", rating: 8.2 }, { label: "M5", rating: 7.6 }, { label: "M6", rating: 8.8 },
      { label: "M7", rating: 8.4 }, { label: "M8", rating: 9.0 }, { label: "M9", rating: 7.8 },
      { label: "M10", rating: 8.7 },
    ],
    social: {
      followers: "124K",
      interviews: 8,
      news: [
        { title: "Ahmed Ben Salah — meilleur buteur du mois", date: "12/06/2026" },
        { title: "Retour progressif à l'entraînement", date: "05/06/2026" },
      ],
    },
  },
};

export function getPlayerExtended(id: string): PlayerExtended {
  return PLAYER_EXTENDED[id] ?? {
    career: [{ year: "2024", club: "FC Carthage" }],
    matchCount: 15,
    yellowCards: 2,
    redCards: 0,
    evolution: Array.from({ length: 12 }, (_, i) => ({
      month: ["Jul", "Aoû", "Sep", "Oct", "Nov", "Déc", "Jan", "Fév", "Mar", "Avr", "Mai", "Jun"][i],
      ovr: 75 + i,
      marketValue: 1 + i * 0.1,
      performance: 70 + i,
    })),
    heatmapZones: [{ row: 1, col: 2, intensity: 0.6, touches: 20, passes: 15, shots: 5 }],
    training: { physical: 75, technical: 78, tactical: 80, presence: 90, charge: 65, fatigue: 40 },
    nutrition: { weight: 75, bmi: 23, calories: 3000, hydration: 85 },
    sleep: { quality: 80, hours: 8, recovery: 78 },
    matchAnalysis: { distance: 9.5, sprints: 28, passAccuracy: 80, topSpeed: 30 },
    aiInsight: {
      riskInjury: 30,
      performance: 80,
      fatigue: 45,
      recommendation: "Maintenir le protocole actuel",
      why: "Profil stable, pas de signaux d'alerte majeurs.",
      predictedOvr: 82,
    },
    ratingHistory: [
      { label: "M1", rating: 7.5 }, { label: "M2", rating: 7.8 }, { label: "M3", rating: 8.0 },
      { label: "M4", rating: 7.6 }, { label: "M5", rating: 8.2 },
    ],
    social: { followers: "45K", interviews: 3, news: [] },
  };
}

export const JOUEUR_AWARDS = [
  { id: "1", title: "Top Scorer", season: "2025-26", player: "Ahmed Ben Salah", icon: "⚽", color: "#e0584a" },
  { id: "2", title: "Player of the Month", season: "Mai 2026", player: "Yassine Brahmi", icon: "⭐", color: "#d99a1f" },
  { id: "3", title: "Best Young Player", season: "2025-26", player: "Walid Hammami", icon: "🌟", color: "#2e9e5b" },
  { id: "4", title: "Clean Sheet King", season: "2025-26", player: "Mohamed Trabelsi", icon: "🧤", color: "#4a90d9" },
  { id: "5", title: "Most Assists", season: "2025-26", player: "Ali Ben Youssef", icon: "🎯", color: "#9b59b6" },
];

export const JOUEUR_TROPHIES = [
  { id: "1", name: "Championnat", year: "2024", icon: "🏆", club: "FC Carthage" },
  { id: "2", name: "Coupe de Tunisie", year: "2025", icon: "🥇", club: "FC Carthage" },
  { id: "3", name: "CAF Confederation Cup", year: "2023", icon: "🌍", club: "FC Carthage" },
  { id: "4", name: "Super Coupe", year: "2024", icon: "⭐", club: "FC Carthage" },
];

export interface ChemistryPair {
  player1: string;
  player2: string;
  player1Id: string;
  player2Id: string;
  chemistry: number;
}

export const CHEMISTRY_PAIRS: ChemistryPair[] = [
  { player1: "Ahmed Ben Salah", player2: "Ali Ben Youssef", player1Id: "1", player2Id: "2", chemistry: 85 },
  { player1: "Ahmed Ben Salah", player2: "Yassine Brahmi", player1Id: "1", player2Id: "7", chemistry: 78 },
  { player1: "Ali Ben Youssef", player2: "Karim Sassi", player1Id: "2", player2Id: "3", chemistry: 92 },
  { player1: "Yassine Brahmi", player2: "Mehdi Jebali", player1Id: "7", player2Id: "6", chemistry: 71 },
  { player1: "Karim Sassi", player2: "Mohamed Trabelsi", player1Id: "3", player2Id: "5", chemistry: 88 },
  { player1: "Ahmed Ben Salah", player2: "Karim Sassi", player1Id: "1", player2Id: "3", chemistry: 65 },
];

export const JOUEUR_NOTIFICATIONS = [
  { id: "1", title: "Entraînement demain", message: "Séance collective à 09h00 — Centre d'entraînement", time: "Il y a 2h", unread: true, type: "training" as const },
  { id: "2", title: "Contrat expire dans 30 jours", message: "Renouvellement à discuter avec la direction", time: "Il y a 5h", unread: true, type: "contract" as const },
  { id: "3", title: "Séance médicale prévue", message: "Contrôle genou — Dr. Ben Ammar, 14h00", time: "Hier", unread: true, type: "medical" as const },
  { id: "4", title: "Match samedi", message: "FC Carthage vs EST — 20h00", time: "Hier", unread: false, type: "match" as const },
];

export const JOUEUR_CONVERSATIONS = [
  { id: "coach", name: "Nabil Maaloul", role: "Coach", preview: "Présence obligatoire demain 09h.", time: "14:32", unread: true },
  { id: "scout", name: "Karim Bouazizi", role: "Scout", preview: "Rapport performance mis à jour.", time: "11:05", unread: true },
  { id: "medical", name: "Dr. Ben Ammar", role: "Médecin", preview: "Contrôle genou vendredi 14h.", time: "Hier", unread: false },
];

export const JOUEUR_MESSAGES: Record<string, { id: string; text: string; sent: boolean; time: string }[]> = {
  coach: [
    { id: "1", text: "Ahmed, présence obligatoire demain à 09h pour la séance collective.", sent: false, time: "14:10" },
    { id: "2", text: "Compris coach, je serai là.", sent: true, time: "14:15" },
    { id: "3", text: "Présence obligatoire demain 09h.", sent: false, time: "14:32" },
  ],
  scout: [
    { id: "1", text: "Ton rapport de performance a été mis à jour — OVR 87 confirmé.", sent: false, time: "11:00" },
    { id: "2", text: "Merci, je continue le travail.", sent: true, time: "11:05" },
  ],
  medical: [
    { id: "1", text: "Contrôle genou prévu vendredi à 14h. Ne pas forcer cette semaine.", sent: false, time: "Hier" },
    { id: "2", text: "D'accord docteur, je respecte le protocole.", sent: true, time: "Hier" },
  ],
};

export const MARKET_PLAYERS = [
  { id: "m1", name: "Sofiane Boufal", position: "MOC", club: "Wydad AC", value: "1.2M €", age: 24, ovr: 79 },
  { id: "m2", name: "Hamza Lahmar", position: "BU", club: "CS Sfaxien", value: "900K €", age: 22, ovr: 76 },
  { id: "m3", name: "Aymen Ben Ahmed", position: "DC", club: "EST", value: "750K €", age: 26, ovr: 78 },
  { id: "m4", name: "Oussama Khazri", position: "AG", club: "Montpellier", value: "2.5M €", age: 28, ovr: 82 },
];

export const SCOUT_RECOMMENDATIONS = [
  { id: "s1", name: "Hamza Lahmar", position: "BU", club: "CS Sfaxien", value: "900K €", match: 88, reason: "Profil complémentaire à Ahmed" },
  { id: "s2", name: "Aymen Ben Ahmed", position: "DC", club: "EST", value: "750K €", match: 82, reason: "Renfort défense central" },
];

export const AI_SUGGESTED_QUESTIONS = [
  "Analyse Ahmed Ben Salah",
  "Best Position for Ahmed?",
  "Risk Injury Assessment",
  "Compare Ahmed with Ali",
  "Next Match Prediction",
  "What should Ahmed improve?",
  "Which player replaces Ahmed?",
  "Predict OVR in 6 months",
];

export function getAIResponse(question: string, playerName: string): string {
  const q = question.toLowerCase();
  if (q.includes("improve") || q.includes("amélior")) {
    return `${playerName} devrait améliorer: 1) Finition de la tête (72→80) 2) Jeu de dos au but 3) Pressing défensif. Programme recommandé: 3 séances/semaine.`;
  }
  if (q.includes("replace") || q.includes("remplace")) {
    return `Remplaçants recommandés pour ${playerName}: Yassine Brahmi (AG, compatibilité 78%) ou Hamza Lahmar (BU, scout match 88%).`;
  }
  if (q.includes("predict") || q.includes("ovr") || q.includes("6 month")) {
    return `Prédiction OVR ${playerName} dans 6 mois: 89 (+2). Basé sur tendance performance +12% et récupération genou prévue.`;
  }
  if (q.includes("position")) {
    return `Meilleure position pour ${playerName}: BU (87) > AG (82). Position secondaire AG viable en 4-3-3.`;
  }
  if (q.includes("risk") || q.includes("injury") || q.includes("blessure")) {
    return `Risque blessure ${playerName}: 23% (Medium). Genou droit sensible. Recommandation: -10% charge hebdomadaire.`;
  }
  if (q.includes("compare") || q.includes("ali")) {
    return `Ahmed vs Ali: Ahmed supérieur en Shooting (91 vs 72) et Physical (85 vs 80). Ali meilleur en Passing (92 vs 78) et Vision (88 vs 80).`;
  }
  if (q.includes("match") || q.includes("prediction")) {
    return `Prédiction prochain match vs EST: ${playerName} — Rating estimé 8.2, probabilité but 45%, probabilité assist 30%.`;
  }
  return `Analyse ${playerName}: Performance Excellent (87 OVR). Risque Medium (23%). Recommandation: réduire charge 10%, retour complet prévu dans 3 semaines.`;
}

export const EXTENDED_MATCHES = [
  { id: "em1", opponent: "EST", score: "3-1", rating: 8.5, goals: 2, assists: 1, date: "15/06/2026" },
  { id: "em2", opponent: "CA", score: "2-2", rating: 7.9, goals: 1, assists: 0, date: "08/06/2026" },
  { id: "em3", opponent: "CSS", score: "1-0", rating: 9.1, goals: 1, assists: 0, date: "01/06/2026" },
  { id: "em4", opponent: "USM", score: "2-0", rating: 8.2, goals: 0, assists: 1, date: "25/05/2026" },
  { id: "em5", opponent: "ST", score: "4-1", rating: 7.6, goals: 1, assists: 1, date: "18/05/2026" },
  { id: "em6", opponent: "JSK", score: "1-1", rating: 8.8, goals: 1, assists: 0, date: "11/05/2026" },
  { id: "em7", opponent: "EST", score: "0-2", rating: 8.4, goals: 0, assists: 1, date: "04/05/2026" },
  { id: "em8", opponent: "CA", score: "3-2", rating: 9.0, goals: 2, assists: 0, date: "27/04/2026" },
  { id: "em9", opponent: "CSS", score: "2-1", rating: 7.8, goals: 0, assists: 2, date: "20/04/2026" },
  { id: "em10", opponent: "USM", score: "1-0", rating: 8.7, goals: 1, assists: 0, date: "13/04/2026" },
];

export const ALL_PLAYER_NAMES = SQUAD_PLAYERS.map((p) => ({ id: p.id, name: p.name }));
