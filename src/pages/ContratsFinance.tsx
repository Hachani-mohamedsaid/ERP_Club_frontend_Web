import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, XCircle, FileText, Plus, Download, RefreshCw, Clock } from "lucide-react";

const F = { primary: "#FF7A00", success: "#22C55E", danger: "#EF4444", info: "#3B82F6", warning: "#F59E0B" };

interface Contract {
  id: string; nom: string; poste: string;
  dateDebut: string; dateFin: string;
  salaire: number; prime: number; bonus: number;
  status: "Actif" | "Expire bientot" | "Expire";
  daysLeft: number;
}

const CONTRACTS: Contract[] = [
  { id: "1", nom: "Youssef Ben Ali",  poste: "Attaquant",        dateDebut: "01/01/2023", dateFin: "30/06/2026", salaire: 85000,  prime: 12000, bonus: 5000, status: "Expire bientot", daysLeft: 9  },
  { id: "2", nom: "Mohamed Diallo",   poste: "Défenseur",        dateDebut: "15/03/2022", dateFin: "31/12/2026", salaire: 95000,  prime: 15000, bonus: 7000, status: "Actif",          daysLeft: 193},
  { id: "3", nom: "Nader Trabelsi",   poste: "Milieu",           dateDebut: "10/07/2023", dateFin: "31/05/2027", salaire: 78000,  prime: 10000, bonus: 4500, status: "Actif",          daysLeft: 344},
  { id: "4", nom: "Ali Ben Amor",     poste: "Milieu Offensif",  dateDebut: "01/01/2020", dateFin: "30/06/2024", salaire: 120000, prime: 20000, bonus: 9000, status: "Expire",         daysLeft: -356},
  { id: "5", nom: "Rami Makhlouf",    poste: "Gardien",          dateDebut: "01/09/2023", dateFin: "31/08/2026", salaire: 45000,  prime: 5000,  bonus: 3000, status: "Expire bientot", daysLeft: 71 },
  { id: "6", nom: "Karim Mansour",    poste: "Défenseur Droit",  dateDebut: "01/07/2024", dateFin: "30/06/2027", salaire: 62000,  prime: 8000,  bonus: 3500, status: "Actif",          daysLeft: 374},
  { id: "7", nom: "Ibrahim Touré",    poste: "Ailier Gauche",    dateDebut: "01/08/2023", dateFin: "30/09/2026", salaire: 72000,  prime: 9000,  bonus: 4000, status: "Expire bientot", daysLeft: 101},
];

const STATUS_META = {
  "Actif":         { icon: CheckCircle, color: F.success, label: "Actif"         },
  "Expire bientot":{ icon: AlertCircle, color: F.warning, label: "Expire bientôt"},
  "Expire":        { icon: XCircle,     color: F.danger,  label: "Expiré"        },
};

const RENEWAL_BUCKETS = [
  { label: "🔴 30 jours",  max: 30,  color: F.danger  },
  { label: "🟠 60 jours",  max: 60,  color: F.warning },
  { label: "🟡 90 jours",  max: 90,  color: "#F97316" },
];

const KPI = [
  { label: "Contrats actifs",    value: "5",  color: F.success, icon: CheckCircle  },
  { label: "Expire bientôt",     value: "3",  color: F.warning, icon: AlertCircle  },
  { label: "À renouveler",       value: "2",  color: F.primary, icon: RefreshCw    },
  { label: "Expirés",            value: "1",  color: F.danger,  icon: XCircle      },
];

