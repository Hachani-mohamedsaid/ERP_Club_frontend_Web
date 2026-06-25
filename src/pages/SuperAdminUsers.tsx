import { useMemo, useState, useCallback } from "react";
import { Badge } from "../components/ui/Badge";
import { Users, UserCheck, UserX, Shield } from "lucide-react";
import {
  SuperAdminPageTransition,
  SuperAdminPageHeader,
  SuperAdminGhostButton,
  SuperAdminKpiCard,
  SuperAdminKpiGrid,
  SuperAdminSection,
  SuperAdminSelectFilter,
  SuperAdminListRow,
  SuperAdminCard,
  SuperAdminActionButton,
} from "../components/superadmin";
import { PLATFORM_ROLE_FILTER_OPTIONS } from "../data/platformRoles";
import { platformApi } from "../lib/api/platform";
import { usePlatformResource } from "../hooks/usePlatformResource";
import { useOpenFromNavState } from "../hooks/useOpenFromNavState";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  club: string;
  lastLogin: string;
  status: string;
  isActive: boolean;
}

export function SuperAdminUsers() {
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    organizationId: "",
    fullName: "",
    email: "",
    password: "",
    clubRole: "COACH",
  });
  const [createError, setCreateError] = useState<string | null>(null);
  const [orgsForCreate, setOrgsForCreate] = useState<{ id: string; name: string }[]>([]);
  const [roleFilter, setRoleFilter] = useState("Tous");
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [clubFilter, setClubFilter] = useState("Tous");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { data, loading, error, reload } = usePlatformResource(
    () => platformApi.getUsers({ role: roleFilter, status: statusFilter, club: clubFilter }),
    [roleFilter, statusFilter, clubFilter],
  );

  const users = (data?.users ?? []) as UserRow[];
  const summary = data?.summary ?? { total: 0, active: 0, blocked: 0, admins: 0 };

  const clubs = useMemo(
    () => ["Tous", ...new Set(users.map((u) => u.club).filter((c) => c !== "—"))],
    [users],
  );

  const orgOptions = orgsForCreate;

  const openCreateModal = useCallback(async () => {
    setCreateError(null);
    try {
      const orgs = await platformApi.getOrganizations();
      setOrgsForCreate(orgs.map((o) => ({ id: o.id, name: o.name })));
      setCreateForm((f) => ({
        ...f,
        organizationId: orgs[0]?.id ?? "",
      }));
      setShowCreate(true);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Impossible de charger les clubs.");
    }
  }, []);

  useOpenFromNavState("openCreate", () => {
    void openCreateModal();
  });

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setActionLoading("create");
    setCreateError(null);
    try {
      await platformApi.createUser({
        organizationId: createForm.organizationId,
        fullName: createForm.fullName,
        email: createForm.email,
        password: createForm.password,
        clubRole: createForm.clubRole,
      });
      setShowCreate(false);
      setCreateForm({ organizationId: "", fullName: "", email: "", password: "", clubRole: "COACH" });
      await reload();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Erreur lors de la création.");
    } finally {
      setActionLoading(null);
    }
  }

  async function toggleBlock(user: UserRow) {
    setActionLoading(user.id);
    try {
      await platformApi.updateUser(user.id, { isActive: !user.isActive });
      await reload();
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <SuperAdminPageTransition>
      <SuperAdminPageHeader
        title="Gestion Utilisateurs"
        subtitle="Comptes globaux — pas les joueurs (gérés par chaque club)."
        action={
          <SuperAdminActionButton onClick={() => void openCreateModal()}>
            Nouvel utilisateur
          </SuperAdminActionButton>
        }
      />

      <SuperAdminKpiGrid>
        <SuperAdminKpiCard label="Total Utilisateurs" value={String(summary.total)} icon={Users} color="#3B82F6" />
        <SuperAdminKpiCard label="Actifs" value={String(summary.active)} icon={UserCheck} color="#10B981" />
        <SuperAdminKpiCard label="Bloqués" value={String(summary.blocked)} icon={UserX} color="#EF4444" />
        <SuperAdminKpiCard label="Admins" value={String(summary.admins)} icon={Shield} color="#FF7A00" />
      </SuperAdminKpiGrid>

      <div className="flex flex-wrap gap-2">
        <SuperAdminSelectFilter label="Rôle" value={roleFilter} options={PLATFORM_ROLE_FILTER_OPTIONS} onChange={setRoleFilter} />
        <SuperAdminSelectFilter label="Statut" value={statusFilter} options={["Tous", "Actif", "Bloqué"]} onChange={setStatusFilter} />
        <SuperAdminSelectFilter label="Club" value={clubFilter} options={clubs} onChange={setClubFilter} />
      </div>

      {loading && <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement…</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

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
                {users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: "1px solid var(--surface-panel-border)" }}>
                    <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>{user.name}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{user.email}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>{user.role}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>{user.club}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{user.lastLogin}</td>
                    <td className="px-4 py-3">
                      <Badge tone={user.status === "Actif" ? "success" : "danger"}>{user.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <SuperAdminGhostButton className="px-3 py-1.5 text-xs" onClick={() => setSelectedUser(user)}>Voir</SuperAdminGhostButton>
                        <SuperAdminGhostButton
                          className="px-3 py-1.5 text-xs"
                          disabled={actionLoading === user.id}
                          onClick={() => toggleBlock(user)}
                        >
                          {user.isActive ? "Bloquer" : "Débloquer"}
                        </SuperAdminGhostButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SuperAdminSection>

        <div className="space-y-4">
          <SuperAdminSection title="Rôle Assignment" subtitle="Rôles gérés au niveau club (Admin Club)." icon={Users}>
            <div className="space-y-2">
              {users.slice(0, 3).map((user) => (
                <SuperAdminListRow key={user.id}>
                  <p className="font-medium" style={{ color: "var(--text-primary)" }}>{user.name}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{user.role} — {user.club}</p>
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
              <p className="text-sm">Club: {selectedUser.club}</p>
            </SuperAdminCard>
          )}
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <SuperAdminCard hover={false} className="w-full max-w-lg !p-6">
            <h3 className="mb-4 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Nouvel utilisateur
            </h3>
            <form onSubmit={handleCreateUser} className="grid gap-3">
              <label className="text-sm">
                <span style={{ color: "var(--text-muted)" }}>Club</span>
                <select
                  required
                  className="glass-input mt-1 w-full"
                  value={createForm.organizationId}
                  onChange={(e) => setCreateForm((f) => ({ ...f, organizationId: e.target.value }))}
                >
                  <option value="">Sélectionner…</option>
                  {orgOptions.map((o) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </label>
              {[
                ["fullName", "Nom complet"],
                ["email", "Email"],
                ["password", "Mot de passe"],
              ].map(([key, label]) => (
                <label key={key} className="text-sm">
                  <span style={{ color: "var(--text-muted)" }}>{label}</span>
                  <input
                    required
                    type={key === "password" ? "password" : key === "email" ? "email" : "text"}
                    className="glass-input mt-1 w-full"
                    value={createForm[key as keyof typeof createForm]}
                    onChange={(e) => setCreateForm((f) => ({ ...f, [key]: e.target.value }))}
                  />
                </label>
              ))}
              <label className="text-sm">
                <span style={{ color: "var(--text-muted)" }}>Rôle club</span>
                <select
                  className="glass-input mt-1 w-full"
                  value={createForm.clubRole}
                  onChange={(e) => setCreateForm((f) => ({ ...f, clubRole: e.target.value }))}
                >
                  <option value="COACH">Coach</option>
                  <option value="MEDECIN">Médecin</option>
                  <option value="SCOUT">Scout</option>
                  <option value="ANALYSTE">Analyste</option>
                  <option value="RECRUTEUR">Recruteur</option>
                  <option value="RESPONSABLE">Responsable</option>
                  <option value="PREPARATEUR">Préparateur</option>
                  <option value="RESPONSABLE_FINANCIER">Finance</option>
                  <option value="CLUB_ADMIN">Admin Club</option>
                </select>
              </label>
              {createError && <p className="text-sm text-red-400">{createError}</p>}
              <div className="mt-2 flex justify-end gap-2">
                <SuperAdminGhostButton type="button" onClick={() => setShowCreate(false)}>Annuler</SuperAdminGhostButton>
                <SuperAdminActionButton type="submit" disabled={actionLoading === "create"}>Créer</SuperAdminActionButton>
              </div>
            </form>
          </SuperAdminCard>
        </div>
      )}
    </SuperAdminPageTransition>
  );
}
