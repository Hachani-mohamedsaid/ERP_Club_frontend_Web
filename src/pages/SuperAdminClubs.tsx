import { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import {
  SuperAdminPageTransition,
  SuperAdminPageHeader,
  SuperAdminKpiCard,
  SuperAdminKpiGrid,
  SuperAdminSection,
  SuperAdminFilterPills,
  SuperAdminSearchInput,
  SuperAdminCard,
  SuperAdminGhostButton,
  SuperAdminListRow,
  SuperAdminActionButton,
} from "../components/superadmin";
import { Building2, CheckCircle2, Crown, Ban } from "lucide-react";
import { platformApi, type PlatformOrganization } from "../lib/api/platform";
import { usePlatformResource } from "../hooks/usePlatformResource";
import { useOpenFromNavState } from "../hooks/useOpenFromNavState";
import { useAuth } from "../contexts/AuthContext";

function statusTone(status: string): "success" | "info" | "warning" | "danger" {
  if (status === "Actif") return "success";
  if (status === "Essai") return "info";
  if (status === "Suspendu") return "warning";
  return "danger";
}

export function SuperAdminClubs() {
  const navigate = useNavigate();
  const { impersonateClub } = useAuth();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Tous");
  const [selectedClub, setSelectedClub] = useState<PlatformOrganization | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({
    clubName: "",
    country: "Tunisie",
    league: "",
    city: "",
    fullName: "",
    email: "",
    password: "",
    planCode: "STARTER",
  });

  const { data: clubs, loading, error, reload } = usePlatformResource(
    () => platformApi.getOrganizations({ search: query, status: filter !== "Tous" ? filter : undefined }),
    [query, filter],
  );

  const openCreateModal = useCallback(() => setShowCreate(true), []);
  useOpenFromNavState("openCreate", openCreateModal);

  const summary = useMemo(() => {
    if (!clubs) return { total: 0, active: 0, premium: 0, suspended: 0 };
    return {
      total: clubs.length,
      active: clubs.filter((c) => c.status === "Actif").length,
      premium: clubs.filter((c) => c.plan === "Enterprise").length,
      suspended: clubs.filter((c) => c.status === "Suspendu").length,
    };
  }, [clubs]);

  async function handleSuspend(id: string) {
    setActionLoading(id);
    try {
      await platformApi.suspendOrganization(id);
      await reload();
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReactivate(id: string) {
    setActionLoading(id);
    try {
      await platformApi.reactivateOrganization(id);
      await reload();
    } finally {
      setActionLoading(null);
    }
  }

  async function handleActivate(id: string) {
    setActionLoading(id);
    try {
      await platformApi.activateSubscription(id, "Virement");
      await reload();
    } finally {
      setActionLoading(null);
    }
  }

  async function handleImpersonate(id: string) {
    setActionLoading(`imp-${id}`);
    try {
      await impersonateClub(id);
      navigate("/club");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setActionLoading("create");
    try {
      await platformApi.createOrganization(createForm);
      setShowCreate(false);
      setCreateForm({
        clubName: "",
        country: "Tunisie",
        league: "",
        city: "",
        fullName: "",
        email: "",
        password: "",
        planCode: "STARTER",
      });
      await reload();
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <SuperAdminPageTransition>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.8fr_1fr]">
        <div className="space-y-6">
          <SuperAdminPageHeader
            title="Gestion Clubs"
            subtitle="Organisations (tenants) — essai gratuit puis abonnement payant."
            action={<SuperAdminGhostButton onClick={() => setShowCreate(true)}>Créer Club</SuperAdminGhostButton>}
          />

          <SuperAdminKpiGrid cols={4}>
            <SuperAdminKpiCard label="Clubs" value={String(summary.total)} icon={Building2} color="#3B82F6" />
            <SuperAdminKpiCard label="Active" value={String(summary.active)} icon={CheckCircle2} color="#10B981" />
            <SuperAdminKpiCard label="Premium" value={String(summary.premium)} icon={Crown} color="#FF7A00" />
            <SuperAdminKpiCard label="Suspended" value={String(summary.suspended)} icon={Ban} color="#EF4444" />
          </SuperAdminKpiGrid>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <SuperAdminSearchInput value={query} onChange={setQuery} placeholder="Rechercher club" className="w-full pl-10" />
            </div>
            <SuperAdminFilterPills
              options={["Tous", "Actif", "Essai", "Suspendu", "Premium"]}
              value={filter}
              onChange={setFilter}
            />
          </div>

          <SuperAdminSection title="Liste des clubs" subtitle="Gestion et actions rapides.">
            {loading && <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement…</p>}
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    {["Logo", "Nom", "Ville", "Utilisateurs", "Plan", "Statut", "Actions"].map((h, i) => (
                      <th key={h} className={`px-4 py-3 font-semibold ${i === 3 || i === 6 ? "text-right" : "text-left"}`} style={{ color: "var(--text-muted)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(clubs ?? []).map((club) => (
                    <tr key={club.id} style={{ borderBottom: "1px solid var(--surface-panel-border)" }}>
                      <td className="px-4 py-3 font-semibold" style={{ color: "var(--text-primary)" }}>{club.logo}</td>
                      <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>{club.name}</td>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{club.city}</td>
                      <td className="px-4 py-3 text-right" style={{ color: "var(--text-primary)" }}>{club.users}</td>
                      <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>{club.plan}</td>
                      <td className="px-4 py-3">
                        <Badge tone={statusTone(club.status)}>{club.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <SuperAdminGhostButton onClick={() => setSelectedClub(club)}>Voir</SuperAdminGhostButton>
                          {club.status === "Essai" && (
                            <SuperAdminGhostButton disabled={actionLoading === club.id} onClick={() => handleActivate(club.id)}>
                              Activer
                            </SuperAdminGhostButton>
                          )}
                          {club.status === "Suspendu" ? (
                            <SuperAdminGhostButton disabled={actionLoading === club.id} onClick={() => handleReactivate(club.id)}>
                              Réactiver
                            </SuperAdminGhostButton>
                          ) : (
                            <SuperAdminGhostButton disabled={actionLoading === club.id} onClick={() => handleSuspend(club.id)}>
                              Suspendre
                            </SuperAdminGhostButton>
                          )}
                          <SuperAdminGhostButton disabled={actionLoading === `imp-${club.id}`} onClick={() => handleImpersonate(club.id)}>
                            Se connecter
                          </SuperAdminGhostButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SuperAdminSection>
        </div>

        {selectedClub && (
          <SuperAdminCard hover={false} glow className="!p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Club Details</p>
                <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{selectedClub.name}</h2>
              </div>
              <SuperAdminGhostButton onClick={() => setSelectedClub(null)}>Fermer</SuperAdminGhostButton>
            </div>
            <div className="space-y-3 text-sm" style={{ color: "var(--text-primary)" }}>
              <p><strong>Ville:</strong> {selectedClub.city}</p>
              <p><strong>Plan:</strong> {selectedClub.plan}</p>
              <p><strong>Utilisateurs:</strong> {selectedClub.users}</p>
              <p><strong>Statut:</strong> {selectedClub.status}</p>
              {selectedClub.subscriptionStatus === "TRIALING" && selectedClub.trialEndsAt && (
                <p><strong>Fin essai:</strong> {new Date(selectedClub.trialEndsAt).toLocaleDateString("fr-FR")}</p>
              )}
              <p style={{ color: "var(--text-muted)" }}>{selectedClub.description}</p>
              <SuperAdminActionButton onClick={() => navigate(`/superadmin/clubs/${selectedClub.id}`)}>
                Page détail
              </SuperAdminActionButton>
            </div>
          </SuperAdminCard>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <SuperAdminCard hover={false} className="w-full max-w-lg !p-6">
            <h3 className="mb-4 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Créer un club (essai 14j)</h3>
            <form onSubmit={handleCreate} className="grid gap-3">
              {[
                ["clubName", "Nom du club"],
                ["league", "Ligue"],
                ["city", "Ville"],
                ["fullName", "Admin — nom complet"],
                ["email", "Admin — email"],
                ["password", "Mot de passe"],
              ].map(([key, label]) => (
                <label key={key} className="text-sm">
                  <span style={{ color: "var(--text-muted)" }}>{label}</span>
                  <input
                    required
                    type={key === "password" ? "password" : "text"}
                    className="glass-input mt-1 w-full"
                    value={createForm[key as keyof typeof createForm]}
                    onChange={(e) => setCreateForm((f) => ({ ...f, [key]: e.target.value }))}
                  />
                </label>
              ))}
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
