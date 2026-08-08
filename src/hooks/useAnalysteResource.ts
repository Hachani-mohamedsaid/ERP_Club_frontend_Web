import { useCallback, useEffect, useState } from "react";
import { analysteApi } from "../lib/api/analyste";

export function useAnalysteResource<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback((opts?: { silent?: boolean }) => {
    if (!opts?.silent) {
      setLoading(true);
      setError(null);
    }
    return fetcher()
      .then(setData)
      .catch((err: unknown) => {
        if (!opts?.silent) {
          setError(err instanceof Error ? err.message : "Erreur de chargement.");
        }
      })
      .finally(() => {
        if (!opts?.silent) setLoading(false);
      });
  }, deps);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}

export const useAnalysteDashboard = () => useAnalysteResource(() => analysteApi.getDashboard());
export const useAnalysteExecutive = () => useAnalysteResource(() => analysteApi.getExecutive());
export const useAnalysteLiveMatch = () => useAnalysteResource(() => analysteApi.getLiveMatch());
export const useAnalystePredictionTeams = () => useAnalysteResource(() => analysteApi.getPredictionTeams());
export const useAnalystePPI = () => useAnalysteResource(() => analysteApi.getPPI());
export const useAnalysteChemistry = () => useAnalysteResource(() => analysteApi.getChemistry());
export const useAnalystePatterns = () => useAnalysteResource(() => analysteApi.getPatterns());
export const useAnalysteTactical = () => useAnalysteResource(() => analysteApi.getTactical());
export const useAnalysteVideoAnalysis = () => useAnalysteResource(() => analysteApi.getVideoAnalysis());
export const useAnalysteVideoCoach = () => useAnalysteResource(() => analysteApi.getVideoCoach());
export const useAnalysteReplay = () => useAnalysteResource(() => analysteApi.getReplay());
export const useAnalysteOpponent = () => useAnalysteResource(() => analysteApi.getOpponent());
export const useAnalysteFatigue = () => useAnalysteResource(() => analysteApi.getFatigue());
export function useAnalysteWhoop(pollMs = 8000) {
  const resource = useAnalysteResource(() => analysteApi.getWhoop());

  useEffect(() => {
    if (!pollMs || pollMs < 2000) return;
    const timer = window.setInterval(() => {
      void resource.reload({ silent: true });
    }, pollMs);
    return () => window.clearInterval(timer);
  }, [pollMs, resource.reload]);

  return resource;
}
export const useAnalysteInjuries = () => useAnalysteResource(() => analysteApi.getInjuries());
export const useAnalysteInjuryForecast = () => useAnalysteResource(() => analysteApi.getInjuryForecast());
export const useAnalysteTransfer = () => useAnalysteResource(() => analysteApi.getTransfer());
export const useAnalysteMarketValue = () => useAnalysteResource(() => analysteApi.getMarketValue());
export const useAnalysteScouting = () => useAnalysteResource(() => analysteApi.getScouting());
export const useAnalysteEvolution = () => useAnalysteResource(() => analysteApi.getEvolution());
export const useAnalysteTraining = () => useAnalysteResource(() => analysteApi.getTraining());
