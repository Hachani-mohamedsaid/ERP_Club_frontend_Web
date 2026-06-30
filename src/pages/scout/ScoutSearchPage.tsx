import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Search, Heart, Eye, Star, ChevronRight, X, MapPin,
  Zap, Target, Activity,
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip,
} from "recharts";
import { ScoutPage, SGauge, SCOUT_TOOLTIP } from "../../components/scout/ScoutUI";
import { S, PRIORITY_META } from "../../data/scoutData";
import { showToast } from "../../components/scout/ScoutToast";
import { useScoutProspects } from "../../hooks/useScoutData";

// ── Filter chip config ──────────────────────────────────────────────────────
const POSITIONS  = ["Tous", "BU", "MC", "DC", "Ailier G", "DG", "DD", "GK"];
const COUNTRIES  = ["Tous", "Tunisie", "Algérie", "Maroc", "Côte d'Ivoire", "Sénégal"];
const AGE_RANGES = ["Tous", "≤18", "19-21", "22-25", ">25"];
const POT_RANGES = ["Tous", "≥85", "78-84", "<78"];
const BUDGET_RANGES = ["Tous", "<500K €", "500K-1M €", "1M-2M €", ">2M €"];

function matchesAge(age: number, r: string) {
  if (r === "Tous") return true;
  if (r === "≤18")   return age <= 18;
  if (r === "19-21") return age >= 19 && age <= 21;
  if (r === "22-25") return age >= 22 && age <= 25;
  return age > 25;
}
function matchesPot(pot: number, r: string) {
  if (r === "Tous") return true;
  if (r === "≥85")   return pot >= 85;
  if (r === "78-84") return pot >= 78 && pot <= 84;
  return pot < 78;
}
function matchesBudget(mk: number, r: string) {
  if (r === "Tous") return true;
  if (r === "<500K €")   return mk < 500;
  if (r === "500K-1M €") return mk >= 500 && mk <= 1000;
  if (r === "1M-2M €")   return mk > 1000 && mk <= 2000;
  return mk > 2000;
}

function potColor(v: number) { return v >= 85 ? S.success : v >= 78 ? S.primary : S.info; }

function injuryMeta(risk: number) {
  if (risk <= 15) return { label: "Faible",  color: S.success };
  if (risk <= 30) return { label: "Modéré",  color: S.primary };
  return           { label: "Élevé",   color: S.danger  };
}

// ── Filter chip component ───────────────────────────────────────────────────
function ChipGroup({ label, options, value, onChange }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[9px] font-bold uppercase tracking-widest shrink-0" style={{ color: "var(--text-muted)" }}>{label}</span>
      {options.map(opt => (
        <motion.button key={opt} type="button" onClick={() => onChange(opt)}
          className="rounded-full px-2.5 py-1 text-[10px] font-bold whitespace-nowrap"
          style={{
            background: value === opt ? S.primary : "rgba(255,255,255,0.05)",
            color: value === opt ? "white" : "var(--text-muted)",
            border: `1px solid ${value === opt ? S.primary + "60" : "rgba(255,255,255,0.08)"}`,
          }}
          whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.94 }}>
          {opt}
        </motion.button>
      ))}
    </div>
  );
}

