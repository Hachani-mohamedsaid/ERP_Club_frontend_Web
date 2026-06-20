import { Pencil, FileSignature, Calendar } from "lucide-react";
import { ClubPageTransition } from "../../components/club/ClubPageTransition";
import { ClubKpiCard } from "../../components/club/ClubKpiCard";
import { STAFF_MEMBERS } from "../../data/clubAdminData";

const ROLE_SECTIONS = ["Coach", "Adjoint", "Préparateur", "Médecin", "Scout", "Kiné"];

export function ClubStaffPage() {
  return (
    <ClubPageTransition>
      {ROLE_SECTIONS.map((section, si) => {
        const members = STAFF_MEMBERS.filter((m) => m.role === section);
        if (members.length === 0) return null;
        return (
          <div key={section}>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{section}</h3>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {members.map((member, i) => (
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

                      <span
                        className="mt-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{
                          background: member.available ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                          color: member.available ? "#22C55E" : "#EF4444",
                        }}
                      >
                        {member.available ? "Disponible" : "Indisponible"}
                      </span>

                      <div className="mt-4 flex flex-wrap gap-2 border-t pt-3" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                        {[
                          { icon: Pencil, label: "Modifier" },
                          { icon: FileSignature, label: "Renouveler contrat" },
                          { icon: Calendar, label: "Voir planning" },
                        ].map(({ icon: Icon, label }) => (
                          <button
                            key={label}
                            type="button"
                            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all hover:bg-white/5"
                            style={{ borderColor: "rgba(255,255,255,0.08)", color: "var(--text-secondary)" }}
                          >
                            <Icon size={12} />{label}
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
    </ClubPageTransition>
  );
}
