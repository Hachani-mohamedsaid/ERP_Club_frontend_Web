import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Send, Stethoscope } from "lucide-react";
import { PrepPageTransition } from "../../components/preparateur/PrepPageTransition";
import { PrepKpiCard } from "../../components/preparateur/PrepKpiCard";
import { PrepToolbar, downloadCsv, downloadTextReport } from "../../components/preparateur/PrepToolbar";
import { ClubHeatInjuryMap } from "../../components/club/ClubHeatInjuryMap";
import { PlayerAvatar } from "../../components/player/PlayerAvatar";
import { INJURY_RISKS, getRiskColor, getPlayerDetail } from "../../data/preparateurData";
import { PrepPlayerDrawer } from "../../components/preparateur/PrepPlayerDrawer";
import { CLUB_BODY_ZONES } from "../../data/clubHeatInjuryData";

export function PrepRisquePage() {
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const drawerPlayer = drawerId ? getPlayerDetail(drawerId) ?? null : null;

  const filtered = INJURY_RISKS.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) || r.zone.toLowerCase().includes(search.toLowerCase())
  );

  function sendRecommendation(entry: typeof INJURY_RISKS[0]) {
    setToast(`Recommandation envoyée au coach — ${entry.name}`);
    setTimeout(() => setToast(null), 2500);
  }

  function exportCsv() {
    downloadCsv(
      "risques-blessures.csv",
      ["Joueur", "Zone", "Risque %", "Recommandations"],
      filtered.map((r) => [r.name, r.zone, String(r.risk), r.recommendation.join("; ")])
    );
  }

  function exportPdf() {
    const content = filtered.map((r) =>
      `${r.name}\nZone: ${r.zone}\nRisque: ${r.risk}%\nRecommandations:\n${r.recommendation.map((x) => `  - ${x}`).join("\n")}\n`
    ).join("\n---\n");
    downloadTextReport("rapport-risques.txt", `RAPPORT RISQUES BLESSURES — FC Carthage\n${"=".repeat(40)}\n\n${content}`);
  }

  return (
    <PrepPageTransition>
      <PrepToolbar search={search} onSearchChange={setSearch} onExportCsv={exportCsv} onExportPdf={exportPdf} placeholder="Rechercher joueur ou zone..." />

      <PrepKpiCard hover={false}>
        <ClubHeatInjuryMap zones={CLUB_BODY_ZONES} />
      </PrepKpiCard>

      <PrepKpiCard hover={false} delay={0.1}>
        <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Liste Risques</h3>
        <div className="space-y-3">
          {filtered.map((entry, i) => {
            const color = getRiskColor(entry.risk);
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="cursor-pointer rounded-xl border p-4 transition-colors hover:bg-white/[0.02]"
                style={{ borderColor: `${color}30`, background: `${color}08` }}
                onClick={() => setDrawerId(entry.id)}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <PlayerAvatar name={entry.name} size={44} />
                    <div>
                      <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{entry.name}</p>
                      <p className="text-sm" style={{ color: color }}>{entry.zone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Sparkles size={14} style={{ color }} />
                      <span className="text-2xl font-bold" style={{ color }}>{entry.risk}%</span>
                    </div>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Risk IA</p>
                  </div>
                </div>
                <div className="mt-3 rounded-lg border px-3 py-2" style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
                  <p className="mb-1 text-[10px] font-semibold uppercase" style={{ color: "var(--text-muted)" }}>Recommandation IA</p>
                  <ul className="space-y-1">
                    {entry.recommendation.map((rec) => (
                      <li key={rec} className="text-xs" style={{ color: "var(--text-secondary)" }}>• {rec}</li>
                    ))}
                  </ul>
                </div>
                {entry.medicalComment && (
                  <div className="mt-3 rounded-lg border px-3 py-2.5" style={{ borderColor: "rgba(245,158,11,0.25)", background: "rgba(245,158,11,0.06)" }}>
                    <div className="mb-1 flex items-center gap-1.5">
                      <Stethoscope size={12} style={{ color: "#F59E0B" }} />
                      <p className="text-[10px] font-semibold uppercase" style={{ color: "#F59E0B" }}>
                        Commentaire Médecin{entry.medicalAuthor ? ` — ${entry.medicalAuthor}` : ""}
                      </p>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{entry.medicalComment}</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); sendRecommendation(entry); }}
                  className="mt-3 flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium"
                  style={{ background: "rgba(255,107,87,0.15)", color: "#FF6B57" }}
                >
                  <Send size={12} /> Envoyer au coach
                </button>
              </motion.div>
            );
          })}
        </div>
      </PrepKpiCard>

      <PrepPlayerDrawer player={drawerPlayer} open={!!drawerId} onClose={() => setDrawerId(null)} />

      {toast && (
        <motion.div initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} className="fixed bottom-6 right-6 z-50 rounded-xl border px-4 py-3 text-sm" style={{ background: "#0F1D3A", borderColor: "rgba(255,107,87,0.3)", color: "#FF6B57" }}>
          {toast}
        </motion.div>
      )}
    </PrepPageTransition>
  );
}
