import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { financeApi } from "../../lib/api/finance";

const F = { primary: "#FF7A00", success: "#22C55E", danger: "#EF4444", info: "#3B82F6", warning: "#F59E0B" };

const CATEGORY_COLORS: Record<string, string> = {
  Joueurs: F.info,
  Contrats: F.primary,
  Factures: F.warning,
  Sponsors: F.success,
};

export function FinanceGlobalSearch() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [data, setData] = useState<{ category: string; path: string; items: string[] }[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await financeApi.getSearchIndex();
      setData(res.categories);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && data.length === 0) void load();
  }, [open, data.length, load]);

  const results = query.trim()
    ? data
        .map((cat) => ({
          ...cat,
          items: cat.items.filter((i) => i.toLowerCase().includes(query.toLowerCase())),
        }))
        .filter((cat) => cat.items.length > 0)
    : data;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative hidden sm:block">
      <motion.div
        className="flex cursor-text items-center gap-2 rounded-xl border px-3 py-2"
        style={{
          background: "rgba(255,255,255,0.04)",
          borderColor: open ? "rgba(255,122,0,0.45)" : "rgba(255,255,255,0.08)",
          minWidth: open ? 280 : 220,
          transition: "min-width 0.2s ease",
        }}
        onClick={() => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        whileHover={{ borderColor: "rgba(255,122,0,0.3)" }}
      >
        <Search size={13} style={{ color: open ? F.primary : "rgba(255,255,255,0.35)" }} />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Joueurs, contrats, factures, spor..."
          className="flex-1 bg-transparent text-xs outline-none"
          style={{ color: "var(--text-primary)" }}
        />
        {query && (
          <button type="button" onClick={(e) => { e.stopPropagation(); setQuery(""); }}>
            <X size={12} style={{ color: "var(--text-muted)" }} />
          </button>
        )}
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            className="absolute right-0 top-full z-50 mt-2 w-[340px] overflow-hidden rounded-[18px] border shadow-2xl"
            style={{
              background: "var(--surface-panel-solid)",
              borderColor: "var(--surface-panel-border)",
            }}
          >
            <div className="max-h-[320px] overflow-y-auto p-2">
              {loading ? (
                <p className="px-3 py-6 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                  Recherche...
                </p>
              ) : results.length === 0 ? (
                <p className="px-3 py-6 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                  {query.trim() ? "Aucun résultat." : "Aucune donnée financière."}
                </p>
              ) : (
                results.map((cat) => (
                  <div key={cat.category} className="mb-2">
                    <p
                      className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider"
                      style={{ color: CATEGORY_COLORS[cat.category] ?? F.primary }}
                    >
                      {cat.category}
                    </p>
                    {cat.items.slice(0, 6).map((item) => (
                      <motion.button
                        key={item}
                        type="button"
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[10px]"
                        style={{ color: "var(--text-secondary)" }}
                        whileHover={{ background: "rgba(255,255,255,0.04)" }}
                        onClick={() => {
                          navigate(cat.path);
                          setOpen(false);
                          setQuery("");
                        }}
                      >
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ background: CATEGORY_COLORS[cat.category] ?? F.primary }}
                        />
                        <span className="truncate">{item}</span>
                      </motion.button>
                    ))}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
