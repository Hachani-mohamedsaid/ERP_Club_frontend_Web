import { useCallback, useEffect, useState } from "react";
import { scoutApi } from "../lib/api/scout";
import { mapProspectToScoutPlayer } from "../lib/recruteurTalent";
import type { ScoutPlayer } from "../data/recruteurData";

export function useRecruteurTalents() {
  const [talents, setTalents] = useState<ScoutPlayer[]>([]);
  const [shortlistIds, setShortlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prospects, watchlist] = await Promise.all([
        scoutApi.getProspects(),
        scoutApi.getWatchlist(),
      ]);
      const ids = new Set(watchlist.map((p) => p.id));
      setShortlistIds(ids);
      setTalents(prospects.map((p) => mapProspectToScoutPlayer(p, ids.has(p.id))));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const toggleShortlist = useCallback(async (id: string) => {
    const inList = shortlistIds.has(id);
    try {
      if (inList) await scoutApi.removeFromWatchlist(id);
      else await scoutApi.addToWatchlist(id);
      setShortlistIds((prev) => {
        const next = new Set(prev);
        if (inList) next.delete(id);
        else next.add(id);
        return next;
      });
      setTalents((prev) => prev.map((p) => (p.id === id ? { ...p, shortlisted: !inList } : p)));
    } catch {
      // leave state untouched on failure so the UI stays consistent with the server
    }
  }, [shortlistIds]);

  const getById = useCallback((id: string | undefined | null) => {
    return talents.find((p) => p.id === id) ?? null;
  }, [talents]);

  return { talents, loading, error, shortlistIds, toggleShortlist, getById, refresh };
}
