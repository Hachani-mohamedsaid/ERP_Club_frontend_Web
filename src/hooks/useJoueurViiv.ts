import { useCallback, useEffect, useState } from "react";
import { joueurApi } from "../lib/api/joueur";
import {
  hasViivData,
  mapJoueurViivToWhoop,
  type JoueurViivHistoryResponse,
  type JoueurViivSnapshot,
} from "../lib/viiv/mapJoueurViivToWhoop";
import type { WhoopPlayerMetrics } from "../data/whoopData";
import { useCurrentPlayer } from "./useCurrentPlayer";

export function useJoueurViiv(pollMs = 8000) {
  const { player, playerId } = useCurrentPlayer();
  const [snap, setSnap] = useState<JoueurViivSnapshot | null>(null);
  const [history, setHistory] = useState<JoueurViivHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback((opts?: { silent?: boolean }) => {
    if (!opts?.silent) {
      setLoading(true);
      setError(null);
    }
    return Promise.all([joueurApi.getViiv(), joueurApi.getViivHistory(40)])
      .then(([s, h]) => {
        setSnap(s);
        setHistory(h);
      })
      .catch((err: unknown) => {
        if (!opts?.silent) {
          setError(err instanceof Error ? err.message : "Erreur de chargement Viiv.");
        }
      })
      .finally(() => {
        if (!opts?.silent) setLoading(false);
      });
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (!pollMs || pollMs < 2000) return;
    const timer = window.setInterval(() => {
      void reload({ silent: true });
    }, pollMs);
    return () => window.clearInterval(timer);
  }, [pollMs, reload]);

  const metrics: WhoopPlayerMetrics | null = snap
    ? mapJoueurViivToWhoop(snap, {
        id: playerId || player?.id || "me",
        name: player?.name || snap.playerName,
        position: player?.position,
      })
    : null;

  return {
    metrics,
    history,
    hasData: hasViivData(snap),
    loading,
    error,
    reload,
    playerName: metrics?.name ?? player?.name ?? "Joueur",
  };
}
