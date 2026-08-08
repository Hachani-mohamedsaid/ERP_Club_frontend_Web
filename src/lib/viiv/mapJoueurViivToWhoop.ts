import type { WhoopPlayerMetrics, ViivMobileReading } from "../../../data/whoopData";

export type JoueurViivSnapshot = {
  playerName?: string;
  deviceModel?: string;
  deviceId?: string;
  firmware?: string;
  connected?: boolean;
  lastSync?: string;
  lastSyncAt?: string;
  battery?: number;
  recovery?: number;
  recoveryDelta?: number;
  strain?: number;
  strainTarget?: number;
  viivEnergy?: number;
  sleepHours?: number;
  sleepPerformance?: number;
  sleepNeed?: number;
  sleepStages?: { awake?: number; light?: number; sws?: number; rem?: number };
  hrv?: number;
  hrvBaseline?: number;
  restingHr?: number;
  spo2?: number;
  stress?: number;
  calories?: number;
  steps?: number;
  skinTemp?: number;
  respiratoryRate?: number;
  vo2Max?: number;
  gpsActivity?: string;
  readiness?: string;
  injuryRisk?: string;
  fitnessScore?: number;
  dataSourceLabel?: string;
};

export type JoueurViivHistoryResponse = {
  playerName: string;
  count: number;
  readings: ViivMobileReading[];
};

function n(v: unknown, fallback = 0): number {
  const x = typeof v === "number" ? v : Number(v);
  return Number.isFinite(x) ? x : fallback;
}

function relativeSync(iso?: string) {
  if (!iso) return "—";
  const sec = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (sec < 60) return `Il y a ${sec}s`;
  if (sec < 3600) return `Il y a ${Math.floor(sec / 60)} min`;
  if (sec < 86400) return `Il y a ${Math.floor(sec / 3600)} h`;
  return new Date(iso).toLocaleString("fr-FR");
}

