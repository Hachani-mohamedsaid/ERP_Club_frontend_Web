/** ODIN + Viiv wearable tokens — aligned with mobile `odin_colors.dart` / Viiv Accueil */
export const VIIV_THEME = {
  bg: "#0B0B14",
  bgMid: "#10101C",
  canvas2: "#12121C",
  panel: "#16162A",
  glass: "rgba(28, 28, 46, 0.72)",
  glassRaised: "rgba(40, 40, 64, 0.85)",
  glassBorder: "rgba(255, 255, 255, 0.12)",
  text: "#F5F6FA",
  textSecondary: "#CFD1D9",
  muted: "#A8ABB8",
  cyan: "#22D3EE",
  cyanDeep: "#0891B2",
  cyanGlow: "rgba(34, 211, 238, 0.35)",
  orange: "#FF7A00",
  orangeStrong: "#E66000",
  coral: "#FF6B57",
  green: "#22C55E",
  emerald: "#34D399",
  emeraldGlow: "rgba(52, 211, 153, 0.35)",
  hr: "#EF4444",
  sleep: "#818CF8",
  sleepDeep: "#4F46E5",
  hrv: "#34D399",
  stress: "#D99A1F",
  energy: "#FF7A00",
  violet: "#a78bfa",
  radiusCard: 22,
  radiusBtn: 16,
  blur: 18,
} as const;

/** @deprecated use VIIV_THEME */
export const WHOOP_THEME = VIIV_THEME;

export function recoveryColor(v: number) {
  if (v >= 67) return VIIV_THEME.green;
  if (v >= 34) return VIIV_THEME.stress;
  return "#F87171";
}

export function energyColor(v: number) {
  if (v >= 70) return VIIV_THEME.orange;
  if (v >= 40) return VIIV_THEME.stress;
  return "#F87171";
}

export const METRIC_COLORS = {
  fc: VIIV_THEME.hr,
  sleep: VIIV_THEME.sleep,
  spo2: VIIV_THEME.cyan,
  hrv: VIIV_THEME.hrv,
  stress: VIIV_THEME.stress,
  energy: VIIV_THEME.energy,
  steps: VIIV_THEME.green,
  calories: VIIV_THEME.orange,
  distance: VIIV_THEME.cyan,
} as const;
