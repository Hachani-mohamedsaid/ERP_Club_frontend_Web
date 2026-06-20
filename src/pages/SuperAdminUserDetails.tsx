import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { ArrowLeft } from "lucide-react";

interface UserDetail {
  id: string;
  name: string;
  email: string;
  role: string;
  club: string;
  status: "Actif" | "Bloqué" | "Inactif";
  lastLogin: string;
  permissions: string[];
  logins: string[];
  actions: string[];
}

const USERS: UserDetail[] = [
  {
    id: "u1",
    name: "Amine Mansour",
    email: "amine@club.com",
    role: "Coach",
    club: "FC Carthage",
    status: "Actif",
    lastLogin: "18/06/2026 09:32",
    permissions: ["Voir rapports", "Gérer équipe", "Accès API"],
    logins: ["18/06 09:32", "17/06 19:21", "16/06 13:45"],
    actions: ["Modifié équipe", "Créé session d'entraînement", "Mis à jour profil"],
  },
  {
    id: "u2",
    name: "Sarra Belhaj",
    email: "sarra@club.com",
    role: "Responsable Club",
    club: "ES Sahel",
    status: "Actif",
    lastLogin: "17/06/2026 14:10",
    permissions: ["Dashboard", "Finance", "Gestion utilisateurs"],
    logins: ["17/06 14:10", "16/06 08:55", "15/06 11:20"],
    actions: ["Validé facture", "Accepté utilisateur", "Changé statut club"],
  },
];

const TAB_OPTIONS = ["Informations", "Historique Connexions", "Actions", "Permissions", "Logs"] as const;

type UserTab = (typeof TAB_OPTIONS)[number];

export function SuperAdminUserDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<UserTab>("Informations");

  const user = useMemo(() => USERS.find((item) => item.id === id), [id]);

  if (!user) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Retour
        </Button>
        <GlassCard className="p-6">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Utilisateur introuvable.
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-[var(--text-muted)]">Profil utilisateur</p>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>{user.name}</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {user.role} · {user.club}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => navigate(-1)}>Retour</Button>
          <Button variant="solid">Modifier</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          <GlassCard raised className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Informations</h2>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Détails de compte et statut.</p>
              </div>
              <Badge tone={user.status === "Actif" ? "success" : user.status === "Bloqué" ? "danger" : "warning"}>
                {user.status}
              </Badge>
            </div>
            <div className="space-y-3 text-sm">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Dernière connexion:</strong> {user.lastLogin}</p>
              <p><strong>Club:</strong> {user.club}</p>
              <p><strong>Rôle:</strong> {user.role}</p>
            </div>
          </GlassCard>

          <GlassCard raised className="p-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Sessions</p>
                <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>12</p>
              </div>
              <div className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Actions</p>
                <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>34</p>
              </div>
              <div className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Permissions</p>
                <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>{user.permissions.length}</p>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {TAB_OPTIONS.map((tab) => (
              <Button key={tab} variant={activeTab === tab ? "solid" : "ghost"} size="sm" onClick={() => setActiveTab(tab)}>
                {tab}
              </Button>
            ))}
          </div>

          <GlassCard raised className="p-6">
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{activeTab}</h2>
            <div className="mt-4 space-y-3 text-sm" style={{ color: "var(--text-secondary)" }}>
              {activeTab === "Informations" && (
                <div className="space-y-2">
                  <p><strong>Compte créé:</strong> 12/01/2024</p>
                  <p><strong>Accès API:</strong> Activé</p>
                  <p><strong>2FA:</strong> Activé</p>
                </div>
              )}
              {activeTab === "Historique Connexions" && (
                <div className="space-y-2">
                  {user.logins.map((login) => (
                    <div key={login} className="rounded-[var(--radius-odin-md)] border p-3" style={{ borderColor: "var(--surface-panel-border)" }}>
                      <p>{login}</p>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "Actions" && (
                <div className="space-y-2">
                  {user.actions.map((action) => (
                    <div key={action} className="rounded-[var(--radius-odin-md)] border p-3" style={{ borderColor: "var(--surface-panel-border)" }}>
                      <p>{action}</p>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "Permissions" && (
                <div className="space-y-2">
                  {user.permissions.map((permission) => (
                    <Badge key={permission} tone="info">{permission}</Badge>
                  ))}
                </div>
              )}
              {activeTab === "Logs" && (
                <div className="space-y-2">
                  {[
                    "Connexion réussie",
                    "Modification du profil",
                    "Réinitialisation de mot de passe",
                  ].map((log) => (
                    <div key={log} className="rounded-[var(--radius-odin-md)] border p-3" style={{ borderColor: "var(--surface-panel-border)" }}>
                      <p>{log}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
