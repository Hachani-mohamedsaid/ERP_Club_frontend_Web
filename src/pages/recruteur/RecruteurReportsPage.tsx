import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, FileSpreadsheet, Presentation, Star, Handshake, Wallet, Trophy, Download, Loader2, Check, X } from "lucide-react";
import { RecruteurPageTransition } from "../../components/recruteur/RecruteurPageTransition";
import { RecruteurKpiCard } from "../../components/recruteur/RecruteurKpiCard";
import { REPORT_TEMPLATES } from "../../data/recruteurData";
import { recruteurApi } from "../../lib/api/recruteur";

const TPL_ICONS: Record<string, typeof Star> = { star: Star, handshake: Handshake, wallet: Wallet, trophy: Trophy };

const FORMATS = [
  { id: "pdf", label: "PDF", icon: FileText, color: "#EF4444" },
  { id: "excel", label: "Excel", icon: FileSpreadsheet, color: "#22C55E" },
  { id: "ppt", label: "PowerPoint", icon: Presentation, color: "#F59E0B" },
];

export function RecruteurReportsPage() {
  const [selected, setSelected] = useState(REPORT_TEMPLATES[0].id);
  const [exporting, setExporting] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ title: string; content: string; format: string } | null>(null);

  async function exportAs(fmt: string) {
    setExporting(fmt);
    setDone(null);
    setError(null);
    try {
      const res = await recruteurApi.generateReport(selected, fmt);
      setPreview({ title: res.title, content: res.content, format: res.format });
      setDone(fmt);

      const blob = new Blob([res.content], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${res.title.replace(/\s+/g, "_")}.${fmt === "excel" ? "csv.md" : fmt === "ppt" ? "md" : "md"}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur génération rapport IA.");
    } finally {
      setExporting(null);
      setTimeout(() => setDone(null), 2500);
    }
  }

  return (
    <RecruteurPageTransition>
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Modèles de rapports</h3>
          {REPORT_TEMPLATES.map((tpl, i) => {
            const Icon = TPL_ICONS[tpl.icon] ?? FileText;
            return (
              <motion.button
                key={tpl.id}
                type="button"
                onClick={() => setSelected(tpl.id)}
                className="flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors"
                style={{
                  background: selected === tpl.id ? "rgba(139,92,246,0.12)" : "rgba(15,29,58,0.7)",
                  borderColor: selected === tpl.id ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.05)",
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ x: 3 }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: "rgba(139,92,246,0.15)", color: "#A855F7" }}><Icon size={20} /></div>
                <div className="flex-1">
                  <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{tpl.title}</div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>{tpl.desc}</div>
                </div>
                {selected === tpl.id && <Check size={18} style={{ color: "#A855F7" }} />}
              </motion.button>
            );
          })}

          {preview && (
            <RecruteurKpiCard className="mt-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{preview.title}</h4>
                <button type="button" onClick={() => setPreview(null)} style={{ color: "var(--text-muted)" }}>
                  <X size={16} />
                </button>
              </div>
              <pre className="max-h-80 overflow-y-auto whitespace-pre-wrap text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {preview.content}
              </pre>
            </RecruteurKpiCard>
          )}
        </div>

        <RecruteurKpiCard glow hover={false} className="h-fit">
          <div className="flex items-center gap-2">
            <Download size={16} style={{ color: "#8B5CF6" }} />
            <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Exporter</h3>
          </div>
          <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
            Génération IA à partir des données recrutement en base.
          </p>
          <div className="mt-4 space-y-2.5">
            {FORMATS.map((f) => {
              const Icon = f.icon;
              const isExp = exporting === f.id;
              const isDone = done === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  disabled={!!exporting}
                  onClick={() => exportAs(f.id)}
                  className="flex w-full items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-white/5 disabled:opacity-60"
                  style={{ background: "rgba(255,255,255,0.03)", borderColor: `${f.color}30` }}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `${f.color}1f`, color: f.color }}><Icon size={17} /></div>
                  <span className="flex-1 text-left text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Générer {f.label} (IA)</span>
                  {isExp ? <Loader2 size={16} className="animate-spin" style={{ color: f.color }} /> : isDone ? <Check size={16} style={{ color: "#22C55E" }} /> : <Download size={15} style={{ color: "var(--text-muted)" }} />}
                </button>
              );
            })}
          </div>
          <AnimatePresence>
            {done && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 rounded-xl p-2.5 text-center text-xs font-semibold" style={{ background: "rgba(34,197,94,0.12)", color: "#22C55E" }}>
                Rapport IA généré et téléchargé ✓
              </motion.div>
            )}
          </AnimatePresence>
        </RecruteurKpiCard>
      </div>
    </RecruteurPageTransition>
  );
}
