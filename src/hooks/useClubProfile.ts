import { useAuth } from "../contexts/AuthContext";

export function getClubInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function getFirstName(fullName?: string): string {
  if (!fullName?.trim()) return "Admin";
  return fullName.trim().split(/\s+/)[0] ?? "Admin";
}

export function useClubProfile() {
  const { user } = useAuth();
  const org = user?.organization ?? null;
  const clubName = org?.clubName ?? "Mon Club";
  const adminName = getFirstName(user?.fullName);
  const season = String(new Date().getFullYear());
  const logoUrl = org?.logoUrl ?? null;
  const initials = getClubInitials(clubName);

  return {
    user,
    org,
    clubName,
    adminName,
    fullName: user?.fullName,
    email: user?.email,
    season,
    logoUrl,
    initials,
    country: org?.country ?? "",
    league: org?.league ?? "",
    isRealAccount: Boolean(org?.clubName),
  };
}
////coffff