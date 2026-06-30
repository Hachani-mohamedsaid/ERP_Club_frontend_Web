export const WHOOP_THEME = {
  orange: "#f97316",
  orangeGlow: "rgba(255,120,0,0.35)",
  emerald: "#34d399",
  emeraldGlow: "rgba(52,211,153,0.35)",
  glass: "rgba(17,24,39,0.55)",
  glassBorder: "rgba(255,255,255,0.08)",
  bg: "#070b14",
} as const;

export function recoveryColor(v: number) {
  if (v >= 67) return WHOOP_THEME.emerald;
  if (v >= 34) return "#fbbf24";
  return "#f87171";
}
