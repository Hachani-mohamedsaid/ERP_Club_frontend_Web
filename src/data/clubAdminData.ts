export const CLUB_INFO = {
  name: "FC Carthage",
  season: "2026",
  adminName: "Mohamed",
  logo: "FC",
  primaryColor: "#FF6B57",
  budgetTotal: 5_000_000,
  budgetUsed: 3_600_000,
  budgetUsedPct: 72,
};

export const DASHBOARD_KPIS = [
  { label: "Joueurs", value: 32, icon: "users" as const, color: "#FF6B57" },
  { label: "Staff", value: 18, icon: "staff" as const, color: "#6366F1" },
  { label: "Budget restant", value: 1_400_000, prefix: "", suffix: " DT", icon: "budget" as const, color: "#22C55E" },
  { label: "Masse salariale", value: 2_800_000, suffix: " DT", icon: "salary" as const, color: "#F59E0B" },
  { label: "Blessés", value: 4, icon: "injured" as const, color: "#EF4444" },
  { label: "Contrats à renouveler", value: 3, icon: "contract" as const, color: "#F59E0B" },
];

export const BUDGET_CHART = [
  { month: "Jan", budget: 420, spent: 380 },
  { month: "Fév", budget: 420, spent: 395 },
  { month: "Mar", budget: 420, spent: 410 },
  { month: "Avr", budget: 420, spent: 390 },
  { month: "Mai", budget: 420, spent: 405 },
  { month: "Juin", budget: 420, spent: 415 },
  { month: "Juil", budget: 420, spent: 350 },
  { month: "Août", budget: 420, spent: 430 },
  { month: "Sep", budget: 420, spent: 400 },
  { month: "Oct", budget: 420, spent: 395 },
  { month: "Nov", budget: 420, spent: 410 },
  { month: "Déc", budget: 420, spent: 380 },
];

export const CLUB_ALERTS = [
  { type: "warning" as const, text: "Contrat expire dans 15 jours — Ahmed Ben Salah" },
  { type: "danger" as const, text: "Dépassement budget médical (+8%)" },
  { type: "warning" as const, text: "Joueur indisponible — Youssef Trabelsi (entorse)" },
];

export const AI_DASHBOARD_SUMMARY = [
  "L'équipe a gagné 4 matchs consécutifs.",
  "3 contrats nécessitent une prolongation.",
  "Le budget est utilisé à 72%.",
];

export const STAFF_MEMBERS = [
  { id: "1", name: "Karim Jebali", role: "Coach", salary: "45 000 DT", contract: "01/07/2024 — 30/06/2027", contractEnd: "30/06/2027", available: true, photo: "KJ" },
  { id: "2", name: "Sami Bouazizi", role: "Adjoint", salary: "28 000 DT", contract: "01/07/2025 — 30/06/2028", contractEnd: "30/06/2028", available: true, photo: "SB" },
  { id: "3", name: "Hichem Mansouri", role: "Préparateur", salary: "22 000 DT", contract: "01/01/2025 — 31/12/2026", contractEnd: "31/12/2026", available: true, photo: "HM" },
  { id: "4", name: "Dr. Amira Khelifi", role: "Médecin", salary: "35 000 DT", contract: "01/07/2023 — 30/06/2027", contractEnd: "30/06/2027", available: true, photo: "AK" },
  { id: "5", name: "Ridha Ben Ammar", role: "Scout", salary: "18 000 DT", contract: "01/07/2024 — 30/06/2026", contractEnd: "30/06/2026", available: false, photo: "RB" },
  { id: "6", name: "Nadia Gharbi", role: "Kiné", salary: "20 000 DT", contract: "01/07/2025 — 30/06/2028", contractEnd: "30/06/2028", available: true, photo: "NG" },
];

export const REVENUE_SOURCES = [
  { name: "Sponsors", value: 35, color: "#FF6B57" },
  { name: "Billetterie", value: 25, color: "#6366F1" },
  { name: "Merchandising", value: 15, color: "#22C55E" },
  { name: "Transferts", value: 25, color: "#F59E0B" },
];

export const EXPENSES_MONTHLY = [
  { month: "Jan", amount: 280 }, { month: "Fév", amount: 310 }, { month: "Mar", amount: 295 },
  { month: "Avr", amount: 320 }, { month: "Mai", amount: 305 }, { month: "Juin", amount: 340 },
];