export function ScoutSearchPage() {
  const navigate = useNavigate();
  const { prospects, watchlistIds, toggleWatchlist } = useScoutProspects();

  const [search, setSearch] = useState("");
  const [pos, setPos] = useState("Tous");
  const [country, setCountry] = useState("Tous");
  const [ageRange, setAgeRange] = useState("Tous");
  const [potRange, setPotRange] = useState("Tous");
  const [budgetRange, setBudgetRange] = useState("Tous");
  const [selected, setSelected] = useState<string | null>(null);

  const activeFilters = [
    pos !== "Tous" ? pos : null,
    country !== "Tous" ? country : null,
    ageRange !== "Tous" ? ageRange : null,
    potRange !== "Tous" ? `Pot.${potRange}` : null,
    budgetRange !== "Tous" ? budgetRange : null,
  ].filter(Boolean);

  const filtered = useMemo(() => prospects.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.club.toLowerCase().includes(search.toLowerCase())) return false;
    if (pos !== "Tous" && p.position !== pos) return false;
    if (country !== "Tous" && p.nationality !== country) return false;
    if (!matchesAge(p.age, ageRange)) return false;
    if (!matchesPot(p.potential, potRange)) return false;
    if (!matchesBudget(p.valueMK, budgetRange)) return false;
    return true;
  }), [prospects, search, pos, country, ageRange, potRange, budgetRange]);

  const sel = selected ? prospects.find(p => p.id === selected) : null;

  const toggleWatch = async (id: string) => {
    const wasIn = watchlistIds.has(id);
    await toggleWatchlist(id);
    showToast(wasIn ? "Retiré de la Watchlist" : "Ajouté à la Watchlist ✓", wasIn ? "info" : "success");
  };

  const clearFilters = () => {
    setPos("Tous"); setCountry("Tous");
    setAgeRange("Tous"); setPotRange("Tous"); setBudgetRange("Tous");
    setSearch("");
  };

  return (
    <ScoutPage>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>Recherche Prospects</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {filtered.length} joueur{filtered.length !== 1 ? "s" : ""} trouvé{filtered.length !== 1 ? "s" : ""}
            {activeFilters.length > 0 ? ` · ${activeFilters.length} filtre${activeFilters.length > 1 ? "s" : ""} actif${activeFilters.length > 1 ? "s" : ""}` : ""}
          </p>
        </div>
        {activeFilters.length > 0 && (
          <motion.button type="button" onClick={clearFilters}
            className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-bold"
            style={{ borderColor: "rgba(239,68,68,0.35)", color: S.danger, background: "rgba(239,68,68,0.06)" }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <X size={11} /> Effacer filtres
          </motion.button>
        )}
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-2 rounded-2xl border px-4 py-2.5"
        style={{ background: "rgba(8,6,24,0.85)", borderColor: "rgba(255,255,255,0.09)" }}>
        <Search size={15} style={{ color: "var(--text-muted)" }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou club..."
          className="flex-1 bg-transparent text-sm outline-none" style={{ color: "var(--text-primary)" }} />
        {search && (
          <motion.button type="button" onClick={() => setSearch("")} whileHover={{ scale: 1.2 }}>
            <X size={12} style={{ color: "var(--text-muted)" }} />
          </motion.button>
        )}
      </div>

      {/* Filter chips */}
      <div className="rounded-[20px] border p-4 space-y-2.5"
        style={{ background: "rgba(8,6,24,0.85)", borderColor: "rgba(255,255,255,0.07)" }}>
        <ChipGroup label="Poste"        options={POSITIONS}    value={pos}         onChange={setPos} />
        <ChipGroup label="Pays"         options={COUNTRIES}    value={country}     onChange={setCountry} />
        <ChipGroup label="Âge"          options={AGE_RANGES}   value={ageRange}    onChange={setAgeRange} />
        <ChipGroup label="Potentiel"    options={POT_RANGES}   value={potRange}    onChange={setPotRange} />
        <ChipGroup label="Budget"       options={BUDGET_RANGES} value={budgetRange} onChange={setBudgetRange} />
      </div>

      {/* Active filter pills summary */}
      <AnimatePresence>
        {activeFilters.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-1.5 overflow-hidden">
            {activeFilters.map(f => (
              <span key={f} className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold"
                style={{ background: `${S.primary}12`, color: S.primary, border: `1px solid ${S.primary}30` }}>
                {f}
              </span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main grid: list + preview */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_380px]">
        {/* Player list */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => {
              const isSel = selected === p.id;
              const isWatch = watchlistIds.has(p.id);
              const pc = potColor(p.potential);
              const inj = injuryMeta(p.injuryRisk);

              return (
                <motion.div key={p.id} layout
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }} transition={{ delay: i * 0.035 }}
                  className="flex items-center gap-4 rounded-[18px] border p-4 cursor-pointer"
                  style={{
                    background: isSel ? `${S.primary}07` : "rgba(8,6,24,0.88)",
                    borderColor: isSel ? `${S.primary}40` : "rgba(255,255,255,0.07)",
                  }}
                  onClick={() => setSelected(isSel ? null : p.id)}
                  whileHover={{ borderColor: `${S.primary}25`, y: -1 }}>

                  {/* Rank */}
                  <span className="text-[10px] font-bold w-4 shrink-0" style={{ color: "var(--text-muted)" }}>
                    {filtered.indexOf(p) + 1}
                  </span>

                  {/* Avatar */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-extrabold text-white"
                    style={{ background: `linear-gradient(135deg,${PRIORITY_META[p.priority].color},${PRIORITY_META[p.priority].color}80)` }}>
                    {p.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>
                        {p.flag} {p.name}
                      </p>
                      <span className="rounded-full px-1.5 py-0.5 text-[8px] font-black shrink-0"
                        style={{ background: PRIORITY_META[p.priority].color, color: "white" }}>
                        P.{p.priority}
                      </span>
                    </div>
                    <p className="text-[10px] mb-1.5" style={{ color: "var(--text-muted)" }}>
                      {p.position} · {p.age} ans · {p.club}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 max-w-[80px]">
                        <SGauge value={p.potential} color={pc} />
                      </div>
                      <span className="text-[10px] font-extrabold" style={{ color: pc }}>{p.potential}</span>
                      <span className="text-[9px] rounded-full px-1.5 py-0.5 font-bold"
                        style={{ background: `${inj.color}12`, color: inj.color }}>
                        ⚡ {p.injuryRisk}% {inj.label}
                      </span>
                    </div>
                  </div>

                  {/* Value */}
                  <div className="hidden sm:block text-right shrink-0">
                    <p className="text-sm font-extrabold" style={{ color: S.success }}>{p.marketValue}</p>
                    <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>Valeur</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <motion.button type="button" onClick={e => { e.stopPropagation(); toggleWatch(p.id); }}
                      className="flex h-8 w-8 items-center justify-center rounded-xl border"
                      style={{
                        borderColor: isWatch ? `${S.danger}50` : "rgba(255,255,255,0.1)",
                        background: isWatch ? `${S.danger}10` : "transparent",
                      }}
                      whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.88 }}>
                      <Heart size={13} fill={isWatch ? S.danger : "none"} style={{ color: isWatch ? S.danger : "var(--text-muted)" }} />
                    </motion.button>
                    <motion.button type="button"
                      onClick={e => { e.stopPropagation(); navigate(`/scout/prospect/${p.id}`); }}
                      className="flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[11px] font-bold"
                      style={{ borderColor: `${S.primary}40`, color: S.primary, background: `${S.primary}08` }}
                      whileHover={{ scale: 1.05 }}>
                      <Eye size={11} /> Profil
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center rounded-[20px] border py-14"
              style={{ background: "rgba(8,6,24,0.85)", borderColor: "rgba(255,255,255,0.07)" }}>
              <Search size={28} className="mb-3 opacity-20" style={{ color: "var(--text-muted)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucun prospect ne correspond aux filtres</p>
              <motion.button type="button" onClick={clearFilters}
                className="mt-3 rounded-xl px-4 py-1.5 text-xs font-bold"
                style={{ background: `${S.primary}14`, color: S.primary }}
                whileHover={{ scale: 1.06 }}>
                Réinitialiser les filtres
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* ── QUICK PREVIEW PANEL ── */}
        <div className="sticky top-0 self-start">
          <AnimatePresence mode="wait">
            {sel ? (
              <motion.div key={sel.id}
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                transition={{ type: "spring", damping: 22, stiffness: 280 }}
                className="rounded-[24px] border overflow-hidden"
                style={{
                  background: "rgba(8,6,24,0.96)",
                  borderColor: `${PRIORITY_META[sel.priority].color}30`,
                  boxShadow: `0 0 48px ${PRIORITY_META[sel.priority].color}10`,
                }}>

                {/* Top color strip */}
                <div className="h-1 w-full" style={{ background: `linear-gradient(90deg,${PRIORITY_META[sel.priority].color},${S.primary})` }} />

                <div className="p-5">
                  {/* Player header */}
                  <div className="flex items-start gap-4 mb-4">
                    <motion.div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl text-xl font-extrabold text-white"
                      style={{
                        background: `linear-gradient(145deg,${PRIORITY_META[sel.priority].color},${PRIORITY_META[sel.priority].color}60)`,
                        boxShadow: `0 0 32px ${PRIORITY_META[sel.priority].color}40`,
                      }}
                      animate={{ boxShadow: [`0 0 16px ${PRIORITY_META[sel.priority].color}25`, `0 0 32px ${PRIORITY_META[sel.priority].color}50`, `0 0 16px ${PRIORITY_META[sel.priority].color}25`] }}
                      transition={{ duration: 2.5, repeat: Infinity }}>
                      {sel.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-extrabold" style={{ color: "var(--text-primary)" }}>
                        {sel.flag} {sel.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {sel.position} · {sel.age} ans
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <MapPin size={9} style={{ color: "var(--text-muted)" }} />
                        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{sel.club} · {sel.nationality}</p>
                      </div>
                    </div>
                    <div className="text-center shrink-0">
                      <motion.p className="text-3xl font-extrabold leading-none"
                        style={{ color: potColor(sel.potential) }}
                        initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }}>
                        {sel.potential}
                      </motion.p>
                      <div className="flex justify-center gap-0.5 mt-0.5">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={8} fill={s <= Math.round(sel.potential / 20) ? potColor(sel.potential) : "none"}
                            style={{ color: potColor(sel.potential), opacity: s <= Math.round(sel.potential / 20) ? 1 : 0.25 }} />
                        ))}
                      </div>
                      <p className="text-[8px] mt-0.5" style={{ color: "var(--text-muted)" }}>POTENTIEL</p>
                    </div>
                  </div>

                  {/* Quick stats row */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { icon: Target,   label: "Buts",     value: sel.goals,           color: S.success },
                      { icon: Zap,      label: "Assists",  value: sel.assists,          color: S.info    },
                      { icon: Activity, label: "Matchs",   value: sel.matches,          color: S.primary },
                    ].map(k => (
                      <motion.div key={k.label} className="flex flex-col items-center rounded-xl border py-2"
                        style={{ background: `${k.color}07`, borderColor: `${k.color}20` }}
                        whileHover={{ scale: 1.04 }}>
                        <k.icon size={12} style={{ color: k.color }} />
                        <p className="text-lg font-extrabold mt-0.5 leading-none" style={{ color: k.color }}>{k.value}</p>
                        <p className="text-[8px] mt-0.5" style={{ color: "var(--text-muted)" }}>{k.label}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Radar chart */}
                  <div className="mb-4">
                    <p className="text-[10px] font-bold mb-2" style={{ color: "var(--text-muted)" }}>Profil technique</p>
                    <div className="h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={[
                          { subject: "Vitesse",  A: sel.speed    },
                          { subject: "Dribble",  A: sel.dribble  },
                          { subject: "Passes",   A: sel.passing  },
                          { subject: "Défense",  A: sel.defense  },
                          { subject: "Physique", A: sel.physical },
                          { subject: "Mental",   A: sel.mental   },
                        ]}>
                          <PolarGrid stroke="rgba(255,255,255,0.07)" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 8 }} />
                          <Radar dataKey="A" stroke={PRIORITY_META[sel.priority].color} fill={PRIORITY_META[sel.priority].color}
                            fillOpacity={0.2} strokeWidth={2} animationDuration={800} />
                          <Tooltip {...SCOUT_TOOLTIP} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Key info */}
                  <div className="space-y-1.5 mb-4">
                    {[
                      { label: "Valeur marchande", value: sel.marketValue, color: S.success },
                      { label: "Contrat",          value: sel.contractEnd, color: sel.contractEnd <= "2026-12" ? S.danger : "var(--text-muted)" },
                      { label: "Pied fort",        value: sel.foot,        color: "var(--text-muted)" },
                      { label: "IA Score",         value: `${sel.aiScore}%`, color: S.primary },
                    ].map(k => (
                      <div key={k.label} className="flex items-center justify-between text-xs">
                        <span style={{ color: "rgba(255,255,255,0.35)" }}>{k.label}</span>
                        <span className="font-bold" style={{ color: k.color as string }}>{k.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Injury risk pill */}
                  {(() => { const inj = injuryMeta(sel.injuryRisk); return (
                    <div className="mb-4 flex items-center gap-2 rounded-xl border px-3 py-2"
                      style={{ background: `${inj.color}08`, borderColor: `${inj.color}25` }}>
                      <div className="h-2 w-2 rounded-full" style={{ background: inj.color }} />
                      <p className="text-[10px] font-bold" style={{ color: inj.color }}>
                        Risque blessure: {sel.injuryRisk}% — {inj.label}
                      </p>
                    </div>
                  ); })()}

                  {/* Attributes */}
                  <div className="space-y-1.5 mb-5">
                    {[
                      { label: "Vitesse",   value: sel.speed,    color: S.danger  },
                      { label: "Dribble",   value: sel.dribble,  color: S.primary },
                      { label: "Passes",    value: sel.passing,  color: S.info    },
                      { label: "Défense",   value: sel.defense,  color: S.success },
                    ].map(a => (
                      <div key={a.label}>
                        <div className="flex justify-between text-[9px] mb-0.5">
                          <span style={{ color: "rgba(255,255,255,0.35)" }}>{a.label}</span>
                          <span className="font-extrabold" style={{ color: a.color }}>{a.value}</span>
                        </div>
                        <SGauge value={a.value} color={a.color} />
                      </div>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-2">
                    <motion.button type="button" onClick={() => navigate(`/scout/prospect/${sel.id}`)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white"
                      style={{ background: `linear-gradient(135deg,${S.primary},${S.primary}cc)`, boxShadow: `0 0 20px ${S.primary}35` }}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                      Voir fiche complète <ChevronRight size={14} />
                    </motion.button>
                    <motion.button type="button" onClick={() => { toggleWatch(sel.id); }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm font-bold"
                      style={{
                        background: watchlistIds.has(sel.id) ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.04)",
                        color: watchlistIds.has(sel.id) ? S.danger : "var(--text-muted)",
                        border: `1px solid ${watchlistIds.has(sel.id) ? S.danger + "30" : "rgba(255,255,255,0.1)"}`,
                      }}
                      whileHover={{ scale: 1.02 }}>
                      <Heart size={13} fill={watchlistIds.has(sel.id) ? S.danger : "none"} />
                      {watchlistIds.has(sel.id) ? "Retirer de la Watchlist" : "Ajouter à la Watchlist"}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center rounded-[24px] border py-16"
                style={{ background: "rgba(8,6,24,0.7)", borderColor: "rgba(255,255,255,0.06)" }}>
                <motion.div className="text-5xl mb-4"
                  animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
                  👤
                </motion.div>
                <p className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>Sélectionner un prospect</p>
                <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.2)" }}>
                  Cliquer sur un joueur pour voir le détail
                </p>
                <div className="mt-5 space-y-2 text-left w-full max-w-[200px]">
                  {["Profil technique", "Radar attributs", "Risque blessure", "Valeur marchande"].map((h, i) => (
                    <motion.div key={h} className="flex items-center gap-2 rounded-xl border px-3 py-2"
                      style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}
                      initial={{ opacity: 0, x: 8 }} animate={{ opacity: 0.4, x: 0 }} transition={{ delay: 0.2 + i * 0.08 }}>
                      <div className="h-5 w-5 rounded-lg" style={{ background: "rgba(255,255,255,0.06)" }} />
                      <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{h}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </ScoutPage>
  );
}
