import { useAuth } from "../contexts/AuthContext";
import { getPlayerExtended } from "../data/joueurExtendedData";
import { getPlayerById } from "../data/joueurMockData";
import { getPlayerIdForEmail } from "../data/joueurPersonalData";
import { joueurApi } from "../lib/api/joueur";
import { useClubResource } from "./useClubResource";

export function useCurrentPlayer() {
  const { user } = useAuth();
  const isJoueur = user?.role === "joueur";

  const { data: apiMe, loading } = useClubResource(
    () => (isJoueur ? joueurApi.getMe() : Promise.resolve(null)),
    [isJoueur, user?.email],
  );
  const { data: apiExtended } = useClubResource(
    () => (isJoueur ? joueurApi.getExtended() : Promise.resolve(null)),
    [isJoueur, user?.email],
  );

  const fallbackId = user?.playerId ?? getPlayerIdForEmail(user?.email ?? "joueur@club.com");
  const mockPlayer = getPlayerById(fallbackId);
  const mockExtended = getPlayerExtended(fallbackId);

  if (isJoueur && apiMe && !loading) {
    const ext = apiExtended as {
      career?: unknown[];
      evolution?: unknown[];
      heatmapZones?: unknown[];
      training?: unknown;
      matchAnalysis?: unknown;
      aiInsight?: unknown;
      awards?: unknown[];
    } | null;

    return {
      playerId: apiMe.id,
      player: {
        ...mockPlayer,
        id: apiMe.id,
        name: apiMe.name,
        position: apiMe.position,
        age: apiMe.age,
        ovr: apiMe.ovr,
        marketValue: apiMe.marketValue,
        availability: apiMe.availability,
        contract: apiMe.contract,
        radar: apiMe.radar,
        stats: { ...mockPlayer.stats, goals: apiMe.goals ?? mockPlayer.stats.goals },
      },
      extended: ext
        ? {
            ...mockExtended,
            career: ext.career ?? mockExtended.career,
            evolution: ext.evolution ?? mockExtended.evolution,
            heatmapZones: ext.heatmapZones ?? mockExtended.heatmapZones,
            training: ext.training ?? mockExtended.training,
            matchAnalysis: ext.matchAnalysis ?? mockExtended.matchAnalysis,
            aiInsight: ext.aiInsight ?? mockExtended.aiInsight,
            awards: ext.awards ?? mockExtended.awards,
          }
        : mockExtended,
      loading,
    };
  }

  return { playerId: fallbackId, player: mockPlayer, extended: mockExtended, loading: false };
}
