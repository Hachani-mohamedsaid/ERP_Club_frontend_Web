import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { History } from "lucide-react";
import { PrepPageTransition } from "../../components/preparateur/PrepPageTransition";
import { PrepKpiCard } from "../../components/preparateur/PrepKpiCard";
import { PrepToolbar, downloadCsv } from "../../components/preparateur/PrepToolbar";
import { clubApi } from "../../lib/api/club";

interface Session {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  duration: string;
  intensity: string;
  objective: string;
  status: string;
  playerCount: number;
}

const STATUS_COLORS: Record<string, string> = {
  Terminé:  "#22C55E",
  Annulé:   "#EF4444",
  Planifié: "#6366F1",
};

function intensityStyle(intensity: string) {
  if (intensity === "Haute" || intensity === "Max") return { bg: "rgba(239,68,68,0.15)", color: "#EF4444" };
  if (intensity === "Moyenne") return { bg: "rgba(245,158,11,0.15)", color: "#F59E0B" };
  return { bg: "rgba(34,197,94,0.15)", color: "#22C55E" };
}

function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

function PageSkeleton() {
  return (
    <PrepKpiCard hover={false} className="overflow-hidden p-0">
      <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex gap-4 px-4 py-3 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(j => (
              <div key={j} className="h-4 flex-1 rounded" style={{ background: "rgba(255,255,255,0.06)" }} />
            ))}
          </div>
        ))}
      </div>
    </PrepKpiCard>
  );
}

export function PrepHistoriquePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search,  setSearch]    = useState("");
  const [filter,  setFilter]    = useState("all");

  const fetchSessions = useCallback(() => {
    setLoading(true);
    (clubApi.getSessions() as Promise<Session[]>)
      .then(setSessions)
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const filtered = sessions.filter(s => {
    const matchSearch = capitalize(s.type).toLowerCase().includes(search.toLowerCase())
      || s.date.includes(search)
      || s.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || s.status === filter;
    return matchSearch && matchFilter;
  });

  function exportCsv() {
    downloadCsv(
      "historique-seances.csv",
      ["Date", "Type", "Durée", "Intensité", "Joueurs", "Statut"],
      filtered.map(s => [s.date, capitalize(s.type), s.duration, s.intensity, String(s.playerCount), s.status])
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
          { value: "all",      label: "Tous statuts" },
          { value: "Terminé",  label: "Terminé"      },
          { value: "Planifié", label: "Planifié"      },
          { value: "Annulé",   label: "Annulé"        },
        ]}
        onExportCsv={exportCsv}
        placeholder="Rechercher séance..."
      />

      {loading ? (
        <PageSkeleton />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "rgba(255,255,255,0.04)" }}>
            <History size={22} style={{ color: "var(--text-muted)" }} />
          </div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {sessions.length === 0 ? "Aucune séance en base — créez-en depuis Gestion Séances" : "Aucune séance trouvée"}
          </p>
        </div>
      ) : (
        <PrepKpiCard hover={false} className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  {["Date", "Type", "Durée", "Intensité", "Joueurs", "Statut"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => {
                  const statusColor = STATUS_COLORS[s.status] ?? "#94A3B8";
                  const intStyle    = intensityStyle(s.intensity);
                  return (
                    <motion.tr key={s.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="transition-colors hover:bg-white/[0.04]"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                      <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>
                        {new Date(s.date).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                        {capitalize(s.type)}
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{s.duration}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{ background: intStyle.bg, color: intStyle.color }}>
                          {s.intensity}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                        {s.playerCount} joueurs
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={{ background: `${statusColor}20`, color: statusColor }}>
                          {s.status}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </PrepKpiCard>
      )}
    </PrepPageTransition>
  );
}
