import { useAuth } from "../contexts/AuthContext";
import { getPlayerById } from "../data/joueurMockData";
import { getPlayerIdForEmail } from "../data/joueurPersonalData";
import { usePlayerPhoto } from "./usePlayerPhoto";
import { useJoueurBackendData } from "./useJoueurBackendData";

const NATIONALITY_FLAG: Record<string, string> = {
  tunisie: "🇹🇳",
  maroc: "🇲🇦",
  algerie: "🇩🇿",
  france: "🇫🇷",
  sénégal: "🇸🇳",
  senegal: "🇸🇳",
  egypt: "🇪🇬",
  egypte: "🇪🇬",
  ghana: "🇬🇭",
  mali: "🇲🇱",
};

function getFlag(nationality: string): string {
  const key = (nationality ?? "").toLowerCase().trim();
  return NATIONALITY_FLAG[key] ?? "🏳️";
}

export function useCurrentPlayer() {
  const { user } = useAuth();
  const playerId = user?.playerId ?? getPlayerIdForEmail(user?.email ?? "joueur@club.com");
  const basePlayer = getPlayerById(playerId);
  const { photoUrl: localPhotoUrl, setPhoto, handleFileChange } = usePlayerPhoto();
  const { myPlayer: backendPlayer, myPlayerId, playerStats } = useJoueurBackendData();

  // Photo: local upload takes priority, then backend photoUrl
  const photoUrl = localPhotoUrl ?? backendPlayer?.photoUrl ?? null;

  const nationality = backendPlayer?.nationality || basePlayer?.nationality || "—";
  const flag = nationality && nationality !== "—" ? getFlag(nationality) : "";

  const player = basePlayer
    ? {
        ...basePlayer,
        name: user?.fullName?.trim() || backendPlayer?.name || basePlayer.name,
        ovr: backendPlayer?.ovr ?? playerStats?.form ?? basePlayer.ovr,
        marketValue: playerStats?.dashboardHero?.marketValue ?? backendPlayer?.marketValue ?? basePlayer.marketValue,
        availability: (backendPlayer?.availability ?? basePlayer.availability) as typeof basePlayer.availability,
        nationality,
        flag,
        positionFull: backendPlayer?.positionFull || backendPlayer?.position || basePlayer.positionFull,
        jerseyNumber: backendPlayer?.jerseyNumber ?? 0,
        height: backendPlayer?.height || "",
        weight: backendPlayer?.weight || "",
        strongFoot: backendPlayer?.strongFoot || "—",
        birthDate: backendPlayer?.birthDate || "",
        radar: backendPlayer?.radar
          ? {
              speed: (backendPlayer.radar as Record<string, number>).speed ?? basePlayer.radar.speed,
              shooting: (backendPlayer.radar as Record<string, number>).shooting ?? basePlayer.radar.shooting,
              passing: (backendPlayer.radar as Record<string, number>).passing ?? basePlayer.radar.passing,
              dribbling: (backendPlayer.radar as Record<string, number>).dribbling ?? basePlayer.radar.dribbling,
              physical: (backendPlayer.radar as Record<string, number>).physical ?? basePlayer.radar.physical,
              vision: (backendPlayer.radar as Record<string, number>).vision ?? basePlayer.radar.vision,
            }
          : basePlayer.radar,
      }
    : null;

  return {
    playerId: myPlayerId ?? playerId,
    player,
    photoUrl,
    setPhoto,
    handleFileChange,
    backendPlayer,
    playerStats,
  };
}
