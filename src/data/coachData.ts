export const COACH_ACCENT = "#FF7A00";

export interface CoachPlayer {
  id: string;
  name: string;
  number: number;
  position: string;
  positionFull: string;
  age: number;
  nationality: string;
  flag: string;
  forme: number;
  fatigue: number;
  odinScore: number;
  status: "Disponible" | "Blessé" | "Suspendu" | "En sélection" | "Surveillance";
  injury?: string;
  returnDate?: string;
  goals: number;
  assists: number;
  matches: number;
  contractEnd: string;
  speed: number;
  endurance: number;
  passes: number;
  shots: number;
  defense: number;
  mental: number;
  recentMatches: { date: string; vs: string; rating: number; goals: number; assists: number }[];
}

export const SQUAD: CoachPlayer[] = [
  {
    id: "p1", name: "Khalil Mansour", number: 1, position: "GK", positionFull: "Gardien", age: 28, nationality: "Tunisie", flag: "🇹🇳",
    forme: 84, fatigue: 25, odinScore: 81, status: "Disponible",
    goals: 0, assists: 1, matches: 26, contractEnd: "2027-06",
    speed: 62, endurance: 75, passes: 72, shots: 45, defense: 88, mental: 82,
    recentMatches: [{ date: "18/06", vs: "EST", rating: 7.8, goals: 0, assists: 0 }, { date: "14/06", vs: "CSS", rating: 8.1, goals: 0, assists: 1 }],
  },
  {
    id: "p2", name: "Aymen Darragi", number: 5, position: "DC", positionFull: "Défenseur central", age: 26, nationality: "Tunisie", flag: "🇹🇳",
    forme: 79, fatigue: 38, odinScore: 76, status: "Disponible",
    goals: 2, assists: 1, matches: 22, contractEnd: "2026-12",
    speed: 74, endurance: 80, passes: 68, shots: 52, defense: 85, mental: 78,
    recentMatches: [{ date: "18/06", vs: "EST", rating: 7.2, goals: 0, assists: 0 }, { date: "14/06", vs: "CSS", rating: 7.5, goals: 1, assists: 0 }],
  },
  {
    id: "p3", name: "Sami Ben Khalifa", number: 4, position: "DC", positionFull: "Défenseur central", age: 29, nationality: "Tunisie", flag: "🇹🇳",
    forme: 88, fatigue: 20, odinScore: 84, status: "Disponible",
    goals: 3, assists: 0, matches: 28, contractEnd: "2028-06",
    speed: 70, endurance: 82, passes: 71, shots: 55, defense: 89, mental: 86,
    recentMatches: [{ date: "18/06", vs: "EST", rating: 8.2, goals: 1, assists: 0 }, { date: "14/06", vs: "CSS", rating: 7.8, goals: 0, assists: 0 }],
  },
  {
    id: "p4", name: "Hamza Selmi", number: 3, position: "LB", positionFull: "Latéral gauche", age: 23, nationality: "Tunisie", flag: "🇹🇳",
    forme: 72, fatigue: 55, odinScore: 70, status: "Surveillance",
    goals: 1, assists: 4, matches: 18, contractEnd: "2026-06",
    speed: 84, endurance: 76, passes: 74, shots: 60, defense: 78, mental: 72,
    recentMatches: [{ date: "18/06", vs: "EST", rating: 6.5, goals: 0, assists: 0 }, { date: "14/06", vs: "CSS", rating: 7.0, goals: 0, assists: 1 }],
  },
  {
    id: "p5", name: "Nidhal Jebali", number: 2, position: "RB", positionFull: "Latéral droit", age: 25, nationality: "Tunisie", flag: "🇹🇳",
    forme: 81, fatigue: 30, odinScore: 79, status: "Disponible",
    goals: 2, assists: 5, matches: 24, contractEnd: "2027-06",
    speed: 87, endurance: 80, passes: 73, shots: 62, defense: 80, mental: 75,
    recentMatches: [{ date: "18/06", vs: "EST", rating: 7.5, goals: 0, assists: 1 }, { date: "14/06", vs: "CSS", rating: 7.8, goals: 1, assists: 0 }],
  },
  {
    id: "p6", name: "Yassine Brahmi", number: 8, position: "MC", positionFull: "Milieu central", age: 28, nationality: "Tunisie", flag: "🇹🇳",
    forme: 91, fatigue: 22, odinScore: 87, status: "Disponible",
    goals: 8, assists: 11, matches: 29, contractEnd: "2027-06",
    speed: 78, endurance: 86, passes: 88, shots: 74, defense: 72, mental: 89,
    recentMatches: [{ date: "18/06", vs: "EST", rating: 8.4, goals: 1, assists: 2 }, { date: "14/06", vs: "CSS", rating: 8.0, goals: 0, assists: 1 }],
  },
  {
    id: "p7", name: "Mehdi Trabelsi", number: 6, position: "MDF", positionFull: "Milieu défensif", age: 24, nationality: "Tunisie", flag: "🇹🇳",
    forme: 76, fatigue: 62, odinScore: 74, status: "Surveillance",
    goals: 1, assists: 3, matches: 20, contractEnd: "2026-12",
    speed: 76, endurance: 84, passes: 80, shots: 60, defense: 82, mental: 77,
    recentMatches: [{ date: "18/06", vs: "EST", rating: 6.8, goals: 0, assists: 0 }, { date: "14/06", vs: "CSS", rating: 7.2, goals: 0, assists: 1 }],
  },
  {
    id: "p8", name: "Rami Zouaoui", number: 10, position: "MOC", positionFull: "Milieu offensif", age: 26, nationality: "Tunisie", flag: "🇹🇳",
    forme: 88, fatigue: 28, odinScore: 85, status: "Disponible",
    goals: 10, assists: 14, matches: 27, contractEnd: "2028-06",
    speed: 80, endurance: 79, passes: 90, shots: 82, defense: 65, mental: 88,
    recentMatches: [{ date: "18/06", vs: "EST", rating: 8.6, goals: 2, assists: 1 }, { date: "14/06", vs: "CSS", rating: 8.2, goals: 1, assists: 2 }],
  },
  {
    id: "p9", name: "Amine Letaief", number: 7, position: "AG", positionFull: "Ailier gauche", age: 22, nationality: "Tunisie", flag: "🇹🇳",
    forme: 85, fatigue: 33, odinScore: 83, status: "Disponible",
    goals: 7, assists: 8, matches: 25, contractEnd: "2027-06",
    speed: 92, endurance: 77, passes: 75, shots: 80, defense: 62, mental: 81,
    recentMatches: [{ date: "18/06", vs: "EST", rating: 7.9, goals: 1, assists: 0 }, { date: "14/06", vs: "CSS", rating: 8.1, goals: 0, assists: 2 }],
  },
  {
    id: "p10", name: "Firas Cherni", number: 11, position: "AD", positionFull: "Ailier droit", age: 21, nationality: "Tunisie", flag: "🇹🇳",
    forme: 79, fatigue: 41, odinScore: 77, status: "Disponible",
    goals: 5, assists: 7, matches: 22, contractEnd: "2026-06",
    speed: 90, endurance: 74, passes: 72, shots: 77, defense: 60, mental: 76,
    recentMatches: [{ date: "18/06", vs: "EST", rating: 7.3, goals: 0, assists: 1 }, { date: "14/06", vs: "CSS", rating: 7.6, goals: 1, assists: 0 }],
  },
  {
    id: "p11", name: "Ahmed Ben Ali", number: 9, position: "BU", positionFull: "Buteur", age: 27, nationality: "Tunisie", flag: "🇹🇳",
    forme: 0, fatigue: 100, odinScore: 89, status: "Blessé",
    injury: "Ischio-jambier Grade II", returnDate: "2026-07-05",
    goals: 18, assists: 6, matches: 21, contractEnd: "2029-06",
    speed: 85, endurance: 82, passes: 76, shots: 90, defense: 58, mental: 85,
    recentMatches: [{ date: "01/06", vs: "CAB", rating: 8.8, goals: 3, assists: 1 }, { date: "28/05", vs: "ST", rating: 8.5, goals: 2, assists: 0 }],
  },
  {
    id: "p12", name: "Karim Jelassi", number: 14, position: "BU", positionFull: "Attaquant", age: 24, nationality: "Tunisie", flag: "🇹🇳",
    forme: 74, fatigue: 45, odinScore: 73, status: "Disponible",
    goals: 4, assists: 2, matches: 16, contractEnd: "2027-06",
    speed: 82, endurance: 75, passes: 70, shots: 78, defense: 55, mental: 74,
    recentMatches: [{ date: "18/06", vs: "EST", rating: 6.8, goals: 0, assists: 0 }, { date: "14/06", vs: "CSS", rating: 7.0, goals: 1, assists: 0 }],
  },
  {
    id: "p13", name: "Ali Saidane", number: 17, position: "MC", positionFull: "Milieu", age: 20, nationality: "Tunisie", flag: "🇹🇳",
    forme: 0, fatigue: 80, odinScore: 70, status: "Suspendu",
    goals: 1, assists: 2, matches: 12, contractEnd: "2027-06",
    speed: 80, endurance: 78, passes: 75, shots: 65, defense: 70, mental: 72,
    recentMatches: [{ date: "10/06", vs: "CAB", rating: 7.1, goals: 0, assists: 1 }],
  },
  {
    id: "p14", name: "Walid Mhenni", number: 22, position: "DC", positionFull: "Défenseur", age: 31, nationality: "Tunisie", flag: "🇹🇳",
    forme: 82, fatigue: 28, odinScore: 80, status: "Disponible",
    goals: 1, assists: 0, matches: 20, contractEnd: "2026-12",
    speed: 68, endurance: 79, passes: 70, shots: 50, defense: 87, mental: 84,
    recentMatches: [{ date: "18/06", vs: "EST", rating: 7.4, goals: 0, assists: 0 }, { date: "14/06", vs: "CSS", rating: 7.7, goals: 1, assists: 0 }],
  },
];

