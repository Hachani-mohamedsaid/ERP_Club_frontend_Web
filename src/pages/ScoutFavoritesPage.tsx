import { Heart, Scale, Trash2 } from "lucide-react";
import { useState } from "react";
import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { ScoutPlayerPhoto, resolveScoutPhotoUrl } from "../components/scout/ScoutPlayerPhoto";
import { useScoutProspects } from "../hooks/useScoutData";
import { S } from "../data/scoutData";

interface FavoritePlayer {
  id: string;
  name: string;
  potential: number;
  marketValue: string;
  position: string;
  age: number;
  status: "Hot" | "Recommended" | "Analyzing";
}

const FAVORITES: FavoritePlayer[] = [
  { id: "1", name: "Youssef Ben Ali", potential: 89, marketValue: "1.2M €", position: "BU", age: 17, status: "Hot" },
  { id: "2", name: "Nader Trabelsi", potential: 84, marketValue: "850K €", position: "MC", age: 19, status: "Recommended" },
  { id: "3", name: "Mouhamed Diallo", potential: 81, marketValue: "750K €", position: "Ailier", age: 21, status: "Analyzing" },
];

export function ScoutFavoritesPage() {
  const { prospects } = useScoutProspects();
  const [favorites, setFavorites] = useState<FavoritePlayer[]>(FAVORITES);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const toggleCompare = (id: string) => {
    setSelectedForCompare((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id].slice(-2)
    );
  };

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Joueurs Favoris
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {favorites.length} joueurs dans vos favoris
          </p>
        </div>
        <button
          onClick={() => {
            setCompareMode(!compareMode);
            setSelectedForCompare([]);
          }}
          className="px-4 py-2 rounded-[var(--radius-odin-md)] border text-sm font-medium transition-all"
          style={{ borderColor: "var(--surface-panel-border)", color: compareMode ? "var(--accent)" : "var(--text-secondary)" }}
        >
          <Scale size={16} className="inline mr-2" />
          {compareMode ? "Annuler" : "Comparer"}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr style={{ color: "var(--text-muted)" }}>
              {compareMode && <th className="pb-2 text-xs font-medium px-3">Sélect</th>}
              <th className="pb-2 text-xs font-medium">Joueur</th>
              <th className="pb-2 text-xs font-medium">Potentiel</th>
              <th className="pb-2 text-xs font-medium">Valeur</th>
              <th className="pb-2 text-xs font-medium">Statut</th>
              <th className="pb-2 text-xs font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {favorites.map((player) => (
              <tr key={player.id} style={{ borderTop: "1px solid var(--surface-panel-border)" }} className="hover:bg-accent/5 transition-colors duration-300">
                {compareMode && (
                  <td className="py-3 px-3">
                    <input
                      type="checkbox"
                      checked={selectedForCompare.includes(player.id)}
                      onChange={() => toggleCompare(player.id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </td>
                )}
                <td className="py-3 font-medium" style={{ color: "var(--text-primary)" }}>
                  <div className="flex items-center gap-3">
                    <ScoutPlayerPhoto
                      name={player.name}
                      photoUrl={resolveScoutPhotoUrl(player.name, undefined, prospects)}
                      size={40}
                      accent={S.primary}
                    />
                    {player.name}
                  </div>
                </td>
                <td className="py-3">
                  <span className="text-lg font-bold" style={{ color: "var(--accent)" }}>
                    {player.potential}
                  </span>
                </td>
                <td className="py-3" style={{ color: "var(--text-secondary)" }}>
                  {player.marketValue}
                </td>
                <td className="py-3">
                  <Badge
                    tone={
                      player.status === "Hot"
                        ? "danger"
                        : player.status === "Recommended"
                          ? "success"
                          : "info"
                    }
                  >
                    {player.status}
                  </Badge>
                </td>
                <td className="py-3">
                  <button
                    onClick={() => removeFavorite(player.id)}
                    className="p-2 hover:bg-accent/10 rounded-[var(--radius-odin-md)] transition-all"
                  >
                    <Trash2 size={16} style={{ color: "var(--accent)" }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {compareMode && selectedForCompare.length === 2 && (
        <div>
          <Button type="button" className="w-full">
            Comparer ces 2 joueurs
          </Button>
        </div>
      )}

      {favorites.length === 0 && (
        <GlassCard className="p-12 text-center">
          <Heart size={40} className="mx-auto mb-4 opacity-50" style={{ color: "var(--text-muted)" }} />
          <p style={{ color: "var(--text-muted)" }}>Aucun joueur favori pour le moment</p>
        </GlassCard>
      )}
    </div>
  );
}
