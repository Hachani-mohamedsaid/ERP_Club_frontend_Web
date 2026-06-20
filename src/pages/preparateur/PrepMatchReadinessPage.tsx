import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Users } from "lucide-react";
import { PrepPageTransition } from "../../components/preparateur/PrepPageTransition";
import { PrepKpiCard } from "../../components/preparateur/PrepKpiCard";
import { PrepToolbar, downloadCsv } from "../../components/preparateur/PrepToolbar";
import { MATCH_READINESS, getRiskColor } from "../../data/preparateurData";
import { CountUpStat } from "../../components/player/CountUpStat";

export function PrepMatchReadinessPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = MATCH_READINESS.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || (filter === "ready" ? p.ready : !p.ready);
    return matchSearch && matchFilter;
  });

  const readyCount = MATCH_READINESS.filter((p) => p.ready).length;

  function exportCsv() {
    downloadCsv(
      "disponibilite-match.csv",
      ["Joueur", "Fitness", "Fatigue", "Risque", "Ready"],
      filtered.map((p) => [p.name, String(p.fitness), String(p.fatigue), String(p.risk), p.ready ? "Oui" : "Non"])
    );
  }

  return (
    <PrepPageTransition>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <PrepKpiCard delay={0}>
          <div className="flex items-center gap-2">
            <Users size={16} style={{ color: "#6366F1" }} />
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Effectif analysé</span>
          </div>
          <p className="mt-2 text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
            <CountUpStat end={MATCH_READINESS.length} />
          </p>
        </PrepKpiCard>
        <PrepKpiCard delay={0.05}>
          <div className="flex items-center gap-2">
            <CheckCircle size={16} style={{ color: "#22C55E" }} />
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Prêts match</span>
          </div>
          <p className="mt-2 text-3xl font-bold" style={{ color: "#22C55E" }}>
            <CountUpStat end={readyCount} />
          </p>
        </PrepKpiCard>
        <PrepKpiCard delay={0.1}>
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Non disponibles</span>
          <p className="mt-2 text-3xl font-bold" style={{ color: "#EF4444" }}>
            <CountUpStat end={MATCH_READINESS.length - readyCount} />
          </p>
        </PrepKpiCard>
        <PrepKpiCard delay={0.15}>
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Taux disponibilité</span>
          <p className="mt-2 text-3xl font-bold" style={{ color: "#6366F1" }}>
            <CountUpStat end={Math.round((readyCount / MATCH_READINESS.length) * 100)} suffix="%" />
          </p>
        </PrepKpiCard>
      </div>

      <PrepToolbar
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
        filterOptions={[
          { value: "all", label: "Tous" },
          { value: "ready", label: "Prêts ✅" },
          { value: "not-ready", label: "Non prêts ❌" },
        ]}
        onExportCsv={exportCsv}
        placeholder="Rechercher joueur..."
      />

      <PrepKpiCard hover={false} className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {["Joueur", "Fitness", "Fatigue", "Risque", "Ready"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const riskColor = getRiskColor(p.risk);
                return (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="transition-colors hover:bg-white/[0.04]"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>{p.name}</td>
                    <td className="px-4 py-3 font-bold" style={{ color: p.fitness >= 80 ? "#22C55E" : "#F59E0B" }}>{p.fitness}</td>
                    <td className="px-4 py-3" style={{ color: p.fatigue >= 70 ? "#EF4444" : "var(--text-secondary)" }}>{p.fatigue}</td>
                    <td className="px-4 py-3 font-bold" style={{ color: riskColor }}>{p.risk}</td>
                    <td className="px-4 py-3">
                      {p.ready ? (
                        <span className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color: "#22C55E" }}>
                          <CheckCircle size={16} /> ✅
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color: "#EF4444" }}>
                          <XCircle size={16} /> ❌
                        </span>
                      )}
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
