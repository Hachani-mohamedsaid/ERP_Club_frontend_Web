/** Rôles invitables dans un club (alignés backend ClubMemberRole). */
export const CLUB_MEMBER_ROLES = [
  { label: "Club Admin", color: "#FF6B57" },
  { label: "Responsable", color: "#EC4899" },
  { label: "Préparateur Physique", color: "#EF4444" },
  { label: "Analyste Performance", color: "#06B6D4" },
  { label: "Recruteur", color: "#A855F7" },
  { label: "Coach", color: "#F59E0B" },
  { label: "Médecin", color: "#22C55E" },
  { label: "Scout", color: "#3B82F6" },
  { label: "Finance", color: "#EAB308" },
  { label: "Joueur", color: "#84CC16" },
] as const;

export type ClubMemberRoleLabel = (typeof CLUB_MEMBER_ROLES)[number]["label"];

export const CLUB_MEMBER_ROLE_LABELS = CLUB_MEMBER_ROLES.map((r) => r.label);

export const CLUB_MEMBER_ROLE_COLORS: Record<string, string> = Object.fromEntries(
  CLUB_MEMBER_ROLES.map((r) => [r.label, r.color]),
);

type Perm = { lire: boolean; créer: boolean; modifier: boolean; supprimer: boolean };
const p = (lire = false, créer = false, modifier = false, supprimer = false): Perm => ({ lire, créer, modifier, supprimer });

const MODULES = ["Joueurs", "Equipes", "Finances", "Contrats", "Calendrier", "Sante", "Analytics", "Recrutement", "Documents", "Parametres"];

export function buildDefaultClubMatrix(): Record<string, Record<string, Perm>> {
  return Object.fromEntries(
    MODULES.map((key) => [
      key,
      {
        "Club Admin": p(true, true, true, true),
        Responsable:
          ["Joueurs", "Equipes", "Finances", "Contrats", "Calendrier", "Analytics", "Recrutement", "Documents"].includes(key)
            ? p(true, true, true, key !== "Parametres")
            : p(true, false, false, false),
        "Préparateur Physique":
          ["Sante", "Joueurs", "Calendrier", "Analytics"].includes(key)
            ? p(true, true, true, false)
            : p(true, false, false, false),
        "Analyste Performance":
          ["Analytics", "Joueurs", "Equipes"].includes(key) ? p(true, false, false, false) : p(false, false, false, false),
        Recruteur:
          ["Recrutement", "Joueurs", "Analytics"].includes(key) ? p(true, true, true, false) : p(false, false, false, false),
        Coach:
          ["Joueurs", "Equipes", "Calendrier", "Analytics"].includes(key) ? p(true, true, true, false) : p(true, false, false, false),
        Médecin: ["Sante", "Joueurs"].includes(key) ? p(true, true, true, false) : p(true, false, false, false),
        Scout: ["Recrutement", "Joueurs", "Analytics"].includes(key) ? p(true, true, true, false) : p(false, false, false, false),
        Finance: ["Finances", "Contrats"].includes(key) ? p(true, true, true, true) : p(true, false, false, false),
        Joueur: ["Calendrier", "Joueurs"].includes(key) ? p(true, false, false, false) : p(false, false, false, false),
      },
    ]),
  );
}
