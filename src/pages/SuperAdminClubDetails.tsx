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
  ArrowLeft, Users, Shield, DollarSign, Activity, Building2,
  MapPin, Calendar, Crown, CreditCard, Clock, CheckCircle2,
  XCircle, AlertTriangle, TrendingUp, Eye, Edit, Ban,
} from "lucide-react";

interface ClubDetail {
  id: string;
  name: string;
  initials: string;
  users: number;
  teams: number;
  players: number;
  plan: string;
  planExpiry: string;
  status: "Actif" | "Suspendu" | "Premium";
  city: string;
  stade: string;
  country: string;
  manager: string;
  revenue: string;
  createdAt: string;
  description: string;
  mrr: string;
}

const CLUBS: ClubDetail[] = [
  {
    id: "1",
    name: "FC Carthage",
    initials: "FC",
    users: 58,
    teams: 6,
    players: 1200,
    plan: "Enterprise",
    planExpiry: "31/12/2026",
    status: "Premium",
    city: "Tunis",
    stade: "Stade de Radès",
    country: "Tunisie",
    manager: "Amine Mansour",
    revenue: "245 000 DT",
    mrr: "20 400 DT",
    createdAt: "01/01/2024",
    description: "Club historique, déploiement complet des modules finance, performance et scouting.",
  },
  {
    id: "2",
    name: "ES Sahel",
    initials: "ES",
    users: 42,
    teams: 5,
    players: 980,
    plan: "Pro",
    planExpiry: "15/09/2026",
    status: "Actif",
    city: "Sousse",
    stade: "Stade Olympique de Sousse",
    country: "Tunisie",
    manager: "Sarra Belhaj",
    revenue: "180 000 DT",
    mrr: "15 000 DT",
    createdAt: "15/03/2024",
    description: "Club en croissance avec un plan de montée en charge actif.",
  },
  {
    id: "3",
    name: "CS Sfaxien",
    initials: "CS",
    users: 37,
    teams: 4,
    players: 750,
    plan: "Starter",
    planExpiry: "01/07/2026",
    status: "Suspendu",
    city: "Sfax",
    stade: "Stade Taïeb Mhiri",
    country: "Tunisie",
    manager: "Khaled Trabelsi",
    revenue: "95 000 DT",
    mrr: "7 900 DT",
    createdAt: "10/06/2024",
    description: "Club en phase d'audit de conformité.",
  },
];

const CLUB_USERS = [
  { name: "Amine Mansour", role: "Responsable Club", lastLogin: "18/06 09:32", status: "Actif" },
  { name: "Sonia Khelil", role: "Coach Principal", lastLogin: "18/06 07:50", status: "Actif" },
  { name: "Tarek Bouzid", role: "Scout", lastLogin: "17/06 19:21", status: "Actif" },
  { name: "Ines Makni", role: "Finance", lastLogin: "16/06 14:00", status: "Inactif" },
];

const PAYMENTS = [
  { id: "PAY-001", date: "01/06/2026", amount: "20 400 DT", method: "Carte", status: "Payé" },
  { id: "PAY-002", date: "01/05/2026", amount: "20 400 DT", method: "Virement", status: "Payé" },
  { id: "PAY-003", date: "01/04/2026", amount: "20 400 DT", method: "Carte", status: "Payé" },
  { id: "PAY-004", date: "01/03/2026", amount: "20 400 DT", method: "Carte", status: "En retard" },
];

const ACTIVITY = [
  { time: "18/06 09:32", action: "Connexion administrateur", user: "Amine Mansour", type: "login" },
  { time: "17/06 15:00", action: "Mise à jour du plan Enterprise", user: "Super Admin", type: "update" },
  { time: "16/06 11:20", action: "Nouvel utilisateur ajouté", user: "Amine Mansour", type: "create" },
  { time: "15/06 09:00", action: "Export données effectué", user: "Sonia Khelil", type: "export" },
  { time: "14/06 17:45", action: "Tentative de connexion suspecte", user: "IP 192.168.1.200", type: "alert" },
];

const TAB_OPTIONS = ["Overview", "Utilisateurs", "Paiements", "Activité", "Abonnement"] as const;
type ClubTab = (typeof TAB_OPTIONS)[number];

const STATUS_COLOR: Record<string, string> = {
  "Actif": "#22C55E",
  "Premium": "#FF7A00",
  "Suspendu": "#EF4444",
  "Inactif": "#64748B",
};

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  login: <CheckCircle2 size={14} style={{ color: "#22C55E" }} />,
  update: <Edit size={14} style={{ color: "#3B82F6" }} />,
  create: <Crown size={14} style={{ color: "#FF7A00" }} />,
  export: <Activity size={14} style={{ color: "#8B5CF6" }} />,
  alert: <AlertTriangle size={14} style={{ color: "#EF4444" }} />,
};