export const CONTRACT_TIMELINE = [
  { label: "Expire dans 15 jours", count: 1, color: "#EF4444", players: ["Ahmed Ben Salah"] },
  { label: "Expire dans 45 jours", count: 1, color: "#F59E0B", players: ["Youssef Trabelsi"] },
  { label: "Expire dans 3 mois", count: 1, color: "#F59E0B", players: ["Mohamed Sassi"] },
  { label: "Actifs", count: 2, color: "#22C55E", players: ["Ali Mansouri", "Karim Dridi"] },
];

export const AI_CONTRACT_RECOMMENDATIONS = [
  { action: "Renouveler", player: "Ahmed Ben Salah", reason: "Contrat expire dans 15 jours — OVR 87, top buteur", color: "#22C55E", icon: "renew" as const },
  { action: "Vendre", player: "Karim Dridi", reason: "Sous-performance (-4 OVR), valeur marchande stable", color: "#EF4444", icon: "sell" as const },
  { action: "Prêter", player: "Ali Mansouri", reason: "Temps de jeu limité, potentiel U23 à développer", color: "#6366F1", icon: "loan" as const },
];

export const INJURED_PLAYERS = [
  { name: "Ahmed Ben Salah", injury: "Hamstring", returnDate: "25/06/2026", riskIA: 82 },
  { name: "Youssef Trabelsi", injury: "Entorse cheville", returnDate: "02/07/2026", riskIA: 65 },
  { name: "Karim Dridi", injury: "Genou (légère)", returnDate: "28/06/2026", riskIA: 45 },
  { name: "Mohamed Sassi", injury: "Ischio-jambiers", returnDate: "30/06/2026", riskIA: 58 },
];

export const INFRA_KPIS = [
  { label: "Terrains", value: 2, icon: "field" as const },
  { label: "Salles", value: 3, icon: "room" as const },
  { label: "Bus", value: 4, icon: "bus" as const },
  { label: "Centre médical", value: 1, icon: "medical" as const },
];

export const MAINTENANCE_CALENDAR = [
  { facility: "Terrain A", date: "15/07/2026", type: "Entretien pelouse" },
  { facility: "Centre Médical", date: "18/06/2026", type: "Équipement IRM" },
  { facility: "Salle Musculation", date: "10/06/2026", type: "Révision machines" },
  { facility: "Terrain B", date: "02/08/2026", type: "Marquage lignes" },
];

export const TEAM_RADAR = [
  { stat: "Attaque", value: 85 },
  { stat: "Défense", value: 78 },
  { stat: "Physique", value: 82 },
  { stat: "Technique", value: 80 },
  { stat: "Mental", value: 76 },
];

export const BEST_XI = {
  formation: "4-3-3",
  players: [
    { name: "Ben Salah", position: "BU", x: 50, y: 12 },
    { name: "Mansouri", position: "AG", x: 20, y: 22 },
    { name: "Sassi", position: "AD", x: 80, y: 22 },
    { name: "Trabelsi", position: "MOC", x: 50, y: 38 },
    { name: "Dridi", position: "MC", x: 25, y: 45 },
    { name: "Bouazizi", position: "MC", x: 75, y: 45 },
    { name: "Jebali", position: "DG", x: 12, y: 62 },
    { name: "Khelifi", position: "DC", x: 35, y: 68 },
    { name: "Gharbi", position: "DC", x: 65, y: 68 },
    { name: "Ammar", position: "DD", x: 88, y: 62 },
    { name: "Haddad", position: "GB", x: 50, y: 82 },
  ],
};

export const AI_INSIGHTS = [
  { text: "Le risque de blessure augmente.", severity: "warning" as const },
  { text: "Le budget médical dépasse 12%.", severity: "danger" as const },
  { text: "Le joueur Ahmed est sous-utilisé.", severity: "info" as const },
];

export const AI_SUGGESTED_ACTIONS = [
  { label: "Créer un entraînement", path: "/club/calendrier" },
  { label: "Renouveler contrat", path: "/club/contrats" },
  { label: "Planifier visite médicale", path: "/club/sante" },
];

export const FINANCE_KPIS = [
  { label: "Budget", value: 5_000_000, suffix: " DT" },
  { label: "Dépenses", value: 3_600_000, suffix: " DT" },
  { label: "Revenus", value: 4_200_000, suffix: " DT" },
  { label: "Profit", value: 600_000, suffix: " DT" },
];

export const EXPENSE_BREAKDOWN = [
  { name: "Salaires", value: 45, color: "#FF6B57" },
  { name: "Infrastructure", value: 20, color: "#6366F1" },
  { name: "Médical", value: 15, color: "#22C55E" },
  { name: "Transferts", value: 20, color: "#F59E0B" },
];

