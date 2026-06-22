import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, X, MapPin, Users, Star, TrendingUp, ChevronRight } from "lucide-react";
import { RecruteurPageTransition } from "../../components/recruteur/RecruteurPageTransition";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";

const TOOLTIP_STYLE = {
  contentStyle: { background: "rgba(5,8,22,0.96)", border: "1px solid rgba(139,92,246,0.3)", color: "white", borderRadius: 12 },
};

interface Scout {
  id: string;
  name: string;
  country: string;
  flag: string;
  zone: string;
  players: number;
  validated: number;
  pending: number;
  rate: number;
  rating: number;
  specialty: string;
  status: "Actif" | "En mission" | "Inactif";
  phone: string;
  email: string;
  joined: string;
}

const SCOUTS: Scout[] = [
  { id: "sc1", name: "Ahmed Trabelsi", country: "Tunisie", flag: "🇹🇳", zone: "Ligue 1 & 2 Tunisie", players: 42, validated: 12, pending: 4, rate: 78, rating: 4.6, specialty: "Attaquants", status: "Actif", phone: "+216 22 100 200", email: "a.trabelsi@scout.tn", joined: "2023-06" },
  { id: "sc2", name: "Ali Benali",     country: "Maroc",  flag: "🇲🇦", zone: "Botola Pro & CAF",    players: 35, validated: 8,  pending: 3, rate: 69, rating: 4.2, specialty: "Milieux",    status: "En mission", phone: "+212 61 234 567", email: "ali.benali@scout.ma", joined: "2024-01" },
  { id: "sc3", name: "Omar Hadjadj",   country: "Algérie",flag: "🇩🇿", zone: "Ligue Pro 1 DZ",      players: 28, validated: 6,  pending: 2, rate: 82, rating: 4.8, specialty: "Défenseurs", status: "Actif", phone: "+213 55 678 901", email: "o.hadjadj@scout.dz", joined: "2022-09" },
  { id: "sc4", name: "Sofiane Mellah", country: "France", flag: "🇫🇷", zone: "Ligue 2 & National",   players: 19, validated: 5,  pending: 1, rate: 91, rating: 4.9, specialty: "Gardiens",   status: "Actif", phone: "+33 6 78 90 12", email: "s.mellah@scout.fr", joined: "2024-06" },
  { id: "sc5", name: "Karim Diallo",   country: "Sénégal",flag: "🇸🇳", zone: "Afrique Ouest",        players: 22, validated: 4,  pending: 5, rate: 62, rating: 3.9, specialty: "Latéraux",   status: "Inactif", phone: "+221 77 123 456", email: "k.diallo@scout.sn", joined: "2023-11" },
];

const EMPTY_FORM = { name: "", country: "", flag: "🌍", zone: "", specialty: "Attaquants", phone: "", email: "" };

function RCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[20px] border p-5 ${className}`}
      style={{ background: "rgba(14,10,35,0.8)", borderColor: "rgba(255,255,255,0.07)" }}>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: Scout["status"] }) {
  const colors: Record<Scout["status"], string> = {
    "Actif": "#22C55E", "En mission": "#F59E0B", "Inactif": "#6B7280",
  };
  const c = colors[status];
  return (
    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
      style={{ background: `${c}18`, color: c, border: `1px solid ${c}33` }}>
      {status}
    </span>
  );
}

export function RecruteurScoutsPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Scout | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const filtered = SCOUTS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.zone.toLowerCase().includes(search.toLowerCase()) ||
    s.country.toLowerCase().includes(search.toLowerCase())
  );

  const radarData = selected ? [
    { subject: "Joueurs trouvés", A: selected.players },
    { subject: "Validés %", A: selected.rate },
    { subject: "Rating", A: selected.rating * 20 },
    { subject: "En attente", A: selected.pending * 10 },
    { subject: "Saison", A: Math.round(selected.players / 2) },
    { subject: "Contrats", A: selected.validated * 5 },
  ] : [];

  return (
    <RecruteurPageTransition>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>Gestion Scouts</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{SCOUTS.length} scouts · {SCOUTS.filter(s => s.status === "Actif").length} actifs</p>
        </div>
        <motion.button type="button" onClick={() => { setForm(EMPTY_FORM); setShowModal(true); }}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)", boxShadow: "0 0 16px rgba(139,92,246,0.35)" }}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Plus size={14} /> Ajouter Scout
        </motion.button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Scouts actifs", value: SCOUTS.filter(s => s.status === "Actif").length, color: "#22C55E" },
          { label: "Joueurs scoués", value: SCOUTS.reduce((a, s) => a + s.players, 0), color: "#8B5CF6" },
          { label: "Validations",    value: SCOUTS.reduce((a, s) => a + s.validated, 0),   color: "#3B82F6" },
          { label: "En attente",     value: SCOUTS.reduce((a, s) => a + s.pending, 0),     color: "#FF7A00" },
        ].map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <RCard>
              <p className="text-2xl font-extrabold" style={{ color: k.color }}>{k.value}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{k.label}</p>
            </RCard>
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_380px]">
        {/* Scout list */}
        <RCard>
          <div className="mb-4 flex items-center gap-2 rounded-xl border px-3 py-2"
            style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
            <Search size={14} style={{ color: "var(--text-muted)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher scout, pays, zone..."
              className="flex-1 bg-transparent text-sm outline-none" style={{ color: "var(--text-primary)" }} />
          </div>
          <div className="space-y-2">
            {filtered.map((sc, i) => (
              <motion.div key={sc.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => setSelected(sc === selected ? null : sc)}
                className="flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all"
                style={{
                  background: selected?.id === sc.id ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.02)",
                  borderColor: selected?.id === sc.id ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.06)",
                }}
                whileHover={{ borderColor: "rgba(139,92,246,0.25)" }}>
                {/* Avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black"
                  style={{ background: "rgba(139,92,246,0.18)", color: "#8B5CF6" }}>
                  {sc.flag}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>{sc.name}</p>
                    <StatusBadge status={sc.status} />
                  </div>
                  <p className="text-[11px] flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                    <MapPin size={9} /> {sc.zone}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>Spécialité: {sc.specialty}</p>
                </div>
                {/* Metrics */}
                <div className="flex gap-4 text-center shrink-0">
                  <div>
                    <p className="text-sm font-bold" style={{ color: "#8B5CF6" }}>{sc.players}</p>
                    <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>Trouvés</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: "#22C55E" }}>{sc.validated}</p>
                    <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>Validés</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: "#F59E0B" }}>{sc.rate}%</p>
                    <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>Taux</p>
                  </div>
                  <ChevronRight size={14} style={{ color: "var(--text-muted)" }} className="self-center" />
                </div>
              </motion.div>
            ))}
          </div>
        </RCard>

        {/* Detail panel */}
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div key={selected.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-3">
              <RCard>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl text-xl"
                      style={{ background: "rgba(139,92,246,0.18)" }}>{selected.flag}</div>
                    <div>
                      <p className="font-bold" style={{ color: "var(--text-primary)" }}>{selected.name}</p>
                      <StatusBadge status={selected.status} />
                    </div>
                  </div>
                  <button type="button" onClick={() => setSelected(null)} className="rounded-lg p-1.5"
                    style={{ background: "rgba(255,255,255,0.06)" }}>
                    <X size={12} style={{ color: "var(--text-muted)" }} />
                  </button>
                </div>
                <div className="space-y-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                  <p className="flex items-center gap-2"><MapPin size={11} /> {selected.zone}</p>
                  <p className="flex items-center gap-2"><Users size={11} /> Spécialité: {selected.specialty}</p>
                  <p className="flex items-center gap-2"><Star size={11} /> Rating: <strong style={{ color: "#F59E0B" }}>{selected.rating}/5</strong></p>
                  <p className="flex items-center gap-2"><TrendingUp size={11} /> Taux validation: <strong style={{ color: "#22C55E" }}>{selected.rate}%</strong></p>
                  <p>📧 {selected.email}</p>
                  <p>📞 {selected.phone}</p>
                  <p>Actif depuis: {selected.joined}</p>
                </div>
              </RCard>

              <RCard>
                <p className="mb-2 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Performance</p>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.06)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 8 }} />
                      <Radar dataKey="A" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.22} strokeWidth={2} />
                      <Tooltip {...TOOLTIP_STYLE} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </RCard>

              <RCard>
                <p className="mb-2 text-xs font-semibold" style={{ color: "var(--text-primary)" }}>Joueurs scoués (récents)</p>
                {["Ahmed Ali", "Yassine Ben Youssef", "Mohamed Karray"].map((pl, i) => (
                  <div key={pl} className="mb-1.5 flex items-center gap-2 rounded-lg border px-2 py-1.5"
                    style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
                    <div className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
                      style={{ background: "rgba(139,92,246,0.2)", color: "#8B5CF6" }}>{i + 1}</div>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{pl}</span>
                    <span className="ml-auto text-[10px] rounded-full px-2 py-0.5"
                      style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E" }}>Shortlist</span>
                  </div>
                ))}
              </RCard>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <RCard className="flex flex-col items-center justify-center py-16">
                <Users size={32} className="mb-3 opacity-25" style={{ color: "var(--text-muted)" }} />
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Sélectionner un scout pour voir le détail</p>
              </RCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setShowModal(false)}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="w-full max-w-md rounded-[24px] border p-6"
              style={{ background: "rgba(14,10,35,0.98)", borderColor: "rgba(139,92,246,0.35)" }}
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Nouveau Scout</p>
                <button type="button" onClick={() => setShowModal(false)} className="rounded-lg p-1.5"
                  style={{ background: "rgba(255,255,255,0.06)" }}>
                  <X size={14} style={{ color: "var(--text-muted)" }} />
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Nom complet", key: "name", placeholder: "Ex: Ahmed Trabelsi" },
                  { label: "Pays", key: "country", placeholder: "Ex: Tunisie" },
                  { label: "Zone géographique", key: "zone", placeholder: "Ex: Ligue 1 Tunisie" },
                  { label: "Téléphone", key: "phone", placeholder: "+216 ..." },
                  { label: "Email", key: "email", placeholder: "scout@email.com" },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="block text-[11px] font-medium mb-1" style={{ color: "var(--text-muted)" }}>{label}</label>
                    <input placeholder={placeholder} value={(form as Record<string, string>)[key]}
                      onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                      className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                      style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)", color: "var(--text-primary)" }} />
                  </div>
                ))}
                <div>
                  <label className="block text-[11px] font-medium mb-1" style={{ color: "var(--text-muted)" }}>Spécialité</label>
                  <select value={form.specialty} onChange={e => setForm(prev => ({ ...prev, specialty: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ background: "rgba(10,8,28,0.95)", borderColor: "rgba(255,255,255,0.1)", color: "var(--text-primary)" }}>
                    {["Attaquants", "Milieux", "Défenseurs", "Gardiens", "Latéraux", "Généraliste"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="rounded-xl border px-4 py-2 text-xs" style={{ borderColor: "rgba(255,255,255,0.1)", color: "var(--text-muted)" }}>
                  Annuler
                </button>
                <motion.button type="button" onClick={() => setShowModal(false)}
                  className="rounded-xl px-5 py-2 text-xs font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)" }}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  Créer Scout
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </RecruteurPageTransition>
  );
}
