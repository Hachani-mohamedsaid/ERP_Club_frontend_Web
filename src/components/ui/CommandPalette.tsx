import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, FileText, Handshake, DollarSign, Users, BarChart3, Command, ArrowRight, Hash } from "lucide-react";

interface PaletteItem {
  id: string;
  label: string;
  sub: string;
  category: string;
  icon: React.ElementType;
  color: string;
  path: string;
}

const F = { primary: "#FF7A00", success: "#22C55E", danger: "#EF4444", info: "#3B82F6", warning: "#F59E0B", ai: "#6366F1" };

const ALL_ITEMS: PaletteItem[] = [
  // Finance
  { id: "f1", label: "Dashboard Finance",      sub: "Vue d'ensemble budgétaire",            category: "Finance",    icon: BarChart3,  color: F.primary, path: "/finance" },
  { id: "f2", label: "Contrats",                sub: "Gestion des contrats joueurs",          category: "Finance",    icon: FileText,   color: F.info,    path: "/finance/contrats" },
  { id: "f3", label: "Factures",                sub: "Facturation et paiements",              category: "Finance",    icon: DollarSign, color: F.warning, path: "/finance/factures" },
  { id: "f4", label: "Sponsors",                sub: "Partenaires & sponsoring",              category: "Finance",    icon: Handshake,  color: F.success, path: "/finance/sponsors" },
  { id: "f5", label: "Salaires",                sub: "Masse salariale & rémunérations",       category: "Finance",    icon: Users,      color: F.info,    path: "/finance/salaires" },
  { id: "f6", label: "ODIN Finance AI",         sub: "Assistant IA finance",                  category: "Finance",    icon: Command,    color: F.ai,      path: "/finance/ia" },
  // Players
  { id: "p1", label: "Youssef Ben Ali",         sub: "Attaquant · FC Carthage",               category: "Joueurs",    icon: Users,      color: F.primary, path: "/coach/squad" },
  { id: "p2", label: "Mohamed Diallo",          sub: "Défenseur · FC Carthage",               category: "Joueurs",    icon: Users,      color: F.primary, path: "/coach/squad" },
  { id: "p3", label: "Nader Trabelsi",          sub: "Milieu · FC Carthage",                  category: "Joueurs",    icon: Users,      color: F.primary, path: "/coach/squad" },
  // Scouts
  { id: "s1", label: "Scout Dashboard",         sub: "Tableau de bord scouting",              category: "Scouting",   icon: Search,     color: F.warning, path: "/scout" },
  { id: "s2", label: "Watchlist Scouts",        sub: "Liste de surveillance",                  category: "Scouting",   icon: Hash,       color: F.warning, path: "/scout/watchlist" },
  { id: "s3", label: "Workflow Recrutement",    sub: "Kanban recrutement",                     category: "Scouting",   icon: ArrowRight, color: F.success, path: "/scout/recruitment" },
  // Reports
  { id: "r1", label: "Rapports Finance",        sub: "Exports et analyses",                    category: "Rapports",   icon: BarChart3,  color: F.danger,  path: "/finance/rapports" },
  { id: "r2", label: "Rapport Scout",           sub: "Fiche d'observation joueur",             category: "Rapports",   icon: FileText,   color: F.warning, path: "/scout/report" },
  // Settings
  { id: "set1", label: "Paramètres Généraux",  sub: "Configuration du club",                  category: "Paramètres", icon: Hash,       color: F.info,    path: "/superadmin/settings" },
];

