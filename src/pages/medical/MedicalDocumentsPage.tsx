import { useState } from "react";
import { Upload, Download, Trash2, Eye, FileText } from "lucide-react";
import { GlassCard } from "../../components/ui/GlassCard";
import { Button } from "../../components/ui/Button";
import { MEDICAL_DOCUMENTS, type MedicalDocument } from "../../data/medicalMockData";

const TYPE_ICONS: Record<MedicalDocument["type"], string> = {
  IRM: "🧲",
  Scanner: "🔬",
  Radio: "📡",
  Certificat: "📋",
  Analyse: "🧪",
};

const TYPE_COLORS: Record<MedicalDocument["type"], string> = {
  IRM: "#3a7bd5",
  Scanner: "#8b5cf6",
  Radio: "#d99a1f",
  Certificat: "#2e9e5b",
  Analyse: "#06b6d4",
};

export function MedicalDocumentsPage() {
  const [filter, setFilter] = useState<string>("Tous");
  const types = ["Tous", "IRM", "Scanner", "Radio", "Certificat", "Analyse"];

  const filtered = filter === "Tous"
    ? MEDICAL_DOCUMENTS
    : MEDICAL_DOCUMENTS.filter((d) => d.type === filter);

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
        <Button><Upload size={16} /> Upload document</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((doc) => (
          <GlassCard key={doc.id} raised className="group overflow-hidden p-0">
            <div
              className="flex h-32 items-center justify-center text-4xl"
              style={{ background: `${TYPE_COLORS[doc.type]}15` }}
            >
              {TYPE_ICONS[doc.type]}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{doc.name}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{doc.player}</p>
                </div>
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                  style={{ background: `${TYPE_COLORS[doc.type]}22`, color: TYPE_COLORS[doc.type] }}
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
                <button type="button" className="flex items-center justify-center rounded-[var(--radius-odin-md)] px-2 py-2 text-xs transition-colors hover:bg-white/5" style={{ color: "var(--color-state-danger)" }}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
