import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Upload, Download, Trash2, Eye, Search, FileCheck, Stethoscope, IdCard, X, Save } from "lucide-react";
import { RPage, RHeader, RSection, RRow, RPills, RBtn, RKpiCard, RSearch, pageVariants, cardVariants } from "../../components/responsable";
import { responsableApi } from "../../lib/api/responsable";
import { useClubResource } from "../../hooks/useClubResource";

type DocCategory = "Contrats PDF" | "Rapports PDF" | "Documents médicaux" | "Licences joueurs";

interface Doc {
  id: string;
  name: string;
  category: DocCategory;
  player?: string;
  size: string;
  date: string;
  status: "Valide" | "Expiré" | "En révision";
  fileUrl?: string | null;
}

const CAT_COLOR: Record<DocCategory, string> = {
  "Contrats PDF":         "#FF7A00",
  "Rapports PDF":         "#3B82F6",
  "Documents médicaux":   "#EF4444",
  "Licences joueurs":     "#22C55E",
};

const CAT_ICON: Record<DocCategory, typeof FileText> = {
  "Contrats PDF":       FileText,
  "Rapports PDF":       FileCheck,
  "Documents médicaux": Stethoscope,
  "Licences joueurs":   IdCard,
};

const STATUS_COLOR: Record<string, string> = {
  Valide:       "#22C55E",
  Expiré:       "#EF4444",
  "En révision":"#FF7A00",
};

