import { useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Users, UserCheck, UserX, Shield } from "lucide-react";
import { SuperAdminPageTransition, SuperAdminPageHeader, SuperAdminGhostButton, SuperAdminKpiCard, SuperAdminKpiGrid, SuperAdminSection, SuperAdminSelectFilter, SuperAdminListRow, SuperAdminCard } from "../components/superadmin";
import { PLATFORM_ROLE_FILTER_OPTIONS } from "../data/platformRoles";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  club: string;
  lastLogin: string;
  status: "Actif" | "Bloqué" | "Inactif";
}

const USERS: UserRecord[] = [
  { id: "u1", name: "Amine Mansour", email: "amine@club.com", role: "Coach", club: "FC Carthage", lastLogin: "18/06/2026", status: "Actif" },
  { id: "u2", name: "Sarra Belhaj", email: "sarra@club.com", role: "Admin Club", club: "ES Sahel", lastLogin: "17/06/2026", status: "Actif" },
  { id: "u3", name: "Rami Saadi", email: "rami@club.com", role: "Scout", club: "CS Sfaxien", lastLogin: "16/06/2026", status: "Bloqué" },
  { id: "u4", name: "Nadia Khemiri", email: "nadia@club.com", role: "Finance", club: "US Monastir", lastLogin: "15/06/2026", status: "Inactif" },
  { id: "u5", name: "Hichem Mansouri", email: "hichem@club.com", role: "Préparateur Physique", club: "FC Carthage", lastLogin: "14/06/2026", status: "Actif" },
  { id: "u6", name: "Amal Gharbi", email: "amal@club.com", role: "Analyste Performance", club: "ES Sahel", lastLogin: "13/06/2026", status: "Actif" },
];

export function SuperAdminUsers() {
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [roleFilter, setRoleFilter] = useState("Tous");
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [clubFilter, setClubFilter] = useState("Tous");

  const filteredUsers = USERS.filter((u) => {
    if (roleFilter !== "Tous" && u.role !== roleFilter) return false;
    if (statusFilter !== "Tous" && u.status !== statusFilter) return false;
    if (clubFilter !== "Tous" && u.club !== clubFilter) return false;
    return true;
  });

  const roles = PLATFORM_ROLE_FILTER_OPTIONS;
  const statuses = ["Tous", "Actif", "Bloqué", "Inactif"];
  const clubs = ["Tous", ...new Set(USERS.map((u) => u.club))];

  return (
    <SuperAdminPageTransition>
      <SuperAdminPageHeader
        title="Gestion Utilisateurs"
        subtitle="Contrôlez les accès et les rôles de la plateforme."
        action={<SuperAdminGhostButton>Créer utilisateur</SuperAdminGhostButton>}
      />

      <SuperAdminKpiGrid>
        <SuperAdminKpiCard label="Total Utilisateurs" value="4 580" icon={Users} color="#3B82F6" />
        <SuperAdminKpiCard label="Actifs" value="4 120" icon={UserCheck} color="#10B981" />
        <SuperAdminKpiCard label="Bloqués" value="186" icon={UserX} color="#EF4444" />
        <SuperAdminKpiCard label="Admins" value="34" icon={Shield} color="#FF7A00" />
      </SuperAdminKpiGrid>

      <div className="flex flex-wrap gap-2">
        <SuperAdminSelectFilter label="Rôle" value={roleFilter} options={roles} onChange={setRoleFilter} />
        <SuperAdminSelectFilter label="Statut" value={statusFilter} options={statuses} onChange={setStatusFilter} />
        <SuperAdminSelectFilter label="Club" value={clubFilter} options={clubs} onChange={setClubFilter} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
        <SuperAdminSection title="Utilisateurs" subtitle="Liste filtrée des comptes.">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--surface-panel-border)" }}>
                  {["Nom", "Email", "Role", "Club", "Dernière connexion", "Statut", "Actions"].map((h, i) => (
                    <th key={h} className={`px-4 py-3 font-semibold ${i === 6 ? "text-right" : "text-left"}`} style={{ color: "var(--text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} style={{ borderBottom: "1px solid var(--surface-panel-border)" }}>
                    <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>{user.name}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{user.email}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>{user.role}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>{user.club}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{user.lastLogin}</td>
                    <td className="px-4 py-3">
                      <Badge tone={user.status === "Actif" ? "success" : user.status === "Bloqué" ? "danger" : "warning"}>{user.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <SuperAdminGhostButton className="px-3 py-1.5 text-xs" onClick={() => setSelectedUser(user)}>Modifier</SuperAdminGhostButton>
                        <SuperAdminGhostButton className="px-3 py-1.5 text-xs">Bloquer</SuperAdminGhostButton>
                        <SuperAdminGhostButton className="px-3 py-1.5 text-xs">Reset</SuperAdminGhostButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SuperAdminSection>

        <div className="space-y-4">
          <SuperAdminSection title="Rôle Assignment" subtitle="Modifier les rôles des utilisateurs." icon={Users}>
            <div className="space-y-2">
              {USERS.slice(0, 2).map((user) => (
                <SuperAdminListRow key={user.id}>
                  <p className="font-medium" style={{ color: "var(--text-primary)" }}>{user.name}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{user.role}</p>
                  <SuperAdminGhostButton className="mt-3 px-3 py-1.5 text-xs">Modifier rôle</SuperAdminGhostButton>
                </SuperAdminListRow>
              ))}
            </div>
          </SuperAdminSection>

          {selectedUser && (
            <SuperAdminCard hover={false} glow className="!p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Profil rapide</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{selectedUser.email}</p>
                </div>
                <SuperAdminGhostButton className="px-3 py-1.5 text-xs" onClick={() => setSelectedUser(null)}>Fermer</SuperAdminGhostButton>
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{selectedUser.name}</p>
              <p className="mt-2 text-sm">Rôle: {selectedUser.role}</p>
            </SuperAdminCard>
          )}
        </div>
      </div>
    </SuperAdminPageTransition>
  );
}
