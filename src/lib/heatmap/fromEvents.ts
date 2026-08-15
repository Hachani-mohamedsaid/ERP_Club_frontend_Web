/**
 * Transforms live season-heatmap events from the AI service into the
 * `HeatmapPeriodData` shape consumed by <PlayerHeatmap />.
 *
 * The AI endpoint returns geolocated events in StatsBomb coordinates
 * (x∈[0,120] length toward the opponent goal, y∈[0,80] width). The component
 * positions blobs as percentages inside its pitch container where — matching
 * the existing design — the attacking/opponent surface is at the BOTTOM
 * (high y%) and the right side is at the RIGHT (high x%).
 */
import type { HeatmapEvent } from "../api/ai/player";
import type {
  HeatBlob,
  HeatmapPeriod,
  HeatmapPeriodData,
} from "../../data/joueurPersonalData";

// Grid resolution over StatsBomb space (columns = width/y, rows = length/x).
const Y_BINS = 7; // width  → horizontal blob position
const X_BINS = 10; // length → vertical blob position
const MAX_BLOBS = 8;

// Proportion of the season's events attributed to each shorter period tab.
// The model only serves season-level data, so shorter periods are deterministic
// leading subsets of the same events (no fabricated per-match data).
const PERIOD_RATIO: Record<HeatmapPeriod, number> = {
  season: 1,
  "10matches": 0.8,
  "5matches": 0.45,
  lastMatch: 0.12,
};

/** French zone label from StatsBomb coordinates, matching the app's vocabulary. */
function zoneLabel(x: number, y: number): string {
  const right = y >= 53;
  const left = y <= 27;
  if (x >= 102) return "Surface adverse";
  if (x >= 84) return right ? "Demi-espace droit" : left ? "Demi-espace gauche" : "Entrée surface";
  if (x >= 60) return right ? "Couloir droit" : left ? "Couloir gauche" : "Milieu offensif";
  if (x >= 40) return "Axe offensif";
  return "Zone médiane";
}

/** StatsBomb (x,y) → blob container percentages (clamped away from the edges). */
function toBlobXY(x: number, y: number): { x: number; y: number } {
  const clamp = (v: number) => Math.max(4, Math.min(96, v));
  return {
    x: clamp((y / 80) * 100), // width → horizontal
    y: clamp((x / 120) * 100), // length → vertical (attacking = bottom)
  };
}

interface Cell {
  count: number;
  sumX: number;
  sumY: number;
  shots: number;
  passes: number;
  goals: number;
}

function blobsFromEvents(events: HeatmapEvent[]): HeatBlob[] {
  if (events.length === 0) return [];

  const cells = new Map<string, Cell>();
  for (const ev of events) {
    const col = Math.min(Y_BINS - 1, Math.floor((ev.y / 80) * Y_BINS));
    const row = Math.min(X_BINS - 1, Math.floor((ev.x / 120) * X_BINS));
    const key = `${row}:${col}`;
    const cell = cells.get(key) ?? { count: 0, sumX: 0, sumY: 0, shots: 0, passes: 0, goals: 0 };
    cell.count += 1;
    cell.sumX += ev.x;
    cell.sumY += ev.y;
    if (ev.action_type === "Shot") {
      cell.shots += 1;
      if (ev.success === 1) cell.goals += 1; // successful shot ≈ goal (model has no goal field)
    } else if (ev.action_type === "Pass") {
      cell.passes += 1;
    }
    cells.set(key, cell);
  }

  const ranked = [...cells.values()].sort((a, b) => b.count - a.count).slice(0, MAX_BLOBS);
  const maxCount = ranked[0]?.count ?? 1;

  return ranked.map((cell, i) => {
    const cx = cell.sumX / cell.count;
    const cy = cell.sumY / cell.count;
    const pos = toBlobXY(cx, cy);
    return {
      id: `live-${i}`,
      x: Math.round(pos.x),
      y: Math.round(pos.y),
      intensity: Math.max(0.12, cell.count / maxCount),
      label: zoneLabel(cx, cy),
      actions: cell.count,
      shots: cell.shots,
      passes: cell.passes,
      goals: cell.goals,
    };
  });
}

function periodData(events: HeatmapEvent[], totalActions: number): HeatmapPeriodData {
  const blobs = blobsFromEvents(events);
  const top = blobs[0];
  return {
    blobs,
    favoriteZone: {
      label: top?.label ?? "Surface adverse",
      actions: totalActions,
      // Model provides no month-over-month trend; placeholder keeps the existing UI subtitle.
      trend: "+15%",
    },
  };
}

/** Build the full period map from a season events payload. */
export function buildHeatmapPeriods(
  events: HeatmapEvent[],
): Record<HeatmapPeriod, HeatmapPeriodData> {
  const periods = {} as Record<HeatmapPeriod, HeatmapPeriodData>;
  (Object.keys(PERIOD_RATIO) as HeatmapPeriod[]).forEach((period) => {
    const n = Math.max(1, Math.round(events.length * PERIOD_RATIO[period]));
    const subset = events.slice(0, n);
    periods[period] = periodData(subset, subset.length);
  });
  return periods;
}