export const FORMATIONS: Record<string, { label: string; positions: { pos: string; x: number; y: number }[] }> = {
  "4-3-3": {
    label: "4-3-3",
    positions: [
      { pos: "GK",  x: 50, y: 88 },
      { pos: "RB",  x: 80, y: 70 }, { pos: "DC",  x: 62, y: 72 }, { pos: "DC",  x: 38, y: 72 }, { pos: "LB",  x: 20, y: 70 },
      { pos: "MC",  x: 70, y: 50 }, { pos: "MC",  x: 50, y: 48 }, { pos: "MC",  x: 30, y: 50 },
      { pos: "AD",  x: 75, y: 28 }, { pos: "BU",  x: 50, y: 22 }, { pos: "AG",  x: 25, y: 28 },
    ],
  },
  "4-4-2": {
    label: "4-4-2",
    positions: [
      { pos: "GK",  x: 50, y: 88 },
      { pos: "RB",  x: 80, y: 70 }, { pos: "DC",  x: 62, y: 72 }, { pos: "DC",  x: 38, y: 72 }, { pos: "LB",  x: 20, y: 70 },
      { pos: "AD",  x: 78, y: 48 }, { pos: "MC",  x: 60, y: 50 }, { pos: "MC",  x: 40, y: 50 }, { pos: "AG",  x: 22, y: 48 },
      { pos: "BU",  x: 62, y: 24 }, { pos: "BU",  x: 38, y: 24 },
    ],
  },
  "4-2-3-1": {
    label: "4-2-3-1",
    positions: [
      { pos: "GK",  x: 50, y: 88 },
      { pos: "RB",  x: 80, y: 70 }, { pos: "DC",  x: 62, y: 72 }, { pos: "DC",  x: 38, y: 72 }, { pos: "LB",  x: 20, y: 70 },
      { pos: "MDF", x: 62, y: 56 }, { pos: "MDF", x: 38, y: 56 },
      { pos: "AD",  x: 74, y: 36 }, { pos: "MOC", x: 50, y: 34 }, { pos: "AG",  x: 26, y: 36 },
      { pos: "BU",  x: 50, y: 18 },
    ],
  },
  "3-5-2": {
    label: "3-5-2",
    positions: [
      { pos: "GK",  x: 50, y: 88 },
      { pos: "DC",  x: 70, y: 72 }, { pos: "DC",  x: 50, y: 74 }, { pos: "DC",  x: 30, y: 72 },
      { pos: "RB",  x: 85, y: 52 }, { pos: "MC",  x: 65, y: 50 }, { pos: "MDF", x: 50, y: 48 }, { pos: "MC",  x: 35, y: 50 }, { pos: "LB",  x: 15, y: 52 },
      { pos: "BU",  x: 60, y: 24 }, { pos: "BU",  x: 40, y: 24 },
    ],
  },
};

