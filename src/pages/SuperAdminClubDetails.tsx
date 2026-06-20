import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { ArrowLeft, Users, Shield, DollarSign, PieChart, Activity } from "lucide-react";

interface ClubDetail {
  id: string;
  name: string;
  users: number;
  teams: number;
  players: number;
  plan: string;
  status: "Actif" | "Pause" | "Premium";
  city: string;
  country: string;
  manager: string;
  revenue: string;
  createdAt: string;
  description: string;
}

const CLUBS: ClubDetail[] = [
  {
    id: "1",
    name: "FC Carthage",
    users: 58,
    teams: 6,
    players: 1200,
    plan: "Enterprise",
    status: "Actif",
    city: "Tunis",
    country: "Tunisie",
    manager: "Amine Mansour",
    revenue: "245 000 DT",
    createdAt: "01/01/2024",
    description: "Club historique, déploiement complet des modules finance, performance et scouting.",
  },
  {
    id: "2",
    name: "ES Sahel",
    users: 42,
    teams: 5,
    players: 980,
    plan: "Pro",
    status: "Actif",
    city: "Sousse",
    country: "Tunisie",
    manager: "Sarra Belhaj",
    revenue: "180 000 DT",
    createdAt: "15/03/2024",
    description: "Club en croissance avec un plan de montée en charge actif.",
  },
];

const TAB_OPTIONS = ["Overview", "Users", "Teams", "Finance", "Subscriptions", "Audit"] as const;

type ClubTab = (typeof TAB_OPTIONS)[number];

export function SuperAdminClubDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<ClubTab>("Overview");

  const club = useMemo(() => CLUBS.find((item) => item.id === id), [id]);

  if (!club) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Retour
        </Button>
        <GlassCard className="p-6">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Club introuvable.
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-[var(--text-muted)]">Détails club</p>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>{club.name}</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {club.users} Users · {club.teams} Teams · {club.players} Players · Plan {club.plan}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => navigate(-1)}>Retour</Button>
          <Button variant="solid">Modifier le club</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          <GlassCard raised className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Résumé</h2>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Informations clés sur le club.</p>
              </div>
              <Badge tone={club.status === "Actif" ? "success" : club.status === "Premium" ? "info" : "warning"}>
                {club.status}
              </Badge>
            </div>
            <div className="mt-6 space-y-3 text-sm">
              <p><strong>Manager:</strong> {club.manager}</p>
              <p><strong>Ville:</strong> {club.city}</p>
              <p><strong>Pays:</strong> {club.country}</p>
              <p><strong>Revenus:</strong> {club.revenue}</p>
              <p><strong>Créé le:</strong> {club.createdAt}</p>
            </div>
          </GlassCard>

          <GlassCard raised className="p-6">
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Description</h2>
            <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>{club.description}</p>
          </GlassCard>

          <GlassCard raised className="p-6">
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Actions rapides</h2>
            <div className="mt-4 grid gap-3">
              {[
                { label: "Voir abonnements", icon: Shield },
                { label: "Consulter finance", icon: DollarSign },
                { label: "Analyser activité", icon: PieChart },
                { label: "Audit club", icon: Activity },
              ].map((action) => (
                <Button key={action.label} variant="ghost" className="justify-start" size="sm">
                  <action.icon size={16} />
                  <span className="ml-2">{action.label}</span>
                </Button>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-4">
          <div className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase" style={{ color: "var(--text-muted)" }}>Statistiques du club</p>
                <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>{club.players}</p>
              </div>
              <Users size={26} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <GlassCard className="p-4">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Utilisateurs</p>
              <p className="mt-2 text-xl font-semibold" style={{ color: "var(--text-primary)" }}>{club.users}</p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Équipes</p>
              <p className="mt-2 text-xl font-semibold" style={{ color: "var(--text-primary)" }}>{club.teams}</p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Plan</p>
              <p className="mt-2 text-xl font-semibold" style={{ color: "var(--text-primary)" }}>{club.plan}</p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Revenus</p>
              <p className="mt-2 text-xl font-semibold" style={{ color: "var(--text-primary)" }}>{club.revenue}</p>
            </GlassCard>
          </div>

          <div>
            <div className="flex flex-wrap gap-2">
              {TAB_OPTIONS.map((tab) => (
                <Button key={tab} variant={activeTab === tab ? "solid" : "ghost"} size="sm" onClick={() => setActiveTab(tab)}>
                  {tab}
                </Button>
              ))}
            </div>
            <GlassCard raised className="mt-4 p-6">
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{activeTab}</h2>
              <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
                {activeTab === "Overview" && "Vue globale du club, activité, plan et conformité."}
                {activeTab === "Users" && "Liste des membres, accès, rôles et actions utilisateur."}
                {activeTab === "Teams" && "Équipes actives, effectifs et projets en cours."}
                {activeTab === "Finance" && "Revenus, factures et états des paiements."}
                {activeTab === "Subscriptions" && "État des abonnements, renouvellements et alertes."}
                {activeTab === "Audit" && "Journal d’audit et conformité des changements."}
              </p>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
