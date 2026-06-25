export type PlayerAvailability = "Disponible" | "Blessé" | "Fin contrat" | "Limité";

export interface SquadPlayer {
  id: string;
  name: string;
  position: string;
  positionFull: string;
  nationality: string;
  flag: string;
  age: number;
  marketValue: string;
  marketValueNum: number;
  availability: PlayerAvailability;
  ovr: number;
  preferredPosition: string;
  secondaryPosition: string;
  stats: {
    goals: number;
    assists: number;
    minutes: number;
    passAccuracy: number;
    distance: number;
  };
  radar: {
    speed: number;
    passing: number;
    shooting: number;
    physical: number;
    vision: number;
    defending: number;
  };
  performanceHistory: { month: string; score: number }[];
  injuries: { year: string; injury: string; status: string }[];
  riskScore: number;
  contract: {
    salary: string;
    bonus: string;
    clause: string;
    expiration: string;
    daysRemaining: number;
    startYear: number;
    endYear: number;
  };
  marketHistory: { year: string; value: number }[];
  matches: {
    id: string;
    opponent: string;
    score: string;
    rating: number;
    goals: number;
    assists: number;
    date: string;
  }[];
  videos: { id: string; title: string; type: "Match" | "Training" | "Highlights"; duration: string }[];
}

export const SQUAD_STATS = {
  total: 32,
  available: 24,
  injured: 4,
  contractEnding: 4,
};

