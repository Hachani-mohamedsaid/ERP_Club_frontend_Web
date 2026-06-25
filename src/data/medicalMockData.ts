export type AvailabilityStatus = "Disponible" | "Partiellement disponible" | "Indisponible";
export type InjurySeverity = "Grade I" | "Grade II" | "Grade III" | "Critique";
export type InjuryStatus = "Active" | "En rééducation" | "Terminée";

export interface PlayerMedicalRecord {
  id: string;
  name: string;
  position: string;
  age: number;
  bloodGroup: string;
  allergies: string[];
  weight: number;
  height: number;
  availability: AvailabilityStatus;
  antecedents: string[];
  medications: string[];
  previousInjuries: { injury: string; date: string; duration: string }[];
  certificates: { name: string; date: string; valid: boolean }[];
  treatments: { name: string; dosage: string; since: string }[];
  history: { date: string; event: string; type: "consultation" | "injury" | "exam" | "certificat" }[];
}

export interface Injury {
  id: string;
  playerId: string;
  player: string;
  injury: string;
  severity: InjurySeverity;
  status: InjuryStatus;
  startDate: string;
  returnDate: string;
  daysRemaining: number;
}

export interface MedicalDocument {
  id: string;
  playerId: string;
  player: string;
  name: string;
  type: "IRM" | "Scanner" | "Radio" | "Certificat" | "Analyse";
  date: string;
  size: string;
}

export interface Appointment {
  id: string;
  title: string;
  player: string;
  type: "Consultation" | "IRM" | "Scanner" | "Radio" | "Rééducation" | "Urgence";
  date: string;
  time: string;
  day: number;
}

export interface RiskPlayer {
  id: string;
  name: string;
  position: string;
  riskScore: number;
  level: "HIGH RISK" | "MEDIUM RISK" | "LOW RISK";
  reasons: { label: string; impact: number }[];
}

export const PLAYERS: PlayerMedicalRecord[] = [
  {
    id: "1",
    name: "Ahmed Ben Salah",
    position: "BU",
    age: 24,
    bloodGroup: "A+",
    allergies: ["Aucune"],
    weight: 78,
    height: 182,
    availability: "Indisponible",
    antecedents: ["Entorse cheville gauche (2023)", "Pubalgie légère (2024)"],
    medications: ["Anti-inflammatoire — 1 cp/jour", "Vitamine D — 2000 UI"],
    previousInjuries: [
      { injury: "Entorse cheville", date: "Mars 2023", duration: "3 semaines" },
      { injury: "Pubalgie", date: "Jan 2024", duration: "2 semaines" },
      { injury: "Genou droit — déchirure LCA", date: "Nov 2025", duration: "6 mois" },
    ],
    certificates: [
      { name: "Certificat aptitude compétition", date: "01/06/2026", valid: false },
      { name: "Certificat reprise entraînement", date: "15/05/2026", valid: true },
    ],
    treatments: [
      { name: "Kinésithérapie genou", dosage: "3 séances/semaine", since: "12/01/2026" },
      { name: "Cryothérapie", dosage: "Post-séance", since: "01/02/2026" },
    ],
    history: [
      { date: "18/06/2026", event: "Contrôle IRM genou droit", type: "exam" },
      { date: "10/06/2026", event: "Consultation Dr. Ben Ali", type: "consultation" },
      { date: "15/05/2026", event: "Blessure genou — Grade II", type: "injury" },
      { date: "01/06/2026", event: "Certificat médical délivré", type: "certificat" },
    ],
  },
  {
    id: "2",
    name: "Ali Ben Youssef",
    position: "MC",
    age: 26,
    bloodGroup: "O-",
    allergies: ["Pénicilline"],
    weight: 74,
    height: 178,
    availability: "Partiellement disponible",
    antecedents: ["Tendinite rotulienne (2022)"],
    medications: ["Paracétamol si besoin"],
    previousInjuries: [
      { injury: "Cheville droite — entorse", date: "Fév 2026", duration: "4 semaines" },
    ],
    certificates: [{ name: "Certificat aptitude", date: "10/06/2026", valid: true }],
    treatments: [{ name: "Renforcement proprioceptif", dosage: "2 séances/semaine", since: "01/03/2026" }],
    history: [
      { date: "12/06/2026", event: "Séance rééducation cheville", type: "consultation" },
      { date: "20/02/2026", event: "Entorse cheville droite", type: "injury" },
    ],
  },
  {
    id: "3",
    name: "Walid Hammami",
    position: "DG",
    age: 22,
    bloodGroup: "B+",
    allergies: ["Aucune"],
    weight: 71,
    height: 175,
    availability: "Partiellement disponible",
    antecedents: [],
    medications: [],
    previousInjuries: [{ injury: "Contusion cuisse", date: "Mai 2026", duration: "1 semaine" }],
    certificates: [{ name: "Certificat aptitude", date: "05/06/2026", valid: true }],
    treatments: [],
    history: [{ date: "08/06/2026", event: "Reprise progressive", type: "consultation" }],
  },
  {
    id: "4",
    name: "Karim Sassi",
    position: "DC",
    age: 28,
    bloodGroup: "AB+",
    allergies: ["Latex"],
    weight: 82,
    height: 188,
    availability: "Disponible",
    antecedents: ["Fracture métatarse (2021)"],
    medications: [],
    previousInjuries: [{ injury: "Fracture métatarse", date: "2021", duration: "8 semaines" }],
    certificates: [{ name: "Certificat aptitude", date: "01/06/2026", valid: true }],
    treatments: [],
    history: [{ date: "01/06/2026", event: "Visite médicale annuelle", type: "consultation" }],
  },
  {
    id: "5",
    name: "Mohamed Trabelsi",
    position: "GB",
    age: 25,
    bloodGroup: "A-",
    allergies: ["Aucune"],
    weight: 76,
    height: 180,
    availability: "Disponible",
    antecedents: [],
    medications: ["Magnésium — 400mg"],
    previousInjuries: [],
    certificates: [{ name: "Certificat aptitude", date: "01/06/2026", valid: true }],
    treatments: [],
    history: [],
  },
  {
    id: "6",
    name: "Mehdi Jebali",
    position: "MD",
    age: 23,
    bloodGroup: "O+",
    allergies: ["Aucune"],
    weight: 73,
    height: 177,
    availability: "Disponible",
    antecedents: ["Fatigue chronique légère"],
    medications: ["Fer — supplément"],
    previousInjuries: [{ injury: "Ischio-jambiers", date: "Avr 2026", duration: "2 semaines" }],
    certificates: [{ name: "Certificat aptitude", date: "15/06/2026", valid: true }],
    treatments: [{ name: "Étirements guidés", dosage: "Quotidien", since: "20/04/2026" }],
    history: [{ date: "15/06/2026", event: "Retour terrain autorisé", type: "certificat" }],
  },
];

