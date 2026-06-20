import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Eye, Pencil, Ban, ArrowRightLeft, FileSignature, X, GitCompareArrows } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Legend } from "recharts";
import { ClubPageTransition } from "../../components/club/ClubPageTransition";
import { ClubKpiCard } from "../../components/club/ClubKpiCard";
import { PlayerDetailDrawer } from "../../components/club/PlayerDetailDrawer";
import { PlayerAvatar } from "../../components/player/PlayerAvatar";
import { SQUAD_PLAYERS, type SquadPlayer } from "../../data/joueurMockData";

const STATUS_COLORS: Record<string, string> = {
  Disponible: "#22C55E", Blessé: "#EF4444", "Fin contrat": "#F59E0B", Limité: "#6366F1",
};

export function ClubJoueursPage() {
  const [search, setSearch] = useState("");
  const [compareOpen, setCompareOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [drawerPlayer, setDrawerPlayer] = useState<SquadPlayer | null>(null);

  const filtered = SQUAD_PLAYERS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.position.toLowerCase().includes(search.toLowerCase())
  );

  const comparePlayers = selected.map((id) => SQUAD_PLAYERS.find((p) => p.id === id)).filter(Boolean);
  const radarData = comparePlayers.length === 2
    ? Object.keys(comparePlayers[0]!.radar).map((key) => ({
        stat: key.charAt(0).toUpperCase() + key.slice(1),
        [comparePlayers[0]!.name.split(" ")[0]]: comparePlayers[0]!.radar[key as keyof typeof comparePlayers[0]["radar"]],
        [comparePlayers[1]!.name.split(" ")[0]]: comparePlayers[1]!.radar[key as keyof typeof comparePlayers[1]["radar"]],
      }))
    : [];

  function toggleCompare(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 2 ? [...prev, id] : [prev[1], id]);
  }

  return (
    <ClubPageTransition>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <motion.div className="relative flex-1 min-w-[200px] max-w-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un joueur..."
            className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm backdrop-blur-[10px]"
            style={{ background: "rgba(15,29,58,0.8)", borderColor: "rgba(255,255,255,0.05)", color: "var(--text-primary)" }}
          />
        </motion.div>
        <button
          type="button"
          onClick={() => setCompareOpen(true)}
          disabled={selected.length < 2}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-40"
          style={{ background: "rgba(255,107,87,0.15)", color: "#FF6B57" }}
        >
          <GitCompareArrows size={16} /> Comparer ({selected.length}/2)
        </button>
      </div>

      <ClubKpiCard hover={false} className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {["", "Nom", "Poste", "Âge", "OVR", "Valeur", "Salaire", "Statut", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((player, i) => (
                <motion.tr
                  key={player.id}
                  className="cursor-pointer transition-colors hover:bg-white/[0.03]"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setDrawerPlayer(player)}
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.includes(player.id)} onChange={() => toggleCompare(player.id)} className="rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <motion.div whileHover={{ rotate: 1, scale: 1.02 }}>
                        <PlayerAvatar name={player.name} size={36} />
                      </motion.div>
                      <span className="font-medium" style={{ color: "var(--text-primary)" }}>{player.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{player.position}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{player.age}</td>
                  <td className="px-4 py-3 font-bold" style={{ color: "#FF6B57" }}>{player.ovr}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{player.marketValue}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{player.contract.salary}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: `${STATUS_COLORS[player.availability]}20`, color: STATUS_COLORS[player.availability] }}>
                      {player.availability}
                    </span>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => setDrawerPlayer(player)} className="rounded-lg p-1.5 transition-colors hover:bg-white/5" style={{ color: "#FF6B57" }}>
                        <Eye size={14} />
                      </button>
                      {[Pencil, Ban, ArrowRightLeft, FileSignature].map((Icon, idx) => (
                        <button key={idx} type="button" className="rounded-lg p-1.5 transition-colors hover:bg-white/5" style={{ color: "var(--text-muted)" }}>
                          <Icon size={14} />
                        </button>
                      ))}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </ClubKpiCard>

      <PlayerDetailDrawer player={drawerPlayer} open={!!drawerPlayer} onClose={() => setDrawerPlayer(null)} />

      <AnimatePresence>
        {compareOpen && comparePlayers.length === 2 && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCompareOpen(false)} />
            <motion.div
              className="relative w-full max-w-lg rounded-[20px] border p-6"
              style={{ background: "rgba(15,29,58,0.95)", borderColor: "rgba(255,255,255,0.05)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>
                  {comparePlayers[0]!.name.split(" ")[0]} vs {comparePlayers[1]!.name.split(" ")[0]}
                </h3>
                <button type="button" onClick={() => setCompareOpen(false)}><X size={18} style={{ color: "var(--text-muted)" }} /></button>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="stat" tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                  <Radar name={comparePlayers[0]!.name.split(" ")[0]} dataKey={comparePlayers[0]!.name.split(" ")[0]} stroke="#FF6B57" fill="#FF6B57" fillOpacity={0.2} animationDuration={1000} />
                  <Radar name={comparePlayers[1]!.name.split(" ")[0]} dataKey={comparePlayers[1]!.name.split(" ")[0]} stroke="#6366F1" fill="#6366F1" fillOpacity={0.2} animationDuration={1000} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ClubPageTransition>
  );
}
