import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Star, Handshake, FileText, Plus, Search,
  TrendingUp, Eye, CheckCircle2, Clock, MapPin, Flag,
} from "lucide-react";
import { RPage, RCard, RHeader, RSection, RRow, RPills, RBtn, RKpiCard, RSearch, pageVariants, cardVariants } from "../../components/responsable";

/* ── Data ──────────────────────────────────────────────────────── */
const PROSPECTS = [
  { id: "p1", name: "Youssef Ben Ali",    age: 17, pos: "Attaquant",        club: "AS Ariana",        nat: "TN", potential: 89, score: 87, status: "Shortlisté",   note: "Technique exceptionnelle, vitesse remarquable." },
  { id: "p2", name: "Nader Trabelsi",     age: 19, pos: "Milieu défensif",  club: "Stade Tunisien",   nat: "TN", potential: 84, score: 80, status: "En observation", note: "Bonne lecture du jeu, travailleur." },
  { id: "p3", name: "Mouhamed Diallo",    age: 21, pos: "Ailier",           club: "AFAD Djékanou",    nat: "CI", potential: 81, score: 78, status: "Contacté",      note: "Dribbleur rapide, profil international." },
  { id: "p4", name: "Seifeddine Jebali",  age: 18, pos: "Défenseur central",club: "CS Sfaxien U21",   nat: "TN", potential: 77, score: 74, status: "Non traité",    note: "Grand gabarit, dominant aérien." },
  { id: "p5", name: "Hamza Oueslati",     age: 20, pos: "Gardien",          club: "ES Tunis Reserve", nat: "TN", potential: 82, score: 79, status: "Shortlisté",   note: "Réflexes rapides, bon distributeur." },
];

const SHORTLIST = PROSPECTS.filter(p => p.status === "Shortlisté" || p.status === "Contacté");

const AGENTS = [
  { id: "a1", name: "Karim Ayari",     agency: "Sport Star TN",    speciality: "Joueurs tunisiens",   deals: 12, rating: 4.8, phone: "+216 98 000 001" },
  { id: "a2", name: "Mehdi Jebali",    agency: "Africa Scout",     speciality: "Afrique subsaharienne", deals: 8, rating: 4.5, phone: "+216 98 000 002" },
  { id: "a3", name: "Pierre Leroy",    agency: "Euro Talents",     speciality: "Ligue 2 France",        deals: 15, rating: 4.7, phone: "+33 6 00 000 003" },
];

const REPORTS = [
  { id: "r1", prospect: "Youssef Ben Ali",   scout: "Tarek Bouzid", date: "15/06/2026", rating: 9.2, file: "rapport-ben-ali.pdf" },
  { id: "r2", prospect: "Nader Trabelsi",    scout: "Tarek Bouzid", date: "12/06/2026", rating: 8.0, file: "rapport-trabelsi.pdf" },
  { id: "r3", prospect: "Mouhamed Diallo",   scout: "Sami Khlifi",  date: "10/06/2026", rating: 7.8, file: "rapport-diallo.pdf" },
];

const STATUS_COLOR: Record<string, string> = {
  "Shortlisté":    "#22C55E",
  "En observation":"#3B82F6",
  "Contacté":      "#FF7A00",
  "Non traité":    "#64748B",
};

const TABS = ["Prospects", "Shortlist", "Agents", "Rapports Scouting"] as const;
type Tab = (typeof TABS)[number];

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={11}
          style={{ color: i <= Math.round(value) ? "#F59E0B" : "rgba(255,255,255,0.15)" }}
          fill={i <= Math.round(value) ? "#F59E0B" : "none"} />
      ))}
    </div>
  );
}

