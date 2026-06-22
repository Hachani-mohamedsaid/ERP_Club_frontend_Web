import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, FileText, Handshake, AlertTriangle, Users, ChevronRight, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const F = { primary: "#FF7A00", success: "#22C55E", danger: "#EF4444", info: "#3B82F6", warning: "#F59E0B" };

interface FinanceNotif {
  id: string;
  icon: React.ElementType;
  color: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  path: string;
  sev: "error" | "warning" | "info";
}

const INITIAL_NOTIFS: FinanceNotif[] = [
  { id: "n1", icon: FileText,    color: F.danger,  sev: "error",   title: "Contrat expire dans 9 jours",    body: "Youssef Ben Ali — Attaquant · FAC FC Carthage",          time: "Il y a 2h",   read: false, path: "/finance/contrats" },
  { id: "n2", icon: Handshake,   color: F.warning, sev: "warning", title: "Sponsor Ooredoo à renouveler",   body: "Contrat expire le 31/07/2026 — 280 000 DT/an",           time: "Il y a 4h",   read: false, path: "/finance/sponsors" },
  { id: "n3", icon: AlertTriangle,color:F.danger,  sev: "error",   title: "Facture Assurance en retard",    body: "FAC-004 — 25 000 DT — En retard depuis 37 jours",        time: "Il y a 6h",   read: false, path: "/finance/factures" },
  { id: "n4", icon: Users,        color: F.warning, sev: "warning", title: "Salaire en attente de paiement",body: "Ibrahim Touré · Dr. Amira Ben M. — Juin 2026",            time: "Hier 09:30",  read: true,  path: "/finance/salaires" },
  { id: "n5", icon: AlertTriangle,color: F.warning, sev: "warning", title: "Budget transferts à 92%",        body: "Plafond 3.0M DT · Utilisé 2.76M DT — Seuil critique",    time: "Hier 14:00",  read: true,  path: "/finance" },
  { id: "n6", icon: FileText,     color: F.info,    sev: "info",    title: "Contrat Rami Makhlouf — 71j",   body: "Renouvellement recommandé avant le 31/08/2026",           time: "Il y a 2j",   read: true,  path: "/finance/contrats" },
  { id: "n7", icon: Handshake,    color: F.warning, sev: "warning", title: "Sponsor STEG — 40j restants",   body: "Probabilité renouvellement : 40% — Action urgente",        time: "Il y a 3j",   read: true,  path: "/finance/sponsors" },
];

export function FinanceNotificationsDropdown() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<FinanceNotif[]>(INITIAL_NOTIFS);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifs.filter(n => !n.read).length;

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const markRead = (id: string) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const dismiss = (id: string, e: React.MouseEvent) => { e.stopPropagation(); setNotifs(prev => prev.filter(n => n.id !== id)); };

  return (
    <div ref={ref} className="relative">
      <motion.button type="button"
        onClick={() => setOpen(o => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border"
        style={{
          background: open ? `${F.primary}14` : "rgba(255,255,255,0.05)",
          borderColor: open ? `${F.primary}35` : "rgba(255,255,255,0.1)",
        }}
        whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.92 }}>
        <Bell size={15} style={{ color: open ? F.primary : "rgba(255,255,255,0.55)" }} />
        {unread > 0 && (
          <motion.span
            className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-extrabold text-white"
            style={{ background: F.danger }}
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400 }}>
            {unread}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full z-50 mt-2 w-[360px] overflow-hidden rounded-[22px] border shadow-2xl"
            style={{
              background: "rgba(8,6,24,0.98)",
              borderColor: "rgba(255,255,255,0.09)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,122,0,0.08)",
              backdropFilter: "blur(20px)",
            }}>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              <div className="flex items-center gap-2">
                <Bell size={14} style={{ color: F.primary }} />
                <span className="text-xs font-extrabold" style={{ color: "var(--text-primary)" }}>Notifications Finance</span>
                {unread > 0 && (
                  <span className="rounded-full px-2 py-0.5 text-[8px] font-extrabold"
                    style={{ background: `${F.danger}15`, color: F.danger }}>
                    {unread} non lues
                  </span>
                )}
              </div>
              {unread > 0 && (
                <motion.button type="button" onClick={markAllRead}
                  className="flex items-center gap-1 text-[9px] font-bold"
                  style={{ color: F.primary }}
                  whileHover={{ scale: 1.05 }}>
                  <Check size={9} /> Tout lire
                </motion.button>
              )}
            </div>

            {/* Notifications */}
            <div className="max-h-[360px] overflow-y-auto">
              {notifs.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <Bell size={28} style={{ color: "rgba(255,255,255,0.1)" }} className="mb-2" />
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Aucune notification</p>
                </div>
              ) : (
                notifs.map((n, i) => {
                  const Icon = n.icon;
                  return (
                    <motion.div key={n.id}
                      initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                      className="group flex items-start gap-3 px-4 py-3 cursor-pointer relative"
                      style={{
                        background: n.read ? "transparent" : `${n.color}05`,
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}
                      whileHover={{ background: "rgba(255,255,255,0.03)" }}
                      onClick={() => { markRead(n.id); navigate(n.path); setOpen(false); }}>

                      {/* Unread dot */}
                      {!n.read && (
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full"
                          style={{ background: n.color }} />
                      )}

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl mt-0.5"
                        style={{ background: `${n.color}12` }}>
                        <Icon size={13} style={{ color: n.color }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold leading-snug" style={{ color: n.read ? "rgba(255,255,255,0.6)" : "white" }}>
                          {n.title}
                        </p>
                        <p className="text-[9px] mt-0.5 leading-snug" style={{ color: "rgba(255,255,255,0.35)" }}>
                          {n.body}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[8px]" style={{ color: "rgba(255,255,255,0.25)" }}>{n.time}</span>
                          <span className="rounded-full px-1.5 py-0.5 text-[7px] font-bold"
                            style={{ background: `${n.color}12`, color: n.color }}>
                            {n.sev === "error" ? "Urgent" : n.sev === "warning" ? "Attention" : "Info"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <motion.button type="button"
                          className="opacity-0 group-hover:opacity-100 rounded-lg p-1"
                          style={{ color: "rgba(255,255,255,0.35)" }}
                          onClick={(e) => dismiss(n.id, e)}
                          whileHover={{ scale: 1.2, color: F.danger }}>
                          <X size={10} />
                        </motion.button>
                        <ChevronRight size={10} style={{ color: "rgba(255,255,255,0.2)" }} />
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="border-t px-4 py-2.5 flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                Finance · FC Carthage · Saison 2025-2026
              </span>
              <motion.button type="button"
                className="text-[9px] font-bold" style={{ color: F.primary }}
                onClick={() => { navigate("/finance"); setOpen(false); }}
                whileHover={{ scale: 1.05 }}>
                Voir Dashboard →
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