const CATEGORIES: DocCategory[] = ["Contrats PDF", "Rapports PDF", "Documents médicaux", "Licences joueurs"];
const FILTER_OPTIONS = ["Tous", ...CATEGORIES];

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function DocumentImportModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (values: {
    name: string;
    category: DocCategory;
    playerName: string;
    status: Doc["status"];
    fileUrl: string | null;
    sizeLabel: string;
  }) => Promise<void>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: "",
    category: "Contrats PDF" as DocCategory,
    playerName: "",
    status: "Valide" as Doc["status"],
  });
  const [fileMeta, setFileMeta] = useState<{ name: string; sizeLabel: string; dataUrl: string | null } | null>(null);
  const [saving, setSaving] = useState(false);

  async function onFileChange(file: File | null) {
    if (!file) {
      setFileMeta(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Fichier trop volumineux (max 5 Mo).");
      return;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Lecture du fichier impossible."));
      reader.readAsDataURL(file);
    });
    setFileMeta({ name: file.name, sizeLabel: formatFileSize(file.size), dataUrl });
    setForm((f) => ({ ...f, name: f.name || file.name.replace(/\.[^.]+$/, "") }));
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md rounded-[24px] border p-6"
        style={{ background: "rgba(10,16,30,0.97)", borderColor: "rgba(255,122,0,0.3)" }}
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Importer un document</h2>
          <button type="button" onClick={onClose} className="rounded-xl p-2 hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Fichier PDF</label>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-6 text-sm"
              style={{ borderColor: "rgba(255,122,0,0.4)", color: "var(--text-muted)" }}
            >
              <Upload size={16} />
              {fileMeta ? `${fileMeta.name} (${fileMeta.sizeLabel})` : "Choisir un fichier PDF"}
            </button>
          </div>
          <div>
            <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Nom du document</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-primary)" }}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Catégorie</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as DocCategory }))}
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
              style={{ background: "rgba(30,35,50,0.97)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-primary)" }}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Joueur (optionnel)</label>
            <input
              value={form.playerName}
              onChange={(e) => setForm((f) => ({ ...f, playerName: e.target.value }))}
              placeholder="Ex: wahbi kharsri"
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-primary)" }}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Statut</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Doc["status"] }))}
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
              style={{ background: "rgba(30,35,50,0.97)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-primary)" }}
            >
              {(["Valide", "En révision", "Expiré"] as const).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <RBtn
            disabled={saving}
            onClick={async () => {
              if (!form.name.trim()) {
                alert("Le nom du document est requis.");
                return;
              }
              setSaving(true);
              try {
                await onSubmit({
                  name: form.name.trim(),
                  category: form.category,
                  playerName: form.playerName.trim(),
                  status: form.status,
                  fileUrl: fileMeta?.dataUrl ?? null,
                  sizeLabel: fileMeta?.sizeLabel ?? "—",
                });
                onClose();
              } catch (err) {
                alert(err instanceof Error ? err.message : "Erreur");
              } finally {
                setSaving(false);
              }
            }}
          >
            <Save size={14} /> {saving ? "Import…" : "Importer"}
          </RBtn>
          <RBtn onClick={onClose} variant="ghost">Annuler</RBtn>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function DocumentsPage() {
  const { data: docs, loading, reload } = useClubResource(
    () => responsableApi.getDocuments() as Promise<Doc[]>,
  );

  const [filter, setFilter] = useState("Tous");
  const [search, setSearch] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const allDocs = docs ?? [];

  const filtered = useMemo(
    () => allDocs.filter(d => {
      const matchCat = filter === "Tous" || d.category === filter;
      const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
        (d.player ?? "").toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    }),
    [allDocs, filter, search]
  );

  async function deleteDoc(id: string) {
    if (!confirm("Supprimer ce document ?")) return;
    try {
      await responsableApi.deleteDocument(id);
      await reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  }

  function openDocument(fileUrl?: string | null) {
    if (!fileUrl) {
      alert("Aucun fichier associé à ce document.");
      return;
    }
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  }

  function downloadDocument(doc: Doc & { fileUrl?: string | null }) {
    if (!doc.fileUrl) {
      alert("Aucun fichier associé à ce document.");
      return;
    }
    const a = document.createElement("a");
    a.href = doc.fileUrl;
    a.download = doc.name.endsWith(".pdf") ? doc.name : `${doc.name}.pdf`;
    a.click();
  }

  if (loading) {
    return (
      <RPage>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement des documents…</p>
      </RPage>
    );
  }

  return (
    <RPage>
      <RHeader
        title="Gestion Documents"
        subtitle="Contrats PDF, rapports, documents médicaux et licences joueurs."
        badge="DOCUMENT_VIEW"
        action={
          <RBtn onClick={() => setShowImport(true)}>
            <Upload size={14} /> Importer document
          </RBtn>
        }
      />

      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-xl border px-4 py-3 text-sm font-medium"
          style={{ background: "rgba(34,197,94,0.12)", borderColor: "rgba(34,197,94,0.35)", color: "#22C55E" }}
        >
          {toast}
        </motion.div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {CATEGORIES.map(cat => {
          const catDocs = allDocs.filter(d => d.category === cat);
          const Icon = CAT_ICON[cat];
          const color = CAT_COLOR[cat];
          const expired = catDocs.filter(d => d.status === "Expiré").length;
          return (
            <RKpiCard key={cat} label={cat} value={String(catDocs.length)} icon={Icon} color={color}
              trend={expired > 0 ? `${expired} expiré${expired > 1 ? "s" : ""}` : "Tous valides"} />
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <RSearch value={search} onChange={setSearch} placeholder="Rechercher document, joueur..." />
        </div>
      </div>
      <RPills options={FILTER_OPTIONS} value={filter} onChange={setFilter} />

      <RSection title="Documents" subtitle={`${filtered.length} fichier${filtered.length > 1 ? "s" : ""}`}>
        <AnimatePresence mode="wait">
          <motion.div key={filter + search} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {filtered.map((d, i) => {
              const Icon = CAT_ICON[d.category];
              const color = CAT_COLOR[d.category];
              return (
                <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  exit={{ opacity: 0 }}>
                  <RRow>
                    <div className="flex items-start gap-3">
                      <motion.div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: `${color}15` }}
                        animate={d.status === "Expiré" ? { boxShadow: ["0 0 0px #EF444400", "0 0 12px #EF444460", "0 0 0px #EF444400"] } : {}}
                        transition={{ duration: 1.8, repeat: Infinity }}>
                        <Icon size={15} style={{ color }} />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{d.name}</p>
                            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                              {d.player && (
                                <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{d.player}</span>
                              )}
                              <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{d.size}</span>
                              <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{d.date}</span>
                            </div>
                          </div>
                          <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                            style={{ background: `${STATUS_COLOR[d.status]}18`, color: STATUS_COLOR[d.status] }}>
                            {d.status}
                          </span>
                        </div>
                        <div className="mt-2 flex gap-1.5">
                          <RBtn variant="ghost" onClick={() => openDocument(d.fileUrl)}>
                            <Eye size={11} /> Voir
                          </RBtn>
                          <RBtn variant="ghost" onClick={() => downloadDocument(d)}>
                            <Download size={11} /> Télécharger
                          </RBtn>
                          <RBtn onClick={() => deleteDoc(d.id)} variant="danger"><Trash2 size={11} /></RBtn>
                        </div>
                      </div>
                    </div>
                  </RRow>
                </motion.div>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-2 py-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                <FileText size={28} className="mx-auto mb-2 opacity-30" />
                Aucun document trouvé
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </RSection>

      <AnimatePresence>
        {showImport && (
          <DocumentImportModal
            onClose={() => setShowImport(false)}
            onSubmit={async (v) => {
              await responsableApi.createDocument({
                name: v.name,
                category: v.category,
                playerName: v.playerName || undefined,
                status: v.status,
                fileUrl: v.fileUrl || undefined,
                sizeLabel: v.sizeLabel,
              });
              await reload();
              setToast(`Document « ${v.name} » importé avec succès.`);
              window.setTimeout(() => setToast(null), 3500);
            }}
          />
        )}
      </AnimatePresence>
    </RPage>
  );
}
