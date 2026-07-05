export const VIIV_THEME = {
  cyan: "#22d3ee",
  cyanGlow: "rgba(34,211,238,0.35)",
  emerald: "#34d399",
  emeraldGlow: "rgba(52,211,153,0.35)",
  violet: "#a78bfa",
  glass: "rgba(17,24,39,0.55)",
  glassBorder: "rgba(255,255,255,0.08)",
  bg: "#030712",
} as const;

/** @deprecated use VIIV_THEME */
export const WHOOP_THEME = VIIV_THEME;

export function recoveryColor(v: number) {
  if (v >= 67) return VIIV_THEME.emerald;
  if (v >= 34) return "#fbbf24";
  return "#f87171";
}

export function energyColor(v: number) {
  if (v >= 70) return VIIV_THEME.cyan;
  if (v >= 40) return "#fbbf24";
  return "#f87171";
}
