import { useState } from "react";
import { motion } from "framer-motion";
import { PrepPageTransition } from "../../components/preparateur/PrepPageTransition";
import { PrepKpiCard } from "../../components/preparateur/PrepKpiCard";
import { PrepToolbar, downloadCsv } from "../../components/preparateur/PrepToolbar";
import { SESSION_HISTORY } from "../../data/preparateurData";

const STATUS_COLORS: Record<string, string> = {
  Terminé: "#22C55E",
  Annulé: "#EF4444",
  Planifié: "#6366F1",
};

export function PrepHistoriquePage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = SESSION_HISTORY.filter((s) => {
    const matchSearch = s.type.toLowerCase().includes(search.toLowerCase()) || s.date.includes(search);
    const matchFilter = filter === "all" || s.status === filter;
    return matchSearch && matchFilter;
  });

  function exportCsv() {
    downloadCsv(
      "historique-seances.csv",
      ["Date", "Type", "Durée", "Intensité", "Joueurs", "Statut"],
      filtered.map((s) => [s.date, s.type, s.duration, s.intensity, String(s.players), s.status])
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
          { value: "Terminé", label: "Terminé" },
          { value: "Planifié", label: "Planifié" },
          { value: "Annulé", label: "Annulé" },
        ]}
        onExportCsv={exportCsv}
        placeholder="Rechercher séance..."
      />

      <PrepKpiCard hover={false} className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {["Date", "Type", "Durée", "Intensité", "Joueurs", "Statut"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => {
                const color = STATUS_COLORS[s.status];
                return (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="transition-colors hover:bg-white/[0.04]"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>{s.date}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{s.type}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{s.duration}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{
                        background: s.intensity === "Haute" || s.intensity === "Max" ? "rgba(239,68,68,0.15)" : s.intensity === "Moyenne" ? "rgba(245,158,11,0.15)" : "rgba(34,197,94,0.15)",
                        color: s.intensity === "Haute" || s.intensity === "Max" ? "#EF4444" : s.intensity === "Moyenne" ? "#F59E0B" : "#22C55E",
                      }}>
                        {s.intensity}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{s.players} joueurs</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: `${color}20`, color }}>
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
    </PrepPageTransition>
  );
}
