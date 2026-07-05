import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, FileSignature, Calendar } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { ClubPageTransition } from "../../components/club/ClubPageTransition";
import { ClubKpiCard } from "../../components/club/ClubKpiCard";
import { ClubEmptyState } from "../../components/club/ClubEmptyState";
import { ClubFormModal } from "../../components/club/ClubFormModal";
import { clubApi } from "../../lib/api/club";
import { useClubResource } from "../../hooks/useClubResource";
import { usePermissions } from "../../hooks/usePermissions";

interface StaffMember {
  id: string;
  fullName: string;
  role: string;
  salaryMonthly: number;
  contractEnd: string | null;
  isAvailable: boolean;
}

const STAFF_ROLES = ["Coach", "Adjoint", "Préparateur", "Médecin", "Scout", "Kiné", "Analyste"] as const;

const ROLE_ALIASES: Record<string, string> = {
  coach: "Coach",
  adjoint: "Adjoint",
  préparateur: "Préparateur",
  preparateur: "Préparateur",
  "préparateur physique": "Préparateur",
  médecin: "Médecin",
  medecin: "Médecin",
  scout: "Scout",
  kiné: "Kiné",
  kine: "Kiné",
  analyste: "Analyste",
};

function normalizeRole(role: string) {
  return ROLE_ALIASES[role.trim().toLowerCase()] ?? role.trim();
}

function formatSalary(amount: number) {
  return `${(amount ?? 0).toLocaleString("fr-FR")} DT`;
}

function formatContractDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR");
}

function toDateInput(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 10);
}

const STAFF_FIELDS = [
  { key: "fullName", label: "Nom complet", placeholder: "Karim Jebali" },
  { key: "role", label: "Rôle", type: "select", options: [...STAFF_ROLES] },
  { key: "salaryMonthly", label: "Salaire mensuel (DT)", type: "number", placeholder: "45000" },
  { key: "contractEnd", label: "Fin de contrat", type: "date" },
] as const;

function staffToForm(m: StaffMember): Record<string, string> {
  return {
    fullName: m.fullName,
    role: normalizeRole(m.role),
    salaryMonthly: String(m.salaryMonthly ?? 0),
    contractEnd: toDateInput(m.contractEnd),
  };
}

function buildStaffPayload(v: Record<string, string>) {
  return {
    fullName: v.fullName?.trim(),
    role: normalizeRole(v.role || "Coach"),
    salaryMonthly: Number(v.salaryMonthly) || 0,
    contractEnd: v.contractEnd || null,
  };
}

