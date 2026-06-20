import { useAuth } from "../contexts/AuthContext";
import { getPlayerById } from "../data/joueurMockData";
import { getPlayerExtended } from "../data/joueurExtendedData";
import { getPlayerIdForEmail } from "../data/joueurPersonalData";

export function useCurrentPlayer() {
  const { user } = useAuth();
  const playerId = user?.playerId ?? getPlayerIdForEmail(user?.email ?? "joueur@club.com");
  const player = getPlayerById(playerId);
  const extended = getPlayerExtended(playerId);

  return { playerId, player, extended };
}
