import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from "recharts";
import { UserPlus, Star, TrendingUp, DollarSign, Target, Filter, CheckCircle2 } from "lucide-react";
import { AnalystePageTransition } from "../../components/analyste/AnalystePageTransition";
import { AnalystePageLoader } from "../../components/analyste/AnalystePageLoader";
import { useAnalysteTransfer } from "../../hooks/useAnalysteResource";
import type { TransferTarget } from "../../data/analysteExtendedData";

const TOOLTIP_STYLE = {
  contentStyle: { background: "rgba(5,8,22,0.96)", border: "1px solid rgba(139,92,246,0.3)", color: "white", borderRadius: 12 },
};

const RISK_COLOR: Record<TransferTarget["risk"], string> = {
  Faible: "#22C55E", Moyen: "#FF7A00", Élevé: "#EF4444",
};

const ACard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <motion.div className={`rounded-[20px] border p-5 ${className}`}
    style={{ background: "rgba(5,8,22,0.7)", borderColor: "var(--surface-panel-border)", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
    {children}
  </motion.div>
);

function CompatBar({ value }: { value: number }) {
  const color = value >= 85 ? "#22C55E" : value >= 75 ? "#FF7A00" : "#3B82F6";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
        <motion.div className="h-full rounded-full" style={{ background: color }}
          initial={{ width: 0 }} animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }} />
      </div>
      <span className="text-xs font-extrabold w-10 text-right" style={{ color }}>{value}%</span>
    </div>
  );
}

export function AnalysteTransferPage() {
  const { data, loading } = useAnalysteTransfer();
  const [selected, setSelected] = useState<TransferTarget | null>(null);
  const [posFilter, setPosFilter] = useState("Tous");

  if (loading && !data) return <AnalystePageLoader />;

  const { transfers: TRANSFERS, summary } = data!;
  const positions = ["Tous", ...Array.from(new Set(TRANSFERS.map(t => t.position)))];

  const filtered = posFilter === "Tous" ? TRANSFERS : TRANSFERS.filter(t => t.position === posFilter);

  const radarData = selected ? [
    { subject: "Vitesse",    A: selected.speed     },
    { subject: "Pressing",   A: selected.pressing  },
    { subject: "Stamina",    A: selected.stamina   },
    { subject: "Vision",     A: selected.vision    },
    { subject: "Dribbling",  A: selected.dribbling },
    { subject: "Compat.",    A: selected.compatibility },
  ] : [];

  return (
    <AnalystePageTransition>
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Joueurs ciblés",         value: String(summary.targeted),                    color: "#8B5CF6", icon: UserPlus     },
          { label: "Compatibilité moyenne",  value: `${summary.avgCompatibility}%`, color: "#22C55E", icon: Target },
          { label: "Gain xG maximal",        value: summary.maxXgGain,                                      color: "#F59E0B", icon: TrendingUp   },
          { label: "Budget estimé total",    value: summary.totalBudget,                                     color: "#3B82F6", icon: DollarSign  },
        ].map(({ label, value, color, icon: Icon }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <div className="rounded-[16px] border p-4" style={{ background: "rgba(5,8,22,0.7)", borderColor: "var(--surface-panel-border)" }}>
              <div className="flex items-center gap-2">
                <motion.div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${color}18`, color }}
                  animate={{ boxShadow: [`0 0 0px ${color}00`, `0 0 12px ${color}40`, `0 0 0px ${color}00`] }}
                  transition={{ duration: 2.2, repeat: Infinity }}>
                  <Icon size={14} />
                </motion.div>
                <div>
                  <p className="text-xl font-extrabold" style={{ color }}>{value}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Filter size={13} style={{ color: "var(--text-muted)" }} className="self-center" />
        {positions.map(p => (
          <motion.button key={p} type="button" onClick={() => setPosFilter(p)}
            className="rounded-xl px-3 py-1.5 text-xs font-semibold"
            style={{
              background: posFilter === p ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.04)",
              color: posFilter === p ? "#8B5CF6" : "var(--text-muted)",
              border: "1px solid var(--surface-panel-border)",
            }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
            {p}
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr]">
        {/* Cards list */}
        <div className="space-y-3">
          {filtered.map((t, i) => (
            <motion.button key={t.id} type="button" onClick={() => setSelected(selected?.id === t.id ? null : t)}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
              className="w-full rounded-[18px] border p-4 text-left"
              style={{
                background: selected?.id === t.id ? "rgba(139,92,246,0.08)" : "rgba(5,8,22,0.7)",
                borderColor: selected?.id === t.id ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.06)",
              }}
              whileHover={{ borderColor: "rgba(139,92,246,0.3)" }}>
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-black text-white"
                  style={{ background: "rgba(139,92,246,0.2)", color: "#8B5CF6" }}>
                  {t.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div>
                      <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{t.name}</p>
                      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{t.club} · {t.position} · {t.age} ans</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-lg font-extrabold" style={{ color: "#22C55E" }}>{t.cost}</span>
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{ background: `${RISK_COLOR[t.risk]}18`, color: RISK_COLOR[t.risk] }}>
                        {t.risk}
                      </span>
                    </div>
                  </div>
                  <CompatBar value={t.compatibility} />
                  <p className="mt-1.5 text-[10px]" style={{ color: "var(--text-muted)" }}>{t.reason}</p>
                  <div className="mt-2 flex gap-2">
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{ background: "rgba(34,197,94,0.12)", color: "#22C55E" }}>
                      xG {t.xgGain}
                    </span>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{ background: "rgba(139,92,246,0.12)", color: "#8B5CF6" }}>
                      PPI {t.ppiScore}/100
                    </span>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }}>
                      Contrat {t.contract}
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Detail panel */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div key={selected.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <ACard>
                  <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Profil — {selected.name}</p>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.07)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 9 }} />
                        <Radar name="Joueur" dataKey="A" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.22} strokeWidth={2} />
                        <Tooltip {...TOOLTIP_STYLE} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3 rounded-xl border p-3" style={{ background: "rgba(34,197,94,0.06)", borderColor: "rgba(34,197,94,0.2)" }}>
                    <p className="text-xs font-bold mb-1" style={{ color: "#22C55E" }}>Recommandation IA</p>
                    <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{selected.reason}</p>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[
                      { label: "Compatibilité",  value: `${selected.compatibility}%`, color: "#22C55E" },
                      { label: "Gain xG",        value: selected.xgGain,              color: "#F59E0B" },
                      { label: "Coût",           value: selected.cost,                color: "#8B5CF6" },
                    ].map(m => (
                      <div key={m.label} className="rounded-xl border p-2 text-center"
                        style={{ background: "rgba(255,255,255,0.02)", borderColor: "var(--surface-panel-border)" }}>
                        <p className="text-sm font-extrabold" style={{ color: m.color }}>{m.value}</p>
                        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{m.label}</p>
                      </div>
                    ))}
                  </div>
                  <motion.button type="button"
                    className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white"
                    style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)", boxShadow: "0 0 16px rgba(139,92,246,0.3)" }}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <CheckCircle2 size={13} /> Recommander au Directeur Sportif
                  </motion.button>
                </ACard>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex h-48 items-center justify-center rounded-[20px] border"
                style={{ borderColor: "var(--surface-panel-border)", background: "rgba(5,8,22,0.5)" }}>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Sélectionner un joueur</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AnalystePageTransition>
  );
}
