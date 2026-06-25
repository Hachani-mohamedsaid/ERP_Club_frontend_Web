import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, BarChart3, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GlassCard } from "../../components/ui/GlassCard";
import { PlayerSquadCard } from "../../components/player/PlayerSquadCard";
import { getInitials, getAvailabilityTone, type PlayerAvailability } from "../../data/joueurMockData";
import { AnimatedBadge } from "../../components/ui/AnimatedBadge";
import { CountUpStat } from "../../components/player/CountUpStat";
import { useJoueurBackendData, type BackendPlayer } from "../../hooks/useJoueurBackendData";

const FILTERS: Array<"Tous" | PlayerAvailability> = ["Tous", "Disponible", "Blessé", "Limité", "Fin contrat"];

function PlayerDetailDrawer({ player, onClose }: { player: BackendPlayer; onClose: () => void }) {
  const navigate = useNavigate();
  const radar = player.radar ?? { speed: 70, passing: 65, shooting: 60, physical: 72, vision: 68, defending: 55 };
  const radarEntries = Object.entries(radar);

  return (
    <motion.div
      key="drawer"
      className="fixed inset-0 z-[200] flex items-end justify-end p-4"
      style={{ background: "rgba(0,0,0,0.65)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="h-full w-full max-w-sm overflow-y-auto rounded-2xl p-6"
        style={{ background: "#141B2D", border: "1px solid rgba(255,107,87,0.25)" }}
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 80, opacity: 0 }}
        transition={{ type: "spring", damping: 22, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-black" style={{ background: "rgba(255,107,87,0.18)", color: "#FF6B57" }}>
              {player.photoUrl
                ? <img src={player.photoUrl} alt={player.name} className="h-full w-full rounded-2xl object-cover" />
                : getInitials(player.name)}
            </div>
            <div>
              <p className="font-bold" style={{ color: "var(--text-primary)" }}>{player.name}</p>
              <p className="text-sm" style={{ color: "var(--accent)" }}>{player.position || "—"}</p>
              <AnimatedBadge tone={getAvailabilityTone((player.availability || "Disponible") as PlayerAvailability)}>
                {player.availability || "Disponible"}
              </AnimatedBadge>
            </div>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.08)", color: "var(--text-muted)" }}>
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: "OVR", value: player.ovr ?? 70, color: "#FF6B57" },
            { label: "Âge", value: player.age ?? 0, color: "var(--text-primary)", suffix: " ans" },
            { label: "Buts", value: player.goals ?? 0, color: "#22C55E" },
            { label: "Assists", value: player.stats?.seasonStats?.assists ?? 0, color: "#3B82F6" },
          ].map(({ label, value, color, suffix = "" }) => (
            <div key={label} className="rounded-xl border p-3 text-center" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <p className="text-xl font-black" style={{ color }}>
                <CountUpStat end={value} suffix={suffix} />
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
            </div>
          ))}
        </div>

        <GlassCard className="p-4 mb-4">
          <p className="mb-3 text-xs font-semibold uppercase" style={{ color: "var(--text-muted)" }}>Attributs</p>
          <div className="space-y-2">
            {radarEntries.map(([key, val]) => (
              <div key={key}>
                <div className="mb-0.5 flex justify-between text-xs">
                  <span style={{ color: "var(--text-muted)" }}>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                  <span className="font-bold" style={{ color: "#FF6B57" }}>{val}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <motion.div className="h-full rounded-full" style={{ background: "#FF6B57" }} initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ duration: 0.8 }} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="rounded-xl border p-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Valeur marché</p>
            <p className="font-bold" style={{ color: "#22C55E" }}>{player.marketValue || "—"}</p>
          </div>
          <div className="rounded-xl border p-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Salaire</p>
            <p className="font-bold" style={{ color: "var(--text-primary)" }}>{player.contract?.salary || "—"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="rounded-xl border p-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Forme actuelle</p>
            <div className="h-1.5 overflow-hidden rounded-full mb-1" style={{ background: "rgba(255,255,255,0.06)" }}>
              <motion.div className="h-full rounded-full" style={{ background: "#3B82F6" }} initial={{ width: 0 }} animate={{ width: `${player.stats?.form ?? 70}%` }} transition={{ duration: 0.8 }} />
            </div>
            <p className="text-xs font-semibold" style={{ color: "#3B82F6" }}>{player.stats?.form ?? 70}%</p>
          </div>
          <div className="rounded-xl border p-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Charge entraîn.</p>
            <div className="h-1.5 overflow-hidden rounded-full mb-1" style={{ background: "rgba(255,255,255,0.06)" }}>
              <motion.div className="h-full rounded-full" style={{ background: "#22C55E" }} initial={{ width: 0 }} animate={{ width: `${player.stats?.trainingLoad ?? 65}%` }} transition={{ duration: 0.8, delay: 0.1 }} />
            </div>
            <p className="text-xs font-semibold" style={{ color: "#22C55E" }}>{player.stats?.trainingLoad ?? 65}%</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => { onClose(); navigate("/joueurs/comparer"); }}
          className="w-full rounded-xl py-2.5 text-sm font-semibold transition-all hover:opacity-80 flex items-center justify-center gap-2"
          style={{ background: "rgba(255,107,87,0.15)", color: "#FF6B57", border: "1px solid rgba(255,107,87,0.3)" }}
        >
          <BarChart3 size={14} />
          Comparer ce joueur
        </button>
      </motion.div>
    </motion.div>
  );
}

