import { useCallback, useEffect, useRef, useState } from "react";

export function usePlatformResource<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasDataRef = useRef(false);

  useEffect(() => {
    hasDataRef.current = data !== null;
  }, [data]);

  const reload = useCallback(() => {
    const isRefresh = hasDataRef.current;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    return fetcher()
      .then((result) => {
        setData(result);
        hasDataRef.current = true;
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Erreur de chargement.");
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, deps);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    data,
    loading: loading && !hasDataRef.current,
    error,
    reload,
    refreshing,
  };
}