/** Map GET /joueur/me/viiv (+ profil) → WhoopPlayerMetrics for shared Viiv UI */
export function mapJoueurViivToWhoop(
  snap: JoueurViivSnapshot | null | undefined,
  profile?: {
    id?: string;
    name?: string;
    photo?: string;
    position?: string;
    number?: number;
    club?: string;
  },
): WhoopPlayerMetrics {
  const name = snap?.playerName || profile?.name || "Joueur";
  const id = profile?.id || "me";
  const stages = snap?.sleepStages ?? {};
  const recovery = n(snap?.recovery);
  const readinessRaw = snap?.readiness || "";
  const readiness =
    readinessRaw === "Optimal" ||
    readinessRaw === "Prêt" ||
    readinessRaw === "Modéré" ||
    readinessRaw === "Fatigué" ||
    readinessRaw === "Critique"
      ? readinessRaw
      : recovery >= 80
        ? "Optimal"
        : recovery >= 65
          ? "Prêt"
          : recovery >= 45
            ? "Modéré"
            : recovery >= 30
              ? "Fatigué"
              : "Critique";

  const riskRaw = snap?.injuryRisk || "Low";
  const injuryRisk =
    riskRaw === "High" || riskRaw === "Medium" || riskRaw === "Low" ? riskRaw : "Low";

  const lastSyncAt = snap?.lastSyncAt || new Date().toISOString();

  return {
    id,
    name,
    position: profile?.position || "—",
    number: profile?.number ?? 0,
    photo:
      profile?.photo ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0B0B14&color=22D3EE`,
    club: profile?.club || "Club",
    age: 0,
    height: "—",
    weight: "—",
    bloodGroup: "—",
    dominantFoot: "—",
    injuryHistory: "—",
    deviceId: snap?.deviceId || "Viiv",
    firmware: snap?.firmware || "Viiv OS",
    athleteId: id.slice(0, 8),
    memberSince: "Mobile",
    connected: Boolean(snap?.connected),
    lastSync: snap?.lastSync && snap.lastSync !== "DB" ? snap.lastSync : relativeSync(lastSyncAt),
    lastSyncAt,
    battery: n(snap?.battery),
    recovery,
    recoveryDelta: n(snap?.recoveryDelta),
    strain: n(snap?.strain),
    strainTarget: n(snap?.strainTarget, 15),
    sleepHours: n(snap?.sleepHours),
    sleepPerformance: n(snap?.sleepPerformance),
    sleepNeed: n(snap?.sleepNeed, 8),
    sleepStages: {
      awake: n(stages.awake),
      light: n(stages.light),
      sws: n(stages.sws),
      rem: n(stages.rem),
    },
    hrv: n(snap?.hrv),
    hrvBaseline: n(snap?.hrvBaseline, n(snap?.hrv)),
    restingHr: n(snap?.restingHr),
    skinTemp: n(snap?.skinTemp, 36.5),
    respiratoryRate: n(snap?.respiratoryRate, 14),
    spo2: n(snap?.spo2),
    stress: n(snap?.stress),
    calories: n(snap?.calories),
    steps: n(snap?.steps),
    fitnessScore: n(snap?.fitnessScore, recovery),
    fitToPlay: recovery >= 50,
    injuryRisk,
    readiness,
    weeklyStrain: [
      { day: "Lun", strain: n(snap?.strain) * 0.8, recovery: Math.max(40, recovery - 8) },
      { day: "Mar", strain: n(snap?.strain) * 0.9, recovery: Math.max(40, recovery - 5) },
      { day: "Mer", strain: n(snap?.strain) * 0.7, recovery },
      { day: "Jeu", strain: n(snap?.strain), recovery: Math.max(40, recovery - 10) },
      { day: "Ven", strain: n(snap?.strain) * 0.6, recovery: Math.min(99, recovery + 5) },
      { day: "Sam", strain: n(snap?.strain) * 1.1, recovery: Math.max(40, recovery - 12) },
      { day: "Dim", strain: n(snap?.strain), recovery },
    ],
    hourlyHr: [
      { hour: "00h", bpm: Math.max(40, n(snap?.restingHr) - 2) },
      { hour: "08h", bpm: n(snap?.restingHr) + 10 },
      { hour: "12h", bpm: n(snap?.restingHr) + 25 },
      { hour: "16h", bpm: n(snap?.restingHr) + 60 },
      { hour: "20h", bpm: n(snap?.restingHr) + 15 },
      { hour: "Live", bpm: n(snap?.restingHr) },
    ],
    zones: [
      { zone: "Zone 0", minutes: 400, color: "#64748B" },
      { zone: "Zone 1", minutes: 30, color: "#3B82F6" },
      { zone: "Zone 2", minutes: 20, color: "#22C55E" },
      { zone: "Zone 3", minutes: 12, color: "#F59E0B" },
      { zone: "Zone 4", minutes: 6, color: "#FF7A00" },
      { zone: "Zone 5", minutes: 2, color: "#EF4444" },
    ],
    syncLog: [
      {
        time: lastSyncAt.slice(11, 19) || "—",
        type: snap?.dataSourceLabel || "Sync mobile Viiv",
        status: "ok",
      },
    ],
    timeline: [
      { time: lastSyncAt.slice(11, 16) || "—", label: "Sync Viiv mobile" },
      { time: "—", label: `SpO₂ ${n(snap?.spo2)}%` },
      { time: "—", label: `Sommeil ${n(snap?.sleepHours).toFixed(1)} h` },
    ],
    alerts: [
      {
        id: "viiv-me",
        message: snap?.dataSourceLabel || "Données Viiv",
        type: "ok",
        time: relativeSync(lastSyncAt),
      },
    ],
    coachNotes: "Données Viiv synchronisées depuis le mobile",
    upcomingMatch: "—",
    weather: "—",
    todayGoals: ["Suivi Viiv", "Hydratation", "Récupération"],
    aiInsight: `${name}: SpO₂ ${n(snap?.spo2)}%, FC ${n(snap?.restingHr)} bpm, stress ${n(snap?.stress)}.`,
    aiRecommendations: ["Porter la montre la nuit", "Sync depuis l’app mobile"],
    aiConfidence: 85,
    viivEnergy: n(snap?.viivEnergy),
    vo2Max: n(snap?.vo2Max),
    gpsActivity: snap?.gpsActivity || "—",
    fromMobile: true,
  };
}

export function hasViivData(snap: JoueurViivSnapshot | null | undefined): boolean {
  if (!snap) return false;
  return (
    n(snap.steps) > 0 ||
    n(snap.calories) > 0 ||
    n(snap.restingHr) > 0 ||
    n(snap.spo2) > 0 ||
    n(snap.sleepHours) > 0 ||
    n(snap.viivEnergy) > 0 ||
    n(snap.hrv) > 0 ||
    Boolean(snap.lastSyncAt)
  );
}
