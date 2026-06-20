export const RECRUTEUR_INFO = {
  name: "Karim Belaïd",
  club: "FC Carthage",
  season: "2026",
  role: "Directeur du Recrutement",
};

export const ACCENT = "#8B5CF6";

export interface ScoutPlayer {
  id: string;
  name: string;
  club: string;
  country: string;
  countryFlag: string;
  age: number;
  position: string;
  positionFull: string;
  foot: "Droit" | "Gauche";
  height: string;
  value: string;
  valueNum: number;
  salary: string;
  aiScore: number;
  potential: number;
  injuryRisk: number;
  teamCompat: number;
  transferSuccess: number;
  speed: number;
  technique: number;
  physical: number;
  vision: number;
  mental: number;
  finishing: number;
  goals: number;
  assists: number;
  xg: number;
  matches: number;
  league: string;
  similarTo: { name: string; pct: number }[];
  replaces: string;
  valueHistory: { month: string; value: number; predicted?: boolean }[];
  shortlisted?: boolean;
}

export interface KpiCard {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  color: string;
  trend: string;
}

export const RECRUTEUR_KPIS: KpiCard[] = [
  { label: "Joueurs observés", value: 124, color: "#8B5CF6", trend: "+18 ce mois" },
  { label: "Shortlist", value: 28, color: "#22C55E", trend: "+5 cette semaine" },
  { label: "Négociations", value: 6, color: "#F59E0B", trend: "2 en phase finale" },
  { label: "Budget restant", value: 2.4, suffix: "M€", decimals: 1, color: "#3B82F6", trend: "sur 5M€ alloués" },
];

export const VALUE_EVOLUTION = [
  { month: "Jan", value: 8.2 },
  { month: "Fév", value: 9.1 },
  { month: "Mar", value: 9.8 },
  { month: "Avr", value: 11.2 },
  { month: "Mai", value: 12.6 },
  { month: "Juin", value: 14.1 },
];

export const POSITION_DISTRIBUTION = [
  { name: "Attaquants", value: 38, color: "#EF4444" },
  { name: "Milieux", value: 42, color: "#22C55E" },
  { name: "Défenseurs", value: 31, color: "#3B82F6" },
  { name: "Gardiens", value: 13, color: "#F59E0B" },
];

export const AGE_DISTRIBUTION = [
  { range: "16-18", count: 22 },
  { range: "19-21", count: 41 },
  { range: "22-24", count: 35 },
  { range: "25-27", count: 18 },
  { range: "28+", count: 8 },
];

export const COUNTRY_DISTRIBUTION = [
  { country: "Tunisie", flag: "🇹🇳", count: 34 },
  { country: "Algérie", flag: "🇩🇿", count: 21 },
  { country: "Maroc", flag: "🇲🇦", count: 18 },
  { country: "France", flag: "🇫🇷", count: 26 },
  { country: "Sénégal", flag: "🇸🇳", count: 15 },
  { country: "Nigéria", flag: "🇳🇬", count: 10 },
];

export interface AITalentAlert {
  id: string;
  name: string;
  age: number;
  position: string;
  club: string;
  score: number;
  tag: string;
}

export const AI_TALENT_ALERTS: AITalentAlert[] = [
  { id: "a1", name: "Ahmed Ali", age: 18, position: "BU", club: "Académie Sfax", score: 94, tag: "Pépite détectée" },
  { id: "a2", name: "Yassine Khemiri", age: 20, position: "MOC", club: "US Monastir", score: 89, tag: "Sous-évalué" },
  { id: "a3", name: "Omar Diallo", age: 19, position: "DC", club: "Génération Foot", score: 87, tag: "Fort potentiel" },
];

