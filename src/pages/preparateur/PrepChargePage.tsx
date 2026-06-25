import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, ClipboardList, Send, UserSquare2 } from "lucide-react";
import { PrepPageTransition } from "../../components/preparateur/PrepPageTransition";
import { PrepKpiCard } from "../../components/preparateur/PrepKpiCard";
import { PrepToolbar, downloadCsv } from "../../components/preparateur/PrepToolbar";
import { PLAYER_LOAD, getPlayerDetail, getStatusBadge, type PlayerLoad } from "../../data/preparateurData";
import { PrepPlayerDrawer } from "../../components/preparateur/PrepPlayerDrawer";

function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-12 rounded-lg" style={{ background: "rgba(255,255,255,0.05)" }} />
      ))}
    </div>
  );
}

export function PrepChargePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loads, setLoads] = useState(PLAYER_LOAD);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const drawerPlayer = drawerId ? getPlayerDetail(drawerId) ?? null : null;

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = loads.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.status === filter;
    return matchSearch && matchFilter;
  });

  function adjustCharge(id: string, delta: number) {
    setLoads((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      const charge = Math.max(20, Math.min(100, p.charge + delta));
      const status = charge >= 85 ? "critical" : charge >= 70 ? "warning" : "normal";
      return { ...p, charge, status };
    }));
    setToast(delta > 0 ? "Charge augmentée" : "Charge réduite");
    setTimeout(() => setToast(null), 2000);
  }

  function sendToCoach(player: PlayerLoad) {
    setToast(`Recommandation envoyée au coach — ${player.name}`);
    setTimeout(() => setToast(null), 2500);
  }

  function exportCsv() {
    downloadCsv(
      "charge-equipe.csv",
      ["Nom", "Poste", "Charge", "Fatigue", "Récupération", "Statut"],
      filtered.map((p) => [p.name, p.position, `${p.charge}%`, `${p.fatigue}%`, `${p.recovery}%`, getStatusBadge(p.status).label])
    );
  }

  return (
    <PrepPageTransition>
      <PrepToolbar
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
        filterOptions={[
          { value: "all", label: "Tous statuts" },
          { value: "normal", label: "Normal" },
          { value: "warning", label: "Attention" },
          { value: "critical", label: "Critique" },
        ]}
        onExportCsv={exportCsv}
        placeholder="Rechercher un joueur..."
      />

      <PrepKpiCard hover={false} className="overflow-hidden p-0">
        {loading ? <TableSkeleton /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  {["Nom", "Charge", "Fatigue", "Récupération", "Statut", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const badge = getStatusBadge(p.status);
                  return (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="cursor-pointer transition-colors hover:bg-white/[0.04]"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                      onClick={() => setDrawerId(p.id)}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{p.position}</p>
                      </td>
                      <td className="px-4 py-3 font-bold" style={{ color: badge.color }}>{p.charge}%</td>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{p.fatigue}%</td>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{p.recovery}%</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: `${badge.color}20`, color: badge.color }}>
                          {badge.emoji} {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-wrap gap-1">
                          <button type="button" onClick={() => adjustCharge(p.id, -10)} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs hover:bg-white/5" style={{ color: "#22C55E" }}>
                            <Minus size={12} /> Réduire
                          </button>
                          <button type="button" onClick={() => adjustCharge(p.id, 10)} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs hover:bg-white/5" style={{ color: "#F59E0B" }}>
                            <Plus size={12} /> Augmenter
                          </button>
                          <button type="button" className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs hover:bg-white/5" style={{ color: "#6366F1" }}>
                            <ClipboardList size={12} /> Programme
                          </button>
                          <button type="button" onClick={() => sendToCoach(p)} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs hover:bg-white/5" style={{ color: "#FF6B57" }}>
                            <Send size={12} /> Coach
                          </button>
                          <button type="button" onClick={(e) => { e.stopPropagation(); navigate(`/preparateur/fiche/${p.id}`); }} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs hover:bg-white/5" style={{ color: "#FF7A00" }}>
                            <UserSquare2 size={12} /> Fiche
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </PrepKpiCard>

      <PrepPlayerDrawer player={drawerPlayer} open={!!drawerId} onClose={() => setDrawerId(null)} />

      {toast && (
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed bottom-6 right-6 z-50 rounded-xl border px-4 py-3 text-sm font-medium shadow-xl"
          style={{ background: "#0F1D3A", borderColor: "rgba(255,107,87,0.3)", color: "#FF6B57" }}
        >
          {toast}
        </motion.div>
      )}
    </PrepPageTransition>
  );
}