export const SQUAD_PLAYERS: SquadPlayer[] = [
  {
    id: "1",
    name: "Ahmed Ben Salah",
    position: "BU",
    positionFull: "Avant-centre",
    nationality: "Tunisie",
    flag: "🇹🇳",
    age: 24,
    marketValue: "2.3M €",
    marketValueNum: 2.3,
    availability: "Blessé",
    ovr: 87,
    preferredPosition: "BU",
    secondaryPosition: "AG",
    stats: { goals: 18, assists: 6, minutes: 2340, passAccuracy: 82, distance: 298 },
    radar: { speed: 88, passing: 78, shooting: 91, physical: 85, vision: 80, defending: 45 },
    performanceHistory: [
      { month: "Jul", score: 72 }, { month: "Aoû", score: 75 }, { month: "Sep", score: 78 },
      { month: "Oct", score: 82 }, { month: "Nov", score: 85 }, { month: "Déc", score: 84 },
      { month: "Jan", score: 86 }, { month: "Fév", score: 88 }, { month: "Mar", score: 87 },
      { month: "Avr", score: 89 }, { month: "Mai", score: 87 }, { month: "Jun", score: 85 },
    ],
    injuries: [
      { year: "2024", injury: "Knee Injury", status: "Récupéré" },
      { year: "2025", injury: "Ankle Sprain", status: "Récupéré" },
      { year: "2026", injury: "Genou Droit — Grade II", status: "En cours" },
    ],
    riskScore: 82,
    contract: { salary: "45 000 DT/mois", bonus: "5 000 DT/but", clause: "3M €", expiration: "30/06/2027", daysRemaining: 90, startYear: 2024, endYear: 2027 },
    marketHistory: [
      { year: "2023", value: 1.2 }, { year: "2024", value: 1.6 }, { year: "2025", value: 2.0 }, { year: "2026", value: 2.3 },
    ],
    matches: [
      { id: "m1", opponent: "EST", score: "3-1", rating: 8.5, goals: 2, assists: 1, date: "15/06/2026" },
      { id: "m2", opponent: "CA", score: "2-2", rating: 7.2, goals: 1, assists: 0, date: "08/06/2026" },
      { id: "m3", opponent: "CSS", score: "1-0", rating: 7.8, goals: 0, assists: 1, date: "01/06/2026" },
    ],
    videos: [
      { id: "v1", title: "Match vs EST", type: "Match", duration: "12:34" },
      { id: "v2", title: "Training Session", type: "Training", duration: "8:20" },
      { id: "v3", title: "Season Highlights", type: "Highlights", duration: "5:45" },
    ],
  },
  {
    id: "2",
    name: "Ali Ben Youssef",
    position: "MC",
    positionFull: "Milieu central",
    nationality: "Tunisie",
    flag: "🇹🇳",
    age: 26,
    marketValue: "1.8M €",
    marketValueNum: 1.8,
    availability: "Limité",
    ovr: 84,
    preferredPosition: "MOC",
    secondaryPosition: "MC",
    stats: { goals: 8, assists: 12, minutes: 2680, passAccuracy: 89, distance: 312 },
    radar: { speed: 75, passing: 92, shooting: 72, physical: 80, vision: 88, defending: 70 },
    performanceHistory: [
      { month: "Jul", score: 70 }, { month: "Aoû", score: 73 }, { month: "Sep", score: 76 },
      { month: "Oct", score: 80 }, { month: "Nov", score: 82 }, { month: "Déc", score: 83 },
      { month: "Jan", score: 84 }, { month: "Fév", score: 85 }, { month: "Mar", score: 84 },
      { month: "Avr", score: 86 }, { month: "Mai", score: 84 }, { month: "Jun", score: 83 },
    ],
    injuries: [{ year: "2026", injury: "Cheville Droite", status: "En rééducation" }],
    riskScore: 75,
    contract: { salary: "38 000 DT/mois", bonus: "3 000 DT/but", clause: "2.5M €", expiration: "30/06/2028", daysRemaining: 730, startYear: 2023, endYear: 2028 },
    marketHistory: [
      { year: "2023", value: 1.0 }, { year: "2024", value: 1.3 }, { year: "2025", value: 1.6 }, { year: "2026", value: 1.8 },
    ],
    matches: [
      { id: "m1", opponent: "EST", score: "3-1", rating: 7.8, goals: 0, assists: 2, date: "15/06/2026" },
      { id: "m2", opponent: "CA", score: "2-2", rating: 8.1, goals: 1, assists: 1, date: "08/06/2026" },
    ],
    videos: [
      { id: "v1", title: "Match vs EST", type: "Match", duration: "12:34" },
      { id: "v2", title: "Passing Drills", type: "Training", duration: "6:15" },
    ],
  },
  {
    id: "3",
    name: "Karim Sassi",
    position: "DC",
    positionFull: "Défenseur central",
    nationality: "Tunisie",
    flag: "🇹🇳",
    age: 28,
    marketValue: "1.5M €",
    marketValueNum: 1.5,
    availability: "Disponible",
    ovr: 82,
    preferredPosition: "DC",
    secondaryPosition: "DD",
    stats: { goals: 3, assists: 1, minutes: 2880, passAccuracy: 86, distance: 265 },
    radar: { speed: 72, passing: 78, shooting: 55, physical: 90, vision: 70, defending: 92 },
    performanceHistory: [
      { month: "Jul", score: 78 }, { month: "Aoû", score: 79 }, { month: "Sep", score: 80 },
      { month: "Oct", score: 81 }, { month: "Nov", score: 82 }, { month: "Déc", score: 82 },
      { month: "Jan", score: 83 }, { month: "Fév", score: 82 }, { month: "Mar", score: 81 },
      { month: "Avr", score: 82 }, { month: "Mai", score: 83 }, { month: "Jun", score: 82 },
    ],
    injuries: [],
    riskScore: 22,
    contract: { salary: "35 000 DT/mois", bonus: "2 000 DT/clean sheet", clause: "2M €", expiration: "30/06/2027", daysRemaining: 90, startYear: 2024, endYear: 2027 },
    marketHistory: [
      { year: "2023", value: 1.1 }, { year: "2024", value: 1.2 }, { year: "2025", value: 1.4 }, { year: "2026", value: 1.5 },
    ],
    matches: [
      { id: "m1", opponent: "EST", score: "3-1", rating: 7.5, goals: 0, assists: 0, date: "15/06/2026" },
    ],
    videos: [{ id: "v1", title: "Defensive Highlights", type: "Highlights", duration: "4:30" }],
  },
  {
    id: "4",
    name: "Walid Hammami",
    position: "DG",
    positionFull: "Défenseur gauche",
    nationality: "Tunisie",
    flag: "🇹🇳",
    age: 22,
    marketValue: "950K €",
    marketValueNum: 0.95,
    availability: "Limité",
    ovr: 78,
    preferredPosition: "DG",
    secondaryPosition: "AG",
    stats: { goals: 2, assists: 5, minutes: 2100, passAccuracy: 80, distance: 285 },
    radar: { speed: 85, passing: 75, shooting: 60, physical: 78, vision: 72, defending: 80 },
    performanceHistory: [
      { month: "Jul", score: 68 }, { month: "Aoû", score: 70 }, { month: "Sep", score: 72 },
      { month: "Oct", score: 74 }, { month: "Nov", score: 76 }, { month: "Déc", score: 77 },
      { month: "Jan", score: 78 }, { month: "Fév", score: 77 }, { month: "Mar", score: 78 },
      { month: "Avr", score: 79 }, { month: "Mai", score: 78 }, { month: "Jun", score: 77 },
    ],
    injuries: [{ year: "2026", injury: "Cuisse Gauche", status: "En rééducation" }],
    riskScore: 58,
    contract: { salary: "22 000 DT/mois", bonus: "1 500 DT/assist", clause: "1.2M €", expiration: "30/06/2026", daysRemaining: 12, startYear: 2024, endYear: 2026 },
    marketHistory: [
      { year: "2023", value: 0.4 }, { year: "2024", value: 0.6 }, { year: "2025", value: 0.8 }, { year: "2026", value: 0.95 },
    ],
    matches: [],
    videos: [{ id: "v1", title: "Training", type: "Training", duration: "7:00" }],
  },
  {
    id: "5",
    name: "Mohamed Trabelsi",
    position: "GB",
    positionFull: "Gardien de but",
    nationality: "Tunisie",
    flag: "🇹🇳",
    age: 25,
    marketValue: "1.2M €",
    marketValueNum: 1.2,
    availability: "Disponible",
    ovr: 83,
    preferredPosition: "GB",
    secondaryPosition: "—",
    stats: { goals: 0, assists: 0, minutes: 2700, passAccuracy: 75, distance: 45 },
    radar: { speed: 60, passing: 70, shooting: 20, physical: 82, vision: 75, defending: 88 },
    performanceHistory: [
      { month: "Jul", score: 80 }, { month: "Aoû", score: 81 }, { month: "Sep", score: 82 },
      { month: "Oct", score: 83 }, { month: "Nov", score: 83 }, { month: "Déc", score: 84 },
      { month: "Jan", score: 83 }, { month: "Fév", score: 82 }, { month: "Mar", score: 83 },
      { month: "Avr", score: 84 }, { month: "Mai", score: 83 }, { month: "Jun", score: 83 },
    ],
    injuries: [],
    riskScore: 15,
    contract: { salary: "32 000 DT/mois", bonus: "3 000 DT/clean sheet", clause: "1.8M €", expiration: "30/06/2028", daysRemaining: 730, startYear: 2023, endYear: 2028 },
    marketHistory: [
      { year: "2023", value: 0.8 }, { year: "2024", value: 0.9 }, { year: "2025", value: 1.1 }, { year: "2026", value: 1.2 },
    ],
    matches: [{ id: "m1", opponent: "EST", score: "3-1", rating: 8.0, goals: 0, assists: 0, date: "15/06/2026" }],
    videos: [{ id: "v1", title: "Saves Compilation", type: "Highlights", duration: "3:20" }],
  },
  {
    id: "6",
    name: "Mehdi Jebali",
    position: "MD",
    positionFull: "Milieu droit",
    nationality: "Tunisie",
    flag: "🇹🇳",
    age: 23,
    marketValue: "1.1M €",
    marketValueNum: 1.1,
    availability: "Disponible",
    ovr: 80,
    preferredPosition: "MD",
    secondaryPosition: "AD",
    stats: { goals: 6, assists: 9, minutes: 2450, passAccuracy: 84, distance: 305 },
    radar: { speed: 88, passing: 82, shooting: 75, physical: 76, vision: 80, defending: 55 },
    performanceHistory: [
      { month: "Jul", score: 72 }, { month: "Aoû", score: 74 }, { month: "Sep", score: 76 },
      { month: "Oct", score: 78 }, { month: "Nov", score: 79 }, { month: "Déc", score: 80 },
      { month: "Jan", score: 80 }, { month: "Fév", score: 81 }, { month: "Mar", score: 80 },
      { month: "Avr", score: 81 }, { month: "Mai", score: 80 }, { month: "Jun", score: 79 },
    ],
    injuries: [{ year: "2026", injury: "Ischio-jambiers", status: "Récupéré" }],
    riskScore: 42,
    contract: { salary: "28 000 DT/mois", bonus: "2 000 DT/but", clause: "1.5M €", expiration: "30/06/2026", daysRemaining: 12, startYear: 2024, endYear: 2026 },
    marketHistory: [
      { year: "2023", value: 0.5 }, { year: "2024", value: 0.7 }, { year: "2025", value: 0.9 }, { year: "2026", value: 1.1 },
    ],
    matches: [{ id: "m1", opponent: "EST", score: "3-1", rating: 7.6, goals: 1, assists: 0, date: "15/06/2026" }],
    videos: [{ id: "v1", title: "Dribbling Skills", type: "Highlights", duration: "4:10" }],
  },
  {
    id: "7",
    name: "Yassine Brahmi",
    position: "AG",
    positionFull: "Ailier gauche",
    nationality: "Tunisie",
    flag: "🇹🇳",
    age: 27,
    marketValue: "2.0M €",
    marketValueNum: 2.0,
    availability: "Disponible",
    ovr: 86,
    preferredPosition: "AG",
    secondaryPosition: "MOC",
    stats: { goals: 14, assists: 10, minutes: 2560, passAccuracy: 83, distance: 290 },
    radar: { speed: 90, passing: 85, shooting: 82, physical: 78, vision: 86, defending: 50 },
    performanceHistory: [
      { month: "Jul", score: 80 }, { month: "Aoû", score: 82 }, { month: "Sep", score: 83 },
      { month: "Oct", score: 84 }, { month: "Nov", score: 85 }, { month: "Déc", score: 86 },
      { month: "Jan", score: 86 }, { month: "Fév", score: 87 }, { month: "Mar", score: 86 },
      { month: "Avr", score: 87 }, { month: "Mai", score: 86 }, { month: "Jun", score: 85 },
    ],
    injuries: [],
    riskScore: 35,
    contract: { salary: "42 000 DT/mois", bonus: "4 000 DT/but", clause: "2.8M €", expiration: "30/06/2027", daysRemaining: 90, startYear: 2024, endYear: 2027 },
    marketHistory: [
      { year: "2023", value: 1.4 }, { year: "2024", value: 1.6 }, { year: "2025", value: 1.8 }, { year: "2026", value: 2.0 },
    ],
    matches: [{ id: "m1", opponent: "EST", score: "3-1", rating: 8.8, goals: 1, assists: 2, date: "15/06/2026" }],
    videos: [{ id: "v1", title: "Match vs EST", type: "Match", duration: "12:34" }],
  },
  {
    id: "8",
    name: "Fares Msakni",
    position: "AD",
    positionFull: "Ailier droit",
    nationality: "Tunisie",
    flag: "🇹🇳",
    age: 29,
    marketValue: "1.6M €",
    marketValueNum: 1.6,
    availability: "Fin contrat",
    ovr: 81,
    preferredPosition: "AD",
    secondaryPosition: "MD",
    stats: { goals: 10, assists: 7, minutes: 2200, passAccuracy: 81, distance: 275 },
    radar: { speed: 86, passing: 80, shooting: 78, physical: 74, vision: 82, defending: 48 },
    performanceHistory: [
      { month: "Jul", score: 78 }, { month: "Aoû", score: 79 }, { month: "Sep", score: 80 },
      { month: "Oct", score: 81 }, { month: "Nov", score: 81 }, { month: "Déc", score: 80 },
      { month: "Jan", score: 81 }, { month: "Fév", score: 80 }, { month: "Mar", score: 81 },
      { month: "Avr", score: 81 }, { month: "Mai", score: 80 }, { month: "Jun", score: 79 },
    ],
    injuries: [],
    riskScore: 48,
    contract: { salary: "30 000 DT/mois", bonus: "2 500 DT/but", clause: "2M €", expiration: "30/06/2026", daysRemaining: 12, startYear: 2022, endYear: 2026 },
    marketHistory: [
      { year: "2023", value: 1.8 }, { year: "2024", value: 1.7 }, { year: "2025", value: 1.6 }, { year: "2026", value: 1.6 },
    ],
    matches: [],
    videos: [],
  },
];

export function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export function getPlayerById(id: string) {
  return SQUAD_PLAYERS.find((p) => p.id === id);
}

export function getAvailabilityColor(status: PlayerAvailability) {
  if (status === "Disponible") return "var(--color-state-success)";
  if (status === "Blessé") return "var(--color-state-danger)";
  if (status === "Fin contrat") return "var(--color-state-warning)";
  return "var(--color-state-info)";
}

export function getAvailabilityTone(status: PlayerAvailability): "success" | "danger" | "warning" | "info" {
  if (status === "Disponible") return "success";
  if (status === "Blessé") return "danger";
  if (status === "Fin contrat") return "warning";
  return "info";
}
