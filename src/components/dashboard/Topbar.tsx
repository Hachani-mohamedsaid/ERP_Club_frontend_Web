import { Search, Bell, MessageSquare, Plus, Building2, Users, CreditCard, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { MedicalNotificationsDropdown } from "../medical/MedicalNotificationsDropdown";
import { PrepNotificationsDropdown } from "../preparateur/PrepNotificationsDropdown";
import { JoueurNotificationsDropdown } from "../player/JoueurNotificationsDropdown";
import { FinanceNotificationsDropdown } from "../finance/FinanceNotificationsDropdown";
import { ClubNotificationsDropdown } from "../club/ClubNotificationsDropdown";
import { SuperAdminNotificationsDropdown } from "../superadmin/SuperAdminNotificationsDropdown";
import { ScoutNotificationsDropdown } from "../scout/ScoutNotificationsDropdown";
import { RecruteurNotificationsDropdown } from "../recruteur/RecruteurNotificationsDropdown";
import { FinanceGlobalSearch } from "../finance/FinanceGlobalSearch";
import { useClubProfile } from "../../hooks/useClubProfile";
import { ClubLogo } from "../club/ClubLogo";

/* ─── Super Admin Global Search ────────────────────────────────── */
const SA_SEARCH_DATA = [
  { category: "Clubs", items: ["FC Carthage — Enterprise — Actif", "ES Sahel — Pro — Actif", "CS Sfaxien — Starter — Suspendu"] },
  { category: "Utilisateurs", items: ["Amine Mansour — Coach — FC Carthage", "Sarra Belhaj — Responsable — ES Sahel"] },
  { category: "Abonnements", items: ["Enterprise Plan — 20 400 DT/mois", "Pro Plan — 15 000 DT/mois"] },
  { category: "Paiements", items: ["PAY-001 — 20 400 DT — Payé", "PAY-003 — 20 400 DT — En retard"] },
  { category: "Logs", items: ["Connexion suspecte — IP 192.168.1.200", "Brute force détecté — 28 tentatives"] },
];

const CATEGORY_COLORS: Record<string, string> = {
  Clubs: "#3B82F6",
  Utilisateurs: "#10B981",
  Abonnements: "#8B5CF6",
  Paiements: "#FF7A00",
  Logs: "#EF4444",
};

function SuperAdminGlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = query.trim()
    ? SA_SEARCH_DATA
        .map((cat) => ({
          ...cat,
          items: cat.items.filter((item) => item.toLowerCase().includes(query.toLowerCase())),
        }))
        .filter((cat) => cat.items.length > 0)
    : SA_SEARCH_DATA;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-xl hidden sm:block">
      <div
        className="glass-input flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all"
        style={{
          background: "var(--surface-raised)",
          borderColor: open ? "rgba(255,122,0,0.45)" : "var(--surface-panel-border)",
          boxShadow: open ? "0 0 0 2px rgba(255,122,0,0.1)" : "none",
          width: open ? 320 : 280,
          transition: "all 0.25s ease",
        }}
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
      >
        <Search size={15} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher clubs, users, paiements..."
          className="w-full bg-transparent text-sm outline-none"
          style={{ color: "var(--text-primary)" }}
        />
        {query && (
          <button type="button" onClick={(e) => { e.stopPropagation(); setQuery(""); }}>
            <X size={12} style={{ color: "var(--text-muted)" }} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border p-3 shadow-2xl"
            style={{
              background: "var(--surface-panel-solid)",
              borderColor: "rgba(255,122,0,0.2)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(255,122,0,0.06)",
            }}
          >
            <p className="mb-2 px-1 text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              {query ? `Résultats pour "${query}"` : "Recherche rapide"}
            </p>
            <div className="max-h-72 space-y-3 overflow-y-auto">
              {results.map((cat) => (
                <div key={cat.category}>
                  <p className="mb-1.5 flex items-center gap-1.5 px-1 text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: CATEGORY_COLORS[cat.category] }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: CATEGORY_COLORS[cat.category] }} />
                    {cat.category}
                  </p>
                  {cat.items.map((item) => (
                    <motion.button
                      key={item}
                      type="button"
                      className="w-full rounded-xl px-3 py-2 text-left text-xs font-medium"
                      style={{ color: "var(--text-secondary)" }}
                      whileHover={{ background: "rgba(255,122,0,0.08)", color: "#FF7A00", x: 2 }}
                      transition={{ duration: 0.12 }}
                      onClick={() => setOpen(false)}
                    >
                      {item}
                    </motion.button>
                  ))}
                </div>
              ))}
              {results.length === 0 && (
                <p className="py-4 text-center text-xs" style={{ color: "var(--text-muted)" }}>Aucun résultat</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Super Admin Quick Actions ─────────────────────────────────── */
function SuperAdminQuickActions() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const actions = [
    { icon: Building2, label: "Nouveau Club", color: "#3B82F6", path: "/superadmin/clubs", stateKey: "openCreate" },
    { icon: Users, label: "Nouvel Utilisateur", color: "#10B981", path: "/superadmin/users", stateKey: "openCreate" },
    { icon: CreditCard, label: "Abonnement", color: "#FF7A00", path: "/superadmin/payments", stateKey: "openForm" },
  ] as const;

  function handleAction(path: string, stateKey: string) {
    setOpen(false);
    navigate(path, { state: { [stateKey]: true } });
  }

  return (
    <div ref={ref} className="relative">
      <motion.button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-xl border"
        style={{
          background: open ? "linear-gradient(135deg,#FF7A00,#E66000)" : "rgba(255,122,0,0.12)",
          borderColor: "rgba(255,122,0,0.3)",
          color: open ? "white" : "#FF7A00",
          boxShadow: open ? "0 0 20px rgba(255,122,0,0.4)" : "none",
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        animate={{ rotate: open ? 45 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <Plus size={16} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full z-50 mt-2 min-w-[180px] overflow-hidden rounded-2xl border p-2 shadow-2xl"
            style={{
              background: "var(--surface-panel-solid)",
              borderColor: "rgba(255,122,0,0.2)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(255,122,0,0.06)",
            }}
          >
            <p className="mb-1.5 px-2 text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Créer</p>
            {actions.map(({ icon: Icon, label, color, path, stateKey }, i) => (
              <motion.button
                key={label}
                type="button"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ background: `${color}14`, color }}
                onClick={() => handleAction(path, stateKey)}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-lg" style={{ background: `${color}1f` }}>
                  <Icon size={12} style={{ color }} />
                </div>
                {label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Responsable Global Search ─────────────────────────────────── */
const RESP_SEARCH_DATA = [
  {
    category: "Joueurs", color: "#3B82F6",
    items: [
      "Yassine Brahmi — Attaquant — Actif",
      "Karim Sassi — Milieu — Blessé",
      "Walid Hammami — Défenseur — Actif",
      "Ahmed Ben Salah — Gardien — Actif",
      "Karim Gharbi — Milieu — Suspendu",
    ],
  },
  {
    category: "Contrats", color: "#FF7A00",
    items: [
      "Contrat Yassine Brahmi — Expire 12/05/2027 — 18 000 DT",
      "Contrat Karim Sassi — Expire 30/06/2028 — 14 000 DT",
      "Contrat Walid Hammami — ⚠ Expire dans 30 jours",
    ],
  },
  {
    category: "Documents", color: "#8B5CF6",
    items: [
      "Licence FTF Karim Gharbi — Valide",
      "Contrat PDF Ahmed Ben Salah — 2025",
      "Rapport Scouting Youssef Ben Ali — 15/06",
      "Certificat Médical — Ines Mejri",
    ],
  },
  {
    category: "Staff", color: "#22C55E",
    items: [
      "Sonia Baccouche — Coach Équipe 1ère",
      "Ines Mejri — Médecin Staff médical",
      "Tarek Bouzid — Scout Recrutement",
      "Rami Ben Slimane — Analyste Data",
    ],
  },
  {
    category: "Validation", color: "#F59E0B",
    items: [
      "Recrutement Youssef Ben Ali — En attente",
      "Renouvellement contrat Ahmed BS — En attente",
      "Achat équipement médical 18 500 DT — En attente",
    ],
  },
];

function ResponsableGlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const results = query.trim()
    ? RESP_SEARCH_DATA
        .map((cat) => ({ ...cat, items: cat.items.filter((i) => i.toLowerCase().includes(query.toLowerCase())) }))
        .filter((cat) => cat.items.length > 0)
    : RESP_SEARCH_DATA;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => { document.removeEventListener("mousedown", handleClick); document.removeEventListener("keydown", handleKey); };
  }, []);

  const ROUTE_MAP: Record<string, string> = {
    Joueurs: "/players", Contrats: "/contracts", Documents: "/responsable/documents",
    Staff: "/responsable/staff", Validation: "/responsable/validation",
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl hidden sm:block">
      <motion.div
        className="glass-input flex cursor-text items-center gap-2.5 rounded-xl px-3 py-2.5"
        style={{
          background: "var(--surface-raised)",
          borderColor: open ? "rgba(255,122,0,0.45)" : "var(--surface-panel-border)",
          boxShadow: open ? "0 0 0 2px rgba(255,122,0,0.1)" : "none",
        }}
        animate={{ width: open ? 360 : 300 }}
        transition={{ duration: 0.22 }}
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
      >
        <Search size={15} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Joueurs, contrats, staff… ⌘K"
          className="w-full bg-transparent text-sm outline-none"
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
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-full z-50 mt-2 w-96 overflow-hidden rounded-2xl border shadow-2xl"
            style={{
              background: "var(--surface-modal)",
              borderColor: "rgba(255,122,0,0.2)",
              backdropFilter: "blur(24px)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 40px rgba(255,122,0,0.06)",
            }}
          >
            <div className="border-b px-4 py-3" style={{ borderColor: "var(--surface-panel-border)" }}>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                {query ? `Résultats pour "${query}"` : "Recherche globale — Joueurs, Contrats, Documents, Staff"}
              </p>
            </div>
            <div className="max-h-80 space-y-1 overflow-y-auto p-2">
              {results.map((cat) => (
                <div key={cat.category} className="mb-3">
                  <button
                    type="button"
                    onClick={() => { navigate(ROUTE_MAP[cat.category] ?? "/dashboard"); setOpen(false); }}
                    className="mb-1.5 flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left"
                    style={{ color: cat.color }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{cat.category}</span>
                    <span className="ml-auto text-[10px] opacity-50">→ Voir tout</span>
                  </button>
                  {cat.items.map((item) => (
                    <motion.button
                      key={item}
                      type="button"
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs"
                      style={{ color: "var(--text-secondary)" }}
                      whileHover={{ background: `${cat.color}10`, color: cat.color, x: 3 }}
                      transition={{ duration: 0.1 }}
                      onClick={() => { navigate(ROUTE_MAP[cat.category] ?? "/dashboard"); setOpen(false); setQuery(""); }}
                    >
                      <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: `${cat.color}60` }} />
                      {item}
                    </motion.button>
                  ))}
                </div>
              ))}
              {results.length === 0 && (
                <p className="py-8 text-center text-xs" style={{ color: "var(--text-muted)" }}>Aucun résultat pour "{query}"</p>
              )}
            </div>
            <div className="border-t px-4 py-2.5" style={{ borderColor: "var(--surface-panel-border)" }}>
              <div className="flex gap-3 text-[10px]" style={{ color: "var(--text-muted)" }}>
                <span><kbd className="rounded px-1 py-0.5" style={{ background: "var(--surface-input)" }}>↵</kbd> Naviguer</span>
                <span><kbd className="rounded px-1 py-0.5" style={{ background: "var(--surface-input)" }}>Esc</kbd> Fermer</span>
                <span><kbd className="rounded px-1 py-0.5" style={{ background: "var(--surface-input)" }}>⌘K</kbd> Ouvrir</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Topbar ───────────────────────────────────────────────── */
export function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clubName, logoUrl } = useClubProfile();
  const isMedical = user?.role === "medical";
  const isJoueur = user?.role === "joueur";
  const isPreparateur = user?.role === "preparateur";
  const isSuperAdmin = location.pathname.startsWith("/superadmin") || user?.role === "superadmin";
  const isResponsable = user?.role === "responsable";
  const isFinance = user?.role === "finance" || location.pathname.startsWith("/finance");
  const isClubAdmin = user?.role === "adminclub";
  const isScout = user?.role === "scout" || location.pathname.startsWith("/scout");
  const isRecruteur = user?.role === "recruteur" || location.pathname.startsWith("/recruteur");

  return (
    <header className="flex items-center gap-4 px-8 py-5">
      <div className="flex min-w-0 flex-1 items-center">
        {isSuperAdmin ? (
          <SuperAdminGlobalSearch />
        ) : isResponsable ? (
          <ResponsableGlobalSearch />
        ) : isFinance ? (
          <FinanceGlobalSearch />
        ) : !isJoueur && (
          <div className="relative hidden w-full max-w-xl sm:block">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              type="text"
              placeholder="Rechercher un joueur, un contrat, un prospect..."
              className="glass-input w-full py-2.5 pl-9 pr-3 text-sm"
              style={{ background: "var(--surface-raised)" }}
            />
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {isSuperAdmin && <SuperAdminQuickActions />}

        {isMedical ? (
          <MedicalNotificationsDropdown />
        ) : isSuperAdmin ? (
          <SuperAdminNotificationsDropdown />
        ) : isJoueur ? (
          <JoueurNotificationsDropdown />
        ) : isPreparateur ? (
          <PrepNotificationsDropdown />
        ) : isFinance ? (
          <FinanceNotificationsDropdown />
        ) : isClubAdmin ? (
          <ClubNotificationsDropdown />
        ) : isResponsable ? (
          <ClubNotificationsDropdown allPagePath="/responsable/notifications" />
        ) : isScout ? (
          <ScoutNotificationsDropdown />
        ) : isRecruteur ? (
          <RecruteurNotificationsDropdown />
        ) : (
          <button
            type="button"
            className="glass-input relative flex h-10 w-10 items-center justify-center"
            onClick={() => navigate("/dashboard")}
          >
            <Bell size={16} style={{ color: "var(--text-secondary)" }} />
          </button>
        )}

        {(isMedical || isJoueur || isScout) && (
          <button
            type="button"
            onClick={() => navigate("/messages")}
            className="glass-input relative flex h-10 w-10 items-center justify-center"
          >
            <MessageSquare size={16} style={{ color: "var(--text-secondary)" }} />
          </button>
        )}

        <div className="glass-input flex items-center gap-2 py-2 pl-2 pr-3">
          {isSuperAdmin ? (
            <div
              className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold"
              style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
            >
              SA
            </div>
          ) : isClubAdmin ? (
            <ClubLogo name={clubName} logoUrl={logoUrl} size="xs" />
          ) : (
            <div
              className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold"
              style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
            >
              {(user?.fullName ?? user?.email ?? "U").slice(0, 2).toUpperCase()}
            </div>
          )}
          <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            {isSuperAdmin
              ? (user?.fullName ?? "Super Admin")
              : isClubAdmin
                ? clubName
                : (user?.fullName ?? "Utilisateur")}
          </span>
        </div>

      </div>
    </header>
  );
}
