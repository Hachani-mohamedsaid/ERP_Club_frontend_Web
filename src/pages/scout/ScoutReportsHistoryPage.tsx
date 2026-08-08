import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FileText, Eye, Download, Calendar, User } from "lucide-react";
import { ScoutPage, SCard, SBadge } from "../../components/scout/ScoutUI";
import { ScoutPlayerPhoto, resolveScoutPhotoUrl } from "../../components/scout/ScoutPlayerPhoto";
import { S } from "../../data/scoutData";
import { scoutApi, type ScoutReportDto } from "../../lib/api/scout";
import { useScoutProspects } from "../../hooks/useScoutData";
import { showToast } from "../../components/scout/ScoutToast";

const DECISION_LABEL: Record<string, { label: string; color: string }> = {
  recruit: { label: "Recruter", color: S.success },
  observe: { label: "Observer", color: "#F59E0B" },
  shortlist: { label: "Shortlist", color: S.info },
  refuse: { label: "Refuser", color: S.danger },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ScoutReportsHistoryPage() {
  const navigate = useNavigate();
  const { prospects } = useScoutProspects();
  const [reports, setReports] = useState<ScoutReportDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ScoutReportDto | null>(null);

  useEffect(() => {
    scoutApi
      .getReports()
      .then(setReports)
      .catch(() => showToast("Impossible de charger les rapports", "error"))
      .finally(() => setLoading(false));
  }, []);

  const exportPdf = (r: ScoutReportDto) => {
    const lines = [
      `RAPPORT SCOUT — ${r.prospectName}`,
      `Scout: ${r.scoutName}`,
      `Date: ${r.matchDate ?? "—"} · Match: ${r.matchObserved ?? "—"}`,
      `Adversaire: ${r.opponent ?? "—"}`,
      "",
      `Technique ${r.technique} · Physique ${r.physique} · Mental ${r.mental}`,
      `Tactique ${r.tactique} · Vitesse ${r.vitesse}`,
      r.aiScore ? `Score IA: ${r.aiScore}/100` : "",
      "",
      `Points forts: ${r.strengths ?? "—"}`,
      `Points faibles: ${r.weaknesses ?? "—"}`,
      `Recommandation: ${r.recommendation ?? "—"}`,
      `Décision: ${r.decision}`,
    ].filter(Boolean);

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapport-${r.prospectName.replace(/\s+/g, "-").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Export téléchargé", "success");
  };

  return (
    <ScoutPage>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>
            Historique des rapports
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Bibliothèque de tous les rapports d&apos;observation soumis
          </p>
        </div>
        <motion.button
          type="button"
          onClick={() => navigate("/scout/report")}
          className="rounded-xl px-4 py-2 text-sm font-bold text-white"
          style={{ background: `linear-gradient(135deg,${S.primary},${S.primary}cc)` }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          + Nouveau rapport
        </motion.button>
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement...</p>
      ) : reports.length === 0 ? (
        <SCard className="!p-8 text-center">
          <FileText size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Aucun rapport</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Créez votre premier rapport depuis la page Rapport Scout
          </p>
        </SCard>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
          <div className="space-y-2">
            {reports.map((r) => {
              const dec = DECISION_LABEL[r.decision] ?? { label: r.decision, color: S.info };
              return (
                <motion.button
                  key={r.id}
                  type="button"
                  onClick={() => setSelected(r)}
                  className="flex w-full items-center gap-4 rounded-[18px] border p-4 text-left"
                  style={{
                    background: selected?.id === r.id ? `${S.primary}08` : "rgba(12,9,30,0.85)",
                    borderColor: selected?.id === r.id ? `${S.primary}40` : "rgba(255,255,255,0.07)",
                  }}
                  whileHover={{ y: -1 }}
                >
                  <ScoutPlayerPhoto
                    name={r.prospectName}
                    photoUrl={resolveScoutPhotoUrl(r.prospectName, undefined, prospects)}
                    size={40}
                    accent={S.primary}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>
                      {r.prospectName}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {formatDate(r.createdAt)} · {r.scoutName}
                    </p>
                  </div>
                  {r.aiScore != null && (
                    <span className="text-lg font-extrabold" style={{ color: S.primary }}>{r.aiScore}</span>
                  )}
                  <SBadge color={dec.color} bg={`${dec.color}15`}>{dec.label}</SBadge>
                </motion.button>
              );
            })}
          </div>

          {selected && (
            <SCard className="!p-5 sticky top-4 h-fit">
              <p className="text-xs font-bold mb-3" style={{ color: "var(--text-primary)" }}>Détail du rapport</p>
              <ScoutPlayerPhoto
                name={selected.prospectName}
                photoUrl={resolveScoutPhotoUrl(selected.prospectName, undefined, prospects)}
                size={56}
                accent={S.accent}
                className="mb-3"
              />
              <p className="text-base font-extrabold mb-1" style={{ color: "var(--text-primary)" }}>{selected.prospectName}</p>
              <p className="text-[10px] mb-4 flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                <User size={10} /> {selected.scoutName} · <Calendar size={10} /> {formatDate(selected.createdAt)}
              </p>

              <div className="grid grid-cols-5 gap-2 mb-4">
                {[
                  ["Tech.", selected.technique],
                  ["Phys.", selected.physique],
                  ["Ment.", selected.mental],
                  ["Tact.", selected.tactique],
                  ["Vit.", selected.vitesse],
                ].map(([label, val]) => (
                  <div key={String(label)} className="rounded-xl border p-2 text-center"
                    style={{ borderColor: "var(--surface-panel-border)" }}>
                    <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>{label}</p>
                    <p className="text-sm font-extrabold" style={{ color: S.primary }}>{val}</p>
                  </div>
                ))}
              </div>

              {selected.strengths && (
                <div className="mb-3">
                  <p className="text-[10px] font-bold uppercase mb-1" style={{ color: "var(--text-muted)" }}>Points forts</p>
                  <p className="text-xs" style={{ color: "var(--text-primary)" }}>{selected.strengths}</p>
                </div>
              )}
              {selected.weaknesses && (
                <div className="mb-3">
                  <p className="text-[10px] font-bold uppercase mb-1" style={{ color: "var(--text-muted)" }}>Points faibles</p>
                  <p className="text-xs" style={{ color: "var(--text-primary)" }}>{selected.weaknesses}</p>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                {selected.prospectId && (
                  <motion.button
                    type="button"
                    onClick={() => navigate(`/scout/prospect/${selected.prospectId}`)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold"
                    style={{ background: `${S.info}15`, color: S.info, border: `1px solid ${S.info}30` }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Eye size={12} /> Voir profil
                  </motion.button>
                )}
                <motion.button
                  type="button"
                  onClick={() => exportPdf(selected)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold text-white"
                  style={{ background: S.success }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Download size={12} /> Exporter
                </motion.button>
              </div>
            </SCard>
          )}
        </div>
      )}
    </ScoutPage>
  );
}