export function RecrutementPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Prospects");
  const [search, setSearch] = useState("");

  const filteredProspects = useMemo(
    () => PROSPECTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.pos.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  return (
    <RPage>
      <RHeader
        title="Module Recrutement"
        subtitle="Prospects, shortlist, agents et rapports scouting."
        action={<RBtn><Plus size={14} /> Ajouter prospect</RBtn>}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <RKpiCard label="Prospects"  value={String(PROSPECTS.length)} icon={Users}     color="#3B82F6" trend="Base de données" />
        <RKpiCard label="Shortlist"  value={String(SHORTLIST.length)} icon={Star}      color="#F59E0B" trend="Cibles prioritaires" />
        <RKpiCard label="Agents"     value={String(AGENTS.length)}    icon={Handshake} color="#10B981" trend="Réseau actif" />
        <RKpiCard label="Rapports"   value={String(REPORTS.length)}   icon={FileText}  color="#8B5CF6" trend="Ce mois" />
      </div>

      <RPills options={[...TABS]} value={activeTab} onChange={v => setActiveTab(v as Tab)} />

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>

          {/* ── Prospects ── */}
          {activeTab === "Prospects" && (
            <div className="space-y-4">
              <RSearch value={search} onChange={setSearch} placeholder="Rechercher prospect, position..." />
              <motion.div className="grid grid-cols-1 gap-4 lg:grid-cols-2" variants={pageVariants} initial="hidden" animate="visible">
                {filteredProspects.map(p => (
                  <motion.div key={p.id} variants={cardVariants}>
                    <RCard>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <motion.div
                            className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-black text-white"
                            style={{ background: `linear-gradient(135deg,${STATUS_COLOR[p.status]},${STATUS_COLOR[p.status]}80)` }}
                            animate={{ boxShadow: [`0 0 0px ${STATUS_COLOR[p.status]}00`, `0 0 16px ${STATUS_COLOR[p.status]}50`, `0 0 0px ${STATUS_COLOR[p.status]}00`] }}
                            transition={{ duration: 2.5, repeat: Infinity }}
                          >
                            {p.name.split(" ").map(n => n[0]).join("")}
                          </motion.div>
                          <div>
                            <p className="font-bold" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{p.pos} · {p.age} ans · {p.club}</p>
                            <div className="mt-1 flex items-center gap-2">
                              <Flag size={10} style={{ color: "var(--text-muted)" }} />
                              <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{p.nat}</span>
                              <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                style={{ background: `${STATUS_COLOR[p.status]}18`, color: STATUS_COLOR[p.status] }}>
                                {p.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Potentiel</p>
                          <p className="text-2xl font-extrabold" style={{ color: "var(--accent)" }}>{p.potential}</p>
                          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Score: {p.score}</p>
                        </div>
                      </div>
                      <p className="mt-3 text-xs" style={{ color: "var(--text-muted)" }}>{p.note}</p>
                      <div className="mt-3 flex gap-2">
                        <RBtn variant="success"><CheckCircle2 size={12} /> Shortlister</RBtn>
                        <RBtn variant="ghost"><Eye size={12} /> Rapport</RBtn>
                      </div>
                    </RCard>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}

          {/* ── Shortlist ── */}
          {activeTab === "Shortlist" && (
            <RSection title="Cibles prioritaires" subtitle="Joueurs en phase active de recrutement.">
              <div className="space-y-3">
                {SHORTLIST.map((p, i) => (
                  <motion.div key={p.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
                    <RRow>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white"
                            style={{ background: "linear-gradient(135deg,var(--accent),#E66000)" }}>
                            {p.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{p.pos} · {p.club}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-lg font-extrabold" style={{ color: "var(--accent)" }}>{p.potential}</p>
                            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Potentiel</p>
                          </div>
                          <RBtn variant="primary"><CheckCircle2 size={12} /> Valider</RBtn>
                        </div>
                      </div>
                    </RRow>
                  </motion.div>
                ))}
              </div>
            </RSection>
          )}

          {/* ── Agents ── */}
          {activeTab === "Agents" && (
            <RSection title="Réseau d'agents" subtitle="Partenaires et contacts de recrutement.">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {AGENTS.map(a => (
                  <RCard key={a.id}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl text-lg font-black"
                        style={{ background: "rgba(255,122,0,0.15)", color: "var(--accent)" }}>
                        {a.name[0]}
                      </div>
                      <div>
                        <p className="font-bold" style={{ color: "var(--text-primary)" }}>{a.name}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{a.agency}</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span style={{ color: "var(--text-muted)" }}>Spécialité</span>
                        <span style={{ color: "var(--text-primary)" }}>{a.speciality}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: "var(--text-muted)" }}>Deals</span>
                        <span className="font-semibold" style={{ color: "var(--accent)" }}>{a.deals}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span style={{ color: "var(--text-muted)" }}>Rating</span>
                        <StarRating value={a.rating} />
                      </div>
                    </div>
                    <RBtn variant="ghost" className="mt-4 w-full justify-center text-xs">{a.phone}</RBtn>
                  </RCard>
                ))}
              </div>
            </RSection>
          )}

          {/* ── Rapports Scouting ── */}
          {activeTab === "Rapports Scouting" && (
            <RSection title="Rapports Scouting" subtitle="Analyses détaillées par nos scouts." action={<RBtn><Plus size={13} /> Nouveau rapport</RBtn>}>
              <div className="space-y-3">
                {REPORTS.map((r, i) => (
                  <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                    <RRow>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "rgba(139,92,246,0.15)" }}>
                            <FileText size={14} style={{ color: "#8B5CF6" }} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{r.prospect}</p>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Scout: {r.scout} · {r.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-lg font-extrabold" style={{ color: "#F59E0B" }}>{r.rating}/10</p>
                            <StarRating value={r.rating / 2} />
                          </div>
                          <RBtn variant="ghost"><Eye size={12} /> Voir</RBtn>
                        </div>
                      </div>
                    </RRow>
                  </motion.div>
                ))}
              </div>
            </RSection>
          )}

        </motion.div>
      </AnimatePresence>
    </RPage>
  );
}