export const INJURIES: Injury[] = [
  { id: "1", playerId: "1", player: "Ahmed Ben Salah", injury: "Genou Droit", severity: "Grade II", status: "Active", startDate: "15/05/2026", returnDate: "15/07/2026", daysRemaining: 26 },
  { id: "2", playerId: "2", player: "Ali Ben Youssef", injury: "Cheville Droite", severity: "Grade I", status: "En rééducation", startDate: "20/02/2026", returnDate: "01/07/2026", daysRemaining: 12 },
  { id: "3", playerId: "3", player: "Walid Hammami", injury: "Cuisse Gauche", severity: "Grade I", status: "En rééducation", startDate: "01/06/2026", returnDate: "25/06/2026", daysRemaining: 6 },
  { id: "4", playerId: "6", player: "Mehdi Jebali", injury: "Ischio-jambiers", severity: "Grade I", status: "Terminée", startDate: "10/04/2026", returnDate: "15/06/2026", daysRemaining: 0 },
];

export const MEDICAL_DOCUMENTS: MedicalDocument[] = [
  { id: "1", playerId: "1", player: "Ahmed Ben Salah", name: "IRM_Genou_Droit", type: "IRM", date: "18/06/2026", size: "4.2 MB" },
  { id: "2", playerId: "1", player: "Ahmed Ben Salah", name: "Radio_Genou", type: "Radio", date: "15/05/2026", size: "1.8 MB" },
  { id: "3", playerId: "2", player: "Ali Ben Youssef", name: "Scanner_Cheville", type: "Scanner", date: "22/02/2026", size: "6.1 MB" },
  { id: "4", playerId: "1", player: "Ahmed Ben Salah", name: "Certificat_Reprise", type: "Certificat", date: "15/05/2026", size: "320 KB" },
  { id: "5", playerId: "4", player: "Karim Sassi", name: "Analyse_Sang", type: "Analyse", date: "01/06/2026", size: "890 KB" },
  { id: "6", playerId: "2", player: "Ali Ben Youssef", name: "Radio_Cheville", type: "Radio", date: "20/02/2026", size: "1.5 MB" },
];