export const SCOUT_PLAYERS: ScoutPlayer[] = [
  {
    id: "sp1", name: "Ahmed Ali", club: "Académie Sfax", country: "Tunisie", countryFlag: "🇹🇳",
    age: 18, position: "BU", positionFull: "Buteur", foot: "Droit", height: "1.83 m",
    value: "1.2M€", valueNum: 1.2, salary: "8k€/mois", aiScore: 94, potential: 92, injuryRisk: 12,
    teamCompat: 88, transferSuccess: 84, speed: 91, technique: 86, physical: 79, vision: 82, mental: 85, finishing: 90,
    goals: 24, assists: 7, xg: 0.78, matches: 28, league: "Ligue 1 Tunisie",
    similarTo: [{ name: "Mbappé", pct: 71 }, { name: "Vinicius", pct: 68 }],
    replaces: "Ahmed Ben Salah",
    valueHistory: [
      { month: "Jan", value: 0.6 }, { month: "Mar", value: 0.8 }, { month: "Mai", value: 1.0 }, { month: "Juin", value: 1.2 },
      { month: "Sep", value: 1.5, predicted: true }, { month: "Déc", value: 1.8, predicted: true },
    ],
  },
  {
    id: "sp2", name: "Yassine Khemiri", club: "US Monastir", country: "Tunisie", countryFlag: "🇹🇳",
    age: 20, position: "MOC", positionFull: "Milieu offensif", foot: "Gauche", height: "1.76 m",
    value: "2.1M€", valueNum: 2.1, salary: "11k€/mois", aiScore: 89, potential: 88, injuryRisk: 18,
    teamCompat: 91, transferSuccess: 79, speed: 84, technique: 90, physical: 72, vision: 91, mental: 83, finishing: 78,
    goals: 12, assists: 16, xg: 0.45, matches: 30, league: "Ligue 1 Tunisie",
    similarTo: [{ name: "Bernardo Silva", pct: 74 }, { name: "Ødegaard", pct: 66 }],
    replaces: "Youssef Trabelsi",
    valueHistory: [
      { month: "Jan", value: 1.4 }, { month: "Mar", value: 1.7 }, { month: "Mai", value: 1.9 }, { month: "Juin", value: 2.1 },
      { month: "Sep", value: 2.5, predicted: true }, { month: "Déc", value: 2.9, predicted: true },
    ],
  },
  {
    id: "sp3", name: "Omar Diallo", club: "Génération Foot", country: "Sénégal", countryFlag: "🇸🇳",
    age: 19, position: "DC", positionFull: "Défenseur central", foot: "Droit", height: "1.89 m",
    value: "1.8M€", valueNum: 1.8, salary: "9k€/mois", aiScore: 87, potential: 90, injuryRisk: 15,
    teamCompat: 85, transferSuccess: 81, speed: 82, technique: 74, physical: 92, vision: 70, mental: 88, finishing: 45,
    goals: 3, assists: 1, xg: 0.08, matches: 26, league: "Ligue 1 Sénégal",
    similarTo: [{ name: "Koulibaly", pct: 72 }, { name: "Saliba", pct: 64 }],
    replaces: "Karim Dridi",
    valueHistory: [
      { month: "Jan", value: 1.1 }, { month: "Mar", value: 1.4 }, { month: "Mai", value: 1.6 }, { month: "Juin", value: 1.8 },
      { month: "Sep", value: 2.2, predicted: true }, { month: "Déc", value: 2.6, predicted: true },
    ],
  },
  {
    id: "sp4", name: "Karim Mansouri", club: "Paradou AC", country: "Algérie", countryFlag: "🇩🇿",
    age: 21, position: "AG", positionFull: "Ailier gauche", foot: "Droit", height: "1.78 m",
    value: "2.6M€", valueNum: 2.6, salary: "13k€/mois", aiScore: 86, potential: 87, injuryRisk: 22,
    teamCompat: 80, transferSuccess: 76, speed: 93, technique: 85, physical: 75, vision: 80, mental: 78, finishing: 82,
    goals: 15, assists: 11, xg: 0.52, matches: 29, league: "Ligue 1 Algérie",
    similarTo: [{ name: "Saïd Benrahma", pct: 70 }, { name: "Ziyech", pct: 63 }],
    replaces: "Mohamed Sassi",
    valueHistory: [
      { month: "Jan", value: 1.9 }, { month: "Mar", value: 2.2 }, { month: "Mai", value: 2.4 }, { month: "Juin", value: 2.6 },
      { month: "Sep", value: 3.0, predicted: true }, { month: "Déc", value: 3.4, predicted: true },
    ],
  },
  {
    id: "sp5", name: "Lucas Ferreira", club: "Boavista", country: "Portugal", countryFlag: "🇵🇹",
    age: 22, position: "MC", positionFull: "Milieu central", foot: "Droit", height: "1.81 m",
    value: "3.4M€", valueNum: 3.4, salary: "18k€/mois", aiScore: 85, potential: 86, injuryRisk: 14,
    teamCompat: 83, transferSuccess: 72, speed: 80, technique: 88, physical: 82, vision: 87, mental: 84, finishing: 70,
    goals: 6, assists: 9, xg: 0.22, matches: 31, league: "Liga Portugal",
    similarTo: [{ name: "Rúben Neves", pct: 73 }, { name: "Bruno Fernandes", pct: 61 }],
    replaces: "Ali Mansouri",
    valueHistory: [
      { month: "Jan", value: 2.8 }, { month: "Mar", value: 3.0 }, { month: "Mai", value: 3.2 }, { month: "Juin", value: 3.4 },
      { month: "Sep", value: 3.8, predicted: true }, { month: "Déc", value: 4.1, predicted: true },
    ],
  },
  {
    id: "sp6", name: "Ibrahim Touré", club: "ASEC Mimosas", country: "Côte d'Ivoire", countryFlag: "🇨🇮",
    age: 17, position: "MC", positionFull: "Milieu box-to-box", foot: "Droit", height: "1.80 m",
    value: "0.9M€", valueNum: 0.9, salary: "5k€/mois", aiScore: 91, potential: 95, injuryRisk: 10,
    teamCompat: 86, transferSuccess: 88, speed: 86, technique: 83, physical: 80, vision: 85, mental: 82, finishing: 68,
    goals: 5, assists: 8, xg: 0.18, matches: 22, league: "Ligue 1 Côte d'Ivoire",
    similarTo: [{ name: "Yaya Touré", pct: 69 }, { name: "Camavinga", pct: 67 }],
    replaces: "Sami Bouazizi",
    valueHistory: [
      { month: "Jan", value: 0.4 }, { month: "Mar", value: 0.6 }, { month: "Mai", value: 0.75 }, { month: "Juin", value: 0.9 },
      { month: "Sep", value: 1.3, predicted: true }, { month: "Déc", value: 1.7, predicted: true },
    ],
  },
  {
    id: "sp7", name: "Mehdi Ouali", club: "RS Berkane", country: "Maroc", countryFlag: "🇲🇦",
    age: 23, position: "DD", positionFull: "Latéral droit", foot: "Droit", height: "1.77 m",
    value: "1.5M€", valueNum: 1.5, salary: "10k€/mois", aiScore: 82, potential: 83, injuryRisk: 20,
    teamCompat: 84, transferSuccess: 80, speed: 88, technique: 79, physical: 81, vision: 76, mental: 80, finishing: 55,
    goals: 2, assists: 6, xg: 0.10, matches: 27, league: "Botola Pro",
    similarTo: [{ name: "Hakimi", pct: 65 }, { name: "Mazraoui", pct: 62 }],
    replaces: "Ridha Ammar",
    valueHistory: [
      { month: "Jan", value: 1.1 }, { month: "Mar", value: 1.3 }, { month: "Mai", value: 1.4 }, { month: "Juin", value: 1.5 },
      { month: "Sep", value: 1.7, predicted: true }, { month: "Déc", value: 1.9, predicted: true },
    ],
  },
  {
    id: "sp8", name: "David Okonkwo", club: "Enyimba FC", country: "Nigéria", countryFlag: "🇳🇬",
    age: 24, position: "GB", positionFull: "Gardien", foot: "Droit", height: "1.92 m",
    value: "1.1M€", valueNum: 1.1, salary: "9k€/mois", aiScore: 80, potential: 81, injuryRisk: 16,
    teamCompat: 78, transferSuccess: 74, speed: 60, technique: 72, physical: 88, vision: 75, mental: 86, finishing: 20,
    goals: 0, assists: 0, xg: 0.0, matches: 30, league: "NPFL",
    similarTo: [{ name: "Onana", pct: 64 }, { name: "Bounou", pct: 58 }],
    replaces: "Haddad",
    valueHistory: [
      { month: "Jan", value: 0.8 }, { month: "Mar", value: 0.9 }, { month: "Mai", value: 1.0 }, { month: "Juin", value: 1.1 },
      { month: "Sep", value: 1.3, predicted: true }, { month: "Déc", value: 1.5, predicted: true },
    ],
  },
];

