import { Search, FileDown, FileSpreadsheet, Filter } from "lucide-react";

interface PrepToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  filter?: string;
  onFilterChange?: (v: string) => void;
  filterOptions?: { value: string; label: string }[];
  onExportCsv?: () => void;
  onExportPdf?: () => void;
  placeholder?: string;
}

export function PrepToolbar({
  search, onSearchChange, filter, onFilterChange, filterOptions,
  onExportCsv, onExportPdf, placeholder = "Rechercher...",
}: PrepToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[200px] flex-1 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm"
          style={{ background: "rgba(15,29,58,0.8)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
        />
      </div>
      {filterOptions && onFilterChange && (
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <select
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="appearance-none rounded-xl border py-2.5 pl-9 pr-8 text-sm"
            style={{ background: "rgba(15,29,58,0.8)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
          >
            {filterOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      )}
      {onExportCsv && (
        <button type="button" onClick={onExportCsv} className="flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium hover:bg-white/5" style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-secondary)" }}>
          <FileSpreadsheet size={14} /> Excel
        </button>
      )}
      {onExportPdf && (
        <button type="button" onClick={onExportPdf} className="flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium hover:bg-white/5" style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-secondary)" }}>
          <FileDown size={14} /> PDF
        </button>
      )}
    </div>
  );
}

export function downloadCsv(filename: string, headers: string[], rows: string[][]) {
  const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadTextReport(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
