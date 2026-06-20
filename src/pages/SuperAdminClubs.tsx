import { useMemo, useState } from "react";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { Search } from "lucide-react";
import { Badge } from "../components/ui/Badge";

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
  const [filter, setFilter] = useState<string>("Tous");

  const filteredClubs = useMemo(() => {
    return CLUBS.filter((club) => {
      const matchesQuery = club.name.toLowerCase().includes(query.toLowerCase());
      const matchesFilter = filter === "Tous" || club.status === filter || club.plan === filter;
      return matchesQuery && matchesFilter;
    });
  }, [query, filter]);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.8fr_1fr]">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
              Gestion Clubs
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Recherche, filtres et actions sur les clubs.
            </p>
          </div>
          <Button variant="ghost">Créer Club</Button>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              className="w-full rounded-[var(--radius-odin-md)] border bg-transparent px-10 py-2 text-sm"
              style={{ borderColor: "var(--surface-panel-border)" }}
              placeholder="🔍 Rechercher club"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {['Tous', 'Actif', 'Suspendu', 'Premium'].map((value) => (
              <Button key={value} variant={filter === value ? 'solid' : 'ghost'} size="sm" onClick={() => setFilter(value)}>
                {value}
              </Button>
            ))}
          </div>
        </div>

        <GlassCard raised className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--surface-panel-border)" }}>
                  <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-muted)" }}>Logo</th>
                  <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-muted)" }}>Nom</th>
                  <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-muted)" }}>Ville</th>
                  <th className="px-4 py-3 text-right font-semibold" style={{ color: "var(--text-muted)" }}>Utilisateurs</th>
                  <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-muted)" }}>Plan</th>
                  <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-muted)" }}>Statut</th>
                  <th className="px-4 py-3 text-right font-semibold" style={{ color: "var(--text-muted)" }}>Actions</th>
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
                      <Badge tone={club.status === 'Actif' ? 'success' : club.status === 'Premium' ? 'info' : 'warning'}>{club.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedClub(club)}>Voir</Button>
                        <Button variant="ghost" size="sm">Modifier</Button>
                        <Button variant="ghost" size="sm">Suspendre</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      {selectedClub && (
        <div className="rounded-[var(--radius-odin-md)] border bg-[var(--surface-panel)] p-6" style={{ borderColor: "var(--surface-panel-border)" }}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--text-muted)]">Club Details</p>
              <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{selectedClub.name}</h2>
            </div>
            <Button variant="ghost" onClick={() => setSelectedClub(null)}>Fermer</Button>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <p><strong>Ville:</strong> {selectedClub.city}</p>
              <p><strong>Plan:</strong> {selectedClub.plan}</p>
              <p><strong>Utilisateurs:</strong> {selectedClub.users}</p>
              <p><strong>Statut:</strong> {selectedClub.status}</p>
              <p className="text-sm text-[var(--text-muted)]">{selectedClub.description}</p>
            </div>
            <div className="space-y-3">
              <GlassCard className="p-4">
                <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Informations</p>
                <p className="mt-2 text-sm" style={{ color: "var(--text-primary)" }}>Données clés du club et état de conformité.</p>
              </GlassCard>
              <GlassCard className="p-4">
                <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Utilisateurs</p>
                <p className="mt-2 text-sm" style={{ color: "var(--text-primary)" }}>58 membres affiliés, 12 access tokens actifs.</p>
              </GlassCard>
              <GlassCard className="p-4">
                <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Finances</p>
                <p className="mt-2 text-sm" style={{ color: "var(--text-primary)" }}>Plan Premium, facturation mensuelle automatisée.</p>
              </GlassCard>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
