import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  SuperAdminPageTransition,
  SuperAdminHero,
  SuperAdminSection,
  SuperAdminKpiCard,
  SuperAdminKpiGrid,
  SuperAdminGhostButton,
  SuperAdminActionButton,
  SuperAdminFilterPills,
  SuperAdminListRow,
  SuperAdminCard,
} from "../components/superadmin";
import { Badge } from "../components/ui/Badge";
import {
  ArrowLeft, User, Shield, Activity, Clock, CheckCircle2,
  Edit, AlertTriangle, Lock, Mail, Building2, Key,
  Smartphone, Globe, LogIn, Ban, UserX,
} from "lucide-react";

interface UserDetail {
  id: string;
  name: string;
  email: string;
  role: string;
  club: string;
  status: "Actif" | "Bloqué" | "Inactif";
  lastLogin: string;
  createdAt: string;
  twoFA: boolean;
  apiAccess: boolean;
  sessions: number;
  actionCount: number;
  permissions: string[];
  logins: { date: string; ip: string; device: string; status: "ok" | "fail" }[];
  actions: { date: string; action: string; type: "create" | "update" | "delete" | "login" | "alert" }[];
}

const USERS: UserDetail[] = [
  {
    id: "u1",
    name: "Amine Mansour",
    email: "amine@fc-carthage.tn",
    role: "Admin Club",
    club: "FC Carthage",
    status: "Actif",
    lastLogin: "18/06/2026 09:32",
    createdAt: "12/01/2024",
    twoFA: true,
    apiAccess: true,
    sessions: 12,
    actionCount: 34,
    permissions: ["Dashboard", "Finance", "Gestion équipes", "Rapports", "Accès API", "Export données"],
    logins: [
      { date: "18/06 09:32", ip: "197.0.22.14", device: "Chrome / macOS", status: "ok" },
      { date: "17/06 19:21", ip: "197.0.22.14", device: "Safari / iPhone", status: "ok" },
      { date: "16/06 14:00", ip: "192.168.1.200", device: "Firefox / Windows", status: "fail" },
    ],
    actions: [
      { date: "18/06 09:35", action: "Mis à jour le profil de l'équipe", type: "update" },
      { date: "17/06 14:00", action: "Créé une session d'entraînement", type: "create" },
      { date: "16/06 11:00", action: "Exporté rapport financier", type: "update" },
      { date: "15/06 09:20", action: "Supprimé utilisateur inactif", type: "delete" },
    ],
  },
  {
    id: "u2",
    name: "Sarra Belhaj",
    email: "sarra@es-sahel.tn",
    role: "Coach",
    club: "ES Sahel",
    status: "Actif",
    lastLogin: "17/06/2026 14:10",
    createdAt: "15/03/2024",
    twoFA: false,
    apiAccess: false,
    sessions: 7,
    actionCount: 18,
    permissions: ["Dashboard", "Performance", "Gestion joueurs"],
    logins: [
      { date: "17/06 14:10", ip: "197.0.55.100", device: "Chrome / Android", status: "ok" },
      { date: "16/06 08:55", ip: "197.0.55.100", device: "Chrome / Android", status: "ok" },
    ],
    actions: [
      { date: "17/06 14:15", action: "Validé une facture", type: "update" },
      { date: "16/06 09:00", action: "Ajouté 3 joueurs à l'équipe B", type: "create" },
    ],
  },
];

const TAB_OPTIONS = ["Informations", "Connexions", "Actions", "Permissions"] as const;
type UserTab = (typeof TAB_OPTIONS)[number];

const STATUS_COLOR: Record<string, string> = {
  Actif: "#22C55E",
  Bloqué: "#EF4444",
  Inactif: "#64748B",
};

const ACTION_ICONS: Record<string, React.ReactNode> = {
  create: <CheckCircle2 size={13} style={{ color: "#22C55E" }} />,
  update: <Edit size={13} style={{ color: "#3B82F6" }} />,
  delete: <UserX size={13} style={{ color: "#EF4444" }} />,
  login: <LogIn size={13} style={{ color: "#FF7A00" }} />,
  alert: <AlertTriangle size={13} style={{ color: "#EF4444" }} />,
};

