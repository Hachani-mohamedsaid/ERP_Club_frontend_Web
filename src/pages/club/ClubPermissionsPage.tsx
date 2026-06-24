import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClubPageTransition } from "../../components/club/ClubPageTransition";
import { ClubKpiCard } from "../../components/club/ClubKpiCard";
import { clubApi } from "../../lib/api/club";
import { useClubResource } from "../../hooks/useClubResource";
import { Shield, Save, CheckCircle2, Info } from "lucide-react";

/* ── Types ──────────────────────────────────────────────────────── */
type Role = "Club Admin" | "Coach" | "Médecin" | "Responsable Financier" | "Scout" | "Analyste";
type Action = "lire" | "créer" | "modifier" | "supprimer";

interface Permission {
  lire: boolean;
  créer: boolean;
  modifier: boolean;
  supprimer: boolean;
}

type Matrix = Record<string, Record<Role, Permission>>;

const ROLES: Role[] = ["Club Admin", "Coach", "Médecin", "Responsable Financier", "Scout", "Analyste"];
const ACTIONS: Action[] = ["lire", "créer", "modifier", "supprimer"];

const ROLE_COLOR: Record<Role, string> = {
  "Club Admin":            "#FF6B57",
  "Coach":                 "#3B82F6",
  "Médecin":               "#10B981",
  "Responsable Financier": "#F59E0B",
  "Scout":                 "#8B5CF6",
  "Analyste":              "#EC4899",
};

/* ── Default permissions matrix ─────────────────────────────────── */
function defaultPerm(lire = false, créer = false, modifier = false, supprimer = false): Permission {
  return { lire, créer, modifier, supprimer };
}

const MODULES = [
  { key: "Joueurs",    label: "Gestion Joueurs",   icon: "⚽" },
  { key: "Equipes",    label: "Gestion Équipes",    icon: "🛡️" },
  { key: "Finances",   label: "Finances",           icon: "💰" },
  { key: "Contrats",   label: "Contrats",           icon: "📜" },
  { key: "Calendrier", label: "Calendrier",         icon: "📅" },
  { key: "Sante",      label: "Santé & Médical",    icon: "🏥" },
  { key: "Analytics",  label: "Analytics",          icon: "📊" },
  { key: "Recrutement",label: "Recrutement",        icon: "🔍" },
  { key: "Documents",  label: "Documents",          icon: "📁" },
  { key: "Parametres", label: "Paramètres",         icon: "⚙️" },
];

const INITIAL_MATRIX: Matrix = Object.fromEntries(
  MODULES.map(({ key }) => [
    key,
    {
      "Club Admin":            defaultPerm(true,  true,  true,  true),
      "Coach":                 key === "Joueurs" || key === "Equipes" || key === "Calendrier" || key === "Analytics"
                                 ? defaultPerm(true, true, true, false)
                                 : defaultPerm(true, false, false, false),
      "Médecin":               key === "Sante" || key === "Joueurs"
                                 ? defaultPerm(true, true, true, false)
                                 : defaultPerm(true, false, false, false),
      "Responsable Financier": key === "Finances" || key === "Contrats"
                                 ? defaultPerm(true, true, true, true)
                                 : defaultPerm(true, false, false, false),
      "Scout":                 key === "Recrutement" || key === "Joueurs" || key === "Analytics"
                                 ? defaultPerm(true, true, true, false)
                                 : defaultPerm(false, false, false, false),
      "Analyste":              key === "Analytics" || key === "Joueurs" || key === "Equipes"
                                 ? defaultPerm(true, false, false, false)
                                 : defaultPerm(false, false, false, false),
    } as Record<Role, Permission>,
  ])
);

