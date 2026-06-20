import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { PlayerSquadCard } from "../../components/player/PlayerSquadCard";
import { SQUAD_PLAYERS, type PlayerAvailability } from "../../data/joueurMockData";

const FILTERS: Array<"Tous" | PlayerAvailability> = ["Tous", "Disponible", "Blessé", "Limité", "Fin contrat"];

export function JoueurListPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"Tous" | PlayerAvailability>("Tous");

  const filtered = SQUAD_PLAYERS.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.position.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "Tous" || p.availability === filter;
    return matchSearch && matchFilter;
  });

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Rechercher un joueur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input w-full py-2.5 pl-9 pr-3 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className="rounded-full px-4 py-2 text-xs font-medium transition-colors"
              style={{
                background: filter === f ? "var(--accent)" : "rgba(var(--accent-rgb), 0.1)",
                color: filter === f ? "white" : "var(--text-secondary)",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm" style={{ color: "var(--text-muted)" }}>{filtered.length} joueur(s)</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((player, i) => (
          <motion.div key={player.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <PlayerSquadCard player={player} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