export const APPOINTMENTS: Appointment[] = [
  { id: "1", title: "Consultation genou", player: "Ahmed Ben Salah", type: "Consultation", date: "19/06/2026", time: "09:00", day: 3 },
  { id: "2", title: "IRM contrôle", player: "Ahmed Ben Salah", type: "IRM", date: "20/06/2026", time: "14:30", day: 4 },
  { id: "3", title: "Rééducation cheville", player: "Ali Ben Youssef", type: "Rééducation", date: "19/06/2026", time: "11:00", day: 3 },
  { id: "4", title: "Scanner contrôle", player: "Ali Ben Youssef", type: "Scanner", date: "21/06/2026", time: "10:00", day: 5 },
  { id: "5", title: "Radio poignet", player: "Walid Hammami", type: "Radio", date: "20/06/2026", time: "08:30", day: 4 },
  { id: "6", title: "Urgence — contusion", player: "Mehdi Jebali", type: "Urgence", date: "18/06/2026", time: "16:00", day: 2 },
  { id: "7", title: "Consultation annuelle", player: "Karim Sassi", type: "Consultation", date: "23/06/2026", time: "09:30", day: 0 },
  { id: "8", title: "Rééducation genou", player: "Ahmed Ben Salah", type: "Rééducation", date: "22/06/2026", time: "15:00", day: 6 },
];

export const RISK_PLAYERS: RiskPlayer[] = [
  {
    id: "1",
    name: "Ahmed Ben Salah",
    position: "BU",
    riskScore: 82,
    level: "HIGH RISK",
    reasons: [
      { label: "Fatigue accumulée", impact: 28 },
      { label: "Charge élevée", impact: 32 },
      { label: "Historique blessure genou", impact: 22 },
    ],
  },
  {
    id: "2",
    name: "Ali Ben Youssef",
    position: "MC",
    riskScore: 75,
    level: "HIGH RISK",
    reasons: [
      { label: "Retour blessure récent", impact: 35 },
      { label: "Minutes jouées élevées", impact: 25 },
      { label: "Proprioception insuffisante", impact: 15 },
    ],
  },
  {
    id: "3",
    name: "Walid Hammami",
    position: "DG",
    riskScore: 58,
    level: "MEDIUM RISK",
    reasons: [
      { label: "Contusion récente", impact: 30 },
      { label: "Charge modérée", impact: 18 },
      { label: "Sommeil insuffisant", impact: 10 },
    ],
  },
  {
    id: "4",
    name: "Mehdi Jebali",
    position: "MD",
    riskScore: 42,
    level: "MEDIUM RISK",
    reasons: [
      { label: "Ischio-jambiers récent", impact: 25 },
      { label: "Flexibilité réduite", impact: 17 },
    ],
  },
];

export const REEDUCATION_PHASES = {
  phase1: { label: "Phase 1 — Immobilisation", players: ["Ahmed Ben Salah"] },
  phase2: { label: "Phase 2 — Renforcement", players: ["Ali Ben Youssef", "Walid Hammami"] },
  retour: { label: "Retour terrain", players: ["Mehdi Jebali", "Mohamed Trabelsi"] },
};

export const REPORT_KPIS = {
  activeInjuries: 3,
  avgReturnDays: 14,
  fieldReturnRate: 67,
  availability: 78,
};

export const MONTHLY_INJURY_DATA = [
  { month: "Jan", blessures: 2, retours: 1 },
  { month: "Fév", blessures: 3, retours: 2 },
  { month: "Mar", blessures: 1, retours: 3 },
  { month: "Avr", blessures: 4, retours: 2 },
  { month: "Mai", blessures: 2, retours: 1 },
  { month: "Jun", blessures: 3, retours: 2 },
];

export const INJURY_TYPE_DATA = [
  { name: "Musculaire", value: 35, color: "#e0584a" },
  { name: "Articulaire", value: 28, color: "#3a7bd5" },
  { name: "Osseux", value: 15, color: "#d99a1f" },
  { name: "Tendineux", value: 22, color: "#2e9e5b" },
];

export function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export function getAvailabilityColor(status: AvailabilityStatus) {
  if (status === "Disponible") return "var(--color-state-success)";
  if (status === "Partiellement disponible") return "var(--color-state-warning)";
  return "var(--color-state-danger)";
}