const PLAN_COLOR: Record<string, string> = {
  Enterprise: "#FF7A00",
  Pro: "#3B82F6",
  Starter: "#22C55E",
};

export function SuperAdminClubDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<ClubTab>("Overview");
  const club = useMemo(() => CLUBS.find((item) => item.id === id) ?? CLUBS[0], [id]);

  return (
    <SuperAdminPageTransition>
      {/* Hero */}
      <SuperAdminHero
        badge="Club Details"
        title={club.name}
        subtitle={`${club.city} · ${club.stade} · ${club.country}`}
        icon={Building2}
        action={
          <div className="flex gap-2">
            <SuperAdminGhostButton onClick={() => navigate(-1)}>
              <ArrowLeft size={14} /> Retour
            </SuperAdminGhostButton>
            <SuperAdminGhostButton>
              <Ban size={14} /> Suspendre
            </SuperAdminGhostButton>
            <SuperAdminActionButton>
              <Edit size={14} /> Modifier
            </SuperAdminActionButton>
          </div>
        }
        stats={[
          { value: club.mrr, label: "MRR", color: "#FF7A00" },
          { value: String(club.users), label: "Utilisateurs", color: "#3B82F6" },
          { value: String(club.teams), label: "Équipes", color: "#10B981" },
          { value: String(club.players), label: "Joueurs", color: "#8B5CF6" },
        ]}
      />

      {/* KPI row */}
      <SuperAdminKpiGrid cols={4}>
        <SuperAdminKpiCard label="Utilisateurs" value={String(club.users)} icon={Users} color="#3B82F6" />
        <SuperAdminKpiCard label="Équipes" value={String(club.teams)} icon={Shield} color="#10B981" />
        <SuperAdminKpiCard label="Joueurs" value={String(club.players)} icon={Activity} color="#8B5CF6" />
        <SuperAdminKpiCard label="Revenu Total" value={club.revenue} icon={TrendingUp} color="#FF7A00" />
      </SuperAdminKpiGrid>

      {/* Tabs + Content */}
      <SuperAdminFilterPills options={[...TAB_OPTIONS]} value={activeTab} onChange={(v) => setActiveTab(v as ClubTab)} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1.8fr]">
        {/* Left: Club profile card */}
        <div className="space-y-4">
          <SuperAdminCard hover={false}>
            {/* Avatar */}
            <div className="mb-4 flex items-center gap-4">
              <motion.div
                className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-black text-white"
                style={{ background: `linear-gradient(135deg, ${PLAN_COLOR[club.plan] ?? "#FF7A00"}, ${PLAN_COLOR[club.plan] ?? "#E66000"}80)` }}
                animate={{ boxShadow: [`0 0 0px ${PLAN_COLOR[club.plan]}00`, `0 0 24px ${PLAN_COLOR[club.plan]}60`, `0 0 0px ${PLAN_COLOR[club.plan]}00`] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                {club.initials}
              </motion.div>
              <div>
                <h2 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>{club.name}</h2>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-full px-2 py-0.5 text-xs font-semibold"
                    style={{ background: `${PLAN_COLOR[club.plan]}1f`, color: PLAN_COLOR[club.plan], border: `1px solid ${PLAN_COLOR[club.plan]}40` }}>
                    {club.plan}
                  </span>
                  <span className="rounded-full px-2 py-0.5 text-xs font-semibold"
                    style={{ background: `${STATUS_COLOR[club.status]}1f`, color: STATUS_COLOR[club.status] }}>
                    {club.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Info rows */}
            <div className="space-y-3 border-t pt-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {[
                { icon: MapPin, label: "Ville", value: club.city },
                { icon: Building2, label: "Stade", value: club.stade },
                { icon: Users, label: "Manager", value: club.manager },
                { icon: Calendar, label: "Créé le", value: club.createdAt },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: "rgba(255,122,0,0.12)" }}>
                    <Icon size={13} style={{ color: "#FF7A00" }} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{label}</p>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </SuperAdminCard>

          {/* Abonnement card */}
          <SuperAdminCard hover={false} glow>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "rgba(255,122,0,0.15)" }}>
                <Crown size={16} style={{ color: "#FF7A00" }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Plan actuel</p>
                <p className="font-extrabold" style={{ color: PLAN_COLOR[club.plan] }}>{club.plan}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 border-t pt-4 text-sm" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>Expiration</span>
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{club.planExpiry}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>MRR</span>
                <span className="font-semibold" style={{ color: "#FF7A00" }}>{club.mrr}</span>
              </div>
            </div>
            <SuperAdminGhostButton className="mt-4 w-full justify-center text-xs">
              Modifier l'abonnement
            </SuperAdminGhostButton>
          </SuperAdminCard>

          <p className="text-sm" style={{ color: "var(--text-muted)" }}>{club.description}</p>
        </div>

        {/* Right: Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {activeTab === "Overview" && (
              <SuperAdminSection title="Vue d'ensemble" subtitle="Résumé activité et indicateurs clés.">
                <div className="space-y-3">
                  {[
                    { label: "Statut plateforme", value: club.status, color: STATUS_COLOR[club.status] },
                    { label: "Modules actifs", value: "Finance · Performance · Scouting" },
                    { label: "Dernière activité", value: "18/06/2026 09:32" },
                    { label: "Intégrations", value: "API Stripe · Webhook · OAuth2" },
                  ].map(({ label, value, color }) => (
                    <SuperAdminListRow key={label}>
                      <div className="flex items-center justify-between text-sm">
                        <span style={{ color: "var(--text-muted)" }}>{label}</span>
                        <span className="font-semibold" style={{ color: color ?? "var(--text-primary)" }}>{value}</span>
                      </div>
                    </SuperAdminListRow>
                  ))}
                </div>
              </SuperAdminSection>
            )}

            {activeTab === "Utilisateurs" && (
              <SuperAdminSection title="Membres du club" subtitle={`${club.users} utilisateurs enregistrés.`}>
                <div className="space-y-3">
                  {CLUB_USERS.map((u) => (
                    <SuperAdminListRow key={u.name}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                            style={{ background: "linear-gradient(135deg,#FF7A00,#3B82F6)" }}>
                            {u.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{u.name}</p>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{u.role}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                            style={{ background: `${STATUS_COLOR[u.status]}18`, color: STATUS_COLOR[u.status] }}>
                            {u.status}
                          </span>
                          <p className="mt-1 flex items-center gap-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
                            <Clock size={10} /> {u.lastLogin}
                          </p>
                        </div>
                      </div>
                    </SuperAdminListRow>
                  ))}
                </div>
              </SuperAdminSection>
            )}

            {activeTab === "Paiements" && (
              <SuperAdminSection title="Historique des paiements" subtitle="Toutes les transactions du club.">
                <div className="space-y-3">
                  {PAYMENTS.map((p) => (
                    <SuperAdminListRow key={p.id}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "rgba(255,122,0,0.12)" }}>
                            <CreditCard size={14} style={{ color: "#FF7A00" }} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{p.id}</p>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{p.date} · {p.method}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold" style={{ color: "#FF7A00" }}>{p.amount}</p>
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                            style={{
                              background: p.status === "Payé" ? "#22C55E18" : "#EF444418",
                              color: p.status === "Payé" ? "#22C55E" : "#EF4444",
                            }}>
                            {p.status}
                          </span>
                        </div>
                      </div>
                    </SuperAdminListRow>
                  ))}
                </div>
              </SuperAdminSection>
            )}

            {activeTab === "Activité" && (
              <SuperAdminSection title="Journal d'activité" subtitle="Dernières actions sur le compte.">
                <div className="relative space-y-0">
                  {/* timeline line */}
                  <div className="absolute left-[18px] top-2 h-[calc(100%-16px)] w-px" style={{ background: "rgba(255,122,0,0.2)" }} />
                  {ACTIVITY.map((a, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-start gap-4 pb-4 pl-2"
                    >
                      <div className="relative z-10 mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border"
                        style={{ background: "rgba(15,29,58,0.95)", borderColor: "rgba(255,122,0,0.25)" }}>
                        {ACTIVITY_ICONS[a.type]}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{a.action}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{a.user} · {a.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </SuperAdminSection>
            )}

            {activeTab === "Abonnement" && (
              <SuperAdminSection title="Détails de l'abonnement" subtitle="Plan, facturation et renouvellement.">
                <div className="space-y-4">
                  <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg,rgba(255,122,0,0.15),rgba(230,96,0,0.05))", border: "1px solid rgba(255,122,0,0.25)" }}>
                    <p className="text-xs uppercase tracking-wider" style={{ color: "#FF7A00" }}>Plan actuel</p>
                    <p className="mt-1 text-3xl font-extrabold" style={{ color: "var(--text-primary)" }}>{club.plan}</p>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>Expire le {club.planExpiry}</p>
                    <div className="mt-4 flex gap-4">
                      <div>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>MRR</p>
                        <p className="text-xl font-bold" style={{ color: "#FF7A00" }}>{club.mrr}</p>
                      </div>
                      <div>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Utilisateurs inclus</p>
                        <p className="text-xl font-bold" style={{ color: "#3B82F6" }}>Illimité</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <SuperAdminActionButton>Upgrader</SuperAdminActionButton>
                    <SuperAdminGhostButton>Annuler abonnement</SuperAdminGhostButton>
                  </div>
                </div>
              </SuperAdminSection>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </SuperAdminPageTransition>
  );
}
