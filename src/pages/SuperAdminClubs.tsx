import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { SuperAdminPageTransition, SuperAdminPageHeader, SuperAdminKpiCard, SuperAdminKpiGrid, SuperAdminSection, SuperAdminFilterPills, SuperAdminSearchInput, SuperAdminCard, SuperAdminGhostButton, SuperAdminListRow } from "../components/superadmin";
import { Building2, CheckCircle2, Crown, Ban } from "lucide-react";

interface Club {
  id: string;
  logo: string;
  name: string;
  city: string;
  users: number;
  plan: string;
  status: "Actif" | "Suspendu" | "Premium";
  description: string;
}

const CLUBS: Club[] = [
  { id: "1", logo: "FC", name: "FC Carthage", city: "Tunis", users: 58, plan: "Enterprise", status: "Premium", description: "Club historique avec 5 équipes et 1200 abonnés." },
  { id: "2", logo: "ES", name: "ES Sahel", city: "Sousse", users: 42, plan: "Pro", status: "Actif", description: "Club régional en forte croissance." },
  { id: "3", logo: "SS", name: "CS Sfaxien", city: "Sfax", users: 37, plan: "Starter", status: "Suspendu", description: "Club en phase d'audit de conformité." },
  { id: "4", logo: "US", name: "US Monastir", city: "Monastir", users: 24, plan: "Pro", status: "Actif", description: "Club jeune avec un plan de développement avancé." },
];

export function SuperAdminClubs() {
  const [query, setQuery] = useState("");
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [filter, setFilter] = useState("Tous");

  const filteredClubs = useMemo(() => {
    return CLUBS.filter((club) => {
      const matchesQuery = club.name.toLowerCase().includes(query.toLowerCase());
      const matchesFilter = filter === "Tous" || club.status === filter || club.plan === filter;
      return matchesQuery && matchesFilter;
    });
  }, [query, filter]);

  return (
    <SuperAdminPageTransition>
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.8fr_1fr]">
      <div className="space-y-6">
        <SuperAdminPageHeader
          title="Gestion Clubs"
          subtitle="Recherche, filtres et actions sur les clubs."
          action={<SuperAdminGhostButton>Créer Club</SuperAdminGhostButton>}
        />

        <SuperAdminKpiGrid cols={4}>
          <SuperAdminKpiCard label="Clubs" value="125" icon={Building2} color="#3B82F6" />
          <SuperAdminKpiCard label="Active" value="98" icon={CheckCircle2} color="#10B981" />
          <SuperAdminKpiCard label="Premium" value="12" icon={Crown} color="#FF7A00" />
          <SuperAdminKpiCard label="Suspended" value="15" icon={Ban} color="#EF4444" />
        </SuperAdminKpiGrid>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <SuperAdminSearchInput value={query} onChange={setQuery} placeholder="Rechercher club" className="w-full pl-10" />
          </div>
          <SuperAdminFilterPills options={["Tous", "Actif", "Suspendu", "Premium"]} value={filter} onChange={setFilter} />
        </div>

        <SuperAdminSection title="Liste des clubs" subtitle="Gestion et actions rapides.">
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
                {filteredClubs.map((club) => (
                  <tr key={club.id} style={{ borderBottom: "1px solid var(--surface-panel-border)" }}>
                    <td className="px-4 py-3 font-semibold" style={{ color: "var(--text-primary)" }}>{club.logo}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>{club.name}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{club.city}</td>
                    <td className="px-4 py-3 text-right" style={{ color: "var(--text-primary)" }}>{club.users}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>{club.plan}</td>
                    <td className="px-4 py-3">
                      <Badge tone={club.status === "Actif" ? "success" : club.status === "Premium" ? "info" : "warning"}>{club.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <SuperAdminGhostButton onClick={() => setSelectedClub(club)}>Voir</SuperAdminGhostButton>
                        <SuperAdminGhostButton>Modifier</SuperAdminGhostButton>
                        <SuperAdminGhostButton>Suspendre</SuperAdminGhostButton>
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
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="space-y-3 text-sm" style={{ color: "var(--text-primary)" }}>
              <p><strong>Ville:</strong> {selectedClub.city}</p>
              <p><strong>Plan:</strong> {selectedClub.plan}</p>
              <p><strong>Utilisateurs:</strong> {selectedClub.users}</p>
              <p><strong>Statut:</strong> {selectedClub.status}</p>
              <p style={{ color: "var(--text-muted)" }}>{selectedClub.description}</p>
            </div>
            <div className="space-y-3">
              {["Informations", "Utilisateurs", "Finances"].map((label) => (
                <SuperAdminListRow key={label}>
                  <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{label}</p>
                  <p className="mt-2 text-sm" style={{ color: "var(--text-primary)" }}>Données clés du club.</p>
                </SuperAdminListRow>
              ))}
            </div>
          </div>
        </SuperAdminCard>
      )}
    </div>
    </SuperAdminPageTransition>
  );
}
