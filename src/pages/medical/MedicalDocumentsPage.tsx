import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Upload, Download, Trash2, Eye, FileText, Loader2, X, Save } from "lucide-react";
import { GlassCard } from "../../components/ui/GlassCard";
import { Button } from "../../components/ui/Button";
import { clubApi } from "../../lib/api/club";
import { apiFetch } from "../../lib/api/authHeaders";
import { parseApiError } from "../../lib/api/config";
import { type MedicalDocument } from "../../data/medicalMockData";

type DocType = MedicalDocument["type"];

interface ApiPlayer {
  id: string;
  fullName: string;
}

interface DisplayDocument {
  id: string;
  playerId: string;
  player: string;
  name: string;
  type: DocType;
  date: string;
  size: string;
}

const TYPE_ICONS: Record<DocType, string> = {
  IRM: "🧲",
  Scanner: "🔬",
  Radio: "📡",
  Certificat: "📋",
  Analyse: "🧪",
};

const TYPE_COLORS: Record<DocType, string> = {
  IRM: "#3a7bd5",
  Scanner: "#8b5cf6",
  Radio: "#d99a1f",
  Certificat: "#2e9e5b",
  Analyse: "#06b6d4",
};

const UPLOAD_TYPES: DocType[] = ["IRM", "Scanner", "Radio", "Certificat", "Analyse"];

function normalizePlayers(raw: unknown): ApiPlayer[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, i) => {
    const row = item as Record<string, unknown>;
    return {
      id: String(row.id ?? `player-${i}`),
      fullName: String(row.fullName ?? row.name ?? ""),
    };
  });
}

function mapDocType(docType: string): DocType {
  const lower = docType.trim().toLowerCase();
  if (lower.includes("irm")) return "IRM";
  if (lower.includes("scanner")) return "Scanner";
  if (lower.includes("radio")) return "Radio";
  if (lower.includes("analyse")) return "Analyse";
  if (lower.includes("médical") || lower.includes("medical")) return "Certificat";
  if (lower.includes("personnel")) return "Certificat";
  return "Certificat";
}

function mapDocument(raw: Record<string, unknown>, player: ApiPlayer): DisplayDocument {
  return {
    id: String(raw.id ?? ""),
    playerId: player.id,
    player: player.fullName,
    name: String(raw.name ?? ""),
    type: mapDocType(String(raw.docType ?? "")),
    date: String(raw.docDate ?? "—"),
    size: String(raw.size ?? "—"),
  };
}

async function fetchPlayerDocuments(player: ApiPlayer): Promise<DisplayDocument[]> {
  const res = await apiFetch(`/club/players/${player.id}/documents`);
  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error(await parseApiError(res));
  }
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((item) => mapDocument(item as Record<string, unknown>, player));
}