export const FINANCE_HISTORY = [
  { date: "12/06/2026", amount: 45000, type: "Salaire", category: "out" },
  { date: "10/06/2026", amount: 120000, type: "Sponsor", category: "in" },
  { date: "08/06/2026", amount: 8500, type: "Médical", category: "out" },
  { date: "05/06/2026", amount: 32000, type: "Infrastructure", category: "out" },
  { date: "01/06/2026", amount: 250000, type: "Transfert", category: "out" },
];

export const CLUB_CONTRACTS = [
  { id: "1", name: "Ahmed Ben Salah", start: "01/07/2024", end: "30/06/2026", salary: "35 000 DT", bonus: "5 000 DT", clause: "15M €", daysLeft: 15, consumed: 92 },
  { id: "2", name: "Ali Mansouri", start: "01/07/2025", end: "30/06/2028", salary: "28 000 DT", bonus: "3 000 DT", clause: "8M €", daysLeft: 730, consumed: 25 },
  { id: "3", name: "Youssef Trabelsi", start: "01/01/2025", end: "31/12/2026", salary: "22 000 DT", bonus: "2 000 DT", clause: "5M €", daysLeft: 45, consumed: 75 },
  { id: "4", name: "Mohamed Sassi", start: "01/07/2023", end: "30/06/2026", salary: "18 000 DT", bonus: "1 500 DT", clause: "3M €", daysLeft: 60, consumed: 88 },
  { id: "5", name: "Karim Dridi", start: "01/07/2024", end: "30/06/2027", salary: "25 000 DT", bonus: "2 500 DT", clause: "6M €", daysLeft: 400, consumed: 40 },
];

export const CALENDAR_EVENTS = [
  { id: "1", title: "FC Carthage vs ES Tunis", date: "2026-06-22", time: "20:00", type: "match" as const, location: "Stade Olympique", coach: "Karim Jebali", squad: ["Ahmed Ben Salah", "Ali Mansouri", "Mohamed Sassi", "Youssef Trabelsi", "Karim Dridi", "Haddad", "Jebali", "Khelifi", "Gharbi", "Ammar", "Bouazizi"] },
  { id: "2", title: "Entraînement tactique", date: "2026-06-20", time: "10:00", type: "training" as const, location: "Terrain A", coach: "Karim Jebali", squad: ["Effectif complet — 24 joueurs"] },
  { id: "3", title: "Réunion direction", date: "2026-06-21", time: "14:00", type: "meeting" as const, location: "Salle conférence", coach: "Mohamed Said", squad: ["Direction", "Coach", "Médecin"] },
  { id: "4", title: "Visite médicale", date: "2026-06-23", time: "09:00", type: "medical" as const, location: "Centre Médical", coach: "Dr. Amira Khelifi", squad: ["Ahmed Ben Salah", "Youssef Trabelsi"] },
  { id: "5", title: "Entraînement physique", date: "2026-06-24", time: "08:30", type: "training" as const, location: "Salle Musculation", coach: "Hichem Mansouri", squad: ["Groupe disponible — 20 joueurs"] },
  { id: "6", title: "Match amical", date: "2026-06-28", time: "18:00", type: "match" as const, location: "Terrain B", coach: "Karim Jebali", squad: ["Ali Mansouri", "Mohamed Sassi", "Karim Dridi", "Bouazizi", "Ammar", "Haddad"] },
];

export const EVENT_COLORS = {
  match: { bg: "rgba(34,197,94,0.15)", border: "#22C55E", label: "Match" },
  training: { bg: "rgba(59,130,246,0.15)", border: "#3B82F6", label: "Entraînement" },
  medical: { bg: "rgba(239,68,68,0.15)", border: "#EF4444", label: "Médical" },
  meeting: { bg: "rgba(245,158,11,0.15)", border: "#F59E0B", label: "Réunion" },
};

export const HEALTH_KPIS = [
  { label: "Blessés", value: 4, color: "#EF4444" },
  { label: "Disponibles", value: 24, color: "#22C55E" },
  { label: "Risque moyen", value: 32, suffix: "%", color: "#F59E0B" },
];

export const INJURIES_BY_MONTH = [
  { month: "Jan", count: 2 }, { month: "Fév", count: 1 }, { month: "Mar", count: 3 },
  { month: "Avr", count: 2 }, { month: "Mai", count: 4 }, { month: "Juin", count: 3 },
];

export const INJURIES_BY_POSITION = [
  { position: "Défense", count: 5 }, { position: "Milieu", count: 3 },
  { position: "Attaque", count: 4 }, { position: "Gardien", count: 1 },
];