export function getScoutPlayer(id: string): ScoutPlayer | undefined {
  return SCOUT_PLAYERS.find((p) => p.id === id);
}

export const POSITIONS = ["Tous", "GB", "DC", "DD", "DG", "MC", "MOC", "AG", "AD", "BU"];
export const COUNTRIES = ["Tous", "Tunisie", "Algérie", "Maroc", "Sénégal", "Portugal", "Côte d'Ivoire", "Nigéria"];
export const LEAGUES = ["Toutes", "Ligue 1 Tunisie", "Ligue 1 Algérie", "Botola Pro", "Liga Portugal", "NPFL", "Ligue 1 Côte d'Ivoire", "Ligue 1 Sénégal"];

// ===== Negotiations Kanban =====
export type NegoStage = "prospect" | "contacte" | "discussion" | "offre" | "accepte";

export interface NegoCard {
  id: string;
  player: string;
  club: string;
  value: string;
  stage: NegoStage;
  agent: string;
  priority: "high" | "medium" | "low";
}

export const NEGO_STAGES: { id: NegoStage; label: string; color: string }[] = [
  { id: "prospect", label: "Prospect", color: "#6366F1" },
  { id: "contacte", label: "Contacté", color: "#3B82F6" },
  { id: "discussion", label: "Discussion", color: "#8B5CF6" },
  { id: "offre", label: "Offre", color: "#F59E0B" },
  { id: "accepte", label: "Accepté", color: "#22C55E" },
];

