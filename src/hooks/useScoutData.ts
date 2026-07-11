import { useCallback, useEffect, useState } from "react";
import { PROSPECTS, type Priority, type WorkflowStatus } from "../data/scoutData";
import { scoutApi, type ScoutDashboardDto, type ScoutProspectDto } from "../lib/api/scout";

export type ScoutProspect = ScoutProspectDto & {
  priority: Priority;
  status: WorkflowStatus;
};

function toProspect(dto: ScoutProspectDto): ScoutProspect {
  const mock = PROSPECTS.find(
    (p) => p.id === dto.legacyId || p.name === dto.name,
  );

  return {
    ...dto,
    priority: (dto.priority as Priority) || "B",
    status: (dto.status as WorkflowStatus) || "new",
    matchHistory: mock?.matchHistory ?? [],
    monthlyPotential: mock?.monthlyPotential ?? [70, 71, 72, 73, 74, dto.potential],
    heatmapZones: mock?.heatmapZones ?? [],
  } as ScoutProspect;
}

export function useScoutProspects() {
  const [prospects, setProspects] = useState<ScoutProspect[]>([]);
  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [all, watchlist] = await Promise.all([
        scoutApi.getProspects(),
        scoutApi.getWatchlist(),
      ]);
      setProspects(all.map(toProspect));
      setWatchlistIds(new Set(watchlist.map((p) => p.id)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur chargement");
      setProspects(PROSPECTS as unknown as ScoutProspect[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const toggleWatchlist = async (id: string) => {
    const inList = watchlistIds.has(id);
    try {
      if (inList) {
        await scoutApi.removeFromWatchlist(id);
        setWatchlistIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } else {
        await scoutApi.addToWatchlist(id);
        setWatchlistIds((prev) => new Set(prev).add(id));
      }
    } catch {
      /* toast handled by caller */
    }
  };

  const updateWorkflow = async (id: string, workflow: WorkflowStatus) => {
    await scoutApi.updateProspect(id, { workflow });
    setProspects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: workflow } : p)),
    );
  };

  return {
    prospects,
    watchlistIds,
    loading,
    error,
    refresh,
    toggleWatchlist,
    updateWorkflow,
  };
}

export function useScoutDashboard() {
  const [data, setData] = useState<ScoutDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dashboard = await scoutApi.getDashboard();
      setData(dashboard);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur chargement");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

export function useScoutWatchlist() {
  const [items, setItems] = useState<ScoutProspect[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await scoutApi.getWatchlist();
      setItems(list.map(toProspect));
    } catch {
      setItems(PROSPECTS.filter((p) => ["pr1", "pr6"].includes(p.id)) as unknown as ScoutProspect[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { items, loading, refresh };
}
