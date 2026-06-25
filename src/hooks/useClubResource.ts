import { useCallback, useEffect, useState } from "react";
import { clubApi } from "../lib/api/club";

export function useClubResource<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    return fetcher()
      .then(setData)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Erreur de chargement.");
      })
      .finally(() => setLoading(false));
  }, deps);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}

export function useClubPermissions() {
  return useClubResource(() => clubApi.getPermissions());
}
