import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RecruteurPageTransition } from "../../components/recruteur/RecruteurPageTransition";
import { TalentCard } from "../../components/recruteur/TalentCard";
import { PlayerProfileDrawer } from "../../components/recruteur/PlayerProfileDrawer";
import { SCOUT_PLAYERS, POSITIONS, COUNTRIES, type ScoutPlayer } from "../../data/recruteurData";
import { useRecruteurStore, toggleShortlist, toggleCompare } from "../../data/recruteurStore";

export function RecruteurDiscoveryPage() {
  const navigate = useNavigate();
  const store = useRecruteurStore();
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState("Tous");
  const [country, setCountry] = useState("Tous");
  const [maxAge, setMaxAge] = useState(30);
  const [minScore, setMinScore] = useState(75);
  const [maxValue, setMaxValue] = useState(5);
  const [foot, setFoot] = useState("Tous");
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return SCOUT_PLAYERS.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.club.toLowerCase().includes(search.toLowerCase())) return false;
      if (position !== "Tous" && p.position !== position) return false;
      if (country !== "Tous" && p.country !== country) return false;
      if (p.age > maxAge) return false;
      if (p.aiScore < minScore) return false;
      if (p.valueNum > maxValue) return false;
      if (foot !== "Tous" && p.foot !== foot) return false;
      return true;
    });
  }, [search, position, country, maxAge, minScore, maxValue, foot]);

  const players = filtered.map((p) => ({ ...p, shortlisted: store.shortlist.includes(p.id) }));
  const drawerPlayer: ScoutPlayer | null = drawerId ? SCOUT_PLAYERS.find((p) => p.id === drawerId) ?? null : null;

  const Slider = ({ label, value, min, max, step = 1, suffix = "", onChange }: { label: string; value: number; min: number; max: number; step?: number; suffix?: string; onChange: (v: number) => void }) => (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span style={{ color: "var(--text-muted)" }}>{label}</span>
        <span className="font-bold" style={{ color: "#A855F7" }}>{value}{suffix}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[#8B5CF6]" />
    </div>
  );

  const Select = ({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) => (
    <div>
      <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border px-3 py-2 text-sm"
        style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-primary)" }}
      >
        {options.map((o) => <option key={o} value={o} style={{ background: "#0F1D3A" }}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <RecruteurPageTransition>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[280px_1fr]">
        <aside
          className="h-fit rounded-[20px] border p-5 backdrop-blur-[10px] xl:sticky xl:top-4"
          style={{ background: "rgba(15,29,58,0.85)", borderColor: "rgba(255,255,255,0.05)" }}
        >
          <div className="mb-4 flex items-center gap-2">
            <SlidersHorizontal size={16} style={{ color: "#A855F7" }} />
            <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Filtres avancés</h3>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-primary)" }}
              />
            </div>
            <Select label="Position" value={position} options={POSITIONS} onChange={setPosition} />
            <Select label="Pays" value={country} options={COUNTRIES} onChange={setCountry} />
            <Select label="Pied fort" value={foot} options={["Tous", "Droit", "Gauche"]} onChange={setFoot} />
            <Slider label="Âge max" value={maxAge} min={16} max={35} onChange={setMaxAge} suffix=" ans" />
            <Slider label="Potentiel IA min" value={minScore} min={70} max={95} onChange={setMinScore} suffix="%" />
            <Slider label="Valeur max" value={maxValue} min={0.5} max={5} step={0.1} suffix="M€" onChange={setMaxValue} />
          </div>
        </aside>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              <b style={{ color: "var(--text-primary)" }}>{players.length}</b> talents correspondent
            </p>
            {store.compare.length > 0 && (
              <button
                type="button"
                onClick={() => navigate("/recruteur/compare")}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
                style={{ background: "linear-gradient(135deg,#8B5CF6,#6366F1)" }}
              >
                Comparer ({store.compare.length})
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
            <AnimatePresence>
              {players.map((p, i) => (
                <TalentCard
                  key={p.id}
                  player={p}
                  delay={i * 0.04}
                  onView={() => setDrawerId(p.id)}
                  onCompare={() => toggleCompare(p.id)}
                  onShortlist={() => toggleShortlist(p.id)}
                />
              ))}
            </AnimatePresence>
          </div>
          {players.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-16" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
              <X size={28} style={{ color: "var(--text-muted)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucun talent ne correspond à ces critères</p>
            </motion.div>
          )}
        </div>
      </div>

      <PlayerProfileDrawer player={drawerPlayer} open={!!drawerId} onClose={() => setDrawerId(null)} />
    </RecruteurPageTransition>
  );
}
