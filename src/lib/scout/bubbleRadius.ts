import type { BubbleLevel } from "./bubbleMapTypes";

/** Sqrt scale for bubble radius from prospect count */
export function sqrtRadius(
  count: number,
  minCount: number,
  maxCount: number,
  minR = 28,
  maxR = 72,
): number {
  if (maxCount <= minCount) return (minR + maxR) / 2;
  const t = Math.sqrt((count - minCount) / (maxCount - minCount));
  return minR + t * (maxR - minR);
}

export function countExtents(counts: number[]) {
  if (counts.length === 0) return { min: 0, max: 1 };
  return { min: Math.min(...counts), max: Math.max(...counts) };
}

const LEVEL_RADIUS: Record<BubbleLevel, { min: number; max: number }> = {
  continent: { min: 30, max: 52 },
  country: { min: 26, max: 46 },
  team: { min: 22, max: 44 },
};

export function radiusForLevel(
  level: BubbleLevel,
  count: number,
  minCount: number,
  maxCount: number,
  width: number,
) {
  const cfg = LEVEL_RADIUS[level];
  const cap = Math.min(cfg.max, width / (level === "continent" ? 9 : 7));
  return sqrtRadius(count, minCount, maxCount, cfg.min, cap);
}