export const NEGO_CARDS: NegoCard[] = [
  { id: "n1", player: "Ahmed Ali", club: "Académie Sfax", value: "1.2M€", stage: "discussion", agent: "M. Trabelsi", priority: "high" },
  { id: "n2", player: "Yassine Khemiri", club: "US Monastir", value: "2.1M€", stage: "offre", agent: "Sport Agency", priority: "high" },
  { id: "n3", player: "Omar Diallo", club: "Génération Foot", value: "1.8M€", stage: "contacte", agent: "AfricaSports", priority: "medium" },
  { id: "n4", player: "Ibrahim Touré", club: "ASEC Mimosas", value: "0.9M€", stage: "prospect", agent: "—", priority: "high" },
  { id: "n5", player: "Mehdi Ouali", club: "RS Berkane", value: "1.5M€", stage: "discussion", agent: "Atlas Mgmt", priority: "medium" },
  { id: "n6", player: "Karim Mansouri", club: "Paradou AC", value: "2.6M€", stage: "accepte", agent: "Elite Foot", priority: "low" },
];

// ===== Transfer Center =====
export type TransferStatus = "offre_envoyee" | "en_negociation" | "acceptee" | "refusee" | "brouillon";

export interface TransferRow {
  id: string;
  player: string;
  club: string;
  value: string;
  offer: string;
  status: TransferStatus;
  budgetImpact: string;
}

export const TRANSFER_STATUS_CONFIG: Record<TransferStatus, { label: string; color: string }> = {
  brouillon: { label: "Brouillon", color: "#6366F1" },
  offre_envoyee: { label: "Offre envoyée", color: "#3B82F6" },
  en_negociation: { label: "En négociation", color: "#F59E0B" },
  acceptee: { label: "Acceptée", color: "#22C55E" },
  refusee: { label: "Refusée", color: "#EF4444" },
};

export const TRANSFER_ROWS: TransferRow[] = [
  { id: "t1", player: "Ahmed Ali", club: "Académie Sfax", value: "1.2M€", offer: "1.0M€", status: "en_negociation", budgetImpact: "-1.0M€" },
  { id: "t2", player: "Yassine Khemiri", club: "US Monastir", value: "2.1M€", offer: "2.0M€", status: "offre_envoyee", budgetImpact: "-2.0M€" },
  { id: "t3", player: "Karim Mansouri", club: "Paradou AC", value: "2.6M€", offer: "2.5M€", status: "acceptee", budgetImpact: "-2.5M€" },
  { id: "t4", player: "Mehdi Ouali", club: "RS Berkane", value: "1.5M€", offer: "1.3M€", status: "refusee", budgetImpact: "0€" },
  { id: "t5", player: "Ibrahim Touré", club: "ASEC Mimosas", value: "0.9M€", offer: "—", status: "brouillon", budgetImpact: "—" },
];

// ===== Requests & Validation Workflow =====
export type ValidationStep = "scout" | "recruteur" | "coach" | "finance" | "responsable";
export type StepStatus = "approved" | "pending" | "rejected" | "waiting";

export interface ValidationRequest {
  id: string;
  player: string;
  position: string;
  value: string;
  requestedBy: string;
  date: string;
  steps: { step: ValidationStep; label: string; status: StepStatus; comment?: string; by?: string }[];
}