export function ClubStaffPage() {
  const navigate = useNavigate();
  const { can } = usePermissions();
  const { data, loading, error, reload } = useClubResource(() => clubApi.getStaff() as Promise<StaffMember[]>);
  const staff = data ?? [];
  const [showAdd, setShowAdd] = useState(false);
  const [editMember, setEditMember] = useState<StaffMember | null>(null);
  const [renewMember, setRenewMember] = useState<StaffMember | null>(null);

  const members = useMemo(
    () =>
      staff.map((m) => ({
        id: m.id,
        name: m.fullName,
        role: normalizeRole(m.role),
        salary: formatSalary(m.salaryMonthly),
        contractEnd: formatContractDate(m.contractEnd),
        available: m.isAvailable,
        photo: m.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(),
        raw: m,
      })),
    [staff],
  );

  const sections = useMemo(() => {
    const grouped = new Map<string, typeof members>();
    for (const role of STAFF_ROLES) grouped.set(role, []);
    grouped.set("Autres", []);

    for (const m of members) {
      const bucket = STAFF_ROLES.includes(m.role as (typeof STAFF_ROLES)[number]) ? m.role : "Autres";
      grouped.get(bucket)!.push(m);
    }

    return [...STAFF_ROLES, "Autres"]
      .map((section) => ({ section, items: grouped.get(section) ?? [] }))
      .filter((s) => s.items.length > 0);
  }, [members]);

  const canEdit = can("Equipes", "modifier");

  return (
    <ClubPageTransition>
      <div className="mb-4 flex justify-end">
        {can("Equipes", "créer") && (
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#FF6B57,#E65240)" }}
          >
            <Plus size={16} /> Ajouter staff
          </button>
        )}
      </div>

      {loading && <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement…</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
      {!loading && !error && members.length === 0 && (
        <ClubEmptyState title="Aucun staff" description="Ajoutez les membres de votre équipe technique." />
      )}

      {sections.map(({ section, items }, si) => (
        <div key={section} className="mb-8">
          <h3
            className="mb-3 text-sm font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            {section}
          </h3>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {items.map((member, i) => (
              <ClubKpiCard key={member.id} delay={si * 0.05 + i * 0.03}>
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-bold"
                    style={{ background: "rgba(255,107,87,0.15)", color: "#FF6B57" }}
                  >
                    {member.photo}
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                      {member.name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {member.role}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                          Salaire
                        </p>
                        <p className="font-medium" style={{ color: "#F59E0B" }}>
                          {member.salary}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                          Contrat
                        </p>
                        <p className="font-medium" style={{ color: "var(--text-secondary)" }}>
                          {member.contractEnd}
                        </p>
                      </div>
                    </div>
                    <span
                      className="mt-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        background: member.available ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                        color: member.available ? "#22C55E" : "#EF4444",
                      }}
                    >
                      {member.available ? "Disponible" : "Indisponible"}
                    </span>
                    {canEdit && (
                      <div
                        className="mt-4 flex flex-wrap gap-2 border-t pt-3"
                        style={{ borderColor: "var(--surface-panel-border)" }}
                      >
                        <button
                          type="button"
                          title="Modifier"
                          onClick={() => setEditMember(member.raw)}
                          className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/5"
                          style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-secondary)" }}
                        >
                          <Pencil size={12} /> Modifier
                        </button>
                        <button
                          type="button"
                          title="Renouveler contrat"
                          onClick={() => setRenewMember(member.raw)}
                          className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/5"
                          style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-secondary)" }}
                        >
                          <FileSignature size={12} /> Renouveler contrat
                        </button>
                        <button
                          type="button"
                          title="Voir planning"
                          onClick={() => navigate("/club/calendrier")}
                          className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/5"
                          style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-secondary)" }}
                        >
                          <Calendar size={12} /> Voir planning
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </ClubKpiCard>
            ))}
          </div>
        </div>
      ))}

      <AnimatePresence>
        {showAdd && (
          <ClubFormModal
            title="Ajouter un membre staff"
            fields={[...STAFF_FIELDS]}
            initialValues={{ role: "Coach" }}
            submitLabel="Enregistrer"
            onClose={() => setShowAdd(false)}
            onSubmit={async (v) => {
              if (!v.fullName?.trim()) throw new Error("Le nom complet est requis.");
              await clubApi.createStaff(buildStaffPayload(v));
              await reload();
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editMember && (
          <ClubFormModal
            title={`Modifier — ${editMember.fullName}`}
            fields={[...STAFF_FIELDS]}
            initialValues={staffToForm(editMember)}
            submitLabel="Sauvegarder"
            onClose={() => setEditMember(null)}
            onSubmit={async (v) => {
              if (!v.fullName?.trim()) throw new Error("Le nom complet est requis.");
              await clubApi.updateStaff(editMember.id, buildStaffPayload(v));
              await reload();
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {renewMember && (
          <ClubFormModal
            title={`Renouveler contrat — ${renewMember.fullName}`}
            fields={[{ key: "contractEnd", label: "Nouvelle date de fin", type: "date" }]}
            initialValues={{ contractEnd: toDateInput(renewMember.contractEnd) }}
            submitLabel="Renouveler"
            onClose={() => setRenewMember(null)}
            onSubmit={async (v) => {
              await clubApi.updateStaff(renewMember.id, { contractEnd: v.contractEnd || null });
              await reload();
            }}
          />
        )}
      </AnimatePresence>
    </ClubPageTransition>
  );
}
