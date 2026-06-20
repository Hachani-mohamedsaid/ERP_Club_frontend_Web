import { motion } from "framer-motion";
import { Upload, Download, Eye, FileText } from "lucide-react";
import { GlassCard } from "../../components/ui/GlassCard";
import { Button } from "../../components/ui/Button";
import { SQUAD_PLAYERS } from "../../data/joueurMockData";

const DOCUMENTS = [
  { id: "1", player: "Ahmed Ben Salah", name: "Contrat_2024.pdf", type: "Contrat", date: "01/01/2024", size: "1.2 MB" },
  { id: "2", player: "Ahmed Ben Salah", name: "Certificat_Medical.pdf", type: "Médical", date: "15/06/2026", size: "890 KB" },
  { id: "3", player: "Ali Ben Youssef", name: "Contrat_2023.pdf", type: "Contrat", date: "01/07/2023", size: "1.1 MB" },
  { id: "4", player: "Karim Sassi", name: "Passeport_Scan.pdf", type: "Identité", date: "10/01/2026", size: "2.4 MB" },
  { id: "5", player: "Yassine Brahmi", name: "Image_Droits.pdf", type: "Commercial", date: "05/03/2026", size: "650 KB" },
];

const TYPE_COLORS: Record<string, string> = {
  Contrat: "#3a7bd5", Médical: "#c0392b", Identité: "#2e9e5b", Commercial: "#d99a1f",
};

export function JoueurDocumentsPage() {
  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="flex justify-end">
        <Button><Upload size={16} /> Upload document</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DOCUMENTS.map((doc, i) => (
          <motion.div key={doc.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ scale: 1.02 }}>
            <GlassCard raised className="p-5">
              <div className="flex items-start justify-between">
                <FileText size={24} style={{ color: TYPE_COLORS[doc.type] ?? "var(--accent)" }} />
                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: `${TYPE_COLORS[doc.type]}22`, color: TYPE_COLORS[doc.type] }}>
                  {doc.type}
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{doc.name}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{doc.player} • {doc.date}</p>
              <div className="mt-4 flex gap-2">
                <button type="button" className="flex flex-1 items-center justify-center gap-1 rounded-[var(--radius-odin-md)] py-2 text-xs" style={{ color: "var(--color-state-info)" }}>
                  <Eye size={12} /> Preview
                </button>
                <button type="button" className="flex flex-1 items-center justify-center gap-1 rounded-[var(--radius-odin-md)] py-2 text-xs" style={{ color: "var(--color-state-success)" }}>
                  <Download size={12} /> Download
                </button>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
