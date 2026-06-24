import { useMemo } from "react";
import { useClubPermissions } from "./useClubResource";
import { useAuth } from "../contexts/AuthContext";

type Action = "lire" | "créer" | "modifier" | "supprimer";

type PermMatrix = Record<string, Record<string, { lire: boolean; créer: boolean; modifier: boolean; supprimer: boolean }>>;

const ROLE_MAP: Record<string, string> = {
  adminclub: "Club Admin",
  coach: "Coach",
  medical: "Médecin",
  finance: "Responsable Financier",
  scout: "Scout",
  analyste: "Analyste",
  responsable: "Club Admin",
};

export function usePermissions() {
  const { user } = useAuth();
  const { data, loading } = useClubPermissions();
  const matrix = (data as { matrix?: PermMatrix } | null)?.matrix;

  const roleLabel = useMemo(() => {
    const r = user?.role ?? "";
    return ROLE_MAP[r] ?? "Club Admin";
  }, [user?.role]);

  function can(module: string, action: Action): boolean {
    if (roleLabel === "Club Admin") return true;
    if (!matrix?.[module]?.[roleLabel]) return false;
    return matrix[module][roleLabel][action];
  }

  return { can, loading, roleLabel, matrix };
}
