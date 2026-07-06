import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Download, Eye, FileText, X, CheckCircle, Trash2, FilePlus } from "lucide-react";
import { GlassCard } from "../../components/ui/GlassCard";
import { Button } from "../../components/ui/Button";
import { useCurrentPlayer } from "../../hooks/useCurrentPlayer";
import { useJoueurBackendData, type BackendDocument } from "../../hooks/useJoueurBackendData";
import { clubApi } from "../../lib/api/club";
import jsPDF from "jspdf";

const TYPE_COLORS: Record<string, string> = {
  Contrat: "#3a7bd5",
  Médical: "#c0392b",
  Identité: "#2e9e5b",
  Commercial: "#d99a1f",
  Personnel: "#8b5cf6",
};

interface DocWithData extends BackendDocument {
  dataUrl?: string;
}

function generatePDF(doc: BackendDocument, playerName: string, clubName = "—"): void {
  const pdf = new jsPDF();
  pdf.setFontSize(18);
  pdf.setTextColor(40, 40, 40);
  pdf.text(`${clubName} — Document Officiel`, 20, 20);
  pdf.setFontSize(12);
  pdf.setTextColor(80, 80, 80);
  pdf.line(20, 25, 190, 25);
  pdf.text(`Nom du fichier : ${doc.name}`, 20, 38);
  pdf.text(`Joueur        : ${playerName}`, 20, 48);
  pdf.text(`Type          : ${doc.docType}`, 20, 58);
  pdf.text(`Date          : ${doc.docDate}`, 20, 68);
  pdf.text(`Taille        : ${doc.size}`, 20, 78);
  pdf.setFontSize(10);
  pdf.setTextColor(120, 120, 120);
  pdf.text(`Généré le : ${new Date().toLocaleString("fr-TN")}`, 20, 90);
  pdf.line(20, 95, 190, 95);
  pdf.setFontSize(9);
  pdf.text(`Ce document est confidentiel et réservé à l'usage interne de ${clubName}.`, 20, 102);
  pdf.save(doc.name.replace(/\s+/g, "_").replace(/\.pdf$/i, "") + ".pdf");
}

