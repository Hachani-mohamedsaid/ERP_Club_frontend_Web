import { useState } from "react";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Users } from "lucide-react";

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
  { id: "u2", name: "Sarra Belhaj", email: "sarra@club.com", role: "Responsable Club", club: "ES Sahel", lastLogin: "17/06/2026", status: "Actif" },
  { id: "u3", name: "Rami Saadi", email: "rami@club.com", role: "Scout", club: "CS Sfaxien", lastLogin: "16/06/2026", status: "Bloqué" },
  { id: "u4", name: "Nadia Khemiri", email: "nadia@club.com", role: "Finance", club: "US Monastir", lastLogin: "15/06/2026", status: "Inactif" },
];

export function SuperAdminUsers() {
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Gestion Utilisateurs
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Contrôlez les accès et les rôles de la plateforme.
          </p>
        </div>
        <Button variant="ghost">Créer utilisateur</Button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <GlassCard className="p-4">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Total Utilisateurs</p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>4 580</p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Actifs</p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>4 120</p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Bloqués</p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>186</p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Admins</p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>34</p>
            </GlassCard>
          </div>

          <GlassCard raised className="p-6">
            <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Utilisateurs</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--surface-panel-border)" }}>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-muted)" }}>Nom</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-muted)" }}>Email</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-muted)" }}>Role</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-muted)" }}>Club</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-muted)" }}>Dernière connexion</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-muted)" }}>Statut</th>
                    <th className="px-4 py-3 text-right font-semibold" style={{ color: "var(--text-muted)" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {USERS.map((user) => (
                    <tr key={user.id} style={{ borderBottom: "1px solid var(--surface-panel-border)" }}>
                      <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>{user.name}</td>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{user.email}</td>
                      <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>{user.role}</td>
                      <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>{user.club}</td>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{user.lastLogin}</td>
                      <td className="px-4 py-3">
                        <Badge tone={user.status === 'Actif' ? 'success' : user.status === 'Bloqué' ? 'danger' : 'warning'}>{user.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedUser(user)}>Modifier</Button>
                          <Button variant="ghost" size="sm">Bloquer</Button>
                          <Button variant="ghost" size="sm">Reset</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-4">
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <Users size={20} />
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Rôle Assignment</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Modifier les rôles des utilisateurs.</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="rounded-[var(--radius-odin-md)] border p-3" style={{ borderColor: "var(--surface-panel-border)" }}>
                <p className="font-medium" style={{ color: "var(--text-primary)" }}>Sarra Belhaj</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Responsable Club</p>
                <Button variant="ghost" size="sm" className="mt-3">Modifier rôle</Button>
              </div>
              <div className="rounded-[var(--radius-odin-md)] border p-3" style={{ borderColor: "var(--surface-panel-border)" }}>
                <p className="font-medium" style={{ color: "var(--text-primary)" }}>Rami Saadi</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Scout</p>
                <Button variant="ghost" size="sm" className="mt-3">Attribuer rôle</Button>
              </div>
            </div>
          </GlassCard>

          {selectedUser && (
            <GlassCard className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Profil rapide</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Détails utilisateur</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>Fermer</Button>
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{selectedUser.name}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{selectedUser.email}</p>
              <p className="mt-2 text-sm">Rôle: {selectedUser.role}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="ghost" size="sm">Bloquer</Button>
                <Button variant="ghost" size="sm">Réinitialiser mot de passe</Button>
                <Button variant="ghost" size="sm">Voir profil</Button>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