/* ── Checkbox cell ───────────────────────────────────────────────── */
function PermCheckbox({
  checked, onChange, disabled = false,
}: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <motion.button
      type="button"
      onClick={disabled ? undefined : onChange}
      className="flex h-6 w-6 items-center justify-center rounded-md border mx-auto"
      style={{
        background: checked ? "rgba(255,107,87,0.2)" : "rgba(255,255,255,0.03)",
        borderColor: checked ? "#FF6B57" : "rgba(255,255,255,0.1)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
      }}
      whileHover={disabled ? {} : { scale: 1.15 }}
      whileTap={disabled ? {} : { scale: 0.9 }}
    >
      <AnimatePresence>
        {checked && (
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <CheckCircle2 size={13} style={{ color: "#FF6B57" }} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/* ── Main page ──────────────────────────────────────────────────── */
export function ClubPermissionsPage() {
  const { data: permData, loading, reload } = useClubResource(() => clubApi.getPermissions() as Promise<{ matrix: Matrix }>);
  const [matrix, setMatrix] = useState<Matrix>(INITIAL_MATRIX);
  const [activeRole, setActiveRole] = useState<Role>("Coach");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (permData?.matrix) setMatrix(permData.matrix as Matrix);
  }, [permData]);

  function toggle(module: string, role: Role, action: Action) {
    setMatrix((prev) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [role]: {
          ...prev[module][role],
          [action]: !prev[module][role][action],
        },
      },
    }));
  }

  async function handleSave() {
    try {
      await clubApi.updatePermissions({ matrix });
      await reload();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  }

  return (
    <ClubPageTransition>
      {/* Header */}
      <ClubKpiCard hover={false}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#FF6B57" }}>Admin Club</span>
            <h1 className="mt-1 text-xl font-extrabold" style={{ color: "var(--text-primary)" }}>Matrice des permissions</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Contrôle granulaire des accès par rôle et module.
            </p>
          </div>
          <motion.button
            type="button" onClick={handleSave}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
            style={{ background: saved ? "linear-gradient(135deg,#22C55E,#16A34A)" : "linear-gradient(135deg,#FF6B57,#E65240)", boxShadow: `0 0 20px ${saved ? "rgba(34,197,94,0.4)" : "rgba(255,107,87,0.35)"}` }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
          >
            {saved ? <><CheckCircle2 size={14} /> Sauvegardé!</> : <><Save size={14} /> Sauvegarder</>}
          </motion.button>
        </div>
      </ClubKpiCard>

      {/* Role selector */}
      <div className="flex flex-wrap gap-2">
        {ROLES.map((role) => (
          <motion.button
            key={role} type="button" onClick={() => setActiveRole(role)}
            className="rounded-xl px-4 py-2.5 text-xs font-semibold"
            style={{
              background: activeRole === role ? `${ROLE_COLOR[role]}20` : "rgba(255,255,255,0.04)",
              color: activeRole === role ? ROLE_COLOR[role] : "var(--text-muted)",
              border: `1px solid ${activeRole === role ? ROLE_COLOR[role] + "50" : "rgba(255,255,255,0.08)"}`,
              boxShadow: activeRole === role ? `0 0 16px ${ROLE_COLOR[role]}30` : "none",
            }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          >
            {role}
            {role === "Club Admin" && <span className="ml-1 text-[9px] opacity-60">(toujours)</span>}
          </motion.button>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-xl border p-3 text-xs"
        style={{ background: "rgba(255,107,87,0.06)", borderColor: "rgba(255,107,87,0.2)", color: "var(--text-muted)" }}>
        <Info size={13} style={{ color: "#FF6B57", flexShrink: 0 }} />
        Permissions pour le rôle <strong style={{ color: ROLE_COLOR[activeRole] }}>{activeRole}</strong>.
        Club Admin a toujours tous les droits.
      </div>

      {/* Permissions table */}
      <ClubKpiCard hover={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <th className="pb-3 pr-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  Module
                </th>
                {ACTIONS.map((a) => (
                  <th key={a} className="pb-3 px-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    {a.charAt(0).toUpperCase() + a.slice(1)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULES.map(({ key, label, icon }, i) => {
                const isAdmin = activeRole === "Club Admin";
                const perm = matrix[key][activeRole];
                return (
                  <motion.tr
                    key={key}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b"
                    style={{ borderColor: "rgba(255,255,255,0.04)" }}
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{icon}</span>
                        <span className="font-medium" style={{ color: "var(--text-primary)" }}>{label}</span>
                      </div>
                    </td>
                    {ACTIONS.map((action) => (
                      <td key={action} className="py-3 px-3">
                        <PermCheckbox
                          checked={isAdmin ? true : perm[action]}
                          onChange={() => toggle(key, activeRole, action)}
                          disabled={isAdmin}
                        />
                      </td>
                    ))}
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap items-center gap-4 border-t pt-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Légende :</p>
          {[
            { label: "Accordé", color: "#FF6B57" },
            { label: "Refusé", color: "rgba(255,255,255,0.2)" },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-md border"
                style={{ background: `${color}20`, borderColor: color }}>
                {label === "Accordé" && <CheckCircle2 size={11} style={{ color }} />}
              </div>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</span>
            </div>
          ))}
        </div>
      </ClubKpiCard>

      {/* Role summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {ROLES.map((role) => {
          const totalGranted = MODULES.reduce((acc, { key }) =>
            acc + ACTIONS.filter((a) => role === "Club Admin" || matrix[key][role][a]).length, 0
          );
          const totalPossible = MODULES.length * ACTIONS.length;
          const pct = Math.round((totalGranted / totalPossible) * 100);
          return (
            <ClubKpiCard key={role} delay={0.05} hover={activeRole === role}>
              <p className="text-xs font-semibold" style={{ color: ROLE_COLOR[role] }}>{role}</p>
              <p className="mt-2 text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>{pct}%</p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{totalGranted}/{totalPossible} droits</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: ROLE_COLOR[role] }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
              </div>
            </ClubKpiCard>
          );
        })}
      </div>
    </ClubPageTransition>
  );
}