const CATEGORIES = ["Finance", "Joueurs", "Scouting", "Rapports", "Paramètres"];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);

  const results = query.trim().length === 0
    ? ALL_ITEMS.slice(0, 8)
    : ALL_ITEMS.filter(it =>
        it.label.toLowerCase().includes(query.toLowerCase()) ||
        it.sub.toLowerCase().includes(query.toLowerCase()) ||
        it.category.toLowerCase().includes(query.toLowerCase())
      );

  const go = useCallback((item: PaletteItem) => {
    navigate(item.path);
    setQuery("");
    onClose();
  }, [navigate, onClose]);

  useEffect(() => {
    setHighlighted(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") { setHighlighted(h => Math.min(h + 1, results.length - 1)); e.preventDefault(); return; }
      if (e.key === "ArrowUp") { setHighlighted(h => Math.max(h - 1, 0)); e.preventDefault(); return; }
      if (e.key === "Enter" && results[highlighted]) { go(results[highlighted]); return; }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, results, highlighted, go, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div className="fixed inset-0 z-[9998]" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} />

          {/* Palette */}
          <motion.div
            className="fixed left-1/2 top-[18%] z-[9999] w-full max-w-[580px] overflow-hidden rounded-[22px] border shadow-2xl"
            style={{ background: "var(--surface-panel-solid)", borderColor: "var(--surface-panel-border)", transform: "translateX(-50%)", boxShadow: "0 32px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,122,0,0.15)" }}
            initial={{ opacity: 0, scale: 0.92, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}>

            {/* Search input */}
            <div className="flex items-center gap-3 border-b px-4 py-3.5" style={{ borderColor: "var(--surface-panel-border)" }}>
              <Search size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
              <input autoFocus type="text" placeholder="Rechercher contrats, joueurs, sponsors..."
                value={query} onChange={e => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-[rgba(255,255,255,0.3)]"
                style={{ color: "white" }} />
              <div className="flex items-center gap-1">
                <kbd className="rounded-md border px-1.5 py-0.5 text-[9px] font-bold" style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-muted)" }}>ESC</kbd>
              </div>
            </div>

            {/* Results */}
            <div className="max-h-72 overflow-y-auto py-2">
              {results.length === 0 ? (
                <div className="px-4 py-8 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                  Aucun résultat pour « {query} »
                </div>
              ) : (
                <>
                  {query.trim().length === 0 && (
                    <p className="px-4 pb-1 text-[9px] uppercase tracking-widest font-bold" style={{ color: "var(--text-muted)" }}>
                      Accès rapide
                    </p>
                  )}
                  {results.map((item, i) => {
                    const Icon = item.icon;
                    const isHl = i === highlighted;
                    return (
                      <motion.button key={item.id} type="button"
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left"
                        style={{ background: isHl ? `${item.color}0d` : "transparent" }}
                        onMouseEnter={() => setHighlighted(i)}
                        onClick={() => go(item)}
                        whileHover={{ background: `${item.color}0d` }}>
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                          style={{ background: `${item.color}14` }}>
                          <Icon size={14} style={{ color: item.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold" style={{ color: isHl ? "white" : "rgba(255,255,255,0.8)" }}>
                            {item.label}
                          </p>
                          <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>{item.sub}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="rounded-full px-2 py-0.5 text-[8px] font-bold"
                            style={{ background: `${item.color}12`, color: item.color }}>
                            {item.category}
                          </span>
                          {isHl && <ArrowRight size={10} style={{ color: item.color }} />}
                        </div>
                      </motion.button>
                    );
                  })}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t px-4 py-2" style={{ borderColor: "var(--surface-panel-border)" }}>
              <div className="flex items-center gap-3 text-[9px]" style={{ color: "var(--text-muted)" }}>
                <span><kbd className="rounded border px-1 py-0.5" style={{ borderColor: "var(--surface-panel-border)" }}>↑↓</kbd> naviguer</span>
                <span><kbd className="rounded border px-1 py-0.5" style={{ borderColor: "var(--surface-panel-border)" }}>↵</kbd> ouvrir</span>
              </div>
              <div className="flex items-center gap-1 text-[9px]" style={{ color: "var(--text-muted)" }}>
                <span style={{ color: F.primary }}>●</span> ODIN ERP
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return { open, close: () => setOpen(false) };
}