export const VALIDATION_REQUESTS: ValidationRequest[] = [
  {
    id: "r1", player: "Ahmed Ali", position: "BU", value: "1.2M€", requestedBy: "Scout Sfax", date: "18/06/2026",
    steps: [
      { step: "scout", label: "Scout", status: "approved", by: "H. Bouzid", comment: "Pépite confirmée, profil elite." },
      { step: "recruteur", label: "Recruteur", status: "approved", by: "K. Belaïd", comment: "Score IA 94%, priorité absolue." },
      { step: "coach", label: "Coach", status: "pending" },
      { step: "finance", label: "Finance", status: "waiting" },
      { step: "responsable", label: "Responsable", status: "waiting" },
    ],
  },
  {
    id: "r2", player: "Omar Diallo", position: "DC", value: "1.8M€", requestedBy: "Scout Afrique", date: "16/06/2026",
    steps: [
      { step: "scout", label: "Scout", status: "approved", by: "M. Sow" },
      { step: "recruteur", label: "Recruteur", status: "approved", by: "K. Belaïd" },
      { step: "coach", label: "Coach", status: "approved", by: "Coach Riadh", comment: "Profil idéal pour la charnière." },
      { step: "finance", label: "Finance", status: "pending" },
      { step: "responsable", label: "Responsable", status: "waiting" },
    ],
  },
  {
    id: "r3", player: "Mehdi Ouali", position: "DD", value: "1.5M€", requestedBy: "Scout Maroc", date: "12/06/2026",
    steps: [
      { step: "scout", label: "Scout", status: "approved", by: "Y. Alami" },
      { step: "recruteur", label: "Recruteur", status: "rejected", by: "K. Belaïd", comment: "Budget latéral déjà couvert cette saison." },
      { step: "coach", label: "Coach", status: "waiting" },
      { step: "finance", label: "Finance", status: "waiting" },
      { step: "responsable", label: "Responsable", status: "waiting" },
    ],
  },
];

// ===== AI Recruitment search presets =====
export const AI_SEARCH_PRESETS = [
  "Défenseur central, budget 500k, moins de 24 ans",
  "Ailier rapide, pied gauche, Afrique du Nord",
  "Buteur potentiel > 90%, moins de 20 ans",
  "Milieu créatif, vision > 85, budget 2M€",
];

export interface AIRecommendation {
  rank: number;
  player: ScoutPlayer;
  matchScore: number;
}

// ===== Contracts =====
export interface ContractAdvice {
  recommendedSalary: string;
  riskLevel: "Faible" | "Moyen" | "Élevé";
  recommendedDuration: string;
  suggestedBonus: string;
  releaseClause: string;
}

export function getContractAdvice(player: ScoutPlayer): ContractAdvice {
  const baseSalary = Math.round(player.valueNum * 6 + player.aiScore * 0.05);
  return {
    recommendedSalary: `${baseSalary}k€/mois`,
    riskLevel: player.injuryRisk >= 60 ? "Élevé" : player.injuryRisk >= 30 ? "Moyen" : "Faible",
    recommendedDuration: player.age <= 20 ? "5 ans" : player.age <= 24 ? "4 ans" : "3 ans",
    suggestedBonus: `${Math.round(player.valueNum * 0.8 * 10) / 10}k€ / but`,
    releaseClause: `${Math.round(player.valueNum * 2.5 * 10) / 10}M€`,
  };
}

// ===== Video Scouting =====
export interface VideoTimelineEvent {
  id: string;
  time: string;
  seconds: number;
  label: string;
  type: "sprint" | "passe" | "tir" | "pressing" | "dribble";
}

export const VIDEO_TIMELINE: VideoTimelineEvent[] = [
  { id: "v1", time: "00:15", seconds: 15, label: "Sprint 34 km/h", type: "sprint" },
  { id: "v2", time: "03:12", seconds: 192, label: "Passe clé", type: "passe" },
  { id: "v3", time: "08:55", seconds: 535, label: "Tir cadré", type: "tir" },
  { id: "v4", time: "12:40", seconds: 760, label: "Dribble réussi", type: "dribble" },
  { id: "v5", time: "15:30", seconds: 930, label: "Pressing intense", type: "pressing" },
];

export const VIDEO_ANALYSIS = [
  { label: "Vitesse max", value: "34.2 km/h", color: "#3B82F6" },
  { label: "Distance", value: "11.4 km", color: "#22C55E" },
  { label: "Accélérations", value: "42", color: "#F59E0B" },
  { label: "Passes réussies", value: "89%", color: "#8B5CF6" },
  { label: "Dribbles", value: "7/9", color: "#EF4444" },
];

// ===== Reports =====
export const REPORT_TEMPLATES = [
  { id: "rep1", title: "Rapport Shortlist complète", desc: "28 cibles avec scores IA et valeurs", icon: "star" },
  { id: "rep2", title: "Synthèse Négociations", desc: "Pipeline et statuts des 6 dossiers actifs", icon: "handshake" },
  { id: "rep3", title: "Analyse Budget Transferts", desc: "Allocation, dépenses et projection", icon: "wallet" },
  { id: "rep4", title: "Top Talents par poste", desc: "Meilleurs prospects classés par position", icon: "trophy" },
];
