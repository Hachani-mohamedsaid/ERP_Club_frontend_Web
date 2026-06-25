import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Download, Eye, FileText, X, CheckCircle } from "lucide-react";
import { GlassCard } from "../../components/ui/GlassCard";
import { Button } from "../../components/ui/Button";
import { useCurrentPlayer } from "../../hooks/useCurrentPlayer";

const TYPE_COLORS: Record<string, string> = {
  Contrat: "#3a7bd5",
  Médical: "#c0392b",
  Identité: "#2e9e5b",
  Commercial: "#d99a1f",
  Personnel: "#8b5cf6",
};

interface DocEntry {
  id: string;
  player: string;
  name: string;
  type: string;
  date: string;
  size: string;
  dataUrl?: string;
}

function downloadMockFile(doc: DocEntry) {
  const content = doc.dataUrl
    ? doc.dataUrl
    : `Document FC Carthage\nFichier: ${doc.name}\nJoueur: ${doc.player}\nDate: ${doc.date}\nType: ${doc.type}\n\nGénéré le ${new Date().toLocaleString("fr-TN")}.\nCe document est confidentiel.`;
  const isDataUrl = content.startsWith("data:");
  if (isDataUrl) {
    const a = document.createElement("a");
    a.href = content;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else {
    const blob = new Blob([content], { type: "text/plain; charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.name.replace(/\s+/g, "_");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export function JoueurDocumentsPage() {
  const { player } = useCurrentPlayer();
  const playerName = player?.name ?? "Joueur";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocEntry | null>(null);

  const [docs, setDocs] = useState<DocEntry[]>([
    { id: "1", player: playerName, name: "Contrat_2024.pdf", type: "Contrat", date: "01/01/2024", size: "1.2 MB" },
    { id: "2", player: playerName, name: "Certificat_Medical.pdf", type: "Médical", date: "15/06/2026", size: "890 KB" },
    { id: "3", player: "Ali Ben Youssef", name: "Contrat_2023.pdf", type: "Contrat", date: "01/07/2023", size: "1.1 MB" },
    { id: "4", player: "Karim Sassi", name: "Passeport_Scan.pdf", type: "Identité", date: "10/01/2026", size: "2.4 MB" },
    { id: "5", player: "Yassine Brahmi", name: "Image_Droits.pdf", type: "Commercial", date: "05/03/2026", size: "650 KB" },
  ]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }

  function handleUpload(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const kb = Math.round(file.size / 1024);
      const size = kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
      const newDoc: DocEntry = {
        id: String(Date.now()),
        player: playerName,
        name: file.name,
        type: "Personnel",
        date: new Date().toLocaleDateString("fr-TN"),
        size,
        dataUrl,
      };
      setDocs((prev) => [newDoc, ...prev]);
      showToast(`"${file.name}" ajouté avec succès`);
    };
    reader.readAsDataURL(file);
  }

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
          e.target.value = "";
        }}
      />

      <div className="flex justify-end">
        <Button onClick={() => fileInputRef.current?.click()}>
          <Upload size={16} className="mr-2" />
          Upload document
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {docs.map((doc, i) => (
          <motion.div key={doc.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ scale: 1.02 }}>
            <GlassCard raised className="p-5">
              <div className="flex items-start justify-between">
                <FileText size={24} style={{ color: TYPE_COLORS[doc.type] ?? "var(--accent)" }} />
                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: `${TYPE_COLORS[doc.type] ?? "var(--accent)"}22`, color: TYPE_COLORS[doc.type] ?? "var(--accent)" }}>
                  {doc.type}
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{doc.name}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{doc.player} • {doc.date}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{doc.size}</p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewDoc(doc)}
                  className="flex flex-1 items-center justify-center gap-1 rounded-[var(--radius-odin-md)] py-2 text-xs font-medium transition-all hover:opacity-80 active:scale-95"
                  style={{ color: "var(--color-state-info)", background: "rgba(59,130,246,0.08)" }}
                >
                  <Eye size={12} /> Preview
                </button>
                <button
                  type="button"
                  onClick={() => { downloadMockFile(doc); showToast(`Téléchargement de "${doc.name}" lancé`); }}
                  className="flex flex-1 items-center justify-center gap-1 rounded-[var(--radius-odin-md)] py-2 text-xs font-medium transition-all hover:opacity-80 active:scale-95"
                  style={{ color: "var(--color-state-success)", background: "rgba(34,197,94,0.08)" }}
                >
                  <Download size={12} /> Download
                </button>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Preview modal */}
      <AnimatePresence>
        {previewDoc && (
          <motion.div
            key="preview-modal"
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.8)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewDoc(null)}
          >
            <motion.div
              className="w-full max-w-lg rounded-2xl p-6"
              style={{ background: "#141B2D", border: `1px solid ${TYPE_COLORS[previewDoc.type] ?? "var(--accent)"}44` }}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText size={22} style={{ color: TYPE_COLORS[previewDoc.type] ?? "var(--accent)" }} />
                  <div>
                    <p className="font-bold" style={{ color: "var(--text-primary)" }}>{previewDoc.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{previewDoc.player} • {previewDoc.date} • {previewDoc.size}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setPreviewDoc(null)} className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.08)", color: "var(--text-muted)" }}>
                  <X size={16} />
                </button>
              </div>

              {previewDoc.dataUrl?.startsWith("data:image") ? (
                <img src={previewDoc.dataUrl} alt={previewDoc.name} className="max-h-80 w-full rounded-xl object-contain" style={{ background: "rgba(255,255,255,0.04)" }} />
              ) : (
                <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)" }}>
                  <FileText size={40} style={{ color: TYPE_COLORS[previewDoc.type] ?? "var(--accent)", opacity: 0.6 }} />
                  <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Aperçu — {previewDoc.type}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Document confidentiel FC Carthage</p>
                </div>
              )}

              <button
                type="button"
                onClick={() => { downloadMockFile(previewDoc); showToast(`Téléchargement de "${previewDoc.name}" lancé`); setPreviewDoc(null); }}
                className="mt-4 w-full rounded-xl py-2.5 text-sm font-semibold transition-all hover:opacity-80"
                style={{ background: "#FF6B57", color: "white" }}
              >
                <Download size={14} className="mr-2 inline" />
                Télécharger
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="doc-toast"
            className="fixed bottom-6 right-6 z-[210] flex items-center gap-3 rounded-2xl px-5 py-3 shadow-xl"
            style={{ background: "#141B2D", border: "1px solid rgba(34,197,94,0.4)", color: "#22C55E" }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
          >
            <CheckCircle size={18} />
            <span className="text-sm font-semibold">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
