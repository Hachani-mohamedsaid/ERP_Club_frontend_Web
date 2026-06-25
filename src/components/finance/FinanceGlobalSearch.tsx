import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const F = { primary: "#FF7A00", success: "#22C55E", danger: "#EF4444", info: "#3B82F6", warning: "#F59E0B" };

const FINANCE_SEARCH_DATA = [
  {
    category: "Joueurs", color: F.info, path: "/finance/salaires",
    items: [
      "Mohamed Diallo — Défenseur — 95 000 DT/mois",
      "Youssef Ben Ali — Attaquant — 85 000 DT/mois",
      "Nader Trabelsi — Milieu — 78 000 DT/mois",
      "Ibrahim Touré — Milieu — 72 000 DT/mois",
      "Karim Mansour — Défenseur — 62 000 DT/mois",
    ],
  },
  {
    category: "Contrats", color: F.primary, path: "/finance/contrats",
    items: [
      "Contrat Youssef Ben Ali — Expire dans 9 jours ⚠",
      "Contrat Rami Makhlouf — Expire dans 71 jours",
      "Contrat Ibrahim Touré — Expire dans 101 jours",
      "Contrat Mohamed Diallo — Actif · 31/12/2026",
    ],
  },
  {
    category: "Factures", color: F.warning, path: "/finance/factures",
    items: [
      "FAC-004 — Assurance Joueurs — 25 000 DT — Retard",
      "FAC-003 — Transport Club — 12 000 DT — En attente",
      "FAC-005 — Fournitures Médicales — 6 500 DT — En attente",
      "FAC-001 — Équipement Sport Plus — 15 000 DT — Payée",
    ],
  },
  {
    category: "Sponsors", color: F.success, path: "/finance/sponsors",
    items: [
      "Nike — 450 000 DT/an — Actif · 2027",
      "Emirates — 350 000 DT/an — Actif · 2026",
      "Ooredoo — 280 000 DT/an — Expire bientôt ⚠",
      "STEG — 200 000 DT/an — Expire bientôt",
    ],
  },
];

export function FinanceGlobalSearch() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = query.trim()
    ? FINANCE_SEARCH_DATA
        .map(cat => ({ ...cat, items: cat.items.filter(i => i.toLowerCase().includes(query.toLowerCase())) }))
        .filter(cat => cat.items.length > 0)
    : FINANCE_SEARCH_DATA;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "f") { e.preventDefault(); setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => { document.removeEventListener("mousedown", handleClick); document.removeEventListener("keydown", handleKey); };
  }, []);

  return (
    <div ref={containerRef} className="relative hidden sm:block">
      <motion.div
        className="flex cursor-text items-center gap-2 rounded-xl border px-3 py-2"
        style={{
          background: "rgba(255,255,255,0.04)",
          borderColor: open ? "rgba(255,122,0,0.45)" : "rgba(255,255,255,0.08)",
          boxShadow: open ? "0 0 0 2px rgba(255,122,0,0.1)" : "none",
        }}
        animate={{ width: open ? 300 : 230 }}
        transition={{ duration: 0.22 }}
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}>
        <Search size={13} style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Joueurs, contrats, factures, sponsors…"
          className="w-full bg-transparent text-xs outline-none"
          style={{ color: "var(--text-primary)" }} />
        {query && (
          <button type="button" onClick={e => { e.stopPropagation(); setQuery(""); }}>
            <X size={12} style={{ color: "rgba(255,255,255,0.35)" }} />
          </button>
        )}
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute left-0 top-full z-50 mt-2 w-96 overflow-hidden rounded-[22px] border shadow-2xl"
            style={{
              background: "rgba(8,6,24,0.98)",
              borderColor: "rgba(255,122,0,0.15)",
              backdropFilter: "blur(24px)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 40px rgba(255,122,0,0.05)",
            }}>

            <div className="border-b px-4 py-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
                {query ? `Résultats pour "${query}"` : "Recherche Finance — Joueurs · Contrats · Factures · Sponsors"}
              </p>
            </div>

            <div className="max-h-80 space-y-1 overflow-y-auto p-2">
              {results.map(cat => (
                <div key={cat.category} className="mb-3">
                  <button type="button"
                    className="mb-1.5 flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left"
                    style={{ color: cat.color }}
                    onClick={() => { navigate(cat.path); setOpen(false); }}>
                    <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">{cat.category}</span>
                    <span className="ml-auto text-[10px] opacity-50">→ Voir tout</span>
                  </button>
                  {cat.items.map(item => (
                    <motion.button key={item} type="button"
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs"
                      style={{ color: "rgba(255,255,255,0.55)" }}
                      whileHover={{ background: `${cat.color}10`, color: cat.color, x: 3 }}
                      transition={{ duration: 0.1 }}
                      onClick={() => { navigate(cat.path); setOpen(false); setQuery(""); }}>
                      <span className="h-1 w-1 rounded-full flex-shrink-0" style={{ background: `${cat.color}55` }} />
                      {item}
                    </motion.button>
                  ))}
                </div>
              ))}
              {results.length === 0 && (
                <p className="py-8 text-center text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                  Aucun résultat pour "{query}"
                </p>
              )}
            </div>

            <div className="border-t px-4 py-2.5" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="flex gap-3 text-[9px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                <span><kbd className="rounded px-1 py-0.5" style={{ background: "rgba(255,255,255,0.07)" }}>↵</kbd> Naviguer</span>
                <span><kbd className="rounded px-1 py-0.5" style={{ background: "rgba(255,255,255,0.07)" }}>Esc</kbd> Fermer</span>
                <span><kbd className="rounded px-1 py-0.5" style={{ background: "rgba(255,255,255,0.07)" }}>⌘F</kbd> Ouvrir</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