export interface TrainingSession {
  id: string;
  date: string;
  time: string;
  type: "Physique" | "Tactique" | "Technique" | "Vidéo" | "Match";
  duration: number;
  intensity: "Faible" | "Modérée" | "Élevée" | "Maximale";
  objective: string;
  players: string[];
  done: boolean;
  attendance?: number;
  bestPlayer?: string;
}

export const TRAINING_SESSIONS: TrainingSession[] = [
  { id: "s1", date: "2026-06-21", time: "09:00", type: "Tactique", duration: 90, intensity: "Modérée", objective: "Pressing haut contre EST", players: ["p1","p2","p3","p4","p5","p6","p7","p8","p9","p10","p12"], done: false, attendance: undefined },
  { id: "s2", date: "2026-06-19", time: "10:00", type: "Physique", duration: 75, intensity: "Élevée", objective: "Endurance et sprints", players: ["p2","p3","p4","p5","p6","p7","p8","p9","p10","p12","p14"], done: true, attendance: 91, bestPlayer: "Yassine Brahmi" },
  { id: "s3", date: "2026-06-17", time: "09:30", type: "Technique", duration: 60, intensity: "Modérée", objective: "Passes courtes et combinaisons", players: ["p6","p7","p8","p9","p10","p12"], done: true, attendance: 85, bestPlayer: "Rami Zouaoui" },
  { id: "s4", date: "2026-06-15", time: "08:00", type: "Vidéo", duration: 45, intensity: "Faible", objective: "Analyse adversaire CSS", players: ["p1","p2","p3","p5","p6","p7","p8"], done: true, attendance: 100, bestPlayer: undefined },
  { id: "s5", date: "2026-06-22", time: "17:00", type: "Match", duration: 90, intensity: "Maximale", objective: "Match contre EST — J28", players: [], done: false },
];