export function SuperAdminUserDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<UserTab>("Informations");
  const user = useMemo(() => USERS.find((item) => item.id === id) ?? USERS[0], [id]);

  return (
    <SuperAdminPageTransition>
      {/* Hero */}
      <SuperAdminHero
        badge="User Profile"
        title={user.name}
        subtitle={`${user.role} · ${user.club}`}
        icon={User}
        action={
          <div className="flex gap-2">
            <SuperAdminGhostButton onClick={() => navigate(-1)}>
              <ArrowLeft size={14} /> Retour
            </SuperAdminGhostButton>
            <SuperAdminGhostButton>
              <Ban size={14} /> Bloquer
            </SuperAdminGhostButton>
            <SuperAdminActionButton>
              <Edit size={14} /> Modifier
            </SuperAdminActionButton>
          </div>
        }
        stats={[
          { value: String(user.sessions), label: "Sessions", color: "#3B82F6" },
          { value: String(user.actionCount), label: "Actions", color: "#FF7A00" },
          { value: String(user.permissions.length), label: "Permissions", color: "#10B981" },
          { value: user.twoFA ? "Activé" : "Désactivé", label: "2FA", color: user.twoFA ? "#22C55E" : "#EF4444" },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1.8fr]">
        {/* Left: User profile card */}
        <div className="space-y-4">
          <SuperAdminCard hover={false} glow>
            {/* Avatar */}
            <div className="mb-6 flex flex-col items-center text-center">
              <motion.div
                className="mb-3 flex h-20 w-20 items-center justify-center rounded-full text-2xl font-black text-white"
                style={{
                  background: "linear-gradient(135deg,#FF7A00,#3B82F6)",
                  boxShadow: "0 0 0 4px rgba(255,122,0,0.2)",
                }}
                animate={{ boxShadow: ["0 0 0 4px rgba(255,122,0,0.15)", "0 0 0 8px rgba(255,122,0,0.08)", "0 0 0 4px rgba(255,122,0,0.15)"] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                {user.name.split(" ").map((n) => n[0]).join("")}
              </motion.div>
              <h2 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>{user.name}</h2>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>{user.role}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{ background: `${STATUS_COLOR[user.status]}18`, color: STATUS_COLOR[user.status] }}>
                  {user.status}
                </span>
              </div>
            </div>

            <div className="space-y-3 border-t pt-4 text-sm" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {[
                { icon: Mail, label: "Email", value: user.email },
                { icon: Building2, label: "Club", value: user.club },
                { icon: Shield, label: "Rôle", value: user.role },
                { icon: Clock, label: "Dernière connexion", value: user.lastLogin },
                { icon: Globe, label: "Compte créé", value: user.createdAt },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg" style={{ background: "rgba(255,122,0,0.1)" }}>
                    <Icon size={12} style={{ color: "#FF7A00" }} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{label}</p>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </SuperAdminCard>

          {/* Security status */}
          <SuperAdminCard hover={false}>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider" style={{ color: "#FF7A00" }}>Sécurité</h3>
            <div className="space-y-3">
              {[
                { icon: Smartphone, label: "Authentification 2FA", enabled: user.twoFA },
                { icon: Key, label: "Accès API", enabled: user.apiAccess },
                { icon: Lock, label: "Mot de passe fort", enabled: true },
              ].map(({ icon: Icon, label, enabled }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Icon size={13} style={{ color: "var(--text-muted)" }} />
                    <span style={{ color: "var(--text-secondary)" }}>{label}</span>
                  </div>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{ background: enabled ? "#22C55E18" : "#EF444418", color: enabled ? "#22C55E" : "#EF4444" }}>
                    {enabled ? "Actif" : "Inactif"}
                  </span>
                </div>
              ))}
            </div>
          </SuperAdminCard>

          <SuperAdminKpiGrid cols={3}>
            <SuperAdminKpiCard label="Sessions" value={String(user.sessions)} icon={Activity} color="#3B82F6" />
            <SuperAdminKpiCard label="Actions" value={String(user.actionCount)} icon={Shield} color="#FF7A00" />
            <SuperAdminKpiCard label="Permissions" value={String(user.permissions.length)} icon={User} color="#10B981" />
          </SuperAdminKpiGrid>
        </div>

        {/* Right: Tab content */}
        <div className="space-y-4">
          <SuperAdminFilterPills options={[...TAB_OPTIONS]} value={activeTab} onChange={(v) => setActiveTab(v as UserTab)} />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
            >
              {activeTab === "Informations" && (
                <SuperAdminSection title="Informations compte" subtitle="Données et configuration de l'utilisateur.">
                  <div className="space-y-3">
                    {[
                      { label: "ID Utilisateur", value: user.id },
                      { label: "Email vérifié", value: "Oui" },
                      { label: "Notifications email", value: "Activées" },
                      { label: "Langue", value: "Français" },
                      { label: "Fuseau horaire", value: "GMT+1 Tunis" },
                    ].map(({ label, value }) => (
                      <SuperAdminListRow key={label}>
                        <div className="flex items-center justify-between text-sm">
                          <span style={{ color: "var(--text-muted)" }}>{label}</span>
                          <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{value}</span>
                        </div>
                      </SuperAdminListRow>
                    ))}
                  </div>
                </SuperAdminSection>
              )}

              {activeTab === "Connexions" && (
                <SuperAdminSection title="Historique des connexions" subtitle="Dernières sessions enregistrées.">
                  <div className="space-y-3">
                    {user.logins.map((login, i) => (
                      <SuperAdminListRow key={i}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg"
                              style={{ background: login.status === "ok" ? "#22C55E18" : "#EF444418" }}>
                              {login.status === "ok"
                                ? <CheckCircle2 size={14} style={{ color: "#22C55E" }} />
                                : <AlertTriangle size={14} style={{ color: "#EF4444" }} />}
                            </div>
                            <div>
                              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{login.device}</p>
                              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{login.ip}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{login.date}</p>
                            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                              style={{
                                background: login.status === "ok" ? "#22C55E18" : "#EF444418",
                                color: login.status === "ok" ? "#22C55E" : "#EF4444",
                              }}>
                              {login.status === "ok" ? "Réussi" : "Échoué"}
                            </span>
                          </div>
                        </div>
                      </SuperAdminListRow>
                    ))}
                  </div>
                </SuperAdminSection>
              )}

              {activeTab === "Actions" && (
                <SuperAdminSection title="Historique des actions" subtitle="Toutes les modifications effectuées.">
                  <div className="relative space-y-0">
                    <div className="absolute left-[18px] top-2 h-[calc(100%-16px)] w-px" style={{ background: "rgba(255,122,0,0.2)" }} />
                    {user.actions.map((a, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="flex items-start gap-4 pb-4 pl-2"
                      >
                        <div className="relative z-10 mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border"
                          style={{ background: "rgba(15,29,58,0.95)", borderColor: "rgba(255,122,0,0.25)" }}>
                          {ACTION_ICONS[a.type]}
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{a.action}</p>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{a.date}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </SuperAdminSection>
              )}

              {activeTab === "Permissions" && (
                <SuperAdminSection title="Matrice des permissions" subtitle="Modules et accès autorisés.">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {[
                      "Dashboard", "Finance", "Gestion équipes", "Rapports",
                      "Accès API", "Export données", "Sécurité", "Paramètres",
                    ].map((perm) => {
                      const granted = user.permissions.includes(perm);
                      return (
                        <SuperAdminListRow key={perm}>
                          <div className="flex items-center justify-between text-sm">
                            <span style={{ color: "var(--text-primary)" }}>{perm}</span>
                            <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                              style={{ background: granted ? "#22C55E18" : "#64748B18", color: granted ? "#22C55E" : "#64748B" }}>
                              {granted ? <CheckCircle2 size={10} /> : <Lock size={10} />}
                              {granted ? "Accordé" : "Refusé"}
                            </span>
                          </div>
                        </SuperAdminListRow>
                      );
                    })}
                  </div>
                </SuperAdminSection>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </SuperAdminPageTransition>
  );
}
