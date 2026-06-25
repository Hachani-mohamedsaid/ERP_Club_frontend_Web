import { useAuth } from "../contexts/AuthContext";
import { getPlayerById } from "../data/joueurMockData";
import { getPlayerExtended } from "../data/joueurExtendedData";
import { getPlayerIdForEmail } from "../data/joueurPersonalData";
import { usePlayerPhoto } from "./usePlayerPhoto";
import { useJoueurBackendData } from "./useJoueurBackendData";

export function useCurrentPlayer() {
  const { user } = useAuth();
  const playerId = user?.playerId ?? getPlayerIdForEmail(user?.email ?? "joueur@club.com");
  const basePlayer = getPlayerById(playerId);
  const extended = getPlayerExtended(playerId);
  const { photoUrl, setPhoto, handleFileChange } = usePlayerPhoto();
  const { myPlayer: backendPlayer } = useJoueurBackendData();

  // Merge: real backend data (name, position, ovr, marketValue) over mock fallback
  const player = basePlayer
    ? {
        ...basePlayer,
        // Name: prefer auth fullName (from JWT), then backend player record, then mock
        name: user?.fullName?.trim() || backendPlayer?.name || basePlayer.name,
        // Stats that exist in backend: ovr, marketValue, availability
        ovr: backendPlayer?.ovr ?? basePlayer.ovr,
        marketValue: backendPlayer?.marketValue ?? basePlayer.marketValue,
        availability: (backendPlayer?.availability ?? basePlayer.availability) as typeof basePlayer.availability,
        // Stats that only exist as mock (radar, etc.) come from basePlayer untouched
      }
    : null;

  return {
    playerId,
    player,
    extended,
    photoUrl,
    setPhoto,
    handleFileChange,
    backendPlayer,
  };
}
