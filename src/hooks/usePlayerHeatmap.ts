/**
 * Fetches the player's live season heatmap from the AI service and transforms
 * it into the period map consumed by <PlayerHeatmap />. Falls back to the
 * curated static data on any error/timeout so the UI never breaks.
 */
import { useEffect, useState } from "react";
import { aiPlayerApi } from "../lib/api/ai/player";
import { buildHeatmapPeriods } from "../lib/heatmap/fromEvents";
import {
  HEATMAP_BY_PERIOD,
  type HeatmapPeriod,
  type HeatmapPeriodData,
} from "../data/joueurPersonalData";

export interface UsePlayerHeatmapResult {
  periods: Record<HeatmapPeriod, HeatmapPeriodData>;
  loading: boolean;
  source: "live" | "static";
}

export function usePlayerHeatmap(playerId: number): UsePlayerHeatmapResult {
  const [periods, setPeriods] = useState<Record<HeatmapPeriod, HeatmapPeriodData>>(HEATMAP_BY_PERIOD);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"live" | "static">("static");

  useEffect(() => {
    let cancelled = false;

    aiPlayerApi
      .getSeasonHeatmap(playerId)
      .then((res) => {
        if (cancelled) return;
        if (res.events?.length) {
          setPeriods(buildHeatmapPeriods(res.events));
          setSource("live");
        }
      })
      .catch(() => {
        // Keep the static fallback already in state.
        if (!cancelled) setSource("static");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [playerId]);

  return { periods, loading, source };
}
