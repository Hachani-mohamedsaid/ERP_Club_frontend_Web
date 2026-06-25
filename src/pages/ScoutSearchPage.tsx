import { Search, Heart, Eye, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

interface Player {
  id: string;
  name: string;
  age: number;
  nationality: string;
  club: string;
  position: string;
  potential: number;
  marketValue: string;
  image?: string;
}

const PLAYERS: Player[] = [
  { id: "1", name: "Youssef Ben Ali", age: 17, nationality: "TN", club: "AS Ariana", position: "BU", potential: 89, marketValue: "1.2M €" },
  { id: "2", name: "Nader Trabelsi", age: 19, nationality: "TN", club: "Stade Tunisien", position: "MC", potential: 84, marketValue: "850K €" },
  { id: "3", name: "Mouhamed Diallo", age: 21, nationality: "CI", club: "AFAD Djékanou", position: "Ailier", potential: 81, marketValue: "750K €" },
  { id: "4", name: "Karim Sassi", age: 22, nationality: "TN", club: "US Monastir", position: "DC", potential: 78, marketValue: "650K €" },
  { id: "5", name: "Ali Messi", age: 20, nationality: "DZ", club: "JS Kabylie", position: "DG", potential: 76, marketValue: "550K €" },
];

export function ScoutSearchPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    name: "",
    age: "",
    nationality: "",
    position: "",
    club: "",
  });

  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]));
  };

  const filteredPlayers = PLAYERS.filter((player) => {
    if (filters.name && !player.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
    if (filters.position && player.position !== filters.position) return false;
    if (filters.nationality && player.nationality !== filters.nationality) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Recherche Joueurs
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Découvrez et évaluez les meilleurs prospects
        </p>
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Search size={18} style={{ color: "var(--accent)" }} />
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Filtres
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <input
            type="text"
            placeholder="Nom joueur"
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            className="glass-input px-3 py-2 text-sm w-full"
          />
          <select
            value={filters.position}
            onChange={(e) => setFilters({ ...filters, position: e.target.value })}
            className="glass-input px-3 py-2 text-sm w-full"
          >
            <option value="">Tous les postes</option>
            <option value="BU">Buteur</option>
            <option value="MC">Milieu Créateur</option>
            <option value="DC">Défenseur Central</option>
            <option value="DG">Défenseur Gauche</option>
            <option value="Ailier">Ailier</option>
          </select>
          <input
            type="text"
            placeholder="Nationalité"
            value={filters.nationality}
            onChange={(e) => setFilters({ ...filters, nationality: e.target.value.toUpperCase() })}
            className="glass-input px-3 py-2 text-sm w-full"
          />
          <input
            type="text"
            placeholder="Club"
            value={filters.club}
            onChange={(e) => setFilters({ ...filters, club: e.target.value })}
            className="glass-input px-3 py-2 text-sm w-full"
          />
          <Button type="button" className="w-full">
            Rechercher
          </Button>
        </div>
      </GlassCard>

      <div className="space-y-3">
        {filteredPlayers.map((player) => (
          <GlassCard
            key={player.id}
            className="p-5 transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div
                  className="h-16 w-16 rounded-full bg-slate-700 flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>
                        {player.name}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {player.age} ans · {player.position} · {player.club}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold" style={{ color: "var(--accent)" }}>
                        {player.potential}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Potentiel
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone="info">{player.nationality}</Badge>
                    <Badge tone="success">{player.marketValue}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleFavorite(player.id)}
                  className="p-2 rounded-[var(--radius-odin-md)] transition-all duration-300 hover:bg-accent/10"
                  style={{ borderColor: "var(--surface-panel-border)" }}
                >
                  <Heart
                    size={18}
                    fill={favorites.includes(player.id) ? "var(--accent)" : "none"}
                    style={{ color: favorites.includes(player.id) ? "var(--accent)" : "var(--text-muted)" }}
                  />
                </button>
                <button
                  onClick={() => navigate(`/player/${player.id}`)}
                  className="px-3 py-2 rounded-[var(--radius-odin-md)] border text-sm font-medium transition-all duration-300 hover:bg-accent/10 flex items-center gap-2"
                  style={{ borderColor: "var(--surface-panel-border)", color: "var(--accent)" }}
                >
                  <Eye size={16} />
                  Voir Profil
                </button>
                <button
                  className="px-3 py-2 rounded-[var(--radius-odin-md)] text-sm font-medium transition-all duration-300 flex items-center gap-2"
                  style={{ background: "var(--accent)", color: "white" }}
                >
                  <Plus size={16} />
                  Observation
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
