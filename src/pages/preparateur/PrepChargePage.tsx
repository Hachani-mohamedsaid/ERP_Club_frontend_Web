import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, ClipboardList, Send, UserSquare2 } from "lucide-react";
import { PrepPageTransition } from "../../components/preparateur/PrepPageTransition";
import { PrepKpiCard } from "../../components/preparateur/PrepKpiCard";
import { PrepToolbar, downloadCsv } from "../../components/preparateur/PrepToolbar";
import { getStatusBadge, PLAYER_DETAILS } from "../../data/preparateurData";
import type { PlayerDetail } from "../../data/preparateurData";
import { PrepPlayerDrawer } from "../../components/preparateur/PrepPlayerDrawer";
import { clubApi } from "../../lib/api/club";

// ─── Types API ────────────────────────────────────────────────────────────────

interface ApiPlayer {
  id: string;
  name: string;
  position: string;
  loadScore: number;
  fatigueScore: number;
  recoveryScore: number;
  statut: "Critique" | "Attention" | "Normal";
  sessionDate: string | null;
  loadId: string | null;
}

interface ApiChargeResponse {
  players: ApiPlayer[];
  summary: { critiques: number; attentions: number; avgLoad: number; total: number };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function apiStatutToLoadStatus(statut: string) {
  if (statut === "Critique") return "critical" as const;
  if (statut === "Attention") return "warning" as const;
  return "normal" as const;
}

/** Fusionne les données API avec les détails statiques (age, weight, etc.) */
function buildPlayerDetail(api: ApiPlayer): PlayerDetail {
  const stat = PLAYER_DETAILS.find(
    (p) => p.name.toLowerCase() === api.name.toLowerCase(),
  );
  return {
    id: api.id,
    name: api.name,
    position: api.position,
    age: stat?.age ?? 0,
    weight: stat?.weight ?? "—",
    height: stat?.height ?? "—",
    weekCharge: api.loadScore,
    injuryHistory: stat?.injuryHistory ?? [],
    activePrograms: stat?.activePrograms ?? [],
    lastMatch: stat?.lastMatch ?? { opponent: "—", date: "—", rating: 0 },
    availability: stat?.availability ?? "Disponible",
    charge: api.loadScore,
    fatigue: api.fatigueScore,
    recovery: api.recoveryScore,
  };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="h-12 rounded-lg"
          style={{ background: "rgba(255,255,255,0.05)" }}
        />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function PrepChargePage() {
  const navigate = useNavigate();

  const [players, setPlayers] = useState<ApiPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adjusting, setAdjusting] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState<string | null>(null);
  const [drawerId, setDrawerId] = useState<string | null>(null);

  // ── Chargement initial ───────────────────────────────────────────
  const fetchCharge = useCallback(() => {
    setLoading(true);
    setError(null);
    (clubApi.getChargeEquipe() as Promise<ApiChargeResponse>)
      .then((res) => setPlayers(res.players))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Erreur de chargement."),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCharge();
  }, [fetchCharge]);

  // ── Filtrage ─────────────────────────────────────────────────────
  const filtered = players.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const loadStatus = apiStatutToLoadStatus(p.statut);
    const matchFilter =
      filter === "all" ||
      (filter === "critical" && loadStatus === "critical") ||
      (filter === "warning" && loadStatus === "warning") ||
      (filter === "normal" && loadStatus === "normal");
    return matchSearch && matchFilter;
  });

  // ── Actions charge ────────────────────────────────────────────────
  async function adjustCharge(playerId: string, direction: "reduce" | "increase") {
    setAdjusting(playerId);
    try {
      const updated = direction === "reduce"
        ? await (clubApi.reducePlayerLoad(playerId) as Promise<ApiPlayer>)
        : await (clubApi.increasePlayerLoad(playerId) as Promise<ApiPlayer>);

      setPlayers((prev) =>
        prev.map((p) => (p.id === playerId ? { ...p, ...updated } : p)),
      );
      showToast(direction === "reduce" ? "Charge réduite" : "Charge augmentée");
    } catch {
      showToast("Erreur — impossible d'ajuster la charge");
    } finally {
      setAdjusting(null);
    }
  }

  function sendToCoach(player: ApiPlayer) {
    showToast(`Recommandation envoyée au coach — ${player.name}`);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  // ── Export CSV ────────────────────────────────────────────────────
  function exportCsv() {
    downloadCsv(
      "charge-equipe.csv",
      ["Nom", "Poste", "Charge", "Fatigue", "Récupération", "Statut"],
      filtered.map((p) => [
        p.name,
        p.position,
        `${p.loadScore}%`,
        `${p.fatigueScore}%`,
        `${p.recoveryScore}%`,
        p.statut,
      ]),
    );
  }

  // ── Drawer ────────────────────────────────────────────────────────
  const drawerApiPlayer = players.find((p) => p.id === drawerId) ?? null;
  const drawerPlayer: PlayerDetail | null = drawerApiPlayer
    ? buildPlayerDetail(drawerApiPlayer)
    : null;

  // ─── Render ────────────────────────────────────────────────────────────────
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
        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm" style={{ color: "#EF4444" }}>{error}</p>
            <button
              onClick={fetchCharge}
              className="mt-3 rounded-lg px-4 py-2 text-xs font-medium"
              style={{ background: "rgba(255,107,87,0.15)", color: "#FF6B57" }}
            >
              Réessayer
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            Aucun joueur trouvé.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  {["Nom", "Charge", "Fatigue", "Récupération", "Statut", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const loadStatus = apiStatutToLoadStatus(p.statut);
                  const badge = getStatusBadge(loadStatus);
                  const isAdjusting = adjusting === p.id;

                  return (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="cursor-pointer transition-colors hover:bg-white/[0.04]"
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.03)",
                        opacity: isAdjusting ? 0.6 : 1,
                      }}
                      onClick={() => setDrawerId(p.id)}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                          {p.name}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {p.position}
                        </p>
                      </td>
                      <td
                        className="px-4 py-3 font-bold"
                        style={{ color: badge.color }}
                      >
                        {p.loadScore}%
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                        {p.fatigueScore}%
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                        {p.recoveryScore}%
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={{ background: `${badge.color}20`, color: badge.color }}
                        >
                          {badge.emoji} {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-wrap gap-1">
                          <button
                            type="button"
                            disabled={isAdjusting}
                            onClick={() => adjustCharge(p.id, "reduce")}
                            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs hover:bg-white/5 disabled:opacity-40"
                            style={{ color: "#22C55E" }}
                          >
                            <Minus size={12} /> Réduire
                          </button>
                          <button
                            type="button"
                            disabled={isAdjusting}
                            onClick={() => adjustCharge(p.id, "increase")}
                            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs hover:bg-white/5 disabled:opacity-40"
                            style={{ color: "#F59E0B" }}
                          >
                            <Plus size={12} /> Augmenter
                          </button>
                          <button
                            type="button"
                            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs hover:bg-white/5"
                            style={{ color: "#6366F1" }}
                          >
                            <ClipboardList size={12} /> Programme
                          </button>
                          <button
                            type="button"
                            onClick={() => sendToCoach(p)}
                            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs hover:bg-white/5"
                            style={{ color: "#FF6B57" }}
                          >
                            <Send size={12} /> Coach
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/preparateur/fiche/${p.id}`);
                            }}
                            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs hover:bg-white/5"
                            style={{ color: "#FF7A00" }}
                          >
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

      <PrepPlayerDrawer
        player={drawerPlayer}
        open={!!drawerId}
        onClose={() => setDrawerId(null)}
      />

      {toast && (
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed bottom-6 right-6 z-50 rounded-xl border px-4 py-3 text-sm font-medium shadow-xl"
          style={{
            background: "#0F1D3A",
            borderColor: "rgba(255,107,87,0.3)",
            color: "#FF6B57",
          }}
        >
          {toast}
        </motion.div>
      )}
    </PrepPageTransition>
  );
}
