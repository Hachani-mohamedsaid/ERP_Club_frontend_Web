import { useEffect, useState } from "react";
import { fetchClubDashboard, type ClubDashboardResponse } from "../lib/api/clubDashboard";
import { useAuth } from "../contexts/AuthContext";

export function useClubDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<ClubDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const orgId = user?.organization?.id;
    const email = user?.email;

    if (!orgId || !email) {
      setLoading(false);
      setData(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchClubDashboard(orgId)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Impossible de charger le dashboard.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.organization?.id, user?.email]);

  return { data, loading, error, hasOrg: Boolean(user?.organization?.id) };
}