export function ContratsFinance() {
  const [activeTab, setActiveTab] = useState<"liste" | "renouvellement">("liste");
  const [filter, setFilter] = useState<"Tous" | Contract["status"]>("Tous");

  const filtered = filter === "Tous" ? CONTRACTS : CONTRACTS.filter(c => c.status === filter);

  // Upcoming contracts grouped by urgency
  const upcoming = CONTRACTS.filter(c => c.daysLeft > 0 && c.daysLeft <= 90)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  return (
    <motion.div className="space-y-5" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: "var(--text-primary)" }}>Gestion des Contrats</h1>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
            {CONTRACTS.length} contrats · Saison 2025-2026
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button type="button"
            className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold"
            style={{ borderColor: `${F.primary}30`, color: F.primary, background: `${F.primary}08` }}
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}>
            <Plus size={12} /> Nouveau contrat
          </motion.button>
          <motion.button type="button"
            className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold"
            style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}>
            <Download size={12} /> Export
          </motion.button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {KPI.map((k, i) => {
          const Icon = k.icon;
          return (
            <motion.div key={i} className="rounded-[18px] border p-4"
              style={{ background: "rgba(8,6,24,0.88)", borderColor: `${k.color}18` }}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              whileHover={{ y: -2, borderColor: `${k.color}35` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: `${k.color}12` }}>
                  <Icon size={13} style={{ color: k.color }} />
                </div>
              </div>
              <p className="text-[9px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>{k.label}</p>
              <p className="text-2xl font-extrabold" style={{ color: k.color }}>{k.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: "liste",         label: "📋 Liste des contrats"            },
          { id: "renouvellement",label: "🔔 Contrats à renouveler"         },
        ].map(tab => (
          <motion.button key={tab.id} type="button"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className="rounded-xl px-4 py-2 text-xs font-bold"
            style={{
              background: activeTab === tab.id ? `${F.primary}14` : "rgba(255,255,255,0.04)",
              color:      activeTab === tab.id ? F.primary         : "rgba(255,255,255,0.4)",
              border:     `1px solid ${activeTab === tab.id ? F.primary + "35" : "transparent"}`,
            }}
            whileHover={{ scale: 1.04 }}>
            {tab.label}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "liste" && (
          <motion.div key="liste" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Filter chips */}
            <div className="flex flex-wrap gap-2 mb-4">
              {(["Tous", "Actif", "Expire bientot", "Expire"] as const).map(f => {
                const color = f === "Tous" ? F.info : STATUS_META[f as Contract["status"]].color;
                return (
                  <motion.button key={f} type="button" onClick={() => setFilter(f)}
                    className="rounded-full px-3 py-1 text-[10px] font-bold"
                    style={{
                      background: filter === f ? color : "rgba(255,255,255,0.05)",
                      color: filter === f ? "white" : "rgba(255,255,255,0.45)",
                    }}
                    whileHover={{ scale: 1.06 }}>
                    {f === "Tous" ? "Tous" : STATUS_META[f as Contract["status"]].label}
                  </motion.button>
                );
              })}
            </div>

            <div className="rounded-[22px] border overflow-hidden" style={{ background: "rgba(8,6,24,0.88)", borderColor: "rgba(255,255,255,0.07)" }}>
              <div className="divide-y">
                {filtered.map((c, i) => {
                  const meta = STATUS_META[c.status];
                  const StatusIcon = meta.icon;
                  const urgent = c.daysLeft > 0 && c.daysLeft <= 30;
                  return (
                    <motion.div key={c.id}
                      initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-4 px-5 py-4"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                      whileHover={{ background: "rgba(255,255,255,0.02)" }}>

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: `${meta.color}12` }}>
                        <StatusIcon size={15} style={{ color: meta.color }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{c.nom}</p>
                          {urgent && (
                            <motion.span className="rounded-full px-1.5 py-0.5 text-[7px] font-extrabold"
                              style={{ background: `${F.danger}15`, color: F.danger }}
                              animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                              URGENT
                            </motion.span>
                          )}
                        </div>
                        <p className="text-[9px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                          {c.poste} · {c.dateDebut} → {c.dateFin}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs font-extrabold" style={{ color: "var(--text-primary)" }}>
                          {(c.salaire / 1000).toFixed(0)}K DT/mois
                        </p>
                        <p className="text-[8px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                          +{((c.prime + c.bonus) / 1000).toFixed(0)}K primes
                        </p>
                      </div>

                      <div className="shrink-0 text-right min-w-[60px]">
                        {c.daysLeft > 0 ? (
                          <p className="text-[9px] font-bold" style={{ color: c.daysLeft <= 30 ? F.danger : c.daysLeft <= 90 ? F.warning : F.success }}>
                            {c.daysLeft}j restants
                          </p>
                        ) : (
                          <p className="text-[9px] font-bold" style={{ color: F.danger }}>Expiré</p>
                        )}
                      </div>

                      <span className="shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold"
                        style={{ background: `${meta.color}12`, color: meta.color }}>
                        {meta.label}
                      </span>

                      <div className="flex gap-1.5 shrink-0">
                        <motion.button type="button"
                          className="rounded-lg border px-2 py-1 text-[9px] font-bold"
                          style={{ borderColor: `${F.primary}25`, color: F.primary }}
                          whileHover={{ scale: 1.08 }}>
                          <RefreshCw size={8} className="inline mr-0.5" />Renouveler
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "renouvellement" && (
          <motion.div key="renewal" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
              Contrats arrivant à expiration dans les 90 prochains jours — action recommandée
            </p>

            {RENEWAL_BUCKETS.map(bucket => {
              const items = upcoming.filter(c => {
                const prevMax = bucket.max === 30 ? 0 : bucket.max === 60 ? 30 : 60;
                return c.daysLeft > prevMax && c.daysLeft <= bucket.max;
              });
              if (items.length === 0) return null;
              return (
                <div key={bucket.label}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-0.5 flex-1 rounded-full" style={{ background: `${bucket.color}30` }} />
                    <span className="text-[10px] font-extrabold px-3 py-1 rounded-full"
                      style={{ background: `${bucket.color}12`, color: bucket.color }}>
                      {bucket.label} — {items.length} contrat{items.length > 1 ? "s" : ""}
                    </span>
                    <div className="h-0.5 flex-1 rounded-full" style={{ background: `${bucket.color}30` }} />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((c, i) => (
                      <motion.div key={c.id}
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}
                        className="relative overflow-hidden rounded-[20px] border p-4"
                        style={{ background: "rgba(8,6,24,0.92)", borderColor: `${bucket.color}25`, borderLeft: `3px solid ${bucket.color}` }}
                        whileHover={{ y: -3, boxShadow: `0 12px 28px rgba(0,0,0,0.4), 0 0 0 1px ${bucket.color}30` }}>

                        {/* Urgent pulse */}
                        {c.daysLeft <= 15 && (
                          <motion.div className="absolute top-3 right-3 h-2 w-2 rounded-full"
                            style={{ background: F.danger }}
                            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }} />
                        )}

                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold text-white"
                            style={{ background: `linear-gradient(135deg,${bucket.color},${bucket.color}88)` }}>
                            {c.nom.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-xs font-extrabold" style={{ color: "var(--text-primary)" }}>{c.nom}</p>
                            <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.4)" }}>{c.poste}</p>
                          </div>
                        </div>

                        <div className="space-y-1.5 mb-3">
                          <div className="flex items-center justify-between text-[9px]">
                            <span style={{ color: "rgba(255,255,255,0.35)" }}>Expiration</span>
                            <span className="font-bold" style={{ color: bucket.color }}>{c.dateFin}</span>
                          </div>
                          <div className="flex items-center justify-between text-[9px]">
                            <span style={{ color: "rgba(255,255,255,0.35)" }}>Jours restants</span>
                            <span className="font-extrabold text-sm" style={{ color: bucket.color }}>{c.daysLeft}j</span>
                          </div>
                          <div className="flex items-center justify-between text-[9px]">
                            <span style={{ color: "rgba(255,255,255,0.35)" }}>Salaire</span>
                            <span className="font-bold" style={{ color: "var(--text-primary)" }}>{(c.salaire / 1000).toFixed(0)}K DT/mois</span>
                          </div>
                        </div>

                        {/* Days countdown bar */}
                        <div className="h-1.5 w-full rounded-full overflow-hidden mb-3" style={{ background: "rgba(255,255,255,0.07)" }}>
                          <motion.div className="h-1.5 rounded-full" style={{ background: bucket.color }}
                            initial={{ width: "100%" }}
                            animate={{ width: `${Math.max(5, (c.daysLeft / 90) * 100)}%` }}
                            transition={{ duration: 1 }} />
                        </div>

                        <div className="flex gap-1.5">
                          <motion.button type="button"
                            className="flex-1 flex items-center justify-center gap-1 rounded-xl py-1.5 text-[9px] font-bold text-white"
                            style={{ background: `linear-gradient(135deg,${bucket.color},${bucket.color}cc)` }}
                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                            <RefreshCw size={9} /> Renouveler
                          </motion.button>
                          <motion.button type="button"
                            className="flex items-center justify-center gap-1 rounded-xl border px-3 py-1.5 text-[9px] font-bold"
                            style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.45)" }}
                            whileHover={{ scale: 1.04 }}>
                            <FileText size={9} /> Voir
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}

            {upcoming.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CheckCircle size={40} style={{ color: F.success }} className="mb-3" />
                <p className="text-sm font-bold" style={{ color: F.success }}>Aucun contrat à renouveler</p>
                <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>Tous les contrats sont valides pour les 90 prochains jours</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