export const BODY_INJURY_ZONES = [
  { zone: "Genou", count: 4, x: 48, y: 62 },
  { zone: "Cheville", count: 3, x: 42, y: 88 },
  { zone: "Ischio", count: 2, x: 55, y: 55 },
  { zone: "Épaule", count: 1, x: 35, y: 28 },
];

export const INFRASTRUCTURES = [
  { id: "1", name: "Terrain A", status: "Excellent" as const, capacity: "22 000", lastMaintenance: "15/05/2026", occupationRate: 80, nextMaintenance: "15/07/2026" },
  { id: "2", name: "Terrain B", status: "Bon" as const, capacity: "5 000", lastMaintenance: "02/06/2026", occupationRate: 55, nextMaintenance: "02/08/2026" },
  { id: "3", name: "Salle Musculation", status: "Excellent" as const, capacity: "30 pers.", lastMaintenance: "10/06/2026", occupationRate: 72, nextMaintenance: "10/09/2026" },
  { id: "4", name: "Centre Médical", status: "Maintenance" as const, capacity: "12 lits", lastMaintenance: "18/06/2026", occupationRate: 45, nextMaintenance: "18/06/2026" },
  { id: "5", name: "Bus équipe (×4)", status: "Bon" as const, capacity: "50 places", lastMaintenance: "01/06/2026", occupationRate: 60, nextMaintenance: "01/12/2026" },
];

export const TEAM_EVOLUTION = [
  { month: "Jan", wins: 2, points: 6 }, { month: "Fév", wins: 3, points: 9 },
  { month: "Mar", wins: 2, points: 7 }, { month: "Avr", wins: 4, points: 12 },
  { month: "Mai", wins: 3, points: 10 }, { month: "Juin", wins: 4, points: 12 },
];

export const TOP_SCORERS = [
  { rank: 1, name: "Ahmed Ben Salah", goals: 18, medal: "🥇" },
  { rank: 2, name: "Ali Mansouri", goals: 12, medal: "🥈" },
  { rank: 3, name: "Mohamed Sassi", goals: 8, medal: "🥉" },
];

export const MARKET_VALUE_EVOLUTION = [
  { month: "Jan", value: 42 }, { month: "Fév", value: 44 }, { month: "Mar", value: 43 },
  { month: "Avr", value: 46 }, { month: "Mai", value: 48 }, { month: "Juin", value: 51 },
];

export const OVR_EVOLUTION = [
  { month: "Jan", ovr: 78 }, { month: "Fév", ovr: 79 }, { month: "Mar", ovr: 79 },
  { month: "Avr", ovr: 80 }, { month: "Mai", ovr: 81 }, { month: "Juin", ovr: 82 },
];

export const POSITION_DISTRIBUTION = [
  { name: "Défense", value: 30, color: "#6366F1" },
  { name: "Milieu", value: 35, color: "#FF6B57" },
  { name: "Attaque", value: 25, color: "#22C55E" },
  { name: "Gardien", value: 10, color: "#F59E0B" },
];

export const AI_CLUB_SUMMARY = [
  "L'effectif est stable.",
  "Le budget reste maîtrisé.",
  "Le risque blessure augmente.",
];

export const AI_CLUB_QUESTIONS = [
  "Quel joueur recruter ?",
  "Quel contrat renouveler ?",
  "Qui est sous performant ?",
];

export function getClubAIResponse(question: string): string {
  const q = question.toLowerCase();
  if (q.includes("recruter")) return "Recommandation : un milieu défensif U23 avec OVR > 78. 3 profils identifiés par le scout Ridha Ben Ammar.";
  if (q.includes("renouveler") || q.includes("contrat")) return "Priorité : Ahmed Ben Salah (15 jours), Youssef Trabelsi (45 jours). Négociation bonus recommandée.";
  if (q.includes("sous performant") || q.includes("performance")) return "3 joueurs sous la moyenne OVR équipe : Karim Dridi (-4), Mohamed Sassi (-3), Youssef Trabelsi (blessé).";
  return "Analyse en cours sur l'effectif FC Carthage. Le budget est à 72% et la forme collective est excellente (4 victoires consécutives).";
}

export const CLUB_SETTINGS = {
  general: { name: "FC Carthage", logo: "FC", primaryColor: "#FF6B57", secondaryColor: "#070B1F" },
  security: { twoFA: true, lastLogin: "19/06/2026 09:42" },
  users: [
    { name: "Mohamed Said", role: "Admin Club", email: "admin@club.com" },
    { name: "Karim Jebali", role: "Coach", email: "coach@club.com" },
    { name: "Dr. Amira Khelifi", role: "Médecin", email: "medecin@club.com" },
  ],
  notifications: { email: true, sms: false, push: true },
};
