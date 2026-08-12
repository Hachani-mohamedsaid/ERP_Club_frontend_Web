import { useCallback, useEffect, useState, type ComponentType, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Upload, Download, Trash2, Eye, FileText, Loader2, X, Save,
  Scan, ScanLine, Bone, FileBadge, FlaskConical, FolderOpen,
  Calendar, User,
} from "lucide-react";
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

const C = {
  slate: "#64748b",
  ice: "#38bdf8",
  sky: "#7dd3fc",
  white: "#f8fafc",
  muted: "#94a3b8",
  border: "rgba(100, 116, 139, 0.4)",
} as const;

const TYPE_ICONS: Record<DocType, ComponentType<{ size?: number; style?: CSSProperties }>> = {
  IRM: Scan,
  Scanner: ScanLine,
  Radio: Bone,
  Certificat: FileBadge,
  Analyse: FlaskConical,
};

const TYPE_COLORS: Record<DocType, string> = {
  IRM: "#38bdf8",
  Scanner: "#64748b",
  Radio: "#d99a1f",
  Certificat: "#2e9e5b",
  Analyse: "#06b6d4",
};

const PRIMARY_FILTERS: DocType[] = ["IRM", "Scanner"];
const SECONDARY_FILTERS = ["Tous", "Radio", "Certificat", "Analyse"] as const;

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
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | "all">("all");
  const [showUpload, setShowUpload] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const displayed = documents.filter((doc) => {
    const matchesType = filter === "Tous" || doc.type === filter;
    const matchesPlayer =
      selectedPlayerId === "all" || doc.playerId === selectedPlayerId;
    return matchesType && matchesPlayer;
  });

  async function handleDownload(doc: DisplayDocument) {
    try {
      const token = localStorage.getItem("odin_token");
      const baseUrl =
        import.meta.env.VITE_API_URL ?? "https://erp-club-backend.onrender.com";

      const res = await fetch(`${baseUrl}/club/documents/${doc.id}/file`, {
        headers: {
          Authorization: `Bearer ${token ?? ""}`,
        },
      });

      if (!res.ok) throw new Error(`Erreur ${res.status}`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.warn("Download failed:", err);
      alert("Impossible de télécharger ce document.");
    }
  }

  async function handlePreview(doc: DisplayDocument) {
    try {
      const token = localStorage.getItem("odin_token");
      const baseUrl =
        import.meta.env.VITE_API_URL ?? "https://erp-club-backend.onrender.com";

      const res = await fetch(`${baseUrl}/club/documents/${doc.id}/file`, {
        headers: {
          Authorization: `Bearer ${token ?? ""}`,
        },
      });

      if (!res.ok) throw new Error();

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch {
      alert("Impossible d'afficher ce document.");
    }
  }

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
        <Loader2 size={24} className="animate-spin" style={{ color: C.ice }} />
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

  const irmCount = documents.filter((d) => d.type === "IRM").length;
  const scannerCount = documents.filter((d) => d.type === "Scanner").length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1
            className="text-xl font-bold tracking-tight"
            style={{ color: C.white }}
          >
            Archives médicales
          </h1>
          <p className="mt-1 text-sm" style={{ color: C.slate }}>
            {displayed.length} document{displayed.length !== 1 ? "s" : ""}
            {filter !== "Tous" ? ` · ${filter}` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
          style={{ background: C.ice, color: "#0f172a" }}
        >
          <Upload size={16} /> Upload document
        </button>
      </div>

      {/* Selective top: IRM + Scanner */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PRIMARY_FILTERS.map((t) => {
          const active = filter === t;
          const color = TYPE_COLORS[t];
          const Icon = TYPE_ICONS[t];
          const count = t === "IRM" ? irmCount : scannerCount;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setFilter(active ? "Tous" : t)}
              className="flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors"
              style={{
                borderColor: active ? `${color}66` : C.border,
                background: active ? `${color}18` : "rgba(100,116,139,0.08)",
                borderTop: `2px solid ${color}`,
              }}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{
                  background: `${color}22`,
                  color,
                  border: `1px solid ${color}40`,
                }}
              >
                <Icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold" style={{ color: active ? color : C.white }}>
                  {t}
                </p>
                <p className="text-xs" style={{ color: C.muted }}>
                  {count} document{count !== 1 ? "s" : ""} · filtre rapide
                </p>
              </div>
              <span
                className="rounded-md px-2 py-0.5 text-[10px] font-bold tabular-nums"
                style={{ background: `${color}22`, color }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Secondary filters */}
      <div className="flex flex-wrap gap-2">
        {SECONDARY_FILTERS.map((t) => {
          const active = filter === t;
          const typeColor = t === "Tous" ? C.ice : (TYPE_COLORS[t as DocType] ?? C.ice);
          return (
            <button
              key={t}
              type="button"
              onClick={() => setFilter(t)}
              className="rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors"
              style={{
                background: active ? `${typeColor}22` : "rgba(100,116,139,0.1)",
                color: active ? typeColor : C.muted,
                border: `1px solid ${active ? `${typeColor}55` : C.border}`,
              }}
            >
              {t}
            </button>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--text-muted)",
          }}
        >
          Joueur:
        </span>

        <button
          type="button"
          onClick={() => setSelectedPlayerId("all")}
          style={{
            padding: "5px 14px",
            borderRadius: 99,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            border: "none",
            background:
              selectedPlayerId === "all" ? "var(--accent)" : "rgba(255,255,255,0.06)",
            color: selectedPlayerId === "all" ? "white" : "var(--text-muted)",
          }}
        >
          Tous
        </button>

        {players.map((p) => {
          const count = documents.filter((d) => d.playerId === p.id).length;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPlayerId(p.id)}
              style={{
                padding: "5px 14px",
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                border: "none",
                background:
                  selectedPlayerId === p.id ? "var(--accent)" : "rgba(255,255,255,0.06)",
                color: selectedPlayerId === p.id ? "white" : "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "rgba(255,122,0,0.20)",
                  color: "var(--accent)",
                  fontSize: 9,
                  fontWeight: 800,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {p.fullName.slice(0, 2).toUpperCase()}
              </span>
              {p.fullName} ({count})
            </button>
          );
        })}
      </div>

      {documents.length === 0 ? (
        <GlassCard
          raised
          className="flex min-h-[240px] flex-col items-center justify-center gap-3 p-8"
          style={{ borderColor: C.border, borderTop: `2px solid ${C.ice}` }}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{
              background: `${C.ice}18`,
              border: `1px solid ${C.ice}35`,
            }}
          >
            <FolderOpen size={22} style={{ color: C.ice }} />
          </div>
          <p className="text-sm font-medium" style={{ color: C.muted }}>
            Aucun document médical. Uploadez le premier document.
          </p>
        </GlassCard>
      ) : displayed.length === 0 ? (
        <GlassCard
          raised
          className="flex min-h-[160px] items-center justify-center p-6"
          style={{ borderColor: C.border }}
        >
          <p className="text-sm font-medium" style={{ color: C.muted }}>
            Aucun document pour ce filtre.
          </p>
        </GlassCard>
      ) : (
        <GlassCard
          raised
          className="overflow-hidden p-0"
          style={{ borderColor: C.border, borderTop: `2px solid ${C.ice}` }}
        >
          <div
            className="hidden grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_110px_110px_90px_140px] gap-3 border-b px-4 py-3 text-[10px] font-bold uppercase tracking-wider md:grid"
            style={{
              borderColor: C.border,
              color: C.slate,
              background: "rgba(56,189,248,0.04)",
            }}
          >
            <span>Document</span>
            <span>Joueur</span>
            <span>Type</span>
            <span>Date</span>
            <span>Taille</span>
            <span className="text-right">Actions</span>
          </div>

          <div>
            {displayed.map((doc, i) => {
              const docColor = TYPE_COLORS[doc.type] ?? TYPE_COLORS.Certificat;
              const DocIcon = TYPE_ICONS[doc.type] ?? FileText;
              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.2) }}
                  className="group grid grid-cols-1 gap-3 border-b px-4 py-3.5 transition-colors md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_110px_110px_90px_140px] md:items-center md:gap-3"
                  style={{
                    borderLeft: `3px solid ${docColor}`,
                    borderBottomColor: "rgba(100,116,139,0.25)",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(56,189,248,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        background: `${docColor}18`,
                        border: `1px solid ${docColor}35`,
                      }}
                    >
                      <DocIcon size={16} style={{ color: docColor }} />
                    </div>
                    <div className="min-w-0">
                      <p
                        className="truncate text-sm font-semibold"
                        style={{ color: C.white }}
                        title={doc.name}
                      >
                        {doc.name || "Document sans nom"}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] md:hidden" style={{ color: C.muted }}>
                        <User size={10} /> {doc.player || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="hidden min-w-0 md:block">
                    <p className="truncate text-sm" style={{ color: C.muted }}>
                      {doc.player || "—"}
                    </p>
                  </div>

                  <div>
                    <span
                      className="inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                      style={{
                        background: `${docColor}18`,
                        color: docColor,
                        border: `1px solid ${docColor}40`,
                      }}
                    >
                      {doc.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs" style={{ color: C.muted }}>
                    <Calendar size={11} className="shrink-0 opacity-70" />
                    <span>{doc.date}</span>
                  </div>

                  <div className="text-xs" style={{ color: C.muted }}>
                    {doc.size}
                  </div>

                  <div className="flex items-center justify-start gap-1 md:justify-end">
                    <button
                      type="button"
                      title="Aperçu"
                      onClick={() => handlePreview(doc)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/5"
                      style={{ color: C.ice }}
                      aria-label="Aperçu"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      type="button"
                      title="Télécharger"
                      onClick={() => handleDownload(doc)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/5"
                      style={{ color: "#2e9e5b" }}
                      aria-label="Télécharger"
                    >
                      <Download size={14} />
                    </button>
                    <button
                      type="button"
                      title="Supprimer"
                      onClick={() => handleDelete(doc.id)}
                      disabled={deletingId === doc.id}
                      className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/5 disabled:opacity-50"
                      style={{ color: "var(--color-state-danger)" }}
                    >
                      {deletingId === doc.id
                        ? <Loader2 size={14} className="animate-spin" />
                        : <Trash2 size={14} />}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </GlassCard>
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