export function JoueurListPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"Tous" | PlayerAvailability>("Tous");
  const [selectedPlayer, setSelectedPlayer] = useState<BackendPlayer | null>(null);
  const { squadPlayers, loading } = useJoueurBackendData();

  const filtered = squadPlayers.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.position ?? "").toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "Tous" || p.availability === filter;
    return matchSearch && matchFilter;
  });

  const squadForCard = filtered.map((bp) => ({
    id: bp.id,
    name: bp.name,
    position: bp.position || "MIL",
    positionFull: bp.position || "Milieu",
    nationality: "Tunisie",
    flag: "🇹🇳",
    age: bp.age ?? 22,
    marketValue: bp.marketValue || "—",
    marketValueNum: 0,
    availability: (bp.availability || "Disponible") as PlayerAvailability,
    ovr: bp.ovr ?? 70,
    preferredPosition: bp.position || "MIL",
    secondaryPosition: "—",
    photoUrl: bp.photoUrl ?? null,
    stats: {
      goals: bp.goals ?? 0,
      assists: bp.stats?.seasonStats?.assists ?? 0,
      minutes: bp.stats?.seasonStats?.matches ? bp.stats.seasonStats.matches * 85 : 0,
      passAccuracy: bp.radar?.passing ?? 65,
      distance: 0,
    },
    radar: bp.radar ?? {
      speed: 70, passing: 65, shooting: 60, physical: 72, vision: 68, defending: 55,
    },
    performanceHistory: bp.stats?.performanceEvolution ?? [],
    injuries: [],
    riskScore: 0,
    contract: { salary: bp.contract?.salary ?? "—", bonus: "—", clause: "—", expiration: "—", daysRemaining: 0, startYear: 2022, endYear: 2026 },
    marketHistory: [],
    matches: [],
  }));

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

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-3" style={{ color: "var(--text-muted)" }}>
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Chargement de l'effectif...</span>
        </div>
      ) : (
        <>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>{filtered.length} joueur(s) — cliquez pour voir les détails</p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {squadForCard.map((player, i) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <PlayerSquadCard player={player} onSelect={() => setSelectedPlayer(squadPlayers.find((p) => p.id === player.id) ?? null)} />
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <p className="col-span-full text-center text-sm py-8" style={{ color: "var(--text-muted)" }}>
                Aucun joueur trouvé
              </p>
            )}
          </div>
        </>
      )}

      <AnimatePresence>
        {selectedPlayer && (
          <PlayerDetailDrawer
            player={selectedPlayer}
            onClose={() => setSelectedPlayer(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