export interface MatchEvent {
  minute: number;
  type: "but" | "carton_jaune" | "carton_rouge" | "substitution" | "blessure";
  player: string;
  description: string;
}

export interface MatchAnalysis {
  id: string;
  date: string;
  home: string;
  away: string;
  score?: string;
  phase: "avant" | "pendant" | "apres";
  possession?: number;
  shots?: number;
  shotsOnTarget?: number;
  corners?: number;
  fouls?: number;
  events: MatchEvent[];
}

export const MATCHES_DATA: MatchAnalysis[] = [
  {
    id: "m1", date: "2026-06-22", home: "FC Carthage", away: "ES Tunis", phase: "avant",
    possession: undefined, events: [],
  },
  {
    id: "m2", date: "2026-06-18", home: "FC Carthage", away: "ES Tunis", score: "2-1", phase: "apres",
    possession: 56, shots: 14, shotsOnTarget: 8, corners: 6, fouls: 11,
    events: [
      { minute: 12, type: "but", player: "Rami Zouaoui", description: "But sur corner — 1-0" },
      { minute: 34, type: "carton_jaune", player: "Mehdi Trabelsi", description: "Faute tactique" },
      { minute: 56, type: "but", player: "EST", description: "Égalisation après corner — 1-1" },
      { minute: 67, type: "substitution", player: "Firas Cherni → Karim Jelassi", description: "Changement tactique" },
      { minute: 78, type: "but", player: "Yassine Brahmi", description: "Frappe lourde 25m — 2-1" },
    ],
  },
];

export const OPPONENTS = [
  {
    id: "op1", name: "ES Tunis", flag: "🦅", formation: "4-4-2",
    strengths: ["Ailes très rapides", "Pressing haut agressif", "Set-pieces dangereux", "Gardien expérimenté"],
    weaknesses: ["Défense lente sur transition", "Manque de créativité axe central", "Remplaçants moins bons"],
    keyPlayers: [{ name: "Ben Aziza", position: "BU", danger: "Très élevé" }, { name: "Msakni", position: "MOC", danger: "Élevé" }],
    recentResults: ["EST 2-0 CAB", "CSS 1-1 EST", "EST 3-2 ST"],
    tacticalNote: "Presse haut dès la perte de balle. Vulnérable sur les contres avec des transitions rapides en 3ème zone.",
  },
  {
    id: "op2", name: "CSS Sfax", flag: "⚔️", formation: "3-5-2",
    strengths: ["Milieu dense et compact", "Jeu aérien sur corner", "Pressing sur l'axe"],
    weaknesses: ["Latéraux défensifs exposés", "Manque de vitesse en pointe"],
    keyPlayers: [{ name: "Chikhaoui", position: "MOC", danger: "Élevé" }, { name: "Khelil", position: "BU", danger: "Modéré" }],
    recentResults: ["CSS 1-0 CA", "ST 0-2 CSS", "CSS 0-0 EST"],
    tacticalNote: "Bloque l'axe central. À exploiter sur les flancs par des débordements et centres.",
  },
];
