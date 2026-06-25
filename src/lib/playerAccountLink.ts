export interface PlayerWithAccount {
  id: string;
  name: string;
  position?: string;
  hasAccount: boolean;
  accountEmail?: string | null;
}

export interface ClubMemberLike {
  name: string;
  email: string;
  role: string;
  clubPlayerId?: string | null;
}

export function enrichPlayersWithAccounts<T extends { id: string; name: string; position?: string }>(
  players: T[],
  members: ClubMemberLike[],
): (T & PlayerWithAccount)[] {
  const joueurMembers = members.filter((m) => m.role === "Joueur");
  const byPlayerId = new Map(
    joueurMembers.filter((m) => m.clubPlayerId).map((m) => [m.clubPlayerId!, m]),
  );
  const byName = new Map(joueurMembers.map((m) => [m.name.trim().toLowerCase(), m]));

  return players.map((p) => {
    const linked = byPlayerId.get(p.id) ?? byName.get(p.name.trim().toLowerCase());
    return {
      ...p,
      hasAccount: Boolean(p.hasAccount) || Boolean(linked),
      accountEmail: linked?.email ?? p.accountEmail ?? null,
    };
  });
}
