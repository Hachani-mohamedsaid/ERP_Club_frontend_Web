import { useMemo } from "react";
import { useClubPermissions } from "./useClubResource";
import { useAuth } from "../contexts/AuthContext";

type Action = "lire" | "créer" | "modifier" | "supprimer";

type PermMatrix = Record<string, Record<string, { lire: boolean; créer: boolean; modifier: boolean; supprimer: boolean }>>;

/** Map auth role → libellé matrice RBAC backend */
const MATRIX_ROLE: Record<string, string> = {
  adminclub: "Club Admin",
  coach: "Coach",
  medical: "Médecin",
  finance: "Finance",
  scout: "Scout",
  analyste: "Analyste Performance",
  preparateur: "Préparateur Physique",
  recruteur: "Recruteur",
  responsable: "Responsable",
  joueur: "Joueur",
};

export function usePermissions() {
  const { user } = useAuth();
  const { data, loading } = useClubPermissions();
  const matrix = (data as { matrix?: PermMatrix } | null)?.matrix;

  const matrixRole = useMemo(
    () => user?.clubMemberRole ?? MATRIX_ROLE[user?.role ?? ""] ?? "Club Admin",
    [user?.clubMemberRole, user?.role],
  );

  const isClubAdmin =
    user?.clubMemberRole === "Club Admin" ||
    (!user?.clubMemberRole && user?.role === "adminclub");

  function can(module: string, action: Action): boolean {
    if (isClubAdmin) return true;
    if (loading || !matrix) return false;
    const perm = matrix[module]?.[matrixRole];
    if (!perm) return false;
    return perm[action];
  }

  return { can, loading, roleLabel: matrixRole, matrix, isClubAdmin };
}