export function JoueurDocumentsPage() {
  const { player } = useCurrentPlayer();
  const { documents, myPlayerId, refetchDocuments, orgProfile } = useJoueurBackendData();
  const playerName = player?.name ?? "Joueur";
  const clubName = orgProfile?.clubName ?? "—";

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocWithData | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedDocType, setSelectedDocType] = useState("Personnel");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }

  async function handleUpload(file: File) {
    if (!myPlayerId) { showToast("Joueur non identifié"); return; }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      const kb = Math.round(file.size / 1024);
      const size = kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
      try {
        await clubApi.createDocument(myPlayerId, {
          name: file.name,
          docType: selectedDocType,
          docDate: new Date().toLocaleDateString("fr-TN"),
          size,
          fileData: dataUrl,
        });
        await refetchDocuments();
        showToast(`"${file.name}" ajouté avec succès`);
      } catch {
        showToast("Erreur lors de l'upload");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleDelete(docId: string) {
    setDeleting(docId);
    try {
      await clubApi.deleteDocument(docId);
      await refetchDocuments();
      showToast("Document supprimé");
    } catch {
      showToast("Erreur lors de la suppression");
    } finally {
      setDeleting(null);
    }
  }

  async function handlePreview(doc: BackendDocument) {
    try {
      const full = await clubApi.getDocumentFile(doc.id) as { fileData?: string } & BackendDocument;
      setPreviewDoc({ ...doc, dataUrl: full.fileData ?? undefined });
    } catch {
      setPreviewDoc(doc);
    }
  }

  async function handleDownload(doc: BackendDocument) {
    try {
      const full = await clubApi.getDocumentFile(doc.id) as { fileData?: string } & BackendDocument;
      if (full.fileData && full.fileData.startsWith("data:")) {
        const a = document.createElement("a");
        a.href = full.fileData;
        a.download = doc.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        generatePDF(doc, playerName, clubName);
      }
    } catch {
      generatePDF(doc, playerName, clubName);
    }
    showToast(`Téléchargement de "${doc.name}" lancé`);
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>{documents.length} document(s)</p>
        <div className="flex items-center gap-2">
          <select
            value={selectedDocType}
            onChange={(e) => setSelectedDocType(e.target.value)}
            className="glass-input py-2 px-3 text-sm rounded-xl"
            style={{ minWidth: 120 }}
          >
            {Object.keys(TYPE_COLORS).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? (
              <span className="flex items-center gap-2"><FilePlus size={16} className="animate-pulse" /> Envoi…</span>
            ) : (
              <span className="flex items-center gap-2"><Upload size={16} /> Upload document</span>
            )}
          </Button>
        </div>
      </div>

      {documents.length === 0 ? (
        <GlassCard raised className="p-10 text-center">
          <FileText size={40} style={{ color: "var(--text-muted)", opacity: 0.4, margin: "0 auto" }} />
          <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>Aucun document disponible</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Cliquez sur "Upload document" pour ajouter</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc, i) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.02 }}
            >
              <GlassCard raised className="p-5">
                <div className="flex items-start justify-between">
                  <FileText size={24} style={{ color: TYPE_COLORS[doc.docType] ?? "var(--accent)" }} />
                  <div className="flex items-center gap-1">
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: `${TYPE_COLORS[doc.docType] ?? "var(--accent)"}22`, color: TYPE_COLORS[doc.docType] ?? "var(--accent)" }}>
                      {doc.docType}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(doc.id)}
                      disabled={deleting === doc.id}
                      className="ml-1 flex h-6 w-6 items-center justify-center rounded-full opacity-40 hover:opacity-100 transition-opacity"
                      style={{ color: "#EF4444" }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{doc.name}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{playerName} • {doc.docDate}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{doc.size}</p>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handlePreview(doc)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-[var(--radius-odin-md)] py-2 text-xs font-medium transition-all hover:opacity-80 active:scale-95"
                    style={{ color: "var(--color-state-info)", background: "rgba(59,130,246,0.08)" }}
                  >
                    <Eye size={12} /> Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload(doc)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-[var(--radius-odin-md)] py-2 text-xs font-medium transition-all hover:opacity-80 active:scale-95"
                    style={{ color: "var(--color-state-success)", background: "rgba(34,197,94,0.08)" }}
                  >
                    <Download size={12} /> PDF
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

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
              style={{ background: "var(--surface-panel-solid)", border: `1px solid ${TYPE_COLORS[previewDoc.docType] ?? "var(--accent)"}44` }}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText size={22} style={{ color: TYPE_COLORS[previewDoc.docType] ?? "var(--accent)" }} />
                  <div>
                    <p className="font-bold" style={{ color: "var(--text-primary)" }}>{previewDoc.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{playerName} • {previewDoc.docDate} • {previewDoc.size}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setPreviewDoc(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ background: "var(--surface-input)", color: "var(--text-muted)" }}>
                  <X size={16} />
                </button>
              </div>

              {previewDoc.dataUrl?.startsWith("data:image") ? (
                <img src={previewDoc.dataUrl} alt={previewDoc.name} className="max-h-80 w-full rounded-xl object-contain"
                  style={{ background: "var(--surface-input)" }} />
              ) : (
                <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-xl"
                  style={{ background: "var(--surface-input)", border: "1px dashed var(--surface-panel-border)" }}>
                  <FileText size={40} style={{ color: TYPE_COLORS[previewDoc.docType] ?? "var(--accent)", opacity: 0.6 }} />
                  <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Aperçu — {previewDoc.docType}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Document confidentiel {clubName}</p>
                </div>
              )}

              <button
                type="button"
                onClick={() => { handleDownload(previewDoc); setPreviewDoc(null); }}
                className="mt-4 w-full rounded-xl py-2.5 text-sm font-semibold transition-all hover:opacity-80"
                style={{ background: "#FF6B57", color: "white" }}
              >
                <Download size={14} className="mr-2 inline" />
                Télécharger PDF
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
            style={{ background: "var(--surface-panel-solid)", border: "1px solid rgba(34,197,94,0.4)", color: "#22C55E" }}
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
