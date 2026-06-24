import { useState } from "react";
import { Plus } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { ClubPageTransition } from "../../components/club/ClubPageTransition";
import { ClubKpiCard } from "../../components/club/ClubKpiCard";
import { ClubEmptyState } from "../../components/club/ClubEmptyState";
import { ClubFormModal } from "../../components/club/ClubFormModal";
import { clubApi } from "../../lib/api/club";
import { useClubResource } from "../../hooks/useClubResource";
import { usePermissions } from "../../hooks/usePermissions";
import { Pencil, FileSignature, Calendar } from "lucide-react";

interface StaffMember {
  id: string;
  fullName: string;
  role: string;
  salaryMonthly: number;
  contractEnd: string | null;
  isAvailable: boolean;
}

const ROLE_SECTIONS = ["Coach", "Adjoint", "Préparateur", "Médecin", "Scout", "Kiné"];

export function ClubStaffPage() {
  const { can } = usePermissions();
  const { data, loading, error, reload } = useClubResource(() => clubApi.getStaff() as Promise<StaffMember[]>);
  const staff = data ?? [];
  const [showAdd, setShowAdd] = useState(false);

  const members = staff.map((m) => ({
    id: m.id,
    name: m.fullName,
    role: m.role,
    salary: `${m.salaryMonthly.toLocaleString("fr-FR")} DT/mois`,
    contractEnd: m.contractEnd ? new Date(m.contractEnd).toLocaleDateString("fr-FR") : "—",
    available: m.isAvailable,
    photo: m.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2),
  }));

  return (
    <ClubPageTransition>
      <div className="mb-4 flex justify-end">
        {can("Equipes", "créer") && (
          <button type="button" onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#FF6B57,#E65240)" }}>
            <Plus size={16} /> Ajouter staff
          </button>
        )}
      </div>

      {loading && <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement…</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
      {!loading && !error && members.length === 0 && (
        <ClubEmptyState title="Aucun staff" description="Ajoutez les membres de votre équipe technique." />
      )}

      {ROLE_SECTIONS.map((section, si) => {
        const sectionMembers = members.filter((m) => m.role === section);
        if (sectionMembers.length === 0) return null;
        return (
          <div key={section}>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{section}</h3>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {sectionMembers.map((member, i) => (
                <ClubKpiCard key={member.id} delay={si * 0.05 + i * 0.03}>
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-bold" style={{ background: "rgba(255,107,87,0.15)", color: "#FF6B57" }}>
                      {member.photo}
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{member.name}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{member.role}</p>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Salaire</p>
                          <p className="font-medium" style={{ color: "#F59E0B" }}>{member.salary}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Contrat</p>
                          <p className="font-medium" style={{ color: "var(--text-secondary)" }}>{member.contractEnd}</p>
                        </div>
                      </div>
                      <span className="mt-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{
                          background: member.available ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                          color: member.available ? "#22C55E" : "#EF4444",
                        }}>
                        {member.available ? "Disponible" : "Indisponible"}
                      </span>
                      <div className="mt-4 flex flex-wrap gap-2 border-t pt-3" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                        {[Pencil, FileSignature, Calendar].map((Icon, idx) => (
                          <button key={idx} type="button" className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-white/5"
                            style={{ borderColor: "rgba(255,255,255,0.08)", color: "var(--text-secondary)" }}>
                            <Icon size={12} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </ClubKpiCard>
              ))}
            </div>
          </div>
        );
      })}

      <AnimatePresence>
        {showAdd && (
          <ClubFormModal
            title="Ajouter un membre staff"
            fields={[
              { key: "fullName", label: "Nom complet" },
              { key: "role", label: "Rôle", placeholder: "Coach" },
              { key: "salaryMonthly", label: "Salaire mensuel (DT)", type: "number" },
            ]}
            onClose={() => setShowAdd(false)}
            onSubmit={async (v) => {
              await clubApi.createStaff({
                fullName: v.fullName,
                role: v.role || "Coach",
                salaryMonthly: Number(v.salaryMonthly) || 0,
              });
              await reload();
            }}
          />
        )}
      </AnimatePresence>
    </ClubPageTransition>
  );
}