function UploadDocumentModal({
  players,
  onClose,
  onSubmit,
}: {
  players: ApiPlayer[];
  onClose: () => void;
  onSubmit: (values: {
    playerId: string;
    name: string;
    docType: DocType;
    docDate: string;
  }) => Promise<void>;
}) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    playerId: players[0]?.id ?? "",
    name: "",
    docType: "IRM" as DocType,
    docDate: today,
  });
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.playerId || !form.name.trim()) {
      setSubmitError("Joueur et nom du document sont requis.");
      return;
    }
    setSaving(true);
    setSubmitError(null);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Erreur lors de l'upload.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="glass-panel w-full max-w-md p-6"
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>
            Upload document
          </h2>
          <button type="button" onClick={onClose} className="rounded-xl p-2 hover:bg-white/10">
            <X size={18} style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Joueur
            </label>
            <select
              value={form.playerId}
              onChange={(e) => setForm((prev) => ({ ...prev, playerId: e.target.value }))}
              className="glass-input w-full px-4 py-2.5 text-sm"
            >
              <option value="">Sélectionner un joueur…</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>{p.fullName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Nom du document
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="IRM Genou droit"
              className="glass-input w-full px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Type
            </label>
            <select
              value={form.docType}
              onChange={(e) => setForm((prev) => ({ ...prev, docType: e.target.value as DocType }))}
              className="glass-input w-full px-4 py-2.5 text-sm"
            >
              {UPLOAD_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Date
            </label>
            <input
              type="date"
              value={form.docDate}
              onChange={(e) => setForm((prev) => ({ ...prev, docDate: e.target.value }))}
              className="glass-input w-full px-4 py-2.5 text-sm"
            />
          </div>

          {submitError ? (
            <p className="text-sm" style={{ color: "var(--color-state-danger)" }}>{submitError}</p>
          ) : null}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <><Save size={14} /> Enregistrer</>}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export function MedicalDocumentsPage() {
  const [documents, setDocuments] = useState<DisplayDocument[]>([]);
  const [players, setPlayers] = useState<ApiPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("Tous");
  const [showUpload, setShowUpload] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const types = ["Tous", "IRM", "Scanner", "Radio", "Certificat", "Analyse"];

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const playersRes = await clubApi.getPlayers();
      const normalizedPlayers = normalizePlayers(playersRes);
      setPlayers(normalizedPlayers);

      const results = await Promise.all(
        normalizedPlayers.map((player) => fetchPlayerDocuments(player)),
      );
      setDocuments(results.flat());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const filtered = filter === "Tous"
    ? documents
    : documents.filter((d) => d.type === filter);

  async function handleUpload(values: {
    playerId: string;
    name: string;
    docType: DocType;
    docDate: string;
  }) {
    const res = await apiFetch(`/club/players/${values.playerId}/documents`, {
      method: "POST",
      body: JSON.stringify({
        name: values.name.trim(),
        docType: values.docType,
        docDate: values.docDate,
        size: "—",
      }),
    });
    if (!res.ok) throw new Error(await parseApiError(res));
    await loadDocuments();
  }

  async function handleDelete(docId: string) {
    setDeletingId(docId);
    try {
      const res = await apiFetch(`/club/documents/${docId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await parseApiError(res));
      setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erreur lors de la suppression.");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 size={24} className="animate-spin" style={{ color: "var(--accent)" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm" style={{ color: "var(--color-state-danger)" }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {types.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilter(t)}
              className="rounded-full px-4 py-2 text-sm font-medium transition-colors"
              style={{
                background: filter === t ? "var(--accent)" : "rgba(var(--accent-rgb), 0.1)",
                color: filter === t ? "white" : "var(--text-secondary)",
              }}
            >
              {t}
            </button>
          ))}
        </div>
        <Button onClick={() => setShowUpload(true)}>
          <Upload size={16} /> Upload document
        </Button>
      </div>

      {documents.length === 0 ? (
        <GlassCard raised className="flex min-h-[240px] items-center justify-center p-6">
          <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
            Aucun document médical. Uploadez le premier document.
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((doc) => {
            const docColor = TYPE_COLORS[doc.type] ?? TYPE_COLORS.Certificat;
            const docIcon = TYPE_ICONS[doc.type] ?? TYPE_ICONS.Certificat;
            return (
            <GlassCard key={doc.id} raised className="group overflow-hidden p-0">
              <div
                className="flex h-32 items-center justify-center text-4xl leading-none"
                style={{ background: `${docColor}15` }}
              >
                <span className="select-none" aria-hidden="true">{docIcon}</span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{doc.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{doc.player}</p>
                  </div>
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                    style={{ background: `${docColor}22`, color: docColor }}
                  >
                    {doc.type}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                  <FileText size={11} /> {doc.date} • {doc.size}
                </div>
                <div className="mt-4 flex gap-2 opacity-80 transition-opacity group-hover:opacity-100">
                  <button type="button" className="flex flex-1 items-center justify-center gap-1 rounded-[var(--radius-odin-md)] py-2 text-xs font-medium transition-colors hover:bg-white/5" style={{ color: "var(--color-state-info)" }}>
                    <Eye size={12} /> Preview
                  </button>
                  <button type="button" className="flex flex-1 items-center justify-center gap-1 rounded-[var(--radius-odin-md)] py-2 text-xs font-medium transition-colors hover:bg-white/5" style={{ color: "var(--color-state-success)" }}>
                    <Download size={12} /> Download
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(doc.id)}
                    disabled={deletingId === doc.id}
                    className="flex items-center justify-center rounded-[var(--radius-odin-md)] px-2 py-2 text-xs transition-colors hover:bg-white/5"
                    style={{ color: "var(--color-state-danger)" }}
                  >
                    {deletingId === doc.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  </button>
                </div>
              </div>
            </GlassCard>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showUpload ? (
          <UploadDocumentModal
            players={players}
            onClose={() => setShowUpload(false)}
            onSubmit={handleUpload}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
